const { neon } = require("@netlify/neon");

exports.handler = async (event) => {
  try {
    const { id, email, name, provider } = JSON.parse(event.body || "{}");

    if (!id || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid input" }),
      };
    }

    const sql = neon();

    await sql`
      CREATE TABLE IF NOT EXISTS auth_users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT,
        provider TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      INSERT INTO auth_users (id, email, name, provider)
      VALUES (${id}, ${email}, ${name || null}, ${provider || null})
      ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          name = EXCLUDED.name,
          provider = EXCLUDED.provider
    `;

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (error) {
    console.error("SaveUserAuth error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "DB error",
        detail: error && error.message ? error.message : "Unknown error",
      }),
    };
  }
};

