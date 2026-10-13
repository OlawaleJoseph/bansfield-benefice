// Behaviour shared by every page. Pages work without it.

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Mobile menu
const btn = document.querySelector<HTMLButtonElement>('.menu-btn');
const menu = document.getElementById('mobile-menu');
if (btn && menu) {
  const setOpen = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
    btn.querySelector('.menu-label')!.textContent = open ? 'Close' : 'Menu';
  };
  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      setOpen(false);
      btn.focus();
    }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', (e) => e.matches && setOpen(false));
}

// Rota labels follow the visitor's current month
const now = new Date();
const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const thisMonth = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
const nextMonth = `${MONTHS[next.getMonth()]} ${next.getFullYear()}`;
document.querySelectorAll<HTMLElement>('[data-rota]').forEach((el) => {
  const label = el.querySelector<HTMLElement>('[data-rota-label]');
  if (!label) return;
  if (el.dataset.rota === thisMonth) label.textContent = 'This month';
  else if (el.dataset.rota === nextMonth) label.textContent = label.dataset.next ?? 'Next month';
});
