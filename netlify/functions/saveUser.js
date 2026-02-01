const { neon } = require("@netlify/neon");

exports.handler = async (event) => {
  try {
    const { name, age, city, height, weight, bmi, ageAdjustedBmi } = JSON.parse(
      event.body || "{}"
    );

    if (!age || !height || !weight || !bmi || !ageAdjustedBmi) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid input" }),
      };
    }

    const sql = neon();

    await sql`
      CREATE TABLE IF NOT EXISTS bmi_users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        age INT,
        city TEXT,
        height NUMERIC,
        weight NUMERIC,
        bmi NUMERIC,
        age_adjusted_bmi NUMERIC,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      INSERT INTO bmi_users (name, age, city, height, weight, bmi, age_adjusted_bmi)
      VALUES (${name || null}, ${age}, ${city || null}, ${height}, ${weight}, ${bmi}, ${ageAdjustedBmi})
    `;

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (error) {
    console.error("SaveUser error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "DB error",
        detail: error && error.message ? error.message : "Unknown error",
      }),
    };
  }
};

