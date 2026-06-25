// @ts-nocheck
import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, Shield, Target } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';

const riskTrends = [
  { month: 'Aug', gnpa: 2.8, sma1: 4.2, sma2: 2.1 },
  { month: 'Sep', gnpa: 2.9, sma1: 4.5, sma2: 2.3 },
  { month: 'Oct', gnpa: 3.0, sma1: 4.8, sma2: 2.5 },
  { month: 'Nov', gnpa: 3.1, sma1: 5.1, sma2: 2.7 },
  { month: 'Dec', gnpa: 3.2, sma1: 5.3, sma2: 2.9 },
  { month: 'Jan', gnpa: 3.2, sma1: 5.2, sma2: 2.8 },
];

const dpdDistribution = [
  { range: '0-30', count: 285, amount: '₹118Cr' },
  { range: '31-60', count: 18, amount: '₹12Cr' },
  { range: '61-90', count: 12, amount: '₹7Cr' },
  { range: '91-180', count: 6, amount: '₹3Cr' },
  { range: '>180', count: 3, amount: '₹2Cr' },
];

const earlyWarningSignals = [
  {
    signal: 'Repeated EMI Bounces',
    accounts: 8,
    totalExposure: '₹6.2 Cr',
    severity: 'critical',
    action: 'Immediate follow-up required',
  },
  {
    signal: 'Partial Payments',
    accounts: 12,
    totalExposure: '₹8.5 Cr',
    severity: 'high',
    action: 'Monitor payment patterns',
  },
  {
    signal: 'Business Downturn Indicators',
    accounts: 5,
    totalExposure: '₹4.2 Cr',
    severity: 'medium',
    action: 'Schedule business review',
  },
  {
    signal: 'Co-borrower Defaults',
    accounts: 3,
    totalExposure: '₹2.8 Cr',
    severity: 'high',
    action: 'Review collateral adequacy',
  },
];

const portfolioAtRisk = [
  {
    category: 'SMA-0 (1-30 DPD)',
    count: 18,
    amount: '₹12 Cr',
    percentage: '8.5%',
    trend: 'up',
  },
  {
    category: 'SMA-1 (31-60 DPD)',
    count: 12,
    amount: '₹7 Cr',
    percentage: '4.9%',
    trend: 'up',
  },
  {
    category: 'SMA-2 (61-90 DPD)',
    count: 6,
    amount: '₹3 Cr',
    percentage: '2.1%',
    trend: 'stable',
  },
  {
    category: 'NPA (>90 DPD)',
    count: 9,
    amount: '₹5 Cr',
    percentage: '3.5%',
    trend: 'up',
  },
];

export function RiskManagement() {
  const [timeframe, setTimeframe] = useState<'6m' | '1y' | '2y'>('6m');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]';
      case 'high': return 'bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]';
      case 'medium': return 'bg-[#DBEAFE] text-[#2563EB] border-[#93C5FD]';
      default: return 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#111827]">Risk Management</h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Monitor portfolio risk, early warning signals, and asset quality trends
          </p>
        </div>
        <div className="flex gap-2">
          {['6m', '1y', '2y'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeframe === period
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]'
              }`}
            >
              {period === '6m' ? '6 Months' : period === '1y' ? '1 Year' : '2 Years'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">GNPA RATIO</span>
            <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
          </div>
          <div className="text-3xl font-bold text-[#111827] mb-1">3.2%</div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-[#DC2626]" />
            <span className="text-[#DC2626]">0.1% MoM</span>
          </div>
          <div className="text-xs text-[#6B7280] mt-1">Target: &lt;3%</div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">PROVISION COVERAGE</span>
            <Shield className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div className="text-3xl font-bold text-[#111827] mb-1">78%</div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-[#16A34A]">Adequate</span>
          </div>
          <div className="text-xs text-[#6B7280] mt-1">Target: &gt;70%</div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">TOTAL PAR</span>
            <Target className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div className="text-3xl font-bold text-[#111827] mb-1">₹27 Cr</div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-[#6B7280]">19.0% of AUM</span>
          </div>
          <div className="text-xs text-[#6B7280] mt-1">45 accounts</div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">RECOVERY RATE</span>
            <TrendingUp className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="text-3xl font-bold text-[#111827] mb-1">68%</div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-[#16A34A]">Above target</span>
          </div>
          <div className="text-xs text-[#6B7280] mt-1">Target: &gt;60%</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Quality Trends */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-semibold text-[#111827] mb-4">Asset Quality Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={riskTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="gnpa" stroke="#DC2626" strokeWidth={2} name="GNPA %" />
              <Line type="monotone" dataKey="sma1" stroke="#F59E0B" strokeWidth={2} name="SMA-1 %" />
              <Line type="monotone" dataKey="sma2" stroke="#2563EB" strokeWidth={2} name="SMA-2 %" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#DC2626]" />
              <span className="text-[#6B7280]">GNPA</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#F59E0B]" />
              <span className="text-[#6B7280]">SMA-1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#2563EB]" />
              <span className="text-[#6B7280]">SMA-2</span>
            </div>
          </div>
        </div>

        {/* DPD Distribution */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-semibold text-[#111827] mb-4">DPD Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dpdDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {dpdDistribution.map((item) => (
              <div key={item.range} className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">{item.range} days</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#6B7280]">{item.count} accounts</span>
                  <span className="font-semibold text-[#111827]">{item.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio at Risk */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-lg font-semibold text-[#111827]">Portfolio at Risk (PAR)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">Accounts</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">% of AUM</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-[#6B7280] uppercase">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {portfolioAtRisk.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#F9FAFB]">
                  <td className="px-6 py-4 font-medium text-[#111827]">{item.category}</td>
                  <td className="px-6 py-4 text-right text-[#6B7280]">{item.count}</td>
                  <td className="px-6 py-4 text-right font-semibold text-[#111827]">{item.amount}</td>
                  <td className="px-6 py-4 text-right text-[#6B7280]">{item.percentage}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                      item.trend === 'up' ? 'bg-[#FEE2E2] text-[#DC2626]' : 'bg-[#D1FAE5] text-[#16A34A]'
                    }`}>
                      {item.trend === 'up' ? '↑' : '→'} {item.trend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Early Warning Signals */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-lg font-semibold text-[#111827]">Early Warning Signals</h3>
          <p className="text-sm text-[#6B7280] mt-1">
            Predictive indicators requiring proactive intervention
          </p>
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {earlyWarningSignals.map((signal, idx) => (
            <div key={idx} className="p-6 hover:bg-[#F9FAFB]">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-[#111827]">{signal.signal}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(signal.severity)}`}>
                      {signal.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#6B7280] mb-2">
                    <span>{signal.accounts} accounts</span>
                    <span>•</span>
                    <span className="font-semibold text-[#111827]">{signal.totalExposure}</span>
                  </div>
                  <p className="text-sm text-[#2563EB]">→ {signal.action}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Mitigation Actions */}
      <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#92400E] mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Recommended Risk Mitigation Actions
        </h3>
        <ul className="space-y-2 text-sm text-[#92400E]">
          <li className="flex items-start gap-2">
            <span className="font-bold">1.</span>
            <span><strong>Immediate Priority:</strong> Address 8 accounts with repeated EMI bounces (₹6.2 Cr exposure)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">2.</span>
            <span><strong>Provision Review:</strong> Increase provision coverage to 80%+ given rising NPAs</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">3.</span>
            <span><strong>Collateral Revaluation:</strong> Conduct fresh valuation for SMA-2 and NPA accounts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">4.</span>
            <span><strong>Early Intervention:</strong> Set up dedicated team for SMA-0 accounts to prevent slippage</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">5.</span>
            <span><strong>Underwriting Review:</strong> Analyze 2020-2021 vintage defaults to refine credit policies</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

