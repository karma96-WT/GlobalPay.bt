'use client';
import { useState } from 'react';
import { Stat } from '@/components/ui';
import { money } from '@/lib/data';
import { useMerchant } from '@/lib/merchant';

const bucket = (date: string, by: string) => {
  if (by === 'Monthly') return date.slice(0, 7);
  if (by === 'Daily') return date.slice(0, 10);
  const d = new Date(date.slice(0, 10));
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday of that week
  return 'Week of ' + d.toISOString().slice(0, 10);
};

/** Every figure here counts successful payments only. */
export default function Reports() {
  const { T } = useMerchant();
  const [by, setBy] = useState('Daily');
  const good = T.filter((t) => t[4] === 'Successful');
  const failed = T.filter((t) => t[4] === 'Failed').length;
  const total = good.reduce((a, t) => a + Number(t[2]), 0);
  const ym = new Date().toISOString().slice(0, 7);
  const month = good
    .filter((t) => String(t[1]).startsWith(ym))
    .reduce((a, t) => a + Number(t[2]), 0);
  const rate = good.length + failed ? Math.round((good.length / (good.length + failed)) * 100) : 0;

  const groups: Record<string, number> = {};
  good.forEach((t) => {
    const k = bucket(String(t[1]), by);
    groups[k] = (groups[k] || 0) + Number(t[2]);
  });
  const keys = Object.keys(groups).sort().reverse();
  const max = Math.max(1, ...Object.values(groups));
  const byProvider = ['RMA', 'BoB'].map((p) => [
    p,
    good.filter((t) => t[3] === p).reduce((a, t) => a + Number(t[2]), 0),
  ]);

  const csv = () => {
    const rows = [
      ['Transaction', 'Date', 'Amount (Nu.)', 'Provider', 'Invoice'],
      ...good.map((t) => [t[0], t[1], t[2], t[3], t[5] || '']),
    ];
    const url = URL.createObjectURL(
      new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'successful-transactions.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <>
      <div className="grid">
        <Stat n={money(total)} l="Total sales (successful payments only)" />
        <Stat n={money(month)} l="Sales this month" />
        <Stat n={good.length} l="Successful payments" />
        <Stat n={rate + '%'} l="Success rate (successful vs failed)" />
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="line" style={{ border: 0, padding: 0 }}>
          <div className="tabs" style={{ margin: 0 }}>
            {['Daily', 'Weekly', 'Monthly'].map((x) => (
              <button key={x} className={by === x ? 'on' : ''} onClick={() => setBy(x)}>
                {x}
              </button>
            ))}
          </div>
          <button className="alt" disabled={!good.length} onClick={csv}>
            Download CSV
          </button>
        </div>
        {keys.map((k) => (
          <div key={k} style={{ margin: '12px 0' }}>
            <div className="line" style={{ border: 0, padding: 0 }}>
              <span>{k}</span>
              <b>{money(groups[k])}</b>
            </div>
            <div className="bar">
              <i style={{ width: (groups[k] / max) * 100 + '%' }} />
            </div>
          </div>
        ))}
        {!keys.length && <p>No successful payments yet.</p>}
      </div>
      <div className="card">
        <h3>By provider (successful only)</h3>
        {byProvider.map(([p, v]) => (
          <div className="line" key={p as string}>
            <span>{p}</span>
            <b>{money(v as number)}</b>
          </div>
        ))}
      </div>
    </>
  );
}
