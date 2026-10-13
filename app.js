// ================= Утилиты и иконки =================
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

// ================= Состояние =================
const LS_CARDS='mk_cards_v1', LS_CFG='mk_cfg_v1';
let cfg = JSON.parse(localStorage.getItem(LS_CFG) || '{"apiUrl":""}');
let cards = [], partsMap = new Map();
let editId=null, editBaseOn='', draftScheme=null, draftSchemeText='';
let sDraft=null, currentViewId=null;

// ================= Загрузка данных =================
function setBanner(text, cls){
  $('#modeBanner').textContent = text;
  $('#modeBanner').className = cls || '';
}
async function loadCards(){
  if (cfg.apiUrl){
    try{
      const sep = cfg.apiUrl.includes('?') ? '&' : '?';
      const data = await (await fetch(cfg.apiUrl + sep + 'action=list')).json();
      if (!Array.isArray(data)) throw new Error('bad response');
      cards = data;
      localStorage.setItem(LS_CARDS, JSON.stringify(cards));
      setBanner('');
    }catch(e){
      cards = JSON.parse(localStorage.getItem(LS_CARDS) || '[]');
      setBanner('Не удалось получить данные из Google Таблицы — показана локальная копия.', 'warn');
    }
  } else {
    cards = JSON.parse(localStorage.getItem(LS_CARDS) || '[]');
    setBanner('Демо-режим: данные хранятся только в этом браузере. Откройте «Настройки» и укажите URL Apps Script, чтобы подключить Google Таблицу.', 'info');
  }
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

// ================= Рендер списка =================
const SCHEME_NAMES = ['','только клеммы','клеммы + кабель','кабель + коробка'];
function markingHTML(card){
  const sep = card.sep ?? '-';
  return (card.parts||[]).map((p,i) =>
    `<span class="part pc${i%8}" data-tip="${esc(p.desc||'без описания')}">${esc(p.part)}</span>`
  ).join(esc(sep));
}
function renderFilters(){
  const cats = [...new Set(cards.map(c=>c.category).filter(Boolean))].sort();
  const mans = [...new Set(cards.map(c=>c.manufacturer).filter(Boolean))].sort();
  const keep = (sel, arr) => { const v = sel.value;
    sel.innerHTML = '<option value="">Все</option>' + arr.map(x=>`<option>${esc(x)}</option>`).join('');
    sel.value = v; };
  keep($('#fCategory'), cats); keep($('#fManufacturer'), mans);
}
function renderCards(){
  const q = $('#fSearch').value.trim().toLowerCase();
  const cat = $('#fCategory').value, man = $('#fManufacturer').value;
  const list = cards.filter(c=>{
    if (cat && c.category !== cat) return false;
    if (man && c.manufacturer !== man) return false;
    if (q){
      const hay = [c.marking, c.model, c.category, c.manufacturer, c.comment,
        ...(c.parts||[]).flatMap(p=>[p.part,p.desc])].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  $('#empty').classList.toggle('hidden', list.length > 0);
  $('#cards').innerHTML = list.map(c=>`
    <div class="card">
      <div class="card-cat">${esc(c.category||'—')}${c.manufacturer?' · '+esc(c.manufacturer):''}${c.model?' · '+esc(c.model):''}</div>
      <div class="card-marking">${markingHTML(c)}</div>
      ${c.schemeType ? `<div class="card-scheme">${icon('cpu')} схема: ${SCHEME_NAMES[c.schemeType]||''} · соединений: ${c.scheme?.rows?.length||0}</div>` : ''}
      <div class="card-actions">
        <button class="icon-btn" data-tip="Открыть карточку" data-act="view" data-id="${c.id}">${icon('eye')}</button>
        <button class="icon-btn" data-tip="Создать на основе" data-act="clone" data-id="${c.id}">${icon('copy')}</button>
        <button class="icon-btn" data-tip="Редактировать" data-act="edit" data-id="${c.id}">${icon('edit')}</button>
        <button class="icon-btn danger" data-tip="Удалить" data-act="del" data-id="${c.id}">${icon('trash')}</button>
      </div>
    </div>`).join('');
}

// ================= Просмотр карточки =================
function openView(id){
  const c = cards.find(x=>x.id===id); if(!c) return;
  currentViewId = id;
  $('#viewBody').innerHTML = `
    <div class="view-meta">${esc(c.category||'—')}${c.manufacturer?' · '+esc(c.manufacturer):''}${c.model?' · '+esc(c.model):''} · ${esc(c.date||'')}</div>
    <div class="view-marking">${markingHTML(c)}</div>
    <table class="parts-table"><thead><tr><th>Часть</th><th>Описание</th></tr></thead>
      <tbody>${(c.parts||[]).map(p=>`<tr><td class="pc0" style="font-weight:600">${esc(p.part)}</td><td>${esc(p.desc)}</td></tr>`).join('')}</tbody></table>
    ${c.comment ? `<div class="view-comment"><b>Комментарий:</b> ${esc(c.comment)}</div>` : ''}
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
      </div>` : ''}
    ${c.basedOn ? `<div class="based">Создано на основе: ${esc(c.basedOn)}</div>` : ''}`;
  const t = $('#btnToggleScheme');
  if (t) t.onclick = () => $('#viewScheme').classList.toggle('hidden');
  const cp = $('#btnCopyScheme');
  if (cp) cp.onclick = () => navigator.clipboard.writeText($('#viewSchemeText').textContent)
    .then(()=>{ cp.textContent='Скопировано!'; setTimeout(()=>cp.textContent='Копировать схему',1500); });
  $('#viewModal').classList.remove('hidden');
}

// ================= Создание / редактирование =================
function renderPartRows(parts){
  $('#partsRows').innerHTML = parts.map(p=>`
    <div class="part-row">
      <span class="idx"></span>
      <input class="p-part" list="dlParts" value="${esc(p.part)}" placeholder="часть">
      <input class="p-desc" value="${esc(p.desc)}" placeholder="описание части">
      <button class="icon-btn danger p-del" data-tip="Удалить часть">${icon('trash')}</button>
    </div>`).join('');
  renumberParts(); refreshPartStyles();
}
function renumberParts(){ $$('#partsRows .part-row .idx').forEach((s,i)=>s.textContent=i+1); }
function refreshPartStyles(){
  $$('#partsRows .part-row').forEach(r=>{
    const inp = r.querySelector('.p-part'), v = inp.value.trim();
    const known = partsMap.has(v);
    inp.classList.toggle('used', known);
    if (known) inp.title = 'Часть уже встречалась: ' + (partsMap.get(v) || 'без описания');
    else inp.removeAttribute('title');
  });
  $('#ePreview').innerHTML = $$('#partsRows .part-row').map((r,i)=>{
    const v = r.querySelector('.p-part').value.trim();
    return v ? `<span class="part pc${i%8}" data-tip="${esc(r.querySelector('.p-desc').value)}">${esc(v)}</span>` : '';
  }).filter(Boolean).join(esc($('#eSep').value)) || '<i>пусто</i>';
}
function openEdit(src, mode){
  editId = null; editBaseOn = '';
  let base = { category:'', manufacturer:'', model:'', sep:'-',
               parts:[{part:'',desc:''}], comment:'', scheme:null, schemeText:'', basedOn:'', date:'' };
  $('#editTitle').textContent = 'Новая маркировка';
  if (mode==='edit' && src){
    base = JSON.parse(JSON.stringify(src)); editId = src.id; editBaseOn = src.basedOn || '';
    $('#editTitle').textContent = 'Редактирование: ' + src.id;
  } else if (mode==='clone' && src){
    base = JSON.parse(JSON.stringify(src));
    base.id = null; base.basedOn = src.id; base.date = ''; editBaseOn = src.id;
    $('#editTitle').textContent = 'Новая на основе: ' + src.id;
  }
  if (!base.parts || !base.parts.length) base.parts = [{part:'',desc:''}];
  draftScheme = base.scheme ? JSON.parse(JSON.stringify(base.scheme)) : null;
  draftSchemeText = base.schemeText || (draftScheme ? schemeToText(draftScheme) : '');
  $('#eCategory').value = base.category || '';
  $('#eManufacturer').value = base.manufacturer || '';
  $('#eModel').value = base.model || '';
  $('#eSep').value = base.sep ?? '-';
  $('#eComment').value = base.comment || '';
  renderPartRows(base.parts);
  updateSchemeStatus();
  $('#editModal').classList.remove('hidden');
}
function collectCard(){
  const parts = $$('#partsRows .part-row').map(r=>({
    part: r.querySelector('.p-part').value.trim(),
    desc: r.querySelector('.p-desc').value.trim()
  })).filter(p=>p.part);
  if (!parts.length){ alert('Добавьте хотя бы одну часть маркировки'); return null; }
  const card = {
    id: editId || uid(),
    date: editId ? (cards.find(c=>c.id===editId)?.date || nowStr()) : nowStr(),
    category: $('#eCategory').value.trim(),
    manufacturer: $('#eManufacturer').value.trim(),
    model: $('#eModel').value.trim(),
    sep: $('#eSep').value,
    parts,
    comment: $('#eComment').value.trim(),
    scheme: draftScheme,
    schemeType: draftScheme ? draftScheme.type : 0,
    schemeText: draftSchemeText,
    basedOn: editBaseOn
  };
  card.marking = parts.map(p=>p.part).join(card.sep);
  return card;
}
async function saveCard(){
  const card = collectCard(); if (!card) return;
  await persistCard(card);
  $('#editModal').classList.add('hidden');
  fillDatalists(); renderFilters(); renderCards();
}

// ================= Редактор схемы =================
const S_COLS = {
  1: { head:['№','Маркировка клеммы'],
       cols:[{k:'tm', ph:'G / G0 / 1…', list:''}] },
  2: { head:['№','Маркировка клеммы','Жила кабеля'],
       cols:[{k:'tm', ph:'G / G0…', list:''}, {k:'wire', ph:'коричневый…', list:'dlWires'}] },
  3: { head:['№','Клемма оборудования','Жила кабеля','Клемма коробки'],
       cols:[{k:'tm', ph:'G / G0…', list:''}, {k:'wire', ph:'коричневый…', list:'dlWires'}, {k:'b', ph:'X1:1…', list:''}] }
};
function openScheme(){
  sDraft = draftScheme ? JSON.parse(JSON.stringify(draftScheme))
    : { type:1, rows:[{tm:'',wire:'',b:''}], cable:{mark:'',len:''}, box:{mark:''} };
  if (!sDraft.rows || !sDraft.rows.length) sDraft.rows = [{tm:'',wire:'',b:''}];
  $('#schemeModal').classList.remove('hidden');
  renderSchemeEditor();
}
function schemePreviewFill(){ $('#schemePreview').textContent = schemeToText(sDraft) || '—'; }
function renderSchemeEditor(){
  document.querySelector(`input[name="sType"][value="${sDraft.type}"]`).checked = true;
  const def = S_COLS[sDraft.type];
  let ex = '';
  if (sDraft.type >= 2) ex += `<div class="grid2">
    <label>Маркировка кабеля<input id="sCableMark" list="dlCables" value="${esc(sDraft.cable.mark)}" placeholder="например: YDY 3×1,5"></label>
    <label>Длина<input id="sCableLen" value="${esc(sDraft.cable.len)}" placeholder="например: 2 м"></label></div>`;
  if (sDraft.type === 3) ex += `<div class="grid2">
    <label>Маркировка коробки<input id="sBoxMark" value="${esc(sDraft.box.mark)}" placeholder="например: X1 / ККС-6"></label><span></span></div>`;
  $('#schemeExtra').innerHTML = ex;
  if (sDraft.type >= 2){
    $('#sCableMark').oninput = e => { sDraft.cable.mark = e.target.value; schemePreviewFill(); };
    $('#sCableLen').oninput  = e => { sDraft.cable.len  = e.target.value; schemePreviewFill(); };
  }
  if (sDraft.type === 3)
    $('#sBoxMark').oninput = e => { sDraft.box.mark = e.target.value; schemePreviewFill(); };
  $('#schemeHead').innerHTML = '<tr>' + def.head.map(h=>`<th>${h}</th>`).join('') + '<th></th></tr>';
  $('#schemeRows').innerHTML = sDraft.rows.map((r,i)=>'<tr>' +
    def.cols.map(c=>`<td><input data-i="${i}" data-k="${c.k}" list="${c.list}" value="${esc(r[c.k]||'')}" placeholder="${c.ph}"></td>`).join('') +
    `<td><button class="icon-btn danger row-del" data-i="${i}" data-tip="Удалить строку">${icon('trash')}</button></td></tr>`).join('');
  schemePreviewFill();
}
function updateSchemeStatus(){
  if (draftScheme){
    $('#schemeStatus').textContent = SCHEME_NAMES[draftScheme.type] + ` (${draftScheme.rows.length} соед.)`;
    $('#editSchemeBox').classList.remove('hidden');
    $('#editSchemeText').textContent = draftSchemeText;
  } else {
    $('#schemeStatus').textContent = 'не задана';
    $('#editSchemeBox').classList.add('hidden');
  }
}

// ================= Текст схемы для Excel =================
function schemeToText(s){
  if (!s) return '';
  const rows = (s.rows||[]).filter(r=>r.tm||r.wire||r.b);
  if (!rows.length) return '';
  const T='\t', L=[];
  if (s.type === 1){
    L.push('Схема: в оборудовании только клеммы');
    L.push('№' + T + 'Маркировка клеммы');
    rows.forEach((r,i)=>L.push((i+1) + T + (r.tm||'')));
  } else if (s.type === 2){
    L.push('Схема: клеммы + комплектный кабель');
    L.push('Кабель: ' + (s.cable.mark||'—') + (s.cable.len ? ' ('+s.cable.len+')' : ''));
    L.push('№' + T + 'Маркировка клеммы' + T + 'Жила кабеля');
    rows.forEach((r,i)=>L.push((i+1) + T + (r.tm||'') + T + (r.wire||'')));
  } else {
    L.push('Схема: кабель из оборудования в комплектную коробку');
    L.push('Кабель: ' + (s.cable.mark||'—') + (s.cable.len ? ' ('+s.cable.len+')' : ''));
    L.push('Коробка: ' + (s.box.mark||'—'));
    L.push('Клемма оборудования' + T + 'Жила кабеля' + T + 'Клемма коробки');
    rows.forEach(r=>L.push((r.tm||'') + T + (r.wire||'') + T + (r.b||'')));
  }
  return L.join('\n');
}

// ================= Рисованная SVG-схема =================
function schemeToSVG(s, card){
  const rows = (s.rows||[]).filter(r=>r.tm||r.wire||r.b);
  const n = Math.max(rows.length, 1);
  const spacing = Math.min(66, Math.max(48, 760/Math.max(n,6)));
  const W = Math.max(560, n*spacing + 130), cx = W/2, x0 = cx - spacing*(n-1)/2;
  let H, out = '';
  out += `<rect x="20" y="46" width="${W-40}" height="98" rx="10" class="eq"/>`;
  out += `<text x="${cx}" y="28" class="ttl">ОБОРУДОВАНИЕ${card&&card.model ? ' — '+esc(card.model) : ''}</text>`;
  rows.forEach((r,i)=>{
    const x = x0 + i*spacing;
    out += `<circle cx="${x}" cy="144" r="10" class="term"/>`;
    out += `<text x="${x}" y="124" class="tlbl">${esc(r.tm||'—')}</text>`;
  });
  if (s.type === 1){
    H = 195;
    out += `<text x="${cx}" y="180" class="cap">Клеммы: ${rows.map(r=>esc(r.tm||'—')).join(', ')}</text>`;
  } else if (s.type === 2){
    H = 345;
    rows.forEach((r,i)=>{
      const x = x0 + i*spacing, c = wireColor(r.wire);
      out += `<line x1="${x}" y1="154" x2="${x}" y2="266" stroke="${c}" stroke-width="4"/>`;
      out += `<rect x="${x-8}" y="266" width="16" height="11" rx="2" fill="${c}" stroke="#333"/>`;
      if (r.wire) out += `<text x="${x}" y="298" transform="rotate(-32 ${x} 298)" class="wirelbl" fill="${c}">${esc(r.wire)}</text>`;
    });
    out += `<text x="${cx}" y="330" class="cap">Комплектный кабель: ${esc(s.cable.mark||'—')}${s.cable.len ? ', '+esc(s.cable.len) : ''}</text>`;
  } else {
    H = 425;
    const bx0 = Math.max(24, x0-34), bw = spacing*(n-1)+68;
    out += `<text x="26" y="232" text-anchor="start" class="wirelbl" style="font-size:12px">Кабель: ${esc(s.cable.mark||'—')}${s.cable.len ? ', '+esc(s.cable.len) : ''}</text>`;
    out += `<rect x="${bx0}" y="300" width="${bw}" height="76" rx="10" class="box"/>`;
    rows.forEach((r,i)=>{
      const x = x0 + i*spacing, c = wireColor(r.wire);
      out += `<line x1="${x}" y1="154" x2="${x}" y2="290" stroke="${c}" stroke-width="4"/>`;
      out += `<circle cx="${x}" cy="300" r="10" class="term"/>`;
      out += `<text x="${x}" y="336" class="tlbl">${esc(r.b||'—')}</text>`;
    });
    out += `<text x="${bx0+bw/2}" y="368" class="cap">КОРОБКА: ${esc(s.box.mark||'—')}</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="min-width:${W}px">${out}</svg>`;
}

// ================= Справочники (datalist) =================
function fillDatalists(){
  partsMap = new Map();
  cards.forEach(c => (c.parts||[]).forEach(p => { if (p.part) partsMap.set(p.part, p.desc||''); }));
  const opts = arr => arr.map(v=>`<option value="${esc(v)}">`).join('');
  $('#dlCategories').innerHTML   = opts([...new Set(cards.map(c=>c.category).filter(Boolean))].sort());
  $('#dlManufacturers').innerHTML= opts([...new Set(cards.map(c=>c.manufacturer).filter(Boolean))].sort());
  $('#dlParts').innerHTML        = opts([...partsMap.keys()].sort());
  $('#dlCables').innerHTML       = opts([...new Set(
    cards.flatMap(c => c.scheme && c.scheme.cable && c.scheme.cable.mark ? [c.scheme.cable.mark] : []))].sort());
  $('#dlWires').innerHTML        = opts(WIRE_COLORS.map(([v])=>v));
}

// ================= Экспорт CSV =================
function exportCSV(){
  const q = v => '"' + String(v ?? '').replace(/"/g,'""') + '"';
  const lines = [['ID','Дата','Категория','Производитель','Модель','Маркировка','Части и описания','Схема','Комментарий'].join(';')];
  cards.forEach(c=>lines.push([
    c.id, c.date, c.category, c.manufacturer, c.model, c.marking,
    (c.parts||[]).map(p=>p.part+' :: '+(p.desc||'')).join(' | '),
    c.schemeText||'', c.comment
  ].map(q).join(';')));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\uFEFF'+lines.join('\r\n')], {type:'text/csv;charset=utf-8'}));
  a.download = 'markings.csv'; a.click();
}

// ================= Инициализация =================
function init(){
  $$('[data-icon]').forEach(el => el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)));

  $('#btnAdd').onclick = $('#btnAddEmpty').onclick = () => openEdit(null,'new');
  $('#btnRefresh').onclick = loadCards;
  $('#btnExport').onclick = exportCSV;
  $('#btnSaveCard').onclick = saveCard;

  $('#btnSettings').onclick = () => { $('#cfgUrl').value = cfg.apiUrl || ''; $('#settingsModal').classList.remove('hidden'); };
  $('#btnSaveCfg').onclick = () => {
    cfg.apiUrl = $('#cfgUrl').value.trim();
    localStorage.setItem(LS_CFG, JSON.stringify(cfg));
    $('#settingsModal').classList.add('hidden');
    loadCards();
  };
  $('#btnTestUrl').onclick = async () => {
    const u = $('#cfgUrl').value.trim();
    if (!u) return alert('Введите URL');
    try{
      const d = await (await fetch(u + (u.includes('?')?'&':'?') + 'action=list')).json();
      alert('Связь установлена. В таблице карточек: ' + (Array.isArray(d) ? d.length : '?'));
    }catch(e){ alert('Ошибка подключения: ' + e.message); }
  };

  // делегирование: карточки
  $('#cards').addEventListener('click', e=>{
    const b = e.target.closest('button[data-act]'); if (!b) return;
    const c = cards.find(x=>x.id===b.dataset.id); if (!c) return;
    if (b.dataset.act==='view')  openView(c.id);
    if (b.dataset.act==='clone') openEdit(c,'clone');
    if (b.dataset.act==='edit')  openEdit(c,'edit');
    if (b.dataset.act==='del'){
      if (!confirm('Удалить маркировку ' + c.id + '?')) return;
      cards = cards.filter(x=>x.id!==c.id);
      localStorage.setItem(LS_CARDS, JSON.stringify(cards));
      if (cfg.apiUrl) fetch(cfg.apiUrl, {method:'POST', body: JSON.stringify({action:'delete', id:c.id})});
      fillDatalists(); renderFilters(); renderCards();
    }
  });

  // части маркировки
  $('#btnAddPart').onclick = () => {
    $('#partsRows').insertAdjacentHTML('beforeend', `
      <div class="part-row"><span class="idx"></span>
      <input class="p-part" list="dlParts" placeholder="часть">
      <input class="p-desc" placeholder="описание части">
      <button class="icon-btn danger p-del" data-tip="Удалить часть">${icon('trash')}</button></div>`);
    renumberParts();
  };
  $('#partsRows').addEventListener('input', refreshPartStyles);
  $('#partsRows').addEventListener('change', e=>{
    if (!e.target.classList.contains('p-part')) return;
    const desc = partsMap.get(e.target.value.trim());
    if (desc){ const d = e.target.closest('.part-row').querySelector('.p-desc'); if (!d.value) d.value = desc; }
    refreshPartStyles();
  });
  $('#partsRows').addEventListener('click', e=>{
    if (!e.target.closest('.p-del')) return;
    e.target.closest('.part-row').remove(); renumberParts(); refreshPartStyles();
  });
  $('#eSep').addEventListener('change', refreshPartStyles);

  // схема подключения
  $('#btnOpenScheme').onclick = openScheme;
  $$('input[name="sType"]').forEach(r => r.onchange = e => {
    sDraft.type = +e.target.value;
    sDraft.rows = sDraft.rows.map(r => ({ tm:r.tm, wire:sDraft.type>=2?'':'', b:sDraft.type===3?'':'' }));
    renderSchemeEditor();
  });
  $('#btnAddTerm').onclick = () => { sDraft.rows.push({tm:'',wire:'',b:''}); renderSchemeEditor(); };
  $('#schemeRows').addEventListener('input', e=>{
    const i = e.target.dataset.i, k = e.target.dataset.k;
    if (i !== undefined && k){ sDraft.rows[+i][k] = e.target.value; schemePreviewFill(); }
  });
  $('#schemeRows').addEventListener('click', e=>{
    const b = e.target.closest('.row-del'); if (!b) return;
    sDraft.rows.splice(+b.dataset.i, 1);
    if (!sDraft.rows.length) sDraft.rows = [{tm:'',wire:'',b:''}];
    renderSchemeEditor();
  });
  $('#btnApplyScheme').onclick = () => {
    sDraft.rows = sDraft.rows.filter(r=>r.tm||r.wire||r.b);
    if (!sDraft.rows.length) return alert('Добавьте хотя бы одну клемму');
    draftScheme = JSON.parse(JSON.stringify(sDraft));
    draftSchemeText = schemeToText(draftScheme);
    updateSchemeStatus();
    $('#schemeModal').classList.add('hidden');
  };

  // просмотр: правка/клон
  $('#viewEdit').onclick  = () => { const c = cards.find(x=>x.id===currentViewId); $('#viewModal').classList.add('hidden'); openEdit(c,'edit'); };
  $('#viewClone').onclick = () => { const c = cards.find(x=>x.id===currentViewId); $('#viewModal').classList.add('hidden'); openEdit(c,'clone'); };

  // фильтры
  ['fSearch','fCategory','fManufacturer'].forEach(id => $('#'+id).addEventListener('input', renderCards));

  // закрытие модалок
  $$('[data-close]').forEach(b => b.onclick = e => e.target.closest('.modal').classList.add('hidden'));
  $$('.modal').forEach(m => m.addEventListener('click', e => { if (e.target === m) m.classList.add('hidden'); }));

  loadCards();
}
init();
