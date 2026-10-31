const {test} = require('node:test');
const assert = require('node:assert/strict');
const {validate} = require('./result.cjs');
const sha = 'a'.repeat(40);
const pass = () => ({head_sha:sha, verdict:'pass',summary:'Reviewed',findings:[]});
test('accepts clean result',()=>assert.equal(validate(pass(),sha).verdict,'pass'));
test('rejects stale SHA',()=>assert.throws(()=>validate(pass(),'b'.repeat(40))));
test('rejects malformed output',()=>assert.throws(()=>validate({},sha)));
test('blockers cannot pass',()=>{
 const r=pass(); r.findings=[{id:'ime',priority:'P2',path:'a.ts',line:1,body:'Evidence'}];
 assert.throws(()=>validate(r,sha)); r.verdict='changes_requested'; assert.equal(validate(r,sha).verdict,'changes_requested');
});
test('rejects empty changes-requested verdict',()=>assert.throws(()=>validate({...pass(),verdict:'changes_requested'},sha)));
test('nonblocking P3 may pass',()=>validate({...pass(),findings:[{id:'note',priority:'P3',path:'a.ts',line:1,body:'Optional'}]},sha));
