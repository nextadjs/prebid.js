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
  .option('-c, --config <path>', 'path to config file', './prebid.config.js')
  .option('-o, --output <path>', 'output directory', './dist')
  .option('-m, --modules <items>', 'comma separated module names')
  .action(build);

program.parse();
