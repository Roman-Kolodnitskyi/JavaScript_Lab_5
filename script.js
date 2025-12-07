const CATEGORIES_JSON = 'data/categories.json';

// Утиліти
function $(sel) { return document.querySelector(sel); }
function el(tag, cls, inner) { const e = document.createElement(tag); if(cls) e.className = cls; if(inner!==undefined) e.innerHTML=inner; return e; }

// Завантаження JSON
async function fetchJson(url) {
  const res = await fetch(url);
  if(!res.ok) throw new Error(`Помилка ${res.status} при fetch ${url}`);
  return await res.json();
}

async function loadCategories() {
  return await fetchJson(CATEGORIES_JSON);
}

// Головна сторінка
async function renderHome() {
  const app = $('#app'); app.innerHTML='';
  app.appendChild(el('h1',null,'Вітаємо в каталозі'));
  app.appendChild(el('p',null,'Натисніть на категорію, щоб переглянути товари.'));

  try {
    const cats = await loadCategories();
    const list = el('div','category-list');
    cats.forEach(cat=>{
      const div = el('div','category-item');
      const img = el('img');
      img.src = cat.img || 'https://via.placeholder.com/200';
      img.alt = cat.name;
      div.appendChild(img);
      div.appendChild(el('h3',null,cat.name));
      div.dataset.shortname = cat.shortname;
      div.addEventListener('click',()=>loadAndRenderCategory(cat.shortname));
      list.appendChild(div);
    });
    app.appendChild(list);

    const specialsBtn = el('div','button','Specials — випадкова категорія');
    specialsBtn.addEventListener('click',()=>loadRandomCategory(cats));
    app.appendChild(specialsBtn);

  } catch(err) {
    app.appendChild(el('div',null,'Помилка завантаження категорій: '+err.message));
  }
}

// Каталог
async function renderCatalog() {
  const app = $('#app'); app.innerHTML='';
  try {
    const cats = await loadCategories();
    const list = el('div','category-list');
    cats.forEach(cat=>{
      const div = el('div','category-item');
      const img = el('img'); img.src = cat.img || 'https://via.placeholder.com/200';
      img.alt = cat.name;
      div.appendChild(img);
      div.appendChild(el('h3',null,cat.name));
      div.appendChild(el('p','notes',cat.notes || ''));
      const btn = el('div','button','Відкрити');
      btn.addEventListener('click',()=>loadAndRenderCategory(cat.shortname));
      div.appendChild(btn);
      list.appendChild(div);
    });
    app.appendChild(list);

    const specialsBtn = el('div','button','Specials — випадкова категорія');
    specialsBtn.addEventListener('click',()=>loadRandomCategory(cats));
    app.appendChild(specialsBtn);

  } catch(err) {
    app.appendChild(el('div',null,'Помилка завантаження категорій: '+err.message));
  }
}

// Показ категорії
async function loadAndRenderCategory(shortname) {
  const app = $('#app'); app.innerHTML='';
  try {
    const cat = await fetchJson(`data/${shortname}.json`);
    renderCategory(cat);
  } catch(err) {
    app.appendChild(el('div',null,'Помилка завантаження категорії: '+err.message));
  }
}

function renderCategory(cat) {
  const app = $('#app'); app.innerHTML='';
  app.appendChild(el('h2',null,cat.name));
  if(cat.notes) app.appendChild(el('p','notes',cat.notes));

  const grid = el('div','product-grid');
  (cat.items||[]).forEach(item=>{
    const card = el('div','product-card');
    const img = el('img');
    img.src = item.img || `https://via.placeholder.com/200?text=${encodeURIComponent(item.shortname||item.name)}`;
    img.alt = item.name;
    card.appendChild(img);
    card.appendChild(el('h3',null,item.name));
    card.appendChild(el('p',null,item.description||''));
    card.appendChild(el('p',null,'Ціна: '+(item.price||'—')));
    grid.appendChild(card);
  });
  app.appendChild(grid);
}

function loadRandomCategory(cats){
  if(!cats || cats.length===0) return;
  const idx = Math.floor(Math.random()*cats.length);
  loadAndRenderCategory(cats[idx].shortname);
}

// Навігація
$('#nav-home').addEventListener('click',()=>renderHome());
$('#nav-catalog').addEventListener('click',()=>renderCatalog());
$('#nav-specials').addEventListener('click',async ()=>{
  const cats = await loadCategories();
  loadRandomCategory(cats);
});

// Ініціалізація
renderHome();

