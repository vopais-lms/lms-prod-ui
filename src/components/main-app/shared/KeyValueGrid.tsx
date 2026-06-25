// @ts-nocheck

type KeyValueField = {
  label: string;
  value: string;
};

type KeyValueGroup = {
  title: string;
  fields: KeyValueField[];
};

type KeyValueGridProps = {
  groups: KeyValueGroup[];
};

export function KeyValueGrid({ groups }: KeyValueGridProps) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.title}>
          <h4 className="text-sm font-semibold text-[#111827] mb-3">{group.title}</h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            {group.fields.map((field) => (
              <div key={field.label}>
                <dt className="text-[#6B7280]">{field.label}</dt>
                <dd className="font-medium text-[#111827] mt-0.5 break-words">{field.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
