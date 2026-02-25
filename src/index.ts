import { Command } from "commander";
import { start } from "./commands/start.js";

const program = new Command();

program
  .name('snipit')
  .description('A local snippet manager')
  .version('1.0.0')
  .action(() => {
    start();
  });

program.parse(process.argv);