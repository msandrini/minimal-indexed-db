module.exports = {
    "root": true,
    "extends": "airbnb-base",
    "rules": {
        /* The default of AirBnB style guide is alignment with 4 spaces for code, 
            we change it for tabs, as everyone prefers it, obviously :) */
        "indent": ["error", "tab"],
        "no-tabs": "off",
        /* this one doesn't allow extra lines between function definition and code, 
            we override it because it can make the code look a bit dirtier at times */
        "padded-blocks": "off",
        /* they don't like functions like _privateFn(), but we do, so we override it */
        "no-underscore-dangle": "off",
        /* it complains with for...of loops by default, so we override it 
            just to take the ForOfStatement out of it, as it can be useful */
        "no-restricted-syntax": [
            "error",
            "ForInStatement",
            "LabeledStatement",
            "WithStatement"
        ],
        "no-confusing-arrow": "off",
        /* comma-dangle enforces things like [1, 2, 3,] 
            which are pretty awkward, so we invert the default */
        "comma-dangle": ["error", "never"]
    }
}
