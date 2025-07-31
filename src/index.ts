// Get calculator display input element
const displayInput = document.getElementById('display') as HTMLInputElement | null;

if (!displayInput) {
    throw new Error('Calculator display element not found');
}

// -------------------- Display Utilities --------------------

/** Replaces the entire display content */
const setDisplayValue = (inputValue: string): void => {
    displayInput!.value = inputValue;
};

/** Appends a value to the current display content */
const appendToDisplay = (inputValue: string): void => {
    setDisplayValue(displayInput!.value + inputValue);
};

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
    appendToDisplay(num.toString());
    vibrateOnNumberInput();
};

const handleOperatorInput = (operator: string): void => {
    appendToDisplay(operator);
    vibrateOnOperatorInput();
};

/** Squares the current value by inputting value * value */
const squareCurrentValue = (): void => {
    const currentValue = displayInput!.value;
    setDisplayValue(`${currentValue}*${currentValue}`);
    vibrateOnOperatorInput();
};

const clearDisplay = (): void => {
    setDisplayValue('');
    vibrateOnClearOrDelete();
};

const deleteLastCharacter = (): void => {
    setDisplayValue(displayInput!.value.slice(0, -1));
    vibrateOnClearOrDelete();
};

// -------------------- Clipboard --------------------

/** Cuts the current display content to clipboard */
const cutDisplayToClipboard = (): void => {
    const currentValue = displayInput!.value;
    navigator.clipboard.writeText(currentValue)
        .then(clearDisplay)
        .catch(err => console.error('Clipboard write failed:', err));
};

// -------------------- Evaluation --------------------

/** Evaluates the current expression safely */
const evaluateExpression = (): void => {
    try {
        const expression = displayInput!.value;

        // Sanitize: allow only digits, dots, and basic operators
        if (/[^0-9+\-*/.]/.test(expression)) {
            throw new Error('Unsupported characters in expression');
        }

        // Safe execution (still caution-worthy)
        const result = Function(`"use strict"; return (${expression})`)() as number;
        setDisplayValue(String(result));
    } catch {
        setDisplayValue('Error');
    }

    vibrateOnCalculation();
};

// -------------------- Keyboard Support --------------------

document.addEventListener('keydown', (event: KeyboardEvent) => {
    const key = event.key;

    if (!isNaN(Number(key)) || key === '.') {
        handleNumberInput(key as number | '.');
    } else if (['+', '-', '*', '/'].includes(key)) {
        handleOperatorInput(key);
    } else if (key === 'Enter' || key === '=') {
        evaluateExpression();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLastCharacter();
    } else if (key.toLowerCase() === 'x') {
        cutDisplayToClipboard();
    } else if (key.toLowerCase() === 's') {
        squareCurrentValue();
    }
});
