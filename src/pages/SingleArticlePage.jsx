import { useState, useEffect, useRef } from 'react';
import styles from '../Styles/SingleArticlePage.module.css';
import emailjs from '@emailjs/browser';
import { CATEGORY_COLORS } from '../constants/categoryColors';

// ── Import images ──
import Image1 from '../Assets/Images/Image2.jpg';
import Image2 from '../Assets/Images/Image5.jpg';
import Image3 from '../Assets/Images/Image3.jpg';
import Image4 from '../Assets/Images/Image4.jpg';
import Image6 from '../Assets/Images/Image6.jpg';
import Image7 from '../Assets/Images/Image7.jpeg';
import Image9 from '../Assets/Images/image9.jpg';

const POST_IMAGES = {
  1: Image6,
  2: Image2,
  3: Image3,
  4: Image4,
  5: Image7,
  6: Image9,
};

// ── Helper: get color from translated category name ──
const getCategoryColor = (categoryName) => {
  const categoryMap = {
    // English
    'Digital Policy': 'Digital Policy',
    'Cybersecurity': 'Cybersecurity',
    'Infrastructure': 'Infrastructure',
    'Startup Ecosystem': 'Startup Ecosystem',
    'Fintech & Payments': 'Fintech & Payments',
    'Trade & AfCFTA': 'Trade & AfCFTA',
    'AI & Data': 'AI & Data',
    'Gender & Inclusion': 'Gender & Inclusion',
    // French
    'Politique numérique': 'Digital Policy',
    'Cybersécurité': 'Cybersecurity',
    'Écosystème des startups': 'Startup Ecosystem',
    'Fintech et paiements': 'Fintech & Payments',
    'Commerce et ZLECAf': 'Trade & AfCFTA',
    'IA et données': 'AI & Data',
    'Genre et inclusion': 'Gender & Inclusion',
  };
  const englishKey = categoryMap[categoryName] || categoryName;
  return CATEGORY_COLORS[englishKey] || '#7C3AED';
};

// ── EMAILJS CREDENTIALS ──
const EMAILJS_SERVICE_ID  = 'service_oqw60pt';
const EMAILJS_TEMPLATE_ID = 'template_t9fam69';
const EMAILJS_PUBLIC_KEY  = 'CRiokfjvcAxMuJHMB';

// ── Icons ──
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// ── FadeUp ──
function FadeUp({ children, delay = 0, style = {} }) {
  const [ref, setRef] = useState(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.1 }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  return (
    <div
      ref={setRef}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function SingleArticlePage({ setPage, postId, t }) {
  const blogT = t.blog;
  const singleT = blogT.singleArticle;

  // ── Refs for scrolling ──
  const heroRef = useRef(null);

  // Build posts array: combine translations with image mapping
  const posts = (blogT.posts || []).map(post => ({
    ...post,
    image: POST_IMAGES[post.id] || null,
  }));

  const article = posts.find(p => p.id === Number(postId));

  // ── Scroll to hero when article loads ──
  useEffect(() => {
    if (article && heroRef.current) {
      // Small delay to ensure the DOM is fully rendered
      setTimeout(() => {
        heroRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [article]);

  if (!article) {
    return (
      <main className={styles.mainContent}>
        <div style={{ padding: '100px 20px', textAlign: 'center' }}>
          <h2>{singleT.articleNotFound}</h2>
          <p style={{ color: '#666', margin: '16px 0' }}>{singleT.articleNotFoundDesc}</p>
          <button
            onClick={() => setPage('blog')}
            style={{
              marginTop: '20px',
              padding: '12px 28px',
              background: '#7C3AED',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            ← {singleT.backToBlog}
          </button>
        </div>
      </main>
    );
  }

  const categoryColor = getCategoryColor(article.category);
  const relatedArticles = posts.filter(p => p.id !== article.id).slice(0, 3);

  // ── Newsletter state ──
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  useEffect(() => {
    if (subscribeSuccess) {
      const timer = setTimeout(() => setSubscribeSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [subscribeSuccess]);

  const sendEmailJS = async (subject, messageText) => {
    if (!email) {
      setSubscribeError(singleT.subscribeError);
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
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      return true;
    } catch (error) {
      console.error('EmailJS error:', error);
      setSubscribeError('Something went wrong. Please try again.');
      return false;
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSubscribe = async () => {
    if (!email) {
      setSubscribeError(singleT.subscribeError);
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

  // Get translated categories (excluding 'All')
  const translatedCategories = (blogT.categories || []).filter(cat => cat !== 'All');

  return (
    <main className={styles.mainContent}>
      {/* ── Article Hero ── */}
      <section ref={heroRef} className={styles.heroSection}>
        <div className={styles.heroImageWrap}>
          <img src={article.image} alt={article.title} className={styles.heroImage} />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <div className={styles.container}>
              <button className={styles.backBtnHero} onClick={() => setPage('blog')}>
                <ArrowLeftIcon />
                <span>{singleT.backToBlog}</span>
              </button>

              <div className={styles.heroInner}>
                <span className={styles.articleTag} style={{ background: categoryColor }}>
                  {article.tag}
                </span>
                <h1 className={styles.heroTitle}>{article.title}</h1>
                <div className={styles.heroMeta}>
                  <span className={styles.heroMetaItem}>
                    <UserIcon />
                    {article.author}
                  </span>
                  <span className={styles.heroMetaSep}>·</span>
                  <span className={styles.heroMetaItem}>
                    <CalendarIcon />
                    {article.date}
                  </span>
                  <span className={styles.heroMetaSep}>·</span>
                  <span className={styles.heroMetaItem}>
                    <ClockIcon />
                    {article.readTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Article Content ── */}
      <section className={styles.contentSection}>
        <div className={styles.container}>
          <div className={styles.contentLayout}>
            <div className={styles.contentMain}>
              <FadeUp>
                <div className={styles.categoryBadge} style={{ color: categoryColor }}>
                  {article.category}
                </div>
                <div
                  className={styles.articleContent}
                  dangerouslySetInnerHTML={{ __html: article.content || article.excerpt || 'Full content coming soon.' }}
                />
              </FadeUp>

              {article.authorBio && (
                <FadeUp delay={0.1}>
                  <div className={styles.authorBio}>
                    <div className={styles.authorAvatar}>
                      {article.authorAvatar ? (
                        <img src={article.authorAvatar} alt={article.author} />
                      ) : (
                        <span className={styles.authorInitial}>
                          {article.author.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className={styles.authorInfo}>
                      <h4 className={styles.authorName}>{article.author}</h4>
                      <p className={styles.authorBioText}>{article.authorBio}</p>
                    </div>
                  </div>
                </FadeUp>
              )}

              <FadeUp delay={0.15}>
                <div className={styles.articleFooter}>
                  <div className={styles.tags}>
                    <span className={styles.tagsLabel}>{singleT.topicsLabel}</span>
                    <span className={styles.tagPill} style={{ borderColor: categoryColor, color: categoryColor }}>
                      {article.category}
                    </span>
                    <span className={styles.tagPill} style={{ borderColor: categoryColor, color: categoryColor }}>
                      Digital Transformation
                    </span>
                    <span className={styles.tagPill} style={{ borderColor: categoryColor, color: categoryColor }}>
                      Africa
                    </span>
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* ── Sidebar ── */}
            <div className={styles.contentSidebar}>
              <FadeUp delay={0.1}>
                <div className={styles.sidebarCard}>
                  <h4 className={styles.sidebarTitle}>{singleT.subscribeTitle}</h4>
                  <p className={styles.sidebarText}>{singleT.subscribeText}</p>
                  {subscribeSuccess ? (
                    <div className={styles.sidebarSuccess}>{singleT.subscribeSuccess}</div>
                  ) : (
                    <div className={styles.sidebarForm}>
                      <input
                        type="email"
                        placeholder={singleT.emailPlaceholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.sidebarInput}
                        disabled={isSubscribing}
                      />
                      <button
                        className={styles.sidebarBtn}
                        onClick={handleSubscribe}
                        disabled={isSubscribing || !email}
                      >
                        {isSubscribing ? singleT.subscribeSending : singleT.subscribeTitle}
                      </button>
                      {subscribeError && (
                        <div className={styles.sidebarError}>{subscribeError}</div>
                      )}
                    </div>
                  )}
                </div>
              </FadeUp>

              <FadeUp delay={0.15}>
                <div className={styles.sidebarCard}>
                  <h4 className={styles.sidebarTitle}>{singleT.categoriesTitle}</h4>
                  <div className={styles.sidebarCategories}>
                    {translatedCategories.map((cat) => (
                      <button
                        key={cat}
                        className={styles.sidebarCategory}
                        style={{ borderColor: getCategoryColor(cat), color: getCategoryColor(cat) }}
                        onClick={() => setPage('blog')}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </FadeUp>

              {relatedArticles.length > 0 && (
                <FadeUp delay={0.2}>
                  <div className={styles.sidebarCard}>
                    <h4 className={styles.sidebarTitle}>{singleT.relatedTitle}</h4>
                    <div className={styles.sidebarRelated}>
                      {relatedArticles.map((post) => (
                        <div
                          key={post.id}
                          className={styles.sidebarRelatedItem}
                          onClick={() => setPage('article', post.id)}
                        >
                          <div className={styles.sidebarRelatedImgWrap}>
                            <img src={post.image} alt={post.title} className={styles.sidebarRelatedImg} />
                          </div>
                          <div className={styles.sidebarRelatedBody}>
                            <h5 className={styles.sidebarRelatedTitle}>{post.title}</h5>
                            <div className={styles.sidebarRelatedMeta}>
                              <span>{post.date}</span>
                              <span>·</span>
                              <span><ClockIcon /> {post.readTime}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={styles.sidebarRelatedFooter}>
                      <button className={styles.sidebarViewAll} onClick={() => setPage('blog')}>
                        {singleT.viewAll} <ArrowRightIcon />
                      </button>
                    </div>
                  </div>
                </FadeUp>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── More from the Blog ── */}
      <section className={styles.moreSection}>
        <div className={styles.container}>
          <FadeUp>
            <div className={styles.moreHeader}>
              <h2 className={styles.moreTitle}>{singleT.moreTitle}</h2>
              <button className={styles.moreViewAll} onClick={() => setPage('blog')}>
                {singleT.viewAll} <ArrowRightIcon />
              </button>
            </div>
          </FadeUp>

          <div className={styles.moreGrid}>
            {posts.filter(p => p.id !== article.id).slice(0, 3).map((post, index) => (
              <FadeUp key={post.id} delay={0.08 * (index + 1)}>
                <div className={styles.moreCard} onClick={() => setPage('article', post.id)}>
                  <div className={styles.moreImgWrap}>
                    <img src={post.image} alt={post.title} className={styles.moreImg} />
                    <span className={styles.moreTag} style={{ background: getCategoryColor(post.category) }}>
                      {post.category}
                    </span>
                  </div>
                  <div className={styles.moreBody}>
                    <h3 className={styles.moreCardTitle}>{post.title}</h3>
                    <p className={styles.moreExcerpt}>{post.excerpt}</p>
                    <div className={styles.moreReadLink}>
                      {singleT.readMore} <ArrowRightIcon />
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}