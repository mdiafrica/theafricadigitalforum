import { useEffect, useState } from 'react';
import styles from '../Styles/components/CookieConsent.module.css';
import { setCookie, hasCookieConsent } from '../utils/cookies';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasCookieConsent()) setVisible(true);
  }, []);

  const acceptAll = () => {
    setCookie('adf_cookie_consent', 'all', 365);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-live="polite">
      <div className={styles.container}>
        <div className={styles.copy}>
          <strong>We use cookies</strong>
          <p>
            We use cookies to improve your experience. By continuing, you accept our use of cookies.
          </p>
        </div>

        <div className={styles.actions}>
          <button className={styles.secondary} onClick={() => { setVisible(false); }}>
            Dismiss
          </button>
          <button className={styles.primary} onClick={acceptAll}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
