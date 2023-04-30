# Bachelor Project - Tool for Proovig Validity of Arguments
- author: Daniel Dobeš DOB0136
- working name: Sytem Proving Truth

# Deployed
[here](https://dobesdaniel.github.io/bachelor/)

# Setup
> start index.html

# Representation
| What        	| How 	| How   	|
|-------------	|-----	|-------	|
| Negation    	| ~   	| not   	|
| Conjunction 	| *   	| and   	|
| Disjunction 	| +   	| or    	|
| Implication 	| >   	| imp   	|
| Equivalence 	| =   	| equ   	|
| True        	| T   	| true  	|
| False       	| F   	| false 	|

# Features
- last entered formulas
    - 5 last entered valid formulas stored in local storage
- example inputs
    - when hover over "Formula:" "Premises:" "Conclusion"
- method descriptions
    - for each method, detail description on how it works
- processing multiple formulas
    - input using drag and drop .txt file
    - each line of file is formula
- save formula
    - each valid formula/s can be saved in .txt file

# Notes
- all codded without using any libraries -> own htmml/css + js
- formula syntax is validated by grammar implemented in (grammar.js)
- 3 ways to validate formula / argument (formula.js)
    - truth table
    - indirect proof
    - resolution (with CNF conversion)
            
