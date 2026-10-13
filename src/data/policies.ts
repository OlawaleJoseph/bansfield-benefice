// The four policy pages share the "Policies and notices" layout.
export const POLICIES = [
  { id: 'privacypolicy', label: 'Privacy' },
  { id: 'cookiespolicy', label: 'Cookies' },
  { id: 'copyright', label: 'Copyright' },
  { id: 'charitystatus', label: 'Charity status' },
];
export const isPolicy = (id: string) => POLICIES.some((p) => `notices/${p.id}` === id);
