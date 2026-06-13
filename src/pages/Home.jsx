import { useState, useEffect, useRef } from 'react';
import sharedStyles from '../Styles/shared.module.css';
import styles from '../Styles/Home.module.css';
import Button from '../components/Button';

import Image1 from '../Assets/Images/Image2.jpg';
import Image2 from '../Assets/Images/Image5.jpg';
import Image3 from '../Assets/Images/Image3.jpg';
import Image4 from '../Assets/Images/Image4.jpg';
import Image6 from '../Assets/Images/Image6.jpg';
import Image7 from '../Assets/Images/Image7.jpeg';
import Image9 from '../Assets/Images/image9.jpg';
import speaker1 from '../Assets/Images/speaker1.png';
import speaker2 from '../Assets/Images/speaker2.png';

const sliderImages = [
  { url: Image1, title: 'Beautiful Lomé', location: 'Coastline of Lomé, Togo' },
  { url: Image2, title: 'Cultural Heritage', location: 'Traditional Togo' },
  { url: Image6, title: 'Modern Lomé', location: 'Downtown Lomé' },
];

function useInView(options = {}) {
  const [ref, setRef] = useState(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
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

    function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

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

const statConfig = [
  { target: 1000, suffix: '+', label: 'Expected Participants', icon: 'ti-users',               color: '#7C3AED' },
  { target: 50,   suffix: '+', label: 'Countries',             icon: 'ti-world',               color: '#7C3AED' },
  { target: 150,  suffix: '+', label: 'Speakers',              icon: 'ti-microphone',          color: '#7C3AED' },
  { target: 200,  suffix: '+', label: 'Startups',              icon: 'ti-rocket',              color: '#7C3AED' },
  { target: 100,  suffix: '+', label: 'Partners',              icon: 'ti-building-skyscraper', color: '#7C3AED' },
  { target: 50,   suffix: '+', label: 'Investors',             icon: 'ti-trending-up',         color: '#7C3AED' },
];

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

function Hero({ setPage }) {
  const [loaded, setLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 80);
    return () => window.clearTimeout(t);
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

  return (
    <section className={styles.hero}>
      <div className={styles.heroSlider}>
        {sliderImages.map((image, index) => (
          <div
            key={index}
            className={`${styles.heroSlide} ${index === currentImageIndex ? styles.heroSlideActive : ''}`}
            style={{ opacity: index === currentImageIndex ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
          >
            <img src={image.url} alt={image.title} />
          </div>
        ))}
        <div className={styles.heroOverlay} />
      </div>

      <button
        className={styles.slidePrev}
        onClick={() => setCurrentImageIndex((p) => (p - 1 + sliderImages.length) % sliderImages.length)}
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
            className={`${styles.slideDot} ${index === currentImageIndex ? styles.slideDotActive : ''}`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>

      <div className={styles.heroContent}>
        <div style={fadeIn(0.1)} className={styles.heroEyebrow}>
          <span className={styles.heroEyebrowDot} />
          <span> May 2027 • Lomé • Togo</span>
        </div>
        <h1 className={styles.heroTitle} style={fadeIn(0.2)}>
          Africa Digital <br />Forum
        </h1>
        <div className={styles.heroTagline} style={fadeIn(0.28)}>
          Join Africa's leading digital innovation forum in Lomé, Togo, in May 2027, bringing together
          policymakers, entrepreneurs, investors, and technology leaders to shape Africa's digital future.
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
            Learn More
          </Button>
        </div>
      </div>

      <div className={styles.imageCaption}>
        {sliderImages[currentImageIndex].title} — {sliderImages[currentImageIndex].location}
      </div>
    </section>
  );
}

function StatsBar() {
  const [gridRef, inView] = useInView({ threshold: 0.2 });

  return (
    <div className={styles.statsBar}>
      <div className={styles.statsContainer}>
        <div ref={gridRef} className={styles.statsGrid}>
          {statConfig.map((stat, index) => (
            <StatCard
              key={stat.label}
              {...stat}
              delay={index * 0.1}
              started={inView}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PresidentialDialogues() {
  const dialogues = [
    {
      title: 'Presidential Dialogue',
      text: "The President of Togo will share the national vision for digital transformation and outline Africa's broader digital future, highlighting key priorities for building a connected and innovation-driven continent.",
      icon: 'ti-crown',
    },
    {
      title: 'Ministerial Forum',
      text: "Ministers from across Africa will discuss digital governance and continental integration, focusing on policies and cooperation needed to build a unified and future-ready digital economy.",
      icon: 'ti-building-community',
    },
    {
      title: 'Practitioners & Policymakers',
      text: "Bridging the gap between policy and practice is essential to ensure effective digital transformation, turning strategic vision into real-world impact across Africa's digital ecosystem.",
      icon: 'ti-users-group',
    },
  ];

  return (
    <section className={styles.dialoguesSection}>
      <div className={`${styles.container} ${styles.dialoguesInner}`}>
        <div className={styles.dialoguesHeader}>
          <div className={styles.dialoguesBadge}>
            <span className={styles.sectionLabelLine} />
            <span>High-Level Dialogues</span>
          </div>
          <h2 className={styles.dialoguesTitle}>Where Vision Meets Action</h2>
          <p className={styles.dialoguesSubtitle}>
            From presidential perspectives to practical implementation, discover how leaders are turning digital ambitions into lasting impact across Africa.
          </p>
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

const speakersData = [
  {
    name: 'H.E. Cina Lawson',
    role: 'Minister of Digital Economy and Digital Transformation, Togo',
    bio: "A visionary leader in Africa's digital transformation, Minister Cina Lawson has spearheaded Togo's transition to an inclusive digital economy. Under her leadership, Togo became the first West African country to deploy 5G and increased mobile internet access from 1% (2010) to 74% (2021). She pioneered the award-winning digital cash transfer program, Novissi, which used machine learning to deliver $34M in aid during COVID-19. A graduate of Sciences Po Paris and Harvard Kennedy School, she is a World Economic Forum Young Global Leader, was named in Forbes' 'Top 20 Youngest Power Women in Africa,' and is the first African woman to receive the Harvard Kennedy School Alumni Public Service Award. She is a fervent advocate for innovation-driven solutions to Africa's developmental challenges.",
    topics: ['Digital Policy', 'GovTech', '5G & Connectivity', 'Financial Inclusion'],
    image: speaker1,
    twitter: '#',
    linkedin: '#',
  },
  {
    name: 'Tony O. Elumelu',
    role: 'Chairman, Heirs Holdings | Founder, Tony Elumelu Foundation',
    bio: "Tony Elumelu is one of Africa's most influential entrepreneurs, investors, and philanthropists. He is the Chairman of Heirs Holdings, a pan-African investment company with interests in financial services, energy, healthcare, hospitality, and technology. He also chairs United Bank for Africa (UBA), one of Africa's leading financial institutions operating across more than 20 countries. Through the Tony Elumelu Foundation, he has committed over $100 million to support African entrepreneurs, empowering thousands of startups across the continent. A leading advocate of 'Africapitalism,' Elumelu promotes the private sector as the catalyst for Africa's economic transformation, job creation, and sustainable development.",
    topics: ['Entrepreneurship', 'Africapitalism', 'Investment & Finance', 'African Innovation'],
    image: speaker2,
    twitter: '#',
    linkedin: '#',
  },
];

function SpeakerCard({ speaker, index }) {
  return (
    <FadeUp delay={0.06}>
      <div className={styles.speakerCard}>

        {/* ── Rounded photo frame ── */}
        <div className={styles.speakerImageFrame}>
          <div className={styles.speakerImageRing} />
          <img
            src={speaker.image}
            alt={speaker.name}
            className={styles.speakerImage}
          />
          {/* Floating index badge */}
          <div className={styles.speakerImageBadge}>
            {String(index + 1).padStart(2, '0')}
          </div>
        </div>

        {/* ── Speaker info ── */}
        <div className={styles.speakerInfo}>
          <div className={styles.speakerIndex}>Keynote Speaker</div>
          <h3 className={styles.speakerName}>{speaker.name}</h3>
          <p className={styles.speakerTitle}>{speaker.role}</p>
          <div className={styles.speakerDivider} />
          <p className={styles.speakerBio}>{speaker.bio}</p>
          <div className={styles.speakerTopics}>
            <span className={styles.bioTopicsLabel}>Focus areas:</span>
            {speaker.topics.map((topic) => (
              <span key={topic} className={styles.speakerTopic}>
                {topic}
              </span>
            ))}
          </div>
          <div className={styles.speakerSocial}>
            <a href={speaker.twitter} className={styles.speakerSocialLink} target="_blank" rel="noopener noreferrer">
              <i className="ti ti-brand-twitter" aria-hidden="true" />
            </a>
            <a href={speaker.linkedin} className={styles.speakerSocialLink} target="_blank" rel="noopener noreferrer">
              <i className="ti ti-brand-linkedin" aria-hidden="true" />
            </a>
          </div>
        </div>

      </div>
    </FadeUp>
  );
}

function SpeakersSection({ setPage }) {
  return (
    <section className={styles.speakersSection}>
      <div className={styles.container}>
        <FadeUp>
          <div className={styles.sectionLabel}>
            <span className={styles.sectionLabelLine} />
            Expected Speakers
          </div>
        </FadeUp>
        <FadeUp delay={0.05}>
          <h2 className={styles.h2}>Voices Shaping Africa's Digital Future</h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className={styles.subtext}>
            Meet the visionary leaders, policymakers, and innovators taking the stage at ADF 2027.
          </p>
        </FadeUp>

        <div className={styles.speakersList}>
          {speakersData.map((speaker, index) => (
            <SpeakerCard key={speaker.name} speaker={speaker} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MoreSpeakersComingSection() {
  return (
    <section
      className={styles.moreSpeakersSection}
      style={{ backgroundImage: `url(${Image6})` }}
    >
      <div className={styles.moreSpeakersOverlay} />
      <FadeUp
        delay={0.1}
        style={{ position: 'relative', zIndex: 2, width: '100%' }}
      >
        <div className={styles.moreSpeakersContent}>
          <div className={styles.tbaBadge}>
            <span className={styles.heroEyebrowDot} />
            <span>More Speakers Coming</span>
          </div>
          <p className={styles.tbaSubtitle}>Announcing soon</p>
          <p className={styles.tbaText}>
            Additional keynotes, ministers, and innovators will be announced as ADF 2027 approaches.
          </p>
          <div className={styles.tbaDivider} />
          <div className={styles.tbaCta}>
            <i className="ti ti-microphone" aria-hidden="true" />
            <span>Stay tuned for updates</span>
            <i className="ti ti-bell-ringing" aria-hidden="true" />
          </div>
        </div>
      </FadeUp>
    </section>
  );
}

export default function HomePage({ setPage }) {
  return (
    <>
      <Hero setPage={setPage} />
      <StatsBar />
      <PresidentialDialogues />
      <SpeakersSection setPage={setPage} />
      <MoreSpeakersComingSection />
    </>
  );
}