import { dropLeft, filterMap, findLastIndex } from 'fp-ts/lib/Array';
import { flow } from 'fp-ts/lib/function';
import { getOrElse, none, some } from 'fp-ts/lib/Option';
import gherkin from 'gherkin';
import * as _ from 'lodash/fp';

import { traverse } from './traversal';
import { Config, Diagram, GlobalConfig, Node, PathConfig } from './types';
import { spaces, split } from './utils';

const getOrZero = getOrElse<number>(() => 0);

const findLastConditionIndex = findLastIndex<Node>((n) => n.type === 'condition');

// const inspect = <T>() => (a: T) => {
//   // eslint-disable-next-line no-console
//   console.log(a);
//   return a;
// };

const DEFAULT_PATH_CONFIG: PathConfig = {
  tags: [],
};
const DEFAULT_DIALECT = 'en';

const is = (type: Node['type']) => (n: Node) => n.type === type;
// const optionalIs = (type: Node['type']) => (n: Node) => (n.type === type ? some(n) : none);
const returnSomeNameIfTypeIs = (type: Node['type']) => (n: Node) =>
  n.type === type ? some(n.name!) : none;

const lastString = (a: readonly string[]) => a[a.length - 1]!;
const lastSegmentOrEmpty = <T extends string>(as: T[][]) => as[as.length - 1] || [];

const removeNewLines = (name: string) => name.replace(/\s*(\n|\r\n)\s*/g, ' ');

const getAlias = (pathConfig?: PathConfig, globalConfig?: GlobalConfig) => (givenName: string) => {
  const name = removeNewLines(givenName);
  const globalAlias = globalConfig?.alias?.[name];
  const pathAlias = pathConfig?.alias?.[name];
  return removeNewLines(pathAlias || globalAlias || name);
};

const INDENT_SIZE = 2;

const getDialect = (globalConfig?: GlobalConfig) => {
  const dialects = gherkin.dialects();
  return dialects[globalConfig?.dialect || DEFAULT_DIALECT] || dialects[DEFAULT_DIALECT];
};

const getDialectCode = (globalConfig?: GlobalConfig) => {
  const dialects = gherkin.dialects();
  return dialects[globalConfig?.dialect || 'unknown'] ? globalConfig?.dialect : DEFAULT_DIALECT;
};

const getStep = (indentSize: number) => (type: string, content: string, indent?: boolean) =>
  `${spaces[indentSize * (indent ? 3 : 2)]}${type}${content}`;

const getPathKey = (path: Node[]) =>
  path
    .filter((n) => n.type === 'condition')
    .map((t) => removeNewLines(t.name!))
    .join('|');

const formatExamples = (examples: string[][], indentSize: number): string[] => {
  const colCount = examples[0]?.length || 0;
  if (colCount === 0) throw new Error('Having example with 0 columns');
  for (const header of examples[0]) {
    if (!header) throw new Error('Having empty header');
  }
  const lengths = examples[0].map((col) => col.length);
  examples.forEach((row) =>
    row.forEach((item, col) => {
      lengths[col] = Math.max(lengths[col], item?.length || 0);
    })
  );
  return examples.map(
    (row, rowIdx) =>
      `${spaces[indentSize * 3]}| ${row
        .map((item, col) =>
          rowIdx === 0 ? item.padEnd(lengths[col], ' ') : (item || '').padStart(lengths[col], ' ')
        )
        .join(' | ')} |`
  );
};
export function generateScenario(
  path: Node[],
  config?: { path?: PathConfig; global?: GlobalConfig }
) {
  const indentSize = config?.global?.indent || INDENT_SIZE;
  const alias = getAlias(config?.path, config?.global);
  const step = getStep(indentSize);
  const scenario = config?.path?.name || getPathKey(path);
  const dialect = getDialect(config?.global);
  const tags = config?.path?.tags || [];
  const givenConditions = flow(filterMap(returnSomeNameIfTypeIs('condition')))(path);
  const whenActions = flow(
    split(is('condition')),
    filterMap((segment: Node[]) => {
      const remain = filterMap(returnSomeNameIfTypeIs('action'))(segment);
      return remain.length > 0 ? some(remain) : none;
    }),
    lastSegmentOrEmpty
    // getOrElse(() => [])
  )(path);
  const lastConditionIndex = flow(findLastConditionIndex, getOrZero)(path);
  const thenActivities = filterMap(returnSomeNameIfTypeIs('activity'))(
    dropLeft(lastConditionIndex)(path)
  );

  const vocab = {
    scenario: lastString(dialect.scenario),
    scenarioOutline: dialect.scenarioOutline[0],
    and: lastString(dialect.and),
    then: lastString(dialect.then),
    when: lastString(dialect.when),
    given: lastString(dialect.given),
    examples: dialect.examples[0],
  };
  const hasExamples = Boolean(config?.path?.examples);
  return [
    ...(tags.length > 0 ? [`${spaces[indentSize]}${tags.map((tag) => `@${tag}`).join(' ')}`] : []),
    `${spaces[indentSize]}${hasExamples ? vocab.scenarioOutline : vocab.scenario}: ${scenario}`,
    ...givenConditions.map((name: string, idx: number) =>
      step(idx === 0 ? vocab.given : vocab.and, alias(name), idx !== 0)
    ),
    ...whenActions.map((name: string, idx: number) =>
      step(idx === 0 ? vocab.when : vocab.and, alias(name), idx !== 0)
    ),
    ...thenActivities.map((name: string, idx: number) =>
      step(idx === 0 ? vocab.then : vocab.and, alias(name), idx !== 0)
    ),
    ...(hasExamples
      ? [
          '',
          `${spaces[indentSize * 2]}${vocab.examples}:`,
          ...formatExamples(config!.path!.examples!, indentSize),
        ]
      : []),
  ];
}

export function generateFeature(diagram: Diagram, config: Config) {
  const paths = [...traverse(diagram.nodes)].map((path) => ({
    nodes: path,
    key: getPathKey(path),
  }));
  const dialect = getDialect(config?.global);
  const dialectCode = getDialectCode(config?.global);
  return {
    feature:
      (dialectCode === DEFAULT_DIALECT ? '' : `# language: ${dialectCode}\n`) +
      `${dialect.feature[0]}: ${diagram.title}` +
      (diagram.description ? ('\n' + diagram.description).replace(/\n/g, '\n  ') + '\n' : '') +
      '\n' +
      paths
        .map((path) =>
          generateScenario(path.nodes, {
            path: config.paths?.[path.key],
            global: config.global,
          }).join('\n')
        )
        .join('\n\n'),
    newConfig: {
      $schema: 'https://raw.githubusercontent.com/cinoss/cupl/master/src/config.schema.json',
      ...config,
      global: {
        dialect: dialectCode,
        ...config.global,
      },
      paths: {
        ..._.flow(
          _.map((path: { key: string }) => [path.key, DEFAULT_PATH_CONFIG]),
          _.fromPairs
        )(paths),
        ...config.paths,
      },
    },
  };
}
