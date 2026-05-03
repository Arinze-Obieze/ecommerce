'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { FiShield, FiAlertCircle, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

// ── helpers ──────────────────────────────────────────────────────────────────

function OtpInput({ value, onChange, disabled }) {
  const inputs = useRef([]);

  function handleChange(i, e) {
    const ch = e.target.value.replace(/\D/g, '').slice(-1);
    const next = value.split('');
    next[i] = ch;
    onChange(next.join(''));
    if (ch && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) { onChange(text); inputs.current[5]?.focus(); }
    e.preventDefault();
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          className="w-11 h-13 text-center text-xl font-bold rounded-lg border-2 outline-none transition-all
            border-border focus:border-primary bg-white text-gray-900
            disabled:opacity-40"
          style={{ height: 52 }}
        />
      ))}
    </div>
  );
}

// ── challenge mode ────────────────────────────────────────────────────────────

function ChallengeView() {
  const router = useRouter();
  const supabase = createClient();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [challengeId, setChallengeId] = useState(null);
  const [factorId, setFactorId] = useState(null);

  const initChallenge = useCallback(async () => {
    setError('');
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totp = factors?.totp?.[0];
    if (!totp) { setError('No authenticator found. Contact support.'); return; }
    setFactorId(totp.id);
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
    if (cErr) { setError(cErr.message); return; }
    setChallengeId(challenge.id);
  }, [supabase]);

  useEffect(() => { initChallenge(); }, [initChallenge]);

  async function handleVerify() {
    if (code.length !== 6 || !factorId || !challengeId) return;
    setLoading(true);
    setError('');
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    setLoading(false);
    if (vErr) { setError('Incorrect code. Please try again.'); setCode(''); return; }
    router.refresh();
  }

  useEffect(() => { if (code.length === 6) handleVerify(); }, [code]);

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(46,100,23,.12)', border: '1px solid rgba(46,100,23,.2)' }}>
          <FiShield className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Two-factor authentication</h2>
        <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code from your authenticator app</p>
      </div>

      <OtpInput value={code} onChange={setCode} disabled={loading} />

      {error && (
        <div className="flex items-center gap-2 justify-center text-red-600 text-sm">
          <FiAlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={handleVerify}
        disabled={code.length !== 6 || loading || !challengeId}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        style={{ background: 'var(--color-primary)' }}
      >
        {loading ? 'Verifying…' : 'Verify'}
      </button>

      <button onClick={() => { setCode(''); initChallenge(); }}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1 mx-auto">
        <FiRefreshCw className="w-3 h-3" /> Refresh code
      </button>
    </div>
  );
}

// ── enroll mode ───────────────────────────────────────────────────────────────

function EnrollView({ confirmUrl }) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState('init'); // init | scan | verify | done
  const [factorId, setFactorId] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function startEnroll() {
    setLoading(true);
    setError('');

    // Clean up any existing unverified TOTP factors first
    const { data: existing } = await supabase.auth.mfa.listFactors();
    for (const f of existing?.totp || []) {
      if (f.status === 'unverified') {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
    }

    const { data, error: eErr } = await supabase.auth.mfa.enroll({ factorType: 'totp', issuer: 'ZOVA' });
    setLoading(false);
    if (eErr) { setError(eErr.message); return; }
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setStep('scan');
  }

  async function handleVerify() {
    if (code.length !== 6 || !factorId) return;
    setLoading(true);
    setError('');
    const { error: vErr } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    if (vErr) {
      setLoading(false);
      setError('Incorrect code. Please try again.');
      setCode('');
      return;
    }
    // Persist enrollment in our DB
    const res = await fetch(confirmUrl, { method: 'POST' });
    setLoading(false);
    if (!res.ok) { setError('Setup succeeded but we could not save the record. Please refresh.'); return; }
    setStep('done');
  }

  useEffect(() => { if (code.length === 6 && step === 'scan') handleVerify(); }, [code]);

  if (step === 'done') {
    return (
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-green-50 border border-green-200">
            <FiCheckCircle className="w-7 h-7 text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Two-factor authentication enabled</h2>
        <p className="text-sm text-gray-500">Your account is now protected with TOTP. You will be asked for a code on every login.</p>
        <button onClick={() => router.refresh()}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'var(--color-primary)' }}>
          Continue
        </button>
      </div>
    );
  }

  if (step === 'init') {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(46,100,23,.12)', border: '1px solid rgba(46,100,23,.2)' }}>
            <FiShield className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Set up two-factor authentication</h2>
          <p className="text-sm text-gray-500 mt-2">
            Your account requires 2FA. You will need an authenticator app such as Google Authenticator or Authy.
          </p>
        </div>
        {error && (
          <div className="flex items-center gap-2 justify-center text-red-600 text-sm">
            <FiAlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}
        <button onClick={startEnroll} disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: 'var(--color-primary)' }}>
          {loading ? 'Preparing…' : 'Begin setup'}
        </button>
      </div>
    );
  }

  // step === 'scan'
  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Scan QR code</h2>
        <p className="text-sm text-gray-500 mt-1">Open your authenticator app and scan the code below</p>
      </div>

      {qrCode && (
        <div className="flex justify-center">
          <img src={qrCode} alt="TOTP QR code" className="w-44 h-44 rounded-xl border border-border" />
        </div>
      )}

      <div className="rounded-lg bg-gray-50 border border-border px-3 py-2 text-center">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Manual entry key</p>
        <p className="font-mono text-sm font-semibold text-gray-800 break-all select-all">{secret}</p>
      </div>

      <div>
        <p className="text-sm text-center text-gray-500 mb-3">Then enter the 6-digit code from your app</p>
        <OtpInput value={code} onChange={setCode} disabled={loading} />
      </div>

      {error && (
        <div className="flex items-center gap-2 justify-center text-red-600 text-sm">
          <FiAlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <button onClick={handleVerify}
        disabled={code.length !== 6 || loading}
        className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
        style={{ background: 'var(--color-primary)' }}>
        {loading ? 'Verifying…' : 'Verify & activate'}
      </button>
    </div>
  );
}

// ── gate wrapper ──────────────────────────────────────────────────────────────

export default function MfaGate({ mode, confirmUrl, children }) {
  // mode: 'challenge' | 'enroll' | null (no gate needed)
  if (!mode) return children;

  return (
    <>
      {/* Blur the underlying page */}
      <div className="pointer-events-none select-none" style={{ filter: 'blur(4px)', opacity: 0.3 }} aria-hidden>
        {children}
      </div>

      {/* Gate overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}>
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 border border-border">
          {mode === 'challenge'
            ? <ChallengeView />
            : <EnrollView confirmUrl={confirmUrl} />
          }
        </div>
      </div>
    </>
  );
}
