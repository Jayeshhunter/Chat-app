const path = require('path');
const http = require('http');
const express=require('express');
const socketio=require('socket.io');
const app=express();
const Filter=require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utilis/messages');
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utilis/users');
// This piece of code is not required as i amsettingup the server which is done automatically by the express
const server=http.createServer(app);
const port =process.env.PORT||3000;
const io=socketio(server);


const publicDirectoryPath = path.join(__dirname,'../public');
app.use(express.static(publicDirectoryPath));
// let count=0;
// server(emit) -> client(recieve) = count upadate
// client(emit) -> server(recieve) = increment
io.on('connection', (socket) =>{
    console.log('New web socket connection');
    // The first argument related to the name and the second is sending arguments to the callback
//     socket.emit('countUpdated',count);
//     socket.on('increment',()=>{
//         count++;
//         // socket.emit('countUpdated',count);
//         io.emit('countUpdated',count);
//     });
// });

// socket.emit("message",generateMessage('Welcome!'));
// socket.broadcast.emit("message",generateMessage('A new user has joined'));

socket.on("join", (options,callback)=>{
   const {error,user} = addUser({ id:socket.id, ...options });
   
   if(error){
   return callback(error);
   }
   

   socket.join(user.room);
    // io.to.emit --> to send emit a message to everyone in the room
    // socket.broadcast.to.emit --> all same property as the socket.broadcast.emi except only in the room
    socket.emit("message",generateMessage('Inception Wave','Welcome!'));
    socket.broadcast.to(user.room).emit("message",generateMessage('Inception Wave',user.username + ' has joined!'));
    io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
    });

    callback();
});

socket.on('reply',(answer,callback)=>{
    const filter = new Filter();
    const user = getUser(socket.id);
    if(filter.isProfane(answer)){
        return callback('Profanity is not allowed');
    }
    // console.log(reply);
    io.to(user.room).emit("message",generateMessage(user.username,answer));
    callback('Delivered!');
});



socket.on('disconnect',()=>{
    const user = removeUser(socket.id);

    if(user){
        io.to(user.room).emit("message",generateMessage('Inception Wave',user.username + " Has Left"));
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        });
    }
    
});
socket.on('sendLocation',(loca,callback)=>{
    // io.emit("message","https://google.com/maps?q="+ loca.latitude + "," + loca.longitude);
    const user = getUser(socket.id);
    io.to(user.room).emit("locationMessage",generateLocationMessage(user.username, "https://google.com/maps?q="+ loca.latitude + "," + loca.longitude));
    callback();
});
}); 

server.listen(port,()=>{
console.log('Server is up and running');
});

