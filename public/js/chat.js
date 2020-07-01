const socket = io();
// server (emit) -> client (recieve) --acknowledgement--> server
// client (emit) -> server (recieve) --acknowledgement--> client
// socket.on('countUpdated',(count)=>{
//     console.log('The count has been updated ' + count);
// });

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('Clicked');
//     socket.emit('increment');
// });
// Elements
const $messageForm=document.querySelector('#form');
const $messageFormInput=$messageForm.querySelector('input');
const $messageFormButton=$messageForm.querySelector('button');
const $messages = document.querySelector("#messages");
const dupMessages = document.querySelector("#duplicate-message-template").innerHTML;
// templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;
// Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true});
// auto scrolling
const autoScroll = ()=>{
      // New message element
      const $newMessage = $messages.lastElementChild

      // Height of the new message
      const newMessageStyles = getComputedStyle($newMessage);
      const newMessageMargin = parseInt(newMessageStyles.marginBottom);
      const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
      // console.log(newMessageMargin);
      const visibleHeight = $messages.offsetHeight

      const containerHeight = $messages.scrollHeight;
      const scrollOffset = $messages.scrollTop + visibleHeight;
      if(containerHeight - newMessageHeight <= scrollOffset){
            $messages.scrollTop = $messages.scrollHeight
      }
}

socket.on("message",(wel)=>{
      console.log(wel);
      const html = Mustache.render(messageTemplate,{
            username:wel.username,
            message:wel.text,
            createdAt:moment(wel.createdAt).format('h:mm a')
      });
      $messages.insertAdjacentHTML("beforeend",html);
      autoScroll();
});
socket.on("locationMessage",(URL)=>{
      console.log(URL);
      const htmlNew = Mustache.render(dupMessages,{
            username:URL.username,
            createdAt:moment(URL.createdAt).format('h:mm a'),
            URL:URL.URL
      });
      $messages.insertAdjacentHTML("beforeend",htmlNew);
      autoScroll();
});

socket.on('roomData',({room,users})=>{
      // console.log(room);
      // console.log(users);
      const html = Mustache.render(sideBarTemplate,{
            room,
            users
      }) ;
      document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener('submit',(e)=>{
      e.preventDefault();

      $messageFormButton.setAttribute('disabled','disabled');
      // const val=document.getElementById("Text").value;
      const message = e.target.elements.message.value;
      socket.emit('reply',message,(error)=>{
           $messageFormButton.removeAttribute('disabled');
           $messageFormInput.value='';
           $messageFormInput.focus();
      

            if(error){
                  return console.log(error);
            }
            console.log('Message delivered');
            
            // console.log('The message was delivered',message);
      });
});
document.querySelector('#send-location').addEventListener('click',()=>{
      if(!navigator.geolocation){
            return alert('Unable to connect to the GPS');
      }
      document.querySelector('#send-location').setAttribute('Disabled','Disabled');

      navigator.geolocation.getCurrentPosition((position)=>{
            // console.log(position.coords.latitude);
            // console.log(position.coords.longitude);
            const loc={
                  latitude:position.coords.latitude,
                  longitude:position.coords.longitude
            }
            socket.emit('sendLocation',loc,()=>{
                  document.querySelector('#send-location').removeAttribute('Disabled');
                  console.log('Location shared');
                  
            });
      });
      // socket.on("locationMessage",(URL)=>{
      //       console.log(URL);
            
      // });
});


socket.emit('join',{username,room},(error)=>{
      if(error){
            alert(error);
            location.href = '/';
      }
});







