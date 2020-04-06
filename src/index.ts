import { Command, flags } from '@oclif/command';
import { green } from 'chalk';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as stringify from 'json-stable-stringify';
import { join, parse as parsePath } from 'path';

import { generateFeature } from './generator';
import { parse } from './plantuml';

const CONFIG_EXT = 'cupl.json';
const FEATURE_EXT = 'feature';

class Cupl extends Command {
  static description =
    'CLI tool for automatic CUcumber gherkin feature files generation from PLantuml activity diagram.';

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    write: flags.boolean({
      char: 'w',
      description: 'write generated output to a file with .feature extension',
    }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { args, flags } = this.parse(Cupl);
    const puml = parse(readFileSync(args.file, 'utf-8'), { filename: args.file });
    const path = parsePath(args.file);
    const configPath = join(path.dir, `${path.name}.${CONFIG_EXT}`);
    const featurePath = join(path.dir, `${path.name}.${FEATURE_EXT}`);
    const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf-8')) : {};
    const { feature, newConfig } = generateFeature(puml[0], config);
    this.log(feature);
    writeFileSync(configPath, stringify(newConfig, { space: '  ' }));
    if (flags.write) {
      writeFileSync(featurePath, feature);
      this.log(`\nGenerated ${green(featurePath)} successfully!`);
    }
  }
}

export = Cupl;
