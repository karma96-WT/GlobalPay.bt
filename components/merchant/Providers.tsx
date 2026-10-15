'use client';
import { Badge, Sw, Toast, useToast } from '@/components/ui';
import { providers } from '@/lib/data';
import { useMerchant } from '@/lib/merchant';
import { pushNote } from '@/lib/notify';

export default function Providers() {
  const { U, mpa, setMpa, conn, approved } = useMerchant();
  const [msg, toast] = useToast();

  const toggle = (prov: string, name: string, on: boolean) => {
    const rest = mpa.filter((m) => !(m.biz === U.business && m.prov === prov));
    setMpa([...rest, { ...(conn(prov) || { biz: U.business, prov }), on }]);
    pushNote({
      to: 'merchant',
      biz: U.business,
      cat: 'Provider',
      title: `${name} ${on ? 'enabled' : 'paused'}`,
      body: on
        ? 'Customers can pay through this provider again.'
        : 'New invoices and payment links will not use this provider until you enable it.',
    });
    toast(`${name} ${on ? 'enabled' : 'paused'}`);
  };

  return (
    <>
      {providers.map((p) => {
        const code = p.id === 'rma' ? 'RMA' : 'BoB';
        const done = approved(code);
        const c = conn(code);
        const on = c?.on !== false;
        return (
          <div className="card hov" key={p.id}>
            <div className="line" style={{ border: 0, padding: 0 }}>
              <div>
                <b style={{ fontSize: 18 }}>{p.name}</b>{' '}
                <Badge s={done ? (on ? 'Active' : 'Paused') : 'Waiting'} />
                <br />
                <small>
                  {p.services} · {p.cur}
                </small>
                {done && c?.benfId && (
                  <>
                    <br />
                    <small>
                      {code === 'RMA' ? 'Beneficiary ID' : 'Merchant ID'}: <b>{c.benfId}</b>
                      {c.bank && ` · Bank code ${c.bank}`}
                    </small>
                  </>
                )}
              </div>
              {done ? (
                <div style={{ textAlign: 'right' }}>
                  <Sw on={on} set={(v) => toggle(code, p.name, v)} />
                  <br />
                  <small>{on ? 'Accepting payments' : 'Paused'}</small>
                </div>
              ) : (
                <small>Toggle available after approval</small>
              )}
            </div>
            {done && !on && (
              <div className="note warn" style={{ marginTop: 12 }}>
                Paused: hidden from new invoices and links. Unpaid links for this provider will not
                work until you enable it again.
              </div>
            )}
          </div>
        );
      })}
      <button
        className="alt"
        onClick={() => toast('Documents on file are reused, so no new account is needed')}
      >
        Request another provider
      </button>
      <Toast m={msg} />
    </>
  );
}
