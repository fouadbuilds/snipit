import { Command } from 'commander';
import pc from 'picocolors';
import { getAll } from '../utils/storage.js';
import type { Snippet } from '../types/index.js';

export const listCommand = new Command('list')
  .description('List all saved snippets')
  .option('-t, --tag <tag>', 'Filter by tag')
  .option('-s, --search <query>', 'Search snippet titles')
  .action((options: { tag?: string; search?: string }) => {
    let snippets: Snippet[] = getAll();

    if (options.tag) {
      snippets = snippets.filter((s) =>
        s.tags.includes(options.tag!.toLowerCase())
      );
    }

    if (options.search) {
      const q = options.search.toLowerCase();
      snippets = snippets.filter((s) => s.title.toLowerCase().includes(q));
    }

    if (snippets.length === 0) {
      const hint = options.tag
        ? `No snippets found with tag "${options.tag}"`
        : 'No snippets yet. Use snipit save to add one.';
      console.log(pc.yellow(`\n  ${hint}\n`));
      return;
    }

    console.log('');

    for (const s of snippets) {
      const id    = pc.bold(pc.cyan(`  #${s.id}`));
      const title = pc.white(`  ${s.title}`);
      const tags  = s.tags.length > 0 ? pc.green(s.tags.join(', ')) + pc.dim(' · ') : '';
      const date  = pc.dim(s.createdAt);

      console.log(id);
      console.log(title);
      console.log(`      ${tags}${date}`);
      console.log('');
    }
  });

  