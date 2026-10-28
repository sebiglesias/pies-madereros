// Pies Madereros - Calculadora de Madera y Pies Tablares
// Multi-item timber calculation, waste margin, weight & cost estimation

const DENSITIES = {
  pino: { name: 'Pino (Elliotis/Paraná)', density: 500 },
  grandis: { name: 'Eucalipto Grandis', density: 650 },
  saligna: { name: 'Eucalipto Saligna', density: 750 },
  dura: { name: 'Madera Dura (Lapacho/Quebracho)', density: 1100 },
  cedro: { name: 'Semidura (Cedro/Guatambú)', density: 700 },
  kiri: { name: 'Liviana (Kiri/Paraíso)', density: 450 }
};

const PRESETS = {
  techo: {
    name: 'Techo Estándar',
    wood: 'grandis',
    items: [
      { name: 'Tirantes techo', thickness: 2, width: 6, length: 4.5, qty: 12, wood: 'grandis' },
      { name: 'Machimbre 1/2x4', thickness: 0.5, width: 4, length: 3.0, qty: 65, wood: 'pino' },
      { name: 'Clavaderas', thickness: 2, width: 2, length: 4.0, qty: 10, wood: 'pino' }
    ]
  },
  pergola: {
    name: 'Pérgola Exterior',
    wood: 'grandis',
    items: [
      { name: 'Columnas 4x4', thickness: 4, width: 4, length: 3.0, qty: 4, wood: 'grandis' },
      { name: 'Vigas maestras 3x6', thickness: 3, width: 6, length: 4.0, qty: 4, wood: 'grandis' },
      { name: 'Tirantillos 2x4', thickness: 2, width: 4, length: 3.5, qty: 12, wood: 'grandis' }
    ]
  },
  mesa: {
    name: 'Mesa Maciza',
    wood: 'cedro',
    items: [
      { name: 'Tablones tapa 2x10', thickness: 2, width: 10, length: 2.4, qty: 4, wood: 'cedro' },
      { name: 'Patas 4x4', thickness: 4, width: 4, length: 0.8, qty: 4, wood: 'cedro' },
      { name: 'Fajas largueros 2x4', thickness: 2, width: 4, length: 2.0, qty: 2, wood: 'cedro' },
      { name: 'Fajas cabezales 2x4', thickness: 2, width: 4, length: 0.9, qty: 2, wood: 'cedro' }
    ]
  }
};

let state = {
  items: [
    { id: 1, name: 'Tirantes 2x6', thickness: 2, width: 6, length: 4.0, qty: 10, wood: 'grandis' },
    { id: 2, name: 'Clavaderas 2x2', thickness: 2, width: 2, length: 4.0, qty: 8, wood: 'pino' }
  ],
  pricePerPie: 0,
  wastePct: 10
};

// Calculate single timber item metrics
function calculateItem(item) {
  const e = parseFloat(item.thickness) || 0;
  const a = parseFloat(item.width) || 0;
  const l = parseFloat(item.length) || 0;
  const qty = parseInt(item.qty, 10) || 0;

  // Formula pies tablares: E" x A" x (L_m * 3.28084) / 12
  const lengthFeet = l * 3.28084;
  const boardFeetUnit = (e * a * lengthFeet) / 12;
  const totalBoardFeet = boardFeetUnit * qty;

  // Volume in m3: (E_m * A_m * L_m)
  const eMeters = e * 0.0254;
  const aMeters = a * 0.0254;
  const volumeM3 = eMeters * aMeters * l * qty;

  // Weight kg
  const density = (DENSITIES[item.wood] && DENSITIES[item.wood].density) || 600;
  const weightKg = volumeM3 * density;

  const linearMeters = l * qty;

  return {
    boardFeetUnit,
    totalBoardFeet,
    volumeM3,
    weightKg,
    linearMeters
  };
}

// Global calculation
function calculateTotal() {
  let totalBoardFeet = 0;
  let totalVolumeM3 = 0;
  let totalWeightKg = 0;
  let totalLinearMeters = 0;
  let totalPieces = 0;

  state.items.forEach(item => {
    const res = calculateItem(item);
    totalBoardFeet += res.totalBoardFeet;
    totalVolumeM3 += res.volumeM3;
    totalWeightKg += res.weightKg;
    totalLinearMeters += res.linearMeters;
    totalPieces += parseInt(item.qty, 10) || 0;
  });

  const wasteMultiplier = 1 + (parseFloat(state.wastePct) || 0) / 100;
  const boardFeetWithWaste = totalBoardFeet * wasteMultiplier;
  const price = parseFloat(state.pricePerPie) || 0;
  const estimatedCost = boardFeetWithWaste * price;

  return {
    totalBoardFeet,
    boardFeetWithWaste,
    totalVolumeM3,
    totalWeightKg,
    totalLinearMeters,
    totalPieces,
    estimatedCost
  };
}

// Render timber rows
function renderItems() {
  const listEl = document.getElementById('timber-list');
  if (!listEl) return;

  listEl.innerHTML = '';

  state.items.forEach((item, index) => {
    const res = calculateItem(item);
    const row = document.createElement('div');
    row.className = 'timber-row-card';
    row.innerHTML = `
      <div class="timber-row-header">
        <input type="text" class="timber-name-input" value="${item.name}" data-idx="${index}" data-field="name" placeholder="Ej: Tirante, Viga, Machimbre" />
        ${state.items.length > 1 ? `<button class="btn-remove-timber" data-idx="${index}" title="Eliminar pieza" aria-label="Eliminar pieza">✕</button>` : ''}
      </div>
      <div class="timber-inputs-grid">
        <div class="mini-field-group">
          <label>Espesor (pulg ") </label>
          <input type="number" step="0.25" min="0.25" max="24" class="mini-input" value="${item.thickness}" data-idx="${index}" data-field="thickness" />
        </div>
        <div class="mini-field-group">
          <label>Ancho (pulg ") </label>
          <input type="number" step="0.25" min="0.5" max="36" class="mini-input" value="${item.width}" data-idx="${index}" data-field="width" />
        </div>
        <div class="mini-field-group">
          <label>Largo (metros) </label>
          <input type="number" step="0.1" min="0.5" max="15" class="mini-input" value="${item.length}" data-idx="${index}" data-field="length" />
        </div>
        <div class="mini-field-group">
          <label>Cantidad (u.) </label>
          <input type="number" step="1" min="1" max="1000" class="mini-input" value="${item.qty}" data-idx="${index}" data-field="qty" />
        </div>
      </div>
      <div class="mini-field-group" style="margin-top: 10px;">
        <label>Especie / Tipo de Madera</label>
        <select class="mini-select" data-idx="${index}" data-field="wood">
          ${Object.keys(DENSITIES).map(key => `
            <option value="${key}" ${item.wood === key ? 'selected' : ''}>${DENSITIES[key].name} (~${DENSITIES[key].density} kg/m³)</option>
          `).join('')}
        </select>
      </div>
      <div class="timber-subtotal-bar">
        <span>Subtotal pieza: <strong>${res.boardFeetUnit.toFixed(2)} p² c/u</strong></span>
        <span>Total: <span class="timber-subtotal-val">${res.totalBoardFeet.toFixed(1)} p²</span> (${res.volumeM3.toFixed(3)} m³)</span>
      </div>
    `;
    listEl.appendChild(row);
  });

  updateResults();
}

function updateResults() {
  const tot = calculateTotal();

  // Hero numbers
  const heroBoardFeetEl = document.getElementById('hero-board-feet');
  const heroCostEl = document.getElementById('hero-cost');
  if (heroBoardFeetEl) heroBoardFeetEl.textContent = tot.boardFeetWithWaste.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' p²';
  if (heroCostEl) {
    if (state.pricePerPie > 0) {
      heroCostEl.textContent = '$' + tot.estimatedCost.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } else {
      heroCostEl.textContent = '---';
    }
  }

  // Specs
  const specBaseP2 = document.getElementById('spec-base-p2');
  const specWaste = document.getElementById('spec-waste');
  const specVolume = document.getElementById('spec-volume');
  const specWeight = document.getElementById('spec-weight');
  const specLinear = document.getElementById('spec-linear');
  const specPieces = document.getElementById('spec-pieces');

  if (specBaseP2) specBaseP2.textContent = tot.totalBoardFeet.toFixed(1) + ' p²';
  if (specWaste) specWaste.textContent = `+${state.wastePct}% (${(tot.boardFeetWithWaste - tot.totalBoardFeet).toFixed(1)} p²)`;
  if (specVolume) specVolume.textContent = tot.totalVolumeM3.toFixed(3) + ' m³';
  if (specWeight) specWeight.textContent = Math.round(tot.totalWeightKg) + ' kg';
  if (specLinear) specLinear.textContent = tot.totalLinearMeters.toFixed(1) + ' m';
  if (specPieces) specPieces.textContent = tot.totalPieces + ' unid.';

  // Sticky mobile bar
  const stickyBoardFeet = document.getElementById('sticky-board-feet');
  const stickyCost = document.getElementById('sticky-cost');
  if (stickyBoardFeet) stickyBoardFeet.textContent = tot.boardFeetWithWaste.toFixed(1) + ' p²';
  if (stickyCost) {
    if (state.pricePerPie > 0) {
      stickyCost.textContent = '$' + Math.round(tot.estimatedCost).toLocaleString('es-AR');
    } else {
      stickyCost.textContent = tot.totalPieces + ' piezas';
    }
  }

  saveState();
}

function saveState() {
  try {
    localStorage.setItem('pies_madereros_state', JSON.stringify(state));
  } catch (e) {
    // ignore
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem('pies_madereros_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
        state = parsed;
      }
    }
  } catch (e) {
    // ignore
  }
}

function addTimberItem() {
  const newId = Date.now();
  state.items.push({
    id: newId,
    name: `Pieza #${state.items.length + 1}`,
    thickness: 2,
    width: 6,
    length: 3.5,
    qty: 6,
    wood: 'grandis'
  });
  renderItems();
}

function removeTimberItem(idx) {
  if (state.items.length <= 1) return;
  state.items.splice(idx, 1);
  renderItems();
}

function applyPreset(presetKey) {
  const preset = PRESETS[presetKey];
  if (!preset) return;

  state.items = preset.items.map((it, i) => ({
    id: Date.now() + i,
    ...it
  }));
  renderItems();
}

function shareSummary() {
  const tot = calculateTotal();
  let text = `🪵 Cómputo de Madera - Pies Madereros:\n`;
  text += `---------------------------------\n`;
  state.items.forEach(it => {
    const r = calculateItem(it);
    text += `• ${it.name}: ${it.qty}u de ${it.thickness}"x${it.width}" x ${it.length}m (${r.totalBoardFeet.toFixed(1)} p²)\n`;
  });
  text += `---------------------------------\n`;
  text += `📦 Total neto: ${tot.totalBoardFeet.toFixed(1)} p²\n`;
  text += `📊 Con ${state.wastePct}% desperdicio: ${tot.boardFeetWithWaste.toFixed(1)} p²\n`;
  text += `📐 Volumen: ${tot.totalVolumeM3.toFixed(3)} m³ | Metros lineales: ${tot.totalLinearMeters.toFixed(1)} m\n`;
  text += `⚖️ Peso estimado: ~${Math.round(tot.totalWeightKg)} kg\n`;
  if (state.pricePerPie > 0) {
    text += `💰 Presupuesto estimado: $${tot.estimatedCost.toLocaleString('es-AR', { maximumFractionDigits: 0 })}\n`;
  }
  text += `Calculado en: https://sebiglesias.com.ar/pies-madereros/`;

  if (navigator.share) {
    navigator.share({
      title: 'Cómputo de Pies Madereros',
      text: text,
      url: 'https://sebiglesias.com.ar/pies-madereros/'
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      const shareBtn = document.getElementById('btn-share');
      if (shareBtn) {
        const origText = shareBtn.innerHTML;
        shareBtn.innerHTML = '✓ ¡Copiado al portapapeles!';
        setTimeout(() => {
          shareBtn.innerHTML = origText;
        }, 2500);
      }
    });
  }
}

// Event Listeners initialization
document.addEventListener('DOMContentLoaded', () => {
  loadState();

  const priceInput = document.getElementById('price-per-pie');
  const wasteSelect = document.getElementById('waste-pct');
  if (priceInput) {
    priceInput.value = state.pricePerPie || '';
    priceInput.addEventListener('input', (e) => {
      state.pricePerPie = parseFloat(e.target.value) || 0;
      updateResults();
    });
  }
  if (wasteSelect) {
    wasteSelect.value = state.wastePct || 10;
    wasteSelect.addEventListener('change', (e) => {
      state.wastePct = parseFloat(e.target.value) || 0;
      updateResults();
    });
  }

  // Timber list events delegation
  const listEl = document.getElementById('timber-list');
  if (listEl) {
    listEl.addEventListener('input', (e) => {
      const idx = e.target.getAttribute('data-idx');
      const field = e.target.getAttribute('data-field');
      if (idx !== null && field && state.items[idx]) {
        state.items[idx][field] = e.target.value;
        // update subtotal on the row without full re-render for smooth typing
        const row = e.target.closest('.timber-row-card');
        if (row) {
          const res = calculateItem(state.items[idx]);
          const subtotalBar = row.querySelector('.timber-subtotal-bar');
          if (subtotalBar) {
            subtotalBar.innerHTML = `
              <span>Subtotal pieza: <strong>${res.boardFeetUnit.toFixed(2)} p² c/u</strong></span>
              <span>Total: <span class="timber-subtotal-val">${res.totalBoardFeet.toFixed(1)} p²</span> (${res.volumeM3.toFixed(3)} m³)</span>
            `;
          }
        }
        updateResults();
      }
    });

    listEl.addEventListener('change', (e) => {
      const idx = e.target.getAttribute('data-idx');
      const field = e.target.getAttribute('data-field');
      if (idx !== null && field && state.items[idx]) {
        state.items[idx][field] = e.target.value;
        renderItems();
      }
    });

    listEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-remove-timber')) {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        removeTimberItem(idx);
      }
    });
  }

  // Add timber item button
  const btnAdd = document.getElementById('btn-add-timber');
  if (btnAdd) {
    btnAdd.addEventListener('click', addTimberItem);
  }

  // Presets
  document.querySelectorAll('.preset-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.getAttribute('data-preset');
      if (p) applyPreset(p);
    });
  });

  // Share & Print
  const shareBtn = document.getElementById('btn-share');
  if (shareBtn) shareBtn.addEventListener('click', shareSummary);

  const printBtn = document.getElementById('btn-print');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  const stickyBtn = document.getElementById('sticky-share-btn');
  if (stickyBtn) stickyBtn.addEventListener('click', shareSummary);

  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeBtn.textContent = currentTheme === 'light' ? '🌙' : '☀️';

    themeBtn.addEventListener('click', () => {
      const now = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', now);
      localStorage.setItem('theme', now);
      themeBtn.textContent = now === 'light' ? '🌙' : '☀️';
    });
  }

  renderItems();

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
