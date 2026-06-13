// Note: Tabler Icons font must be loaded in index.html:
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
import { useState, useEffect, useRef } from 'react';
import pageStyles from '../Styles/AboutPage.module.css';
import AboutHero from '../Assets/Images/Image1.jpg';
import CliffordImg from '../Assets/Images/clifford.jpg';
import MarchImg from '../Assets/Images/March.jpg';

/* ── Fade-up animation hook ── */
function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.08, ...options }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

function FadeUp({ children, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Modal Component – two-column layout ── */
function Modal({ isOpen, name, role, location, image, socials = {}, content, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={pageStyles.modalOverlay} onClick={onClose}>
      <div className={pageStyles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={pageStyles.modalClose} onClick={onClose} aria-label="Close">
          <i className="ti ti-x" />
        </button>

        <div className={pageStyles.modalTwoColumns}>
          {/* LEFT COLUMN: Image, Name, Role, Location, Socials */}
          <div className={pageStyles.modalLeft}>
            {image && (
              <div className={pageStyles.modalImageWrapper}>
                <img src={image} alt={name} className={pageStyles.modalImage} />
              </div>
            )}
            <h3 className={pageStyles.modalName}>{name}</h3>
            <div className={pageStyles.modalRoleWrapper}>
              {role && <div className={pageStyles.modalRole}>{role}</div>}
              {location && (
                <div className={pageStyles.modalLocation}>
                  <i className="ti ti-map-pin" />
                  {location}
                </div>
              )}
            </div>
            <p className={pageStyles.modalSocialsLabel}>Connect</p>
            <div className={pageStyles.modalSocials}>
              {socials.linkedin && (
                <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className={pageStyles.modalSocialLink}>
                  <i className="ti ti-brand-linkedin" />
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className={pageStyles.modalSocialLink}>
                  <i className="ti ti-brand-x" />
                </a>
              )}
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className={pageStyles.modalSocialLink}>
                  <i className="ti ti-brand-instagram" />
                </a>
              )}
              {socials.email && (
                <a href={`mailto:${socials.email}`} className={pageStyles.modalSocialLink}>
                  <i className="ti ti-mail" />
                </a>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Full bio */}
          <div className={pageStyles.modalRight}>
            <div className={pageStyles.modalBioMeta}>
              <p className={pageStyles.modalBioEyebrow}>Bio</p>
              <h2 className={pageStyles.modalBioTitle}>{role}</h2>
              <p className={pageStyles.modalBioOrg}>Africa Digital Forum</p>
            </div>
            <div className={pageStyles.modalBody}>
              {content.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Team card – horizontal split layout ── */
function TeamCard({ name, title, bio, longBio, image, location, socials = {}, delay = 0, onReadMore }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={pageStyles.teamCard}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      }}
    >
      {/* Photo column */}
      <div className={pageStyles.teamPhotoCol}>
        {image && (
          <img src={image} alt={name} className={pageStyles.teamPhoto} />
        )}
        <div className={pageStyles.teamPhotoAccent} />
      </div>

      {/* Content column */}
      <div className={pageStyles.teamCardBody}>
        <div>
          {location && (
            <div className={pageStyles.teamCardLocation}>
              <i className="ti ti-map-pin" aria-hidden="true" />
              {location}
            </div>
          )}
          <div className={pageStyles.teamCardRole}>{title}</div>
          <h3 className={pageStyles.teamCardName}>{name}</h3>
          <p className={pageStyles.teamCardBio}>{bio}</p>
          <button
            className={pageStyles.readMoreBtn}
            onClick={() => onReadMore({
              name,
              role: title,
              location,
              image,
              socials,
              content: longBio,
            })}
          >
            <i className="ti ti-book" />
            Read more
          </button>
        </div>

        <div>
          <div className={pageStyles.teamCardDivider} />
          <div className={pageStyles.teamSocials}>
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                className={pageStyles.teamSocialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <i className="ti ti-brand-linkedin" />
              </a>
            )}
            {socials.twitter && (
              <a
                href={socials.twitter}
                className={pageStyles.teamSocialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X / Twitter"
              >
                <i className="ti ti-brand-x" />
              </a>
            )}
            {socials.instagram && (
              <a
                href={socials.instagram}
                className={pageStyles.teamSocialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <i className="ti ti-brand-instagram" />
              </a>
            )}
            {socials.email && (
              <a
                href={`mailto:${socials.email}`}
                className={pageStyles.teamSocialLink}
                aria-label="Email"
              >
                <i className="ti ti-mail" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function AboutPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    name: '',
    role: '',
    location: '',
    image: '',
    socials: {},
    content: '',
  });

  const openModal = (data) => {
    setModalData(data);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData({
      name: '',
      role: '',
      location: '',
      image: '',
      socials: {},
      content: '',
    });
  };

  const cliffordLongBio = `Emmanuel Clifford Gyetuah is a distinguished executive whose impressive 12-year career spans the non-profit sector, finance and business development. As the Organizing Director, Finance and Institutional Operations for the Africa Digital Forum, Emmanuel expertly champions the organization's fiscal sustainability and overall health. His leadership is defined by a deep-seated commitment to scaling multinational entities while maintaining the highest standards of operational excellence.

Emmanuel is widely recognized for his leadership at Bolingo Consult, a multinational language company he co-founded in 2019 that currently has operations in the United States, Ghana, and Rwanda. He possesses a remarkable ability to translate high-level institutional ambitions into tangible outcomes, adeptly managing complex partnerships with prestigious global bodies such as the African Union, GIZ, and the World Bank.

What truly sets Emmanuel apart is his unique blend of financial rigor and genuine, hands-on operational empathy. By optimizing resources for maximum impact, he directly advances the Africa Digital Forum's heartfelt mission to bridge the digital usage gap and foster an authentic, sovereign African digital ecosystem. Ultimately, Emmanuel is uniquely positioned to steer the Forum toward a future of enduring stability, ensuring its financial and institutional frameworks are as forward-thinking and dynamic as the technological landscapes they seek to elevate.`;

  const marcLongBio = `Marc ABOFLAN is a seasoned media development and international project management professional with over 15 years of experience driving transformative initiatives across Africa. As the Organizing Director, Strategy & Global Partnerships for the Africa Digital Forum, he leads the Forum's strategic vision, institutional positioning, and partnership development efforts, fostering collaboration among governments, technology leaders, media organizations, investors, academia, and development partners to shape Africa's digital future.

Throughout his career, Marc has built a strong reputation for designing and implementing high-impact programs at the intersection of media, digital transformation, youth empowerment, governance, and innovation. He has held leadership roles with international organizations including Reporters Without Borders (RSF), The Journalism Trust Initiative, Global Media Registry, and Fondation Hirondelle, where he has successfully managed multi-country projects, strengthened media ecosystems, and built strategic alliances across more than 40 African countries.

Marc is also the Executive Director of Media and Digital Institute (MDI), a pan-African organization dedicated to media innovation, digital inclusion, research, youth employability, and capacity building. Through MDI and other initiatives, he has trained hundreds of media professionals, supported organizations in navigating digital transformation, and championed responsible and inclusive technology adoption across the continent.

Known for his ability to connect ideas, institutions, and people, Marc combines strategic thinking with a deep understanding of Africa's evolving digital landscape. His work is driven by a conviction that collaboration, innovation, and strong partnerships are essential to building a digitally empowered Africa that can compete and thrive in the global economy.`;

  return (
    <div className={pageStyles.pageShell}>
      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        name={modalData.name}
        role={modalData.role}
        location={modalData.location}
        image={modalData.image}
        socials={modalData.socials}
        content={modalData.content}
        onClose={closeModal}
      />

      {/* Hero */}
      <section
        className={pageStyles.heroSection}
        style={{ backgroundImage: `url(${AboutHero})` }}
      >
        <div className={pageStyles.heroContent}>
          <FadeUp>
            <h1 className={pageStyles.heroTitle}>About Us</h1>
          </FadeUp>
          <FadeUp delay={0.12}>
            <p className={pageStyles.heroSubtitle}>
              Africa Digital Forum is Africa's premier platform for digital transformation, AI, and innovation —
              convening leaders, policymakers, and changemakers to shape a connected and sovereign digital future
              for the continent.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Mission */}
      <FadeUp>
        <div className={`${pageStyles.band} ${pageStyles.bandMission}`}>
          <h2 className={pageStyles.bandLabel}>Our Mission</h2>
          <p className={pageStyles.bandText}>
            To unlock Africa's digital potential by convening leaders across the media, tech, and investment
            landscapes to drive inclusive access, accelerate AI‑driven economic growth, and establish a robust
            policy framework necessary for a sustainable and connected future.
          </p>
        </div>
      </FadeUp>

      {/* Vision */}
      <FadeUp>
        <div
          className={`${pageStyles.band} ${pageStyles.bandVision}`}
          style={{ backgroundImage: `url(${AboutHero})` }}
        >
          <h2 className={pageStyles.bandLabel}>Our Vision</h2>
          <p className={pageStyles.bandText}>
            We envision a future where Africa leads the global digital frontier through authentic technological
            sovereignty, a unified digital market, and resilient infrastructure that empowers every citizen to
            thrive in the global economy.
          </p>
        </div>
      </FadeUp>

      {/* Organizing Director Section (formerly "Organizing Team") */}
      <section
        className={pageStyles.teamSection}
        style={{ '--team-bg': `url(${AboutHero})` }}
      >
        <div className={pageStyles.teamSectionFadeWrap}>
          <FadeUp>
            <p className={pageStyles.teamSectionLabel}>Meet the people behind it</p>
            <h2 className={pageStyles.teamSectionHeading}>
              Organizing Directors
            </h2>
            <div className={pageStyles.teamSectionUnderline} />
          </FadeUp>
        </div>

        <div className={pageStyles.teamGrid}>
          <TeamCard
            name="Emmanuel Clifford Gyetuah"
            title="Finance & Institutional Operations"
            location="Ghana"
            bio="Emmanuel Clifford Gyetuah is a strategic development professional and Coordinator of the Africa Digital Forum (ADF). He leads initiatives advancing digital transformation, innovation, and inclusive growth across Africa, while championing African language localization and digital advocacy through regional and global leadership roles."
            longBio={cliffordLongBio}
            image={CliffordImg}
            socials={{
              linkedin: 'https://linkedin.com',
              twitter: 'https://x.com',
              email: 'info@africadigitalforum.com',
            }}
            delay={0.05}
            onReadMore={openModal}
          />
          <TeamCard
            name="Marc Aboflan"
            title="Strategy & Global Partnerships"
            location="Togo"
            bio="Marc Aboflan is a seasoned Togolese journalist, media executive, and digital credibility expert. As Africa Regional Project Manager for Reporters Without Borders' Journalism Trust Initiative (JTI), he advances digital transparency and combats disinformation across the continent. He brings extensive expertise in media management, tech governance, and strategic communications."
            longBio={marcLongBio}
            image={MarchImg}
            socials={{
              linkedin: 'https://linkedin.com',
              twitter: 'https://x.com',
              email: 'info@africadigitalforum.com',
            }}
            delay={0.15}
            onReadMore={openModal}
          />
        </div>
      </section>

      {/* Advisory Board */}
      <section
        className={pageStyles.advisorySection}
        style={{ backgroundImage: `url(${AboutHero})` }}
      >
        <div className={pageStyles.advisoryInner}>
          <FadeUp>
            <h2 className={pageStyles.advisoryHeading}>
              Advisory <span>Board</span>
            </h2>
            <div className={pageStyles.advisoryUnderline} />
            <p className={pageStyles.advisorySubtext}>
              Our distinguished advisory board of global digital leaders, policy experts, and innovators
              will be announced shortly.
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className={pageStyles.advisoryPlaceholderRow}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={pageStyles.advisoryPlaceholderCard}>
                  <div className={pageStyles.advisoryPlaceholderAvatar}>
                    <i className="ti ti-user" />
                  </div>
                  <div className={pageStyles.advisoryPlaceholderName} />
                  <div className={pageStyles.advisoryPlaceholderRole} />
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className={pageStyles.advisoryBadge}>
              <i className="ti ti-clock" />
              Coming Soon
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}