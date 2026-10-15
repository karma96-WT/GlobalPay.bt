'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { InvoiceView, Footer, PayHead } from '@/components/ui';
import { buildAR } from '@/lib/bfs';
import { read } from '@/lib/store';
import { seedInvoices } from '@/lib/data';
export default function Pay() {
  const { no } = useParams() as any;
  const r = useRouter();
  const [iv, setIv] = useState<any>(undefined);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const l = read<any[]>('gp_invoices', seedInvoices);
    setIv(l.find((x: any) => x.no === no) || null);
  }, [no]);
  const go = async () => {
    setBusy(true);
    const ar = await buildAR(iv);
    localStorage.setItem(
      'gp_bfs',
      JSON.stringify({
        no,
        ar,
        stage: 'entry',
        deadline: Date.now() + 300000,
        scn: '00',
        trace: ['1. AR message sent to BFS Secure over SSL (HTML form POST, redirect)'],
      }),
    );
    r.push('/bfs');
  };
  return (
    <>
      <PayHead />
      <div className="main" style={{ margin: '0 auto', maxWidth: 720 }}>
        {iv === undefined ? (
          <p>Loading…</p>
        ) : iv === null ? (
          <div className="card">
            <h3>Invoice not found</h3>
            <p>
              This prototype keeps invoices in the browser that created them. Create one from
              Merchant → Receive Payments, then open its link.
            </p>
          </div>
        ) : (
          <>
            <h2>Pay {iv.merchant.name}</h2>
            <InvoiceView iv={iv} />
            {iv.status === 'Unpaid' && (
              <div className="card">
                <p>
                  You will be redirected to <b>BFS Secure</b> (RMA) to choose your bank and confirm
                  with an OTP. GlobalPay.bt never sees your bank account details or OTP.
                </p>
                <button disabled={busy} onClick={go}>
                  {busy ? 'Redirecting…' : 'Pay with your bank account (BFS Secure)'}
                </button>
              </div>
            )}
            {iv.status === 'Paid' && (
              <div className="note">This invoice has been paid. Thank you.</div>
            )}
            {iv.status === 'Cancelled' && (
              <div className="note warn">
                This invoice was cancelled by the merchant. Please contact them for a new one.
              </div>
            )}
          </>
        )}
        <small>
          <Link href="/">GlobalPay.bt</Link> · Payments processed through RMA BFS Secure
        </small>
      </div>
      <Footer />
    </>
  );
}
