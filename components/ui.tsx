'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { seedNotes, BIZ } from '@/lib/data';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cls, calc, money } from '@/lib/data';
export const Badge = ({ s }: { s: string }) => <span className={'badge ' + cls(s)}>{s}</span>;
export const Stat = ({ n, l }: { n: any; l: string }) => (
  <div className="card stat hov">
    <b>{n}</b>
    <span>{l}</span>
  </div>
);
export const Sw = ({ on, set }: { on: boolean; set: (v: boolean) => void }) => (
  <button
    type="button"
    aria-pressed={on}
    className={'sw' + (on ? ' on' : '')}
    onClick={() => set(!on)}
  />
);
export const Table = ({ cols, rows }: { cols: string[]; rows: any[][] }) => (
  <table>
    <thead>
      <tr>
        {cols.map((c) => (
          <th key={c}>{c}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((r, i) => (
        <tr key={i}>
          {r.map((c, j) => (
            <td key={j}>
              {typeof c === 'string' && cls(c) && j === r.length - 1 ? <Badge s={c} /> : c}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
export const Acc = ({ open, children }: { open: boolean; children: any }) => (
  <div className={'acc' + (open ? ' open' : '')}>
    <div>{children}</div>
  </div>
);
export const Toast = ({ m }: { m: string }) => (m ? <div className="toast">{m}</div> : null);
export function useToast(): [string, (m: string) => void] {
  const [m, s] = useState('');
  return [
    m,
    (t: string) => {
      s(t);
      setTimeout(() => s(''), 2200);
    },
  ];
}
export function Header({
  role,
  name = 'User',
  settings = false,
  user,
  bell = 0,
}: {
  role?: string;
  name?: string;
  settings?: boolean;
  user?: string;
  bell?: number;
}) {
  const [o, setO] = useState(false);
  const b = role ? `/${role.toLowerCase()}` : '';
  return (
    <header className="hdr">
      <Link className="logo" href={role ? `${b}/dashboard` : '/'}>
        <i>G</i>GlobalPay.bt
      </Link>
      <div className="sp" />
      {role ? (
        <>
          {role !== 'Admin' && (
            <Link className="bell" href={`${b}/notifications`} aria-label="Notifications">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {bell > 0 && <b>{bell}</b>}
            </Link>
          )}
          <div className="dd">
            <button className="av" onClick={() => setO(!o)} aria-label="Profile menu">
              {name
                .split(' ')
                .map((x) => x[0])
                .join('')
                .slice(0, 2)}
            </button>
            {o && (
              <div className="menu" onClick={() => setO(false)}>
                <div style={{ padding: '8px 12px' }}>
                  <b>{name}</b>
                  <br />
                  <small>{role}</small>
                </div>
                <hr />
                <Link href={`${b}/profile`}>Profile management</Link>
                {settings && <Link href={`${b}/settings`}>Settings</Link>}
                {role === 'Merchant' && <Link href="/merchant/reports">Statements</Link>}
                <a href="#help">Help &amp; Support</a>
              </div>
            )}
          </div>
          <Link className="btn" href="/">
            Log out
          </Link>
        </>
      ) : user ? (
        <>
          <small>{user}</small>
          <Link className="btn" href="/">
            Log out
          </Link>
        </>
      ) : (
        <>
          <Link className="btn alt" href="/">
            Sign in
          </Link>
          <Link className="btn" href="/register">
            Open account
          </Link>
        </>
      )}
    </header>
  );
}
export function Footer() {
  return (
    <footer className="ftr" id="help">
      <div className="g">
        <div>
          <div className="logo" style={{ color: '#fff' }}>
            <i style={{ color: 'var(--forest)' }}>G</i>GlobalPay.bt
          </div>
          <p>
            One signup, every Bhutanese payment channel. GlobalPay.bt is not a bank and never holds
            your funds or sees card details.
          </p>
        </div>
        <div>
          <h4>Help &amp; Support</h4>
          <a href="mailto:support@cloudbhutan.com">support@cloudbhutan.com</a>
          <a href="#">FAQs</a>
          <a href="#">Track a complaint</a>
        </div>
        <div>
          <h4>Legal &amp; Privacy</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
          <a href="#">Disclosures</a>
          <a href="#">Cookie settings</a>
        </div>
        <div>
          <h4>Settlement reference</h4>
          <p style={{ margin: 0 }}>
            Local payments settle via the RMA national payment system (SWIFT: RMABBTBT). Funds go
            directly to your own bank account.
          </p>
        </div>
      </div>
      <div className="c">
        © 2026 GlobalPay.bt · A Cloud Bhutan project · College of Science and Technology, Royal
        University of Bhutan. Prototype — figures are indicative.
      </div>
    </footer>
  );
}
export const Public = ({ children }: { children: any }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
);
export function Shell({
  role,
  menu,
  children,
  name = 'Pema Dorji',
}: {
  role: string;
  menu: string[][];
  children: any;
  name?: string;
}) {
  const { tab } = useParams() as any;
  const [notes] = useStore<any[]>('gp_notes', seedNotes);
  const [U] = useStore<any>('gp_user', { business: BIZ });
  const to = role.toLowerCase();
  const unread = notes.filter(
    (n: any) => n.to === to && !n.read && (to !== 'merchant' || n.biz === U.business),
  ).length;
  return (
    <>
      <Header
        role={role}
        name={name}
        bell={unread}
        settings={menu.some((m) => m[0] === 'settings')}
      />
      <div className="shell">
        <aside className="side">
          <small>{role} workspace</small>
          {menu.map(([k, l]) => (
            <Link key={k} href={`/${to}/${k}`} className={tab === k ? 'on' : ''}>
              {l}
              {k === 'notifications' && unread > 0 && <span className="badge n">{unread}</span>}
            </Link>
          ))}
        </aside>
        <main className="main" key={tab}>
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
export function Profile({ role, name, email }: { role: string; name: string; email: string }) {
  const [t, setT] = useState('Personal');
  const [m, toast] = useToast();
  const [mfa, setMfa] = useState(true);
  const [al, setAl] = useState(true);
  const [pw, setPw] = useState('');
  const [ses, setSes] = useState([
    ['Chrome · Windows · Phuntsholing', 'This device'],
    ['Safari · iPhone · Thimphu', '2 days ago'],
    ['Firefox · Linux · Paro', '12 days ago'],
  ]);
  const sc = PW_RULES.filter(([, r]) => r.test(pw)).length;
  return (
    <>
      <h2>Profile management</h2>
      <div className="card" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <div className="av lg">
          {name
            .split(' ')
            .map((x) => x[0])
            .join('')}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0 }}>{name}</h3>
          <small>
            {email} · {role}
          </small>
          <div style={{ marginTop: 10, maxWidth: 320 }}>
            <small>Profile 85% complete</small>
            <div className="bar">
              <i style={{ width: '85%' }} />
            </div>
          </div>
        </div>
        <span className="badge b-ok">Identity verified</span>
      </div>
      <div className="tabs">
        {['Personal', 'Security', 'Sessions', 'Preferences', 'Activity'].map((x) => (
          <button key={x} className={t === x ? 'on' : ''} onClick={() => setT(x)}>
            {x}
          </button>
        ))}
      </div>
      <div className="card">
        {t === 'Personal' && (
          <>
            <div className="row">
              <div>
                <label>Full name</label>
                <input defaultValue={name} />
              </div>
              <div>
                <label>Designation</label>
                <input
                  defaultValue={role === 'Merchant' ? 'Owner / authorised representative' : role}
                />
              </div>
            </div>
            <div className="row">
              <div>
                <label>Email (verified)</label>
                <input defaultValue={email} />
              </div>
              <div>
                <label>Mobile (+975, verified)</label>
                <input defaultValue="+975 17123456" />
              </div>
            </div>
            <div className="row">
              <div>
                <label>CID number</label>
                <input defaultValue="•••••••••••" readOnly />
              </div>
              <div>
                <label>Photo</label>
                <input type="file" />
              </div>
            </div>
            <p>
              <button onClick={() => toast('Profile saved')}>Save changes</button>
            </p>
          </>
        )}
        {t === 'Security' && (
          <>
            <div className="line">
              <div>
                <b>Two-factor authentication</b>
                <br />
                <small>Require an OTP at every sign-in</small>
              </div>
              <Sw on={mfa} set={setMfa} />
            </div>
            <div className="line">
              <div>
                <b>Sign-in alerts</b>
                <br />
                <small>Email me when a new device signs in</small>
              </div>
              <Sw on={al} set={setAl} />
            </div>
            <h3 style={{ marginTop: 18 }}>Change password</h3>
            <div className="row">
              <div>
                <PasswordField label="Current password" value="" onChange={() => {}} />
              </div>
              <div>
                <PasswordField label="New password" value={pw} onChange={setPw} rules />
              </div>
            </div>
            <p>
              <button
                disabled={sc < PW_RULES.length}
                onClick={() => {
                  setPw('');
                  toast('Password updated');
                }}
              >
                Update password
              </button>
            </p>
          </>
        )}
        {t === 'Sessions' &&
          ses.map((s, i) => (
            <div className="line" key={i}>
              <div>
                <b>{s[0]}</b>
                <br />
                <small>{s[1]}</small>
              </div>
              {i > 0 ? (
                <button
                  className="alt"
                  onClick={() => {
                    setSes(ses.filter((_, j) => j !== i));
                    toast('Session signed out');
                  }}
                >
                  Sign out
                </button>
              ) : (
                <span className="badge b-ok">Current</span>
              )}
            </div>
          ))}
        {t === 'Preferences' && (
          <div className="row">
            <div>
              <label>Language</label>
              <select>
                <option>English</option>
                <option>ཇོང་ཁ (Dzongkha)</option>
              </select>
            </div>
            <div>
              <label>Time zone</label>
              <select>
                <option>Asia/Thimphu (UTC+6)</option>
              </select>
            </div>
            <div>
              <label>Date format</label>
              <select>
                <option>YYYY-MM-DD</option>
                <option>DD/MM/YYYY</option>
              </select>
            </div>
            <div>
              <label>Monthly statement</label>
              <select>
                <option>Email PDF</option>
                <option>Do not send</option>
              </select>
            </div>
          </div>
        )}
        {t === 'Activity' && (
          <Table
            cols={['When', 'Event', 'Device']}
            rows={[
              ['Today 09:12', 'Signed in', 'Chrome · Windows'],
              ['Yesterday', 'Password policy acknowledged', 'Chrome · Windows'],
              ['2 days ago', 'Signed in', 'Safari · iPhone'],
            ]}
          />
        )}
      </div>
      <Toast m={m} />
    </>
  );
}

export const PayHead = () => (
  <header className="hdr">
    <span className="logo">
      <i>G</i>GlobalPay.bt
    </span>
    <div className="sp" />
    <span className="badge b-ok">Secure payment</span>
  </header>
);
export function FileSlot({
  label,
  file,
  onFile,
}: {
  label: string;
  file?: File;
  onFile: (f?: File) => void;
}) {
  const [err, setErr] = useState('');
  const [over, setOver] = useState(false);
  const id = 'f' + label.replace(/\W/g, '');
  const take = (f?: File) => {
    if (!f) return;
    if (!/(pdf|jpe?g|png)$/i.test(f.name)) {
      setErr('Only PDF, JPG or PNG files');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setErr('File is over 5 MB (prototype limit)');
      return;
    }
    setErr('');
    onFile(f);
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <label>{label}</label>
      {!file ? (
        <label
          htmlFor={id}
          className={'drop' + (over ? ' over' : '')}
          style={{ display: 'block', margin: 0 }}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            take(e.dataTransfer.files[0]);
          }}
        >
          Drop a file here or <u>browse</u>
          <br />
          <small>PDF, JPG or PNG</small>
        </label>
      ) : (
        <div
          className="line"
          style={{ border: '1px solid var(--line)', borderRadius: 14, padding: '10px 14px' }}
        >
          <div>
            {/image/.test(file.type) && (
              <img
                src={URL.createObjectURL(file)}
                alt=""
                style={{ height: 44, borderRadius: 8, marginRight: 10, verticalAlign: 'middle' }}
              />
            )}
            <b>{file.name}</b> <small>{(file.size / 1024).toFixed(0)} KB</small>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a className="btn alt" href={URL.createObjectURL(file)} target="_blank">
              View
            </a>
            <label
              htmlFor={id}
              className="btn alt"
              style={{ margin: 0, cursor: 'pointer', color: 'var(--ink)', fontSize: 16 }}
            >
              Replace
            </label>
            <button className="alt" onClick={() => onFile(undefined)}>
              Remove
            </button>
          </div>
        </div>
      )}
      <input
        id={id}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        hidden
        onChange={(e) => {
          take(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      {err && <small style={{ color: 'var(--bad)' }}>{err}</small>}
    </div>
  );
}
export function InvoiceView({ iv }: { iv: any }) {
  const c = calc(iv);
  const k = iv.cur === 'Nu.' ? 'Nu.' : iv.cur;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 18,
        padding: 20,
        margin: '12px 0',
      }}
    >
      <div className="line" style={{ border: 0, padding: 0 }}>
        <div>
          <h3 style={{ margin: 0 }}>Invoice {iv.no}</h3>
          <small>
            Issued {iv.date} · Provider: {iv.cur === 'Nu.' ? 'RMA' : 'BoB'}
          </small>
        </div>
        <span
          className={
            'badge ' +
            (iv.status === 'Paid' ? 'b-ok' : iv.status === 'Cancelled' ? 'b-bad' : 'b-warn')
          }
        >
          {iv.status}
        </span>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <div>
          <small>From</small>
          <br />
          <b>{iv.merchant.name}</b>
          <br />
          {iv.merchant.addr}
          <br />
          {iv.merchant.phone} · {iv.merchant.email}
        </div>
        <div>
          <small>Bill to</small>
          <br />
          {iv.cust.email || '—'}
          <br />
          {iv.cust.mobile || '—'}
        </div>
      </div>
      <table style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {iv.items.map((i: any, x: number) => (
            <tr key={x}>
              <td>{i.d}</td>
              <td>{i.q}</td>
              <td>{money(+i.p, k)}</td>
              <td>{money(i.q * i.p, k)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: 'right', marginTop: 8 }}>
        Subtotal {money(c.sub, k)}
        <br />
        {c.disc > 0 && (
          <>
            Discount −{money(c.disc, k)}
            <br />
          </>
        )}
        {c.tax > 0 && (
          <>
            {iv.tax.type || 'Tax'} ({iv.tax.rate}%) {money(c.tax, k)}
            <br />
          </>
        )}
        {c.extra > 0 && (
          <>
            {iv.extra.label || 'Additional charges'} {money(c.extra, k)}
            <br />
          </>
        )}
        <b style={{ fontSize: 20 }}>Grand total {money(c.total, k)}</b>
      </div>
      {iv.notes && (
        <p>
          <small>Notes / terms: {iv.notes}</small>
        </p>
      )}
      {iv.txnRef && (
        <p>
          <small>
            Transaction reference: {iv.txnRef} · Paid {iv.paidAt}
          </small>
        </p>
      )}
    </div>
  );
}

export const PW_RULES: [string, RegExp][] = [
  ['At least 8 characters', /.{8,}/],
  ['At least one uppercase letter (A-Z)', /[A-Z]/],
  ['At least one lowercase letter (a-z)', /[a-z]/],
  ['At least one number (0-9)', /\d/],
  ['At least one symbol (for example ! @ # $)', /[^\w\s]/],
];
const Eye = ({ off }: { off: boolean }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);
export function PasswordField({
  value,
  onChange,
  label = 'Password',
  rules = false,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  rules?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <>
      <label>{label}</label>
      <div className="pw">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
        />
        <button
          type="button"
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow(!show)}
        >
          <Eye off={show} />
        </button>
      </div>
      {rules &&
        value.length > 0 &&
        PW_RULES.map(([t, r]) => (
          <div key={t} className={'rule ' + (r.test(value) ? 'ok' : 'no')}>
            {r.test(value) ? '✔' : '✖'} {t}
          </div>
        ))}
    </>
  );
}
export const Modal = ({ onClose, children }: { onClose: () => void; children: any }) => (
  <div className="modal" onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()}>{children}</div>
  </div>
);
