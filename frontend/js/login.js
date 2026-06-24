const AUTH_API_URL = "http://127.0.0.1:8000/auth";
let forgotCitizenId = "";
let forgotEmail = "";
let forgotOtp = "";

const forgotPasswordLink = document.getElementById("forgotPasswordLink");

forgotPasswordLink?.addEventListener("click", openForgotPassword);
forgotPasswordLink?.addEventListener("keydown", function (e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    openForgotPassword();
  }
});

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const citizen_id = document.getElementById("citizen_id").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!citizen_id || !password) {
    alert("กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  try {
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ citizen_id, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.detail || "เข้าสู่ระบบไม่สำเร็จ");
      return;
    }

    localStorage.setItem("citizen_id", citizen_id);
    localStorage.setItem("user_name", data.name);

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    alert("เข้าสู่ระบบสำเร็จ");
    window.location.replace("home.html");
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
  }
});

function registerUser() {
  const citizen_id = document.getElementById("reg_citizen_id").value.trim();
  const password = document.getElementById("reg_password").value.trim();
  const confirm_password = document.getElementById("reg_confirm_password").value.trim();
  const first_name = document.getElementById("reg_first_name").value.trim();
  const last_name = document.getElementById("reg_last_name").value.trim();
  const birth_date = document.getElementById("reg_birth_date").value;
  const phone = document.getElementById("reg_phone").value.trim();

  if (!citizen_id || !password || !confirm_password || !first_name || !last_name) {
    alert("กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  if (password !== confirm_password) {
    alert("รหัสผ่านไม่ตรงกัน");
    return;
  }

  fetch(`${AUTH_API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      citizen_id,
      password,
      confirm_password,
      full_name: `${first_name} ${last_name}`,
      birth_date,
      phone,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.detail) {
        alert(data.detail);
        return;
      }

      alert("สมัครสำเร็จ");
      document.querySelectorAll("#registerPanel input").forEach((input) => {
        input.value = "";
      });
      closeRegister();
    })
    .catch((err) => {
      console.error("REGISTER ERROR:", err);
      alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
    });
}

function closeAllPanels() {
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.remove("active");
  });
}

function openRegister() {
  closeAllPanels();
  document.getElementById("registerPanel").classList.add("active");
}

function closeRegister() {
  document.getElementById("registerPanel").classList.remove("active");
}

function setForgotStep(stepId) {
  document.querySelectorAll(".forgot-step").forEach((step) => {
    step.classList.remove("active");
  });
  document.getElementById(stepId).classList.add("active");
}

function openForgotPassword() {
  forgotCitizenId = "";
  forgotEmail = "";
  forgotOtp = "";
  setForgotStep("forgotStepCitizen");
  closeAllPanels();
  document.getElementById("forgotPasswordPanel").classList.add("active");
}

function closeForgotPassword() {
  document.getElementById("forgotPasswordPanel").classList.remove("active");
}

async function checkForgotCitizen() {
  const citizen_id = document.getElementById("forgot_citizen_id").value.trim();

  if (!citizen_id) {
    alert("กรุณากรอกเลขบัตรประชาชน");
    return;
  }

  try {
    const response = await fetch(`${AUTH_API_URL}/forgot-password/check-citizen`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ citizen_id }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.detail || "ไม่พบบัญชีผู้ใช้");
      return;
    }

    forgotCitizenId = citizen_id;
    setForgotStep("forgotStepEmail");
  } catch (err) {
    console.error("CHECK CITIZEN ERROR:", err);
    alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
  }
}

async function requestForgotOtp() {
  const email = document.getElementById("forgot_email").value.trim();

  if (!forgotCitizenId) {
    setForgotStep("forgotStepCitizen");
    return;
  }

  if (!email) {
    alert("กรุณากรอก Gmail หรืออีเมล");
    return;
  }

  try {
    const response = await fetch(`${AUTH_API_URL}/forgot-password/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        citizen_id: forgotCitizenId,
        email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.detail || "ส่ง OTP ไม่สำเร็จ");
      return;
    }

    forgotEmail = email;
    alert(data.message || "ส่งรหัส OTP แล้ว");
    setForgotStep("forgotStepOtp");
  } catch (err) {
    console.error("REQUEST OTP ERROR:", err);
    alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
  }
}

function verifyForgotOtp() {
  const otp = document.getElementById("forgot_otp").value.trim();

  if (!otp) {
    alert("กรุณากรอกรหัส OTP");
    return;
  }

  if (!/^\d{6}$/.test(otp)) {
    alert("กรุณากรอกรหัส OTP 6 หลัก");
    return;
  }

  forgotOtp = otp;
  setForgotStep("forgotStepNewPassword");
}

async function resetForgotPassword() {
  const new_password = document.getElementById("forgot_new_password").value.trim();
  const confirm_password = document.getElementById("forgot_confirm_password").value.trim();

  if (!forgotOtp) {
    setForgotStep("forgotStepOtp");
    alert("กรุณากรอกรหัส OTP ก่อน");
    return;
  }

  if (!new_password || !confirm_password) {
    alert("กรุณากรอกข้อมูลให้ครบ");
    return;
  }

  if (new_password !== confirm_password) {
    alert("รหัสผ่านใหม่ไม่ตรงกัน");
    return;
  }

  try {
    const response = await fetch(`${AUTH_API_URL}/forgot-password/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        citizen_id: forgotCitizenId,
        email: forgotEmail,
        otp: forgotOtp,
        new_password,
        confirm_password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.detail || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
      return;
    }

    alert(data.message || "เปลี่ยนรหัสผ่านสำเร็จ");
    document.querySelectorAll("#forgotPasswordPanel input").forEach((input) => {
      input.value = "";
    });
    closeForgotPassword();
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    alert("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
  }
}

function togglePassword() {
  const input = document.getElementById("password");
  input.type = input.type === "password" ? "text" : "password";
}

window.addEventListener("load", () => {
  const citizenId = localStorage.getItem("citizen_id");

  if (citizenId) {
    window.location.replace("home.html");
  }
});

function logout() {
  localStorage.removeItem("citizen_id");
  localStorage.removeItem("user_name");
  localStorage.removeItem("token");
  localStorage.removeItem("image");

  window.location.replace("login.html");
}
