import React, { useEffect } from 'react';

/**
 * @deprecated
 * Di v3 Enterprise, fungsi PatientHeader telah digantikan sepenuhnya 
 * oleh PatientContextBar.jsx sebagai Single Source of Truth terpusat.
 */
export default function PatientHeader() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '⚠️ [DEPRECATED] PatientHeader.jsx sudah tidak digunakan lagi di V3. Gunakan PatientContextBar.jsx sebagai komponen terpusat.'
      );
    }
  }, []);

  return null;
}