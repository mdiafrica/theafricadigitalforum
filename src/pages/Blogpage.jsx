import { useState, useEffect, useRef } from 'react';
import styles from '../Styles/BlogPage.module.css';

// ── Import images ──
import Image1 from '../Assets/Images/Image2.jpg';
import Image2 from '../Assets/Images/Image5.jpg';
import Image3 from '../Assets/Images/Image3.jpg';
import Image4 from '../Assets/Images/Image4.jpg';
import Image6 from '../Assets/Images/Image6.jpg';
import Image7 from '../Assets/Images/Image7.jpeg';
import Image9 from '../Assets/Images/image9.jpg';

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

// ── FadeUp animation wrapper ──
function FadeUp({ children, delay = 0, style = {} }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Icons ──
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#888" strokeWidth="2" fill="none"/>
    <path d="M12 6v6l4 2" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke="#888" strokeWidth="2" fill="none"/>
    <path d="M21 21l-4.35-4.35" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// ── Data ──
const FEATURED_POST = {
  category: 'Policy & Governance',
  title: "How Togo's Digital Roadmap 2025 Is Reshaping West African Policy Frameworks",
  excerpt: "Under the leadership of H.E. Faure Gnassingbé, Togo has emerged as a bold architect of regional digital governance — setting benchmarks that neighbouring nations are beginning to adopt. We examine the structural shifts underway.",
  author: 'ADF Editorial Team',
  date: 'June 12, 2026',
  readTime: '8 min read',
  tag: 'Featured',
  image: Image1,
};

const POSTS = [
  {
    category: 'Infrastructure',
    title: "Lomé's Airport Connectivity: Why Direct Routes Matter for African Tech Diplomacy",
    excerpt: "Gnassingbé Eyadéma International Airport now serves as the premier gateway hub for francophone and anglophone delegates alike.",
    author: 'Kwame Asante',
    date: 'June 10, 2026',
    readTime: '5 min read',
    tag: 'Aviation',
    image: Image2,
  },
  {
    category: 'Cybersecurity',
    title: "Building Africa's First Cross-Border Data Protection Framework from Lomé",
    excerpt: "Togo's Ministry of Digital Economy (MENTD) has quietly led the drafting of a continental data governance framework set to debut at ADF 2026.",
    author: 'Amina Diallo',
    date: 'June 8, 2026',
    readTime: '6 min read',
    tag: 'Security',
    image: Image3,
  },
  {
    category: 'Startup Ecosystem',
    title: 'From Lomé to Lagos: How West African Startups Are Leveraging the Digital Single Market',
    excerpt: 'A new cohort of founders is treating the ECOWAS digital corridor as their first market, not an afterthought.',
    author: 'Fatou Ndiaye',
    date: 'June 5, 2026',
    readTime: '7 min read',
    tag: 'Innovation',
    image: Image4,
  },
  {
    category: 'Finance',
    title: "Mobile Money and the Unbanked: Togo's Quiet Financial Revolution",
    excerpt: "Togocel's T-Money and Wave have transformed how informal traders access capital — and the lessons extend far beyond West Africa.",
    author: 'Jean-Paul Mensah',
    date: 'June 3, 2026',
    readTime: '4 min read',
    tag: 'Fintech',
    image: Image6,
  },
  {
    category: 'Trade',
    title: 'The Gulf of Guinea as a Digital Trade Corridor: Opportunities Post-AfCFTA',
    excerpt: "With the African Continental Free Trade Area accelerating, Lomé's port and digital infrastructure position it as a logistics-tech nexus.",
    author: 'ADF Editorial Team',
    date: 'May 30, 2026',
    readTime: '9 min read',
    tag: 'Trade',
    image: Image7,
  },
  {
    category: 'Policy & Governance',
    title: "Visa-Free Africa: What Togo's Open-Border Policy Teaches the Continent",
    excerpt: "Togo's decision to grant visa-free entry to all African nationals is a policy experiment with measurable economic dividends — and growing imitators.",
    author: 'Chioma Obi',
    date: 'May 27, 2026',
    readTime: '6 min read',
    tag: 'Policy',
    image: Image9,
  },
];

const CATEGORIES = ['All', 'Policy & Governance', 'Cybersecurity', 'Infrastructure', 'Startup Ecosystem', 'Finance', 'Trade'];

const CATEGORY_COLORS = {
  'Policy & Governance': '#7C3AED',
  'Cybersecurity': '#1D4ED8',
  'Infrastructure': '#065F46',
  'Startup Ecosystem': '#92400E',
  'Finance': '#9F1239',
  'Trade': '#1E3A5F',
};

const TOPICS = [
  { label: 'Digital Policy', count: 14 },
  { label: 'Cybersecurity', count: 9 },
  { label: 'Fintech & Payments', count: 11 },
  { label: 'Infrastructure', count: 7 },
  { label: 'Startup Ecosystem', count: 18 },
  { label: 'Trade & AfCFTA', count: 6 },
  { label: 'AI & Data', count: 13 },
  { label: 'Gender & Inclusion', count: 5 },
];

// ── Ticker items ──
const TICKER_ITEMS = [
  'Togo launches national AI strategy',
  'AfCFTA digital trade protocol ratified',
  'Lomé hosts inaugural African Fintech Summit',
  'Mobile money transactions hit $2B in Q2',
  'New cybersecurity framework adopted by ECOWAS',
];

// ── Story titles – now pulled from actual POSTS ──
const STORY_TITLES = POSTS.map(post => post.title);

export default function BlogPage({ setPage }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const filtered = POSTS.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const sidebarPosts = POSTS.slice(0, 3);

  return (
    <div className={styles.pageShell}>

      {/* ─── TICKER BAR ─── */}
      <div className={styles.tickerBar}>
        <div className={styles.tickerLabel}>
          <span className={styles.tickerDot} />
          Breaking
        </div>
        <div className={styles.tickerTrack}>
          <div className={styles.tickerInner}>
            {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, i) => (
              <span key={i} className={styles.tickerItem}>{item}</span>
            ))}
          </div>
        </div>
        <div className={styles.tickerMeta}>
          <span>🇹🇬 Lomé</span>
          <span>📅 June 17, 2026</span>
        </div>
      </div>

      {/* ─── SITE HEADER ─── */}
      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          <a href="/" className={styles.siteLogo}>
            <div className={styles.logoMark}>ADF</div>
            <div className={styles.logoText}>
              <span className={styles.logoMain}>Africa Digital</span>
              <span className={styles.logoSub}>Forum</span>
            </div>
          </a>
          <nav className={styles.headerNav}>
            <button className={`${styles.navLink} ${styles.navLinkActive}`}>Home</button>
            <button className={styles.navLink}>Policy</button>
            <button className={styles.navLink}>Innovation</button>
            <button className={styles.navLink}>Finance</button>
            <button className={styles.navLink}>About</button>
          </nav>
          <div className={styles.headerRight}>
            <div className={styles.headerSearch}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Search…"
                className={styles.headerSearchInput}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ─── STORIES BAR – TEXT TICKER (with real article titles) ─── */}
      <div className={styles.storiesBar}>
        <div className={styles.tickerTrack}>
          <div className={styles.tickerInner}>
            {[...STORY_TITLES, ...STORY_TITLES].map((title, idx) => (
              <span key={idx} className={styles.storyTitleTicker}>
                {title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className={styles.mainContent}>

        {/* ─── Wrap in .container ─── */}
        <div className={styles.container}>

          {/* ─── PROMO BANNER – COMING SOON ─── */}
          <div className={styles.promoBanner}>
            <div className={styles.promoBannerGlow} />
            <div className={styles.promoLeft}>
              <div className={styles.promoIcon}>📅</div>
              <div className={styles.promoTextGroup}>
                <div className={styles.sectionLabel}>
                  <span className={styles.sectionLabelLine} />
                  Coming Soon
                </div>
                <h3 className={styles.promoTitle}>ADF 2026 Registration Opens</h3>
                <div className={styles.promoSub}>Don’t miss out – registration goes live on July 1, 2026</div>
              </div>
            </div>
            <div className={styles.promoRight}>
              <button className={styles.promoBtn}>Notify Me</button>
            </div>
          </div>

          {/* ─── HERO GRID ─── */}
          <div className={styles.heroGrid}>
            <div className={styles.featuredCard}>
              <img src={FEATURED_POST.image} alt={FEATURED_POST.title} className={styles.featuredImg} />
              <div className={styles.featuredOverlay}>
                <div className={styles.featuredOverlayContent}>
                  <span className={styles.featuredCatBadge}>{FEATURED_POST.tag}</span>
                  <h2 className={styles.featuredTitle}>{FEATURED_POST.title}</h2>
                  <div className={styles.featuredMeta}>
                    <span className={styles.featuredMetaAuthor}>{FEATURED_POST.author}</span>
                    <span className={styles.featuredMetaSep}>•</span>
                    <span>{FEATURED_POST.date}</span>
                    <span className={styles.featuredMetaSep}>•</span>
                    <span><ClockIcon /> {FEATURED_POST.readTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.sidebarStories}>
              {sidebarPosts.map((post, idx) => (
                <div key={idx} className={styles.sideStory}>
                  <div className={styles.sideStoryImgWrap}>
                    <img src={post.image} alt={post.title} className={styles.sideStoryImg} />
                  </div>
                  <div className={styles.sideStoryBody}>
                    <div className={styles.sideStoryCat}>{post.category}</div>
                    <h3 className={styles.sideStoryTitle}>{post.title}</h3>
                    <div className={styles.sideStoryMeta}>{post.author} • {post.readTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── TOP STORIES SECTION ─── */}
          <div className={styles.topStoriesSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitleDot} />
              <h2 className={`${styles.h2} ${styles.h2Dark}`}>Latest Articles</h2>
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

            {filtered.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#6b6b7a' }}>
                No articles found. Try a different search term or category.
              </div>
            ) : (
              <div className={styles.topStoriesGrid}>
                {filtered.map((post, i) => (
                  <FadeUp key={i} delay={i * 0.05}>
                    <div className={styles.topStoryCard}>
                      <div className={styles.topStoryImgWrap}>
                        <img src={post.image} alt={post.title} className={styles.topStoryImg} />
                      </div>
                      <div className={styles.topStoryBody}>
                        <div
                          className={styles.topStoryCat}
                          style={{ color: CATEGORY_COLORS[post.category] || '#7C3AED' }}
                        >
                          {post.category}
                        </div>
                        <h3 className={styles.topStoryTitle}>{post.title}</h3>
                        <div className={styles.topStoryMeta}>
                          <span className={styles.topStoryAuthor}>{post.author}</span>
                          <span>•</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button className={styles.loadMoreBtn}>Load More Articles</button>
            </div>
          </div>

        </div> {/* end .container */}

        {/* ─── TOPICS BAND ─── */}
        <div className={styles.topicsBand}>
          <div className={styles.topicsBandGlow} />
          <div className={`${styles.container} ${styles.topicsBandInner}`}>
            <div className={styles.topicsHeader}>
              <h2 className={styles.topicsTitle}>Explore by Topic</h2>
              <p className={styles.topicsSub}>Dive deeper into the issues defining Africa's digital decade.</p>
            </div>
            <div className={styles.topicsList}>
              {TOPICS.map(topic => (
                <button key={topic.label} className={styles.topicPill}>
                  {topic.label}
                  <span className={styles.topicCount}>{topic.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── NEWSLETTER ─── */}
        <div className={styles.newsletterSection}>
          <div className={styles.newsletterInner}>
            <div className={styles.sectionLabel}>
              <span className={styles.sectionLabelLine} />
              Newsletter
            </div>
            <h2 className={`${styles.h2} ${styles.h2Dark}`} style={{ textAlign: 'center' }}>
              Africa's Digital Agenda, Delivered Weekly
            </h2>
            <p className={styles.subtext} style={{ textAlign: 'center', margin: '0 auto 28px' }}>
              Join 4,200+ policymakers, founders, and investors getting the ADF Digest every Thursday.
            </p>
            {subscribed ? (
              <div className={styles.subscribedMsg}>✓ You're subscribed — see you in your inbox.</div>
            ) : (
              <div className={styles.subscribeForm}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={styles.subscribeInput}
                />
                <button
                  onClick={() => { if (email) setSubscribed(true); }}
                  className={styles.subscribeBtn}
                >
                  Subscribe
                </button>
              </div>
            )}
          </div>
        </div>

      </div> {/* end mainContent */}
    </div>
  );
}