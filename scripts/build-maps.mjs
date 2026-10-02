import {mkdir,cp,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
export async function buildMaps(){
 // Local browser key is ignored by Git; CI supplies the same settings through env.
 try{process.loadEnvFile(fileURLToPath(new URL('.env.local',root)));}catch(error){if(error.code!=='ENOENT')throw error;}
 await mkdir(new URL('dist/maps/',root),{recursive:true});
 await cp(new URL('src/maps/',root),new URL('dist/maps/',root),{recursive:true});
 const config={apiKey:process.env.KEYS_2GIS_API_KEY?.trim()||'',styleId:process.env.KEYS_2GIS_STYLE_ID?.trim()||''};
 await writeFile(new URL('dist/maps/config.js',root),'globalThis.KeysMapsConfig='+JSON.stringify(config)+';\n');
}
