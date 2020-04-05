import { dropLeft, filterMap, findLastIndex, last } from 'fp-ts/lib/Array';
import { flow } from 'fp-ts/lib/function';
import { getOrElse, none, some, toNullable } from 'fp-ts/lib/Option';
import gherkin from 'gherkin';

import { spaces, split } from './utils';

export interface Node {
  type: 'condition' | 'activity' | 'action' | 'start' | 'stop' | 'end';
  name?: string;
}

export interface CommonConfig {
  alias?: { [key: string]: string };
  examples?: { [key: string]: string }[] | string[][];
}

export interface PathConfig extends CommonConfig {
  name?: string;
  tags?: string[];
}
export interface GlobalConfig extends CommonConfig {
  indent?: number;
  dialect?: string;
}

const getOrZero = getOrElse<number>(() => 0);

const findLastConditionIndex = findLastIndex<Node>((n) => n.type === 'condition');

// const inspect = <T>() => (a: T) => {
//   // eslint-disable-next-line no-console
//   console.log(a);
//   return a;
// };

const DEFAULT_DIALECT = 'en';

const is = (type: Node['type']) => (n: Node) => n.type === type;
// const optionalIs = (type: Node['type']) => (n: Node) => (n.type === type ? some(n) : none);
const returnSomeNameIfTypeIs = (type: Node['type']) => (n: Node) =>
  n.type === type ? some(n.name!) : none;

const nullableLastString: <T extends string>(as: [T]) => T | null = flow(last, toNullable);
const lastSegmentOrEmpty = <T extends string>(as: T[][]) => as[as.length - 1] || [];

const getAlias = (pathConfig?: PathConfig, globalConfig?: GlobalConfig) => (name: string) => {
  const globalAlias = globalConfig?.alias?.[name];
  const pathAlias = pathConfig?.alias?.[name];
  return pathAlias || globalAlias || name;
};

const INDENT_SIZE = 2;

const getStep = (indentSize: number) => (type: string, content: string, indent?: boolean) =>
  `${spaces[indentSize * (indent ? 3 : 2)]}${type}${content}`;

export function generateScenario(
  path: Node[],
  config?: { path?: PathConfig; global?: GlobalConfig }
) {
  const indentSize = config?.global?.indent || INDENT_SIZE;
  const dialects = gherkin.dialects();
  const dialect = dialects[config?.global?.dialect || DEFAULT_DIALECT] || dialects[DEFAULT_DIALECT];
  const alias = getAlias(config?.path, config?.global);
  const step = getStep(indentSize);
  const scenario =
    config?.path?.name ||
    path
      .filter((n) => n.type === 'condition')
      .map((t) => t.name)
      .join('|');
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
