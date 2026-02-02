const calcBtn = document.getElementById("calcBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("authStatus");
const authGate = document.getElementById("authGate");
const app = document.getElementById("app");
const heightInput = document.getElementById("height");
const ageInput = document.getElementById("age");
const weightInput = document.getElementById("weight");
const result = document.getElementById("result");
const saveStatus = document.getElementById("saveStatus");

const calculateBmiWithAge = async (height, weight, age) => {
  try {
    const response = await fetch("/.netlify/functions/bmi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ height, weight, age }),
    });

    if (!response.ok) {
      throw new Error("Backend error");
    }

    return await response.json();
  } catch (error) {
    return { error: "Could not reach backend. Try again." };
  }
};

const saveUserData = async (payload) => {
  try {
    const response = await fetch("/.netlify/functions/saveUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      return { ok: true };
    }
    const data = await response.json().catch(() => ({}));
    return { ok: false, error: data.detail || data.error || "Save failed" };
  } catch (error) {
    return { ok: false, error: "Network error" };
  }
};

const saveAuthUser = async (payload) => {
  try {
    const response = await fetch("/.netlify/functions/saveUserAuth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

const initAuth = () => {
  if (!window.netlifyIdentity) {
    authStatus.textContent = "Login unavailable.";
    return;
  }

  const showApp = () => {
    authGate.classList.add("hidden");
    app.classList.remove("hidden");
  };

  const showGate = () => {
    authGate.classList.remove("hidden");
    app.classList.add("hidden");
  };

  loginBtn.addEventListener("click", () =>
    window.netlifyIdentity.open("login")
  );

  logoutBtn.addEventListener("click", () =>
    window.netlifyIdentity.logout()
  );

  window.netlifyIdentity.on("init", (user) => {
    if (user) {
      authStatus.textContent = `Logged in as ${user.email}.`;
      authStatus.style.color = "#2d6a4f";
      showApp();
    } else {
      authStatus.textContent = "Please log in to continue.";
      authStatus.style.color = "#b00020";
      showGate();
      window.netlifyIdentity.open("login");
    }
  });

  window.netlifyIdentity.on("login", async (user) => {
    const saved = await saveAuthUser({
      id: user?.id,
      email: user?.email,
      name: user?.user_metadata?.full_name || user?.user_metadata?.name || "",
      provider: user?.app_metadata?.provider || "google",
    });

    authStatus.textContent = saved
      ? `Logged in as ${user.email}.`
      : "Logged in, but could not save user profile.";
    authStatus.style.color = saved ? "#2d6a4f" : "#b00020";
    showApp();
    window.netlifyIdentity.close();
  });

  window.netlifyIdentity.on("logout", () => {
    authStatus.textContent = "Logged out.";
    authStatus.style.color = "#2d6a4f";
    showGate();
    window.netlifyIdentity.open("login");
  });

  window.netlifyIdentity.init();
};

initAuth();

calcBtn.addEventListener("click", async () => {
  const height = parseFloat(heightInput.value);
  const age = parseFloat(ageInput.value);
  const weight = parseFloat(weightInput.value);

  if (!height || !weight || !age) {
    result.textContent = "Please enter a valid age and weight.";
    saveStatus.textContent = "";
    return;
  }

  result.textContent = "Calculating...";

  const data = await calculateBmiWithAge(height, weight, age);
  if (data.error) {
    result.textContent = data.error;
    saveStatus.textContent = "";
    return;
  }

  const saveResult = await saveUserData({
    age,
    height,
    weight,
    bmi: data.bmi,
    ageAdjustedBmi: data.ageAdjustedBmi,
  });

  result.textContent = `You are ${age} years old. Your BMI is ${data.bmi} (age-adjusted: ${data.ageAdjustedBmi}).`;
  if (saveResult.ok) {
    saveStatus.textContent = "Saved to database.";
    saveStatus.style.color = "#2d6a4f";
  } else {
    saveStatus.textContent = `Could not save to database: ${saveResult.error}`;
    saveStatus.style.color = "#b00020";
  }
});
