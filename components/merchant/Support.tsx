'use client';
import { useState } from 'react';
import { Toast, useToast } from '@/components/ui';
import { seedTickets, ago } from '@/lib/data';
import { useMerchant } from '@/lib/merchant';
import { pushNote } from '@/lib/notify';
import { useStore } from '@/lib/store';

export default function Support() {
  const { U } = useMerchant();
  const [tickets, setTickets] = useStore<any[]>('gp_tickets', seedTickets);
  const [msg, toast] = useToast();
  const [form, setForm] = useState({ subject: '', cat: 'Payment', body: '' });
  const [open, setOpen] = useState('');
  const [reply, setReply] = useState('');
  const mine = tickets.filter((t) => t.biz === U.business);
  const cur = mine.find((t) => t.no === open);
  const who = { name: U.name, email: U.email, phone: U.phone || '—' };

  const create = () => {
    const no = 'SUP-' + (Math.max(11, ...tickets.map((t) => parseInt(t.no.slice(4)) || 0)) + 1);
    const t = {
      no,
      biz: U.business,
      contact: who,
      subject: form.subject,
      cat: form.cat,
      status: 'Open',
      created: new Date().toISOString(),
      msgs: [{ from: 'merchant', by: U.name, at: new Date().toISOString(), body: form.body }],
    };
    setTickets([t, ...tickets]);
    pushNote({
      to: 'operator',
      cat: 'Support',
      title: `New support request: ${form.subject}`,
      body: `${U.business} (${U.name}) opened ${no}.`,
    });
    pushNote({
      to: 'merchant',
      biz: U.business,
      cat: 'Support',
      title: `Support request ${no} submitted`,
      body: `"${form.subject}". You will get the reply here and by email.`,
    });
    setForm({ subject: '', cat: 'Payment', body: '' });
    toast('Request submitted: ' + no);
  };
  const follow = () => {
    setTickets(
      tickets.map((t) =>
        t.no === open
          ? {
              ...t,
              status: 'Open',
              msgs: [
                ...t.msgs,
                { from: 'merchant', by: U.name, at: new Date().toISOString(), body: reply },
              ],
            }
          : t,
      ),
    );
    pushNote({
      to: 'operator',
      cat: 'Support',
      title: `Merchant replied on ${open}`,
      body: `${U.business}: ${reply.slice(0, 80)}`,
    });
    setReply('');
  };

  if (cur) {
    return (
      <>
        <button className="alt" onClick={() => setOpen('')}>
          ← All requests
        </button>
        <div className="card" style={{ marginTop: 14 }}>
          <div className="line" style={{ border: 0 }}>
            <h3 style={{ margin: 0 }}>
              {cur.no} · {cur.subject}
            </h3>
            <span className={'badge ' + (cur.status === 'Resolved' ? 'b-ok' : 'b-warn')}>
              {cur.status}
            </span>
          </div>
          {cur.msgs.map((m: any, i: number) => (
            <div
              key={i}
              className="note"
              style={{ background: m.from === 'operator' ? 'var(--lime2)' : 'var(--soft)' }}
            >
              <small>
                {m.from === 'operator' ? `GlobalPay support (${m.by})` : 'You'} · {ago(m.at)}
              </small>
              <p style={{ margin: '4px 0 0' }}>{m.body}</p>
            </div>
          ))}
          {cur.status !== 'Resolved' && (
            <>
              <label>Add a message</label>
              <textarea rows={3} value={reply} onChange={(e) => setReply(e.target.value)} />
              <p>
                <button disabled={!reply.trim()} onClick={follow}>
                  Send
                </button>
              </p>
            </>
          )}
        </div>
      </>
    );
  }
  return (
    <>
      <div className="card">
        <h3>New request</h3>
        <div className="row">
          <div>
            <label>Subject *</label>
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>
          <div>
            <label>Category</label>
            <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
              {['Payment', 'Refund', 'Application', 'Technical', 'Account', 'Other'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <label>Message *</label>
        <textarea
          rows={3}
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
        <p>
          <button disabled={!form.subject.trim() || !form.body.trim()} onClick={create}>
            Submit request
          </button>
        </p>
      </div>
      <div className="card">
        <h3>Your requests</h3>
        <table>
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Subject</th>
              <th>Updated</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mine.map((t) => (
              <tr key={t.no} className="clk" onClick={() => setOpen(t.no)}>
                <td>{t.no}</td>
                <td>{t.subject}</td>
                <td>{ago(t.msgs[t.msgs.length - 1].at)}</td>
                <td>
                  <span className={'badge ' + (t.status === 'Resolved' ? 'b-ok' : 'b-warn')}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
            {!mine.length && (
              <tr>
                <td colSpan={4}>No requests yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Toast m={msg} />
    </>
  );
}
