import { dropLeft, filterMap, findLastIndex, last } from 'fp-ts/lib/Array';
import { flow } from 'fp-ts/lib/function';
import { getOrElse, none, some, toNullable } from 'fp-ts/lib/Option';
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

const nullableLastString: <T extends string>(as: [T]) => T | null = flow(last, toNullable);
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
    scenario: nullableLastString(dialect.scenario as any)!,
    and: nullableLastString(dialect.and as any)!,
    then: nullableLastString(dialect.then as any)!,
    when: nullableLastString(dialect.when as any)!,
    given: nullableLastString(dialect.given as any)!,
  };

  return [
    ...(tags.length > 0 ? [`${spaces[indentSize]}${tags.map((tag) => `@${tag}`).join(' ')}`] : []),
    `${spaces[indentSize]}${vocab.scenario}: ${scenario}`,
    ...givenConditions.map((name: string, idx: number) =>
      step(idx === 0 ? vocab.given : vocab.and, alias(name), idx !== 0)
    ),
    ...whenActions.map((name: string, idx: number) =>
      step(idx === 0 ? vocab.when : vocab.and, alias(name), idx !== 0)
    ),
    ...thenActivities.map((name: string, idx: number) =>
      step(idx === 0 ? vocab.then : vocab.and, alias(name), idx !== 0)
    ),
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
