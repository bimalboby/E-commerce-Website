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
        let proObj={
            item:objectId(proId),
            quantity:1
            
        }
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(userCart)
            {
              let proExist=userCart.products.findIndex(product=> product.item==proId)
              console.log(proExist);
              if (proExist!=-1)
              {
                  db.get().collection(collection.CART_COLLECTION) 
                  .updateOne({user:objectId(userId),'products.item':objectId(proId)},
                  {
                      $inc:{'products.$.quantity':1}
                  }
                  ).then(()=>{
                      resolve()
                  })

              }else{
              db.get().collection(collection.CART_COLLECTION)
              .updateOne({user:objectId(userId)},
              {  
                   
                       $push:{products:proObj}
                   

                 }
                 ).then((response)=>{
                     resolve()
                 })
            }
        }
            else{
                let cartObj={
                    user:objectId(userId),
                    products:[proObj]
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
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'

                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'

                    }
                },
                {
                    $project:{
                        item:1, quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }  
               
            ]).toArray()
            console.log(cartItems[0].products);
            resolve(cartItems)
        })
    },


    getCartCount:(userId)=>{
        return new Promise (async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if (cart)
            {
                count=cart.products.length
            }
            resolve(count)

        })
    },

    changeProductQuantity:(details)=>{

        details.count=parseInt(details.count)
        details.quantity=parseInt(details.quantity)
        console.log(cartId,proId);

        return new Promise((resolve,reject)=>{
            if(details.count==-1 && details.quantity==1 ){

                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart)},
                {
                    $pull:{products:{item:objectId(details.product)}}
                }
                ).then((response)=>{
                    resolve({removeProduct:true })
                })
            }else{

                db.get().collection(collection.CART_COLLECTION) 
                  .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
                  {
                      $inc:{'products.$.quantity':details.count}
                  }
                  ).then((response)=>{
                      resolve(true)
                  })

            }

            
             
        })

    }
    

}