import { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';
import {
  FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaFacebookF, FaInstagram, FaTwitter, FaYoutube,
  FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import pageStyles from '../Styles/ContactPage.module.css';
import ContactHero from '../Assets/Images/Image2.jpg';

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

const CONTACT_INFO = [
  { icon: <FaMapMarkerAlt />, title: 'Head Office', lines: ['Lomé, Togo', 'Africa Digital Forum HQ'] },
  { icon: <FaEnvelope />, title: 'Email Us', lines: ['info@africadigitalforum.com', 'partners@africadigitalforum.com'] },
  { icon: <FaPhoneAlt />, title: 'Call Us', lines: ['Phone: +228 123 456 789', 'Fax: +228 987 654 321'] },
];

const SOCIALS = [
  { label: <FaFacebookF />, href: '#' },
  { label: <FaInstagram />, href: '#' },
  { label: <FaTwitter />,   href: '#' },
  { label: <FaYoutube />,   href: '#' },
];

export default function ContactPage({ t }) {
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

  return (
    <div className={pageStyles.pageShell}>
      {/* HERO */}
      <div className={pageStyles.pageShellHeader} style={{ backgroundImage: `url(${ContactHero})` }}>
        <div className={pageStyles.heroContent}>
          <FadeUp><h1 className={pageStyles.pageShellTitle}>Contact Us</h1></FadeUp>
          <FadeUp delay={0.1}>
            <p className={pageStyles.heroSubtitle}>
              The Africa Digital Forum team is ready to answer your questions
              and help you make the most of Africa Digital Forum 2027.
            </p>
          </FadeUp>
        </div>
      </div>

      <div className={pageStyles.pageShellBody}>
        <FadeUp delay={0.1}>
          <div className={pageStyles.contactPanel}>
            {/* LEFT: INFO */}
            <div className={pageStyles.contactInfoCol}>
              <h2 className={pageStyles.contactInfoTitle}>Get in touch</h2>
              <p className={pageStyles.contactInfoSubtext}>
                Reach out to us through any of the channels below and we'll respond within 48 hours.
              </p>
              <div className={pageStyles.contactInfoDivider} />
              <div className={pageStyles.contactInfoRows}>
                {CONTACT_INFO.map((info) => (
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
              <p className={pageStyles.socialLabel}>Follow our social media</p>
              <div className={pageStyles.socialRow}>
                {SOCIALS.map((s, i) => (
                  <a key={i} href={s.href} className={pageStyles.socialBtn}>{s.label}</a>
                ))}
              </div>
            </div>

            {/* RIGHT: FORM WITH IMPROVED MESSAGE BOXES */}
            <div className={pageStyles.contactFormCol}>
              <h2 className={pageStyles.contactFormTitle}>Send us a message</h2>

              {status === 'success' ? (
                <div className={pageStyles.messageBox}>
                  <FaCheckCircle className={pageStyles.messageIconSuccess} />
                  <div className={pageStyles.messageTitle}>Message sent successfully!</div>
                  <p className={pageStyles.messageText}>
                    Thank you for reaching out. We will get back to you within 48 hours.
                  </p>
                </div>
              ) : status === 'error' ? (
                <div className={pageStyles.messageBox}>
                  <FaExclamationTriangle className={pageStyles.messageIconError} />
                  <div className={pageStyles.messageTitle}>Delivery failed</div>
                  <p className={pageStyles.messageText}>
                    Sorry, something went wrong while sending your message. Please try again later, or email us directly at <strong>info@africadigitalforum.com</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className={pageStyles.formGrid}>
                    <div className={pageStyles.formGroup}>
                      <label className={pageStyles.formLabel}>Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required className={pageStyles.formControl} placeholder="Your name" />
                    </div>
                    <div className={pageStyles.formGroup}>
                      <label className={pageStyles.formLabel}>Company</label>
                      <input type="text" name="company" value={formData.company} onChange={handleChange} className={pageStyles.formControl} placeholder="Your company" />
                    </div>
                    <div className={pageStyles.formGroup}>
                      <label className={pageStyles.formLabel}>Phone</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={pageStyles.formControl} placeholder="+XXX XXX XXX" />
                    </div>
                    <div className={pageStyles.formGroup}>
                      <label className={pageStyles.formLabel}>Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className={pageStyles.formControl} placeholder="your@email.com" />
                    </div>
                    <div className={pageStyles.formGroupFull}>
                      <label className={pageStyles.formLabel}>Subject</label>
                      <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className={pageStyles.formControl} placeholder="What is this about?" />
                    </div>
                    <div className={pageStyles.formGroupFull}>
                      <label className={pageStyles.formLabel}>Message</label>
                      <textarea name="message" value={formData.message} onChange={handleChange} required rows={5} className={pageStyles.formControl} placeholder="Describe your inquiry..." />
                    </div>
                  </div>
                  <div className={pageStyles.submitWrapper}>
                    <button type="submit" className={pageStyles.submitBtn} disabled={status === 'sending'}>
                      {status === 'sending' ? 'Sending…' : 'Send message'}
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
            title="Lomé, Togo map"
          />
        </div>
      </FadeUp>
    </div>
  );
}