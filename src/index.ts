import { DisplayController } from './DisplayController';

// -------------------- Instantiate --------------------
const display = new DisplayController('display');

// -------------------- Vibration Feedback --------------------

const triggerVibration = (intensity: number = 1): void => {
    const baseDuration = 50;
    if (navigator.vibrate) {
        navigator.vibrate(baseDuration * intensity);
    }
};

const vibrateOnNumberInput = (): void => triggerVibration(1);
const vibrateOnOperatorInput = (): void => triggerVibration(2);
const vibrateOnCalculation = (): void => triggerVibration(3);
const vibrateOnClearOrDelete = (): void => triggerVibration(4);

// -------------------- Input Handlers --------------------

const handleNumberInput = (num: number | '.'): void => {
    display.append(num.toString());
    vibrateOnNumberInput();
};

const handleOperatorInput = (operator: string): void => {
    display.append(operator);
    vibrateOnOperatorInput();
};

const clearDisplay = (): void => {
    display.clear();
    vibrateOnClearOrDelete();
};

const deleteLastCharacter = (): void => {
    display.deleteLast();
    vibrateOnClearOrDelete();
};

// -------------------- Clipboard --------------------

/** Cuts the current display content to clipboard */
const cutDisplayToClipboard = (): void => {
    const currentValue = display.value;
    navigator.clipboard.writeText(currentValue)
        .then(display.clear)
        .catch(err => console.error('Clipboard write failed:', err));
};

// -------------------- Evaluation --------------------

/** Evaluates the current expression safely */
const evaluateExpression = (): void => {
    try {
        const expression = display.value;

        // Sanitize: allow only digits, dots, and basic operators
        if (/[^0-9+\-*/.^]/.test(expression)) {
            throw new Error('Unsupported characters in expression');
        }

        // Replace '^' with '**' for exponentiation
        const sanitizedExpression = expression.replace(/\^/g, '**');

        // Safe execution (still caution-worthy)
        const result = Function(`"use strict"; return (${sanitizedExpression})`)() as number;
        display.value = String(result);
    } catch {
        display.value = 'Error';
    }

    vibrateOnCalculation();
};

// -------------------- Keyboard Support --------------------

document.addEventListener('keydown', (event: KeyboardEvent) => {
    const key = event.key;

    if (!isNaN(Number(key)) || key === '.') {
        handleNumberInput(key as number | '.');
    } else if (['+', '-', '*', '/', '^'].includes(key)) {
        handleOperatorInput(key);
    } else if (key === 'Enter' || key === '=') {
        evaluateExpression();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLastCharacter();
    } else if (key.toLowerCase() === 'x') {
        cutDisplayToClipboard();
    }
});
