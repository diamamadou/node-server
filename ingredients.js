const fs = require('fs');

const fetchIngredients = (path) => {
    const ingredients = fs.readFileSync(path);
    return JSON.parse(ingredients);
};

const addIngredients = () => {

};

module.exports = {
    fetchIngredients,
};
