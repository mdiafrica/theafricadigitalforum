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

const getRouteFromPathname = (pathname) => {
  const normalized = pathname.replace(/^\/+|\/+$/g, '');
  const segments = normalized.split('/').filter(Boolean);

  if (segments[0] === 'article') {
    const articleKey = segments[1] ? decodeURIComponent(segments[1]) : null;
    return { page: articleKey ? 'article' : 'blog', articleKey };
  }

  const routeMap = {
    '': { page: 'home', articleKey: null },
    'about': { page: 'about', articleKey: null },
    'whyadf': { page: 'whyadf', articleKey: null },
    'why-adf': { page: 'whyadf', articleKey: null },
    'city': { page: 'city', articleKey: null },
    'blog': { page: 'blog', articleKey: null },
    'contact': { page: 'contact', articleKey: null },
    'privacy': { page: 'privacy', articleKey: null },
    'terms': { page: 'terms', articleKey: null },
    'tickets': { page: 'tickets', articleKey: null },
    'register': { page: 'register', articleKey: null },
  };

  return routeMap[segments[0] || ''] || { page: 'home', articleKey: null };
};

const getPathFromRoute = (page, articleKey) => {
  if (page === 'article' && articleKey) return `/article/${encodeURIComponent(articleKey)}`;
  if (page === 'article') return '/article';
  if (page === 'home') return '/';
  return `/${page}`;
};

function App() {
  const [lang, setLang] = useState('en');
  const [page, setPage] = useState('home');
  const [articleKey, setArticleKey] = useState(null);
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
      setArticleKey(data || null);
    } else {
      setArticleKey(null);
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
      const route = getRouteFromPathname(window.location.pathname);
      handleSetPage(route.page, route.articleKey);
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
      const initialRoute = getRouteFromPathname(window.location.pathname);
      if (initialRoute.page !== page || initialRoute.articleKey !== articleKey) {
        handleSetPage(initialRoute.page, initialRoute.articleKey);
      }
      return;
    }

    const nextPath = getPathFromRoute(page, articleKey);
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (currentPath !== nextPath) {
      window.history.pushState({ page, articleKey }, '', nextPath);
    }
  }, [page, articleKey]);

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
        return <SingleArticlePage setPage={handleSetPage} postId={articleKey} t={t} />;
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