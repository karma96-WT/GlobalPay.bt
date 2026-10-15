'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui';
import { useStore, write } from '@/lib/store';
import { seedNotes, ago } from '@/lib/data';

/** Notification centre: message list on the left, full message on the right. */
export default function Notes({ to, biz }: { to: 'merchant' | 'operator'; biz?: string }) {
  const [all] = useStore<any[]>('gp_notes', seedNotes);
  const [sel, setSel] = useState('');
  const [filter, setFilter] = useState('All');
  const mine = all.filter((n) => n.to === to && (to !== 'merchant' || n.biz === biz));
  const list = mine.filter((n) => filter === 'All' || !n.read);
  const cur = mine.find((n) => n.id === sel) || list[0];
  const mark = (ids: string[]) =>
    write(
      'gp_notes',
      all.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)),
    );
  return (
    <>
      <div className="tabs">
        {['All', 'Unread'].map((x) => (
          <button key={x} className={filter === x ? 'on' : ''} onClick={() => setFilter(x)}>
            {x}
            {x === 'Unread' && ` (${mine.filter((n) => !n.read).length})`}
          </button>
        ))}
      </div>
      <div className="split">
        <div className="card" style={{ padding: 8 }}>
          {list.map((n) => (
            <div
              key={n.id}
              className={'msg' + (cur?.id === n.id ? ' on' : '')}
              onClick={() => {
                setSel(n.id);
                mark([n.id]);
              }}
            >
              <span className={'dot' + (n.read ? ' r' : '')} />
              <div>
                <b>{n.title}</b>
                <br />
                <small>
                  {n.cat} · {ago(n.at)}
                </small>
              </div>
            </div>
          ))}
          {!list.length && <p style={{ padding: 12 }}>All caught up.</p>}
        </div>
        <div className="card">
          {cur ? (
            <>
              <Badge s={cur.cat === 'Payment' ? 'Successful' : 'Pending'} />
              <h3 style={{ marginTop: 10 }}>{cur.title}</h3>
              <small>{new Date(cur.at).toLocaleString()}</small>
              <p>{cur.body}</p>
              <button className="alt" onClick={() => mark(mine.map((n) => n.id))}>
                Mark all read
              </button>
            </>
          ) : (
            <p>No notifications yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
