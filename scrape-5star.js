#!/usr/bin/env node
// Scrape only 5-star reviews from PROTECHNIK Google Maps listing

const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
        locale: 'sk-SK',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 900 },
    });

    console.log('Loading Google Maps...');
    await page.goto('https://www.google.com/maps', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Accept cookies
    const cookieSelectors = ['button:has-text("Prijať všetko")', 'button:has-text("Accept all")'];
    for (const sel of cookieSelectors) {
        try {
            const btn = page.locator(sel).first();
            if (await btn.isVisible({ timeout: 2000 })) {
                await btn.click();
                console.log('Accepted cookies');
                await page.waitForTimeout(3000);
                break;
            }
        } catch {}
    }

    // Reload maps after consent
    await page.goto('https://www.google.com/maps', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Debug
    await page.screenshot({ path: '/tmp/5star-debug.png' });
    console.log('Page URL:', page.url());

    // Search — try clicking the search area first
    console.log('Searching...');
    try {
        await page.locator('[class*="searchbox"]').first().click({ timeout: 3000 });
    } catch {}
    const searchBox = page.locator('input').first();
    await searchBox.waitFor({ timeout: 15000 });
    await searchBox.click();
    await page.keyboard.type('PROTECHNIK s.r.o. Zlaté Moravce', { delay: 30 });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);

    // Click first result if needed
    try {
        const first = page.locator('[class*="Nv2PK"]').first();
        if (await first.isVisible({ timeout: 3000 })) { await first.click(); await page.waitForTimeout(3000); }
    } catch {}

    // Get rating info
    let rating = 0, totalReviews = 0;
    try {
        const selectors = ['[class*="fontDisplayLarge"]', 'div[class*="F7nice"] span[aria-hidden]'];
        for (const sel of selectors) {
            try {
                const text = await page.locator(sel).first().textContent({ timeout: 3000 });
                const num = parseFloat(text.replace(',', '.'));
                if (num > 0 && num <= 5) { rating = num; break; }
            } catch {}
        }
        const countText = await page.locator('[class*="F7nice"]').first().textContent({ timeout: 3000 });
        const m = countText.match(/\((\d+)\)/);
        if (m) totalReviews = parseInt(m[1]);
    } catch {}
    console.log(`Rating: ${rating}/5 (${totalReviews} reviews)`);

    // Open reviews tab
    console.log('Opening reviews...');
    const tabSelectors = ['button[aria-label*="recenzi"]', 'button:has-text("Recenzie")', '[role="tab"]:has-text("Recenzie")'];
    for (const sel of tabSelectors) {
        try {
            const btn = page.locator(sel).first();
            if (await btn.isVisible({ timeout: 2000 })) { await btn.click(); await page.waitForTimeout(3000); break; }
        } catch {}
    }

    // Sort by highest rating
    console.log('Sorting by highest rating...');
    try {
        const sortBtn = page.locator('button[aria-label*="Zoradiť"], button[data-value*="sort"]').first();
        await sortBtn.click({ timeout: 5000 });
        await page.waitForTimeout(1000);
        // "Najvyššie hodnotenie" = Highest rating (index 2 in the sort menu)
        const menuItems = page.locator('[role="menuitemradio"], li[data-index]');
        const count = await menuItems.count();
        console.log(`  Found ${count} sort options`);
        // Try clicking "Najvyššie hodnotenie"
        let clicked = false;
        for (let i = 0; i < count; i++) {
            const text = await menuItems.nth(i).textContent();
            console.log(`  Option ${i}: ${text.trim()}`);
            if (text.includes('Najvyššie') || text.includes('Highest')) {
                await menuItems.nth(i).click();
                clicked = true;
                console.log('  Sorted by highest rating');
                break;
            }
        }
        if (!clicked && count >= 3) {
            await menuItems.nth(2).click(); // Usually index 2 = highest rating
            console.log('  Clicked sort option index 2');
        }
        await page.waitForTimeout(3000);
    } catch (e) {
        console.log('  Could not sort:', e.message);
    }

    // Scroll to load more reviews
    console.log('Scrolling to load reviews...');
    const scrollSelectors = ['[class*="m6QErb"]', '[role="main"] [tabindex="-1"]'];
    for (const sel of scrollSelectors) {
        try {
            const scrollable = page.locator(sel).first();
            if (await scrollable.isVisible({ timeout: 2000 })) {
                for (let i = 0; i < 25; i++) {
                    await scrollable.evaluate(el => el.scrollTop = el.scrollHeight);
                    await page.waitForTimeout(1200);
                }
                console.log(`  Scrolled using: ${sel}`);
                break;
            }
        } catch {}
    }

    // Expand all review texts
    try {
        const moreButtons = page.locator('button:has-text("Viac"), button[class*="w8nwRe"]');
        const moreCount = await moreButtons.count();
        for (let i = 0; i < moreCount; i++) {
            try { await moreButtons.nth(i).click({ timeout: 300 }); } catch {}
        }
        console.log(`  Expanded ${moreCount} reviews`);
    } catch {}

    await page.waitForTimeout(1000);

    // Extract all reviews
    console.log('Extracting reviews...');
    const reviews = await page.evaluate(() => {
        const results = [];
        const containers = document.querySelectorAll('[data-review-id], [class*="jftiEf"], [class*="GHT2ce"]');

        containers.forEach(el => {
            try {
                const nameEl = el.querySelector('[class*="d4r55"], a[href*="contrib"]');
                let name = nameEl ? nameEl.textContent.trim() : null;

                let r = 5;
                const starsEl = el.querySelector('[role="img"][aria-label]');
                if (starsEl) {
                    const label = starsEl.getAttribute('aria-label') || '';
                    const m = label.match(/(\d)/);
                    if (m) r = parseInt(m[1]);
                }

                const textEl = el.querySelector('[class*="wiI7pd"], [class*="MyEned"]');
                const text = textEl ? textEl.textContent.trim() : '';

                const timeEl = el.querySelector('[class*="rsqaWe"]');
                const time = timeEl ? timeEl.textContent.trim() : '';

                const photoEl = el.querySelector('img[src*="googleusercontent"]');
                const photo = photoEl ? photoEl.src : null;

                if (name) {
                    // Clean name
                    name = name.replace(/Miestny sprievodca.*$/, '').replace(/\d+ recenzi.*$/, '').replace(/\d+ fotiek.*$/, '').trim();
                    results.push({ author: name, rating: r, text, time, photo });
                }
            } catch {}
        });

        return results;
    });

    // Deduplicate
    const seen = new Set();
    const unique = reviews.filter(r => {
        const key = `${r.author}::${r.rating}::${r.text}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    console.log(`\nAll reviews found: ${unique.length}`);
    console.log('---');
    unique.forEach((r, i) => {
        const sentiment = r.text ? (r.text.length > 0 ? r.text.substring(0, 80) : '(no text)') : '(no text)';
        console.log(`${i+1}. ${r.author} — ${r.rating}★ — "${sentiment}${r.text && r.text.length > 80 ? '...' : ''}" (${r.time})`);
    });

    // Filter: only 5-star with text
    const fiveStar = unique.filter(r => r.rating === 5 && r.text && r.text.length > 0);
    console.log(`\n5-star reviews with text: ${fiveStar.length}`);
    fiveStar.forEach((r, i) => {
        console.log(`  ${i+1}. ${r.author}: "${r.text}"`);
    });

    // Save
    const output = {
        business: 'PROTECHNIK s.r.o.',
        mapsUrl: 'https://www.google.com/maps/place/Husqvarna+-+Z%C3%A1hradn%C3%A1+Technika+%7C+PROTECHNIK+s.r.o./@48.3891972,18.3920403,17z',
        rating, totalReviews,
        reviews: fiveStar,
        lastUpdated: new Date().toISOString(),
        source: 'Google Maps',
    };
    fs.writeFileSync('reviews.json', JSON.stringify(output, null, 2));
    console.log('\nSaved to reviews.json');

    await browser.close();
})();
