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
            let recipe = await user.getRecipe({
                id: req.params.id
            })
            let ingredients = await user.getIngredients({

            })
            if (!recipe.public) {
                res.clearCookie('userId')
                res.redirect('/users/login', { msg: 'this recipe is not public' })
            } else {
                const recipeCopy = await user.addRecipe({
                    name: recipe.name,
                    directions: recipe.directions,
                    story: recipe.story,
                    notes: recipe.notes,
                    img: recipe.img,
                    public: false
                })
            }
            //
            for (const ingredient )
        }
        
    }
    catch (err) {
        console.log(err)
    }
})





module.exports = router