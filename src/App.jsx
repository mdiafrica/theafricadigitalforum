import { useState, useEffect } from 'react';
import styles from './Styles/App.module.css';
import Nav from './components/Nav';
import Footer from './components/Footer';
import HomePage from './pages/Home';
// ✅ Correct import path (no '/translations')
import { i18n } from './i18n';
import AboutPage from './pages/AboutPage';
import CityPage from './pages/CityPage';
import ContactPage from './pages/ContactPage';
import WhyADFPage from './pages/WhyADFPage';
import BlogPage from './pages/BlogPage';
import SingleArticlePage from './pages/SingleArticlePage';

function App() {
  const [lang, setLang] = useState('en');
  const [page, setPage] = useState('home');
  const [articleId, setArticleId] = useState(null);

  const languageOrder = ['en', 'fr'];
  const t = i18n[lang] || i18n.en;

  const cycleLang = () => {
    const nextIndex = (languageOrder.indexOf(lang) + 1) % languageOrder.length;
    setLang(languageOrder[nextIndex]);
  };

  const handleSetPage = (pageName, data = null) => {
    setPage(pageName);
    if (pageName === 'article') {
      setArticleId(data);
    } else {
      setArticleId(null);
    }
  };

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

  const renderPage = () => {
    switch (page) {
      case 'home':
        // ✅ Pass lang to HomePage (required for bilingual features)
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
    </div>
  );
}

export default App;