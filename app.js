const sidebar = document.querySelector('#sidebar');
const dashboard = document.querySelector('#dashboard');
const modulePage = document.querySelector('#modulePage');
const orderDialog = document.querySelector('#orderDialog');
const toast = document.querySelector('#toast');

const modules = {
  orders:['Заказы','Полный журнал заказов и этапов изготовления',['Вкладки статусов','Расширенные фильтры','Сроки и обеспечение','Аудит изменений']],
  clients:['Клиенты','Карточки, рецепты и история обращений',['Контакты и согласия','Сохраненные рецепты','История заказов','Повтор заказа']],
  cash:['Касса и оплаты','Авансы, окончательные платежи и возвраты',['Открытие смены','Смешанная оплата','Онлайн-касса','История операций']],
  catalog:['Номенклатура','Товары, категории и формирование наименований',['Оправы','Линзы','Услуги','Копирование карточек']],
  stock:['Складские остатки','Наличие по салонам и центральному складу',['Свободный остаток','Резерв','В пути','Доступно к продаже']],
  invoices:['Накладные и перемещения','Приход, расход, возвраты и логистика',['Импорт Excel','Сопоставление полей','Перемещения','Приемка']],
  labels:['Штрихкоды и ценники','Печать этикеток и работа со сканером',['Внутренние коды','Шаблоны ценников','Выбор принтера','Печатный лист']],
  reports:['Отчеты','Операционные и финансовые отчеты',['Продажи','Возвраты','Движение товара','Excel / PDF']],
  analytics:['Аналитика','Динамика и показатели сети',['Продажи по салонам','Сроки изготовления','Оборачиваемость','Эффективность']],
  directories:['Справочники','Управление системными значениями',['Бренды и коллекции','Покрытия','Способы оплаты','Архив значений']],
  settings:['Настройки','Пользователи, роли, интеграции и безопасность',['Ролевая модель','Оборудование','Уведомления','Журнал аудита']]
};

document.querySelector('#collapseSidebar').addEventListener('click',()=>sidebar.classList.toggle('collapsed'));
document.querySelectorAll('.nav-item').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();
  document.querySelectorAll('.nav-item').forEach(item=>item.classList.remove('active'));
  link.classList.add('active');
  const page=link.dataset.page;
  if(page==='dashboard'){modulePage.classList.remove('active');dashboard.classList.add('active');}
  else{
    dashboard.classList.remove('active');modulePage.classList.add('active');
    const data=modules[page];
    document.querySelector('#moduleTitle').textContent=data[0];
    document.querySelector('#moduleDescription').textContent=data[1];
    document.querySelector('#moduleFeatures').innerHTML=data[2].map(x=>`<span>${x}</span>`).join('');
  }
  history.replaceState(null,'',`#${page}`);
}));

function filterOrders(status){
  document.querySelectorAll('#ordersBody tr').forEach(row=>{
    row.hidden=status!=='Все' && row.dataset.status!==status;
  });
  document.querySelectorAll('.tab').forEach(tab=>tab.classList.toggle('active',tab.dataset.filter===status));
}
document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>filterOrders(tab.dataset.filter)));
document.querySelectorAll('.metric[data-filter]').forEach(metric=>metric.addEventListener('click',()=>{
  filterOrders(metric.dataset.filter);
  document.querySelector('.orders-card').scrollIntoView({behavior:'smooth'});
}));
document.querySelector('#orderSearch').addEventListener('input',event=>{
  const value=event.target.value.toLowerCase();
  document.querySelectorAll('#ordersBody tr').forEach(row=>row.hidden=!row.textContent.toLowerCase().includes(value));
});
document.querySelectorAll('[data-open-order]').forEach(button=>button.addEventListener('click',()=>orderDialog.showModal()));
document.querySelector('#nextStep').addEventListener('click',()=>{
  toast.textContent='Следующий этап будет подключен в интерактивном прототипе';
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),2600);
});
