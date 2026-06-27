import { useState, useEffect, useRef } from 'react';
import styles from '../Styles/BlogPage.module.css';
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
// ── SPEED: the list page doesn't need the full rich-text `content` body of
// every article — that's the heaviest part of the payload. `fields[]` limits
// which top-level fields Strapi returns, so we skip `content` here and only
// fetch it on the single-article page where it's actually rendered. ──
const ARTICLES_POPULATE_QUERY =
  'fields[0]=title' +
  '&fields[1]=slug' +
  '&fields[2]=excerpt' +
  '&fields[3]=publishedAt' +
  '&populate[coverImage][fields][0]=url' +
  '&populate[author][populate][profileImage][fields][0]=url' +
  '&populate[author][fields][0]=name' +
  '&populate[category][fields][0]=name' +
  '&populate[tags][fields][0]=name' +
  '&sort=publishedAt:desc' +
  '&pagination[pageSize]=24';

// ── Helper: Render Rich Text Content ──
const renderRichText = (content) => {
  if (!content || !Array.isArray(content)) return null;
  
  return content.map((block, index) => {
    // Handle heading
    if (block.type === 'heading' || block.type === 'heading-one') {
      return (
        <h2 key={index} style={{ fontSize: '24px', fontWeight: 'bold', margin: '20px 0 12px' }}>
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
          .replace(/<h2>/g, '<h2 style="font-size:24px;font-weight:bold;margin:20px 0 12px">')
          .replace(/<p>/g, '<p style="margin:0 0 12px;line-height:1.8">')
          .replace(/<ul>/g, '<ul style="margin:0 0 12px 20px;list-style-type:disc">')
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
        return <p key={index} style={{ margin: '0 0 12px', lineHeight: '1.8' }}>{text}</p>;
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
      <div key={index} style={{ margin: '0 0 12px', lineHeight: '1.8' }}>
        {block.children?.map(child => child.text).join('')}
      </div>
    );
  });
};

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

  // ── STATE FOR DYNAMIC DATA ──
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['All']);
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');

  const newsletterRef = useRef(null);

  // ── FETCH ARTICLES AND CATEGORIES FROM STRAPI ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // ── FIX: Strapi v5 correct populate syntax (bracket notation for
        // nested relations, e.g. author -> profileImage) ──
        const response = await fetch(
          `${STRAPI_API_URL}/articles?${ARTICLES_POPULATE_QUERY}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 Strapi response:', data);
        
        // Transform posts
        const transformedPosts = data.data.map((item) => {
          const article = item;
          
          // Get image URL
          let imageUrl = null;
          if (article.coverImage?.url) {
            imageUrl = `${STRAPI_URL}${article.coverImage.url}`;
          }
          
          // Get author profile image
          let authorAvatarUrl = null;
          if (article.author?.profileImage?.url) {
            if (article.author.profileImage.url.startsWith('/')) {
              authorAvatarUrl = `${STRAPI_URL}${article.author.profileImage.url}`;
            } else {
              authorAvatarUrl = article.author.profileImage.url;
            }
          }
          
          // Get category name
          const categoryName = article.category?.name || 'General';
          
          // Get author name  
          const authorName = article.author?.name || 'ADF Team';
          
          // Get tags
          const tags = article.tags?.map(tag => tag.name) || [];
          const tag = tags.length > 0 ? tags[0] : article.tag || categoryName;
          
          // Format date
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
          
          // Read time: content isn't fetched on the list page anymore (see
          // SPEED note above), so use Strapi's readTime field if set,
          // otherwise fall back to a flat estimate from the excerpt length.
          const readTime = article.readTime
            || `${Math.max(2, Math.ceil((article.excerpt?.length || 0) / 200))} min read`;
          
          return {
            id: item.documentId || item.id,
            title: article.title || 'Untitled',
            slug: article.slug || article.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'untitled',
            excerpt: article.excerpt || '',
            category: categoryName,
            tag: tag,
            author: authorName,
            authorAvatar: authorAvatarUrl,
            date: date,
            readTime: readTime,
            image: imageUrl,
            publishedAt: article.publishedAt,
          };
        });
        
        console.log('✅ Transformed posts:', transformedPosts);
        setPosts(transformedPosts);
        
        // ── EXTRACT DYNAMIC CATEGORIES FROM POSTS ──
        const uniqueCategories = ['All', ...new Set(transformedPosts.map(p => p.category).filter(Boolean))];
        console.log('📂 Dynamic categories:', uniqueCategories);
        setCategories(uniqueCategories);
        
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Failed to load articles. Please refresh the page.');
        // ONLY use fallback if API completely fails
        if (blogT.posts && blogT.posts.length > 0 && posts.length === 0) {
          console.log('📚 Using fallback translations data');
          setPosts(blogT.posts);
          // Also use translation categories as fallback
          if (blogT.categories) {
            setCategories(blogT.categories);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (subscribed) {
      const timer = setTimeout(() => setSubscribed(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [subscribed]);

  const scrollToNewsletter = () => {
    newsletterRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Use dynamic categories or fallback to translations ──
  const CATEGORIES = categories.length > 1 ? categories : (blogT.categories || ['All']);

  // ── Filter articles ──
  const filtered = posts.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !searchQuery ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());
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

  // Loading and error states no longer block the page — the header and
  // layout render immediately. Empty/skeleton handling for posts happens
  // inline further down (hero, grid, "no articles" message).

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

          {loading ? (
            <div className={styles.articlesGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.articleCard} style={{ opacity: 0.5 }}>
                  <div className={styles.articleImgWrap} style={{ background: '#eee' }} />
                  <div className={styles.articleBody}>
                    <div style={{ height: 10, width: '40%', background: '#eee', borderRadius: 4, marginBottom: 10 }} />
                    <div style={{ height: 14, width: '90%', background: '#eee', borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ height: 14, width: '70%', background: '#eee', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className={styles.emptyState}>
              {error
                ? (error)
                : (blogT.noResults || 'No articles found')}
            </p>
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

      {/* ── TOPICS BAND ── */}
      <FadeUp>
        <div className={styles.topicsBand}>
          <div className={styles.topicsBandGlow} />
          <div className={styles.container}>
            <h2 className={styles.topicsTitle}>{blogT.exploreTopicsTitle || 'Explore Topics'}</h2>
            <p className={styles.topicsSub}>{blogT.exploreTopicsSub || 'Discover content by category'}</p>
            <div className={styles.topicsList}>
              {/* Use dynamic categories instead of static topics */}
              {CATEGORIES.filter(cat => cat !== 'All').map(cat => (
                <button 
                  key={cat} 
                  className={styles.topicPill}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                  <span className={styles.topicCount}>
                    {posts.filter(p => p.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </FadeUp>

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