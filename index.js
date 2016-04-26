import path from 'path';
import fs from 'fs';

export default function({ types }) {
  return {
    visitor: {
      ImportDeclaration(nodePath, state) {
        const envs = state.opts.envMap || {
          production: 'prod',
          development: 'dev'
        };
        const defaultEnv = state.opts.defaultEnv || 'development';

        const envExt = envs[process.env.NODE_ENV || defaultEnv];

        if (typeof envExt === 'undefined') {
          return;
        }

        const { node } = nodePath;
        const importRelPath = node.source.value;

        const dirname = path.dirname(state.file.opts.filename);
        const importedFilename = path.normalize(`${dirname}/${importRelPath}`);
        const importedExtname = path.extname(importedFilename);

        const envDirname = path.dirname(importedFilename);
        const envExtname = importedExtname || '.js';
        const envBasename = path.basename(importedFilename, envExtname);

        const envFilename = `${envDirname}/${envBasename}.${envExt}${envExtname}`;

        try {
          fs.accessSync(envFilename);
        } catch (err) {
          return;
        }

        const newImportDirname = path.dirname(importRelPath);
        const newImportBasename = path.basename(importRelPath, importedExtname);
        const newImportFilename = `${newImportDirname}/${newImportBasename}.${envExt}${importedExtname}`;

        node.source = types.stringLiteral(newImportFilename);
      }
    }
  }
};
