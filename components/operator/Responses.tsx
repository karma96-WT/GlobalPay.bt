'use client';
import { useState } from 'react';
import { Toast, useToast } from '@/components/ui';
import { apps, seedMpa } from '@/lib/data';
import { pushNote } from '@/lib/notify';
import { useStore } from '@/lib/store';

/**
 * The provider replies by email. The operator reads it here and records the
 * decision. An acceptance must carry the provider-issued beneficiary ID, which
 * can belong to one merchant only.
 */
export default function Responses() {
  const [list, setList] = useStore<any[]>('gp_apps', apps);
  const [mpa, setMpa] = useStore<any[]>('gp_mpa', seedMpa);
  const [msg, toast] = useToast();
  const [open, setOpen] = useState<{ id: string; kind: 'accept' | 'reject' } | null>(null);
  const [f, setF] = useState({
    benf: '',
    bank: '01',
    ref: '',
    date: new Date().toISOString().slice(0, 10),
    reason: '',
  });
  const waiting = list.filter((a) => a.status === 'Waiting');

  const idLabel = (a: any) => (a.prov === 'RMA' ? 'Beneficiary ID' : 'Merchant ID (MID)');
  const benf = f.benf.trim().toUpperCase();
  const clash = (a: any) =>
    mpa.find((m) => m.prov === a.prov && m.benfId === benf && m.biz !== a.who);
  const idError = (a: any) =>
    !benf
      ? ''
      : !/^[A-Z0-9]{1,10}$/.test(benf)
        ? 'Use up to 10 letters or digits, for example BE00000585'
        : clash(a)
          ? `Already assigned to ${clash(a).biz}`
          : '';

  const done = (a: any, status: string, extra: any = {}) => {
    setList(list.map((x) => (x.id === a.id ? { ...x, status, ...extra } : x)));
    setOpen(null);
    setF({ ...f, benf: '', ref: '', reason: '' });
  };
  const accept = (a: any) => {
    setMpa([
      ...mpa.filter((m) => !(m.biz === a.who && m.prov === a.prov)),
      { biz: a.who, prov: a.prov, benfId: benf, bank: f.bank, on: true, ref: f.ref, at: f.date },
    ]);
    done(a, 'Approved', { reason: '' });
    pushNote({
      to: 'merchant',
      biz: a.who,
      cat: 'Application',
      title: `${a.prov} approved your application`,
      body: `${a.id} was approved. Your ${idLabel(a)} is ${benf}. Payments through ${a.prov} are now live.`,
    });
    toast('Recorded: accepted. Merchant notified.');
  };
  const reject = (a: any) => {
    done(a, 'Rejected', { reason: f.reason });
    pushNote({
      to: 'merchant',
      biz: a.who,
      cat: 'Application',
      title: `${a.prov} rejected your application`,
      body: `${a.id}: ${f.reason}. Open the application to see what to correct and resubmit.`,
    });
    toast('Recorded: rejected. Merchant notified.');
  };

  return (
    <div className="card">
      <p>
        <small>When a provider replies by email, record its decision here.</small>
      </p>
      {waiting.map((a) => {
        const o = open?.id === a.id ? open.kind : null;
        const err = idError(a);
        return (
          <div className="line" key={a.id} style={{ display: 'block' }}>
            <div className="line" style={{ border: 0, padding: 0 }}>
              <span>
                {a.id} · {a.who} · {a.prov}
              </span>
              <span style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setOpen({ id: a.id, kind: 'accept' })}>Accepted</button>
                <button className="alt" onClick={() => setOpen({ id: a.id, kind: 'reject' })}>
                  Rejected
                </button>
              </span>
            </div>
            {o === 'accept' && (
              <div className="note" style={{ marginTop: 10 }}>
                <div className="row">
                  <div>
                    <label>
                      {idLabel(a)} issued by {a.prov} *
                    </label>
                    <input
                      value={f.benf}
                      maxLength={10}
                      placeholder="BE00000585"
                      onChange={(e) => setF({ ...f, benf: e.target.value })}
                    />
                    {err && <small style={{ color: 'var(--bad)' }}>{err}</small>}
                  </div>
                  {a.prov === 'RMA' && (
                    <div>
                      <label>Beneficiary bank code</label>
                      <select value={f.bank} onChange={(e) => setF({ ...f, bank: e.target.value })}>
                        {['01', '02', '03', '04'].map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="row">
                  <div>
                    <label>Provider reference (from the email)</label>
                    <input value={f.ref} onChange={(e) => setF({ ...f, ref: e.target.value })} />
                  </div>
                  <div>
                    <label>Date of the provider's reply</label>
                    <input
                      type="date"
                      value={f.date}
                      onChange={(e) => setF({ ...f, date: e.target.value })}
                    />
                  </div>
                </div>
                <p>
                  <button disabled={!benf || !!err} onClick={() => accept(a)}>
                    Save and approve
                  </button>{' '}
                  <button className="alt" onClick={() => setOpen(null)}>
                    Cancel
                  </button>
                </p>
              </div>
            )}
            {o === 'reject' && (
              <div className="note" style={{ marginTop: 10 }}>
                <label>Reason given by the provider *</label>
                <textarea
                  rows={2}
                  value={f.reason}
                  onChange={(e) => setF({ ...f, reason: e.target.value })}
                />
                <p>
                  <button className="out" disabled={!f.reason.trim()} onClick={() => reject(a)}>
                    Save rejection
                  </button>{' '}
                  <button className="alt" onClick={() => setOpen(null)}>
                    Cancel
                  </button>
                </p>
              </div>
            )}
          </div>
        );
      })}
      {!waiting.length && <small>Nothing is waiting for a provider reply.</small>}
      <Toast m={msg} />
    </div>
  );
}
