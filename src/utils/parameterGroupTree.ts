export type ParameterGroupType = 'verification' | 'scoring';

export interface ParameterGroupListItem {
  id: number;
  name: string;
  type_of_group: ParameterGroupType | string;
  parent_parameter_group_id: number | null;
  group_scoring_weight: number;
  created_at: string;
  updated_at: string;
}

export interface ParameterGroupTreeNode extends ParameterGroupListItem {
  children: ParameterGroupTreeNode[];
}

export function buildParameterGroupTree(
  items: ParameterGroupListItem[],
): ParameterGroupTreeNode[] {
  const byId = new Map<number, ParameterGroupTreeNode>();
  for (const item of items) {
    byId.set(item.id, { ...item, children: [] });
  }

  const roots: ParameterGroupTreeNode[] = [];
  for (const node of byId.values()) {
    const parentId = node.parent_parameter_group_id;
    if (parentId != null && byId.has(parentId)) {
      byId.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: ParameterGroupTreeNode[]) => {
    nodes.sort((a, b) => a.id - b.id);
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);
  return roots;
}

export function flattenParameterGroupTree(
  nodes: ParameterGroupTreeNode[],
  depth = 0,
): Array<ParameterGroupTreeNode & { depth: number }> {
  const rows: Array<ParameterGroupTreeNode & { depth: number }> = [];
  for (const node of nodes) {
    rows.push({ ...node, depth });
    rows.push(...flattenParameterGroupTree(node.children, depth + 1));
  }
  return rows;
}

export function wouldCreateCycle(
  childId: number,
  newParentId: number | null,
  items: ParameterGroupListItem[],
): boolean {
  if (newParentId == null) return false;
  if (childId === newParentId) return true;

  const parentByChild = new Map<number, number | null>();
  for (const item of items) {
    parentByChild.set(item.id, item.parent_parameter_group_id);
  }

  let current: number | null = newParentId;
  while (current != null) {
    if (current === childId) return true;
    current = parentByChild.get(current) ?? null;
  }
  return false;
}

export function isDescendant(
  ancestorId: number,
  nodeId: number,
  items: ParameterGroupListItem[],
): boolean {
  const parentByChild = new Map<number, number | null>();
  for (const item of items) {
    parentByChild.set(item.id, item.parent_parameter_group_id);
  }
  let current: number | null = nodeId;
  while (current != null) {
    if (current === ancestorId) return true;
    current = parentByChild.get(current) ?? null;
  }
  return false;
}
