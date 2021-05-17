var express = require('express');
const {  response } = require('../app');
 var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
//MIDDLEwere

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }
  else{
    res.redirect('/login')
  }
}


/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('loading products........');
   let user=req.session.user
      productHelpers.getAllProducts().then((products)=>{
     
        console.log(products);
        console.log('full products loaded and displayed successfully');
        res.render('user/view-products',{products,user})

      })
 
})

router.get('/login',(req,res)=>{ 
  console.log(' rendering login page...');
  if(req.session.loggedIn)
  {
    console.log('redirecting to the home page....(already logged in)');
    res.redirect('/')
  }
  else{
    res.render('user/login',{'loginErr':req.session.loginErr })
  console.log('login page loaded successfully...');

  }
  
}) 
router.get('/signup',(req,res)=>{
  console.log(' rendering signup page...');
  res.render('user/signup') 
  console.log('signup page loaded successfully....');
})
router.post('/signup',(req,res)=>{
  console.log('submitting sign up page requests...');
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response);
    req.session.loggedIn=true
    req.session.user=response
    res.redirect('/')
  })


})
router.post('/login',(req,res)=>{
  console.log('submitting login page requestes...');
  console.log(req.body);
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.loginErr="Invalied Username or Password"
      res.redirect('/login')
    }
  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  console.log(products);
  res.render('user/cart',products)

}
)
router.get('/add-to-cart/:id',verifyLogin,async(req,res)=>{
  userHelpers.addToCart(req.params.id,req.session._id).then(()=>{ 
    res.redirect('/')
  })
})
  
module.exports = router;