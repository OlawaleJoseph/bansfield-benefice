// Google Analytics loads only after the visitor accepts analytics cookies.
import { GA_ID } from '../data/site';

const KEY = 'cookie-consent';
type Choice = 'granted' | 'denied';

const banner = document.getElementById('cookie-banner');

function stored(): Choice | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null; // storage blocked: ask each visit, never assume consent
  }
}

let loaded = false;
function loadAnalytics() {
  if (loaded) return;
  loaded = true;
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...args: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function () {
    // gtag.js expects the arguments object itself
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag('js', new Date());
  w.gtag('config', GA_ID);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

/** Remove Analytics cookies (_ga, _ga_XXXX) set by an earlier "Accept". */
function clearAnalyticsCookies() {
  const host = location.hostname;
  const domains = ['', host, `.${host}`, `.${host.replace(/^www\./, '')}`];
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0].trim();
    if (!/^_ga(_|$)|^_gid$|^_gat/.test(name)) continue;
    for (const d of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ''}`;
    }
  }
}

function choose(choice: Choice) {
  const before = stored();
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    /* choice applies to this page only */
  }
  if (banner) banner.hidden = true;
  if (choice === 'granted') loadAnalytics();
  else if (before === 'granted' || loaded) {
    clearAnalyticsCookies();
    location.reload(); // unload the Analytics script that's already running
  }
}

const choice = stored();
if (choice === 'granted') loadAnalytics();
if (!choice && banner) banner.hidden = false;

banner?.querySelectorAll<HTMLButtonElement>('[data-consent]').forEach((b) =>
  b.addEventListener('click', () => choose(b.dataset.consent as Choice)),
);
document.querySelectorAll<HTMLElement>('[data-cookie-settings]').forEach((el) => {
  el.hidden = false; // the link only works with JavaScript, so it starts hidden
  el.addEventListener('click', (e) => {
    e.preventDefault();
    if (!banner) return;
    banner.hidden = false;
    banner.querySelector<HTMLButtonElement>('[data-consent]')?.focus();
  });
});
