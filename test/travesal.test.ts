import { traverse } from '../src/traversal';
import { parse } from './../src/plantuml';

test('', () => {
  const diagrams = parse(`
    @startuml
    start
    :Hello world;
    :This is defined on

    several **lines**;
    end
    @enduml
  `);
  expect([...traverse(diagrams[0])]).toMatchSnapshot();
});
test('', () => {
  const diagrams = parse(`
    @startuml
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
  expect([...traverse(diagrams[0])]).toMatchSnapshot();
});
