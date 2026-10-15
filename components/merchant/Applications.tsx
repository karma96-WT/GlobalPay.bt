'use client';
import { useState } from 'react';
import { Badge, Toast, useToast } from '@/components/ui';
import { DocRow } from '@/components/Docs';
import { docsOf, EDITABLE, useMerchant } from '@/lib/merchant';
import { pushNote } from '@/lib/notify';

export default function Applications() {
  const { mine, A, setA, U } = useMerchant();
  const [openId, setOpenId] = useState('');
  const [msg, toast] = useToast();
  const app = mine.find((a) => a.id === openId);

  const update = (id: string, patch: any) =>
    setA(A.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const resubmit = (a: any) => {
    update(a.id, { status: 'Pending' });
    pushNote({
      to: 'operator',
      cat: 'Application',
      title: `Resubmitted: ${a.id}`,
      body: `${U.business} resubmitted the ${a.prov} application after corrections.`,
    });
    pushNote({
      to: 'merchant',
      biz: U.business,
      cat: 'Application',
      title: `You resubmitted ${a.id}`,
      body: 'An operator will review it again.',
    });
    toast('Resubmitted for review');
  };

  if (!app) {
    return (
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Provider</th>
              <th>Submitted</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {mine.map((a) => (
              <tr key={a.id} className="clk" onClick={() => setOpenId(a.id)}>
                <td>{a.id}</td>
                <td>{a.prov}</td>
                <td>{a.date}</td>
                <td>
                  <Badge s={a.status} />
                </td>
                <td>
                  <button className="alt">Open</button>
                </td>
              </tr>
            ))}
            {!mine.length && (
              <tr>
                <td colSpan={5}>No applications yet.</td>
              </tr>
            )}
          </tbody>
        </table>
        <Toast m={msg} />
      </div>
    );
  }

  const editable = EDITABLE.includes(app.status);
  const docs = docsOf(app);
  const replaceDoc = (meta: any) => {
    update(app.id, { docs: docs.map((d: any) => (d.n === meta.n ? meta : d)) });
    pushNote({
      to: 'operator',
      cat: 'Document',
      title: `Document changed: ${meta.n}`,
      body: `${U.business} replaced a document on ${app.id}.`,
    });
    toast('Document replaced');
  };

  return (
    <>
      <button className="alt" onClick={() => setOpenId('')}>
        ← All applications
      </button>
      <div className="card" style={{ marginTop: 14 }}>
        <div className="line" style={{ border: 0 }}>
          <div>
            <h3 style={{ margin: 0 }}>{app.id}</h3>
            <small>
              {app.prov} · submitted {app.date}
            </small>
          </div>
          <Badge s={app.status} />
        </div>
        <div className="row">
          <div>
            <small>Route</small>
            <br />
            {app.route === 'cred' ? 'Existing credentials' : 'Documents'}
          </div>
          <div>
            <small>Business</small>
            <br />
            {app.who}
          </div>
        </div>
        {app.route === 'cred' && (
          <p>
            <small>Merchant ID provided</small>
            <br />
            <b>{app.mid || '—'}</b>
          </p>
        )}
        {app.note && <div className="note warn">Operator note: {app.note}</div>}
        {app.reason && (
          <div className="note warn">Provider's reason for rejection: {app.reason}</div>
        )}
        {!editable && (
          <div className="note">
            {app.status === 'Approved'
              ? 'Approved by the provider.'
              : 'This application has been forwarded to the provider, so documents are locked. Contact support if something is wrong.'}
          </div>
        )}
      </div>
      {app.route !== 'cred' && (
        <div className="card">
          <h3>Submitted documents</h3>
          {docs.map((d: any) => (
            <DocRow key={d.n} appId={app.id} doc={d} editable={editable} onReplace={replaceDoc} />
          ))}
        </div>
      )}
      {app.status === 'Correction required' && (
        <button onClick={() => resubmit(app)}>Resubmit for review</button>
      )}
      <Toast m={msg} />
    </>
  );
}
