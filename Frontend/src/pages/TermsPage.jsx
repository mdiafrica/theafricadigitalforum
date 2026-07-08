// src/pages/TermsPage.jsx
import { useEffect } from 'react';
import styles from '../Styles/PrivacyPage.module.css';

export default function TermsPage({ t }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Terms of Use</h1>
          <p className={styles.lastUpdated}>Last Updated: July 02, 2026</p>
        </div>

        <div className={styles.content}>
          <div className={styles.intro}>
            <p>
              Use of the site <a href="https://theafricadigitalforum.com/">https://theafricadigitalforum.com/</a> 
              implies full acceptance of the terms described below.
            </p>
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Intellectual Property</h2>
            <p>
              The name "Africa Digital Forum," its logo, textual content (Vision, Mission, Pillars), 
              and visual materials are the exclusive property of the <strong>Media and Digital Institute (MDI)</strong>, 
              unless otherwise stated. Any unauthorized reproduction or exploitation is strictly prohibited.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Site Usage</h2>
            <p>Users agree to use the site in an ethical and professional manner. It is prohibited to:</p>
            <ul className={styles.list}>
              <li>Attempt to compromise the platform's security.</li>
              <li>Publish offensive content or content that undermines the integrity of information.</li>
              <li>Use contact forms to send unsolicited communications (spam).</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Limitation of Liability</h2>
            <p>
              While we strive to provide accurate and up-to-date information, the ADF cannot be held 
              responsible for errors, temporary unavailability of the site, or damages resulting from 
              the use of links to third-party sites (e.g., Hostinger, speakers' social networks).
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Updates to Policies</h2>
            <p>
              The Africa Digital Forum may update its policies at any time. We are not obliged to notify 
              users of these updates, as users are responsible for periodically checking the document 
              for any changes.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact</h2>
            <p>
              For any questions regarding these policies, please contact the ADF executive secretariat:
            </p>
            <div className={styles.contactInfo}>
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:contact@theafricadigitalforum.com" className={styles.emailLink}>
                  contact@theafricadigitalforum.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}