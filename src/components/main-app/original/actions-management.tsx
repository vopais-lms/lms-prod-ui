// @ts-nocheck
import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, User, Calendar, Tag } from 'lucide-react';
import { StatusPill } from './status-pill';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo: string;
  dueDate: string;
  loanId?: string;
  category: 'collection' | 'disbursement' | 'documentation' | 'verification' | 'follow_up';
}

const tasks: Task[] = [
  {
    id: 'T001',
    title: 'Follow-up on EMI Bounce',
    description: 'Contact customer regarding 3rd consecutive EMI bounce. Schedule visit if needed.',
    priority: 'critical',
    status: 'overdue',
    assignedTo: 'Rajesh K.',
    dueDate: '2026-02-21',
    loanId: 'LN-10234',
    category: 'collection',
  },
  {
    id: 'T002',
    title: 'Property Valuation Report',
    description: 'Review and approve property valuation report for new home loan application.',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'Priya Singh',
    dueDate: '2026-02-24',
    loanId: 'LN-10567',
    category: 'verification',
  },
  {
    id: 'T003',
    title: 'Disbursement Approval',
    description: 'Final approval and disbursement for business loan after document verification.',
    priority: 'high',
    status: 'pending',
    assignedTo: 'Amit Patel',
    dueDate: '2026-02-23',
    loanId: 'LN-10789',
    category: 'disbursement',
  },
  {
    id: 'T004',
    title: 'KYC Document Upload',
    description: 'Customer needs to upload updated Aadhaar and PAN documents.',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'Rajesh K.',
    dueDate: '2026-02-25',
    loanId: 'LN-10890',
    category: 'documentation',
  },
  {
    id: 'T005',
    title: 'Monthly Portfolio Review',
    description: 'Complete monthly review of all assigned loan accounts.',
    priority: 'medium',
    status: 'in_progress',
    assignedTo: 'Rajesh K.',
    dueDate: '2026-02-28',
    category: 'follow_up',
  },
  {
    id: 'T006',
    title: 'Customer Satisfaction Call',
    description: 'Follow-up call with recently disbursed customers for feedback.',
    priority: 'low',
    status: 'pending',
    assignedTo: 'Neha Sharma',
    dueDate: '2026-02-26',
    category: 'follow_up',
  },
  {
    id: 'T007',
    title: 'SMA-2 Account Review',
    description: 'Detailed review and action plan for accounts approaching NPA status.',
    priority: 'critical',
    status: 'pending',
    assignedTo: 'Rajesh K.',
    dueDate: '2026-02-23',
    loanId: 'LN-10456',
    category: 'collection',
  },
  {
    id: 'T008',
    title: 'Insurance Policy Verification',
    description: 'Verify insurance policy details and renewal status for vehicle loan.',
    priority: 'high',
    status: 'pending',
    assignedTo: 'Vikram Reddy',
    dueDate: '2026-02-24',
    loanId: 'LN-10345',
    category: 'verification',
  },
];

export function ActionsManagement() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'overdue'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | Task['category']>('all');

  const filteredTasks = tasks.filter(task => {
    if (selectedStatus !== 'all' && task.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-[#DC2626] bg-[#FEE2E2]';
      case 'high': return 'text-[#F59E0B] bg-[#FEF3C7]';
      case 'medium': return 'text-[#2563EB] bg-[#DBEAFE]';
      case 'low': return 'text-[#6B7280] bg-[#F3F4F6]';
      default: return 'text-[#6B7280] bg-[#F3F4F6]';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-[#16A34A] bg-[#D1FAE5]';
      case 'in_progress': return 'text-[#2563EB] bg-[#DBEAFE]';
      case 'pending': return 'text-[#F59E0B] bg-[#FEF3C7]';
      case 'overdue': return 'text-[#DC2626] bg-[#FEE2E2]';
      default: return 'text-[#6B7280] bg-[#F3F4F6]';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'collection': return '💰';
      case 'disbursement': return '📤';
      case 'documentation': return '📄';
      case 'verification': return '✓';
      case 'follow_up': return '📞';
      default: return '📋';
    }
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#111827]">Actions & Tasks</h2>
        <p className="text-sm text-[#6B7280] mt-1">
          Manage and track all pending actions and tasks
        </p>
      </div>

      {/* Task Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">PENDING</span>
            <Clock className="w-5 h-5 text-[#F59E0B]" />
          </div>
          <div className="text-3xl font-bold text-[#111827]">{pendingCount}</div>
          <div className="text-sm text-[#6B7280] mt-1">Tasks awaiting action</div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">IN PROGRESS</span>
            <AlertCircle className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="text-3xl font-bold text-[#111827]">{inProgressCount}</div>
          <div className="text-sm text-[#6B7280] mt-1">Currently being worked on</div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">OVERDUE</span>
            <AlertCircle className="w-5 h-5 text-[#DC2626]" />
          </div>
          <div className="text-3xl font-bold text-[#DC2626]">{overdueCount}</div>
          <div className="text-sm text-[#6B7280] mt-1">Require immediate attention</div>
        </div>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#6B7280]">COMPLETED</span>
            <CheckCircle className="w-5 h-5 text-[#16A34A]" />
          </div>
          <div className="text-3xl font-bold text-[#111827]">{completedCount}</div>
          <div className="text-sm text-[#6B7280] mt-1">This month</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="all">All Categories</option>
              <option value="collection">Collection</option>
              <option value="disbursement">Disbursement</option>
              <option value="documentation">Documentation</option>
              <option value="verification">Verification</option>
              <option value="follow_up">Follow-up</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-lg font-semibold text-[#111827]">
            Tasks ({filteredTasks.length})
          </h3>
        </div>

        <div className="divide-y divide-[#E5E7EB]">
          {filteredTasks.map((task) => (
            <div key={task.id} className="p-6 hover:bg-[#F9FAFB] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl">{getCategoryIcon(task.category)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-[#111827]">{task.title}</h4>
                      {task.loanId && (
                        <span className="text-xs font-medium text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded">
                          {task.loanId}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#6B7280] mb-3">{task.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {task.assignedTo}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {task.category.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end ml-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1.5 text-xs font-medium bg-[#2563EB] text-white rounded hover:bg-[#1D4ED8]">
                  Start Task
                </button>
                <button className="px-3 py-1.5 text-xs font-medium bg-white border border-[#E5E7EB] text-[#6B7280] rounded hover:bg-[#F9FAFB]">
                  View Details
                </button>
                <button className="px-3 py-1.5 text-xs font-medium bg-white border border-[#E5E7EB] text-[#6B7280] rounded hover:bg-[#F9FAFB]">
                  Reassign
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

