'use client';
import { useState } from 'react';
import { Toast, useToast } from '@/components/ui';
import { PERMS, PLAN_SEATS, ROLES, seedTeam } from '@/lib/data';
import { useMerchant } from '@/lib/merchant';
import { pushNote } from '@/lib/notify';
import { useStore } from '@/lib/store';

/**
 * Team and access control.
 *  - GlobalPay.bt defines the list of permissions and four standard roles.
 *  - The merchant assigns a role to each member. An Owner may also build
 *    custom roles from the permission list.
 *  - Flow: invite (email + role) → invited → member accepts → active.
 */
export default function Team() {
  const { U } = useMerchant();
  const [team, setTeam] = useStore<any[]>('gp_team', seedTeam);
  const [plan, setPlan] = useStore<string>('gp_plan', 'Basic');
  const [custom, setCustom] = useStore<any[]>('gp_roles', []);
  const [msg, toast] = useToast();
  const [invite, setInvite] = useState({ email: '', role: 'MERCHANT_FINANCE' });
  const [draft, setDraft] = useState<{ name: string; perms: string[] } | null>(null);

  const roles = [...ROLES, ...custom];
  const roleName = (code: string) => roles.find((r) => r.code === code)?.name || code;
  const limit = PLAN_SEATS[plan];
  const full = team.length >= limit;
  const owners = team.filter((m) => m.role === 'MERCHANT_OWNER' && m.status === 'Active').length;
  const note = (title: string, body: string) =>
    pushNote({ to: 'merchant', biz: U.business, cat: 'Team', title, body });
  const emailOk =
    /^\S+@\S+\.\S+$/.test(invite.email) &&
    !team.some((m) => m.email.toLowerCase() === invite.email.toLowerCase());

  const sendInvite = () => {
    const name = invite.email.split('@')[0];
    setTeam([
      ...team,
      { id: 'M' + Date.now(), name, email: invite.email, role: invite.role, status: 'Invited' },
    ]);
    note('Invitation sent', `${invite.email} was invited as ${roleName(invite.role)}.`);
    toast('Invitation emailed to ' + invite.email);
    setInvite({ email: '', role: 'MERCHANT_FINANCE' });
  };
  const patch = (id: string, p: any) =>
    setTeam(team.map((m) => (m.id === id ? { ...m, ...p } : m)));

  return (
    <>
      <h3>Team members</h3>
      <div className="line" style={{ border: 0 }}>
        <small>
          {team.length} of {limit === Infinity ? 'unlimited' : limit} seats used on the {plan} plan
        </small>
        {limit !== Infinity && (
          <div className="bar" style={{ width: 160 }}>
            <i style={{ width: Math.min(100, (team.length / limit) * 100) + '%' }} />
          </div>
        )}
      </div>

      {team.map((m) => {
        const lastOwner = m.role === 'MERCHANT_OWNER' && owners <= 1;
        return (
          <div className="line" key={m.id}>
            <div>
              <b>{m.name}</b>{' '}
              <span className={'badge ' + (m.status === 'Active' ? 'b-ok' : 'b-warn')}>
                {m.status}
              </span>
              <br />
              <small>{m.email}</small>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
              }}
            >
              <select
                style={{ width: 150 }}
                value={m.role}
                disabled={lastOwner}
                onChange={(e) => {
                  patch(m.id, { role: e.target.value });
                  note('Role changed', `${m.email} is now ${roleName(e.target.value)}.`);
                }}
              >
                {roles.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>
              {m.status === 'Invited' && (
                <>
                  <button className="alt" onClick={() => toast('Invitation re-sent to ' + m.email)}>
                    Resend
                  </button>
                  <button
                    className="alt"
                    onClick={() => {
                      patch(m.id, {
                        status: 'Active',
                        name: m.name.charAt(0).toUpperCase() + m.name.slice(1),
                      });
                      note('Invitation accepted', `${m.email} joined as ${roleName(m.role)}.`);
                    }}
                  >
                    Simulate accept
                  </button>
                </>
              )}
              <button
                className="alt"
                disabled={lastOwner}
                title={lastOwner ? 'A business needs at least one Owner' : ''}
                onClick={() => {
                  if (confirm(`Remove ${m.email}?`)) {
                    setTeam(team.filter((x) => x.id !== m.id));
                    note('Member removed', `${m.email} no longer has access.`);
                  }
                }}
              >
                {m.status === 'Invited' ? 'Revoke' : 'Remove'}
              </button>
            </div>
          </div>
        );
      })}

      <div className="card" style={{ marginTop: 16, background: 'var(--soft)', border: 0 }}>
        <h3>Invite a member</h3>
        {full ? (
          <>
            <p>
              Your {plan} plan includes {limit} team seats and all are in use. Switch to Gold to add
              up to 10 members.
            </p>
            {plan === 'Basic' && (
              <button
                onClick={() => {
                  setPlan('Gold');
                  note('Plan changed to Gold', 'Team seats increased to 10.');
                  toast('Plan switched to Gold');
                }}
              >
                Switch to Gold
              </button>
            )}
          </>
        ) : (
          <>
            <div className="row">
              <div>
                <label>Email address</label>
                <input
                  value={invite.email}
                  placeholder="name@company.bt"
                  onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                />
              </div>
              <div>
                <label>Role</label>
                <select
                  value={invite.role}
                  onChange={(e) => setInvite({ ...invite, role: e.target.value })}
                >
                  {roles.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p>
              <small>{roles.find((r) => r.code === invite.role)?.desc}</small>
            </p>
            <button disabled={!emailOk} onClick={sendInvite}>
              Send invitation
            </button>
            <p>
              <small>
                They receive an email, create or sign in to their GlobalPay.bt account, and accept.
                The role applies as soon as they accept.
              </small>
            </p>
          </>
        )}
      </div>

      <h3 style={{ marginTop: 24 }}>Roles and permissions</h3>
      <p>
        <small>
          GlobalPay.bt defines the permissions and four standard roles. You assign them to members
          {'. '}Owners can also create custom roles.
        </small>
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table className="matrix">
          <thead>
            <tr>
              <th>Permission</th>
              {roles.map((r) => (
                <th key={r.code}>{r.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMS.map(([code, label]) => (
              <tr key={code}>
                <td>{label}</td>
                {roles.map((r) => (
                  <td key={r.code}>{r.perms.includes(code) ? '✔' : '–'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!draft ? (
        <p>
          <button className="alt" onClick={() => setDraft({ name: '', perms: [] })}>
            + Create custom role
          </button>
        </p>
      ) : (
        <div className="card" style={{ background: 'var(--soft)', border: 0, marginTop: 12 }}>
          <label>Role name</label>
          <input
            value={draft.name}
            placeholder="e.g. Sales"
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <label>Permissions</label>
          {PERMS.map(([code, label]) => (
            <label
              key={code}
              style={{ display: 'flex', gap: 8, color: 'inherit', margin: '4px 0' }}
            >
              <input
                type="checkbox"
                checked={draft.perms.includes(code)}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    perms: e.target.checked
                      ? [...draft.perms, code]
                      : draft.perms.filter((x) => x !== code),
                  })
                }
              />
              {label}
            </label>
          ))}
          <p style={{ display: 'flex', gap: 8 }}>
            <button
              disabled={!draft.name.trim() || !draft.perms.length}
              onClick={() => {
                setCustom([
                  ...custom,
                  {
                    code: 'CUSTOM_' + draft.name.toUpperCase().replace(/\W+/g, '_'),
                    name: draft.name.trim(),
                    desc: 'Custom role.',
                    perms: draft.perms,
                    system: false,
                  },
                ]);
                note(
                  'Custom role created',
                  `"${draft.name.trim()}" can now be assigned to members.`,
                );
                setDraft(null);
              }}
            >
              Save role
            </button>
            <button className="alt" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </p>
        </div>
      )}
      <Toast m={msg} />
    </>
  );
}
