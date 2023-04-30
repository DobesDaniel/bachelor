/*
    formula.js
    author: Daniel Dobeš

    FormulaNode - representation node of (binary) tree
    FormulaTree - representation of whole formula
    
*/

class FormulaNode {
    constructor(value, left=null, right=null) {
        this.value = value;
        this.eval = null;
        this.left = left;
        this.right = right;
    }


    isLeaf() { return !this.left && !this.right }

    isClause() {
        
        // this is variable (leaf)
        if (this.isLeaf()) return true;

        // this is not with leaf
        if (isNot(this.value)){
            return this.right.isLeaf();
        }

        // this is or between 2 leafs
        if (isOr(this.value)){
            return this.left.isClause() && this.right.isClause();
        }

        // this is not clause
        return false;
    }

    makeCopy() {
        //console.log("making copy...");
        const new_node = new FormulaNode(this.value);
        let new_left = null;
        let new_right = null;
        
        if (this.left !== null) {
            //console.log(this.left);
            if (isVariable(this.left.value)) new_left = this.left;
            else new_left = this.left.makeCopy();
        }

        if (this.right !== null) {
            //console.log(this.right);
            if (isVariable(this.right.value)) new_right = this.right;
            else new_right = this.right.makeCopy();
        }
        new_node.left = new_left;
        new_node.right = new_right;
        
        return new_node;
    }

    // in order traversal - returns all values in order (left-root-right) and root index
    getAllValues() {
        const values = [];
        const order = [];
        let idx = 0;
        if (this.left !== null) {
            let left_values = [];
            [left_values,idx] = this.left.getAllValues();
            for (let i = 0; i < left_values.length; i++) { values.push(left_values[i]); }
        }
        //console.log("adding value = " + this.value);
        const current_idx = values.length;
        order.push(current_idx);
        values.push(this.value);
        
        if (this.right !== null) {
            let right_values = [];
            [right_values, idx] = this.right.getAllValues();
            for (let i = 0; i < right_values.length; i++) { values.push(right_values[i]); }
        }
        return [values, current_idx];
    }

    getAllEvals() {
        const evals = []
        if (this.left !== null) {
            const left_evals = this.left.getAllEvals();
            for (let i = 0; i < left_evals.length; i++) { evals.push(left_evals[i]); }
        }
        evals.push(this.eval);
        if (this.right !== null) {
            const right_evals = this.right.getAllEvals();
            for (let i = 0; i < right_evals.length; i++) { evals.push(right_evals[i]); }
          }
        return evals;
    }

    // in order traversal with reset eval parameter
    resetEvals(){
        if (this.left !== null) {
            this.left.resetEvals();
        }

        this.eval = null;

        if (this.right !== null) {
            this.right.resetEvals()
        }

    }

    // returns all unique variables in order
    getAllVariables() {
        let idx = 0;
        let values = [];
        [values, idx] = this.getAllValues();
        const variables = values.filter((value) => isVariable(value));
        const unique_variables = [...new Set(variables)];
        return unique_variables;
    }

    // returns all operators with repetitions
    getAllOperators() {
        let idx = 0;
        let values = [];
        [values, idx] = this.getAllValues();
        const operators = values.filter((value) => isOperator(value));
        return operators;
    }

    getAllLiterals(prev_not=false){
        const literals = []

        if (this.isLeaf()) {
            if (prev_not) literals.push("!" + this.value);
            else literals.push(this.value);
        }
        else {
            if (this.left !== null) literals.push(...this.left.getAllLiterals(isNot(this.value)));
            if (this.right !== null) literals.push(...this.right.getAllLiterals(isNot(this.value)));
        }

        return literals
    }

    // returns order in what operations are done (from leaf -> root)
    getValuesHierarchy(){
        if (this.isLeaf()) return [0];
        
        const hierarchy = []
        let hierarchy_left = []
        let hierarchy_right = []
        if (this.left !== null){ hierarchy_left = this.left.getValuesHierarchy(); }
        if (this.right !== null){ hierarchy_right = this.right.getValuesHierarchy(); }
        const current_hierarchy = Math.max(Math.max(...hierarchy_left),Math.max(...hierarchy_right)) + 1;
        return [...hierarchy_left, current_hierarchy, ...hierarchy_right]
    }

    evaluate(variable_values) {
        // test that there is all evaluation in variable_values for all needed values
    
        // this is leaf -> this is variable
        if (this.isLeaf()) {
            //this.eval = isT(this.value)?true:isF(this.value)?false:variable_values[this.value];
            this.eval = variable_values[this.value];
        }
        else {
            // eval left and right 
            const left_value = this.left ? this.left.evaluate(variable_values) : null;
            const right_value = this.right ? this.right.evaluate(variable_values) : null;

            if (isNot(this.value)) { this.eval = !right_value;}
            else if (isAnd(this.value)) { this.eval = left_value && right_value;}
            else if (isOr(this.value)) { this.eval = left_value || right_value;}
            else if (isImp(this.value)) { this.eval = !left_value || right_value;}
            else if (isEqu(this.value)) { this.eval = left_value === right_value;}
            //else if (isVariable(this.value)) { this.eval = this.value;}
        }

        return this.eval;
    }

    // evaluate based from root
    // returns all_valid_evals_table and all_invalid_evals_table
    // valid eval   = evaluation that does not contain any mismatched eval for same variable
    // invalid eval = evalutaion that contains any variable with different evaluations
    reverseEvaluate(node_eval) {
        
        const all_evals_table = this._reverseEvaluate(node_eval, true);    // first is target evaluation, second if this is the "start" node / root
        const all_valid_evals_table = []
        const all_invalid_evals_table = []
        const all_mismatched_variables = []

        // filter not valid evals (one variable has different evals)
        const all_variables = this.getAllVariables();
        let tmp = 0;
        let all_values = [];
        [all_values, tmp] = this.getAllValues();

        // for each eval table
        for (let all_evals of all_evals_table) {
            
            let mismatched_variable = null;

            // for each variable
            for (let variable of all_variables) {
                let currentEval = null;

                // search for missmatch
                for (let idx = 0; idx < all_values.length; idx++) {
                    const currentValue = all_values[idx];

                    if (all_values[idx] == variable) {
                        
                        if (isT(all_values[idx])) {
                            if (all_evals[idx] !== true) mismatched_variable = variable;
                        }
                        else if (isF(all_values[idx])) {
                            if (all_evals[idx] !== false) mismatched_variable = variable;
                        }
                        if (currentEval === null) currentEval = all_evals[idx];
                        else {
                            // if difference -> missmatch found
                            if (currentEval !== all_evals[idx]) mismatched_variable = variable;
                        }
                    }
                }
            }

            // if valid eval found -> add to list of valid evals
            if (mismatched_variable === null) {
                all_valid_evals_table.push(all_evals);
            }
            else {
                all_invalid_evals_table.push(all_evals);
                all_mismatched_variables.push(mismatched_variable);
            }
        }

        return [all_valid_evals_table, all_invalid_evals_table, all_mismatched_variables];
    }

    // evaluate based on evaluation for current node
    _reverseEvaluate(node_eval, is_root) {
        
        this.eval = node_eval;

        // based on this eval and type of operator - add evaluation in left and right evals that leads to this.eval
        let left_evals = [];
        let right_evals = [];
        
        if (isNot(this.value)) {
            left_evals.push(null);
            right_evals.push(!this.eval);
        }
        else if (isAnd(this.value)) {
            if (this.eval) {
                left_evals.push(true);
                right_evals.push(true);
            }
            else {
                left_evals.push(true);
                right_evals.push(false);

                left_evals.push(false);
                right_evals.push(true);
                
                left_evals.push(false);
                right_evals.push(false);
            }
        }
        else if (isOr(this.value)) { 
            if (this.eval) {
                left_evals.push(true);
                right_evals.push(true);
                
                left_evals.push(true);
                right_evals.push(false);

                left_evals.push(false);
                right_evals.push(true);
            }
            else {
                left_evals.push(false);
                right_evals.push(false);
            }
        }
        else if (isImp(this.value)) { 
            if (this.eval) {
                left_evals.push(true);
                right_evals.push(true);

                left_evals.push(false);
                right_evals.push(true);

                left_evals.push(false);
                right_evals.push(false);
            }
            else {
                left_evals.push(true);
                right_evals.push(false);
            }
        }
        else if (isEqu(this.value)) {
            if (this.eval) {
                left_evals.push(true);
                right_evals.push(true);
                
                left_evals.push(false);
                right_evals.push(false);
            }
            else {
                left_evals.push(true);
                right_evals.push(false);

                left_evals.push(false);
                right_evals.push(true);
            }
        }
        
        const evals_table = []

        // for each left and right eval search for childs evals
        for (let i = 0; i < right_evals.length; i++) {
            // eval all childs with assumed evals
            if (this.left !== null) {
                this.left._reverseEvaluate(left_evals[i], false);
            }
            if (this.right !== null) {
                this.right._reverseEvaluate(right_evals[i], false);
            }

            if (is_root){
                evals_table.push(this.getAllEvals());
            }
        }

        if (is_root) return evals_table;
        
        return;
    }

    getCnfLiterals(){
        const all_literals = [];

        const all_variables = this.getAllVariables(); // array of all variable names
        const n = all_variables.length;               // number of variables

        // for each different variables evaluation get formula eval
        //  - if eval === 0 -> add new clause as disjunction of negative eval of each variables
        
        // generate all possible combinations of true/false evaluations for n variables
        for (let i = 0; i < Math.pow(2, n); i++) {
        
            let variable_values = {};
            for (let j = 0; j < n; j++) {
                const variable_name = all_variables[j];
                if (isT(all_variables[j])) variable_values[variable_name] = true;
                else if (isF(all_variables[j])) variable_values[variable_name] = false;
                else variable_values[variable_name] = Boolean(i & Math.pow(2, j));
            }
            const evaluation = this.evaluate(variable_values);

            // if evaluation is true - this is not UED but UEK
            if (evaluation) continue;

            let literals = [];        // array of literals for clause (variables evaluation)
            for (const variable_name in variable_values) {
                if (isF(variable_name)) continue;
                else if (isT(variable_name)) continue;//{literal_with_T = true;}
                let literal = variable_name;
                if (variable_values[variable_name]) literal = "!" + literal;
                literals.push(literal);
            }

            all_literals.push(literals); // add new clause
        }

        // remove duplicates
        const array_to_set = new Set(all_literals);
        const all_literals_filtered = Array.from(array_to_set);
        
        return all_literals_filtered;
        
    }


    getCnfLiterals2(){
        // 1) convert formula to CNF
        // 2) get all clauses from CNF
        // 3) get all literals from each clause
        // 4) return all literals without duplicates
        
        const all_literals = [];
 
        const cnf_formula = this.toCNF(this.makeCopy());
        
        const cnf_clauses = cnf_formula.getClauses();
        for (let clause of cnf_clauses) { all_literals.push(clause.getAllLiterals()); }
        
        const array_to_set = new Set(all_literals);
        const all_literals_filtered = Array.from(array_to_set);
        
        return all_literals_filtered;
    }

    toCNF(formula) {
        //console.log("toCNF()");
        formula = this.eliminateEquivalences(formula);
        formula = this.eliminateImplications(formula);
        //console.log(formula.getPrefix());

        //console.log("pushNegationsInward()");
        formula = this.pushNegationsInward(formula);
        //console.log(formula.getPrefix());
        //formula.printTree(5);

        //console.log("distributeOrOverAnd");
        formula = this.distributeOrOverAnd(formula);
        //console.log(formula.getPrefix());
        //formula.printTree(5);

        //formula.printTree(5);

        return formula;
    }
    // Convert the CNF formula to an array of clauses
    getClauses() {
        let clauses = [];
    
        if (isAnd(this.value)) {
          const left_clauses = this.left.getClauses();
          const right_clauses = this.right.getClauses();
          clauses = clauses.concat(left_clauses, right_clauses);
        } else {
          clauses.push(this);
        }
    
        //console.log("all clauses = ", clauses.length);

        let uniqueClauses = clauses.filter((clause, index, arr) => {
            for (let i = 0; i < index; i++) {
              if (clause.getPrefix() === arr[i].getPrefix()) {
                return false;
              }
            }
            return true;
          });
      
        //console.log("without duplicates = ", uniqueClauses.length);

        return uniqueClauses;
    }
    
    eliminateEquivalences(formula) {
        // |= (p equ q) 
        // |= (p and q) or (not p and not p)

        if (isEqu(formula.value)){
            const new_left = new FormulaNode("and");
            const new_right = new FormulaNode("and");
            
            const left = this.eliminateEquivalences(formula.left);
            const right = this.eliminateEquivalences(fomrula.right);
            const not_left = new FormulaNode("not");
            not_left.right = left;
            const not_right = new FormulaNode("not");
            not_right.right = right;

            new_left.left = left;
            new_left.right = right;
            new_right.left = not_left;
            new_right.right = not_right;

            const ret_formula = new FormulaNode("or");
            ret_formula.left = new_left;
            ret_formula.right = new_right;

            return ret_formula;
        }
      
        if (formula.left !== null) {
            formula.left = this.eliminateEquivalences(formula.left);
        }
        if (formula.right !== null) {
            formula.right = this.eliminateEquivalences(formula.right);
        }
        return formula;
    }

    eliminateImplications(formula) {
        // |= (p imp q) 
        // |= (not p or q)
        if (isImp(formula.value)) {
            const new_left = new FormulaNode("not");
            
            const left = this.eliminateImplications(formula.left);
            const right = this.eliminateImplications(formula.right);
            
            new_left.right = left;

            const ret_formula = new FormulaNode("or");
            ret_formula.left = new_left;
            ret_formula.right = right;
            return ret_formula;
        } 
        if (formula.left !== null ) {
            formula.left = this.eliminateImplications(formula.left);
        }
        if (formula.right !== null) {
            formula.right = this.eliminateImplications(formula.right);
        }
        return formula;
    }
      
    pushNegationsInward(formula) {
        if (isNot(formula.value)) {
            let child = formula.right;
            if (isNot(child.value)) {
                return this.pushNegationsInward(child.right);
            }
            else if (isAnd(child.value)) {
                const new_left = new FormulaNode("not");
                const new_right = new FormulaNode("not");
                
                new_left.right = child.left;
                new_right.right = child.right;

                const ret_formula = new FormulaNode("or");
                ret_formula.left = this.pushNegationsInward(new_left);
                ret_formula.right = this.pushNegationsInward(new_right);

                return ret_formula;
            } 
            else if (isOr(child.value)) {
                const new_left = new FormulaNode("not");
                const new_right = new FormulaNode("not");
                
                new_left.right = child.left;
                new_right.right = child.right;

                const ret_formula = new FormulaNode("and");
                ret_formula.left = this.pushNegationsInward(new_left);
                ret_formula.right = this.pushNegationsInward(new_right);

                return ret_formula;
            }
            else {
                return formula;
            }
        }
        if (formula.left) {
            formula.left = this.pushNegationsInward(formula.left);
        }
        if (formula.right) {
            formula.right = this.pushNegationsInward(formula.right);
        }
        return formula;
    }
    
    distributeOrOverAnd(formula) {
        if (isAnd(formula.value)) {
            formula.left = this.distributeOrOverAnd(formula.left);
            formula.right = this.distributeOrOverAnd(formula.right);
            return formula;
        }
        
        if (isOr(formula.value)) {
            let left = this.distributeOrOverAnd(formula.left);
            let right = this.distributeOrOverAnd(formula.right);
        
            if (isAnd(left.value)) {
                let left1 = new FormulaNode("or");
                left1.left = this.distributeOrOverAnd(left.left);
                left1.right = this.distributeOrOverAnd(right);
                
                let left2 = new FormulaNode("or");
                left2.left = this.distributeOrOverAnd(left.right);
                left2.right = this.distributeOrOverAnd(right);
                
                let ret_formula = new FormulaNode("and");
                ret_formula.left = left1;
                ret_formula.right = left2;
                return this.distributeOrOverAnd(ret_formula);
            }
        
            if (isAnd(right.value)) {
                let right1 = new FormulaNode("or");
                right1.left = this.distributeOrOverAnd(left);
                right1.right = this.distributeOrOverAnd(right.left);
                
                let right2 = new FormulaNode("or");
                right2.left = this.distributeOrOverAnd(left);
                right2.right = this.distributeOrOverAnd(right.right);
        
                let ret_formula = new FormulaNode("and");
                ret_formula.left = right1;
                ret_formula.right = right2;
                return this.distributeOrOverAnd(ret_formula);
            }
        }
        
        return formula;
    }

    printTree (indent){
        console.log(`${' '.repeat(indent)}${this.value} (${this.eval})`);
        if (this.left !== null) this.left.printTree(indent +4);
        if (this.right !== null) this.right.printTree(indent +4);

        return;
    }

    getPrefix(){
        let prefix = ""

        prefix += " " + this.value;
        if (this.left !== null) prefix += " " + this.left.getPrefix();
        if (this.right !== null) prefix += " " + this.right.getPrefix();

        return prefix
    }

    needsParentheses() {
        if (this.left === null) return false;
        
        const left_precedence = getPrecedence(this.left.value);
        const right_precedence = getPrecedence(this.right.value);
        const precedence = getPrecedence(this.value);
        if (left_precedence > precedence || right_precedence > precedence) return true;
        
        return false;
    }

    toString() {
        let result = '';
        if (this.needsParentheses()) { result += '('; }
        if (this.left) { result += this.left.toString(); }
        result += " " + this.value + " ";
        if (this.right) { result += this.right.toString(); }
        if (this.needsParentheses()) { result += ')'; }
        return result;
      }

}

class FormulaTree {
    constructor(formula){
        
        // get array of tokens in prefix form
        this.tokens = tokenizeLogicExpression(infixToPrefix(formula));
        //console.log("tokens"); console.log(this.tokens);

        let i = 0;
        [this.root, i] = this._buildTree(i);
    }

    // print current formula as a tree (with intent)
    printTree () {
        console.log("formula:");
        this._printNodes(this.root, 2);
    }

    // returns all unique variables
    getAllVariables() {
       return this.root.getAllVariables();
    }

    getAllOperators() {
        return this.root.getAllOperators();
    }
    
    getAllEvals() {
        return this.root.getAllEvals();
    }

    // returns all values in order and index of root element
    getAllValues() {
        let values = [];
        let root_index = 0;
        [values, root_index] = this.root.getAllValues();
        return [values, root_index];
    }

    _buildTree(idx){
        if (idx >= this.tokens.length) {console.error("adressing non-existing token (idx >= length(tokens))"); return;}

        const token = this.tokens[idx++];
        const node = new FormulaNode(token);
        //console.log("token = " + token + " | idx = " + idx);

        // if operator - load childs
        if (isBinaryOperator(token)) {
            [node.left,idx] = this._buildTree(idx);
            [node.right,idx] = this._buildTree(idx);
        }
        if (isUnaryOperator(token)) {
            //console.log("unary");
            [node.right,idx] = this._buildTree(idx);
        }
        
        // if variable - its a leaf - just return node
        return [node, idx++];
    };
    
    _printNodes (node, indent){
        if (node === null) return;
        console.log(`${' '.repeat(indent)}${node.value} (${node.eval})`);
        this._printNodes(node.left, indent + 2);
        this._printNodes(node.right, indent + 2);
    }

    // ALG 1 - Truth Table
    // returns array of:
    // T/F      - if tautology
    // 2D array - truthTable
    // col idx  - where is last variable
    // col idx  - where is the final eval for each row
    getTruthTable () {
        //console.log("\ndoStatementTable()");

        const all_variables = this.getAllVariables();
        const all_operators = this.getAllOperators();
        let root_idx = 0;
        let all_values = [];
        [all_values, root_idx] = this.getAllValues();

        const truth_table = [];

        // init table
        let row_count = 2**all_variables.length + 1;
        const col_count = all_variables.length + all_values.length;

        let first_data_row_idx = 1;

        // adjust when row for hierarchy is there
        row_count++;
        first_data_row_idx++;


        for (let r = 0; r < row_count; r++) {
            const row = [];
            for (let c = 0; c < col_count; c++) {
              row.push(null);
            }
            truth_table.push(row);
        }
        // first row
        let c = 0;
        for (const elem of all_variables) truth_table[0][c++] = elem;
        for (const elem of all_values) truth_table[0][c++] = elem;

        // add data of row for hierarchy
        const values_hierarchy = this.root.getValuesHierarchy();
        c = 0;
        for (const elem of all_variables) truth_table[1][c++] = null;
        for (const elem of values_hierarchy) truth_table[1][c++] = elem;
        
        // init variable values
        for (let r = first_data_row_idx; r < row_count; r++) {
            for (let c = 0; c < all_variables.length; c++) {
                if (isT(all_variables[c])) truth_table[r][c] = true;
                else if (isF(all_variables[c])) truth_table[r][c] = false;
                else truth_table[r][c] = Boolean((r-2) & Math.pow(2, c));
                //truth_table[r][c] = (r-1) & (1 << c) ? true : false;
            }
            //truth_table.push(row);
        }

        // for each truth_table row eval this formula based on each variable
        for (let r = first_data_row_idx; r< row_count; r++){
            let variable_values = {};
            // put together evaluations for each variable
            for (let c = 0; c < all_variables.length; c++) {
                const variable_name = all_variables[c];
                const variable_value = truth_table[r][c];
                variable_values[variable_name] = variable_value;
            }
            
            // get evals
            this.root.evaluate(variable_values);
            const evaluations = this.getAllEvals();
            
            for (let c = all_variables.length; c < col_count; c++){
                const idx = c - all_variables.length;
                const value = all_values[idx];

                // skip evaluation in table for all variable unless, there is only one value in formula
                if (all_values.length > 1 && isVariable(value)) continue;
                truth_table[r][c] = evaluations[idx];
            }
            
        }
        // column idx where is result of evaluation for each row
        const result_col_idx = root_idx + all_variables.length;

        // check resultIdx - if all are true -> is Tautology
        let is_tautology = true;
        for (let row = first_data_row_idx ; row < row_count; row++){
            is_tautology = is_tautology && truth_table[row][result_col_idx];
        }

        return [is_tautology, truth_table, all_variables.length, result_col_idx];
    }

    // ALG 2 - Indirect Proof
    // returns array of:
    // T/F      - if is tautology
    // 2D array - evaluations (1 table with different evaluations)
    // array    - containing all mismatched variables (for each row)
    // result_col_idx - column index of root element
    getIndirectProof() {
        // from root look for truth assesment that is not true -> dispute -> tautology
        
        let valid_evals = [];
        let invalid_evals = [];
        let mismatched_variables = [];
        
        // assume false
        [valid_evals, invalid_evals, mismatched_variables] = this.root.reverseEvaluate(false);    // target evaluation
       
        const return_evals = [];

        let root_idx = 0;
        let all_values = [];
        [all_values, root_idx] = this.getAllValues();
        const all_variables = this.getAllVariables();

        const return_eval_first_row = all_values;
        
        // try to adjust mismatched variables for each invalid Evaluation
        // if mismatched variables can be adjusted to match and also return expected "false" -> this is not an invalid evaluation
        // else -> this is tautology and we found invalid evalutaion
        const correct_invalid_eval_indexes = [];
        let is_tautology = false;
        for (let invalid_eval_idx = 0; invalid_eval_idx < invalid_evals.length; invalid_eval_idx++){
            const invalid_eval = invalid_evals[invalid_eval_idx];
            const mismatched_variable = mismatched_variables[invalid_eval_idx];

            let variable_values = {};

            // get evaluation for all variables from invalid_evaluation
            for (let i = 0; i < invalid_eval.length; i++) {

                // if variable it will be in dictionary (with evaluation) 
                const var_idx = all_variables.findIndex(variable => variable === all_values[i]);
                if (var_idx > -1) {
                    //if (all_variables[var_idx])
                    variable_values[all_variables[var_idx]] = invalid_eval[i];
                }
            }

            // if evaluation with at least one of mismatched variable eval is false -> this is not an invalid eval
            variable_values[mismatched_variable] = isF(mismatched_variable)? false : true;
            const eval_as_true = this.root.evaluate(variable_values);

            variable_values[mismatched_variable] = isT(mismatched_variable)? true : false;
            const eval_as_false = this.root.evaluate(variable_values);

            if (eval_as_true && eval_as_false){
                // this is an invalid eval
                correct_invalid_eval_indexes.push(invalid_eval_idx);
            }
        }

        if (correct_invalid_eval_indexes.length > 0){ is_tautology = true; }

        return_evals.push(return_eval_first_row);
        
        const values_hierarchy = this.root.getValuesHierarchy();
        return_evals.push(values_hierarchy);
        

        // returns invalid evals
        if (is_tautology) {
            // each invalid eval separatelly
            for (let i = 0; i < invalid_evals.length; i++){
                if (!(i in correct_invalid_eval_indexes)) continue;
                const elem = invalid_evals[i];
                
                return_evals.push(elem);
            }
        }
        // returns valid evals
        else {
            for (let elem of valid_evals) {
                return_evals.push(elem);
            }
        }

        // column idx where is result of evaluation for each row
        const root_col_idx = root_idx;

        // returns valid_evals to dispute
        return [is_tautology, return_evals, mismatched_variables, root_col_idx]; 
    }

    // ALG 3 - Resolution
    // returns array of:
    // T/F      - if is tautology
    // 2D array - clauses with steps to get them
    // empty_clause_row_idx - row index
    // approch  - steps of transforming formula to input for resolution
    getResolution() {
        //console.log("\ndoResolution()");
        let is_tautology = false;
        let empty_clause_row_idx = null;

        //console.log(this.root.toString());
        const approach = [];

        // contains all literals and their negations for shorter consecution
        const literals_pool = new Map();

        const not_formula = new FormulaNode("not");
        not_formula.right = this.root.makeCopy();
        
        approach.push("Negate entered formula: " + not_formula.toString());
        

        function negateLiteral(literal){
            const literal_string = "" + literal;
            if (literal_string.startsWith('!')) return literal_string.slice(1);
            return "!" + literal_string;
        }

        function isResolveable(literals1, literals2){
            const len1 = literals1.length;
            const len2 = literals2.length;
            
            const same_literals = new Set();
            for (let l of literals1) same_literals.add("!" + l);
            for (let l of literals2) same_literals.add(l);
            
            const len = same_literals.size;
            return len < len1+len2;
        }

        function getLiteralsToResolve(literals1, literals2){
            const literals_to_resolve = []

            // negate one array of literals and find literal to resolve
            const neg_literals2 = literals2.map(l => negateLiteral(l));
            
            for (let literal of neg_literals2) {
                if (literals1.includes(literal)) {
                    literals_to_resolve.push(literal)
                }
            }
            return literals_to_resolve;
        }
    
        function getLiteralsWithout(literals, literal){
            return literals.filter(element => element !== literal);
        }

        function removeDuplicates(array){
            const array_to_set = new Set(array);
            return Array.from(array_to_set);
        }

        // this returns resolved clause from literals1 and literals2
        function resolve(literals1, literals2) {
            const resolved_clauses = []
            if (isResolveable(literals1, literals2)) {
                const literals_to_resolve = getLiteralsToResolve(literals1, literals2);

                for (let literal_to_resolve of literals_to_resolve){
                    const resolved_clause1 = getLiteralsWithout(literals1, literal_to_resolve)
                    const resolved_clause2 = getLiteralsWithout(literals2, negateLiteral(literal_to_resolve))
                    resolved_clauses.push(removeDuplicates(resolved_clause1.concat(resolved_clause2)));                    
                }
            }

            return resolved_clauses;
        }
  
        function isLiteral(clause){
            return (clause.length === 1);
        }

        function isClauseNotT(clause){
            return isLiteral(clause) && isT(negateLiteral(clause[0]))
        }

        let all_literals = not_formula.getCnfLiterals2();

        // each clause should not contain more that one type of literal -> convert to set and back to array?
        let all_clauses = [];
        for(let literals of all_literals){
        
            const literals_without_duplicates = removeDuplicates(literals);
            const sorted_literals = literals_without_duplicates.slice().sort();
            const filtered_literals = sorted_literals.filter((value, index) => sorted_literals.indexOf(value) === index);
            const is_contained = all_clauses.some(subarray => {
                if (subarray.length !== filtered_literals.length) {
                  return false;
                }
                const set = new Set(subarray);
                return filtered_literals.every(elem => set.has(elem));
              });
            if (!is_contained) {
                all_clauses.push(filtered_literals);
            }
        }
        
        let cnf = "";
        for (let clause_idx = 0; clause_idx < all_clauses.length; clause_idx++) {
            const clause = all_clauses[clause_idx];
            if (clause_idx > 0) cnf+= " AND ";   
            
            let disjunction = "(";
            for (let elem_idx = 0; elem_idx < clause.length; elem_idx++){
                if (elem_idx>0) disjunction+= " OR  ";
                disjunction += clause[elem_idx];
            }
            cnf += disjunction + ")";
        }
        const cnf2 = cnf.replace(/!/g, " NOT ");
        
        approach.push("Transform negated formula into CNF: " + cnf2 );
        approach.push("Each disjunction in CNF is clause -> use resolution method -> table below:");

        const resolved_from = ["",""];
        let steps = [];

        for (let [index, clause] of all_clauses.entries()) {
            if (isLiteral(clause)) literals_pool.set(...clause, index);
            steps.push([...resolved_from]);
        }

        for (let idx1 = 0; idx1 < all_clauses.length; idx1++){
            // this mean that formula is tautology
            if ( all_clauses[idx1].length === 0 || isClauseNotT(all_clauses[idx1])) {
                is_tautology = true;
                empty_clause_row_idx = all_clauses.length;
                break;
            }

            for (let idx2 = 0; idx2 < all_clauses.length; idx2++){
                if (idx1 === idx2) continue;

                if (!isResolveable(all_clauses[idx1], all_clauses[idx2])) continue;

                const resolved_clauses = resolve(all_clauses[idx1], all_clauses[idx2]);

                // test if resolvedCluses are not in yet (add only if its a new clause)
                for (let resolved_clause of resolved_clauses){

                    // test if resolved_clause is already in resolved_clauses
                    const is_contained = all_clauses.some(subarray => {
                        if (subarray.length !== resolved_clause.length) { return false; }
                        const set = new Set(subarray);
                        return resolved_clause.every(elem => set.has(elem));
                      });

                    // if not - add it there
                    if (!is_contained) {
                        // keep track of steps
                        resolved_from[0] = idx1;
                        resolved_from[1] = idx2;
                        steps.push([...resolved_from]);
                        all_clauses.push(resolved_clause);
                    }

                    // test if resolved clause is literal - faster consecutions
                    if (isLiteral(resolved_clause)){
                        const literal = resolved_clause;
                        // is negated literal in pool?
                        if (!literals_pool.has(literal)){
                            literals_pool.set(...literal, all_clauses.length);
                        }
                        if (literals_pool.has(negateLiteral(literal))){
                            resolved_from[0] = literals_pool.get(negateLiteral(...literal))-1;
                            resolved_from[1] = literals_pool.get(...literal)-1;
                            steps.push([...resolved_from]);
                            all_clauses.push([]);

                            is_tautology = true;
                            empty_clause_row_idx = all_clauses.length;

                            idx1 = all_clauses.length;
                            idx2 = all_clauses.length;
                        }
                    }
                }                
            }
        }
        
        function getClauseFromLiterals(literals) {
            let clause = "";
            for(let lit_idx in literals){
                if (lit_idx > 0) clause += " or ";
                let literal = literals[lit_idx];
                if (literal.startsWith('!')) literal = "not " + literal.slice(1);
                clause += literal;
            }
            return clause;
        }
        
        // format clauses with steps into table
        const process_table = []
        process_table.push(["index", "clause", "steps"]);
        for (let index in all_clauses){
            const output_clause = getClauseFromLiterals(all_clauses[index]);
            
            let output_steps = "";
            if (steps[index].toString().length > 1){
                const first = Number(steps[index][0])+1;
                const second = Number(steps[index][1])+1;
                output_steps = first + ", " + second;
            }
            const process_table_row = [Number(index)+1,               // number/index of each clause
                output_clause.length > 0 ? output_clause : "[]",      // clause/ empty clause = []
                output_steps];                                        // numbers of clauses that were resolved to get this
            process_table.push(process_table_row);
        }

        return [is_tautology, process_table, empty_clause_row_idx, approach];
    }
}

