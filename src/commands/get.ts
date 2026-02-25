import { Command } from "commander";
import clipboard from "clipboardy";
import pc from "picocolors";
import { getByTitle } from "../utils/storage.js";

export const getCommand = new Command("get")
  .description("Retrieve a snippet by title")
  .argument("<title>", "The title of the snippet to retrive")
  .option("--copy", "Copy the Code to clipboard automatically")
  .action(async (title: string, options: { copy?: boolean }) => {
    const snippet = getByTitle(title);

    if (!snippet) {
      console.error(pc.red(`✖ No snippet found with title "${title}"`));
      console.error(pc.dim("  Run snipit list to see all saved snippets"));
      process.exit(1);
    }

    console.log("");
    console.log(pc.dim(`  # ${snippet.title}`));
    console.log("");
    console.log(snippet.code);
    console.log("");

    if (options.copy) {
      await clipboard.write(snippet.code);
      console.log(pc.green("  ✔ Copied to clipboard"));
      console.log("");
    }
  });
