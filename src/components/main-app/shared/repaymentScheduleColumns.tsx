// @ts-nocheck
import type { RepaymentSchedule } from '../../../apis/types';
import { StatusBadge } from './StatusBadge';

function formatMoney(value: number | string | undefined): string {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return '—';
  }
  return `₹${num.toLocaleString()}`;
}

function formatDateTime(value: string | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

export const repaymentScheduleTableColumns = [
  { key: 'id', label: 'ID' },
  {
    key: 'repayment_due_date',
    label: 'Due date',
    render: (item: RepaymentSchedule) => formatDateTime(item.repayment_due_date),
  },
  {
    key: 'repayment_amount',
    label: 'EMI amount',
    render: (item: RepaymentSchedule) => formatMoney(item.repayment_amount),
  },
  {
    key: 'principal_breakup',
    label: 'Principal',
    render: (item: RepaymentSchedule) => formatMoney(item.principal_breakup),
  },
  {
    key: 'interest_breakup',
    label: 'Interest',
    render: (item: RepaymentSchedule) => formatMoney(item.interest_breakup),
  },
  {
    key: 'bpi_breakup',
    label: 'BPI',
    render: (item: RepaymentSchedule) => formatMoney(item.bpi_breakup),
  },
  { key: 'type_of_repayment', label: 'Type' },
  {
    key: 'status',
    label: 'Status',
    render: (item: RepaymentSchedule) => (
      <StatusBadge
        status={item.status ? 'approved' : 'pending'}
        label={item.status ? 'Paid' : 'Unpaid'}
      />
    ),
  },
  {
    key: 'created_at',
    label: 'Created',
    render: (item: RepaymentSchedule) => formatDateTime(item.created_at),
  },
  {
    key: 'updated_at',
    label: 'Updated',
    render: (item: RepaymentSchedule) => formatDateTime(item.updated_at),
  },
];
