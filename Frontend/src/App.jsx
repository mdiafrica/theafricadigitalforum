// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import styles from './Styles/App.module.css';
import Nav from './components/Nav';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import HomePage from './pages/Home';
import { i18n } from './i18n';
import AboutPage from './pages/AboutPage';
import CityPage from './pages/CityPage';
import ContactPage from './pages/ContactPage';
import WhyADFPage from './pages/WhyADFPage';
import BlogPage from './pages/BlogPage';
import SingleArticlePage from './pages/SingleArticlePage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

const getPageFromPathname = (pathname) => {
  const normalized = pathname.replace(/^\/+|\/+$/g, '');
  const routeMap = {
    '': 'home',
    'about': 'about',
    'whyadf': 'whyadf',
    'why-adf': 'whyadf',
    'city': 'city',
    'blog': 'blog',
    'contact': 'contact',
    'privacy': 'privacy',
    'terms': 'terms',
    'tickets': 'tickets',
    'register': 'register',
  };

  return routeMap[normalized] || 'home';
};

function App() {
  const [lang, setLang] = useState('en');
  const [page, setPage] = useState('home');
  const [articleId, setArticleId] = useState(null);
  const [scrollTarget, setScrollTarget] = useState(null);
  const hasInitializedRoute = useRef(false);

  const languageOrder = ['en', 'fr'];
  const t = i18n[lang] || i18n.en;

  const cycleLang = () => {
    const nextIndex = (languageOrder.indexOf(lang) + 1) % languageOrder.length;
    setLang(languageOrder[nextIndex]);
  };

  const handleSetPage = (pageName, data = null, target = null) => {
    setPage(pageName);
    setScrollTarget(target);
    if (pageName === 'article') {
      setArticleId(data);
    } else {
      setArticleId(null);
    }
  };

  // Expose setPage to window for CookieConsent navigation
  useEffect(() => {
    window.__setPage = handleSetPage;

    // Listen for navigation events from CookieConsent
    const handleNavigation = (event) => {
      handleSetPage(event.detail);
    };

    const handlePopState = () => {
      const nextPage = getPageFromPathname(window.location.pathname);
      handleSetPage(nextPage);
    };

    window.addEventListener('navigate', handleNavigation);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('navigate', handleNavigation);
      window.removeEventListener('popstate', handlePopState);
      delete window.__setPage;
    };
  }, []);

  useEffect(() => {
    if (!hasInitializedRoute.current) {
      hasInitializedRoute.current = true;
      const initialPage = getPageFromPathname(window.location.pathname);
      if (initialPage !== page) {
        handleSetPage(initialPage);
      }
      return;
    }

    const nextPath = page === 'home' ? '/' : `/${page}`;
    window.history.replaceState({ page }, '', nextPath);
  }, [page]);

  // Auto‑detect French timezone
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const frenchTZ = [
        'Africa/Abidjan', 'Africa/Ouagadougou', 'Africa/Porto-Novo', 'Africa/Lome',
        'Africa/Dakar', 'Africa/Bamako', 'Africa/Conakry', 'Africa/Bissau', 'Africa/Niamey',
        'Africa/Ndjamena', 'Africa/Bangui', 'Africa/Douala', 'Africa/Libreville', 'Africa/Malabo',
        'Africa/Brazzaville', 'Africa/Kinshasa', 'Africa/Bujumbura',
        'Africa/Tunis', 'Africa/Algiers', 'Africa/Casablanca', 'Indian/Antananarivo',
      ];
      if (frenchTZ.includes(tz)) setLang('fr');
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  useEffect(() => {
    if (page !== 'home' || !scrollTarget) return;

    const scrollToSection = () => {
      const selector = `[data-scroll="${scrollTarget}"]`;
      const element = document.querySelector(selector) || document.getElementById(scrollTarget);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setScrollTarget(null);
    };

    const timer = window.setTimeout(scrollToSection, 120);
    return () => window.clearTimeout(timer);
  }, [page, scrollTarget]);

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage setPage={handleSetPage} t={t} lang={lang} />;
      case 'about':
        return <AboutPage t={t} />;
      case 'whyadf':
        return <WhyADFPage setPage={handleSetPage} t={t} />;
      case 'city':
        return <CityPage t={t} setPage={handleSetPage} />;
      case 'blog':
        return <BlogPage setPage={handleSetPage} t={t} />;
      case 'article':
        return <SingleArticlePage setPage={handleSetPage} postId={articleId} t={t} />;
      case 'contact':
        return <ContactPage t={t} />;
      case 'privacy':
        return <PrivacyPage t={t} />;
      case 'terms':
        return <TermsPage t={t} />;
      case 'tickets':
        return <div style={{ padding: '100px', textAlign: 'center' }}>Tickets Page - Coming Soon</div>;
      case 'register':
        return <div style={{ padding: '100px', textAlign: 'center' }}>Register Page - Coming Soon</div>;
      default:
        return <HomePage setPage={handleSetPage} t={t} lang={lang} />;
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.gridBg} />
      <Nav lang={lang} cycleLang={cycleLang} t={t} activePage={page} setPage={handleSetPage} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {renderPage()}
      </div>
      <Footer t={t} setPage={handleSetPage} />
      <CookieConsent />
    </div>
  );
}

export default App;