'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Acc, Badge, InvoiceView, Toast, useToast } from '@/components/ui';
import { calc, money } from '@/lib/data';
import { useMerchant } from '@/lib/merchant';
import { pushNote } from '@/lib/notify';

/**
 * Tab rules
 *  Paid          - invoice paid
 *  Pending       - sent, not paid, no failed payment attempt yet
 *  Unpaid/Failed - not paid and at least one failed payment attempt
 *  All           - everything, including cancelled invoices
 */
export default function Invoices() {
  const { myInv, I, setI, T, U } = useMerchant();
  const [tab, setTab] = useState('All');
  const [open, setOpen] = useState('');
  const [msg, toast] = useToast();

  const failed = (no: string) => T.some((t) => t[5] === no && t[4] === 'Failed');
  const kind = (i: any) =>
    i.status === 'Paid'
      ? 'Paid'
      : i.status === 'Cancelled'
        ? 'Cancelled'
        : failed(i.no)
          ? 'Unpaid/Failed'
          : 'Pending';
  const tabs = ['All', 'Paid', 'Pending', 'Unpaid/Failed'];
  const rows = [...myInv]
    .sort((a, b) => b.no.localeCompare(a.no))
    .filter((i) => tab === 'All' || kind(i) === tab);
  const count = (t: string) => myInv.filter((i) => t === 'All' || kind(i) === t).length;

  const cancel = (inv: any) => {
    setI(I.map((i) => (i.no === inv.no ? { ...i, status: 'Cancelled' } : i)));
    pushNote({
      to: 'merchant',
      biz: U.business,
      cat: 'Invoice',
      title: `Invoice ${inv.no} cancelled`,
      body: 'The payment link no longer accepts payment.',
    });
    toast('Invoice cancelled');
  };
  const resend = (inv: any) => {
    pushNote({
      to: 'merchant',
      biz: U.business,
      cat: 'Invoice',
      title: `Invoice ${inv.no} re-sent`,
      body: `Sent again to ${inv.sentTo || inv.cust.email}.`,
    });
    toast('Invoice emailed again (simulated)');
  };

  return (
    <>
      <div className="tabs">
        {tabs.map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {t} ({count(t)})
          </button>
        ))}
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => {
              const o = open === i.no;
              const k = kind(i);
              return [
                <tr key={i.no} className="clk" onClick={() => setOpen(o ? '' : i.no)}>
                  <td>{i.no}</td>
                  <td>{i.cust.email || '—'}</td>
                  <td>{i.date}</td>
                  <td>{money(calc(i).total)}</td>
                  <td>
                    <span
                      className={
                        'badge ' +
                        (k === 'Paid'
                          ? 'b-ok'
                          : k === 'Unpaid/Failed'
                            ? 'b-bad'
                            : k === 'Cancelled'
                              ? ''
                              : 'b-warn')
                      }
                    >
                      {k}
                    </span>
                  </td>
                </tr>,
                <tr key={i.no + 'x'}>
                  <td colSpan={5} style={{ padding: 0, border: o ? undefined : 0 }}>
                    <Acc open={o}>
                      <div style={{ padding: '0 12px 12px' }}>
                        <InvoiceView iv={i} />
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <Link className="btn alt" href={`/pay/${i.no}`} target="_blank">
                            Open payment page
                          </Link>
                          {i.status === 'Unpaid' && (
                            <button className="alt" onClick={() => resend(i)}>
                              Resend
                            </button>
                          )}
                          {i.status === 'Unpaid' && (
                            <button className="alt" onClick={() => cancel(i)}>
                              Cancel invoice
                            </button>
                          )}
                        </div>
                      </div>
                    </Acc>
                  </td>
                </tr>,
              ];
            })}
            {!rows.length && (
              <tr>
                <td colSpan={5}>No invoices here yet. Create one under Receive Payments.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Toast m={msg} />
    </>
  );
}
