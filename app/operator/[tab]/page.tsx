'use client';
import { useParams } from 'next/navigation';
import { Shell, Stat, Profile } from '@/components/ui';
import Notes from '@/components/Notes';
import Inbox from '@/components/operator/Inbox';
import Responses from '@/components/operator/Responses';
import SupportDesk from '@/components/operator/SupportDesk';
import { apps, seedTickets } from '@/lib/data';
import { useStore } from '@/lib/store';

const MENU = [
  ['dashboard', 'Dashboard'],
  ['inbox', 'Application Inbox'],
  ['responses', 'Provider Responses'],
  ['support', 'Support'],
  ['notifications', 'Notifications'],
  ['profile', 'Profile'],
];

export default function OperatorPage() {
  const { tab } = useParams() as { tab: string };
  const [list] = useStore<any[]>('gp_apps', apps);
  const [tickets] = useStore<any[]>('gp_tickets', seedTickets);
  const count = (s: string) => list.filter((a) => a.status === s).length;

  if (tab === 'profile') {
    return (
      <Shell role="Operator" menu={MENU}>
        <Profile role="Operator" name="Pema Dorji" email="pema@globalpay.bt" />
      </Shell>
    );
  }
  return (
    <Shell role="Operator" menu={MENU}>
      <h2>{MENU.find((m) => m[0] === tab)?.[1]}</h2>
      {tab === 'dashboard' && (
        <div className="grid">
          {['Approved', 'Pending', 'Waiting', 'Rejected', 'Correction required'].map((s) => (
            <Stat key={s} n={count(s)} l={s} />
          ))}
          <Stat
            n={tickets.filter((t) => t.status !== 'Resolved').length}
            l="Open support requests"
          />
        </div>
      )}
      {tab === 'inbox' && <Inbox />}
      {tab === 'responses' && <Responses />}
      {tab === 'support' && <SupportDesk />}
      {tab === 'notifications' && <Notes to="operator" />}
    </Shell>
  );
}
