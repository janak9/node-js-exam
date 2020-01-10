var jwt = require("jsonwebtoken");
const chalk = require('chalk');

module.exports = {
    sign: function(data, secret){
        return jwt.sign(data, secret, {expiresIn: '2d'});
    }, 
    verify: async function(token, secret){
        try{
            var data = await jwt.verify(token, secret);
            return {data};
        }catch(error){
            console.log(chalk.red("error occurred while verifing token "), error);
            return {error};
        }
    }
}