import chalk from "chalk";
import { warn } from "console";

export const logger = {
  info: (message: string) => console.log(chalk.blue("INFO:"), message),
  success: (message: string) => console.log(chalk.green("SUCCESS:"), message),
  error: (message: string, error?: any) => {
    console.error(chalk.red("ERROR:"), message);
    if (error) console.error(error);
  },
  warn: (message: string, error?: any) => {
    console.error(chalk.red("ERROR:"), message);
    if (error) console.error(error);
  },
};
