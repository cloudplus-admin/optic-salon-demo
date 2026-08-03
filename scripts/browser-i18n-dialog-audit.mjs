import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/home/clodplus1/openclaw-workspace/argus-crm/node_modules/playwright');
const baseURL=process.env.MEDICA_URL||'http://127.0.0.1:8765';
const executablePath=process.env.CHROMIUM_PATH||'/home/clodplus1/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome';
const browser=await chromium.launch({headless:true,executablePath});
const findings=[];
const allowed=/^(?:[А-ЯЁ]{1,3}|[A-ZА-ЯЁ][\p{L}'’.-]+(?:\s+[A-ZА-ЯЁ][\p{L}'’.-]+){1,3}|(?:Good afternoon|Xayrli kun),\s+[А-ЯЁ][\p{L}'’.-]+)$/u;
const inspect=async(page,scope)=>{
  const values=await page.locator(`${scope} *:visible`).evaluateAll(nodes=>nodes.flatMap(node=>{
    if(node.closest('script,style,[data-user-content],[data-content-type="person-name"]'))return [];
    const values=[];
    if(node.children.length===0)values.push((node.textContent||'').trim());
    for(const attribute of ['placeholder','title','aria-label'])values.push((node.getAttribute(attribute)||'').trim());
    if(/^(?:BUTTON|INPUT)$/.test(node.tagName)&&node.getAttribute('type')!=='hidden')values.push((node.getAttribute('value')||'').trim());
    return values.filter(text=>/[А-Яа-яЁё]/.test(text));
  }));
  return [...new Set(values)];
};
try{
  for(const lang of ['uz','en']){
    const context=await browser.newContext();
    await context.addInitScript(language=>localStorage.setItem('optica_preferences',JSON.stringify({language,theme:'light'})),lang);
    const page=await context.newPage();
    await page.goto(baseURL,{waitUntil:'networkidle'});
    for(const text of await inspect(page,'body'))if(!allowed.test(text))findings.push(`${lang}/dashboard ${text}`);
    const scenarios=[
      ['orders','[data-open-order]','#orderDialog'],
      ['prescriptions','[data-new-rx]','#entityDialog'],
      ['clients','#moduleCreate','#entityDialog'],
      ['registry','[data-new-appointment]','#entityDialog'],
      ['lenscare','[data-new-lens]','#entityDialog'],
      ['service','#moduleCreate','#entityDialog'],
      ['suppliers','#moduleCreate','#entityDialog'],
      ['equipment','[data-new-eq]','#entityDialog'],
      ['catalog','#moduleCreate','#entityDialog'],
      ['invoices','#moduleCreate','#entityDialog'],
      ['directories','#moduleCreate','#entityDialog'],
      ['employees','#moduleCreate','#entityDialog'],
      ['serials','[data-kit]','#entityDialog'],
      ['inventory','[data-inventory-count]','#entityDialog'],
      ['wholesale','[data-new-wholesale]','#entityDialog'],
      ['wholesale','[data-new-wholesale-order]','#entityDialog']
    ];
    for(const [section,trigger,dialog] of scenarios){
      await page.locator(`[data-page="${section}"]`).click();
      const action=page.locator(`${trigger}:visible`).first();
      if(!await action.count())continue;
      await action.click({timeout:3000});
      await page.waitForTimeout(50);
      if(!await page.locator(`${dialog}[open]`).count())continue;
      for(const text of await inspect(page,dialog))if(!allowed.test(text))findings.push(`${lang}/${section} ${text}`);
      await page.locator(dialog).evaluate(node=>node.close());
    }
    await context.close();
  }
}finally{await browser.close()}
const unique=[...new Set(findings)];
if(unique.length){console.error(`Dialog Cyrillic audit failed (${unique.length})\n${unique.join('\n')}`);process.exit(1)}
console.log('Dashboard and dialog Cyrillic audit passed in UZ and EN.');
