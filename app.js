const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const sidebar=$('#sidebar'), dashboard=$('#dashboard'), modulePage=$('#modulePage');
const entityDialog=$('#entityDialog'), profileDialog=$('#profileDialog'), detailDialog=$('#detailDialog');
const toast=$('#toast');
let currentPage='dashboard', editId=null, avatarDraft='';

const defaults={
  profile:{name:'Анна Ким',role:'Продавец-консультант',phone:'+7 777 123-45-67',email:'anna@optica.demo',salon:'Оптика на Абая, 12',avatar:''},
  clients:[
    {id:1,name:'Елена Орлова',phone:'+7 777 321-45-67',email:'elena@mail.kz',birthday:'1988-04-12',note:'Предпочитает тонкие линзы',orders:4},
    {id:2,name:'Марат Ахметов',phone:'+7 701 582-10-09',email:'marat@mail.kz',birthday:'1979-11-03',note:'Скидка 5%',orders:7},
    {id:3,name:'Диана Садыкова',phone:'+7 705 123-90-12',email:'diana@mail.kz',birthday:'1994-07-21',note:'SMS-уведомления',orders:3}
  ],
  catalog:[
    {id:101,name:'Ray-Ban RX 5228 Black',category:'Оправа',sku:'RB-5228-2000',price:78500,stock:6,brand:'Ray-Ban'},
    {id:102,name:'Essilor Eyezen 1.67 Crizal',category:'Линза',sku:'ES-EZ-167',price:42900,stock:18,brand:'Essilor'},
    {id:103,name:'Hoya Nulux 1.60 HVLL',category:'Линза',sku:'HY-NX-160',price:36500,stock:4,brand:'Hoya'},
    {id:104,name:'Polaroid PLD D381',category:'Оправа',sku:'PL-D381',price:39200,stock:0,brand:'Polaroid'}
  ],
  invoices:[
    {id:201,name:'INV-1048',type:'Приход',from:'Essilor Kazakhstan',amount:'1 284 000 ₽',status:'Проведена'},
    {id:202,name:'MOV-0312',type:'Перемещение',from:'Центральный склад → Абая',amount:'24 позиции',status:'В пути'},
    {id:203,name:'RET-0087',type:'Возврат',from:'Абая → Luxottica',amount:'3 позиции',status:'Черновик'}
  ],
  directories:[
    {id:301,name:'Ray-Ban',type:'Бренд',value:'Активен',status:'Используется'},
    {id:302,name:'Crizal Sapphire HR',type:'Покрытие',value:'Премиум',status:'Используется'},
    {id:303,name:'Смешанная оплата',type:'Способ оплаты',value:'Касса',status:'Используется'}
  ]
};
const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(`optica_${key}`))||fallback}catch{return fallback}};
const save=(key,value)=>localStorage.setItem(`optica_${key}`,JSON.stringify(value));
const state={
  profile:load('profile',defaults.profile),
  clients:load('clients',defaults.clients),
  catalog:load('catalog',defaults.catalog),
  invoices:load('invoices',defaults.invoices),
  directories:load('directories',defaults.directories),
  shift:load('shift',false)
};

const modules={
  orders:['Заказы','Полный журнал заказов и этапов изготовления'],
  clients:['Клиенты','Карточки, рецепты и история обращений'],
  cash:['Касса и оплаты','Авансы, окончательные платежи и возвраты'],
  catalog:['Номенклатура','Товары, категории и автоматические наименования'],
  stock:['Складские остатки','Наличие по салонам и центральному складу'],
  invoices:['Накладные и перемещения','Приход, расход, возвраты и логистика'],
  labels:['Штрихкоды и ценники','Печать этикеток и работа со сканером'],
  reports:['Отчеты','Операционные и финансовые показатели'],
  analytics:['Аналитика','Динамика и ключевые показатели сети'],
  directories:['Справочники','Управление системными значениями'],
  settings:['Настройки','Роли, интеграции, уведомления и безопасность']
};
const schemas={
  clients:{title:'клиента',fields:[
    ['name','Фамилия, имя*','text'],['phone','Телефон*','tel'],['email','Email','email'],['birthday','Дата рождения','date'],['note','Комментарий','text']
  ]},
  catalog:{title:'товара',fields:[
    ['name','Торговое наименование*','text'],['category','Категория','select',['Оправа','Линза','Аксессуар','Услуга']],['brand','Бренд','text'],['sku','Артикул*','text'],['price','Цена, ₽','number'],['stock','Остаток','number']
  ]},
  invoices:{title:'накладной',fields:[
    ['name','Номер документа*','text'],['type','Тип','select',['Приход','Расход','Перемещение','Возврат']],['from','Источник / маршрут*','text'],['amount','Сумма или количество','text'],['status','Статус','select',['Черновик','Подготовка','В пути','Проведена']]
  ]},
  directories:{title:'значения справочника',fields:[
    ['name','Название*','text'],['type','Тип','select',['Бренд','Коллекция','Цвет','Покрытие','Услуга','Способ оплаты']],['value','Значение / группа','text'],['status','Состояние','select',['Используется','Архив']]
  ]}
};

function notify(text){toast.textContent=text;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2400)}
function initials(name){return name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
function applyProfile(){
  const p=state.profile; $('#headerName').textContent=p.name;$('#headerRole').textContent=p.role;
  ['#headerAvatar','#profileAvatar'].forEach(sel=>{const el=$(sel);el.textContent=initials(p.name);el.classList.toggle('has-image',!!p.avatar);el.style.backgroundImage=p.avatar?`url(${p.avatar})`:''});
}
function go(page){
  currentPage=page; $$('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
  dashboard.classList.toggle('active',page==='dashboard');modulePage.classList.toggle('active',page!=='dashboard');
  if(page!=='dashboard'){const m=modules[page];$('#moduleTitle').textContent=m[0];$('#moduleDescription').textContent=m[1];renderModule()}
  history.replaceState(null,'',`#${page}`);
}

function cardList(items,type){
  return `<section class="card data-card"><div class="module-toolbar"><label class="search">⌕ <input data-module-search placeholder="Поиск в разделе"></label><button class="secondary" data-export>⇩ Экспорт</button></div><div class="data-grid" id="moduleGrid">${items.map(item=>itemCard(item,type)).join('')}</div></section>`;
}
function itemCard(x,type){
  const map={
    clients:[x.phone,x.email||'Email не указан',`${x.orders||0} заказов`],
    catalog:[`${x.category} · ${x.brand||'Без бренда'}`,`Арт. ${x.sku}`,`${Number(x.price||0).toLocaleString('ru')} ₽ · остаток ${x.stock}`],
    invoices:[`${x.type} · ${x.from}`,x.amount,x.status],
    directories:[x.type,x.value,x.status]
  }[type];
  const tag=(x.stock===0||x.status==='Архив')?'red':(x.status==='В пути'||x.stock<5)?'amber':'green';
  return `<article class="item-card" data-id="${x.id}"><span class="tag ${tag}">${map[2]}</span><h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(map[0]||'')}</p><div class="item-meta"><small>${escapeHtml(map[1]||'')}</small></div><div class="item-actions"><button data-view>Просмотр</button><button data-edit>Изменить</button><button data-copy>Копировать</button><button data-delete>Удалить</button></div></article>`;
}
function escapeHtml(v){const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML}

function renderModule(){
  const create=$('#moduleCreate');create.hidden=!schemas[currentPage]&&!['orders','cash','labels'].includes(currentPage);
  create.textContent=currentPage==='cash'?(state.shift?'Закрыть смену':'Открыть смену'):'＋ Создать';
  if(state[currentPage]){$('#moduleContent').innerHTML=cardList(state[currentPage],currentPage);bindCards();return}
  const renders={
    orders:()=>`<section class="card"><div class="card-title"><div><h2>Все заказы</h2><p>Открывайте заказ для просмотра и изменения статуса</p></div></div><div class="table-wrap">${$('.orders-card table').outerHTML}</div></section>`,
    stock:()=>cardList(state.catalog.map(x=>({...x,name:x.name,status:x.stock?'В наличии':'Нет товара'})),'catalog'),
    cash:()=>`<section class="card form-section"><h2>Кассовая смена</h2><p class="status ${state.shift?'success':'danger'}">${state.shift?'✓ Смена открыта':'! Смена закрыта'}</p><div class="detail-list"><div><small>Наличные</small><strong>${state.shift?'128 400 ₽':'—'}</strong></div><div><small>Безналичные</small><strong>${state.shift?'392 800 ₽':'—'}</strong></div><div><small>Возвраты</small><strong>${state.shift?'12 500 ₽':'—'}</strong></div><div><small>Операций</small><strong>${state.shift?'24':'0'}</strong></div></div></section>`,
    labels:()=>`<section class="card form-section"><h2>Печать ценников</h2><div class="form-grid"><label class="full">Товары<select multiple size="5">${state.catalog.map(x=>`<option>${escapeHtml(x.name)}</option>`).join('')}</select></label><label>Шаблон<select><option>Ценник 58 × 40</option><option>Этикетка 40 × 25</option></select></label><label>Количество<input type="number" value="1" min="1"></label></div><button class="primary" data-print style="margin-top:16px">Сформировать печатный лист</button></section>`,
    reports:()=>analytics(true),
    analytics:()=>analytics(false),
    settings:()=>`<section class="card form-section"><h2>Системные настройки</h2>${['Двухфакторная аутентификация','Уведомления о низких остатках','SMS при готовности заказа','Автоматическое резервное копирование'].map((x,i)=>`<label class="switch">${x}<input type="checkbox" ${i!==0?'checked':''}></label>`).join('')}<button class="primary" data-save-settings style="margin-top:18px">Сохранить настройки</button></section>`
  };
  $('#moduleContent').innerHTML=(renders[currentPage]||renders.analytics)();
  bindCards();
}
function analytics(report){
  return `<div class="analytics-grid">${[['Выручка','2,84 млн ₽'],['Заказы','326'],['Средний чек','47 800 ₽'],['Выполнено в срок','94%']].map(x=>`<div class="card chart-card"><small>${x[0]}</small><h2>${x[1]}</h2></div>`).join('')}</div><section class="card chart-card" style="margin-top:14px"><h2>${report?'Продажи за период':'Динамика продаж'}</h2><div class="bars">${[40,65,52,88,72,96,82,100,74,91].map(x=>`<i style="height:${x}%"></i>`).join('')}</div><button class="secondary" data-export style="margin-top:16px">⇩ Выгрузить ${report?'Excel':'PDF'}</button></section>`;
}

function openEditor(type,item=null){
  currentPage=type;editId=item?.id||null;const schema=schemas[type];
  $('#entityEyebrow').textContent=item?'Редактирование':'Новая запись';$('#entityTitle').textContent=`${item?'Редактирование':'Создание'} ${schema.title}`;
  $('#entityFields').innerHTML=schema.fields.map(([name,label,kind,opts])=>{
    const value=item?.[name]??'';if(kind==='select')return `<label>${label}<select name="${name}">${opts.map(o=>`<option ${o==value?'selected':''}>${o}</option>`).join('')}</select></label>`;
    return `<label>${label}<input name="${name}" type="${kind}" value="${escapeHtml(value)}" ${label.includes('*')?'required':''}></label>`;
  }).join('');$('#entityError').textContent='';entityDialog.showModal();
}
function bindCards(){
  const key=currentPage==='stock'?'catalog':currentPage;
  $('[data-module-search]')?.addEventListener('input',e=>{$$('.item-card').forEach(c=>c.hidden=!c.textContent.toLowerCase().includes(e.target.value.toLowerCase()))});
  $$('[data-view]').forEach(b=>b.onclick=()=>showDetail(b.closest('.item-card').dataset.id));
  $$('[data-edit]').forEach(b=>b.onclick=()=>{const x=findItem(b);if(currentPage==='stock')go('catalog');openEditor(key,x)});
  $$('[data-copy]').forEach(b=>b.onclick=()=>{const x={...findItem(b),id:Date.now(),name:`${findItem(b).name} — копия`};state[key].unshift(x);save(key,state[key]);renderModule();notify('Копия создана')});
  $$('[data-delete]').forEach(b=>b.onclick=()=>{const id=+b.closest('.item-card').dataset.id;if(confirm('Удалить эту запись?')){state[key]=state[key].filter(x=>x.id!==id);save(key,state[key]);renderModule();notify('Запись удалена')}});
  $$('[data-export]').forEach(b=>b.onclick=()=>downloadCsv());
  $('[data-print]')?.addEventListener('click',()=>{notify('Печатный лист сформирован');setTimeout(()=>window.print(),300)});
  $('[data-save-settings]')?.addEventListener('click',()=>notify('Настройки сохранены'));
}
function findItem(button){return state[currentPage==='stock'?'catalog':currentPage].find(x=>x.id===+button.closest('.item-card').dataset.id)}
function showDetail(id){
  const x=state[currentPage==='stock'?'catalog':currentPage].find(i=>i.id===+id);$('#detailTitle').textContent=x.name;
  $('#detailContent').innerHTML=`<div class="detail-list">${Object.entries(x).filter(([k])=>k!=='id').map(([k,v])=>`<div><small>${k}</small><strong>${escapeHtml(v)}</strong></div>`).join('')}</div>`;
  detailDialog.showModal();
}
function downloadCsv(){
  const key=currentPage==='stock'?'catalog':currentPage,rows=state[key]||[];if(!rows.length){notify('Нет данных для экспорта');return}
  const keys=Object.keys(rows[0]),csv=[keys.join(';'),...rows.map(r=>keys.map(k=>`"${String(r[k]??'').replaceAll('"','""')}"`).join(';'))].join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'}));a.download=`optica-${key}.csv`;a.click();URL.revokeObjectURL(a.href);notify('Экспорт готов');
}

$('#collapseSidebar').onclick=()=>sidebar.classList.toggle('collapsed');
$$('.nav-item').forEach(link=>link.onclick=e=>{e.preventDefault();go(link.dataset.page)});
$$('.tab').forEach(tab=>tab.onclick=()=>filterOrders(tab.dataset.filter));
$$('.metric[data-filter]').forEach(metric=>metric.onclick=()=>{filterOrders(metric.dataset.filter);$('.orders-card').scrollIntoView({behavior:'smooth'})});
function filterOrders(status){$$('#ordersBody tr').forEach(r=>r.hidden=status!=='Все'&&r.dataset.status!==status);$$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.filter===status))}
$('#orderSearch').oninput=e=>$$('#ordersBody tr').forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(e.target.value.toLowerCase()));
let orderStep=1;
function resetOrder(){
  orderStep=1;$$('.steps li').forEach((x,i)=>x.classList.toggle('active',i===0));$('#nextStep').textContent='Продолжить →';
  $('#orderDialog .form-section').innerHTML='<h3>Выберите клиента</h3><label class="search large">⌕ <input type="search" placeholder="Фамилия, телефон или номер карты"></label><div class="client-row"><span class="avatar">ЕС</span><div><strong>Екатерина Смирнова</strong><small>+7 707 555-34-21 · 3 заказа</small></div><button class="secondary" type="button" data-select-client>Выбрать</button></div><button class="link-button" type="button" data-order-client>＋ Создать нового клиента</button>';
  $('[data-select-client]').onclick=()=>notify('Клиент выбран');
  $('[data-order-client]').onclick=()=>{$('#orderDialog').close();go('clients');openEditor('clients')};
}
$$('[data-open-order]').forEach(b=>b.onclick=()=>{resetOrder();$('#orderDialog').showModal()});
$('#nextStep').onclick=()=>{
  orderStep++;const steps=$$('.steps li');steps.forEach((x,i)=>x.classList.toggle('active',i===Math.min(orderStep-1,3)));
  const section=$('#orderDialog .form-section');
  if(orderStep===2)section.innerHTML='<h3>Рецепт и товары</h3><div class="form-grid"><label>Правый глаз (SPH)<input type="number" step=".25" value="-1.5"></label><label>Левый глаз (SPH)<input type="number" step=".25" value="-1.75"></label><label>Оправа<select>'+state.catalog.filter(x=>x.category==='Оправа').map(x=>`<option>${x.name}</option>`).join('')+'</select></label><label>Линзы<select>'+state.catalog.filter(x=>x.category==='Линза').map(x=>`<option>${x.name}</option>`).join('')+'</select></label></div>';
  else if(orderStep===3)section.innerHTML='<h3>Стоимость и оплата</h3><div class="detail-list"><div><small>Товары и услуги</small><strong>82 500 ₽</strong></div><div><small>Минимальный аванс</small><strong>24 750 ₽</strong></div></div><div class="form-grid" style="margin-top:15px"><label>Скидка, %<input type="number" value="0"></label><label>Аванс, ₽<input type="number" value="25000"></label></div>';
  else if(orderStep===4){section.innerHTML='<h3>Подтверждение</h3><p>Заказ проверен. После сохранения ему будет присвоен номер и сформирована квитанция.</p>';$('#nextStep').textContent='Создать заказ'}
  else{$('#orderDialog').close();notify('Заказ №2482 создан и сохранен');resetOrder()}
};
$('#moduleCreate').onclick=()=>{
  if(schemas[currentPage])openEditor(currentPage);
  else if(currentPage==='orders')$('#orderDialog').showModal();
  else if(currentPage==='cash'){state.shift=!state.shift;save('shift',state.shift);renderModule();notify(state.shift?'Кассовая смена открыта':'Кассовая смена закрыта')}
  else if(currentPage==='labels')$('[data-print]')?.click();
};
$('#entityForm').onsubmit=e=>{
  e.preventDefault();const schema=schemas[currentPage],data=Object.fromEntries(new FormData(e.target));if(!e.target.checkValidity()){e.target.reportValidity();return}
  schema.fields.filter(x=>x[2]==='number').forEach(x=>data[x[0]]=Number(data[x[0]]||0));data.id=editId||Date.now();if(currentPage==='clients'&&!editId)data.orders=0;
  const i=state[currentPage].findIndex(x=>x.id===editId);if(i>=0)state[currentPage][i]={...state[currentPage][i],...data};else state[currentPage].unshift(data);
  save(currentPage,state[currentPage]);entityDialog.close();renderModule();notify(editId?'Изменения сохранены':'Запись создана');
};
$$('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());
$('#profileButton').onclick=()=>{const p=state.profile;Object.entries(p).forEach(([k,v])=>{const el=$(`[name="${k}"]`,$('#profileForm'));if(el)el.value=v});avatarDraft=p.avatar;applyProfile();profileDialog.showModal()};
$('#chooseAvatar').onclick=()=>$('#avatarInput').click();
$('#avatarInput').onchange=e=>{const f=e.target.files[0];if(!f)return;if(f.size>2*1024*1024){notify('Файл больше 2 МБ');return}const r=new FileReader();r.onload=()=>{avatarDraft=r.result;$('#profileAvatar').classList.add('has-image');$('#profileAvatar').style.backgroundImage=`url(${avatarDraft})`};r.readAsDataURL(f)};
$('#profileForm').onsubmit=e=>{e.preventDefault();state.profile={...state.profile,...Object.fromEntries(new FormData(e.target)),avatar:avatarDraft};save('profile',state.profile);applyProfile();profileDialog.close();notify('Профиль обновлен')};
$$('[data-quick]').forEach(b=>b.onclick=()=>{const a=b.dataset.quick;if(a==='client'){go('clients');openEditor('clients')}else if(a==='invoice'){go('invoices');openEditor('invoices')}else if(a==='labels')go('labels');else{go('cash');$('#moduleCreate').click()}});
$$('.dots').forEach(b=>b.onclick=()=>{const row=b.closest('tr');$('#detailTitle').textContent=$('td strong',row).textContent;$('#detailContent').innerHTML=`<div class="detail-list">${$$('td',row).slice(0,-1).map(td=>`<div><strong>${td.innerHTML}</strong></div>`).join('')}</div>`;detailDialog.showModal()});
$$('.secondary').filter(b=>b.textContent.includes('Фильтры')).forEach(b=>b.onclick=()=>notify('Фильтры: выберите вкладку статуса или используйте поиск'));
$$('.link-button').filter(b=>b.textContent.trim()==='Все').forEach(b=>b.onclick=()=>notify('Все уведомления отмечены как прочитанные'));
$('.notification-button').onclick=()=>{notify('4 уведомления: откройте главную для просмотра');go('dashboard')};
$$('.select-like').forEach((b,i)=>b.onclick=()=>notify(i===0?'В демо доступны салоны: Абая, Mega Center и центральный офис':'Период отчета: сегодня'));
$$('.orders-card .link-button').forEach(b=>b.onclick=()=>go('orders'));
resetOrder();

applyProfile();
const initial=location.hash.slice(1);if(modules[initial])go(initial);
