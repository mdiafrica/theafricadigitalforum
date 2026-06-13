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

  const handleLinkClick = (link) => {
    const linkMap = {
      home: 'home',
      'about africa digital forum': 'about',
      'why africa digital forum': 'whyadf',
      'vision mission': 'about',
      'organizing directors': 'about',
      'host city lome togo': 'city',
      'media press': 'contact',
      'buy tickets': 'tickets',
      'student pass': 'tickets',
      'apply to speak': 'contact',
      'expected speakers': 'about',
      'media accreditation': 'contact',
      'become a sponsor': 'contact',
      'partnership opportunities': 'contact',
      'newsletter': 'contact',
      'contact us': 'contact',
      'contact': 'contact',
      'privacy policy': 'contact',
      'terms of use': 'contact',
      'cookie policy': 'contact',
    };
    const page = linkMap[normalizeLink(link)];
    if (page && setPage) {
      setPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
            <p className={styles.description}>{t.footerDesc}</p>
            <div className={styles.organizerText}>
              <span>{t.organizer}: </span>
              <span className={styles.organizerName}>{t.orgName}</span>
            </div>
            <div className={styles.newsletterSection}>
              <div className={styles.newsletterLabel}>Subscribe to our newsletter</div>
              <div className={styles.newsletterForm}>
                <input
                  type="email"
                  placeholder="Your email address"
                  className={styles.newsletterInput}
                />
                <button className={styles.subscribeBtn}>Subscribe</button>
              </div>
            </div>
          </div>

          {footerCols.map((col) => (
            <div key={col.title} className={styles.col}>
              <div className={styles.colTitle}>{col.title}</div>
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