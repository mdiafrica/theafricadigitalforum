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

// SVG Icon Components
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

// Navigation Arrow Icons
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

// Map icons to each card based on its theme
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

// Updated FORUM_PILLARS with all the content from About Host City
const FORUM_PILLARS = [
  {
    title: 'Strategic Location in West Africa',
    subtitle: 'Gulf of Guinea Gateway',
    price: 'Visa-Free',
    img: Image3,
    description: 'Located on the Gulf of Guinea, Lomé serves as a vibrant melting pot for business and trade. Its geographical position provides an optimal gateway, connecting the Francophone and Anglophone markets of the region, making it an ideal neutral ground for building a unified digital single market.',
  },
  {
    title: 'Inclusive Access: Visa-Free Travel',
    subtitle: 'No Bureaucratic Delays',
    price: 'Visa-Free',
    img: Image1,
    description: 'In line with our mission to break down barriers, Togo offers visa-free access for African citizens. This commitment to regional integration directly supports the Africa Digital Forum\'s goal of inclusivity, ensuring that the best minds from across the continent and beyond can gather without bureaucratic delay.',
  },
  {
    title: 'Aviation Excellence',
    subtitle: 'An Airline Hub',
    price: 'Direct Flights',
    img: Image4,
    description: 'Lomé\'s Gnassingbé Eyadéma International Airport (LFW) is the primary hub for airlines. This connectivity ensures that delegates, investors, and policymakers from across the continent have seamless, direct flight access, significantly reducing logistical friction for our international attendees.',
  },
  {
    title: 'Ambition for Digital Transformation',
    subtitle: 'Government Roadmap 2025',
    price: 'Innovation',
    img: Image6,
    description: 'Togo has defined the transformation of its national economy through digital technologies as one of its strategic priorities in the government\'s Roadmap 2025. Under the leadership of H.E. Faure Gnassingbé, the commitment to digitalisation is already noticeable through measures taken by the Ministry of Digital Economy and Digital Transformation (MENTD).',
  },
  {
    title: 'Emerging Cybersecurity & Policy Hub',
    subtitle: 'Regional Governance Leader',
    price: 'Secure',
    img: Image2,
    description: 'Togo is increasingly positioning itself as a leader in regional governance. By hosting the forum here, we leverage the city\'s growing focus on cybersecurity and data protection, providing a secure, stable, and professional environment for delegates to negotiate the frameworks that will define Africa\'s digital economy.',
  },
  {
    title: 'Cost Competitiveness & World-Class Hospitality',
    subtitle: 'Hotel 2 Février & More',
    price: '5-Star Value',
    img: Image7,
    description: 'Lomé offers an exceptional balance of luxury and efficiency. With premium, professional venues, such as the five-star Hotel 2 Février, Lomé allows for high-level plenary sessions, secure VIP spaces, and expansive breakout areas at a cost-effective price point compared to other major regional capitals.',
  },
];

export default function CityPage({ t, setPage }) {
  const scrollContainerRef = useRef(null);
  const infoSectionRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const animationRef = useRef(null);

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
            <h1 className={pageStyles.pageShellTitle}>Lomé, Togo</h1>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p className={pageStyles.heroSubtitle}>
              The Natural Epicenter of West African Integration &amp; Digital Transformation
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <button className={pageStyles.heroCta} onClick={scrollToInfoSection}>
              Why Lomé
            </button>
          </FadeUp>
        </div>
      </div>

      {/* ── 2. INFO SECTION ── */}
      <div ref={infoSectionRef}>
        <FadeUp>
          <div className={pageStyles.infoSection}>
            <div className={pageStyles.infoText}>
              <h2 className={pageStyles.infoHeading}>Our Strategic Host City</h2>
              <div className={pageStyles.infoUnderline} />
              <p className={pageStyles.infoBody}>
                Lomé is more than just a destination — it is the natural epicenter for
                West African integration and the ideal venue for a Pan-African digital
                transformation forum. By convening in Lomé, the Africa Digital Forum
                positions itself at the crossroads of commerce, innovation, and policy.
                Located on the Gulf of Guinea, Lomé connects the Francophone and
                Anglophone markets of the region, serving as the natural neutral ground
                for building a unified digital single market. Togo also offers visa-free
                access for all African citizens, ensuring the continent's best minds can
                gather without bureaucratic delay — a direct expression of the Forum's
                commitment to inclusivity and regional integration.
              </p>
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
                    {['Visa-Free Entry', 'Digital Hub', '5-Star Venues'][i]}
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
            <h3 className={pageStyles.promoHeading}>Africa's Digital Future Starts in Lomé</h3>
            <p className={pageStyles.promoSub}>
              Under the leadership of H.E. Faure Gnassingbé, President of the Council of Togo,
              Togo has made digital transformation a core strategic priority — and is already delivering.
            </p>
          </div>
          <button className={pageStyles.promoBtn} onClick={handleLearnMoreClick}>
            Learn More
          </button>
        </div>
      </FadeUp>

      {/* ── 4. PILLAR CARDS (HORIZONTAL SCROLLING ANIMATED WITH SIDE NAVIGATION BUTTONS) ── */}
      <FadeUp>
        <div className={pageStyles.cardsSection}>
          <div className={pageStyles.cardsSectionHeader}>
            <h2 className={pageStyles.cardsSectionTitle}>Why delegates choose Lomé</h2>
            <div className={pageStyles.cardsSectionUnderline} />
          </div>

          {/* Carousel Container with Side Navigation */}
          <div className={pageStyles.carouselContainer}>
            {/* Left Navigation Button */}
            <button
              className={`${pageStyles.navButton} ${pageStyles.navButtonLeft}`}
              onClick={scrollLeft}
              aria-label="Scroll left"
            >
              <ChevronLeftIcon />
            </button>

            {/* Horizontal scrolling animated cards container */}
            <div className={pageStyles.horizontalScrollWrapper}>
              <div
                ref={scrollContainerRef}
                className={`${pageStyles.horizontalScrollTrack} ${isAnimating ? pageStyles.animate : ''}`}
              >
                {/* First set of cards */}
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
                {/* Duplicate set for seamless infinite scroll effect */}
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

            {/* Right Navigation Button */}
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

      {/* ── 5. CYBERSECURITY & DIGITAL AMBITION BAND ── */}
      <FadeUp>
        <div
          className={pageStyles.ctaBand}
          style={{ backgroundImage: `url(${Image2})` }}
        >
          <div className={pageStyles.ctaBandContent}>
            <h2 className={pageStyles.ctaBandTitle}>A Secure, Stable Stage for Africa's Digital Agenda</h2>
            <p className={pageStyles.ctaBandSub}>
              Togo's growing focus on cybersecurity and data protection makes Lomé the ideal
              environment for delegates to negotiate the frameworks defining Africa's digital economy.
              The Ministry of Digital Economy and Digital Transformation (MENTD) and a dynamic
              startup ecosystem signal a city ready to lead — not just host.
            </p>
            <button className={pageStyles.ctaBandBtn}>Registration Coming Soon</button>
          </div>
        </div>
      </FadeUp>

    </div>
  );
}