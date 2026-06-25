// @ts-nocheck
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  page?: number;
  perPage?: number;
  totalRecords?: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  rowKey: (item: T) => string | number;
  serverSidePagination?: boolean;
}

export function DataTable<T>({
  columns,
  data = [],
  loading = false,
  page = 1,
  perPage = 10,
  totalRecords = 0,
  onPageChange,
  onRowClick,
  emptyMessage = 'No records found',
  rowKey,
  serverSidePagination = false,
}: DataTableProps<T>) {
  const safeData = data || [];
  const displayData = serverSidePagination
    ? safeData
    : safeData.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.max(1, Math.ceil(totalRecords / perPage));

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-[#F9FAFB] border-b border-[#E5E7EB]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-[#E5E7EB] px-6 flex items-center gap-4">
              <div className="h-4 bg-[#E5E7EB] rounded w-1/4" />
              <div className="h-4 bg-[#E5E7EB] rounded w-1/6" />
              <div className="h-4 bg-[#E5E7EB] rounded w-1/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center text-[#9CA3AF]">
                  <div className="space-y-2">
                    <p className="text-lg font-medium">{emptyMessage}</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              displayData.map((item) => (
                <tr
                  key={rowKey(item)}
                  onClick={() => onRowClick?.(item)}
                  className={`transition-colors ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-[#F9FAFB]'
                      : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-6 py-4 text-sm text-[#111827] ${col.className || ''}`}>
                      {col.render ? col.render(item) : String((item as any)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalRecords > 0 && (
        <div className="px-6 py-3 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center justify-between">
          <p className="text-sm text-[#6B7280]">
            Showing {Math.min((page - 1) * perPage + 1, totalRecords)} to{' '}
            {Math.min(page * perPage, totalRecords)} of {totalRecords} records
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-[#111827] px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
