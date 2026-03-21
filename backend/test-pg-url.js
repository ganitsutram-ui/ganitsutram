const { parse } = require('pg-connection-string');

const urls = [
  "postgresql://postgres:pass@base@db.qgngvquybdxtdmcchdtl.supabase.co:5432/postgres",
  "postgresql://postgres:pass@base.something@db",
  "postgresql://postgres:base@db...",
  "postgresql://base:pass@db...",
];

urls.forEach(u => {
  try {
    const config = parse(u);
    console.log("URL:", u);
    console.log("Host:", config.host);
  } catch (e) {
    console.log("Error on", u, e.message);
  }
});
