const tc = '  "type": "service_account",';
try {
  JSON.parse(tc);
} catch (e) {
  console.log(e.message);
}
