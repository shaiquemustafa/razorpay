const calcBtn = document.getElementById("calcBtn");
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

  result.textContent = `You are ${age} years old. Your BMI is ${data.bmi} (age-adjusted: ${data.ageAdjustedBmi}). Oh so you are cuite Dhriti.`;
  if (saveResult.ok) {
    saveStatus.textContent = "Saved to database.";
    saveStatus.style.color = "#2d6a4f";
  } else {
    saveStatus.textContent = `Could not save to database: ${saveResult.error}`;
    saveStatus.style.color = "#b00020";
  }
});
