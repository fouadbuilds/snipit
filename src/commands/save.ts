import { Command } from "commander";
import { readFileSync, existsSync } from "fs";
import pc from "picocolors";
import { addSnippet } from "../utils/storage.js";

export const saveCommand = new Command("save")
  .description("Save a new snippet")
  .argument("<title>", "The title of the snippet to save")
  .option("-c, --code <code>", "Inline Code string")
  .option("-f, --file <path>", "Read code from a file")
  .option("-t, --tag <tags>", 'Comma-separated tags e.g. "ts,async"')
  .action(
    (
      title: string,
      options: { code?: string; file?: string; tag?: string },
    ) => {
      let code: string;
      if (options.file) {
        if (!existsSync(options.file)) {
          console.error(pc.red(`✖ File not found: ${options.file}`));
          process.exit(1);
        }
        code = readFileSync(options.file, "utf-8").trim();
      } else if (options.code) {
        code = options.code.trim();
      } else {
        console.error(pc.red("✖ Provide either --code or --file"));
        process.exit(1);
      }

      // Parse tags: "ts,async" → ["ts", "async"]

      const tags = options.tag
        ? options.tag.split(",").map((t) => t.trim().toLowerCase())
        : [];

      const snippet = addSnippet({ title, code, tags });
      console.log(pc.green(`✔ Saved "${snippet.title}" as #${snippet.id}`));

      if (tags.length > 0) {
        console.log(pc.dim(`  Tags: ${tags.join(", ")}`));
      }
    },
  );
