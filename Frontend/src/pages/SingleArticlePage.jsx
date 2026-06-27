import { useState, useEffect, useRef } from 'react';
import styles from '../Styles/SingleArticlePage.module.css';
import emailjs from '@emailjs/browser';
import { CATEGORY_COLORS } from '../constants/categoryColors';

// ── STRAPI API CONFIGURATION ──
// Using Vite proxy - no CORS issues!
const STRAPI_API_URL = '/api';
const STRAPI_URL = 'http://localhost:1337'; // For images

// ── EMAILJS CREDENTIALS ──
const EMAILJS_SERVICE_ID  = 'service_oqw60pt';
const EMAILJS_TEMPLATE_ID = 'template_t9fam69';
const EMAILJS_PUBLIC_KEY  = 'CRiokfjvcAxMuJHMB';

// ── FIX: Strapi v5 requires nested populate as bracket notation, not a flat
// comma list. "author.profileImage" inside populate=a,b,c is invalid and
// causes a 400 Bad Request. This builds the equivalent query string manually
// (no need for the `qs` package): ──
// ── SPEED: previously this page fetched the ENTIRE article list (including
// every article's full rich-text content) just to find one article by id,
// then discarded almost all of it. Now we fetch the single article directly
// by id (full content, since this page renders it) and fetch "related"
// articles separately with a light, content-free query, same as the list
// page. This avoids downloading every other article's full body. ──
const ARTICLE_DETAIL_POPULATE_QUERY =
  'populate[coverImage][fields][0]=url' +
  '&populate[author][populate][profileImage][fields][0]=url' +
  '&populate[author][fields][0]=name' +
  '&populate[author][fields][1]=bio' +
  '&populate[category][fields][0]=name' +
  '&populate[tags][fields][0]=name';

const RELATED_ARTICLES_POPULATE_QUERY =
  'fields[0]=title' +
  '&fields[1]=slug' +
  '&fields[2]=excerpt' +
  '&fields[3]=publishedAt' +
  '&populate[coverImage][fields][0]=url' +
  '&populate[category][fields][0]=name' +
  '&sort=publishedAt:desc' +
  '&pagination[pageSize]=4';

// ── Helper: Render Rich Text Content ──
const renderRichText = (content) => {
  if (!content || !Array.isArray(content)) return <p>No content available</p>;
  
  return content.map((block, index) => {
    // Handle heading
    if (block.type === 'heading' || block.type === 'heading-one') {
      return (
        <h2 key={index} style={{ fontSize: '28px', fontWeight: 'bold', margin: '30px 0 16px' }}>
          {block.children?.map(child => child.text).join('')}
        </h2>
      );
    }
    
    // Handle paragraph
    if (block.type === 'paragraph') {
      const text = block.children?.map(child => child.text).join('') || '';
      
      // Check if it contains HTML tags that need special handling
      if (text.includes('<h2>') || text.includes('<p>') || text.includes('<ul>')) {
        const cleanHtml = text
          .replace(/<h2>/g, '<h2 style="font-size:28px;font-weight:bold;margin:30px 0 16px">')
          .replace(/<p>/g, '<p style="margin:0 0 16px;line-height:1.8">')
          .replace(/<ul>/g, '<ul style="margin:0 0 16px 20px;list-style-type:disc">')
          .replace(/<li>/g, '<li style="margin-bottom:4px">');
        
        return (
          <div 
            key={index}
            dangerouslySetInnerHTML={{ __html: cleanHtml }}
            style={{ marginBottom: '8px' }}
          />
        );
      }
      
      // Plain text paragraph
      if (text.trim()) {
        return <p key={index} style={{ margin: '0 0 16px', lineHeight: '1.8' }}>{text}</p>;
      }
      return null;
    }
    
    // Handle list
    if (block.type === 'list' || block.type === 'list-item') {
      return (
        <li key={index} style={{ marginBottom: '4px' }}>
          {block.children?.map(child => child.text).join('')}
        </li>
      );
    }
    
    // Handle any other block type
    return (
      <div key={index} style={{ margin: '0 0 16px', lineHeight: '1.8' }}>
        {block.children?.map(child => child.text).join('')}
      </div>
    );
  });
};

// ── Helper: get color from translated category name ──
const getCategoryColor = (categoryName) => {
  const categoryMap = {
    'Digital Policy': 'Digital Policy',
    'Cybersecurity': 'Cybersecurity',
    'Infrastructure': 'Infrastructure',
    'Startup Ecosystem': 'Startup Ecosystem',
    'Fintech & Payments': 'Fintech & Payments',
    'Trade & Economy': 'Trade & Economy',
    'Trade & AfCFTA': 'Trade & AfCFTA',
    'AI & Data': 'AI & Data',
    'Gender & Inclusion': 'Gender & Inclusion',
    'Agriculture & Innovation': 'Agriculture & Innovation',
    'Education & Skills': 'Education & Skills',
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

  // ── STATE FOR DYNAMIC DATA ──
  const [article, setArticle] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Refs for scrolling ──
  const heroRef = useRef(null);

  // ── Transform article helper ──
  const transformArticle = (item) => {
    const article = item;
    
    // ── GET IMAGE URL ──
    let imageUrl = null;
    if (article.coverImage?.url) {
      imageUrl = `${STRAPI_URL}${article.coverImage.url}`;
    }
    
    // ── GET AUTHOR PROFILE IMAGE URL ──
    let authorAvatarUrl = null;
    
    // Check if author exists and has profileImage
    if (article.author?.profileImage?.url) {
      if (article.author.profileImage.url.startsWith('/')) {
        authorAvatarUrl = `${STRAPI_URL}${article.author.profileImage.url}`;
      } else {
        authorAvatarUrl = article.author.profileImage.url;
      }
    }
    
    // ── FALLBACK: Generate avatar from name if no image ──
    if (!authorAvatarUrl && article.author?.name) {
      const name = encodeURIComponent(article.author.name);
      authorAvatarUrl = `https://ui-avatars.com/api/?name=${name}&background=7C3AED&color=fff&size=128&rounded=true&bold=true`;
    }
    
    const categoryName = article.category?.name || 'General';
    const authorName = article.author?.name || 'ADF Team';
    const authorBio = article.author?.bio || '';
    
    const tags = article.tags?.map(tag => tag.name) || [];
    const tag = tags.length > 0 ? tags[0] : article.tag || categoryName;
    
    const date = article.publishedAt 
      ? new Date(article.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric', 
          month: 'long',
          day: 'numeric'
        });
    
    // Read time: use Strapi's readTime field if set, otherwise estimate
    // from content length when present (detail fetch), or excerpt length
    // when not (related articles, which don't fetch content).
    const readTime = article.readTime
      || (article.content
            ? `${Math.max(2, Math.ceil(JSON.stringify(article.content).length / 1000))} min read`
            : `${Math.max(2, Math.ceil((article.excerpt?.length || 0) / 200))} min read`);
    
    return {
      id: item.documentId || item.id,
      title: article.title || 'Untitled',
      slug: article.slug || article.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'untitled',
      excerpt: article.excerpt || '',
      content: article.content || [],
      category: categoryName,
      tag: tag,
      author: authorName,
      authorBio: authorBio,
      authorAvatar: authorAvatarUrl,
      date: date,
      readTime: readTime,
      image: imageUrl,
      publishedAt: article.publishedAt,
      richContent: article.content || [],
    };
  };

  // ── FETCH ARTICLE FROM STRAPI ──
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the single article directly by id/documentId, and the
        // (content-free) related-articles list in parallel — instead of
        // downloading every article's full body just to find one.
        const [articleRes, relatedRes] = await Promise.all([
          fetch(`${STRAPI_API_URL}/articles/${postId}?${ARTICLE_DETAIL_POPULATE_QUERY}`),
          fetch(`${STRAPI_API_URL}/articles?${RELATED_ARTICLES_POPULATE_QUERY}`),
        ]);

        if (!articleRes.ok) {
          throw new Error(`HTTP error! status: ${articleRes.status}`);
        }

        const articleJson = await articleRes.json();
        const foundArticle = articleJson.data;

        if (!foundArticle) {
          setError('Article not found');
          setLoading(false);
          return;
        }

        const transformedArticle = transformArticle(foundArticle);
        setArticle(transformedArticle);

        if (relatedRes.ok) {
          const relatedJson = await relatedRes.json();
          const transformedRelated = (relatedJson.data || [])
            .filter(item => item.id !== foundArticle.id)
            .map(item => transformArticle(item));
          setAllPosts(transformedRelated);

          const uniqueCategories = ['All', ...new Set(
            relatedJson.data.map(item => item.category?.name).filter(Boolean)
          )];
          setCategories(uniqueCategories);
        }

      } catch (err) {
        console.error('❌ Error fetching article:', err);
        setError('Failed to load article. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (postId) {
      fetchArticle();
    }
  }, [postId]);

  // ── Scroll to hero when article loads ──
  useEffect(() => {
    if (article && heroRef.current) {
      setTimeout(() => {
        heroRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [article]);

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
      setSubscribeError(singleT?.subscribeError || 'Please enter your email');
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
      setSubscribeError(singleT?.subscribeError || 'Please enter your email');
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

  const translatedCategories = categories.filter(cat => cat !== 'All');

  // ── LOADING STATE: lightweight skeleton instead of a centered spinner,
  // so the page shape appears immediately rather than a blank stall ──
  if (loading) {
    return (
      <main className={styles.mainContent}>
        <div style={{ width: '100%', height: '50vh', minHeight: 320, background: '#eee' }} />
        <div className={styles.container}>
          <div style={{ maxWidth: 720, margin: '40px auto' }}>
            <div style={{ height: 14, width: '30%', background: '#eee', borderRadius: 4, marginBottom: 18 }} />
            <div style={{ height: 14, width: '95%', background: '#eee', borderRadius: 4, marginBottom: 10 }} />
            <div style={{ height: 14, width: '88%', background: '#eee', borderRadius: 4, marginBottom: 10 }} />
            <div style={{ height: 14, width: '92%', background: '#eee', borderRadius: 4, marginBottom: 10 }} />
            <div style={{ height: 14, width: '70%', background: '#eee', borderRadius: 4 }} />
          </div>
        </div>
      </main>
    );
  }

  // ── ERROR STATE ──
  if (error || !article) {
    return (
      <main className={styles.mainContent}>
        <div className={styles.container}>
          <div style={{ padding: '100px 20px', textAlign: 'center' }}>
            <h2>{singleT?.articleNotFound || 'Article Not Found'}</h2>
            <p style={{ color: '#666', margin: '16px 0' }}>
              {singleT?.articleNotFoundDesc || 'The article you are looking for does not exist.'}
            </p>
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
              ← {singleT?.backToBlog || 'Back to Blog'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const categoryColor = getCategoryColor(article.category);
  const relatedArticles = allPosts.slice(0, 3);

  return (
    <main className={styles.mainContent}>
      {/* ── Article Hero ── */}
      <section ref={heroRef} className={styles.heroSection}>
        <div className={styles.heroImageWrap}>
          <img 
            src={article.image || '/placeholder-image.jpg'} 
            alt={article.title} 
            className={styles.heroImage}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-image.jpg';
            }}
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <div className={styles.container}>
              <button className={styles.backBtnHero} onClick={() => setPage('blog')}>
                <ArrowLeftIcon />
                <span>{singleT?.backToBlog || 'Back to Blog'}</span>
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
                <div className={styles.articleContent}>
                  {renderRichText(article.content)}
                </div>
              </FadeUp>

              {/* ── AUTHOR BIO WITH AVATAR ── */}
              {article.author && (
                <FadeUp delay={0.1}>
                  <div className={styles.authorBio}>
                    <div className={styles.authorAvatar}>
                      {article.authorAvatar ? (
                        <img 
                          src={article.authorAvatar} 
                          alt={article.author} 
                          className={styles.authorAvatarImg}
                          onError={(e) => {
                            console.log('❌ Avatar image failed to load:', article.authorAvatar);
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            const initial = document.createElement('span');
                            initial.className = styles.authorInitial;
                            initial.textContent = article.author.charAt(0);
                            parent.appendChild(initial);
                          }}
                        />
                      ) : (
                        <span className={styles.authorInitial}>
                          {article.author.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className={styles.authorInfo}>
                      <h4 className={styles.authorName}>{article.author}</h4>
                      {article.authorBio && (
                        <p className={styles.authorBioText}>{article.authorBio}</p>
                      )}
                    </div>
                  </div>
                </FadeUp>
              )}

              <FadeUp delay={0.15}>
                <div className={styles.articleFooter}>
                  <div className={styles.tags}>
                    <span className={styles.tagsLabel}>{singleT?.topicsLabel || 'Topics'}</span>
                    <span className={styles.tagPill} style={{ borderColor: categoryColor, color: categoryColor }}>
                      {article.category}
                    </span>
                    <span className={styles.tagPill} style={{ borderColor: categoryColor, color: categoryColor }}>
                      {article.tag}
                    </span>
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* ── Sidebar ── */}
            <div className={styles.contentSidebar}>
              <FadeUp delay={0.1}>
                <div className={styles.sidebarCard}>
                  <h4 className={styles.sidebarTitle}>{singleT?.subscribeTitle || 'Subscribe'}</h4>
                  <p className={styles.sidebarText}>{singleT?.subscribeText || 'Get the latest articles delivered to your inbox.'}</p>
                  {subscribeSuccess ? (
                    <div className={styles.sidebarSuccess}>{singleT?.subscribeSuccess || 'Thank you for subscribing!'}</div>
                  ) : (
                    <div className={styles.sidebarForm}>
                      <input
                        type="email"
                        placeholder={singleT?.emailPlaceholder || 'Enter your email'}
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
                        {isSubscribing ? (singleT?.subscribeSending || 'Sending...') : (singleT?.subscribeTitle || 'Subscribe')}
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
                  <h4 className={styles.sidebarTitle}>{singleT?.categoriesTitle || 'Categories'}</h4>
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
                    <h4 className={styles.sidebarTitle}>{singleT?.relatedTitle || 'Related Articles'}</h4>
                    <div className={styles.sidebarRelated}>
                      {relatedArticles.map((post) => (
                        <div
                          key={post.id}
                          className={styles.sidebarRelatedItem}
                          onClick={() => setPage('article', post.id)}
                        >
                          <div className={styles.sidebarRelatedImgWrap}>
                            <img 
                              src={post.image || '/placeholder-image.jpg'} 
                              alt={post.title} 
                              className={styles.sidebarRelatedImg}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-image.jpg';
                              }}
                            />
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
                        {singleT?.viewAll || 'View All'} <ArrowRightIcon />
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
              <h2 className={styles.moreTitle}>{singleT?.moreTitle || 'More from the Blog'}</h2>
              <button className={styles.moreViewAll} onClick={() => setPage('blog')}>
                {singleT?.viewAll || 'View All'} <ArrowRightIcon />
              </button>
            </div>
          </FadeUp>

          <div className={styles.moreGrid}>
            {allPosts.slice(0, 3).map((post, index) => (
              <FadeUp key={post.id} delay={0.08 * (index + 1)}>
                <div className={styles.moreCard} onClick={() => setPage('article', post.id)}>
                  <div className={styles.moreImgWrap}>
                    <img 
                      src={post.image || '/placeholder-image.jpg'} 
                      alt={post.title} 
                      className={styles.moreImg}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <span className={styles.moreTag} style={{ background: getCategoryColor(post.category) }}>
                      {post.category}
                    </span>
                  </div>
                  <div className={styles.moreBody}>
                    <h3 className={styles.moreCardTitle}>{post.title}</h3>
                    <p className={styles.moreExcerpt}>{post.excerpt}</p>
                    <div className={styles.moreReadLink}>
                      {singleT?.readMore || 'Read More'} <ArrowRightIcon />
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