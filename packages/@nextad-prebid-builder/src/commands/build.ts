import { logger } from "@/utils/logger";
import { isString } from "@/utils/validator";
import { exec } from "child_process";
import { promises as fsPromises } from "fs";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
import { webpack } from "webpack";

interface BuildOptions {
  config: string;
  output: string;
  modules?: string;
}

interface PrebidConfig {
  modules: string[];
}

const execPromise = promisify(exec);

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function build(options: BuildOptions): Promise<void> {
  try {
    logger.info("Starting build process...");

    validateOptions(options);

    await buildPrebid(options);
    await copyPrebidOutput(options.output);

    logger.success("Build completed successfully!");
  } catch (error) {
    logger.error("Build failed:", error);
  }
}

function validateOptions(options: BuildOptions): boolean {
  if (!isString(options?.config)) {
    throw new Error("`options.config` is expected to be a string");
  }

  if (!isString(options?.output)) {
    throw new Error("`options.config` is expected to be a string");
  }

  return true;
}

async function buildPrebid(options: BuildOptions): Promise<void> {
  const prebidPath = path.resolve(__dirname, "../../node_modules/prebid.js");

  logger.info("Installing Prebid.js dependencies...");

  await execPromise("npm install", { cwd: prebidPath });

  const moduleOption = options.modules ? `--modules=${options.modules}` : "";

  logger.info("Building Prebid.js...");
  await execPromise(`npx gulp build ${moduleOption}`, { cwd: prebidPath });
}

async function copyPrebidOutput(output: string): Promise<void> {
  const sourcePath = path.resolve(
    __dirname,
    "../../node_modules/prebid.js/build/dist/prebid.js"
  );

  const outputPath = path.resolve(process.cwd(), output);
  const finalPath = outputPath.endsWith('.js') 
    ? outputPath 
    : path.join(outputPath, 'prebid.js');
  
  await fsPromises.mkdir(path.dirname(finalPath), { recursive: true });

  logger.info(`Copying Prebid.js build to ${finalPath}...`);
  await fsPromises.copyFile(sourcePath, finalPath);
}
