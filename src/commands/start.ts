import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const start = () => {
  try {
    const pkgPath = join(__dirname, "../../package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    console.log(`Welcome to Snipit v${pkg.version} `);
  } catch (err) {
    console.error("Could not find the package.json file.");
  }
  console.log(`Type "snipit --help" for more information`);
};
