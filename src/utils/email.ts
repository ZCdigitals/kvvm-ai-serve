export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const UrlPattern = /:\/\/.+/;

export function parseEmail(email: string): URL {
  return UrlPattern.test(email) ? new URL(email) : new URL(`mailto://${email}`);
}
