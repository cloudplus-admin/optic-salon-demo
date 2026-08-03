import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const context={window:{MEDICA_LOCALES:{}}};
vm.createContext(context);
for(const lang of ['ru','uz','en'])vm.runInContext(fs.readFileSync(path.join(root,'locales',`${lang}.js`),'utf8'),context,{filename:`${lang}.js`});
const dictionaries=context.window.MEDICA_LOCALES;
const baseKeys=Object.keys(dictionaries.ru||{}).sort();
const baseSet=new Set(baseKeys);
const errors=[];
for(const lang of ['ru','uz','en']){
  const dict=dictionaries[lang]||{};
  for(const key of baseKeys)if(!(key in dict))errors.push(`${lang}: missing ${key}`);
  for(const key of Object.keys(dict))if(!baseSet.has(key))errors.push(`${lang}: extra ${key}`);
  for(const [key,value] of Object.entries(dict))if(typeof value!=='string'||!value.trim())errors.push(`${lang}: empty ${key}`);
}
const runtimeFiles=['index.html','app.js','enterprise.js','overhaul.js'];
for(const file of runtimeFiles){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  if(/Intl\.(?:DateTimeFormat|NumberFormat)\(\s*undefined/.test(source))errors.push(`${file}: Intl formatter uses undefined locale`);
  if(/\.toLocaleString\(\s*\)/.test(source))errors.push(`${file}: toLocaleString() uses implicit locale`);
}
if(errors.length){console.error(`i18n validation failed (${errors.length})\n${errors.join('\n')}`);process.exit(1)}
console.log(`i18n validation passed: ${baseKeys.length} identical, non-empty keys in ru/uz/en`);
