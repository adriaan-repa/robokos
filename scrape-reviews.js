#!/usr/bin/env node
// ============================================
// Google Reviews Scraper for PROTECHNIK s.r.o.
// Uses Google Maps search to find the business, then scrapes reviews.
// ============================================

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SEARCH_QUERY = 'PROTECHNIK s.r.o. Zlaté Moravce';
const OUTPUT_FILE = path.join(__dirname, 'reviews.json');
const MAX_REVIEWS = 20;

async function scrapeReviews() {
    console.log('Starting Google Reviews scraper...');

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
        locale: 'sk-SK',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 900 },
    });

    const page = await context.newPage();

    try {
        // Step 1: Go to Google Maps and search
        console.log('Loading Google Maps...');
        await page.goto('https://www.google.com/maps', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);

        // Accept cookies
        console.log('Handling cookies...');
        const cookieSelectors = [
            'button:has-text("Prijať všetko")',
            'button:has-text("Súhlasím")',
            'button:has-text("Accept all")',
            'form[action*="consent"] button:last-of-type',
        ];
        for (const sel of cookieSelectors) {
            try {
                const btn = page.locator(sel).first();
                if (await btn.isVisible({ timeout: 2000 })) {
                    await btn.click();
                    console.log(`  Clicked: ${sel}`);
                    await page.waitForTimeout(2000);
                    break;
                }
            } catch { /* next */ }
        }



        // Step 2: Search for the business
        console.log(`Searching for: ${SEARCH_QUERY}`);
        // Find the search box — try multiple selectors
        const searchBox = page.locator('#searchboxinput, input[name="q"], input[aria-label*="Hľadať"], input[aria-label*="Search"]').first();
        await searchBox.waitFor({ timeout: 10000 });
        await searchBox.click();
        await page.keyboard.type(SEARCH_QUERY, { delay: 30 });
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000);



        // Step 3: Click on the first result if there's a list
        try {
            const firstResult = page.locator('[class*="Nv2PK"]').first();
            if (await firstResult.isVisible({ timeout: 3000 })) {
                await firstResult.click();
                console.log('Clicked first search result');
                await page.waitForTimeout(3000);
            }
        } catch {
            console.log('No search results list — business panel may already be open');
        }



        // Step 4: Extract rating from the business panel
        console.log('Extracting rating...');
        let overallRating = 0;
        let totalReviews = 0;

        // Try to get rating from the panel
        const ratingSelectors = [
            '[class*="fontDisplayLarge"]',
            'span[class*="ceNzKf"]',
            'div[class*="F7nice"] span[aria-hidden]',
        ];
        for (const sel of ratingSelectors) {
            try {
                const el = page.locator(sel).first();
                const text = await el.textContent({ timeout: 3000 });
                const num = parseFloat(text.replace(',', '.'));
                if (num > 0 && num <= 5) {
                    overallRating = num;
                    console.log(`  Rating: ${overallRating}`);
                    break;
                }
            } catch { /* next */ }
        }

        // Get review count
        try {
            const allText = await page.locator('[class*="F7nice"]').first().textContent({ timeout: 3000 });
            const match = allText.match(/\((\d+)\)/);
            if (match) totalReviews = parseInt(match[1]);
            console.log(`  Total reviews: ${totalReviews}`);
        } catch {
            // Try alternative
            try {
                const btnText = await page.locator('button[jsaction*="review"], button[aria-label*="recenz"]').first().textContent({ timeout: 3000 });
                const match = btnText.match(/(\d+)/);
                if (match) totalReviews = parseInt(match[1]);
            } catch { console.log('  Review count not found'); }
        }

        // Step 5: Open reviews tab
        console.log('Opening reviews...');
        const reviewTabSelectors = [
            'button[aria-label*="recenzi"]',
            'button[aria-label*="review"]',
            'button:has-text("Recenzie")',
            'button:has-text("recenzi")',
            '[role="tab"]:has-text("Recenzie")',
            '[role="tab"]:has-text("recenzi")',
        ];
        let clickedReviews = false;
        for (const sel of reviewTabSelectors) {
            try {
                const btn = page.locator(sel).first();
                if (await btn.isVisible({ timeout: 2000 })) {
                    await btn.click();
                    console.log(`  Clicked reviews tab: ${sel}`);
                    clickedReviews = true;
                    await page.waitForTimeout(3000);
                    break;
                }
            } catch { /* next */ }
        }

        if (!clickedReviews) {
            console.log('  Could not find reviews tab');
        }



        // Step 6: Scroll to load reviews
        console.log('Loading reviews...');
        // Try multiple scroll container selectors
        const scrollSelectors = [
            '[class*="m6QErb"][class*="DxyBCb"]',
            '[class*="m6QErb"]',
            '[role="main"] [tabindex="-1"]',
            '.section-scrollbox',
        ];
        let scrolled = false;
        for (const sel of scrollSelectors) {
            try {
                const scrollable = page.locator(sel).first();
                if (await scrollable.isVisible({ timeout: 2000 })) {
                    for (let i = 0; i < 20; i++) {
                        await scrollable.evaluate(el => el.scrollTop = el.scrollHeight);
                        await page.waitForTimeout(1500);
                    }
                    console.log(`  Scrolled using: ${sel}`);
                    scrolled = true;
                    break;
                }
            } catch { /* next */ }
        }
        if (!scrolled) console.log('  Could not scroll reviews panel');

        // Step 7: Expand all review texts (click "Viac" / "More" buttons)
        try {
            const moreButtons = page.locator('button[aria-label*="Zobraziť"], button:has-text("Viac"), button[class*="w8nwRe"], button[aria-expanded="false"]');
            const count = await moreButtons.count();
            for (let i = 0; i < Math.min(count, 50); i++) {
                try { await moreButtons.nth(i).click({ timeout: 300 }); } catch { /* skip */ }
            }
            if (count > 0) {
                console.log(`  Expanded ${count} review texts`);
                await page.waitForTimeout(1000);
            }
        } catch { /* no expand buttons */ }



        // Step 8: Extract reviews
        console.log('Extracting reviews...');
        const reviews = await page.evaluate((maxReviews) => {
            const results = [];

            // Google Maps review containers — try multiple class patterns
            const containers = document.querySelectorAll('[data-review-id], [class*="jftiEf"], [class*="GHT2ce"]');

            containers.forEach((el, i) => {
                if (i >= maxReviews) return;
                try {
                    // Author
                    const nameEl = el.querySelector('[class*="d4r55"], a[href*="contrib"], [class*="WNxzHc"] button');
                    const name = nameEl ? nameEl.textContent.trim() : null;

                    // Rating
                    let rating = 5;
                    const starsEl = el.querySelector('[role="img"][aria-label], [class*="kvMYJc"]');
                    if (starsEl) {
                        const label = starsEl.getAttribute('aria-label') || '';
                        const m = label.match(/(\d)/);
                        if (m) rating = parseInt(m[1]);
                    }

                    // Text
                    const textEl = el.querySelector('[class*="wiI7pd"], [class*="MyEned"]');
                    const text = textEl ? textEl.textContent.trim() : '';

                    // Time
                    const timeEl = el.querySelector('[class*="rsqaWe"], [class*="DU9Pgb"]');
                    const time = timeEl ? timeEl.textContent.trim() : '';

                    // Photo
                    const photoEl = el.querySelector('img[src*="googleusercontent"], img[class*="NBa7we"]');
                    const photo = photoEl ? photoEl.src : null;

                    if (name && (text || rating)) {
                        results.push({ author: name, rating, text, time, photo });
                    }
                } catch { /* skip malformed */ }
            });

            return results;
        }, MAX_REVIEWS);

        // Clean up: deduplicate and fix author names
        const seen = new Set();
        const cleanReviews = reviews
            .map(r => {
                // Clean author name — remove badge text like "Miestny sprievodca · X recenzií"
                let author = r.author || '';
                author = author.replace(/Miestny sprievodca.*$/, '').replace(/\d+ recenzi.*$/, '').replace(/\d+ fotiek.*$/, '').trim();
                return { ...r, author };
            })
            .filter(r => {
                if (!r.author || !r.text) return false; // skip empty reviews
                // keep all reviews - filtering happens on the website
                const key = `${r.author}::${r.text}`;
                if (seen.has(key)) return false; // skip duplicates
                seen.add(key);
                return true;
            });

        console.log(`Found ${reviews.length} raw, ${cleanReviews.length} unique reviews with text`);

        const output = {
            business: 'PROTECHNIK s.r.o.',
            mapsUrl: 'https://www.google.com/maps/place/Husqvarna+-+Z%C3%A1hradn%C3%A1+Technika+%7C+PROTECHNIK+s.r.o./@48.3891972,18.3920403,17z',
            rating: overallRating,
            totalReviews: totalReviews || reviews.length,
            reviews: cleanReviews,
            lastUpdated: new Date().toISOString(),
            source: 'Google Maps',
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
        console.log(`Saved to ${OUTPUT_FILE}`);
        console.log(`Rating: ${overallRating}/5 (${totalReviews} reviews)`);

    } catch (err) {
        console.error('Scraping failed:', err.message);
        if (!fs.existsSync(OUTPUT_FILE) || fs.readFileSync(OUTPUT_FILE, 'utf-8').includes('"reviews": []')) {
            fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
                business: 'PROTECHNIK s.r.o.',
                rating: 0, totalReviews: 0, reviews: [],
                lastUpdated: new Date().toISOString(),
                source: 'Google Maps', error: err.message,
            }, null, 2), 'utf-8');
        }
    } finally {
        await browser.close();
    }
}

scrapeReviews();
