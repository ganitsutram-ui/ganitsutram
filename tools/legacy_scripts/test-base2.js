const { parse } = require('pg-connection-string');

try {
  console.log(parse("[YOUR-PASSWORD]"));
} catch (e) {
  console.log("Error:", e.message);
}
