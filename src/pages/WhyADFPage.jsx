import { useState, useEffect, useRef } from 'react';
import pageStyles from '../Styles/WhyADFPage.module.css';
import WhyHero from '../Assets/Images/Image5.jpg';
import image1 from '../Assets/Images/AI.png';
import image2 from '../Assets/Images/Image2.jpg';

function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView];
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

export default function WhyADFPage() {
  const agendaItems = [
    {
      icon: 'ti-device-laptop',
      title: 'Accelerating Inclusive Digital Access & Literacy',
      description:
        'Address the "usage gap" where ~76% of sub‑Saharan Africans remain offline. Drive policies & partnerships to lower data costs, improve infrastructure, and implement digital literacy programmes.',
    },
    {
      icon: 'ti-brain',
      title: 'Optimizing Artificial Intelligence for Economic Sovereignty',
      description:
        'Capture the estimated USD 1.2 trillion AI injection by 2030. Foster localised AI development, ethical adoption, and industrial application that serves African market realities.',
    },
    {
      icon: 'ti-chart-line',
      title: 'Catalyzing Startup Growth & Investor-Founder Matchmaking',
      description:
        'Bridge the SME funding gap. Institutionalise deal rooms, pitch competitions, and investor‑startup networking to facilitate direct capital flows to high‑potential digital enterprises.',
    },
    {
      icon: 'ti-shield',
      title: 'Strengthening Regional Cybersecurity & Data Governance',
      description:
        'Secure the unified digital market. Drive regional coordination on data protection, cybersecurity frameworks, and privacy laws to build trust for cross‑border digital trade.',
    },
    {
      icon: 'ti-code',
      title: 'Scaling Localized Software & Content Ecosystems',
      description:
        'Reduce reliance on foreign platforms. Support locally relevant software, local language preservation, and content platforms that reflect African dynamics and cultures.',
    },
    {
      icon: 'ti-microphone',
      title: 'Empowering Media Integrity & Talent Development',
      description:
        'Transform African media into a strategic asset. Champion media training, ethical standards, and youth capacity‑building to ensure accurate, professional information.',
    },
  ];

  return (
    <div className={pageStyles.pageShell}>
      {/* HERO SECTION */}
      <div
        className={pageStyles.hero}
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(5,13,26,0.6) 0%, rgba(5,13,26,0.95) 100%), url(${WhyHero})`,
        }}
      >
        <div className={pageStyles.heroContent}>
          <FadeUp>
            <h1 className={pageStyles.heroTitle}>Why Africa Digital Forum</h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className={pageStyles.heroText}>
              Establishing an authentic "African Digital" ecosystem, one characterized by a unified digital market,
              localized software solutions, and regional cybersecurity coordination, is a structural necessity for
              sustainable development.
            </p>
          </FadeUp>
        </div>
      </div>

      {/* AI ECONOMIC IMPACT SECTION (image left, heading with violet divider) */}
      <div className={pageStyles.whyAttendSection}>
        <div className={pageStyles.container}>
          <div className={pageStyles.whyAttendGrid}>
            <FadeUp delay={0.1}>
              <div className={pageStyles.whyAttendImage}>
                <img src={image1} alt="AI economic impact on Africa" />
              </div>
            </FadeUp>

            <FadeUp>
              <div className={pageStyles.whyAttendContent}>
                <div className={pageStyles.headingWithDivider}>
                  <div className={pageStyles.violetDivider} />
                  <h2 className={pageStyles.sectionHeading}>
                    AI’s Economic Impact on Africa: A Trillion-Dollar Opportunity
                  </h2>
                </div>
                <p className={pageStyles.sectionParagraph}>
                  The economic stakes are exceptionally high. Estimates suggest that artificial intelligence alone could
                  inject USD 1.2 trillion into Africa's economy by 2030, representing roughly six percent of
                  continental gross domestic product, or up to USD 1 trillion by 2035.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>

      {/* SIX‑POINT AGENDA SECTION – horizontal divider and text on same line */}
      <div
        className={pageStyles.agendaSection}
        style={{
          backgroundImage: `linear-gradient(rgba(5,13,26,0.85), rgba(5,13,26,0.9)), url(${image2})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className={pageStyles.container}>
          <FadeUp>
            <div className={pageStyles.agendaHeader}>
              {/* Flex container: horizontal divider + text on same line */}
              <div className={pageStyles.eyebrowWrapper}>
                <div className={pageStyles.smallHorizontalDivider} />
                <span className={pageStyles.agendaEyebrow}>BUILDING AFRICA'S DIGITAL FUTURE</span>
              </div>

              {/* Main title */}
              <h2 className={pageStyles.agendaMainTitle}>
                A Six‑Point Agenda for Inclusive Growth and Sovereignty
              </h2>

              {/* Horizontal divider under title */}
              <div className={pageStyles.titleDivider} />

              {/* Descriptive paragraph */}
              <p className={pageStyles.agendaDescription}>
                From presidential perspectives to practical implementation, discover how leaders are turning digital
                ambitions into lasting impact across Africa.
              </p>
            </div>
          </FadeUp>

          <div className={pageStyles.agendaGrid}>
            {agendaItems.map((item, idx) => (
              <FadeUp key={item.title} delay={idx * 0.07}>
                <div className={pageStyles.agendaCard}>
                  <div className={pageStyles.cardIcon}>
                    <i className={`ti ${item.icon}`} />
                  </div>
                  <h3 className={pageStyles.cardTitle}>{item.title}</h3>
                  <p className={pageStyles.cardDescription}>{item.description}</p>
                  <button className={pageStyles.cardButton}>LEARN MORE →</button>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}