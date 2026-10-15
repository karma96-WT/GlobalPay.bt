'use client';
import { useState } from 'react';
import { Acc, Badge, InvoiceView, Toast, useToast } from '@/components/ui';
import { useMerchant } from '@/lib/merchant';

export default function Transactions() {
  const { T, I } = useMerchant();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState('');
  const [msg, toast] = useToast();
  const rows = T.filter((t) => t.slice(0, 5).join(' ').toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="card">
      <input
        placeholder="Search by ID, provider, status…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Amount (Nu.)</th>
            <th>Provider</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => {
            const inv = I.find((x) => x.no === t[5]);
            const o = open === t[0];
            return [
              <tr key={t[0]} className="clk" onClick={() => setOpen(o ? '' : t[0])}>
                <td>{t[0]}</td>
                <td>{t[1]}</td>
                <td>{Number(t[2]).toLocaleString()}</td>
                <td>{t[3]}</td>
                <td>
                  <Badge s={t[4]} />
                </td>
              </tr>,
              <tr key={t[0] + 'x'}>
                <td colSpan={5} style={{ padding: 0, border: o ? undefined : 0 }}>
                  <Acc open={o}>
                    <div style={{ padding: '0 12px' }}>
                      {inv ? (
                        <InvoiceView iv={inv} />
                      ) : (
                        <div className="note" style={{ margin: 12 }}>
                          Demo transaction without a stored invoice.
                        </div>
                      )}
                      <div className="note">
                        <small>
                          Provider reference {t[6] || t[0]} · Response code {t[7] || '—'}
                        </small>
                        <button
                          className="alt"
                          style={{ marginLeft: 12 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toast('Receipt downloaded (prototype)');
                          }}
                        >
                          Download receipt
                        </button>
                      </div>
                    </div>
                  </Acc>
                </td>
              </tr>,
            ];
          })}
          {!rows.length && (
            <tr>
              <td colSpan={5}>No transactions found.</td>
            </tr>
          )}
        </tbody>
      </table>
      <Toast m={msg} />
    </div>
  );
}
