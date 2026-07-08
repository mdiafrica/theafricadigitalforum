// src/pages/PrivacyPage.jsx
import { useEffect } from 'react';
import styles from '../Styles/PrivacyPage.module.css';

export default function PrivacyPage({ t }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last Updated: July 02, 2026</p>
        </div>

        <div className={styles.content}>
          <div className={styles.intro}>
            <p>
              This page details the Privacy Policy, Terms of Use, and Cookie Policy for the official 
              Africa Digital Forum (ADF) website: <a href="https://theafricadigitalforum.com/">https://theafricadigitalforum.com/</a>. 
              The ADF is a permanent continental platform legally managed and hosted by the 
              <strong> Media and Digital Institute (MDI)</strong>.
            </p>
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Privacy Policy</h2>
            <p className={styles.sectionIntro}>
              This policy explains how the Africa Digital Forum collects, uses, and protects your 
              personal data in pursuit of its mission to accelerate inclusive digital transformation 
              in Africa.
            </p>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Data Collection</h3>
              <p>We collect information when you interact with our platform, including for:</p>
              <ul className={styles.list}>
                <li>Event registration (name, surname, organization, job title, country).</li>
                <li>Speaker or startup applications.</li>
                <li>Subscription to our updates (ADF Digest) via your email address.</li>
                <li>Navigation data collected automatically (IP address, browser type) via analytics tools.</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Purpose of Processing</h3>
              <p>Your data is processed for the following purposes:</p>
              <ul className={styles.list}>
                <li>Managing registration and event logistics.</li>
                <li>Communication regarding the program, thematic pillars (AI, Digital Economy, etc.), and investment opportunities.</li>
                <li>Connecting startup founders with investors.</li>
                <li>Improving user experience and platform security.</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Data Protection and Sharing</h3>
              <p>
                ADF is committed to maintaining the confidentiality of your strategic and personal information. 
                We do not share your data with third-party partners or sponsors unless we have your explicit 
                consent or it is necessary for the performance of forum services.
              </p>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Your Rights</h3>
              <p>
                In accordance with the principles of digital sovereignty and data protection, you have the 
                right to access, rectify, and delete your personal data. For any requests, please contact us at:
              </p>
              <a href="mailto:contact@theafricadigitalforum.com" className={styles.emailLink}>
                contact@theafricadigitalforum.com
              </a>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Terms of Use</h2>
            <p>
              Use of the site <a href="https://theafricadigitalforum.com/">https://theafricadigitalforum.com/</a> 
              implies full acceptance of the terms described below.
            </p>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Intellectual Property</h3>
              <p>
                The name "Africa Digital Forum," its logo, textual content (Vision, Mission, Pillars), 
                and visual materials are the exclusive property of the <strong>Media and Digital Institute (MDI)</strong>, 
                unless otherwise stated. Any unauthorized reproduction or exploitation is strictly prohibited.
              </p>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Site Usage</h3>
              <p>Users agree to use the site in an ethical and professional manner. It is prohibited to:</p>
              <ul className={styles.list}>
                <li>Attempt to compromise the platform's security.</li>
                <li>Publish offensive content or content that undermines the integrity of information.</li>
                <li>Use contact forms to send unsolicited communications (spam).</li>
              </ul>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Limitation of Liability</h3>
              <p>
                While we strive to provide accurate and up-to-date information, the ADF cannot be held 
                responsible for errors, temporary unavailability of the site, or damages resulting from 
                the use of links to third-party sites (e.g., Hostinger, speakers' social networks).
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Cookie Policy</h2>
            <p>
              To improve your experience, the Africa Digital Forum website uses cookies. A cookie is a 
              small text file stored on your device.
            </p>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Types of Cookies Used</h3>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Cookie Type</th>
                      <th>Purpose</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Essential</strong></td>
                      <td>Necessary for the technical operation and security of the site.</td>
                    </tr>
                    <tr>
                      <td><strong>Analytical</strong></td>
                      <td>Allow us to measure audience and understand which sections (e.g., Startup Village, AI Arena) interest our visitors.</td>
                    </tr>
                    <tr>
                      <td><strong>Preference</strong></td>
                      <td>Used for automatic language detection (French/English) based on your geolocation.</td>
                    </tr>
                    <tr>
                      <td><strong>Marketing</strong></td>
                      <td>Allow us to track the effectiveness of our campaigns for recruiting sponsors and speakers.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Cookie Management</h3>
              <p>
                Upon your first visit, a banner allows you to accept or decline non-essential cookies. 
                You can also configure your browser to block cookies, although this may limit access to 
                certain site features, such as the automatic language selector.
              </p>
            </div>
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