// apps/web/components/consent/PopiaOptIn.tsx
// POPIA-compliant opt-in for analytics and events capture (first-party audience data).

import { useState } from 'react';

export const CONSENT_VERSION = '1.0';

export interface ConsentRecord {
  analytics: boolean;
  marketing: boolean;
  version: string;
  capturedAt: string;
}

export interface PopiaOptInProps {
  onConsent: (record: ConsentRecord & { ipAddress?: string }) => void;
}

export function PopiaOptIn({ onConsent }: PopiaOptInProps) {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const record: ConsentRecord & { ipAddress?: string } = {
      analytics,
      marketing,
      version: CONSENT_VERSION,
      capturedAt: new Date().toISOString(),
    };
    // Integration point: send record + IP to /api/consent (or your first-party data store).
    onConsent(record);
    setSaved(true);
  };

  return (
    <section aria-labelledby="popia-title" className="p-4 border rounded-lg bg-gray-50">
      {saved ? (
        <div>
          <p>Preferences saved. You can withdraw analytics consent in Settings at any time.</p>
        </div>
      ) : (
        <>
          <h2 id="popia-title" className="text-sm font-semibold">
            Help us improve the editor
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            We capture usage and analytics events to improve the photo/video editor. This is optional
            under POPIA and does not block any free feature. Marketing consent is separate.
          </p>
          <label className="flex items-start gap-2 mt-3 text-xs">
            <input
              type="checkbox"
              checked={analytics}
              onChange={e => setAnalytics(e.target.checked)}
            />
            <span>I consent to analytics and events capture</span>
          </label>
          <label className="flex items-start gap-2 mt-2 text-xs">
            <input
              type="checkbox"
              checked={marketing}
              onChange={e => setMarketing(e.target.checked)}
            />
            <span>I consent to marketing communications</span>
          </label>
          <p className="text-xs text-gray-500 mt-2">
            Read our <a href="/privacy" className="underline">privacy policy</a>. Consent version{' '}
            {CONSENT_VERSION}.
          </p>
          <button
            type="button"
            className="mt-3 rounded bg-blue-600 px-3 py-1.5 text-xs text-white"
            onClick={handleSave}
          >
            Save preferences
          </button>
        </>
      )}
    </section>
  );
}
