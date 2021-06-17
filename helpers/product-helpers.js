var db=require('../config/connection')
var collection=require('../config/collections')
var objectId=require('mongodb').ObjectID

module.exports={
    addproduct:(product,callback)=>{
        console.log(product);
        var item;
        item = {
            Name:product.Name,
            Category:product.Category,
            Price:parseInt(product.Price),
            Description:product.Description
        }
        console.log("item detaols #####"+item.Price+ "  "+item.Name);
        db.get().collection('product').insertOne(item).then((data)=>{
           
        callback(data.ops[0]._id)
        })
    },
  getAllProducts:()=>{
    return new Promise(async(resolve,reject)=>{
        let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
        resolve(products)
    })
},

deleteProduct:(proId)=>{
    return new Promise((resolve,reject)=>{
        console.log(proId);
        console.log(objectId(proId));
        db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(proId)}).then((response)=>{
            console.log(response);
            resolve(response)
        })
    })
},
getProductDetails:(proId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
            resolve(product)
        })
    })
},
updateProduct:(proId,proDetails)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION)
        .updateOne({_id:objectId(proId)},{
            $set:{
             Name:proDetails.Name,
             Description:proDetails.Description,
             Price:proDetails.Price,
             Category:proDetails.Category   
            }
        }).then((response)=>{
            resolve(cartItems[0].cartItems)
        })
    })
}


}