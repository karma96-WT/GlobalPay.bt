'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Public, PasswordField } from '@/components/ui';
export default function Home() {
  const r = useRouter();
  const [otp, setOtp] = useState(false);
  const [pw, setPw] = useState('password123');
  const [em, setEm] = useState('owner@druktrails.bt');
  return (
    <Public>
      <div className="hero">
        <div className="box">
          <div>
            <h1>One signup. Every payment.</h1>
            <p style={{ fontSize: 19, color: 'var(--mut)', maxWidth: 480 }}>
              Accept Nu. bank payments and international cards through one platform. Banks approve —
              GlobalPay connects. We never hold your money.
            </p>
            <p>
              <Link className="btn" href="/register">
                Open merchant account
              </Link>
            </p>
          </div>
          <div className="card" style={{ boxShadow: '0 20px 50px #16330018' }}>
            <h3>Sign in</h3>
            {!otp ? (
              <>
                <label>Email or registered mobile (+975)</label>
                <input value={em} onChange={(e) => setEm(e.target.value)} />
                <PasswordField value={pw} onChange={setPw} />
                <p>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Prototype: reset link would be emailed.');
                    }}
                  >
                    Forgot password?
                  </a>
                </p>
                <button onClick={() => setOtp(true)}>Sign in</button>
              </>
            ) : (
              <>
                <label>Enter 6-digit OTP (MFA)</label>
                <input maxLength={6} defaultValue="123456" />
                <p>
                  <button
                    onClick={() => {
                      let u: any = null;
                      try {
                        u = JSON.parse(localStorage.getItem('gp_user') || 'null');
                      } catch {}
                      if (em === 'owner@druktrails.bt') {
                        localStorage.setItem(
                          'gp_user',
                          JSON.stringify({
                            stage: 'merchant',
                            business: 'Druk Trails Pvt Ltd',
                            name: 'Karma Wangchuk',
                            email: em,
                            addr: 'Norzin Lam, Thimphu',
                            phone: '+975 17123456',
                          }),
                        );
                        r.push('/merchant/dashboard');
                      } else if (u && u.email === em && u.stage !== 'new') {
                        r.push('/merchant/dashboard');
                      } else {
                        if (!u || u.email !== em)
                          localStorage.setItem(
                            'gp_user',
                            JSON.stringify({
                              stage: 'new',
                              email: em,
                              name: em.split('@')[0],
                              business: '',
                            }),
                          );
                        r.push('/onboarding');
                      }
                    }}
                  >
                    Verify
                  </button>
                </p>
              </>
            )}
            <hr />
            <small>
              Demo: owner@druktrails.bt is an existing merchant; any other email is treated as a
              first-time user.
            </small>
            <p style={{ margin: '6px 0' }}>
              <small>Quick access</small>
            </p>
            <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '6px 0 0' }}>
              <Link className="btn alt" href="/merchant/dashboard">
                Merchant
              </Link>
              <Link className="btn alt" href="/operator/dashboard">
                Operator
              </Link>
              <Link className="btn alt" href="/admin/dashboard">
                Admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Public>
  );
}
