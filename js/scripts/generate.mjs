import { exec } from "node:child_process";
import { writeFile, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.resolve(__dirname, "../dist");
const bufGenFile = path.join(__dirname, "../", "buf.gen.yaml");
const packageTemplatePath = path.join(__dirname, "package.template.json");
const nodeModulesBin = path.join(__dirname, "../node_modules/.bin");
const raystackDir = path.join(outDir, "raystack");
const packagePath = path.join(outDir, "package.json");
const protonRoot = path.join(__dirname, "../..");

async function createPackageJson(services) {
  try {
    const templateContent = await readFile(packageTemplatePath, "utf8");
    const packageTemplate = JSON.parse(templateContent);

    // Generate exports for each service
    const exports = {};

    // Add individual service exports
    for (const service of services) {
      exports[`./${service}`] = `./raystack/${service}/index.ts`;
    }

    packageTemplate.exports = exports;

    await writeFile(
      packagePath,
      JSON.stringify(packageTemplate, null, 2) + "\n",
    );
    
  } catch (error) {
    console.warn("Warning: Could not generate package.json:", error.message);
  }
}

async function generateProtoJSFiles() {
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
    protoTsFiles: files.filter(file => 
      file.endsWith('.ts') && 
      !file.endsWith('_pb.ts') && 
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
  return protoTsFiles.map(protoTsFile => {
    const baseName = protoTsFile.replace('.ts', '');
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
    const { connectFiles, connectQueryFiles, protoTsFiles } = await getServiceFiles(versionPath);
    
    const connectExports = await processConnectFiles(versionPath, version, connectFiles);
    const queryExports = processConnectQueryFiles(version, connectQueryFiles);
    const protoExports = processProtoTsFiles(version, protoTsFiles);
    
    allExports.push(...connectExports, ...queryExports, ...protoExports);
  }
  
  if (allExports.length > 0) {
    const indexContent = allExports.join('\n') + '\n';
    const indexPath = path.join(servicePath, "index.ts");
    await writeFile(indexPath, indexContent);
  }
}

async function createIndexFiles(services) {
  
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
    await generateProtoJSFiles();
    const services = await getServiceList();
    await createIndexFiles(services);
    await createPackageJson(services);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
