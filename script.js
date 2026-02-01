const calcBtn = document.getElementById("calcBtn");
const heightInput = document.getElementById("height");
const nameInput = document.getElementById("name");
const cityInput = document.getElementById("city");
const ageInput = document.getElementById("age");
const weightInput = document.getElementById("weight");
const result = document.getElementById("result");

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
    await fetch("/.netlify/functions/saveUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Ignore save errors so the UI still works.
  }
};

calcBtn.addEventListener("click", async () => {
  const height = parseFloat(heightInput.value);
  const name = (nameInput.value || "").trim();
  const city = (cityInput.value || "").trim();
  const age = parseFloat(ageInput.value);
  const weight = parseFloat(weightInput.value);

  if (!height || !weight || !age || !name || !city) {
    result.textContent =
      "Please enter a name, city, height, age, and weight.";
    return;
  }

  result.textContent = "Calculating...";

  const data = await calculateBmiWithAge(height, weight, age);
  if (data.error) {
    result.textContent = data.error;
    return;
  }

  await saveUserData({
    name,
    age,
    city,
    height,
    weight,
    bmi: data.bmi,
    ageAdjustedBmi: data.ageAdjustedBmi,
  });

  const niceName =
    name.toLowerCase().startsWith("a") || name.toLowerCase().startsWith("s")
      ? " Nice name"
      : "";
  result.textContent = `Hi ${name} from ${city}, you are ${age} years old. Your BMI is ${data.bmi} (age-adjusted: ${data.ageAdjustedBmi}).${niceName}`;
});
