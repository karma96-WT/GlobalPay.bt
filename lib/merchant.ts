'use client';
import { useStore } from './store';
import { apps, txns, seedInvoices, seedMpa, providers, BIZ } from './data';

export const DEFAULT_USER = {
  stage: 'merchant',
  business: BIZ,
  name: 'Karma Wangchuk',
  email: 'owner@druktrails.bt',
  addr: 'Norzin Lam, Thimphu',
  phone: '+975 17123456',
};
export const EDITABLE = ['Pending', 'Correction required'];

/** Documents of an application; demo applications get the provider's list as placeholders. */
export const docsOf = (app: any) =>
  app.docs?.length
    ? app.docs
    : (providers.find((p) => p.id === app.prov.toLowerCase())?.docs || []).map((n: string) => ({
        n,
        state: 'Uploaded',
        demo: true,
      }));

/** Everything the merchant portal needs about the signed-in business. */
export function useMerchant() {
  const [U] = useStore<any>('gp_user', DEFAULT_USER);
  const [A, setA] = useStore<any[]>('gp_apps', apps);
  const [mpa, setMpa] = useStore<any[]>('gp_mpa', seedMpa);
  const [T] = useStore<any[]>('gp_txns', txns);
  const [I, setI] = useStore<any[]>('gp_invoices', seedInvoices);

  const mine = A.filter((a) => a.who === U.business);
  const conn = (prov: string) => mpa.find((m) => m.biz === U.business && m.prov === prov);
  const approved = (prov: string) => mine.some((a) => a.prov === prov && a.status === 'Approved');
  const live = (prov: string) => approved(prov) && conn(prov)?.on !== false;
  const ok = { rma: live('RMA'), bob: live('BoB') };
  const myTx = T.filter((t) => (t[8] ? t[8] === U.business : U.business === BIZ));
  const myInv = I.filter((i) => i.merchant.name === U.business);
  return { U, A, setA, mpa, setMpa, mine, conn, approved, ok, T: myTx, I, setI, myInv };
}
