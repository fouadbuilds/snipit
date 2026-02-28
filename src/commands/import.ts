import { Command } from "commander";
import pc from "picocolors";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { readStore, writeStore } from "../utils/storage.js";
import type { Snippet } from "../types/index.js";

export const importCommand = new Command("import")
  .description("Import snippets from a JSON file")
  .requiredOption("-f, --file <path>", "Path to the JSON file to import")
  .action((options) => {
    const filePath = path.resolve(process.cwd(), options.file);

    if (!existsSync(filePath)) {
      console.error(pc.red(`\n✖ File not found: ${options.file}`));
      process.exit(1);
    }

    interface ImportShape {
      snippets?: Snippet[];
    }

    try {
      const rawImportData = readFileSync(filePath, "utf8");
      const importedSnippets = JSON.parse(rawImportData) as ImportShape | Snippet[];

      const snippetsToImport: Snippet[] = Array.isArray(importedSnippets)
        ? importedSnippets
        : importedSnippets.snippets || [];

      if (snippetsToImport.length === 0) {
        console.log(pc.yellow("⚠ No snippets found in the provided file."));
        return;
      }

      const store = readStore();

      let addedCount = 0;
      let skippedCount = 0;
      let renamedCount = 0;

      snippetsToImport.forEach((newSnip) => {
        // Duplicates
        const isExactDuplicate = store.snippets.some(
          (s) => s.title === newSnip.title && s.id === newSnip.id,
        );

        if (isExactDuplicate) {
          skippedCount++;
          return;
        }

        const hasTitleConflict = store.snippets.some(
          (s) => s.title === newSnip.title,
        );
        let finalTitle = newSnip.title;

        if (hasTitleConflict) {
          finalTitle = `${newSnip.title} (imported_${Date.now().toString().slice(-4)})`;
          renamedCount++;
        }

        store.lastId++;

        const snippetToSave: Snippet = {
          ...newSnip,
          id: store.lastId,
          title: finalTitle,
          createdAt:
            newSnip.createdAt || new Date().toISOString().split("T")[0],
        };

        store.snippets.push(snippetToSave);
        addedCount++;
      });

      writeStore(store);

      // UX
      console.log(pc.green(`\n✔ Import successful!`));
      console.log(`${pc.cyan("→")} Added: ${pc.bold(addedCount)}`);
      if (skippedCount > 0)
        console.log(`${pc.yellow("→")} Skipped (Duplicates): ${skippedCount}`);
      if (renamedCount > 0)
        console.log(`${pc.magenta("→")} Renamed (Conflicts): ${renamedCount}`);
    } catch (err: any) {
      console.error(pc.red(`\n✖ Error processing import: ${err.message}`));
      process.exit(1);
    }
  });
