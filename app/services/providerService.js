const repository= require("../models/provider");

module.exports = {
    listHosts: function(params){
        return new Promise( (resolve, reject) =>{
            repository.list(params).then( l =>{
                let list=l.map( function(item){ return item.host  })
                resolve(list)
            }).catch(e=>{ reject(e) })
        })
    }
};