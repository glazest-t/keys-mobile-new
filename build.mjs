import { cp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { stampAssets } from "./scripts/stamp-assets.mjs";
import { buildSections } from "./scripts/build-sections.mjs";
import { buildArbanaTheme } from "./scripts/arbana-theme.mjs";

const fragment = await readFile(new URL("./src/prototype.html", import.meta.url), "utf8");
const document = `<!doctype html>
<html lang="ru" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="color-scheme" content="light">
  <meta name="theme-color" content="#f7f7f5">
  <meta name="description" content="Интерактивный прототип мобильного приложения «Ключи» для путешественников.">
  <title>Ключи — интерактивный прототип</title>
  <script src="./boot.js"></script>
  <style>html[data-keys-boot="loading"] body { visibility: hidden !important; }</style>
  <link rel="stylesheet" href="./arbana/tokens.css">
  <script src="https://cdn.jsdelivr.net/npm/lucide@0.468.0/dist/umd/lucide.min.js"></script>
  <style>
    :root { color-scheme: light only; }
    html { min-width: 320px; background: #eef0f3; }
    body { min-height: 100vh; margin: 0; padding: 24px 12px; }
    #keysHomeVariantThree .k3-line { background: #dfe2e7 !important; }
    #keysHomeVariantThree .k3-line::before { box-shadow: 0 0 0 3px #edf1ff !important; }
    #keysHomeVariantThree .k3-point.current .k3-line::before { box-shadow: 0 0 0 3px #eaf7ef !important; }
    #keysFindPages [data-page-id="results"] :is(.kp-back,.kp-icon-btn) > svg { width: 19px !important; height: 19px !important; stroke-width: 1.8; flex: none; }
    #keysFindPages [data-page-id="results"] .kp-query > svg { width: 18px !important; height: 18px !important; stroke-width: 1.8; flex: none; }
    #keysFindPages [data-page-id="results"] .kp-heart > svg { width: 17px !important; height: 17px !important; stroke-width: 1.8; flex: none; }
    #keysFourSections .kf-breakfast-offer { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: start; gap: 12px; padding: 14px; }
    #keysFourSections .kf-breakfast-main { min-width: 0; }
    #keysFourSections .kf-breakfast-main > strong { margin: 0; }
    #keysFourSections .kf-breakfast-side { text-align: right; white-space: nowrap; }
    #keysFourSections .kf-breakfast-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    #keysFourSections .kf-breakfast-tags span { display: inline-flex; align-items: center; min-height: 25px; padding: 4px 8px; border-radius: 9px; background: #f0f2f5; color: #626873; font-size: 11px; line-height: 15px; font-weight: 400; }
    #keysFourSections .kf-breakfast-old { display: block; font-size: 11px; line-height: 15px; font-weight: 400; color: #8a9099; text-decoration: line-through; }
    #keysFourSections .kf-breakfast-new { display: block; margin-top: 2px; font-size: 13px; line-height: 17px; font-weight: 600; color: #2857d8; }
    #keysFourSections .kf-breakfast-saving { display: block; margin-top: 3px; font-size: 11px; line-height: 15px; font-weight: 600; color: #23714e; }
#keysUnifiedPrototype #keysFourSections .kf-benefit-hero + .kf-section { margin-top: 16px !important; margin-bottom: 0 !important; }
    @media (max-width: 520px) { body { padding: 8px 0 20px; } }
  </style>
</head>
<body>
${fragment}
<script>
  (() => {
    const breakfast = document.querySelector('#keysFourSections [data-open="breakfast"]');
    const fitness = document.querySelector('#keysFourSections [data-open="fitness"]');
    if (breakfast) {
      breakfast.className = 'kf-offer kf-breakfast-offer';
      breakfast.innerHTML = '<span class="kf-breakfast-main"><strong>Завтрак «Шведский стол»</strong><span class="kf-breakfast-tags"><span>Ресторан LEA</span><span>07:00–12:00</span></span></span><span class="kf-breakfast-side"><span class="kf-breakfast-old">800 ₽/сутки</span><span class="kf-breakfast-new">680 ₽/сутки</span><span class="kf-breakfast-saving">Выгода 120 ₽</span></span>';
    }
    if (fitness) {
      fitness.innerHTML = '<span><strong>Фитнес-студия</strong><span class="kf-breakfast-tags"><span>Ежедневно</span><span>07:00–23:00</span></span></span><span class="kf-price">Включено</span>';
    }
    const profileIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';
    document.querySelectorAll('.k3-tab,.kp-tab,.kf-tab,.ktd-tab,.ksd-tab').forEach((button) => {
      if (button.querySelector(':scope > span:last-child')?.textContent.trim() !== 'Профиль') return;
      button.querySelector(':scope > svg,:scope > i')?.remove();
      button.insertAdjacentHTML('afterbegin', profileIcon);
    });
  })();
</script>
<link rel="stylesheet" href="./arbana/theme.css">
<script src="./arbana/icons.js"></script>
<link rel="stylesheet" href="./sections/host.css?v=shared-nav-4">
<link rel="stylesheet" href="./arbana/app-header.css?v=secondary-titles-1">
<script src="./arbana/app-header.js?v=header-lines-1"></script>
<link rel="stylesheet" href="./arbana/app-nav.css?v=arbana-motion-2">
<script src="./arbana/app-nav.js?v=arbana-motion-2"></script>
<script src="./sections/host.js?v=before-arrival-1"></script>
<link rel="stylesheet" href="./home/home.css?v=before-arrival-1">
<link rel="stylesheet" href="./home/nearby/leaflet.css">
<link rel="stylesheet" href="./home/nearby/nearby.css?v=nearby-card-structure-1">
<script src="./home/nearby/leaflet.js"></script>
<script src="./home/nearby/nearby.js?v=nearby-card-structure-1"></script>
<script src="./home/home.js?v=clean-prototype-copy-1"></script>
<link rel="stylesheet" href="./booking/booking.css?v=completed-details-clean-1">
<script src="./booking/booking.js?v=clean-prototype-copy-1"></script>
<link rel="stylesheet" href="./feedback/feedback.css?v=feedback-thanks-card-1">
<script src="./feedback/feedback.js?v=clean-prototype-copy-1"></script>
<script src="./feedback/reviews.js?v=shared-feedback-1"></script>
<link rel="stylesheet" href="./scenarios/scenarios.css?v=before-arrival-1">
<link rel="stylesheet" href="./scenarios/stay.css?v=shared-late-flow-1">
<script src="./scenarios/stay.js?v=shared-late-flow-1"></script>
<script src="./scenarios/late-checkout.js?v=clean-prototype-copy-1"></script>
<link rel="stylesheet" href="./scenarios/after.css?v=reward-spacing-2">
<script src="./scenarios/after.js?v=clean-prototype-copy-1"></script>
<link rel="stylesheet" href="./feedback/reviews.css?v=feedback-thanks-card-1">
<link rel="stylesheet" href="./scenarios/before.css?v=checkin-style-1">
<script src="./scenarios/booking-change.js?v=arbana-checkin-1"></script>
<script src="./scenarios/before.js?v=checkin-style-1"></script>
<link rel="stylesheet" href="./scenarios/search.css">
<script src="./scenarios/search.js"></script>
<script src="./scenarios/scenarios.js?v=arrival-day-route-1"></script>
<link rel="stylesheet" href="./arbana/service-cards.css?v=completed-redesign-1">
<link rel="stylesheet" href="./arbana/ui-standards.css">
<link rel="stylesheet" href="./booking/services.css">
<script src="./booking/services.js"></script>
<link rel="stylesheet" href="./booking/breakfast-gallery.css">
<script src="./booking/breakfast-gallery.js"></script>
</body>
</html>
`;

await rm(new URL("./dist/", import.meta.url), {recursive:true,force:true});
await mkdir(new URL("./dist/", import.meta.url), { recursive: true });
await buildArbanaTheme(fragment, document.slice(0, document.indexOf("<body>")));
await writeFile(new URL("./dist/index.html", import.meta.url), document);
await writeFile(new URL("./dist/.nojekyll", import.meta.url), "");
await writeFile(new URL("./dist/home-calendar.html", import.meta.url), document.replace("./home/home.css?v=before-arrival-1", "./home/variants/calendar/home.css").replace("./home/home.js?v=clean-prototype-copy-1", "./home/variants/calendar/home.js"));

await cp(new URL("./src/home/", import.meta.url), new URL("./dist/home/", import.meta.url), { recursive: true });
await cp(new URL("./src/header-concepts.html", import.meta.url), new URL("./dist/header-concepts.html", import.meta.url));
await cp(new URL("./src/header-concepts/", import.meta.url), new URL("./dist/header-concepts/", import.meta.url), { recursive: true });
await cp(new URL("./src/booking/", import.meta.url), new URL("./dist/booking/", import.meta.url), { recursive: true });
await cp(new URL("./src/feedback/", import.meta.url), new URL("./dist/feedback/", import.meta.url), { recursive: true });
await cp(new URL("./src/scenarios/", import.meta.url), new URL("./dist/scenarios/", import.meta.url), { recursive: true });
await cp(new URL("./src/arbana/service-cards.css", import.meta.url), new URL("./dist/arbana/service-cards.css", import.meta.url));
await cp(new URL("./src/boot.js", import.meta.url), new URL("./dist/boot.js", import.meta.url));
await buildSections();
await stampAssets(fileURLToPath(new URL("./dist/", import.meta.url)));

console.log("GitHub Pages build created: dist/index.html");
