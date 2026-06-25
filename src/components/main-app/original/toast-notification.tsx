// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ToastNotificationProps {
  id: string;
  severity: 'high' | 'medium';
  title: string;
  message: string[];
  timestamp: string;
  duration?: number;
  onDismiss: (id: string) => void;
  onView?: () => void;
  onAcknowledge?: () => void;
}

export function ToastNotification({
  id,
  severity,
  title,
  message,
  timestamp,
  duration = 30000,
  onDismiss,
  onView,
  onAcknowledge,
}: ToastNotificationProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        onDismiss(id);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [id, duration, onDismiss]);

  return (
    <div
      className="w-[360px] bg-white rounded-lg overflow-hidden animate-in slide-in-from-right duration-200"
      style={{
        boxShadow: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
        borderLeft: `4px solid ${severity === 'high' ? '#DC2626' : '#F59E0B'}`,
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${severity === 'high' ? 'text-[#DC2626]' : 'text-[#F59E0B]'}`}>
              {severity === 'high' ? '🔴' : '🟡'} {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9CA3AF]">{timestamp}</span>
            <button
              onClick={() => onDismiss(id)}
              className="text-[#6B7280] hover:text-[#111827]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="border-t border-[#E5E7EB] pt-2 mb-3">
          {message.map((line, idx) => (
            <p key={idx} className="text-sm text-[#111827]">{line}</p>
          ))}
        </div>

        <div className="flex gap-2">
          {onView && (
            <button
              onClick={onView}
              className="px-3 py-1 text-xs font-medium text-[#2563EB] hover:underline"
            >
              View Loan
            </button>
          )}
          {onAcknowledge && (
            <button
              onClick={onAcknowledge}
              className="px-3 py-1 text-xs font-medium text-[#6B7280] hover:text-[#111827]"
            >
              Acknowledge
            </button>
          )}
        </div>
      </div>

      <div className="h-1 bg-[#E5E7EB]">
        <div
          className="h-full transition-all duration-100"
          style={{
            width: `${progress}%`,
            backgroundColor: severity === 'high' ? '#2563EB' : '#F59E0B',
          }}
        />
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    severity: 'high' | 'medium';
    title: string;
    message: string[];
    timestamp: string;
  }>;
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const visibleToasts = toasts.slice(0, 3);
  const extraCount = toasts.length - 3;

  return (
    <div className="fixed top-20 right-4 z-[70] space-y-2">
      {visibleToasts.map((toast, idx) => (
        <div key={toast.id} style={{ animationDelay: `${idx * 50}ms` }}>
          <ToastNotification
            {...toast}
            onDismiss={onDismiss}
            onView={() => console.log('View:', toast.id)}
            onAcknowledge={() => {
              console.log('Acknowledged:', toast.id);
              onDismiss(toast.id);
            }}
          />
        </div>
      ))}
      {extraCount > 0 && (
        <div className="w-[360px] p-3 bg-white rounded-lg border-l-4 border-[#6B7280] text-center text-sm text-[#6B7280]">
          +{extraCount} more notifications
        </div>
      )}
    </div>
  );
}

