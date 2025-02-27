import * as fs from 'fs';
import * as path from 'path';

import { DynamicModule, Logger, Type } from '@nestjs/common';

export class ModuleLoader {
  private static readonly logger = new Logger('ModuleLoader');
  private static readonly excludeDirs = ['common', 'config', 'types', 'utils'];

  static async loadModules(
    basePath: string = path.join(__dirname, '..', '..'),
  ): Promise<Array<Type<any> | DynamicModule>> {
    const modules: Array<Type<any> | DynamicModule> = [];

    try {
      const dirs = this.getFeatureDirectories(basePath);

      for (const dir of dirs) {
        const module = await this.loadModuleFromDirectory(basePath, dir.name);
        if (module) {
          modules.push(module);
        }
      }
    } catch (err) {
      this.logger.error('Failed to scan module directories', err);
    }

    return modules;
  }

  private static getFeatureDirectories(basePath: string): fs.Dirent[] {
    return fs
      .readdirSync(basePath, { withFileTypes: true })
      .filter(
        (dirent) =>
          dirent.isDirectory() && !this.excludeDirs.includes(dirent.name),
      );
  }

  private static async loadModuleFromDirectory(
    basePath: string,
    dirName: string,
  ): Promise<Type<any> | DynamicModule | null> {
    try {
      const modulePath = path.join(basePath, dirName, `${dirName}.module`);

      if (!this.moduleFileExists(modulePath)) {
        return null;
      }

      const moduleFile = (await import(modulePath)) as Record<string, unknown>;
      const moduleName = this.getModuleClassName(dirName);

      if (moduleFile[moduleName] && this.isNestModule(moduleFile[moduleName])) {
        this.logger.log(`Module loaded: ${moduleName}`);
        return moduleFile[moduleName];
      } else {
        this.logger.warn(`Invalid module: ${moduleName}`);
        return null;
      }
    } catch (err) {
      this.logger.error(`Failed to load module: ${dirName}`, err);
      return null;
    }
  }

  private static moduleFileExists(modulePath: string): boolean {
    return (
      fs.existsSync(`${modulePath}.ts`) || fs.existsSync(`${modulePath}.js`)
    );
  }

  private static getModuleClassName(dirName: string): string {
    return `${dirName.charAt(0).toUpperCase() + dirName.slice(1)}Module`;
  }

  private static isNestModule(
    module: unknown,
  ): module is Type<any> | DynamicModule {
    return (
      typeof module === 'function' || // nestjs 클래스타입 (Type<any>)
      (typeof module === 'object' && module !== null && 'module' in module) // DynamicModule 타입 검사
    );
  }
}
