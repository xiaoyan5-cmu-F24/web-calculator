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