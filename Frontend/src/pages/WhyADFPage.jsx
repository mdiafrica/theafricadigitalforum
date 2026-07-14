// WhyADFPage.jsx
import { useState, useEffect, useRef } from 'react';
import pageStyles from '../Styles/WhyADFPage.module.css';
import WhyHero from '../Assets/Images/Image5.jpg';
import image2 from '../Assets/Images/Image2.png';

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

export default function WhyADFPage({ t }) {
  const why = t.whyadf;

  // Build agenda items from translations
  const agendaItems = why.agenda.items.map((item) => ({
    icon: item.icon,
    title: item.title,
    description: item.description,
  }));

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
            <h1 className={pageStyles.heroTitle}>{why.heroTitle}</h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className={pageStyles.heroText}>{why.heroText}</p>
          </FadeUp>
        </div>
      </div>

      {/* AI ECONOMIC IMPACT SECTION */}
      <div className={pageStyles.whyAttendSection}>
        <div className={pageStyles.container}>
          <div className={pageStyles.whyAttendGrid}>
            <FadeUp delay={0.1}>
              <div className={pageStyles.impactNumberCard}>
                {/* ONE WORD – numbers + dollar sign only */}
                <div className={pageStyles.impactNumber}>$1,000,000,000,000</div>
              </div>
            </FadeUp>

            <FadeUp>
              <div className={pageStyles.whyAttendContent}>
                <div className={pageStyles.headingWithDivider}>
                  <div className={pageStyles.violetDivider} />
                  <h2 className={pageStyles.sectionHeading}>{why.aiSection.heading}</h2>
                </div>
                <p className={pageStyles.sectionParagraph}>{why.aiSection.paragraph}</p>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>

      {/* SIX‑POINT AGENDA SECTION */}
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
              <div className={pageStyles.eyebrowWrapper}>
                <div className={pageStyles.smallHorizontalDivider} />
                <span className={pageStyles.agendaEyebrow}>{why.agenda.eyebrow}</span>
              </div>

              <h2 className={pageStyles.agendaMainTitle}>{why.agenda.mainTitle}</h2>
              <div className={pageStyles.titleDivider} />
              <p className={pageStyles.agendaDescription}>{why.agenda.description}</p>
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
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}