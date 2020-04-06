PlantUMLFile
  = diagrams:Diagrams
  {
    return diagrams;
  }
  / (!"@startuml" .)*
  {
    return []
  }

Diagrams
  = diagrams:(
    (!"@startuml" .)*
    _ "@startuml" _ [^\n]* (_ NewLine) +
    title:(Title)?
    nodes:Sequence
    _ "@enduml" _ NewLine?
    (!"@startuml" .)*
    {
      return {
        ...title,
        nodes,
      };
    }
  )+

Title =
  title:(ShortTitle / LongTitle)
  {
    return title;
  }

ShortTitle =
  _ "title" _ title:[^\n]+ (_ NewLine) +
  {
    return {
      title: title.join('').trim(),
    }
  }

LongTitle =
  _ "title" _ NewLine _ longTitle:( !(_ "end" _ "title") [^\n]* NewLine)+ _ "end" _ "title" (_ NewLine)+
  {
    const [title, ...description] = longTitle;
    return {
      title: title[1].join('').trim(),
      description: description.map((l:string[][]) => l[1].join('').trim()).join('\n'),
    }
  }


Sequence =
  sequence:(Node / If)*
  {
    return sequence;
  }

If =
  _ "if" firstBranch:IfTitle firstChildren:Sequence elseIf:ElseIf* _ "else" lastBranch:IfTail lastChildren:Sequence EndIf
  {
    return {
      type: 'if',
      branches: [
        {node: firstBranch, children: firstChildren},
        ...elseIf,
        {node: lastBranch, children: lastChildren},
      ],
    };
  }

Node = _ node:(Terminal / Activity) _ NewLine
  {
    return node;
  }

ElseIf =
  _ "elseif" _ node:IfTitle children:Sequence
  {
    return { node, children };
  }
EndIf =
  _ "endif" _ NewLine


IfTitle =
  _ "(" name:IfText ")" _  "then" IfTail
  {
    return {
      type: 'condition',
      name,
    };
  }

IfTail = _ "("  name:IfText ")" _ NewLine
  {
    return { name, type: 'condition' }
  }

IfText =
  text:( !([?][)]) [^)] )+ "?"?
  {
    return text.map((t: string[]) => t[1]).join('')
  }

Terminal =
  type:(Start / Stop / End)
  {
    return { type } as types.Node;
  }

Start = "start"
Stop = "stop"
End = "end"

Activity =
  ActivityStart activity:(([@])?[^;|<>/\]}]+) ActivityEnd Note?
  {
    return {
      name: activity[1].join('').replace(/\n\s+/g, '\n'),
      type: activity[0] ? 'action' : 'activity'
    } as types.Node;
  }

Note =
  _ NewLine _ "note" _ ("left"/"right")_ NewLine _ ( !(_ "end" _ "note") [^\n]* NewLine)+ _ "end" _ "note" _

ActivityStart = ":"
ActivityEnd =
  ";"
  / "|"
  / "<"
  / ">"
  / "/"
  / "]"
  / "}"

// =======
Name
  = name:([A-Za-z0-9._]+)
  {
    return name.join('');
  }

DiagramId
  = "(" _ "id" _ "=" Name ")"
_
  = [ \t]*

NewLine
  = "\n"
  / "\r\n"
