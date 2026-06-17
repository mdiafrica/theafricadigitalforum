import { useState, useEffect } from 'react';
import styles from './Styles/App.module.css';
import Nav from './components/Nav';
import Footer from './components/Footer';
import HomePage from './pages/Home';
import { i18n } from './i18n/translations';
import AboutPage from './pages/AboutPage';
import CityPage from './pages/CityPage';
import ContactPage from './pages/ContactPage';
import WhyADFPage from './pages/WhyADFPage';
import BlogPage from './pages/BlogPage';   // ← ADD THIS

function App() {
  const [lang, setLang] = useState('en');
  const [page, setPage] = useState('home');
  const languageOrder = ['en', 'fr', 'ar'];
  const t = i18n[lang];

  const cycleLang = () => {
    const nextIndex = (languageOrder.indexOf(lang) + 1) % languageOrder.length;
    setLang(languageOrder[nextIndex]);
  };

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

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage setPage={setPage} />;
      case 'about':
        return <AboutPage t={t} />;
      case 'whyadf':
        return <WhyADFPage setPage={setPage} />;
      case 'city':
        return <CityPage t={t} setPage={setPage} />;
      case 'blog':          // ← ADD THIS CASE
        return <BlogPage setPage={setPage} />;
      case 'contact':
        return <ContactPage t={t} />;
      case 'tickets':
        return <div style={{ padding: '100px', textAlign: 'center' }}>Tickets Page - Coming Soon</div>;
      case 'register':
        return <div style={{ padding: '100px', textAlign: 'center' }}>Register Page - Coming Soon</div>;
      default:
        return <HomePage setPage={setPage} />;
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.gridBg} />
      <Nav lang={lang} cycleLang={cycleLang} t={t} activePage={page} setPage={setPage} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {renderPage()}
      </div>
      <Footer t={t} setPage={setPage} />
    </div>
  );
}

export default App;