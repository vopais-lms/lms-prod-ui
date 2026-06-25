// @ts-nocheck
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from 'recharts';
import { KPICard } from './kpi-card';
import { AlertBanner } from './alert-banner';
import { ChevronDown, ChevronRight } from 'lucide-react';

const disbursementData = [
  { month: 'Sep', actual: 32, target: 35 },
  { month: 'Oct', actual: 38, target: 35 },
  { month: 'Nov', actual: 34, target: 35 },
  { month: 'Dec', actual: 41, target: 35 },
  { month: 'Jan', actual: 45, target: 35 },
  { month: 'Feb', actual: 38, target: 35 },
];

const productBreakdown = [
  { name: 'Personal Loan', amount: '₹42Cr', percentage: '30%', color: '#2563EB' },
  { name: 'Business Loan <20L', amount: '₹38Cr', percentage: '27%', color: '#16A34A' },
  { name: 'Business Loan >20L', amount: '₹35Cr', percentage: '25%', color: '#F59E0B' },
  { name: 'Vehicle Loan', amount: '₹27Cr', percentage: '18%', color: '#6B7280' },
];

interface RegionData {
  region: string;
  aum: string;
  gnpa: string;
  disbMTD: string;
  collection: string;
  flag: 'success' | 'warning' | 'critical';
  expanded: boolean;
  branches?: BranchData[];
}

interface BranchData {
  name: string;
  aum: string;
  gnpa: string;
  disbMTD: string;
  collection: string;
}

export function ExecutiveCommand() {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'profitability' | 'risk' | 'board'>('portfolio');
  const [regions, setRegions] = useState<RegionData[]>([
    {
      region: 'Rajasthan',
      aum: '₹42Cr',
      gnpa: '2.8%',
      disbMTD: '₹4.2Cr',
      collection: '94%',
      flag: 'success',
      expanded: false,
      branches: [
        { name: 'Jaipur Branch', aum: '₹28Cr', gnpa: '2.5%', disbMTD: '₹3.0Cr', collection: '96%' },
        { name: 'Udaipur Branch', aum: '₹14Cr', gnpa: '3.2%', disbMTD: '₹1.2Cr', collection: '91%' },
      ],
    },
    {
      region: 'Gujarat',
      aum: '₹38Cr',
      gnpa: '4.1%',
      disbMTD: '₹2.8Cr',
      collection: '88%',
      flag: 'critical',
      expanded: false,
      branches: [
        { name: 'Ahmedabad Branch', aum: '₹25Cr', gnpa: '3.8%', disbMTD: '₹2.0Cr', collection: '90%' },
        { name: 'Surat Branch', aum: '₹13Cr', gnpa: '4.6%', disbMTD: '₹0.8Cr', collection: '84%' },
      ],
    },
    {
      region: 'Maharashtra',
      aum: '₹35Cr',
      gnpa: '2.9%',
      disbMTD: '₹3.5Cr',
      collection: '93%',
      flag: 'success',
      expanded: false,
    },
    {
      region: 'Karnataka',
      aum: '₹27Cr',
      gnpa: '3.4%',
      disbMTD: '₹2.2Cr',
      collection: '90%',
      flag: 'warning',
      expanded: false,
    },
  ]);

  const toggleRegion = (index: number) => {
    const newRegions = [...regions];
    newRegions[index].expanded = !newRegions[index].expanded;
    setRegions(newRegions);
  };

  return (
    <div className="space-y-6">
      <AlertBanner
        tier="tier1"
        message="Board meeting in 3 days — Board Pack not yet generated. Action required by Feb 25."
        actions={[
          { label: 'Generate Board Pack', onClick: () => console.log('Generate') },
          { label: 'View Progress', onClick: () => console.log('Progress') },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="PORTFOLIO AUM"
          primaryMetric="₹142 Cr"
          trend={{ value: '8% vs target', direction: 'up' }}
          secondaryMetric="324 active loans"
          actionLabel="View All"
        />
        <KPICard
          label="MONTHLY P&L"
          primaryMetric="₹1.2 Cr"
          trend={{ value: '20% over plan', direction: 'up' }}
          secondaryMetric="vs ₹1.0Cr planned"
          actionLabel="View Details"
        />
        <KPICard
          label="GNPA RATIO"
          primaryMetric="3.2%"
          trend={{ value: '0.4%', direction: 'up' }}
          secondaryMetric="Target: <3%"
          danger
          actionLabel="View Risk"
        />
        <KPICard
          label="COMPLIANCE SCORE"
          primaryMetric="94%"
          secondaryMetric="2 items pending"
          actionLabel="View Items"
        />
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7EB]">
        <div className="border-b border-[#E5E7EB]">
          <div className="flex gap-1 px-4">
            {[
              { id: 'portfolio', label: 'Portfolio Health' },
              { id: 'profitability', label: 'Profitability' },
              { id: 'risk', label: 'Risk Concentration' },
              { id: 'board', label: 'Board Pack' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#2563EB] text-[#2563EB]'
                    : 'border-transparent text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-[#111827] mb-4">
                  Disbursement vs Target (Last 6 Months)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={disbursementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="actual" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="target" stroke="#DC2626" strokeWidth={2} strokeDasharray="5 5" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#111827] mb-4">
                  Product Breakdown
                </h3>
                <div className="space-y-3">
                  {productBreakdown.map((product) => (
                    <div key={product.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: product.color }} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-[#111827]">{product.name}</span>
                          <span className="text-sm font-semibold text-[#111827]">{product.amount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: product.percentage, backgroundColor: product.color }}
                            />
                          </div>
                          <span className="text-xs text-[#6B7280] w-10 text-right">{product.percentage}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-lg font-semibold text-[#111827]">Regional Performance Drill-Down</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Region</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">AUM</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">GNPA%</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">Disb MTD</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">Collection%</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#6B7280] uppercase">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {regions.map((region, idx) => (
                <React.Fragment key={region.region}>
                  <tr className="hover:bg-[#F9FAFB] cursor-pointer" onClick={() => toggleRegion(idx)}>
                    <td className="px-4 py-3 font-medium text-[#111827] flex items-center gap-2">
                      {region.branches && (
                        region.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                      )}
                      {region.region}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#111827]">{region.aum}</td>
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: parseFloat(region.gnpa) > 3.5 ? '#DC2626' : '#16A34A' }}>
                      {region.gnpa}
                    </td>
                    <td className="px-4 py-3 text-right text-[#6B7280]">{region.disbMTD}</td>
                    <td className="px-4 py-3 text-right text-[#6B7280]">{region.collection}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block w-3 h-3 rounded-full ${
                        region.flag === 'success' ? 'bg-[#16A34A]' :
                        region.flag === 'warning' ? 'bg-[#F59E0B]' :
                        'bg-[#DC2626]'
                      }`} />
                    </td>
                  </tr>
                  {region.expanded && region.branches?.map((branch) => (
                    <tr key={branch.name} className="bg-[#F9FAFB]/50">
                      <td className="px-4 py-3 pl-12 text-sm text-[#6B7280]">{branch.name}</td>
                      <td className="px-4 py-3 text-right text-sm text-[#6B7280]">{branch.aum}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium" style={{ color: parseFloat(branch.gnpa) > 3.5 ? '#DC2626' : '#16A34A' }}>
                        {branch.gnpa}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-[#6B7280]">{branch.disbMTD}</td>
                      <td className="px-4 py-3 text-right text-sm text-[#6B7280]">{branch.collection}</td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

