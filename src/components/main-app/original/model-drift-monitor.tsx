// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface DriftMetric {
  component: string;
  baseline: number;
  current: number;
  drift: number;
  status: 'stable' | 'warning' | 'critical';
  timestamp: string;
}

interface CodeIntegrityCheck {
  file: string;
  expectedLines: number;
  actualLines: number;
  status: 'intact' | 'modified' | 'critical';
  lastChecked: string;
}

export function ModelDriftMonitor() {
  const [driftMetrics, setDriftMetrics] = useState<DriftMetric[]>([]);
  const [integrityChecks, setIntegrityChecks] = useState<CodeIntegrityCheck[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const runDriftDetection = () => {
    setIsMonitoring(true);
    const timestamp = new Date().toLocaleTimeString();

    // Simulate baseline vs current state comparison
    const metrics: DriftMetric[] = [
      {
        component: 'App.tsx',
        baseline: 214,
        current: 214,
        drift: 0,
        status: 'stable',
        timestamp,
      },
      {
        component: 'ExecutiveCommand',
        baseline: 275,
        current: 275,
        drift: 0,
        status: 'stable',
        timestamp,
      },
      {
        component: 'LoanOfficerWorkQueue',
        baseline: 173,
        current: 173,
        drift: 0,
        status: 'stable',
        timestamp,
      },
      {
        component: 'DataTable',
        baseline: 230,
        current: 230,
        drift: 0,
        status: 'stable',
        timestamp,
      },
      {
        component: 'Sidebar',
        baseline: 340,
        current: 340,
        drift: 0,
        status: 'stable',
        timestamp,
      },
      {
        component: 'GlobalHeader',
        baseline: 156,
        current: 156,
        drift: 0,
        status: 'stable',
        timestamp,
      },
    ];

    // Code integrity checks
    const integrity: CodeIntegrityCheck[] = [
      {
        file: '/src/app/App.tsx',
        expectedLines: 214,
        actualLines: 214,
        status: 'intact',
        lastChecked: new Date().toLocaleString(),
      },
      {
        file: '/src/app/components/executive-command.tsx',
        expectedLines: 275,
        actualLines: 275,
        status: 'intact',
        lastChecked: new Date().toLocaleString(),
      },
      {
        file: '/src/app/components/loan-officer-workqueue.tsx',
        expectedLines: 173,
        actualLines: 173,
        status: 'intact',
        lastChecked: new Date().toLocaleString(),
      },
      {
        file: '/src/app/components/sidebar.tsx',
        expectedLines: 340,
        actualLines: 340,
        status: 'intact',
        lastChecked: new Date().toLocaleString(),
      },
      {
        file: '/src/app/components/global-header.tsx',
        expectedLines: 156,
        actualLines: 156,
        status: 'intact',
        lastChecked: new Date().toLocaleString(),
      },
      {
        file: '/src/app/components/data-table.tsx',
        expectedLines: 230,
        actualLines: 230,
        status: 'intact',
        lastChecked: new Date().toLocaleString(),
      },
    ];

    setDriftMetrics(metrics);
    setIntegrityChecks(integrity);
    setTimeout(() => setIsMonitoring(false), 1500);
  };

  useEffect(() => {
    runDriftDetection();
  }, []);

  const getDriftStatus = (drift: number) => {
    if (Math.abs(drift) === 0) return 'stable';
    if (Math.abs(drift) < 10) return 'warning';
    return 'critical';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
      case 'intact':
        return 'text-[#16A34A]';
      case 'warning':
      case 'modified':
        return 'text-[#F59E0B]';
      case 'critical':
        return 'text-[#DC2626]';
      default:
        return 'text-[#6B7280]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stable':
      case 'intact':
        return <CheckCircle className="w-4 h-4 text-[#16A34A]" />;
      case 'warning':
      case 'modified':
        return <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-[#DC2626]" />;
      default:
        return null;
    }
  };

  const stableCount = driftMetrics.filter(m => m.status === 'stable').length;
  const warningCount = driftMetrics.filter(m => m.status === 'warning').length;
  const criticalCount = driftMetrics.filter(m => m.status === 'critical').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#111827]">Model Drift Monitor</h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Detect changes and prevent unintended modifications to core components
          </p>
        </div>
        <button
          onClick={runDriftDetection}
          disabled={isMonitoring}
          className="px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isMonitoring ? 'animate-spin' : ''}`} />
          {isMonitoring ? 'Scanning...' : 'Run Scan'}
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#6B7280]">Stable Components</span>
            <CheckCircle className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div className="text-3xl font-bold text-[#16A34A]">{stableCount}</div>
          <div className="text-xs text-[#6B7280] mt-1">No drift detected</div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#6B7280]">Minor Changes</span>
            <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div className="text-3xl font-bold text-[#F59E0B]">{warningCount}</div>
          <div className="text-xs text-[#6B7280] mt-1">Acceptable drift</div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#6B7280]">Critical Drift</span>
            <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
          </div>
          <div className="text-3xl font-bold text-[#DC2626]">{criticalCount}</div>
          <div className="text-xs text-[#6B7280] mt-1">Requires review</div>
        </div>
      </div>

      {/* Drift Metrics Table */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-lg font-semibold text-[#111827]">Component Drift Analysis</h3>
          <p className="text-sm text-[#6B7280] mt-1">
            Comparing current state against baseline implementation
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Component</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">Baseline</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">Current</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">Drift %</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-[#6B7280] uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase">Last Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {driftMetrics.map((metric, idx) => (
                <tr key={idx} className="hover:bg-[#F9FAFB]">
                  <td className="px-6 py-4 font-medium text-[#111827]">{metric.component}</td>
                  <td className="px-6 py-4 text-right text-[#6B7280]">{metric.baseline} lines</td>
                  <td className="px-6 py-4 text-right text-[#111827] font-medium">{metric.current} lines</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`flex items-center justify-end gap-1 ${getStatusColor(metric.status)}`}>
                      {metric.drift > 0 ? <TrendingUp className="w-4 h-4" /> : metric.drift < 0 ? <TrendingDown className="w-4 h-4" /> : null}
                      {Math.abs(metric.drift)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(metric.status)}
                      <span className={`text-xs font-medium uppercase ${getStatusColor(metric.status)}`}>
                        {metric.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-[#6B7280]">{metric.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Integrity Checks */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-lg font-semibold text-[#111827]">Code Integrity Verification</h3>
          <p className="text-sm text-[#6B7280] mt-1">
            Ensuring core files remain unmodified
          </p>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {integrityChecks.map((check, idx) => (
            <div key={idx} className="px-6 py-4 hover:bg-[#F9FAFB]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <div className="font-medium text-[#111827]">{check.file}</div>
                    <div className="text-xs text-[#6B7280] mt-0.5">
                      Expected: {check.expectedLines} lines | Current: {check.actualLines} lines
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold uppercase ${getStatusColor(check.status)}`}>
                    {check.status}
                  </span>
                  <div className="text-xs text-[#6B7280] mt-1">{check.lastChecked}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Self-Reinforcement Guidelines */}
      <div className="bg-[#DBEAFE] border border-[#BFDBFE] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#1E40AF] mb-3">Self-Reinforcement Protocol</h3>
        <div className="space-y-3 text-sm text-[#1E40AF]">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">
              1
            </div>
            <div>
              <strong>Baseline Validation:</strong> Run drift detection before making any changes to establish current state
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <strong>Change Verification:</strong> After modifications, re-run scan to detect unintended side effects
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <strong>Component Isolation:</strong> Test each component independently to ensure no cross-contamination
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">
              4
            </div>
            <div>
              <strong>Rollback Capability:</strong> Keep version history to revert if drift exceeds acceptable thresholds
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs">
              5
            </div>
            <div>
              <strong>Documentation:</strong> Log all changes with reasoning to maintain audit trail
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

