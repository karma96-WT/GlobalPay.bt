export const providers = [
  {
    id: 'rma',
    name: 'RMA (Payment Gateway)',
    cur: 'Nu. (BTN)',
    services: 'Local bank payments (BDBL, BNBL, BOBL, DPNBL, TBank, DK)',
    fee: 'Per RMA schedule',
    docs: [
      'Business/Trade License Copy',
      'Company Registration Document',
      'CID Copy of authorised representative',
      'Bank Account Confirmation Letter',
    ],
  },
  {
    id: 'bob',
    name: 'Bank of Bhutan (Card Zone)',
    cur: 'INR / USD',
    services: 'Visa & Mastercard e-commerce',
    fee: 'MDR 3.5% per transaction',
    docs: [
      'CID card of proprietor/manager',
      'Valid Trade License Copy',
      'Certificate of Incorporation (corporate)',
      'Passport-sized photograph',
      'Official-letterhead application (Govt. offices)',
    ],
  },
];
export const apps = [
  {
    id: 'GP-2610-0041',
    who: 'Druk Trails Pvt Ltd',
    prov: 'RMA',
    date: '2026-10-02',
    status: 'Approved',
    op: 'Pema D.',
  },
  {
    id: 'GP-2610-0042',
    who: 'Druk Trails Pvt Ltd',
    prov: 'BoB',
    date: '2026-10-02',
    status: 'Waiting',
    op: 'Pema D.',
  },
  {
    id: 'GP-2610-0050',
    who: 'Thimphu Bakehouse',
    prov: 'RMA',
    date: '2026-10-09',
    status: 'Pending',
    op: '—',
  },
  {
    id: 'GP-2610-0053',
    who: 'Himal Crafts',
    prov: 'BoB',
    date: '2026-10-10',
    status: 'Correction required',
    op: 'Sonam T.',
  },
  {
    id: 'GP-2610-0047',
    who: 'Paro Stay Hotel',
    prov: 'BoB',
    date: '2026-10-05',
    status: 'Rejected',
    op: 'Sonam T.',
  },
];
const dd = (n: number, t: string) =>
  new Date(Date.now() - n * 864e5).toISOString().slice(0, 10) + ' ' + t;
export const txns: any[] = [
  ['TX-88121', dd(0, '14:02'), 4500, 'RMA', 'Successful', 'INV-2026-0015', '620100000015', '00'],
  ['TX-88120', dd(0, '11:40'), 12800, 'RMA', 'Successful', 'INV-2026-0016', '620100000016', '00'],
  ['TX-88119', dd(1, '18:15'), 2300, 'RMA', 'Failed', 'INV-2026-0017', '620100000017', '51'],
  ['TX-88117', dd(1, '09:31'), 36000, 'BoB', 'Pending'],
  ['TX-88110', dd(3, '16:20'), 1500, 'RMA', 'Refunded'],
];
export const staff = [
  ['Pema Dorji', 'Operator', '12 open', 'Active'],
  ['Sonam Tshering', 'Operator', '7 open', 'Active'],
  ['Dechen Wangmo', 'Operator', '—', 'Deactivated'],
];
export const audit = [
  ['10:42', 'Pema Dorji', 'Forwarded GP-2610-0042 to BoB'],
  ['10:11', 'Sonam Tshering', 'Requested correction on GP-2610-0053'],
  ['09:58', 'Admin', 'Changed role permissions: Operator'],
  ['09:30', 'Pema Dorji', 'Downloaded CID copy, GP-2610-0041'],
];
export const cls = (s: string) =>
  /Approved|Successful|Verified|Active/.test(s)
    ? 'b-ok'
    : /Reject|Fail|Deactiv/.test(s)
      ? 'b-bad'
      : /Pending|Waiting|Correction|Refund/.test(s)
        ? 'b-warn'
        : '';

export const COND: Record<string, string> = {
  'Certificate of Incorporation (corporate)': 'Private limited',
  'Official-letterhead application (Govt. offices)': 'Government office',
};
export const calc = (iv: any) => {
  const sub = iv.items.reduce((a: number, i: any) => a + i.q * i.p, 0);
  const disc = iv.disc.type === 'pct' ? (sub * (+iv.disc.v || 0)) / 100 : +iv.disc.v || 0;
  const tax = ((sub - disc) * (+iv.tax.rate || 0)) / 100;
  const extra = +iv.extra.amt || 0;
  const r = (n: number) => Math.round(n * 100) / 100;
  return {
    sub: r(sub),
    disc: r(disc),
    tax: r(tax),
    extra: r(extra),
    total: r(sub - disc + tax + extra),
  };
};
export const money = (n: number, c = 'Nu.') =>
  `${c} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ---------------------------------------------------------------------------
// Demo seed data and shared helpers
// ---------------------------------------------------------------------------
export const BIZ = 'Druk Trails Pvt Ltd';
const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 864e5).toISOString();
export const ago = (at: string) => {
  const s = (Date.now() - new Date(at).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + ' min ago';
  if (s < 86400) return Math.floor(s / 3600) + ' h ago';
  return Math.floor(s / 86400) + ' d ago';
};
export const fmtSize = (b: number) =>
  b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';

const M0 = {
  name: BIZ,
  addr: 'Norzin Lam, Thimphu',
  phone: '+975 17123456',
  email: 'owner@druktrails.bt',
};
const mk = (
  no: string,
  d: number,
  item: string,
  q: number,
  p: number,
  status: string,
  over: any = {},
) => ({
  no,
  date: iso(d).slice(0, 10),
  cur: 'Nu.',
  merchant: M0,
  cust: { email: 'guest@example.com', mobile: '' },
  items: [{ d: item, q, p }],
  disc: { type: 'amt', v: 0 },
  tax: { type: '', rate: 0 },
  extra: { label: '', amt: 0 },
  notes: 'Payment due within 7 days.',
  status,
  benfId: 'BE00000585',
  benfBank: '01',
  sentTo: 'guest@example.com',
  sentAt: iso(d),
  ...over,
});
export const seedInvoices: any[] = [
  mk('INV-2026-0017', 1, 'Airport transfer', 1, 2300, 'Unpaid'),
  mk('INV-2026-0016', 0, 'Day tour – Paro', 1, 12800, 'Paid', {
    txnRef: '620100000016',
    paidAt: dd(0, '11:40'),
  }),
  mk('INV-2026-0015', 0, 'Cultural trek deposit', 1, 4500, 'Paid', {
    txnRef: '620100000015',
    paidAt: dd(0, '14:02'),
  }),
  mk('INV-2026-0014', 2, 'Hotel booking', 2, 3000, 'Unpaid'),
];

export const seedNotes: any[] = [
  {
    id: 'N1',
    to: 'merchant',
    biz: BIZ,
    cat: 'Application',
    title: 'RMA approved your application',
    body: 'Application GP-2610-0041 was approved. Nu. QR payments and links are now live.',
    at: iso(0.1),
    read: false,
  },
  {
    id: 'N2',
    to: 'merchant',
    biz: BIZ,
    cat: 'Payment',
    title: 'Payment TX-88121 received',
    body: 'Nu. 4,500 received through RMA for invoice INV-2026-0015.',
    at: iso(0.4),
    read: false,
  },
  {
    id: 'N3',
    to: 'merchant',
    biz: BIZ,
    cat: 'Payment',
    title: 'Payment TX-88119 failed',
    body: 'Nu. 2,300 failed with code 51 (Insufficient Funds). The customer can retry from the same link.',
    at: iso(1),
    read: true,
  },
  {
    id: 'N4',
    to: 'operator',
    cat: 'Application',
    title: 'New application from Thimphu Bakehouse',
    body: 'GP-2610-0050 (RMA) is waiting for document review.',
    at: iso(0.2),
    read: false,
  },
];
export const seedTickets: any[] = [
  {
    no: 'SUP-12',
    biz: BIZ,
    contact: { name: 'Karma Wangchuk', email: 'owner@druktrails.bt', phone: '+975 17123456' },
    subject: 'Refund query',
    cat: 'Refund',
    status: 'Open',
    created: iso(1),
    msgs: [
      {
        from: 'merchant',
        by: 'Karma Wangchuk',
        at: iso(1),
        body: 'A customer paid twice for the same invoice. How do I refund one of the payments?',
      },
    ],
  },
];
// A merchant's live connection to a provider (beneficiary ID is issued by the provider)
export const seedMpa: any[] = [
  { biz: BIZ, prov: 'RMA', benfId: 'BE00000585', bank: '01', on: true, ref: 'RMA/2026/0041' },
];

// ---- Team, roles and permissions (RBAC) ----
export const PLAN_SEATS: Record<string, number> = { Basic: 2, Gold: 10, Premium: Infinity };
export const PERMS: [string, string][] = [
  ['invoice.create', 'Create and send invoices'],
  ['invoice.view', 'View invoices'],
  ['payment.view', 'View transactions'],
  ['refund.issue', 'Issue refunds'],
  ['report.export', 'View and download reports'],
  ['provider.toggle', 'Turn payment providers on or off'],
  ['application.manage', 'Manage provider applications and documents'],
  ['developer.manage', 'Manage API keys and webhooks'],
  ['support.manage', 'Raise and follow support requests'],
  ['business.edit', 'Edit business profile'],
  ['team.manage', 'Invite members and assign roles'],
  ['plan.manage', 'Change plan and billing'],
];
const all = PERMS.map((p) => p[0]);
export const ROLES: any[] = [
  {
    code: 'MERCHANT_OWNER',
    name: 'Owner',
    desc: 'Full access including team and plan.',
    perms: all,
    system: true,
  },
  {
    code: 'MERCHANT_FINANCE',
    name: 'Finance',
    desc: 'Invoices, payments, refunds and reports.',
    perms: ['invoice.create', 'invoice.view', 'payment.view', 'refund.issue', 'report.export'],
    system: true,
  },
  {
    code: 'MERCHANT_DEVELOPER',
    name: 'Developer',
    desc: 'API keys and webhooks, read-only payments.',
    perms: ['invoice.view', 'payment.view', 'developer.manage'],
    system: true,
  },
  {
    code: 'MERCHANT_SUPPORT',
    name: 'Support',
    desc: 'Looks up payments and handles customer issues.',
    perms: ['invoice.view', 'payment.view', 'support.manage'],
    system: true,
  },
];
export const seedTeam: any[] = [
  {
    id: 'M1',
    name: 'Karma Wangchuk',
    email: 'owner@druktrails.bt',
    role: 'MERCHANT_OWNER',
    status: 'Active',
  },
  {
    id: 'M2',
    name: 'Tshewang Lhamo',
    email: 'tshewang@druktrails.bt',
    role: 'MERCHANT_FINANCE',
    status: 'Active',
  },
];
