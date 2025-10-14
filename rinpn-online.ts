import Exevalator, {ExevalatorFunctionInterface, ExevalatorError} from "./exevalator";

/*
 * How to build:
 *
 * First install esbuild (if not already installed):
 *
 *     npm install esbuild --save-dev
 * 
 * Then, compile and bundle "rinpn-online.ts" and "exevalator.ts" into single JavasScript file by:
 * 
 *     npx esbuild rinpn-online.ts --bundle --outfile=rinpn-online-bundled.js
 * 
 * Then, open "index.html" by your web browser.
 * It loads and execute "rinpn-online-bundled.js" generated above.
 */


// --------------------------------------------------------------------------------
// DOM Elements of UI
// --------------------------------------------------------------------------------

// I/O Fields
const inputField: HTMLInputElement = document.getElementById("input-field")! as HTMLInputElement;
const outputField: HTMLInputElement = document.getElementById("output-field")! as HTMLInputElement;

// Buttons on the Control Panel
const calculationButton: HTMLButtonElement = document.getElementById("calculation-button")! as HTMLButtonElement;
const clearButton: HTMLButtonElement = document.getElementById("clear-button")! as HTMLButtonElement;
const backSpaceButton: HTMLButtonElement = document.getElementById("back-space-button")! as HTMLButtonElement;

// Buttons on the Number Panel
const num0Button: HTMLButtonElement = document.getElementById("num0-button")! as HTMLButtonElement;
const num1Button: HTMLButtonElement = document.getElementById("num1-button")! as HTMLButtonElement;
const num2Button: HTMLButtonElement = document.getElementById("num2-button")! as HTMLButtonElement;
const num3Button: HTMLButtonElement = document.getElementById("num3-button")! as HTMLButtonElement;
const num4Button: HTMLButtonElement = document.getElementById("num4-button")! as HTMLButtonElement;
const num5Button: HTMLButtonElement = document.getElementById("num5-button")! as HTMLButtonElement;
const num6Button: HTMLButtonElement = document.getElementById("num6-button")! as HTMLButtonElement;
const num7Button: HTMLButtonElement = document.getElementById("num7-button")! as HTMLButtonElement;
const num8Button: HTMLButtonElement = document.getElementById("num8-button")! as HTMLButtonElement;
const num9Button: HTMLButtonElement = document.getElementById("num9-button")! as HTMLButtonElement;
const addButton: HTMLButtonElement = document.getElementById("add-button")! as HTMLButtonElement;
const subButton: HTMLButtonElement = document.getElementById("sub-button")! as HTMLButtonElement;
const mulButton: HTMLButtonElement = document.getElementById("mul-button")! as HTMLButtonElement;
const divButton: HTMLButtonElement = document.getElementById("div-button")! as HTMLButtonElement;
const dotButton: HTMLButtonElement = document.getElementById("dot-button")! as HTMLButtonElement;
const commaButton: HTMLButtonElement = document.getElementById("comma-button")! as HTMLButtonElement;

// Buttons on the Function Panel
const sinButton: HTMLButtonElement = document.getElementById("sin-button")! as HTMLButtonElement;
const cosButton: HTMLButtonElement = document.getElementById("cos-button")! as HTMLButtonElement;
const tanButton: HTMLButtonElement = document.getElementById("tan-button")! as HTMLButtonElement;
const asinButton: HTMLButtonElement = document.getElementById("asin-button")! as HTMLButtonElement;
const acosButton: HTMLButtonElement = document.getElementById("acos-button")! as HTMLButtonElement;
const atanButton: HTMLButtonElement = document.getElementById("atan-button")! as HTMLButtonElement;
const absButton: HTMLButtonElement = document.getElementById("abs-button")! as HTMLButtonElement;
const sqrtButton: HTMLButtonElement = document.getElementById("sqrt-button")! as HTMLButtonElement;
const powButton: HTMLButtonElement = document.getElementById("pow-button")! as HTMLButtonElement;
const expButton: HTMLButtonElement = document.getElementById("exp-button")! as HTMLButtonElement;
const lnButton: HTMLButtonElement = document.getElementById("ln-button")! as HTMLButtonElement;
const log10Button: HTMLButtonElement = document.getElementById("log10-button")! as HTMLButtonElement;
const sumButton: HTMLButtonElement = document.getElementById("sum-button")! as HTMLButtonElement;
const vanButton: HTMLButtonElement = document.getElementById("van-button")! as HTMLButtonElement;
const van1Button: HTMLButtonElement = document.getElementById("van1-button")! as HTMLButtonElement;
const meanButton: HTMLButtonElement = document.getElementById("mean-button")! as HTMLButtonElement;
const sdnButton: HTMLButtonElement = document.getElementById("sdn-button")! as HTMLButtonElement;
const sdn1Button: HTMLButtonElement = document.getElementById("sdn1-button")! as HTMLButtonElement;
const radButton: HTMLButtonElement = document.getElementById("rad-button")! as HTMLButtonElement;
const degButton: HTMLButtonElement = document.getElementById("deg-button")! as HTMLButtonElement;
const piButton: HTMLButtonElement = document.getElementById("pi-button")! as HTMLButtonElement;
const openParenButton: HTMLButtonElement = document.getElementById("open-paren-button")! as HTMLButtonElement;
const closeParenButton: HTMLButtonElement = document.getElementById("close-paren-button")! as HTMLButtonElement;
const spaceButton: HTMLButtonElement = document.getElementById("space-button")! as HTMLButtonElement;


// --------------------------------------------------------------------------------
// Important Processes
// --------------------------------------------------------------------------------

// The function calculates the currently input expression, 
// and display the result on the output field
function calculate() {

    // Get the expression from the input field
    const expression: string = inputField.value;
    if (expression.trim().length === 0) {
        outputField.value = "";
        return;
    }

    // Create an instance of Exevalator Engine
    let exevalator: Exevalator = new Exevalator();

    // Compute the value of the inputted expression,
    // and display the result on the result to the output field
    try {
        const result: number = exevalator.eval(expression);
        const roundedResult: string = result.toPrecision(10);
        outputField.value = `${roundedResult}`;

    } catch (error) {
        if (error instanceof ExevalatorError) {
            outputField.value = "ERROR: " + error.message;
        } else {
            outputField.value = "ERROR\n(See the browser's console for details.)";
            console.error(error);
        }
    }
}

// The function to insert the specified text to the input filed
function insertToInputField(text: string) {

    // Get the caret position in the input field
    inputField.focus();
    const caretPosition: number = inputField.selectionStart!;

    // Get the current input expression, and separate it into head/tail parts before/after the caret
    const expression: string = inputField.value;
    const expressionHead: string = expression.substring(0, caretPosition);
    const expressionTail: string = expression.substring(caretPosition, expression.length);

    // Insert the specified text
    const updatedExpression = expressionHead + text + expressionTail;

    // Update the contents of the input field
    inputField.value = updatedExpression;

    // Update the caret position
    inputField.selectionStart = caretPosition + text.length;
    inputField.selectionEnd = caretPosition + text.length;
    inputField.focus();
}

// The function to remove a character from the input filed
function removeCharFromInputField() {

    // Get the caret position in the input field
    inputField.focus();
    const caretPosition: number = inputField.selectionStart!;

    // Get the current input expression, and separate it into head/tail parts before/after the caret
    const expression: string = inputField.value;
    const expressionHead: string = expression.substring(0, caretPosition);
    const expressionTail: string = expression.substring(caretPosition, expression.length);

    // Trim the last character of the expressionHead
    const expressionHeadTrimmed: string = expressionHead.length === 0 ? "" : expressionHead.slice(0, -1);

    // Insert the specified text
    const updatedExpression = expressionHeadTrimmed + expressionTail;

    // Update the contents of the input field
    inputField.value = updatedExpression;

    // Update the caret position
    inputField.selectionStart = expressionHeadTrimmed.length;
    inputField.selectionEnd = expressionHeadTrimmed.length;
    inputField.focus();
}


// --------------------------------------------------------------------------------
// Events for the Control Panel and the Input Field
// --------------------------------------------------------------------------------

// The event handler which is called when "Enter" key is pressed on the input field
inputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        calculate();
    }
});

// The event handler which is called when "=" button is clicked
calculationButton.addEventListener("click", () => {
    calculate();
});

// The event handler which is called when "C" (Clear) button is clicked
clearButton.addEventListener("click", () => {
    inputField.value = "";
    outputField.value = "";
    inputField.focus();
});

// The event handler which is called when "BS" (Back Space) button is clicked
backSpaceButton.addEventListener("click", () => {
    removeCharFromInputField();
});


// --------------------------------------------------------------------------------
// Events for the Number Panel
// --------------------------------------------------------------------------------

num0Button.addEventListener("click", () => {
    insertToInputField("0");
});
num1Button.addEventListener("click", () => {
    insertToInputField("1");
});
num2Button.addEventListener("click", () => {
    insertToInputField("2");
});
num3Button.addEventListener("click", () => {
    insertToInputField("3");
});
num4Button.addEventListener("click", () => {
    insertToInputField("4");
});
num5Button.addEventListener("click", () => {
    insertToInputField("5");
});
num6Button.addEventListener("click", () => {
    insertToInputField("6");
});
num7Button.addEventListener("click", () => {
    insertToInputField("7");
});
num8Button.addEventListener("click", () => {
    insertToInputField("8");
});
num9Button.addEventListener("click", () => {
    insertToInputField("9");
});
dotButton.addEventListener("click", () => {
    insertToInputField(".");
});
commaButton.addEventListener("click", () => {
    insertToInputField(",");
});
addButton.addEventListener("click", () => {
    insertToInputField("+");
});
subButton.addEventListener("click", () => {
    insertToInputField("-");
});
mulButton.addEventListener("click", () => {
    insertToInputField("*");
});
divButton.addEventListener("click", () => {
    insertToInputField("/");
});


// --------------------------------------------------------------------------------
// Events for the Function Panel
// --------------------------------------------------------------------------------

sinButton.addEventListener("click", () => {
    insertToInputField("sin(");
});
cosButton.addEventListener("click", () => {
    insertToInputField("cos(");
});
tanButton.addEventListener("click", () => {
    insertToInputField("tan(");
});

asinButton.addEventListener("click", () => {
    insertToInputField("asin(");
});
acosButton.addEventListener("click", () => {
    insertToInputField("acos(");
});
atanButton.addEventListener("click", () => {
    insertToInputField("atan(");
});

absButton.addEventListener("click", () => {
    insertToInputField("abs(");
});
sqrtButton.addEventListener("click", () => {
    insertToInputField("sqrt(");
});
powButton.addEventListener("click", () => {
    insertToInputField("pow(");
});

expButton.addEventListener("click", () => {
    insertToInputField("exp(");
});
lnButton.addEventListener("click", () => {
    insertToInputField("ln(");
});
log10Button.addEventListener("click", () => {
    insertToInputField("log10(");
});

sumButton.addEventListener("click", () => {
    insertToInputField("sum(");
});
vanButton.addEventListener("click", () => {
    insertToInputField("van(");
});
van1Button.addEventListener("click", () => {
    insertToInputField("van1(");
});

meanButton.addEventListener("click", () => {
    insertToInputField("mean(");
});
sdnButton.addEventListener("click", () => {
    insertToInputField("sdn(");
});
sdn1Button.addEventListener("click", () => {
    insertToInputField("sdn1(");
});

radButton.addEventListener("click", () => {
    insertToInputField("rad(");
});
degButton.addEventListener("click", () => {
    insertToInputField("deg(");
});
piButton.addEventListener("click", () => {
    insertToInputField("PI");
});

openParenButton.addEventListener("click", () => {
    insertToInputField("(");
});
closeParenButton.addEventListener("click", () => {
    insertToInputField(")");
});
spaceButton.addEventListener("click", () => {
    insertToInputField(" ");
});
