import path from 'path';
import fs from 'fs';

export const transform = (
  importRelPath,
  filename,
  envs = { production: 'prod', development: 'dev' },
  defaultEnv = 'development'
) => {
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
      ImportDeclaration({ node }, { file, opts }) {
        try {
          node.source = types.stringLiteral(transform(
            node.source.value,
            file.opts.filename,
            opts.envMap,
            opts.defaultEnv
          ));
        } catch (err) {
          // will use default import statement
        }
      }
    }
  }
}
