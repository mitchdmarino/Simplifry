const express = require('express') 
const router = express.Router()
const db = require('../models')

// GET /categories, show a list of all the user's categories (if they are logged in)
router.get('/', async (req,res) => {
    try {
        if (!res.locals.user) {
            res.render('users/login.ejs', {msg: 'please log in to view categories'})
        }
        else {
            const user = res.locals.user
            const categories = await user.getCategories()
            res.render('categories/index', {categories: categories})
        }
    }
    catch (err) {
        console.log(err)
    }
})

router.post('/', async (req,res) => {
    try {
        const user = res.locals.user
        let category = await user.createCategory({
            name: req.body.name
        })
        let categoryId = await category.id
        res.redirect(`/categories/${categoryId}`)
    }
    catch (err) {
        console.log(err)
    }
})

// GET /categories/:id to see all recipes associated with a category
router.get('/:id', async (req,res) => {
    try {
        const user = res.locals.user
        let category = await user.getCategories({
            where: {
                id: req.params.id
            }

        })
        // console.log(category)
        const recipes = await category[0].getRecipes()
        res.render('categories/show', {
            recipes: recipes,
            category: category[0]
        })
    }
    catch (err) {
        console.log(err)
    }
})

// PUT /categories/:id to change the name of a category 
router.put('/:id', async (req,res) => {
    try {
        let category = await db.category.findOne({
            where: {
                id: req.params.id
            }
        })
        category.name = req.body.name
        category.save()
        res.redirect(`/categories/${req.params.id}`)
    }
    catch (err) {
        console.log(err)
    }
})









module.exports = router