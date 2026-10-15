import { read, write } from './store';
import { seedNotes } from './data';

export type Audience = 'merchant' | 'operator' | 'admin';

/** Add a notification for a role (and, for merchants, one specific business). */
export function pushNote(n: {
  to: Audience;
  biz?: string;
  cat: string;
  title: string;
  body: string;
}) {
  const all = read<any[]>('gp_notes', seedNotes);
  const note = {
    ...n,
    id: 'N' + Date.now() + Math.random().toString(36).slice(2, 6),
    at: new Date().toISOString(),
    read: false,
  };
  write('gp_notes', [note, ...all]);
}
