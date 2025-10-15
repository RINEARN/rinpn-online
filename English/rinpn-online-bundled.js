(() => {
  // exevalator.ts
  var ErrorMessages = class {
    static EMPTY_EXPRESSION = "The inputted expression is empty.";
    static TOO_MANY_TOKENS = "The number of tokens exceeds the limit (StaticSettings.MAX_TOKEN_COUNT: '$0')";
    static DEFICIENT_OPEN_PARENTHESIS = "The number of open parentheses '(' is deficient.";
    static DEFICIENT_CLOSED_PARENTHESIS = "The number of closed parentheses ')' is deficient.";
    static EMPTY_PARENTHESIS = "The content of parentheses '()' should not be empty.";
    static RIGHT_OPERAND_REQUIRED = "An operand is required at the right of: '$0'";
    static LEFT_OPERAND_REQUIRED = "An operand is required at the left of: '$0'";
    static RIGHT_OPERATOR_REQUIRED = "An operator is required at the right of: '$0'";
    static LEFT_OPERATOR_REQUIRED = "An operator is required at the left of: '$0'";
    static UNKNOWN_UNARY_PREFIX_OPERATOR = "Unknown unary-prefix operator: '$0'";
    static UNKNOWN_BINARY_OPERATOR = "Unknown binary operator: '$0'";
    static UNKNOWN_OPERATOR_SYNTAX = "Unknown operator syntax: '$0'";
    static EXCEEDS_MAX_AST_DEPTH = "The depth of the AST exceeds the limit (StaticSettings.MAX_AST_DEPTH: '$0')";
    static UNEXPECTED_PARTIAL_EXPRESSION = "Unexpected end of a partial expression";
    static INVALID_NUMBER_LITERAL = "Invalid number literal: '$0'";
    static INVALID_MEMORY_ADDRESS = "Invalid memory address: '$0'";
    static ADDRESS_MUST_BE_ZERO_OR_POSITIVE_INT32 = "The address must be zero or a positive 32-bit integer: '$0'";
    static FUNCTION_ERROR = "Function Error ('$0'): $1";
    static VARIABLE_NOT_FOUND = "Variable not found: '$0'";
    static FUNCTION_NOT_FOUND = "Function not found: '$0'";
    static UNEXPECTED_OPERATOR = "Unexpected operator: '$0'";
    static UNEXPECTED_TOKEN = "Unexpected token: '$0'";
    static ARGS_MUST_NOT_BE_NULL_OR_UNDEFINED = "The argument(s) must not be null or undefined: '$0'";
    static TOO_LONG_EXPRESSION = "The length of the expression exceeds the limit (StaticSettings.MAX_EXPRESSION_CHAR_COUNT: '$0')";
    static UNEXPECTED_ERROR = "Unexpected error occurred: $0";
    static REEVAL_NOT_AVAILABLE = '"reeval" is not available before using "eval"';
    static TOO_LONG_VARIABLE_NAME = "The length of the variable name exceeds the limit (StaticSettings.MAX_NAME_CHAR_COUNT: '$0')";
    static TOO_LONG_FUNCTION_NAME = "The length of the function name exceeds the limit (StaticSettings.MAX_NAME_CHAR_COUNT: '$0')";
    static VARIABLE_ALREADY_DECLARED = "The variable '$0' is already declared";
    static FUNCTION_ALREADY_CONNECTED = "The function '$0' is already connected";
    static INVALID_VARIABLE_ADDRESS = "Invalid memory address: '$0'";
    static VARIABLE_COUNT_EXCEEDED_LIMIT = "The number of variables has exceeded the limit of: '$0'";
  };
  var Exevalator = class {
    /** The array used as as a virtual memory storing values of variables. */
    memory;
    /** The current usage (max used index + 1) of the memory. */
    memoryUsage;
    /** The object evaluating the value of the expression. */
    evaluator;
    /** The Map mapping each variable name to an address of the variable. */
    variableTable;
    /** The Map mapping each function name to an IExevalatorFunction instance. */
    functionTable;
    /** Caches the content of the expression evaluated last time, to skip re-parsing. */
    lastEvaluatedExpression;
    /**
     * Creates a new interpreter of Exevalator.
     */
    constructor() {
      this.memory = new Array(StaticSettings.MAX_VARIABLE_COUNT);
      this.memoryUsage = 0;
      this.evaluator = new Evaluator();
      this.variableTable = /* @__PURE__ */ new Map();
      this.functionTable = /* @__PURE__ */ new Map();
      this.lastEvaluatedExpression = void 0;
    }
    /**
     * Evaluates (computes) the value of an expression.
     * 
     * @param expression - The expression to be evaluated.
     * @returns The evaluated value.
     * @throws ExevalatorError - Thrown if the input expression is syntactically incorrect, or uses undeclared variables/functions.
     */
    eval(expression) {
      if (expression == null || expression === void 0) {
        throw new ExevalatorError(ErrorMessages.ARGS_MUST_NOT_BE_NULL_OR_UNDEFINED.replace("$0", "expression"));
      }
      if (StaticSettings.MAX_EXPRESSION_CHAR_COUNT < expression.length) {
        throw new ExevalatorError(ErrorMessages.TOO_LONG_EXPRESSION.replace("$0", StaticSettings.MAX_EXPRESSION_CHAR_COUNT.toString()));
      }
      try {
        const expressionChanged = expression !== this.lastEvaluatedExpression;
        if (expressionChanged || !this.evaluator.isEvaluatable()) {
          const tokens = LexicalAnalyzer.analyze(expression);
          const ast = Parser.parse(tokens);
          this.evaluator.update(ast, this.variableTable, this.functionTable);
          this.lastEvaluatedExpression = expression;
        }
        const evaluatedValue = this.evaluator.evaluate(this.memory);
        return evaluatedValue;
      } catch (error) {
        if (error instanceof ExevalatorError) {
          throw error;
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new ExevalatorError(ErrorMessages.UNEXPECTED_ERROR.replace("$0", errorMessage));
      }
    }
    /**
     * Re-evaluates (re-computes) the value of the expression evaluated by "eval" method last time.
     * This method may (slightly) work faster than calling "eval" method repeatedly for the same expression.
     * Note that, the result value may differ from the last evaluated value, 
     * if values of variables or behaviour of functions had changed.
     * 
     * @returns The evaluated value
     */
    reeval() {
      if (this.evaluator.isEvaluatable()) {
        const evaluatedValue = this.evaluator.evaluate(this.memory);
        return evaluatedValue;
      } else {
        throw new ExevalatorError(ErrorMessages.REEVAL_NOT_AVAILABLE);
      }
    }
    /**
     * Declares a new variable, for using the value of it in expressions.
     * 
     * @param name - The name of the variable to be declared.
     * @returns The virtual address of the declared variable,
     *             which useful for accessing to the variable faster.
     *             See "writeVariableAt" and "readVariableAt" method.
     * @throws ExevalatorError - Thrown if the specified variable name is invalid or already used.
     */
    declareVariable(name) {
      if (name == null || name === void 0) {
        throw new ExevalatorError(ErrorMessages.ARGS_MUST_NOT_BE_NULL_OR_UNDEFINED.replace("$0", "name"));
      }
      if (StaticSettings.MAX_NAME_CHAR_COUNT < name.length) {
        throw new ExevalatorError(ErrorMessages.TOO_LONG_VARIABLE_NAME.replace("$0", StaticSettings.MAX_NAME_CHAR_COUNT.toString()));
      }
      if (this.variableTable.has(name)) {
        throw new ExevalatorError(ErrorMessages.VARIABLE_ALREADY_DECLARED.replace("$0", name));
      }
      if (StaticSettings.MAX_VARIABLE_COUNT <= this.memoryUsage) {
        throw new ExevalatorError(ErrorMessages.VARIABLE_COUNT_EXCEEDED_LIMIT.replace("$0", ErrorMessages.VARIABLE_COUNT_EXCEEDED_LIMIT.toString()));
      }
      if (2147483647 + 1 <= this.memory.length) {
        throw new ExevalatorError(ErrorMessages.VARIABLE_COUNT_EXCEEDED_LIMIT.replace("$0", (2147483647 + 1).toString()));
      }
      const address = this.memoryUsage;
      this.memory[address] = 0;
      this.variableTable.set(name, address);
      this.memoryUsage++;
      return address;
    }
    /**
     * Writes the value to the variable having the specified name.
     *
     * @param name - The name of the variable to be written.
     * @param value - The new value of the variable.
     * @throws ExevalatorError - Thrown if the specified variable has not been declared.
     */
    writeVariable(name, value) {
      if (name == null || name === void 0) {
        throw new ExevalatorError(ErrorMessages.ARGS_MUST_NOT_BE_NULL_OR_UNDEFINED.replace("$0", "name"));
      }
      if (StaticSettings.MAX_NAME_CHAR_COUNT < name.length || !this.variableTable.has(name)) {
        throw new ExevalatorError(ErrorMessages.VARIABLE_NOT_FOUND.replace("$0", name));
      }
      const address = this.variableTable.get(name);
      this.writeVariableAt(address, value);
    }
    /**
     * Writes the value to the variable at the specified virtual address.
     * This method is more efficient than "WriteVariable" method.
     *
     * @param address - The virtual address of the variable to be written.
     * @param value - The new value of the variable.
     * @throws ExevalatorError - Thrown if the specified address has not been asigned for any variable.
     */
    writeVariableAt(address, value) {
      if (address < 0 || this.memory.length <= address) {
        throw new ExevalatorError(ErrorMessages.INVALID_VARIABLE_ADDRESS.replace("$0", address.toString()));
      }
      address = (address | 0) & ~(address >> 31) & (StaticSettings.MAX_VARIABLE_COUNT - 1 | 0);
      this.memory[address] = value;
    }
    /**
     * Reads the value of the variable having the specified name.
     *
     * @param name - The name of the variable to be read.
     * @returns The current value of the variable.
     * @throws ExevalatorError - Thrown if the specified variable has not been declared.
     */
    readVariable(name) {
      if (name == null || name === void 0) {
        throw new ExevalatorError(ErrorMessages.ARGS_MUST_NOT_BE_NULL_OR_UNDEFINED.replace("$0", "name"));
      }
      if (StaticSettings.MAX_NAME_CHAR_COUNT < name.length || !this.variableTable.has(name)) {
        throw new ExevalatorError(ErrorMessages.VARIABLE_NOT_FOUND.replace("$0", name));
      }
      const address = this.variableTable.get(name);
      return this.readVariableAt(address);
    }
    /**
     * Reads the value of the variable at the specified virtual address.
     * This method is more efficient than "ReadVariable" method.
     *
     * @param address - The virtual address of the variable to be read.
     * @returns The current value of the variable.
     * @throws ExevalatorError - Thrown if the specified address has not been asigned for any variable.
     */
    readVariableAt(address) {
      if (address < 0 || this.memory.length <= address) {
        throw new ExevalatorError(ErrorMessages.INVALID_VARIABLE_ADDRESS.replace("$0", address.toString()));
      }
      address = (address | 0) & ~(address >> 31) & (StaticSettings.MAX_VARIABLE_COUNT - 1 | 0);
      return this.memory[address];
    }
    /**
     * Connects a function, for using it in expressions.
     *
     * @param name - The name of the function used in the expression.
     * @param functionImpl - The function to be connected.
     * @throws ExevalatorError - Thrown if the specified function name is invalid or already used.
     */
    connectFunction(name, functionImpl) {
      if (name == null || name === void 0) {
        throw new ExevalatorError(ErrorMessages.ARGS_MUST_NOT_BE_NULL_OR_UNDEFINED.replace("$0", "name"));
      }
      if (StaticSettings.MAX_NAME_CHAR_COUNT < name.length) {
        throw new ExevalatorError(
          ErrorMessages.TOO_LONG_FUNCTION_NAME.replace("$0", StaticSettings.MAX_NAME_CHAR_COUNT.toString())
        );
      }
      if (this.functionTable.has(name)) {
        throw new ExevalatorError(ErrorMessages.FUNCTION_ALREADY_CONNECTED.replace("$0", name));
      }
      this.functionTable.set(name, functionImpl);
    }
  };
  var ExevalatorError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "ExevalatorError";
    }
  };
  var ExevalatorImplementationError = class extends Error {
    constructor(message) {
      super(message);
      this.name = "ExevalatorImplementationError";
    }
  };
  var LexicalAnalyzer = class {
    /**
     * Splits (tokenizes) the expression into tokens, and analyze them.
     *
     * @param expression - The expression to be tokenized/analyzed.
     * @returns Analyzed tokens.
     * @throws ExevalatorError Thrown if the input exception is syntactically incorrect.
     */
    static analyze(expression) {
      let numberLiteralList = [];
      expression = this.escapeNumberLiterals(expression, numberLiteralList);
      for (const splitter of StaticSettings.TOKEN_SPLITTER_SYMBOL_LIST) {
        const escapedSplitter = splitter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const splitterRegex = new RegExp(escapedSplitter, "g");
        expression = expression.replace(splitterRegex, ` ${splitter} `);
      }
      let tokenWords = expression.trim().split(/\s+/);
      if (tokenWords.length == 1 && tokenWords[0].length == 0) {
        throw new ExevalatorError(ErrorMessages.EMPTY_EXPRESSION);
      }
      if (StaticSettings.MAX_TOKEN_COUNT < tokenWords.length) {
        throw new ExevalatorError(ErrorMessages.TOO_MANY_TOKENS.replace("$0", StaticSettings.MAX_TOKEN_COUNT.toString()));
      }
      let tokens = this.createTokensFromTokenWords(tokenWords, numberLiteralList);
      this.checkParenthesisBalance(tokens);
      this.checkEmptyParentheses(tokens);
      this.checkLocationsOfOperatorsAndLeafs(tokens);
      return tokens;
    }
    /**
     * Creates Token-type instances from token words (String).
     *
     * @param tokenWords - Token words (String) to be converted to Token instances.
     * @param numberLiterals - The List storing number literals.
     * @returns Created Token instances.
     * @throws ExevalatorError Thrown if the input exception is syntactically incorrect.
     */
    static createTokensFromTokenWords(tokenWords, numberLiterals) {
      const tokenCount = tokenWords.length;
      let parenthesisDepth = 0;
      let callParenthesisDepths = /* @__PURE__ */ new Set();
      let tokens = new Array(tokenCount);
      let lastToken = void 0;
      let iliteral = 0;
      for (let itoken = 0; itoken < tokenCount; itoken++) {
        const word = tokenWords[itoken];
        if (word === "(") {
          parenthesisDepth++;
          if (1 <= itoken && tokens[itoken - 1].type == 5 /* FUNCTION_IDENTIFIER */) {
            callParenthesisDepths.add(parenthesisDepth);
            const op = StaticSettings.CALL_OPERATOR_SYMBOL_MAP.get(word.charAt(0));
            tokens[itoken] = new Token(1 /* OPERATOR */, word, op);
          } else {
            tokens[itoken] = new Token(3 /* PARENTHESIS */, word);
          }
        } else if (word === ")") {
          if (callParenthesisDepths.has(parenthesisDepth)) {
            callParenthesisDepths.delete(parenthesisDepth);
            const op = StaticSettings.CALL_OPERATOR_SYMBOL_MAP.get(word.charAt(0));
            tokens[itoken] = new Token(1 /* OPERATOR */, word, op);
          } else {
            tokens[itoken] = new Token(3 /* PARENTHESIS */, word);
          }
          parenthesisDepth--;
        } else if (word.length == 1 && StaticSettings.OPERATOR_SYMBOL_SET.has(word.charAt(0))) {
          let op = void 0;
          if (!lastToken || lastToken.word === "(" || lastToken.word === "," || lastToken.type === 1 /* OPERATOR */ && lastToken.operator?.type != 2 /* CALL */) {
            if (!StaticSettings.UNARY_PREFIX_OPERATOR_SYMBOL_MAP.has(word.charAt(0))) {
              throw new ExevalatorError(ErrorMessages.UNKNOWN_UNARY_PREFIX_OPERATOR.replace("$0", word));
            }
            op = StaticSettings.UNARY_PREFIX_OPERATOR_SYMBOL_MAP.get(word.charAt(0));
          } else if (lastToken.word === ")" || lastToken.type == 0 /* NUMBER_LITERAL */ || lastToken.type == 4 /* VARIABLE_IDENTIFIER */) {
            if (!StaticSettings.BINARY_OPERATOR_SYMBOL_MAP.has(word.charAt(0))) {
              throw new ExevalatorError(ErrorMessages.UNKNOWN_BINARY_OPERATOR.replace("$0", word));
            }
            op = StaticSettings.BINARY_OPERATOR_SYMBOL_MAP.get(word.charAt(0));
          } else {
            throw new ExevalatorError(ErrorMessages.UNKNOWN_OPERATOR_SYNTAX.replace("$0", word));
          }
          tokens[itoken] = new Token(1 /* OPERATOR */, word, op);
        } else if (word === StaticSettings.ESCAPED_NUMBER_LITERAL) {
          tokens[itoken] = new Token(0 /* NUMBER_LITERAL */, numberLiterals[iliteral]);
          iliteral++;
        } else if (word === ",") {
          tokens[itoken] = new Token(2 /* EXPRESSION_SEPARATOR */, word);
        } else {
          if (itoken < tokenCount - 1 && tokenWords[itoken + 1] === "(") {
            tokens[itoken] = new Token(5 /* FUNCTION_IDENTIFIER */, word);
          } else {
            tokens[itoken] = new Token(4 /* VARIABLE_IDENTIFIER */, word);
          }
        }
        lastToken = tokens[itoken];
      }
      return tokens;
    }
    /**
     * Replaces number literals in the expression to the escaped representation: "@NUMBER_LITERAL@".
     *
     * @param expression - The expression of which number literals are not escaped yet.
     * @param literalStoreList - The list to which number literals will be added.
     * @returns The expression in which number literals are escaped.
     */
    static escapeNumberLiterals(expression, literalStoreList) {
      const numberLiteralPattern = new RegExp(StaticSettings.NUMBER_LITERAL_REGEX, "g");
      let match = null;
      while ((match = numberLiteralPattern.exec(expression)) !== null) {
        const matchedLiteral = match[0];
        literalStoreList.push(matchedLiteral);
      }
      const replacedExpression = expression.replace(numberLiteralPattern, StaticSettings.ESCAPED_NUMBER_LITERAL);
      return replacedExpression;
    }
    /**
     * Checks the number and correspondence of open "(" and closed ")" parentheses.
     * An ExevalatorError will be thrown when any errors detected.
     * If no error detected, nothing will occur.
     *
     * @param tokens - Tokens of the inputted expression.
     * @throws ExevalatorError Thrown if correspondence of open "(" and closed ")" parentheses is broken.
     */
    static checkParenthesisBalance(tokens) {
      const tokenCount = tokens.length;
      let hierarchy = 0;
      for (let itoken = 0; itoken < tokenCount; itoken++) {
        const token = tokens[itoken];
        if (token.word === "(") {
          hierarchy++;
        } else if (token.word === ")") {
          hierarchy--;
        }
        if (hierarchy < 0) {
          throw new ExevalatorError(ErrorMessages.DEFICIENT_OPEN_PARENTHESIS);
        }
      }
      if (hierarchy > 0) {
        throw new ExevalatorError(ErrorMessages.DEFICIENT_CLOSED_PARENTHESIS);
      }
    }
    /**
     * Checks that empty parentheses "()" are not contained in the expression.
     * An ExevalatorError will be thrown when any errors detected.
     * If no error detected, nothing will occur.
     *
     * @param tokens - Tokens of the inputted expression.
     * @throws ExevalatorError Thrown if an empty parenthesis exists.
     */
    static checkEmptyParentheses(tokens) {
      const tokenCount = tokens.length;
      let contentCounter = 0;
      for (let itoken = 0; itoken < tokenCount; itoken++) {
        const token = tokens[itoken];
        if (token.type === 3 /* PARENTHESIS */) {
          if (token.word === "(") {
            contentCounter = 0;
          } else if (token.word === ")") {
            if (contentCounter === 0) {
              throw new ExevalatorError(ErrorMessages.EMPTY_PARENTHESIS);
            }
          }
        } else {
          contentCounter++;
        }
      }
    }
    /**
     * Checks correctness of locations of operators and leaf elements (literals and identifiers).
     * An ExevalatorError will be thrown when any errors detected.
     * If no error detected, nothing will occur.
     *
     * @param tokens - Tokens of the inputted expression.
     * @throws ExevalatorError Thrown if an empty parenthesis exists.
     */
    static checkLocationsOfOperatorsAndLeafs(tokens) {
      const tokenCount = tokens.length;
      const leafTypeSet = /* @__PURE__ */ new Set([
        0 /* NUMBER_LITERAL */,
        4 /* VARIABLE_IDENTIFIER */
      ]);
      for (let itoken = 0; itoken < tokenCount; itoken++) {
        const token = tokens[itoken];
        const nextIsLeaf = itoken != tokenCount - 1 && leafTypeSet.has(tokens[itoken + 1].type);
        const prevIsLeaf = itoken != 0 && leafTypeSet.has(tokens[itoken - 1].type);
        const nextIsOpenParenthesis = itoken < tokenCount - 1 && tokens[itoken + 1].word === "(";
        const prevIsCloseParenthesis = itoken != 0 && tokens[itoken - 1].word === ")";
        const nextIsPrefixOperator = itoken < tokenCount - 1 && tokens[itoken + 1].type === 1 /* OPERATOR */ && tokens[itoken + 1].operator?.type === 0 /* UNARY_PREFIX */;
        const nextIsFunctionCallBegin = nextIsOpenParenthesis && tokens[itoken + 1].type === 1 /* OPERATOR */ && tokens[itoken + 1].operator?.type === 2 /* CALL */;
        const nextIsFunctionIdentifier = itoken < tokenCount - 1 && tokens[itoken + 1].type == 5 /* FUNCTION_IDENTIFIER */;
        if (token.type === 1 /* OPERATOR */) {
          if (token.operator?.type === 0 /* UNARY_PREFIX */) {
            if (!(nextIsLeaf || nextIsOpenParenthesis || nextIsPrefixOperator || nextIsFunctionIdentifier)) {
              throw new ExevalatorError(ErrorMessages.RIGHT_OPERAND_REQUIRED.replace("$0", token.word));
            }
          }
          if (token.operator?.type === 1 /* BINARY */ || token.word === ",") {
            if (!(nextIsLeaf || nextIsOpenParenthesis || nextIsPrefixOperator || nextIsFunctionIdentifier)) {
              throw new ExevalatorError(ErrorMessages.RIGHT_OPERAND_REQUIRED.replace("$0", token.word));
            }
            if (!(prevIsLeaf || prevIsCloseParenthesis)) {
              throw new ExevalatorError(ErrorMessages.LEFT_OPERAND_REQUIRED.replace("$0", token.word));
            }
          }
        }
        if (leafTypeSet.has(token.type)) {
          if (!nextIsFunctionCallBegin && (nextIsOpenParenthesis || nextIsLeaf)) {
            throw new ExevalatorError(ErrorMessages.RIGHT_OPERATOR_REQUIRED.replace("$0", token.word));
          }
          if (prevIsCloseParenthesis || prevIsLeaf) {
            throw new ExevalatorError(ErrorMessages.LEFT_OPERATOR_REQUIRED.replace("$0", token.word));
          }
        }
      }
    }
    // End of this method
  };
  var Parser = class _Parser {
    /**
     * Parses tokens and construct Abstract Syntax Tree (AST).
     *
     * @param tokens - Tokens to be parsed.
     * @return The root node of the constructed AST.
     */
    static parse(tokens) {
      const tokenCount = tokens.length;
      let stack = [];
      const parenthesisStackLid = new AstNode(new Token(6 /* STACK_LID */, "(PARENTHESIS_STACK_LID)"));
      const separatorStackLid = new AstNode(new Token(6 /* STACK_LID */, "(SEPARATOR_STACK_LID)"));
      const callBeginStackLid = new AstNode(new Token(6 /* STACK_LID */, "(CALL_BEGIN_STACK_LID)"));
      let nextOperatorPrecedences = _Parser.getNextOperatorPrecedences(tokens);
      let itoken = 0;
      do {
        const token = tokens[itoken];
        if (token.type === 0 /* NUMBER_LITERAL */ || token.type === 4 /* VARIABLE_IDENTIFIER */ || token.type === 5 /* FUNCTION_IDENTIFIER */) {
          stack.push(new AstNode(token));
          itoken++;
          continue;
        } else if (token.type === 3 /* PARENTHESIS */) {
          if (token.word === "(") {
            stack.push(parenthesisStackLid);
          } else {
            const operatorNode = _Parser.popPartialExprNodes(stack, parenthesisStackLid)[0];
            stack.push(operatorNode);
            _Parser.connectOperatorsInStack(stack, nextOperatorPrecedences[itoken]);
          }
          itoken++;
          continue;
        } else if (token.type === 2 /* EXPRESSION_SEPARATOR */) {
          stack.push(separatorStackLid);
          itoken++;
          continue;
        } else if (token.type === 1 /* OPERATOR */) {
          let operatorNode = new AstNode(token);
          const nextOpPrecedence = nextOperatorPrecedences[itoken];
          if (token.operator?.type === 0 /* UNARY_PREFIX */) {
            if (_Parser.shouldAddRightTokenAsOperand(token.operator.precedence, nextOpPrecedence)) {
              operatorNode.childNodeList.push(new AstNode(tokens[itoken + 1]));
              itoken++;
            }
          } else if (token.operator?.type === 1 /* BINARY */) {
            operatorNode.childNodeList.push(stack.pop());
            if (_Parser.shouldAddRightTokenAsOperand(token.operator.precedence, nextOpPrecedence)) {
              operatorNode.childNodeList.push(new AstNode(tokens[itoken + 1]));
              itoken++;
            }
          } else if (token.operator?.type === 2 /* CALL */) {
            if (token.word === "(") {
              operatorNode.childNodeList.push(stack.pop());
              stack.push(operatorNode);
              stack.push(callBeginStackLid);
              itoken++;
              continue;
            } else {
              const argNodes = _Parser.popPartialExprNodes(stack, callBeginStackLid);
              operatorNode = stack.pop();
              for (const argNode of argNodes) {
                operatorNode.childNodeList.push(argNode);
              }
            }
          }
          stack.push(operatorNode);
          _Parser.connectOperatorsInStack(stack, nextOperatorPrecedences[itoken]);
          itoken++;
          continue;
        } else {
          throw new ExevalatorImplementationError(`Unexpected token type: ${TokenType[token.type]}`);
        }
      } while (itoken < tokenCount);
      const rootNodeOfExpressionAst = stack.pop();
      rootNodeOfExpressionAst.checkDepth(1, StaticSettings.MAX_AST_DEPTH);
      return rootNodeOfExpressionAst;
    }
    /**
     * Judges whether the right-side token should be connected directly as an operand, to the target operator.
     *
     * @param targetOperatorPrecedence - The precedence of the target operator (smaller value gives higher precedence).
     * @param nextOperatorPrecedence - The precedence of the next operator (smaller value gives higher precedence).
     * @return Returns true if the right-side token (operand) should be connected to the target operator.
     */
    static shouldAddRightTokenAsOperand(targetOperatorPrecedence, nextOperatorPrecedence) {
      return targetOperatorPrecedence <= nextOperatorPrecedence;
    }
    /**
     * Judges whether the node at the stack-top is an operator-type node,
     * and it is prior (has stronger precedence) to the next operator.
     *
     * @param stack - The working stack used for the parsing.
     * @param nextOperatorPrecedence - The precedence of the next operator (smaller value gives higher precedence).
     * @return Returns true if the stack top is operator-type node, and is prior to the next operator.
     */
    static isStackTopPriorOperator(stack, nextOperatorPrecedence) {
      if (stack.length == 0) {
        return false;
      }
      let stackTopToken = stack[stack.length - 1].token;
      if (stackTopToken.type != 1 /* OPERATOR */ || !stackTopToken.operator) {
        return false;
      }
      return stackTopToken.operator.precedence <= nextOperatorPrecedence;
    }
    /**
     * Connects all operators in the stack of which precedence is higher than the next operator's precedence.
     * 
     * @param stack - The working stack used for the parsing.
     * @param nextOperatorPrecedence - The precedence of the next operator (smaller value gives higher precedence).
     */
    static connectOperatorsInStack(stack, nextOperatorPrecedence) {
      let stackTopOperatorNode = stack.pop();
      if (stackTopOperatorNode.token.type !== 1 /* OPERATOR */) {
        throw new ExevalatorImplementationError(
          "The top node of the stack must be an operator-type node when calling connectOperatorsInStack()."
        );
      }
      while (_Parser.isStackTopPriorOperator(stack, nextOperatorPrecedence)) {
        const operandOperatorNode = stackTopOperatorNode;
        stackTopOperatorNode = stack.pop();
        if (stackTopOperatorNode.token.type !== 1 /* OPERATOR */) {
          throw new ExevalatorImplementationError(
            "The popped node must be an operator-type node because isRightOperandForStackTopOperator() returned true."
          );
        }
        stackTopOperatorNode.childNodeList.push(operandOperatorNode);
      }
      stack.push(stackTopOperatorNode);
    }
    /**
     * Pops root nodes of ASTs of partial expressions constructed on the stack.
     * In the returned array, the popped nodes are stored in FIFO order.
     *
     * @param stack - The working stack used for the parsing.
     * @param endStackLidNode - The temporary node pushed in the stack, at the end of partial expressions to be popped.
     * @return Root nodes of ASTs of partial expressions.
     */
    static popPartialExprNodes(stack, endStackLidNode) {
      if (stack.length == 0) {
        throw new ExevalatorError(ErrorMessages.UNEXPECTED_PARTIAL_EXPRESSION);
      }
      let partialExprNodeList = [];
      while (stack.length != 0) {
        if (stack[stack.length - 1].token.type === 6 /* STACK_LID */) {
          let stackLidNode = stack.pop();
          if (stackLidNode === endStackLidNode) {
            break;
          }
        } else {
          let partialExprNode = stack.pop();
          if (partialExprNode) {
            partialExprNodeList.push(partialExprNode);
          }
        }
      }
      const nodeCount = partialExprNodeList.length;
      let partialExprNodes = new Array(nodeCount);
      for (let inode = 0; inode < nodeCount; inode++) {
        partialExprNodes[inode] = partialExprNodeList[nodeCount - inode - 1];
      }
      return partialExprNodes;
    }
    /**
     * Returns an array storing next operator's precedence for each token.
     * In the returned array, it will stored at [i] that
     * precedence of the first operator of which token-index is greater than i.
     *
     * @param tokens - All tokens to be parsed.
     * @return The array storing next operator's precedence for each token.
     */
    static getNextOperatorPrecedences(tokens) {
      const tokenCount = tokens.length;
      let lastOperatorPrecedence = Number.MAX_SAFE_INTEGER;
      let nextOperatorPrecedences = new Array(tokenCount);
      for (let itoken = tokenCount - 1; 0 <= itoken; itoken--) {
        const token = tokens[itoken];
        nextOperatorPrecedences[itoken] = lastOperatorPrecedence;
        if (token.type === 1 /* OPERATOR */ && token.operator) {
          lastOperatorPrecedence = token.operator.precedence;
        }
        if (token.type === 3 /* PARENTHESIS */) {
          if (token.word === "(") {
            lastOperatorPrecedence = 0;
          } else {
            lastOperatorPrecedence = Number.MAX_SAFE_INTEGER;
          }
        }
      }
      return nextOperatorPrecedences;
    }
  };
  var OperatorType = /* @__PURE__ */ ((OperatorType2) => {
    OperatorType2[OperatorType2["UNARY_PREFIX"] = 0] = "UNARY_PREFIX";
    OperatorType2[OperatorType2["BINARY"] = 1] = "BINARY";
    OperatorType2[OperatorType2["CALL"] = 2] = "CALL";
    return OperatorType2;
  })(OperatorType || {});
  var Operator = class {
    /** The symbol of this operator (for example: '+'). */
    symbol;
    /** The precedence of this operator (smaller value gives higher precedence). */
    precedence;
    /** The type of operator tokens. */
    type;
    /**
     * Create an Operator instance storing specified information.
     *
     * @param type - The type of this operator.
     * @param symbol - The symbol of this operator.
     * @param precedence - The precedence of this operator.
     */
    constructor(type, symbol, precedence) {
      this.type = type;
      this.symbol = symbol;
      this.precedence = precedence;
    }
    /**
     * Returns the String representation of this Operator instance.
     */
    toString() {
      return `Operator [symbol=${this.symbol}, precedence=${this.precedence}, type=${this.type}]`;
    }
  };
  var TokenType = /* @__PURE__ */ ((TokenType2) => {
    TokenType2[TokenType2["NUMBER_LITERAL"] = 0] = "NUMBER_LITERAL";
    TokenType2[TokenType2["OPERATOR"] = 1] = "OPERATOR";
    TokenType2[TokenType2["EXPRESSION_SEPARATOR"] = 2] = "EXPRESSION_SEPARATOR";
    TokenType2[TokenType2["PARENTHESIS"] = 3] = "PARENTHESIS";
    TokenType2[TokenType2["VARIABLE_IDENTIFIER"] = 4] = "VARIABLE_IDENTIFIER";
    TokenType2[TokenType2["FUNCTION_IDENTIFIER"] = 5] = "FUNCTION_IDENTIFIER";
    TokenType2[TokenType2["STACK_LID"] = 6] = "STACK_LID";
    return TokenType2;
  })(TokenType || {});
  var Token = class {
    /** The type of this token. */
    type;
    /** The text representation of this token. */
    word;
    /** The detailed information of the operator, if the type of this token is OPERATOR. */
    operator;
    /**
     * Create an Token instance storing specified information.
     *
     * @param type - The type of this token.
     * @param word - The text representation of this token.
     * @param operator - The detailed information of the operator, for OPERATOR type tokens.
     */
    constructor(type, word, operator) {
      this.type = type;
      this.word = word;
      if (operator) {
        this.operator = operator;
      }
    }
    /**
     * Returns the String representation of this Token instance.
     */
    toString() {
      if (!this.operator) {
        return `Token [type=${TokenType[this.type]}, word=${this.word}]`;
      } else {
        return `Token [type=${TokenType[this.type]}, word=${this.word}, operator.type=${OperatorType[this.operator.type]}, operator.precedence=${this.operator.precedence}]`;
      }
    }
  };
  var AstNode = class {
    /** The token corresponding with this AST node. */
    token;
    /** The list of child nodes of this AST node. */
    childNodeList;
    /**
     * Create an AST node instance storing specified information.
     *
     * @param token - The token corresponding with this AST node
     */
    constructor(token) {
      this.token = token;
      this.childNodeList = [];
    }
    /**
     * Checks that depths in the AST of all nodes under this node (child nodes, grandchild nodes, and so on)
     * does not exceeds the specified maximum value.
     * An ExevalatorException will be thrown when the depth exceeds the maximum value.
     * If the depth does not exceeds the maximum value, nothing will occur.
     *
     * @param depthOfThisNode - The depth of this node in the AST.
     * @param maxAstDepth - The maximum value of the depth of the AST.
     */
    checkDepth(depthOfThisNode, maxAstDepth) {
      if (maxAstDepth < depthOfThisNode) {
        throw new ExevalatorError(ErrorMessages.EXCEEDS_MAX_AST_DEPTH.replace("$0", StaticSettings.MAX_AST_DEPTH.toString()));
      }
      for (const childNode of this.childNodeList) {
        childNode.checkDepth(depthOfThisNode + 1, maxAstDepth);
      }
    }
    /**
     * Expresses the AST under this node in XML-like text format.
     *
     * @param indentStage - The stage of indent of this node.
     * @return XML-like text representation of the AST under this node.
     */
    toMarkuppedText(indentStage = 0) {
      let indent = "";
      for (let istage = 0; istage < indentStage; istage++) {
        indent += StaticSettings.AST_INDENT;
      }
      const eol = "\n";
      let result = "";
      result += indent;
      result += "<";
      result += TokenType[this.token.type];
      result += ' word="';
      result += this.token.word;
      result += '"';
      if (this.token.type === 1 /* OPERATOR */) {
        if (this.token.operator) {
          result += ' optype="';
          result += OperatorType[this.token.operator.type];
          result += '" precedence="';
          result += this.token.operator?.precedence;
          result += '"';
        }
      }
      if (0 < this.childNodeList.length) {
        result += ">";
        for (const childNode of this.childNodeList) {
          result += eol;
          result += childNode.toMarkuppedText(indentStage + 1);
        }
        result += eol;
        result += indent;
        result += "</";
        result += TokenType[this.token.type];
        result += ">";
      } else {
        result += " />";
      }
      return result;
    }
  };
  var Evaluator = class _Evaluator {
    /** The tree of evaluator nodes, which evaluates an expression. */
    evaluatorNodeTree = void 0;
    /**
     * Updates the state to evaluate the value of the AST.
     *
     * @param ast The root node of the AST.
     * @param variableTable - The Map mapping each variable name to an address of the variable.
     * @param functionTable - The Map mapping each function name to an IExevalatorFunction instance.
     */
    update(ast, variableTable, functionTable) {
      this.evaluatorNodeTree = _Evaluator.createEvaluatorNodeTree(ast, variableTable, functionTable);
    }
    /**
     * Returns whether "evaluate" method is available on the current state.
     *
     * @returns Returns true if "evaluate" method is available.
     */
    isEvaluatable() {
      if (this.evaluatorNodeTree) {
        return true;
      }
      return false;
    }
    /**
     * Evaluates the value of the AST set by "update" method.
     *
     * @param memory - The Vec used as as a virtual memory storing values of variables.
     * @returns The evaluated value.
     */
    evaluate(memory) {
      return this.evaluatorNodeTree.evaluate(memory);
    }
    /**
     * Creates a tree of evaluator nodes corresponding with the specified AST.
     *
     * @param ast - The root node of the AST.
     * @param variableTable - The Map mapping each variable name to an address of the variable.
     * @param functionTable - The Map mapping each function name to an IExevalatorFunction instance.
     * @returns The root node of the created tree of evaluator nodes.
     */
    static createEvaluatorNodeTree(ast, variableTable, functionTable) {
      const childNodeList = ast.childNodeList;
      const childCount = childNodeList.length;
      let childNodeNodes = new Array(childCount);
      for (let ichild = 0; ichild < childCount; ichild++) {
        const childAstNode = childNodeList[ichild];
        const childEvaluatorNode = _Evaluator.createEvaluatorNodeTree(childAstNode, variableTable, functionTable);
        if (childEvaluatorNode) {
          childNodeNodes[ichild] = childEvaluatorNode;
        }
      }
      const token = ast.token;
      if (token.type === 0 /* NUMBER_LITERAL */) {
        return new NumberLiteralEvaluatorNode(token.word);
      } else if (token.type === 4 /* VARIABLE_IDENTIFIER */) {
        if (!variableTable.has(token.word)) {
          throw new ExevalatorError(ErrorMessages.VARIABLE_NOT_FOUND.replace("$0", token.word));
        }
        const address = variableTable.get(token.word);
        return new VariableEvaluatorNode(address);
      } else if (token.type === 5 /* FUNCTION_IDENTIFIER */) {
        return new NopEvaluatorNode();
      } else if (token.type === 1 /* OPERATOR */) {
        const op = token.operator;
        if (op.type === 0 /* UNARY_PREFIX */ && op.symbol === "-") {
          return new MinusEvaluatorNode(childNodeNodes[0]);
        } else if (op.type === 1 /* BINARY */ && op.symbol === "+") {
          return new AdditionEvaluatorNode(childNodeNodes[0], childNodeNodes[1]);
        } else if (op.type === 1 /* BINARY */ && op.symbol === "-") {
          return new SubtractionEvaluatorNode(childNodeNodes[0], childNodeNodes[1]);
        } else if (op.type === 1 /* BINARY */ && op.symbol === "*") {
          return new MultiplicationEvaluatorNode(childNodeNodes[0], childNodeNodes[1]);
        } else if (op.type === 1 /* BINARY */ && op.symbol === "/") {
          return new DivisionEvaluatorNode(childNodeNodes[0], childNodeNodes[1]);
        } else if (op.type === 2 /* CALL */ && op.symbol === "(") {
          const identifier = childNodeList[0].token.word;
          if (!functionTable.has(identifier)) {
            throw new ExevalatorError(ErrorMessages.FUNCTION_NOT_FOUND.replace("$0", identifier));
          }
          const functionImpl = functionTable.get(identifier);
          const argCount = childCount - 1;
          let argNodes = new Array(argCount);
          for (let iarg = 0; iarg < argCount; iarg++) {
            argNodes[iarg] = childNodeNodes[iarg + 1];
          }
          return new FunctionEvaluatorNode(functionImpl, identifier, argNodes);
        } else {
          throw new ExevalatorError(ErrorMessages.UNEXPECTED_OPERATOR.replace("$0", op.symbol));
        }
      } else {
        throw new ExevalatorError(ErrorMessages.UNEXPECTED_TOKEN.replace("$0", TokenType[token.type]));
      }
    }
  };
  var EvaluatorNode = class {
  };
  var NopEvaluatorNode = class extends EvaluatorNode {
    /**
     * Performs nothing.
     *
     * @param memory - The array storing values of variables.
     * @returns Always returns NaN.
     */
    evaluate(memory) {
      return NaN;
    }
  };
  var BinaryOperationEvaluatorNode = class extends EvaluatorNode {
    /**
     * Initializes operands.
     *
     * @param leftOperandNode - The node for evaluating the left-side operand
     * @param rightOperandNode - The node for evaluating the right-side operand
     */
    constructor(leftOperandNode, rightOperandNode) {
      super();
      this.leftOperandNode = leftOperandNode;
      this.rightOperandNode = rightOperandNode;
    }
  };
  var AdditionEvaluatorNode = class extends BinaryOperationEvaluatorNode {
    /**
     * Initializes operands.
     *
     * @param leftOperandNode - The node for evaluating the left-side operand.
     * @param rightOperandNode - The node for evaluating the right-side operand.
     */
    constructor(leftOperandNode, rightOperandNode) {
      super(leftOperandNode, rightOperandNode);
    }
    /**
     * Performs the addition.
     *
     * @param memory - The array storing values of variables.
     * @return The result value of the addition.
     */
    evaluate(memory) {
      return this.leftOperandNode.evaluate(memory) + this.rightOperandNode.evaluate(memory);
    }
  };
  var SubtractionEvaluatorNode = class extends BinaryOperationEvaluatorNode {
    /**
     * Initializes operands.
     *
     * @param leftOperandNode - The node for evaluating the left-side operand.
     * @param rightOperandNode - The node for evaluating the right-side operand.
     */
    constructor(leftOperandNode, rightOperandNode) {
      super(leftOperandNode, rightOperandNode);
    }
    /**
     * Performs the subtraction.
     *
     * @param memory - The array storing values of variables.
     * @return The result value of the subtraction.
     */
    evaluate(memory) {
      return this.leftOperandNode.evaluate(memory) - this.rightOperandNode.evaluate(memory);
    }
  };
  var MultiplicationEvaluatorNode = class extends BinaryOperationEvaluatorNode {
    /**
     * Initializes operands.
     *
     * @param leftOperandNode - The node for evaluating the left-side operand.
     * @param rightOperandNode - The node for evaluating the right-side operand.
     */
    constructor(leftOperandNode, rightOperandNode) {
      super(leftOperandNode, rightOperandNode);
    }
    /**
     * Performs the multiplication.
     *
     * @param memory - The array storing values of variables.
     * @return The result value of the multiplication.
     */
    evaluate(memory) {
      return this.leftOperandNode.evaluate(memory) * this.rightOperandNode.evaluate(memory);
    }
  };
  var DivisionEvaluatorNode = class extends BinaryOperationEvaluatorNode {
    /**
     * Initializes operands.
     *
     * @param leftOperandNode - The node for evaluating the left-side operand.
     * @param rightOperandNode - The node for evaluating the right-side operand.
     */
    constructor(leftOperandNode, rightOperandNode) {
      super(leftOperandNode, rightOperandNode);
    }
    /**
     * Performs the division.
     *
     * @param memory - The array storing values of variables.
     * @return The result value of the division.
     */
    evaluate(memory) {
      return this.leftOperandNode.evaluate(memory) / this.rightOperandNode.evaluate(memory);
    }
  };
  var MinusEvaluatorNode = class extends EvaluatorNode {
    /**
     * Initializes the operand.
     *
     * @param operandNode The node for evaluating the operand
     */
    constructor(operandNode) {
      super();
      this.operandNode = operandNode;
    }
    /**
     * Performs the division.
     *
     * @param memory - The array storing values of variables.
     * @return The result value of the division.
     */
    evaluate(memory) {
      return -this.operandNode.evaluate(memory);
    }
  };
  var NumberLiteralEvaluatorNode = class extends EvaluatorNode {
    /** The value of the number literal. */
    value;
    /**
     * Initializes the value of the number literal.
     *
     * @param literal The number literal.
     * @throws ExevalatorError - Thrown if it failed to convert the literal to a numeric value.
     */
    constructor(literal) {
      super();
      this.value = Number(literal);
      if (isNaN(this.value)) {
        throw new ExevalatorError(ErrorMessages.INVALID_NUMBER_LITERAL.replace("$0", literal));
      }
      this.value += 0;
    }
    /**
     * Returns the value of the number literal.
     *
     * @param memory - The array storing values of variables.
     * @return The value of the number literal.
     */
    evaluate(memory) {
      return this.value;
    }
  };
  var VariableEvaluatorNode = class extends EvaluatorNode {
    /**
     * Initializes the address of the variable.
     *
     * @param address - The address of the variable.
     */
    constructor(address) {
      super();
      this.address = address;
      if (address < 0 || address > 4294967295 || !Number.isInteger(address)) {
        throw new ExevalatorError(ErrorMessages.ADDRESS_MUST_BE_ZERO_OR_POSITIVE_INT32.replace("$0", address.toString()));
      }
    }
    /**
     * Returns the value of the variable.
     *
     * @param memory - The array storing values of variables.
     * @return The value of the variable.
     */
    evaluate(memory) {
      if (this.address < 0 || memory.length <= this.address) {
        throw new ExevalatorError(ErrorMessages.INVALID_MEMORY_ADDRESS.replace("$0", this.address.toString()));
      }
      this.address = (this.address | 0) & ~(this.address >> 31) & (StaticSettings.MAX_VARIABLE_COUNT - 1 | 0);
      return memory[this.address];
    }
  };
  var FunctionEvaluatorNode = class extends EvaluatorNode {
    /**
     * Initializes information of functions to be called.
     *
     * @param functionImpl - The function to be called.
     * @param functionName - The name of the function.
     * @param argumentEvalNodes - Evaluator nodes for evaluating values of arguments.
     */
    constructor(functionImpl, functionName, argumentEvalNodes) {
      super();
      this.functionImpl = functionImpl;
      this.functionName = functionName;
      this.argumentEvalNodes = argumentEvalNodes;
      this.argumentArrayBuffer = Array(this.argumentEvalNodes.length);
    }
    /** An array storing evaluated values of arguments. */
    argumentArrayBuffer;
    /**
     * Calls the function and returns the returned value of the function.
     *
     * @param memory - The array storing values of variables.
     * @return The returned value of the function.
     * @throws ExevalatorError - Thrown if any error occurred while the function is being executed.
     */
    evaluate(memory) {
      const argCount = this.argumentEvalNodes.length;
      for (let iarg = 0; iarg < argCount; iarg++) {
        this.argumentArrayBuffer[iarg] = this.argumentEvalNodes[iarg].evaluate(memory);
      }
      try {
        return this.functionImpl.invoke(this.argumentArrayBuffer);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new ExevalatorError(ErrorMessages.FUNCTION_ERROR.replace("$0", this.functionName).replace("$1", errorMessage));
      }
    }
  };
  var StaticSettings = class {
    /** The maximum number of characters in an expression. */
    static MAX_EXPRESSION_CHAR_COUNT = 256;
    /** The maximum number of characters of variable/function names. */
    static MAX_NAME_CHAR_COUNT = 64;
    /** The maximum number of tokens in an expression. */
    static MAX_TOKEN_COUNT = 64;
    /** The maximum depth of an Abstract Syntax Tree (AST). */
    static MAX_AST_DEPTH = 32;
    /** The maximum number of variables. */
    static MAX_VARIABLE_COUNT = 2 ** 10;
    // Must be in the form of 2**n and smaller than 2147483647 + 1
    // !!!!! IMPORTANT !!!!!
    // When you modified the above value, you should run "test.rs".
    /** The indent used in text representations of ASTs. */
    static AST_INDENT = "  ";
    /** The regular expression of number literals. */
    static NUMBER_LITERAL_REGEX = "(?<=(\\s|\\+|-|\\*|/|\\(|\\)|,|^))([0-9]+(\\.[0-9]+)?)((e|E)(\\+|-)?[0-9]+)?";
    // Exponent part
    /** The escaped representation of number literals in expressions */
    static ESCAPED_NUMBER_LITERAL = "@NUMBER_LITERAL@";
    /** The set of symbols of available operators. */
    static OPERATOR_SYMBOL_SET = /* @__PURE__ */ new Set([
      "+",
      "-",
      "*",
      "/",
      "(",
      ")"
    ]);
    /** The Map mapping each symbol of an unary-prefix operator to an instance of Operator class. */
    static UNARY_PREFIX_OPERATOR_SYMBOL_MAP = /* @__PURE__ */ new Map([
      ["-", new Operator(0 /* UNARY_PREFIX */, "-", 200)]
      // unary-minus operator
    ]);
    /** The Map mapping each symbol of an binary operator to an instance of Operator class. */
    static BINARY_OPERATOR_SYMBOL_MAP = /* @__PURE__ */ new Map([
      ["+", new Operator(1 /* BINARY */, "+", 400)],
      // addition operator
      ["-", new Operator(1 /* BINARY */, "-", 400)],
      // subtraction operator
      ["*", new Operator(1 /* BINARY */, "*", 300)],
      // multiplication operator
      ["/", new Operator(1 /* BINARY */, "/", 300)]
      // division operator
    ]);
    /** The Map mapping each symbol of an call operator to an instance of Operator class. */
    static CALL_OPERATOR_SYMBOL_MAP = /* @__PURE__ */ new Map([
      ["(", new Operator(2 /* CALL */, "(", 100)],
      // call-begin operator
      [")", new Operator(2 /* CALL */, ")", Number.MAX_SAFE_INTEGER)]
      // call-end operator, least prior
    ]);
    /** The list of symbols to split an expression into tokens. */
    static TOKEN_SPLITTER_SYMBOL_LIST = [
      "+",
      "-",
      "*",
      "/",
      "(",
      ")",
      ","
    ];
  };

  // rinpn-online.ts
  var RINPN_ONLINE_VERSION = "0.1.0";
  var versionLabel = document.getElementById("version-label");
  var inputField = document.getElementById("input-field");
  var outputField = document.getElementById("output-field");
  var leftButton = document.getElementById("left-button");
  var rightButton = document.getElementById("right-button");
  var calculationSmallButton = document.getElementById("calculation-small-button");
  var calculationButton = document.getElementById("calculation-button");
  var clearButton = document.getElementById("clear-button");
  var backSpaceButton = document.getElementById("back-space-button");
  var num0Button = document.getElementById("num0-button");
  var num1Button = document.getElementById("num1-button");
  var num2Button = document.getElementById("num2-button");
  var num3Button = document.getElementById("num3-button");
  var num4Button = document.getElementById("num4-button");
  var num5Button = document.getElementById("num5-button");
  var num6Button = document.getElementById("num6-button");
  var num7Button = document.getElementById("num7-button");
  var num8Button = document.getElementById("num8-button");
  var num9Button = document.getElementById("num9-button");
  var addButton = document.getElementById("add-button");
  var subButton = document.getElementById("sub-button");
  var mulButton = document.getElementById("mul-button");
  var divButton = document.getElementById("div-button");
  var dotButton = document.getElementById("dot-button");
  var commaButton = document.getElementById("comma-button");
  var sinButton = document.getElementById("sin-button");
  var cosButton = document.getElementById("cos-button");
  var tanButton = document.getElementById("tan-button");
  var asinButton = document.getElementById("asin-button");
  var acosButton = document.getElementById("acos-button");
  var atanButton = document.getElementById("atan-button");
  var absButton = document.getElementById("abs-button");
  var sqrtButton = document.getElementById("sqrt-button");
  var powButton = document.getElementById("pow-button");
  var expButton = document.getElementById("exp-button");
  var lnButton = document.getElementById("ln-button");
  var log10Button = document.getElementById("log10-button");
  var sumButton = document.getElementById("sum-button");
  var vanButton = document.getElementById("van-button");
  var van1Button = document.getElementById("van1-button");
  var meanButton = document.getElementById("mean-button");
  var sdnButton = document.getElementById("sdn-button");
  var sdn1Button = document.getElementById("sdn1-button");
  var radButton = document.getElementById("rad-button");
  var degButton = document.getElementById("deg-button");
  var piButton = document.getElementById("pi-button");
  var openParenButton = document.getElementById("open-paren-button");
  var closeParenButton = document.getElementById("close-paren-button");
  var spaceButton = document.getElementById("space-button");
  window.onload = () => {
    versionLabel.innerHTML = RINPN_ONLINE_VERSION;
  };
  function calculate() {
    const expression = inputField.value;
    if (expression.trim().length === 0) {
      outputField.value = "";
      return;
    }
    let exevalator = new Exevalator();
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
    exevalator.declareVariable("PI");
    exevalator.writeVariable("PI", Math.PI);
    try {
      const result = exevalator.eval(expression);
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
  function formatResult(rawResult) {
    if (!Number.isFinite(rawResult)) {
      return String(rawResult);
    }
    if (Object.is(rawResult, -0)) {
      rawResult = 0;
    }
    const roundedResult = rawResult.toPrecision(10);
    const eSplitted = roundedResult.split(/e/i);
    let mantissaPart = 0 < eSplitted.length ? eSplitted[0] : "";
    let exponentPart = 1 < eSplitted.length ? eSplitted[1] : "";
    if (exponentPart.startsWith("+")) {
      exponentPart = exponentPart.slice(1);
    }
    if (mantissaPart.includes(".")) {
      while (mantissaPart.endsWith("0")) {
        mantissaPart = mantissaPart.slice(0, -1);
      }
      if (mantissaPart.endsWith(".")) {
        mantissaPart = mantissaPart.slice(0, -1);
      }
    }
    let formattedResult = mantissaPart;
    if (0 < exponentPart.length) {
      formattedResult += "E" + exponentPart;
    }
    return formattedResult;
  }
  function insertToInputField(text) {
    inputField.focus();
    const caretPositionStart = inputField.selectionStart ?? inputField.value.length;
    const caretPositionEnd = inputField.selectionEnd ?? caretPositionStart;
    inputField.setRangeText(text, caretPositionStart, caretPositionEnd, "end");
    const updatedCaretPosition = caretPositionEnd + text.length;
    const isCaretAtEnd = inputField.value.length <= updatedCaretPosition;
    if (isCaretAtEnd) {
      requestAnimationFrame(() => {
        inputField.scrollLeft = inputField.scrollWidth;
      });
    }
  }
  function removeCharOrAreaFromInputField() {
    inputField.focus();
    const caretPositionStart = inputField.selectionStart ?? inputField.value.length;
    const caretPositionEnd = inputField.selectionEnd ?? caretPositionStart;
    if (caretPositionStart === caretPositionEnd) {
      const expression = inputField.value;
      const expressionHead = expression.substring(0, caretPositionStart);
      const expressionTail = expression.substring(caretPositionStart, expression.length);
      const expressionHeadTrimmed = expressionHead.length === 0 ? "" : expressionHead.slice(0, -1);
      const updatedExpression = expressionHeadTrimmed + expressionTail;
      inputField.value = updatedExpression;
      inputField.selectionStart = expressionHeadTrimmed.length;
      inputField.selectionEnd = expressionHeadTrimmed.length;
      inputField.focus();
    } else {
      inputField.setRangeText("", caretPositionStart, caretPositionEnd, "end");
      inputField.focus();
    }
  }
  function moveCaretToLeft() {
    inputField.focus();
    let caretPosition = inputField.selectionStart;
    caretPosition--;
    if (caretPosition < 0) {
      caretPosition = 0;
    }
    inputField.selectionStart = caretPosition;
    inputField.selectionEnd = caretPosition;
  }
  function moveCaretToRight() {
    inputField.focus();
    let caretPosition = inputField.selectionStart;
    caretPosition++;
    if (inputField.value.length < caretPosition) {
      caretPosition = inputField.value.length;
    }
    inputField.selectionStart = caretPosition;
    inputField.selectionEnd = caretPosition;
  }
  inputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      calculate();
    }
  });
  calculationButton.addEventListener("click", () => {
    calculate();
  });
  calculationSmallButton.addEventListener("click", () => {
    calculate();
  });
  clearButton.addEventListener("click", () => {
    inputField.value = "";
    outputField.value = "";
    inputField.focus();
  });
  backSpaceButton.addEventListener("click", () => {
    removeCharOrAreaFromInputField();
  });
  leftButton.addEventListener("click", () => {
    moveCaretToLeft();
  });
  rightButton.addEventListener("click", () => {
    moveCaretToRight();
  });
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
  var SinFunction = class {
    invoke(args) {
      if (args.length != 1) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
      }
      return Math.sin(args[0]);
    }
  };
  var CosFunction = class {
    invoke(args) {
      if (args.length != 1) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
      }
      return Math.cos(args[0]);
    }
  };
  var TanFunction = class {
    invoke(args) {
      if (args.length != 1) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
      }
      return Math.tan(args[0]);
    }
  };
  var AsinFunction = class {
    invoke(args) {
      if (args.length != 1) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
      }
      return Math.asin(args[0]);
    }
  };
  var AcosFunction = class {
    invoke(args) {
      if (args.length != 1) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
      }
      return Math.acos(args[0]);
    }
  };
  var AtanFunction = class {
    invoke(args) {
      if (args.length != 1) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
      }
      return Math.atan(args[0]);
    }
  };
  var AbsFunction = class {
    invoke(args) {
      if (args.length != 1) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
      }
      return Math.abs(args[0]);
    }
  };
  var SqrtFunction = class {
    invoke(args) {
      if (args.length != 1) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
      }
      return Math.sqrt(args[0]);
    }
  };
  var PowFunction = class {
    invoke(args) {
      if (args.length != 2) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: 2)");
      }
      return Math.pow(args[0], args[1]);
    }
  };
  var ExpFunction = class {
    invoke(args) {
      if (args.length != 1) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
      }
      return Math.exp(args[0]);
    }
  };
  var LnFunction = class {
    invoke(args) {
      if (args.length != 1) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
      }
      return Math.log(args[0]);
    }
  };
  var Log10Function = class {
    invoke(args) {
      if (args.length != 1) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
      }
      return Math.log10(args[0]);
    }
  };
  var SumFunction = class {
    invoke(args) {
      if (args.length === 0) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: more than 1)");
      }
      return StatisticsCalculator.sum(args);
    }
  };
  var VanFunction = class {
    invoke(args) {
      if (args.length === 0) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: more than 1)");
      }
      return StatisticsCalculator.van(args);
    }
  };
  var Van1Function = class {
    invoke(args) {
      if (args.length <= 1) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: more than 2)");
      }
      return StatisticsCalculator.van1(args);
    }
  };
  var SdnFunction = class {
    invoke(args) {
      if (args.length === 0) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: more than 1)");
      }
      return StatisticsCalculator.sdn(args);
    }
  };
  var Sdn1Function = class {
    invoke(args) {
      if (args.length <= 1) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: more than 2)");
      }
      return StatisticsCalculator.sdn1(args);
    }
  };
  var MeanFunction = class {
    invoke(args) {
      if (args.length === 0) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: more than 1)");
      }
      return StatisticsCalculator.mean(args);
    }
  };
  var RadFunction = class {
    invoke(args) {
      if (args.length === 0) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
      }
      const degValue = args[0];
      const radValue = Math.PI * degValue / 180;
      return radValue;
    }
  };
  var DegFunction = class {
    invoke(args) {
      if (args.length === 0) {
        throw new ExevalatorError("Unexpected number of arguments. (expected: 1)");
      }
      const radValue = args[0];
      const degValue = 180 * radValue / Math.PI;
      return degValue;
    }
  };
  var StatisticsCalculator = class _StatisticsCalculator {
    // Calculate the summation value of the args
    static sum(args) {
      const argCount = args.length;
      let sumValue = 0;
      for (let iarg = 0; iarg < argCount; iarg++) {
        const arg = args[iarg];
        sumValue += arg;
      }
      return sumValue;
    }
    // Calculate the summation value of the args
    static mean(args) {
      const argCount = args.length;
      const sumValue = _StatisticsCalculator.sum(args);
      const meanValue = sumValue / argCount;
      return meanValue;
    }
    // Calculate the variance (n)
    static van(args) {
      const argCount = args.length;
      const meanValue = _StatisticsCalculator.mean(args);
      let sumSquareDiffValue = 0;
      for (let iarg = 0; iarg < argCount; iarg++) {
        const arg = args[iarg];
        const squareDiffValue = (arg - meanValue) * (arg - meanValue);
        sumSquareDiffValue += squareDiffValue;
      }
      const vanValue = sumSquareDiffValue / argCount;
      return vanValue;
    }
    // Calculate the variance (n - 1)
    static van1(args) {
      const argCount = args.length;
      const meanValue = _StatisticsCalculator.mean(args);
      let sumSquareDiffValue = 0;
      for (let iarg = 0; iarg < argCount; iarg++) {
        const arg = args[iarg];
        const squareDiffValue = (arg - meanValue) * (arg - meanValue);
        sumSquareDiffValue += squareDiffValue;
      }
      const van1Value = sumSquareDiffValue / (argCount - 1);
      return van1Value;
    }
    // Calculate the standard deviation (n)
    static sdn(args) {
      const sdnValue = Math.sqrt(_StatisticsCalculator.van(args));
      return sdnValue;
    }
    // Calculate the standard deviation (n - 1)
    static sdn1(args) {
      const sdnValue = Math.sqrt(_StatisticsCalculator.van1(args));
      return sdnValue;
    }
  };
})();
