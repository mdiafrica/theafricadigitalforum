// src/utils/cookies.js

// ── Cookie Utilities ──
export function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getCookie(name) {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts.slice(1).join('=')) : r;
  }, '');
}

export function eraseCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export function hasCookieConsent() {
  return !!getCookie('adf_cookie_consent');
}

// ── Get full consent data (parsed) ──
export function getCookieConsent() {
  const consent = getCookie('adf_cookie_consent');
  if (!consent) return null;
  
  try {
    // Try to parse as JSON (for detailed preferences)
    return JSON.parse(consent);
  } catch {
    // Fallback: return as string (legacy 'all' or 'essential')
    return consent;
  }
}

// ── Check if a specific category is allowed ──
export function isCategoryAllowed(category) {
  const consent = getCookieConsent();
  
  // No consent = nothing allowed
  if (!consent) return false;
  
  // Legacy consent (string) - check if it's 'all'
  if (typeof consent === 'string') {
    return consent === 'all';
  }
  
  // Detailed consent (object)
  if (typeof consent === 'object' && consent.preferences) {
    // Essential cookies are always allowed if consent exists
    if (category === 'essential') return true;
    return consent.preferences[category] || false;
  }
  
  return false;
}

// ── Check if analytics are allowed ──
export function isAnalyticsAllowed() {
  return isCategoryAllowed('analytics');
}

// ── Check if marketing cookies are allowed ──
export function isMarketingAllowed() {
  return isCategoryAllowed('marketing');
}

// ── Check if personalization is allowed ──
export function isPersonalizationAllowed() {
  return isCategoryAllowed('personalization');
}

// ── Get consent type (all, essential, custom) ──
export function getConsentType() {
  const consent = getCookieConsent();
  if (!consent) return 'none';
  if (typeof consent === 'string') return consent;
  if (typeof consent === 'object' && consent.type) return consent.type;
  return 'custom';
}

// ── Get all cookie preferences ──
export function getAllPreferences() {
  const consent = getCookieConsent();
  if (!consent) return null;
  if (typeof consent === 'string') {
    // Legacy format - return default preferences
    return {
      essential: true,
      analytics: consent === 'all',
      marketing: consent === 'all',
      preference: consent === 'all',
    };
  }
  if (typeof consent === 'object' && consent.preferences) {
    return consent.preferences;
  }
  return null;
}

// ── Get cookie count ──
export function getCookieCount() {
  return document.cookie.split(';').filter(c => c.trim()).length;
}

// ── Delete all cookies (except essential) ──
export function deleteNonEssentialCookies() {
  // Get all cookies
  const cookies = document.cookie.split(';');
  
  // List of essential cookies to keep (add your essential cookie names here)
  const essentialCookies = ['adf_cookie_consent', 'session', 'csrf_token'];
  
  cookies.forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (!essentialCookies.includes(name)) {
      eraseCookie(name);
    }
  });
}

// ── Reset all consent ──
export function resetConsent() {
  eraseCookie('adf_cookie_consent');
  // Optionally delete non-essential cookies on reset
  deleteNonEssentialCookies();
}

// ── Check if consent is expired ──
export function isConsentExpired() {
  const consent = getCookieConsent();
  if (!consent) return true;
  
  if (typeof consent === 'object' && consent.timestamp) {
    const consentDate = new Date(consent.timestamp);
    const now = new Date();
    const daysDiff = (now - consentDate) / (1000 * 60 * 60 * 24);
    return daysDiff > 365; // Expire after 365 days
  }
  
  return false;
}