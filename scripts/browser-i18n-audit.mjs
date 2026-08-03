import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const playwrightPath=process.env.PLAYWRIGHT_MODULE||'/home/clodplus1/openclaw-workspace/argus-crm/node_modules/playwright';
const {chromium}=require(playwrightPath);

const baseURL=process.env.MEDICA_URL||'http://127.0.0.1:4173';
const executablePath=process.env.CHROMIUM_PATH||'/home/clodplus1/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const pages=['dashboard','orders','clients','registry','encounters','prescriptions','lenscare','production','service','cash','catalog','stock','serials','inventory','invoices','suppliers','labels','wholesale','installments','branches','equipment','reports','analytics','directories','employees','settings'];
const allowed=/^(?:[А-ЯЁ]{1,3}|[\d\s№+.,:;()/%–—−→↑↓·₽$€]+|[A-ZА-ЯЁ][\p{L}'’.-]+(?:\s+[A-ZА-ЯЁ][\p{L}'’.-]+){1,3}|[A-ZА-ЯЁ][\p{L}'’.-]+(?:\s+[A-ZА-ЯЁ][\p{L}'’.-]+){1,3}\s*·\s*\+?[\d\s()+-]+|(?:Medica|MEDICA|UZS|SMS|QR|OD|OS|PD|SPH|CYL|AXIS|ADD|Prism|Visus|Essilor|Ray-Ban|Mega Center).*)$/u;
const browser=await chromium.launch({headless:true,executablePath});
const findings=[];
try{
  for(const lang of ['uz','en']){
    const context=await browser.newContext();
    await context.addInitScript(language=>localStorage.setItem('optica_preferences',JSON.stringify({language,theme:'light'})),lang);
    const page=await context.newPage();
    await page.goto(baseURL,{waitUntil:'networkidle'});
    for(const section of pages){
      if(section==='dashboard')await page.locator('[data-page="dashboard"]').click();else await page.locator(`[data-page="${section}"]`).click();
      await page.waitForTimeout(80);
      const values=await page.locator('body *:visible').evaluateAll(nodes=>nodes.filter(node=>node.children.length===0&&!node.closest('script,style,[data-user-content]')).map(node=>({text:(node.textContent||'').trim(),tag:node.tagName})).filter(item=>/[А-Яа-яЁё]/.test(item.text)));
      for(const item of values)if(!allowed.test(item.text))findings.push(`${lang}/${section} <${item.tag.toLowerCase()}> ${item.text}`);
    }
    await context.close();
  }
}finally{await browser.close()}
const unique=[...new Set(findings)];
if(unique.length){console.error(`Visible Cyrillic audit failed (${unique.length})\n${unique.join('\n')}`);process.exit(1)}
console.log(`Visible Cyrillic audit passed for ${pages.length} sections in UZ and EN.`);
