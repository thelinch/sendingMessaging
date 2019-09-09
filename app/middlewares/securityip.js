const providerService = require("../services/providerService")
const clientService = require("../services/clientService")

module.exports = {
    verify: async function(req, res, next){
        try{
            var remote_ip= req.connection.remoteAddress;
            providers_ip=await providerService.listHosts()
            clients_ip = await clientService.listHosts()
            let ips  = providers_ip
            for(c of clients_ip){ ips.push(c)}
            if( ips.indexOf(remote_ip) == -1 ){ console.log("IP Denegada:"+remote_ip); throw new Error("Ip Denied") }
            else{  console.log("IP Aceptada:"+remote_ip); }
            next()
        }catch(e){
            //next(e)
            throw e
        }
        
    }
}
/*const securityip = async function(req, res, next){
    let providers_ip= await providerService.listHosts()
    next()
}*/