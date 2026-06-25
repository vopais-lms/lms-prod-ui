// @ts-nocheck
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, PieChart } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RePieChart, Pie, Cell, LineChart, Line } from 'recharts';

const portfolioByProduct = [
  { name: 'Personal Loan', value: 42, color: '#2563EB' },
  { name: 'Business Loan', value: 38, color: '#16A34A' },
  { name: 'Vehicle Loan', value: 27, color: '#F59E0B' },
  { name: 'Gold Loan', value: 18, color: '#DC2626' },
  { name: 'Home Loan', value: 17, color: '#6B7280' },
];

const vintageAnalysis = [
  { vintage: '2024', performing: 95, npl: 5 },
  { vintage: '2023', performing: 92, npl: 8 },
  { vintage: '2022', performing: 89, npl: 11 },
  { vintage: '2021', performing: 85, npl: 15 },
  { vintage: '2020', performing: 82, npl: 18 },
];

const concentrationRisks = [
  { category: 'Top 10 Borrowers', exposure: '₹28 Cr', percentage: '19.7%', status: 'warning' },
  { category: 'Single Industry (Retail)', exposure: '₹35 Cr', percentage: '24.6%', status: 'critical' },
  { category: 'Geographic (Jaipur)', exposure: '₹42 Cr', percentage: '29.6%', status: 'critical' },
  { category: 'Unsecured Loans', exposure: '₹48 Cr', percentage: '33.8%', status: 'warning' },
];

export function PortfolioView() {
  const [timeframe, setTimeframe] = useState<'mtd' | 'qtd' | 'ytd'>('mtd');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#111827]">Portfolio Management</h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Comprehensive view of loan portfolio and risk exposure
          </p>
        </div>
        <div className="flex gap-2">
          {['mtd', 'qtd', 'ytd'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeframe === period
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]'
              }`}
            >
              {period.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">TOTAL AUM</span>
            <DollarSign className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="text-3xl font-bold text-[#111827] mb-1">₹142 Cr</div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-[#16A34A]" />
            <span className="text-[#16A34A] font-medium">8.2%</span>
            <span className="text-[#6B7280]">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">ACTIVE LOANS</span>
            <Users className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div className="text-3xl font-bold text-[#111827] mb-1">324</div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-[#16A34A]" />
            <span className="text-[#16A34A] font-medium">12</span>
            <span className="text-[#6B7280]">new this month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">AVG TICKET SIZE</span>
            <BarChart3 className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div className="text-3xl font-bold text-[#111827] mb-1">₹43.8 L</div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingDown className="w-4 h-4 text-[#DC2626]" />
            <span className="text-[#DC2626] font-medium">2.1%</span>
            <span className="text-[#6B7280]">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">YIELD (%)</span>
            <PieChart className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="text-3xl font-bold text-[#111827] mb-1">14.2%</div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-[#16A34A]" />
            <span className="text-[#16A34A] font-medium">0.3%</span>
            <span className="text-[#6B7280]">vs last month</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Mix */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-semibold text-[#111827] mb-4">Portfolio by Product</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={portfolioByProduct}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {portfolioByProduct.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RePieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {portfolioByProduct.map((product) => (
              <div key={product.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: product.color }} />
                  <span className="text-[#6B7280]">{product.name}</span>
                </div>
                <span className="font-semibold text-[#111827]">₹{product.value}Cr</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vintage Analysis */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <h3 className="text-lg font-semibold text-[#111827] mb-4">Vintage Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vintageAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="vintage" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="performing" stackId="a" fill="#16A34A" radius={[0, 0, 0, 0]} />
              <Bar dataKey="npl" stackId="a" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#16A34A]" />
              <span className="text-[#6B7280]">Performing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#DC2626]" />
              <span className="text-[#6B7280]">NPL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Concentration Risks */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-lg font-semibold text-[#111827]">Concentration Risks</h3>
          <p className="text-sm text-[#6B7280] mt-1">
            Portfolio concentration across various dimensions
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">Exposure</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">% of Portfolio</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-[#6B7280] uppercase">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {concentrationRisks.map((risk, idx) => (
                <tr key={idx} className="hover:bg-[#F9FAFB]">
                  <td className="px-6 py-4 font-medium text-[#111827]">{risk.category}</td>
                  <td className="px-6 py-4 text-right font-semibold text-[#111827]">{risk.exposure}</td>
                  <td className="px-6 py-4 text-right text-[#6B7280]">{risk.percentage}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      risk.status === 'critical' 
                        ? 'bg-[#FEE2E2] text-[#DC2626]' 
                        : 'bg-[#FEF3C7] text-[#F59E0B]'
                    }`}>
                      {risk.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights & Actions */}
      <div className="bg-[#DBEAFE] border border-[#BFDBFE] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#1E40AF] mb-3">Portfolio Insights</h3>
        <ul className="space-y-2 text-sm text-[#1E40AF]">
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Geographic Concentration:</strong> 29.6% of portfolio in Jaipur region. Consider diversification to reduce location risk.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Industry Risk:</strong> Retail sector exposure at 24.6%. Monitor for sector-specific economic changes.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Vintage Performance:</strong> 2020-2021 vintages showing elevated NPL. Review underwriting criteria from that period.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Product Mix:</strong> Personal loans leading at ₹42Cr. Balanced mix across products reduces concentration risk.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

