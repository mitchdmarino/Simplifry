require('dotenv').config()
// required packages

const express = require('express')
const rowdy = require('rowdy-logger')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const db = require('./models')
const cryptoJS = require('crypto-js')
const res = require('express/lib/response')
// app config
const PORT = process.env.PORT || 3000
const app = express()
app.set('view engine', 'ejs')




// middlewares
const rowdyRes = rowdy.begin(app)
app.use(express.static('Public'))
app.use(require('express-ejs-layouts'))
app.use(express.urlencoded({ extended: false }))
app.use(express.static('Public'))
app.use(methodOverride('_method'))

app.use(cookieParser())

// DIY Middleware 
app.use((req,res,next) => {
  console.log(`[${new Date().toLocaleString()}] incoming request: ${req.method} ${req.url}`)
  console.log('request body:', req.body)
  res.locals.myData = 'hi, I came from a middleware!'
  next()
}) 


app.use(async (req, res, next) => {
  try {  
  // 1
    if (req.cookies.userId) {
      const userId = req.cookies.userId
      const decryptedId = cryptoJS.AES.decrypt(userId, process.env.ENC_KEY).toString(cryptoJS.enc.Utf8)
      const user = await db.user.findByPk(decryptedId)
      // 2
      res.locals.user = user
    }
    // 3
    else {
      res.locals.user = null 
    }
   
  }
  catch (err) {
    console.log(err)
   
  }
  finally {
    next()
  }
    
})




// controllers
app.use('/users', require('./controllers/users'))
app.use('/recipes', require('./controllers/recipes'))
app.use('/categories', require('./controllers/categories'))




// routes
app.get('/', (req, res) => {
  res.render('index')
})

// 404 error handler -- NEEDS TO GO LAST 
// app.get('/*', (req, res) => {
  // render your 404 template 
// })
app.use((req,res,next) => {
  res.status(404).render('404.ejs')
})

// 500 error handler
app.use((error, req, res, next) => {
  // log the error 
  // send a 500 error template
  console.log(error)
  res.status(500).render('500.ejs')
})

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  rowdyRes.print()
})
