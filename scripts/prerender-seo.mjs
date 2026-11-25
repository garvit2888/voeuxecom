/**
 * scripts/prerender-seo.mjs
 * Build-time static SEO HTML generator for all 39 public routes on voeuxtechnologies.in.
 *
 * Generates `dist/<route>/index.html` with:
 *  - Route-specific <title>, <meta name="description">, <meta name="keywords">,
 *    <link rel="canonical">, Open Graph & Twitter Card tags
 *  - Route-specific Schema.org JSON-LD (Product, FAQPage, CollectionPage, BreadcrumbList)
 *  - Rich semantic initial HTML inside <div id="root"> (H1, H2, specs, pricing, FAQs,
 *    and internal <a href> links) so Googlebot & Bingbot index full content immediately
 *    on the first byte, while React seamlessly mounts the interactive app for visitors.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCTS, CATEGORIES } from '../src/data/products.js';
import { CAR_FITMENT_GUIDES } from '../src/data/carGuides.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const SITE_URL = 'https://voeuxtechnologies.in';

const escapeHtml = (str = '') =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const baseHtml = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf-8');

function buildRouteHtml({ routePath, title, description, keywords, image, jsonLdList = [], bodyHtml = '' }) {
  const canonical = `${SITE_URL}/${routePath}`.replace(/\/+$/, '') || `${SITE_URL}/`;
  const ogImage = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image}`
    : `${SITE_URL}/images/voeux_x80_hero_bg.jpg`;

  let html = baseHtml;

  // Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(description)}" />`
  );

  // Replace meta keywords if provided
  if (keywords) {
    html = html.replace(
      /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="keywords" content="${escapeHtml(keywords)}" />`
    );
  }

  // Replace canonical URL
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`
  );

  // Replace Open Graph tags
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapeHtml(ogImage)}" />`
  );

  // Replace Twitter tags
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`
  );

  // Inject route-specific JSON-LD before </head>
  if (jsonLdList.length > 0) {
    const ldBlocks = jsonLdList
      .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
      .join('\n    ');
    html = html.replace('</head>', `    ${ldBlocks}\n  </head>`);
  }

  // Inject rich semantic HTML inside <div id="root"> (replaced automatically when React mounts)
  if (bodyHtml) {
    html = html.replace(
      /<div id="root"><\/div>/i,
      `<div id="root"><main style="max-width:960px;margin:0 auto;padding:24px;font-family:sans-serif;color:#111">${bodyHtml}</main></div>`
    );
  }

  return html;
}

function writeRoute(routePath, html) {
  const cleanPath = routePath.replace(/^\/+|\/+$/g, '');
  const outDir = path.join(DIST_DIR, cleanPath);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
}

const carLinksHtml = CAR_FITMENT_GUIDES.map(
  (g) => `<li><a href="/car/${g.slug}">Best Android Player for ${escapeHtml(g.carName)} (${escapeHtml(g.recommendedSize)})</a></li>`
).join('');

let count = 0;

// 1. Category Pages
const categoryMeta = {
  'android-players': {
    title: 'Car Android Players India (9" & 10.1" QLED, 4GB+64GB, Wireless CarPlay) | VOEUX®',
    description:
      'Buy official VOEUX® Car Android Players in India. Shop 9-inch QLED TS7 & 10.1-inch X80 Dual Knob Android Car Stereos with 4GB RAM, 64GB ROM, Wireless Apple CarPlay, Android Auto & AHD Reverse Camera.',
    keywords:
      'car android player, android player for car, 9 inch android car stereo, 10.1 inch android car player, dual knob android car stereo, wireless apple carplay stereo India, VOEUX android player',
    image: '/images/voeux_x80_stereo.jpg',
  },
  'speakers-soundbars': {
    title: 'VOEUX® 160W 2-in-1 Separable Bluetooth Soundbar with Subwoofer | Official Store',
    description:
      'Shop the VOEUX® 160W RMS 2.1 Channel Convertible Bluetooth 5.0 Soundbar. Use as a horizontal TV soundbar or twin vertical tower speakers with dedicated subwoofer & HDMI ARC.',
    keywords: '160W soundbar with subwoofer, 2 in 1 separable soundbar, bluetooth soundbar India, VOEUX soundbar',
    image: '/images/voeux_soundbar_main.jpg',
  },
  'car-speakers': {
    title: '6" & 6.5" Coaxial Car Door Speakers (380W & 460W High Bass) | VOEUX® India',
    description:
      'Upgrade your car audio with VOEUX® VE-CS606 (380W 6-inch) and VE-CS606PT2 (460W 6.5-inch) 2-Way Coaxial Car Speakers featuring Dual Voice Coil & 93 dB sensitivity.',
    keywords: '6.5 inch car speakers, 6 inch coaxial car speakers, high bass car door speakers India, VOEUX speakers',
    image: '/images/voeux_cs606pt2_main.png',
  },
  subwoofers: {
    title: '10-Inch Active Underseat Car Subwoofer (120W RMS / 900W Peak) | VOEUX® SVX-UND001',
    description:
      'Add deep bass without losing boot space with the VOEUX® SVX-UND001 10-Inch Powered Underseat Car Subwoofer. Ultra-slim 6.8 cm depth with built-in amplifier & wired bass remote.',
    keywords: 'underseat subwoofer for car, 10 inch active car subwoofer, powered underseat subwoofer India, VOEUX SVX-UND001',
    image: '/images/voeux_subwoofer_und001_hero.jpg',
  },
  amplifiers: {
    title: '150W Mono Class AB Car Amplifier Board for Basstubes & Subwoofers | VOEUX®',
    description:
      'Shop the VOEUX® 150W RMS Mono Class AB Car Amplifier Board with variable bass crossover (40Hz–200Hz), RCA & high-level inputs, and 25A fuse protection.',
    keywords: '150W mono car amplifier board, basstube amplifier board 12V, class AB car amp India, VOEUX amplifier',
    image: '/images/voeux_amp_board.jpg',
  },
  bundles: {
    title: 'Car Android Player + 4 Speakers + Fitting Frame Combo Bundles | VOEUX® India',
    description:
      'Save with complete VOEUX® Car Audio Upgrade Combos: 9" or 10.1" QLED Android Player + 4 High-Bass Coaxial Speakers + Custom Dashboard Fitting Frame.',
    keywords: 'car android player combo, car stereo and 4 speakers bundle, double din frame combo India, VOEUX bundle',
    image: '/images/bundle_x80.png',
  },
};

for (const cat of CATEGORIES) {
  const meta = categoryMeta[cat.id];
  if (!meta) continue;
  const catProducts = PRODUCTS.filter((p) => p.category === cat.id);
  const prodListHtml = catProducts
    .map(
      (p) =>
        `<li><a href="/product/${p.id}">${escapeHtml(p.name)}</a> — ₹${Number(p.price).toLocaleString('en-IN')}. ${escapeHtml(
          (p.shortSpecs || []).join(' | ')
        )}</li>`
    )
    .join('');

  const html = buildRouteHtml({
    routePath: cat.id,
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    image: meta.image,
    jsonLdList: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: meta.title,
        description: meta.description,
        url: `${SITE_URL}/${cat.id}`,
      },
    ],
    bodyHtml: `
      <h1>${escapeHtml(meta.title)}</h1>
      <p>${escapeHtml(meta.description)}</p>
      <h2>Official VOEUX® ${escapeHtml(cat.name)}</h2>
      <ul>${prodListHtml}</ul>
      ${cat.id === 'android-players' ? `<h2>Shop Android Player by Car Model</h2><ul>${carLinksHtml}</ul>` : ''}
      <p><a href="/virtual-fit">Try VOEUX® Virtual Fit — Preview on Your Car Dashboard</a></p>
    `,
  });
  writeRoute(cat.id, html);
  count++;
}

// 2. Virtual Fit Page
writeRoute(
  'virtual-fit',
  buildRouteHtml({
    routePath: 'virtual-fit',
    title: 'VOEUX® Virtual Fit | Preview 9" & 10.1" Car Android Players on Your Dashboard',
    description:
      'Upload a photo of your car dashboard and see how VOEUX® 9-inch TS7 QLED, 9.5-inch Single Knob, or 10.1-inch X80 Dual Knob Android Car Players look installed inside your vehicle with AI perspective and true physical scale.',
    keywords:
      'virtual fit car stereo, preview android player on car dashboard, 9 inch vs 10 inch car stereo size comparison, VOEUX Virtual Fit',
    image: '/images/virtual-fit/sample_dashboard.jpg',
    bodyHtml: `
      <h1>VOEUX® Virtual Fit — Preview Android Car Players on Your Dashboard</h1>
      <p>Upload a front-view photograph of your car dashboard with steering wheel visible and preview how our 9-inch TS7 QLED or 10.1-inch X80 Dual Knob Android Car Player fits inside your car to exact real-world scale. Available in English, Hindi, Telugu &amp; Marathi.</p>
      <h2>Supported Car Android Players</h2>
      <ul>
        <li><a href="/product/voeux-x80-dual-knob">VOEUX® X80 Diamond 10.1" Dual Knob Android Car Stereo</a></li>
        <li><a href="/product/voeux-carbon-black-ts7-4-64">VOEUX® Carbon Black TS7 9" QLED Android Car Stereo</a></li>
        <li><a href="/product/voeux-single-knob-piano-4-64">VOEUX® Single Knob Piano Series Android Car Stereo</a></li>
      </ul>
    `,
  })
);
count++;

// 3. All 12 Individual Product & Bundle Pages
for (const product of PRODUCTS) {
  const priceStr = Number(product.price).toLocaleString('en-IN');
  const title = `${product.name} – ₹${priceStr} | VOEUX® Official Store`;
  const description =
    (product.description || '').slice(0, 260) ||
    `Buy ${product.name} online at ₹${priceStr} from VOEUX® Official Store India with 1-Year Warranty and Pan-India Delivery.`;
  const specsHtml = (product.shortSpecs || []).map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  const featuresHtml = (product.features || []).map((f) => `<li>${escapeHtml(f)}</li>`).join('');

  const shippingCost = product.id === 'voeux-160w-separable-soundbar' ? '399' : '0';
  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.id,
    image: (product.gallery && product.gallery.length ? product.gallery : [product.image]).map((img) =>
      img.startsWith('http') ? img : `${SITE_URL}${img}`
    ),
    description: product.description || description,
    brand: { '@type': 'Brand', name: 'VOEUX' },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: 'INR',
      price: String(product.price),
      validFrom: '2026-01-01',
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: shippingCost, currency: 'INR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IN' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 7, unitCode: 'DAY' },
        },
      },
    },
  };

  writeRoute(
    `product/${product.id}`,
    buildRouteHtml({
      routePath: `product/${product.id}`,
      title,
      description,
      keywords: `${product.name}, VOEUX ${product.category}, buy car android player online India, VOEUX official store`,
      image: product.image,
      jsonLdList: [productLd],
      bodyHtml: `
        <h1>${escapeHtml(product.name)}</h1>
        <p><strong>Price: ₹${priceStr}</strong> | 1-Year Domestic Warranty | Official VOEUX® Store India</p>
        <p>${escapeHtml(product.description || '')}</p>
        <h2>Key Specifications</h2>
        <ul>${specsHtml}</ul>
        <h2>Features</h2>
        <ul>${featuresHtml}</ul>
        <p><a href="/${product.category}">Browse all ${escapeHtml(product.category)}</a> | <a href="/virtual-fit">Try VOEUX® Virtual Fit</a></p>
      `,
    })
  );
  count++;
}

// 4. All 10 Car-Specific SEO Fitment Guide Pages
for (const guide of CAR_FITMENT_GUIDES) {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Car Android Players', item: `${SITE_URL}/android-players` },
      { '@type': 'ListItem', position: 3, name: `Android Player for ${guide.carName}`, item: `${SITE_URL}/car/${guide.slug}` },
    ],
  };

  const recProductsHtml = guide.recommendedProductIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => `<li><a href="/product/${p.id}">${escapeHtml(p.name)}</a> — ₹${Number(p.price).toLocaleString('en-IN')}</li>`)
    .join('');

  const faqsHtml = guide.faqs
    .map((f) => `<h3>${escapeHtml(f.q)}</h3><p>${escapeHtml(f.a)}</p>`)
    .join('');

  writeRoute(
    `car/${guide.slug}`,
    buildRouteHtml({
      routePath: `car/${guide.slug}`,
      title: guide.seoTitle,
      description: guide.seoDescription,
      keywords: guide.keywords,
      image: '/images/voeux_x80_stereo.jpg',
      jsonLdList: [faqLd, breadcrumbLd],
      bodyHtml: `
        <h1>Best Android Player for ${escapeHtml(guide.carName)} (${escapeHtml(guide.recommendedSize)})</h1>
        <p>${escapeHtml(guide.heroSummary)}</p>
        <p><strong>Compatible Model Years:</strong> ${escapeHtml(guide.modelYears)}</p>
        <h2>Top Recommended VOEUX® Android Car Players for ${escapeHtml(guide.carName)}</h2>
        <ul>${recProductsHtml}</ul>
        <h2>${escapeHtml(guide.carName)} Fitment &amp; Installation Checklist</h2>
        <ul>${guide.fitmentNotes.map((n) => `<li>${escapeHtml(n)}</li>`).join('')}</ul>
        <h2>Why Upgrade Your ${escapeHtml(guide.carName)} Stereo?</h2>
        <p>${escapeHtml(guide.whyUpgrade)}</p>
        <h2>Frequently Asked Questions</h2>
        ${faqsHtml}
        <h2>More Car Android Player Fitment Guides</h2>
        <ul>${carLinksHtml}</ul>
      `,
    })
  );
  count++;
}

// 5. Support, Warranty, Dealer, Brand & Legal Pages
const staticPages = [
  {
    routePath: 'dealers',
    title: 'Authorized VOEUX® Car Audio Dealers & Installers in India | Dealer Locator',
    description:
      'Find authorized VOEUX® car android player dealers and certified fitment studios across New Delhi (Kashmere Gate), Mumbai, Bengaluru, and pan-India.',
  },
  {
    routePath: 'installation',
    title: 'Car Android Player & Subwoofer Installation Guide | VOEUX® India',
    description:
      'Plug-and-play coupler installation guide and fitment support for VOEUX® 9" & 10.1" Android Car Players, Coaxial Car Speakers, and Underseat Subwoofers.',
  },
  {
    routePath: 'warranty',
    title: 'Online Warranty Registration | VOEUX® Electronics India',
    description:
      'Register your 1-Year Domestic Warranty for official VOEUX® Car Android Players, Soundbars, Subwoofers, Car Speakers, and Amplifiers.',
  },
  {
    routePath: 'warranty-policy',
    title: '1-Year Domestic Warranty Policy | VOEUX® Electronics India',
    description:
      'Complete coverage details for VOEUX® 1-Year Domestic Warranty on manufacturing defects across all car audio and home audio products.',
  },
  {
    routePath: 'support',
    title: 'Support & Frequently Asked Questions (FAQ) | VOEUX® Official Store',
    description:
      'Answers on Android Car Stereo compatibility, Double-DIN frames, AHD cameras, 1-Year Warranty, pan-India shipping, and installation.',
  },
  {
    routePath: 'about-us',
    title: 'About VOEUX® Electronics India | Car Android Players & Audio Engineering',
    description:
      'Discover VOEUX® Electronics India — precision-engineered QLED Android Car Players, 160W Convertible Soundbars, Underseat Subwoofers, and Coaxial Car Speakers.',
  },
  {
    routePath: 'contact-us',
    title: 'Contact VOEUX® Support & Sales | Official Customer Care India',
    description:
      'Contact VOEUX® Electronics India for car android player fitment advice, bulk distributor inquiries, order support, and warranty service.',
  },
  {
    routePath: 'join-us',
    title: 'Become an Authorized VOEUX® Car Audio Distributor or Dealer | India',
    description:
      'Partner with VOEUX® Electronics India. Apply to become an official dealer or distributor for our Android Car Players, Speakers & Soundbars.',
  },
  {
    routePath: 'terms',
    title: 'Terms & Conditions, Shipping & Return Policy | VOEUX® Official Store',
    description: 'Official terms of service, shipping policy, and return policy for voeuxtechnologies.in.',
  },
];

for (const page of staticPages) {
  writeRoute(
    page.routePath,
    buildRouteHtml({
      routePath: page.routePath,
      title: page.title,
      description: page.description,
      bodyHtml: `
        <h1>${escapeHtml(page.title)}</h1>
        <p>${escapeHtml(page.description)}</p>
        <p><a href="/android-players">Shop VOEUX® Car Android Players</a> | <a href="/virtual-fit">Try Virtual Fit</a> | <a href="/">VOEUX® Home</a></p>
      `,
    })
  );
  count++;
}

console.log(`✓ Pre-rendered static SEO HTML for ${count} routes in dist/`);

