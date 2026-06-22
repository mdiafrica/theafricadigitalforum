// Footer.jsx
import { useState, useEffect } from 'react';
import styles from '../Styles/components/Footer.module.css';
import Logo from '../Assets/Images/Logo.png';
import emailjs from '@emailjs/browser';

// ── EMAILJS CREDENTIALS ──
const EMAILJS_SERVICE_ID  = 'service_oqw60pt';
const EMAILJS_TEMPLATE_ID = 'template_t9fam69';
const EMAILJS_PUBLIC_KEY  = 'CRiokfjvcAxMuJHMB';

function Footer({ t, setPage }) {
  const currentYear = new Date().getFullYear();

  // ── Newsletter state ──
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  // ── Auto‑dismiss success after 3 seconds ──
  useEffect(() => {
    if (subscribeSuccess) {
      const timer = setTimeout(() => {
        setSubscribeSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [subscribeSuccess]);

  const normalizeLink = (value) =>
    value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  // ── Send email via EmailJS ──
  const sendEmailJS = async (subject, messageText) => {
    if (!email) {
      setSubscribeError('Please enter your email address.');
      return false;
    }

    setIsSubscribing(true);
    setSubscribeError('');
    setSubscribeSuccess(false);

    try {
      const templateParams = {
        name:       'Blog Subscriber',
        from_email: email,
        phone:      'N/A',
        company:    'ADF Blog Reader',
        subject:    subject,
        message:    messageText,
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      return true;
    } catch (error) {
      console.error('EmailJS error:', error);
      setSubscribeError('Something went wrong. Please try again.');
      return false;
    } finally {
      setIsSubscribing(false);
    }
  };

  // ── Handle subscribe click ──
  const handleSubscribe = async () => {
    if (!email) {
      setSubscribeError('Please enter your email address.');
      return;
    }

    const success = await sendEmailJS(
      'ADF Weekly Digest Subscription',
      'Thank you for subscribing to the ADF Digest! You will receive our weekly newsletter every Thursday.'
    );

    if (success) {
      setSubscribeSuccess(true);
      setEmail('');
    }
  };

  // ── Social media & link handlers ──
  const socialMediaNames = ['Facebook', 'LinkedIn', 'Twitter', 'Instagram', 'YouTube'];

  const handleSocialClick = (network) => {
    const socialLinks = {
      Facebook: 'https://www.facebook.com/theafricadigitalforum/',
      LinkedIn: 'https://www.linkedin.com/company/theafricadigitalforum/',
      Twitter: 'https://twitter.com/theafricadigitalforum',
      Instagram: 'https://www.instagram.com/theafricadigitalforum/',
      YouTube: 'https://youtube.com/@theafricadigitalforum',
    };
    const url = socialLinks[network];
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLinkClick = (link) => {
    if (socialMediaNames.includes(link)) {
      handleSocialClick(link);
      return;
    }

    if (link === 'Media & Digital Institute Africa') {
      window.open('https://mdiafrica.org/en/', '_blank', 'noopener,noreferrer');
      return;
    }

    const linkMap = {
      home: 'home',
      blog: 'blog',
      'about africa digital forum': 'about',
      'vision mission': 'about',
      'organizing directors': 'about',
      'our vision': 'about',
      'our mission': 'about',
      'why africa digital forum': 'whyadf',
      'host city lome togo': 'city',
      'host city': 'city',
      'contact us': 'contact',
      contact: 'contact',
      'privacy policy': 'contact',
      'terms of use': 'contact',
      'cookie policy': 'contact',
    };

    const key = normalizeLink(link);
    const page = linkMap[key] || (['home', 'blog'].includes(key) ? key : null);

    if (page && setPage) {
      setPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const socialNetworks = [
    { name: 'Facebook', icon: 'ti-brand-facebook', color: '#1877F2' },
    { name: 'LinkedIn', icon: 'ti-brand-linkedin', color: '#0A66C2' },
    { name: 'Twitter', icon: 'ti-brand-twitter', color: '#1DA1F2' },
    { name: 'Instagram', icon: 'ti-brand-instagram', color: '#E4405F' },
    { name: 'YouTube', icon: 'ti-brand-youtube', color: '#FF0000' },
  ];

  // ── Use nested footer translations ──
  const footer = t?.footer || {};
  const footerCols = footer.cols || [];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.mainGrid}>

          {/* Logo + Description */}
          <div className={styles.logoSection}>
            <div className={styles.logoWrapper}>
              <button
                className={styles.logoBoxImg}
                onClick={() => handleLinkClick('home')}
                aria-label="Go to home page"
              >
                <img
                  src={Logo}
                  alt="Africa Digital Forum"
                  className={styles.footerLogoImg}
                />
              </button>
            </div>

            <p className={styles.description}>
              {footer.desc}
            </p>

            <div className={styles.organizerText}>
              <span>{footer.organizer}: </span>
              <a
                href="https://mdiafrica.org/en/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.organizerLink}
              >
                {footer.orgName}
              </a>
            </div>

            {/* ── Newsletter Signup ── */}
            <div className={styles.newsletterSection}>
              <div className={styles.newsletterLabel}>
                Subscribe to our newsletter
              </div>

              {subscribeSuccess ? (
                <div className={styles.subscribeSuccessMsg}>
                  ✓ You're subscribed – check your inbox!
                </div>
              ) : (
                <>
                  <div className={styles.newsletterForm}>
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.newsletterInput}
                      disabled={isSubscribing}
                    />
                    <button
                      className={styles.subscribeBtn}
                      onClick={handleSubscribe}
                      disabled={isSubscribing || !email}
                    >
                      {isSubscribing ? 'Sending...' : 'Subscribe'}
                    </button>
                  </div>
                  {subscribeError && (
                    <div className={styles.subscribeErrorMsg}>{subscribeError}</div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer Columns */}
          {footerCols.map((col) => (
            <div key={col.title} className={styles.col}>
              <div className={styles.colTitle}>
                {col.title}
              </div>
              {col.links.map((link) => (
                <button
                  key={link}
                  className={styles.link}
                  onClick={() => handleLinkClick(link)}
                  type="button"
                >
                  {link}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <span className={styles.copyright}>
            {footer.copy?.replace('2025', currentYear) || `© ${currentYear} Africa Digital Forum. All rights reserved.`}
          </span>

          <div className={styles.legalLinks}>
            {['Privacy Policy', 'Terms of Use', 'Cookie Policy'].map((label) => (
              <button
                key={label}
                type="button"
                className={styles.legalLink}
                onClick={() => handleLinkClick(label)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.socialLinks}>
            {socialNetworks.map((network) => (
              <button
                key={network.name}
                type="button"
                className={styles.socialBtn}
                onClick={() => handleSocialClick(network.name)}
                aria-label={network.name}
              >
                <i className={`ti ${network.icon}`} style={{ color: network.color }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;