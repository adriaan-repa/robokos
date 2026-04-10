// ============================================
// RoboKos Price Calculator
// ============================================

(function() {
    const PRICES = {
        setup: 150,
        cablePerMeter: 1,       // laying labor
        cableMaterial: 0.8,     // cable itself
        travelPerKm: 0.8,      // round trip from Zlaté Moravce
        pavementPerMeter: 10,   // crossing hard surfaces
    };

    // Garden layout presets with SVG diagrams
    const LAYOUTS = [
        {
            id: 'simple',
            name: 'Jednoduchý obdĺžnik',
            desc: 'Rovný pozemok bez prekážok',
            cableMultiplier: 1,
            guideWireRatio: 0.3,
            obstacles: 0,
            svg: `<svg viewBox="0 0 200 140" fill="none">
                <rect x="10" y="10" width="180" height="120" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
                <text x="100" y="70" text-anchor="middle" fill="#166534" font-size="11" font-weight="600">Trávnik</text>
                <rect x="80" y="105" width="40" height="20" rx="3" fill="#16a34a"/>
                <text x="100" y="119" text-anchor="middle" fill="white" font-size="7" font-weight="600">Stanica</text>
                <line x1="100" y1="105" x2="100" y2="50" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3"/>
                <text x="110" y="78" fill="#f59e0b" font-size="7">Vodiaci</text>
                <path d="M10 10h180v120H10z" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="6 3"/>
                <text x="170" y="75" fill="#16a34a" font-size="7">Obvodový</text>
            </svg>`
        },
        {
            id: 'l-shape',
            name: 'L-tvar',
            desc: 'Záhrada v tvare L',
            cableMultiplier: 1.3,
            guideWireRatio: 0.4,
            obstacles: 0,
            svg: `<svg viewBox="0 0 200 140" fill="none">
                <path d="M10 10h120v60h60v60H10z" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
                <text x="70" y="50" text-anchor="middle" fill="#166534" font-size="11" font-weight="600">Trávnik</text>
                <rect x="50" y="110" width="40" height="15" rx="3" fill="#16a34a"/>
                <text x="70" y="121" text-anchor="middle" fill="white" font-size="7" font-weight="600">Stanica</text>
                <line x1="70" y1="110" x2="70" y2="40" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3"/>
                <line x1="130" y1="70" x2="160" y2="90" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3"/>
                <path d="M10 10h120v60h60v60H10z" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="6 3"/>
            </svg>`
        },
        {
            id: 'obstacles',
            name: 'S prekážkami',
            desc: 'Záhony, stromy, jazierko',
            cableMultiplier: 1.5,
            guideWireRatio: 0.4,
            obstacles: 3,
            svg: `<svg viewBox="0 0 200 140" fill="none">
                <rect x="10" y="10" width="180" height="120" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
                <circle cx="55" cy="45" r="15" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
                <text x="55" y="48" text-anchor="middle" fill="#92400e" font-size="7">Strom</text>
                <rect x="120" y="30" width="40" height="30" rx="4" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
                <text x="140" y="49" text-anchor="middle" fill="#92400e" font-size="7">Záhon</text>
                <ellipse cx="60" cy="100" rx="20" ry="12" fill="#bfdbfe" stroke="#3b82f6" stroke-width="1.5"/>
                <text x="60" y="103" text-anchor="middle" fill="#1e40af" font-size="7">Jazierko</text>
                <rect x="80" y="110" width="40" height="15" rx="3" fill="#16a34a"/>
                <text x="100" y="121" text-anchor="middle" fill="white" font-size="7" font-weight="600">Stanica</text>
                <path d="M10 10h180v120H10z" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="6 3"/>
            </svg>`
        },
        {
            id: 'multi-zone',
            name: 'Oddelené plochy',
            desc: 'Dve+ plochy spojené prechodom',
            cableMultiplier: 1.8,
            guideWireRatio: 0.5,
            obstacles: 0,
            svg: `<svg viewBox="0 0 200 140" fill="none">
                <rect x="10" y="10" width="80" height="120" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
                <text x="50" y="65" text-anchor="middle" fill="#166534" font-size="9" font-weight="600">Zóna 1</text>
                <rect x="110" y="10" width="80" height="120" rx="4" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
                <text x="150" y="65" text-anchor="middle" fill="#166534" font-size="9" font-weight="600">Zóna 2</text>
                <rect x="88" y="55" width="24" height="30" rx="2" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1.5"/>
                <text x="100" y="73" text-anchor="middle" fill="#6b7280" font-size="6">Chodník</text>
                <line x1="90" y1="70" x2="110" y2="70" stroke="#16a34a" stroke-width="2" stroke-dasharray="4 3"/>
                <rect x="30" y="110" width="40" height="15" rx="3" fill="#16a34a"/>
                <text x="50" y="121" text-anchor="middle" fill="white" font-size="7" font-weight="600">Stanica</text>
            </svg>`
        }
    ];

    // Slovak cities with approximate distances from Zlaté Moravce
    const CITIES = [
        { name: 'Zlaté Moravce', km: 0 },
        { name: 'Nitra', km: 30 },
        { name: 'Levice', km: 35 },
        { name: 'Topoľčany', km: 35 },
        { name: 'Tlmače / Hronský Beňadik', km: 25 },
        { name: 'Žiar nad Hronom', km: 50 },
        { name: 'Banská Bystrica', km: 90 },
        { name: 'Bratislava', km: 130 },
        { name: 'Trnava', km: 95 },
        { name: 'Trenčín', km: 110 },
        { name: 'Žilina', km: 170 },
        { name: 'Prievidza', km: 80 },
        { name: 'Martin', km: 150 },
        { name: 'Zvolen', km: 75 },
        { name: 'Poprad', km: 220 },
        { name: 'Košice', km: 280 },
        { name: 'Prešov', km: 290 },
        { name: 'Iné (zadám km)', km: -1 },
    ];

    let state = {
        step: 1,
        layout: null,
        width: 20,
        height: 15,
        obstacles: 0,
        pavementCrossings: 0,
        hasOwnCable: false,
        city: null,
        customKm: 0,
    };

    function getPerimeter() {
        return 2 * (state.width + state.height);
    }

    function getTotalCable() {
        const layout = LAYOUTS.find(l => l.id === state.layout) || LAYOUTS[0];
        const perimeter = getPerimeter();
        const obstacleCable = state.obstacles * 8;
        const baseCable = perimeter * layout.cableMultiplier + obstacleCable;
        const guideWire = perimeter * layout.guideWireRatio;
        return { boundary: Math.round(baseCable), guide: Math.round(guideWire), total: Math.round(baseCable + guideWire) };
    }

    function getDistance() {
        if (state.city && state.city.km >= 0) return state.city.km;
        return state.customKm;
    }

    function getPavementMeters() {
        return state.pavementCrossings * 2;
    }

    function calculatePrice() {
        const cable = getTotalCable();
        const distance = getDistance();
        const pavMeters = getPavementMeters();

        const setup = PRICES.setup;
        const laying = cable.total * PRICES.cablePerMeter;
        const material = state.hasOwnCable ? 0 : cable.total * PRICES.cableMaterial;
        const travel = distance * PRICES.travelPerKm;
        const pavement = pavMeters * PRICES.pavementPerMeter;

        return {
            setup, laying, material, travel, pavement,
            total: setup + laying + material + travel + pavement,
            cable,
            distance,
            pavMeters,
            hasOwnCable: state.hasOwnCable,
        };
    }

    function getSummaryText() {
        const price = calculatePrice();
        const layout = LAYOUTS.find(l => l.id === state.layout);
        const cityName = state.city ? state.city.name : '—';
        return [
            `--- KALKULÁCIA ---`,
            `Tvar: ${layout ? layout.name : '—'}`,
            `Rozmery: ${state.width} × ${state.height} m (${state.width * state.height} m²)`,
            `Prekážky: ${state.obstacles}`,
            `Prechody cez chodník: ${state.pavementCrossings}`,
            `Vlastný kábel: ${state.hasOwnCable ? 'Áno' : 'Nie'}`,
            `Lokalita: ${cityName} (${getDistance()} km)`,
            `Kábel: ${price.cable.total} m (obvodový ${price.cable.boundary} m + vodiaci ${price.cable.guide} m)`,
            `Orientačná cena: ${Math.round(price.total)} €`,
        ].join('\n');
    }

    function render() {
        const el = document.getElementById('calc-content');
        if (!el) return;

        switch(state.step) {
            case 1: renderStep1(el); break;
            case 2: renderStep2(el); break;
            case 3: renderStep3(el); break;
            case 4: renderStep4(el); break;
        }
        updateProgress();
    }

    function updateProgress() {
        document.querySelectorAll('.calc-progress-step').forEach((step, i) => {
            step.classList.toggle('active', i < state.step);
            step.classList.toggle('current', i === state.step - 1);
        });
    }

    // Step 1: Choose layout
    function renderStep1(el) {
        el.innerHTML = `
            <h3 class="calc-step-title">Aký tvar má vaša záhrada?</h3>
            <p class="calc-step-desc">Vyberte rozloženie, ktoré najviac zodpovedá vášmu pozemku.</p>
            <div class="calc-layouts">
                ${LAYOUTS.map(l => `
                    <button class="calc-layout-btn ${state.layout === l.id ? 'selected' : ''}" data-layout="${l.id}">
                        <div class="calc-layout-svg">${l.svg}</div>
                        <strong>${l.name}</strong>
                        <span>${l.desc}</span>
                    </button>
                `).join('')}
            </div>
            <div class="calc-nav">
                <div></div>
                <button class="btn btn-primary calc-next" ${!state.layout ? 'disabled' : ''}>Ďalej</button>
            </div>
        `;

        el.querySelectorAll('.calc-layout-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.layout = btn.dataset.layout;
                const layout = LAYOUTS.find(l => l.id === state.layout);
                state.obstacles = layout.obstacles;
                render();
            });
        });

        const next = el.querySelector('.calc-next');
        if (next) next.addEventListener('click', () => { state.step = 2; render(); });
    }

    // Step 2: Dimensions, obstacles & cable ownership
    function renderStep2(el) {
        const area = state.width * state.height;
        const perimeter = getPerimeter();

        el.innerHTML = `
            <h3 class="calc-step-title">Rozmery a prekážky</h3>
            <p class="calc-step-desc">Zadajte približné rozmery trávnatej plochy.</p>

            <div class="calc-form-grid">
                <div class="calc-field">
                    <label>Šírka (m)</label>
                    <input type="range" min="5" max="80" value="${state.width}" id="calc-width">
                    <div class="calc-range-value">${state.width} m</div>
                </div>
                <div class="calc-field">
                    <label>Dĺžka (m)</label>
                    <input type="range" min="5" max="100" value="${state.height}" id="calc-height">
                    <div class="calc-range-value">${state.height} m</div>
                </div>
            </div>

            <div class="calc-area-display">
                <div class="calc-area-box">
                    <span class="calc-area-num">${area.toLocaleString('sk')}</span>
                    <span class="calc-area-unit">m² plocha</span>
                </div>
                <div class="calc-area-box">
                    <span class="calc-area-num">${perimeter}</span>
                    <span class="calc-area-unit">m obvod</span>
                </div>
            </div>

            <div class="calc-form-grid">
                <div class="calc-field">
                    <label>Počet prekážok (záhony, stromy, jazierka)</label>
                    <div class="calc-stepper">
                        <button class="calc-stepper-btn" data-action="dec-obs">−</button>
                        <span id="calc-obs">${state.obstacles}</span>
                        <button class="calc-stepper-btn" data-action="inc-obs">+</button>
                    </div>
                    <p class="calc-field-hint">Okolo každej prekážky vedieme obvodový kábel (~8 m navyše).</p>
                </div>
                <div class="calc-field">
                    <label>Počet prechodov cez chodník / betón</label>
                    <div class="calc-stepper">
                        <button class="calc-stepper-btn" data-action="dec-pav">−</button>
                        <span id="calc-pav">${state.pavementCrossings}</span>
                        <button class="calc-stepper-btn" data-action="inc-pav">+</button>
                    </div>
                    <p class="calc-field-hint">Kábel prechádza chodníkom 2× (tam a späť) = ${state.pavementCrossings * 2} m á ${PRICES.pavementPerMeter} €/m.</p>
                </div>
            </div>

            <div class="calc-cable-toggle">
                <label class="calc-toggle-label">
                    <span class="calc-toggle-text">
                        <strong>Máte vlastný inštalačný kábel?</strong>
                        <span class="calc-field-hint" style="margin-top: 2px;">Ak áno, neúčtujeme materiál za kábel (úspora ${PRICES.cableMaterial} €/m).</span>
                    </span>
                    <span class="calc-switch">
                        <input type="checkbox" id="calc-own-cable" ${state.hasOwnCable ? 'checked' : ''}>
                        <span class="calc-switch-slider"></span>
                    </span>
                </label>
            </div>

            <div class="calc-nav">
                <button class="btn btn-ghost calc-back">Späť</button>
                <button class="btn btn-primary calc-next">Ďalej</button>
            </div>
        `;

        // Sliders
        const wSlider = el.querySelector('#calc-width');
        const hSlider = el.querySelector('#calc-height');
        const updateSliders = () => {
            state.width = +wSlider.value;
            state.height = +hSlider.value;
            const a = state.width * state.height;
            const p = 2 * (state.width + state.height);
            wSlider.nextElementSibling.textContent = state.width + ' m';
            hSlider.nextElementSibling.textContent = state.height + ' m';
            el.querySelector('.calc-area-num').textContent = a.toLocaleString('sk');
            el.querySelectorAll('.calc-area-num')[1].textContent = p;
        };
        wSlider.addEventListener('input', updateSliders);
        hSlider.addEventListener('input', updateSliders);

        // Steppers
        el.querySelectorAll('.calc-stepper-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'inc-obs') state.obstacles = Math.min(state.obstacles + 1, 15);
                if (action === 'dec-obs') state.obstacles = Math.max(state.obstacles - 1, 0);
                if (action === 'inc-pav') state.pavementCrossings = Math.min(state.pavementCrossings + 1, 10);
                if (action === 'dec-pav') state.pavementCrossings = Math.max(state.pavementCrossings - 1, 0);
                el.querySelector('#calc-obs').textContent = state.obstacles;
                el.querySelector('#calc-pav').textContent = state.pavementCrossings;
                const hint = el.querySelectorAll('.calc-field-hint')[1];
                if (hint) hint.textContent = `Kábel prechádza chodníkom 2× (tam a späť) = ${state.pavementCrossings * 2} m á ${PRICES.pavementPerMeter} €/m.`;
            });
        });

        // Cable toggle
        el.querySelector('#calc-own-cable').addEventListener('change', function() {
            state.hasOwnCable = this.checked;
        });

        el.querySelector('.calc-back').addEventListener('click', () => { state.step = 1; render(); });
        el.querySelector('.calc-next').addEventListener('click', () => { state.step = 3; render(); });
    }

    // Step 3: Location
    function renderStep3(el) {
        el.innerHTML = `
            <h3 class="calc-step-title">Kde sa nachádza vaša záhrada?</h3>
            <p class="calc-step-desc">Doprava sa účtuje ${PRICES.travelPerKm} €/km (spiatočne) zo Zlatých Moraviec.</p>

            <div class="calc-city-grid">
                ${CITIES.map(c => `
                    <button class="calc-city-btn ${state.city && state.city.name === c.name ? 'selected' : ''}" data-city="${c.name}" data-km="${c.km}">
                        <strong>${c.name}</strong>
                        ${c.km >= 0 ? `<span>${c.km} km</span>` : '<span>vlastná vzdialenosť</span>'}
                    </button>
                `).join('')}
            </div>

            ${state.city && state.city.km === -1 ? `
                <div class="calc-field" style="max-width: 300px; margin: 20px auto;">
                    <label>Vzdialenosť zo Zlatých Moraviec (km)</label>
                    <input type="number" id="calc-custom-km" min="0" max="500" value="${state.customKm}" class="calc-input">
                </div>
            ` : ''}

            <div class="calc-nav">
                <button class="btn btn-ghost calc-back">Späť</button>
                <button class="btn btn-primary calc-next" ${!state.city ? 'disabled' : ''}>Zobraziť cenu</button>
            </div>
        `;

        el.querySelectorAll('.calc-city-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.city = { name: btn.dataset.city, km: +btn.dataset.km };
                render();
            });
        });

        const customInput = el.querySelector('#calc-custom-km');
        if (customInput) {
            customInput.addEventListener('input', () => {
                state.customKm = +customInput.value;
            });
        }

        el.querySelector('.calc-back').addEventListener('click', () => { state.step = 2; render(); });
        el.querySelector('.calc-next').addEventListener('click', () => { state.step = 4; render(); });
    }

    // Step 4: Result
    function renderStep4(el) {
        const price = calculatePrice();
        const layout = LAYOUTS.find(l => l.id === state.layout);

        el.innerHTML = `
            <h3 class="calc-step-title">Orientačná cenová ponuka</h3>
            <p class="calc-step-desc">Na základe vašich údajov sme vypočítali približnú cenu inštalácie.</p>

            <div class="calc-result">
                <div class="calc-result-summary">
                    <div class="calc-result-total">
                        <span class="calc-result-label">Celková cena</span>
                        <span class="calc-result-price">${Math.round(price.total).toLocaleString('sk')} €</span>
                        <span class="calc-result-note">orientačná cena vrátane DPH</span>
                    </div>
                </div>

                <div class="calc-result-details">
                    <div class="calc-detail-header">
                        <div class="calc-result-layout">${layout.svg}</div>
                        <div>
                            <strong>${layout.name}</strong>
                            <span>${state.width} × ${state.height} m = ${(state.width * state.height).toLocaleString('sk')} m²</span>
                        </div>
                    </div>

                    <table class="calc-table">
                        <tr>
                            <td>Základná inštalácia (setup)</td>
                            <td>${price.setup} €</td>
                        </tr>
                        <tr>
                            <td>
                                Uloženie kábla (${price.cable.total} m × ${PRICES.cablePerMeter} €)
                                <small>Obvodový: ${price.cable.boundary} m + Vodiaci: ${price.cable.guide} m</small>
                            </td>
                            <td>${Math.round(price.laying)} €</td>
                        </tr>
                        ${price.hasOwnCable ? `
                        <tr>
                            <td>
                                Materiál — kábel
                                <small>Vlastný kábel zákazníka</small>
                            </td>
                            <td class="calc-free">0 €</td>
                        </tr>` : `
                        <tr>
                            <td>Materiál — kábel (${price.cable.total} m × ${PRICES.cableMaterial} €)</td>
                            <td>${Math.round(price.material)} €</td>
                        </tr>`}
                        ${price.travel > 0 ? `
                        <tr>
                            <td>
                                Doprava (${price.distance} km × ${PRICES.travelPerKm} €)
                                <small>Spiatočne zo Zlatých Moraviec</small>
                            </td>
                            <td>${Math.round(price.travel)} €</td>
                        </tr>` : `
                        <tr>
                            <td>Doprava</td>
                            <td class="calc-free">Zadarmo</td>
                        </tr>`}
                        ${price.pavement > 0 ? `
                        <tr>
                            <td>
                                Prechod cez chodník (${state.pavementCrossings}× prechod = ${price.pavMeters} m × ${PRICES.pavementPerMeter} €)
                                <small>Kábel prechádza 2× — tam aj späť</small>
                            </td>
                            <td>${price.pavement} €</td>
                        </tr>` : ''}
                        <tr class="calc-table-total">
                            <td><strong>Celkom</strong></td>
                            <td><strong>${Math.round(price.total).toLocaleString('sk')} €</strong></td>
                        </tr>
                    </table>

                    <div class="calc-result-notes">
                        <p><strong>Cena nezahŕňa:</strong> robotickú kosačku (prineste vlastnú alebo vám ju dodáme)</p>
                        ${price.hasOwnCable ? '<p><strong>Kábel:</strong> použijeme váš vlastný inštalačný kábel</p>' : ''}
                        <p><strong>Presná cena:</strong> bude stanovená po obhliadke pozemku</p>
                        <p><strong>Termín:</strong> inštaláciu vieme realizovať do 24 hodín od objednávky, vrátane sobôt</p>
                    </div>
                </div>

                <div class="calc-result-cta">
                    <button class="btn btn-primary btn-lg calc-to-form">Objednať inštaláciu za ${Math.round(price.total)} €</button>
                    <button class="btn btn-ghost calc-restart">Prepočítať</button>
                </div>
            </div>

            <div class="calc-nav">
                <button class="btn btn-ghost calc-back">Späť</button>
                <div></div>
            </div>
        `;

        el.querySelector('.calc-back').addEventListener('click', () => { state.step = 3; render(); });
        el.querySelector('.calc-restart').addEventListener('click', () => { state.step = 1; state.layout = null; render(); });

        // Connect to contact form
        el.querySelector('.calc-to-form').addEventListener('click', () => {
            const contactSection = document.getElementById('contact');
            const textarea = contactSection.querySelector('textarea');
            if (textarea) {
                textarea.value = getSummaryText();
            }
            const select = contactSection.querySelector('select');
            if (select) {
                const area = state.width * state.height;
                if (area <= 500) select.value = 'do 500 m²';
                else if (area <= 1000) select.value = '500 – 1 000 m²';
                else if (area <= 2000) select.value = '1 000 – 2 000 m²';
                else select.value = 'nad 2 000 m²';
            }
            contactSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Init
    document.addEventListener('DOMContentLoaded', () => {
        render();
    });

    // Expose for AI chatbot
    window.ROBOKOS_CALC = { getSummaryText, calculatePrice, state };
})();
