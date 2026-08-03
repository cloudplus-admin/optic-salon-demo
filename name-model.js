(function(){
  const apostrophe=/['’‘ʻ`]/g;
  const sourceValues=new Set(['passport','manual','generated','imported']);
  const ruPairs=[['Евг','Evg'],['евг','evg'],['Илья','Ilya'],['илья','ilya'],['Дарья','Darya'],['дарья','darya'],['Татья','Tatya'],['татья','tatya'],['Юрий','Yuriy'],['юрий','yuriy']];
  const ruMap={А:'A',Б:'B',В:'V',Г:'G',Д:'D',Е:'E',Ё:'Yo',Ж:'Zh',З:'Z',И:'I',Й:'Y',К:'K',Л:'L',М:'M',Н:'N',О:'O',П:'P',Р:'R',С:'S',Т:'T',У:'U',Ф:'F',Х:'Kh',Ц:'Ts',Ч:'Ch',Ш:'Sh',Щ:'Shch',Ы:'Y',Э:'E',Ю:'Yu',Я:'Ya',Ь:'',Ъ:'',а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ы:'y',э:'e',ю:'yu',я:'ya',ь:'',ъ:''};
  const uzMap={Ғ:'G‘',Қ:'Q',Ў:'O‘',Ҳ:'H',Ш:'Sh',Ч:'Ch',ғ:'g‘',қ:'q',ў:'o‘',ҳ:'h',ш:'sh',ч:'ch'};
  function transliterate(value,language='ru'){
    let text=String(value||'');
    if(language==='ru')ruPairs.forEach(([from,to])=>text=text.replaceAll(from,to));
    const map=language==='uz'?{...ruMap,...uzMap}:ruMap;
    return [...text].map(char=>map[char]??char).join('').replace(/\s+/g,' ').trim();
  }
  function latinToCyrillic(value){
    const pairs=[['shch','щ'],['yo','ё'],['yu','ю'],['ya','я'],['ye','е'],['zh','ж'],['kh','х'],['ts','ц'],['ch','ч'],['sh','ш'],['g‘','ғ'],["g'",'ғ'],['o‘','ў'],["o'",'ў']];
    let out=String(value||'').toLowerCase().replace(apostrophe,"'");
    pairs.forEach(([from,to])=>out=out.replaceAll(from,to));
    const map={a:'а',b:'б',v:'в',g:'г',d:'д',e:'е',z:'з',i:'и',y:'й',k:'к',l:'л',m:'м',n:'н',o:'о',p:'п',r:'р',s:'с',t:'т',u:'у',f:'ф',h:'ҳ',q:'қ'};
    out=[...out].map(char=>map[char]??char).join('');
    return out.replace(/(^|[\s-])([а-яё])/gu,(_,prefix,char)=>prefix+char.toUpperCase());
  }
  function ensure(record){
    if(!record||typeof record!=='object')return record;
    record.nameOriginal ||= record.name || [record.firstName,record.lastName].filter(Boolean).join(' ');
    record.originalLanguage ||= /[ҒҚЎҲғқўҳ]/.test(record.nameOriginal)?'uz':/[А-Яа-яЁё]/.test(record.nameOriginal)?'ru':'other';
    record.nameLatin ||= /[A-Za-z]/.test(record.nameOriginal)?record.nameOriginal:transliterate(record.nameOriginal,record.originalLanguage);
    record.nameCyrillic ||= /[А-Яа-яЁё]/.test(record.nameOriginal)?record.nameOriginal:latinToCyrillic(record.nameOriginal);
    record.latinSource=sourceValues.has(record.latinSource)?record.latinSource:'generated';
    record.cyrillicSource=sourceValues.has(record.cyrillicSource)?record.cyrillicSource:(/[А-Яа-яЁё]/.test(record.nameOriginal)?'manual':'generated');
    record.latinVerified=Boolean(record.latinVerified||record.latinSource==='passport');
    record.cyrillicVerified=Boolean(record.cyrillicVerified||record.cyrillicSource==='passport');
    record.name=record.nameOriginal;
    return record;
  }
  function display(record,language=(window.MedicaI18n?.current?.()||'ru')){
    const item=ensure(record)||{};
    if(language==='ru')return (item.cyrillicVerified&&item.nameCyrillic)||item.nameOriginal||item.nameCyrillic||item.nameLatin||'';
    if(language==='uz')return (item.latinVerified&&item.nameLatin)||item.nameLatin||transliterate(item.nameOriginal,item.originalLanguage)||item.nameOriginal||'';
    return (item.latinSource==='passport'&&item.nameLatin)|| (item.latinVerified&&item.nameLatin)||item.nameLatin||transliterate(item.nameOriginal,item.originalLanguage)||item.nameOriginal||'';
  }
  function normalize(value){return String(value||'').normalize('NFKD').toLowerCase().replace(apostrophe,"'").replace(/o['‘’ʻ`]/g,'o').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ')}
  function variants(record){
    const item=ensure(record)||{},values=[item.nameOriginal,item.nameLatin,item.nameCyrillic,transliterate(item.nameOriginal,item.originalLanguage)];
    if(item.originalLanguage==='ru')values.push(String(item.nameLatin||'').replace(/^Ev/i,'Yev'),String(item.nameLatin||'').replace(/Yuriy/ig,'Yuri'));
    return [...new Set(values.filter(Boolean).map(normalize))];
  }
  function matches(record,query){const needle=normalize(query);return !needle||variants(record).some(value=>value.includes(needle))}
  window.MedicaNames={ensure,display,normalize,variants,matches,transliterate,latinToCyrillic,sources:['passport','manual','generated','imported']};
})();
