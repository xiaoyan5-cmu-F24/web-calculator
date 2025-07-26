const display = document.getElementById('display');

const addNumToDisplay = (num) => {
    addToDisplay(num);
    numberInputVibrate();
};

const addOperatorToDisplay = (operator) => {
    addToDisplay(operator);
    operatorInputVibrate();
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
    resultReloadVibrate();
};

const cutDisplay = () => {
    const currentValue = display.value;
    navigator.clipboard.writeText(currentValue).then(() => {
        clearDisplay();
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
    resultReloadVibrate();
};

const clearDisplay = () => {
    display.value = '';
    removeInputVibrate();
}

const backspaceDisplay = () => {
    const currentValue = display.value;
    display.value = currentValue.slice(0, -1);
    removeInputVibrate();
};

const superscriptDisplay = () => {
    const currentValue = display.value;
    display.value = currentValue + "*" + currentValue;
    calculateResult();
};

const numberInputVibrate = () => {
    vibrateFeedback(1);
}

const operatorInputVibrate = () => {
    vibrateFeedback(2);
}

const resultReloadVibrate = () => {
    vibrateFeedback(3);
}

const removeInputVibrate = () => {
    vibrateFeedback(4);
}

const vibrateFeedback = (multiplier) => {
    const unitTime = 50;

    if (navigator.vibrate) {
        navigator.vibrate(unitTime * multiplier);
    }
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