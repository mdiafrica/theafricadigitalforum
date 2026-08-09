import fs from 'fs/promises';
import path from 'path';
import { blog } from './src/i18n/en/pages/blog.js';
import { home } from './src/i18n/en/pages/home.js';
import { city } from './src/i18n/en/pages/city.js';
import { about } from './src/i18n/en/pages/about.js';
import { contact } from './src/i18n/en/pages/contact.js';
import { whyadf } from './src/i18n/en/pages/whyadf.js';

const SITE_URL = 'https://theafricadigitalforum.com';
const DIST_DIR = path.resolve('./dist');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

const IMAGE_BASES = {
  1: 'ADFLeadership',
  2: 'Image5',
  3: 'Image3',
  4: 'Image4',
  5: 'Image6',
  6: 'image9',
  7: 'Image8',
  8: 'meta',
  9: 'kenyaIT',
  10: 'Mfundo-Nkuhlu',
};

const PAGE_ROUTES = [
  {
    path: '',
    title: 'Africa Digital Forum | Africa Digital Forum',
    description: home.hero.tagline,
    canonical: SITE_URL,
    imageBase: 'Logo-COtdmCdo',
  },
  {
    path: 'blog',
    title: `${blog.pageTitle} | Africa Digital Forum`,
    description: blog.pageSub,
    canonical: `${SITE_URL}/blog`,
    imageBase: 'meta',
  },
  {
    path: 'city',
    title: `${city.hero.title} | Africa Digital Forum`,
    description: city.info.body,
    canonical: `${SITE_URL}/city`,
    imageBase: 'Logo-COtdmCdo',
  },
  {
    path: 'about',
    title: `${about.heroTitle} | Africa Digital Forum`,
    description: about.heroSubtitle,
    canonical: `${SITE_URL}/about`,
    imageBase: 'Logo-COtdmCdo',
  },
  {
    path: 'contact',
    title: `${contact.hero.title} | Africa Digital Forum`,
    description: contact.hero.title + ' - ' + contact.hero.subtitle,
    canonical: `${SITE_URL}/contact`,
    imageBase: 'Logo-COtdmCdo',
  },
  {
    path: 'whyadf',
    title: `${whyadf.heroTitle} | Africa Digital Forum`,
    description: whyadf.heroText,
    canonical: `${SITE_URL}/whyadf`,
    imageBase: 'Logo-COtdmCdo',
  },
];

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createRegex(name, attr = 'property') {
  const prefix = attr === 'property' ? 'property' : 'name';
  return new RegExp(`<meta\\s+${prefix}="${name}"\\s+content="[^"]*"\\s*\/?>`, 'i');
}

function replaceMetaTag(html, name, content, attr = 'property') {
  const escaped = escapeHtml(content);
  const prefix = attr === 'property' ? 'property' : 'name';
  const regex = createRegex(name, attr);
  const replacement = `<meta ${prefix}="${name}" content="${escaped}" />`;
  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }
  return html.replace('</head>', `  ${replacement}\n</head>`);
}

function replaceTag(html, tagName, content) {
  const regex = new RegExp(`(<${tagName}[^>]*>)([\s\S]*?)(<\/${tagName}>)`, 'i');
  return html.replace(regex, `$1${escapeHtml(content)}$3`);
}

function findAssetFile(baseName, files) {
  const match = files.find((file) => {
    const normalized = file.toLowerCase();
    const search = baseName.toLowerCase();
    return normalized.startsWith(`${search}-`) || normalized === `${search}.png` || normalized === `${search}.jpg` || normalized === `${search}.jpeg`;
  });
  return match;
}

async function generateArticleHtml() {
  const html = await fs.readFile(INDEX_HTML, 'utf8');
  const assetFiles = await fs.readdir(ASSETS_DIR);

  for (const page of PAGE_ROUTES) {
    const outputPath = page.path ? path.join(DIST_DIR, page.path) : DIST_DIR;
    const pageUrl = page.canonical;
    const imageFile = findAssetFile(page.imageBase, assetFiles);
    const imageUrl = imageFile ? `${SITE_URL}/assets/${imageFile}` : `${SITE_URL}/assets/Logo-COtdmCdo.png`;

    let pageHtml = html;
    pageHtml = replaceTag(pageHtml, 'title', page.title);
    pageHtml = pageHtml.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(page.description)}" />`
    );
    pageHtml = pageHtml.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${pageUrl}" />`
    );
    pageHtml = replaceMetaTag(pageHtml, 'og:type', 'website');
    pageHtml = replaceMetaTag(pageHtml, 'og:title', page.title);
    pageHtml = replaceMetaTag(pageHtml, 'og:description', page.description);
    pageHtml = replaceMetaTag(pageHtml, 'og:url', pageUrl);
    pageHtml = replaceMetaTag(pageHtml, 'og:image', imageUrl);
    pageHtml = replaceMetaTag(pageHtml, 'og:image:secure_url', imageUrl);
    pageHtml = replaceMetaTag(pageHtml, 'twitter:title', page.title, 'name');
    pageHtml = replaceMetaTag(pageHtml, 'twitter:description', page.description, 'name');
    pageHtml = replaceMetaTag(pageHtml, 'twitter:image', imageUrl, 'name');

    await fs.mkdir(outputPath, { recursive: true });
    await fs.writeFile(path.join(outputPath, 'index.html'), pageHtml, 'utf8');
    console.log(`Prerendered page route: /${page.path}`);
  }

  for (const post of blog.posts || []) {
    const slug = post.slug;
    if (!slug) continue;

    const routeDir = path.join(DIST_DIR, 'article', slug);
    const articleUrl = `${SITE_URL}/article/${slug}`;
    const imageBase = IMAGE_BASES[post.id] || 'Logo-COtdmCdo';
    const imageFile = findAssetFile(imageBase, assetFiles);
    const imageUrl = imageFile ? `${SITE_URL}/assets/${imageFile}` : `${SITE_URL}/assets/Logo-COtdmCdo.png`;

    let pageHtml = html;
    pageHtml = replaceTag(pageHtml, 'title', `${post.title} | Africa Digital Forum`);
    pageHtml = pageHtml.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${escapeHtml(post.excerpt || 'Read our latest article on Africa’s digital transformation.')}" />`
    );
    pageHtml = pageHtml.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${articleUrl}" />`
    );
    pageHtml = replaceMetaTag(pageHtml, 'og:type', 'article');
    pageHtml = replaceMetaTag(pageHtml, 'og:title', post.title);
    pageHtml = replaceMetaTag(pageHtml, 'og:description', post.excerpt || 'Read our latest article on Africa’s digital transformation.');
    pageHtml = replaceMetaTag(pageHtml, 'og:url', articleUrl);
    pageHtml = replaceMetaTag(pageHtml, 'og:image', imageUrl);
    pageHtml = replaceMetaTag(pageHtml, 'og:image:secure_url', imageUrl);
    pageHtml = replaceMetaTag(pageHtml, 'twitter:title', post.title, 'name');
    pageHtml = replaceMetaTag(pageHtml, 'twitter:description', post.excerpt || 'Read our latest article on Africa’s digital transformation.', 'name');
    pageHtml = replaceMetaTag(pageHtml, 'twitter:image', imageUrl, 'name');

    await fs.mkdir(routeDir, { recursive: true });
    await fs.writeFile(path.join(routeDir, 'index.html'), pageHtml, 'utf8');
    console.log(`Prerendered article route: /article/${slug}`);
  }
}

async function run() {
  try {
    await generateArticleHtml();
    console.log('Prerender completed successfully.');
  } catch (error) {
    console.error('Prerender failed:', error);
    process.exit(1);
  }
}

run();
