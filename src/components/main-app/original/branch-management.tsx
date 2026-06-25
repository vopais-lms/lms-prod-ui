// @ts-nocheck
import React, { useState } from 'react';
import { MapPin, TrendingUp, TrendingDown, Users, Target, AlertCircle } from 'lucide-react';

interface BranchMetrics {
  id: string;
  name: string;
  location: string;
  manager: string;
  aum: string;
  gnpa: string;
  disbMTD: string;
  collectionRate: string;
  activeLoans: number;
  staff: number;
  status: 'excellent' | 'good' | 'concern' | 'critical';
}

const branches: BranchMetrics[] = [
  {
    id: 'BR001',
    name: 'Jaipur Central',
    location: 'Jaipur, Rajasthan',
    manager: 'Rajesh Kumar',
    aum: '₹28 Cr',
    gnpa: '2.5%',
    disbMTD: '₹3.0 Cr',
    collectionRate: '96%',
    activeLoans: 142,
    staff: 8,
    status: 'excellent',
  },
  {
    id: 'BR002',
    name: 'Udaipur Branch',
    location: 'Udaipur, Rajasthan',
    manager: 'Priya Singh',
    aum: '₹14 Cr',
    gnpa: '3.2%',
    disbMTD: '₹1.2 Cr',
    collectionRate: '91%',
    activeLoans: 68,
    staff: 5,
    status: 'good',
  },
  {
    id: 'BR003',
    name: 'Ahmedabad Central',
    location: 'Ahmedabad, Gujarat',
    manager: 'Amit Patel',
    aum: '₹25 Cr',
    gnpa: '3.8%',
    disbMTD: '₹2.0 Cr',
    collectionRate: '90%',
    activeLoans: 98,
    staff: 7,
    status: 'good',
  },
  {
    id: 'BR004',
    name: 'Surat Branch',
    location: 'Surat, Gujarat',
    manager: 'Vikram Reddy',
    aum: '₹13 Cr',
    gnpa: '4.6%',
    disbMTD: '₹0.8 Cr',
    collectionRate: '84%',
    activeLoans: 54,
    staff: 4,
    status: 'critical',
  },
  {
    id: 'BR005',
    name: 'Mumbai West',
    location: 'Mumbai, Maharashtra',
    manager: 'Neha Sharma',
    aum: '₹22 Cr',
    gnpa: '2.8%',
    disbMTD: '₹2.5 Cr',
    collectionRate: '94%',
    activeLoans: 89,
    staff: 6,
    status: 'excellent',
  },
  {
    id: 'BR006',
    name: 'Pune Branch',
    location: 'Pune, Maharashtra',
    manager: 'Sunil Desai',
    aum: '₹13 Cr',
    gnpa: '3.0%',
    disbMTD: '₹1.0 Cr',
    collectionRate: '92%',
    activeLoans: 52,
    staff: 4,
    status: 'good',
  },
  {
    id: 'BR007',
    name: 'Bangalore North',
    location: 'Bangalore, Karnataka',
    manager: 'Lakshmi Iyer',
    aum: '₹18 Cr',
    gnpa: '3.3%',
    disbMTD: '₹1.5 Cr',
    collectionRate: '91%',
    activeLoans: 72,
    staff: 5,
    status: 'good',
  },
  {
    id: 'BR008',
    name: 'Mysore Branch',
    location: 'Mysore, Karnataka',
    manager: 'Arjun Rao',
    aum: '₹9 Cr',
    gnpa: '3.5%',
    disbMTD: '₹0.7 Cr',
    collectionRate: '89%',
    activeLoans: 38,
    staff: 3,
    status: 'concern',
  },
];

export function BranchManagement() {
  const [selectedBranch, setSelectedBranch] = useState<BranchMetrics | null>(null);
  const [sortBy, setSortBy] = useState<'aum' | 'gnpa' | 'collection' | 'name'>('aum');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-[#D1FAE5] text-[#16A34A] border-[#86EFAC]';
      case 'good': return 'bg-[#DBEAFE] text-[#2563EB] border-[#93C5FD]';
      case 'concern': return 'bg-[#FEF3C7] text-[#F59E0B] border-[#FDE68A]';
      case 'critical': return 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]';
      default: return 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]';
    }
  };

  const totalAUM = '₹142 Cr';
  const avgGNPA = '3.2%';
  const totalBranches = branches.length;
  const totalStaff = branches.reduce((sum, b) => sum + b.staff, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#111827]">Branch Management</h2>
        <p className="text-sm text-[#6B7280] mt-1">
          Monitor and manage branch performance across regions
        </p>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">TOTAL BRANCHES</span>
            <MapPin className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="text-3xl font-bold text-[#111827]">{totalBranches}</div>
          <div className="text-sm text-[#6B7280] mt-1">Across 4 states</div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">NETWORK AUM</span>
            <Target className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div className="text-3xl font-bold text-[#111827]">{totalAUM}</div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-[#16A34A]" />
            <span className="text-[#16A34A]">8.2% MoM</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">AVG GNPA</span>
            <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div className="text-3xl font-bold text-[#111827]">{avgGNPA}</div>
          <div className="text-sm text-[#6B7280] mt-1">Target: &lt;3%</div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">TOTAL STAFF</span>
            <Users className="w-5 h-5 text-[#6B7280]" />
          </div>
          <div className="text-3xl font-bold text-[#111827]">{totalStaff}</div>
          <div className="text-sm text-[#6B7280] mt-1">Across all branches</div>
        </div>
      </div>

      {/* Branch Filters */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#6B7280]">Sort by:</span>
          <div className="flex gap-2">
            {[
              { id: 'aum', label: 'AUM' },
              { id: 'gnpa', label: 'GNPA' },
              { id: 'collection', label: 'Collection' },
              { id: 'name', label: 'Name' },
            ].map((sort) => (
              <button
                key={sort.id}
                onClick={() => setSortBy(sort.id as any)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  sortBy === sort.id
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                }`}
              >
                {sort.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedBranch(branch)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#111827]">{branch.name}</h3>
                  <p className="text-sm text-[#6B7280] flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {branch.location}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(branch.status)}`}>
                  {branch.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Manager</span>
                  <span className="text-sm font-medium text-[#111827]">{branch.manager}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">AUM</span>
                  <span className="text-sm font-semibold text-[#111827]">{branch.aum}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">GNPA</span>
                  <span className={`text-sm font-semibold ${
                    parseFloat(branch.gnpa) > 3.5 ? 'text-[#DC2626]' : 'text-[#16A34A]'
                  }`}>
                    {branch.gnpa}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Collection Rate</span>
                  <span className={`text-sm font-semibold ${
                    parseFloat(branch.collectionRate) < 90 ? 'text-[#DC2626]' : 'text-[#16A34A]'
                  }`}>
                    {branch.collectionRate}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#E5E7EB]">
                <div>
                  <div className="text-2xl font-bold text-[#111827]">{branch.activeLoans}</div>
                  <div className="text-xs text-[#6B7280]">Active Loans</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#111827]">{branch.staff}</div>
                  <div className="text-xs text-[#6B7280]">Staff Members</div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-[#F9FAFB] border-t border-[#E5E7EB]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B7280]">MTD Disbursement</span>
                <span className="font-semibold text-[#111827]">{branch.disbMTD}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Alerts */}
      <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#92400E] mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Branch Performance Alerts
        </h3>
        <ul className="space-y-2 text-sm text-[#92400E]">
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Surat Branch:</strong> GNPA at 4.6% and collection rate at 84%. Immediate intervention required.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Mysore Branch:</strong> Below-target collection rate. Consider staff training and process review.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold">•</span>
            <span><strong>Network Growth:</strong> Jaipur and Mumbai branches leading in disbursements. Consider replicating best practices.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

