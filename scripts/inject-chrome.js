/**
 * Injects shared header/footer and production head defaults into live HTML.
 * Source of truth: components/site-header.html and components/site-footer.html
 * Does not touch archive/.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const HOST = "https://genesisoslabs.com";
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap";
const OG_IMAGE = `${HOST}/images/og-default.jpg`;
const CACHE = "brand8";

const PAGES = [
  { file: "index.html", prefix: "", canonical: `${HOST}/`, jsonld: "website" },
  { file: "AerysDesktop.html", prefix: "", canonical: `${HOST}/AerysDesktop.html`, jsonld: "software" },
  { file: "CRM.html", prefix: "", canonical: `${HOST}/CRM.html`, jsonld: "software" },
  { file: "Education.html", prefix: "", canonical: `${HOST}/Education.html`, jsonld: "website" },
  { file: "About.html", prefix: "", canonical: `${HOST}/About.html`, jsonld: "website" },
  { file: "EnterpriseTokenization.html", prefix: "", canonical: `${HOST}/EnterpriseTokenization.html`, jsonld: "service" },
  { file: "GCoin.html", prefix: "", canonical: `${HOST}/GCoin.html`, jsonld: "software" },
  { file: "GenesisOS.html", prefix: "", canonical: `${HOST}/GenesisOS.html`, jsonld: "software" },
  { file: "GGamingOS.html", prefix: "", canonical: `${HOST}/GGamingOS.html`, jsonld: "software" },
  { file: "GStudentOS.html", prefix: "", canonical: `${HOST}/GStudentOS.html`, jsonld: "software" },
  { file: "privacy/index.html", prefix: "../", canonical: `${HOST}/privacy/`, jsonld: "website" },
  { file: "terms/index.html", prefix: "../", canonical: `${HOST}/terms/`, jsonld: "website" },
  { file: "accessibility/index.html", prefix: "../", canonical: `${HOST}/accessibility/`, jsonld: "website" },
];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function write(rel, content) {
  fs.writeFileSync(path.join(ROOT, rel), content, "utf8");
}

function orgJsonLd(page) {
  const org = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${HOST}/#organization`,
        name: "GenesisOS Labs LLC",
        url: `${HOST}/`,
        logo: `${HOST}/assets/img/logo.png`,
        email: "support@GenesisOSLabs.com",
        sameAs: [
          "https://x.com/GenesisOSLabs",
          "https://www.linkedin.com/company/104893537",
          "https://www.instagram.com/genesisoslabs/",
          "https://www.facebook.com/profile.php?id=61590064982617",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${HOST}/#website`,
        url: `${HOST}/`,
        name: "GenesisOS Labs",
        publisher: { "@id": `${HOST}/#organization` },
      },
    ],
  };
  if (page.jsonld === "software") {
    const names = {
      "AerysDesktop.html": "Aerys Desktop",
      "CRM.html": "GenesisCRM",
      "GCoin.html": "GCoin",
      "GenesisOS.html": "GenesisOS",
      "GGamingOS.html": "GGamingOS",
      "GStudentOS.html": "GStudentOS",
    };
    const software = {
      "@type": "SoftwareApplication",
      name: names[page.file] || "GenesisOS",
      applicationCategory: page.file === "GCoin.html" ? "FinanceApplication" : "BusinessApplication",
      url: page.canonical,
      publisher: { "@id": `${HOST}/#organization` },
    };
    if (page.file !== "GCoin.html") {
      software.operatingSystem = "Windows, macOS, Linux";
    }
    org["@graph"].push(software);
  }
  if (page.jsonld === "service") {
    org["@graph"].push({
      "@type": "Service",
      name: "Enterprise Tokenization Consulting",
      url: page.canonical,
      provider: { "@id": `${HOST}/#organization` },
    });
  }
  return `<script type="application/ld+json">\n${JSON.stringify(org, null, 2)}\n</script>`;
}

function applyHead(html, page) {
  html = html.replace(
    /href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+"/g,
    `href="${FONT_HREF}"`
  );
  html = html.replace(/\?v=brand\d+/g, `?v=${CACHE}`);
  html = html.replace(/https:\/\/GenesisOSLabs\.com/g, HOST);

  html = html.replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${page.canonical}">`
  );
  html = html.replace(
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${page.canonical}">`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*">/g,
    `<meta property="og:image" content="${OG_IMAGE}">`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*">/g,
    `<meta name="twitter:image" content="${OG_IMAGE}">`
  );

  if (!html.includes('property="og:type"')) {
    html = html.replace(
      '<meta property="og:site_name" content="GenesisOS Labs">',
      '<meta property="og:site_name" content="GenesisOS Labs">\n  <meta property="og:type" content="website">'
    );
  }

  const fav = `  <link rel="icon" href="${page.prefix}favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="${page.prefix}assets/favicon/favicon-32.png">
  <link rel="apple-touch-icon" href="${page.prefix}assets/favicon/apple-touch-icon.png">`;
  if (!html.includes("apple-touch-icon")) {
    html = html.replace(
      '<meta name="viewport" content="width=device-width, initial-scale=1">',
      `<meta name="viewport" content="width=device-width, initial-scale=1">\n${fav}`
    );
  }

  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, "");
  html = html.replace("</head>", `  ${orgJsonLd(page)}\n</head>`);
  return html;
}

function applyChrome(html, page, headerTpl, footerTpl) {
  const header = headerTpl.replaceAll("{{P}}", page.prefix);
  const footer = footerTpl.replaceAll("{{P}}", page.prefix);

  html = html.replace(/<div class="site-banner">[\s\S]*?<\/div>\s*/g, "");
  html = html.replace(/\s*data-skip-global-footer/g, "");
  html = html.replace(/<div class="sticky-cta"[\s\S]*?<\/div>\s*/g, "");
  html = html.replace(/<a class="btn btn--primary scroll-cta"[\s\S]*?<\/a>\s*/g, "");

  if (/<header class="site-header">[\s\S]*?<\/header>/.test(html)) {
    html = html.replace(/<header class="site-header">[\s\S]*?<\/header>/, header);
  }

  if (/<footer class="page-footer"[\s\S]*?<\/footer>/.test(html)) {
    html = html.replace(/<footer class="page-footer"[\s\S]*?<\/footer>/, footer);
  } else {
    html = html.replace("</body>", `${footer}\n</body>`);
  }

  return applyHead(html, page);
}

function patchRedirect() {
  const file = "pages/terms.html";
  let html = read(file);
  html = html.replace(/https:\/\/GenesisOSLabs\.com/g, HOST);
  html = html.replace(
    /href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+"/g,
    `href="${FONT_HREF}"`
  );
  html = html.replace(/\?v=brand\d+/g, `?v=${CACHE}`);
  if (!html.includes('name="robots"')) {
    html = html.replace(
      '<meta name="description"',
      '<meta name="robots" content="noindex,follow">\n  <meta name="description"'
    );
  }
  html = html.replace(
    /<link rel="canonical" href="[^"]*">/,
    `<link rel="canonical" href="${HOST}/terms/">`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*">/g,
    `<meta property="og:image" content="${OG_IMAGE}">`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*">/g,
    `<meta name="twitter:image" content="${OG_IMAGE}">`
  );
  write(file, html);
  console.log("patched", file);
}

function main() {
  const headerTpl = read("components/site-header.html").trim();
  const footerTpl = read("components/site-footer.html").trim();
  write("components/GlobalFooter.html", footerTpl.replaceAll("{{P}}", ""));

  for (const page of PAGES) {
    const before = read(page.file);
    const after = applyChrome(before, page, headerTpl, footerTpl);
    write(page.file, after);
    console.log("injected", page.file);
  }
  patchRedirect();
}

main();
