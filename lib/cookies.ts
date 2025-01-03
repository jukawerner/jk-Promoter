export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function setCookie(name: string, value: string, path = '/') {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=${path}`;
}

export function removeCookie(name: string, path = '/') {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
}
