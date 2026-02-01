exports.handler = async (event) => {
  try {
    const { height, weight, age } = JSON.parse(event.body || "{}");

    if (!height || !weight || !age) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid input" }),
      };
    }

    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);

    // For every year above 25, add +1 to BMI.
    const ageAdjustment = Math.max(0, age - 25);
    const ageAdjustedBmi = bmi + ageAdjustment;

    return {
      statusCode: 200,
      body: JSON.stringify({
        bmi: bmi.toFixed(2),
        ageAdjustedBmi: ageAdjustedBmi.toFixed(2),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" }),
    };
  }
};
