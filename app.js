// ======================================================================
// ССЫЛКА НА GOOGLE-ТАБЛИЦУ. При новом развертывании меняется только она.
// ======================================================================
const API_URL = 'https://script.google.com/macros/s/AKfycbwR8HwfODu8OeSIWZe_hpwslnes9Hte6T75N4ahuEt1r83f7eaTUswyO4475aRja23y/exec';

const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, m =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const uid = () => 'MK-' + Date.now().toString(36).toUpperCase() + '-' +
                  Math.random().toString(36).slice(2,6).toUpperCase();
const nowStr = () => new Date().toLocaleString('ru-RU');

const ICONS = {
  plus:'<path d="M12 5v14M5 12h14"/>',
  copy:'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  eye:'<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  trash:'<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  refresh:'<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  x:'<path d="M18 6L6 18M6 6l12 12"/>',
  cpu:'<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>'
};
const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]||''}</svg>`;

const WIRE_COLORS = [
  ['коричневый','#8B4513'],['синий','#1650B2'],['жёлто-зелёный','#6FA828'],['чёрный','#222'],
  ['серый','#8a8f98'],['белый','#cfd4da'],['красный','#C62828'],['оранжевый','#EF6C00'],
  ['жёлтый','#E6C000'],['зелёный','#2E7D32'],['голубой','#4FC3F7'],['фиолетовый','#7B1FA2'],
  ['розовый','#E91E63'],['бирюзовый','#00897B']
];
const wireColor = name => { if(!name) return '#555'; const n = name.toLowerCase();
  const w = WIRE_COLORS.find(([v]) => n.includes(v)); return w ? w[1] : '#555'; };

const UNITS = ['','Па','кПа','МПа','бар','мм вод. ст.','%','°C','мм','см','м','м²','м³',
  'л/с','м³/ч','В','мВ','А','мА','Вт','кВт','Гц','об/мин','кг','с','ч'];
const unitOptions = sel => UNITS.map(u =>
  `<option value="${esc(u)}"${u===(sel||'')?' selected':''}>${u?esc(u):'—'}</option>`).join('');
const charUnit = p => ((p.char||'') + (p.unit ? ' ' + p.unit : '')).trim();
const partTip  = p => [p.desc||'', charUnit(p)].filter(Boolean).join(' · ') || 'без описания';

// ================= Состояние =================
const LS_CARDS='mk_cards_v1', LS_CFG='mk_cfg_v1';
let cfg = Object.assign({apiUrl:API_URL}, JSON.parse(localStorage.getItem(LS_CFG)||'{}'));
if (!cfg.apiUrl) cfg.apiUrl = API_URL;
let cards=[], partsMap=new Map();
let editId=null, editBaseOn='', draftScheme=null, draftSchemeText='';
let sDraft=null, currentViewId=null;

const SCHEME_NAMES = ['','только клеммы','клеммы + кабель','кабель + коробка'];

// ================= Миграция старых схем =================
function migrateScheme(s){
  if (!s || typeof s!=='object') return null;
  if (s.cables || s.terminals) return s;
  const rows=(s.rows||[]).map(r=>({term:r.tm||'', wire:r.wire||'', boxTerm:r.b||''}));
  const type=s.type || (rows.some(r=>r.boxTerm)?3 : rows.some(r=>r.wire)?2 : 1);
  if (type===1) return { type:1, terminals: rows.map(r=>({term:r.term})) };
  return { type, box:{ mark:(s.box&&s.box.mark)||'', desc:(s.box&&s.box.desc)||'' },
    cables:[{ mark:(s.cable&&s.cable.mark)||'', len:(s.cable&&s.cable.len)||'', rows }] };
}
function schemeConnCount(s){
  if (!s) return 0;
  if (s.type===1) return (s.terminals||[]).length;
  return (s.cables||[]).reduce((a,c)=>a+(c.rows||[]).length,0);
}

// ================= Загрузка =================
function setBanner(text, cls){ $('#modeBanner').textContent=text; $('#modeBanner').className=cls||''; }
async function loadCards(){
  let raw;
  if (cfg.apiUrl){
    try{
      const sep = cfg.apiUrl.includes('?')?'&':'?';
      raw = await (await fetch(cfg.apiUrl+sep+'action=list')).json();
      if (!Array.isArray(raw)) throw new Error('bad response');
      localStorage.setItem(LS_CARDS, JSON.stringify(raw));
      setBanner('');
    }catch(e){
      raw = JSON.parse(localStorage.getItem(LS_CARDS)||'[]');
      setBanner('Не удалось получить данные из Google Таблицы — показана локальная копия.','warn');
    }
  } else {
    raw = JSON.parse(localStorage.getItem(LS_CARDS)||'[]');
    setBanner('Демо-режим: укажите URL Apps Script в настройках.','info');
  }
  cards = raw.map(c => c.scheme ? Object.assign({}, c, {scheme:migrateScheme(c.scheme)}) : c);
  fillDatalists(); renderFilters(); renderCards();
}
async function persistCard(card){
  const i = cards.findIndex(c => c.id === card.id);
  if (i >= 0) cards[i] = card; else cards.unshift(card);
  localStorage.setItem(LS_CARDS, JSON.stringify(cards));
  if (cfg.apiUrl){
    try{ await fetch(cfg.apiUrl, { method:'POST', body: JSON.stringify({action:'save', card}) }); }
    catch(e){ alert('Не удалось записать в Google Таблицу. Карточка сохранена локально.'); }
  }
}

// ================= Список карточек =================
function markingHTML(card){
  const sep = card.sep ?? '-';
  return (card.parts||[]).map((p,i) =>
    `<span class="part pc${i%8}" data-pidx="${i}" data-tip="${esc(partTip(p))}">${esc(p.part)}</span>`
  ).join(esc(sep));
}
function renderFilters(){
  const cats=[...new Set(cards.map(c=>c.category).filter(Boolean))].sort();
  const mans=[...new Set(cards.map(c=>c.manufacturer).filter(Boolean))].sort();
  const keep=(sel,arr)=>{ const v=sel.value;
    sel.innerHTML='<option value="">Все</option>'+arr.map(x=>`<option>${esc(x)}</option>`).join(''); sel.value=v; };
  keep($('#fCategory'),cats); keep($('#fManufacturer'),mans);
}
function renderCards(){
  const q=$('#fSearch').value.trim().toLowerCase();
  const cat=$('#fCategory').value, man=$('#fManufacturer').value;
  const list=cards.filter(c=>{
    if (cat && c.category!==cat) return false;
    if (man && c.manufacturer!==man) return false;
    if (q){
      const hay=[c.marking,c.model,c.category,c.manufacturer,c.comment,
        ...(c.parts||[]).flatMap(p=>[p.part,p.desc,charUnit(p)])].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  $('#empty').classList.toggle('hidden', list.length>0);
  $('#cards').innerHTML=list.map(c=>`
    <div class="card">
      <div class="card-cat">${esc(c.category||'—')}${c.manufacturer?' · '+esc(c.manufacturer):''}${c.model?' · '+esc(c.model):''}</div>
      <div class="card-marking">${markingHTML(c)}</div>
      ${c.schemeType ? `<div class="card-scheme">${icon('cpu')} схема: ${SCHEME_NAMES[c.schemeType]||''} · соединений: ${schemeConnCount(c.scheme)}</div>` : ''}
      <div class="card-actions">
        <button class="icon-btn" data-tip="Открыть карточку" data-act="view" data-id="${c.id}">${icon('eye')}</button>
        <button class="icon-btn" data-tip="Создать на основе" data-act="clone" data-id="${c.id}">${icon('copy')}</button>
        <button class="icon-btn" data-tip="Редактировать" data-act="edit" data-id="${c.id}">${icon('edit')}</button>
        <button class="icon-btn danger" data-tip="Удалить" data-act="del" data-id="${c.id}">${icon('trash')}</button>
      </div>
    </div>`).join('');
}

// ================= Просмотр =================
function viewHL(i,on){
  document.querySelectorAll('#viewBody [data-pidx="'+i+'"]').forEach(el=>el.classList.toggle('hl',on));
}
function openView(id){
  const c=cards.find(x=>x.id===id); if(!c) return;
  currentViewId=id;
  $('#viewBody').innerHTML=`
    <div class="view-meta">${esc(c.category||'—')}${c.manufacturer?' · '+esc(c.manufacturer):''}${c.model?' · '+esc(c.model):''} · ${esc(c.date||'')}</div>
    <div class="view-marking">${markingHTML(c)}</div>
    <table class="parts-table"><thead><tr><th>Часть</th><th>Описание</th><th>Характеристика</th></tr></thead>
      <tbody>${(c.parts||[]).map((p,i)=>`<tr data-pidx="${i}"><td class="pc${i%8}" data-pidx="${i}" style="font-weight:600">${esc(p.part)}</td><td>${esc(p.desc||'')}</td><td>${esc(charUnit(p))}</td></tr>`).join('')}</tbody></table>
    ${c.comment?`<div class="view-comment"><b>Комментарий:</b> ${esc(c.comment)}</div>`:''}
    ${c.schemeType && c.scheme ? `
      <div class="scheme-actions">
        <button class="icon-btn" id="btnToggleScheme" data-tip="Показать / скрыть схему">${icon('cpu')}</button>
        <span>Показать схему подключения</span>
      </div>
      <div id="viewScheme" class="hidden">
        <div class="svg-wrap">${schemeToSVG(c.scheme, c)}</div>
        <h4>Вид для Excel</h4>
        <pre id="viewSchemeText">${esc(c.schemeText || schemeToText(c.scheme))}</pre>
        <button class="btn" id="btnCopyScheme">Копировать схему</button>
      </div>`:''}
    ${c.basedOn?`<div class="based">Создано на основе: ${esc(c.basedOn)}</div>`:''}`;
  const t=$('#btnToggleScheme'); if(t) t.onclick=()=>$('#viewScheme').classList.toggle('hidden');
  const cp=$('#btnCopyScheme'); if(cp) cp.onclick=()=>navigator.clipboard.writeText($('#viewSchemeText').textContent)
    .then(()=>{ cp.textContent='Скопировано!'; setTimeout(()=>cp.textContent='Копировать схему',1500); });
  // связная подсветка: часть маркировки <-> строка с описанием
  $$('#viewBody [data-pidx]').forEach(el=>{
    el.addEventListener('mouseenter', ()=>viewHL(el.dataset.pidx,true));
    el.addEventListener('mouseleave', ()=>viewHL(el.dataset.pidx,false));
  });
  $('#viewModal').classList.remove('hidden');
}

// ================= Создание / редактирование =================
function renderPartRows(parts){
  $('#partsRows').innerHTML=parts.map(p=>`
    <div class="part-row">
      <span class="idx"></span>
      <input class="p-part" list="dlParts" value="${esc(p.part||'')}" placeholder="часть">
      <input class="p-desc" value="${esc(p.desc||'')}" placeholder="описание части">
      <input class="p-char" value="${esc(p.char||'')}" placeholder="характеристика">
      <select class="p-unit">${unitOptions(p.unit)}</select>
      <button class="icon-btn danger p-del" data-tip="Удалить часть">${icon('trash')}</button>
    </div>`).join('');
  renumberParts(); refreshPartStyles();
}
function renumberParts(){ $$('#partsRows .part-row .idx').forEach((s,i)=>s.textContent=i+1); }
function refreshPartStyles(){
  $$('#partsRows .part-row').forEach(r=>{
    const inp=r.querySelector('.p-part'), v=inp.value.trim();
    const rec=partsMap.get(v);
    inp.classList.toggle('used', !!rec);
    if (rec){
      const info=[rec.desc, charUnit(rec)].filter(Boolean).join(' · ');
      inp.title='Уже встречалась'+(info?': '+info:'');
    } else inp.removeAttribute('title');
  });
  $('#ePreview').innerHTML=$$('#partsRows .part-row').map((r,i)=>{
    const v=r.querySelector('.p-part').value.trim();
    if (!v) return '';
    const p={desc:r.querySelector('.p-desc').value, char:r.querySelector('.p-char').value, unit:r.querySelector('.p-unit').value};
    return `<span class="part pc${i%8}" data-tip="${esc(partTip(p))}">${esc(v)}</span>`;
  }).join(esc($('#eSep').value)) || '<i>пусто</i>';
}
function openEdit(src, mode){
  editId=null; editBaseOn='';
  let base={category:'',manufacturer:'',model:'',sep:'-',
    parts:[{part:'',desc:'',char:'',unit:''}],comment:'',scheme:null,schemeText:'',basedOn:'',date:''};
  $('#editTitle').textContent='Новая маркировка';
  if (mode==='edit' && src){
    base=JSON.parse(JSON.stringify(src)); editId=src.id; editBaseOn=src.basedOn||'';
    $('#editTitle').textContent='Редактирование: '+src.id;
  } else if (mode==='clone' && src){
    base=JSON.parse(JSON.stringify(src)); base.id=null; base.basedOn=src.id; base.date=''; editBaseOn=src.id;
    $('#editTitle').textContent='Новая на основе: '+src.id;
  }
  if (!base.parts || !base.parts.length) base.parts=[{part:'',desc:'',char:'',unit:''}];
  draftScheme=base.scheme ? JSON.parse(JSON.stringify(base.scheme)) : null;
  draftSchemeText=base.schemeText || (draftScheme ? schemeToText(draftScheme) : '');
  $('#eCategory').value=base.category||''; $('#eManufacturer').value=base.manufacturer||'';
  $('#eModel').value=base.model||''; $('#eSep').value=base.sep??'-'; $('#eComment').value=base.comment||'';
  renderPartRows(base.parts); updateSchemeStatus();
  $('#editModal').classList.remove('hidden');
}
function collectCard(){
  const parts=$$('#partsRows .part-row').map(r=>({
    part:r.querySelector('.p-part').value.trim(),
    desc:r.querySelector('.p-desc').value.trim(),
    char:r.querySelector('.p-char').value.trim(),
    unit:r.querySelector('.p-unit').value
  })).filter(p=>p.part);
  if (!parts.length){ alert('Добавьте хотя бы одну часть маркировки'); return null; }
  const card={
    id:editId||uid(),
    date:editId?(cards.find(c=>c.id===editId)?.date||nowStr()):nowStr(),
    category:$('#eCategory').value.trim(), manufacturer:$('#eManufacturer').value.trim(),
    model:$('#eModel').value.trim(), sep:$('#eSep').value, parts,
    comment:$('#eComment').value.trim(),
    scheme:draftScheme, schemeType:draftScheme?draftScheme.type:0,
    schemeText:draftSchemeText, basedOn:editBaseOn
  };
  card.marking=parts.map(p=>p.part).join(card.sep);
  return card;
}
async function saveCard(){
  const card=collectCard(); if(!card) return;
  await persistCard(card);
  $('#editModal').classList.add('hidden');
  fillDatalists(); renderFilters(); renderCards();
}

// ================= Редактор схемы =================
const newCable = () => ({ mark:'', len:'', rows:[{term:'',wire:'',boxTerm:''}] });

function openScheme(){
  sDraft = draftScheme ? migrateScheme(JSON.parse(JSON.stringify(draftScheme)))
    : { type:1, terminals:[{term:''}], box:{mark:'',desc:''}, cables:[newCable()] };
  if (sDraft.type===1 && !(sDraft.terminals&&sDraft.terminals.length)) sDraft.terminals=[{term:''}];
  if (sDraft.type>=2){
    if (!sDraft.box) sDraft.box={mark:'',desc:''};
    if (!sDraft.cables || !sDraft.cables.length) sDraft.cables=[newCable()];
  }
  $('#schemeModal').classList.remove('hidden');
  renderSchemeEditor();
}
function termBlockHTML(){
  const rows=(sDraft.terminals||[]).map((r,ri)=>`
    <tr><td class="idx">${ri+1}</td>
    <td><input class="r-term" data-ri="${ri}" value="${esc(r.term||'')}" placeholder="G / G0 / 1…"></td>
    <td><button class="icon-btn danger row-del" data-ri="${ri}" data-tip="Удалить клемму">${icon('trash')}</button></td></tr>`).join('');
  return `<div class="cable-block">
    <table class="scheme-table">
      <thead><tr><th>№</th><th>Маркировка клеммы</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table>
    <div class="block-actions">
      <button class="icon-btn add-term" data-tip="Добавить клемму">${icon('plus')}</button>
      <span class="hint">Добавить клемму</span>
    </div></div>`;
}
function cableBlockHTML(ci, c){
  const is3=sDraft.type===3;
  const rows=c.rows.map((r,ri)=>`
    <tr>
      <td class="idx">${ri+1}</td>
      <td><input class="r-term" data-ri="${ri}" value="${esc(r.term||'')}" placeholder="G / G0 / 1…"></td>
      <td class="c-cable-cell">${esc(c.mark||'—')}</td>
      <td class="wire-cell"><span class="sw" style="background:${wireColor(r.wire)}"></span>
        <input class="r-wire" list="dlWires" data-ri="${ri}" value="${esc(r.wire||'')}" placeholder="цвет жилы"></td>
      ${is3?`<td><input class="r-box" data-ri="${ri}" value="${esc(r.boxTerm||'')}" placeholder="X1:1…"></td>`:''}
      <td><button class="icon-btn danger row-del" data-ri="${ri}" data-tip="Удалить клемму">${icon('trash')}</button></td>
    </tr>`).join('');
  const head=is3
    ? '<tr><th>№</th><th>Маркировка клеммы</th><th>Маркировка кабеля</th><th>Цвет жилы</th><th>Клемма в коробке</th><th></th></tr>'
    : '<tr><th>№</th><th>Маркировка клеммы</th><th>Маркировка кабеля</th><th>Цвет жилы</th><th></th></tr>';
  return `<div class="cable-block" data-ci="${ci}">
    <div class="cable-head">
      <label>Маркировка кабеля<input class="c-mark" list="dlCables" value="${esc(c.mark||'')}" placeholder="например: YDY 3×1,5"></label>
      <label>Длина<input class="c-len" value="${esc(c.len||'')}" placeholder="2 м"></label>
      <button class="icon-btn danger c-del" data-ci="${ci}" data-tip="Удалить кабель">${icon('trash')}</button>
    </div>
    <table class="scheme-table"><thead>${head}</thead><tbody>${rows}</tbody></table>
    <div class="block-actions">
      <button class="icon-btn add-term" data-ci="${ci}" data-tip="Добавить клемму — кабель подключается всеми жилами">${icon('plus')}</button>
      <span class="hint">Добавить клемму</span>
    </div></div>`;
}
function renderCables(){
  $('#cablesWrap').innerHTML = sDraft.type===1
    ? termBlockHTML()
    : (sDraft.cables||[]).map((c,i)=>cableBlockHTML(i,c)).join('');
  schemePreviewFill();
}
function renderSchemeEditor(){
  document.querySelector(`input[name="sType"][value="${sDraft.type}"]`).checked=true;
  $('#boxFields').classList.toggle('hidden', sDraft.type!==3);
  if (sDraft.type===3){ $('#sBoxMark').value=sDraft.box.mark||''; $('#sBoxDesc').value=sDraft.box.desc||''; }
  $('#addCableRow').classList.toggle('hidden', sDraft.type===1);
  renderCables();
}
function schemePreviewFill(){ if(sDraft) $('#schemePreview').textContent = schemeToText(sDraft)||'—'; }
function updateSchemeStatus(){
  if (draftScheme){
    const extra = draftScheme.type===1
      ? `клемм: ${draftScheme.terminals.length}`
      : `кабелей: ${draftScheme.cables.length}, соединений: ${schemeConnCount(draftScheme)}`;
    $('#schemeStatus').textContent=SCHEME_NAMES[draftScheme.type]+' · '+extra;
    $('#editSchemeBox').classList.remove('hidden');
    $('#editSchemeText').textContent=draftSchemeText;
  } else {
    $('#schemeStatus').textContent='не задана';
    $('#editSchemeBox').classList.add('hidden');
  }
}

// ================= Схема текстом для Excel =================
function schemeToText(s){
  s=migrateScheme(s); if(!s) return '';
  const T='\t', L=[];
  if (s.type===1){
    const rows=(s.terminals||[]).filter(r=>r.term);
    if (!rows.length) return '';
    L.push('Схема: в оборудовании только клеммы');
    L.push('№'+T+'Маркировка клеммы');
    rows.forEach((r,i)=>L.push((i+1)+T+r.term));
  } else if (s.type===2){
    const lines=[];
    (s.cables||[]).forEach(c=>c.rows.forEach(r=>{
      if (r.term||r.wire) lines.push(r.term+T+(c.mark||'')+T+(r.wire||'')); }));
    if (!lines.length) return '';
    L.push('Схема: клеммы + комплектный кабель');
    L.push('Маркировка клеммы'+T+'Маркировка кабеля'+T+'Цвет жилы');
    L.push(...lines);
  } else {
    const lines=[];
    (s.cables||[]).forEach(c=>c.rows.forEach(r=>{
      if (r.term||r.wire||r.boxTerm) lines.push(r.term+T+(c.mark||'')+T+(r.wire||'')+T+(r.boxTerm||'')); }));
    if (!lines.length) return '';
    L.push('Схема: кабель(и) из оборудования в комплектную коробку');
    L.push('Коробка: '+((s.box&&s.box.mark)||'—')+((s.box&&s.box.desc)?' — '+s.box.desc:''));
    L.push('Маркировка клеммы'+T+'Маркировка кабеля'+T+'Цвет жилы'+T+'Клемма в коробке');
    L.push(...lines);
  }
  return L.join('\n');
}

// ================= Рисованная SVG-схема =================
function schemeToSVG(s, card){
  s=migrateScheme(s)||{};
  const spacing=64, gap=56, pad=55;
  const groups=[];
  if (s.type===1){
    const rows=(s.terminals||[]).filter(r=>r.term);
    if (rows.length) groups.push({name:'',len:'',rows});
  } else {
    (s.cables||[]).forEach(c=>{
      const rows=(c.rows||[]).filter(r=>r.term||r.wire||r.boxTerm);
      if (rows.length) groups.push({name:c.mark||'', len:c.len||'', rows});
    });
  }
  const hasCable=s.type>=2;
  const widths=groups.map(g=>Math.max(g.rows.length,1)*spacing);
  const contentW=widths.reduce((a,b)=>a+b,0)+gap*Math.max(groups.length-1,0);
  const W=Math.max(560, contentW+pad*2), cx=W/2;
  let out=`<text x="${cx}" y="26" class="ttl">ОБОРУДОВАНИЕ${card&&card.model?' — '+esc(card.model):''}</text>`;
  if (!groups.length){
    out+=`<rect x="20" y="60" width="${W-40}" height="90" rx="10" class="eq"/><text x="${cx}" y="112" class="cap">нет соединений</text>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 170" style="min-width:${W}px">${out}</svg>`;
  }
  const terms=[]; let cur=(W-contentW)/2;
  groups.forEach((g,gi)=>{
    if (hasCable) out+=`<text x="${cur+widths[gi]/2}" y="48" class="cap" style="font-size:12px">Кабель ${gi+1}: ${esc(g.name||'—')}${g.len?' · '+esc(g.len):''}</text>`;
    g.rows.forEach((r,i)=>terms.push({x:cur+i*spacing+spacing/2, r}));
    cur+=widths[gi]+gap;
  });
  out+=`<rect x="20" y="60" width="${W-40}" height="90" rx="10" class="eq"/>`;
  terms.forEach(t=>{
    out+=`<text x="${t.x}" y="118" class="tlbl">${esc(t.r.term||'—')}</text>`;
    out+=`<circle cx="${t.x}" cy="136" r="10" class="term"/>`;
  });
  const wireLbl=(x,name)=>name?`<text x="${x+5}" y="235" transform="rotate(-90 ${x+5} 235)" class="wirelbl" fill="${wireColor(name)}">${esc(name)}</text>`:'';
  let H;
  if (s.type===1){
    H=205;
    out+=`<text x="${cx}" y="185" class="cap">Клеммы: ${groups[0].rows.map(r=>esc(r.term)).join(', ')}</text>`;
  } else if (s.type===2){
    H=318;
    terms.forEach(t=>{
      const col=wireColor(t.r.wire);
      out+=`<line x1="${t.x}" y1="146" x2="${t.x}" y2="266" stroke="${col}" stroke-width="4"/>`;
      out+=`<rect x="${t.x-8}" y="266" width="16" height="11" rx="2" fill="${col}" stroke="#333"/>`;
      out+=wireLbl(t.x, t.r.wire);
    });
  } else {
    const xs=terms.map(t=>t.x);
    const left=Math.min(...xs)-34, bw=Math.max(...xs)-Math.min(...xs)+68;
    out+=`<rect x="${left}" y="300" width="${bw}" height="76" rx="10" class="box"/>`;
    terms.forEach(t=>{
      const col=wireColor(t.r.wire);
      out+=`<line x1="${t.x}" y1="146" x2="${t.x}" y2="290" stroke="${col}" stroke-width="4"/>`;
      out+=wireLbl(t.x, t.r.wire);
      out+=`<circle cx="${t.x}" cy="300" r="10" class="term"/>`;
      out+=`<text x="${t.x}" y="334" class="tlbl">${esc(t.r.boxTerm||'—')}</text>`;
    });
    out+=`<text x="${left+bw/2}" y="366" class="cap">КОРОБКА: ${esc((s.box&&s.box.mark)||'—')}</text>`;
    if (s.box && s.box.desc){
      out+=`<text x="${left+bw/2}" y="392" class="cap" style="font-size:11px;fill:#68738a">${esc(s.box.desc)}</text>`;
      H=410;
    } else H=390;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="min-width:${W}px">${out}</svg>`;
}

// ================= Справочники =================
function fillDatalists(){
  partsMap=new Map();
  cards.forEach(c=>(c.parts||[]).forEach(p=>{
    if (p.part) partsMap.set(p.part, {desc:p.desc||'', char:p.char||'', unit:p.unit||''});
  }));
  const opts=arr=>arr.map(v=>`<option value="${esc(v)}">`).join('');
  $('#dlCategories').innerHTML=opts([...new Set(cards.map(c=>c.category).filter(Boolean))].sort());
  $('#dlManufacturers').innerHTML=opts([...new Set(cards.map(c=>c.manufacturer).filter(Boolean))].sort());
  $('#dlParts').innerHTML=opts([...partsMap.keys()].sort());
  $('#dlCables').innerHTML=opts([...new Set(
    cards.flatMap(c=>(c.scheme&&c.scheme.cables)||[]).map(cb=>cb.mark).filter(Boolean))].sort());
  $('#dlWires').innerHTML=opts(WIRE_COLORS.map(([v])=>v));
}

// ================= Экспорт CSV =================
function exportCSV(){
  const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  const lines=[['ID','Дата','Категория','Производитель','Модель','Маркировка','Части и описания','Схема','Комментарий'].join(';')];
  cards.forEach(c=>lines.push([
    c.id, c.date, c.category, c.manufacturer, c.model, c.marking,
    (c.parts||[]).map(p=>[p.part,p.desc||'',charUnit(p)].join(' :: ')).join(' | '),
    c.schemeText||'', c.comment
  ].map(q).join(';')));
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob(['\uFEFF'+lines.join('\r\n')], {type:'text/csv;charset=utf-8'}));
  a.download='markings.csv'; a.click();
}

// ================= Инициализация =================
function init(){
  $$('[data-icon]').forEach(el=>el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)));

  $('#btnAdd').onclick=$('#btnAddEmpty').onclick=()=>openEdit(null,'new');
  $('#btnRefresh').onclick=loadCards;
  $('#btnExport').onclick=exportCSV;
  $('#btnSaveCard').onclick=saveCard;

  $('#btnSettings').onclick=()=>{ $('#cfgUrl').value=cfg.apiUrl||API_URL; $('#settingsModal').classList.remove('hidden'); };
  $('#btnSaveCfg').onclick=()=>{
    cfg.apiUrl=$('#cfgUrl').value.trim()||API_URL;
    localStorage.setItem(LS_CFG, JSON.stringify(cfg));
    $('#settingsModal').classList.add('hidden');
    loadCards();
  };
  $('#btnTestUrl').onclick=async()=>{
    const u=$('#cfgUrl').value.trim(); if(!u) return alert('Введите URL');
    try{
      const d=await (await fetch(u+(u.includes('?')?'&':'?')+'action=list')).json();
      alert('Связь установлена. В таблице карточек: '+(Array.isArray(d)?d.length:'?'));
    }catch(e){ alert('Ошибка подключения: '+e.message); }
  };

  $('#cards').addEventListener('click', e=>{
    const b=e.target.closest('button[data-act]'); if(!b) return;
    const c=cards.find(x=>x.id===b.dataset.id); if(!c) return;
    if (b.dataset.act==='view') openView(c.id);
    if (b.dataset.act==='clone') openEdit(c,'clone');
    if (b.dataset.act==='edit') openEdit(c,'edit');
    if (b.dataset.act==='del'){
      if (!confirm('Удалить маркировку '+c.id+'?')) return;
      cards=cards.filter(x=>x.id!==c.id);
      localStorage.setItem(LS_CARDS, JSON.stringify(cards));
      if (cfg.apiUrl) fetch(cfg.apiUrl, {method:'POST', body:JSON.stringify({action:'delete', id:c.id})});
      fillDatalists(); renderFilters(); renderCards();
    }
  });

  // части маркировки
  $('#btnAddPart').onclick=()=>{
    $('#partsRows').insertAdjacentHTML('beforeend', `
      <div class="part-row"><span class="idx"></span>
      <input class="p-part" list="dlParts" placeholder="часть">
      <input class="p-desc" placeholder="описание части">
      <input class="p-char" placeholder="характеристика">
      <select class="p-unit">${unitOptions('')}</select>
      <button class="icon-btn danger p-del" data-tip="Удалить часть">${icon('trash')}</button></div>`);
    renumberParts();
  };
  $('#partsRows').addEventListener('input', refreshPartStyles);
  $('#partsRows').addEventListener('change', e=>{
    if (!e.target.classList.contains('p-part')) return;
    const rec=partsMap.get(e.target.value.trim()); if(!rec) return;
    const row=e.target.closest('.part-row');
    const d=row.querySelector('.p-desc'); if(!d.value) d.value=rec.desc||'';
    const ch=row.querySelector('.p-char');
    if (rec.char && !ch.value){ ch.value=rec.char; if (rec.unit) row.querySelector('.p-unit').value=rec.unit; }
    refreshPartStyles();
  });
  $('#partsRows').addEventListener('click', e=>{
    if (!e.target.closest('.p-del')) return;
    e.target.closest('.part-row').remove(); renumberParts(); refreshPartStyles();
  });
  $('#eSep').addEventListener('change', refreshPartStyles);

  // схема подключения
  $('#btnOpenScheme').onclick=openScheme;
  $('#btnAddCable').onclick=()=>{ if(!sDraft) return; sDraft.cables.push(newCable()); renderCables(); };
  $('#sBoxMark').addEventListener('input', e=>{
    if(!sDraft) return; sDraft.box=sDraft.box||{mark:'',desc:''}; sDraft.box.mark=e.target.value; schemePreviewFill(); });
  $('#sBoxDesc').addEventListener('input', e=>{
    if(!sDraft) return; sDraft.box=sDraft.box||{mark:'',desc:''}; sDraft.box.desc=e.target.value; schemePreviewFill(); });
  $('#cablesWrap').addEventListener('input', e=>{
    const t=e.target, block=t.closest('.cable-block'); if(!block) return;
    if (sDraft.type===1){
      if (t.classList.contains('r-term')) sDraft.terminals[+t.dataset.ri].term=t.value;
    } else {
      const ci=+block.dataset.ci, c=sDraft.cables[ci];
      if (t.classList.contains('c-mark')){ c.mark=t.value; block.querySelectorAll('.c-cable-cell').forEach(td=>td.textContent=t.value||'—'); }
      else if (t.classList.contains('c-len')) c.len=t.value;
      else if (t.classList.contains('r-term')) c.rows[+t.dataset.ri].term=t.value;
      else if (t.classList.contains('r-wire')){
        c.rows[+t.dataset.ri].wire=t.value;
        const sw=t.closest('.wire-cell').querySelector('.sw'); if(sw) sw.style.background=wireColor(t.value);
      }
      else if (t.classList.contains('r-box')) c.rows[+t.dataset.ri].boxTerm=t.value;
    }
    schemePreviewFill();
  });
  $('#cablesWrap').addEventListener('click', e=>{
    const btn=e.target.closest('button'); if(!btn) return;
    const block=btn.closest('.cable-block');
    if (btn.classList.contains('add-term')){
      if (sDraft.type===1) sDraft.terminals.push({term:''});
      else sDraft.cables[+block.dataset.ci].rows.push({term:'',wire:'',boxTerm:''});
      renderCables();
    } else if (btn.classList.contains('row-del')){
      const ri=+btn.dataset.ri;
      if (sDraft.type===1){ sDraft.terminals.splice(ri,1); if(!sDraft.terminals.length) sDraft.terminals=[{term:''}]; }
      else { const c=sDraft.cables[+block.dataset.ci]; c.rows.splice(ri,1); if(!c.rows.length) c.rows=[{term:'',wire:'',boxTerm:''}]; }
      renderCables();
    } else if (btn.classList.contains('c-del')){
      sDraft.cables.splice(+btn.dataset.ci,1);
      if (!sDraft.cables.length) sDraft.cables=[newCable()];
      renderCables();
    }
  });
  $$('input[name="sType"]').forEach(r=>r.onchange=e=>{
    if (!sDraft) return;
    const t=+e.target.value;
    const flat = sDraft.type===1
      ? (sDraft.terminals||[]).map(x=>({term:x.term||'',wire:'',boxTerm:''}))
      : (sDraft.cables||[]).flatMap(c=>(c.rows||[]).map(r=>({term:r.term||'',wire:r.wire||'',boxTerm:r.boxTerm||''})));
    if (t===1){
      sDraft={type:1, terminals:flat.length?flat.map(x=>({term:x.term})):[{term:''}]};
    } else {
      const prev=sDraft.type>=2&&sDraft.cables&&sDraft.cables[0]?sDraft.cables[0]:null;
      sDraft={type:t, box:sDraft.box||{mark:'',desc:''},
        cables:[{mark:prev?prev.mark||'', len:prev?prev.len||'',
                 rows:flat.length?flat:[{term:'',wire:'',boxTerm:''}]}]};
    }
    renderSchemeEditor();
  });
  $('#btnApplyScheme').onclick=()=>{
    let clean;
    if (sDraft.type===1){
      const rows=sDraft.terminals.filter(r=>(r.term||'').trim());
      if (!rows.length) return alert('Добавьте хотя бы одну клемму');
      clean={type:1, terminals:rows.map(r=>({term:r.term.trim()}))};
    } else {
      const cables=sDraft.cables
        .map(c=>({ mark:(c.mark||'').trim(), len:(c.len||'').trim(),
          rows:c.rows.filter(r=>(r.term||'').trim()||(r.wire||'').trim()||(r.boxTerm||'').trim())
                     .map(r=>({term:(r.term||'').trim(),wire:(r.wire||'').trim(),boxTerm:(r.boxTerm||'').trim()})) }))
        .filter(c=>c.mark||c.rows.length);
      if (!cables.length) return alert('Добавьте хотя бы один кабель с клеммой');
      clean={type:sDraft.type, cables};
      if (sDraft.type===3) clean.box={mark:$('#sBoxMark').value.trim(), desc:$('#sBoxDesc').value.trim()};
    }
    draftScheme=clean;
    draftSchemeText=schemeToText(clean);
    updateSchemeStatus();
    $('#schemeModal').classList.add('hidden');
  };

  $('#viewEdit').onclick=()=>{ const c=cards.find(x=>x.id===currentViewId); $('#viewModal').classList.add('hidden'); openEdit(c,'edit'); };
  $('#viewClone').onclick=()=>{ const c=cards.find(x=>x.id===currentViewId); $('#viewModal').classList.add('hidden'); openEdit(c,'clone'); };

  ['fSearch','fCategory','fManufacturer'].forEach(id=>$('#'+id).addEventListener('input', renderCards));

  $$('[data-close]').forEach(b=>b.onclick=e=>e.target.closest('.modal').classList.add('hidden'));
  $$('.modal').forEach(m=>m.addEventListener('click', e=>{ if(e.target===m) m.classList.add('hidden'); }));

  loadCards();
}
init();
