'use client';
import { useState } from 'react';
import { Toast, useToast } from '@/components/ui';
import { seedTickets, ago } from '@/lib/data';
import { pushNote } from '@/lib/notify';
import { useStore } from '@/lib/store';

const badge = (s: string) => (
  <span className={'badge ' + (s === 'Resolved' ? 'b-ok' : s === 'Open' ? 'b-warn' : '')}>{s}</span>
);

/** Support inbox: subject and merchant details in the list, full thread and reply by email inside. */
export default function SupportDesk() {
  const [tickets, setTickets] = useStore<any[]>('gp_tickets', seedTickets);
  const [openNo, setOpenNo] = useState('');
  const [reply, setReply] = useState('');
  const [msg, toast] = useToast();
  const t = tickets.find((x) => x.no === openNo);
  const patch = (no: string, p: any) =>
    setTickets(tickets.map((x) => (x.no === no ? { ...x, ...p } : x)));

  if (!t) {
    return (
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Merchant</th>
              <th>Contact</th>
              <th>Updated</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((x) => (
              <tr key={x.no} className="clk" onClick={() => setOpenNo(x.no)}>
                <td>
                  <b>{x.subject}</b>
                  <br />
                  <small>
                    {x.no} · {x.cat}
                  </small>
                </td>
                <td>{x.biz}</td>
                <td>
                  {x.contact.name}
                  <br />
                  <small>{x.contact.email}</small>
                </td>
                <td>{ago(x.msgs[x.msgs.length - 1].at)}</td>
                <td>{badge(x.status)}</td>
              </tr>
            ))}
            {!tickets.length && (
              <tr>
                <td colSpan={5}>No support requests.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  const send = () => {
    const m = {
      from: 'operator',
      by: 'Pema Dorji',
      at: new Date().toISOString(),
      body: reply,
      emailedTo: t.contact.email,
    };
    patch(t.no, { status: 'In progress', msgs: [...t.msgs, m] });
    pushNote({
      to: 'merchant',
      biz: t.biz,
      cat: 'Support',
      title: `Reply on ${t.no}: ${t.subject}`,
      body: reply.slice(0, 140),
    });
    setReply('');
    toast(`Reply emailed to ${t.contact.email} (simulated)`);
  };

  return (
    <>
      <button className="alt" onClick={() => setOpenNo('')}>
        ← All requests
      </button>
      <div className="split" style={{ gridTemplateColumns: '1fr 300px', marginTop: 14 }}>
        <div className="card">
          <div className="line" style={{ border: 0 }}>
            <h3 style={{ margin: 0 }}>{t.subject}</h3>
            {badge(t.status)}
          </div>
          <small>
            {t.no} · {t.cat}
          </small>
          {t.msgs.map((m: any, i: number) => (
            <div
              key={i}
              className="note"
              style={{
                background: m.from === 'operator' ? 'var(--lime2)' : 'var(--soft)',
                marginTop: 10,
              }}
            >
              <small>
                {m.from === 'operator' ? `You (${m.by})` : m.by} · {new Date(m.at).toLocaleString()}
                {m.emailedTo && ` · emailed to ${m.emailedTo}`}
              </small>
              <p style={{ margin: '4px 0 0' }}>{m.body}</p>
            </div>
          ))}
          {t.status !== 'Resolved' ? (
            <>
              <label>Reply (sent to the merchant by email and shown in their Support tab)</label>
              <textarea rows={4} value={reply} onChange={(e) => setReply(e.target.value)} />
              <p style={{ display: 'flex', gap: 8 }}>
                <button disabled={!reply.trim()} onClick={send}>
                  Send reply by email
                </button>
                <button
                  className="alt"
                  onClick={() => {
                    patch(t.no, { status: 'Resolved' });
                    toast('Marked resolved');
                  }}
                >
                  Mark resolved
                </button>
              </p>
            </>
          ) : (
            <button className="alt" onClick={() => patch(t.no, { status: 'Open' })}>
              Reopen
            </button>
          )}
        </div>
        <div className="card">
          <h3>Merchant</h3>
          <p>
            <b>{t.biz}</b>
          </p>
          <small>Contact</small>
          <br />
          {t.contact.name}
          <br />
          <small>Email</small>
          <br />
          {t.contact.email}
          <br />
          <small>Phone</small>
          <br />
          {t.contact.phone}
        </div>
      </div>
      <Toast m={msg} />
    </>
  );
}
