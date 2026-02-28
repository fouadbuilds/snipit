import { existsSync, writeFileSync } from "fs";
import path from "path";
import { Command } from "commander";
import pc from "picocolors";
import { readStore } from "../utils/storage.js";

export const exportCommand = new Command("export")
  .description("Export your snippets to a JSON file")
  .requiredOption("-o, --output <path>", "Path to save the exported JSON file")
  .action((options) => {
    try {
      const store = readStore();

      if (store.snippets.length === 0) {
        console.log(
          pc.yellow("\n⚠ You don't have any snippets to export yet!"),
        );
        return;
      }

      const outputPath = path.resolve(process.cwd(), options.output);

      const finalPath = outputPath.endsWith(".json")
        ? outputPath
        : `${outputPath}.json`;

      const fileName = path.basename(finalPath);

      if (existsSync(finalPath)){
        console.error(pc.yellow(`\n✖ Export failed: A file or folder ${fileName} already exists at this location.`))
      }  

      const dataToExport = JSON.stringify(store.snippets, null, 2);

      writeFileSync(finalPath, dataToExport, "utf8");

      console.log(
        pc.green(
          `\n✔ Successfully exported ${pc.bold(store.snippets.length)} snippets to:`,
        ),
      );
      console.log(pc.cyan(finalPath));
    } catch (err: any) {
      console.error(pc.red(`\n✖ Export failed: ${err.message}`));
      process.exit(1);
    }
  });
