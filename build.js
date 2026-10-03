// Збирач сайту AutoProBazar Praha.
// Бере анкети авто з папки cars/ і шаблони з папки templates/,
// складає з них готовий сайт у папку _site/. Netlify запускає це сам.
// Сторонніх бібліотек не потрібно — лише Node.js.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, '_site');
const SITE_URL = 'https://autoprobazar-praha.cz';
const OLD_HOST = 'autoprobazar-praha.github.io';
const NEW_HOST = 'autoprobazar-praha.cz';

// Що НЕ копіювати як є (бо це службові файли або старі сторінки)
const SKIP = new Set([
  '_site', 'cars', 'templates', 'admin', 'node_modules', '.git', '.github',
  'build.js', 'netlify.toml', 'package.json', 'README.md', '.gitignore',
  'index.html', 'katalog.html', 'sitemap.xml'
]);
const isOldCarPage = (name) => /^auto-\d+\.html$/.test(name);

const FUEL = {
  diesel: { cz: 'Diesel', ua: 'Дизель' },
  benzin: { cz: 'Benzín', ua: 'Бензин' },
  hybrid: { cz: 'Hybrid', ua: 'Гібрид' },
  elektro: { cz: 'Elektro', ua: 'Електро' },
  lpg: { cz: 'LPG', ua: 'ГБО (LPG)' },
  cng: { cz: 'CNG', ua: 'Метан (CNG)' }
};

// ---------- допоміжні функції ----------
const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// 207000 -> "207 000"
const num = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// двомовний текст -> <span data-ua=".." data-cz="..">..</span>
// якщо українського тексту немає, показуємо чеський
const bi = (o) => {
  const cz = (o && o.cz) || '';
  const ua = (o && o.ua) || cz;
  return `<span data-ua="${esc(ua)}" data-cz="${esc(cz)}">${esc(cz)}</span>`;
};
const list = (arr) => (Array.isArray(arr) ? arr : []).filter((x) => x && (x.cz || x.ua));

const fill = (tpl, vars) => tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => {
  if (!(k in vars)) throw new Error(`У шаблоні є невідоме місце {{${k}}}`);
  return vars[k];
});

const photoSrc = (p) => (typeof p === 'string' ? p : p.src).replace(/^\//, '');
const sizeAttrs = (p) => (p.width && p.height ? ` width="${p.width}" height="${p.height}"` : '');

// ---------- читаємо анкети ----------
function loadCars() {
  const dir = path.join(ROOT, 'cars');
  const cars = [];
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const car = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (car.hidden) continue;
    car.slug = file.replace(/\.json$/, '');
    car.photos = (car.photos || []).map((p) => (typeof p === 'string' ? { src: p } : p)).filter((p) => p.src);
    if (!car.photos.length) throw new Error(`В анкеті ${file} немає жодного фото`);
    car.name = [car.make, car.model, car.variant].filter(Boolean).join(' ');
    car.fuelText = FUEL[car.fuel] || { cz: car.fuel || '', ua: car.fuel || '' };
    cars.push(car);
  }
  // найновіші — першими
  cars.sort((a, b) => String(b.added || '').localeCompare(String(a.added || '')) || a.slug.localeCompare(b.slug, 'cs', { numeric: true }));
  return cars;
}

// ---------- сторінка авто ----------
function carPage(tpl, car) {
  const hp = Math.round(car.power_kw * 1.36);
  const autoDesc = `${car.name} ${car.year}, ${num(car.mileage)} km, ${car.fuelText.cz.toLowerCase()}. Prověřené vozidlo v Praze od AutoProBazar Praha.`;
  const thumbs = car.photos.map((p, i) =>
    `<img loading="lazy" alt="${esc(p.alt || `${car.name} — фото ${i + 1}`)}" src="${esc(photoSrc(p))}"${sizeAttrs(p)} class="${i === 0 ? 'active' : ''}" onclick="setMainPhoto(${i}, this)">`
  ).join('');
  const group = (title, items, cls) => items.length
    ? `<div class="feature-group reveal${cls}"><h3>${bi(title)}</h3><div class="feature-tags">${items.map((f) => `<div class="feature-tag">${bi(f)}</div>`).join('')}</div></div>`
    : '';
  const first = car.photos[0];
  return fill(tpl, {
    TITLE: esc(car.name),
    META_DESC: esc(car.meta_description || autoDesc),
    PAGE_URL: `${SITE_URL}/${car.slug}.html`,
    MAIN_PHOTO: `<img id="mainPhoto" src="${esc(photoSrc(first))}"${sizeAttrs(first)} alt="${esc(car.name)}">`,
    PHOTO_COUNT: String(car.photos.length),
    THUMBS: thumbs,
    MAKE: esc(car.make),
    MODEL: esc(car.model),
    VARIANT: esc(car.variant || ''),
    PRICE: num(car.price),
    Q_YEAR: bi({ cz: String(car.year), ua: String(car.year) }),
    Q_MILEAGE: bi({ cz: `${num(car.mileage)} km`, ua: `${num(car.mileage)} км` }),
    Q_FUEL: bi(car.fuelText),
    Q_TRANS: bi(car.transmission),
    Q_POWER: bi({ cz: `${car.power_kw} kW (${hp} k)`, ua: `${car.power_kw} кВт (${hp} к.с.)` }),
    BODY: bi(car.body),
    ENGINE: esc(car.engine || ''),
    DESCRIPTION: bi(car.description),
    FEATURES:
      group({ cz: 'Komfort', ua: 'Комфорт' }, list(car.comfort), '') +
      group({ cz: 'Bezpečnost', ua: 'Безпека' }, list(car.safety), ' reveal-delay-2'),
    SPECS: (car.specs || []).filter((r) => r && r.label && r.value)
      .map((r) => `<div class="specs-row"><dt>${bi(r.label)}</dt><dd>${bi(r.value)}</dd></div>`).join(''),
    CONDITION: list(car.condition).map((c) => `<div class="condition-item">${bi(c)}</div>`).join(''),
    PHOTOS_JSON: JSON.stringify(car.photos.map(photoSrc)).replace(/</g, '\\u003c')
  });
}

// ---------- картки для каталогу ----------
function catalogCards(cars) {
  return cars.map((car, i) => {
    const p = car.photos[0];
    return `    <div class="car-card reveal reveal-delay-${(i % 3) + 1}">
      <a href="${car.slug}.html" class="car-link">
        <div class="car-img"><img loading="lazy" src="${esc(photoSrc(p))}"${sizeAttrs(p)} alt="${esc(`${car.make} ${car.model}`)}"></div>
        <div class="car-info">
          <div class="car-make">${esc(car.make)}</div>
          <div class="car-model">${esc(car.model)}</div>
          <div class="car-specs">${bi({
            cz: `${car.year} · ${num(car.mileage)} km · ${car.fuelText.cz}`,
            ua: `${car.year} · ${num(car.mileage)} км · ${car.fuelText.ua}`
          }).replace('<span ', '<span class="car-spec" ')}</div>
          <div class="car-price-row"><div class="car-price">${num(car.price)} Kč</div><span class="car-more-arrow">&#8594;</span></div>
        </div>
      </a>
    </div>`;
  }).join('\n');
}

// ---------- слайдер на головній (до 8 найновіших) ----------
function indexSlides(cars) {
  const ids = ['carCardOne', 'carCardTwo', 'carCardThree', 'carCardFour'];
  const cls = (i) => (i < 2 ? 'car-card' : i < 6 ? `car-card reveal reveal-delay-${i + 1}` : 'car-card reveal');
  return cars.slice(0, 8).map((car, i) => {
    const p = car.photos[0];
    return `      <div class="${cls(i)}"${ids[i] ? ` id="${ids[i]}"` : ''}>
        <a href="${car.slug}.html" class="car-link">
        <div class="car-img">
          <img loading="lazy" src="${esc(photoSrc(p))}"${sizeAttrs(p)} alt="${esc(`${car.make} ${car.model}`)}">
        </div>
        <div class="car-info">
          <div class="car-make">${esc(car.make)}</div>
          <div class="car-model">${esc(car.model)}</div>
          <div class="car-specs">
            <span class="car-spec">${car.year}</span>
            <span class="car-spec">${num(car.mileage)} km</span>
            ${bi(car.fuelText).replace('<span ', '<span class="car-spec" ')}
          </div>
          <div class="car-price-row"><div class="car-price">${num(car.price)}<span>Kč</span></div><span class="car-more-arrow">&#8594;</span></div>
        </div>
        </a>
      </div>`;
  }).join('\n');
}

// ---------- карта сайту для Google ----------
function sitemap(cars) {
  const today = new Date().toISOString().slice(0, 10);
  const pages = ['', 'katalog.html', ...cars.map((c) => `${c.slug}.html`),
    'ochrana-osobnich-udaju.html', 'cookies.html', 'obchodni-podminky.html'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((p) => `  <url><loc>${SITE_URL}/${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`;
}

// ---------- збирання ----------
function write(rel, content) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  // стара адреса github.io всюди замінюється на новий домен
  fs.writeFileSync(file, content.split(OLD_HOST).join(NEW_HOST));
}

function copyStatic(fromDir, rel = '') {
  for (const name of fs.readdirSync(fromDir)) {
    if (!rel && (SKIP.has(name) || isOldCarPage(name) || name.startsWith('.'))) continue;
    const src = path.join(fromDir, name);
    const dst = path.join(rel, name);
    if (fs.statSync(src).isDirectory()) { copyStatic(src, dst); continue; }
    if (/\.(html|txt|js|xml)$/.test(name)) write(dst, fs.readFileSync(src, 'utf8'));
    else { fs.mkdirSync(path.dirname(path.join(OUT, dst)), { recursive: true }); fs.copyFileSync(src, path.join(OUT, dst)); }
  }
}

const tpl = (name) => fs.readFileSync(path.join(ROOT, 'templates', name), 'utf8');

fs.rmSync(OUT, { recursive: true, force: true });
copyStatic(ROOT);
if (fs.existsSync(path.join(ROOT, 'admin'))) copyStatic(path.join(ROOT, 'admin'), 'admin');

const cars = loadCars();
const carTpl = tpl('auto.html');
for (const car of cars) write(`${car.slug}.html`, carPage(carTpl, car));
write('katalog.html', fill(tpl('katalog.html'), { CAR_CARDS: catalogCards(cars) }));
write('index.html', fill(tpl('index.html'), { CAR_SLIDES: indexSlides(cars) }));
write('sitemap.xml', sitemap(cars));

console.log(`Готово: ${cars.length} авто, сайт зібрано в папку _site`);
