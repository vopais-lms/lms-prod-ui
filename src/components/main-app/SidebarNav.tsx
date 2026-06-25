import type { Route } from './types';

type SidebarNavProps = {
  routes: readonly Route[];
  titles: Record<Route, string>;
  currentRoute: Route;
  search: string;
  onSearch: (value: string) => void;
  onSelectRoute: (route: Route) => void;
};

export function SidebarNav({
  routes,
  titles,
  currentRoute,
  search,
  onSearch,
  onSelectRoute,
}: SidebarNavProps) {
  return (
    <aside className="w-72 bg-[#111827] text-white p-4 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400">MainApp Pages</p>
        <h2 className="text-lg font-semibold">LoanFlow Console</h2>
      </div>
      <input
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder="Search pages..."
        className="w-full rounded-md border border-gray-600 bg-[#1F2937] px-3 py-2 text-sm outline-none focus:border-blue-400"
      />
      <nav className="space-y-1 max-h-[75vh] overflow-auto pr-1">
        {routes.map((route) => (
          <button
            key={route}
            onClick={() => onSelectRoute(route)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
              currentRoute === route ? 'bg-[#2563EB] text-white' : 'hover:bg-[#1F2937] text-gray-200'
            }`}
          >
            {titles[route]}
          </button>
        ))}
      </nav>
    </aside>
  );
}
