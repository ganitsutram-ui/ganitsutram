/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

const { parse } = require('pg-connection-string');

try {
  console.log(parse("[YOUR-PASSWORD]"));
} catch (e) {
  console.log("Error:", e.message);
}
