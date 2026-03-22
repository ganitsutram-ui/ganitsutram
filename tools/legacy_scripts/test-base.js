/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

const { parse } = require('pg-connection-string');

const tests = [
  "base",
  "postgres://base",
  "postgresql://base",
  "base://something",
  "postgresql://postgres:password@base:5432/db",
  "postgresql://postgres@base",
  "postgresql://:password@base"
];

tests.forEach(t => {
  try {
    const c = parse(t);
    if (c.host === 'base') console.log("MATCH:", t);
  } catch(e) {}
});
