export type Route = (typeof ROUTES)[number];

export type Metric = {
  label: string;
  value: string;
  tone?: 'neutral' | 'good' | 'warn' | 'bad';
};

export type RouteConfig = {
  headline: string;
  description: string;
  actions: string[];
  pipeline: Array<{ label: string; value: number }>;
  table: {
    columns: string[];
    rows: string[][];
  };
};

export const ROUTES = [
  '/executive',
  '/workqueue',
  '/portfolio',
  '/branch',
  '/actions',
  '/loans',
  '/customers',
  '/applications',
  '/origination',
  '/disbursements',
  '/repayments',
  '/collections',
  '/risk',
  '/flags',
  '/collateral',
  '/accounting',
  '/billing',
  '/profitability',
  '/eod',
  '/regulatory',
  '/audit',
  '/boardpack',
  '/products',
  '/workflows',
  '/users',
] as const;
