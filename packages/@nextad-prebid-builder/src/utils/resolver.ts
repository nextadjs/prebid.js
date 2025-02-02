import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function resolveProjectPath(...paths: string[]): string {
  let projectRoot: string;

  try {
    const findPackageJson = (dir: string): string => {
      const pkgPath = path.join(dir, "package.json");
      if (require("fs").existsSync(pkgPath)) {
        return dir;
      }
      const parentDir = path.dirname(dir);
      if (parentDir === dir) {
        throw new Error("package.json not found");
      }
      return findPackageJson(parentDir);
    };

    const currentDir = dirname(fileURLToPath(import.meta.url));
    projectRoot = findPackageJson(currentDir);
  } catch (error) {
    projectRoot = process.cwd();
  }

  return path.resolve(projectRoot, ...paths);
}
