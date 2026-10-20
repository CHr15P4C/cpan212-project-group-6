import crypto from 'node:crypto'

//in memory arrays m2p2
let favourites = [
    {id: crypto.randomUUID(), name: 'Spaghetti', ingredients: ['noodles', 'tomato sauce']},
    {id: crypto.randomUUID(), name: 'Burger', ingredients: ['bun', 'beef patty', 'pickle', 'ketchup']}
];

export const getFavourites=()=>favourites;

export const getFavouritesById=(id)=>favourites.find(r=>r.id===id);

export const createFavourite = ({ name, ingredients })=>{
    const newFavourite={
        id: crypto.randomUUID(),
        name,
        ingredients
    };
    favourites.push(newFavourite);
    return newFavourite;
};

export const updateFavourite = (id, {name, ingredients})=>{
    const favourite = favourites.find(r=>r.id===id);
    if(!favourite) return null;
    if(name!==undefined) favourite.name = name;
    if(ingredients!==undefined) favourite.ingredients = ingredients;
    return favourite;
};

export const deleteFavourite=(id)=>{
    const index = favourites.findIndex(r=>r.id===id);
    if(index===-1) return null;
    const deleted=favourites.splice(index, 1);
    return deleted[0];    
}