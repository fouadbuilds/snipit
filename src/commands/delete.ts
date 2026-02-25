import { Command } from 'commander';
import pc from 'picocolors';
import { deleteById } from '../utils/storage.js';

export const deleteCommand = new Command('delete')
  .description('Delete a snippet by ID')
  .argument('<id>', 'The ID of the snippet to delete (get IDs from snipit list)')
  .action((idArg: string) => {
    const id = parseInt(idArg, 10);

    if (isNaN(id)) {
      console.error(pc.red('✖ ID must be a number. Run snipit list to find IDs.'));
      process.exit(1);
    }

    const deleted = deleteById(id);

    if (!deleted) {
      console.error(pc.red(`✖ No snippet found with ID #${id}`));
      process.exit(1);
    }

    console.log(pc.green(`✔ Deleted snippet #${id}`));
  });