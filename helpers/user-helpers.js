var db =require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectID
const { ObjectID } = require('bson')
const { USER_COLLECTION } = require('../config/collections')

module.exports= {
    doSignup:(userData)=>{
        return new  Promise(async(resolve,reject)=>{
            console.log('encrypting the password......');  
           userData.Password=await bcrypt.hash(userData.Password,10)
           console.log('encrypted successfully.....');
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                console.log('user signup details stored to database.');
                resolve(data.ops[0])
            })
        })
    },

    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            console.log('comparing e mail  with the database e mail....');
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if(user){
                console.log('decrypting the password....');
                console.log('comparing with database password.....');
               bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status)
                    {
                        console.log("login success.....");
                        response.user=user
                        response.status=true
                        resolve(response)
                    }else{
                        console.log("login failed....");
                        resolve({status:false})
                    }
                    
                })
            }else{
                console.log("login failed....");
                resolve({status:false})
           }
        })
    },
    
  
    
    addToCart:(proId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(userCart)
            {
              db.get().collection(collection.CART_COLLECTION)
              .updateOne({user:objectId(userId)},
              {  
                   
                       $push:{products:objectId(proId)}
                   

                 }
                 ).then((response)=>{
                     resolve()
                 })
            }
            else{
                let cartObj={
                    user:objectId(userId),
                    products:[objectId(proId)]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }

        })
    },

    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([

                {
                    $match:{user:objectId(userId)}
                },
                {
                   
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        let:{prodList:'$products'},
                        pipeline:[
                            {
                                $match:{ 
                                    $expr:{
                                        $in:['$_id',"$$prodList"]
                                    }
                                }
                            }
                        ],
                        as:'cartItems'
                    }
                }
            ]).toArray()
            resolve(cartItems[0].cartItems)
        })
    },


    getCartCount:(userId)=>{
        return new Promise (async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if (cart)
            {
                count=cart.products.length
            }
            resolve(count)

        })
    }
   

}