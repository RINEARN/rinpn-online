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

// The version of RINPn Online
const RINPN_ONLINE_VERSION: string = "0.1.2";

// --------------------------------------------------------------------------------
// DOM Elements of UI
// --------------------------------------------------------------------------------

// Version Label
const versionLabel: HTMLSpanElement = document.getElementById("version-label")! as HTMLSpanElement;

// I/O Fields
const inputField: HTMLInputElement = document.getElementById("input-field")! as HTMLInputElement;
const outputField: HTMLInputElement = document.getElementById("output-field")! as HTMLInputElement;

// Buttons under INPUT field
const leftButton: HTMLButtonElement = document.getElementById("left-button")! as HTMLButtonElement;
const rightButton: HTMLButtonElement = document.getElementById("right-button")! as HTMLButtonElement;
const calculationSmallButton: HTMLButtonElement = document.getElementById("calculation-small-button")! as HTMLButtonElement;

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

// The onload event
window.onload = (): void => {
    versionLabel.innerHTML = RINPN_ONLINE_VERSION;
}

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

    // Connect functions: sin(x), cos(x), tan(x), etc.
    exevalator.connectFunction("sin", new SinFunction());
    exevalator.connectFunction("cos", new CosFunction());
    exevalator.connectFunction("tan", new TanFunction());
    exevalator.connectFunction("asin", new AsinFunction());
    exevalator.connectFunction("acos", new AcosFunction());
    exevalator.connectFunction("atan", new AtanFunction());
    exevalator.connectFunction("abs", new AbsFunction());
    exevalator.connectFunction("sqrt", new SqrtFunction());
    exevalator.connectFunction("pow", new PowFunction());
    exevalator.connectFunction("exp", new ExpFunction());
    exevalator.connectFunction("ln", new LnFunction());
    exevalator.connectFunction("log10", new Log10Function());
    exevalator.connectFunction("sum", new SumFunction());
    exevalator.connectFunction("van", new VanFunction());
    exevalator.connectFunction("van1", new Van1Function());
    exevalator.connectFunction("mean", new MeanFunction());
    exevalator.connectFunction("sdn", new SdnFunction());
    exevalator.connectFunction("sdn1", new Sdn1Function());
    exevalator.connectFunction("rad", new RadFunction());
    exevalator.connectFunction("deg", new DegFunction());

    // Declare variable: PI
    exevalator.declareVariable("PI");
    exevalator.writeVariable("PI", Math.PI);

    // Compute the value of the inputted expression,
    // and display the result on the result to the output field
    try {
        const result: number = exevalator.eval(expression);
        const formattedResult = formatResult(result);
        outputField.value = `${formattedResult}`;

    } catch (error) {
        if (error instanceof ExevalatorError) {
            outputField.value = "ERROR: " + error.message;
        } else {
            outputField.value = "ERROR\n(See the browser's console for details.)";
            console.error(error);
        }
    }
}

// The function to rounds and formats the calculation result
function formatResult(rawResult: number): string {

    // Returns NaN or Inifinity as it is
    if (!Number.isFinite(rawResult)) {
        return String(rawResult);
    }

    // Normalize -0 to +0 before formatting
    if (Object.is(rawResult, -0)) {
        rawResult = 0;
    }

    // Round the result
    const roundedResult: string = rawResult.toPrecision(10);

    // Split the result by "e" or "E", which is the head of the exponent part
    const eSplitted: string[] = roundedResult.split(/e/i);
    let mantissaPart = 0 < eSplitted.length ? eSplitted[0] : "";
    let exponentPart = 1 < eSplitted.length ? eSplitted[1] : "";

    // Trim leading "+"" in exponent
    if (exponentPart.startsWith("+")) {
        exponentPart = exponentPart.slice(1);
    }

    // If the mantissaPart has ".", 
    // which means that the tail digits of mantissaPart are fractional digits
    if (mantissaPart.includes(".")) {

        // Trimmes "0" at the tail of the fractional digits, repeatedly
        while (mantissaPart.endsWith("0")) {
            mantissaPart = mantissaPart.slice(0, -1);
        }

        // If there are no longer fractinal digits, trim the decimal point
        if (mantissaPart.endsWith(".")) {
            mantissaPart = mantissaPart.slice(0, -1);
        }
    }

    // Concatenate the zero-trimmed mantissa part and the exponent part, if exists
    let formattedResult: string = mantissaPart;
    if (0 < exponentPart.length) {
        formattedResult += "E" + exponentPart;
    }
    return formattedResult;
}

// The function to insert the specified text to the input filed
function insertToInputField(text: string) {

    // Ensure the field is focused and get the current caret.
    inputField.focus();
    const caretPositionStart: number = inputField.selectionStart ?? inputField.value.length;
    const caretPositionEnd: number   = inputField.selectionEnd   ?? caretPositionStart;

    // Insert the specified text into the content of the input field
    inputField.setRangeText(text, caretPositionStart, caretPositionEnd, "end");

    // In some cases, when the content width exceeds the input's visible width,
    // the browser may not scroll far enough to reveal the last character after appending text at the end.
    // To ensure the trailing character is visible,
    // adjust the horizontal scroll position on the next frame.
    const updatedCaretPosition = caretPositionEnd + text.length;
    const isCaretAtEnd = inputField.value.length <= updatedCaretPosition;
    if (isCaretAtEnd) {
        requestAnimationFrame(() => {
            inputField.scrollLeft = inputField.scrollWidth;
        });
    }
}

// The function to remove a character, or selected content from the input filed
function removeCharOrAreaFromInputField() {

    // Get the caret position in the input field
    inputField.focus();
    const caretPositionStart: number = inputField.selectionStart ?? inputField.value.length;
    const caretPositionEnd: number   = inputField.selectionEnd   ?? caretPositionStart;

    // If no area is selected, remove a character before the caret position
    if (caretPositionStart === caretPositionEnd) {

        // Get the current input expression, and separate it into head/tail parts before/after the caret
        const expression: string = inputField.value;
        const expressionHead: string = expression.substring(0, caretPositionStart);
        const expressionTail: string = expression.substring(caretPositionStart, expression.length);

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

    // If any area is selected, remove the selected content
    } else {
        inputField.setRangeText("", caretPositionStart, caretPositionEnd, "end");
        inputField.focus();
    }
}

// The function to move the caret in the input field to the left
function moveCaretToLeft() {
    inputField.focus();
    let caretPosition: number = inputField.selectionStart!;
    caretPosition--;
    if (caretPosition < 0) {
        caretPosition = 0;
    }
    inputField.selectionStart = caretPosition;
    inputField.selectionEnd = caretPosition;
}

// The function to move the caret in the input field to the right
function moveCaretToRight() {
    inputField.focus();
    let caretPosition: number = inputField.selectionStart!;
    caretPosition++;
    if (inputField.value.length < caretPosition) {
        caretPosition = inputField.value.length;
    }
    inputField.selectionStart = caretPosition;
    inputField.selectionEnd = caretPosition;
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

// The event handlers which are called when "=" buttons are clicked
calculationButton.addEventListener("click", () => {
    calculate();
});
calculationSmallButton.addEventListener("click", () => {
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
    removeCharOrAreaFromInputField();
});

// The event handlers which are called when "<" or ">" buttons is clicked
leftButton.addEventListener("click", () => {
    moveCaretToLeft();
});
rightButton.addEventListener("click", () => {
    moveCaretToRight();
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


// --------------------------------------------------------------------------------
// Functions available in expressions: sin(x), cos(x), tan(x), etc.
// --------------------------------------------------------------------------------

class SinFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length != 1) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
        }
        return Math.sin(args[0]);
    }
}

class CosFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length != 1) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
        }
        return Math.cos(args[0]);
    }
}

class TanFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length != 1) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
        }
        return Math.tan(args[0]);
    }
}

class AsinFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length != 1) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
        }
        return Math.asin(args[0]);
    }
}

class AcosFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length != 1) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
        }
        return Math.acos(args[0]);
    }
}

class AtanFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length != 1) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
        }
        return Math.atan(args[0]);
    }
}

class AbsFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length != 1) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
        }
        return Math.abs(args[0]);
    }
}

class SqrtFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length != 1) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
        }
        return Math.sqrt(args[0]);
    }
}

class PowFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length != 2) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: 2)");
        }
        return Math.pow(args[0], args[1]);
    }
}

class ExpFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length != 1) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
        }
        return Math.exp(args[0]);
    }
}

class LnFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length != 1) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
        }
        return Math.log(args[0]);
    }
}

class Log10Function implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length != 1) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
        }
        return Math.log10(args[0]);
    }
}

class SumFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length === 0) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: more than 1)");
        }
        return StatisticsCalculator.sum(args);
    }
}

class VanFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length === 0) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: more than 1)");
        }
        return StatisticsCalculator.van(args);
    }
}

class Van1Function implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length <= 1) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: more than 2)");
        }
        return StatisticsCalculator.van1(args);
    }
}

class SdnFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length === 0) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: more than 1)");
        }
        return StatisticsCalculator.sdn(args);
    }
}

class Sdn1Function implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length <= 1) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: more than 2)");
        }
        return StatisticsCalculator.sdn1(args);
    }
}

class MeanFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length === 0) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: more than 1)");
        }
        return StatisticsCalculator.mean(args);
    }
}

class RadFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length === 0) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
        }
        const degValue: number = args[0];
        const radValue: number = Math.PI * degValue / 180.0;
        return radValue;
    }
}

class DegFunction implements ExevalatorFunctionInterface {
    public invoke(args: number[]): number {
        if (args.length === 0) {
            throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
        }
        const radValue: number = args[0];
        const degValue: number = 180.0 * radValue / Math.PI;
        return degValue;
    }
}

// The class providing internal calculations of sum/mean/van/van1/sdn/sdn1 functions
class StatisticsCalculator {

    // Calculate the summation value of the args
    public static sum(args: number[]): number {
        const argCount = args.length;
        let sumValue: number = 0.0;
        for (let iarg: number = 0; iarg<argCount; iarg++) {
            const arg: number = args[iarg];
            sumValue += arg;
        }
        return sumValue;
    }

    // Calculate the summation value of the args
    public static mean(args: number[]): number {
        const argCount = args.length;
        const sumValue: number = StatisticsCalculator.sum(args);
        const meanValue = sumValue / argCount;
        return meanValue;
    }

    // Calculate the variance (n)
    public static van(args: number[]): number {
        const argCount = args.length;
        const meanValue: number = StatisticsCalculator.mean(args);
        let sumSquareDiffValue = 0.0;

        for (let iarg: number = 0; iarg<argCount; iarg++) {
            const arg: number = args[iarg];
            const squareDiffValue = (arg - meanValue) * (arg - meanValue);
            sumSquareDiffValue += squareDiffValue;
        }

        const vanValue = sumSquareDiffValue / argCount;
        return vanValue;
    }

    // Calculate the variance (n - 1)
    public static van1(args: number[]): number {
        const argCount = args.length;
        const meanValue: number = StatisticsCalculator.mean(args);
        let sumSquareDiffValue = 0.0;

        for (let iarg: number = 0; iarg<argCount; iarg++) {
            const arg: number = args[iarg];
            const squareDiffValue = (arg - meanValue) * (arg - meanValue);
            sumSquareDiffValue += squareDiffValue;
        }

        const van1Value = sumSquareDiffValue / (argCount - 1);
        return van1Value;
    }

    // Calculate the standard deviation (n)
    public static sdn(args: number[]): number {
        const sdnValue = Math.sqrt(StatisticsCalculator.van(args));
        return sdnValue;
    }

    // Calculate the standard deviation (n - 1)
    public static sdn1(args: number[]): number {
        const sdnValue = Math.sqrt(StatisticsCalculator.van1(args));
        return sdnValue;
    }
}
