import { Command } from "commander";
import pc from "picocolors";
import { getAll } from "../utils/storage.js";
import type { Snippet } from "../types/index.js";

export const listCommand = new Command("list")
  .description("List all saved snippets")
  .option("-t, --tag <tag>", "Filter by tag")
  .option("-s, --search <query>", "Search snippet titles")
  .action((options: { tag?: string; search?: string }) => {
    let snippets: Snippet[] = getAll();

    // tag filter if provided
    if (options.tag) {
      const targetTag = options.tag.toLowerCase();
      snippets = snippets.filter((s) => s.tags.includes(targetTag));
    }

    if (options.search) {
      const q = options.search.toLowerCase();
      snippets = snippets.filter((s) => s.title.toLowerCase().includes(q));
    }

    if (getAll().length === 0) {
      const hint = options.tag
        ? `No snippets found with tag "${options.tag}"`
        : "No snippets saved yet. Use snipit save to add one.";
      console.log(pc.yellow(`  ${hint}`));
      return;
    }

    console.log("");
    console.log(pc.bold(`  ${snippets.length} snippet(s)\n`));

    for (const s of snippets) {
      const id = pc.dim(`#${String(s.id).padEnd(3)}`);
      const title = pc.cyan(s.title);
      const tags = s.tags.length > 0 ? pc.green(` [${s.tags.join(", ")}]`) : "";
      const date = pc.dim(` · ${s.createdAt}`);

      console.log(`  ${id} ${title}${tags}${date}`);
    }

    console.log("");
  });

  