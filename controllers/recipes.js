const express = require('express') 
const req = require('express/lib/request')
const router = express.Router()
const db = require('../models')
const axios = require('axios')
require('dotenv').config()


// GET /recipes, show a list of the user's recipes (if they are logged in )
router.get('/', async (req,res) => {
    try {
        // if user not logged in 
        if (!res.locals.user) {
            res.render('users/login.ejs', { msg: 'please log in to view recipes, or check out the community recipes instead' })
        }
        else {
            const user = res.locals.user
            // get all recipes associated with user 
            const recipes = await user.getRecipes()
            // render recipes index, send user recipes
            res.render('recipes/index', {recipes: recipes})
        }
    }
    catch (err) {
        console.log(err)
        res.render('/')
    }
})

// GET /recipes/new to show form that will create a new recipe for the user 
router.get('/new', (req,res) => {
    // if user not logged in 
    if (!res.locals.user) {
        res.render('users/login.ejs', { msg: 'please log in to create recipes, or check out the community recipes instead' })
    }
    else {
    res.render('recipes/new')
    }
})

// POST route for submission of create recipe form 
router.post('/', async (req,res) => {
    try {
        const user = res.locals.user 
        // create recipe (name only, details will be edited next))
        let recipe = await user.createRecipe({
            name: req.body.name,
            directions: "1. Step One // 2. Step Two // 3. Step Three // ...",
            story: "I love this recipe because ...",
            notes: "",
            public: false,
            userId: user.id
        })
        let recipeID = await recipe.id
        res.redirect(`/recipes/edit/${recipeID}`)   
    }
    catch (err) {
        console.log(err)
    }
})

// // POST route for searching for new recipe IN PROGRESS
// router.post('/search', async (req,res) => {
//     try {

//     }
//     catch (err) {
//         console.log(err)
//     }
// })

// POST /recipes/ingredients to create and add ingredients to the recipe 
router.post('/ingredients', async (req,res) => {
        try {
            // create an ingredient. Search for it on edamam API 
            const foodUrl = `https://api.edamam.com/api/food-database/v2/parser?app_id=${process.env.APP_ID}&app_key=${process.env.API_KEY}&ingr=${req.body.ingrName}`
            let response = await axios.get(foodUrl)
            // foodId is the top hit's id 
            let foodId = ""
            if (response.data.parsed.length >0) {
                foodId = response.data.parsed[0].food.foodId
            } else {
                foodId = response.data.hints[0].food.foodId
            }
            // console.log(foodId)
            // for the units of measure, find the measure that matches the req.body.ingrmeasure input
            let measureUri = `http://www.edamam.com/ontologies/edamam.owl#Measure_${req.body.ingrMeasure}`
            // console.log(measureUri)
            // axios.POST quantity, measureURI, and food ID as JSON data to get nutrition info
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
            // access the available nutrients. (not all nutrients are available for each food, so need to use if statements to check their status) 
            let energy = 0
            if (totalNutrients.ENERC_KCAL) {
                energy = Number(totalNutrients.ENERC_KCAL.quantity)
            }
            let fat = 0 
            if (totalNutrients.FAT) {
                fat = Number(totalNutrients.FAT.quantity)
            } 
            let satFat = 0
            if (totalNutrients.FASAT) {
                satFat = totalNutrients.FASAT.quantity
            } 
            let transFat = 0
            if (totalNutrients.FATRN) {
                transFat = totalNutrients.FATRN.quantity
            } 
            let carbs = 0
            if (totalNutrients.CHOCDF) {
                carbs = Number(totalNutrients.CHOCDF.quantity)
            } 
            let fiber = 0
            if (totalNutrients.FIBTG) {
                fiber = Number(totalNutrients.FIBTG.quantity)
            } 
            let sugar = 0
            if (totalNutrients.SUGAR) {
                sugar = Number(totalNutrients.SUGAR.quantity)
            }
            let protein = 0
            if (totalNutrients.PROCNT) {
                protein = Number(totalNutrients.PROCNT.quantity)
            }
            let NA = 0
            if (totalNutrients.NA) {
                NA = Number(totalNutrients.NA.quantity)
            }
            let cholesterol = 0
            if (totalNutrients.CHOLE) {
                cholesterol = Number(totalNutrients.CHOLE.quantity)
            }
            const newIngredient = await db.ingredient.create({
                name: req.body.ingrName, 
                measure: req.body.ingrMeasure,
                quantity: req.body.ingrQuantity, 
                energy: energy,
                fat: fat,
                satFat: satFat,
                transFat: transFat, 
                carbs: carbs,
                fiber: fiber,
                sugar: sugar,
                protein: protein,
                cholesterol: cholesterol,
                NA: NA,
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
            // redirect to same page to continue adding ingredients
            res.redirect(`/recipes/edit/${req.body.recipeId}`)
        }
        catch (err) {
            // error occurs when food item is not found in database. Nutritional data will not be available for that ingredient.
            console.log(err)
            // create the ingredient anyway but with no nutritional data 
            const newIngredient = await db.ingredient.create({
                name: req.body.ingrName, 
                measure: req.body.ingrMeasure,
                quantity: req.body.ingrQuantity,
                energy: 'NA',
                recipeId: Number(req.body.recipeId)
            })
            res.redirect(`/recipes/edit/${req.body.recipeId}`)
        }
})

// GET /recipes/edit/:id to show a form that will edit a recipe and it's ingredients.
router.get('/edit/:id', async (req,res) => {
    const recipe = await db.recipe.findOne({
        where: {
            id: req.params.id
        },
    })
    const ingredients = await recipe.getIngredients()
    // show an edit form for the recipe
    res.render('recipes/edit', {recipe: recipe, ingredients: ingredients})
})

// GET /recipes/:id/ingredients/edit/:id to show a form for editing an ingredient 
router.get('/:recipeId/ingredients/edit/:ingrId', async(req,res) => {
    const recipe = await res.locals.user.getRecipes({
        where: {
            id: req.params.recipeId
        }
    })
    const ingredient = await recipe[0].getIngredients({
        where: {
            id: req.params.ingrId
        }
    })
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
         // Search for it on edamam API w new parameters
        const foodUrl = `https://api.edamam.com/api/food-database/v2/parser?app_id=${process.env.APP_ID}&app_key=${process.env.API_KEY}&ingr=${req.body.ingrName}`
        let response = await axios.get(foodUrl)
        // foodId is the top hit's id 
        let foodId = ""
        if (response.data.parsed.length >0) {
            foodId = response.data.parsed[0].food.foodId
        } else {
            foodId = response.data.hints[0].food.foodId
        }
        console.log(foodId)
        // for the units of measure, find the measure that matches the req.body.ingrmeasure input
        let measureUri = `http://www.edamam.com/ontologies/edamam.owl#Measure_${req.body.ingrMeasure}`
        console.log(measureUri)
        // axios.POST quantity, measureURI, and food ID as JSON data to get nutrition info
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
        // access the available nutrients. (not all nutrients are available for each food, so need to use if statements to check their status) 
        
        await ingredient.save()
        console.log(ingredient)
        const recipeId = ingredient.recipeId
        res.redirect(`/recipes/edit/${recipeId}`)

    }
    catch (err) {
        console.log(err)
    }
})

//   DELETE /recipes/:id/ingredients/:id to delete an ingredient
router.delete('/:recipeId/ingredients/:ingredientId', async (req,res) => {
    await db.ingredient.destroy({
        where: {
            id: req.params.ingredientId
        }
    })
    res.redirect(`/recipes/edit/${req.params.recipeId}`)
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
    let public = false
    // if the public input is checked
    // set public to true
    if (req.body.public) {
        public = true
    }
    const recipe = await db.recipe.findOne({
        where: {
            id: req.params.id
        }
    })
    recipe.name = req.body.name 
    recipe.directions = req.body.directions  
    recipe.story = req.body.story
    recipe.notes = req.body.notes
    recipe.img = req.body.img
    recipe.public = public
    await recipe.save()
    res.redirect(`/recipes/${recipe.id}`)
})

// // GET Route to show Form to add ingredients to a given recipe
// router.get('/:recipeId/ingredients/new', async (req, res) => {
//     const ingredients = await db.ingredient.findAll({
//         where: {
//             recipeId: req.params.recipeId
//         }
//     })
//     const recipe = await db.recipe.findOne({
//         where: {
//             id: req.params.recipeId
//         }
//     })
//     res.render('recipes/ingredients/new', {
//         recipe: recipe,
//         ingredients: ingredients
//     })
// })

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