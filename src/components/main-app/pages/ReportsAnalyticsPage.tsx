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
  AnalyticsOfficerPoint,
  AnalyticsSummaryResponse,
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

function formatCount(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString();
}

function formatMoney(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `₹${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

const WINDOW_OPTIONS = [
  { months: 3, label: 'Last 3 months' },
  { months: 6, label: 'Last 6 months' },
  { months: 12, label: 'Last 12 months' },
];

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

type WindowSeriesState = SeriesState & { months: number };

function createWindowSeriesState(months = 3): WindowSeriesState {
  const defaults = defaultMonthRange(months);
  return {
    months,
    startMonth: defaults.start_month,
    endMonth: defaults.end_month,
    data: [],
    loading: true,
    error: null,
  };
}

function WindowChartCard({
  title,
  subtitle,
  valueLabel,
  barColor,
  state,
  onWindowChange,
  formatValue,
}: {
  title: string;
  subtitle: string;
  valueLabel: string;
  barColor: string;
  state: WindowSeriesState;
  onWindowChange: (months: number) => void;
  formatValue?: (value: number) => string;
}) {
  const chartData = state.data.map((point) => ({
    month: point.month,
    value: point.value,
  }));

  return (
    <section className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
          <p className="text-sm text-[#6B7280] mt-1">{subtitle}</p>
        </div>
        <label className="flex flex-col gap-1 text-xs text-[#6B7280]">
          Period
          <select
            aria-label={`${title} period`}
            value={state.months}
            onChange={(event) => onWindowChange(Number(event.target.value))}
            className="px-2.5 py-1.5 text-sm text-[#111827] border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
          >
            {WINDOW_OPTIONS.map((option) => (
              <option key={option.months} value={option.months}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
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
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  loading,
  error,
}: {
  label: string;
  value: string;
  hint: string;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
      <p className="text-sm text-[#6B7280]">{label}</p>
      {loading ? (
        <p className="mt-3 text-sm text-[#6B7280]">Loading…</p>
      ) : error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : (
        <>
          <p className="mt-2 text-3xl font-bold text-[#111827]">{value}</p>
          <p className="mt-2 text-sm text-[#6B7280]">{hint}</p>
        </>
      )}
    </div>
  );
}

export function ReportsAnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [officerEid, setOfficerEid] = useState('');
  const [officerOptions, setOfficerOptions] = useState<AnalyticsOfficerPoint[]>([]);
  const [officerRows, setOfficerRows] = useState<AnalyticsOfficerPoint[]>([]);
  const [officerLoading, setOfficerLoading] = useState(true);
  const [officerError, setOfficerError] = useState<string | null>(null);

  const [loansDisbursed, setLoansDisbursed] = useState<WindowSeriesState>(
    () => createWindowSeriesState(3),
  );
  const [disbursementAmounts, setDisbursementAmounts] = useState<WindowSeriesState>(
    () => createWindowSeriesState(3),
  );
  const [collections, setCollections] = useState<WindowSeriesState>(
    () => createWindowSeriesState(3),
  );
  const [npa, setNpa] = useState<SeriesState>(createSeriesState);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      setSummary(await analyticsApi.summary());
    } catch (err: any) {
      setSummary(null);
      setSummaryError(err.message || 'Failed to load summary');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadOfficers = useCallback(async (loanOfficerEid: string) => {
    setOfficerLoading(true);
    setOfficerError(null);
    try {
      const res = await analyticsApi.loansByOfficer(loanOfficerEid || undefined);
      const rows = res.data || [];
      setOfficerRows(rows);
      if (!loanOfficerEid) {
        setOfficerOptions(rows.filter((row) => row.loan_officer_eid));
      }
    } catch (err: any) {
      setOfficerRows([]);
      setOfficerError(err.message || 'Failed to load loans by officer');
    } finally {
      setOfficerLoading(false);
    }
  }, []);

  const loadWindowSeries = useCallback(
    async (
      kind: 'loans' | 'amounts' | 'collections',
      months: number,
    ) => {
      const setState =
        kind === 'loans'
          ? setLoansDisbursed
          : kind === 'amounts'
            ? setDisbursementAmounts
            : setCollections;
      const range = defaultMonthRange(months);
      setState((prev) => ({
        ...prev,
        months,
        startMonth: range.start_month,
        endMonth: range.end_month,
        loading: true,
        error: null,
      }));
      try {
        const params = { start_month: range.start_month, end_month: range.end_month };
        const res =
          kind === 'loans'
            ? await analyticsApi.disbursementsByMonth(params)
            : kind === 'amounts'
              ? await analyticsApi.disbursementAmountsByMonth(params)
              : await analyticsApi.collectionsByMonth(params);
        setState((prev) => ({
          ...prev,
          startMonth: res.start_month || range.start_month,
          endMonth: res.end_month || range.end_month,
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

  const loadNpa = useCallback(async (startMonth: string, endMonth: string) => {
    if (!MONTH_KEY_RE.test(startMonth) || !MONTH_KEY_RE.test(endMonth)) {
      setNpa((prev) => ({
        ...prev,
        loading: false,
        error: 'Months must be in MM/YYYY format (e.g. 07/2026).',
      }));
      return;
    }
    setNpa((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await analyticsApi.npaByMonth({
        start_month: startMonth,
        end_month: endMonth,
      });
      setNpa((prev) => ({
        ...prev,
        startMonth: res.start_month || startMonth,
        endMonth: res.end_month || endMonth,
        data: res.data || [],
        loading: false,
        error: null,
      }));
    } catch (err: any) {
      setNpa((prev) => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to load series',
      }));
    }
  }, []);

  useEffect(() => {
    loadSummary();
    loadOfficers('');
    loadWindowSeries('loans', 3);
    loadWindowSeries('amounts', 3);
    loadWindowSeries('collections', 3);
    const defaults = defaultMonthRange(12);
    loadNpa(defaults.start_month, defaults.end_month);
  }, [loadSummary, loadOfficers, loadWindowSeries, loadNpa]);

  const officerChartData = officerRows.map((row) => ({
    name: row.name,
    loans: row.loan_count,
  }));

  return (
    <PageShell
      title="Reports"
      subtitle="Portfolio counts, officers, disbursements, and collections"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          label="Healthy loans"
          value={formatCount(summary?.healthy_count)}
          hint="Disbursed loans that are not NPA"
          loading={summaryLoading}
          error={summaryError}
        />
        <SummaryCard
          label="Not yet disbursed"
          value={formatCount(summary?.not_yet_disbursed_count)}
          hint="Loans with nothing disbursed, excluding rejected"
          loading={summaryLoading}
          error={summaryError}
        />
        <SummaryCard
          label="Collections"
          value={formatMoney(summary?.collections_last_12_months)}
          hint="Approved amounts, last 12 months"
          loading={summaryLoading}
          error={summaryError}
        />
        <SummaryCard
          label="Disbursements"
          value={formatMoney(summary?.disbursements_last_12_months)}
          hint="Disbursed amounts, last 12 months"
          loading={summaryLoading}
          error={summaryError}
        />
      </div>

      <section className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">Loans by officer</h2>
            <p className="text-sm text-[#6B7280] mt-1">
              Loan count for each officer. Unassigned loans stay in the full view.
            </p>
          </div>
          <label className="flex flex-col gap-1 text-xs text-[#6B7280]">
            Loan officer
            <select
              aria-label="Loan officer"
              value={officerEid}
              onChange={(event) => {
                const next = event.target.value;
                setOfficerEid(next);
                loadOfficers(next);
              }}
              className="min-w-48 px-2.5 py-1.5 text-sm text-[#111827] border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40"
            >
              <option value="">All officers</option>
              {officerOptions.map((officer) => (
                <option key={officer.loan_officer_eid} value={officer.loan_officer_eid}>
                  {officer.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {officerError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {officerError}
          </p>
        )}
        <div className="h-72 w-full">
          {officerLoading ? (
            <div className="h-full flex items-center justify-center text-sm text-[#6B7280]">
              Loading…
            </div>
          ) : officerChartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-[#6B7280]">
              No loans for this officer
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={officerChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Loans']} />
                <Bar dataKey="loans" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <WindowChartCard
          title="Loans disbursed per month"
          subtitle="Distinct loans with at least one disbursed disbursement in the month"
          valueLabel="Loans"
          barColor="#2563EB"
          state={loansDisbursed}
          onWindowChange={(months) => loadWindowSeries('loans', months)}
        />
        <WindowChartCard
          title="Disbursements by month"
          subtitle="Sum of disbursed disbursement amounts"
          valueLabel="Amount"
          barColor="#0F766E"
          state={disbursementAmounts}
          onWindowChange={(months) => loadWindowSeries('amounts', months)}
          formatValue={formatMoney}
        />
      </div>

      <WindowChartCard
        title="Collections by month"
        subtitle="Sum of approved collection amounts"
        valueLabel="Amount"
        barColor="#059669"
        state={collections}
        onWindowChange={(months) => loadWindowSeries('collections', months)}
        formatValue={formatMoney}
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
        onApply={() => loadNpa(npa.startMonth, npa.endMonth)}
      />
    </PageShell>
  );
}
