import { generateScenario } from '../src/generator';

describe('generate', () => {
  // async function assertIsValidGherkin(scenario: string[]) {
  //   // const output = gherkin.fromSources([makeSourceEnvelop(scenario.join('\n'))]);
  //   console.log(gherkin.dialects().en);
  // }
  test('should create scenario with Given Then When', async () => {
    const generated = generateScenario([
      { type: 'start' },
      { type: 'action', name: 'user enters PIN' },
      { type: 'condition', name: 'entered wrong PIN' },
      { type: 'activity', name: 'show wrong PIN Entered' },
      { type: 'activity', name: 'eject card' },
      { type: 'stop' },
    ]);
    expect(generated).toMatchSnapshot();
    expect(generated.find((line) => /Scenario/.test(line))).toBeTruthy();
    expect(generated.find((line) => /Given/.test(line))).toBeTruthy();
    expect(generated.find((line) => /When/.test(line))).toBeTruthy();
    expect(generated.find((line) => /Then/.test(line))).toBeTruthy();
    // await assertIsValidGherkin(generated);
  });
  test('should accept path with no condition', () => {
    const generated = generateScenario([
      { type: 'start' },
      { type: 'action', name: 'user enters PIN' },
      { type: 'activity', name: 'show wrong PIN Entered' },
      { type: 'activity', name: 'eject card' },
      { type: 'stop' },
    ]);
    expect(generated).toMatchSnapshot();
    expect(generated.find((line) => /Scenario/.test(line))).toBeTruthy();
    expect(generated.find((line) => /Given/.test(line))).toBeFalsy();
    expect(generated.find((line) => /When/.test(line))).toBeTruthy();
    expect(generated.find((line) => /Then/.test(line))).toBeTruthy();
  });
  test('should accept path with neither action nor condition', () => {
    const generated = generateScenario([
      { type: 'start' },
      { type: 'activity', name: 'show wrong PIN Entered' },
      { type: 'activity', name: 'eject card' },
      { type: 'stop' },
    ]);
    expect(generated).toMatchSnapshot();
    expect(generated.find((line) => /Scenario/.test(line))).toBeTruthy();
    expect(generated.find((line) => /Given/.test(line))).toBeFalsy();
    expect(generated.find((line) => /When/.test(line))).toBeFalsy();
    expect(generated.find((line) => /Then/.test(line))).toBeTruthy();
  });
  test('should support And on Given, When and Then', () => {
    const generated = generateScenario([
      { type: 'start' },
      { type: 'action', name: 'user push a card in' },
      { type: 'action', name: 'user enters PIN' },
      { type: 'condition', name: 'server responded' },
      { type: 'condition', name: 'entered wrong PIN' },
      { type: 'activity', name: 'show wrong PIN Entered' },
      { type: 'activity', name: 'eject card' },
      { type: 'stop' },
    ]);
    expect(generated).toMatchSnapshot();
    expect(generated.filter((line) => /^\s+And/.test(line)).length).toEqual(3);
  });
  test('support path and global alias', () => {
    const generated = generateScenario(
      [
        { type: 'start' },
        { type: 'action', name: 'user enters PIN' },
        { type: 'condition', name: 'entered wrong PIN' },
        { type: 'activity', name: 'show wrong PIN Entered' },
        { type: 'activity', name: 'eject card' },
        { type: 'stop' },
      ],
      {
        path: {
          name: 'User forgot PIN or made a typo',
          tags: ['web', 'server'],
          alias: {
            'entered wrong PIN': 'having 123456 as PIN',
            'user enters PIN': 'enter 111111 as PIN',
          },
        },
        global: {
          alias: {
            'entered wrong PIN': '?????????',
            'user enters PIN': '????????',
            'eject card': 'return card to user',
          },
        },
      }
    );
    expect(generated).toMatchSnapshot();
    expect(generated.find((line) => /User forgot PIN or made a typo/.test(line))).toBeTruthy();
    expect(generated.find((line) => /123456/.test(line))).toBeTruthy();
    expect(generated.filter((line) => /\?+/.test(line)).length).toEqual(0);
  });
  test('support dialects', () => {
    const generated = generateScenario(
      [
        { type: 'start' },
        { type: 'action', name: 'user enters PIN' },
        { type: 'condition', name: 'entered wrong PIN' },
        { type: 'activity', name: 'show wrong PIN Entered' },
        { type: 'activity', name: 'eject card' },
        { type: 'stop' },
      ],
      {
        path: {
          name: 'User forgot PIN or made a typo',
          tags: ['web', 'server'],
          alias: {
            'entered wrong PIN': 'having 123456 as PIN',
            'user enters PIN': 'enter 111111 as PIN',
          },
        },
        global: {
          dialect: 'vi',
          alias: {
            'entered wrong PIN': '?????????',
            'user enters PIN': '????????',
            'eject card': 'return card to user',
          },
        },
      }
    );
    expect(generated).toMatchSnapshot();
    expect(generated.find((line) => /User forgot PIN or made a typo/.test(line))).toBeTruthy();
    expect(generated.find((line) => /123456/.test(line))).toBeTruthy();
    expect(generated.filter((line) => /\?+/.test(line)).length).toEqual(0);
  });
  test('support fallback to en if specified dialect is missing', () => {
    const generated = generateScenario(
      [
        { type: 'start' },
        { type: 'action', name: 'user enters PIN' },
        { type: 'condition', name: 'entered wrong PIN' },
        { type: 'activity', name: 'show wrong PIN Entered' },
        { type: 'activity', name: 'eject card' },
        { type: 'stop' },
      ],
      {
        path: {
          name: 'User forgot PIN or made a typo',
          tags: ['web', 'server'],
          alias: {
            'entered wrong PIN': 'having 123456 as PIN',
            'user enters PIN': 'enter 111111 as PIN',
          },
        },
        global: {
          dialect: 'alien',
          alias: {
            'entered wrong PIN': '?????????',
            'user enters PIN': '????????',
            'eject card': 'return card to user',
          },
        },
      }
    );
    expect(generated).toMatchSnapshot();
    expect(generated.find((line) => /\s+Given/.test(line))).toBeTruthy();
  });
});
