/* Ashraellen — global contact button on language entry pages */
(function () {
  'use strict';
  var labels = {en:'Contact',ru:'Контакт',be:'Кантакт',pl:'Kontakt',de:'Kontakt',fr:'Contact',es:'Contacto',pt:'Contacto',uk:'Контакт',fi:'Yhteys'};
  var parts = window.location.pathname.split('/').filter(Boolean);
  var langIndex = window.location.hostname.endsWith('github.io') ? 1 : 0;
  var lang = parts[langIndex] || '';
  var rest = parts.slice(langIndex + 1);
  if (!labels[lang] || rest.length) return;
  if (!document.querySelector('.entry')) return;
  var base = window.__BASE__ || (window.location.hostname.endsWith('github.io') && parts[0] ? '/' + parts[0] + '/' : '/');
  if (!document.getElementById('contact-corner-style')) {
    var style = document.createElement('style');style.id='contact-corner-style';style.textContent='.contact-corner{position:fixed;right:22px;top:18px;z-index:6;margin:0}.contact-corner a{display:inline-flex;align-items:center;justify-content:center;padding:7px 11px;border:1px solid rgba(242,242,244,.16);border-radius:999px;background:rgba(0,0,0,.22);backdrop-filter:blur(4px);color:rgba(242,242,244,.62);font-size:12px;font-weight:650;line-height:1;text-decoration:none;letter-spacing:.015em;box-shadow:0 8px 24px rgba(0,0,0,.22);transition:color 140ms ease,border-color 140ms ease,background 140ms ease,transform 140ms ease}.contact-corner a:hover{color:rgba(242,242,244,.86);border-color:rgba(242,242,244,.30);background:rgba(0,0,0,.34);transform:translateY(-1px)}@media(max-width:700px){.contact-corner{right:14px;top:12px}.contact-corner a{font-size:11px;padding:7px 9px}}';document.head.appendChild(style);
  }
  var existing=document.getElementById('goContact')||document.querySelector('.contact-corner a');if(existing){existing.href=base+lang+'/contact.html';existing.textContent=labels[lang];return;}
  var p=document.createElement('p');p.className='contact-corner';var a=document.createElement('a');a.id='goContact';a.href=base+lang+'/contact.html';a.textContent=labels[lang];p.appendChild(a);document.body.appendChild(p);
})();