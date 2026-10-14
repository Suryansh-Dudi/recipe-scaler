/**
 * Recipe Scaler - Pure Vanilla JavaScript Engine
 * Handles recipe scaling math, validation, persistent storage, theme toggle, and non-negative input constraints.
 */

(function () {
  'use strict';

  // --- LocalStorage Keys ---
  const STORAGE_KEY = 'recipe_scaler_state_v1';
  const THEME_KEY = 'recipe_scaler_theme_v1';

  // --- DOM Elements ---
  const dishNameInput = document.getElementById('dishName');
  const originalServingsInput = document.getElementById('originalServings');
  const targetServingsInput = document.getElementById('targetServings');
  const scaleMultiplierBadge = document.getElementById('scaleMultiplierBadge');

  const ing1Name = document.getElementById('ing1_name');
  const ing1Amount = document.getElementById('ing1_amount');
  const ing1Unit = document.getElementById('ing1_unit');

  const ing2Name = document.getElementById('ing2_name');
  const ing2Amount = document.getElementById('ing2_amount');
  const ing2Unit = document.getElementById('ing2_unit');

  const ing3Name = document.getElementById('ing3_name');
  const ing3Amount = document.getElementById('ing3_amount');
  const ing3Unit = document.getElementById('ing3_unit');

  const numericInputs = [
    originalServingsInput,
    targetServingsInput,
    ing1Amount,
    ing2Amount,
    ing3Amount
  ];

  const scaleButton = document.getElementById('scaleButton');
  const resetButton = document.getElementById('resetButton');
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeLabel = document.getElementById('themeLabel');

  const errorMessageBanner = document.getElementById('errorMessageBanner');
  const errorText = document.getElementById('errorText');
  const resultsCard = document.getElementById('resultsCard');
  const emptyResultsState = document.getElementById('emptyResultsState');
  const activeResultsState = document.getElementById('activeResultsState');

  const resultDishTitle = document.getElementById('resultDishTitle');
  const resultScaleMeta = document.getElementById('resultScaleMeta');
  const resultScaleBadge = document.getElementById('resultScaleBadge');
  const resultsContainer = document.getElementById('resultsContainer');
  const copyRecipeBtn = document.getElementById('copyRecipeBtn');
  const copyToast = document.getElementById('copyToast');

  // History DOM Elements
  const historyListContainer = document.getElementById('historyListContainer');
  const historyEmptyState = document.getElementById('historyEmptyState');
  const historyCountBadge = document.getElementById('historyCountBadge');
  const clearAllHistoryBtn = document.getElementById('clearAllHistoryBtn');
  const HISTORY_STORAGE_KEY = 'recipe_scaler_history_v1';

  // --- Presets Data ---
  const PRESETS = {
    pancakes: {
      dish: 'Fluffy Buttermilk Pancakes',
      originalServings: 4,
      targetServings: 8,
      ingredients: [
        { name: 'All-Purpose Flour', amount: 200, unit: 'g' },
        { name: 'Whole Milk', amount: 300, unit: 'ml' },
        { name: 'Granulated Sugar', amount: 50, unit: 'g' }
      ]
    },
    cookies: {
      dish: 'Classic Chocolate Chip Cookies',
      originalServings: 12,
      targetServings: 24,
      ingredients: [
        { name: 'Unsalted Butter', amount: 220, unit: 'g' },
        { name: 'Brown Sugar', amount: 180, unit: 'g' },
        { name: 'Semi-Sweet Chocolate Chips', amount: 250, unit: 'g' }
      ]
    },
    doughnuts: {
      dish: 'Glazed Yeast Doughnuts',
      originalServings: 6,
      targetServings: 12,
      ingredients: [
        { name: 'Bread Flour', amount: 350, unit: 'g' },
        { name: 'Whole Milk', amount: 180, unit: 'ml' },
        { name: 'Granulated Sugar', amount: 50, unit: 'g' }
      ]
    },
    carbonara: {
      dish: 'Roman Spaghetti Carbonara',
      originalServings: 2,
      targetServings: 6,
      ingredients: [
        { name: 'Spaghetti Pasta', amount: 200, unit: 'g' },
        { name: 'Guanciale / Pancetta', amount: 100, unit: 'g' },
        { name: 'Pecorino Romano Cheese', amount: 60, unit: 'g' }
      ]
    },
    crepes: {
      dish: 'Classic French Crepes',
      originalServings: 4,
      targetServings: 8,
      ingredients: [
        { name: 'All-Purpose Flour', amount: 250, unit: 'g' },
        { name: 'Whole Milk', amount: 500, unit: 'ml' },
        { name: 'Melted Butter', amount: 50, unit: 'g' }
      ]
    },
    cinnamonrolls: {
      dish: 'Bakery Cinnamon Rolls',
      originalServings: 8,
      targetServings: 16,
      ingredients: [
        { name: 'All-Purpose Flour', amount: 450, unit: 'g' },
        { name: 'Warm Milk', amount: 240, unit: 'ml' },
        { name: 'Brown Sugar', amount: 100, unit: 'g' }
      ]
    }
  };

  // --- Acceptance Test Definitions ---
  const ACCEPTANCE_TESTS = [
    {
      id: 'TC-01',
      title: 'Standard Double Scale (2×)',
      makes: 4,
      wanted: 8,
      ingredients: [
        { name: 'Flour', amount: 200, unit: 'g' },
        { name: 'Milk', amount: 300, unit: 'ml' },
        { name: 'Sugar', amount: 50, unit: 'g' }
      ],
      expectedValid: true,
      expectedAmounts: [400, 600, 100]
    },
    {
      id: 'TC-02',
      title: 'Halving / Downscaling (0.5×)',
      makes: 8,
      wanted: 4,
      ingredients: [
        { name: 'Sugar', amount: 250, unit: 'g' },
        { name: 'Cocoa Powder', amount: 100, unit: 'g' },
        { name: 'Butter', amount: 200, unit: 'g' }
      ],
      expectedValid: true,
      expectedAmounts: [125, 50, 100]
    },
    {
      id: 'TC-03',
      title: 'Fractional Ratio (1.5×)',
      makes: 2,
      wanted: 3,
      ingredients: [
        { name: 'Pasta', amount: 160, unit: 'g' },
        { name: 'Tomato Sauce', amount: 240, unit: 'g' },
        { name: 'Olive Oil', amount: 20, unit: 'ml' }
      ],
      expectedValid: true,
      expectedAmounts: [240, 360, 30]
    },
    {
      id: 'TC-04',
      title: 'Decimal Input Quantities (3×)',
      makes: 2,
      wanted: 6,
      ingredients: [
        { name: 'Olive Oil', amount: 2.5, unit: 'tbsp' },
        { name: 'Balsamic Vinegar', amount: 1.25, unit: 'tbsp' },
        { name: 'Dijon Mustard', amount: 0.5, unit: 'tsp' }
      ],
      expectedValid: true,
      expectedAmounts: [7.5, 3.75, 1.5]
    },
    {
      id: 'TC-05',
      title: 'Single Serving Upscale (5×)',
      makes: 1,
      wanted: 5,
      ingredients: [
        { name: 'Rolled Oats', amount: 50, unit: 'g' },
        { name: 'Chia Seeds', amount: 10, unit: 'g' },
        { name: 'Almond Milk', amount: 120, unit: 'ml' }
      ],
      expectedValid: true,
      expectedAmounts: [250, 50, 600]
    },
    {
      id: 'TC-06',
      title: 'Identity Scaling (1×)',
      makes: 6,
      wanted: 6,
      ingredients: [
        { name: 'Broth', amount: 1000, unit: 'ml' },
        { name: 'Carrots', amount: 3, unit: 'pcs' },
        { name: 'Potatoes', amount: 4, unit: 'pcs' }
      ],
      expectedValid: true,
      expectedAmounts: [1000, 3, 4]
    },
    {
      id: 'TC-07',
      title: 'Odd Ratio Division (1.667×)',
      makes: 3,
      wanted: 5,
      ingredients: [
        { name: 'Arborio Rice', amount: 300, unit: 'g' },
        { name: 'Stock', amount: 900, unit: 'ml' },
        { name: 'Parmesan', amount: 60, unit: 'g' }
      ],
      expectedValid: true,
      expectedAmounts: [500, 1500, 100]
    },
    {
      id: 'TC-08',
      title: 'Edge/Invalid: Zero Recipe Servings',
      makes: 0,
      wanted: 4,
      ingredients: [{ name: 'A', amount: 10, unit: 'g' }, { name: 'B', amount: 20, unit: 'g' }, { name: 'C', amount: 30, unit: 'g' }],
      expectedValid: false,
      expectedAmounts: null
    },
    {
      id: 'TC-09',
      title: 'Edge/Invalid: Negative Desired Servings',
      makes: 4,
      wanted: -2,
      ingredients: [{ name: 'A', amount: 10, unit: 'g' }, { name: 'B', amount: 20, unit: 'g' }, { name: 'C', amount: 30, unit: 'g' }],
      expectedValid: false,
      expectedAmounts: null
    },
    {
      id: 'TC-10',
      title: 'Edge/Invalid: Empty Servings Field',
      makes: '',
      wanted: 4,
      ingredients: [{ name: 'A', amount: 10, unit: 'g' }, { name: 'B', amount: 20, unit: 'g' }, { name: 'C', amount: 30, unit: 'g' }],
      expectedValid: false,
      expectedAmounts: null
    }
  ];

  // --- Strict Non-Negative & No 'e' / Negative Input Restrictions ---

  function handleNumericKeydown(e) {
    if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
      e.preventDefault();
      return false;
    }
  }

  function handleNumericInputSanitize(e) {
    const input = e.target;
    if (!input) return;

    let val = input.value;
    const cleaned = val.replace(/[-eE+]/g, '');
    if (cleaned !== val) {
      input.value = cleaned;
      val = cleaned;
    }

    const num = parseFloat(val);
    if (!isNaN(num) && num < 0) {
      input.value = '';
    }
    saveState(false);
  }

  function handleNumericPaste(e) {
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    if (/[-eE+]/.test(paste)) {
      e.preventDefault();
      const sanitized = paste.replace(/[-eE+]/g, '');
      const num = parseFloat(sanitized);
      if (!isNaN(num) && num >= 0) {
        document.execCommand('insertText', false, sanitized);
      }
    }
  }

  // --- Utility Functions ---

  function formatAmount(num) {
    if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
      return '0';
    }
    const rounded = Math.round(num * 1000) / 1000;
    if (Number.isInteger(rounded)) {
      return rounded.toString();
    }
    const formatted = parseFloat(rounded.toFixed(2));
    return formatted.toString();
  }

  function getFractionHint(num) {
    if (typeof num !== 'number' || isNaN(num) || !isFinite(num) || num <= 0) {
      return '';
    }
    const whole = Math.floor(num);
    const frac = num - whole;
    const tolerance = 0.035;

    const commonFractions = [
      { val: 0.125, text: '1/8' },
      { val: 0.25, text: '1/4' },
      { val: 0.333, text: '1/3' },
      { val: 0.375, text: '3/8' },
      { val: 0.5, text: '1/2' },
      { val: 0.625, text: '5/8' },
      { val: 0.667, text: '2/3' },
      { val: 0.75, text: '3/4' },
      { val: 0.875, text: '7/8' }
    ];

    for (const f of commonFractions) {
      if (Math.abs(frac - f.val) < tolerance) {
        return whole > 0 ? `(${whole} ${f.text})` : `(${f.text})`;
      }
    }
    return '';
  }

  function validateServings(origInput, targetInput) {
    const origStr = String(origInput).trim();
    const targetStr = String(targetInput).trim();

    if (origStr === '') {
      return {
        valid: false,
        message: 'The recipe servings field cannot be empty. Please enter a valid number of servings.'
      };
    }

    const origNum = parseFloat(origStr);
    if (isNaN(origNum)) {
      return {
        valid: false,
        message: 'The recipe servings must be a valid number.'
      };
    }

    if (origNum <= 0) {
      return {
        valid: false,
        message: 'The recipe servings must be greater than zero (positive number).'
      };
    }

    if (targetStr === '') {
      return {
        valid: false,
        message: 'The desired servings field cannot be empty. Please enter the number of servings you want.'
      };
    }

    const targetNum = parseFloat(targetStr);
    if (isNaN(targetNum)) {
      return {
        valid: false,
        message: 'The desired servings must be a valid number.'
      };
    }

    if (targetNum <= 0) {
      return {
        valid: false,
        message: 'The desired servings must be greater than zero (positive number).'
      };
    }

    return {
      valid: true,
      originalServings: origNum,
      targetServings: targetNum,
      scaleFactor: targetNum / origNum
    };
  }

  function calculateScaledRecipe(recipeServings, wantedServings, ingredients) {
    const validation = validateServings(recipeServings, wantedServings);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.message,
        results: null
      };
    }

    const scaleFactor = validation.scaleFactor;
    const scaledIngredients = ingredients.map((item, index) => {
      const origAmount = parseFloat(item.amount);
      const safeOrigAmount = isNaN(origAmount) ? 0 : Math.max(0, origAmount);
      const newAmount = (safeOrigAmount * validation.targetServings) / validation.originalServings;
      
      return {
        index: index + 1,
        name: (item.name || `Ingredient ${index + 1}`).trim(),
        unit: (item.unit || '').trim(),
        originalAmount: safeOrigAmount,
        newAmount: newAmount,
        formattedOriginal: formatAmount(safeOrigAmount),
        formattedNew: formatAmount(newAmount),
        fractionHint: getFractionHint(newAmount)
      };
    });

    return {
      success: true,
      error: null,
      scaleFactor: scaleFactor,
      originalServings: validation.originalServings,
      targetServings: validation.targetServings,
      ingredients: scaledIngredients
    };
  }

  // --- UI Update & Error Handling ---

  function showError(msg) {
    errorText.textContent = msg;
    errorMessageBanner.classList.remove('hidden');
    activeResultsState.classList.add('hidden');
    emptyResultsState.classList.remove('hidden');
    resultsContainer.innerHTML = '';
  }

  function clearError() {
    errorMessageBanner.classList.add('hidden');
    errorText.textContent = '';
  }

  function updateLiveScaleMultiplier() {
    const orig = parseFloat(originalServingsInput.value);
    const target = parseFloat(targetServingsInput.value);
    if (!isNaN(orig) && orig > 0 && !isNaN(target) && target > 0) {
      const factor = (target / orig);
      const formatted = factor % 1 === 0 ? factor.toFixed(0) : factor.toFixed(2);
      scaleMultiplierBadge.textContent = `Scale: ${formatted}×`;
      scaleMultiplierBadge.classList.remove('hidden');
    } else {
      scaleMultiplierBadge.classList.add('hidden');
    }
  }

  function renderResults(calculationResult, dishName) {
    const cleanDish = (dishName || '').trim() || 'Custom Recipe';
    resultDishTitle.textContent = cleanDish;

    const factorFormatted = calculationResult.scaleFactor % 1 === 0
      ? calculationResult.scaleFactor.toFixed(0)
      : calculationResult.scaleFactor.toFixed(2);

    resultScaleBadge.textContent = `${factorFormatted}× Multiplier`;
    resultScaleMeta.textContent = `Rescaled from ${calculationResult.originalServings} to ${calculationResult.targetServings} servings`;

    resultsContainer.innerHTML = '';

    calculationResult.ingredients.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'result-item';

      const unitText = item.unit ? ` ${escapeHTML(item.unit)}` : '';
      const fractionBadge = item.fractionHint ? ` <span class="fraction-hint">${item.fractionHint}</span>` : '';

      itemEl.innerHTML = `
        <div class="result-item-main">
          <div class="result-item-name">${escapeHTML(item.name)}</div>
          <div class="result-item-formula">
            Formula: ${item.formattedOriginal}${unitText} × (${calculationResult.targetServings} / ${calculationResult.originalServings})
          </div>
        </div>
        <div class="result-item-amount">
          <div class="scaled-value">
            ${item.formattedNew}<span class="scaled-unit">${unitText}</span>${fractionBadge}
          </div>
          <div class="original-reference">Original: ${item.formattedOriginal}${unitText}</div>
        </div>
      `;

      resultsContainer.appendChild(itemEl);
    });

    emptyResultsState.classList.add('hidden');
    activeResultsState.classList.remove('hidden');
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- State Persistence (LocalStorage) ---

  function getFormIngredients() {
    return [
      {
        name: ing1Name.value,
        amount: ing1Amount.value,
        unit: ing1Unit.value
      },
      {
        name: ing2Name.value,
        amount: ing2Amount.value,
        unit: ing2Unit.value
      },
      {
        name: ing3Name.value,
        amount: ing3Amount.value,
        unit: ing3Unit.value
      }
    ];
  }

  function saveState(hasCalculated) {
    const state = {
      dishName: dishNameInput.value,
      originalServings: originalServingsInput.value,
      targetServings: targetServingsInput.value,
      ingredients: getFormIngredients(),
      hasCalculated: Boolean(hasCalculated),
      timestamp: Date.now()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage unavailable or quota exceeded:', e);
    }
  }

  function restoreState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        dishNameInput.value = '';
        originalServingsInput.value = '';
        targetServingsInput.value = '';
        ing1Name.value = '';
        ing1Amount.value = '';
        ing1Unit.value = '';
        ing2Name.value = '';
        ing2Amount.value = '';
        ing2Unit.value = '';
        ing3Name.value = '';
        ing3Amount.value = '';
        ing3Unit.value = '';
        updateLiveScaleMultiplier();
        activeResultsState.classList.add('hidden');
        emptyResultsState.classList.remove('hidden');
        resultsContainer.innerHTML = '';
        return;
      }

      const state = JSON.parse(raw);
      if (!state) {
        updateLiveScaleMultiplier();
        return;
      }

      dishNameInput.value = (typeof state.dishName === 'string') ? state.dishName : '';
      originalServingsInput.value = (state.originalServings !== undefined && state.originalServings !== null && String(state.originalServings).trim() !== '') ? String(state.originalServings) : '';
      targetServingsInput.value = (state.targetServings !== undefined && state.targetServings !== null && String(state.targetServings).trim() !== '') ? String(state.targetServings) : '';

      const ing = Array.isArray(state.ingredients) ? state.ingredients : [];

      ing1Name.value = (ing[0] && typeof ing[0].name === 'string') ? ing[0].name : '';
      ing1Amount.value = (ing[0] && ing[0].amount !== undefined && ing[0].amount !== null && String(ing[0].amount).trim() !== '') ? String(ing[0].amount) : '';
      ing1Unit.value = (ing[0] && typeof ing[0].unit === 'string') ? ing[0].unit : '';

      ing2Name.value = (ing[1] && typeof ing[1].name === 'string') ? ing[1].name : '';
      ing2Amount.value = (ing[1] && ing[1].amount !== undefined && ing[1].amount !== null && String(ing[1].amount).trim() !== '') ? String(ing[1].amount) : '';
      ing2Unit.value = (ing[1] && typeof ing[1].unit === 'string') ? ing[1].unit : '';

      ing3Name.value = (ing[2] && typeof ing[2].name === 'string') ? ing[2].name : '';
      ing3Amount.value = (ing[2] && ing[2].amount !== undefined && ing[2].amount !== null && String(ing[2].amount).trim() !== '') ? String(ing[2].amount) : '';
      ing3Unit.value = (ing[2] && typeof ing[2].unit === 'string') ? ing[2].unit : '';

      updateLiveScaleMultiplier();

      const hasValidServings = originalServingsInput.value.trim() !== '' &&
                               targetServingsInput.value.trim() !== '' &&
                               parseFloat(originalServingsInput.value) > 0 &&
                               parseFloat(targetServingsInput.value) > 0;

      if (state.hasCalculated && hasValidServings) {
        handleScaleAction(false);
      } else {
        activeResultsState.classList.add('hidden');
        emptyResultsState.classList.remove('hidden');
        resultsContainer.innerHTML = '';
      }
    } catch (err) {
      console.error('Error restoring state from localStorage:', err);
    }
  }

  // --- Scaling Execution Handler ---

  function handleScaleAction(shouldSave = true) {
    clearError();

    const recipeServings = originalServingsInput.value;
    const wantedServings = targetServingsInput.value;
    const ingredients = getFormIngredients();

    const result = calculateScaledRecipe(recipeServings, wantedServings, ingredients);

    if (!result.success) {
      showError(result.error);
      if (shouldSave) {
        saveState(false);
      }
      return;
    }

    renderResults(result, dishNameInput.value);
    if (shouldSave) {
      saveState(true);
      addHistoryItem(result, dishNameInput.value, ingredients);
    }
  }

  // --- Reset Handler ---

  function handleReset() {
    clearError();
    dishNameInput.value = '';
    originalServingsInput.value = '';
    targetServingsInput.value = '';

    ing1Name.value = '';
    ing1Amount.value = '';
    ing1Unit.value = '';

    ing2Name.value = '';
    ing2Amount.value = '';
    ing2Unit.value = '';

    ing3Name.value = '';
    ing3Amount.value = '';
    ing3Unit.value = '';

    updateLiveScaleMultiplier();
    activeResultsState.classList.add('hidden');
    emptyResultsState.classList.remove('hidden');
    resultsContainer.innerHTML = '';

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }

  // --- Preset Loader ---

  function loadPreset(presetKey, andScale = true) {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    clearError();
    dishNameInput.value = preset.dish;
    originalServingsInput.value = preset.originalServings;
    targetServingsInput.value = preset.targetServings;

    if (preset.ingredients[0]) {
      ing1Name.value = preset.ingredients[0].name;
      ing1Amount.value = preset.ingredients[0].amount;
      ing1Unit.value = preset.ingredients[0].unit;
    }
    if (preset.ingredients[1]) {
      ing2Name.value = preset.ingredients[1].name;
      ing2Amount.value = preset.ingredients[1].amount;
      ing2Unit.value = preset.ingredients[1].unit;
    }
    if (preset.ingredients[2]) {
      ing3Name.value = preset.ingredients[2].name;
      ing3Amount.value = preset.ingredients[2].amount;
      ing3Unit.value = preset.ingredients[2].unit;
    }

    updateLiveScaleMultiplier();

    if (andScale) {
      handleScaleAction(true);
    } else {
      saveState(false);
    }
  }

  // --- Copy Scaled Recipe to Clipboard ---

  function handleCopyRecipe() {
    const dish = dishNameInput.value.trim() || 'Scaled Recipe';
    const origServings = originalServingsInput.value;
    const targetServings = targetServingsInput.value;

    const result = calculateScaledRecipe(origServings, targetServings, getFormIngredients());
    if (!result.success) return;

    let text = `${dish}\n`;
    text += `Portions: ${targetServings} servings (Scaled from ${origServings} servings, ${result.scaleFactor.toFixed(2)}x)\n\n`;
    text += `Ingredients:\n`;

    result.ingredients.forEach(item => {
      const unit = item.unit ? ` ${item.unit}` : '';
      const frac = item.fractionHint ? ` ${item.fractionHint}` : '';
      text += `• ${item.formattedNew}${unit}${frac} ${item.name}\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      copyToast.classList.add('show');
      setTimeout(() => {
        copyToast.classList.remove('show');
      }, 2400);
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      copyToast.classList.add('show');
      setTimeout(() => {
        copyToast.classList.remove('show');
      }, 2400);
    });
  }

  // --- Light & Dark Theme Management ---

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    themeToggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
    themeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';

    if (isDark) {
      themeIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
    } else {
      themeIcon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
    }

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // ignore
    }
  }

  function initTheme() {
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem(THEME_KEY);
    } catch (e) {
      // ignore
    }

    if (savedTheme === 'dark' || savedTheme === 'light') {
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  }

  // --- Background Acceptance Tests Runner ---

  function runAcceptanceTestsSilently() {
    let passedCount = 0;
    const totalCount = ACCEPTANCE_TESTS.length;
    const testResults = [];

    ACCEPTANCE_TESTS.forEach(testCase => {
      const result = calculateScaledRecipe(testCase.makes, testCase.wanted, testCase.ingredients);
      let passed = false;

      if (!testCase.expectedValid) {
        passed = (result.success === false && typeof result.error === 'string' && result.error.length > 0);
      } else {
        if (result.success && result.ingredients && result.ingredients.length === testCase.expectedAmounts.length) {
          const allMatch = result.ingredients.every((ing, idx) => {
            const expected = testCase.expectedAmounts[idx];
            return Math.abs(ing.newAmount - expected) < 0.001;
          });
          passed = allMatch;
        }
      }

      if (passed) passedCount++;
      testResults.push({ id: testCase.id, title: testCase.title, passed });
    });

    console.info(`[Recipe Scaler] Background acceptance tests executed: ${passedCount}/${totalCount} passed.`);
    return { passedCount, totalCount, details: testResults };
  }

  window.runAcceptanceTests = runAcceptanceTestsSilently;

  // --- Event Listeners Setup ---

  function setupEventListeners() {
    scaleButton.addEventListener('click', () => handleScaleAction(true));
    resetButton.addEventListener('click', handleReset);
    themeToggle.addEventListener('click', toggleTheme);

    numericInputs.forEach(input => {
      if (input) {
        input.addEventListener('keydown', handleNumericKeydown);
        input.addEventListener('input', handleNumericInputSanitize);
        input.addEventListener('paste', handleNumericPaste);
      }
    });

    originalServingsInput.addEventListener('input', () => {
      updateLiveScaleMultiplier();
      saveState(false);
    });
    targetServingsInput.addEventListener('input', () => {
      updateLiveScaleMultiplier();
      saveState(false);
    });

    const allInputs = [
      dishNameInput,
      ing1Name, ing1Amount, ing1Unit,
      ing2Name, ing2Amount, ing2Unit,
      ing3Name, ing3Amount, ing3Unit
    ];
    allInputs.forEach(input => {
      if (input) {
        input.addEventListener('input', () => saveState(false));
      }
    });

    [dishNameInput, originalServingsInput, targetServingsInput, ing1Amount, ing2Amount, ing3Amount].forEach(el => {
      if (el) {
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleScaleAction(true);
          }
        });
      }
    });

    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetKey = btn.getAttribute('data-preset');
        loadPreset(presetKey, true);
      });
    });

    copyRecipeBtn.addEventListener('click', handleCopyRecipe);
    if (clearAllHistoryBtn) {
      clearAllHistoryBtn.addEventListener('click', clearAllHistory);
    }
  }

  // --- Recipe History Management ---

  function getHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('Failed to load recipe history:', e);
      return [];
    }
  }

  function saveHistory(list) {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save recipe history:', e);
    }
  }

  function addHistoryItem(calculationResult, dishName, formIngredients) {
    const cleanDish = (dishName || '').trim() || 'Custom Recipe';
    let history = getHistory();

    const newItem = {
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      dishName: cleanDish,
      originalServings: calculationResult.originalServings,
      targetServings: calculationResult.targetServings,
      scaleFactor: calculationResult.scaleFactor,
      ingredients: calculationResult.ingredients.map(i => ({
        name: i.name,
        unit: i.unit,
        formattedOriginal: i.formattedOriginal,
        formattedNew: i.formattedNew
      })),
      formIngredients: formIngredients,
      timestamp: Date.now()
    };

    if (history.length > 0) {
      const latest = history[0];
      const isDuplicate = latest.dishName === newItem.dishName &&
                          latest.originalServings === newItem.originalServings &&
                          latest.targetServings === newItem.targetServings &&
                          JSON.stringify(latest.formIngredients) === JSON.stringify(newItem.formIngredients);
      if (isDuplicate) {
        return;
      }
    }

    history.unshift(newItem);
    if (history.length > 25) {
      history = history.slice(0, 25);
    }
    saveHistory(history);
    renderHistory();
  }

  function deleteHistoryItem(id) {
    let history = getHistory();
    history = history.filter(item => item.id !== id);
    saveHistory(history);
    renderHistory();
  }

  function clearAllHistory() {
    saveHistory([]);
    renderHistory();
  }

  function loadHistoryItemIntoForm(id) {
    const history = getHistory();
    const item = history.find(h => h.id === id);
    if (!item) return;

    clearError();
    dishNameInput.value = item.dishName;
    originalServingsInput.value = item.originalServings;
    targetServingsInput.value = item.targetServings;

    if (item.formIngredients && item.formIngredients.length >= 3) {
      ing1Name.value = item.formIngredients[0].name || '';
      ing1Amount.value = item.formIngredients[0].amount || '';
      ing1Unit.value = item.formIngredients[0].unit || '';

      ing2Name.value = item.formIngredients[1].name || '';
      ing2Amount.value = item.formIngredients[1].amount || '';
      ing2Unit.value = item.formIngredients[1].unit || '';

      ing3Name.value = item.formIngredients[2].name || '';
      ing3Amount.value = item.formIngredients[2].amount || '';
      ing3Unit.value = item.formIngredients[2].unit || '';
    }

    updateLiveScaleMultiplier();
    handleScaleAction(false);
    saveState(true);

    const workspaceEl = document.getElementById('workspace');
    if (workspaceEl) {
      workspaceEl.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function renderHistory() {
    if (!historyListContainer) return;
    const history = getHistory();

    if (history.length === 0) {
      if (historyEmptyState) historyEmptyState.classList.remove('hidden');
      if (clearAllHistoryBtn) clearAllHistoryBtn.classList.add('hidden');
      if (historyCountBadge) historyCountBadge.classList.add('hidden');
      historyListContainer.innerHTML = '';
      return;
    }

    if (historyEmptyState) historyEmptyState.classList.add('hidden');
    if (clearAllHistoryBtn) clearAllHistoryBtn.classList.remove('hidden');
    if (historyCountBadge) {
      historyCountBadge.classList.remove('hidden');
      historyCountBadge.textContent = `${history.length} saved`;
    }

    historyListContainer.innerHTML = '';

    history.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'history-item';

      const factorText = item.scaleFactor % 1 === 0 ? item.scaleFactor.toFixed(0) : item.scaleFactor.toFixed(2);
      const ingredientsPreview = (item.ingredients || []).map(i => {
        const unit = i.unit ? ` ${escapeHTML(i.unit)}` : '';
        return `${escapeHTML(i.name)}: ${i.formattedNew}${unit}`;
      }).join(' · ');

      const dateStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      itemEl.innerHTML = `
        <div class="history-item-details">
          <div class="history-item-top">
            <span class="history-item-name">${escapeHTML(item.dishName)}</span>
            <span class="history-item-ratio">${factorText}× Multiplier</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${dateStr}</span>
          </div>
          <div class="history-item-meta">
            Makes ${item.originalServings} → Scaled to ${item.targetServings} servings
          </div>
          <div class="history-item-preview" title="${ingredientsPreview}">
            ${ingredientsPreview}
          </div>
        </div>
        <div class="history-item-actions">
          <button type="button" class="btn-history-load" data-load-history="${item.id}">
            Load Recipe
          </button>
          <button type="button" class="btn-history-delete" data-delete-history="${item.id}" title="Delete recipe from history" aria-label="Delete recipe from history">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;

      historyListContainer.appendChild(itemEl);
    });

    historyListContainer.querySelectorAll('[data-load-history]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-load-history');
        loadHistoryItemIntoForm(id);
      });
    });

    historyListContainer.querySelectorAll('[data-delete-history]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-history');
        deleteHistoryItem(id);
      });
    });
  }

  // --- Initialization ---

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
    restoreState();
    renderHistory();
    runAcceptanceTestsSilently();
  });

})();