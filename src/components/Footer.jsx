// Footer.jsx
import styles from '../Styles/components/Footer.module.css';
import Logo from '../Assets/Images/Logo.png';

function Footer({ t, setPage }) {
  const currentYear = new Date().getFullYear();

  const normalizeLink = (value) =>
    value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  // ---- SOCIAL MEDIA HANDLING ----
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
    // 1️⃣ SOCIAL MEDIA COLUMN → open in new tab
    if (socialMediaNames.includes(link)) {
      handleSocialClick(link);
      return;
    }

    // 2️⃣ EXTERNAL LINK: Media & Digital Institute Africa → open website in new tab
    if (link === 'Media & Digital Institute Africa') {
      window.open('https://mdiafrica.org/en/', '_blank', 'noopener,noreferrer');
      return;
    }

    // 3️⃣ INTERNAL PAGE ROUTING
    const linkMap = {
      // Core pages
      home: 'home',
      blog: 'blog',

      // About
      'about africa digital forum': 'about',
      'vision mission': 'about',
      'organizing directors': 'about',
      // 👇 Both Vision and Mission → About page
      'our vision': 'about',
      'our mission': 'about',

      // Why Africa Digital Forum
      'why africa digital forum': 'whyadf',

      // Host City
      'host city lome togo': 'city',
      'host city': 'city',

      // Contact
      'contact us': 'contact',
      contact: 'contact',

      // Legal
      'privacy policy': 'contact',
      'terms of use': 'contact',
      'cookie policy': 'contact',
    };

    const key = normalizeLink(link);
    const page = linkMap[key];

    // Fallback for Home & Blog (case / spacing safety)
    const safeFallbacks = {
      home: 'home',
      blog: 'blog',
    };

    const finalPage = page || safeFallbacks[key];

    if (finalPage && setPage) {
      setPage(finalPage);
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

  const footerCols = t?.footerCols || [];

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
              {t.footerDesc}
            </p>

            {/* "Organized by" → clickable link */}
            <div className={styles.organizerText}>
              <span>{t.organizer}: </span>
              <a
                href="https://mdiafrica.org/en/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.organizerLink}
              >
                {t.orgName}
              </a>
            </div>

            {/* Newsletter Signup */}
            <div className={styles.newsletterSection}>
              <div className={styles.newsletterLabel}>
                Subscribe to our newsletter
              </div>
              <div className={styles.newsletterForm}>
                <input
                  type="email"
                  placeholder="Your email address"
                  className={styles.newsletterInput}
                />
                <button className={styles.subscribeBtn}>
                  Subscribe
                </button>
              </div>
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
            {t.footerCopy.replace('2025', currentYear)}
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