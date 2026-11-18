import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function capture() {
  console.log('Launching installed Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 30000 });

  // 1. Overview
  console.log('Capturing 1. Overview...');
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, '01_overview.png'), fullPage: true });

  // 2. Top 10 Picks - RR Auction Targets
  console.log('Capturing 2. Top 10 Picks (RR Targets)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent?.includes('Top 10 Picks'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, '02_top10_auction_targets.png'), fullPage: true });

  // 3. Top 10 Picks - Batters
  console.log('Capturing 3. Top 10 Batters...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent?.includes('Unstop Top Batters'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '03_top10_batters.png'), fullPage: true });

  // 4. Top 10 Picks - Bowlers
  console.log('Capturing 4. Top 10 Bowlers...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent?.includes('Unstop Top Bowlers'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '04_top10_bowlers.png'), fullPage: true });

  // 5. Player Explorer
  console.log('Capturing 5. Player Explorer...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent?.includes('Player Explorer'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outDir, '05_player_explorer.png'), fullPage: true });

  // 6. Compare (Head-to-Head)
  console.log('Capturing 6. Head-to-Head Compare...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent?.includes('Head-to-Head'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, '06_compare.png'), fullPage: true });

  // 7. RR Squad Fit
  console.log('Capturing 7. RR Squad Fit...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent?.includes('RR Squad Fit'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, '07_rr_squad_fit.png'), fullPage: true });

  // 8. Methodology
  console.log('Capturing 8. Methodology...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent?.includes('Methodology'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, '08_methodology.png'), fullPage: true });

  // 9. Model Weights Modal
  console.log('Capturing 9. Model Weights Modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent?.includes('Model Weights'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outDir, '09_model_weights_modal.png'), fullPage: false });

  console.log('SUCCESS: All 9 screenshots captured in /screenshots directory!');
  await browser.close();
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
