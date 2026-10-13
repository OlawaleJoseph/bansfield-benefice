// Contacts and links used across the site.
export const RECTOR = { name: 'Revd Eve Bell', tel: '07815 441304', email: 'evebellbb@icloud.com', photo: '/images/benefice/eve-bell.jpg' };
export const DSO = { name: 'Karen Galloway', tel: '07785 621319' };
export const CONTACT_EMAIL = 'contact@bansfieldbenefice.org.uk';
export const WEBMASTER_EMAIL = 'webmaster@bansfieldbenefice.org.uk';
export const PARISH_GIVING = 'https://www.parishgiving.org.uk/donors/find-your-parish/';

export const SERVICES_CALENDAR =
  'https://www.google.com/calendar/embed?&showTz=0&height=450&wkst=1&bgcolor=%23FFFFFF&src=o9671df85qii9p57tms3r69bg0%40group.calendar.google.com&title=Services%20this%20week&color=%23528800&ctz=Europe%2FLondon&mode=AGENDA';
export const EVENTS_CALENDAR =
  'https://www.google.com/calendar/embed?src=o9671df85qii9p57tms3r69bg0%40group.calendar.google.com&src=k4uu87afvoi319tgbgaajhs3jk%40group.calendar.google.com&title=Events%20Diary%20And%20Calendar&mode=AGENDA&chrome=NAVIGATION&epr=5&wkst=1&height=550';
export const VISIT_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSfzDcaquLeY5FpQm1zhH3Wk0f9aaJcD6aa0wUaLzD64SlnyGQ/viewform';
export const MAILCHIMP = 'https://bansfieldbenefice.us12.list-manage.com/subscribe/post?u=5f9737f31de47db8e3b9b1d74&id=4a4f2b8daf';
export const GA_ID = 'G-MQ77ZRRHR1';

export const SOCIAL = [
  { label: 'Facebook', href: 'https://www.facebook.com/bansfieldbenefice' },
  { label: 'YouTube', href: 'https://www.youtube.com/user/bansfieldbenefice' },
  { label: 'Blog', href: 'https://bansfieldbenefice.blogspot.com/' },
  { label: 'Flickr', href: 'https://www.flickr.com/photos/bansfieldbenefice/albums' },
  { label: 'X / Twitter', href: 'https://twitter.com/bansfieldbene' },
];

// Route planner destinations (Google Maps directions), as on the old site.
export const ROUTE_DESTINATIONS = [
  ['Cowlinge church', 'CB8  9QA'], ['Denston church', 'CB8  8PW'], ['Lidgate church', 'CB8  9PT'],
  ['Ousden church', 'CB8  8TN'], ['Stansfield church', 'CO10 8LT'], ['Stradishall church', 'CB8  8YW'],
  ['Wickhambrook church', 'CB8  8XH'], ['Benefice Hall', 'CB8  8XH'], ['Benefice Vicarage', 'CB8  8XH'],
];

export type NavKey = 'home' | 'services' | 'visit' | 'events' | 'churches' | 'about' | 'contact' | 'none';

export const NAV: { key: NavKey; label: string; href: string }[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'services', label: 'Services', href: '/services/' },
  { key: 'visit', label: 'Visit', href: '/visits/' },
  { key: 'events', label: 'Events', href: '/events/' },
  { key: 'churches', label: 'Our churches', href: '/churches/' },
  { key: 'about', label: 'About', href: '/benefice/' },
  { key: 'contact', label: 'Contact', href: '/benefice/contact.html' },
];

export const CHURCH_SLUGS = ['cowlinge', 'denston', 'lidgate', 'ousden', 'stansfield', 'stradishall', 'wickhambrook'];

export const SECTION_NAMES: Record<string, string> = {
  '': 'Home', benefice: 'About the Benefice', services: 'Services', visits: 'Visit', events: 'Events',
  news: 'News and newsletters', press: 'Press', jamclub: 'JAM Club', media: 'Media', notices: 'Policies and notices',
  churches: 'Our churches', cowlinge: 'Cowlinge', denston: 'Denston', lidgate: 'Lidgate', ousden: 'Ousden',
  stansfield: 'Stansfield', stradishall: 'Stradishall', wickhambrook: 'Wickhambrook',
};

/** Which main-menu item a URL belongs to. */
export function navFor(url: string): NavKey {
  if (url.startsWith('/services/')) return 'services';
  if (url.startsWith('/visits/')) return 'visit';
  if (url.startsWith('/events/')) return 'events';
  if (url === '/benefice/contact.html') return 'contact';
  if (url.startsWith('/benefice/')) return 'about';
  if (CHURCH_SLUGS.includes(url.split('/')[1])) return 'churches';
  return 'none';
}

/** Public URL for a migrated page id ("cowlinge/history/index" -> "/cowlinge/history/"). */
export const urlForId = (id: string) => '/' + (id.endsWith('index') ? id.slice(0, -'index'.length) : `${id}.html`);

export const tel = (n: string) => 'tel:' + n.replace(/\s/g, '');
