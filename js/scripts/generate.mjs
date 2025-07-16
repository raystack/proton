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

async function createPackageJson() {
  try {
    const templateContent = await readFile(packageTemplatePath, "utf8");
    const packageTemplate = JSON.parse(templateContent);

    const packagePath = path.join(outDir, "package.json");
    await writeFile(
      packagePath,
      JSON.stringify(packageTemplate, null, 2) + "\n",
    );
  } catch (error) {
    console.warn("Warning: Could not generate package.json:", error.message);
  }
}

async function generateProtoJSFiles() {
  console.log("Generating proto.js files...");
  return new Promise((resolve, reject) => {
    const currentPath = process.env.PATH || "";
    const env = {
      ...process.env,
      PATH: `${nodeModulesBin}:${currentPath}`,
    };

    exec(
      `buf generate --template ${bufGenFile} .`,
      {
        cwd: path.join(__dirname, "../.."),
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
  return readdir(path.join(outDir, "raystack"));
}

async function createIndexFiles(services) {
  console.log(services);
}
async function main() {
  try {
    await generateProtoJSFiles();
    const services = await getServiceList();
    await createIndexFiles(services);
    await createPackageJson();
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
