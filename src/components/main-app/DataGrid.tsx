import type { RouteConfig } from './types';

type DataGridProps = {
  table: RouteConfig['table'];
};

export function DataGrid({ table }: DataGridProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#F9FAFB] text-[#6B7280]">
          <tr>
            {table.columns.map((column) => (
              <th key={column} className="px-4 py-3 text-left font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {table.rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="text-[#111827]">
              {row.map((cell, cellIndex) => (
                <td key={`cell-${rowIndex}-${cellIndex}`} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
