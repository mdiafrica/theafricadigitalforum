// src/components/CookieConsent.jsx
import { useEffect, useState } from 'react';
import styles from '../Styles/components/CookieConsent.module.css';
import { 
  setCookie, 
  hasCookieConsent, 
  getCookieConsent, 
  eraseCookie,
  getCookieCount
} from '../utils/cookies';

const COOKIE_CATEGORIES = [
  {
    id: 'essential',
    label: 'Essential',
    description: 'Necessary for the technical operation and security of the site. Cannot be disabled.',
    icon: 'ti-shield',
    required: true,
    alwaysOn: true,
  },
  {
    id: 'analytics',
    label: 'Analytical',
    description: 'Allow us to measure audience and understand which sections (e.g., Startup Village, AI Arena) interest our visitors.',
    icon: 'ti-chart-bar',
    required: false,
    alwaysOn: false,
  },
  {
    id: 'preference',
    label: 'Preference',
    description: 'Used for automatic language detection (French/English) based on your geolocation.',
    icon: 'ti-language',
    required: false,
    alwaysOn: false,
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Allow us to track the effectiveness of our campaigns for recruiting sponsors and speakers.',
    icon: 'ti-ad',
    required: false,
    alwaysOn: false,
  },
];

const DEFAULT_PREFERENCES = COOKIE_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat.alwaysOn;
  return acc;
}, {});

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);
  const [cookieCount, setCookieCount] = useState(0);

  useEffect(() => {
    const count = document.cookie.split(';').filter(c => c.trim()).length;
    setCookieCount(count);

    const consent = getCookieConsent();
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = COOKIE_CATEGORIES.reduce((acc, cat) => {
      acc[cat.id] = true;
      return acc;
    }, {});
    savePreferences(allAccepted, 'all');
  };

  const handleRejectNonEssential = () => {
    const rejected = COOKIE_CATEGORIES.reduce((acc, cat) => {
      acc[cat.id] = cat.alwaysOn;
      return acc;
    }, {});
    savePreferences(rejected, 'essential');
  };

  const handleSavePreferences = () => {
    savePreferences(preferences, 'custom');
  };

  const savePreferences = (prefs, type) => {
    setIsSaving(true);
    try {
      setCookie('adf_cookie_consent', JSON.stringify({
        preferences: prefs,
        type: type,
        timestamp: new Date().toISOString(),
      }), 365);
      
      applyCookieSettings(prefs);
      
      setTimeout(() => {
        setVisible(false);
        setIsSaving(false);
      }, 400);
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
      setIsSaving(false);
    }
  };

  const applyCookieSettings = (prefs) => {
    if (prefs.analytics) {
      console.log('✅ Analytics cookies enabled');
    } else {
      console.log('❌ Analytics cookies disabled');
    }
    
    if (prefs.preference) {
      console.log('✅ Preference cookies enabled (language detection)');
    } else {
      console.log('❌ Preference cookies disabled');
    }
    
    if (prefs.marketing) {
      console.log('✅ Marketing cookies enabled');
    } else {
      console.log('❌ Marketing cookies disabled');
    }
  };

  const togglePreference = (categoryId) => {
    const category = COOKIE_CATEGORIES.find(cat => cat.id === categoryId);
    if (category?.alwaysOn) return;
    
    setPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleResetConsent = () => {
    eraseCookie('adf_cookie_consent');
    window.location.reload();
  };

  // Navigation handler for SPA
  const handleNavigate = (page) => {
    window.dispatchEvent(new CustomEvent('navigate', { detail: page }));
    if (window.__setPage) {
      window.__setPage(page);
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-label="Cookie Consent">
      <div className={styles.banner}>
        <div className={`${styles.container} ${showDetails ? styles.expanded : ''}`}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerIcon}>
              <i className="ti ti-cookie" />
            </div>
            <div className={styles.headerContent}>
              <h3 className={styles.title}>🍪 Cookie Preferences</h3>
              <p className={styles.description}>
                We use cookies to enhance your experience on the Africa Digital Forum platform. 
                Choose your preferences below.
              </p>
            </div>
          </div>

          {/* Cookie Badge */}
          <div className={styles.cookieBadge}>
            <i className="ti ti-info-circle" />
            <span>{cookieCount} active cookies on this site</span>
          </div>

          {/* Quick Actions */}
          <div className={styles.actions}>
            <button 
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleAcceptAll}
              disabled={isSaving}
            >
              <i className="ti ti-check" />
              Accept All
            </button>
            <button 
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={handleRejectNonEssential}
              disabled={isSaving}
            >
              <i className="ti ti-x" />
              Reject Non-Essential
            </button>
            <button 
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={() => setShowDetails(!showDetails)}
              disabled={isSaving}
            >
              <i className={`ti ${showDetails ? 'ti-chevron-up' : 'ti-settings'}`} />
              {showDetails ? 'Hide Settings' : 'Customize'}
            </button>
          </div>

          {/* Cookie Categories */}
          {showDetails && (
            <div className={styles.categories}>
              {COOKIE_CATEGORIES.map((category) => (
                <div key={category.id} className={styles.category}>
                  <div className={styles.categoryRow}>
                    <div className={styles.categoryInfo}>
                      <i className={`ti ${category.icon}`} />
                      <div>
                        <div className={styles.categoryLabel}>
                          {category.label}
                          {category.alwaysOn && (
                            <span className={styles.badgeRequired}>Required</span>
                          )}
                        </div>
                        <p className={styles.categoryDesc}>{category.description}</p>
                      </div>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={preferences[category.id]}
                        onChange={() => togglePreference(category.id)}
                        disabled={category.alwaysOn || isSaving}
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>
                </div>
              ))}

              <button 
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
                onClick={handleSavePreferences}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <i className="ti ti-loader" />
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="ti ti-device-floppy" />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          )}

          {/* Footer */}
          <div className={styles.footer}>
            <button 
              className={styles.footerLink}
              onClick={() => handleNavigate('privacy')}
            >
              <i className="ti ti-lock" />
              Privacy Policy
            </button>
            <span className={styles.footerDivider}>•</span>
            <button 
              className={styles.footerLink}
              onClick={() => handleNavigate('terms')}
            >
              <i className="ti ti-file-text" />
              Terms of Use
            </button>
            <span className={styles.footerDivider}>•</span>
            <button className={styles.footerLink} onClick={handleResetConsent}>
              <i className="ti ti-refresh" />
              Reset Consent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}