const express = require('express') 
const req = require('express/lib/request')
const router = express.Router()
const db = require('../models')


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
router.get('/new', (req,res) => {
    res.render('recipes/new')
})

// POST route for submission of create recipe form 
router.post('/', async (req,res) => {
    try {
        const user = res.locals.user 
        let recipe = await user.createRecipe({
            name: req.body.name,
            directions: req.body.directions,
            story: req.body.story,
            notes: req.body.notes,
            userId: user.id
        })
        let recipeID = await recipe.id
        res.redirect(`/recipes/${recipeID}/ingredients/new`)   
    }
    catch (err) {
        console.log(err)
    }
})

// POST /recipes/ingredients to create and add ingredients to the recipe 
router.post('/ingredients', async (req,res) => {
    console.log()
    const newIngredient = await db.ingredient.create({
        name: req.body.ingrName, 
        measure: req.body.ingrMeasure,
        quantity: req.body.ingrQuantity, 
        recipeId: Number(req.body.recipeId)
    })
    console.log(newIngredient)
    res.redirect(`/recipes/${req.body.recipeId}/ingredients/new`)
    
})

// GET /recipes/edit/:id to show a form that will edit a recipe
router.get('/edit/:id', async (req,res) => {
    const recipe = await db.recipe.findOne({
        where: {
            id: req.params.id
        }
    })
    const allCategories = await db.category.findAll()

    // show an edit form for the recipe
    res.render('recipes/edit', {recipe: recipe, categories: allCategories})
})




// GET /recipes/:id/ingredients/edit/:id to show a form for editing an ingredient 

router.get('/:recipeId/ingredients/edit/:ingrId', async(req,res) => {
    const recipe = await res.locals.user.getRecipes({
        where: {
            id: req.params.recipeId
        }
    })
    // console.log(recipe[0], 'hello ther')
    const ingredient = await recipe[0].getIngredients({
        where: {
            id: req.params.ingrId
        }
    })
    // console.log(ingredient,'🥶🥶')
    res.render('recipes/ingredients/edit', {recipe:recipe[0], ingredient: ingredient[0]})
})

// PUT /recipes/:id/ingredients/:id to make changes to an ingredient 
router.put('/:recipeId/ingredients/:ingredientId', async (req,res) => {
    try {
        const ingredient = await db.ingredient.findOne({
            where: {
                id: req.params.ingredientId
            }
        })

        ingredient.name = req.body.ingrName
        ingredient.measure = req.body.ingrMeasure
        ingredient.quantity = req.body.ingrQuantity
        await ingredient.save()
        console.log(ingredient)
        const recipeId = ingredient.recipeId
        res.redirect(`/recipes/${recipeId}/ingredients/new`)

    }
    catch (err) {
        console.log(err)
    }
})

//   DELETE /recipes/:id/ingredients/:id
router.delete('/:recipeId/ingredients/:ingredientId', async (req,res) => {
    await db.ingredient.destroy({
        where: {
            id: req.params.ingredientId
        }
    })
    res.redirect(`/recipes/${req.params.recipeId}`)
})



// GET /recipes/:id show details about specific recipe, grab associated ingredients 
router.get('/:id', async (req,res) => {
   try {
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
        let categories = await user.getCategories()
        categories.forEach(category => {
            console.log(category)
        })

        
        // console.log(recipe[0], 'did we get the correct recipe?')
        if (recipe.length===0) {
            
            res.redirect('/users/profile')

        }
        else {
            // console.log(recipe[0].ingredients, 'here are the ingredients')
        // pass along the first recipe (should be the only one, along with all of the ingredients 
        // associated with that recipe )
        res.render('recipes/details', {recipe: recipe[0], ingredients: recipe[0].ingredients, categories: categories})
        }
        
    }
   }
   catch (err) {
       console.log(err,'😢')
   }
})
// PUT /recipes/:id/categories to find or create a category and add to recipe
router.put('/:id/categories', async (req,res) => {
    try {
        const category = await db.category.findOne({
            where: {
                id: Number(req.body.category),
            }
        })
        console.log(category, 'anybody home?')
        const recipe = await db.recipe.findOne({
            where: {
                id: req.params.id
            }
        })
        await category.addRecipe(recipe)
        await category.save()
        res.redirect(`/recipes/${req.params.id}`)
    }
    catch {console.log}
})

// PUT /recipes/:id to edit the recipe details
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



// GET Route to show Form to add ingredients to a given recipe
router.get('/:recipeId/ingredients/new', async (req, res) => {
    const ingredients = await db.ingredient.findAll({
        where: {
            recipeId: req.params.recipeId
        }
    })
    res.render('recipes/ingredients/new', {
        recipeId: req.params.recipeId, 
        ingredients: ingredients
    })
})

//Delete a recipe (and all of it's ingredients)
router.delete('/:id', async (req,res) => {
    await db.ingredient.destroy({
        where: {
            recipeId: req.params.id
        }
    })
    await db.recipe.destroy({
        where: {
            id: req.params.id
        }
    })
    res.redirect('/recipes')
})







module.exports = router