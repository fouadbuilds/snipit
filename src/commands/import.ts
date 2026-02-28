import { Command } from "commander";
import pc from "picocolors";
import fs from 'fs-extra';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { addSnippet } from "../utils/storage.js";
import { readStore } from "../utils/storage.js";

export const importCommand = new Command("import")
  .description("Import Snippets")
  .option("-f, --file <path>", "Read Snippets from a file")
  .action(async (file: {}, options: { file: string }) => {
    let snippets: {}
    const SNIPIT_DIR = join(homedir(), ".snipit");
    const STORE_PATH = join(SNIPIT_DIR, "snippets.json");

    if (options.file) {
      if (!existsSync(options.file)) {
          console.error(pc.red(`✖ File not found: ${options.file}`));
          process.exit(1);
        }
      snippets = fs.readJson(STORE_PATH)
    }
    
  });
