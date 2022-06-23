const express = require('express') 
const req = require('express/lib/request')
const router = express.Router()
const db = require('../models')
const axios = require('axios')
require('dotenv').config()


// get to show a list of recipes that are public 
router.get('/', async (req,res) => {
    try {
        const publicRecipes = await db.recipe.findAll({
            where: {
                public: true
            }
        })
        res.render('community/index', {recipes: publicRecipes})
    }
    catch (err) {
        console.log(err)
        res.redirect('/')
    }
})

router.get('/:id', async (req,res) => {
    try {
        const publicRecipe = await db.recipe.findOne({
            where: {
                public: true,
                id: req.params.id
            }
        })
        const user = res.locals.user
        const ingredients = await publicRecipe.getIngredients()
        if (!publicRecipe) {
            res.clearCookie('userId')
            res.redirect('/users/login', { msg: 'that recipe is not public' })  
        } else {
            res.render('community/details', {recipe: publicRecipe, ingredients: ingredients, userName: user.name})
        }
    }
    catch (err) {
        console.log(err)
        res.redirect('/community')
    }
})

// route to create a new recipe for the user that is identical to the selected recipe
router.post('/save/:id', async (req,res) => {
    try {
        if (!res.locals.user) {
            res.redirect('/users/login', { msg: 'please log in to save recipes, or check out the community recipes instead' })
        } else {
            // identify the user
            const user = res.locals.user
            // identify the recipe 
            let recipe = await db.recipe.findOne({
                where: {
                    id: req.params.id
                }
            })
            console.log(recipe)
            let ingredients = await recipe.getIngredients()
            console.log(ingredients)
            if (!recipe.public) {
                res.clearCookie('userId')
                res.redirect('/users/login', { msg: 'this recipe is not public' })
            } else {
                console.log('hellow')
                const recipeCopy = await db.recipe.create({
                        name: recipe.name,
                        directions: recipe.directions,
                        story: recipe.story,
                        notes: recipe.notes,
                        img: recipe.img,
                        public: false, 
                        userId: user.id
                })
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
                for await (const ingredient of ingredients) {
                    let energy = 0
                    if (ingredient.energy) {
                        energy = ingredient.energy
                    }
                    let fat = 0 
                    if (ingredient.fat) {
                        fat = ingredient.fat
                    } 
                    let satFat = 0
                    if (ingredient.satFat) {
                        satFat = ingredient.satFat
                    } 
                    let transFat = 0
                    if (ingredient.transFat) {
                        transFat = ingredient.transFat
                    } 
                    let carbs = 0
                    if (ingredient.carbs) {
                        carbs = ingredient.carbs
                    } 
                    let fiber = 0
                    if (ingredient.fiber) {
                        fiber = ingredient.fiber
                    } 
                    let sugar = 0
                    if (ingredient.sugar) {
                        sugar = ingredient.sugar
                    }
                    let protein = 0
                    if (ingredient.protein) {
                        protein = ingredient.protein
                    }
                    let NA = 0
                    if (ingredient.NA) {
                        NA = ingredient.NA
                    }
                    let cholesterol = 0
                    if (ingredient.cholesterol) {
                        cholesterol = ingredient.cholesterol
                    }
                    await db.ingredient.create({
                        name: ingredient.name, 
                        measure: ingredient.measure,
                        quantity: ingredient.quantity, 
                        energy: energy,
                        fat: fat,
                        satFat: satFat  ,
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
                        recipeId: recipeCopy.id
                    })
                }
                
                console.log(recipeCopy, '🤯🥶🥶🥶🥶🥶😡😡')
                res.redirect(`/recipes/${recipeCopy.id}`)
            }

        }
        
    }
    catch (err) {
        console.log(err)
    }
})





module.exports = router