import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  GeneratorCallback,
  joinPathFragments,
  offsetFromRoot,
  Tree,
  updateJson,
} from '@nrwl/devkit';
import { NxRemixGeneratorSchema } from './schema';
import { normalizeOptions } from './lib/normalize-options';
import { runTasksInSerial } from '@nrwl/workspace/src/utilities/run-tasks-in-serial';
import { execSync } from 'child_process';

export default async function (tree: Tree, _options: NxRemixGeneratorSchema) {
  const options = normalizeOptions(tree, _options);
  const tasks: GeneratorCallback[] = [];

  addProjectConfiguration(tree, options.projectName, {
    root: options.projectRoot,
    sourceRoot: `${options.projectRoot}`,
    projectType: 'application',
    tags: options.parsedTags,
  });

  const installTask = addDependenciesToPackageJson(
    tree,
    {
      '@remix-run/react': '^1.7.6',
      '@remix-run/node': '^1.7.6',
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      remix: '^1.7.6',
      '@remix-run/serve': '^1.7.6',
    },
    {
      '@remix-run/dev': '^1.7.6',
      '@remix-run/eslint-config': '^1.7.6',
      '@types/react': '^18.0.20',
      '@types/react-dom': '^18.0.9',
      eslint: '^8.28.0',
      typescript: '^4.8.4',
    }
  );
  tasks.push(installTask);

  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    options.projectRoot,
    {
      ...options,
      tmpl: '',
      offsetFromRoot: offsetFromRoot(options.projectRoot),
    }
  );

  const remixSetupCommand = 'remix setup node';

  // update package json with postinstall command
  updateJson(tree, 'package.json', (pkgJson) => {
    pkgJson.scripts = pkgJson.scripts ?? {};
    if (!pkgJson.scripts.postinstall) {
      pkgJson.scripts.postinstall = remixSetupCommand;
    } else if (!pkgJson.scripts.postinstall.includes(remixSetupCommand)) {
      pkgJson.scripts.postinstall = `${pkgJson.scripts.postinstall} && ${remixSetupCommand}`;
    }
    return pkgJson;
  });

  tasks.push(() => {
    execSync(`npx ${remixSetupCommand}`, {
      cwd: options.projectRoot,
      stdio: [0, 1, 2],
    });
  });

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
}
