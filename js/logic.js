/*
    logic.js
    author: Daniel Dobeš

    contains utility related to logic

    - tokenizing expression
    - testing parentheses parity
    - analyze logic expression
    - transforms infix form to prefix form
    - token determination 
        (isNot, isImp, isUnaryOperator, isParenthes,...)
    
*/

// precedence for operators
const PAR_PRECEDENCE = 1;
const NOT_PRECEDENCE = 2;
const AND_PRECEDENCE = 3;
const OR_PRECEDENCE = 3;
const IMP_PRECEDENCE = 4;
const EQU_PRECEDENCE = 4;


// regular expression patterns to match logic operators
const notPattern = /[nN][oO][tT]|~/;
const andPattern = /[aA][nN][dD]|\*/;
const orPattern = /[oO][rR]|\+/;
const impPattern = /[iI][mM][pP]|\>/;
const equPattern = /[eE][qQ][uU]|\=/;

const unPattern = notPattern; //new RegExp([notPattern].map(unPattern => `(${unPattern.source})`).join('|'), 'g');
const binPattern = new RegExp([andPattern, orPattern, impPattern, equPattern].map(binPattern => `(${binPattern.source})`).join('|'), 'g');

// regular expression pattern for any variable (letter/underscore followed by any amount of letters/digits/underscores)
const varPattern = /[a-zA-Z_][a-zA-Z0-9_]*/;
//const varPattern = new RegExp("^(?!.*(?:" + unPattern.source + "|" + binPattern.source + "))[a-zA-Z_][a-zA-Z0-9_]*");

// regular expression pattern for parentheses
const lParPattern = /[l|L][p|P][a|A][r|R]|\(/;
const rParPattern = /[r|R][p|P][a|A][r|R]|\)/;
const parPattern = new RegExp([lParPattern,rParPattern].map(parPattern => `(${parPattern.source})`).join('|'), 'g');

// combine the regular expression patterns into a single pattern
const pattern = new RegExp([unPattern, binPattern, varPattern, parPattern].map(pattern => `(${pattern.source})`).join('|'), 'g');

// regular expression pattern that is not valid - used when not testing invalid tokens
const invalidPattern = /%/;

// regular expression pattern that represents truth statement
const truePattern = /T|[T|t]rue/;

// regular expression pattern that represents false statement
const falsePattern = /F|[F|f]alse/;

//------------------------------------------------------

/* this function split string into tokens */
const tokenizeLogicExpression = (stringExpression) => {
    // Use the combined pattern to tokenize the expression
    try{
        const tokens = stringExpression.match(pattern);
        return tokens; 
    }
    catch {
        //console.log("invalid expression.")
        return "";
    }
};

/* returns precedence of operator (int); higher number -> higher precedence */
const getPrecedence = (operator) => {
    let precedence = 0
    if (operator.match(parPattern))          precedence = PAR_PRECEDENCE;
    else if (operator.match(unPattern))      precedence = NOT_PRECEDENCE;
    else if (operator.match(binPattern)) {
        if (operator.match(andPattern))      precedence = AND_PRECEDENCE;
        else if (operator.match(orPattern))  precedence = OR_PRECEDENCE;
        else if (operator.match(impPattern)) precedence = IMP_PRECEDENCE;
        else if (operator.match(equPattern)) precedence = EQU_PRECEDENCE;
    }
        
    return 10 - precedence;
}

const isUnaryOperator = (operator) => {return (operator.match(unPattern)!== null); }
const isBinaryOperator = (operator) => { return (operator.match(binPattern)!== null); }
const isOperator = (operator) => { return (isUnaryOperator(operator) || isBinaryOperator(operator));}
const isParentheses = (operator) => { return (operator.match(parPattern)!== null); }
const isLeftParenthes = (operator) => { return (operator.match(lParPattern)!== null); }
const isRightParenthes = (operator) => { return (operator.match(rParPattern)!== null); }
const isVariable = (operator) => {
    // regular expression for variables (varPattern) with exclusion for operators does not works
    if (isUnaryOperator(operator) || isBinaryOperator(operator) || isParentheses(operator)){
        //console.log("its operator");
        return false;}
    return (operator.match(varPattern)!== null); }

const isNot = (operator) => { return (operator.match(notPattern)!== null); }
const isAnd = (operator) => { return (operator.match(andPattern)!== null); }
const isOr = (operator) => { return (operator.match(orPattern)!== null); }
const isImp = (operator) => { return (operator.match(impPattern)!== null); }
const isEqu = (operator) => { return (operator.match(equPattern)!== null); }

const isInvalid = (operator) => { return (operator.match(invalidPattern)!== null);}
const isT = (operator) => {return (operator.match(truePattern)!== null);}
const isF = (operator) => {return (operator.match(falsePattern)!== null);}

/* returns true if parentheses are in correct order and parity */
const testParenthesesParity = (array) => {
    let l_par_count = 0;
    let r_par_count = 0;

    for (const elem of array) {
        if (elem.match(lParPattern)) l_par_count++;
        if (elem.match(rParPattern)) r_par_count++;
        if (r_par_count>l_par_count) return false;
    }
    if (l_par_count === r_par_count) return true;
    return false;
}

// transform infix form to prefix form using shunting-yard algorithm
const infixToPrefix = (expression) => {

    const tokens = tokenizeLogicExpression(expression);
    
    //test parentheses in expression
    if (!testParenthesesParity(tokens)) {
        console.log("There are mismatched parentheses in expression.");
        return "";
    }
    
    // to get prefix form from infix
    tokens.reverse();
    
    const stack = [];
    const output = [];

    for (let token of tokens) {
        // no need to wait for other -> has highest precedence - only change possible using parentheses
        if (token.match(unPattern)) output.push(token);    

        // add into stack after poping all operators with higher precedence -> expecting to be evaled when this is in order - only change when parentheses
        else if (token.match(binPattern)) {                
            while (stack.length>0 && !(stack[stack.length-1].match(rParPattern)) && getPrecedence(token) <= getPrecedence(stack[stack.length-1])){
                output.push(stack.pop());
            }
            stack.push(token)
        }                
        else if (token.match(rParPattern)) stack.push(token);
        else if (token.match(lParPattern)){ 
            while (stack.length>0 && !stack[stack.length-1].match(rParPattern)) output.push(stack.pop());
            stack.pop();    // discard right parenthes
        }

        //tested at the end for not matching variables with text representing other tokens
        else if (isVariable(token)){ output.push(token); } 
    }
    
    // add all operators from stack
    while (stack.length > 0) {
        output.push(stack.pop());
    }
    // revesrse to get prefix expression
    return output.reverse().join(' ');
};


const analyze = (expression) => {
    const tokens = tokenizeLogicExpression(expression)
    for (let token of tokens) {
        if (isUnaryOperator(token)) {console.log("UNARY: " + token);}
        else if (isBinaryOperator(token)) {console.log("BINARY: " + token);}
        else if (isParentheses(token)) {console.log("PARENTHESES: " + token);}
        else if (isVariable(token)) {console.log("VARIABLE: " + token);}
        else { console.log("other"); }
    }
}