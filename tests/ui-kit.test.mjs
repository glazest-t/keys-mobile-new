import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import vm from 'node:vm';
import {components,scenarios,motion} from '../src/ui-kit-key/registry.mjs';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('UI kit documents every family with a source, states, events and a portable example',async()=>{
 const templates=await read('src/ui-kit-key/templates.js');const icons=JSON.parse(await read('src/arbana/icons.json'));
 const context={window:{KEY_DATA:{icons}}};vm.runInNewContext(templates,context);
 assert.equal(new Set(components.map(c=>c.id)).size,components.length);
 for(const c of components){assert.ok(c.source&&c.props.length&&c.states.length&&c.rules.length,c.id);assert.equal(typeof context.window.KeyTemplates.demos[c.id],'function',c.id);assert.ok(context.window.KeyTemplates.demos[c.id]().length>30,c.id);for(const source of c.source.split('; '))await access(new URL('../'+source,import.meta.url));}
 assert.equal(scenarios.length,8);assert.equal(new Set(scenarios.map(s=>s.query)).size,8);
});
test('UI kit retains approved type, plain icons, light mode and reduced motion',async()=>{
 const css=await read('src/ui-kit-key/key.css');assert.match(css,/color-scheme:light/);assert.match(css,/\.k-tabs button\{[^}]*font-size:14px;line-height:21px;font-weight:500/);assert.match(css,/\.k-icon-slot\{[^}]*background:none;border:0;border-radius:0;box-shadow:none/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css,/\.k-input\{[^}]*font-size:16px;line-height:24px/);
 for(const m of motion){assert.ok(m.duration>0&&m.source&&m.reduced,m.id);}
});
test('UI kit export is scoped to its build and removes deployment map credentials',async()=>{
 const build=await read('scripts/build-ui-kit.mjs'),exporter=await read('scripts/export-ui-kit.py');assert.match(build,/globalThis.KeysMapsConfig=\{apiKey:\\?"\\?",styleId:\\?"\\?"\}/);assert.match(exporter,/source=root\/'dist\/ui-kit'/);assert.match(exporter,/Refusing to export nonempty map configuration/);
});
