import { Command } from "commander";
import { getCommand } from "./commands/get.js";
import { saveCommand } from "./commands/save.js";
import { deleteCommand } from "./commands/delete.js";

const program = new Command();

program
  .name('snipit')
  .description('A local snippet manager')
  .version('1.0.0')
  

  // Commands
  program.addCommand(saveCommand);
  program.addCommand(getCommand)
  program.addCommand(deleteCommand)
  

program.parse(process.argv);