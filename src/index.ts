import { Command, flags } from '@oclif/command';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as stringify from 'json-stable-stringify';
import { join, parse as parsePath } from 'path';

import { generateFeature } from './generator';
import { parse } from './plantuml';

const CONFIG_EXT = 'cupl.json';

class Cupl extends Command {
  static description =
    'CLI tool for automatic CUcumber gherkin feature files generation from PLantuml activity diagram.';

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { args } = this.parse(Cupl);
    const puml = parse(readFileSync(args.file, 'utf-8'));
    const path = parsePath(args.file);
    const configPath = join(path.dir, `${path.name}.${CONFIG_EXT}`);
    const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf-8')) : {};
    const { feature, newConfig } = generateFeature(puml[0], config);
    this.log(feature);
    writeFileSync(configPath, stringify(newConfig, { space: '  ' }));
  }
}

export = Cupl;
