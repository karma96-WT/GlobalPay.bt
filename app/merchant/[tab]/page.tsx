'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Shell, Stat, Profile } from '@/components/ui';
import Notes from '@/components/Notes';
import { DocRow } from '@/components/Docs';
import Applications from '@/components/merchant/Applications';
import Providers from '@/components/merchant/Providers';
import Receive from '@/components/merchant/Receive';
import Invoices from '@/components/merchant/Invoices';
import Transactions from '@/components/merchant/Transactions';
import Reports from '@/components/merchant/Reports';
import Support from '@/components/merchant/Support';
import Settings from '@/components/merchant/Settings';
import { docsOf, useMerchant } from '@/lib/merchant';
import { money } from '@/lib/data';

const MENU = [
  ['dashboard', 'Dashboard'],
  ['applications', 'My Applications'],
  ['providers', 'Payment Providers'],
  ['receive', 'Receive Payments'],
  ['invoices', 'Invoices'],
  ['transactions', 'Transactions'],
  ['reports', 'Reports'],
  ['documents', 'Documents'],
  ['notifications', 'Notifications'],
  ['support', 'Support'],
  ['settings', 'Settings'],
  ['profile', 'Profile'],
];

function Dashboard() {
  const { T, mine, ok } = useMerchant();
  const ym = new Date().toISOString().slice(0, 7);
  const good = T.filter((t) => t[4] === 'Successful');
  const month = good.filter((t) => String(t[1]).startsWith(ym));
  const volume = month.reduce((a, t) => a + Number(t[2]), 0);
  const live = mine.some((a) => a.status === 'Approved');
  const count = (s: string) => T.filter((t) => t[4] === s).length;
  return (
    <>
      {!live && (
        <div className="note warn">
          <b>Your account is not live yet.</b> You can receive payments after a provider approves
          your application.{' '}
          <Link href="/merchant/applications">
            <u>Track applications</u>
          </Link>
        </div>
      )}
      <div className="grid">
        <Stat
          n={money(volume)}
          l={`Volume this month · ${month.length} successful payment${month.length === 1 ? '' : 's'}`}
        />
        <Stat n={T.length} l="Total transactions (count)" />
        <Stat n={good.length} l="Successful" />
        <Stat n={count('Failed')} l="Failed" />
        <Stat n={`${count('Pending')} / ${count('Refunded')}`} l="Pending / Refunded" />
        <Stat n={`${(ok.rma ? 1 : 0) + (ok.bob ? 1 : 0)} of 2`} l="Providers live" />
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h3>Recent activity</h3>
        <p>Application updates and payments appear under Notifications.</p>
      </div>
    </>
  );
}

function Documents() {
  const { mine } = useMerchant();
  return (
    <>
      {mine.map((a) => (
        <div className="card" key={a.id}>
          <h3>
            {a.prov} · {a.id}
          </h3>
          {a.route === 'cred' ? (
            <p>
              <small>Submitted with existing credentials. No documents.</small>
            </p>
          ) : (
            docsOf(a).map((d: any) => <DocRow key={d.n} appId={a.id} doc={d} />)
          )}
        </div>
      ))}
      {!mine.length && <div className="card">No documents yet.</div>}
    </>
  );
}

export default function MerchantPage() {
  const { tab } = useParams() as { tab: string };
  const router = useRouter();
  const { U } = useMerchant();
  useEffect(() => {
    if (U.stage === 'new') router.replace('/onboarding');
  }, [U.stage, router]);

  if (tab === 'profile') {
    return (
      <Shell role="Merchant" menu={MENU} name={U.name}>
        <Profile role="Merchant" name={U.name} email={U.email} />
      </Shell>
    );
  }
  return (
    <Shell role="Merchant" menu={MENU} name={U.name}>
      <h2>{MENU.find((m) => m[0] === tab)?.[1]}</h2>
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'applications' && <Applications />}
      {tab === 'providers' && <Providers />}
      {tab === 'receive' && <Receive />}
      {tab === 'invoices' && <Invoices />}
      {tab === 'transactions' && <Transactions />}
      {tab === 'reports' && <Reports />}
      {tab === 'documents' && <Documents />}
      {tab === 'notifications' && <Notes to="merchant" biz={U.business} />}
      {tab === 'support' && <Support />}
      {tab === 'settings' && <Settings />}
    </Shell>
  );
}
