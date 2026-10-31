const fs = require('node:fs');
function validate(r, sha) {
  if (!r || r.head_sha !== sha || !/^[a-f0-9]{40}$/.test(sha) ||
      !['pass', 'changes_requested'].includes(r.verdict) ||
      typeof r.summary !== 'string' || !Array.isArray(r.findings)) throw Error('Invalid or stale review');
  const ids = new Set();
  for (const f of r.findings) {
    if (!f || typeof f.id !== 'string' || !f.id || ids.has(f.id) ||
        !['P0','P1','P2','P3'].includes(f.priority) ||
        typeof f.path !== 'string' || !Number.isInteger(f.line) || f.line < 1 ||
        typeof f.body !== 'string' || !f.body) throw Error('Invalid finding');
    ids.add(f.id);
  }
  const blocked = r.findings.some(f => f.priority !== 'P3');
  if ((r.verdict === 'changes_requested') !== blocked) throw Error('Inconsistent verdict');
  return r;
}
module.exports = { validate };
if (require.main === module) {
  const r = validate(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), process.argv[3]);
  console.log(JSON.stringify(r, null, 2));
  process.exitCode = r.verdict === 'pass' ? 0 : 2;
}
