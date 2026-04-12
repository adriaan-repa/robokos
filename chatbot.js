// ============================================
// RoboKos AI Chat Assistant
// ============================================
// A knowledge-base chatbot that answers questions about
// robotic mower installation. Uses keyword matching.
// For production, replace with a real AI API (Claude, GPT, etc.)
// ============================================

(function() {
    const KNOWLEDGE = [
        {
            keywords: ['cena', 'cenník', 'koľko', 'stojí', 'stoji', 'ceny', 'price', 'kolko'],
            answer: 'Cena inštalácie sa skladá z:\n\n• <strong>150 €</strong> — základný setup\n• <strong>1 €/m</strong> — uloženie kábla\n• <strong>0,80 €/m</strong> — materiál (kábel)\n• <strong>0,80 €/km</strong> — doprava (spiatočne zo Zlatých Moraviec)\n• <strong>10 €/m</strong> — prechod cez chodník/betón\n\nPre presnú cenu použite <a href="#calculator">našu kalkulačku</a> alebo nás kontaktujte na <a href="tel:+421907854144">+421 907 854 144</a>.'
        },
        {
            keywords: ['značk', 'brand', 'husqvarna', 'gardena', 'bosch', 'honda', 'stihl', 'znack'],
            answer: 'Inštalujeme robotické kosačky všetkých hlavných značiek:\n\n• <strong>Husqvarna</strong> (sme autorizovaný partner)\n• <strong>Gardena</strong>\n• <strong>Bosch</strong>\n• <strong>Honda</strong>\n• <strong>STIHL</strong>\n\nAk nemáte ešte kosačku, radi vám poradíme s výberom podľa veľkosti záhrady a rozpočtu.'
        },
        {
            keywords: ['dlho', 'trvá', 'trva', 'čas', 'cas', 'hodín', 'hodin', 'kedy', 'termín', 'termin'],
            answer: 'Inštalácia zvyčajne trvá <strong>2 – 5 hodín</strong> v závislosti od veľkosti a zložitosti pozemku.\n\n<strong>Termín:</strong> Inštaláciu vieme realizovať do <strong>24 hodín od objednávky</strong>, vrátane sobôt!\n\nStačí zavolať na <a href="tel:+421907854144">+421 907 854 144</a> alebo vyplniť <a href="#contact">kontaktný formulár</a>.'
        },
        {
            keywords: ['svah', 'kopec', 'strmý', 'strmy', 'sklon'],
            answer: 'Áno, robotické kosačky zvládajú svahy! Väčšina modelov zvláda <strong>sklon do 35 – 45 %</strong>.\n\nPred inštaláciou svah posúdime a odporučíme vhodný model. Na strmších svahoch odporúčame modely s väčšími kolesami a lepšou trakciou.'
        },
        {
            keywords: ['kábel', 'kabel', 'drôt', 'drot', 'obvodov', 'vodiac', 'zakop'],
            answer: 'Používame dva typy káblov:\n\n• <strong>Obvodový kábel</strong> — definuje hranice trávnika, vedie sa okolo celého obvodu a prekážok\n• <strong>Vodiaci kábel</strong> — navigačná trasa pre kosačku na návrat do stanice\n\nKáble ukladáme <strong>zakopávačom 5 cm pod povrch</strong> — nie na povrch s kolíkmi. Trávnik sa zaceľí do 1-2 týždňov.'
        },
        {
            keywords: ['príprav', 'priprav', 'pred inštaláci', 'pred instalaci'],
            answer: 'Pred naším príchodom prosíme o:\n\n✓ Vyrovnajte a pokosťe trávnik\n✓ Upravte úzke priestory na min. 1,5 m\n✓ Odstráňte predmety z plochy\n✓ Zavlažte trávnik niekoľko dní vopred\n\nMäkšia pôda uľahčí prácu zakopávača káblov.'
        },
        {
            keywords: ['elektri', 'zásuvk', 'zasuvk', 'prúd', 'prud', 'napáj', 'napaj', 'prípojk'],
            answer: 'Nabíjacia stanica potrebuje <strong>vonkajšiu zásuvku 230V</strong> (IP44 alebo vyššia) do max. 10 m od miesta stanice.\n\nOdporúčame samostatný istič 10A s prúdovým chráničom 30 mA a kábel CYKY 3×1,5 mm².\n\n<strong>Nie sme elektrikári</strong>, ale radi vám odporučíme spoľahlivého elektrikára vo vašom okolí.'
        },
        {
            keywords: ['kontakt', 'telefón', 'telefon', 'email', 'adresa', 'kde', 'otvárac', 'otvarac', 'hodiny'],
            answer: '<strong>PROTECHNIK s.r.o.</strong>\n\n📍 Továrenská 27, 953 01 Zlaté Moravce\n📞 <a href="tel:+421907854144">+421 907 854 144</a>\n📧 <a href="mailto:info@robokos.sk">info@robokos.sk</a>\n\n<strong>Otváracie hodiny:</strong>\nPo–Pia: 8:00–17:00\nSo: 8:00–12:00'
        },
        {
            keywords: ['oblasť', 'oblast', 'región', 'region', 'pôsobnosť', 'posobnost', 'mesto', 'bratislav', 'košic', 'kosic', 'dopravu', 'doprav'],
            answer: 'Pôsobíme <strong>po celom Slovensku</strong>! Sídlime v Zlatých Moravciach.\n\nDoprava sa účtuje <strong>0,80 €/km</strong> (spiatočne zo Zlatých Moraviec). Napríklad:\n\n• Nitra: ~24 €\n• Bratislava: ~104 €\n• Košice: ~224 €\n\nV Zlatých Moravciach a okolí je doprava zadarmo.'
        },
        {
            keywords: ['plochy', 'oddelené', 'oddelene', 'viac', 'zón', 'zon', 'dve'],
            answer: 'Zvládneme aj viac oddelených plôch! Naplánujeme <strong>transportné trasy</strong> medzi plochami.\n\nKosačka sa medzi nimi presúva automaticky podľa nastaveného rozvrhu. Ak je medzi plochami chodník, kábel prevedieme pod ním.'
        },
        {
            keywords: ['chodník', 'chodnik', 'betón', 'beton', 'dlažb', 'dlazb', 'prechod'],
            answer: 'Ak kábel musí prejsť cez chodník alebo betón, buď <strong>vyberieme dlažbu</strong> alebo <strong>prerežeme betón</strong>.\n\nCena: <strong>10 €/m</strong>. Kábel prechádza chodníkom 2× (tam a späť), takže jeden prechod = 2 m.\n\nPo uložení kábla dlažbu vrátime na miesto.'
        },
        {
            keywords: ['kosačk', 'kosack', 'vlastnú', 'vlastnu', 'kúpiť', 'kupit', 'model', 'odporúč', 'odporuc'],
            answer: 'Môžete si <strong>priniesť vlastnú kosačku</strong> alebo vám ju <strong>dodáme</strong> — sme autorizovaný predajca Husqvarna a ďalších značiek.\n\nRadi vám poradíme s výberom na základe:\n• Veľkosti záhrady\n• Typu terénu (svah, prekážky)\n• Vášho rozpočtu\n\nStačí sa ozvať na <a href="tel:+421907854144">+421 907 854 144</a>.'
        },
        {
            keywords: ['servis', 'údržb', 'udrzb', 'oprav', 'záruk', 'zaruk', 'nož', 'noz', 'zim'],
            answer: 'Ponúkame kompletný popredajný servis:\n\n• <strong>Záruka na inštaláciu: 24 mesiacov</strong>\n• Sezónna údržba a kontrola\n• Výmena nožov\n• Aktualizácia softvéru\n• Zimná konzervácia\n• Dlhodobá technická podpora\n\nRobotická kosačka sama o sebe vyžaduje minimálnu údržbu.'
        },
        {
            keywords: ['poškod', 'poskod', 'trávnik', 'travnik', 'zaceľ', 'zacel'],
            answer: 'Zakopávač vytvorí len <strong>úzky rez</strong>, ktorý sa zaceľí do <strong>1 – 2 týždňov</strong>.\n\nTrávnik nie je výrazne poškodený — na rozdiel od povrchových kolíkov, kábel je úplne neviditeľný pod povrchom. Výsledok je omnoho čistejší a profesionálnejší.'
        },
    ];

    const FALLBACK = 'Na túto otázku vám najlepšie odpovieme osobne. Zavolajte nám na <a href="tel:+421907854144">+421 907 854 144</a> alebo napíšte na <a href="mailto:info@robokos.sk">info@robokos.sk</a>.\n\nMôžete tiež použiť náš <a href="#contact">kontaktný formulár</a> — ozveme sa do 24 hodín.';

    function findAnswer(question) {
        const q = question.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        let bestMatch = null;
        let bestScore = 0;

        for (const entry of KNOWLEDGE) {
            let score = 0;
            for (const keyword of entry.keywords) {
                const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (q.includes(normalizedKeyword)) {
                    score += normalizedKeyword.length; // longer matches = better
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = entry;
            }
        }

        return bestScore > 0 ? bestMatch.answer : FALLBACK;
    }

    function addMessage(text, isUser) {
        const container = document.getElementById('chat-messages');
        const msg = document.createElement('div');
        msg.className = `chat-msg ${isUser ? 'chat-msg-user' : 'chat-msg-bot'}`;
        msg.innerHTML = `<p>${text}</p>`;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    function handleSend() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, true);
        input.value = '';

        // Simulate typing delay
        setTimeout(() => {
            const answer = findAnswer(text);
            addMessage(answer, false);
        }, 400 + Math.random() * 600);
    }

    document.addEventListener('DOMContentLoaded', () => {
        const toggle = document.getElementById('chat-toggle');
        const window_ = document.getElementById('chat-window');
        const openIcon = toggle.querySelector('.chat-icon-open');
        const closeIcon = toggle.querySelector('.chat-icon-close');

        toggle.addEventListener('click', () => {
            const isOpen = window_.classList.toggle('open');
            openIcon.style.display = isOpen ? 'none' : 'block';
            closeIcon.style.display = isOpen ? 'block' : 'none';
            if (isOpen) {
                document.getElementById('chat-input').focus();
            }
        });

        document.getElementById('chat-send').addEventListener('click', handleSend);
        document.getElementById('chat-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSend();
        });

        // Suggestion buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chat-suggestion')) {
                const q = e.target.dataset.q;
                document.getElementById('chat-input').value = q;
                handleSend();
            }
        });
    });
})();
