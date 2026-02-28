import { Command } from "commander";
import picocolors from "picocolors";
import { getCommand } from "./commands/get.js";
import { saveCommand } from "./commands/save.js";
import { deleteCommand } from "./commands/delete.js";
import { listCommand } from "./commands/list.js";


const program = new Command();

const logo = picocolors.cyan(String.raw`
                     /$$           /$$   /$$    
                    |__/          |__/  | $$    
  /$$$$$$$ /$$$$$$$  /$$  /$$$$$$  /$$ /$$$$$$  
 /$$_____/| $$__  $$| $$ /$$__  $$| $$|_  $$_/  
|  $$$$$$ | $$  \ $$| $$| $$  \ $$| $$  | $$    
 \____  $$| $$  | $$| $$| $$  | $$| $$  | $$ /$$
 /$$$$$$$/| $$  | $$| $$| $$$$$$$/| $$  |  $$$$/
|_______/ |__/  |__/|__/| $$____/ |__/   \___/  
                        | $$                    
                        | $$                    
                        |__/                    
`);


const tagline = `${picocolors.yellow('Stop re-typing; start snipping.')}\n`;

program
  .name('snipit')
  .description('A local snippet manager')
  .version('1.1.1')
  .addHelpText('before', logo + tagline);
  

// Commands
program.addCommand(saveCommand);
program.addCommand(getCommand);
program.addCommand(deleteCommand);
program.addCommand(listCommand);



program.parse(process.argv);


if (!process.argv.slice(2).length) {
  program.outputHelp();
}
