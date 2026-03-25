export function getHostnameUrl(hostname: string) {
  if (!hostname) return window.location.origin;
  return `${window.location.protocol}//${hostname}`;
}

export function exchangeTokenRedirectUrl(
  hostname: string,
  exchangeToken: string,
) {
  const url = new URL("/login", getHostnameUrl(hostname));
  url.searchParams.set("exchangeToken", exchangeToken);
  return url.toString();
}
