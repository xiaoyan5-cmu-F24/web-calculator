const display = document.getElementById('display');

const addNumToDisplay = (num) => {
    addToDisplay(num);
};

const addOperatorToDisplay = (operator) => {
    addToDisplay(operator);
};

const addToDisplay = (val) => {
    display.value += val;
};

const calculateResult = () => {
    try {
        display.value = eval(display.value);
    } catch (error) {
        display.value = 'Error';
    }
};

const clearDisplay = () => {
    display.value = '';
}

const backspaceDisplay = () => {
    const currentValue = display.value;
    display.value = currentValue.slice(0, -1);
};

const cutDisplay = () => {
    const currentValue = display.value;
    navigator.clipboard.writeText(currentValue).then(() => {
        clearDisplay();
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
};

const superscriptDisplay = () => {
    const currentValue = display.value;
    display.value = currentValue + "*" + currentValue;
    calculateResult();
};

// Event listeners for keyboard input
document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (!isNaN(key) || key === '.') {
        addNumToDisplay(key);
    } else if (['+', '-', '*', '/'].includes(key)) {
        addOperatorToDisplay(key);
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