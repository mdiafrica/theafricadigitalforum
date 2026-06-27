import { useState, useEffect, useRef } from 'react';
import styles from '../Styles/shared.module.css';
import pageStyles from '../Styles/CityPage.module.css';
import Image1 from '../Assets/Images/Image2.jpg';
import Image2 from '../Assets/Images/Image5.jpg';
import Image3 from '../Assets/Images/Image3.jpg';
import Image4 from '../Assets/Images/Image4.jpg';
import Image6 from '../Assets/Images/Image6.jpg';
import Image7 from '../Assets/Images/Image7.jpeg';
import Image9 from '../Assets/Images/image9.jpg';

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

// ── SVG Icon Components (fully defined) ──
const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 6 11 6 11s6-5.75 6-11c0-3.87-3.13-7-7-7z" stroke="#7C3AED" strokeWidth="2" fill="none"/>
    <circle cx="12" cy="9" r="2.5" stroke="#7C3AED" strokeWidth="2" fill="none"/>
  </svg>
);

const VisaIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="12" rx="2" stroke="#7C3AED" strokeWidth="2" fill="none"/>
    <path d="M8 12h8" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="16" cy="12" r="2" stroke="#7C3AED" strokeWidth="2" fill="none"/>
  </svg>
);

const AviationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M22 2L15 9" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const DigitalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="14" rx="2" stroke="#7C3AED" strokeWidth="2" fill="none"/>
    <path d="M8 21h8M12 17v4" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="10" r="2" stroke="#7C3AED" strokeWidth="2" fill="none"/>
    <path d="M16 10h2M6 10h2" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SecurityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L3 7v7c0 5.25 9 8 9 8s9-2.75 9-8V7l-9-4z" stroke="#7C3AED" strokeWidth="2" fill="none"/>
    <path d="M12 8v5M12 16h.01" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const HospitalityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2v20M2 12h20" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="9" stroke="#7C3AED" strokeWidth="2" fill="none"/>
    <path d="M8 8l3 3M13 11l3-3M8 16l8-8" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#7C3AED" strokeWidth="2" fill="none"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10 15.3 15.3 0 0 0 4-10 15.3 15.3 0 0 0-4-10z" stroke="#7C3AED" strokeWidth="2" fill="none"/>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── Map icons to each card ──
const getIconForCard = (index) => {
  const icons = [
    <GlobeIcon />,      // Strategic Location
    <VisaIcon />,       // Visa-Free Travel
    <AviationIcon />,   // Aviation Excellence
    <DigitalIcon />,    // Digital Transformation
    <SecurityIcon />,   // Cybersecurity
    <HospitalityIcon /> // Hospitality
  ];
  return icons[index % icons.length];
};

export default function CityPage({ t, setPage }) {
  const city = t.city;
  const scrollContainerRef = useRef(null);
  const infoSectionRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const animationRef = useRef(null);

  // ── Build FORUM_PILLARS from translations and static images ──
  const FORUM_PILLARS = city.cards.items.map((item, index) => ({
    title: item.title,
    subtitle: item.subtitle,
    price: item.price,
    description: item.description,
    // Map static images in order: Image3, Image1, Image4, Image6, Image2, Image7
    img: [Image3, Image1, Image4, Image6, Image2, Image7][index % 6],
  }));

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      setIsAnimating(false);
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
      clearTimeout(animationRef.current);
      animationRef.current = setTimeout(() => setIsAnimating(true), 3000);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      setIsAnimating(false);
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
      clearTimeout(animationRef.current);
      animationRef.current = setTimeout(() => setIsAnimating(true), 3000);
    }
  };

  const scrollToInfoSection = () => {
    if (infoSectionRef.current) {
      infoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLearnMoreClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (setPage) {
      setPage('whyadf');
    }
  };

  return (
    <div className={pageStyles.pageShell}>

      {/* ── 1. HERO ── */}
      <div
        className={pageStyles.pageShellHeader}
        style={{
          backgroundImage: `url(${Image6})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className={pageStyles.heroContent}>
          <FadeUp>
            <h1 className={pageStyles.pageShellTitle}>{city.hero.title}</h1>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className={pageStyles.heroSubtitle}>{city.hero.subtitle}</p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <button className={pageStyles.heroCta} onClick={scrollToInfoSection}>
              {city.hero.cta}
            </button>
          </FadeUp>
        </div>
      </div>

      {/* ── 2. INFO SECTION ── */}
      <div ref={infoSectionRef}>
        <FadeUp>
          <div className={pageStyles.infoSection}>
            <div className={pageStyles.infoText}>
              <h2 className={pageStyles.infoHeading}>{city.info.heading}</h2>
              <div className={pageStyles.infoUnderline} />
              <p className={pageStyles.infoBody}>{city.info.body}</p>
            </div>

            <div className={pageStyles.infoPhotoGrid}>
              {[Image1, Image2, Image9].map((img, i) => (
                <div key={i} className={pageStyles.infoPhotoWrap}>
                  <img
                    src={img}
                    alt={`Lomé highlight ${i + 1}`}
                    className={pageStyles.infoPhoto}
                  />
                  <span className={pageStyles.infoPhotoBadge}>
                    {city.info.badges[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </div>

      {/* ── 3. PROMO BANNER ── */}
      <FadeUp>
        <div
          className={pageStyles.promoBanner}
          style={{ backgroundImage: `url(${Image9})` }}
        >
          <div className={pageStyles.promoContent}>
            <h3 className={pageStyles.promoHeading}>{city.promo.heading}</h3>
            <p className={pageStyles.promoSub}>{city.promo.subtitle}</p>
          </div>
          <button className={pageStyles.promoBtn} onClick={handleLearnMoreClick}>
            {city.promo.button}
          </button>
        </div>
      </FadeUp>

      {/* ── 4. PILLAR CARDS ── */}
      <FadeUp>
        <div className={pageStyles.cardsSection}>
          <div className={pageStyles.cardsSectionHeader}>
            <h2 className={pageStyles.cardsSectionTitle}>{city.cards.title}</h2>
            <div className={pageStyles.cardsSectionUnderline} />
          </div>

          <div className={pageStyles.carouselContainer}>
            <button
              className={`${pageStyles.navButton} ${pageStyles.navButtonLeft}`}
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeftIcon />
            </button>

            <div className={pageStyles.horizontalScrollWrapper}>
              <div
                ref={scrollContainerRef}
                className={`${pageStyles.horizontalScrollTrack} ${isAnimating ? pageStyles.animate : ''}`}
              >
                {FORUM_PILLARS.map((card, i) => (
                  <div key={i} className={pageStyles.horizontalCard}>
                    <div className={pageStyles.horizontalCardImgWrap}>
                      <img
                        src={card.img}
                        alt={card.title}
                        className={pageStyles.horizontalCardImg}
                      />
                      <div className={pageStyles.horizontalCardBadge}>{card.price}</div>
                    </div>
                    <div className={pageStyles.horizontalCardBody}>
                      <div className={pageStyles.horizontalCardSubtitle}>{card.subtitle}</div>
                      <div className={pageStyles.horizontalCardTitle}>{card.title}</div>
                      <p className={pageStyles.horizontalCardDescription}>
                        {card.description}
                      </p>
                      <div className={pageStyles.horizontalCardMeta}>
                        <span className={pageStyles.horizontalCardMetaIcon}>
                          {getIconForCard(i)}
                        </span>
                        <span>{card.subtitle}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {FORUM_PILLARS.map((card, i) => (
                  <div key={`duplicate-${i}`} className={pageStyles.horizontalCard}>
                    <div className={pageStyles.horizontalCardImgWrap}>
                      <img
                        src={card.img}
                        alt={card.title}
                        className={pageStyles.horizontalCardImg}
                      />
                      <div className={pageStyles.horizontalCardBadge}>{card.price}</div>
                    </div>
                    <div className={pageStyles.horizontalCardBody}>
                      <div className={pageStyles.horizontalCardSubtitle}>{card.subtitle}</div>
                      <div className={pageStyles.horizontalCardTitle}>{card.title}</div>
                      <p className={pageStyles.horizontalCardDescription}>
                        {card.description}
                      </p>
                      <div className={pageStyles.horizontalCardMeta}>
                        <span className={pageStyles.horizontalCardMetaIcon}>
                          {getIconForCard(i)}
                        </span>
                        <span>{card.subtitle}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              className={`${pageStyles.navButton} ${pageStyles.navButtonRight}`}
              onClick={scrollRight}
              aria-label="Scroll right"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </FadeUp>

      {/* ── 5. CTA BAND ── */}
      <FadeUp>
        <div
          className={pageStyles.ctaBand}
          style={{ backgroundImage: `url(${Image2})` }}
        >
          <div className={pageStyles.ctaBandContent}>
            <h2 className={pageStyles.ctaBandTitle}>{city.cta.title}</h2>
            <p className={pageStyles.ctaBandSub}>{city.cta.subtitle}</p>
            <button className={pageStyles.ctaBandBtn}>{city.cta.button}</button>
          </div>
        </div>
      </FadeUp>

    </div>
  );
}