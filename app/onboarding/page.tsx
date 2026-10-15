'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/ui';
export default function Onb() {
  const [U, setU] = useState<any>({ stage: 'new', name: 'there' });
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('gp_user') || 'null');
      if (u) setU(u);
    } catch {}
  }, []);
  const steps = [
    ['Create account', true],
    ['Verify email and mobile', true],
    ['Verify your business', U.stage !== 'new'],
    ['Choose providers and submit documents', U.stage !== 'new'],
    ['Provider approval, then go live', U.stage === 'merchant'],
  ];
  return (
    <>
      <Header user={U.name} />
      <div className="main" style={{ margin: '0 auto', maxWidth: 760 }}>
        <h2>Welcome, {U.name?.split(' ')[0]}</h2>
        <p style={{ fontSize: 18, color: 'var(--mut)' }}>
          Your account is created. To accept payments you need to verify your business and be
          approved by a payment provider. Until then you cannot receive payments.
        </p>
        <div className="card hov">
          <h3>Become a merchant</h3>
          <p>
            Verify your business and switch to a live account. It takes about 10 minutes and you can
            reuse the same documents for every provider.
          </p>
          <p>
            {U.stage === 'new' ? (
              <Link className="btn" href="/onboarding/business">
                Verify your business
              </Link>
            ) : (
              <Link className="btn" href="/merchant/dashboard">
                Go to merchant dashboard
              </Link>
            )}
          </p>
        </div>
        <div className="card">
          <h3>Your progress</h3>
          {steps.map(([t, d]) => (
            <div className="line" key={t as string}>
              <span>
                {d ? '✔' : '○'} {t}
              </span>
              <span className={'badge ' + (d ? 'b-ok' : '')}>{d ? 'Done' : 'To do'}</span>
            </div>
          ))}
        </div>
        <small>You can leave at any time. Your progress is saved to your account.</small>
      </div>
      <Footer />
    </>
  );
}
