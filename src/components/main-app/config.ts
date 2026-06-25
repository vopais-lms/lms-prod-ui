import type { Metric, Route, RouteConfig } from './types';

export const PAGE_TITLES: Record<Route, string> = {
  '/executive': 'Executive Command Center',
  '/workqueue': 'Loan Officer Work Queue',
  '/portfolio': 'Portfolio View',
  '/branch': 'Branch Management',
  '/actions': 'Actions Management',
  '/loans': 'Loans',
  '/customers': 'Customers',
  '/applications': 'Applications',
  '/origination': 'Origination',
  '/disbursements': 'Disbursements',
  '/repayments': 'Repayments',
  '/collections': 'Collections',
  '/risk': 'Risk Management',
  '/flags': 'Flags',
  '/collateral': 'Collateral',
  '/accounting': 'Accounting',
  '/billing': 'Billing',
  '/profitability': 'Profitability',
  '/eod': 'End Of Day',
  '/regulatory': 'Regulatory',
  '/audit': 'Audit',
  '/boardpack': 'Board Pack',
  '/products': 'Products',
  '/workflows': 'Workflows',
  '/users': 'Users',
};

export const PAGE_METRICS: Record<Route, Metric[]> = {
  '/executive': [
    { label: 'Portfolio AUM', value: '₹84.2 Cr', tone: 'good' },
    { label: 'NPA Ratio', value: '2.3%', tone: 'warn' },
    { label: 'Collections Today', value: '₹42.6 L', tone: 'good' },
  ],
  '/workqueue': [
    { label: 'Open Cases', value: '47', tone: 'warn' },
    { label: 'SLA Breaches', value: '3', tone: 'bad' },
    { label: 'Resolved Today', value: '22', tone: 'good' },
  ],
  '/portfolio': [
    { label: 'Active Loans', value: '12,408' },
    { label: 'Avg Ticket Size', value: '₹2.85 L' },
    { label: '30+ DPD', value: '6.8%', tone: 'warn' },
  ],
  '/branch': [
    { label: 'Branches', value: '62' },
    { label: 'Top Performing', value: 'Jaipur', tone: 'good' },
    { label: 'Need Attention', value: '4', tone: 'warn' },
  ],
  '/actions': [
    { label: 'Pending Actions', value: '31', tone: 'warn' },
    { label: 'Completed Today', value: '18', tone: 'good' },
    { label: 'Escalations', value: '2', tone: 'bad' },
  ],
  '/loans': [{ label: 'Disbursed MTD', value: '₹17.4 Cr' }, { label: 'Rejected', value: '112' }, { label: 'In Review', value: '289' }],
  '/customers': [{ label: 'Total Customers', value: '31,822' }, { label: 'KYC Pending', value: '74', tone: 'warn' }, { label: 'Dormant', value: '403' }],
  '/applications': [{ label: 'New Today', value: '143' }, { label: 'Underwriting', value: '89' }, { label: 'Turnaround', value: '29h' }],
  '/origination': [{ label: 'Funnels Active', value: '8' }, { label: 'Conversion', value: '31.2%', tone: 'good' }, { label: 'Drop-off', value: '12.5%', tone: 'warn' }],
  '/disbursements': [{ label: 'Queued', value: '27' }, { label: 'Processed', value: '184', tone: 'good' }, { label: 'Failed', value: '5', tone: 'bad' }],
  '/repayments': [{ label: 'Due Today', value: '624' }, { label: 'Collected', value: '₹1.93 Cr', tone: 'good' }, { label: 'Missed', value: '51', tone: 'warn' }],
  '/collections': [{ label: 'Agents Online', value: '26' }, { label: 'Promises To Pay', value: '73' }, { label: 'Hard Delinquencies', value: '19', tone: 'bad' }],
  '/risk': [{ label: 'High Risk Accounts', value: '148', tone: 'bad' }, { label: 'Score Drift', value: '1.8%', tone: 'warn' }, { label: 'Rules Triggered', value: '56' }],
  '/flags': [{ label: 'Critical Flags', value: '9', tone: 'bad' }, { label: 'Medium Flags', value: '23', tone: 'warn' }, { label: 'Closed Flags', value: '41', tone: 'good' }],
  '/collateral': [{ label: 'Verified', value: '2,487', tone: 'good' }, { label: 'Revaluation Due', value: '147', tone: 'warn' }, { label: 'Disputes', value: '11', tone: 'bad' }],
  '/accounting': [{ label: 'Entries Posted', value: '2,903' }, { label: 'Mismatches', value: '7', tone: 'bad' }, { label: 'Recon Complete', value: '96.4%', tone: 'good' }],
  '/billing': [{ label: 'Invoices Generated', value: '1,204' }, { label: 'Overdue', value: '128', tone: 'warn' }, { label: 'Collections Rate', value: '89.6%', tone: 'good' }],
  '/profitability': [{ label: 'Net Margin', value: '18.7%', tone: 'good' }, { label: 'COF', value: '8.4%' }, { label: 'OpEx Ratio', value: '22.1%', tone: 'warn' }],
  '/eod': [{ label: 'Batches Pending', value: '3', tone: 'warn' }, { label: 'Last Run', value: '22:11' }, { label: 'Failures', value: '0', tone: 'good' }],
  '/regulatory': [{ label: 'Filings Due', value: '4', tone: 'warn' }, { label: 'Filed', value: '17', tone: 'good' }, { label: 'Exceptions', value: '1', tone: 'bad' }],
  '/audit': [{ label: 'Open Findings', value: '14', tone: 'warn' }, { label: 'Critical', value: '2', tone: 'bad' }, { label: 'Closed This Quarter', value: '38', tone: 'good' }],
  '/boardpack': [{ label: 'Reports Ready', value: '12' }, { label: 'Awaiting Sign-off', value: '3', tone: 'warn' }, { label: 'Shared', value: '9', tone: 'good' }],
  '/products': [{ label: 'Active Products', value: '11' }, { label: 'At Risk Products', value: '2', tone: 'warn' }, { label: 'New Launches', value: '1', tone: 'good' }],
  '/workflows': [{ label: 'Automations Running', value: '57', tone: 'good' }, { label: 'Paused', value: '6', tone: 'warn' }, { label: 'Errored', value: '1', tone: 'bad' }],
  '/users': [{ label: 'Active Users', value: '214' }, { label: 'MFA Enabled', value: '93.4%', tone: 'good' }, { label: 'Locked Accounts', value: '5', tone: 'warn' }],
};

export function toneClasses(tone: Metric['tone']) {
  if (tone === 'good') return 'text-green-700 bg-green-50';
  if (tone === 'warn') return 'text-amber-700 bg-amber-50';
  if (tone === 'bad') return 'text-red-700 bg-red-50';
  return 'text-[#111827] bg-[#F9FAFB]';
}

export function getRouteConfig(route: Route): RouteConfig {
  const shared = {
    actions: ['Export', 'Assign', 'Escalate'],
    pipeline: [
      { label: 'Queued', value: 26 },
      { label: 'In Progress', value: 54 },
      { label: 'Completed', value: 79 },
    ],
  };

  switch (route) {
    case '/workqueue':
      return {
        headline: 'Case Queue Prioritization',
        description: 'Focuses officers on SLA-sensitive and high-risk cases first.',
        actions: ['Open Case', 'Bulk Reassign', 'Mark Follow-up'],
        pipeline: [
          { label: 'Fresh', value: 33 },
          { label: 'Aging', value: 41 },
          { label: 'SLA Breach', value: 12 },
        ],
        table: {
          columns: ['Loan ID', 'Borrower', 'DPD', 'Amount', 'Status'],
          rows: [
            ['LN-12031', 'R. Singh', '62', '₹3.4L', 'Review'],
            ['LN-12058', 'M. Khan', '17', '₹1.2L', 'Call Back'],
            ['LN-12071', 'S. Nair', '89', '₹6.1L', 'Escalate'],
          ],
        },
      };
    case '/executive':
      return {
        headline: 'Portfolio Health Snapshot',
        description: 'Board-level indicators and critical exceptions at a glance.',
        actions: ['Generate Board Pack', 'Download KPI Deck', 'Open Audit Notes'],
        pipeline: [
          { label: 'Performing', value: 78 },
          { label: 'Watchlist', value: 15 },
          { label: 'Stressed', value: 7 },
        ],
        table: {
          columns: ['Region', 'AUM', 'Collection %', 'NPA %', 'Trend'],
          rows: [
            ['North', '₹24.8Cr', '93.2', '1.9', 'Up'],
            ['West', '₹18.1Cr', '91.4', '2.7', 'Flat'],
            ['South', '₹22.6Cr', '94.1', '2.1', 'Up'],
          ],
        },
      };
    case '/risk':
      return {
        headline: 'Risk Rule Surveillance',
        description: 'Tracks rule breaches, model drift, and exposure buckets.',
        actions: ['Open Rule Engine', 'Acknowledge Alerts', 'Create Mitigation'],
        pipeline: [
          { label: 'Low Risk', value: 64 },
          { label: 'Medium Risk', value: 24 },
          { label: 'High Risk', value: 12 },
        ],
        table: {
          columns: ['Rule', 'Triggered', 'Severity', 'Owner', 'ETA'],
          rows: [
            ['Income mismatch', '28', 'High', 'Risk Ops', '2h'],
            ['Geo anomaly', '11', 'Medium', 'Fraud Team', '6h'],
            ['Utilization spike', '17', 'Medium', 'Credit', '4h'],
          ],
        },
      };
    default:
      return {
        headline: `${PAGE_TITLES[route]} Workspace`,
        description: `Operational controls and summaries for ${PAGE_TITLES[route]}.`,
        actions: shared.actions,
        pipeline: shared.pipeline,
        table: {
          columns: ['Item', 'Owner', 'Priority', 'Updated', 'Status'],
          rows: [
            ['Batch A-14', 'Ops Team', 'High', '5m ago', 'Active'],
            ['Batch C-03', 'Controls', 'Medium', '18m ago', 'Review'],
            ['Batch R-08', 'Audit', 'Low', '41m ago', 'Closed'],
          ],
        },
      };
  }
}
