var express = require('express');
const { post } = require('../app');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper=require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');


/* GET users listing. */
router.get('/', function(req, res, next) {
    productHelpers.getAllProducts().then((products)=>{
       
        console.log(products);
        res.render('admin/view-products',{admin:true,products})
    
})
})


router.get('/add-product',function(req,res){

res.render('admin/add-product',{admin:true})
})
router.post('/add-product',(req,res)=>{
    console.log(req.body)
    console.log(req.files.Image)
    productHelper.addproduct(req.body,(id)=>
    {

        let image=req.files.Image
        image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
            if(!err){
                res.render('admin/add-product')
            }else{
                console.log(err);
            }
        })
        
    })
})
router.get('/delete-product/:id',(req,res)=>{
    let proId=req.params.id
    console.log(proId);
    productHelpers.deleteProduct(proId).then((response)=>(
        res.redirect('/admin/')
    ))

})
router.get('/edit-product/:id',async(req,res)=>{
    let product=await productHelpers.getProductDetails(req.params.id)
    console.log('taking data from database...');
    console.log(product);
    res.render('admin/edit-product',{admin:true,product})
})

router.post('/edit-product/:id',(req,res)=>{
    let id=req.params.id
    productHelpers.updateProduct(req.params.id,req.body).then(()=>{
        res.redirect('/admin')
        if(req.files.Image){
            let image=req.files.Image
            image.mv('./public/product-images/'+id+'.jpg')


        }
    })
})
router.get('/get-users',(req,res)=>{
    userHelpers.getAllUsers().then((users)=>{
        console.log(users);
        res.render('admin/get-users',{admin:true,users})
    })
})

router.get('/delete-user/:id',(req,res)=>{
    let id=req.params.id
    userHelpers.deleteUser(id).then((response)=>{
        res.redirect('/admin/get-users')
    })

}
  
)
router.get('/login',(req,res)=>{
    
    res.render('admin/login',{admin:true})
})
router.post('/login',(req,res)=>{
    console.log('submitting login page requestes...');
    console.log(req.body);
    userHelpers.adminLogin(req.body).then((response)=>
    {
      if(response.status){
        req.session.loggedIn=true
        req.session.user=response.user
        res.redirect('admin/get-users')
      }else{
        req.session.loginErr="Invalied Username or Password"
        res.redirect('/admin/login',{admin:true})
      }
    })
  })

module.exports = router;
