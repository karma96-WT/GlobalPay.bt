'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Public, PasswordField, PW_RULES } from '@/components/ui';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('+975 ');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [terms, setTerms] = useState(false);

  const emailOk = /^\S+@\S+\.\S+$/.test(email);
  const mobileOk = /^\+975\d{8}$/.test(mobile.replace(/\s/g, ''));
  const passOk = PW_RULES.every(([, r]) => r.test(password));
  const ready = name.trim() && emailOk && mobileOk && passOk && otp.length === 6 && terms;

  const create = () => {
    localStorage.setItem('gp_user', JSON.stringify({ stage: 'new', email, name, business: '' }));
    router.push('/onboarding');
  };

  return (
    <Public>
      <div className="main" style={{ margin: '0 auto', maxWidth: 560 }}>
        <h2>Create your account</h2>
        <p>
          <small>
            Step 1 of 2. Next you can choose to verify your business and become a merchant.
          </small>
        </p>
        <div className="card">
          <label>Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />

          <label>Email</label>
          <input
            value={email}
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
          {email && !emailOk && (
            <small style={{ color: 'var(--bad)' }}>
              Enter a valid email address, for example you@example.com
            </small>
          )}

          <label>Mobile (+975 followed by 8 digits)</label>
          <input value={mobile} onChange={(e) => setMobile(e.target.value)} />
          {mobile.trim().length > 5 && !mobileOk && (
            <small style={{ color: 'var(--bad)' }}>Use +975 followed by exactly 8 digits</small>
          )}

          <PasswordField value={password} onChange={setPassword} rules />

          <label>Verification code</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              maxLength={6}
              value={otp}
              placeholder="6-digit OTP"
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            <button className="alt" disabled={!emailOk || !mobileOk} onClick={() => setSent(true)}>
              {sent ? 'Resend' : 'Send OTP'}
            </button>
          </div>
          {sent && <small>OTP sent to your email and mobile (prototype: any 6 digits).</small>}

          <label
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              color: 'inherit',
              fontSize: 14,
            }}
          >
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />I
            accept the Terms of Use and Privacy Policy
          </label>
          <p>
            <button disabled={!ready} onClick={create}>
              Create account
            </button>
            <Link href="/" style={{ marginLeft: 12 }}>
              Already registered? Sign in
            </Link>
          </p>
        </div>
      </div>
    </Public>
  );
}
