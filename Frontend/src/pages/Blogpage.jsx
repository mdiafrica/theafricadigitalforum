import { useState, useEffect, useRef } from 'react';
import styles from '../Styles/BlogPage.module.css';
import emailjs from '@emailjs/browser';
import { CATEGORY_COLORS } from '../constants/categoryColors';

// ── Import images ──
import Image1 from '../Assets/Images/Image2.png';
import Image2 from '../Assets/Images/Image5.jpg';
import Image3 from '../Assets/Images/Image3.jpg';
import Image4 from '../Assets/Images/Image4.png';
import Image6 from '../Assets/Images/Image6.png';
import Image7 from '../Assets/Images/Image6.png';
import Image8 from '../Assets/Images/Image8.png';
import Image9 from '../Assets/Images/image9.jpg';

const POST_IMAGES = {
  1: Image6,
  2: Image2,
  3: Image3,
  4: Image4,
  5: Image7,
  6: Image9,
  7: Image8,
};

// ── EMAILJS CREDENTIALS ──
const EMAILJS_SERVICE_ID  = 'service_oqw60pt';
const EMAILJS_TEMPLATE_ID = 'template_t9fam69';
const EMAILJS_PUBLIC_KEY  = 'CRiokfjvcAxMuJHMB';

// ── Intersection Observer hook ──
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.1, ...options }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

function FadeUp({ children, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

// ── Icons ──
const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default function BlogPage({ setPage, t }) {
  const blogT = t.blog;

  // ── Build posts array: combine translations with image mapping ──
  // ✅ FIXED: Removed the .filter((post) => post.id === 7)
  const posts = (blogT.posts || []).map(post => ({
    ...post,
    image: POST_IMAGES[post.id] || null,
  }));

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');

  const newsletterRef = useRef(null);

  useEffect(() => {
    if (subscribed) {
      const timer = setTimeout(() => setSubscribed(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [subscribed]);

  const scrollToNewsletter = () => {
    newsletterRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Categories from translations ──
  const CATEGORIES = blogT.categories || ['All'];

  // ── Filter articles ──
  const filtered = posts.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const visiblePosts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    setVisibleCount(6);
  }, [activeCategory, searchQuery]);

  const sidebarPosts = posts.slice(0, 4);
  const FEATURED_POST = posts[0];

  const goToArticle = (postId) => {
    setPage('article', postId);
  };

  // ── EMAILJS SEND ──
  const sendEmailJS = async (subject, messageText) => {
    if (!email) {
      setSubscriptionError(blogT.newsletter?.error || 'Please enter your email');
      return false;
    }

    setIsLoading(true);
    setSubscriptionError('');
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
      setSubscriptionError(blogT.newsletter?.errorGeneric || 'Something went wrong. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!email) {
      setSubscriptionError(blogT.newsletter?.error || 'Please enter your email');
      return;
    }
    const success = await sendEmailJS(
      'ADF Weekly Digest Subscription',
      'Thank you for subscribing to the ADF Digest! You will receive our weekly newsletter every Thursday.'
    );
    if (success) {
      setSubscribed(true);
      setEmail('');
      setSubscriptionError('');
    }
  };

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, filtered.length));
  };

  const resultMessage = () => {
    if (filtered.length === 0) return blogT.noResults || 'No results found';
    const shown = Math.min(visibleCount, filtered.length);
    const total = filtered.length;
    return (blogT.showingResults || 'Showing {shown} of {total} result{plural}')
      .replace(/\{shown\}/g, shown)
      .replace(/\{total\}/g, total)
      .replace(/\{plural\}/g, total > 1 ? 's' : '');
  };

  return (
    <main className={styles.mainContent}>
      <div className={styles.container}>

        {/* ── PAGE HEADER ── */}
        <FadeUp delay={0}>
          <div className={styles.pageHeader}>
            <div className={styles.pageHeaderLeft}>
              <h1 className={styles.pageHeaderTitle}>{blogT.pageTitle || 'Blog'}</h1>
              <p className={styles.pageHeaderSub}>{blogT.pageSub || 'Latest articles from our team'}</p>
            </div>
            <div className={styles.pageHeaderRight}>
              <button className={styles.headerSubscribeBtn} onClick={scrollToNewsletter}>
                <MailIcon />
                <span>{blogT.subscribeBtn || 'Subscribe'}</span>
              </button>
            </div>
          </div>
        </FadeUp>

        {/* ── HERO GRID ── */}
        {FEATURED_POST && (
          <FadeUp delay={0.1}>
            <div className={styles.heroGrid}>
              <div className={styles.featuredCard} onClick={() => goToArticle(FEATURED_POST.id)}>
                <img 
                  src={FEATURED_POST.image || '/placeholder-image.jpg'} 
                  alt={FEATURED_POST.title} 
                  className={styles.featuredImg}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <div className={styles.featuredOverlay}>
                  <div className={styles.featuredOverlayContent}>
                    <span className={styles.featuredCatBadge}>{FEATURED_POST.tag}</span>
                    <h2 className={styles.featuredTitle}>{FEATURED_POST.title}</h2>
                    <p className={styles.featuredExcerpt}>{FEATURED_POST.excerpt}</p>
                    <div className={styles.featuredMeta}>
                      <span className={styles.featuredMetaAuthor}>{FEATURED_POST.author}</span>
                      <span className={styles.featuredMetaSep}>·</span>
                      <span>{FEATURED_POST.date}</span>
                      <span className={styles.featuredMetaSep}>·</span>
                      <span className={styles.featuredMetaTime}><ClockIcon /> {FEATURED_POST.readTime}</span>
                    </div>
                    <button className={styles.featuredReadBtn}>
                      {blogT.featured?.readMore || 'Read More'} <ArrowIcon />
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.sidebarStories}>
                {sidebarPosts.slice(1).map((post, i) => (
                  <div key={i} className={styles.sideStory} onClick={() => goToArticle(post.id)}>
                    <div className={styles.sideStoryImgWrap}>
                      <img 
                        src={post.image || '/placeholder-image.jpg'} 
                        alt={post.title} 
                        className={styles.sideStoryImg}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                    <div className={styles.sideStoryBody}>
                      <span
                        className={styles.sideStoryCat}
                        style={{ color: CATEGORY_COLORS?.[post.category] || '#7C3AED' }}
                      >
                        {post.category}
                      </span>
                      <h3 className={styles.sideStoryTitle}>{post.title}</h3>
                      <div className={styles.sideStoryMeta}>
                        <span>{post.author}</span>
                        <span>·</span>
                        <span className={styles.sideStoryTime}><ClockIcon /> {post.readTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        )}

        {/* ── LATEST ARTICLES ── */}
        <div className={styles.articlesSection}>
          <div className={styles.articlesSectionHeader}>
            <div className={styles.sectionTitleRow}>
              <span className={styles.sectionTitleBar} />
              <h2 className={styles.sectionTitle}>{blogT.sectionTitle || 'Latest Articles'}</h2>
              <div className={styles.sectionSearchWrap}>
                <div className={styles.headerSearch}>
                  <span className={styles.headerSearchIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder={blogT.searchPlaceholder || 'Search articles...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.headerSearchInput}
                  />
                  {searchQuery && (
                    <button className={styles.headerSearchClear} onClick={() => setSearchQuery('')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <div className={styles.searchResultCount}>
                    {resultMessage()}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.categoryTabs}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`${styles.categoryTab} ${activeCategory === cat ? styles.categoryTabActive : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className={styles.emptyState}>{blogT.noResults || 'No articles found'}</p>
          ) : (
            <>
              <div className={styles.articlesGrid}>
                {visiblePosts.map((post, i) => (
                  <FadeUp key={i} delay={i * 0.04}>
                    <article className={styles.articleCard} onClick={() => goToArticle(post.id)}>
                      <div className={styles.articleImgWrap}>
                        <img 
                          src={post.image || '/placeholder-image.jpg'} 
                          alt={post.title} 
                          className={styles.articleImg}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                        <span
                          className={styles.articleTagBadge}
                          style={{ background: CATEGORY_COLORS?.[post.category] || '#7C3AED' }}
                        >
                          {post.tag}
                        </span>
                      </div>
                      <div className={styles.articleBody}>
                        <span
                          className={styles.articleCat}
                          style={{ color: CATEGORY_COLORS?.[post.category] || '#7C3AED' }}
                        >
                          {post.category}
                        </span>
                        <h3 className={styles.articleTitle}>{post.title}</h3>
                        <p className={styles.articleExcerpt}>{post.excerpt}</p>
                        <div className={styles.articleFooter}>
                          <div className={styles.articleMeta}>
                            <span className={styles.articleAuthor}>{post.author}</span>
                            <span className={styles.articleMetaTime}><ClockIcon /> {post.readTime}</span>
                          </div>
                          <span className={styles.articleReadLink}>
                            Read <ArrowIcon />
                          </span>
                        </div>
                      </div>
                    </article>
                  </FadeUp>
                ))}
              </div>

              {hasMore && (
                <div className={styles.loadMoreWrap}>
                  <button className={styles.loadMoreBtn} onClick={loadMore}>
                    {blogT.loadMore || 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>{/* end container */}

      {/* ── NEWSLETTER ── */}
      <FadeUp>
        <div ref={newsletterRef} className={styles.newsletterSection}>
          <div className={styles.newsletterInner}>
            <span className={styles.newsletterEyebrow}>{blogT.newsletter?.eyebrow || 'Newsletter'}</span>
            <h2 className={styles.newsletterTitle}>{blogT.newsletter?.title || 'Subscribe to Our Newsletter'}</h2>
            <p className={styles.newsletterSub}>{blogT.newsletter?.sub || 'Get the latest articles delivered to your inbox'}</p>
            {subscriptionError && (
              <div className={styles.subscriptionError}>{subscriptionError}</div>
            )}
            {subscribed ? (
              <div className={styles.subscribedMsg}>
                <CheckIcon />
                <span>{blogT.newsletter?.success || 'Thank you for subscribing!'}</span>
              </div>
            ) : (
              <div className={styles.subscribeForm}>
                <input
                  type="email"
                  placeholder={blogT.newsletter?.placeholder || 'Enter your email'}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={styles.subscribeInput}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSubscribe}
                  className={styles.subscribeBtn}
                  disabled={isLoading || !email}
                >
                  {isLoading ? (blogT.newsletter?.sending || 'Sending...') : (blogT.newsletter?.button || 'Subscribe')}
                </button>
              </div>
            )}
          </div>
        </div>
      </FadeUp>

    </main>
  );
}