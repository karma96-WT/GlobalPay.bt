'use client';
import { useState } from 'react';
import { Sw, Toast, useToast } from '@/components/ui';
import { useMerchant } from '@/lib/merchant';
import { pushNote } from '@/lib/notify';
import { useStore } from '@/lib/store';
import Team from './Team';

const TABS = ['Business', 'Team', 'Notifications', 'Developers', 'Plan & billing', 'Danger zone'];
const PLANS = [
  ['Basic', 'Free', '1.0%', 'Nu 500,000', '2 seats'],
  ['Gold', 'Nu 1,500', '0.5%', 'Nu 5,000,000', '10 seats'],
  ['Premium', 'Nu 4,900', '0.25%', 'Unlimited', 'Unlimited seats'],
];

export default function Settings() {
  const { U } = useMerchant();
  const [tab, setTab] = useState('Business');
  const [msg, toast] = useToast();
  const [plan, setPlan] = useStore<string>('gp_plan', 'Basic');
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    a: true,
    b: true,
    c: true,
    d: false,
  });
  const [key, setKey] = useState('');

  const rollKey = () => {
    const k =
      'gp_test_' +
      Math.random().toString(36).slice(2, 10) +
      Math.random().toString(36).slice(2, 10);
    setKey(k);
    pushNote({
      to: 'merchant',
      biz: U.business,
      cat: 'Security',
      title: 'API key rolled',
      body: 'A new test key was created. The old key stopped working.',
    });
  };

  return (
    <div className="split" style={{ gridTemplateColumns: '210px 1fr' }}>
      <div>
        {TABS.map((x) => (
          <div key={x} className={'msg' + (tab === x ? ' on' : '')} onClick={() => setTab(x)}>
            <b>{x}</b>
          </div>
        ))}
      </div>
      <div className="card">
        {tab === 'Business' && (
          <>
            <h3>Business profile</h3>
            <div className="row">
              <div>
                <label>Registered name (locked after verification)</label>
                <input value={U.business} readOnly />
              </div>
              <div>
                <label>Trading name</label>
                <input defaultValue={U.business} />
              </div>
            </div>
            <div className="row">
              <div>
                <label>Business address</label>
                <input defaultValue={U.addr} />
              </div>
              <div>
                <label>Website URL (optional)</label>
                <input placeholder="https://" />
              </div>
            </div>
            <div className="row">
              <div>
                <label>Support email shown to customers</label>
                <input defaultValue={U.bemail || U.email} />
              </div>
              <div>
                <label>Business category</label>
                <select>
                  <option>Tourism &amp; travel</option>
                  <option>Retail</option>
                  <option>Services</option>
                </select>
              </div>
            </div>
            <p>
              <button
                onClick={() => {
                  pushNote({
                    to: 'merchant',
                    biz: U.business,
                    cat: 'Settings',
                    title: 'Business profile updated',
                    body: 'Your business details were saved.',
                  });
                  toast('Saved. Locked fields need an operator to change.');
                }}
              >
                Save
              </button>
            </p>
          </>
        )}
        {tab === 'Team' && <Team />}
        {tab === 'Notifications' && (
          <>
            <h3>Notify me about</h3>
            {[
              ['a', 'Application updates'],
              ['b', 'Payment confirmations'],
              ['c', 'Failed transactions'],
              ['d', 'Marketing and product news'],
            ].map(([k, l]) => (
              <div className="line" key={k}>
                <span>{l}</span>
                <Sw on={prefs[k]} set={(v) => setPrefs({ ...prefs, [k]: v })} />
              </div>
            ))}
          </>
        )}
        {tab === 'Developers' && (
          <>
            <h3>API keys and webhooks</h3>
            <label>Test secret key</label>
            <input readOnly value={key || 'gp_test_••••••••••••••••'} />
            <small>
              A key is shown once when created. Only a hash is stored, so it cannot be shown again,
              only rolled.
            </small>
            <label>Webhook endpoint</label>
            <input defaultValue="https://druktrails.bt/api/gp-webhook" />
            <p style={{ display: 'flex', gap: 8 }}>
              <button onClick={rollKey}>Roll key</button>
              {key && (
                <button className="alt" onClick={() => navigator.clipboard?.writeText(key)}>
                  Copy key
                </button>
              )}
            </p>
          </>
        )}
        {tab === 'Plan & billing' && (
          <>
            <h3>Plan</h3>
            <div className="grid">
              {PLANS.map(([n, fee, bps, vol, seats]) => (
                <div
                  key={n}
                  className="card hov"
                  style={{ borderColor: plan === n ? 'var(--forest)' : '', borderWidth: 2 }}
                >
                  <b>{n}</b>
                  <h3>
                    {fee}
                    <small>/mo</small>
                  </h3>
                  <small>
                    {bps} per payment
                    <br />
                    Volume: {vol}
                    <br />
                    {seats}
                  </small>
                  <p>
                    <button
                      className={plan === n ? 'alt' : ''}
                      onClick={() => {
                        setPlan(n);
                        pushNote({
                          to: 'merchant',
                          biz: U.business,
                          cat: 'Billing',
                          title: `Plan changed to ${n}`,
                          body: 'Fees are billed monthly and never deducted from payments.',
                        });
                        toast('Plan set to ' + n);
                      }}
                    >
                      {plan === n ? 'Current' : 'Switch'}
                    </button>
                  </p>
                </div>
              ))}
            </div>
            <small>
              Indicative figures. Fees are billed monthly, never deducted from payments.
            </small>
          </>
        )}
        {tab === 'Danger zone' && (
          <>
            <h3>Danger zone</h3>
            <p>
              Pausing stops all payment links. Closing removes your account after outstanding fees
              are settled.
            </p>
            <button className="alt" onClick={() => toast('Account paused (prototype)')}>
              Pause account
            </button>{' '}
            <button
              className="out"
              onClick={() => confirm('Close account?') && toast('Request submitted')}
            >
              Close account
            </button>
          </>
        )}
      </div>
      <Toast m={msg} />
    </div>
  );
}
