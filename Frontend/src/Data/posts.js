// src/Data/posts.js
import Image1 from '../Assets/Images/Image2.jpg';
import Image2 from '../Assets/Images/Image5.jpg';
import Image3 from '../Assets/Images/Image3.jpg';
import Image4 from '../Assets/Images/Image4.jpg';
import Image6 from '../Assets/Images/Image6.jpg';
import Image7 from '../Assets/Images/Image7.jpeg';
import Image8 from '../Assets/Images/Image8.jpg';
import Image9 from '../Assets/Images/image9.jpg';

export const POSTS = [
  {
    id: 1,
    category: 'Digital Policy',
    tag: "Editor's Pick",
    title: "Togo's Government Roadmap 2025: How One Nation Is Engineering Africa's Digital Leap",
    excerpt: "President Faure Gnassingbé's administration has positioned digital transformation at the core of national economic strategy. From e-governance portals to broadband expansion across rural prefectures, the Ministry of Digital Economy and Digital Transformation (MENTD) is turning ambition into measurable outcomes.",
    content: `
      <p>In the heart of West Africa, Togo is quietly building one of the continent's most ambitious digital transformation agendas. President Faure Gnassingbé's administration has positioned digital transformation at the core of national economic strategy, with the Ministry of Digital Economy and Digital Transformation (MENTD) leading the charge.</p>
      
      <h2>E‑Governance: Putting Citizens First</h2>
      <p>The government has rolled out a suite of e‑governance portals that have dramatically reduced bureaucratic friction. From business registration to land title applications, citizens can now complete transactions in minutes rather than weeks. The flagship platform, <strong>Service Public Togo</strong>, has processed over 2 million transactions since its launch in 2023.</p>
      
      <p>This shift has not only improved service delivery but has also significantly reduced opportunities for corruption. According to the MENTD, digitisation has cut processing times by an average of 67% across all government services.</p>
      
      <blockquote>
        "Digital transformation is not just about technology—it's about reimagining how government serves its people. We are building a Togo that works for everyone, everywhere."
        <cite>— Minister Cina Lawson</cite>
      </blockquote>
      
      <h2>Broadband Expansion: Bridging the Digital Divide</h2>
      <p>Perhaps the most visible achievement has been the rapid expansion of broadband infrastructure. In 2020, only 14% of Togolese had access to reliable internet. Today, that figure stands at 62% and climbing. The government has partnered with private telecom operators to deploy fibre‑optic networks to even the most remote prefectures.</p>
      
      <p>Rural communities now have access to telemedicine, online education, and digital financial services that were previously unimaginable. The impact on livelihoods has been profound, with the World Bank estimating that digital access has contributed to a 4.3% increase in rural household incomes.</p>
      
      <h2>Digital Skills for the Next Generation</h2>
      <p>Infrastructure alone is not enough. The Togolese government has invested heavily in digital literacy programmes, targeting both young students and adult learners. Over 250,000 citizens have completed basic digital skills training, and 45,000 have participated in advanced coding and data science bootcamps.</p>
      
      <p>The government's flagship initiative, <strong>« Togo Digital Academy »</strong>, has produced over 10,000 graduates who are now contributing to the country's growing tech ecosystem. Many have gone on to found startups or join international tech companies.</p>
      
      <h2>Looking Ahead: The 2025 Roadmap</h2>
      <p>The government's 2025 roadmap sets ambitious targets: 85% internet penetration, 50% of government services fully digitised, and 100,000 new digital jobs created. With the momentum already achieved, these targets appear increasingly attainable.</p>
      
      <p>As Africa's digital transformation accelerates, Togo is positioning itself as a model for what can be achieved when political will meets strategic investment. The journey is far from complete, but the direction is clear—and the destination promises to reshape the nation's future.</p>
    `,
    author: 'ADF Editorial Board',
    authorBio: 'The Africa Digital Forum Editorial Board brings together experienced journalists, policy analysts, and technology experts to deliver in‑depth coverage of Africa\'s digital transformation.',
    authorAvatar: null,
    date: 'June 14, 2026',
    readTime: '10 min read',
    image: Image6,
  },
  {
    id: 2,
    category: 'Cybersecurity',
    tag: 'Security',
    title: "Securing the Continent: Inside Togo's Bid to Lead Africa's Cybersecurity Governance",
    excerpt: "As ransomware attacks on African financial institutions triple year-on-year, Togo's CERT-TG has quietly become a regional model for incident response and cross-border threat sharing. We trace the policy architecture being built in Lomé.",
    content: `
      <p>Cybersecurity is no longer a luxury—it's a necessity. As digital services expand across Africa, so do the threats. Togo's CERT-TG (Computer Emergency Response Team) has emerged as a regional leader, coordinating incident response across West Africa.</p>
      
      <h2>Building a Cybersecurity Framework</h2>
      <p>The Togolese government has invested heavily in building a comprehensive cybersecurity framework. This includes establishing a national cybersecurity strategy, creating a legal framework for data protection, and developing a skilled workforce.</p>
      
      <p>Under the leadership of the Ministry of Digital Economy, Togo has trained over 500 cybersecurity professionals and established partnerships with international organizations to stay ahead of emerging threats.</p>
      
      <h2>Cross-Border Collaboration</h2>
      <p>Cyber threats don't respect borders. Togo has become a key player in regional cybersecurity cooperation, hosting training workshops for neighboring countries and sharing threat intelligence.</p>
      
      <p>The CERT-TG has handled over 10,000 incidents in the past year alone, ranging from phishing attacks to sophisticated ransomware campaigns. Their rapid response has protected critical infrastructure and prevented significant financial losses.</p>
    `,
    author: 'Amina Diallo',
    authorBio: 'Amina Diallo is a cybersecurity journalist covering Africa\'s digital resilience. She has reported from over 15 countries and advises governments on cyber policy.',
    authorAvatar: null,
    date: 'June 12, 2026',
    readTime: '7 min read',
    image: Image2,
  },
  {
    id: 3,
    category: 'Infrastructure',
    tag: 'Connectivity',
    title: "Beyond Bandwidth: How Lomé's Port-Tech Corridor Is Redefining Logistics on the Gulf of Guinea",
    excerpt: "The Port of Lomé — the only natural deep-water port in West Africa — is integrating real-time digital tracking, AI-driven customs clearance, and blockchain-based cargo documentation.",
    content: `
      <p>The Port of Lomé is undergoing a digital revolution. As the only natural deep-water port in West Africa, it handles over 30% of the region's container traffic. Now, it's becoming a model for digital logistics integration.</p>
      
      <h2>Real-Time Tracking</h2>
      <p>IoT sensors and GPS tracking now provide real-time visibility into cargo movements. Importers and exporters can track their shipments from ship to warehouse, reducing delays and improving efficiency.</p>
      
      <h2>AI-Powered Customs</h2>
      <p>Artificial intelligence has transformed customs clearance, reducing processing times from days to hours. The system automatically flags suspicious shipments and prioritizes low-risk cargo, speeding up trade.</p>
      
      <h2>Blockchain Documentation</h2>
      <p>Blockchain technology is being used to create tamper-proof documentation for cargo, reducing fraud and improving trust between trading partners. This innovation has been particularly valuable for cross-border trade under the AfCFTA.</p>
    `,
    author: 'Kofi Mensah',
    authorBio: 'Kofi Mensah is a trade and logistics expert based in Accra. He has worked with the World Bank on trade facilitation projects across West Africa.',
    authorAvatar: null,
    date: 'June 10, 2026',
    readTime: '8 min read',
    image: Image3,
  },
  {
    id: 4,
    category: 'Fintech & Payments',
    tag: 'Fintech',
    title: "T-Money, Wave & the Next Frontier: Mobile Payments Are Reshaping Togo's Informal Economy",
    excerpt: "Over 62% of Togolese adults now use mobile money weekly. This seismic shift is unlocking credit access for market traders, motorcycle taxi operators, and smallholder farmers invisible to traditional banking.",
    content: `
      <p>Mobile money has revolutionized the Togolese economy. With over 62% of adults using mobile money weekly, the country has leapfrogged traditional banking infrastructure.</p>
      
      <h2>Financial Inclusion</h2>
      <p>Market traders, smallholder farmers, and motorcycle taxi operators now have access to financial services that were previously out of reach. Savings accounts, loans, and insurance are now available through mobile money platforms.</p>
      
      <h2>Economic Impact</h2>
      <p>The informal economy has been transformed. Businesses that once operated entirely in cash now use mobile money for payments, savings, and credit. The World Bank estimates that mobile money has contributed to a 5.7% increase in household incomes in Togo.</p>
      
      <h2>Future Innovation</h2>
      <p>New services are emerging, including mobile-based insurance, investment products, and cross-border remittance services. The mobile money ecosystem is becoming a platform for economic growth and poverty reduction.</p>
    `,
    author: 'Jean-Paul Agbeko',
    authorBio: 'Jean-Paul Agbeko is a fintech analyst specializing in African mobile money markets. He has worked with major telecom operators and financial institutions.',
    authorAvatar: null,
    date: 'June 8, 2026',
    readTime: '6 min read',
    image: Image4,
  },
  {
    id: 5,
    category: 'Trade & AfCFTA',
    tag: 'Trade',
    title: "The AfCFTA Digital Protocol: Why Lomé's Neutral Ground Is Critical to Ratification",
    excerpt: "Negotiations over the AfCFTA's e-commerce annexe have repeatedly stalled on data localisation and cross-border payment standards. Delegates from 14 member states chose Lomé to break the deadlock.",
    content: `
      <p>Lomé has emerged as a neutral ground for some of the most complex negotiations in African trade. The AfCFTA's digital protocol has been a sticking point, with disagreements over data localization and cross-border payment standards.</p>
      
      <h2>Breaking the Deadlock</h2>
      <p>Delegates from 14 member states convened in Lomé to find common ground. The discussions built on Togo's experience with digital trade and its reputation for neutrality and innovation.</p>
      
      <h2>Key Outcomes</h2>
      <p>The Lomé negotiations produced a framework agreement that balances data protection with the free flow of information, setting the stage for ratification of the digital protocol.</p>
      
      <h2>A Model for Pan-African Integration</h2>
      <p>Togo's role in these negotiations has strengthened its position as a leader in African digital integration. The country has shown that small nations can play outsized roles in shaping continental policy.</p>
    `,
    author: 'Fatou Ndiaye',
    authorBio: 'Fatou Ndiaye is a trade policy expert focusing on African integration. She has advised governments and international organizations on trade negotiations.',
    authorAvatar: null,
    date: 'June 6, 2026',
    readTime: '9 min read',
    image: Image7,
  },
  {
    id: 6,
    category: 'Startup Ecosystem',
    tag: 'Innovation',
    title: "ADF 2026 Spotlight: 8 West African Startups Disrupting Agriculture, Health, and Education",
    excerpt: "From Abidjan's edtech unicorns to Accra's precision-farming platforms, this year's ADF Innovation Stage features founders solving the continent's most persistent challenges with homegrown technology.",
    content: `
      <p>The ADF 2026 Innovation Stage is showcasing the best of West African startups. Eight founders are presenting solutions that address critical challenges in agriculture, health, and education.</p>
      
      <h2>Agricultural Innovation</h2>
      <p>Startups are using AI and IoT to help farmers increase yields, reduce waste, and access markets. Precision-farming platforms are being deployed across the region, transforming smallholder agriculture.</p>
      
      <h2>Health Tech</h2>
      <p>Telemedicine and digital health platforms are expanding access to healthcare, particularly in underserved rural areas. Startups are developing solutions for everything from maternal health to chronic disease management.</p>
      
      <h2>Edtech</h2>
      <p>Education technology is exploding across West Africa, with startups offering everything from early childhood education to professional development and skills training.</p>
      
      <h2>Investment and Growth</h2>
      <p>These startups have attracted significant investment, demonstrating the growing appetite for West African innovation. The ADF Innovation Stage is connecting founders with investors and partners.</p>
    `,
    author: 'Chioma Obi',
    authorBio: 'Chioma Obi covers African tech and innovation. She has reported on startup ecosystems across the continent and is a regular contributor to leading tech publications.',
    authorAvatar: null,
    date: 'June 4, 2026',
    readTime: '7 min read',
    image: Image9,
  },
  {
    id: 7,
    category: 'Fintech & Payments',
    tag: "Editor's Pick",
    title: 'Understanding Digital Financial Services (DFS)',
    excerpt: 'Digital Financial Services (DFS) are redefining how payments, savings, credit, and insurance are accessed across Africa, using phones, apps, and digital networks to bring financial inclusion to millions.',
    content: `
      <p>The global financial landscape has undergone a radical transformation over the last decade. For many of us in Africa, banking is no longer an imposing marble building in the city center, but rather an icon on our mobile phone screen. This phenomenon, grouped under the term Digital Financial Services (DFS), is redefining how we save, transfer, and borrow money.</p>
      <p>This article explores in depth what DFS are, how they work, and why they serve as the engine of modern economic growth on our continent.</p>
      <h2>1. What are Digital Financial Services?</h2>
      <p>Simply put, Digital Financial Services (DFS) refer to a broad range of financial services—such as payments, savings, credit, and insurance—that are accessed and used via digital channels. These channels include mobile phones (via USSD or apps), the internet, debit/credit cards, and point-of-sale terminals.</p>
      <h3>The Three Pillars of DFS</h3>
      <p>For a financial service to be considered "digital," it generally relies on three fundamental elements:</p>
      <ol>
        <li><strong>Digital Payment Platform:</strong> This is the infrastructure that allows users to send and receive messages and convert cash into digital currency (and vice versa).</li>
        <li><strong>Customer Device:</strong> This is the tool you use, such as your smartphone or even a basic "feature phone," to initiate a transaction.</li>
        <li><strong>Agent Network:</strong> These are the local people or businesses where you can deposit or withdraw physical cash, acting like human ATMs.</li>
      </ol>
      <h2>2. Why are DFS Essential for Africa?</h2>
      <p>Traditionally, the conventional banking system left millions of people behind, either because they lived too far from a branch or because account maintenance fees were too high. DFS has broken down these barriers.</p>
      <h3>Financial Inclusion</h3>
      <p>Financial inclusion means ensuring that individuals and businesses have access to useful and affordable financial products and services. In Africa, DFS allows a person living in a remote rural area to receive money from their family in the city instantly, without having to travel for hours.</p>
      <h3>Cost and Efficiency</h3>
      <p>Digital transactions often cost a fraction of what traditional banking services or money orders cost. This allows small business owners to manage their cash flow more effectively and reduces the risks associated with carrying physical cash.</p>
      <h2>3. The Different Types of Digital Financial Services</h2>
      <table>
        <thead>
          <tr><th>Category</th><th>Description</th><th>Examples of Use</th></tr>
        </thead>
        <tbody>
          <tr><td>Mobile Payments</td><td>Person-to-person (P2P) money transfers.</td><td>Sending money to a relative.</td></tr>
          <tr><td>Digital Savings</td><td>Accounts that allow you to set money aside via phone.</td><td>Digital ROSCAs (tontines) or mobile savings accounts.</td></tr>
          <tr><td>Digital Credit</td><td>Short-term loans approved instantly by algorithm.</td><td>Getting a small loan to purchase inventory.</td></tr>
          <tr><td>Micro-insurance</td><td>Health or agricultural coverage paid in small installments.</td><td>Crop insurance for smallholder farmers.</td></tr>
        </tbody>
      </table>
      <h2>4. How Does the Ecosystem Work?</h2>
      <p>Understanding DFS requires looking "under the hood" to see who does what. It’s not just about banks.</p>
      <h3>Service Providers (FSPs)</h3>
      <p>These are the entities that offer the service. In Africa, this often includes mobile network operators (like MTN or Orange), commercial banks, and financial technology companies (FinTechs).</p>
      <h3>Regulators</h3>
      <p>Central banks play a crucial role. They ensure that companies handling your money are solvent and that payment systems are secure. The regulatory framework is what guarantees that your digital money has the same value as physical cash.</p>
      <h3>Interoperability</h3>
      <p>This is a complex word for a simple concept: the ability to send money from one network to another (for example, from a Mobile Money account to a bank account). The more interoperable a system is, the more useful it is for the end user.</p>
      <h2>5. Security: A Major Issue</h2>
      <p>One of the biggest obstacles to DFS adoption is the fear of fraud. However, DFS are designed with robust layers of protection:</p>
      <ul>
        <li><strong>Encryption:</strong> Transaction data is encoded so it cannot be intercepted.</li>
        <li><strong>Two-Factor Authentication (2FA):</strong> In addition to your password or PIN, a temporary code may be sent to your phone.</li>
        <li><strong>Consumer Protection:</strong> Regulations require providers to have clear dispute resolution mechanisms.</li>
      </ul>
      <h2>6. Challenges for the Future</h2>
      <p>Despite explosive growth, obstacles remain:</p>
      <ol>
        <li>Digital Literacy: Knowing how to use a phone does not necessarily mean knowing how to manage one's finances online safely.</li>
        <li>Infrastructure: Consistent access to electricity and high-quality internet remains a challenge in some regions.</li>
        <li>Data Protection: As we use these services, we generate data. It is imperative that this data be protected against misuse.</li>
      </ol>
      <p>Digital Financial Services are not just a technological convenience; they are a tool for dignity and economic development. By facilitating access to capital and securing transactions, DFS allows every citizen, regardless of where they live, to participate fully in the digital economy.</p>
      <p>For us at the Africa Digital Forum, understanding these services is the first step toward building a more connected and prosperous continent. Africa's future is digital, and that future begins with mastering our money at our fingertips.</p>
    `,
    author: 'Africa Digital Forum Editorial Team',
    authorBio: 'The Africa Digital Forum Editorial Team explains how DFS unlocks economic opportunity across the continent.',
    authorAvatar: null,
    date: 'June 20, 2026',
    readTime: '8 min read',
    image: Image8,
  },
  // Add more posts with IDs 7-10 as needed...
];

// ── Category colour map ──
export const CATEGORY_COLORS = {
  'Digital Policy':     '#7C3AED',
  'Cybersecurity':      '#1D4ED8',
  'Infrastructure':     '#065F46',
  'Startup Ecosystem':  '#92400E',
  'Fintech & Payments': '#9F1239',
  'Trade & AfCFTA':     '#1E3A5F',
  'AI & Data':          '#0F766E',
  'Gender & Inclusion': '#BE185D',
};

export const getArticleById = (id) => POSTS.find(post => post.id === id);
export const getRelatedArticles = (id, count = 3) => {
  return POSTS.filter(post => post.id !== id).slice(0, count);
};