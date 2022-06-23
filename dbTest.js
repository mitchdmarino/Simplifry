const db = require('./models')

async function createRecipe(name, directions, story, notes, userId) {
    try {
        const newRecipe = await db.recipe.create({
            name: name,
            directions: directions, 
            story: story,
            notes: notes,
            userId: userId
        })
        console.log(newRecipe)
    }
    catch (err) {
        console.log(err)
    }
}
// createRecipe()



async function addIngredients(name, measure, quantity, recipeId) {
    try {
        const newIngredient = await db.ingredient.create({
            name: name, 
            measure: measure,
            quantity: quantity, 
            recipeId: recipeId
        })
        console.log(newIngredient)
    }
    catch (err) {
        console.log(err)
    }
}

// addIngredients('cheddar cheese', 'slice', 3, 1)
//  addIngredients('ham', 'grams', 1, 2)


async function getIngredients(recipeId) {
    try {
        const recipe = await db.recipe.findOne({
            where: {
                id: recipeId
            }
        })
        console.log(recipe)
        const ingr =  await recipe.getIngredients()
        console.log(ingr)
    }
    catch (err) {
        console.log(err)
    }
}
getIngredients(1)