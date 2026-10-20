import crypto from 'node:crypto'

//in memory arrays m2p2
let recipes = [
    {id: crypto.randomUUID(), name: 'Spaghetti', ingredients: ['noodles', 'tomato sauce']},
    {id: crypto.randomUUID(), name: 'Burger', ingredients: ['bun', 'beef patty', 'pickle', 'ketchup']}
];

export const getRecipes=()=>recipes;

export const getRecipesById=(id)=>recipes.find(r=>r.id===id);

export const createRecipe = ({ name, ingredients })=>{
    const newRecipe={
        id: crypto.randomUUID(),
        name,
        ingredients
    };
    recipes.push(newRecipe);
    return newRecipe;
};

export const updateRecipe = (id, {name, ingredients})=>{
    const recipe = recipes.find(r=>r.id===id);
    if(!recipe) return null;
    if(name!==undefined) recipe.name = name;
    if(ingredients!==undefined) recipe.ingredients = ingredients;
    return recipe;
};

export const deleteRecipe=(id)=>{
    const index = recipes.findIndex(r=>r.id===id);
    if(index===-1) return null;
    const deleted=recipes.splice(index, 1);
    return deleted[0];    
}