import type { RouteConfig } from './types';

type ProgressBarsProps = {
  items: RouteConfig['pipeline'];
};

export function ProgressBars({ items }: ProgressBarsProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#111827]">Flow Distribution</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-sm text-[#111827]">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-gray-100">
              <div className="h-2 rounded-full bg-[#2563EB]" style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
