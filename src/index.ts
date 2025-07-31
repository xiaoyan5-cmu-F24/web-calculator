// Grab the disply input element
const display = document.getElementById('display') as HTMLInputElement | null;

if (!display) {
    throw new Error('Display element not found');
}

// Utility function: updates the display input value
const updateDisplay = (value: string): void => {
    if (display) {
        display.value = value;
    }
}

// Utility function: vibrate feedback
const vibrate = (multiplier: number = 1): void => {
    const unitTime = 50; // Base vibration time in milliseconds
    if (navigator.vibrate) {
        navigator.vibrate(unitTime * multiplier);
    }
}

// Input vibration wrappers
const numberInputVibrate = (): void => { vibrate(1); }
const operatorInputVibrate = (): void => { vibrate(2); }
const resultReloadVibrate = (): void => { vibrate(3); }
const removeInputVibrate = (): void => { vibrate(4); }

// Core display manipulators
const addToDisplay = (value: string): void => {
    updateDisplay(display!.value + value);
}   

const addNumToDisplay = (num: number | '.'): void => {
    addToDisplay(num.toString());
    numberInputVibrate();
};

const addOperatorToDisplay = (operator: string): void => {
    addToDisplay(operator);
    operatorInputVibrate();
};

const clearDisplay = (): void => {
    updateDisplay('');
    removeInputVibrate();
}

const backspaceDisplay = (): void => {
    updateDisplay(display!.value.slice(0, -1));
    removeInputVibrate();
};

const superscriptDisplay = (): void => {
    // e.g. transform "5" → "5*5" then calculate
    const currentValue = display!.value;
    updateDisplay(`${currentValue}*${currentValue}`);
    calculateResult();
}

// Clipboard + clear
const cutDisplay = (): void => {
    const text = display!.value;
    navigator.clipboard.writeText(text)
    .then(() => { clearDisplay(); })
    .catch(err => console.error('Failed to copy text: ', err)); 
}

// Safe evaluation (still caution-worthy!)
const calculateResult = (): void => {
  try {
    const expr = display.value;
    
    // Block any characters except digits, . and +-*/ 
    if (/[^0-9+\-*/.]/.test(expr)) {
      throw new Error('Invalid characters');
    }
    
    // Using Function instead of eval
    const result = Function(`"use strict"; return (${expr})`)() as number;
    
    updateDisplay(String(result));
  } catch {
    updateDisplay('Error');
  }
  resultReloadVibrate();
}

// Keyboard support
document.addEventListener('keydown', (event: KeyboardEvent) => {
    const key = event.key;

    if (!isNaN(Number(key)) || key === '.') {
        addNumToDisplay(key as number | '.');
    } else if (['+', '-', '*', '/'].includes(key)) {
        addOperatorToDisplay(key as '+' | '-' | '*' | '/');
    } else if (['Enter', '='].includes(key)) {
        calculateResult();
    } else if (['Escape', 'c'].includes(key)) {
        clearDisplay();
    } else if (key === 'Backspace') {
        backspaceDisplay();
    } else if (key === 'x') {
        cutDisplay();
    } else if (key === 's') {
        superscriptDisplay();
    }
});