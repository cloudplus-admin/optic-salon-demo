/* Central client-side i18n runtime. Dictionaries are bundled once; language changes never use the network. */
(()=>{
  const supported=['ru','uz','en'],fallback='ru';
  const localeTags={ru:'ru-RU',uz:'uz-UZ',en:'en-GB'};
  const dictionaries=()=>window.MEDICA_LOCALES||{};
  const current=()=>{
    const fromState=window.state?.preferences?.language;
    if(supported.includes(fromState))return fromState;
    try{const saved=JSON.parse(localStorage.getItem('optica_preferences')||'{}').language;return supported.includes(saved)?saved:fallback}catch{return fallback}
  };
  const interpolate=(text,params={})=>String(text).replace(/\{(\w+)\}/g,(_,key)=>params[key]??`{${key}}`);
  const t=(key,params={})=>{
    const lang=current(),base=dictionaries()[fallback]||{},dict=dictionaries()[lang]||base;
    if(!(key in dict))console.warn(`[i18n] Missing ${lang} translation: ${key}`);
    if(!(key in base))console.warn(`[i18n] Missing fallback translation: ${key}`);
    return interpolate(dict[key]??base[key]??key,params);
  };
  const formatNumber=(value,options={})=>new Intl.NumberFormat(localeTags[current()],options).format(Number(value||0));
  const formatCurrency=(value,currency='UZS',options={})=>formatNumber(value,{style:'currency',currency,maximumFractionDigits:0,...options});
  const dateValue=value=>value instanceof Date?value:new Date(value);
  const formatDate=(value,options={day:'2-digit',month:'short',year:'numeric'})=>new Intl.DateTimeFormat(localeTags[current()],options).format(dateValue(value));
  const formatDateTime=(value,options={dateStyle:'short',timeStyle:'short'})=>new Intl.DateTimeFormat(localeTags[current()],options).format(dateValue(value));
  const formatPercent=(value,options={maximumFractionDigits:1})=>formatNumber(value,{style:'percent',...options});
  const systemAliases={
    'Черновик':'draft','В работе':'in_progress','Готов':'ready','Выдан':'issued','Отменён':'cancelled',
    'Требует обеспечения':'supply_required','Зарезервировано':'reserved','Ожидает обеспечения':'awaiting_supply',
    'Оплачено':'paid','Не оплачено':'unpaid','Наличные':'cash','Банковская карта':'card','Карта':'card','Смешанная':'mixed',
    'Оптика':'optical','Слух':'hearing','Протезирование':'prosthetics','Ортопедия':'orthopedics','Медтехника':'medical_equipment',
    'Оправа':'frame','Линза':'lens','Слуховой аппарат':'hearing_aid',
    'Работает':'working','На ТО':'maintenance','Ремонт':'repair','Списано':'decommissioned'
  };
  const systemCode=value=>systemAliases[value]||value;
  const system=(group,value)=>t(`${group}.${systemCode(value)}`);
  const audit=()=>{
    const all=dictionaries(),baseKeys=Object.keys(all[fallback]||{}),baseSet=new Set(baseKeys),errors=[];
    supported.forEach(lang=>{
      const dict=all[lang]||{};
      baseKeys.forEach(key=>{if(!(key in dict)){errors.push(`${lang}:missing:${key}`);console.warn(`[i18n] Missing ${lang} translation: ${key}`)}});
      Object.keys(dict).forEach(key=>{if(!baseSet.has(key)){errors.push(`${lang}:extra:${key}`);console.warn(`[i18n] Extra ${lang} translation: ${key}`)}});
      Object.entries(dict).forEach(([key,value])=>{if(typeof value!=='string'||!value.trim()){errors.push(`${lang}:empty:${key}`);console.warn(`[i18n] Empty ${lang} translation: ${key}`)}});
    });
    if(errors.length)console.warn('[i18n] Dictionary audit failed',errors);
    return errors;
  };
  window.MedicaI18n={supported,fallback,current,t,system,systemCode,formatNumber,formatCurrency,formatDate,formatDateTime,formatPercent,audit};
  window.t=t;
})();
