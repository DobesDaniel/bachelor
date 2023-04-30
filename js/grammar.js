/*
    grammar.js
    author: Daniel Dobeš

    contains function for syntax validation

    Grammar: 
        S -> A
        A -> C B
        B -> <unary-operator> C B | <epsilon>
        C -> <binary-operator> C | ( A ) | variable

        <unary-operator>:   "NOT"
        <binary-operator>:  "AND" | "OR" | "IMP | "EQU"
        <variable>:         "name"
        <epsilon>:          empty

*/

const LOGGING = false;

const isValidLogicExpression = (string_input) => {
    const tokens = tokenizeLogicExpression(string_input);  
    let index = 0;
    let error_msg = 'Invalid input.';
  
    function getToken() {
      if (index < tokens.length) return tokens[index++];
      return "%";
    }
  
    // Start non-terminal
    // S -> A
    function expression() {
        return A();
    }
  
    // A -> C B
    function A() {
        const c = C();
        return B(c);
    }

    // B -> <unary-operator> C B | <epsilon>
    function B(left) {
        const token = getToken();
        // <unary-operator> C B
        if (isUnaryOperator(token)) {
            const c = C();
            const right = B(c);
            return Boolean(right);
        }
        else if (isBinaryOperator(token)) {
            const c = C();
            const right = B(c);
            if (right) return left + " " + token + " " + right;
            else 
                error_msg = "Invalid token found: {" + token + "}."; 
                return false;
        }
        // <epsilon>
        else {
            index--;
            return left;
        }
    }
  
    // C -> <binary-operator> C | ( A ) | variable
    function C() {
        // <binary-operator> C
        const token = getToken();
        if (isUnaryOperator(token)) {            
            const c = C();
            return token + " " + c;
        }
        // ( A )
        else if (isLeftParenthes(token)) {
            const a = A();
            const token_right = getToken()
            if (isRightParenthes(token_right)) return token + " " + a + " " + token_right;
            else {    
                error_msg = "Invalid parentheses.";
                return false;
            }
        }
        // <variable>
        else if (isVariable(token)) {
            return token;
        } 
        else {
            //error_msg = "Missing token."
            error_msg = token==='%' ? "Missing token." : "Invalid token found: {" + token + "}.";
            return false;
        }
    }
  
    if (tokens === null) {
        error_msg = "No tokens found!";
        return [false, string_input, error_msg];
    }

    const retVal = expression();
    error_msg = retVal===true? "" : error_msg;

    // return true/false (retValue is not false/null) and also all tokens has been parsed in retVal and error message
    return [retVal && tokenizeLogicExpression(retVal).length === tokens.length, retVal, error_msg];    // return true / false
  };

const isValidFormula = (string_input) => {
    return isValidLogicExpression(string_input);
}
  