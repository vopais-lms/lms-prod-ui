import type { RouteConfig } from './types';

type RouteWorkspaceCardProps = {
  config: RouteConfig;
};

export function RouteWorkspaceCard({ config }: RouteWorkspaceCardProps) {
  return (
    <section className="mt-6 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#111827]">{config.headline}</h3>
      <p className="mt-1 text-sm text-[#6B7280]">{config.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {config.actions.map((action) => (
          <button
            key={action}
            className="px-3 py-2 rounded-md border border-[#E5E7EB] bg-white text-sm text-[#111827] hover:bg-[#F9FAFB]"
          >
            {action}
          </button>
        ))}
      </div>
    </section>
  );
}
