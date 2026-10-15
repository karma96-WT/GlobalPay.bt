'use client';
import { useState } from 'react';
import { InvoiceView, Toast, useToast } from '@/components/ui';
import { calc, money } from '@/lib/data';
import { useMerchant } from '@/lib/merchant';
import { pushNote } from '@/lib/notify';

const Qr = () => (
  <div className="qr">
    {Array.from({ length: 225 }, (_, i) => (
      <s key={i} className={(i * 7 + (i % 4) * 3) % 5 < 2 ? 'w' : ''} />
    ))}
  </div>
);
const BLANK = {
  cur: 'Nu.',
  email: '',
  mobile: '',
  items: [{ d: '', q: 1, p: 0 }],
  disc: { type: 'amt', v: 0 },
  tax: { type: '', rate: 0 },
  extra: { label: '', amt: 0 },
  notes: 'Payment due within 7 days.',
};

export default function Receive() {
  const { U, ok, I, setI, conn } = useMerchant();
  const [msg, toast] = useToast();
  const [f, setF] = useState<any>(BLANK);
  const [step, setStep] = useState('form');
  const [cur, setCur] = useState<any>(null);
  const [to, setTo] = useState('');

  const seq = Math.max(17, ...I.map((i) => parseInt(i.no.slice(-4)) || 0)) + 1;
  const no = cur?.no || `INV-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`;
  const set = (k: string, v: any) => setF({ ...f, [k]: v });
  const setItem = (i: number, k: string, v: any) =>
    set(
      'items',
      f.items.map((x: any, j: number) => (j === i ? { ...x, [k]: v } : x)),
    );

  const build = () => ({
    no,
    date: cur?.date || new Date().toISOString().slice(0, 10),
    cur: f.cur,
    merchant: {
      name: U.business,
      addr: U.addr || '—',
      phone: U.phone || '—',
      email: U.bemail || U.email,
    },
    cust: { email: f.email, mobile: f.mobile },
    items: f.items,
    disc: f.disc,
    tax: f.tax,
    extra: f.extra,
    notes: f.notes,
    status: 'Unpaid',
    benfId: conn('RMA')?.benfId,
    benfBank: conn('RMA')?.bank || '01',
  });
  const c = calc(build());
  const valid = f.items.every((i: any) => i.d.trim() && i.q > 0 && i.p > 0);
  const link = (typeof window !== 'undefined' ? window.location.origin : '') + '/pay/' + no;
  const save = (inv: any) => setI([...I.filter((x) => x.no !== inv.no), inv]);

  if (!ok.rma)
    return (
      <div className="note warn">
        You can create invoices once RMA approves your application and the provider is switched on.
      </div>
    );

  return (
    <>
      <Toast m={msg} />
      {step === 'form' && (
        <>
          <div className="note">
            Currency selects the provider: Nu. goes through RMA (BFS Secure). INR and USD (Bank of
            Bhutan) will be added when BoB's integration documents are received.
          </div>
          <div className="card">
            <h3>Invoice details</h3>
            <div className="row">
              <div>
                <label>Invoice number (unique, automatic)</label>
                <input value={no} readOnly />
              </div>
              <div>
                <label>Invoice date (automatic)</label>
                <input value={cur?.date || new Date().toISOString().slice(0, 10)} readOnly />
              </div>
            </div>
            <div className="row">
              <div>
                <label>Currency *</label>
                <select value={f.cur} onChange={(e) => set('cur', e.target.value)}>
                  <option>Nu.</option>
                  <option disabled>INR (BoB, coming soon)</option>
                  <option disabled>USD (BoB, coming soon)</option>
                </select>
              </div>
              <div>
                <label>Payment provider (from currency)</label>
                <input value="RMA (BFS Secure)" readOnly />
              </div>
            </div>
          </div>
          <div className="card">
            <h3>Merchant information</h3>
            <small>Taken from your business profile. Change it under Settings.</small>
            <div className="row">
              <div>
                <label>Registered business name</label>
                <input value={U.business} readOnly />
              </div>
              <div>
                <label>Business address</label>
                <input value={U.addr || '—'} readOnly />
              </div>
            </div>
            <div className="row">
              <div>
                <label>Phone</label>
                <input value={U.phone || '—'} readOnly />
              </div>
              <div>
                <label>Email</label>
                <input value={U.bemail || U.email} readOnly />
              </div>
            </div>
          </div>
          <div className="card">
            <h3>Customer contact</h3>
            <div className="row">
              <div>
                <label>Customer email (needed to send the invoice)</label>
                <input value={f.email} onChange={(e) => set('email', e.target.value)} />
              </div>
              <div>
                <label>Customer mobile</label>
                <input value={f.mobile} onChange={(e) => set('mobile', e.target.value)} />
              </div>
            </div>
          </div>
          <div className="card">
            <h3>Products / services</h3>
            <table>
              <thead>
                <tr>
                  <th>Description *</th>
                  <th>Qty *</th>
                  <th>Unit price (Nu.) *</th>
                  <th>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {f.items.map((it: any, i: number) => (
                  <tr key={i}>
                    <td>
                      <input value={it.d} onChange={(e) => setItem(i, 'd', e.target.value)} />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={it.q}
                        onChange={(e) => setItem(i, 'q', +e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        value={it.p}
                        onChange={(e) => setItem(i, 'p', +e.target.value)}
                      />
                    </td>
                    <td>{money(it.q * it.p, '')}</td>
                    <td>
                      {f.items.length > 1 && (
                        <button
                          className="alt"
                          onClick={() =>
                            set(
                              'items',
                              f.items.filter((_: any, j: number) => j !== i),
                            )
                          }
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              <button
                className="alt"
                onClick={() => set('items', [...f.items, { d: '', q: 1, p: 0 }])}
              >
                + Add line
              </button>
            </p>
            <div className="row">
              <div>
                <label>Discount</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select
                    style={{ width: 110 }}
                    value={f.disc.type}
                    onChange={(e) => set('disc', { ...f.disc, type: e.target.value })}
                  >
                    <option value="amt">Nu.</option>
                    <option value="pct">%</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={f.disc.v}
                    onChange={(e) => set('disc', { ...f.disc, v: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label>Additional charges (delivery, service, other)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    placeholder="Label"
                    value={f.extra.label}
                    onChange={(e) => set('extra', { ...f.extra, label: e.target.value })}
                  />
                  <input
                    type="number"
                    min={0}
                    style={{ width: 130 }}
                    value={f.extra.amt}
                    onChange={(e) => set('extra', { ...f.extra, amt: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div>
                <label>Tax type (as applicable)</label>
                <input
                  value={f.tax.type}
                  placeholder="e.g. Sales Tax"
                  onChange={(e) => set('tax', { ...f.tax, type: e.target.value })}
                />
              </div>
              <div>
                <label>Tax rate (%)</label>
                <input
                  type="number"
                  min={0}
                  value={f.tax.rate}
                  onChange={(e) => set('tax', { ...f.tax, rate: e.target.value })}
                />
              </div>
            </div>
            <label>Notes / terms</label>
            <textarea rows={2} value={f.notes} onChange={(e) => set('notes', e.target.value)} />
            <hr />
            <div style={{ textAlign: 'right' }}>
              Subtotal {money(c.sub)}
              <br />
              Discount −{money(c.disc)}
              <br />
              Tax {money(c.tax)}
              <br />
              Additional charges {money(c.extra)}
              <br />
              <b style={{ fontSize: 22 }}>Grand total {money(c.total)}</b>
              <br />
              <small>Payment status: Unpaid · the payment link and QR are generated next</small>
            </div>
          </div>
          <button
            disabled={!valid}
            onClick={() => {
              const inv = build();
              setCur(inv);
              save(inv);
              setTo(f.email);
              setStep('preview');
            }}
          >
            Review invoice
          </button>
        </>
      )}

      {step === 'preview' && cur && (
        <>
          <div className="card">
            <h3>Preview before sending</h3>
            <small>This is what your customer will receive.</small>
            <div className="note" style={{ marginTop: 12 }}>
              <small>
                Subject: Invoice {cur.no} from {U.business}
              </small>
            </div>
            <p>
              Hello, {U.business} has sent you an invoice for <b>{money(c.total)}</b>. Pay securely
              with your bank account using the link or QR code.
            </p>
            <InvoiceView iv={cur} />
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <Qr />
              <div>
                <span className="btn">Pay now</span>
                <br />
                <small>{link}</small>
              </div>
            </div>
          </div>
          <div className="card">
            <label>Send invoice to</label>
            <input
              value={to}
              placeholder="customer@example.com"
              onChange={(e) => setTo(e.target.value)}
            />
            <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="alt" onClick={() => setStep('form')}>
                ← Edit invoice
              </button>
              <button
                disabled={!/^\S+@\S+\.\S+$/.test(to)}
                onClick={() => {
                  const sent = {
                    ...cur,
                    cust: { ...cur.cust, email: to },
                    sentTo: to,
                    sentAt: new Date().toISOString(),
                  };
                  setCur(sent);
                  save(sent);
                  setStep('sent');
                  pushNote({
                    to: 'merchant',
                    biz: U.business,
                    cat: 'Invoice',
                    title: `Invoice ${sent.no} sent`,
                    body: `Emailed to ${to} for ${money(c.total)} with a payment link and QR code.`,
                  });
                  toast('Invoice emailed to ' + to);
                }}
              >
                Send invoice
              </button>
            </p>
          </div>
        </>
      )}

      {step === 'sent' && cur && (
        <div className="card">
          <h3>Invoice sent</h3>
          <p>
            {cur.no} was emailed to <b>{cur.sentTo}</b> with the payment link and QR code. Status:
            Unpaid.
          </p>
          <p style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <a className="btn" href={link} target="_blank">
              Open customer payment page
            </a>
            <button
              className="alt"
              onClick={() => {
                save({ ...cur, status: 'Cancelled' });
                setCur(null);
                setStep('form');
                toast('Invoice cancelled. Correct it and send a new one.');
              }}
            >
              Something is wrong: cancel and correct
            </button>
            <button
              className="alt"
              onClick={() => {
                setF(BLANK);
                setCur(null);
                setStep('form');
              }}
            >
              Create another
            </button>
          </p>
        </div>
      )}
    </>
  );
}
