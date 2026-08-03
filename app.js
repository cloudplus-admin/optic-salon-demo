const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const sidebar=$('#sidebar'), dashboard=$('#dashboard'), modulePage=$('#modulePage');
const entityDialog=$('#entityDialog'), profileDialog=$('#profileDialog'), detailDialog=$('#detailDialog');
const toast=$('#toast');
let currentPage='dashboard', editId=null, avatarDraft='';
function formatMoney(value){return window.MedicaI18n?.formatCurrency(value)||`${new Intl.NumberFormat('ru-RU').format(Number(value||0))} UZS`}
function paymentText(value){const keys={'Остаток 44 600 сум':'dashboard.balance_amount','Рассрочка · оплачено 12 млн':'dashboard.installment_paid','Счёт выставлен':'dashboard.invoice_issued'},advance=String(value||'').match(/^Аванс\s+(.+)$/);return keys[value]?t(keys[value]):advance?t('payment.advance_amount',{amount:advance[1].replace(/\s*(?:сум|UZS|₽)\s*$/u,'')}):value}
function localizedSeed(prefix,id,value){const key=`${prefix}.${id}`,dict=window.MEDICA_LOCALES?.[MedicaI18n.current()]||{};return key in dict?t(key):value}
function catalogDisplayName(product){if(!product)return'';const key=`catalog.product.${product.id}`,dict=window.MEDICA_LOCALES?.[MedicaI18n.current()]||{};return escapeHtml(key in dict?t(key):product.name)}

const defaults={
  profile:{name:'Анна Ким',role:'Продавец-консультант',phone:'+7 777 123-45-67',email:'anna@optica.demo',salon:'Оптика на Абая, 12',avatar:''},
  clients:[
    {id:1,name:'Елена Орлова',phone:'+7 777 321-45-67',email:'elena@mail.kz',birthday:'1988-04-12',note:'Предпочитает тонкие линзы',orders:4,city:'Алматы',lastVisit:'28 июля',reason:'Подбор прогрессивных линз',doctor:'А. Садыкова',program:'Оптика',risk:'Аллергия на никель'},
    {id:2,name:'Марат Ахметов',phone:'+7 701 582-10-09',email:'marat@mail.kz',birthday:'1979-11-03',note:'Скидка 5%',orders:7,city:'Алматы',lastVisit:'25 июля',reason:'Настройка слухового аппарата',doctor:'Д. Ким',program:'Слух',risk:'Нет'},
    {id:3,name:'Диана Садыкова',phone:'+7 705 123-90-12',email:'diana@mail.kz',birthday:'1994-07-21',note:'SMS-уведомления',orders:3,city:'Каскелен',lastVisit:'20 июля',reason:'Индивидуальные стельки',doctor:'М. Алиев',program:'Ортопедия',risk:'Диабет II типа'}
    ,{id:4,name:'Шахноза Каримова',phone:'+998 90 442-18-06',email:'sh.karimova@mail.uz',birthday:'1986-02-14',note:'Индивидуальная программа реабилитации',orders:2,city:'Ташкент',lastVisit:'31 июля',reason:'Повторная примерка протеза бедра',doctor:'С. Ли',program:'Протезирование',risk:'Контроль состояния культи'}
    ,{id:5,name:'Бекзод Умаров',phone:'+998 93 718-44-22',email:'bekzod@company.uz',birthday:'1968-09-03',note:'Корпоративный клиент',orders:5,city:'Ташкент',lastVisit:'30 июля',reason:'Подбор кислородного концентратора',doctor:'И. Усманов',program:'Медтехника',risk:'ХОБЛ · обучение родственника'}
    ,{id:6,name:'Наталья Пак',phone:'+998 97 501-03-55',email:'n.pak@mail.uz',birthday:'1959-12-22',note:'Предпочитает звонок',orders:6,city:'Самарканд',lastVisit:'29 июля',reason:'Бинауральная настройка аппаратов',doctor:'Д. Ким',program:'Слух',risk:'Тиннитус · контроль через 14 дней'}
  ],
  catalog:[
    {id:101,name:'Ray-Ban RX 5228 Black',category:'Оправа',sku:'RB-5228-2000',price:78500,stock:6,brand:'Ray-Ban'},
    {id:102,name:'Essilor Eyezen 1.67 Crizal',category:'Линза',sku:'ES-EZ-167',price:42900,stock:18,brand:'Essilor'},
    {id:103,name:'Hoya Nulux 1.60 HVLL',category:'Линза',sku:'HY-NX-160',price:36500,stock:4,brand:'Hoya'},
    {id:104,name:'Polaroid PLD D381',category:'Оправа',sku:'PL-D381',price:39200,stock:0,brand:'Polaroid'}
    ,{id:105,name:'Phonak Audéo Lumity L70-R',category:'Слуховой аппарат',sku:'PH-L70R',price:684000,stock:3,brand:'Phonak',serial:true}
    ,{id:106,name:'Модуль стопы Ottobock Taleo',category:'Протезирование',sku:'OT-1C50',price:438000,stock:2,brand:'Ottobock',serial:true}
    ,{id:107,name:'Индивидуальная ортопедическая стелька',category:'Ортопедия',sku:'ORT-INSOLE',price:42000,stock:12,brand:'Medica Lab'}
    ,{id:108,name:'Тонометр Omron M3 Comfort',category:'Медтехника',sku:'OM-M3C',price:46900,stock:9,brand:'Omron',serial:true}
  ],
  invoices:[
    {id:201,name:'INV-1048',type:'Приход',from:'Essilor Kazakhstan',amount:'1 284 000 сум',status:'Проведена'},
    {id:202,name:'MOV-0312',type:'Перемещение',from:'Центральный склад → Абая',amount:'24 позиции',status:'В пути'},
    {id:203,name:'RET-0087',type:'Возврат',from:'Абая → Luxottica',amount:'3 позиции',status:'Черновик'}
  ],
  directories:[
    {id:301,name:'Ray-Ban',type:'Бренд',value:'Активен',status:'Используется'},
    {id:302,name:'Crizal Sapphire HR',type:'Покрытие',value:'Премиум',status:'Используется'},
    {id:303,name:'Смешанная оплата',type:'Способ оплаты',value:'Касса',status:'Используется'}
  ],
  orders:[
    {id:2481,client:'Елена Орлова',phone:'+7 777 321-45-67',status:'Требует обеспечения',deadline:'05 авг',sum:64800,payment:'Аванс 30 000 сум',direction:'Оптика',product:'Прогрессивные очки',responsible:'Анна Ким',stage:'Комплектация',progress:25},
    {id:2480,client:'Марат Ахметов',phone:'+7 701 582-10-09',status:'В работе',deadline:'02 авг',sum:684000,payment:'Аванс 300 000 сум',direction:'Слух',product:'Phonak Audéo L70-R',responsible:'Данияр Ким',stage:'Настройка и аудиометрия',progress:62},
    {id:2474,client:'Диана Садыкова',phone:'+7 705 123-90-12',status:'Готов',deadline:'Сегодня',sum:89200,payment:'Остаток 44 600 сум',direction:'Ортопедия',product:'Индивидуальные стельки',responsible:'Тимур Алимов',stage:'Контроль качества',progress:92},
    {id:2469,client:'Игорь Васильев',phone:'+7 747 903-33-21',status:'Выдан',deadline:'31 июл',sum:438000,payment:'Оплачено',direction:'Протезирование',product:'Модуль стопы Taleo',responsible:'Сергей Ли',stage:'Выдано',progress:100}
    ,{id:2466,client:'Шахноза Каримова',phone:'+998 90 442-18-06',status:'В работе',deadline:'08 авг',sum:48000000,payment:'Рассрочка · оплачено 12 млн',direction:'Протезирование',product:'Индивидуальный протез бедра BK-04',responsible:'Сергей Ли',stage:'Тестовая гильза и примерка',progress:48,priority:'Высокий',branch:'Медцентр Юнусабад',supply:'Комплектующие зарезервированы',recipe:'Мерки PR-882 · левая сторона',quality:'Примерка назначена 02.08'}
    ,{id:2462,client:'Бекзод Умаров',phone:'+998 93 718-44-22',status:'Требует обеспечения',deadline:'12 авг',sum:12500000,payment:'Счёт выставлен',direction:'Медтехника',product:'Кислородный концентратор Invacare',responsible:'Ильхом Усманов',stage:'Ожидает поставку',progress:18,priority:'Обычный',branch:'Магазин Чиланзар',supply:'REQ-4182 · поставщик подтвердил',recipe:'Назначение пульмонолога VIS-611',quality:'Пусконаладка после поставки'}
    ,{id:2458,client:'Наталья Пак',phone:'+998 97 501-03-55',status:'Готов',deadline:'Сегодня',sum:9200000,payment:'Оплачено',direction:'Слух',product:'Комплект слуховых аппаратов Phonak L70-R',responsible:'Данияр Ким',stage:'Финальная настройка завершена',progress:96,priority:'Обычный',branch:'Медцентр Самарканд',supply:'SN-PH-188 / SN-PH-189',recipe:'Аудиограмма AUD-2041 · оба уха',quality:'Осталось обучение клиента'}
    ,{id:2451,client:'Рустам Нурматов',phone:'+998 99 340-77-12',status:'В работе',deadline:'03 авг',sum:1850000,payment:'Аванс 900 000 сум',direction:'Оптика',product:'Прогрессивные очки Hoya Mystyle',responsible:'Тимур Алимов',stage:'Обработка линз',progress:72,priority:'Срочный',branch:'Медцентр Юнусабад',supply:'Линзы и оправа в мастерской',recipe:'OD +1.25 / OS +1.00 · ADD +2.00',quality:'ОТК после сборки'}
  ],
  encounters:[
    {id:501,name:'VIS-501 · Елена Орлова',type:'Подбор оптики',value:'Рецепт OD −1.50 / OS −1.75',status:'28 июля'},
    {id:502,name:'VIS-502 · Марат Ахметов',type:'Аудиология',value:'Тональная аудиометрия · 45 дБ',status:'25 июля'},
    {id:503,name:'VIS-503 · Диана Садыкова',type:'Ортопедия',value:'Скан стоп · назначение стелек',status:'20 июля'}
  ],
  suppliers:[
    {id:601,name:'Phonak Central Asia',type:'Слуховые аппараты',value:'Поставка 5–7 дней',status:'Активен'},
    {id:602,name:'Ottobock Kazakhstan',type:'Протезирование',value:'Поставка 10–14 дней',status:'Активен'},
    {id:603,name:'MedTech Distribution',type:'Медтехника',value:'Поставка 2–3 дня',status:'Активен'}
  ],
  service:[
    {id:701,name:'SRV-701 · Phonak L70-R',type:'Гарантийная диагностика',value:'Ответственный: Данияр Ким',status:'В работе'},
    {id:702,name:'SRV-702 · Omron M3',type:'Проверка точности',value:'Ответственный: Тимур Алимов',status:'Принят'}
  ],
  employees:[
    {id:401,name:'Анна Ким',role:'Продавец-консультант',salon:'Абая, 12',status:'На смене'},
    {id:402,name:'Тимур Алимов',role:'Мастер',salon:'Мастерская Абая',status:'На смене'},
    {id:403,name:'Ольга Пак',role:'Управляющий',salon:'Mega Center',status:'Активен'},
    {id:404,name:'Сергей Ли',role:'Кладовщик',salon:'Центральный склад',status:'Активен'}
  ]
};
const clone=value=>JSON.parse(JSON.stringify(value));
const SYSTEM_VALUE_CODES={status:{'Черновик':'draft','В работе':'in_progress','Готов':'ready','Выдан':'issued','Отменён':'cancelled','Требует обеспечения':'supply_required'},direction:{'Оптика':'optical','Слух':'hearing','Протезирование':'prosthetics','Ортопедия':'orthopedics','Медтехника':'medical_equipment'},availability:{'Зарезервировано':'reserved','Ожидает обеспечения':'awaiting_supply'},payment:{'Оплачено':'paid','Не оплачено':'unpaid'},method:{'Наличные':'cash','Банковская карта':'card','Карта':'card','QR':'qr','Смешанная':'mixed'}};
const SYSTEM_VALUE_LABELS=Object.fromEntries(Object.entries(SYSTEM_VALUE_CODES).map(([field,map])=>[field,Object.fromEntries(Object.entries(map).map(([label,code])=>[code,label]))]));
const mapSystemValues=(value,direction)=>{if(Array.isArray(value))return value.map(item=>mapSystemValues(item,direction));if(!value||typeof value!=='object')return value;return Object.fromEntries(Object.entries(value).map(([key,item])=>{const map=direction==='encode'?SYSTEM_VALUE_CODES[key]:SYSTEM_VALUE_LABELS[key];return [key,map?.[item]??mapSystemValues(item,direction)]}))};
const load=(key,fallback)=>{
  try{
    const raw=localStorage.getItem(`optica_${key}`);
    return raw===null?clone(fallback):mapSystemValues(JSON.parse(raw),'decode');
  }catch(error){
    console.warn(`Не удалось прочитать optica_${key}`,error);
    return clone(fallback);
  }
};
const save=(key,value)=>{
  try{
    localStorage.setItem(`optica_${key}`,JSON.stringify(mapSystemValues(value,'encode')));
    return true;
  }catch(error){
    console.error(`Не удалось сохранить optica_${key}`,error);
    notify('Браузер запретил локальное сохранение. Освободите место или разрешите данные сайта.');
    return false;
  }
};
const hydrate=(key,items)=>{
  const stored=load(key,items);
  const merged=stored.map(item=>({...items.find(base=>base.id===item.id),...item}));
  items.filter(base=>!merged.some(item=>item.id===base.id)).forEach(base=>merged.push(clone(base)));
  return merged;
};
const state={
  profile:load('profile',defaults.profile),
  clients:hydrate('clients',defaults.clients),
  catalog:hydrate('catalog',defaults.catalog),
  invoices:load('invoices',defaults.invoices),
  directories:load('directories',defaults.directories),
  orders:hydrate('orders',defaults.orders),
  encounters:load('encounters',defaults.encounters),
  suppliers:load('suppliers',defaults.suppliers),
  service:load('service',defaults.service),
  communications:load('communications',[]),
  inventorySession:load('inventorySession',{counts:{}}),
  employees:load('employees',defaults.employees),
  preferences:load('preferences',{language:'ru',theme:'light',compactEmployees:true}),
  shift:load('shift',false)
};
[state.profile,...state.clients,...state.employees].forEach(item=>window.MedicaNames.ensure(item));
save('profile',state.profile);save('clients',state.clients);save('employees',state.employees);
const personName=person=>window.MedicaNames.display(person);
const personAliases=person=>window.MedicaNames.variants(person).join(' ');

const modules={
  orders:['Заказы','Полный журнал заказов и этапов изготовления'],
  clients:['Клиенты','Карточки, рецепты и история обращений'],
  registry:['Регистратура','Расписание специалистов и управление посещениями'],
  encounters:['Обращения и рецепты','Приемы, назначения, измерения и медицинская история'],
  prescriptions:['Рецепты','Самостоятельный журнал назначений и параметров коррекции'],
  lenscare:['Контроль контактных линз','Сроки замены и автоматические напоминания пациентам'],
  production:['Мастерская','Очередь изготовления и этапы работы мастеров'],
  service:['Сервис и гарантия','Ремонт, настройка, обслуживание и гарантийные случаи'],
  cash:['Касса и оплаты','Авансы, окончательные платежи и возвраты'],
  catalog:['Номенклатура','Товары, категории и автоматические наименования'],
  stock:['Складские остатки','Наличие по салонам и центральному складу'],
  serials:['Серийные изделия','Прослеживаемость дорогостоящих изделий и комплектов'],
  inventory:['Инвентаризация','Фактические остатки, расхождения и пересчёт стоимости'],
  invoices:['Накладные и перемещения','Приход, расход, возвраты и логистика'],
  suppliers:['Поставщики и закупки','Контрагенты, сроки поставки и заявки'],
  labels:['Штрихкоды и ценники','Печать этикеток и работа со сканером'],
  wholesale:['Оптовые продажи','Контрагенты, договоры, лимиты и задолженность'],
  installments:['Рассрочки','Графики платежей и контроль просроченной задолженности'],
  branches:['Филиалы сети','Медицинские центры, магазины, склады и мастерские'],
  equipment:['Оборудование компании','Диагностические приборы, станки, ТО и ремонты'],
  reports:['Отчеты','Операционные и финансовые показатели'],
  analytics:['Аналитика','Динамика и ключевые показатели сети'],
  directories:['Справочники','Управление системными значениями'],
  employees:['Сотрудники и роли','Учетные записи, роли и доступ к салонам'],
  settings:['Настройки','Роли, интеграции, уведомления и безопасность']
};
const schemas={
  clients:{title:'клиента',fields:[
    ['nameOriginal','Исходное написание имени и фамилии*','text'],['originalLanguage','Язык исходного имени','select',['ru','uz','other']],['nameLatin','Имя латиницей','text'],['nameCyrillic','Имя кириллицей','text'],['latinSource','Источник латиницы','select',['passport','manual','generated','imported']],['latinVerified','Латиница проверена','checkbox'],['cyrillicSource','Источник кириллицы','select',['passport','manual','generated','imported']],['cyrillicVerified','Кириллица проверена','checkbox'],['patientNo','Номер карты','text'],['phone','Основной телефон*','tel'],['phone2','Дополнительный телефон','tel'],['email','Email','email'],['birthday','Дата рождения','date'],['gender','Пол','select',['Не указан','Женский','Мужской']],['city','Город','text'],['address','Адрес','text'],['contact','Предпочитаемая связь','select',['Телефон','SMS','Telegram','Email']],['branch','Основной филиал','select',['Медцентр Юнусабад','Магазин Чиланзар','Медцентр Самарканд']],['source','Источник обращения','select',['Рекомендация','Реклама','Повторный клиент','Врач','Корпоративный договор']],['program','Направление','select',['Оптика','Слух','Протезирование','Ортопедия','Медтехника']],['lastVisit','Последний визит','text'],['nextVisit','Следующий визит','date'],['reason','Причина обращения','text'],['doctor','Ответственный специалист','text'],['risk','Диагнозы и медицинские отметки','text'],['debt','Задолженность, сум','number'],['guardian','Представитель несовершеннолетнего','text'],['consent','Уведомления','select',['Согласие получено','Не согласен']],['note','Комментарий','text']
  ]},
  catalog:{title:'товара',fields:[
    ['name','Торговое наименование*','text'],['category','Категория','select',['Оправа','Очковая линза','Контактная линза','Слуховой аппарат','Протезирование','Ортопедия','Диагностическая техника','Кислородное оборудование','Средство реабилитации','Расходный материал','Аксессуар','Услуга']],['direction','Направление','select',['Оптика','Слух','Протезирование','Ортопедия','Медтехника']],['brand','Бренд','text'],['manufacturer','Производитель','text'],['model','Модель','text'],['sku','Артикул*','text'],['barcode','Штрихкод','text'],['purchasePrice','Закупочная цена, сум','number'],['price','Розничная цена, сум','number'],['wholesalePrice','Оптовая цена, сум','number'],['minimumPrice','Минимальная цена, сум','number'],['stock','Остаток','number'],['minimumStock','Минимальный остаток','number'],['supplier','Основной поставщик','text'],['deliveryDays','Срок поставки, дней','number'],['warranty','Гарантия, месяцев','number'],['tracking','Тип учёта','select',['Количественный','Серийный','Партийный']],['expiry','Срок годности','date'],['specifications','Технические характеристики','text']
  ]},
  invoices:{title:'накладной',fields:[
    ['name','Номер документа*','text'],['type','Тип','select',['Приход','Расход','Перемещение','Возврат']],['from','Источник / маршрут*','text'],['amount','Сумма или количество','text'],['status','Статус','select',['Черновик','Подготовка','В пути','Проведена']]
  ]},
  directories:{title:'значения справочника',fields:[
    ['name','Название*','text'],['type','Тип','select',['Бренд','Коллекция','Цвет','Покрытие','Услуга','Способ оплаты']],['value','Значение / группа','text'],['status','Состояние','select',['Используется','Архив']]
  ]},
  employees:{title:'сотрудника',fields:[
    ['nameOriginal','Исходное написание имени и фамилии*','text'],['originalLanguage','Язык исходного имени','select',['ru','uz','other']],['nameLatin','Имя латиницей','text'],['nameCyrillic','Имя кириллицей','text'],['latinSource','Источник латиницы','select',['passport','manual','generated','imported']],['latinVerified','Латиница проверена','checkbox'],['cyrillicSource','Источник кириллицы','select',['passport','manual','generated','imported']],['cyrillicVerified','Кириллица проверена','checkbox'],['role','Роль','select',['Врач-офтальмолог','Оптометрист','Сурдолог','Аудиолог','Ортопед','Протезист','Инженер медтехники','Специалист по реабилитации','Продавец-консультант','Кассир','Мастер','Кладовщик','Закупщик','Управляющий','Администратор']],['specialization','Специализация / квалификация','text'],['salon','Филиал / подразделение*','text'],['schedule','График','text'],['phone','Телефон','tel'],['access','Уровень доступа','select',['Рабочий','Расширенный','Руководитель','Администратор сети']],['directions','Доступные направления','text'],['salesPlan','План продаж, сум','number'],['bonusRate','Бонус, %','number'],['status','Статус','select',['Активен','На смене','Доступ приостановлен']]
  ]},
  encounters:{title:'обращения',fields:[['name','i18n:encounters.form.number_client','text'],['type','i18n:common.direction','select',['Оптика','Аудиология','Протезирование','Ортопедия','Медтехника']],['value','i18n:encounters.form.result','text'],['status','i18n:encounters.form.date_status','text']]},
  suppliers:{title:'поставщика',fields:[['name','Название*','text'],['legalName','Юридическое наименование','text'],['taxId','ИНН','text'],['type','Категории и бренды','text'],['contact','Контактное лицо','text'],['phone','Телефон','tel'],['email','Email','email'],['paymentTerms','Условия оплаты / отсрочка','text'],['currency','Валюта','select',['UZS','USD','EUR']],['deliveryDays','Срок поставки, дней','number'],['contract','Договор и срок действия','text'],['debt','Текущая задолженность, сум','number'],['value','Рейтинг / фактический срок','text'],['status','Статус','select',['Активен','Проверка','Приостановлен']]]},
  service:{title:'сервисного обращения',fields:[['name','Номер обращения*','text'],['clientId','Клиент*','linked','clients'],['orderId','Связанный заказ','linked','orders'],['product','Изделие / серийный номер*','text'],['type','Вид работы','select',['Диагностика','Гарантийный ремонт','Платный ремонт','Настройка','Техническое обслуживание']],['issue','Неисправность / запрос*','text'],['value','Ответственный*','linked','employees'],['receivedAt','Дата приёма','date'],['dueAt','Плановый срок','date'],['status','Статус','select',['Черновик','Принят','Диагностика','В работе','Ожидает деталь','Готов','Выдано']]]}
};

function notify(text){toast.textContent=text;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2400)}
window.saveMedicaDocument=function(title,content){const safe=String(title||'medica-document').replace(/[^\p{L}\p{N}._-]+/gu,'-'),html=`<!doctype html><html lang="${document.documentElement.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title><style>body{max-width:900px;margin:40px auto;padding:0 24px;color:#17232d;font:14px/1.5 Arial,sans-serif}h1{border-bottom:2px solid #2775c9;padding-bottom:12px}.detail-list{display:grid;grid-template-columns:1fr 1fr;gap:10px}.detail-list div,.order-line,.patient-timeline article{padding:10px;border:1px solid #dfe6eb;border-radius:8px}.detail-list small,.detail-list strong{display:block}.item-actions,button{display:none}</style></head><body><h1>${escapeHtml(title)}</h1>${content}</body></html>`,blob=new Blob([html],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${safe}.html`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Документ сохранён в современном HTML-формате')}
document.addEventListener('click',event=>{const button=event.target.closest('[data-print],[data-order-print],[data-print-rx]');if(!button||button.disabled)return;event.preventDefault();event.stopImmediatePropagation();const rx=button.dataset.printRx&&state.prescriptions?.find(x=>x.id==button.dataset.printRx),title=rx?`Рецепт ${rx.number}`:$('#detailTitle')?.textContent||$('#moduleTitle')?.textContent||'Документ',content=rx?`<div class="detail-list">${Object.entries(rx).filter(([key])=>!['id'].includes(key)).map(([key,value])=>`<div><small>${escapeHtml(key)}</small><strong>${escapeHtml(value)}</strong></div>`).join('')}</div>`:$('#detailContent')?.innerHTML||$('#moduleContent')?.innerHTML||'';saveMedicaDocument(title,content)},true)
function initials(name){return name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
function applyProfile(){
  const p=MedicaNames.ensure(state.profile),name=personName(p),first=name.split(/\s+/)[0]||name;$('#headerName').textContent=name;$('#headerRole').textContent=p.role;
  const greeting=$('[data-greeting-text]');if(greeting)greeting.textContent=t('dashboard.greeting',{name:first});
  ['#headerAvatar','#profileAvatar'].forEach(sel=>{const el=$(sel);el.textContent=initials(name);el.classList.toggle('has-image',!!p.avatar);el.style.backgroundImage=p.avatar?`url(${p.avatar})`:''});
}
function go(page){
  currentPage=page; $$('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
  dashboard.classList.toggle('active',page==='dashboard');modulePage.classList.toggle('active',page!=='dashboard');
  const stockPages=['catalog','stock','serials','inventory','invoices','suppliers','labels'],managePages=['wholesale','installments','branches','equipment','reports','analytics','directories','employees','settings'];
  modulePage.dataset.theme=stockPages.includes(page)?'stock':managePages.includes(page)?'manage':'sales';
  if(page!=='dashboard'){const m=modules[page],translated=translations[state.preferences?.language]?.[page];$('#moduleTitle').textContent=translated||m[0];$('#moduleDescription').textContent=m[1];renderModule()}
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
  return `<tr data-status="${o.status}" data-order-id="${o.id}"><td><strong>№ ${o.id}</strong><small>сегодня</small></td><td><strong>${escapeHtml(o.client)}</strong><small>${escapeHtml(o.phone)}</small></td><td><span class="status ${s[0]}">${s[1]}</span></td><td><strong>${escapeHtml(o.deadline)}</strong><small>план</small></td><td><strong>${formatMoney(o.sum)}</strong></td><td><span class="payment ${paid?'paid':'partial'}">${escapeHtml(paymentText(o.payment))}</span></td><td><button class="sms-button" data-sms="${o.id}" aria-label="${escapeHtml(t('accessibility.send_sms'))}">✉</button></td><td><button class="dots" aria-label="${escapeHtml(t('accessibility.open_order'))}">•••</button></td></tr>`;
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
  $('#dailyRevenue').textContent=formatMoney(revenue);$('#averageCheck').textContent=formatMoney(average);$('#newClients').textContent=state.clients.length;
  $('#personalSales').textContent=formatMoney(revenue);$('#personalPercent').textContent=`${percent}%`;$('#personalRing').textContent=`${percent}%`;$('#personalProgress').style.width=`${percent}%`;$('#personalRemaining').textContent=formatMoney(Math.max(plan-revenue,0));
  $$('#ordersBody .dots').forEach(b=>b.onclick=()=>showOrder(+b.closest('tr').dataset.orderId));
  $$('#ordersBody [data-sms]').forEach(b=>b.onclick=()=>openSms(+b.dataset.sms));
}
const smsTemplates={ready:o=>`Здравствуйте, ${o.client.split(' ')[0]}! Ваш заказ №${o.id} готов к выдаче. Ждем вас в салоне Optica.`,delay:o=>`Здравствуйте! Срок готовности заказа №${o.id} изменен. Новая дата: ${o.deadline}. Приносим извинения.`,payment:o=>`Напоминаем: по заказу №${o.id} необходимо внести оставшуюся оплату. Подробности: ${o.phone}.`,custom:()=>''};
function openSms(id){const o=state.orders.find(x=>x.id===id);$('#smsForm').dataset.order=id;$('#smsClient').textContent=`${o.client} · заказ №${o.id}`;$('#smsPhone').textContent=o.phone;$('#smsTemplate').value=o.status==='Готов'?'ready':'custom';updateSms();$('#smsDialog').showModal()}
function updateSms(){const o=state.orders.find(x=>x.id===+$('#smsForm').dataset.order),key=$('#smsTemplate').value;$('#smsText').value=smsTemplates[key](o);$('#smsCount').textContent=$('#smsText').value.length}
function showOrder(id){
  const o=state.orders.find(x=>x.id===id);$('#detailTitle').textContent=`Заказ №${o.id}`;
  $('#detailContent').innerHTML=`<div class="detail-list">${[['Клиент',o.client],['Телефон',o.phone],['Статус',o.status],['Срок',o.deadline],['Сумма',formatMoney(o.sum)],['Оплата',o.payment]].map(x=>`<div><small>${x[0]}</small><strong>${escapeHtml(x[1])}</strong></div>`).join('')}</div><div class="item-actions" style="margin-top:18px"><button data-order-status="В работе">В работу</button><button data-order-status="Готов">Готов</button><button data-order-status="Выдан">Выдать</button><button data-detail-sms>✉ SMS</button></div>`;
  $$('[data-order-status]',detailDialog).forEach(b=>b.onclick=()=>{o.status=b.dataset.orderStatus;save('orders',state.orders);syncDashboard();detailDialog.close();notify(`Заказ №${o.id}: ${o.status}`)});
  $('[data-detail-sms]',detailDialog).onclick=()=>{detailDialog.close();openSms(o.id)};
  detailDialog.showModal();
}

function cardList(items,type){
  const canImport=['catalog','invoices'].includes(type);
  return `<section class="card data-card ${type==='employees'?'employee-directory':''}"><div class="module-toolbar"><label class="search">⌕ <input data-module-search placeholder="Поиск в разделе"></label>${canImport?'<button class="secondary" data-import>⇧ Импорт Excel/CSV</button>':''}<button class="secondary" data-export>⇩ Экспорт</button></div><div class="data-grid" id="moduleGrid">${items.map(item=>itemCard(item,type)).join('')}</div></section>`;
}
function itemCard(x,type){
  const map={
    clients:[x.phone,x.email||'Email не указан',`${x.orders||0} заказов`],
    catalog:[`${MedicaI18n.system('category',x.category)} · ${x.brand||t('catalog.no_brand')}`,`${t('catalog.sku')} ${x.sku}`,`${formatMoney(x.price)} · ${t('catalog.stock_count',{count:x.stock})}`],
    invoices:[`${x.type} · ${x.from}`,x.amount,x.status],
    directories:[x.type,x.value,x.status],
    encounters:[x.type,x.value,x.status],
    suppliers:[x.type,x.value,x.status],
    service:[localizedSeed('service.type',x.id,x.type),localizedSeed('service.value',x.id,x.value),MedicaI18n.system('status',x.status)],
    employees:[`${x.role} · ${x.salon}`,'Учетная запись',x.status]
  }[type];
  const tag=(x.stock===0||x.status==='Архив')?'red':(x.status==='В пути'||x.stock<5)?'amber':'green';
  if(type==='employees'){const name=personName(x);return `<article class="item-card employee-row" data-id="${x.id}" data-person-search="${escapeHtml(personAliases(x))}"><span class="avatar">${initials(name)}</span><div class="employee-main"><h3 data-person-name data-user-content>${escapeHtml(name)}</h3><p>${escapeHtml(localizedSeed('employees.role',x.id,x.role))}</p></div><div class="employee-salon"><small>${t('employees.salon')}</small><strong>${escapeHtml(localizedSeed('employees.salon',x.id,x.salon))}</strong></div><span class="tag ${tag}">${MedicaI18n.system('status',x.status)}</span><div class="item-actions"><button data-view>${t('common.view')}</button><button data-edit>${t('common.edit')}</button><button data-copy>${t('common.copy')}</button><button data-delete>${t('common.delete')}</button></div></article>`}
  if(type==='clients'){const name=personName(x);return `<article class="item-card patient-card" data-id="${x.id}" data-person-search="${escapeHtml(personAliases(x))}"><div class="patient-head"><span class="avatar">${initials(name)}</span><div><h3 data-person-name data-user-content>${escapeHtml(name)}</h3><p data-user-content>${escapeHtml(x.phone)} · ${escapeHtml(x.city||t('clients.city_missing'))}</p></div><span class="tag green">${MedicaI18n.system('direction',x.program||'optical')}</span></div><div class="patient-facts"><span><small>${t('clients.last_visit')}</small><b data-user-content>${escapeHtml(x.lastVisit||'—')}</b></span><span><small>${t('clients.reason')}</small><b data-user-content>${escapeHtml(x.reason||x.note||'—')}</b></span><span><small>${t('clients.specialist')}</small><b data-user-content>${escapeHtml(x.doctor||t('common.unassigned'))}</b></span><span><small>${t('clients.orders_count')}</small><b>${x.orders||0}</b></span></div><div class="patient-alert"><span>${t('clients.medical_notes')}:</span> <span data-user-content>${escapeHtml(x.risk||t('common.none'))}</span></div><div class="item-actions"><button data-view>${t('clients.profile')}</button><button data-history>${t('common.history')}</button><button data-edit>${t('common.edit')}</button><button data-copy>${t('common.copy')}</button></div></article>`}
  if(type==='encounters'){const [number,...clientParts]=String(x.name).split(' · '),client=clientParts.join(' · ');return `<article class="item-card" data-id="${x.id}"><span class="tag ${tag}">${t(`encounters.date.${x.id}`)}</span><h3><span>${escapeHtml(number)}</span>${client?` · <span>${escapeHtml(client)}</span>`:''}</h3><p>${t(`encounters.type.${x.id}`)}</p><div class="item-meta"><small>${t(`encounters.value.${x.id}`)}</small></div><div class="item-actions"><button data-view>${t('common.view')}</button><button data-edit>${t('common.edit')}</button><button data-copy>${t('common.copy')}</button><button data-delete>${t('common.delete')}</button></div></article>`}
  return `<article class="item-card" data-id="${x.id}"><span class="tag ${tag}">${map[2]}</span><h3>${escapeHtml(type==='catalog'?localizedSeed('catalog.product',x.id,x.name):x.name)}</h3><p>${escapeHtml(map[0]||'')}</p><div class="item-meta"><small>${escapeHtml(map[1]||'')}</small></div><div class="item-actions"><button data-view>${t('common.view')}</button><button data-edit>${t('common.edit')}</button><button data-copy>${t('common.copy')}</button><button data-delete>${t('common.delete')}</button></div></article>`;
}
const DEMO_I18N_VALUES={'28 июля':'clients.seed.date.july_28','25 июля':'clients.seed.date.july_25','20 июля':'clients.seed.date.july_20','31 июля':'clients.seed.date.july_31','30 июля':'clients.seed.date.july_30','29 июля':'clients.seed.date.july_29','Подбор прогрессивных линз':'clients.seed.reason.progressive','Настройка слухового аппарата':'clients.seed.reason.hearing_setup','Индивидуальные стельки':'clients.seed.reason.insoles','Повторная примерка протеза бедра':'clients.seed.reason.prosthesis_fitting','Подбор кислородного концентратора':'clients.seed.reason.oxygen','Бинауральная настройка аппаратов':'clients.seed.reason.binaural','Аллергия на никель':'clients.seed.risk.nickel','Нет':'common.none','Диабет II типа':'clients.seed.risk.diabetes','Контроль состояния культи':'clients.seed.risk.stump','ХОБЛ · обучение родственника':'clients.seed.risk.copd','Тиннитус · контроль через 14 дней':'clients.seed.risk.tinnitus'};
function escapeHtml(v){const d=document.createElement('div'),days=String(v??'').match(/^Через\s+(\d+)\s+д(?:ень|ня|ней)$/u),value=['__client_not_selected__','Клиент не выбран'].includes(v)?t('orders.client_not_selected'):days?t('orders.deadline_days',{count:days[1]}):DEMO_I18N_VALUES[v]?t(DEMO_I18N_VALUES[v]):v;d.textContent=String(value??'');return d.innerHTML}

function renderModule(){
  const create=$('#moduleCreate');create.hidden=!schemas[currentPage]&&!['orders','cash','labels','registry','prescriptions','wholesale'].includes(currentPage);
  create.textContent=currentPage==='cash'?(state.shift?'Закрыть смену':'Открыть смену'):'＋ Создать';
  if(state[currentPage]&&currentPage!=='orders'){$('#moduleContent').innerHTML=cardList(state[currentPage],currentPage);bindCards();return}
  const renders={
    orders:()=>orderOperationsView(),
    registry:()=>registryView(),
    prescriptions:()=>prescriptionsView(),
    lenscare:()=>lensCareView(),
    production:()=>productionBoard(),
    stock:()=>stockView(),
    serials:()=>serialsView(),
    inventory:()=>inventoryView(),
    cash:()=>cashView(),
    wholesale:()=>wholesaleView(),
    installments:()=>installmentsView(),
    branches:()=>branchesView(),
    equipment:()=>equipmentView(),
    labels:()=>`<section class="card form-section"><h2>${t('labels.print_labels')}</h2><div class="form-grid"><label class="full">${t('labels.products')}<select multiple size="5">${state.catalog.map(x=>`<option>${catalogDisplayName(x)}</option>`).join('')}</select></label><label>${t('labels.template')}<select><option>${t('labels.price_tag_58')}</option><option>${t('labels.label_40')}</option></select></label><label>${t('labels.quantity')}<input type="number" value="1" min="1"></label></div><button class="primary" data-print style="margin-top:16px">${t('labels.generate_print_sheet')}</button></section>`,
    reports:()=>analytics(true),
    analytics:()=>analytics(false),
    settings:()=>settingsView()
  };
  $('#moduleContent').innerHTML=(renders[currentPage]||renders.analytics)();
  $$('#moduleContent .workshop-order .tag').forEach(tag=>{const direction=tag.textContent.trim();tag.outerHTML=directionBadge(direction)});
  bindCards();
  if(currentPage==='orders'){$$('#moduleContent .dots').forEach(b=>b.onclick=()=>showOrder(+b.closest('tr').dataset.orderId));$$('#moduleContent [data-sms]').forEach(b=>b.onclick=()=>openSms(+b.dataset.sms))}
  $('[data-payment]')?.addEventListener('click',()=>openPayment(false));
  $('[data-refund]')?.addEventListener('click',()=>openPayment(true));
}
function settingsView(){
  const p=state.preferences;
  const switches=['settings.two_factor','settings.low_stock_notifications','settings.ready_sms','settings.automatic_backup'];
  return `<div class="settings-layout"><section class="card settings-card"><span class="settings-icon">◎</span><div><span class="eyebrow">${t('settings.interface')}</span><h2>${t('settings.language_appearance')}</h2><p>${t('settings.applied_immediately')}</p></div><div class="settings-fields"><label>${t('settings.interface_language')}<select data-setting="language"><option value="ru" ${p.language==='ru'?'selected':''}>${t('settings.language_ru')}</option><option value="uz" ${p.language==='uz'?'selected':''}>${t('settings.language_uz')}</option><option value="en" ${p.language==='en'?'selected':''}>${t('settings.language_en')}</option></select></label><label>${t('settings.theme')}<select data-setting="theme"><option value="light" ${p.theme!=='dark'?'selected':''}>${t('settings.theme_light')}</option><option value="dark" ${p.theme==='dark'?'selected':''}>${t('settings.theme_dark')}</option></select></label></div><div class="theme-preview"><button data-theme-choice="light" title="${t('settings.theme_light')}"></button><button data-theme-choice="dark" title="${t('settings.theme_dark')}"></button></div></section><section class="card settings-card"><span class="settings-icon">◈</span><div><span class="eyebrow">${t('settings.workspace')}</span><h2>${t('settings.behaviour')}</h2><p>${t('settings.behaviour_hint')}</p></div><div class="settings-switches">${switches.map((key,i)=>`<label class="switch">${t(key)}<input type="checkbox" ${i!==0?'checked':''}></label>`).join('')}</div></section></div><button class="primary" data-save-settings style="margin-top:18px">${t('settings.save')}</button>`;
}
function sectionShell(kpis,body){return `<section class="scale-kpis">${kpis.map((x,i)=>`<article class="card"><small>${x[0]}</small><strong>${x[1]}</strong><span>${x[2]}</span><i class="tone-dot tone-${['blue','green','amber','purple','red'][i%5]}"></i></article>`).join('')}</section>${body}`}
const directionMeta={'Оптика':['optic','◉'],'Офтальмология':['optic','◉'],'Слух':['hearing','◖'],'Аудиология':['hearing','◖'],'Протезирование':['prosthetics','⚙'],'Ортопедия':['orthopedics','◇'],'Медтехника':['medtech','✚'],'Комплект':['prosthetics','⚙']};
function directionBadge(direction){const meta=directionMeta[direction]||['other','•'];return `<span class="direction-badge direction-${meta[0]}">${escapeHtml(direction)}</span>`}
function directionTone(direction){return (directionMeta[direction]||['other'])[0]}
function registryView(){
  const rows=[['09:00','Елена Орлова','Офтальмология','Д-р А. Садыкова','Принят'],['10:30','Марат Ахметов','Аудиология','Д-р Д. Ким','Ожидает'],['12:00','Диана Садыкова','Ортопедия','М. Алиев','Запланирован'],['14:30','Шахноза Каримова','Протезирование','С. Ли','Подтверждён'],['16:00','Алексей Морозов','Медтехника','Т. Алимов','Запланирован']];
  return sectionShell([['Сегодня','26 визитов','3 филиала'],['В клинике','8 пациентов','2 ожидают'],['Свободные окна','7','до 18:00'],['Не пришли','2','7,7% записей']],`<section class="card schedule-board"><div class="module-toolbar"><button class="secondary">← 31 июля →</button><select><option>Все филиалы</option><option>Медцентр Юнусабад</option><option>Магазин Чиланзар</option><option>Медцентр Самарканд</option></select><select><option>Все направления</option><option>Офтальмология</option><option>Аудиология</option><option>Протезирование</option></select><button class="primary" data-demo-action="Запись создана">＋ Записать пациента</button></div><div class="table-wrap"><table><thead><tr><th>Время</th><th>Пациент</th><th>Направление</th><th>Специалист</th><th>Статус</th><th>Действия</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td><strong>${r[1]}</strong><small>Карта PT-${Math.floor(Math.random()*8000+1000)}</small></td><td>${r[2]}</td><td>${r[3]}</td><td><span class="status ${r[4]==='Принят'?'success':r[4]==='Ожидает'?'danger':'info'}">${r[4]}</span></td><td><button class="table-action" data-demo-action="Статус визита обновлён">Изменить статус</button></td></tr>`).join('')}</tbody></table></div></section>`)}
function prescriptionsView(){
  const rows=[['RX-2048','Елена Орлова','А. Садыкова','OD −1.50 / −0.50 × 80°','OS −1.75 / −0.25 × 95°','PD 62 · ADD +1.50','Действует'],['RX-2047','Бекзод Умаров','И. Рахимова','OD +2.25 / −0.75 × 15°','OS +2.00 / −0.50 × 170°','PD 64 · ADD +2.00','Использован'],['RX-2044','Наталья Пак','А. Садыкова','OD −3.25 sph','OS −3.00 sph','PD 60','Истекает']];
  return sectionShell([['Активные рецепты','1 284','по всей сети'],['Выписано сегодня','18','5 специалистов'],['Использовано в заказах','76%','за 30 дней'],['Истекают','23','в течение месяца']],`<section class="card clinical-table"><div class="module-toolbar"><label class="search">⌕ <input placeholder="Пациент, номер рецепта или врач"></label><button class="primary" data-demo-action="Новый рецепт подготовлен">＋ Выписать рецепт</button></div><div class="table-wrap"><table><thead><tr><th>Рецепт</th><th>Пациент / врач</th><th>Правый глаз OD</th><th>Левый глаз OS</th><th>Дополнительно</th><th>Статус</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r[0]}</b><small>31.07.2026</small></td><td><strong>${r[1]}</strong><small>${r[2]}</small></td><td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td><td><span class="status ${r[6]==='Действует'?'success':r[6]==='Истекает'?'danger':'info'}">${r[6]}</span></td></tr>`).join('')}</tbody></table></div></section>`)}
function lensCareView(){return sectionShell([['Под наблюдением','684 клиента','контактные линзы'],['Замена сегодня','18','нужно уведомить'],['Просрочено','27','требует связи'],['Конверсия повторных продаж','71%','+6% за месяц']],`<section class="card reminder-center"><div class="card-title"><div><h2>Центр контроля замены</h2><p>Дата рассчитывается от срока ношения и последней покупки</p></div><button class="primary" data-demo-action="18 напоминаний поставлены в очередь">Отправить напоминания</button></div><div class="reminder-list">${[['Елена Орлова','Acuvue Oasys · 14 дней','Сегодня','Готово к SMS'],['Наталья Пак','Biofinity Toric · 30 дней','Просрочено 6 дней','Позвонить'],['Бекзод Умаров','Dailies Total 1 · 30 шт.','Через 3 дня','SMS запланировано']].map((r,i)=>`<article><span class="avatar">${initials(r[0])}</span><div><b>${r[0]}</b><small>${r[1]}</small></div><strong class="${i===1?'danger-text':''}">${r[2]}</strong><button class="table-action" data-demo-action="Напоминание отправлено">${r[3]}</button></article>`).join('')}</div></section>`)}
function serialsView(){const rows=[['SN-PH-L70-240188','Phonak Audéo Lumity L70-R','Слух','Медцентр Юнусабад','В резерве','Марат Ахметов'],['OT-TL-882104','Модуль стопы Ottobock Taleo','Протезирование','Центральный склад','В наличии','—'],['OM-M3-557201','Omron M3 Comfort','Медтехника','Магазин Чиланзар','Продан','Алексей Морозов'],['SET-PR-00084','Комплект протеза BK-04','Комплект','Мастерская Юнусабад','В сборке','Шахноза Каримова']];return sectionShell([['Серийных единиц','486','на балансе'],['В резерве','32','под 28 заказов'],['На гарантии','214','активных изделий'],['Комплектов','41','12 в сборке']],`<section class="card"><div class="module-toolbar"><label class="search">⌕ <input placeholder="Серийный номер, штрихкод, изделие или клиент"></label><button class="secondary" data-demo-action="Открыт мастер сборки комплекта">Собрать комплект</button><button class="primary" data-demo-action="Карточка экземпляра создана">＋ Серийный экземпляр</button></div><div class="table-wrap"><table><thead><tr><th>Серийный номер</th><th>Изделие</th><th>Направление</th><th>Местонахождение</th><th>Статус</th><th>Клиент / заказ</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td><span class="status ${r[4]==='Продан'?'success':r[4]==='В резерве'?'info':'partial'}">${r[4]}</span></td><td>${r[5]}</td><td><button class="table-action" data-demo-action="История перемещений открыта">История</button></td></tr>`).join('')}</tbody></table></div></section>`)}
function inventoryView(){return sectionShell([[t('inventory.book_value'),formatMoney(246850000),t('inventory.working_capital')],[t('inventory.items'),'3 842',t('inventory.warehouses',{count:7})],[t('inventory.class_a'),'68%',t('inventory.items_count',{count:312})],[t('inventory.discrepancies'),t('inventory.items_count',{count:4}),`−${formatMoney(1260000)}`]],`<div class="inventory-layout"><section class="card audit-card"><div class="card-title"><div><h2>${t('inventory.count_title',{number:'INV-26-0731'})}</h2><p>${t('inventory.responsible',{warehouse:t('branches.warehouse.name'),employee:'<span data-user-content>Сергей Ли</span>'})}</p></div><span class="status info">${t('inventory.counted',{percent:62})}</span></div><div class="big-progress"><i style="width:62%"></i></div><div class="audit-stats"><span><small>${t('inventory.checked')}</small><b>1 946</b></span><span><small>${t('inventory.matched')}</small><b>1 942</b></span><span><small>${t('inventory.surplus')}</small><b>1</b></span><span><small>${t('inventory.shortage')}</small><b>3</b></span></div><button class="primary" data-inventory-count>${t('inventory.continue')}</button></section><section class="card abc-card"><div class="card-title"><div><h2>${t('inventory.abc_title')}</h2><p>${t('inventory.abc_hint')}</p></div></div>${[['A',167800000,'68%','#3478f6'],['B',51900000,'21%','#8b6ce5'],['C',27100000,'11%','#d99a31']].map(x=>`<div class="abc-row"><b style="color:${x[3]}">${x[0]}</b><div><strong>${formatMoney(x[1])}</strong><span><i style="width:${x[2]};background:${x[3]}"></i></span></div><small>${x[2]}</small></div>`).join('')}</section></div>`)}
function wholesaleView(){const rows=[['OOO «Medline Trade»','ИНН 307445821','Договор ML-24/18','120 млн сум','36,4 млн сум','Активен'],['Samarkand Rehab Group','ИНН 309118452','Договор SR-11/04','80 млн сум','12,8 млн сум','Активен'],['Clinic Supply Asia','ИНН 305772190','На согласовании','—','0','Проверка']];return sectionShell([['Оптовая выручка','184,6 млн сум','за июль'],['Дебиторская задолженность','49,2 млн сум','8 контрагентов'],['Доступный лимит','151 млн сум','по договорам'],['Просрочено','8,4 млн сум','2 контрагента']],`<section class="card"><div class="module-toolbar"><label class="search">⌕ <input placeholder="Организация, ИНН, договор"></label><button class="primary" data-demo-action="Карточка контрагента создана">＋ Контрагент</button></div><div class="table-wrap"><table><thead><tr><th>Контрагент</th><th>Реквизиты</th><th>Договор</th><th>Кредитный лимит</th><th>Задолженность</th><th>Статус</th></tr></thead><tbody>${rows.map(r=>`<tr><td><strong>${r[0]}</strong><small>Контактное лицо · +998 90 000-00-00</small></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td><b>${r[4]}</b></td><td><span class="status ${r[5]==='Активен'?'success':'info'}">${r[5]}</span></td></tr>`).join('')}</tbody></table></div></section>`)}
function installmentsView(){const rows=[['INS-1042','Шахноза Каримова',t('installments.product.prosthesis'),48000000,19200000,'05.08.2026','on_schedule'],['INS-1038','Марат Ахметов','Phonak Audéo L70-R',6840000,2280000,'28.07.2026','overdue'],['INS-1029','Алексей Морозов',t('installments.product.oxygen'),12500000,7500000,'12.08.2026','on_schedule']];return sectionShell([[t('installments.active_contracts'),'46',t('installments.clients',{count:92})],[t('installments.balance'),formatMoney(186400000),t('installments.receivable')],[t('installments.august_payments'),formatMoney(38700000),t('installments.payments',{count:54})],[t('installments.overdue'),formatMoney(11200000),t('installments.payments',{count:6})]],`<section class="card"><div class="table-wrap"><table><thead><tr><th>${t('installments.contract')}</th><th>${t('installments.client')}</th><th>${t('installments.product')}</th><th>${t('common.amount')}</th><th>${t('installments.remaining')}</th><th>${t('installments.next_payment')}</th><th>${t('installments.status')}</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${formatMoney(r[3])}</td><td><b>${formatMoney(r[4])}</b></td><td>${r[5]}</td><td><span class="status ${r[6]==='overdue'?'danger':'success'}">${t(`installments.status.${r[6]}`)}</span></td><td><button class="table-action" data-demo-action="installment-schedule">${t('installments.schedule')}</button></td></tr>`).join('')}</tbody></table></div></section>`)}
const NETWORK_BRANCHES=[
 {id:'yunusabad',name:'Медицинский центр Юнусабад',city:'Ташкент',type:'Медицинский центр и мастерская',address:'Юнусабадский район, ул. Амира Темура, 108',phone:'+998 71 200-10-01',hours:'Пн–Сб 08:00–20:00, Вс 09:00–18:00',manager:'Карина Тё',staff:18,doctors:6,cashDesks:2,warehouses:2,revenue:'84,6 млн сум',stockValue:'61,4 млн сум',status:'Работает',services:['Офтальмология','Аудиология','Оптика','Протезирование','Ортопедия'],rooms:'8 кабинетов, 2 диагностических зала',workshop:'Оптика, слух и ортопедия',parking:'12 мест · вход доступен для колясок'},
 {id:'chilanzar',name:'Магазин Чиланзар',city:'Ташкент',type:'Розничный магазин и сервис',address:'Чиланзарский район, просп. Бунёдкор, 23',phone:'+998 71 200-10-02',hours:'Ежедневно 09:00–21:00',manager:'Илья Усманов',staff:9,doctors:0,cashDesks:2,warehouses:1,revenue:'46,2 млн сум',stockValue:'38,7 млн сум',status:'Работает',services:['Оптика','Медицинская техника','Выдача заказов','Сервис и гарантия'],rooms:'Торговый зал и сервисная зона',workshop:'Экспресс-ремонт и настройка',parking:'Парковка торгового центра'},
 {id:'samarkand',name:'Медицинский центр Самарканд',city:'Самарканд',type:'Медицинский центр и магазин',address:'ул. Мирзо Улугбека, 52',phone:'+998 66 240-10-03',hours:'Пн–Сб 08:30–19:30, Вс 09:00–17:00',manager:'Дмитрий Ким',staff:14,doctors:5,cashDesks:2,warehouses:2,revenue:'57,9 млн сум',stockValue:'49,8 млн сум',status:'Работает',services:['Офтальмология','Аудиология','Оптика','Ортопедия','Медицинская техника'],rooms:'6 кабинетов и диагностический зал',workshop:'Оптика и слуховые аппараты',parking:'8 мест · безбарьерный вход'},
 {id:'warehouse',name:'Центральный склад',city:'Ташкент',type:'Склад и логистический центр',address:'Сергелийский район, Промышленная зона, 14',phone:'+998 71 200-10-04',hours:'Пн–Сб 08:00–18:00',manager:'Сергей Ли',staff:11,doctors:0,cashDesks:0,warehouses:2,revenue:'Не применяется',stockValue:'246,85 млн сум',status:'Работает',services:['Приёмка поставок','Хранение','Комплектация','Перемещения между филиалами'],rooms:'2 складские зоны и зона приёмки',workshop:'Сборка комплектов и маркировка',parking:'Грузовой въезд · 3 погрузочных места'}
];
function branchActivity(branch){const names=branch.id==='yunusabad'?['Медцентр Юнусабад','Медицинский центр Юнусабад']:branch.id==='samarkand'?['Медцентр Самарканд','Медицинский центр Самарканд']:branch.id==='chilanzar'?['Магазин Чиланзар']:['Центральный склад'],matches=x=>names.includes(x.branch)||names.includes(x.warehouse)||names.includes(x.location),orders=state.orders.filter(matches),appointments=state.appointments.filter(matches),equipment=state.equipment?.filter(matches)||[];return {orders:orders.filter(x=>!['Выдан','Отменён','Черновик'].includes(x.status)).length,appointments:appointments.filter(x=>x.date===new Date().toISOString().slice(0,10)).length,equipment:equipment.length,overdue:orders.filter(x=>x.deadline&&x.deadline<new Date().toISOString().slice(0,10)&&!['Выдан','Отменён'].includes(x.status)).length}}
function openBranchDetail(id){const b=NETWORK_BRANCHES.find(x=>x.id===id);if(!b)return;const a=branchActivity(b);$('#detailTitle').textContent=b.name;$('#detailContent').innerHTML=`<div class="branch-detail-head"><div><span class="status success">● ${escapeHtml(b.status)}</span><h2>${escapeHtml(b.type)}</h2><p>${escapeHtml(b.address)}</p></div><a class="secondary" href="tel:${escapeHtml(b.phone.replace(/[^+\d]/g,''))}">${escapeHtml(b.phone)}</a></div><div class="detail-list branch-detail-grid">${[['Руководитель',b.manager],['Режим работы',b.hours],['Сотрудники',`${b.staff} человек`],['Врачи и специалисты',b.doctors?`${b.doctors} специалистов`:'Медицинского приёма нет'],['Кассы',b.cashDesks?`${b.cashDesks} кассы`:'Кассы отсутствуют'],['Складские зоны',`${b.warehouses}`],['Выручка за текущий месяц',b.revenue],['Стоимость товарных остатков',b.stockValue],['Помещения',b.rooms],['Мастерская / производство',b.workshop],['Доступность и парковка',b.parking],['Активные заказы',String(a.orders)],['Записи на сегодня',String(a.appointments)],['Просроченные заказы',String(a.overdue)],['Единиц оборудования в учёте',String(a.equipment)]].map(([label,value])=>`<div><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div>`).join('')}</div><section class="branch-services"><h3>Услуги и функции подразделения</h3><div>${b.services.map(x=>`<span class="tag">${escapeHtml(x)}</span>`).join('')}</div></section>`;detailDialog.showModal()}
function branchesView(){const totals=NETWORK_BRANCHES.reduce((x,b)=>({staff:x.staff+b.staff,cash:x.cash+b.cashDesks,warehouses:x.warehouses+b.warehouses}),{staff:0,cash:0,warehouses:0});return sectionShell([[t('branches.units'),NETWORK_BRANCHES.length,t('branches.cities_hint')],[t('branches.employees'),totals.staff,t('branches.network_hint')],[t('branches.cash_desks'),totals.cash,t('branches.workplaces')],[t('branches.warehouse_zones'),totals.warehouses,t('branches.units_hint')]],`<div class="branch-grid">${NETWORK_BRANCHES.map((b,i)=>`<article class="card branch-card" data-branch-id="${b.id}"><header><span class="branch-icon">${['✚','▣','✚','▦'][i]}</span><span class="status success">● ${t('branches.status.operating')}</span></header><h3>${t(`branches.${b.id}.name`)}</h3><p>${t(`branches.${b.id}.location_type`)}</p><div><span><small>${t('branches.team')}</small><b>${t('branches.employee_count',{count:b.staff})}</b></span><span><small>${b.id==='warehouse'?t('branches.stock_value'):t('branches.monthly_revenue')}</small><b>${b.id==='warehouse'?formatMoney(246850000):formatMoney([84600000,46200000,57900000][i]||0)}</b></span></div><button class="secondary" data-open-branch="${b.id}">${t('branches.open')}</button></article>`).join('')}</div>`)}
function equipmentView(){const rows=[['EQ-0018','Авторефрактометр Huvitz HRK-8000A','Диагностика','Юнусабад · каб. 204','А. Садыкова','Работает','15.09.2026'],['EQ-0041','Станок Essilor Mr Blue 2.0','Мастерская','Юнусабад · участок 1','Т. Алимов','На ТО','02.08.2026'],['EQ-0056','Аудиометр Interacoustics AC40','Аудиология','Самарканд · каб. 12','Д. Ким','Работает','20.10.2026'],['EQ-0082','Кислородный анализатор MaxO2+','Сервис','Чиланзар · сервис','И. Усманов','Ремонт','31.07.2026']];return sectionShell([['На балансе','128 единиц','42,8 млн сум'],['Работает','117','91,4% парка'],['На ТО','7','3 просрочено'],['В ремонте','4','2 критичных']],`<section class="card"><div class="module-toolbar"><label class="search">⌕ <input placeholder="Инвентарный или серийный номер, модель"></label><button class="primary" data-demo-action="Карточка оборудования создана">＋ Оборудование</button></div><div class="table-wrap"><table><thead><tr><th>Инв. №</th><th>Оборудование</th><th>Тип</th><th>Локация</th><th>Ответственный</th><th>Состояние</th><th>Следующее ТО</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r[0]}</b></td><td><strong>${r[1]}</strong><small>Серийный номер сохранён</small></td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td><span class="status ${r[5]==='Работает'?'success':r[5]==='Ремонт'?'danger':'info'}">${r[5]}</span></td><td>${r[6]}</td></tr>`).join('')}</tbody></table></div></section>`)}
function orderOperationsView(){
  const directions=['Все направления','Оптика','Слух','Протезирование','Ортопедия','Медтехника'];
  return `<section class="care-summary">${directions.slice(1).map((d,i)=>`<article class="card"><span>${['◉','◖','⚙','◇','✚'][i]}</span><div><small>${MedicaI18n.system('direction',d)}</small><strong>${t('orders.count',{count:state.orders.filter(o=>(o.direction||'Оптика')===d).length})}</strong></div></article>`).join('')}</section><section class="card operations-card"><div class="module-toolbar"><label class="search">⌕ <input data-order-module-search placeholder="${t('orders.search_placeholder')}"></label><select data-direction-filter>${directions.map(x=>`<option value="${x}">${x==='Все направления'?t('production.all_directions'):MedicaI18n.system('direction',x)}</option>`).join('')}</select><button class="secondary" id="openFilters">${t('orders.filters')}</button></div><div class="table-wrap"><table class="operations-table"><thead><tr>${['order_direction','client','product','stage_progress','responsible','deadline','payment'].map(key=>`<th>${t(`orders.column.${key}`)}</th>`).join('')}<th></th></tr></thead><tbody>${state.orders.map(o=>`<tr data-order-id="${o.id}" data-direction="${o.direction||'Оптика'}"><td><strong>№ ${o.id}</strong><small>${MedicaI18n.system('direction',o.direction||'Оптика')}</small></td><td><strong>${escapeHtml(o.client)}</strong><small>${escapeHtml(o.phone)}</small></td><td><strong>${escapeHtml(localizedSeed('orders.product',o.id,o.product||t('orders.custom_product')))}</strong><small>${formatMoney(o.sum)}</small></td><td><strong>${MedicaI18n.system('stage',o.stage||o.status)}</strong><div class="mini-progress"><i style="width:${o.progress||45}%"></i></div><small>${t('orders.progress',{percent:o.progress||45})}</small></td><td><strong>${escapeHtml(o.responsible||t('common.unassigned'))}</strong><small>${t('orders.assignee')}</small></td><td><strong>${escapeHtml(o.deadline)}</strong><small>${MedicaI18n.system('status',o.status)}</small></td><td><span class="payment ${o.payment==='Оплачено'?'paid':'partial'}">${escapeHtml(paymentText(o.payment))}</span></td><td><button class="dots">•••</button></td></tr>`).join('')}</tbody></table></div></section>`;
}
function cashView(){
  return `<div class="cash-dashboard"><section class="card shift-card"><div><span class="eyebrow">Кассовая смена №184</span><h2>${state.shift?'Смена открыта':'Смена закрыта'}</h2><p>${state.shift?'Анна Ким · с 09:02':'Откройте смену для проведения операций'}</p></div><span class="status ${state.shift?'success':'danger'}">${state.shift?'● Активна':'● Закрыта'}</span></section><section class="card payment-search"><h2>Быстрая оплата заказа</h2><label class="search">⌕ <input placeholder="Номер заказа, клиент, телефон или серийный номер"></label><div class="cash-actions"><button class="primary" data-payment ${state.shift?'':'disabled'}>сум Принять оплату</button><button class="secondary" data-refund ${state.shift?'':'disabled'}>↩ Возврат</button></div></section></div><section class="cash-kpis">${[['Наличные','128 400 сум','8 операций'],['Карты и QR','392 800 сум','16 операций'],['Авансы','184 000 сум','6 заказов'],['Задолженность','126 300 сум','4 заказа'],['Возвраты','12 500 сум','1 операция']].map((x,i)=>`<article class="card tone-${['green','blue','purple','amber','red'][i]}"><small>${x[0]}</small><strong>${state.shift?x[1]:'—'}</strong><span>${state.shift?x[2]:'Смена закрыта'}</span></article>`).join('')}</section><section class="card cash-register"><div class="card-title"><div><h2>Операции смены</h2><p>Платежи по всем направлениям медицинского салона</p></div><button class="secondary">Сверка итогов</button></div><div class="table-wrap"><table><thead><tr><th>Время</th><th>Документ</th><th>Клиент</th><th>Направление</th><th>Операция</th><th>Способ</th><th>Сумма</th></tr></thead><tbody><tr><td>14:42</td><td>№2474</td><td>Диана Садыкова</td><td>Ортопедия</td><td>Окончательный расчет</td><td>Карта</td><td><b>44 600 сум</b></td></tr><tr><td>13:18</td><td>№2480</td><td>Марат Ахметов</td><td>Слух</td><td>Аванс</td><td>QR</td><td><b>300 000 сум</b></td></tr><tr><td>11:05</td><td>SRV-702</td><td>Алексей Морозов</td><td>Медтехника</td><td>Сервис</td><td>Наличные</td><td><b>12 800 сум</b></td></tr></tbody></table></div></section>`;
}
const translations={
  ru:{dashboard:'Главная',orders:'Заказы',clients:'Клиенты',registry:'Регистратура',encounters:'Обращения и рецепты',prescriptions:'Рецепты',lenscare:'Контроль линз',production:'Мастерская',service:'Сервис и гарантия',cash:'Касса и оплаты',catalog:'Номенклатура',stock:'Остатки',serials:'Серийные изделия',inventory:'Инвентаризация',invoices:'Накладные',suppliers:'Поставщики и закупки',labels:'Штрихкоды и ценники',wholesale:'Оптовые продажи',installments:'Рассрочки',branches:'Филиалы сети',equipment:'Оборудование',reports:'Отчеты',analytics:'Аналитика',directories:'Справочники',employees:'Сотрудники и роли',settings:'Настройки'},
  uz:{dashboard:'Bosh sahifa',orders:'Buyurtmalar',clients:'Mijozlar',registry:'Registratura',encounters:'Murojaatlar va retseptlar',prescriptions:'Retseptlar',lenscare:'Linza nazorati',production:'Ustaxona',service:'Servis va kafolat',cash:'Kassa va to‘lovlar',catalog:'Mahsulotlar',stock:'Qoldiqlar',serials:'Seriyali mahsulotlar',inventory:'Inventarizatsiya',invoices:'Yuk xatlari',suppliers:'Yetkazib beruvchilar',labels:'Shtrix-kodlar',wholesale:'Ulgurji savdo',installments:'Bo‘lib to‘lash',branches:'Filiallar',equipment:'Uskunalar',reports:'Hisobotlar',analytics:'Tahlil',directories:'Ma’lumotnomalar',employees:'Xodimlar va rollar',settings:'Sozlamalar'},
  en:{dashboard:'Dashboard',orders:'Orders',clients:'Clients',registry:'Reception',encounters:'Visits & prescriptions',prescriptions:'Prescriptions',lenscare:'Lens replacement',production:'Workshop',service:'Service & warranty',cash:'Cash & payments',catalog:'Products',stock:'Stock',serials:'Serialized devices',inventory:'Inventory count',invoices:'Invoices',suppliers:'Suppliers & purchasing',labels:'Barcodes & labels',wholesale:'Wholesale',installments:'Installments',branches:'Network branches',equipment:'Company equipment',reports:'Reports',analytics:'Analytics',directories:'Directories',employees:'Employees & roles',settings:'Settings'}
};
function applyPreferences(){
  const p=state.preferences||{language:'ru',theme:'light'};if(p.theme!=='dark')p.theme='light';document.documentElement.dataset.theme=p.theme;document.documentElement.lang=p.language;
  Object.keys(translations.ru).forEach(page=>{const el=$(`[data-page="${page}"] .nav-label`);if(el)el.textContent=window.MedicaI18n.t(`nav.${page}`)});
  $$('[data-theme-choice]').forEach(button=>{const active=button.dataset.themeChoice===p.theme;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
}
function stockView(){
  const low=state.catalog.filter(x=>Number(x.stock)<=4);
  const total=state.catalog.reduce((s,x)=>s+Number(x.stock||0),0);
  return `<section class="inventory-kpis">${[['Всего единиц',total,'Во всех локациях'],['Зарезервировано',7,'Под клиентские заказы'],['Серийный учет',state.catalog.filter(x=>x.serial).length,'Медизделия и аппараты'],['В пути',14,'3 перемещения'],['Ниже минимума',low.length,'Нужно пополнить']].map((x,i)=>`<article class="card"><span>${['▦','◈','#','⇄','!'][i]}</span><div><small>${x[0]}</small><strong>${x[1]}</strong><em>${x[2]}</em></div></article>`).join('')}</section><section class="card procurement-panel"><div class="procurement-head"><div><span class="eyebrow">Автоматизация закупок</span><h2>Рекомендовано пополнить ${low.length} позиции</h2><p>Учитываются свободный остаток, резерв, товары в пути и минимальный уровень.</p></div><button class="primary" data-procure-all>Создать общую заявку</button></div><div class="procurement-list">${low.map(x=>`<article class="procurement-item"><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.category)} · остаток: ${x.stock} · минимум: 5 · заказать: ${Math.max(10-x.stock,5)}</small><button data-procure="${x.id}">＋ Черновик заявки</button></article>`).join('')}</div></section><section class="card inventory-register"><div class="module-toolbar"><label class="search">⌕ <input data-stock-search placeholder="Название, артикул, серия или штрихкод"></label><select><option>Все направления</option><option>Оптика</option><option>Слух</option><option>Протезирование</option><option>Ортопедия</option><option>Медтехника</option></select><button class="secondary">Инвентаризация</button></div><div class="table-wrap"><table><thead><tr><th>Товар</th><th>Категория</th><th>Учет</th><th>Свободно</th><th>Резерв</th><th>В пути</th><th>Доступно</th><th>Локация</th></tr></thead><tbody>${state.catalog.map((x,i)=>`<tr><td><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.sku)}</small></td><td>${escapeHtml(x.category)}</td><td><span class="tag">${x.serial?'Серийный':'Количественный'}</span></td><td>${x.stock}</td><td>${i%3}</td><td>${i%2?2:0}</td><td><b>${Math.max(0,x.stock-i%3)}</b></td><td>${i%2?'Абая, 12':'Центральный склад'}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function productionBoard(){
  const active=state.orders.filter(o=>!['Выдан','Отменён','Черновик'].includes(o.status));
  const workload={};active.forEach(o=>workload[o.responsible]=(workload[o.responsible]||0)+1);
  return `<section class="card workshop-command"><div><span class="eyebrow">${t('production.title')}</span><h2>${t('production.active_orders',{count:active.length})}</h2><p>${t('production.summary_hint')}</p></div><div class="workshop-stats"><span><b>${active.filter(o=>o.priority==='Срочный'||o.status==='Требует обеспечения').length}</b> ${t('production.need_attention')}</span><span><b>${Object.keys(workload).length}</b> ${t('production.assignees')}</span><span><b>94%</b> ${t('production.on_time')}</span></div></section><div class="workshop-toolbar card"><label class="search">⌕ <input data-work-search placeholder="${t('production.search_placeholder')}"></label><select data-work-filter><option value="">${t('production.all_directions')}</option>${['Оптика','Слух','Протезирование','Ортопедия','Медтехника'].map(value=>`<option value="${value}">${MedicaI18n.system('direction',value)}</option>`).join('')}</select><button class="secondary" data-work-attention>${t('production.need_attention')}</button></div><section class="workshop-grid">${active.map((o,i)=>workshopCard(o,i)).join('')}</section>`;
}
const workshopRoutes={
  'Оптика':['Комплектация','Обработка линз','Сборка','Контроль качества','Готов к выдаче','Выдано'],
  'Слух':['Комплектация','Настройка и аудиометрия','Обучение клиента','Контроль качества','Готов к выдаче','Выдано'],
  'Протезирование':['Снятие мерок','Тестовая гильза и примерка','Финальная сборка','Контроль качества','Готов к выдаче','Выдано'],
  'Ортопедия':['Сканирование и моделирование','Изготовление','Примерка','Контроль качества','Готов к выдаче','Выдано'],
  'Медтехника':['Обеспечение','Доставка и установка','Обучение клиента','Контроль качества','Готов к выдаче','Выдано']
};
const workshopMasters={
  'Оптика':['Тимур Алимов','Анна Ким'],
  'Слух':['Данияр Ким'],
  'Протезирование':['Сергей Ли'],
  'Ортопедия':['Тимур Алимов'],
  'Медтехника':['Ильхом Усманов']
};
function workshopRoute(o){return workshopRoutes[o.direction]||workshopRoutes['Оптика']}
function workshopIndex(o){const route=workshopRoute(o),exact=route.indexOf(o.stage);if(exact>=0)return exact;if(o.status==='Готов')return route.length-2;if(o.status==='Выдан')return route.length-1;return Math.max(0,Math.round(Number(o.progress||0)/100*(route.length-1)))}
function workshopProgress(o){return Math.round(workshopIndex(o)/(workshopRoute(o).length-1)*100)}
function workshopTiming(o){const plannedHours=Number(o.plannedStageHours||24),started=o.stageStartedAt?new Date(o.stageStartedAt):null;if(!started)return {key:'plan',label:`По плану · ${plannedHours} ч`};const elapsed=(Date.now()-started)/36e5,ratio=elapsed/plannedHours;return ratio>1?{key:'late',label:`Просрочено на ${Math.ceil(elapsed-plannedHours)} ч`}:ratio>.75?{key:'soon',label:`Срок приближается · ${Math.max(1,Math.ceil(plannedHours-elapsed))} ч`}:{key:'plan',label:`По плану · ${Math.max(1,Math.ceil(plannedHours-elapsed))} ч`}}
function workshopBalance(o){const payments=load('payments',[]).filter(x=>x.orderId===o.id),paid=payments.filter(x=>x.type!=='Возврат').reduce((s,x)=>s+Number(x.amount||0),0),refunded=payments.filter(x=>x.type==='Возврат').reduce((s,x)=>s+Number(x.amount||0),0);return Math.max(0,Number(o.sum||0)-paid+refunded)}
function workshopEvent(o,from,to,comment,action='Переход'){const now=new Date(),previous=o.stageStartedAt?Math.max(0,Math.round((now-new Date(o.stageStartedAt))/60000)):0;o.stageHistory??=[];o.stageHistory.push({from,to,at:now.toISOString(),employee:state.profile.name,comment,action,durationMinutes:previous});o.workHistory??=[];o.workHistory.push(`${window.MedicaI18n.formatDateTime(now)} · ${from} → ${to} · ${state.profile.name}${comment?' · '+comment:''}`);o.stageStartedAt=now.toISOString()}
function advanceWorkshop(o){
  const route=workshopRoute(o),index=workshopIndex(o),current=route[index],next=route[index+1];
  if(!next)return;
  if(current==='Контроль качества'){
    if(!confirm(t('dialog.required_quality_control')))return;
    o.quality='ОТК пройден';o.qualityChecks={completeness:true,parameters:true,appearance:true,safety:true,checkedAt:new Date().toISOString(),employee:state.profile.name};
  }
  if(next==='Выдано'){
    if(o.quality!=='ОТК пройден'){notify('Выдача запрещена: обязательный контроль качества не завершён');return}
    const balance=workshopBalance(o);if(balance>0){notify(`Выдача запрещена: осталось оплатить ${formatMoney(balance)}`);return}
    if(!confirm(t('dialog.confirm_handover')))return;
  }
  const comment=prompt(t('dialog.transition_comment'),'');if(comment===null)return;
  workshopEvent(o,current,next,comment);o.stage=next;o.progress=workshopProgress(o);o.status=next==='Выдано'?'Выдан':next==='Готов к выдаче'?'Готов':'В работе';
  save('orders',state.orders);syncDashboard();renderModule();notify(`Заказ №${o.id}: ${next}`);
}
function returnWorkshop(o){const route=workshopRoute(o),index=workshopIndex(o);if(index<=0){notify('Это первый этап маршрута');return}const reason=prompt(t('dialog.return_reason'),'');if(!reason?.trim()){notify('Возврат без причины запрещён');return}const from=route[index],to=route[index-1];workshopEvent(o,from,to,reason.trim(),'Возврат');o.stage=to;o.progress=workshopProgress(o);o.status='В работе';if(from==='Готов к выдаче'||from==='Контроль качества'){o.quality='Требуется повторный ОТК';delete o.qualityChecks}save('orders',state.orders);syncDashboard();renderModule();notify(`Заказ №${o.id} возвращён: ${to}`)}
function assignWorkshop(o){const allowed=workshopMasters[o.direction]||workshopMasters['Оптика'],loads=Object.fromEntries(allowed.map(name=>[name,state.orders.filter(x=>x.responsible===name&&!['Выдан','Отменён','Черновик'].includes(x.status)).length])),answer=prompt(`Выберите мастера по специализации ${o.direction}:\n${allowed.map((x,i)=>`${i+1}. ${x} — ${loads[x]} активных`).join('\n')}`,'1');if(answer===null)return;const master=allowed[Number(answer)-1]||allowed.find(x=>x.toLowerCase()===answer.trim().toLowerCase());if(!master){notify('Выберите мастера из доступного списка');return}const previous=o.responsible||'Не назначен';o.responsible=master;o.master=master;o.assignmentHistory??=[];o.assignmentHistory.push({from:previous,to:master,at:new Date().toISOString(),employee:state.profile.name});workshopEvent(o,o.stage||o.status,o.stage||o.status,`Назначение: ${previous} → ${master}`,'Назначение');save('orders',state.orders);renderModule();notify(`Заказ №${o.id}: назначен ${master}`)}
function workshopCard(o,index){
  const timing=workshopTiming(o),attention=o.status==='Требует обеспечения'||o.priority==='Срочный'||timing.key==='late',s=statusView[o.status]||statusView['В работе'];
  const branch=o.branch||(index%2?'Медцентр Самарканд':'Медцентр Юнусабад');
  const supply=o.supply||(o.status==='Требует обеспечения'?'Требуется закупка · заявка не отправлена':'Материалы зарезервированы');
  const prescription=o.recipe||(o.direction==='Оптика'?'OD −1.50 / OS −1.75 · PD 62':o.direction==='Слух'?'Аудиограмма · 45 дБ':'Параметры сохранены в карте');
  const progress=workshopProgress(o),route=workshopRoute(o),stageIndex=workshopIndex(o),history=(o.stageHistory||[]).slice(-3).reverse();
  return `<article class="workshop-card card ${attention?'needs-attention':''}" data-work-item><header><div class="workshop-order"><span class="tag">${escapeHtml(o.direction||'Оптика')}</span><b>№ ${o.id}</b><span class="status ${s[0]}">${escapeHtml(o.status)}</span></div><span class="priority ${attention?'high':''}">${escapeHtml(o.priority||'Обычный')}</span></header><div class="workshop-title"><div><h3>${escapeHtml(o.product||'Индивидуальный заказ')}</h3><p>${escapeHtml(o.client)} · ${escapeHtml(o.phone)}</p></div><div class="deadline"><small>Срок</small><b>${escapeHtml(o.deadline)}</b><em class="stage-timing ${timing.key}">${escapeHtml(timing.label)}</em></div></div><div class="workshop-core"><span><small>Текущий этап</small><b>${escapeHtml(route[stageIndex])}</b></span><span><small>Ответственный</small><b>${escapeHtml(o.responsible||'Не назначен')}</b></span><span><small>Филиал</small><b>${escapeHtml(branch)}</b></span><span><small>Оплата</small><b>${escapeHtml(o.payment)}</b></span></div><div class="workshop-progress"><div><span>${progress}% готовности</span><small>${attention?'Нужно действие сотрудника':'Работа идёт по плану'}</small></div><div class="mini-progress"><i style="width:${progress}%"></i></div></div><div class="workshop-route">${route.map((stage,i)=>`<span class="${i<stageIndex?'done':i===stageIndex?'active':''}" title="${escapeHtml(stage)}">${i+1}</span>`).join('')}</div><details><summary>Полная информация по работе <span>＋</span></summary><div class="workshop-details"><span><small>Обеспечение</small><b>${escapeHtml(supply)}</b></span><span><small>Рецепт / параметры</small><b>${escapeHtml(prescription)}</b></span><span><small>Контроль качества</small><b>${escapeHtml(o.quality||'ОТК назначен после текущего этапа')}</b></span><span><small>Стоимость заказа</small><b>${formatMoney(o.sum)}</b></span></div><div class="workshop-history"><b>Последние события</b>${history.length?history.map(x=>`<p>${escapeHtml(window.MedicaI18n.formatDateTime(x.at))} · ${escapeHtml(x.from)} → ${escapeHtml(x.to)} · ${escapeHtml(x.employee)} · ${x.durationMinutes||0} мин.${x.comment?' · '+escapeHtml(x.comment):''}</p>`).join(''):'<p>История переходов появится после первого действия</p>'}</div></details><footer><button class="secondary" data-open-work="${o.id}">Открыть заказ</button><button class="secondary" data-assign-work="${o.id}">Назначить мастера</button><button class="secondary" data-return-work="${o.id}" ${stageIndex<=0?'disabled':''}>Вернуть назад</button><button class="primary" data-advance="${o.id}">${route[stageIndex+1]==='Выдано'?'Передать на выдачу':'Завершить этап'}</button></footer></article>`;
}
const baseWorkshopCard=workshopCard;
workshopCard=(order,index)=>baseWorkshopCard({...order,product:localizedSeed('orders.product',order.id,order.product)},index);
function openPayment(refund){
  entityDialog.dataset.mode=refund?'refund':'payment';editId=null;$('#entityEyebrow').textContent=refund?'Кассовая операция':'Оплата заказа';$('#entityTitle').textContent=refund?'Оформить возврат':'Принять оплату';
  $('#entityFields').innerHTML=`<label>Заказ<select name="orderId">${state.orders.map(o=>`<option value="${o.id}">№${o.id} · ${escapeHtml(o.client)}</option>`).join('')}</select></label><label>Сумма, сум<input name="amount" type="number" min="1" required></label><label>Способ<select name="method"><option>Банковская карта</option><option>Наличные</option><option>Смешанная оплата</option></select></label><label>Комментарий<input name="note" placeholder="${refund?'Основание возврата':'Необязательно'}"></label>`;
  entityDialog.showModal();
}
function analytics(report){
  const title=report?t('analytics.sales_report'):t('analytics.metrics_trend');
  return `<section class="card report-filterbar"><label>${t('analytics.period')}<select><option>${t('analytics.july_2026')}</option><option>${t('analytics.june_2026')}</option><option>${t('analytics.quarter')}</option></select></label><label>${t('analytics.salon')}<select><option>${t('analytics.all_salons')}</option><option>Abay, 12</option><option>Mega Center</option></select></label><label>${t('analytics.comparison')}<select><option>${t('analytics.previous_period')}</option><option>${t('analytics.plan_comparison')}</option></select></label><button class="secondary" data-export>⇩ ${report?'Excel':'PDF'}</button></section><div class="analytics-grid">${[[t('analytics.revenue'),formatMoney(2840000),'+12.4%'],[t('analytics.orders'),'326','+8.1%'],[t('analytics.average_check'),formatMoney(47800),'+4.8%'],[t('analytics.on_time'),'94%','+2.6 pp']].map(x=>`<div class="card chart-card"><small>${x[0]}</small><h2>${x[1]}</h2><span class="chart-delta">↗ ${x[2]} ${t('analytics.vs_previous')}</span></div>`).join('')}</div><div class="chart-layout"><section class="card line-chart"><h2>${title}</h2><div class="chart-legend"><span><i style="background:#3978e8"></i>${t('analytics.revenue_thousands')}</span><span><i style="background:#9ab8f3"></i>${t('analytics.plan')}</span></div><svg class="line-svg" viewBox="0 0 700 230" role="img" aria-label="${t('analytics.chart_label')}"><g stroke="#e8edf2" stroke-width="1"><path d="M55 20H680M55 65H680M55 110H680M55 155H680M55 200H680"/></g><g fill="#82909b" font-size="10"><text x="8" y="24">500k</text><text x="8" y="69">375k</text><text x="8" y="114">250k</text><text x="8" y="159">125k</text><text x="32" y="204">0</text><text x="60" y="220">01.07</text><text x="207" y="220">08.07</text><text x="350" y="220">15.07</text><text x="500" y="220">22.07</text><text x="632" y="220">31.07</text></g><path d="M60 168 L135 142 L210 151 L285 105 L360 119 L435 72 L510 88 L585 47 L670 61" fill="none" stroke="#9ab8f3" stroke-width="2" stroke-dasharray="6 5"/><path d="M60 178 L135 155 L210 132 L285 122 L360 89 L435 98 L510 56 L585 67 L670 31" fill="none" stroke="#3978e8" stroke-width="4"/><g fill="#3978e8">${[[60,178],[135,155],[210,132],[285,122],[360,89],[435,98],[510,56],[585,67],[670,31]].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="4"/>`).join('')}</g></svg></section><section class="card donut-card"><h2>${t('analytics.sales_structure')}</h2><div class="donut"><strong>${window.MedicaI18n.formatNumber(2.84)}M</strong></div><div class="donut-legend"><span>${t('analytics.frames')} 46%</span><span>${t('analytics.lenses')} 28%</span><span>${t('analytics.services')} 17%</span><span>${t('analytics.other')} 9%</span></div></section></div><section class="card rank-table"><div class="card-title"><div><h2>${t('analytics.top_categories')}</h2><p>${t('analytics.period_revenue_hint')}</p></div></div><div class="table-wrap"><table><thead><tr><th>${t('analytics.position')}</th><th>${t('analytics.category_brand')}</th><th>${t('analytics.sales')}</th><th>${t('analytics.revenue')}</th><th>${t('analytics.share')}</th><th>${t('analytics.trend')}</th></tr></thead><tbody><tr><td>1</td><td>${t('analytics.frames')} Ray-Ban</td><td>84</td><td>${formatMoney(896400)}</td><td>31.5%</td><td><span class="status success">↗ 14%</span></td></tr><tr><td>2</td><td>${t('analytics.lenses')} Essilor</td><td>112</td><td>${formatMoney(742800)}</td><td>26.1%</td><td><span class="status success">↗ 9%</span></td></tr><tr><td>3</td><td>${t('analytics.frames')} Polaroid</td><td>61</td><td>${formatMoney(488200)}</td><td>17.2%</td><td><span class="status info">→ 1%</span></td></tr></tbody></table></div></section>`;
}

const editorTemplates={
  catalog:[{name:'Серийное медицинское изделие',data:{tracking:'Серийный',warranty:12,minimumStock:1,stock:0}},{name:'Расходный материал',data:{tracking:'Количественный',warranty:0,minimumStock:10,stock:0}}],
  suppliers:[{name:'Поставщик с отсрочкой',data:{currency:'UZS',paymentTerms:'Отсрочка 30 дней',deliveryDays:7,status:'Проверка'}},{name:'Импортный поставщик',data:{currency:'USD',paymentTerms:'Предоплата',deliveryDays:14,status:'Проверка'}}],
  invoices:[{name:'Приходная накладная',data:{type:'Приход',status:'Черновик'}},{name:'Перемещение между филиалами',data:{type:'Перемещение',status:'Черновик'}}],
  employees:[{name:'Сотрудник медицинского направления',data:{access:'Рабочий',status:'Активен',schedule:'Пн–Пт 09:00–18:00'}},{name:'Сотрудник склада',data:{role:'Кладовщик',access:'Рабочий',status:'Активен'}}],
  service:[{name:'Гарантийная диагностика',data:{type:'Гарантийный ремонт',status:'Черновик'}},{name:'Плановое техническое обслуживание',data:{type:'Техническое обслуживание',status:'Черновик'}}]
};
function editorFill(form,data,source){const fields=Object.entries(data||{}).filter(([key,value])=>form.elements[key]&&value!==undefined&&value!==null&&value!==''),conflicts=fields.filter(([key,value])=>form.elements[key].value&&String(form.elements[key].value)!==String(value));if(!fields.length){notify('Нет связанных данных для заполнения');return}if(!confirm(`${source}\n\nБудут заполнены поля: ${fields.map(([key])=>form.elements[key].closest('label')?.childNodes[0]?.textContent?.trim()||key).join(', ')}${conflicts.length?`\n\nБудут изменены уже заполненные поля: ${conflicts.length}.`:''}`))return;fields.forEach(([key,value])=>{const field=form.elements[key];if(!field.value||conflicts.some(([name])=>name===key)){field.value=value;field.dispatchEvent(new Event('change',{bubbles:true}))}});notify('Данные подготовлены — проверьте форму')}
function linkedEditorData(type,form){if(type==='catalog'){const supplier=state.suppliers.find(x=>x.name===form.elements.supplier?.value);return supplier?{deliveryDays:supplier.deliveryDays||String(supplier.value||'').match(/\d+/)?.[0]||'',supplierCurrency:supplier.currency||'UZS',supplierTerms:supplier.paymentTerms||''}:{}}if(type==='service'){const order=state.orders.find(x=>x.id==form.elements.orderId?.value),client=state.clients.find(x=>x.id==(form.elements.clientId?.value||order?.clientId));return {clientId:client?.id||'',orderId:order?.id||'',product:order?.product||'',value:order?.responsible||'',receivedAt:new Date().toISOString().slice(0,10)}}return{}}
function bindEditorTools(type){const form=$('#entityForm'),templates=editorTemplates[type]||[],previous=state[type]?.find(x=>x.id!==editId),bar=document.createElement('div');bar.className='form-tools full';bar.innerHTML=`<button type="button" data-editor-template ${templates.length?'':'disabled'}>Выбрать шаблон</button><button type="button" data-editor-previous ${previous?'':'disabled'}>Повторить предыдущую запись</button><button type="button" data-editor-linked ${['catalog','service'].includes(type)?'':'disabled'}>Заполнить из связанной записи</button><button type="button" data-editor-clear>Очистить форму</button>`;$('#entityFields').prepend(bar);bar.querySelector('[data-editor-template]').onclick=()=>{const answer=prompt(`Выберите шаблон:\n${templates.map((x,i)=>`${i+1}. ${x.name}`).join('\n')}`,'1');if(answer!==null&&templates[Number(answer)-1])editorFill(form,templates[Number(answer)-1].data,templates[Number(answer)-1].name)};bar.querySelector('[data-editor-previous]').onclick=()=>{const data={...previous};delete data.id;if(type==='service')Object.assign(data,{name:'',status:'Черновик',receivedAt:new Date().toISOString().slice(0,10)});editorFill(form,data,'Предыдущая запись')};bar.querySelector('[data-editor-linked]').onclick=()=>editorFill(form,linkedEditorData(type,form),'Связанная запись');bar.querySelector('[data-editor-clear]').onclick=()=>{if(confirm(t('dialog.clear_form')))form.reset()}}
function openEditor(type,item=null){
  if(['clients','employees'].includes(type)&&item)window.MedicaNames.ensure(item);
  currentPage=type;editId=item?.id||null;entityDialog.dataset.mode='';const schema=schemas[type];
  $('#entityEyebrow').textContent=t(item?'form.editing':'form.new_record');$('#entityTitle').textContent=type==='service'?t(item?'service.edit_title':'service.create_title'):t(item?'form.edit_record':'form.create_record');
  $('#entityFields').innerHTML=schema.fields.map(([name,label,kind,opts])=>{
    const text=label.startsWith('i18n:')?t(label.slice(5)):label,value=item?.[name]??'';if(kind==='select')return `<label>${text}<select name="${name}">${opts.map(o=>`<option value="${escapeHtml(o)}" ${o==value?'selected':''}>${type==='encounters'?MedicaI18n.system('direction',o):o}</option>`).join('')}</select></label>`;
    if(kind==='checkbox')return `<label class="person-verified"><input name="${name}" type="checkbox" ${value?'checked':''}> ${text}</label>`;
    if(kind==='linked'){const source=opts==='clients'?state.clients:opts==='orders'?state.orders:state.employees,display=x=>opts==='clients'?`${personName(x)} · ${x.phone}`:opts==='orders'?`№${x.id} · ${x.client} · ${x.product||x.direction}`:`${personName(x)} · ${x.role}`;return `<label>${label}<select name="${name}" ${label.includes('*')?'required':''}><option value="">Не выбрано</option>${source.map(x=>`<option value="${opts==='employees'?escapeHtml(x.nameOriginal||x.name):x.id}" ${(opts==='employees'?(x.nameOriginal||x.name):x.id)==value?'selected':''}>${escapeHtml(display(x))}</option>`).join('')}</select></label>`}
    if(type==='catalog'&&name==='supplier')return `<label>${label}<select name="supplier"><option value="">Не выбрано</option>${state.suppliers.map(x=>`<option ${x.name===value?'selected':''}>${escapeHtml(x.name)}</option>`).join('')}</select></label>`;
    return `<label>${text}<input name="${name}" type="${kind}" value="${escapeHtml(value)}" ${text.includes('*')?'required':''}></label>`;
  }).join('');if(type==='catalog')$('#entityFields').insertAdjacentHTML('beforeend','<label>Валюта поставщика<input name="supplierCurrency" readonly></label><label>Условия поставщика<input name="supplierTerms" readonly></label>');if(['clients','employees'].includes(type))bindPersonNameEditor($('#entityForm'));$('#entityError').textContent='';bindEditorTools(type);entityDialog.showModal();
}
function bindPersonNameEditor(form){
  const original=form.elements.nameOriginal,language=form.elements.originalLanguage,latin=form.elements.nameLatin,cyrillic=form.elements.nameCyrillic;
  const addButton=(field,script)=>{const button=document.createElement('button');button.type='button';button.className='secondary person-generate';button.textContent=t('names.generate');field.closest('label').append(button);button.onclick=()=>{const verified=form.elements[`${script}Verified`].checked,source=form.elements[`${script}Source`].value;if(verified||source==='passport'){notify(t('names.verified_not_overwritten'));return}field.value=script==='latin'?MedicaNames.transliterate(original.value,language.value):MedicaNames.latinToCyrillic(original.value);form.elements[`${script}Source`].value='generated'}};
  addButton(latin,'latin');addButton(cyrillic,'cyrillic');
  original.addEventListener('input',()=>{if(!language.dataset.touched)language.value=/[ҒҚЎҲғқўҳ]/.test(original.value)?'uz':/[А-Яа-яЁё]/.test(original.value)?'ru':'other'});language.addEventListener('change',()=>language.dataset.touched='1');
}
function bindCards(){
  const key=currentPage==='stock'?'catalog':currentPage;
  $('[data-module-search]')?.addEventListener('input',e=>{$$('.item-card').forEach(c=>{const item=state[currentPage]?.find(x=>x.id==c.dataset.id),person=['clients','employees'].includes(currentPage)&&item;c.hidden=person?!MedicaNames.matches(item,e.target.value):!c.textContent.toLowerCase().includes(e.target.value.toLowerCase())})});
  $('[data-order-module-search]')?.addEventListener('input',e=>{$$('.operations-table tbody tr').forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(e.target.value.toLowerCase()))});
  $('[data-stock-search]')?.addEventListener('input',e=>{$$('.inventory-register tbody tr').forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(e.target.value.toLowerCase()))});
  $('[data-direction-filter]')?.addEventListener('change',e=>{$$('.operations-table tbody tr').forEach(r=>r.hidden=e.target.value!=='Все направления'&&r.dataset.direction!==e.target.value)});
  $('.operations-card #openFilters')?.addEventListener('click',()=>$('#filterDialog').showModal());
  $$('[data-view]').forEach(b=>b.onclick=()=>showDetail(b.closest('.item-card').dataset.id));
  $$('[data-history]').forEach(b=>b.onclick=()=>showPatientHistory(+b.closest('.item-card').dataset.id));
  $$('[data-edit]').forEach(b=>b.onclick=()=>{const x=findItem(b);if(currentPage==='stock')go('catalog');openEditor(key,x)});
  $$('[data-copy]').forEach(b=>b.onclick=()=>{const x={...findItem(b)};delete x.id;if(key==='service'){x.name='';x.status='Черновик';x.receivedAt=new Date().toISOString().slice(0,10)}else x.name=`${x.name} — копия`;openEditor(key,x);notify('Новый черновик подготовлен — проверьте и сохраните')});
  $$('[data-delete]').forEach(b=>b.onclick=()=>{const id=+b.closest('.item-card').dataset.id;if(confirm(t('dialog.delete_record'))){state[key]=state[key].filter(x=>x.id!==id);save(key,state[key]);renderModule();notify('Запись удалена')}});
  $$('[data-export]').forEach(b=>b.onclick=()=>downloadCsv());
  $$('[data-import]').forEach(b=>b.onclick=()=>{const input=document.createElement('input');input.type='file';input.accept='.csv,text/csv';input.onchange=()=>{const file=input.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>importCsv(String(reader.result||''),key,file.name);reader.onerror=()=>notify('Не удалось прочитать файл');reader.readAsText(file)};input.click()});
  $('[data-print]')?.addEventListener('click',()=>saveMedicaDocument($('#moduleTitle')?.textContent||'Документ',$('#moduleContent')?.innerHTML||''));
  $$('[data-setting]').forEach(control=>control.onchange=()=>{if(control.dataset.setting==='language')return;state.preferences[control.dataset.setting]=control.value;save('preferences',state.preferences);applyPreferences();notify('Настройка применена')});
  $$('[data-theme-choice]').forEach(button=>button.onclick=()=>{state.preferences.theme=button.dataset.themeChoice;save('preferences',state.preferences);applyPreferences();renderModule();notify('Тема применена')});
  $('[data-save-settings]')?.addEventListener('click',()=>{save('preferences',state.preferences);notify('Настройки сохранены')});
  $$('[data-advance]').forEach(b=>b.onclick=()=>advanceWorkshop(state.orders.find(x=>x.id===+b.dataset.advance)));
  $$('[data-return-work]').forEach(b=>b.onclick=()=>returnWorkshop(state.orders.find(x=>x.id===+b.dataset.returnWork)));
  $$('[data-assign-work]').forEach(b=>b.onclick=()=>assignWorkshop(state.orders.find(x=>x.id===+b.dataset.assignWork)));
  $$('[data-open-work]').forEach(b=>b.onclick=()=>showOrder(+b.dataset.openWork));
  $$('[data-procure]').forEach(b=>b.onclick=()=>createProcurement([+b.dataset.procure]));
  $('[data-procure-all]')?.addEventListener('click',()=>createProcurement(state.catalog.filter(x=>Number(x.stock)<=4).map(x=>x.id)));
  $('[data-inventory-count]')?.addEventListener('click',openInventoryCount);
  $$('[data-open-branch]').forEach(b=>b.onclick=()=>openBranchDetail(b.dataset.openBranch));
  $$('[data-demo-action]').forEach(b=>b.onclick=()=>handleLegacyAction(b));
  $('[data-work-search]')?.addEventListener('input',e=>{$$('[data-work-item]').forEach(card=>card.hidden=!card.textContent.toLowerCase().includes(e.target.value.toLowerCase()))});
  $('[data-work-filter]')?.addEventListener('change',e=>{$$('[data-work-item]').forEach(card=>card.hidden=e.target.value!=='Все направления'&&!card.textContent.includes(e.target.value))});
}
function importCsv(text,key,fileName){
  if(!schemas[key]){notify('Импорт для этого раздела недоступен');return}
  const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(Boolean),parse=line=>line.split(/[,;]/).map(x=>x.trim().replace(/^"|"$/g,''));
  if(lines.length<2){notify('CSV не содержит строк данных');return}
  const headers=parse(lines[0]),allowed=new Set(schemas[key].fields.map(x=>x[0])),rows=lines.slice(1).map(parse).map(values=>Object.fromEntries(headers.map((h,i)=>[h,values[i]??'']))).filter(row=>row.name||row.sku);
  if(!headers.some(h=>allowed.has(h))||!rows.length){notify('CSV должен содержать заголовки полей и строки данных');return}
  rows.forEach((row,i)=>{const item={id:Date.now()+i};Object.entries(row).forEach(([k,v])=>{if(allowed.has(k))item[k]=['price','purchasePrice','wholesalePrice','minimumPrice','stock','minimumStock','deliveryDays','warranty'].includes(k)?Number(v)||0:v});state[key].unshift(item)});
  save(key,state[key]);renderModule();notify(`Импортировано: ${rows.length} · ${fileName}`)
}
function handleLegacyAction(button){
  if(currentPage==='inventory'&&button.matches('[data-inventory-count]')){openInventoryCount();return}
  if(currentPage==='production'&&button.closest('.workshop-toolbar')){$$('[data-work-item]').forEach(card=>card.hidden=!card.classList.contains('needs-attention'));return}
  const branch=button.closest('.branch-card');if(branch){$('#detailTitle').textContent=branch.querySelector('h3')?.textContent||'Подразделение';$('#detailContent').innerHTML=`<div class="detail-list">${[...branch.querySelectorAll('p, div span')].map(x=>`<div><strong>${escapeHtml(x.textContent.trim())}</strong></div>`).join('')}</div>`;detailDialog.showModal();return}
  const row=button.closest('tr');if(currentPage==='installments'&&row){$('#detailTitle').textContent=`График · ${row.cells[0].textContent.trim()}`;$('#detailContent').innerHTML=`<div class="patient-timeline"><article><b>Текущий договор</b><p>${escapeHtml(row.textContent.replace(/\s+/g,' ').trim())}</p></article><article><b>Следующий платёж</b><p>${escapeHtml(row.cells[5].textContent.trim())}</p><small>${escapeHtml(row.cells[6].textContent.trim())}</small></article></div>`;detailDialog.showModal();return}
  button.disabled=true;button.title='Действие недоступно в текущем статическом контуре';notify('Действие отключено: для него ещё нет сохранения данных')
}
function openInventoryCount(){
  const session=state.inventorySession||{counts:{}};state.inventorySession=session;
  entityDialog.dataset.mode='inventory-count';$('#entityEyebrow').textContent=t('branches.warehouse.name');$('#entityTitle').textContent=t('inventory.count_form_title');
  $('#entityFields').innerHTML=`<section class="inventory-count-workspace full"><div class="inventory-count-summary"><div><small>${t('inventory.items')}</small><b>${state.catalog.length}</b></div><div><small>${t('inventory.already_checked')}</small><b>${Object.keys(session.counts).length}</b></div><label class="search">⌕ <input type="search" data-count-search placeholder="${t('inventory.search_product')}"></label></div><div class="inventory-count-head"><span>${t('stock.column.product')}</span><span>${t('inventory.book_quantity')}</span><span>${t('cash.actual')}</span><span>${t('inventory.discrepancies')}</span></div><div class="inventory-count-list">${state.catalog.map(x=>{const book=Number(x.stock)||0,actual=session.counts[x.id]??book,product=localizedSeed('catalog.product',x.id,x.name);return `<label data-count-row data-book="${book}"><span><b>${escapeHtml(product)}</b><small>${escapeHtml(x.sku)} · ${escapeHtml(MedicaI18n.system('category',x.category||'Без категории'))}</small></span><output>${book}</output><input type="number" min="0" step="1" name="count_${x.id}" value="${actual}" aria-label="${escapeHtml(t('inventory.actual_quantity',{product}))}"><em data-count-diff>${Number(actual)-book}</em></label>`}).join('')}</div></section>`;
  const refreshDiff=input=>{const row=input.closest('[data-count-row]'),diff=Number(input.value||0)-Number(row.dataset.book||0),output=row.querySelector('[data-count-diff]');output.textContent=diff>0?`+${diff}`:String(diff);output.className=diff?'has-difference':''};$$('[data-count-row] input').forEach(input=>{refreshDiff(input);input.addEventListener('input',()=>refreshDiff(input))});$('[data-count-search]')?.addEventListener('input',e=>$$('[data-count-row]').forEach(row=>row.hidden=!row.textContent.toLowerCase().includes(e.target.value.toLowerCase())));
  const submit=entityDialog.querySelector('button[type="submit"]');if(submit)submit.textContent=t('inventory.save_count');
  $('#entityForm').onsubmit=event=>{event.preventDefault();const data=new FormData(event.currentTarget);state.catalog.forEach(x=>{const value=data.get(`count_${x.id}`);if(value!=='')session.counts[x.id]=Math.max(0,Number(value)||0)});session.updatedAt=new Date().toISOString();save('inventorySession',session);const checked=Object.keys(session.counts).length,progress=Math.round(checked/Math.max(1,state.catalog.length)*100),card=$('.audit-card');if(card){card.querySelector('.status').textContent=`${progress}% пересчитано`;card.querySelector('.big-progress i').style.width=`${progress}%`;card.querySelector('.audit-stats b').textContent=window.MedicaI18n.formatNumber(checked)}entityDialog.close();notify(`Пересчёт сохранён: ${checked} позиций`)};
  entityDialog.showModal();
}
function historyTimestamp(value){
  if(!value)return 0;
  if(typeof value==='number')return value;
  const direct=Date.parse(value);if(Number.isFinite(direct))return direct;
  const match=String(value).match(/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\D+(\d{1,2}):(\d{2}))?/);
  return match?new Date(+match[3],+match[2]-1,+match[1],+(match[4]||0),+(match[5]||0)).getTime():0;
}
function clientHistoryEvents(client){
  const belongs=row=>Number(row.clientId)===Number(client.id)||(!row.clientId&&row.client===client.name),events=[],add=(at,type,title,details,meta,branch)=>events.push({at,type,title,details,meta,branch,stamp:historyTimestamp(at)});
  (state.appointments||[]).filter(belongs).forEach(x=>add(`${x.date||''}T${x.time||'00:00'}`,'Приём',`Приём · ${x.status||'Запланирован'}`,x.complaints||x.results||x.diagnosis||'Запись на приём',`${x.doctor||'Специалист не указан'}${x.room?' · каб. '+x.room:''}`,x.branch));
  (state.prescriptions||[]).filter(belongs).forEach(x=>add(x.confirmedAt||x.date,'Рецепт',`${x.number||'Рецепт'} · ${x.status||'Черновик'}`,`OD ${x.odSph||'—'} / OS ${x.osSph||'—'}${x.add?' · ADD '+x.add:''}`,x.doctor||'Врач не указан'));
  (state.orders||[]).filter(belongs).forEach(x=>{add(x.createdAt||x.date||x.stageStartedAt,'Заказ',`Заказ №${x.id} · ${x.status}`,x.product||(x.items||[]).map(i=>i.name).join(', ')||'Состав не указан',`${formatMoney(x.sum||0)} · ${x.responsible||'Ответственный не назначен'}`,x.branch);(x.stageHistory||[]).forEach(h=>add(h.at,'Мастерская',`Заказ №${x.id}: ${h.from} → ${h.to}`,h.comment||h.type||'Переход этапа',h.employee||'',x.branch))});
  (state.payments||[]).filter(belongs).forEach(x=>add(x.createdAt||x.date,x.type==='Возврат'?'Возврат':'Оплата',`${x.type||'Платёж'} · ${x.method||'—'}`,formatMoney(x.amount||0),x.orderId?`Заказ №${x.orderId}`:''));
  (state.service||[]).filter(belongs).forEach(x=>add(x.receivedAt||x.createdAt,'Сервис',`${x.name||'Сервисное обращение'} · ${x.status||'Черновик'}`,x.issue||x.product||x.type||'',x.value||x.responsible||''));
  (state.lenses||[]).filter(belongs).forEach(x=>{add(x.fitted,'Контактные линзы',`Подбор · ${x.brand||'Линзы'}`,`OD ${x.od||'—'} / OS ${x.os||'—'} · замена ${x.replace||'—'}`,x.wear||'');if(x.reminderSentAt)add(x.reminderSentAt,'Напоминание','Напоминание о замене линз отправлено',x.replace?`Дата замены: ${x.replace}`:'',x.brand||'');if(x.clientConfirmedAt)add(x.clientConfirmedAt,'Подтверждение','Клиент подтвердил замену линз',x.brand||'','')});
  (state.communications||[]).filter(belongs).forEach(x=>add(x.at,'Сообщение',`${x.channel||'Сообщение'} · ${x.status||'Отправлено'}`,x.text||'',x.orderId?`Заказ №${x.orderId}`:''));
  return events.sort((a,b)=>b.stamp-a.stamp);
}
function showPatientHistory(id){const x=state.clients.find(c=>c.id===id);if(!x)return;const events=clientHistoryEvents(x),branches=[...new Set(events.map(e=>e.branch).filter(Boolean))];$('#detailTitle').textContent=`История · ${x.name}`;$('#detailContent').innerHTML=`<div class="history-summary detail-list"><div><small>Реальных событий</small><strong>${events.length}</strong></div><div><small>Посещённые филиалы</small><strong>${escapeHtml(branches.join(', ')||'Нет данных')}</strong></div></div>${events.length?`<div class="patient-timeline">${events.map(e=>`<article><b>${escapeHtml(e.title)}</b><p>${escapeHtml(e.details||'')}</p><small>${escapeHtml(e.type)}${e.meta?' · '+escapeHtml(e.meta):''}${e.branch?' · '+escapeHtml(e.branch):''}${e.stamp?' · '+escapeHtml(window.MedicaI18n.formatDateTime(e.stamp,{dateStyle:'medium',timeStyle:'short'})):''}</small></article>`).join('')}</div>`:'<div class="empty-state">Связанных событий пока нет</div>'}`;detailDialog.showModal()}
function createProcurement(ids){const goods=state.catalog.filter(x=>ids.includes(x.id));const number=`REQ-${String(Date.now()).slice(-5)}`;state.invoices.unshift({id:Date.now(),name:number,type:'Заявка поставщику',from:goods.map(x=>x.brand||x.name).join(', '),amount:`${goods.length} позиций`,status:'Черновик'});save('invoices',state.invoices);notify(`Черновик ${number} создан: ${goods.length} позиций`)}
function findItem(button){return state[currentPage==='stock'?'catalog':currentPage].find(x=>x.id===+button.closest('.item-card').dataset.id)}
function showDetail(id){
  const x=state[currentPage==='stock'?'catalog':currentPage].find(i=>i.id===+id),isPerson=['clients','employees'].includes(currentPage);$('#detailTitle').textContent=isPerson?personName(x):x.name;
  const identity=isPerson?`<section class="person-identities" data-user-content><strong>${escapeHtml(x.nameLatin||x.nameOriginal)}</strong><span>${escapeHtml(x.nameCyrillic||x.nameOriginal)}</span></section>`:'';
  $('#detailContent').innerHTML=`${identity}<div class="detail-list">${Object.entries(x).filter(([k])=>!['id','name','nameOriginal','nameLatin','nameCyrillic'].includes(k)).map(([k,v])=>`<div><small>${k}</small><strong>${escapeHtml(v)}</strong></div>`).join('')}</div>`;
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
$('#collapseSidebar').onclick=()=>{if(isMobile())setMobileMenu(false);else{sidebar.classList.toggle('collapsed');document.querySelector('.app').classList.toggle('sidebar-is-collapsed',sidebar.classList.contains('collapsed'));save('sidebarCollapsed',sidebar.classList.contains('collapsed'))}};
mobileMenu.onclick=()=>setMobileMenu(!sidebar.classList.contains('open'));sidebarOverlay.onclick=()=>setMobileMenu(false);
if(!isMobile()&&load('sidebarCollapsed',false)){sidebar.classList.add('collapsed');document.querySelector('.app').classList.add('sidebar-is-collapsed')}
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
let orderStep=1,orderDraft={direction:'Оптика',product:'Индивидуальный заказ'};
function resetOrder(){
  orderStep=1;orderDraft={direction:'Оптика',product:'Индивидуальный заказ'};$$('.steps li').forEach((x,i)=>x.classList.toggle('active',i===0));$('#nextStep').textContent='Продолжить →';
  $('#orderDialog .form-section').innerHTML='<h3>Выберите клиента</h3><label class="search large">⌕ <input type="search" placeholder="Фамилия, телефон или номер карты"></label><div class="client-row"><span class="avatar">ЕС</span><div><strong>Екатерина Смирнова</strong><small>+7 707 555-34-21 · 3 заказа</small></div><button class="secondary" type="button" data-select-client>Выбрать</button></div><button class="link-button" type="button" data-order-client>＋ Создать нового клиента</button>';
  $('[data-select-client]').onclick=()=>notify('Клиент выбран');
  $('[data-order-client]').onclick=()=>{$('#orderDialog').close();go('clients');openEditor('clients')};
}
$$('[data-open-order]').forEach(b=>b.onclick=()=>{resetOrder();$('#orderDialog').showModal()});
$('#nextStep').onclick=()=>{
  if(orderStep===2){orderDraft.direction=$('[name="orderDirection"]')?.value||'Оптика';orderDraft.product=$('[name="orderProduct"]')?.value||'Индивидуальный заказ'}
  orderStep++;const steps=$$('.steps li');steps.forEach((x,i)=>x.classList.toggle('active',i===Math.min(orderStep-1,3)));
  const section=$('#orderDialog .form-section');
  if(orderStep===2)section.innerHTML='<h3>Направление, назначение и изделие</h3><div class="form-grid"><label>Направление<select name="orderDirection"><option>Оптика</option><option>Слух</option><option>Протезирование</option><option>Ортопедия</option><option>Медтехника</option></select></label><label>Тип обращения<select><option>Продажа готового изделия</option><option>Индивидуальное изготовление</option><option>Подбор и настройка</option><option>Сервис / гарантия</option></select></label><label class="full">Назначение / рецепт<textarea rows="3" placeholder="Рецепт, результаты измерений, параметры подбора"></textarea></label><label class="full">Изделие<select name="orderProduct">'+state.catalog.map(x=>`<option>${x.name}</option>`).join('')+'</select></label><label>Ответственный<select><option>Анна Ким</option><option>Тимур Алимов</option><option>Данияр Ким</option><option>Сергей Ли</option></select></label><label>Приоритет<select><option>Обычный</option><option>Срочный</option><option>Медицинский приоритет</option></select></label></div>';
  else if(orderStep===3)section.innerHTML='<h3>Стоимость и оплата</h3><div class="detail-list"><div><small>Товары и услуги</small><strong>82 500 сум</strong></div><div><small>Минимальный аванс</small><strong>24 750 сум</strong></div></div><div class="form-grid" style="margin-top:15px"><label>Скидка, %<input type="number" value="0"></label><label>Аванс, сум<input type="number" value="25000"></label></div>';
  else if(orderStep===4){section.innerHTML='<h3>Подтверждение</h3><p>Заказ проверен. После сохранения ему будет присвоен номер и сформирована квитанция.</p>';$('#nextStep').textContent='Создать заказ'}
  else{
    const numericIds=state.orders.map(x=>Number(x.id)).filter(Number.isFinite);
    const id=(numericIds.length?Math.max(...numericIds):2481)+1;
    const order={id,client:'Екатерина Смирнова',phone:'+7 707 555-34-21',status:'В работе',deadline:'Через 5 дней',sum:82500,payment:'Аванс 25 000 сум',direction:orderDraft.direction,product:orderDraft.product,responsible:'Анна Ким',stage:'Первичная обработка',progress:15};
    state.orders.unshift(order);
    if(!save('orders',state.orders)){state.orders.shift();return}
    syncDashboard();$('#orderDialog').close();resetOrder();go('orders');notify(`Заказ №${id} создан и сохранен в журнале`)
  }
};
$('#moduleCreate').onclick=()=>{
  if(schemas[currentPage])openEditor(currentPage);
  else if(currentPage==='orders'){resetOrder();$('#orderDialog').showModal()}
  else if(currentPage==='cash'){state.shift=!state.shift;save('shift',state.shift);renderModule();notify(state.shift?'Кассовая смена открыта':'Кассовая смена закрыта')}
  else if(currentPage==='labels')$('[data-print]')?.click();
  else if(['registry','prescriptions','wholesale'].includes(currentPage))notify(currentPage==='registry'?'Форма записи пациента открыта':currentPage==='prescriptions'?'Форма рецепта открыта':'Форма оптового контрагента открыта');
};
$('#entityForm').onsubmit=e=>{
  e.preventDefault();if(entityDialog.dataset.mode){const data=Object.fromEntries(new FormData(e.target));entityDialog.close();notify(`${entityDialog.dataset.mode==='refund'?'Возврат':'Оплата'} на ${formatMoney(data.amount)} проведена`);entityDialog.dataset.mode='';return}
  const schema=schemas[currentPage],data=Object.fromEntries(new FormData(e.target));if(!e.target.checkValidity()){e.target.reportValidity();return}
  if(['clients','employees'].includes(currentPage)){data.latinVerified=e.target.elements.latinVerified.checked;data.cyrillicVerified=e.target.elements.cyrillicVerified.checked;data.nameOriginal=data.nameOriginal.trim();if(!data.nameOriginal){notify(t('names.original_required'));return}data.name=data.nameOriginal;window.MedicaNames.ensure(data)}
  if(currentPage==='service'){const client=state.clients.find(x=>x.id==data.clientId),order=data.orderId&&state.orders.find(x=>x.id==data.orderId);if(order&&order.clientId&&order.clientId!==+data.clientId){notify('Выбранный заказ относится к другому клиенту');return}data.clientId=+data.clientId;data.orderId=data.orderId?+data.orderId:'';data.client=client?.name||'';data.name=data.name||`SRV-${String(Date.now()).slice(-6)}`}
  schema.fields.filter(x=>x[2]==='number').forEach(x=>data[x[0]]=Number(data[x[0]]||0));data.id=editId||Date.now();if(currentPage==='clients'&&!editId)data.orders=0;
  const i=state[currentPage].findIndex(x=>x.id===editId);if(i>=0)state[currentPage][i]={...state[currentPage][i],...data};else state[currentPage].unshift(data);
  if(!save(currentPage,state[currentPage]))return;
  entityDialog.close();renderModule();syncDashboard();notify(editId?'Изменения сохранены':'Запись создана и сохранена');
};
$$('[data-close]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.close).close());
$('#smsTemplate').onchange=updateSms;$('#smsText').oninput=e=>$('#smsCount').textContent=e.target.value.length;
$('#smsForm').onsubmit=e=>{e.preventDefault();const o=state.orders.find(x=>x.id===+e.target.dataset.order),client=state.clients.find(x=>x.id===o.clientId)||state.clients.find(x=>x.name===o.client);state.communications.unshift({id:Date.now(),at:new Date().toISOString(),clientId:client?.id,client:o.client,orderId:o.id,channel:'SMS',status:'Отправлено',text:$('#smsText').value});save('communications',state.communications);$('#smsDialog').close();notify(`SMS для ${o.client} отправлено на ${o.phone}`)};
$('#profileButton').onclick=()=>{const p=MedicaNames.ensure(state.profile);Object.entries(p).forEach(([k,v])=>{const el=$(`[name="${k}"]`,$('#profileForm'));if(el)el.type==='checkbox'?el.checked=Boolean(v):el.value=v});avatarDraft=p.avatar;applyProfile();profileDialog.showModal()};
$$('[data-profile-generate]').forEach(button=>button.onclick=()=>{const form=$('#profileForm'),script=button.dataset.profileGenerate,verified=form.elements[`${script}Verified`].checked,source=form.elements[`${script}Source`].value;if(verified||source==='passport'){notify(t('names.verified_not_overwritten'));return}form.elements[script==='latin'?'nameLatin':'nameCyrillic'].value=script==='latin'?MedicaNames.transliterate(form.elements.nameOriginal.value,form.elements.originalLanguage.value):MedicaNames.latinToCyrillic(form.elements.nameOriginal.value);form.elements[`${script}Source`].value='generated'});
$('#chooseAvatar').onclick=()=>$('#avatarInput').click();
$('#avatarInput').onchange=e=>{const f=e.target.files[0];if(!f)return;if(f.size>2*1024*1024){notify('Файл больше 2 МБ');return}const r=new FileReader();r.onload=()=>{avatarDraft=r.result;$('#profileAvatar').classList.add('has-image');$('#profileAvatar').style.backgroundImage=`url(${avatarDraft})`};r.readAsDataURL(f)};
$('#profileForm').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));data.nameOriginal=data.nameOriginal.trim();if(!data.nameOriginal){notify(t('names.original_required'));return}data.latinVerified=e.target.elements.latinVerified.checked;data.cyrillicVerified=e.target.elements.cyrillicVerified.checked;data.name=data.nameOriginal;state.profile=MedicaNames.ensure({...state.profile,...data,avatar:avatarDraft});save('profile',state.profile);applyProfile();profileDialog.close();notify('Профиль обновлен')};
$$('[data-quick]').forEach(b=>b.onclick=()=>{const a=b.dataset.quick;if(a==='client'){go('clients');openEditor('clients')}else if(a==='invoice'){go('invoices');openEditor('invoices')}else if(a==='labels')go('labels');else{go('cash');$('#moduleCreate').click()}});
$$('.secondary').filter(b=>b.textContent.includes('Фильтры')).forEach(b=>b.onclick=()=>notify('Фильтры: выберите вкладку статуса или используйте поиск'));
$$('.link-button').filter(b=>b.textContent.trim()==='Все').forEach(b=>b.onclick=()=>{$('.notification-button b').textContent='0';$$('.notice').forEach(n=>n.style.opacity='.55');notify('Все уведомления отмечены как прочитанные')});
$('.notification-button').onclick=()=>{go('dashboard');document.querySelector('.right-column').scrollIntoView({behavior:'smooth'});notify(`${$('.notification-button b').textContent} новых уведомления`)};
$('#salonSelect').value=load('salon','Оптика на Абая, 12');$('#periodSelect').value=load('period','Сегодня, 31 июля');
$('#salonSelect').onchange=e=>{save('salon',e.target.value);notify(`Салон переключен: ${e.target.value}`)};
$('#periodSelect').onchange=e=>{save('period',e.target.value);notify(`Период: ${e.target.value}`)};
$$('.orders-card .link-button').forEach(b=>b.onclick=()=>go('orders'));
resetOrder();

applyPreferences();
applyProfile();
syncDashboard();
const initial=location.hash.slice(1);if(modules[initial])go(initial);
