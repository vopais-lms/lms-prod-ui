import type { Metric } from './types';

type KpiMetricsProps = {
  metrics: Metric[];
  getToneClass: (tone: Metric['tone']) => string;
};

export function KpiMetrics({ metrics, getToneClass }: KpiMetricsProps) {
  return (
    <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <article key={metric.label} className={`rounded-xl border border-[#E5E7EB] p-4 ${getToneClass(metric.tone)}`}>
          <p className="text-xs uppercase tracking-wide opacity-80">{metric.label}</p>
          <p className="text-2xl font-semibold mt-2">{metric.value}</p>
        </article>
      ))}
    </section>
  );
}
