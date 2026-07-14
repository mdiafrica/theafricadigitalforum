import { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import {
  FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaFacebookF, FaInstagram, FaTwitter, FaYoutube,
  FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import pageStyles from '../Styles/ContactPage.module.css';
import ContactHero from '../Assets/Images/Image2.png';

// ─── EmailJS credentials ──────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'service_oqw60pt';
const EMAILJS_TEMPLATE_ID = 'template_t9fam69';
const EMAILJS_PUBLIC_KEY  = 'CRiokfjvcAxMuJHMB';
// ─────────────────────────────────────────────────────────────────────────────

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

// ─── Social icons (static) ──────────────────────────────────────────────────
const SOCIALS = [
  { label: <FaFacebookF />, href: '#' },
  { label: <FaInstagram />, href: '#' },
  { label: <FaTwitter />,   href: '#' },
  { label: <FaYoutube />,   href: '#' },
];

// ─── Map icon to contact item (using static icons, but content from translations) ──
const CONTACT_ICONS = [<FaMapMarkerAlt />, <FaEnvelope />, <FaPhoneAlt />];

export default function ContactPage({ t }) {
  const contact = t.contact;
  const [status, setStatus] = useState('idle');
  const [formData, setFormData] = useState({
    name: '', company: '', phone: '', email: '', subject: '', message: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    const templateParams = {
      name:       formData.name,
      from_email: formData.email,
      phone:      formData.phone,
      company:    formData.company,
      subject:    formData.subject,
      message:    formData.message,
    };

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setFormData({ name: '', company: '', phone: '', email: '', subject: '', message: '' });
      }, 5000);
    } catch (err) {
      console.error('EmailJS error:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  // Build contact info from translations, mapped with static icons
  const contactItems = contact.info.items.map((item, index) => ({
    icon: CONTACT_ICONS[index % CONTACT_ICONS.length],
    title: item.title,
    lines: item.lines,
  }));

  return (
    <div className={pageStyles.pageShell}>
      {/* HERO */}
      <div className={pageStyles.pageShellHeader} style={{ backgroundImage: `url(${ContactHero})` }}>
        <div className={pageStyles.heroContent}>
          <FadeUp><h1 className={pageStyles.pageShellTitle}>{contact.hero.title}</h1></FadeUp>
          <FadeUp delay={0.1}>
            <p className={pageStyles.heroSubtitle}>{contact.hero.subtitle}</p>
          </FadeUp>
        </div>
      </div>

      <div className={pageStyles.pageShellBody}>
        <FadeUp delay={0.1}>
          <div className={pageStyles.contactPanel}>
            {/* LEFT: INFO */}
            <div className={pageStyles.contactInfoCol}>
              <h2 className={pageStyles.contactInfoTitle}>{contact.info.title}</h2>
              <p className={pageStyles.contactInfoSubtext}>{contact.info.subtext}</p>
              <div className={pageStyles.contactInfoDivider} />
              <div className={pageStyles.contactInfoRows}>
                {contactItems.map((info) => (
                  <div key={info.title} className={pageStyles.contactInfoRow}>
                    <div className={pageStyles.contactInfoIconWrap}>{info.icon}</div>
                    <div>
                      <div className={pageStyles.contactInfoRowTitle}>{info.title}</div>
                      {info.lines.map((line, i) => (
                        <p key={i} className={pageStyles.contactInfoRowDetail}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className={pageStyles.contactInfoDivider} />
              <p className={pageStyles.socialLabel}>{contact.info.socialLabel}</p>
              <div className={pageStyles.socialRow}>
                {SOCIALS.map((s, i) => (
                  <a key={i} href={s.href} className={pageStyles.socialBtn}>{s.label}</a>
                ))}
              </div>
            </div>

            {/* RIGHT: FORM */}
            <div className={pageStyles.contactFormCol}>
              <h2 className={pageStyles.contactFormTitle}>{contact.form.title}</h2>

              {status === 'success' ? (
                <div className={pageStyles.messageBox}>
                  <FaCheckCircle className={pageStyles.messageIconSuccess} />
                  <div className={pageStyles.messageTitle}>{contact.form.success.title}</div>
                  <p className={pageStyles.messageText}>{contact.form.success.text}</p>
                </div>
              ) : status === 'error' ? (
                <div className={pageStyles.messageBox}>
                  <FaExclamationTriangle className={pageStyles.messageIconError} />
                  <div className={pageStyles.messageTitle}>{contact.form.error.title}</div>
                  <p
                    className={pageStyles.messageText}
                    dangerouslySetInnerHTML={{ __html: contact.form.error.text }}
                  />
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className={pageStyles.formGrid}>
                    <div className={pageStyles.formGroup}>
                      <label className={pageStyles.formLabel}>{contact.form.name.label}</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className={pageStyles.formControl}
                        placeholder={contact.form.name.placeholder}
                      />
                    </div>
                    <div className={pageStyles.formGroup}>
                      <label className={pageStyles.formLabel}>{contact.form.company.label}</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className={pageStyles.formControl}
                        placeholder={contact.form.company.placeholder}
                      />
                    </div>
                    <div className={pageStyles.formGroup}>
                      <label className={pageStyles.formLabel}>{contact.form.phone.label}</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={pageStyles.formControl}
                        placeholder={contact.form.phone.placeholder}
                      />
                    </div>
                    <div className={pageStyles.formGroup}>
                      <label className={pageStyles.formLabel}>{contact.form.email.label}</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={pageStyles.formControl}
                        placeholder={contact.form.email.placeholder}
                      />
                    </div>
                    <div className={pageStyles.formGroupFull}>
                      <label className={pageStyles.formLabel}>{contact.form.subject.label}</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className={pageStyles.formControl}
                        placeholder={contact.form.subject.placeholder}
                      />
                    </div>
                    <div className={pageStyles.formGroupFull}>
                      <label className={pageStyles.formLabel}>{contact.form.message.label}</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className={pageStyles.formControl}
                        placeholder={contact.form.message.placeholder}
                      />
                    </div>
                  </div>
                  <div className={pageStyles.submitWrapper}>
                    <button
                      type="submit"
                      className={pageStyles.submitBtn}
                      disabled={status === 'sending'}
                    >
                      {status === 'sending' ? contact.form.sending : contact.form.submit}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </FadeUp>
      </div>

      {/* FULL WIDTH MAP */}
      <FadeUp delay={0.15}>
        <div className={pageStyles.fullWidthMap}>
          <iframe
            className={pageStyles.mapIframe}
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31780.932847517635!2d1.2063658!3d6.1374804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1023e1c113185419%3A0x3224b5422caf411e!2sLom%C3%A9%2C%20Togo!5e0!3m2!1sen!2sus!4v1700000000000"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={contact.map.title}
          />
        </div>
      </FadeUp>
    </div>
  );
}