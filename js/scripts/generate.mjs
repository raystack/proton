import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = path.resolve(__dirname, "../dist");

async function createPackageJson() {
  try {
    const templatePath = path.join(__dirname, "package.template.json");
    const templateContent = await readFile(templatePath, "utf8");
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

async function main() {
  await createPackageJson();
}

main();
