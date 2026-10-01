import assert from 'node:assert/strict';
import {readFile,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>readFile(path.join(root,p),'utf8');
const baseline=JSON.parse(await read('design/migration-baseline.json'));
const before=await readFile(path.resolve(root,baseline.backup,'src/prototype.html'),'utf8');
const current=await read('src/prototype.html');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
assert.equal(hash(before),baseline.sourceSha256,'Backup must match recorded source');
// Retained base prototype: approved home removals and presentation edits only.
// Find and Chats are mounted by the separate integration layer; their tests live in tests/sections.test.mjs.
const expected=before.replace('"Ассистент":"assistant"','"Чаты":"assistant"').replace('<span class="k3-room">Номер 412</span>', '<span class="k3-room"><span class="k3-room-label">Номер</span> <b class="k3-room-number">412</b></span>');
const expectedWithApprovedHomeEdits=expected.replace(/      <button class="(?:k3-service-cta|k3-feedback|k3-alert)"[^>]*>.*?<\/button>\n/g, '').replace(/      <div class="k3-section-head"><h2>Маршрут поездки<\/h2><button data-info="route">Целиком<\/button><\/div>\n      <section class="k3-route">[\s\S]*?      <\/section>\n/, "");
assert.equal(current,expectedWithApprovedHomeEdits,'All original markup, content, scenarios and handlers must remain unchanged except the menu label alias, presentational room-number spans and approved home block removals');
const scripts=s=>[...s.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
const oldDist=await readFile(path.resolve(root,baseline.backup,'dist/index.html'),'utf8');
const newDist=await read('dist/index.html');
assert.deepEqual(scripts(newDist),scripts(oldDist).map(s=>s.replace('"Ассистент":"assistant"','"Чаты":"assistant"')),'Original inline application scripts must be preserved in the build');
assert.equal((current.match(/<span>Чаты<\/span>/g)||[]).length,5);
assert.ok(!/<button[^>]*class="[^"]*(?:k3|kp|kf|ktd|ksd)-tab[^>]*>[\s\S]*?<span>Профиль<\/span><\/button>/.test(current.replace(/<script[\s\S]*?<\/script>/g,'')),'Profile tab must remain removed');
assert.match(newDist,/arbana\/tokens.css/);assert.match(newDist,/arbana\/theme.css/);assert.match(newDist,/arbana\/icons.js/);
const css=await read('dist/arbana/tokens.css');for(const [,url]of css.matchAll(/url\(([^)]+)\)/g))assert.ok((await stat(path.join(root,'dist/arbana',url))).size>0);
const icons=await read('dist/arbana/icons.js');assert.ok(!icons.includes('addEventListener'),'Presentation-only icon adapter must not intercept user actions');
const results={passed:true,sourcePreservedExceptApprovedPresentationAndChatAlias:true,originalInlineScriptsPreserved:scripts(newDist).length,backup:baseline.backup,sourceSha256:hash(current),palette:'#2c5deb',font:'Golos Text Variable',navigation:['Поездки','Найти','Чаты','Выгоды'],historicalBaselineBrowserChecks:['Digital key: ready → Face ID → connection → success → home','Hotel services: catalogue → food → cart → order accepted','Search: results → hotel details; fixed CTA clears bottom navigation','Chats: original assistant screen → prompt → send feedback','Benefits: rules sheet opens, scrolls and closes','Profile accessible through home avatar','Ticket: manual input → found → saved notification','Feedback: five stars → details → submitted → home','Trip timeline and share menu open','375 × 812: no horizontal overflow, navigation visible, forms reachable'],scope:'Base prototype preservation check. Find and Chats are replaced at runtime by the Arbana module; see tests/sections.test.mjs and design/sections-verification.json for current integration checks.'};
await writeFile(path.join(root,'design/verification.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
