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
    
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    
    addToCart:(proId,userId)=>{
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(userCart)
            {
              db.get().collection(collection.CART_COLLECTION)
              .updateOne({user:objectId(userId)}),
              {  
                   
                       $push:{products:objectId(proId)}
                   

                 }.then((response)=>{
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
                        from:collection.CART_COLLECTION,
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
            resolve(cartItems)
        })
    },

    deleteUser:(id)=>{
                return new Promise(async(resolve,reject)=>{
                   await db.get().collection(collection.USER_COLLECTION).removeOne({_id:objectId(id)}).then((response)=>{
                       resolve(id)
                   })
                })
            
    },
    adminLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            console.log('comparing e mail  with the database e mail....');
            let user=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:userData.Email})
            if(user){
                console.log('decrypting the password....');
                console.log('comparing with database password.....');
               bcrypt.compare(userData.Password,admin.Password).then((status)=>{
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
   //admin log in penting (errors),neet to set proprr roats,videos stuck at 23,cart error,
}