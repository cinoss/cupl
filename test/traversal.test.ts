import { parse } from '../src/plantuml';
import { traverse } from '../src/traversal';

describe('traverse', () => {
  test('should support simple activity diagram', () => {
    const diagrams = parse(`
    @startuml
    title title
    start
    :Hello world;
    :This is defined on

    several **lines**;
    end
    @enduml
  `);
    expect([...traverse(diagrams[0].nodes)]).toMatchSnapshot();
  });
  test('should support diagram with if statement', () => {
    const diagrams = parse(`
    @startuml
    title
      title
      Some description
    end title

    start
    if (condition A) then (yes)
      :Text 1;
    elseif (condition B) then (yes)
      :Text 2;
      stop
    elseif (condition C) then (yes)
      if (condition C1) then (yes)
        :Text C4;
      else (C2)
        :Text C else;
      endif
      :Text 3;
    elseif (condition D) then (yes)
      :Text 4;
    else (nothing)
      :Text else;
    endif
    :Happy;
    end
    @enduml
  `);
    expect([...traverse(diagrams[0].nodes)]).toMatchSnapshot();
  });
});
