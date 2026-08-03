import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=['index.html','app.js','enterprise.js','overhaul.js'];
const allowed=[
  /(?:name|client|doctor|employee|supplier|brand|model|address|salon|branch)\s*:/i,
  /(?:Тимур|Данияр|Сергей|Ильхом|Анна|Екатерина|Самарканд|Юнусабад|Абая|Mega)/
];
const findings=[];
for(const file of files){
  const lines=fs.readFileSync(path.join(root,file),'utf8').split(/\r?\n/);
  lines.forEach((line,index)=>{
    if(!/[А-Яа-яЁё]/.test(line)||allowed.some(rule=>rule.test(line)))return;
    if(/data-i18n(?:-[\w-]+)?=/.test(line))return;
    findings.push(`${file}:${index+1}: ${line.trim().slice(0,180)}`);
  });
}
if(findings.length){console.error(`Direct Cyrillic UI audit failed (${findings.length} lines).\n${findings.join('\n')}`);process.exit(1)}
console.log('Direct Cyrillic UI audit passed.');
