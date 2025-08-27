// src/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function loginUser(email, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function registerUser(email, password) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

export async function getLicense(token) {
  const res = await fetch(`${API_URL}/license`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function refreshLicense(token) {
  const res = await fetch(`${API_URL}/license/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function subscribe(plan, token, mpEmail) {
  const res = await fetch(`${API_URL}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ plan, mpEmail })
  });
  return res.json();
}

export async function attachDevice(token, deviceId) {
  const res = await fetch(`${API_URL}/license/devices/attach`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ deviceId })
  });
  return res.json();
}

export async function detachDevice(token, deviceId) {
  const res = await fetch(`${API_URL}/license/devices/detach`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ deviceId })
  });
  return res.json();
}

export async function cancelSubscription(token) {
  const r = await fetch(`${API_URL}/subscription/cancel`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  return r.json();
}
export async function pauseSubscription(token) {
  const r = await fetch(`${API_URL}/subscription/pause`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  return r.json();
}
export async function resumeSubscription(token) {
  const r = await fetch(`${API_URL}/subscription/resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });
  return r.json();
}
export async function changePaymentMethod(token, { mpEmail, plan }) {
  const r = await fetch(`${API_URL}/subscription/change-method`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mpEmail, plan }),
  });
  return r.json();
}

/* === Agregamos un export agrupado llamado `api` para compatibilidad con useAuth.js === */
export const api = {
  loginUser,
  registerUser,
  getLicense,
  refreshLicense,
  subscribe,
  attachDevice,
  detachDevice,
   cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  changePaymentMethod,
};
