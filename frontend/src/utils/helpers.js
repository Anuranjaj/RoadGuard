import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useEffect } from "react";

/**
 * Merge class names safely with Tailwind CSS
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format numeric amount into Indian Rupee currency string (e.g., ₹1,200)
 */
export function inr(amount) {
  if (typeof amount !== "number" || isNaN(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

/**
 * Simple session storage key
 */
const SESSION_KEY = "roadguard.session";

/**
 * Get current logged in session
 */
export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY) || window.sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.token) return parsed;
      window.localStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
      clearLegacyDemoAuth();
      return null;
    }
    return null;
  } catch {
    return null;
  }
}

export function isAuthenticatedSession(session = getSession()) {
  return Boolean(session && session.token && session.id);
}

export function clearLegacyDemoAuth() {
  if (typeof window === "undefined") return;
  const legacyKeys = ["user", "currentUser", "roadguard-user", "roadguard-session", "auth", "token", "accessToken"];
  [window.localStorage, window.sessionStorage].forEach((storage) => {
    legacyKeys.forEach((key) => {
      try {
        if (storage.getItem(key) !== null) storage.removeItem(key);
      } catch {
        // ignore storage access errors
      }
    });
  });
}

/**
 * Sign in user and save session
 */
export function signIn(sessionData, rememberMe = true) {
  if (typeof window === "undefined") return;
  try {
    const destination = rememberMe ? window.localStorage : window.sessionStorage;
    const otherStorage = rememberMe ? window.sessionStorage : window.localStorage;
    otherStorage.removeItem(SESSION_KEY);
    destination.setItem(SESSION_KEY, JSON.stringify(sessionData));
    window.dispatchEvent(new Event("roadguard-session-change"));
  } catch (err) {
    console.error("Failed to save session", err);
  }
}

/**
 * Sign out user and clear session
 */
export function signOut() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
    clearLegacyDemoAuth();
    window.dispatchEvent(new Event("roadguard-session-change"));
  } catch (err) {
    console.error("Failed to remove session", err);
  }
}

export function clearSessionAndRedirect() {
  signOut();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

/**
 * React hook to listen for session changes
 */
export function useSession() {
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {
    const handleUpdate = () => setSession(getSession());
    window.addEventListener("roadguard-session-change", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("roadguard-session-change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return session;
}

/**
 * Get default home dashboard route for a specific user role
 */
export function homeFor(role) {
  if (role === "admin") return "/admin";
  if (role === "partner" || role === "mechanic") return "/mechanic";
  return "/owner";
}
