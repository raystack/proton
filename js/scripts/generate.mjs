import { exec } from "node:child_process";
import { writeFile, readFile, readdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.resolve(__dirname, "../dist");
const bufGenFile = path.join(__dirname, "../", "buf.gen.yaml");
const packageTemplatePath = path.join(__dirname, "package.template.json");
const readmePath = path.join(__dirname, "../README.md");
const nodeModulesBin = path.join(__dirname, "../node_modules/.bin");
const raystackDir = path.join(outDir, "raystack");
const packagePath = path.join(outDir, "package.json");
const readmeDistPath = path.join(outDir, "README.md");
const protonRoot = path.join(__dirname, "../..");

// Parse command line arguments
const args = process.argv.slice(2);
const hashArg = args.find(arg => arg.startsWith('--hash='));
const hash = hashArg ? hashArg.split('=')[1] : null;

async function createPackageJson(services) {
  try {
    const templateContent = await readFile(packageTemplatePath, "utf8");
    const packageTemplate = JSON.parse(templateContent);

    // Generate exports for each service
    const exports = {};

    // Add root export
    exports["."] = {
      "types": "./index.d.ts",
      "import": "./index.js",
      "default": "./index.js"
    };

    // Add individual service exports with proper TypeScript configuration
    for (const service of services) {
      const serviceIndexPath = path.join(raystackDir, service, "index.ts");
      try {
        await readFile(serviceIndexPath);
        // Service has index.ts, include it in exports
        exports[`./${service}`] = {
          "types": `./raystack/${service}/index.d.ts`,
          "import": `./raystack/${service}/index.js`,
          "default": `./raystack/${service}/index.js`
        };
      } catch (error) {
        // Service doesn't have index.ts, skip it
        console.log(chalk.yellow(`⚠️  Skipping ${service} export - no index.ts found`));
      }
    }

    packageTemplate.exports = exports;

    // Add hash to version if provided
    if (hash) {
      packageTemplate.version = `${packageTemplate.version}-${hash}`;
    }

    await writeFile(
      packagePath,
      JSON.stringify(packageTemplate, null, 2) + "\n",
    );
    
  } catch (error) {
    console.warn("Warning: Could not generate package.json:", error.message);
  }
}

async function copyReadme() {
  try {
    await copyFile(readmePath, readmeDistPath);
  } catch (error) {
    console.warn("Warning: Could not copy README:", error.message);
  }
}

async function generateProtoJSFiles() {
  console.log(chalk.blue("🔧 Generating protobuf files..."));
  return new Promise((resolve, reject) => {
    const currentPath = process.env.PATH || "";
    const env = {
      ...process.env,
      PATH: `${nodeModulesBin}:${currentPath}`,
    };

    exec(
      `buf generate --template ${bufGenFile} --include-imports --path raystack .`,
      {
        cwd: protonRoot,
        env: env,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        }
        resolve(stdout ? stdout : stderr);
      },
    );
  });
}

async function getServiceList() {
  return readdir(raystackDir);
}

async function getServiceFiles(versionPath) {
  const files = await readdir(versionPath);
  return {
    connectFiles: files.filter(file => file.endsWith('_connect.ts') && !file.includes('_connectquery')),
    connectQueryFiles: files.filter(file => file.includes('_connectquery.ts')),
    pbFiles: files.filter((file) => file.endsWith("_pb.ts")),
    protoTsFiles: files.filter(file => 
      file.endsWith('.ts') && 
      !file.endsWith('_pb.ts') && 
      !file.endsWith('.d.ts') && 
      !file.endsWith('_connect.ts') && 
      !file.includes('_connectquery') && 
      !file.endsWith('.client.ts')
    )
  };
}

async function processConnectFiles(versionPath, version, connectFiles) {
  const exports = [];
  
  for (const connectFile of connectFiles) {
    const filePath = path.join(versionPath, connectFile);
    const content = await readFile(filePath, 'utf8');
    
    const serviceMatches = content.match(/export const (\w+Service) = \{/g);
    
    if (serviceMatches) {
      for (const match of serviceMatches) {
        const serviceName = match.match(/export const (\w+Service)/)[1];
        exports.push(`export { ${serviceName} } from "./${version}/${connectFile.replace('.ts', '')}";`);
      }
    }
  }
  
  return exports;
}

function processConnectQueryFiles(version, connectQueryFiles) {
  const exports = [];
  
  for (const connectQueryFile of connectQueryFiles) {
    const baseName = connectQueryFile.replace('.ts', '');
    const serviceNameMatch = baseName.match(/.*-(\w+Service)_connectquery$/);
    
    if (serviceNameMatch) {
      const serviceName = serviceNameMatch[1];
      const queryName = serviceName + 'Queries';
      exports.push(`export * as ${queryName} from "./${version}/${baseName}";`);
    }
  }
  
  return exports;
}

function processProtoTsFiles(version, protoTsFiles) {
  return protoTsFiles.map((protoTsFile) => {
    const baseName = protoTsFile.replace(".ts", "");
    return `export * from "./${version}/${baseName}";`;
  });
}

function processPbFiles(version, pbFiles) {
  return pbFiles.map((pbFile) => {
    const baseName = pbFile.replace(".ts", "");
    return `export * from "./${version}/${baseName}";`;
  });
}


async function createServiceIndex(servicePath) {
  const versionDirs = await readdir(servicePath, { withFileTypes: true });
  const versions = versionDirs
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  if (versions.length === 0) return;
  
  const allExports = [];
  
  for (const version of versions) {
    const versionPath = path.join(servicePath, version);
    const { connectFiles, connectQueryFiles, pbFiles, protoTsFiles } =
      await getServiceFiles(versionPath);

    const connectExports = await processConnectFiles(
      versionPath,
      version,
      connectFiles,
    );
    const queryExports = processConnectQueryFiles(version, connectQueryFiles);
    const pbExports = processPbFiles(version, pbFiles);
    const protoExports = processProtoTsFiles(version, protoTsFiles);

    allExports.push(
      ...connectExports,
      ...queryExports,
      ...pbExports,
      ...protoExports,
    );
  }
  
  // Only create an index file if there are exports
  if (allExports.length > 0) {
    const indexContent = allExports.join('\n') + '\n';
    
    // Create all index files with the same content (ESM syntax works for all)
    const files = [
      { path: path.join(servicePath, "index.ts"), desc: "TypeScript source" },
      { path: path.join(servicePath, "index.js"), desc: "JavaScript ESM" },
      { path: path.join(servicePath, "index.d.ts"), desc: "TypeScript definitions" }
    ];
    
    for (const file of files) {
      await writeFile(file.path, indexContent);
    }
  }
}

async function createRootIndex(services) {
  const exports = [];
  
  for (const service of services) {
    const serviceIndexPath = path.join(raystackDir, service, "index.ts");
    try {
      await readFile(serviceIndexPath);
      // Service has index.ts, include it
      exports.push(`export * as ${service} from "./raystack/${service}";`);
    } catch (error) {
      // Service doesn't have index.ts, skip it
      console.log(chalk.yellow(`⚠️  Skipping ${service} - no index.ts found`));
    }
  }
  
  const indexContent = exports.join('\n') + '\n';
  
  // Create all root index files with the same content (ESM syntax works for all)
  const files = [
    { path: path.join(outDir, "index.ts"), desc: "TypeScript source" },
    { path: path.join(outDir, "index.js"), desc: "JavaScript ESM" },
    { path: path.join(outDir, "index.d.ts"), desc: "TypeScript definitions" }
  ];
  
  for (const file of files) {
    await writeFile(file.path, indexContent);
  }
}

async function createIndexFiles(services) {
  console.log(chalk.green("📦 Creating index files..."));
  
  for (const service of services) {
    const servicePath = path.join(raystackDir, service);
    
    try {
      await createServiceIndex(servicePath);
    } catch (error) {
      console.warn(`Warning: Could not create index for ${service}:`, error.message);
    }
  }
}
async function main() {
  try {
    console.log(chalk.bold.cyan("🚀 Starting protobuf generation..."));
    if (hash) {
      console.log(chalk.magenta(`🔗 Using hash: ${hash}`));
    }
    
    await generateProtoJSFiles();
    console.log(chalk.green("✅ Protobuf files generated successfully"));
    
    const services = await getServiceList();
    console.log(chalk.yellow(`📋 Found ${services.length} services: ${services.join(", ")}`));
    
    await createIndexFiles(services);
    console.log(chalk.green("✅ Index files created successfully"));
    
    await createRootIndex(services);
    console.log(chalk.green("✅ Root index file created successfully"));
    
    await createPackageJson(services);
    console.log(chalk.green("✅ Package.json generated successfully"));
    
    await copyReadme();
    console.log(chalk.green("✅ README copied successfully"));
    
    console.log(chalk.bold.green("🎉 Generation completed successfully!"));
  } catch (error) {
    console.error(chalk.red("❌ Error:"), error.message);
    process.exit(1);
  }
}

main();
