'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Footer, PayHead, InvoiceView } from '@/components/ui';
import { RC, sign } from '@/lib/bfs';
import { calc, money, seedInvoices, txns } from '@/lib/data';
import { pushNote } from '@/lib/notify';
import { read, write } from '@/lib/store';

export default function Result() {
  const { no } = useParams() as { no: string };
  const [session, setSession] = useState<any>(undefined);
  const [invoice, setInvoice] = useState<any>(null);
  const [checks, setChecks] = useState<any>(null);
  const started = useRef(false); // React dev mode runs effects twice; record only once

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      const s = read<any>('gp_bfs', null);
      if (!s?.ac) return setSession(null);
      const { ac, ar } = s;

      const verified = {
        sig: (await sign(ac)) === ac.bfs_checkSum,
        order: ac.bfs_orderNo === ar.bfs_orderNo,
        amt: Number(ac.bfs_txnAmount) === Number(ar.bfs_txnAmount),
        benf: ac.bfs_benfId === ar.bfs_benfId,
      };
      setChecks(verified);

      const invoices = read<any[]>('gp_invoices', seedInvoices);
      let inv = invoices.find((x) => x.no === no);
      const all = read<any[]>('gp_txns', txns);
      const already = all.some((t) => t[6] === ac.bfs_bfsTxnId); // never record the same payment twice
      if (inv && !already) {
        const success = Object.values(verified).every(Boolean) && ac.bfs_debitAuthCode === '00';
        const when = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const total = calc(inv).total;
        const id = 'TX-' + ac.bfs_bfsTxnId.slice(-6);
        write('gp_txns', [
          [
            id,
            when,
            total,
            'RMA',
            success ? 'Successful' : 'Failed',
            no,
            ac.bfs_bfsTxnId,
            ac.bfs_debitAuthCode,
            inv.merchant.name,
          ],
          ...all,
        ]);
        if (success) {
          inv = { ...inv, status: 'Paid', txnRef: ac.bfs_bfsTxnId, paidAt: when };
          write(
            'gp_invoices',
            invoices.map((x) => (x.no === no ? inv : x)),
          );
        }
        pushNote({
          to: 'merchant',
          biz: inv.merchant.name,
          cat: 'Payment',
          title: success ? `Payment ${id} received` : `Payment ${id} failed`,
          body: success
            ? `${money(total)} received through RMA for invoice ${no}.`
            : `${money(total)} failed with code ${ac.bfs_debitAuthCode} (${RC[ac.bfs_debitAuthCode] || 'Unknown'}). The customer can retry from the same link.`,
        });
      }
      setInvoice(inv);
      setSession(s);
    })();
  }, [no]);

  const ac = session?.ac;
  const good = ac && ac.bfs_debitAuthCode === '00' && checks?.sig;
  return (
    <>
      <PayHead />
      <div className="main" style={{ margin: '0 auto', maxWidth: 720 }}>
        {session === undefined ? (
          <p>Verifying payment…</p>
        ) : session === null ? (
          <div className="card">
            <h3>No payment result</h3>
            <Link className="btn" href={'/pay/' + no}>
              Back to invoice
            </Link>
          </div>
        ) : (
          <>
            <div className="card" style={{ textAlign: 'center' }}>
              <h2 style={{ color: good ? 'var(--ok)' : 'var(--bad)' }}>
                {good ? 'Payment successful' : 'Payment not completed'}
              </h2>
              <p>
                {ac.bfs_debitAuthCode}: {RC[ac.bfs_debitAuthCode] || 'Unknown'}
              </p>
              <p>
                <small>
                  BFS Secure transaction ID {ac.bfs_bfsTxnId} · Order {ac.bfs_orderNo}
                  {ac.bfs_debitAuthNo && <> · Debit authorisation {ac.bfs_debitAuthNo}</>}
                </small>
              </p>
              {good ? (
                <p>A receipt is recorded against the invoice. You can close this page.</p>
              ) : (
                <Link className="btn" href={'/pay/' + no}>
                  Try again
                </Link>
              )}
            </div>
            <div className="card">
              <h3>What GlobalPay.bt verified on the AC message</h3>
              {[
                ['Message signature (checksum)', checks.sig],
                ['Order number matches the AR we sent', checks.order],
                ['Amount matches the AR', checks.amt],
                ['Beneficiary ID matches', checks.benf],
              ].map(([t, v]) => (
                <div className="line" key={t as string}>
                  <span>{t}</span>
                  <span className={'badge ' + (v ? 'b-ok' : 'b-bad')}>
                    {v ? 'Passed' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>
            {invoice && <InvoiceView iv={invoice} />}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
