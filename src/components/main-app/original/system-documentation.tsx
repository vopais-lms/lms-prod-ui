// @ts-nocheck
import React, { useState } from 'react';
import { Book, FileText, Code, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export function SystemDocumentation() {
  const [activeSection, setActiveSection] = useState<'overview' | 'components' | 'api' | 'deployment'>('overview');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#111827]">System Documentation</h2>
        <p className="text-sm text-[#6B7280] mt-1">
          Complete technical documentation for the ADI Loan Management System
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-[#E5E7EB]">
        <div className="flex gap-1 px-4 border-b border-[#E5E7EB]">
          {[
            { id: 'overview', label: 'System Overview', icon: <Book className="w-4 h-4" /> },
            { id: 'components', label: 'Components', icon: <Code className="w-4 h-4" /> },
            { id: 'api', label: 'API Reference', icon: <FileText className="w-4 h-4" /> },
            { id: 'deployment', label: 'Deployment', icon: <CheckCircle className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeSection === tab.id
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#111827] mb-3">System Architecture</h3>
                <p className="text-[#6B7280] mb-4">
                  The ADI Loan Management System is a comprehensive React 18 application built with TypeScript and Tailwind CSS v4,
                  designed to manage loan portfolios with role-based access control and real-time monitoring capabilities.
                </p>
              </div>

              <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                <h4 className="font-semibold text-[#111827] mb-3">Technology Stack</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-[#111827]">Frontend:</strong>
                    <ul className="text-[#6B7280] mt-1 space-y-1">
                      <li>• React 18.3.1</li>
                      <li>• TypeScript</li>
                      <li>• Tailwind CSS v4.1.12</li>
                      <li>• Vite 6.3.5</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-[#111827]">Key Libraries:</strong>
                    <ul className="text-[#6B7280] mt-1 space-y-1">
                      <li>• Recharts (Charts)</li>
                      <li>• Lucide React (Icons)</li>
                      <li>• Radix UI (Components)</li>
                      <li>• Motion (Animations)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[#111827] mb-3">Core Features</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#111827]">Role-Based Dashboards:</strong>
                      <p className="text-sm text-[#6B7280]">Separate views for MD/Executive and Loan Officer roles with customized KPIs and workflows.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#111827]">3-Tier Alert System:</strong>
                      <p className="text-sm text-[#6B7280]">Critical blocking modals, high-priority banners, and medium-level toast notifications.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#111827]">Universal Search:</strong>
                      <p className="text-sm text-[#6B7280]">Cmd+K powered search across loans, customers, and system functions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#16A34A] flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#111827]">Data Tables with Drill-Down:</strong>
                      <p className="text-sm text-[#6B7280]">Interactive tables with bulk actions, filtering, and detail slide-outs.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'components' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#111827] mb-3">Component Library</h3>
                <p className="text-[#6B7280] mb-4">
                  Complete list of reusable components with their purpose and usage.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    name: 'StatusPill',
                    path: '/src/app/components/status-pill.tsx',
                    description: 'Displays loan status with semantic colors (active, overdue, SMA-1, SMA-2, NPA)',
                  },
                  {
                    name: 'FlagBadge',
                    path: '/src/app/components/flag-badge.tsx',
                    description: 'Shows risk flags (Risk, Collection, Operational) with appropriate colors',
                  },
                  {
                    name: 'KPICard',
                    path: '/src/app/components/kpi-card.tsx',
                    description: 'Key performance indicator card with primary/secondary metrics and trends',
                  },
                  {
                    name: 'DPDCounter',
                    path: '/src/app/components/dpd-counter.tsx',
                    description: 'Days past due counter with color-coded severity levels',
                  },
                  {
                    name: 'AlertBanner',
                    path: '/src/app/components/alert-banner.tsx',
                    description: 'Tier 1 and Tier 2 alert banners with action buttons and snooze functionality',
                  },
                  {
                    name: 'BlockingModal',
                    path: '/src/app/components/blocking-modal.tsx',
                    description: 'Critical alert modal that blocks user interaction until acknowledged',
                  },
                  {
                    name: 'DataTable',
                    path: '/src/app/components/data-table.tsx',
                    description: 'Interactive data table with sorting, selection, and bulk actions',
                  },
                  {
                    name: 'DetailSlideOut',
                    path: '/src/app/components/detail-slideout.tsx',
                    description: 'Side panel for displaying detailed loan information',
                  },
                  {
                    name: 'FilterBar',
                    path: '/src/app/components/filter-bar.tsx',
                    description: 'Multi-criteria filter bar with save view functionality',
                  },
                  {
                    name: 'UniversalSearch',
                    path: '/src/app/components/universal-search.tsx',
                    description: 'Cmd+K powered search modal with recent searches and suggestions',
                  },
                ].map((component) => (
                  <div key={component.name} className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-[#111827] font-mono">{component.name}</h4>
                      <Code className="w-4 h-4 text-[#6B7280]" />
                    </div>
                    <p className="text-sm text-[#6B7280] mb-2">{component.description}</p>
                    <code className="text-xs text-[#2563EB] bg-white px-2 py-1 rounded">{component.path}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#111827] mb-3">API Integration Guide</h3>
                <p className="text-[#6B7280] mb-4">
                  Currently using mock data. Replace with actual API endpoints when backend is ready.
                </p>
              </div>

              <div className="bg-[#DBEAFE] border border-[#BFDBFE] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-[#1E40AF] mb-2">Integration Points</h4>
                    <ul className="space-y-1 text-sm text-[#1E40AF]">
                      <li>• Loan data fetching in ExecutiveCommand and LoanOfficerWorkQueue components</li>
                      <li>• Real-time alert polling for blocking modals and toast notifications</li>
                      <li>• Search API for UniversalSearch component</li>
                      <li>• User authentication and role management</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                  <h4 className="font-semibold text-[#111827] mb-2">Expected API Endpoints</h4>
                  <div className="space-y-2 text-sm">
                    <div className="font-mono bg-white p-2 rounded border border-[#E5E7EB]">
                      <span className="text-[#16A34A] font-semibold">GET</span> /api/loans - Fetch loan list
                    </div>
                    <div className="font-mono bg-white p-2 rounded border border-[#E5E7EB]">
                      <span className="text-[#16A34A] font-semibold">GET</span> /api/loans/:id - Get loan details
                    </div>
                    <div className="font-mono bg-white p-2 rounded border border-[#E5E7EB]">
                      <span className="text-[#F59E0B] font-semibold">PUT</span> /api/loans/:id - Update loan
                    </div>
                    <div className="font-mono bg-white p-2 rounded border border-[#E5E7EB]">
                      <span className="text-[#16A34A] font-semibold">GET</span> /api/alerts - Fetch active alerts
                    </div>
                    <div className="font-mono bg-white p-2 rounded border border-[#E5E7EB]">
                      <span className="text-[#2563EB] font-semibold">POST</span> /api/search - Search functionality
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'deployment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#111827] mb-3">Deployment Guide</h3>
                <p className="text-[#6B7280] mb-4">
                  Steps to build and deploy the application to production.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
                  <h4 className="font-semibold text-[#111827] mb-3">Build Steps</h4>
                  <ol className="space-y-2 text-sm text-[#6B7280]">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-[#111827]">1.</span>
                      <span>Install dependencies: <code className="bg-white px-2 py-0.5 rounded text-[#2563EB]">npm install</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-[#111827]">2.</span>
                      <span>Build for production: <code className="bg-white px-2 py-0.5 rounded text-[#2563EB]">npm run build</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-[#111827]">3.</span>
                      <span>Output will be in <code className="bg-white px-2 py-0.5 rounded text-[#2563EB]">/dist</code> directory</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-[#92400E] mb-2">Pre-Production Checklist</h4>
                      <ul className="space-y-1 text-sm text-[#92400E]">
                        <li>☐ Replace all mock data with actual API calls</li>
                        <li>☐ Implement proper authentication and session management</li>
                        <li>☐ Add environment variable configuration</li>
                        <li>☐ Enable error tracking (e.g., Sentry)</li>
                        <li>☐ Add React Error Boundaries</li>
                        <li>☐ Configure CORS for production API</li>
                        <li>☐ Implement data masking for sensitive information</li>
                        <li>☐ Add loading states and error handling</li>
                        <li>☐ Test all user roles and permissions</li>
                        <li>☐ Performance testing and optimization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

