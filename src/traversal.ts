import { IfNode, Node } from './types';
import { deepFlatten } from './utils';

export function* traverse(diagram: (Node | IfNode)[]) {
  const traversal: any = {};
  function* visitBranches(node: IfNode) {
    for (const branch of node.branches) {
      for (const [path, terminated] of traversal.visitSequence(branch.children)) {
        yield [[branch.node, ...path], terminated];
      }
    }
  }
  function* visitSequence(nodes: (Node | IfNode)[]): Generator<[Node[], boolean], void, unknown> {
    const segments: any[] = [];
    let paths: Node[][] = [];
    const path: Node[] = [];
    function visitSegment(idx: number) {
      if (idx >= segments.length) {
        paths.push([...path]);
        return;
      }
      for (const subPath of segments[idx]) {
        path.push(subPath);
        visitSegment(idx + 1);
        path.pop();
      }
    }

    for (const node of nodes) {
      const terminatedBranches = [];
      const onGoingBranches = [];
      if (node.type === 'if') {
        for (const [branch, isTerminated] of traversal.visitBranches(node)) {
          if (isTerminated) {
            terminatedBranches.push(branch);
          } else {
            onGoingBranches.push(branch);
          }
        }
      } else if (['end', 'stop'].includes(node.type)) {
        terminatedBranches.push(node);
      } else {
        onGoingBranches.push(node);
      }
      if (terminatedBranches.length > 0) {
        segments.push(terminatedBranches);
        paths = [];
        visitSegment(0);
        for (const path of paths) {
          yield [path, true];
        }
        segments.pop();
      }
      if (onGoingBranches.length > 0) {
        segments.push(onGoingBranches);
      } else {
        return;
      }
    }
    paths = [];
    visitSegment(0);
    for (const path of paths) {
      yield [path, false];
    }
  }
  traversal.visitBranches = visitBranches;
  traversal.visitSequence = visitSequence;
  for (const [path] of visitSequence(diagram)) {
    yield deepFlatten(path);
  }
}
