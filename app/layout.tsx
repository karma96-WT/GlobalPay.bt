import './globals.css';
import Boot from '@/components/Boot';
export const metadata = { title: 'GlobalPay.bt — prototype' };
export default function L({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Boot />
        {children}
      </body>
    </html>
  );
}
