'use client';
import { useParams } from 'next/navigation';
import { Shell, Stat, Table, Profile } from '@/components/ui';
import { useStore } from '@/lib/store';
import { apps, txns, staff, audit, providers } from '@/lib/data';
const M = [
  ['dashboard', 'Dashboard'],
  ['employees', 'Employees'],
  ['applications', 'Applications'],
  ['providers', 'Providers'],
  ['documents', 'Document Monitoring'],
  ['transactions', 'Transactions'],
  ['reports', 'Reports'],
  ['audit', 'Audit Logs'],
  ['settings', 'Platform Settings'],
  ['profile', 'Profile'],
];
export default function P() {
  const { tab } = useParams() as any;
  const [A] = useStore('gp_apps', apps);
  if (tab === 'profile')
    return (
      <Shell role="Admin" menu={M} name="Admin">
        <Profile role="Admin" name="System Admin" email="admin@globalpay.bt" />
      </Shell>
    );
  return (
    <Shell role="Admin" menu={M} name="System Admin">
      <h2>{M.find((m) => m[0] === tab)?.[1]}</h2>
      <div className={tab === 'dashboard' ? '' : 'card'}>
        {tab === 'dashboard' && (
          <div className="grid">
            <Stat n={3} l="Merchants" />
            <Stat n={2} l="Providers" />
            <Stat n={2} l="Pending applications" />
            <Stat n={2} l="Active operators" />
            <Stat n={1} l="Alerts: expiring licence" />
          </div>
        )}
        {tab === 'employees' && (
          <>
            <p>
              <button>+ Add employee</button>
            </p>
            <Table cols={['Name', 'Role', 'Workload', 'Status']} rows={staff} />
          </>
        )}
        {tab === 'applications' && (
          <Table
            cols={['ID', 'Applicant', 'Provider', 'Submitted', 'Operator', 'Status']}
            rows={A.map((a) => [a.id, a.who, a.prov, a.date, a.op, a.status])}
          />
        )}
        {tab === 'providers' && (
          <Table
            cols={['Provider', 'Currency', 'Services', 'Status']}
            rows={providers.map((p) => [p.name, p.cur, p.services, 'Active'])}
          />
        )}
        {tab === 'documents' && (
          <Table
            cols={['Document', 'Merchant', 'State']}
            rows={[
              ['Trade License', 'Druk Trails', 'Verified'],
              ['CID', 'Himal Crafts', 'Pending'],
              ['Bank letter', 'Thimphu Bakehouse', 'Rejected'],
              ['Licence 2025', 'Paro Stay Hotel', 'Expired'],
            ]}
          />
        )}
        {tab === 'transactions' && (
          <Table cols={['ID', 'Date', 'Nu.', 'Provider', 'Status']} rows={txns} />
        )}
        {tab === 'reports' && (
          <div className="grid">
            <Stat n="14" l="Applications (Oct)" />
            <Stat n="9" l="Forwarded" />
            <Stat n="5" l="Approved" />
          </div>
        )}
        {tab === 'audit' && <Table cols={['Time', 'User', 'Action']} rows={audit} />}
        {tab === 'settings' && (
          <>
            <label>Role permissions</label>
            <select>
              <option>Operator: review & forward only</option>
            </select>
            <label>Session timeout (min)</label>
            <input defaultValue={15} />
            <label>Require MFA for staff</label>
            <select>
              <option>Yes</option>
            </select>
          </>
        )}
      </div>
    </Shell>
  );
}
