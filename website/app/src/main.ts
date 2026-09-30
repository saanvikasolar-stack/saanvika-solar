import './styles.css';

/* ============================================================
   SAANVIKA SOLAR – CALCULATOR SETTINGS
   Update these numbers when prices or rules change.
   ============================================================ */
type CustomerType = 'home' | 'business';
type Tech = 'perc' | 'topcon';
type Unit = 'sqft' | 'sqyd';

interface CustomerConfig {
    ratePerUnit: number;
    fixedCharges: number;
    billMin: number;
    billMax: number;
    billDefault: number;
    chips: number[];
}

interface PanelConfig {
    label: string;
    watts: number[];
    defaultWatts: number;
}

const CONFIG = {
    whatsappNumber: '918519833679',
    phoneNumber: '+918519833679',

    // Complete system price range in rupees, by system size in kW: [lowest, highest].
    // Low end = Mono PERC with value brands. High end = TOPCon with premium brands.
    // Sizes in between follow a straight line between the nearest two sizes.
    priceRange: {
        2: [175000, 185000],
        3: [200000, 220000],
        5: [280000, 310000],
        10: [450000, 500000]
    } as Record<number, [number, number]>,
    elevatedPerKw: 3000,
    minKw: 2,

    panels: {
        perc: { label: 'Mono PERC', watts: [540, 545, 550], defaultWatts: 545 },
        topcon: { label: 'TOPCon', watts: [580, 590, 600], defaultWatts: 590 }
    } as Record<Tech, PanelConfig>,
    sqftPerPanel: 50,

    unitsPerKwPerMonth: 120,
    yearlyTariffRise: 0.03,
    yearlyPanelLoss: 0.005,
    co2KgPerUnit: 0.716,
    co2KgPerTreePerYear: 21,

    // PM Surya Ghar (homes only): Rs 30,000/kW for the first 2 kW, Rs 18,000 for the 3rd kW, max Rs 78,000
    subsidy: { perKwFirstTwo: 30000, thirdKw: 18000, max: 78000 },

    customers: {
        home: {
            ratePerUnit: 7.5, fixedCharges: 100,
            billMin: 500, billMax: 25000, billDefault: 3000, chips: [1500, 3000, 5000, 10000]
        },
        business: {
            ratePerUnit: 10, fixedCharges: 500,
            billMin: 5000, billMax: 1000000, billDefault: 50000, chips: [20000, 50000, 100000, 300000]
        }
    } as Record<CustomerType, CustomerConfig>,

    roofMinSqft: 100,
    roofMaxSqft: 30000,
    roofDefaultSqft: 1000
};
/* ============================================================ */

const SQYD = 9;
const CIRC = 326.73;

interface State {
    type: CustomerType;
    bill: number;
    roofSqft: number;
    unit: Unit;
    tech: Tech;
    watts: number;
    elevated: boolean;
    rate: number;
}

const state: State = {
    type: 'home',
    bill: CONFIG.customers.home.billDefault,
    roofSqft: CONFIG.roofDefaultSqft,
    unit: 'sqft',
    tech: 'perc',
    watts: CONFIG.panels.perc.defaultWatts,
    elevated: false,
    rate: CONFIG.customers.home.ratePerUnit
};

function el<T extends HTMLElement = HTMLElement>(id: string): T {
    const node = document.getElementById(id);
    if (!node) {
        throw new Error('Missing element #' + id);
    }
    return node as T;
}

function all<T extends HTMLElement = HTMLElement>(selector: string): T[] {
    return Array.from(document.querySelectorAll<T>(selector));
}

const fmtNum = (n: number): string => Math.round(n).toLocaleString('en-IN');
const inr = (n: number): string => '₹' + fmtNum(n);

function money(n: number): string {
    if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' crore';
    if (n >= 1e5) return '₹' + (n / 1e5).toFixed(n >= 1e6 ? 1 : 2) + ' lakh';
    return inr(n);
}

function moneyRange(lo: number, hi: number): string {
    if (Math.round(lo / 1000) === Math.round(hi / 1000)) return money(lo);
    if (lo >= 1e7) return '₹' + (lo / 1e7).toFixed(2) + ' – ' + (hi / 1e7).toFixed(2) + ' crore';
    if (lo >= 1e5) {
        const d = hi >= 1e6 ? 1 : 2;
        return '₹' + (lo / 1e5).toFixed(d) + ' – ' + (hi / 1e5).toFixed(d) + ' lakh';
    }
    return inr(lo) + ' – ' + fmtNum(hi);
}

const parseNum = (s: string): number => Number(String(s).replace(/[^\d.]/g, '')) || 0;
const round1000 = (n: number): number => Math.round(n / 1000) * 1000;

// Log-scale sliders so small and large values are both easy to pick
function toSlider(v: number, min: number, max: number): number {
    const c = Math.min(Math.max(v, min), max);
    return Math.round(1000 * Math.log(c / min) / Math.log(max / min));
}
const fromSlider = (t: number, min: number, max: number): number => min * Math.pow(max / min, t / 1000);

function niceRound(v: number): number {
    const step = v < 2000 ? 50 : v < 10000 ? 100 : v < 100000 ? 500 : v < 1000000 ? 1000 : 5000;
    return Math.round(v / step) * step;
}

function setFill(range: HTMLInputElement): void {
    range.style.setProperty('--p', (Number(range.value) / Number(range.max) * 100) + '%');
}

// Price range for a system of `kw`, worked out from the sizes in CONFIG.priceRange
function priceRangeFor(kw: number): [number, number] {
    const sizes = Object.keys(CONFIG.priceRange).map(Number).sort((a, b) => a - b);
    if (sizes.length === 1) {
        const only = CONFIG.priceRange[sizes[0]];
        return [only[0] / sizes[0] * kw, only[1] / sizes[0] * kw];
    }
    let a = sizes[0];
    let b = sizes[1];
    for (let i = 0; i < sizes.length - 1; i++) {
        if (kw >= sizes[i]) {
            a = sizes[i];
            b = sizes[i + 1];
        }
    }
    const pa = CONFIG.priceRange[a];
    const pb = CONFIG.priceRange[b];
    const t = (kw - a) / (b - a);
    return [Math.max(0, pa[0] + (pb[0] - pa[0]) * t), Math.max(0, pa[1] + (pb[1] - pa[1]) * t)];
}

function subsidyFor(kw: number): number {
    if (state.type !== 'home' || kw <= 0) return 0;
    const s = CONFIG.subsidy;
    const amount = Math.min(kw, 2) * s.perKwFirstTwo + Math.max(0, Math.min(kw - 2, 1)) * s.thirdKw;
    return Math.min(amount, s.max);
}

interface Result {
    units: number;
    neededKw: number;
    roofPanels: number;
    roofMaxKw: number;
    kw: number;
    panels: number;
    dcKw: number;
    monthlyGen: number;
    coverage: number;
    billAfter: number;
    priceLo: number;
    priceHi: number;
    subsidy: number;
    netLo: number;
    netHi: number;
    yearlySaving: number;
    life: number;
    usedSqft: number;
    co2Kg: number;
}

function calculate(): Result {
    const cfg = CONFIG.customers[state.type];
    const units = Math.max(0, state.bill - cfg.fixedCharges) / state.rate;
    const neededKw = units > 0 ? Math.max(CONFIG.minKw, Math.round(units / CONFIG.unitsPerKwPerMonth)) : 0;
    const roofPanels = Math.floor(state.roofSqft / CONFIG.sqftPerPanel);
    const roofMaxKw = Math.floor(roofPanels * state.watts / 1000);
    const kw = roofMaxKw >= CONFIG.minKw ? Math.min(neededKw, roofMaxKw) : 0;
    const panels = kw > 0 ? Math.ceil(kw * 1000 / state.watts) : 0;
    const dcKw = panels * state.watts / 1000;
    const monthlyGen = dcKw * CONFIG.unitsPerKwPerMonth;
    const coverage = units > 0 ? Math.min(1, monthlyGen / units) : 0;
    const monthlySaving = Math.min(monthlyGen, units) * state.rate;
    const billAfter = Math.min(state.bill, Math.max(cfg.fixedCharges, state.bill - monthlySaving));

    const full = priceRangeFor(kw);
    const mid = (full[0] + full[1]) / 2;
    const range: [number, number] = state.tech === 'perc' ? [full[0], mid] : [mid, full[1]];
    const extra = state.elevated ? CONFIG.elevatedPerKw * kw : 0;
    const priceLo = kw > 0 ? round1000(range[0] + extra) : 0;
    const priceHi = kw > 0 ? round1000(range[1] + extra) : 0;
    const subsidy = subsidyFor(kw);
    const netLo = Math.max(0, priceLo - subsidy);
    const netHi = Math.max(0, priceHi - subsidy);

    const yearlySaving = (state.bill - billAfter) * 12;
    let life = 0;
    for (let y = 0; y < 25; y++) {
        const gen = monthlyGen * Math.pow(1 - CONFIG.yearlyPanelLoss, y);
        life += Math.min(gen, units) * 12 * state.rate * Math.pow(1 + CONFIG.yearlyTariffRise, y);
    }

    return {
        units, neededKw, roofPanels, roofMaxKw, kw, panels, dcKw, monthlyGen, coverage, billAfter,
        priceLo, priceHi, subsidy, netLo, netHi, yearlySaving, life,
        usedSqft: panels * CONFIG.sqftPerPanel,
        co2Kg: monthlyGen * 12 * CONFIG.co2KgPerUnit
    };
}

const areaText = (sqft: number): string =>
    state.unit === 'sqft' ? fmtNum(sqft) + ' sq ft' : fmtNum(sqft / SQYD) + ' sq yd';
const techLabel = (): string => CONFIG.panels[state.tech].label;

function drawRoof(r: Result): void {
    let slots = Math.max(1, r.roofPanels);
    let filled = r.panels;
    let perTile = 1;
    const maxTiles = 72;
    if (slots > maxTiles) {
        perTile = Math.ceil(slots / maxTiles);
        slots = Math.ceil(slots / perTile);
        filled = Math.ceil(filled / perTile);
    }
    filled = Math.min(filled, slots);

    const W = 320;
    const H = 160;
    const pad = 12;
    const gap = 4;
    const cols = Math.max(1, Math.min(slots, Math.round(Math.sqrt(slots * 2.1))));
    const rows = Math.ceil(slots / cols);
    const cw = (W - pad * 2 - gap * (cols - 1)) / cols;
    const ch = Math.min(cw * 0.62, (H - pad * 2 - gap * (rows - 1)) / rows);
    const top = (H - (rows * ch + (rows - 1) * gap)) / 2;

    let out = '<defs>' +
        '<linearGradient id="pv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1A8FD6"/><stop offset=".55" stop-color="#0C5F93"/><stop offset="1" stop-color="#122E3E"/></linearGradient>' +
        '<pattern id="cells" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M6 0H0V6" fill="none" stroke="rgba(255,255,255,.22)" stroke-width=".7"/></pattern>' +
        '</defs>' +
        '<rect x="2" y="2" width="' + (W - 4) + '" height="' + (H - 4) + '" rx="12" fill="#E6DCCD" stroke="#CDBFAB" stroke-width="3"/>';
    for (let i = 0; i < slots; i++) {
        const x = pad + (i % cols) * (cw + gap);
        const y = top + Math.floor(i / cols) * (ch + gap);
        if (i < filled) {
            const attrs = 'x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" width="' + cw.toFixed(2) + '" height="' + ch.toFixed(2) + '" rx="2.5"';
            out += '<rect ' + attrs + ' fill="url(#pv)"/><rect ' + attrs + ' fill="url(#cells)"/>';
        } else {
            out += '<rect x="' + (x + 0.75).toFixed(2) + '" y="' + (y + 0.75).toFixed(2) + '" width="' + (cw - 1.5).toFixed(2) +
                '" height="' + (ch - 1.5).toFixed(2) + '" rx="2.5" fill="#FBF8F3" stroke="#C8BBA8" stroke-width="1.2" stroke-dasharray="3 3"/>';
        }
    }
    el('roofSvg').innerHTML = out;
    el('roofCaption').textContent = perTile > 1
        ? '1 tile ≈ ' + perTile + ' panels'
        : r.panels + ' of ' + r.roofPanels + ' panel spaces used';
}

function render(): void {
    const r = calculate();
    const has = r.kw > 0;
    const isHome = state.type === 'home';

    el('kw').innerHTML = r.kw + '<small>kW</small>';
    el('cov').textContent = has ? Math.round(r.coverage * 100) + '% covered' : '';
    el('ring').style.strokeDashoffset = String(CIRC * (1 - r.coverage));

    if (has) {
        el('headline').textContent = r.kw + ' kW rooftop solar';
        el('subline').textContent = r.panels + ' × ' + state.watts + ' W ' + techLabel() + ' panels (' + r.dcKw.toFixed(2) +
            ' kWp) · about ' + fmtNum(r.monthlyGen) + ' units a month · uses ~' + areaText(r.usedSqft) + ' of your ' + areaText(state.roofSqft);
    } else if (r.units <= 0) {
        el('headline').textContent = 'Enter your monthly bill';
        el('subline').textContent = 'Type your average electricity bill to see your solar plan.';
    } else {
        el('headline').textContent = 'Let’s look at your roof together';
        el('subline').textContent = 'About ' + areaText(Math.ceil(CONFIG.minKw * 1000 / state.watts) * CONFIG.sqftPerPanel) + ' of shadow-free area is needed for ' + CONFIG.minKw + ' kW.';
    }

    const note = el('note');
    if (r.units > 0 && r.kw === 0) {
        note.textContent = 'This area is a little small for a standard system. An elevated structure or a free site survey can often find more usable space.';
        note.hidden = false;
    } else if (has && r.roofMaxKw < r.neededKw) {
        note.textContent = 'Your usage needs about ' + r.neededKw + ' kW, but this roof area fits ' + r.roofMaxKw + ' kW. An elevated structure can help use more of your terrace.';
        note.hidden = false;
    } else {
        note.hidden = true;
    }

    const max = Math.max(state.bill, 1);
    el('barBefore').style.width = '100%';
    el('barAfter').style.width = Math.max(3, r.billAfter / max * 100) + '%';
    el('billBefore').textContent = inr(state.bill);
    el('billAfter').textContent = inr(r.billAfter);
    el('monthlySave').textContent = inr(state.bill - r.billAfter);

    // Homes see prices; commercial and industrial systems are quoted after a site survey
    el('paybackTile').hidden = !isHome;
    el('netTile').hidden = !isHome;
    el('subsidyTile').classList.toggle('wide', !isHome);
    if (isHome) {
        el('cost').textContent = has ? moneyRange(r.priceLo, r.priceHi) : '—';
        el('priceNote').textContent = techLabel() + ' · depends on panel brand' +
            (state.elevated ? ' · includes elevated structure (₹' + fmtNum(CONFIG.elevatedPerKw) + '/kW)' : '');
        el('subsidyLabel').textContent = 'PM Surya Ghar subsidy';
        el('subsidy').textContent = r.subsidy ? '− ' + money(r.subsidy) : '—';
        el('net').textContent = has ? moneyRange(r.netLo, r.netHi) : '—';
        if (has && r.yearlySaving > 0) {
            const p1 = (r.netLo / r.yearlySaving).toFixed(1);
            const p2 = (r.netHi / r.yearlySaving).toFixed(1);
            el('payback').textContent = p1 === p2 ? p1 + ' years' : p1 + ' – ' + p2 + ' yrs';
        } else {
            el('payback').textContent = '—';
        }
    } else {
        el('cost').textContent = 'Custom quote';
        el('priceNote').textContent = techLabel() + ' · priced after a free site survey';
        el('subsidyLabel').textContent = 'Tax benefit';
        el('subsidy').textContent = 'Ask us';
    }
    el('life').textContent = has ? money(r.life) : '—';
    el('green').textContent = has
        ? (r.co2Kg / 1000).toFixed(1) + ' t CO₂ ≈ ' + fmtNum(r.co2Kg / CONFIG.co2KgPerTreePerYear) + ' trees'
        : '—';

    el('segNote').innerHTML = isHome
        ? 'Homes get the <b>PM Surya Ghar subsidy – up to ₹78,000</b>. We handle the full application.'
        : 'Shops, schools, offices and factories. Bigger systems, faster payback.';
    el('elevNote').textContent = 'Raised panels keep your terrace usable underneath' +
        (isHome ? ' · +₹' + fmtNum(CONFIG.elevatedPerKw) + ' per kW' : '');

    const lines = [
        'Hi Saanvika Solar, I used your solar calculator.',
        'Type: ' + (isHome ? 'Home' : 'Business'),
        'Monthly bill: ' + inr(state.bill),
        'Roof area: ' + areaText(state.roofSqft) + (state.elevated ? ' (elevated structure)' : ''),
        has ? 'Suggested system: ' + r.kw + ' kW, ' + r.panels + ' x ' + state.watts + ' W ' + techLabel() + ' panels' : 'Suggested system: needs a site survey',
        has && isHome ? 'Estimated price: ' + moneyRange(r.priceLo, r.priceHi) : '',
        'Please share a quote and book a free site survey.'
    ].filter((line) => line !== '');
    el<HTMLAnchorElement>('waBtn').href = 'https://wa.me/' + CONFIG.whatsappNumber + '?text=' + encodeURIComponent(lines.join('\n'));
    el<HTMLAnchorElement>('callBtn').href = 'tel:' + CONFIG.phoneNumber;

    el('disclaimer').textContent = 'Estimate only. ' +
        (isHome ? 'Price depends on panel brand, type and wattage. ' : 'Commercial and industrial prices are quoted after a site survey. ') +
        'Assumes about ' + CONFIG.unitsPerKwPerMonth + ' units per kW per month, ₹' + state.rate + '/unit and ' +
        Math.round(CONFIG.yearlyTariffRise * 100) + '% yearly tariff rise. Final system size, price and subsidy are confirmed after a free site survey, DISCOM approval and current PM Surya Ghar rules.';

    drawRoof(r);
}

function syncBill(): void {
    const cfg = CONFIG.customers[state.type];
    el<HTMLInputElement>('billNum').value = fmtNum(state.bill);
    const range = el<HTMLInputElement>('billRange');
    range.value = String(toSlider(state.bill, cfg.billMin, cfg.billMax));
    setFill(range);
}

function syncRoof(): void {
    el<HTMLInputElement>('roofNum').value = fmtNum(state.unit === 'sqft' ? state.roofSqft : state.roofSqft / SQYD);
    el('roofUnit').textContent = state.unit === 'sqft' ? 'sq ft' : 'sq yd';
    const range = el<HTMLInputElement>('roofRange');
    range.value = String(toSlider(state.roofSqft, CONFIG.roofMinSqft, CONFIG.roofMaxSqft));
    setFill(range);
}

function buildChips(): void {
    const box = el('billChips');
    box.innerHTML = '';
    CONFIG.customers[state.type].chips.forEach((v) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip';
        b.textContent = money(v);
        b.addEventListener('click', () => {
            state.bill = v;
            syncBill();
            render();
        });
        box.appendChild(b);
    });
}

function buildWatts(): void {
    const sel = el<HTMLSelectElement>('watts');
    sel.innerHTML = '';
    CONFIG.panels[state.tech].watts.forEach((w) => {
        const o = document.createElement('option');
        o.value = String(w);
        o.textContent = w + ' W';
        o.selected = w === state.watts;
        sel.appendChild(o);
    });
}

function press(selector: string, active: HTMLElement): void {
    all(selector).forEach((b) => b.setAttribute('aria-pressed', String(b === active)));
}

function bindCalculator(): void {
    all<HTMLButtonElement>('.seg-type button').forEach((btn) => {
        btn.addEventListener('click', () => {
            const next = btn.dataset.type as CustomerType;
            if (state.type === next) return;
            state.type = next;
            press('.seg-type button', btn);
            const cfg = CONFIG.customers[state.type];
            state.bill = cfg.billDefault;
            state.rate = cfg.ratePerUnit;
            if (state.type === 'business' && state.roofSqft < 3000) state.roofSqft = 5000;
            el<HTMLInputElement>('rate').value = String(state.rate);
            buildChips();
            syncBill();
            syncRoof();
            render();
        });
    });

    all<HTMLButtonElement>('.seg-panel button').forEach((btn) => {
        btn.addEventListener('click', () => {
            const next = btn.dataset.tech as Tech;
            if (state.tech === next) return;
            state.tech = next;
            state.watts = CONFIG.panels[next].defaultWatts;
            press('.seg-panel button', btn);
            buildWatts();
            render();
        });
    });

    el<HTMLSelectElement>('watts').addEventListener('change', (e) => {
        state.watts = Number((e.target as HTMLSelectElement).value);
        render();
    });

    all<HTMLButtonElement>('.unit-toggle button').forEach((btn) => {
        btn.addEventListener('click', () => {
            state.unit = btn.dataset.unit as Unit;
            press('.unit-toggle button', btn);
            syncRoof();
            render();
        });
    });

    const billRange = el<HTMLInputElement>('billRange');
    billRange.addEventListener('input', () => {
        const cfg = CONFIG.customers[state.type];
        state.bill = niceRound(fromSlider(Number(billRange.value), cfg.billMin, cfg.billMax));
        el<HTMLInputElement>('billNum').value = fmtNum(state.bill);
        setFill(billRange);
        render();
    });

    const billNum = el<HTMLInputElement>('billNum');
    billNum.addEventListener('input', () => {
        const cfg = CONFIG.customers[state.type];
        state.bill = parseNum(billNum.value);
        billRange.value = String(toSlider(Math.max(state.bill, cfg.billMin), cfg.billMin, cfg.billMax));
        setFill(billRange);
        render();
    });
    billNum.addEventListener('blur', () => {
        if (state.bill > 0) syncBill();
    });

    const roofRange = el<HTMLInputElement>('roofRange');
    roofRange.addEventListener('input', () => {
        state.roofSqft = niceRound(fromSlider(Number(roofRange.value), CONFIG.roofMinSqft, CONFIG.roofMaxSqft));
        el<HTMLInputElement>('roofNum').value = fmtNum(state.unit === 'sqft' ? state.roofSqft : state.roofSqft / SQYD);
        setFill(roofRange);
        render();
    });

    const roofNum = el<HTMLInputElement>('roofNum');
    roofNum.addEventListener('input', () => {
        const v = parseNum(roofNum.value);
        state.roofSqft = state.unit === 'sqft' ? v : v * SQYD;
        roofRange.value = String(toSlider(Math.max(state.roofSqft, CONFIG.roofMinSqft), CONFIG.roofMinSqft, CONFIG.roofMaxSqft));
        setFill(roofRange);
        render();
    });
    roofNum.addEventListener('blur', () => {
        if (state.roofSqft > 0) syncRoof();
    });

    el<HTMLInputElement>('elevated').addEventListener('change', (e) => {
        state.elevated = (e.target as HTMLInputElement).checked;
        render();
    });

    el<HTMLInputElement>('rate').addEventListener('input', (e) => {
        const v = parseFloat((e.target as HTMLInputElement).value);
        if (v > 0) {
            state.rate = v;
            render();
        }
    });
}

/* ---------- App shell: install, share, offline ---------- */

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
    const nav = navigator as Navigator & { standalone?: boolean };
    return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

function readFlag(key: string): boolean {
    try {
        return window.localStorage.getItem(key) === '1';
    } catch {
        return false;
    }
}

function writeFlag(key: string): void {
    try {
        window.localStorage.setItem(key, '1');
    } catch {
        // storage blocked; the hint simply shows again next time
    }
}

function bindAppShell(): void {
    const installBtn = el<HTMLButtonElement>('installBtn');
    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e as BeforeInstallPromptEvent;
        installBtn.hidden = false;
    });
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        installBtn.hidden = true;
    });
    window.addEventListener('appinstalled', () => {
        installBtn.hidden = true;
    });

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const hint = el('iosHint');
    if (isIos && !isStandalone() && !readFlag('saanvika-ios-hint')) {
        hint.hidden = false;
    }
    el<HTMLButtonElement>('iosHintClose').addEventListener('click', () => {
        hint.hidden = true;
        writeFlag('saanvika-ios-hint');
    });

    el<HTMLButtonElement>('shareBtn').addEventListener('click', async () => {
        const url = window.location.href.split('#')[0];
        const text = 'Check your rooftop solar savings and PM Surya Ghar subsidy with Saanvika Solar';
        if (typeof navigator.share === 'function') {
            try {
                await navigator.share({ title: 'Saanvika Solar – Solar Savings Calculator', text, url });
            } catch {
                // share sheet closed
            }
            return;
        }
        window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank', 'noopener');
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(() => undefined);
        });
    }
}

bindCalculator();
bindAppShell();
el<HTMLInputElement>('rate').value = String(state.rate);
buildChips();
buildWatts();
syncBill();
syncRoof();
render();
