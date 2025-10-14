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
    
    // Get the expression from the UI
    var expression: string = inputField.value;

    // Remove the last character in the expression
    if (1 <= expression.length) {
        expression = expression.slice(0, -1);
    }

    // Update the content of the input field
    inputField.value = expression;
    inputField.focus();
});

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
