/**
 * User appearance personalization: theme mode, accent colour (presets + custom),
 * background surface tone, font size scale, and font family style.
 */

const STORAGE_KEY = 'campusride-appearance';

export const DEFAULT_APPEARANCE = {
  theme: 'light',
  accentPreset: 'teal',
  customColor: '#1e5b63',
  surfaceTone: 'warm',
  fontSize: 'default',
  fontStyle: 'sans',
};

export const ACCENT_PRESETS = {
  teal: { label: 'Slate Teal', light: '#1e5b63', dark: '#4ea1ac' },
  indigo: { label: 'Indigo', light: '#3b4c8a', dark: '#8093e8' },
  sage: { label: 'Forest Sage', light: '#285e47', dark: '#54b48c' },
  terracotta: { label: 'Terracotta', light: '#8b4630', dark: '#d9896c' },
  graphite: { label: 'Graphite', light: '#27272a', dark: '#a1a1aa' },
};

export const SURFACE_TONES = {
  warm: {
    label: 'Warm',
    lightBg: '#f8f8f7',
    lightSurface: '#ffffff',
    lightSubtle: '#f1f1ef',
    darkBg: '#0e1114',
    darkSurface: '#151a1f',
    darkSubtle: '#1c2229',
  },
  crisp: {
    label: 'Crisp',
    lightBg: '#ffffff',
    lightSurface: '#ffffff',
    lightSubtle: '#f4f4f5',
    darkBg: '#09090b',
    darkSurface: '#111114',
    darkSubtle: '#18181b',
  },
  cool: {
    label: 'Cool',
    lightBg: '#f3f6f9',
    lightSurface: '#ffffff',
    lightSubtle: '#e9eef4',
    darkBg: '#0b1017',
    darkSurface: '#121923',
    darkSubtle: '#1a2330',
  },
  sand: {
    label: 'Sand',
    lightBg: '#f5f2eb',
    lightSurface: '#fdfcf9',
    lightSubtle: '#ece7dc',
    darkBg: '#141210',
    darkSurface: '#1c1916',
    darkSubtle: '#26221d',
  },
};

export const FONT_SIZES = {
  small: { label: 'S', title: 'Compact', scale: 0.9 },
  default: { label: 'M', title: 'Default', scale: 1.0 },
  large: { label: 'L', title: 'Comfortable', scale: 1.1 },
  xlarge: { label: 'XL', title: 'Large', scale: 1.2 },
};

export const FONT_STYLES = {
  sans: {
    label: 'Clean Sans',
    family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  rounded: {
    label: 'Geometric',
    family: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  serif: {
    label: 'Editorial',
    family: "'Newsreader', Georgia, 'Times New Roman', serif",
  },
  mono: {
    label: 'Monospace',
    family: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  },
};

function hexToRgb(hex) {
  const clean = String(hex || '').replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return { r: 30, g: 91, b: 99 };
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * Lightens (amount > 0) or darkens (amount < 0) a hex colour for hover states.
 */
function shiftHex(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  if (amount >= 0) {
    return rgbToHex({
      r: r + (255 - r) * amount,
      g: g + (255 - g) * amount,
      b: b + (255 - b) * amount,
    });
  }
  const factor = 1 + amount;
  return rgbToHex({ r: r * factor, g: g * factor, b: b * factor });
}

/**
 * Picks dark or white text over an accent background to preserve contrast.
 */
function getReadableAccentText(hex) {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return lum > 0.38 ? '#0f172a' : '#ffffff';
}

export function loadAppearance() {
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APPEARANCE };
    const parsed = JSON.parse(raw);
    return {
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      accentPreset:
        parsed.accentPreset === 'custom' || ACCENT_PRESETS[parsed.accentPreset]
          ? parsed.accentPreset
          : DEFAULT_APPEARANCE.accentPreset,
      customColor: /^#[0-9a-fA-F]{6}$/.test(parsed.customColor)
        ? parsed.customColor
        : DEFAULT_APPEARANCE.customColor,
      surfaceTone: SURFACE_TONES[parsed.surfaceTone]
        ? parsed.surfaceTone
        : DEFAULT_APPEARANCE.surfaceTone,
      fontSize: FONT_SIZES[parsed.fontSize]
        ? parsed.fontSize
        : DEFAULT_APPEARANCE.fontSize,
      fontStyle: FONT_STYLES[parsed.fontStyle]
        ? parsed.fontStyle
        : DEFAULT_APPEARANCE.fontStyle,
    };
  } catch {
    return { ...DEFAULT_APPEARANCE };
  }
}

export function saveAppearance(prefs) {
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export function applyAppearance(prefs) {
  const root = document.documentElement;
  const isDark = prefs.theme === 'dark';

  root.setAttribute('data-theme', isDark ? 'dark' : 'light');

  // Surface / background tone
  const tone = SURFACE_TONES[prefs.surfaceTone] || SURFACE_TONES.warm;
  root.style.setProperty('--bg', isDark ? tone.darkBg : tone.lightBg);
  root.style.setProperty('--surface', isDark ? tone.darkSurface : tone.lightSurface);
  root.style.setProperty('--surface-subtle', isDark ? tone.darkSubtle : tone.lightSubtle);

  // Accent colour
  let accentHex = prefs.customColor;
  if (prefs.accentPreset !== 'custom') {
    const preset = ACCENT_PRESETS[prefs.accentPreset] || ACCENT_PRESETS.teal;
    accentHex = isDark ? preset.dark : preset.light;
  }
  const { r, g, b } = hexToRgb(accentHex);
  const hoverHex = isDark ? shiftHex(accentHex, 0.14) : shiftHex(accentHex, -0.18);

  root.style.setProperty('--accent', accentHex);
  root.style.setProperty('--accent-hover', hoverHex);
  root.style.setProperty('--accent-text', getReadableAccentText(accentHex));
  root.style.setProperty('--accent-soft', `rgba(${r}, ${g}, ${b}, ${isDark ? 0.15 : 0.09})`);
  root.style.setProperty('--accent-border', `rgba(${r}, ${g}, ${b}, ${isDark ? 0.34 : 0.24})`);

  // Font size & style
  const sizeObj = FONT_SIZES[prefs.fontSize] || FONT_SIZES.default;
  const styleObj = FONT_STYLES[prefs.fontStyle] || FONT_STYLES.sans;
  root.style.setProperty('--font-scale', String(sizeObj.scale));
  root.style.setProperty('--font-family', styleObj.family);
}

/**
 * Mounts and manages the header Appearance personalization popover.
 */
export function initAppearanceControls(triggerBtn, popoverEl) {
  if (!triggerBtn || !popoverEl) return;

  let prefs = loadAppearance();
  applyAppearance(prefs);

  function update(patch) {
    prefs = { ...prefs, ...patch };
    applyAppearance(prefs);
    saveAppearance(prefs);
    renderPopover();
  }

  function renderPopover() {
    const accentButtons = Object.entries(ACCENT_PRESETS)
      .map(([key, item]) => {
        const swatchColor = prefs.theme === 'dark' ? item.dark : item.light;
        const active = prefs.accentPreset === key;
        return `
          <button
            type="button"
            class="swatch-btn ${active ? 'is-active' : ''}"
            data-accent="${key}"
            aria-label="${item.label}"
            title="${item.label}"
            style="--swatch: ${swatchColor};"
          ></button>
        `;
      })
      .join('');

    const surfaceButtons = Object.entries(SURFACE_TONES)
      .map(([key, item]) => {
        const active = prefs.surfaceTone === key;
        const previewColor = prefs.theme === 'dark' ? item.darkBg : item.lightBg;
        return `
          <button
            type="button"
            class="tone-btn ${active ? 'is-active' : ''}"
            data-surface="${key}"
          >
            <span class="tone-dot" style="background-color: ${previewColor};"></span>
            <span>${item.label}</span>
          </button>
        `;
      })
      .join('');

    const sizeButtons = Object.entries(FONT_SIZES)
      .map(([key, item]) => {
        const active = prefs.fontSize === key;
        return `
          <button
            type="button"
            class="seg-btn ${active ? 'is-active' : ''}"
            data-fontsize="${key}"
            title="${item.title}"
          >${item.label}</button>
        `;
      })
      .join('');

    const styleButtons = Object.entries(FONT_STYLES)
      .map(([key, item]) => {
        const active = prefs.fontStyle === key;
        return `
          <button
            type="button"
            class="style-btn ${active ? 'is-active' : ''}"
            data-fontstyle="${key}"
            style="font-family: ${item.family};"
          >${item.label}</button>
        `;
      })
      .join('');

    popoverEl.innerHTML = `
      <div class="popover-header">
        <span class="popover-title">Personalize</span>
        <button type="button" class="popover-reset" id="appearance-reset">Reset</button>
      </div>

      <div class="popover-section">
        <div class="popover-label">Mode</div>
        <div class="segmented">
          <button type="button" class="seg-btn ${prefs.theme === 'light' ? 'is-active' : ''}" data-theme-choice="light">Light</button>
          <button type="button" class="seg-btn ${prefs.theme === 'dark' ? 'is-active' : ''}" data-theme-choice="dark">Dark</button>
        </div>
      </div>

      <div class="popover-section">
        <div class="popover-label">Accent colour</div>
        <div class="swatch-row">
          ${accentButtons}
          <label class="swatch-custom ${prefs.accentPreset === 'custom' ? 'is-active' : ''}" title="Pick custom colour">
            <input type="color" id="appearance-custom-color" value="${prefs.customColor}" aria-label="Custom accent colour" />
            <span class="swatch-custom-ring" style="--swatch: ${prefs.customColor};"></span>
          </label>
        </div>
      </div>

      <div class="popover-section">
        <div class="popover-label">Background tone</div>
        <div class="tone-grid">
          ${surfaceButtons}
        </div>
      </div>

      <div class="popover-section">
        <div class="popover-label">Font size</div>
        <div class="segmented">
          ${sizeButtons}
        </div>
      </div>

      <div class="popover-section">
        <div class="popover-label">Font style</div>
        <div class="style-grid">
          ${styleButtons}
        </div>
      </div>
    `;

    popoverEl.querySelectorAll('[data-theme-choice]').forEach((btn) => {
      btn.addEventListener('click', () => update({ theme: btn.getAttribute('data-theme-choice') }));
    });

    popoverEl.querySelectorAll('[data-accent]').forEach((btn) => {
      btn.addEventListener('click', () =>
        update({ accentPreset: btn.getAttribute('data-accent') })
      );
    });

    const colorInput = popoverEl.querySelector('#appearance-custom-color');
    colorInput?.addEventListener('input', (e) => {
      prefs = { ...prefs, accentPreset: 'custom', customColor: e.target.value };
      applyAppearance(prefs);
      saveAppearance(prefs);
      // Update ring without destroying active color picker dialog
      const ring = popoverEl.querySelector('.swatch-custom-ring');
      if (ring) ring.style.setProperty('--swatch', e.target.value);
      popoverEl.querySelectorAll('[data-accent]').forEach((b) => b.classList.remove('is-active'));
      popoverEl.querySelector('.swatch-custom')?.classList.add('is-active');
    });

    popoverEl.querySelectorAll('[data-surface]').forEach((btn) => {
      btn.addEventListener('click', () =>
        update({ surfaceTone: btn.getAttribute('data-surface') })
      );
    });

    popoverEl.querySelectorAll('[data-fontsize]').forEach((btn) => {
      btn.addEventListener('click', () =>
        update({ fontSize: btn.getAttribute('data-fontsize') })
      );
    });

    popoverEl.querySelectorAll('[data-fontstyle]').forEach((btn) => {
      btn.addEventListener('click', () =>
        update({ fontStyle: btn.getAttribute('data-fontstyle') })
      );
    });

    popoverEl.querySelector('#appearance-reset')?.addEventListener('click', () => {
      update({ ...DEFAULT_APPEARANCE });
    });
  }

  function setOpen(open) {
    popoverEl.hidden = !open;
    triggerBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    triggerBtn.classList.toggle('is-active', open);
    if (open) renderPopover();
  }

  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(popoverEl.hidden);
  });

  popoverEl.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.addEventListener('click', () => {
    if (!popoverEl.hidden) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !popoverEl.hidden) {
      setOpen(false);
      triggerBtn.focus();
    }
  });
}
