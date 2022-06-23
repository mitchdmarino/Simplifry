const express = require('express') 
const req = require('express/lib/request')
const router = express.Router()
const db = require('../models')
const axios = require('axios')
require('dotenv').config()


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
        try {
            // create an ingredient. Search for it on edamam API 
            const foodUrl = `https://api.edamam.com/api/food-database/v2/parser?app_id=${process.env.APP_ID}&app_key=${process.env.API_KEY}&ingr=${req.body.ingrName}`
            let response = await axios.get(foodUrl)
            // foodId is the top hit's id 
            if(response.data.parsed[0]) {
                let foodId = response.data.parsed[0].food.foodId
                // for the units of measure, find the measure that matches the req.body.ingrmeasure input
                let measureUri = `http://www.edamam.com/ontologies/edamam.owl#Measure_${req.body.ingrMeasure}`
                // response.data.hints[0].measures.forEach(measure => {
                //     if (measure.label===req.body.ingrMeasure) {
                //         measureUri = measure.uri
                //     }
                // })
               
                // console.log(measureUri)
                // POST quantity, measureURI, and food ID to get nutrition info
                const nutritionUrl = `https://api.edamam.com/api/food-database/v2/nutrients?app_id=${process.env.APP_ID}&app_key=${process.env.API_KEY}`
                response = await axios.post(nutritionUrl, {
                    "ingredients": [
                        {
                            "quantity": Number(req.body.ingrQuantity),
                            "measureURI": measureUri,
                            "foodId": foodId
                        }
                    ]
                })
                const totalNutrients = response.data.totalNutrients
                const newIngredient = await db.ingredient.create({
                    name: req.body.ingrName, 
                    measure: req.body.ingrMeasure,
                    quantity: req.body.ingrQuantity, 
                    energy: totalNutrients.ENERC_KCAL.quantity,
                    fat: totalNutrients.FAT.quantity,
                    satFat: totalNutrients.FASAT.quantity,
                    transFat: totalNutrients.FATRN.quantity, 
                    carbs: totalNutrients.CHOCDF.quantity,
                    fiber: totalNutrients.FIBTG.quantity,
                    sugar: totalNutrients.SUGAR.quantity,
                    protein: totalNutrients.PROCNT.quantity,
                    cholesterol: totalNutrients.CHOLE.quantity,
                    // NA: totalNutrients.NA.quantity,
                    // CA: totalNutrients.CA.quantity,
                    // MG: totalNutrients.MG.quantity,
                    // K: totalNutrients.K.quantity,
                    // FE: totalNutrients.FE.quantity,
                    // ZN: totalNutrients.ZN.quantity,
                    // P: totalNutrients.P.quantity,
                    // vitA: totalNutrients.VITA_RAE.quantity,
                    // vitC: totalNutrients.VITC.quantity,
                    // vitD: totalNutrients.VITD.quantity,
                    // vitB6: totalNutrients.VITB6A.quantity,
                    // vitB12: totalNutrients.VITB12.quantity,
                    recipeId: Number(req.body.recipeId)
                })
            }
            else {
                const newIngredient = await db.ingredient.create({
                    name: req.body.ingrName, 
                    measure: req.body.ingrMeasure,
                    quantity: req.body.ingrQuantity,
                    recipeId: Number(req.body.recipeId)
                })
            }   
            
            res.redirect(`/recipes/${req.body.recipeId}/ingredients/new`)
        }
        catch (err) {
            console.log(err)
        }
    
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
    res.redirect(`/recipes/${req.params.recipeId}/ingredients/new`)
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
        
        // console.log(recipe[0], 'did we get the correct recipe?')
        if (recipe.length===0) {
            
            res.redirect('/users/profile')

        }
        else {
            // console.log(recipe[0].ingredients, 'here are the ingredients')
        // pass along the first recipe (should be the only one, along with all of the ingredients 
        // associated with that recipe )
        const recipeCategories = await recipe[0].getCategories()
        const ingredients = recipe[0].ingredients

        res.render('recipes/details', {recipe: recipe[0], ingredients: ingredients, categories: categories, recipeCategories: recipeCategories})
        }
        
    }
   }
   catch (err) {
       console.log(err,'😢')
   }
})
// PUT /recipes/:id/categories/add to find or create a category and add to recipe
router.put('/:id/categories/add', async (req,res) => {
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
router.put('/:id/categories/remove', async (req,res) => {
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
        await category.removeRecipe(recipe)
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
    recipe.img = req.body.img
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
    const recipe = await db.recipe.findOne({
        where: {
            id: req.params.recipeId
        }
    })
    res.render('recipes/ingredients/new', {
        recipe: recipe,
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