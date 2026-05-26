/* Ashraellen — audience value and Telegram roles for RU dossier */
(function(){
  'use strict';
  if(!location.pathname.includes('/ru/professional/')) return;

  function run(){
    var outcomes=document.getElementById('outcomes');
    var impact=document.getElementById('impact');
    var contact=document.getElementById('contact');
    if(outcomes && impact && !document.getElementById('public-value')){
      var publicValue=document.createElement('section');
      publicValue.id='public-value';
      publicValue.className='dossier-section';
      publicValue.innerHTML='<h2>Что получит аудитория</h2><p>После получения поддержки проект сможет предоставить людям более доступный, структурированный и многоязычный доступ к материалам Ashraellen. Аудитория получит не набор готовых инструкций, а формы наблюдения, которые помогают распознавать механизмы самообмана, тревоги, зависимости от интерпретаций и утраты ясности.</p><p>Сложные философские и психологические наблюдения будут представлены в разных формах: короткие формулы, мини-эссе, фрагменты, книги, видео, аудио и визуальные материалы. Это позволит человеку входить в размышление с разной глубины — от короткого узнавания до длительного литературного проживания.</p><ul class="dossier-list"><li>короткие формулы для быстрого узнавания внутренних механизмов;</li><li>мини-эссе для спокойного размышления без академической перегрузки;</li><li>фрагменты и источники для более глубокого погружения;</li><li>книги как художественные модели опыта;</li><li>видео и аудио для тех, кому мысль легче воспринимать через голос, ритм и образ;</li><li>многоязычные версии для аудитории за пределами русскоязычного пространства.</li></ul><p>Главная польза проекта — создание пространства, где человек может встретить собственный опыт без давления идеологии, мотивационной риторики и готовых духовных рецептов.</p>';
      impact.parentNode.insertBefore(publicValue, impact);
    }

    if(contact){
      var box=contact.querySelector('.contact-box');
      if(box){
        box.innerHTML='<p><strong>Для грантов, издателей, исследовательского сотрудничества и медиа-запросов:</strong></p><p>Email: <a href="mailto:ashraellen.live@gmail.com">ashraellen.live@gmail.com</a></p><p>Telegram contact: <a href="https://t.me/AshraellenLive" target="_blank" rel="noopener noreferrer">@AshraellenLive</a></p><p>Локация: Польша / Европейский союз</p><p><strong>Публичные каналы:</strong> <a href="https://www.youtube.com/@ashraellen" target="_blank" rel="noopener noreferrer">YouTube</a> · <a href="https://www.instagram.com/kostyshev/" target="_blank" rel="noopener noreferrer">Instagram</a> · <a href="https://t.me/ashraellenchannel" target="_blank" rel="noopener noreferrer">Telegram channel</a></p><p><strong>Telegram channel:</strong> <a href="https://t.me/ashraellenchannel" target="_blank" rel="noopener noreferrer">@ashraellenchannel</a> — канал, где размещаются тексты, заметки, обновления и контент проекта.</p><p>Служебные страницы: <a href="/ru/contact.html">Контакт</a> · <a href="/ru/privacy.html">Политика конфиденциальности</a></p><p>Подробный бюджет может быть подготовлен под требования конкретной грантовой программы.</p>';
      }
    }

    var nav=document.querySelector('.dossier-nav');
    if(nav && !nav.querySelector('a[href="#public-value"]')){
      var link=document.createElement('a');
      link.href='#public-value';
      link.textContent='Для аудитории';
      var impactLink=nav.querySelector('a[href="#impact"]');
      if(impactLink) nav.insertBefore(link, impactLink);
      else nav.appendChild(link);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
