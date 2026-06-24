// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Mortgages', description: 'Find a mortgage deal that suits your needs, compare rates, or apply online or in the app — including the £5k Deposit Mortgage for first-time buyers.', image_url: 'https://www.lloydsbank.com/assets/homepage/homepage-new/remortgage-desktop-lloyds.jpg', category: 'Mortgage' },
  { name: 'Current accounts', description: "From everyday banking to bank accounts with added rewards, find what's right for you.", image_url: 'https://www.lloydsbank.com/assets/homepage/homepage-new/lds-current-accounts-homepage-desktop-vertical.jpg', category: 'Checking' },
  { name: 'Investments', description: "Whether you're an experienced investor or just starting out, we have an investment product for you.", image_url: 'https://www.lloydsbank.com/assets/investing/tye/wheatfield-767x384.jpg', category: 'Investment' },
  { name: 'Personal loans', description: 'For big ideas or smaller plans, see how much you could borrow before you apply. The amount and rate depend on your circumstances.', image_url: 'https://www.lloydsbank.com/assets/homepage/homepage-new/personal-loan-desktop-lloyds.jpg', category: 'Personal Loan' },
  { name: 'Credit cards', description: "Check your eligibility before you apply. It takes about 5 minutes and won't affect your credit score.", image_url: 'https://www.lloydsbank.com/assets/homepage/homepage-new/credit-card-desktop-lloyds.jpg', category: 'Credit Card' },
  { name: 'Home insurance', description: 'Straightforward home insurance with monthly payment at no extra fee, a 24/7 emergency claims line, and rebuild costs handled for you.', image_url: 'https://www.lloydsbank.com/assets/homepage/homepage-new/home-ins-hp-carousel-desktop.jpg', category: 'Insurance' },
  { name: 'Car finance', description: 'Ready to upgrade your wheels? Discover car finance options to get you on the road.', image_url: 'https://www.lloydsbank.com/assets/homepage/homepage-new/lloyds-car-finance-carousel-desktop.jpg', category: 'Auto Loan' },
];

// Brand palette from BuildWidgetRequest. getThemedCardBg() darkens palette[0]
// to luminance <= 0.12 so white text has WCAG AA contrast on the content panel.
const PALETTE = ['#11b67a'];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

// Brand accent for the category chip and CTA — uses the raw palette color.
const ACCENT = PALETTE[0] || '#11b67a';
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_DATA[1];
    } else {
      // Detail concept — structuredContent IS the item (flat), not a wrapper key.
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    item = SAMPLE_DATA[1];
  }

  block.textContent = '';
  renderDetail(block, item, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderDetail(block, item, bridge) {
  item = item || {};
  const card = document.createElement('div');
  card.className = 'detail-card';

  // Left image panel
  const imageWrap = document.createElement('div');
  imageWrap.className = 'detail-image';
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imageWrap.appendChild(img);
  } else {
    imageWrap.appendChild(colorDiv());
  }
  card.appendChild(imageWrap);

  // Right content panel — palette-derived background.
  const content = document.createElement('div');
  content.className = 'detail-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  if (item.category) {
    const chip = document.createElement('span');
    chip.className = 'detail-category';
    chip.textContent = item.category;
    chip.style.background = ACCENT;
    content.appendChild(chip);
  }

  const title = document.createElement('h3');
  title.className = 'detail-name';
  title.textContent = item.name || '';
  content.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = item.description || '';
  content.appendChild(desc);

  const btn = document.createElement('button');
  btn.className = 'detail-cta';
  btn.type = 'button';
  btn.textContent = 'Learn More';
  if (bridge) {
    btn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about ${item.name || 'this product'}`);
    });
  }
  content.appendChild(btn);

  card.appendChild(content);
  block.appendChild(card);
}
