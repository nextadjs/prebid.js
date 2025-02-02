import { logger } from "@/utils/logger";
import { resolveProjectPath } from "@/utils/resolver";
import { isString } from "@/utils/validator";
import { exec } from "child_process";
import { promises as fsPromises } from "fs";
import path from "path";
import { promisify } from "util";

const recommendedModules = [
  "consentManagementGpp",
  "consentManagementTcf",
  "consentManagementUsp",
  "gppControl_usnat",
  "gppControl_usstates",
  "gptPreAuction",
  "tcfControl",
];

interface BuildOptions {
  config?: string;
  output: string;
  modules?: string;
  recommended: "basic" | "none" | "all";
}

interface PrebidConfig {
  modules: string[];
}

const execPromise = promisify(exec);

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
  if (!isString(options?.output)) {
    throw new Error("`options.config` is expected to be a string");
  }

  return true;
}

async function buildPrebid(options: BuildOptions): Promise<void> {
  const prebidPath = resolvePrebidPath();

  logger.info("Installing Prebid.js dependencies...");
  
  await execPromise("npm install", { cwd: prebidPath });

  let modules: string[] = await resolveModules(options);

  logger.info(
    `Including Modules: ${modules.length ? modules.join(", ") : "All"}`
  );

  const moduleOption = modules ? `--modules=${modules.join(",")}` : "";

  logger.info("Building Prebid.js...");
  await execPromise(`npx gulp build ${moduleOption}`, { cwd: prebidPath });
}

function resolvePrebidPath(): string {
  return resolveProjectPath('node_modules/prebid.js');
}

async function resolveModules(options: BuildOptions): Promise<string[]> {
  const modulesSet = new Set<string>();

  if (options.modules) {
    options.modules.split(",").forEach((module) => modulesSet.add(module));
  }

  if (options.config) {
    const configModules = await getModulesFromConfig(options.config);
    configModules.forEach((module) => modulesSet.add(module));
  }

  if (options.recommended === "basic" || options.recommended === "all") {
    recommendedModules.forEach((module) => modulesSet.add(module));
  }

  return Array.from(modulesSet);
}

async function getModulesFromConfig(configPath: string): Promise<string[]> {
  const configContent = await fsPromises.readFile(
    path.resolve(process.cwd(), configPath),
    "utf-8"
  );
  const prebidConfig: PrebidConfig = JSON.parse(configContent);
  return prebidConfig.modules;
}

async function copyPrebidOutput(output: string): Promise<void> {
  const sourcePath = path.resolve(
    resolvePrebidPath(),
    'build/dist/prebid.js'
  );

  const outputPath = path.resolve(process.cwd(), output);
  const finalPath = outputPath.endsWith(".js")
    ? outputPath
    : path.join(outputPath, "prebid.js");

  await fsPromises.mkdir(path.dirname(finalPath), { recursive: true });

  logger.info(`Copying Prebid.js build to ${finalPath}...`);
  await fsPromises.copyFile(sourcePath, finalPath);
}
