// @ts-nocheck
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';

export type TreeGridColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

export type TreeGridRow<T> = T & {
  id: number;
  children?: TreeGridRow<T>[];
};

type VisibleRow<T> = {
  row: TreeGridRow<T>;
  depth: number;
  hasChildren: boolean;
};

function collectVisibleRows<T>(
  rows: TreeGridRow<T>[],
  expandedIds: Set<number>,
  depth = 0,
): VisibleRow<T>[] {
  const visible: VisibleRow<T>[] = [];
  for (const row of rows) {
    const children = row.children || [];
    const hasChildren = children.length > 0;
    visible.push({ row, depth, hasChildren });
    if (hasChildren && expandedIds.has(row.id)) {
      visible.push(...collectVisibleRows(children, expandedIds, depth + 1));
    }
  }
  return visible;
}

type TreeGridProps<T> = {
  rows: TreeGridRow<T>[];
  columns: TreeGridColumn<T>[];
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  onRowClick?: (row: T, event: React.MouseEvent) => void;
  onDropOnRow?: (draggedId: number, targetId: number) => void;
  onDropOnRoot?: (draggedId: number) => void;
  renderDragHandle?: (row: T) => ReactNode;
  emptyMessage?: string;
  getRowClassName?: (row: T) => string;
};

export function TreeGrid<T extends { id: number }>({
  rows,
  columns,
  expandedIds,
  onToggleExpand,
  onRowClick,
  onDropOnRow,
  onDropOnRoot,
  renderDragHandle,
  emptyMessage = 'No rows found.',
  getRowClassName,
}: TreeGridProps<T>) {
  const visibleRows = collectVisibleRows(rows, expandedIds);

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const readDraggedId = (event: React.DragEvent): number | null => {
    const raw = event.dataTransfer.getData('text/plain');
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };

  if (visibleRows.length === 0) {
    return (
      <div
        className="rounded-lg border border-dashed border-[#E5E7EB] px-4 py-10 text-center text-sm text-[#6B7280]"
        onDragOver={handleDragOver}
        onDrop={(event) => {
          event.preventDefault();
          const draggedId = readDraggedId(event);
          if (draggedId != null) onDropOnRoot?.(draggedId);
        }}
      >
        {emptyMessage}
        <p className="mt-2 text-xs text-[#9CA3AF]">Drop here to move a group to root level.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
      <div
        className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-xs font-medium uppercase tracking-wide text-[#6B7280]"
        onDragOver={handleDragOver}
        onDrop={(event) => {
          event.preventDefault();
          const draggedId = readDraggedId(event);
          if (draggedId != null) onDropOnRoot?.(draggedId);
        }}
      >
        Drop on this header area to unlink from parent (move to root)
      </div>
      <table className="min-w-full divide-y divide-[#E5E7EB]">
        <thead className="bg-[#F9FAFB]">
          <tr>
            <th className="w-10 px-3 py-3" />
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280] ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E7EB] bg-white">
          {visibleRows.map(({ row, depth, hasChildren }) => (
            <tr
              key={row.id}
              className={`hover:bg-[#F9FAFB] ${getRowClassName?.(row) || ''}`}
              onDragOver={handleDragOver}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const draggedId = readDraggedId(event);
                if (draggedId != null && draggedId !== row.id) {
                  onDropOnRow?.(draggedId, row.id);
                }
              }}
              onClick={(event) => onRowClick?.(row, event)}
            >
              <td className="px-3 py-3 align-middle">
                <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 16}px` }}>
                  {renderDragHandle ? (
                    <span
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/plain', String(row.id));
                        event.dataTransfer.effectAllowed = 'move';
                        event.stopPropagation();
                      }}
                      onClick={(event) => event.stopPropagation()}
                      className="cursor-grab text-[#9CA3AF] hover:text-[#6B7280]"
                    >
                      {renderDragHandle(row)}
                    </span>
                  ) : null}
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleExpand(row.id);
                      }}
                      className="rounded p-0.5 text-[#6B7280] hover:bg-[#E5E7EB]"
                    >
                      {expandedIds.has(row.id) ? (
                        <ChevronDownIcon className="h-4 w-4" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4" />
                      )}
                    </button>
                  ) : (
                    <span className="inline-block w-5" />
                  )}
                </div>
              </td>
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3 text-sm text-[#111827] ${column.className || ''}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
