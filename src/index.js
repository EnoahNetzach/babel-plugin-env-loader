import path from 'path';
import fs from 'fs';

export const transform = (envs, defaultEnv = 'development', importRelPath, filename) => {
  const envExt = envs[process.env.NODE_ENV || defaultEnv];

  if (typeof envExt === 'undefined') {
    return;
  }

  const dirname = path.dirname(filename);
  const importedFilename = path.normalize(`${dirname}/${importRelPath}`);
  const importedExtname = path.extname(importedFilename);

  const envDirname = path.dirname(importedFilename);
  const envExtname = importedExtname || '.js';
  const envBasename = path.basename(importedFilename, envExtname);

  const envFilename = `${envDirname}/${envBasename}.${envExt}${envExtname}`;

  fs.accessSync(envFilename);

  const newImportDirname = path.dirname(importRelPath);
  const newImportBasename = path.basename(importRelPath, importedExtname);
  return `${newImportDirname}/${newImportBasename}.${envExt}${importedExtname}`;
};

export default ({ types }) => {
  return {
    visitor: {
      ImportDeclaration(nodePath, state) {
        const envs = state.opts.envMap || {
          production: 'prod',
          development: 'dev'
        };

        const { node } = nodePath;

        try {
          node.source = types.stringLiteral(transform(
            envs,
            state.opts.defaultEnv,
            node.source.value,
            state.file.opts.filename
          ));
        } catch (err) {
          // will use default import statement
        }
      }
    }
  }
}
