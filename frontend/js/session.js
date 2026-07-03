const API_BASE = "http://127.0.0.1:8000";

function getUserId() {
  const userId = localStorage.getItem("user_id");
  if (!userId || userId === "undefined") {
    return null;
  }
  return userId;
}

function requireLogin(redirectTo = "login.html") {
  if (!getUserId()) {
    alert("กรุณาเข้าสู่ระบบก่อนใช้งาน");
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

function getUserName() {
  return localStorage.getItem("user_name") || "ผู้ใช้";
}

function setUserNameDisplay(root = document) {
  const el = root.querySelector("[data-user-name]");
  if (el) {
    el.textContent = getUserName();
  }
}

function getAuthHeaders(extraHeaders = {}) {
  return {
    "X-User-Id": getUserId() || "",
    ...extraHeaders,
  };
}

function clearSession() {
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_name");
  localStorage.removeItem("token");
  localStorage.removeItem("image");
}
