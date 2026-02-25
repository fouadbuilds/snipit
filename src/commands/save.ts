import { Command } from "commander";
import { readFileSync, existsSync } from "fs";
import pc from "picocolors";
import { addSnippet } from "../utils/storage.js";
import { editor } from "@inquirer/prompts";

const previewCode = (code: string) => {
  const lines = code.split("\n");
  const preview = lines.slice(0, 3).join("\n");
  const hasMore = lines.length > 3;
  console.log(pc.dim(preview));
  if (hasMore) console.log(pc.dim(`  ... +${lines.length - 3} more lines`));
};

export const saveCommand = new Command("save")
  .description("Save a new snippet")
  .argument("<title>", "The title of the snippet to save")
  .option("-c, --code <code>", "Inline code string")
  .option("-f, --file <path>", "Read code from a file")
  .option("-t, --tag <tags>", 'Comma-separated tags e.g. "ts,async"')
  .action(
    async (
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
        code = await editor({
          message: "Write your snippet (saves when you close the editor):",
        });

        if (!code.trim()) {
          console.error(pc.red("✖ Snippet cannot be empty."));
          process.exit(1);
        }
      }

      const tags = options.tag
        ? options.tag.split(",").map((t) => t.trim().toLowerCase())
        : [];

      const snippet = addSnippet({ title, code, tags });

      console.log(pc.green(`\n✔ Saved "${snippet.title}" as #${snippet.id}`));
      if (tags.length > 0) console.log(pc.dim(`  Tags: ${tags.join(", ")}`));
      console.log("");
      previewCode(snippet.code);
      console.log("");
    },
  );
