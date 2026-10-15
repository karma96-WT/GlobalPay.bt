'use client';
import { useEffect } from 'react';

// Bump this when demo data changes shape so old browser data is cleared once.
const DATA_VERSION = '4';

export default function Boot() {
  useEffect(() => {
    if (localStorage.getItem('gp_ver') === DATA_VERSION) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith('gp_') && k !== 'gp_user')
      .forEach((k) => localStorage.removeItem(k));
    localStorage.setItem('gp_ver', DATA_VERSION);
    window.location.reload();
  }, []);
  return null;
}
