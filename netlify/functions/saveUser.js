const { Client } = require("pg");

exports.handler = async (event) => {
  try {
    const { name, age, city, height, weight, bmi, ageAdjustedBmi } = JSON.parse(
      event.body || "{}"
    );

    if (!name || !age || !city || !height || !weight || !bmi || !ageAdjustedBmi) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid input" }),
      };
    }

    const client = new Client({
      connectionString: process.env.NEON_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    await client.query(`
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
    `);

    await client.query(
      `INSERT INTO bmi_users (name, age, city, height, weight, bmi, age_adjusted_bmi)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [name, age, city, height, weight, bmi, ageAdjustedBmi]
    );

    await client.end();

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "DB error" }),
    };
  }
};

