// @ts-nocheck
import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { analyticsApi } from '../../../apis/analytics';
import type {
  AnalyticsMonthPoint,
  AnalyticsRatiosResponse,
} from '../../../apis/types';
import { PageShell } from '../shared/PageShell';

const MONTH_KEY_RE = /^(0[1-9]|1[0-2])\/\d{4}$/;

function formatMonthKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${year}`;
}

/** Inclusive last `count` calendar months ending at the current month. */
function defaultMonthRange(count = 12): { start_month: string; end_month: string } {
  const end = new Date();
  end.setDate(1);
  const start = new Date(end);
  start.setMonth(start.getMonth() - (count - 1));
  return {
    start_month: formatMonthKey(start),
    end_month: formatMonthKey(end),
  };
}

function formatRatio(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

function formatCount(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString();
}

type SeriesState = {
  startMonth: string;
  endMonth: string;
  data: AnalyticsMonthPoint[];
  loading: boolean;
  error: string | null;
};

function createSeriesState(): SeriesState {
  const defaults = defaultMonthRange(12);
  return {
    startMonth: defaults.start_month,
    endMonth: defaults.end_month,
    data: [],
    loading: true,
    error: null,
  };
}

type SeriesChartProps = {
  title: string;
  subtitle: string;
  valueLabel: string;
  chartType: 'bar' | 'line';
  barColor: string;
  state: SeriesState;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onApply: () => void;
  formatValue?: (value: number) => string;
};

function SeriesChartCard({
  title,
  subtitle,
  valueLabel,
  chartType,
  barColor,
  state,
  onStartChange,
  onEndChange,
  onApply,
  formatValue,
}: SeriesChartProps) {
  const chartData = state.data.map((point) => ({
    month: point.month,
    value: point.value,
  }));

  return (
    <section className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
          <p className="text-sm text-[#6B7280] mt-1">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-[#6B7280]">
            Start (MM/YYYY)
            <input
              type="text"
              inputMode="numeric"
              placeholder="MM/YYYY"
              value={state.startMonth}
              onChange={(e) => onStartChange(e.target.value)}
              className="w-28 px-2.5 py-1.5 text-sm text-[#111827] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[#6B7280]">
            End (MM/YYYY)
            <input
              type="text"
              inputMode="numeric"
              placeholder="MM/YYYY"
              value={state.endMonth}
              onChange={(e) => onEndChange(e.target.value)}
              className="w-28 px-2.5 py-1.5 text-sm text-[#111827] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
            />
          </label>
          <button
            type="button"
            onClick={onApply}
            disabled={state.loading}
            className="px-3 py-1.5 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="h-72 w-full">
        {state.loading ? (
          <div className="h-full flex items-center justify-center text-sm text-[#6B7280]">
            Loading…
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-[#6B7280]">
            No data for this range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  formatter={(value: number) => [
                    formatValue ? formatValue(value) : value.toLocaleString(),
                    valueLabel,
                  ]}
                />
                <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip
                  formatter={(value: number) => [
                    formatValue ? formatValue(value) : value.toLocaleString(),
                    valueLabel,
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={barColor}
                  strokeWidth={2}
                  dot={{ r: 3, fill: barColor }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export function ReportsAnalyticsPage() {
  const [ratios, setRatios] = useState<AnalyticsRatiosResponse | null>(null);
  const [ratiosLoading, setRatiosLoading] = useState(true);
  const [ratiosError, setRatiosError] = useState<string | null>(null);

  const [disbursements, setDisbursements] = useState<SeriesState>(createSeriesState);
  const [npa, setNpa] = useState<SeriesState>(createSeriesState);
  const [collections, setCollections] = useState<SeriesState>(createSeriesState);

  const loadRatios = useCallback(async () => {
    setRatiosLoading(true);
    setRatiosError(null);
    try {
      const res = await analyticsApi.ratios();
      setRatios(res);
    } catch (err: any) {
      setRatios(null);
      setRatiosError(err.message || 'Failed to load ratios');
    } finally {
      setRatiosLoading(false);
    }
  }, []);

  const loadSeries = useCallback(
    async (
      kind: 'disbursements' | 'npa' | 'collections',
      startMonth: string,
      endMonth: string,
    ) => {
      const setState =
        kind === 'disbursements'
          ? setDisbursements
          : kind === 'npa'
            ? setNpa
            : setCollections;

      if (!MONTH_KEY_RE.test(startMonth) || !MONTH_KEY_RE.test(endMonth)) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Months must be in MM/YYYY format (e.g. 07/2026).',
        }));
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const params = { start_month: startMonth, end_month: endMonth };
        const res =
          kind === 'disbursements'
            ? await analyticsApi.disbursementsByMonth(params)
            : kind === 'npa'
              ? await analyticsApi.npaByMonth(params)
              : await analyticsApi.collectionsByMonth(params);
        setState((prev) => ({
          ...prev,
          startMonth: res.start_month || startMonth,
          endMonth: res.end_month || endMonth,
          data: res.data || [],
          loading: false,
          error: null,
        }));
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err.message || 'Failed to load series',
        }));
      }
    },
    [],
  );

  useEffect(() => {
    loadRatios();
    const defaults = defaultMonthRange(12);
    loadSeries('disbursements', defaults.start_month, defaults.end_month);
    loadSeries('npa', defaults.start_month, defaults.end_month);
    loadSeries('collections', defaults.start_month, defaults.end_month);
  }, [loadRatios, loadSeries]);

  return (
    <PageShell
      title="Reports"
      subtitle="Disbursement, NPA, and collection analytics"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
          <p className="text-sm text-[#6B7280]">Healthy : NPA</p>
          {ratiosLoading ? (
            <p className="mt-3 text-sm text-[#6B7280]">Loading…</p>
          ) : ratiosError ? (
            <p className="mt-3 text-sm text-red-600">{ratiosError}</p>
          ) : (
            <>
              <p className="mt-2 text-3xl font-bold text-[#111827]">
                {formatRatio(ratios?.healthy_to_npa_ratio)}
              </p>
              <p className="mt-2 text-sm text-[#6B7280]">
                {formatCount(ratios?.healthy_count)} healthy · {formatCount(ratios?.npa_count)} NPA
              </p>
            </>
          )}
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
          <p className="text-sm text-[#6B7280]">Under process : Disbursed</p>
          {ratiosLoading ? (
            <p className="mt-3 text-sm text-[#6B7280]">Loading…</p>
          ) : ratiosError ? (
            <p className="mt-3 text-sm text-red-600">{ratiosError}</p>
          ) : (
            <>
              <p className="mt-2 text-3xl font-bold text-[#111827]">
                {formatRatio(ratios?.under_process_to_disbursed_ratio)}
              </p>
              <p className="mt-2 text-sm text-[#6B7280]">
                {formatCount(ratios?.under_process_count)} under process ·{' '}
                {formatCount(ratios?.disbursed_count)} disbursed
              </p>
            </>
          )}
        </div>
      </div>

      <SeriesChartCard
        title="Disbursements by month"
        subtitle="Distinct loans with at least one disbursed disbursement in the month"
        valueLabel="Loans"
        chartType="bar"
        barColor="#2563EB"
        state={disbursements}
        onStartChange={(value) =>
          setDisbursements((prev) => ({ ...prev, startMonth: value }))
        }
        onEndChange={(value) =>
          setDisbursements((prev) => ({ ...prev, endMonth: value }))
        }
        onApply={() =>
          loadSeries('disbursements', disbursements.startMonth, disbursements.endMonth)
        }
      />

      <SeriesChartCard
        title="NPA count by month"
        subtitle="Loans that were NPA as of each month-end (90+ days unpaid EMI)"
        valueLabel="NPA loans"
        chartType="line"
        barColor="#DC2626"
        state={npa}
        onStartChange={(value) => setNpa((prev) => ({ ...prev, startMonth: value }))}
        onEndChange={(value) => setNpa((prev) => ({ ...prev, endMonth: value }))}
        onApply={() => loadSeries('npa', npa.startMonth, npa.endMonth)}
      />

      <SeriesChartCard
        title="Collections by month"
        subtitle="Sum of approved collection amounts by collection month"
        valueLabel="Amount"
        chartType="bar"
        barColor="#059669"
        state={collections}
        onStartChange={(value) =>
          setCollections((prev) => ({ ...prev, startMonth: value }))
        }
        onEndChange={(value) =>
          setCollections((prev) => ({ ...prev, endMonth: value }))
        }
        onApply={() =>
          loadSeries('collections', collections.startMonth, collections.endMonth)
        }
        formatValue={(value) =>
          `₹${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        }
      />
    </PageShell>
  );
}
