// apps/web/components/upgrade/UpgradeModal.tsx
// Trigger-based upgrade modals: watermark export, 4th project, 1080p selection.
// Impression is logged only when the user has given POPIA analytics consent.

import { useState, useCallback } from 'react';

export type UpgradeModalVariant = 'watermark' | 'project-limit' | 'quality-lock';

export interface UpgradeModalProps {
  variant: UpgradeModalVariant;
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  onDismiss?: () => void;
}

const PRO_PRICE_ZAR = 149;

interface ModalCopy {
  title: string;
  body: string;
  cta: string;
  unlocks: string[];
}

const COPY: Record<UpgradeModalVariant, ModalCopy> = {
  watermark: {
    title: 'Remove the watermark',
    body: 'Free exports carry a watermark. Upgrade to Pro for clean, watermark-free video and image exports.',
    cta: `Upgrade to Pro — R${PRO_PRICE_ZAR}/month`,
    unlocks: ['Watermark-free exports', '1080p export', 'Unlimited projects'],
  },
  'project-limit': {
    title: 'You have reached the free project limit',
    body: 'Free accounts can have up to 3 active projects. Upgrade to Pro for unlimited projects.',
    cta: `Upgrade to Pro — R${PRO_PRICE_ZAR}/month`,
    unlocks: ['Unlimited projects', '100 assets per project', 'Priority ticketing'],
  },
  'quality-lock': {
    title: '1080p export requires Pro',
    body: 'Free exports are limited to 720p. Upgrade to Pro for 1080p export quality.',
    cta: `Upgrade to Pro — R${PRO_PRICE_ZAR}/month`,
    unlocks: ['1080p export', 'Watermark-free exports', 'Unlimited projects'],
  },
};

export function UpgradeModal({ variant, open, onClose, onUpgrade, onDismiss }: UpgradeModalProps) {
  const [impressionLogged, setImpressionLogged] = useState(false);

  const logImpression = useCallback(() => {
    if (impressionLogged) return;
    // Integration point: log the trigger impression to first-party analytics only
    // when the user has given POPIA analytics consent (see components/consent/PopiaOptIn).
    setImpressionLogged(true);
  }, [impressionLogged]);

  if (!open) return null;

  const copy = COPY[variant];

  return (
    <dialog className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-lg font-semibold">{copy.title}</h2>
        <p className="mt-2 text-sm text-gray-600">{copy.body}</p>
        <ul className="mt-4 text-sm text-gray-700 list-disc list-inside space-y-1">
          {copy.unlocks.map((u, i) => (
            <li key={i}>{u}</li>
          ))}
        </ul>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            className="flex-1 rounded bg-blue-600 px-4 py-2 text-white font-medium"
            onClick={() => {
              logImpression();
              onUpgrade();
            }}
          >
            {copy.cta}
          </button>
          <button
            type="button"
            className="flex-1 rounded border border-gray-300 px-4 py-2 text-gray-700 font-medium"
            onClick={() => {
              logImpression();
              onDismiss?.();
              onClose();
            }}
          >
            Keep free
          </button>
        </div>
        <p className="mt-4 text-xs text-gray-400 text-center">
          Dismissing records a trigger impression for analytics. You can upgrade from Settings anytime.
        </p>
      </div>
    </dialog>
  );
}
