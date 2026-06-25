type OperationalFeedProps = {
  title: string;
};

export function OperationalFeed({ title }: OperationalFeedProps) {
  return (
    <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#111827]">Operational Feed</h3>
      <div className="mt-4 divide-y divide-gray-200">
        <div className="py-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#111827]">{title} synced</p>
            <p className="text-sm text-[#6B7280]">Latest records and summary stats have been refreshed.</p>
          </div>
          <span className="text-xs text-[#6B7280]">2 min ago</span>
        </div>
        <div className="py-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#111827]">Review queue generated</p>
            <p className="text-sm text-[#6B7280]">Prioritized items are ready for team action.</p>
          </div>
          <span className="text-xs text-[#6B7280]">10 min ago</span>
        </div>
        <div className="py-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#111827]">Compliance checks completed</p>
            <p className="text-sm text-[#6B7280]">No blocking violations were detected on this route.</p>
          </div>
          <span className="text-xs text-[#6B7280]">32 min ago</span>
        </div>
      </div>
    </div>
  );
}
