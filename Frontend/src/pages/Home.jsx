// src/pages/Home.js
import { useState, useEffect, useRef } from 'react';
import sharedStyles from '../Styles/shared.module.css';
import styles from '../Styles/Home.module.css';
import Button from '../components/Button';
import emailjs from '@emailjs/browser';

import Image1 from '../Assets/Images/Image2.png';
import Image2 from '../Assets/Images/Image5.jpg';
import Image3 from '../Assets/Images/Image3.jpg';
import Image4 from '../Assets/Images/Image4.png';
import Image6 from '../Assets/Images/Image6.png';
import Image7 from '../Assets/Images/Image7.jpeg';
import Image9 from '../Assets/Images/image9.jpg';
import Image8 from '../Assets/Images/Image8.png';

// ── REAL SPEAKER IMAGES ──
import speaker1 from '../Assets/Images/LACINA KONE.png';
import speaker2 from '../Assets/Images/Mitchell Elegbe.png';
import speaker3 from '../Assets/Images/REBECCA ENOCHONG.png';
import speaker4 from '../Assets/Images/Shola Akinlade.png';
import speaker5 from '../Assets/Images/TIDIANE DEME.avif';
import speaker6 from '../Assets/Images/H.E. Cina Lawson.png';
import speaker7 from '../Assets/Images/Tony O. Elumelu.png';
import speaker8 from "../Assets/Images/GEOFFROY-Odundo-scaled.jpeg";
import speaker9 from "../Assets/Images/Hassanein HIRIDJEE.jpeg";
import speaker10 from "../Assets/Images/Juliana Rotich.jpeg";
import speaker11 from "../Assets/Images/Iyinoluwa Aboyeji.jpg";

// ── POST IMAGES MAPPING ──
const POST_IMAGES = {
  1: Image6,
  2: Image2,
  3: Image3,
  4: Image4,
  5: Image7,
  6: Image9,
  7: Image8,
  8: Image1,
};

// ── EMAILJS CREDENTIALS ──
const EMAILJS_SERVICE_ID = 'service_oqw60pt';
const EMAILJS_TEMPLATE_ID = 'template_t9fam69';
const EMAILJS_PUBLIC_KEY = 'CRiokfjvcAxMuJHMB';

const sliderImages = [{ url: Image1 }, { url: Image2 }, { url: Image6 }];

// ── Hooks ──
function useInView(options = {}) {
  const [ref, setRef] = useState(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1, ...options }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);
  return [setRef, inView];
}

function useCountUp(target, duration = 1800, started = false) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.round(easeOutQuart(progress) * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, target, duration]);
  return count;
}

function FadeUp({ children, delay = 0, style = {} }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
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

// ── Stats config ──
const statConfig = [
  { target: 1000, suffix: '+', icon: 'ti-users', color: '#7C3AED' },
  { target: 50, suffix: '+', icon: 'ti-world', color: '#7C3AED' },
  { target: 150, suffix: '+', icon: 'ti-microphone', color: '#7C3AED' },
  { target: 200, suffix: '+', icon: 'ti-rocket', color: '#7C3AED' },
  { target: 100, suffix: '+', icon: 'ti-building-skyscraper', color: '#7C3AED' },
  { target: 50, suffix: '+', icon: 'ti-trending-up', color: '#7C3AED' },
];

// ── StatCard ──
function StatCard({ target, suffix, label, icon, color, delay, started }) {
  const count = useCountUp(target, 1800, started);
  return (
    <div
      className={styles.statCard}
      style={{
        opacity: started ? 1 : 0,
        transform: started ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.6s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
      }}
    >
      <i className={`ti ${icon} ${styles.statIcon}`} aria-hidden="true" style={{ color }} />
      <div className={styles.statNumber}>
        {count.toLocaleString()}
        <span className={styles.statSuffix}>{suffix}</span>
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

// ── Hero ──
function Hero({ setPage, t }) {
  const [loaded, setLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroT = t.home.hero;

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fadeIn = (delay) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? 'translateY(0)' : 'translateY(24px)',
    transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
  });

  const currentSlide = heroT.slides[currentImageIndex] || { title: '', location: '' };

  return (
    <section className={styles.hero}>
      <div className={styles.heroSlider}>
        {sliderImages.map((image, index) => (
          <div
            key={index}
            className={`${styles.heroSlide} ${
              index === currentImageIndex ? styles.heroSlideActive : ''
            }`}
            style={{
              opacity: index === currentImageIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
            }}
          >
            <img src={image.url} alt={currentSlide.title || ''} />
          </div>
        ))}
        <div className={styles.heroOverlay} />
      </div>

      <button
        className={styles.slidePrev}
        onClick={() =>
          setCurrentImageIndex((p) => (p - 1 + sliderImages.length) % sliderImages.length)
        }
      >
        ‹
      </button>
      <button
        className={styles.slideNext}
        onClick={() => setCurrentImageIndex((p) => (p + 1) % sliderImages.length)}
      >
        ›
      </button>

      <div className={styles.slideIndicators}>
        {sliderImages.map((_, index) => (
          <button
            key={index}
            className={`${styles.slideDot} ${
              index === currentImageIndex ? styles.slideDotActive : ''
            }`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>

      <div className={styles.heroContent}>
        <div style={fadeIn(0.1)} className={styles.heroEyebrow}>
          <span className={styles.heroEyebrowDot} />
          <span>{heroT.date}</span>
        </div>
        <h1
          className={styles.heroTitle}
          style={fadeIn(0.2)}
          dangerouslySetInnerHTML={{ __html: heroT.title }}
        />
        <div className={styles.heroTagline} style={fadeIn(0.28)}>
          {heroT.tagline}
        </div>
        <div className={styles.heroActions} style={fadeIn(0.43)}>
          <Button
            variant="join"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPage('whyadf');
            }}
          >
            {heroT.button}
          </Button>
        </div>
      </div>

      <div className={styles.imageCaption}>
        {currentSlide.title} — {currentSlide.location}
      </div>
    </section>
  );
}

// ── StatsBar ──
function StatsBar({ t }) {
  const [gridRef, inView] = useInView({ threshold: 0.2 });
  const statsT = t.home.stats;

  return (
    <div className={styles.statsBar}>
      <div className={styles.statsContainer}>
        <div ref={gridRef} className={styles.statsGrid}>
          {statConfig.map((stat, index) => (
            <StatCard
              key={index}
              target={stat.target}
              suffix={stat.suffix}
              label={statsT[index]?.label || ''}
              icon={stat.icon}
              color={stat.color}
              delay={index * 0.1}
              started={inView}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PresidentialDialogues ──
function PresidentialDialogues({ t }) {
  const dialogues = t.home.dialogues || [];

  return (
    <section className={styles.dialoguesSection}>
      <div className={`${styles.container} ${styles.dialoguesInner}`}>
        <div className={styles.dialoguesHeader}>
          <div className={styles.dialoguesBadge}>
            <span className={styles.sectionLabelLine} />
            <span>{t.home.dialoguesLabel}</span>
          </div>
          <h2 className={styles.dialoguesTitle}>{t.home.dialoguesTitle}</h2>
          <p className={styles.dialoguesSubtitle}>{t.home.dialoguesSubtitle}</p>
        </div>
        <div className={styles.dialoguesCardsGrid}>
          {dialogues.map((item) => (
            <div key={item.title} className={styles.dialogueCard}>
              <div className={styles.dialogueCardIcon}>
                <i className={`ti ${item.icon}`} aria-hidden="true" />
              </div>
              <h3 className={styles.dialogueCardTitle}>{item.title}</h3>
              <p className={styles.dialogueCardText}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── SpeakerCard ──
function SpeakerCard({ speaker, index, teaserT }) {
  if (speaker.isTeaser) {
    return (
      <FadeUp delay={0.06}>
        <div className={`${styles.speakerCard} ${styles.teaserCard}`}>
          <div className={styles.teaserIcon}>
            <i className="ti ti-microphone" aria-hidden="true" />
          </div>
          <h3 className={styles.teaserTitle}>{teaserT.name}</h3>
          <p className={styles.teaserSubtitle}>{teaserT.role}</p>
          <div className={styles.teaserDivider} />
          <div className={styles.teaserCta}>
            <span>{teaserT.cta}</span>
            <i className="ti ti-bell-ringing" aria-hidden="true" />
          </div>
        </div>
      </FadeUp>
    );
  }

  return (
    <FadeUp delay={0.06}>
      <div className={styles.speakerCard}>
        <div className={styles.speakerImageFrame}>
          <div className={styles.speakerImageRing} />
          <img src={speaker.image} alt={speaker.name} className={styles.speakerImage} />
          <div className={styles.speakerImageBadge}>{String(index + 1).padStart(2, '0')}</div>
        </div>
        <div className={styles.speakerInfo}>
          <h3 className={styles.speakerName}>{speaker.name}</h3>
          <p className={styles.speakerTitle}>{speaker.role}</p>
          <div className={styles.speakerDivider} />
          <div className={styles.speakerSocial}>
            <a
              href={speaker.twitter}
              className={styles.speakerSocialLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="ti ti-brand-twitter" aria-hidden="true" />
            </a>
            <a
              href={speaker.linkedin}
              className={styles.speakerSocialLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="ti ti-brand-linkedin" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}

// ── SpeakersSection ──
function SpeakersSection({ setPage, t }) {
  const teaserT = t.home.speakersTeaser;
  const sectionT = t.home.speakersSection;

  // Get speakers from translations
  const speakersData = t.home.speakers || [];
  
  // Map speakers with images (use imported images in order)
  const speakerImages = [
    speaker6, speaker1, speaker7, speaker3, speaker2,
    speaker4, speaker5, speaker8, speaker9, speaker10, speaker11
  ];

  const speakersWithImages = speakersData.map((speaker, index) => ({
    name: speaker.name,
    role: speaker.role,
    image: speakerImages[index % speakerImages.length] || speaker1,
    twitter: speaker.twitter || '#',
    linkedin: speaker.linkedin || '#',
  }));

  // Add the teaser card
  const allSpeakers = [...speakersWithImages, { isTeaser: true }];

  return (
    <section id="speakers" data-scroll="speakers" className={styles.speakersSection} style={{ backgroundImage: `url(${Image6})` }}>
      <div className={styles.speakersOverlay} />
      <div className={styles.container}>
        <FadeUp>
          <div className={styles.sectionLabel}>
            <span className={styles.sectionLabelLine} />
            {sectionT.label}
          </div>
        </FadeUp>
        <FadeUp delay={0.05}>
          <h2 className={styles.h2}>{sectionT.title}</h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className={styles.subtext}>{sectionT.subtitle}</p>
        </FadeUp>
        <div className={styles.speakersList}>
          {allSpeakers.map((speaker, index) => (
            <SpeakerCard key={index} speaker={speaker} index={index} teaserT={teaserT} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── LatestArticlesSection ──
function LatestArticlesSection({ setPage, t }) {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  const latestT = t.home.latest;

  // ✅ Get posts from translations like the blog page does
  const posts = (t.blog?.posts || [])
    .map(post => ({
      ...post,
      image: POST_IMAGES[post.id] || null,
    }))
    .sort((a, b) => b.id - a.id)
    .slice(0, 3);

  useEffect(() => {
    if (subscribeSuccess) {
      const timer = setTimeout(() => setSubscribeSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [subscribeSuccess]);

  const sendEmailJS = async (subject, messageText) => {
    if (!email) {
      setSubscribeError(latestT.newsletter.error);
      return false;
    }

    setIsSubscribing(true);
    setSubscribeError('');
    setSubscribeSuccess(false);

    try {
      const templateParams = {
        name: 'Blog Subscriber',
        from_email: email,
        phone: 'N/A',
        company: 'ADF Blog Reader',
        subject: subject,
        message: messageText,
      };

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      return true;
    } catch (error) {
      console.error('EmailJS error:', error);
      setSubscribeError(latestT.newsletter.errorGeneric || 'Something went wrong. Please try again.');
      return false;
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSubscribe = async () => {
    if (!email) {
      setSubscribeError(latestT.newsletter.error);
      return;
    }

    const success = await sendEmailJS(latestT.newsletter.subject, latestT.newsletter.message);
    if (success) {
      setSubscribeSuccess(true);
      setEmail('');
    }
  };

  const goToArticle = (postId) => {
    setPage('article', postId);
  };

  return (
    <section className={styles.latestArticlesSection}>
      <div className={styles.container}>
        <div className={styles.latestHeader}>
          <div className={styles.latestHeaderLeft}>
            <FadeUp>
              <div className={styles.sectionLabel}>
                <span className={styles.sectionLabelLine} />
                <span>{latestT.label}</span>
              </div>
            </FadeUp>
            <FadeUp delay={0.05}>
              <h2 className={styles.latestTitle}>{latestT.title}</h2>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className={styles.latestSub}>{latestT.subtitle}</p>
            </FadeUp>
          </div>

          <div className={styles.latestHeaderRight}>
            <FadeUp delay={0.15}>
              <div className={styles.inlineNewsletter}>
                <div className={styles.inlineNewsletterLabel}>
                  <i className="ti ti-mail" aria-hidden="true" />
                  <span>{latestT.newsletter.label}</span>
                </div>
                {subscribeSuccess ? (
                  <div className={styles.inlineSuccess}>{latestT.newsletter.success}</div>
                ) : (
                  <div className={styles.inlineForm}>
                    <input
                      type="email"
                      placeholder={latestT.newsletter.placeholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.inlineInput}
                      disabled={isSubscribing}
                    />
                    <button
                      className={styles.inlineBtn}
                      onClick={handleSubscribe}
                      disabled={isSubscribing || !email}
                    >
                      {isSubscribing ? latestT.newsletter.sending : latestT.newsletter.button}
                    </button>
                  </div>
                )}
                {subscribeError && <div className={styles.inlineError}>{subscribeError}</div>}
              </div>
            </FadeUp>
          </div>
        </div>

        <div className={styles.latestGrid}>
          {posts.map((post, index) => (
            <FadeUp key={index} delay={0.15 + index * 0.08}>
              <div
                className={styles.latestCard}
                onClick={() => goToArticle(post.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.latestImgWrap}>
                  <img src={post.image} alt={post.title} className={styles.latestImg} />
                  <span className={styles.latestTag}>{post.category}</span>
                </div>
                <div className={styles.latestBody}>
                  <h3 className={styles.latestCardTitle}>{post.title}</h3>
                  <p className={styles.latestExcerpt}>{post.excerpt}</p>
                  <div className={styles.latestReadLink}>
                    {latestT.readMore} <i className="ti ti-arrow-right" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        <div className={styles.latestFooter}>
          <button className={styles.latestViewAll} onClick={() => setPage('blog')}>
            {latestT.viewAll} <i className="ti ti-arrow-right" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Main HomePage ──
export default function HomePage({ setPage, t, lang }) {
  return (
    <>
      <Hero setPage={setPage} t={t} />
      <StatsBar t={t} />
      <PresidentialDialogues t={t} />
      <SpeakersSection setPage={setPage} t={t} />
      <LatestArticlesSection setPage={setPage} t={t} />
    </>
  );
}