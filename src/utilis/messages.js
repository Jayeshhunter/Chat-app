const { urlencoded } = require("express")

const generateMessage = (username,text)=>{
    return{
        username,
        text,
        createdAt: new Date().getTime()
    }
}
const generateLocationMessage = (username,URL)=>{
   return{ 
    username,
    URL:URL,
    createdAt:new Date().getTime()
}
}
module.exports={
    generateMessage,
    generateLocationMessage
}