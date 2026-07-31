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
  ],
  orders:[
    {id:2481,client:'Елена Орлова',phone:'+7 777 321-45-67',status:'Требует обеспечения',deadline:'05 авг',sum:64800,payment:'Аванс 30 000 ₽'},
    {id:2480,client:'Марат Ахметов',phone:'+7 701 582-10-09',status:'В работе',deadline:'02 авг',sum:42500,payment:'Оплачено'},
    {id:2474,client:'Диана Садыкова',phone:'+7 705 123-90-12',status:'Готов',deadline:'Сегодня',sum:89200,payment:'Остаток 44 600 ₽'},
    {id:2469,client:'Игорь Васильев',phone:'+7 747 903-33-21',status:'Выдан',deadline:'31 июл',sum:37000,payment:'Оплачено'}
  ],
  employees:[
    {id:401,name:'Анна Ким',role:'Продавец-консультант',salon:'Абая, 12',status:'На смене'},
    {id:402,name:'Тимур Алимов',role:'Мастер',salon:'Мастерская Абая',status:'На смене'},
    {id:403,name:'Ольга Пак',role:'Управляющий',salon:'Mega Center',status:'Активен'},
    {id:404,name:'Сергей Ли',role:'Кладовщик',salon:'Центральный склад',status:'Активен'}
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
  orders:load('orders',defaults.orders),
  employees:load('employees',defaults.employees),
  shift:load('shift',false)
};

const modules={
  orders:['Заказы','Полный журнал заказов и этапов изготовления'],
  clients:['Клиенты','Карточки, рецепты и история обращений'],
  production:['Мастерская','Очередь изготовления и этапы работы мастеров'],
  cash:['Касса и оплаты','Авансы, окончательные платежи и возвраты'],
  catalog:['Номенклатура','Товары, категории и автоматические наименования'],
  stock:['Складские остатки','Наличие по салонам и центральному складу'],
  invoices:['Накладные и перемещения','Приход, расход, возвраты и логистика'],
  labels:['Штрихкоды и ценники','Печать этикеток и работа со сканером'],
  reports:['Отчеты','Операционные и финансовые показатели'],
  analytics:['Аналитика','Динамика и ключевые показатели сети'],
  directories:['Справочники','Управление системными значениями'],
  employees:['Сотрудники и роли','Учетные записи, роли и доступ к салонам'],
  settings:['Настройки','Роли, интеграции, уведомления и безопасность']
};
const schemas={
  clients:{title:'клиента',fields:[
    ['name','Фамилия, имя*','text'],['phone','Телефон*','tel'],['email','Email','email'],['birthday','Дата рождения','date'],['gender','Пол','select',['Не указан','Женский','Мужской']],['address','Адрес','text'],['consent','Рассылка','select',['Согласие получено','Не согласен']],['note','Комментарий','text']
  ]},
  catalog:{title:'товара',fields:[
    ['name','Торговое наименование*','text'],['category','Категория','select',['Оправа','Линза','Аксессуар','Услуга']],['brand','Бренд','text'],['sku','Артикул*','text'],['price','Цена, ₽','number'],['stock','Остаток','number']
  ]},
  invoices:{title:'накладной',fields:[
    ['name','Номер документа*','text'],['type','Тип','select',['Приход','Расход','Перемещение','Возврат']],['from','Источник / маршрут*','text'],['amount','Сумма или количество','text'],['status','Статус','select',['Черновик','Подготовка','В пути','Проведена']]
  ]},
  directories:{title:'значения справочника',fields:[
    ['name','Название*','text'],['type','Тип','select',['Бренд','Коллекция','Цвет','Покрытие','Услуга','Способ оплаты']],['value','Значение / группа','text'],['status','Состояние','select',['Используется','Архив']]
  ]},
  employees:{title:'сотрудника',fields:[
    ['name','Имя и фамилия*','text'],['role','Роль','select',['Продавец-консультант','Кассир','Мастер','Кладовщик','Управляющий','Администратор']],['salon','Салон / подразделение*','text'],['status','Статус','select',['Активен','На смене','Доступ приостановлен']]
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
  const stockPages=['catalog','stock','invoices','labels'],managePages=['reports','analytics','directories','employees','settings'];
  modulePage.dataset.theme=stockPages.includes(page)?'stock':managePages.includes(page)?'manage':'sales';
  if(page!=='dashboard'){const m=modules[page];$('#moduleTitle').textContent=m[0];$('#moduleDescription').textContent=m[1];renderModule()}
  history.replaceState(null,'',`#${page}`);
}
const statusView={
  'Требует обеспечения':['danger','! Требует обеспечения'],
  'В работе':['info','⌛ В изготовлении'],
  'Готов':['success','✓ Готов к выдаче'],
  'Выдан':['success','✓ Выдан']
};
function orderRow(o){
  const s=statusView[o.status]||statusView['В работе'],paid=o.payment==='Оплачено';
  return `<tr data-status="${o.status}" data-order-id="${o.id}"><td><strong>№ ${o.id}</strong><small>сегодня</small></td><td><strong>${escapeHtml(o.client)}</strong><small>${escapeHtml(o.phone)}</small></td><td><span class="status ${s[0]}">${s[1]}</span></td><td><strong>${escapeHtml(o.deadline)}</strong><small>план</small></td><td><strong>${Number(o.sum).toLocaleString('ru')} ₽</strong></td><td><span class="payment ${paid?'paid':'partial'}">${escapeHtml(o.payment)}</span></td><td><button class="sms-button" data-sms="${o.id}" aria-label="Отправить SMS клиенту">✉</button></td><td><button class="dots" aria-label="Открыть заказ">•••</button></td></tr>`;
}
function syncDashboard(){
  $('#ordersBody').innerHTML=state.orders.map(orderRow).join('');
  const counts={};state.orders.forEach(o=>counts[o.status]=(counts[o.status]||0)+1);
  $$('.metric[data-filter]').forEach(m=>{const n=$('strong',m);if(n)n.textContent=counts[m.dataset.filter]||0});
  $$('.tab').forEach(t=>{const b=$('b',t);if(b)b.textContent=t.dataset.filter==='Все'?state.orders.length:(counts[t.dataset.filter]||0)});
  $('[data-page="orders"] .badge').textContent=state.orders.length;
  $('[data-page="production"] .badge').textContent=state.orders.filter(o=>o.status!=='Выдан').length;
  $('#ordersShown').textContent=`Показано ${state.orders.length} ${state.orders.length===1?'заказ':'заказа'}`;
  const revenue=state.orders.reduce((sum,o)=>sum+Number(o.sum||0),0),average=Math.round(revenue/Math.max(state.orders.length,1)),plan=400000,percent=Math.min(100,Math.round(revenue/plan*100));
  $('#dailyRevenue').textContent=`${revenue.toLocaleString('ru')} ₽`;$('#averageCheck').textContent=`${average.toLocaleString('ru')} ₽`;$('#newClients').textContent=state.clients.length;
  $('#personalSales').textContent=`${revenue.toLocaleString('ru')} ₽`;$('#personalPercent').textContent=`${percent}%`;$('#personalRing').textContent=`${percent}%`;$('#personalProgress').style.width=`${percent}%`;$('#personalRemaining').textContent=`${Math.max(plan-revenue,0).toLocaleString('ru')} ₽`;
  $$('#ordersBody .dots').forEach(b=>b.onclick=()=>showOrder(+b.closest('tr').dataset.orderId));
  $$('#ordersBody [data-sms]').forEach(b=>b.onclick=()=>openSms(+b.dataset.sms));
}
const smsTemplates={ready:o=>`Здравствуйте, ${o.client.split(' ')[0]}! Ваш заказ №${o.id} готов к выдаче. Ждем вас в салоне Optica.`,delay:o=>`Здравствуйте! Срок готовности заказа №${o.id} изменен. Новая дата: ${o.deadline}. Приносим извинения.`,payment:o=>`Напоминаем: по заказу №${o.id} необходимо внести оставшуюся оплату. Подробности: ${o.phone}.`,custom:()=>''};
function openSms(id){const o=state.orders.find(x=>x.id===id);$('#smsForm').dataset.order=id;$('#smsClient').textContent=`${o.client} · заказ №${o.id}`;$('#smsPhone').textContent=o.phone;$('#smsTemplate').value=o.status==='Готов'?'ready':'custom';updateSms();$('#smsDialog').showModal()}
function updateSms(){const o=state.orders.find(x=>x.id===+$('#smsForm').dataset.order),key=$('#smsTemplate').value;$('#smsText').value=smsTemplates[key](o);$('#smsCount').textContent=$('#smsText').value.length}
function showOrder(id){
  const o=state.orders.find(x=>x.id===id);$('#detailTitle').textContent=`Заказ №${o.id}`;
  $('#detailContent').innerHTML=`<div class="detail-list">${[['Клиент',o.client],['Телефон',o.phone],['Статус',o.status],['Срок',o.deadline],['Сумма',`${Number(o.sum).toLocaleString('ru')} ₽`],['Оплата',o.payment]].map(x=>`<div><small>${x[0]}</small><strong>${escapeHtml(x[1])}</strong></div>`).join('')}</div><div class="item-actions" style="margin-top:18px"><button data-order-status="В работе">В работу</button><button data-order-status="Готов">Готов</button><button data-order-status="Выдан">Выдать</button><button data-detail-sms>✉ SMS</button></div>`;
  $$('[data-order-status]',detailDialog).forEach(b=>b.onclick=()=>{o.status=b.dataset.orderStatus;save('orders',state.orders);syncDashboard();detailDialog.close();notify(`Заказ №${o.id}: ${o.status}`)});
  $('[data-detail-sms]',detailDialog).onclick=()=>{detailDialog.close();openSms(o.id)};
  detailDialog.showModal();
}

function cardList(items,type){
  const canImport=['catalog','invoices'].includes(type);
  return `<section class="card data-card"><div class="module-toolbar"><label class="search">⌕ <input data-module-search placeholder="Поиск в разделе"></label>${canImport?'<button class="secondary" data-import>⇧ Импорт Excel/CSV</button>':''}<button class="secondary" data-export>⇩ Экспорт</button></div><div class="data-grid" id="moduleGrid">${items.map(item=>itemCard(item,type)).join('')}</div></section>`;
}
function itemCard(x,type){
  const map={
    clients:[x.phone,x.email||'Email не указан',`${x.orders||0} заказов`],
    catalog:[`${x.category} · ${x.brand||'Без бренда'}`,`Арт. ${x.sku}`,`${Number(x.price||0).toLocaleString('ru')} ₽ · остаток ${x.stock}`],
    invoices:[`${x.type} · ${x.from}`,x.amount,x.status],
    directories:[x.type,x.value,x.status],
    employees:[`${x.role} · ${x.salon}`,'Учетная запись',x.status]
  }[type];
  const tag=(x.stock===0||x.status==='Архив')?'red':(x.status==='В пути'||x.stock<5)?'amber':'green';
  return `<article class="item-card" data-id="${x.id}"><span class="tag ${tag}">${map[2]}</span><h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(map[0]||'')}</p><div class="item-meta"><small>${escapeHtml(map[1]||'')}</small></div><div class="item-actions"><button data-view>Просмотр</button><button data-edit>Изменить</button><button data-copy>Копировать</button><button data-delete>Удалить</button></div></article>`;
}
function escapeHtml(v){const d=document.createElement('div');d.textContent=String(v??'');return d.innerHTML}

function renderModule(){
  const create=$('#moduleCreate');create.hidden=!schemas[currentPage]&&!['orders','cash','labels'].includes(currentPage);
  create.textContent=currentPage==='cash'?(state.shift?'Закрыть смену':'Открыть смену'):'＋ Создать';
  if(state[currentPage]&&currentPage!=='orders'){$('#moduleContent').innerHTML=cardList(state[currentPage],currentPage);bindCards();return}
  const renders={
    orders:()=>`<section class="card"><div class="card-title"><div><h2>Все заказы</h2><p>Открывайте заказ для просмотра и изменения статуса</p></div></div><div class="table-wrap"><table><thead>${$('.orders-card thead').innerHTML}</thead><tbody>${state.orders.map(orderRow).join('')}</tbody></table></div></section>`,
    production:()=>productionBoard(),
    stock:()=>stockView(),
    cash:()=>`<section class="card form-section"><h2>Кассовая смена</h2><p class="status ${state.shift?'success':'danger'}">${state.shift?'✓ Смена открыта':'! Смена закрыта'}</p><div class="cash-actions"><button class="primary" data-payment ${state.shift?'':'disabled'}>₽ Принять оплату</button><button class="secondary" data-refund ${state.shift?'':'disabled'}>↩ Оформить возврат</button></div><div class="detail-list"><div><small>Наличные</small><strong>${state.shift?'128 400 ₽':'—'}</strong></div><div><small>Безналичные</small><strong>${state.shift?'392 800 ₽':'—'}</strong></div><div><small>Возвраты</small><strong>${state.shift?'12 500 ₽':'—'}</strong></div><div><small>Операций</small><strong>${state.shift?'24':'0'}</strong></div></div><div class="activity-list"><div class="activity-row"><span><strong>Заказ №2474</strong><small>Безналичная оплата · Анна Ким</small></span><b>44 600 ₽</b></div><div class="activity-row"><span><strong>Заказ №2469</strong><small>Наличные · Анна Ким</small></span><b>37 000 ₽</b></div></div></section>`,
    labels:()=>`<section class="card form-section"><h2>Печать ценников</h2><div class="form-grid"><label class="full">Товары<select multiple size="5">${state.catalog.map(x=>`<option>${escapeHtml(x.name)}</option>`).join('')}</select></label><label>Шаблон<select><option>Ценник 58 × 40</option><option>Этикетка 40 × 25</option></select></label><label>Количество<input type="number" value="1" min="1"></label></div><button class="primary" data-print style="margin-top:16px">Сформировать печатный лист</button></section>`,
    reports:()=>analytics(true),
    analytics:()=>analytics(false),
    settings:()=>`<section class="card form-section"><h2>Системные настройки</h2>${['Двухфакторная аутентификация','Уведомления о низких остатках','SMS при готовности заказа','Автоматическое резервное копирование'].map((x,i)=>`<label class="switch">${x}<input type="checkbox" ${i!==0?'checked':''}></label>`).join('')}<button class="primary" data-save-settings style="margin-top:18px">Сохранить настройки</button></section>`
  };
  $('#moduleContent').innerHTML=(renders[currentPage]||renders.analytics)();
  bindCards();
  if(currentPage==='orders'){$$('#moduleContent .dots').forEach(b=>b.onclick=()=>showOrder(+b.closest('tr').dataset.orderId));$$('#moduleContent [data-sms]').forEach(b=>b.onclick=()=>openSms(+b.dataset.sms))}
  $('[data-payment]')?.addEventListener('click',()=>openPayment(false));
  $('[data-refund]')?.addEventListener('click',()=>openPayment(true));
}
function stockView(){
  const low=state.catalog.filter(x=>Number(x.stock)<=4);
  return `<section class="card procurement-panel"><div class="procurement-head"><div><span class="eyebrow">Автоматизация закупок</span><h2>Рекомендовано пополнить ${low.length} позиции</h2><p>Остаток ниже минимального уровня. Система подготовила параметры заявки.</p></div><button class="primary" data-procure-all>Создать общую заявку</button></div><div class="procurement-list">${low.map(x=>`<article class="procurement-item"><strong>${escapeHtml(x.name)}</strong><small>Остаток: ${x.stock} · минимум: 5 · заказать: ${Math.max(10-x.stock,5)}</small><button data-procure="${x.id}">＋ Черновик заявки</button></article>`).join('')}</div></section>${cardList(state.catalog.map(x=>({...x,name:x.name,status:x.stock?'В наличии':'Нет товара'})),'catalog')}`;
}
function productionBoard(){
  const cols=[['Требует обеспечения','Ожидают товар'],['В работе','В изготовлении'],['Готов','Контроль качества'],['Выдан','Завершено']];
  return `<div class="work-board">${cols.map(([status,title])=>`<section class="work-column"><header>${title}<span>${state.orders.filter(o=>o.status===status).length}</span></header>${state.orders.filter(o=>o.status===status).map(o=>`<article class="work-ticket"><span class="tag">${status}</span><h3>Заказ №${o.id}</h3><p>${escapeHtml(o.client)}</p><p>Срок: ${escapeHtml(o.deadline)}</p>${status!=='Выдан'?`<button data-advance="${o.id}">${status==='Готов'?'Передать продавцу':'Следующий этап'} →</button>`:''}</article>`).join('')||'<p class="empty-results">Нет заказов</p>'}</section>`).join('')}</div>`;
}
function openPayment(refund){
  entityDialog.dataset.mode=refund?'refund':'payment';editId=null;$('#entityEyebrow').textContent=refund?'Кассовая операция':'Оплата заказа';$('#entityTitle').textContent=refund?'Оформить возврат':'Принять оплату';
  $('#entityFields').innerHTML=`<label>Заказ<select name="orderId">${state.orders.map(o=>`<option value="${o.id}">№${o.id} · ${escapeHtml(o.client)}</option>`).join('')}</select></label><label>Сумма, ₽<input name="amount" type="number" min="1" required></label><label>Способ<select name="method"><option>Банковская карта</option><option>Наличные</option><option>Смешанная оплата</option></select></label><label>Комментарий<input name="note" placeholder="${refund?'Основание возврата':'Необязательно'}"></label>`;
  entityDialog.showModal();
}
function analytics(report){
  const title=report?'Отчет по продажам':'Динамика ключевых показателей';
  return `<section class="card report-filterbar"><label>Период<select><option>Июль 2026</option><option>Июнь 2026</option><option>Квартал</option></select></label><label>Салон<select><option>Все салоны</option><option>Абая, 12</option><option>Mega Center</option></select></label><label>Сравнение<select><option>С прошлым периодом</option><option>С планом</option></select></label><button class="secondary" data-export>⇩ ${report?'Excel':'PDF'}</button></section><div class="analytics-grid">${[['Выручка','2,84 млн ₽','+12,4%'],['Заказы','326','+8,1%'],['Средний чек','47 800 ₽','+4,8%'],['Выполнено в срок','94%','+2,6 п.п.']].map(x=>`<div class="card chart-card"><small>${x[0]}</small><h2>${x[1]}</h2><span class="chart-delta">↗ ${x[2]} к прошлому периоду</span></div>`).join('')}</div><div class="chart-layout"><section class="card line-chart"><h2>${title}</h2><div class="chart-legend"><span><i style="background:#3978e8"></i>Выручка, тыс. ₽</span><span><i style="background:#9ab8f3"></i>План</span></div><svg class="line-svg" viewBox="0 0 700 230" role="img" aria-label="График продаж"><g stroke="#e8edf2" stroke-width="1"><path d="M55 20H680M55 65H680M55 110H680M55 155H680M55 200H680"/></g><g fill="#82909b" font-size="10"><text x="8" y="24">500 тыс.</text><text x="8" y="69">375 тыс.</text><text x="8" y="114">250 тыс.</text><text x="8" y="159">125 тыс.</text><text x="32" y="204">0</text><text x="60" y="220">1 июл</text><text x="207" y="220">8 июл</text><text x="350" y="220">15 июл</text><text x="500" y="220">22 июл</text><text x="632" y="220">31 июл</text></g><path d="M60 168 L135 142 L210 151 L285 105 L360 119 L435 72 L510 88 L585 47 L670 61" fill="none" stroke="#9ab8f3" stroke-width="2" stroke-dasharray="6 5"/><path d="M60 178 L135 155 L210 132 L285 122 L360 89 L435 98 L510 56 L585 67 L670 31" fill="none" stroke="#3978e8" stroke-width="4"/><g fill="#3978e8">${[[60,178],[135,155],[210,132],[285,122],[360,89],[435,98],[510,56],[585,67],[670,31]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="4"/>`).join('')}</g></svg></section><section class="card donut-card"><h2>Структура продаж</h2><div class="donut"><strong>2,84 млн</strong></div><div class="donut-legend"><span>Оправы 46%</span><span>Линзы 28%</span><span>Услуги 17%</span><span>Прочее 9%</span></div></section></div><section class="card rank-table"><div class="card-title"><div><h2>Топ категорий и брендов</h2><p>По выручке за выбранный период</p></div></div><div class="table-wrap"><table><thead><tr><th>Позиция</th><th>Категория / бренд</th><th>Продажи</th><th>Выручка</th><th>Доля</th><th>Динамика</th></tr></thead><tbody><tr><td>1</td><td>Оправы Ray-Ban</td><td>84</td><td>896 400 ₽</td><td>31,5%</td><td><span class="status success">↗ 14%</span></td></tr><tr><td>2</td><td>Линзы Essilor</td><td>112</td><td>742 800 ₽</td><td>26,1%</td><td><span class="status success">↗ 9%</span></td></tr><tr><td>3</td><td>Оправы Polaroid</td><td>61</td><td>488 200 ₽</td><td>17,2%</td><td><span class="status info">→ 1%</span></td></tr></tbody></table></div></section>`;
}

function openEditor(type,item=null){
  currentPage=type;editId=item?.id||null;entityDialog.dataset.mode='';const schema=schemas[type];
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
  $$('[data-export]').forEach(b=>b.onclick=()=>['reports','analytics'].includes(currentPage)?notify(`Отчет ${currentPage==='reports'?'Excel':'PDF'} сформирован`):downloadCsv());
  $$('[data-import]').forEach(b=>b.onclick=()=>{const input=document.createElement('input');input.type='file';input.accept='.csv,.xlsx,.xls';input.onchange=()=>input.files[0]&&notify(`Файл «${input.files[0].name}» загружен для проверки`);input.click()});
  $('[data-print]')?.addEventListener('click',()=>{notify('Печатный лист сформирован');setTimeout(()=>window.print(),300)});
  $('[data-save-settings]')?.addEventListener('click',()=>notify('Настройки сохранены'));
  $$('[data-advance]').forEach(b=>b.onclick=()=>{const o=state.orders.find(x=>x.id===+b.dataset.advance);o.status=o.status==='Требует обеспечения'?'В работе':o.status==='В работе'?'Готов':'Выдан';save('orders',state.orders);syncDashboard();renderModule();notify(`Заказ №${o.id}: ${o.status}`)});
  $$('[data-procure]').forEach(b=>b.onclick=()=>createProcurement([+b.dataset.procure]));
  $('[data-procure-all]')?.addEventListener('click',()=>createProcurement(state.catalog.filter(x=>Number(x.stock)<=4).map(x=>x.id)));
}
function createProcurement(ids){const goods=state.catalog.filter(x=>ids.includes(x.id));const number=`REQ-${String(Date.now()).slice(-5)}`;state.invoices.unshift({id:Date.now(),name:number,type:'Заявка поставщику',from:goods.map(x=>x.brand||x.name).join(', '),amount:`${goods.length} позиций`,status:'Черновик'});save('invoices',state.invoices);notify(`Черновик ${number} создан: ${goods.length} позиций`)}
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

const mobileMenu=$('#mobileMenu'),sidebarOverlay=$('#sidebarOverlay');
function isMobile(){return matchMedia('(max-width:780px)').matches}
function setMobileMenu(open){sidebar.classList.toggle('open',open);mobileMenu.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open)}
$('#collapseSidebar').onclick=()=>{if(isMobile())setMobileMenu(false);else{sidebar.classList.toggle('collapsed');save('sidebarCollapsed',sidebar.classList.contains('collapsed'))}};
mobileMenu.onclick=()=>setMobileMenu(!sidebar.classList.contains('open'));sidebarOverlay.onclick=()=>setMobileMenu(false);
if(!isMobile()&&load('sidebarCollapsed',false))sidebar.classList.add('collapsed');
let touchStartX=0,touchStartY=0;
document.addEventListener('touchstart',e=>{if(e.touches.length!==1)return;touchStartX=e.touches[0].clientX;touchStartY=e.touches[0].clientY},{passive:true});
document.addEventListener('touchend',e=>{if(!isMobile()||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touchStartX,dy=e.changedTouches[0].clientY-touchStartY;if(Math.abs(dx)<65||Math.abs(dx)<Math.abs(dy)*1.25)return;if(dx>0&&touchStartX<38)setMobileMenu(true);if(dx<0&&sidebar.classList.contains('open'))setMobileMenu(false)},{passive:true});
addEventListener('resize',()=>{if(!isMobile())setMobileMenu(false)});document.addEventListener('keydown',e=>e.key==='Escape'&&setMobileMenu(false));
$$('.nav-item').forEach(link=>link.onclick=e=>{e.preventDefault();go(link.dataset.page);if(isMobile())setMobileMenu(false)});
$$('.tab').forEach(tab=>tab.onclick=()=>filterOrders(tab.dataset.filter));
$$('.metric[data-filter]').forEach(metric=>metric.onclick=()=>{filterOrders(metric.dataset.filter);$('.orders-card').scrollIntoView({behavior:'smooth'})});
function filterOrders(status){$$('#ordersBody tr').forEach(r=>r.hidden=status!=='Все'&&r.dataset.status!==status);$$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.filter===status))}
$('#orderSearch').oninput=e=>$$('#ordersBody tr').forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(e.target.value.toLowerCase()));
$('#openFilters').onclick=()=>$('#filterDialog').showModal();
$('#filterForm').onsubmit=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));let shown=0;$$('#ordersBody tr').forEach(r=>{const o=state.orders.find(x=>x.id===+r.dataset.orderId);const paymentOk=!f.payment||(f.payment==='Оплачено'?o.payment==='Оплачено':o.payment!=='Оплачено');r.hidden=!!f.status&&o.status!==f.status||!paymentOk;if(!r.hidden)shown++});$('#ordersShown').textContent=`Найдено заказов: ${shown}`;$('#filterDialog').close();notify('Фильтры применены')};
$('#resetFilters').onclick=()=>{setTimeout(()=>{syncDashboard();notify('Фильтры сброшены')},0)};
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
  else{
    const id=Math.max(...state.orders.map(x=>x.id))+1;
    state.orders.unshift({id,client:'Екатерина Смирнова',phone:'+7 707 555-34-21',status:'В работе',deadline:'Через 5 дней',sum:82500,payment:'Аванс 25 000 ₽'});
    save('orders',state.orders);syncDashboard();$('#orderDialog').close();notify(`Заказ №${id} создан и сохранен`);resetOrder()
  }
};
$('#moduleCreate').onclick=()=>{
  if(schemas[currentPage])openEditor(currentPage);
  else if(currentPage==='orders')$('#orderDialog').showModal();
  else if(currentPage==='cash'){state.shift=!state.shift;save('shift',state.shift);renderModule();notify(state.shift?'Кассовая смена открыта':'Кассовая смена закрыта')}
  else if(currentPage==='labels')$('[data-print]')?.click();
};
$('#entityForm').onsubmit=e=>{
  e.preventDefault();if(entityDialog.dataset.mode){const data=Object.fromEntries(new FormData(e.target));entityDialog.close();notify(`${entityDialog.dataset.mode==='refund'?'Возврат':'Оплата'} на ${Number(data.amount).toLocaleString('ru')} ₽ проведена`);entityDialog.dataset.mode='';return}
  const schema=schemas[currentPage],data=Object.fromEntries(new FormData(e.target));if(!e.target.checkValidity()){e.target.reportValidity();return}
  schema.fields.filter(x=>x[2]==='number').forEach(x=>data[x[0]]=Number(data[x[0]]||0));data.id=editId||Date.now();if(currentPage==='clients'&&!editId)data.orders=0;
  const i=state[currentPage].findIndex(x=>x.id===editId);if(i>=0)state[currentPage][i]={...state[currentPage][i],...data};else state[currentPage].unshift(data);
  save(currentPage,state[currentPage]);entityDialog.close();renderModule();notify(editId?'Изменения сохранены':'Запись создана');
};
$$('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());
$('#smsTemplate').onchange=updateSms;$('#smsText').oninput=e=>$('#smsCount').textContent=e.target.value.length;
$('#smsForm').onsubmit=e=>{e.preventDefault();const o=state.orders.find(x=>x.id===+e.target.dataset.order);$('#smsDialog').close();notify(`SMS для ${o.client} отправлено на ${o.phone}`)};
$('#profileButton').onclick=()=>{const p=state.profile;Object.entries(p).forEach(([k,v])=>{const el=$(`[name="${k}"]`,$('#profileForm'));if(el)el.value=v});avatarDraft=p.avatar;applyProfile();profileDialog.showModal()};
$('#chooseAvatar').onclick=()=>$('#avatarInput').click();
$('#avatarInput').onchange=e=>{const f=e.target.files[0];if(!f)return;if(f.size>2*1024*1024){notify('Файл больше 2 МБ');return}const r=new FileReader();r.onload=()=>{avatarDraft=r.result;$('#profileAvatar').classList.add('has-image');$('#profileAvatar').style.backgroundImage=`url(${avatarDraft})`};r.readAsDataURL(f)};
$('#profileForm').onsubmit=e=>{e.preventDefault();state.profile={...state.profile,...Object.fromEntries(new FormData(e.target)),avatar:avatarDraft};save('profile',state.profile);applyProfile();profileDialog.close();notify('Профиль обновлен')};
$$('[data-quick]').forEach(b=>b.onclick=()=>{const a=b.dataset.quick;if(a==='client'){go('clients');openEditor('clients')}else if(a==='invoice'){go('invoices');openEditor('invoices')}else if(a==='labels')go('labels');else{go('cash');$('#moduleCreate').click()}});
$$('.secondary').filter(b=>b.textContent.includes('Фильтры')).forEach(b=>b.onclick=()=>notify('Фильтры: выберите вкладку статуса или используйте поиск'));
$$('.link-button').filter(b=>b.textContent.trim()==='Все').forEach(b=>b.onclick=()=>{$('.notification-button b').textContent='0';$$('.notice').forEach(n=>n.style.opacity='.55');notify('Все уведомления отмечены как прочитанные')});
$('.notification-button').onclick=()=>{go('dashboard');document.querySelector('.right-column').scrollIntoView({behavior:'smooth'});notify(`${$('.notification-button b').textContent} новых уведомления`)};
$('#salonSelect').value=load('salon','Оптика на Абая, 12');$('#periodSelect').value=load('period','Сегодня, 31 июля');
$('#salonSelect').onchange=e=>{save('salon',e.target.value);notify(`Салон переключен: ${e.target.value}`)};
$('#periodSelect').onchange=e=>{save('period',e.target.value);notify(`Период: ${e.target.value}`)};
$$('.orders-card .link-button').forEach(b=>b.onclick=()=>go('orders'));
resetOrder();

applyProfile();
syncDashboard();
const initial=location.hash.slice(1);if(modules[initial])go(initial);
