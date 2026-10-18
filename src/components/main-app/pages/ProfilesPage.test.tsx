import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Profile } from '../../../apis/types';
import { ProfilesPage } from './ProfilesPage';

vi.mock('../../../apis/profiles', () => ({
  profilesApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getModules: vi.fn(),
    createModuleMappings: vi.fn(),
  },
}));

vi.mock('../../../apis/modules', () => ({
  modulesApi: {
    list: vi.fn(),
  },
}));

import { profilesApi } from '../../../apis/profiles';

const profiles: Profile[] = [
  { id: 1, name: 'Admin', api_label: 'admin', is_internal: false },
  { id: 2, name: 'Support', api_label: 'support', is_internal: true },
  { id: 3, name: 'Customer', api_label: 'customer', is_internal: false },
  { id: 4, name: 'Employee', api_label: 'employee', is_internal: false },
  { id: 5, name: 'Branch Ops', api_label: 'branch_ops', is_internal: false },
];

afterEach(() => {
  cleanup();
  localStorage.clear();
});

beforeEach(() => {
  localStorage.clear();
  vi.mocked(profilesApi.list).mockResolvedValue({
    data: profiles,
    page: 1,
    per_page: 10,
    total_records: profiles.length,
  });
  vi.mocked(profilesApi.create).mockResolvedValue(profiles[4]);
});

describe('ProfilesPage for non-support users', () => {
  beforeEach(() => {
    localStorage.setItem('profile_api_label', 'admin');
  });

  it('hides profile type and always creates an external profile', async () => {
    render(<ProfilesPage />);

    expect(await screen.findByText('Branch Ops')).toBeInTheDocument();
    expect(screen.queryByText('Type')).not.toBeInTheDocument();
    expect(screen.queryByText('Internal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add Profile' }));
    expect(screen.queryByText('Profile Type')).not.toBeInTheDocument();
    expect(screen.queryByText('Internal (Employee)')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('e.g. Admin, Support, Customer'), {
      target: { value: 'Field Officer' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(profilesApi.create).toHaveBeenCalledWith({
        name: 'Field Officer',
        is_internal: false,
      });
    });
  });

  it('disables deletion of admin, support, customer, and employee profiles', async () => {
    render(<ProfilesPage />);
    expect(await screen.findByText('Branch Ops')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Delete Admin' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete Support' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete Customer' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete Employee' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete Branch Ops' })).toBeEnabled();
  });
});

describe('ProfilesPage for support users', () => {
  beforeEach(() => {
    localStorage.setItem('profile_api_label', 'support');
  });

  it('shows the type column and internal/external choice', async () => {
    render(<ProfilesPage />);
    expect(await screen.findByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Internal')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add Profile' }));
    expect(screen.getByText('Internal (Employee)')).toBeInTheDocument();
    expect(screen.getByText('External (Customer)')).toBeInTheDocument();
  });
});
