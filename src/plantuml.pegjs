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
    _ "@startuml" _ DiagramId? _ NewLine
    nodes:Sequence
    _ "@enduml" _ NewLine?
    (!"@startuml" .)*
    {
      return nodes;
    }
  )+


Sequence =
  sequence:(Node / If)+
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


IfTitle = _ "(" name:IfText ")" _  "then" IfTail
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

IfText = text:[^)]+
  {
    return text.join('')
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
  ActivityStart activity:ActivityBody ActivityEnd
  {
    return {
      name: activity.join('').replace(/\n\s+/g, '\n'),
      type: 'activity'
    } as types.Node;
  }

ActivityBody = [^;|<>/\]}]+

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
