// AboutPage.jsx
import { useState, useEffect, useRef } from 'react';
import pageStyles from '../Styles/AboutPage.module.css';
import AboutHero from '../Assets/Images/Image8.png';
import CliffordImg from '../Assets/Images/clifford.png';
import MarchImg from '../Assets/Images/Marc.png';

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
              {socials.email && (
                <a href={`mailto:${socials.email}`} className={pageStyles.modalSocialLink} style={{ gap: '6px' }}>
                  <i className="ti ti-mail" />
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#7c3aed' }}>
                    {socials.email}
                  </span>
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
      <div className={pageStyles.teamPhotoCol}>
        {image && <img src={image} alt={name} className={pageStyles.teamPhoto} />}
        <div className={pageStyles.teamPhotoAccent} />
      </div>

      <div className={pageStyles.teamCardBody}>
        <div>
          <div className={pageStyles.teamCardRole}>{title}</div>
          <h3 className={pageStyles.teamCardName}>{name}</h3>
          {location && (
            <div className={pageStyles.teamCardLocation}>
              <i className="ti ti-map-pin" aria-hidden="true" />
              {location}
            </div>
          )}
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
            {socials.email && (
              <a
                href={`mailto:${socials.email}`}
                className={pageStyles.teamSocialLink}
                aria-label="Email"
                style={{ gap: '6px', padding: '0 10px', width: 'auto', borderRadius: '20px' }}
              >
                <i className="ti ti-mail" />
                <span style={{ fontSize: '11px', fontWeight: 500 }}>{socials.email}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function AboutPage({ t }) {
  const about = t.about; // Get about translations

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

  // ── Team data from translations, enriched with static images & socials ──
  const teamTranslations = about.team || [];
  const teamData = teamTranslations.map((member, index) => {
    // Map images by index (assuming order matches)
    const images = [MarchImg, CliffordImg];
    const socials = [
      { linkedin: 'https://linkedin.com/in/marcaboflan', email: 'marc@africadigitalforum.com' },
      { linkedin: 'https://www.linkedin.com/in/ecgyetuah/', email: 'clifford@africadigitalforum.com' },
    ];
    // ── OVERRIDE LOCATIONS ──
    let location = member.location || '';
    if (index === 0) {
      location = 'Togo / Senegal';
    } else if (index === 1) {
      location = 'Ghana / Rwanda';
    }
    return {
      ...member,
      image: images[index] || null,
      socials: socials[index] || {},
      location: location,
    };
  });

  return (
    <div className={pageStyles.pageShell}>
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
            <h1 className={pageStyles.heroTitle}>{about.heroTitle}</h1>
          </FadeUp>
          <FadeUp delay={0.12}>
            <p className={pageStyles.heroSubtitle}>{about.heroSubtitle}</p>
          </FadeUp>
        </div>
      </section>

      {/* Vision */}
      <FadeUp>
        <div className={`${pageStyles.band} ${pageStyles.bandVision}`}>
          <h2 className={pageStyles.bandLabel}>{about.visionLabel}</h2>
          <p className={pageStyles.bandText}>{about.visionText}</p>
        </div>
      </FadeUp>

      {/* Mission */}
      <FadeUp>
        <div
          className={`${pageStyles.band} ${pageStyles.bandMission}`}
          style={{ backgroundImage: `url(${AboutHero})` }}
        >
          <h2 className={pageStyles.bandLabel}>{about.missionLabel}</h2>
          <p className={pageStyles.bandText}>{about.missionText}</p>
        </div>
      </FadeUp>

      {/* Organizing Director Section */}
      <section
        className={pageStyles.teamSection}
        style={{ '--team-bg': `url(${AboutHero})` }}
      >
        <div className={pageStyles.teamSectionFadeWrap}>
          <FadeUp>
            <p className={pageStyles.teamSectionLabel}>{about.teamLabel}</p>
            <h2 className={pageStyles.teamSectionHeading}>{about.teamHeading}</h2>
            <div className={pageStyles.teamSectionUnderline} />
          </FadeUp>
        </div>

        <div className={pageStyles.teamGrid}>
          {teamData.map((member, index) => (
            <TeamCard
              key={member.name}
              name={member.name}
              title={member.title}
              location={member.location}
              bio={member.bio}
              longBio={member.longBio}
              image={member.image}
              socials={member.socials}
              delay={index === 0 ? 0.05 : 0.15}
              onReadMore={openModal}
            />
          ))}
        </div>
      </section>

      {/* Advisory Board */}
      <section
        className={pageStyles.advisorySection}
        style={{ backgroundImage: `url(${AboutHero})` }}
      >
        <div className={pageStyles.advisoryInner}>
          <FadeUp>
            <h2
              className={pageStyles.advisoryHeading}
              dangerouslySetInnerHTML={{ __html: about.advisoryHeading }}
            />
            <div className={pageStyles.advisoryUnderline} />
            <p className={pageStyles.advisorySubtext}>{about.advisorySubtext}</p>
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
              {about.advisoryBadge}
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}