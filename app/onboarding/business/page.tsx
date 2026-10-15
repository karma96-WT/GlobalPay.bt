'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Footer, FileSlot } from '@/components/ui';
import { providers, apps, COND } from '@/lib/data';
import { read, write } from '@/lib/store';
import { putFile } from '@/lib/files';
import { pushNote } from '@/lib/notify';
export default function Biz() {
  const router = useRouter();
  const [s, setS] = useState(0);
  const [b, setB] = useState<any>({
    name: '',
    type: 'Private limited',
    lic: '',
    addr: '',
    rep: '',
    cid: '',
    phone: '+975 ',
    email: '',
    web: '',
    tech: '',
  });
  const [sel, setSel] = useState<string[]>([]);
  const [mode, setMode] = useState<'cred' | 'docs'>('docs');
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [cred, setCred] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState(false);
  const set = (k: string) => (e: any) => setB({ ...b, [k]: e.target.value });
  const chosen = providers.filter((p) => sel.includes(p.id));
  const req = (p: any) => p.docs.filter((d: string) => !COND[d] || COND[d] === b.type);
  const T = ['Business', 'Providers', 'Credentials / documents', 'Review'];
  const ok = [
    b.name && b.lic && b.addr && b.rep && /^\d{11}$/.test(b.cid) && b.email.includes('@'),
    sel.length > 0,
    mode === 'cred'
      ? chosen.every((p) => cred[p.id]?.trim())
      : chosen.every((p) => req(p).every((d: string) => files[p.id + '|' + d])),
    agree,
  ][s];
  const toggle = (id: string, on: boolean) => {
    setSel(on ? [...sel, id] : sel.filter((x) => x !== id));
    if (!on) {
      const f = { ...files };
      Object.keys(f).forEach((k) => k.startsWith(id + '|') && delete f[k]);
      setFiles(f);
    }
  };
  const submit = async () => {
    const cur = read<any[]>('gp_apps', apps);
    const n = Date.now() % 10000;
    const yymm = new Date().toISOString().slice(2, 4) + new Date().toISOString().slice(5, 7);
    const add: any[] = [];
    for (const [i, p] of chosen.entries()) {
      const code = p.id === 'rma' ? 'RMA' : 'BoB';
      const id = 'GP-' + yymm + '-' + String(n + i).padStart(4, '0');
      let docs: any[] | undefined;
      if (mode === 'docs') {
        docs = [];
        for (const d of req(p)) {
          const f = files[p.id + '|' + d] as File;
          await putFile(id + '|' + d, f);
          docs.push({ n: d, name: f.name, size: f.size, type: f.type, state: 'Uploaded' });
        }
      }
      add.push({
        id,
        who: b.name,
        prov: code,
        date: new Date().toISOString().slice(0, 10),
        status: 'Pending',
        op: '—',
        route: mode,
        docs,
        mid: mode === 'cred' ? cred[p.id] : undefined,
      });
      pushNote({
        to: 'operator',
        cat: 'Application',
        title: 'New application from ' + b.name,
        body: id + ' (' + code + ') is waiting for document review.',
      });
      pushNote({
        to: 'merchant',
        biz: b.name,
        cat: 'Application',
        title: 'Application ' + id + ' submitted',
        body:
          'An operator will check your ' +
          (mode === 'docs' ? 'documents' : 'details') +
          ' and forward them to ' +
          code +
          '.',
      });
    }
    write('gp_apps', [...cur, ...add]);
    const u = read<any>('gp_user', {});
    write('gp_user', {
      ...u,
      stage: 'applied',
      business: b.name,
      addr: b.addr,
      phone: b.phone,
      bemail: b.email,
    });
    router.push('/merchant/applications');
  };
  return (
    <>
      <Header user="Verify business" />
      <div className="main" style={{ margin: '0 auto', maxWidth: 760 }}>
        <h2>Verify your business</h2>
        <div className="steps">
          {T.map((_, i) => (
            <i key={i} className={i <= s ? 'on' : ''} />
          ))}
        </div>
        <p>
          <small>
            Step {s + 1} of 4 · {T[s]}
          </small>
        </p>
        <div className="card">
          {s === 0 && (
            <>
              <div className="row">
                <div>
                  <label>Registered business name *</label>
                  <input value={b.name} onChange={set('name')} />
                </div>
                <div>
                  <label>Business type *</label>
                  <select value={b.type} onChange={set('type')}>
                    <option>Private limited</option>
                    <option>Sole proprietor</option>
                    <option>Government office</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div>
                  <label>Trade license / registration no. *</label>
                  <input value={b.lic} onChange={set('lic')} />
                </div>
                <div>
                  <label>Business address *</label>
                  <input value={b.addr} onChange={set('addr')} />
                </div>
              </div>
              <div className="row">
                <div>
                  <label>Authorised representative *</label>
                  <input value={b.rep} onChange={set('rep')} />
                </div>
                <div>
                  <label>Representative CID (11 digits) *</label>
                  <input
                    maxLength={11}
                    value={b.cid}
                    onChange={(e) => setB({ ...b, cid: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </div>
              <div className="row">
                <div>
                  <label>Contact number *</label>
                  <input value={b.phone} onChange={set('phone')} />
                </div>
                <div>
                  <label>Business email *</label>
                  <input value={b.email} onChange={set('email')} />
                </div>
              </div>
              <div className="row">
                <div>
                  <label>Website URL (optional)</label>
                  <input value={b.web} onChange={set('web')} placeholder="https://" />
                  <small>
                    Leave blank if you do not sell through a website. You can still use payment
                    links and QR codes.
                  </small>
                </div>
                <div>
                  <label>Technical contact (optional)</label>
                  <input value={b.tech} onChange={set('tech')} placeholder="Name, email" />
                </div>
              </div>
            </>
          )}
          {s === 1 && (
            <>
              {providers.map((p) => (
                <label
                  key={p.id}
                  className="card hov"
                  style={{ display: 'block', color: 'inherit', fontSize: 15, margin: '0 0 12px' }}
                >
                  <input
                    type="checkbox"
                    checked={sel.includes(p.id)}
                    onChange={(e) => toggle(p.id, e.target.checked)}
                  />{' '}
                  <b>{p.name}</b> · {p.cur}
                  <br />
                  <small>
                    {p.services} · Charges: {p.fee}
                  </small>
                </label>
              ))}
              <small>
                Each provider you pick gets its own application and status. You will only be asked
                for the documents of the providers you select.
              </small>
            </>
          )}
          {s === 2 && (
            <>
              <div className="tabs">
                <button className={mode === 'docs' ? 'on' : ''} onClick={() => setMode('docs')}>
                  I have no credentials: upload documents
                </button>
                <button className={mode === 'cred' ? 'on' : ''} onClick={() => setMode('cred')}>
                  I am already verified: enter credentials
                </button>
              </div>
              {chosen.map((p) => (
                <div key={p.id} className="card" style={{ background: 'var(--soft)', border: 0 }}>
                  <h3>{p.name}</h3>
                  {mode === 'cred' ? (
                    <>
                      <label>Merchant ID (MID) with {p.name}</label>
                      <input
                        value={cred[p.id] || ''}
                        onChange={(e) => setCred({ ...cred, [p.id]: e.target.value })}
                      />
                    </>
                  ) : (
                    req(p).map((d: string) => (
                      <FileSlot
                        key={d}
                        label={d}
                        file={files[p.id + '|' + d]}
                        onFile={(f) => setFiles({ ...files, [p.id + '|' + d]: f })}
                      />
                    ))
                  )}
                </div>
              ))}
              <small>
                Files stay in your browser in this prototype and are not uploaded anywhere.
              </small>
            </>
          )}
          {s === 3 && (
            <>
              <p>
                <b>{b.name}</b> ({b.type}) · {b.addr}
                <br />
                Providers: <b>{chosen.map((p) => p.name).join(', ')}</b>
                <br />
                Route:{' '}
                <b>
                  {mode === 'cred'
                    ? 'Existing credentials'
                    : Object.values(files).filter(Boolean).length + ' documents uploaded'}
                </b>
              </p>
              <label style={{ display: 'flex', gap: 8, color: 'inherit', fontSize: 14 }}>
                <input type="checkbox" onChange={(e) => setAgree(e.target.checked)} /> I confirm
                this information is correct and consent to sharing it with the selected providers.
              </label>
            </>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="alt" onClick={() => (s ? setS(s - 1) : router.push('/onboarding'))}>
            Back
          </button>
          {s < 3 ? (
            <button disabled={!ok} onClick={() => setS(s + 1)}>
              Continue
            </button>
          ) : (
            <button disabled={!ok} onClick={submit}>
              Submit application
            </button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
