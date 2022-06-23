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



// GET /recipes/:id show details about specific recipe, grab associated ingredients 

router.get('/:id', async (req,res) => {
    if (!res.locals.user) {
        res.render('users/login.ejs', { msg: 'please log in to view recipe details, or check out the community recipes instead' })
    }
    else {
        const user = res.locals.user
        
        const recipe = await user.getRecipes({
            where: {
                id: req.params.id
            }
        })
        console.log(recipe, 'did we get the correct recipe?')
        const ingredients = await recipe[0].getIngredients()
        res.render('recipes/details', {recipe: recipe, ingredients: ingredients})
    }
})



module.exports = router