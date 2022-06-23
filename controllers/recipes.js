const express = require('express') 
const req = require('express/lib/request')
const router = express.Router()
const db = require('../models')



// routes 

// GET /recipes, show a list of the user's recipes (if they are logged in )
router.get('/', async (req,res) => {
    if (!res.locals.user) {
        res.render('users/login.ejs', { msg: 'please log in to view recipes, or check out the community recipes instead' })
    }
    else {
        const user = res.locals.user
        const recipes = await user.getRecipes()
        res.render('recipes/index', {recipes: recipes})
    }
})



// GET /recipes/new to show form that will create a new recipe for the user 
// also need to create new ingredients associated with the recipe 

// GET /recipes/new for user to create a new recipe (associated with their account)
router.get('/new', (req,res) => {
    console.log('wtf is happening')
    res.render('recipes/new')
})

// POST route for submission of create recipe form 
// need to be able to create ingredients that will be associated with recipe id 

router.post('/new', async (req,res) => {
    try {
        const user = res.locals.user 
        let recipe = await user.createRecipe({
            name: req.body.name,
            directions: req.body.directions,
            story: req.body.story,
            notes: req.body.notes,
            userId: user.id
        })
        await recipe.createIngredient({
            name: req.body.ingredientName,
            measure: req.body.ingredientMeasure,
            quantity: req.body.ingredientQuantity,
            recipeId: Number(req.body.ingredientRecipeId)
        })
        console.log(recipe)
        let recipeID = await recipe.id
        console.log(recipeID)
        res.redirect(`/recipes/${recipeID}`)
        
        

    }
    catch (err) {
        console.log(err)
    }
})

// POST /recipes/:id to add ingredients to the recipe 
router.post('/:id', async (req,res) => {
    const newIngredient = await db.ingredient.create({
        name: req.body.ingrName, 
        measure: req.body.ingrMeasure,
        quantity: req.body.ingrQuantity, 
        recipeId: req.params.id
    })
    console.log(newIngredient)
    res.redirect(`/recipes/${req.params.id}`)
    
})

// PUT /recipes/:id to update the recipe details and ingredients

router.put('/:id', async (req,res) => {
    // console.log('Help Me😳😳😳😳😳😳😳😳')
    const recipe = await db.recipe.findOne({
        where: {
            id: req.params.id
        }
    })
    // console.log('this is the RECIPE NAME 🔥🔥🔥🔥🔥🔥', recipe.name)
    recipe.directions = req.body.directions  
    recipe.story = req.body.story
    recipe.notes = req.body.notes
    await recipe.save()
    res.redirect(`/recipes/${recipe.id}`)
})
// GET /recipes/:id show details about specific recipe, grab associated ingredients 

router.get('/:id', async (req,res) => {
    if (!res.locals.user) {
        res.render('users/login.ejs', { msg: 'please log in to view recipe details, or check out the community recipes instead' })
    }
    else {
        const user = res.locals.user
        // get recipe with id from req.params
        // include all associated ingredients 
        // make sure user can only access their own recipes 
        // recipe has to be associated with user
        let recipe = await user.getRecipes({
            where: {
                id: req.params.id
            },
            include: [db.ingredient]
        })
        
        // console.log(recipe[0], 'did we get the correct recipe?')
        // console.log(recipe[0].ingredients, 'here are the ingredients')
        // pass along the first recipe (should be the only one, along with all of the ingredients 
        // associated with that recipe )
        res.render('recipes/details', {recipe: recipe[0], ingredients: recipe[0].ingredients})
    }
})







module.exports = router