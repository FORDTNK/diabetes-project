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

  setupProfileMenu(root);
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

function logoutUser() {
  clearSession();
  window.location.href = "login.html";
}

function setupProfileMenu(root = document) {
  const profiles = root.querySelectorAll(".profile");

  profiles.forEach((profile) => {
    if (profile.dataset.logoutReady === "true") {
      return;
    }

    profile.dataset.logoutReady = "true";
    profile.setAttribute("role", "button");
    profile.setAttribute("tabindex", "0");
    profile.setAttribute("aria-label", "\u0e40\u0e21\u0e19\u0e39\u0e42\u0e1b\u0e23\u0e44\u0e1f\u0e25\u0e4c");

    const menu = document.createElement("div");
    menu.className = "profile-menu";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "profile-menu__logout";
    button.textContent = "\u0e2d\u0e2d\u0e01\u0e08\u0e32\u0e01\u0e23\u0e30\u0e1a\u0e1a";

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      logoutUser();
    });

    menu.appendChild(button);
    profile.appendChild(menu);

    const toggleMenu = (event) => {
      event.stopPropagation();
      closeProfileMenus(profile);
      profile.classList.toggle("profile--open");
    };

    profile.addEventListener("click", toggleMenu);
    profile.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleMenu(event);
      }
    });
  });
}

function closeProfileMenus(exceptProfile = null) {
  document.querySelectorAll(".profile.profile--open").forEach((profile) => {
    if (profile !== exceptProfile) {
      profile.classList.remove("profile--open");
    }
  });
}

document.addEventListener("click", () => {
  closeProfileMenus();
});
