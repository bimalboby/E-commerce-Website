var db =require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
var objectId=require('mongodb').ObjectID
const { ObjectID } = require('bson')
const { USER_COLLECTION } = require('../config/collections')

module.exports={

    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },

    deleteUser:(id)=>{
        return new Promise(async(resolve,reject)=>{
           await db.get().collection(collection.USER_COLLECTION).removeOne({_id:objectId(id)}).then((response)=>{
               resolve(id)
           })
        })
    
},



adminSignup:(adminData)=>{
    return new  Promise(async(resolve,reject)=>{
        console.log('encrypting the password......');  
       adminData.Password=await bcrypt.hash(adminData.Password,10)
       console.log('encrypted successfully.....');
        db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data)=>{
            console.log('user signup details stored to database.');
            resolve(data.ops[0])
        })
    })
},


adminLogin:(adminData)=>{
    return new Promise(async(resolve,reject)=>{
        let loginStatus=false
        let response={}
        console.log('comparing e mail  with the database e mail....');
        let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminData.Email})
        console.log('admin found :'+ admin);
        if(admin){
            console.log('decrypting the password....');
            console.log('comparing with database password.....');
           bcrypt.compare(userData.Password,admin.Password).then((status)=>{
                if(status)
                {
                    console.log("login success.....");
                    response.admin=admin
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