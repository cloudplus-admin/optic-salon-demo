import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'locales','ui.js'),'utf8'),context);
const keys=context.window.MEDICA_LEGACY_KEYS||{};
const file=path.join(root,'index.html');
let source=fs.readFileSync(file,'utf8');
const escaped=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
for(const [text,key] of Object.entries(keys).sort((a,b)=>b[0].length-a[0].length)){
  const token=escaped(text);
  source=source.replace(new RegExp(`<([a-z][^<>]*?)(?<!data-i18n=[^>]*)>(\\s*)${token}(\\s*)<\\/([a-z][^>]*)>`,'gi'),(all,open,before,after,close)=>{
    const tag=open.trim().split(/\s/)[0];if(close.trim().split(/\s/)[0].toLowerCase()!==tag.toLowerCase()||/data-i18n=/.test(open))return all;
    return `<${open} data-i18n="${key}">${before}${text}${after}</${close}>`;
  });
  for(const [attr,dataAttr] of [['placeholder','data-i18n-placeholder'],['title','data-i18n-title'],['aria-label','data-i18n-aria-label']]){
    source=source.replace(new RegExp(`${attr}="${token}"`,'g'),`${attr}="${text}" ${dataAttr}="${key}"`);
  }
}
fs.writeFileSync(file,source);
