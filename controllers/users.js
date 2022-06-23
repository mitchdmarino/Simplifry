const express = require('express') 
const router = express.Router()
const db = require('../models')

const cryptoJS = require('crypto-js')
const bcrypt = require('bcryptjs')




router.get('/new', (req,res) => {
    res.render('users/new.ejs', {msg: null})
})

// POST /users -- creates a new user and redirects to index
router.post('/', async (req,res) => {
    try{
        // try to create the user
        // TODO: hash password
        const hashedPassword = bcrypt.hashSync(req.body.password,12)
        const [user,created] = await db.user.findOrCreate({
            where: {name: req.body.name, email: req.body.email},
            defaults: {password: hashedPassword}
        })
        // if the user is new 
        if (created) {
            // login them by giving them cookie 
            // res.cookie('cookie name', cooki data)
            // todo: encrypt id 
            const encryptedId = cryptoJS.AES.encrypt(user.id.toString(), process.env.ENC_KEY).toString()
            res.cookie('userId', encryptedId)
            //redirect to the homepage (in the future this could redirect elsewhere)
            res.redirect('/')
        }
        // if user was not created 
        else {
             // re render the login form with a message for the user 
             console.log('that email already exists')
             res.render('users/new.ejs', {msg: 'email exists in database already 😳'})
        }
           
    }
    catch (err) {
        console.log(err)
    }    
        
})

// GET /users/login -- renders a login form 
router.get('/login', (req, res) => {
    
    res.render('users/login', {msg:null})
})
// POST /users/login -- authenticates user credentials against the database 
router.post('/login', async (req, res) => {
    try {
        // look up the user in the db based on email 
        const user = await db.user.findOne({
            where: {email: req.body.email}
        })
        const msg='bad login credentials, you are not authenticated!'
        // if user is not found, display login form and give message 
        if (!user) {
            console.log('user email not found')
            res.render('users/login', {msg: msg})
            return // stop the function
        }
        // otherwise, check the password against password in database 
        // hash the password from the req.body and compare it to the db password 
        // if match, send user a cookie! 
        const compare = bcrypt.compareSync(req.body.password, user.password)
        if (compare) {
            const encryptedId = cryptoJS.AES.encrypt(user.id.toString(), process.env.ENC_KEY).toString()
            res.cookie('userId', encryptedId)
            res.redirect('/')
        } else {
             // if not, render the login form with a message
             res.render('users/login', {msg: msg})
        }
       
    
            

    } catch (err) {
        console.log('Error.', err)
    }
})

// GET /users/logout -- clear the cookie then render the homepage 
router.get('/logout', (req, res) => {
    // clear the cookie
    res.clearCookie('userId')
    // redirect to root 
    res.redirect('/')
})

router.get('/profile', (req, res) => {
	// check if user is authorized
	if (!res.locals.user) {
		// if the user is not authorized, ask them to log in
		res.render('users/login.ejs', { msg: 'please log in to continue' })
		return // end the route here
	}

	res.render('users/profile', { user: res.locals.user })
})





module.exports = router