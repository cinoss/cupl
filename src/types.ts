export interface Node {
  type: 'condition' | 'activity' | 'action' | 'start' | 'stop' | 'end';
  name?: string;
}

export interface IfNode {
  type: 'if';
  branches: Branch[];
}

export interface Branch {
  node: Node;
  children: Node[];
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
