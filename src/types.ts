export interface Node {
  type: 'condition' | 'activity' | 'action' | 'start' | 'stop' | 'end';
  name?: string;
}

export interface IfNode {
  type: 'if';
  branches: Branch[];
}

export interface Diagram {
  title: string;
  description?: string;
  nodes: (Node | IfNode)[];
}

export interface Config {
  paths?: { [key: string]: PathConfig };
  global?: GlobalConfig;
}

export interface Branch {
  node: Node;
  children: Node[];
}

export interface CommonConfig {
  alias?: { [key: string]: string };
  examples?: string[][];
}

export interface PathConfig extends CommonConfig {
  name?: string;
  tags?: string[];
}
export interface GlobalConfig extends CommonConfig {
  indent?: number;
  dialect?: string;
}
