// Nav.js - With Blog page and language flags

import { useState, useEffect } from 'react';
import styles from '../Styles/components/Nav.module.css';
import Logo from '../Assets/Images/Logo.png';

const T = {
  white: '#FFFFFF',
  offWhite: '#F8F8FC',
  navy: '#050D1A',
  navy2: '#0A1628',
  violet: '#7C3AED',
  violetL: '#A066F5',
  violetD: '#5B21B6',
  muted: '#6B7280',
  dim: '#9CA3AF',
  border: 'rgba(124, 58, 237, 0.12)',
  purpleBorder: 'rgba(124, 58, 237, 0.2)',
  purpleGlow: 'rgba(124, 58, 237, 0.08)',
  shadow: 'rgba(0, 0, 0, 0.08)',
};

// Added BLOG here
const pageKeys = [
  'home',
  'about',
  'whyadf',
  'city',
  'blog',
  'contact'
];

const languages = [
  {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    displayName: 'English'
  },
  {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    displayName: 'Français'
  }
];

function Nav({ lang, cycleLang, t, activePage, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        langDropdownOpen &&
        !event.target.closest('.language-dropdown')
      ) {
        setLangDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [langDropdownOpen]);

  const handlePageChange = (page) => {
    setPage(page);
    setMobileMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleLanguageChange = (langCode) => {
    if (langCode !== lang) {
      cycleLang();
    }

    setLangDropdownOpen(false);
  };

  const currentLanguage =
    languages.find((l) => l.code === lang) ||
    languages.find((l) => l.code === 'en');

  const navItems = t.nav || [];

  return (
    <>
      <nav
        className={`${styles.nav} ${
          scrolled ? styles.navScrolled : ''
        }`}
      >
        {/* Logo */}
        <button
          className={styles.navLogo}
          onClick={() => handlePageChange('home')}
          aria-label="Go to home page"
        >
          <img
            src={Logo}
            alt="Africa Digital Forum - Home"
            className={styles.navLogoImg}
          />
        </button>

        {/* Desktop Navigation */}
        <div className={styles.navLinks}>
          {navItems.map((item, index) => {
            const page = pageKeys[index];

            if (!page) return null;

            const isActive = activePage === page;
            const isHovered = hoveredItem === page;

            return (
              <button
                key={page}
                className={styles.navLink}
                onClick={() => handlePageChange(page)}
                onMouseEnter={() => setHoveredItem(page)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <span
                  className={
                    isActive
                      ? styles.navLinkActive
                      : isHovered
                      ? styles.navLinkHover
                      : styles.navLinkInactive
                  }
                >
                  {item}
                </span>

                <span
                  className={`${styles.navLinkUnderline}
                  ${
                    isActive
                      ? styles.navLinkUnderlineActive
                      : isHovered
                      ? styles.navLinkUnderlineHover
                      : styles.navLinkUnderlineHidden
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right side */}
        <div className={styles.navRight}>
          <div
            className={`${styles.languageDropdown} language-dropdown`}
          >
            <button
              onClick={() =>
                setLangDropdownOpen(!langDropdownOpen)
              }
              className={styles.langTrigger}
              aria-label="Select language"
            >
              <span className={styles.worldIcon}>🌐</span>

              <span className={styles.currentLang}>
                {currentLanguage.flag}
              </span>

              <span className={styles.dropdownArrow}>
                {langDropdownOpen ? '▲' : '▼'}
              </span>
            </button>

            {langDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() =>
                      handleLanguageChange(language.code)
                    }
                    className={`${styles.dropdownItem}
                    ${
                      lang === language.code
                        ? styles.activeLanguage
                        : ''
                    }`}
                  >
                    <span className={styles.flagIcon}>
                      {language.flag}
                    </span>

                    <span className={styles.languageName}>
                      {language.displayName}
                    </span>

                    {lang === language.code && (
                      <span className={styles.checkMark}>
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() =>
              setMobileMenuOpen(!mobileMenuOpen)
            }
            className={styles.mobileMenuButton}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          {navItems.map((item, index) => {
            const page = pageKeys[index];

            if (!page) return null;

            const isActive = activePage === page;

            return (
              <button
                key={page}
                onClick={() =>
                  handlePageChange(page)
                }
                className={`${styles.mobileMenuItem}
                ${
                  isActive
                    ? styles.mobileMenuItemActive
                    : styles.mobileMenuItemInactive
                }`}
              >
                {item}
              </button>
            );
          })}

          <div className={styles.mobileDivider} />

          {/* Mobile Language Section */}
          <div className={styles.mobileLanguageSection}>
            <div className={styles.mobileLanguageLabel}>
              Select Language
            </div>

            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  if (language.code !== lang) {
                    cycleLang();
                  }

                  setMobileMenuOpen(false);
                }}
                className={`${styles.mobileLangItem}
                ${
                  lang === language.code
                    ? styles.mobileLangActive
                    : ''
                }`}
              >
                <span className={styles.flagIcon}>
                  {language.flag}
                </span>

                <span>
                  {language.displayName}
                </span>

                {lang === language.code && (
                  <span className={styles.checkMark}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Nav;