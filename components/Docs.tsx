'use client';
import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui';
import { getFile, downloadFile, putFile } from '@/lib/files';
import { fmtSize } from '@/lib/data';

/** Preview window for a stored PDF or image. */
export function Preview({
  fileKey,
  name,
  onClose,
}: {
  fileKey: string;
  name: string;
  onClose: () => void;
}) {
  const [url, setUrl] = useState('');
  const [type, setType] = useState('');
  useEffect(() => {
    let u = '';
    getFile(fileKey).then((f) => {
      if (!f) return;
      u = URL.createObjectURL(f);
      setUrl(u);
      setType(f.type);
    });
    return () => u && URL.revokeObjectURL(u);
  }, [fileKey]);
  return (
    <Modal onClose={onClose}>
      <div className="line" style={{ border: 0 }}>
        <h3 style={{ margin: 0 }}>{name}</h3>
        <button className="alt" onClick={onClose}>
          Close
        </button>
      </div>
      {!url ? (
        <p>Loading…</p>
      ) : /pdf/.test(type) ? (
        <iframe src={url} title={name} style={{ width: '100%', height: '70vh', border: 0 }} />
      ) : (
        <img src={url} alt={name} style={{ maxWidth: '100%', borderRadius: 12 }} />
      )}
    </Modal>
  );
}

/**
 * One uploaded document: preview and download for anyone, replace for the
 * merchant while the application has not been forwarded, accept/return for operators.
 */
export function DocRow({
  appId,
  doc,
  editable = false,
  onReplace,
  children,
}: {
  appId: string;
  doc: any;
  editable?: boolean;
  onReplace?: (meta: any) => void;
  children?: any;
}) {
  const key = `${appId}|${doc.n}`;
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState('');
  const replace = async (f?: File) => {
    if (!f) return;
    if (!/(pdf|jpe?g|png)$/i.test(f.name)) return setErr('Only PDF, JPG or PNG files');
    if (f.size > 5 * 1024 * 1024) return setErr('File is over 5 MB (prototype limit)');
    setErr('');
    await putFile(key, f);
    onReplace?.({
      ...doc,
      name: f.name,
      size: f.size,
      type: f.type,
      state: 'Uploaded',
      demo: false,
    });
  };
  return (
    <div className="line" style={{ alignItems: 'flex-start' }}>
      <div>
        <b>{doc.n}</b>{' '}
        <span
          className={
            'badge ' +
            (doc.state === 'Verified' ? 'b-ok' : doc.state === 'Returned' ? 'b-bad' : 'b-warn')
          }
        >
          {doc.state}
        </span>
        <br />
        <small>
          {doc.demo ? 'Demo record, no file stored' : `${doc.name} · ${fmtSize(doc.size)}`}
        </small>
        {doc.note && (
          <>
            <br />
            <small>Note: {doc.note}</small>
          </>
        )}
        {err && (
          <>
            <br />
            <small style={{ color: 'var(--bad)' }}>{err}</small>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {!doc.demo && (
          <button className="alt" onClick={() => setOpen(true)}>
            Preview
          </button>
        )}
        {!doc.demo && (
          <button className="alt" onClick={() => downloadFile(key, doc.name)}>
            Download
          </button>
        )}
        {editable && (
          <label
            className="btn alt"
            style={{ margin: 0, cursor: 'pointer', color: 'var(--ink)', fontSize: 16 }}
          >
            Change
            <input
              type="file"
              hidden
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                replace(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
        )}
        {children}
      </div>
      {open && <Preview fileKey={key} name={doc.name} onClose={() => setOpen(false)} />}
    </div>
  );
}
