import { Command } from 'commander';
import { build } from './commands/build';
import { version } from '../package.json';

const program = new Command();

program
  .name('prebid-builder')
  .description('CLI tool for building prebid.js configurations')
  .version(version);

program
  .command('build')
  .description('Build prebid.js with specified modules')
  .option('-c, --config <path>', 'path to config file')
  .option('-o, --output <path>', 'output directory', './dist')
  .option('-m, --modules <items>', 'comma separated module names')
  .option('-r, --recommended', 'include recommended modules (consentManagementGpp, consentManagementTcf, consentManagementUsp, gppControl_usnat, gppControl_usstates, gptPreAuction, tcfControl)', 'basic')
  .action(build);

program.parse();
