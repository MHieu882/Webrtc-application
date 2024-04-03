var socket = io();
const meeting = new Metered.Meeting();
const chatMessages = document.getElementById('card-body msg_card_body');

socket.emit('Login', userLoggin);

async function callUser(){  
  var Username = document.getElementById('target');
  const targetUsername = Username.value.trim();
  var userConfirmed = confirm('Bạn muốn bắt đầu cuộc gọi video không?');
  if (userConfirmed) {
    if(targetUsername === userLoggin){
      alert('Can not call yourself')
    }
    else{ 
      document.getElementById('videoContainer').style.display = 'flex';
      document.getElementById('chat-container').style.display = 'none';
      const meetingInfo = await meeting.join({roomURL: "webrtc-videocalling.metered.live/tests",name: userLoggin});
      console.log("Meeting joined", meetingInfo);
  
      socket.emit('call',{target:targetUsername,caller:userLoggin,roomURL:"webrtc-videocalling.metered.live/tests"})
    try {
      //bat video
      meeting.startVideo();
      } catch (ex) {
      console.log("Error occurred when sharing camera", ex);
      alert('share camera not working')
      }
      //chay local
      meeting.on("localTrackStarted", function(item) {
      if (item.type === "video") {
        var track = item.track;
        var mediaStream = new MediaStream([track]);
        document.getElementById("localvideo").srcObject = mediaStream;
        document.getElementById("localvideo").play();
      }
    });
    //set lgic o day
        meeting.on("participantJoined", function(participantInfo) {
        console.log("participant has joined the room", participantInfo);
        });
        meeting.on("remoteTrackStarted", function(remoteTrackItem) {
          console.log("remoteTrackStarted", remoteTrackItem);
          // Converting MediaStreamTrack to MediaStream
          var remoteTrack = remoteTrackItem.track;
          var remoteStream = new MediaStream([remoteTrack]);
          document.getElementById("remoteVideo").srcObject = remoteStream;
          document.getElementById("remoteVideo").play();
        });
    }
    }
}

//accpet call
socket.on('receive',async (data)=>{
  const Accpet = confirm(`Bạn có cuộc gọi từ ${data.caller}. Chấp nhận?`);
  if(Accpet){
    document.getElementById('videoContainer').style.display = 'flex';
    document.getElementById('chat-container').style.display = 'none';
    const meetingInfo = await meeting.join({
    roomURL: data.roomURL,
    name: userLoggin
    });
    console.log("Meeting joined", meetingInfo);
    
  try {
    //bat video
    meeting.startVideo();
    } catch (ex) {
    console.log("Error occurred when sharing camera", ex);
    alert('share camera not working')
    }
    //chay local
    meeting.on("localTrackStarted", function(item) {
    if (item.type === "video") {
      var track = item.track;
      var mediaStream = new MediaStream([track]);
      document.getElementById("localvideo").srcObject = mediaStream;
      document.getElementById("localvideo").play();
    }
  });
      meeting.on("participantJoined", function(participantInfo) {
      console.log("participant has joined the room", participantInfo);
      });
      meeting.on("remoteTrackStarted", function(remoteTrackItem) {
        console.log("remoteTrackStarted", remoteTrackItem);
        // Converting MediaStreamTrack to MediaStream
        var remoteTrack = remoteTrackItem.track;
        var remoteStream = new MediaStream([remoteTrack]);
  
        document.getElementById("remoteVideo").srcObject = remoteStream;
        document.getElementById("remoteVideo").play();
      });
  }
  else{
    socket.emit('decline',{caller:data.caller,callee:userLogginuserLoggin})
  }
})
socket.on('decline',async (data)=>{
  alert('Người Dùng bận!!')
  await  meeting.leaveMeeting(); 
})

socket.on('receiveMessage', (data) => {
  const div = document.createElement('div')
  const container = document.createElement('div');;
  let targetUserId =document.getElementById('target');
  let usertarget=targetUserId.value.trim();
  if(data.message.sender.username==usertarget && data.message.receiver.username==userLoggin){
    div.classList.add('msg_cotainer');
    container.classList.add('d-flex', 'justify-content-start', 'mb-4');
    div.innerHTML = `${data.message.content}`;
    container.appendChild(div);
    chatMessages.appendChild(container)
  }
});
socket.on('greceive', (data) => {
  const div = document.createElement('div')
  const container = document.createElement('div');;
  let targetUserId =document.getElementById('target');
  let usertarget=targetUserId.value.trim();
  if(data.message.sender.username!==userLoggin && data.message.receiver.Groupname==usertarget){
    div.classList.add('msg_cotainer');
    container.classList.add('d-flex', 'justify-content-start', 'mb-4');
    div.innerHTML = `${data.message.content}`;
    container.appendChild(div);
    chatMessages.appendChild(container)
  }
});

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    let targetUserId =document.getElementById('target');
    let usertarget=targetUserId.value.trim();
    const message = messageInput.value.trim();
    if (message &&usertarget) {
      const div = document.createElement('div');
      const container=document.createElement('div');

      div.classList.add('msg_cotainer_send');
      container.classList.add('d-flex','justify-content-end', 'mb-4');

      div.innerHTML = `${message}`;
      container.appendChild(div);
      chatMessages.appendChild(container);
      socket.emit('sendMessage',{message,usertarget,userLoggin})
      messageInput.value = '';
    }
}
function showChatContainer(targetUser) {
  var Username =document.getElementById('target').value.trim();
  if(targetUser=='delete'){
    socket.emit('deleteMessage',{targetUser:Username,userLoggin});
  }else{
  const targetElement = document.getElementById(targetUser);
  document.getElementById('message-container').style.display = 'block';
  const currentActiveElement = document.querySelector('.active');
  //set target
  document.getElementById('target').innerHTML = `${targetUser}`;
  if (currentActiveElement) {
      // Remove 'active' class from the current active element
      currentActiveElement.classList.remove('active');
  }
  // Add 'active' class to the target element
  if (targetElement) {
      targetElement.classList.add('active');
  }
  socket.emit('getMessage', { targetUser });
  }
}
socket.on("loadMess", async(data) => {
 //
 document.getElementById('call-btn').style.display = 'block';
 //
  const messages=data.messages;
  chatMessages.innerHTML = '';
  document.getElementById('user_info-chat').innerHTML = `<span> ${data.targetUser}  </span>`;
 
//avt
  document.getElementById('avt-chat').src=data.avt;
  //
  messages.forEach((message) => {
    const div = document.createElement('div');
    const container = document.createElement('div');
    if(message.sender.username==userLoggin && message.receiver.username==data.targetUser){
      div.classList.add('msg_cotainer_send');
      container.classList.add('d-flex', 'justify-content-end', 'mb-4');
      div.innerHTML = `${message.content}`;
    }else if(message.sender.username==data.targetUser && message.receiver.username==userLoggin){
      div.classList.add('msg_cotainer');
      container.classList.add('d-flex', 'justify-content-start', 'mb-4');
      div.innerHTML = `${message.content}`;
    }
    container.appendChild(div);
    chatMessages.appendChild(container);
  });
});

socket.on('loadmessGroup',async(data) =>{
  //setting menu
  document.getElementById('call-btn').style.display = 'none';
  

  // console.log(data)
  //
  const messages=data.messages;
  chatMessages.innerHTML = '';
  document.getElementById('user_info-chat').innerHTML = `<span> ${data.targetUser}  </span>`;
  document.getElementById('avt-chat').src=data.avt;
  messages.forEach((message) => {
    const div = document.createElement('div');
    const container = document.createElement('div');
    const containerimage = document.createElement('div');
    const sp=document.createElement('span');
    const avt = document.createElement('img');
    if(message.sender.username==userLoggin && message.receiver.Groupname==data.targetUser){
      div.classList.add('msg_cotainer_send');
      container.classList.add('d-flex', 'justify-content-end', 'mb-4');
      div.innerHTML = `${message.content}`;
    }
    if(message.sender.username!==userLoggin && message.receiver.Groupname==data.targetUser){
      //setting  avatarchat
      containerimage.classList.add('img_cont_msg');
      avt.classList.add('rounded-circle','user_img_msg');
      avt.src=message.sender.avatar;
      sp.classList.add('msg_time');
      sp.innerHTML = `${message.sender.username}`;
      div.classList.add('msg_cotainer');
      container.classList.add('d-flex', 'justify-content-start', 'mb-4');
      div.innerHTML = `${message.content}`;
    }
    containerimage.appendChild(avt);
    container.append(containerimage);
    div.appendChild(sp);
    container.appendChild(div);
    chatMessages.appendChild(container);
  });

})
//click to show
document.addEventListener('DOMContentLoaded', function() {
  // menu action
  document.getElementById('action_menu_btn').addEventListener('click', function() {
      var actionMenu = document.querySelector('.action_menu');
      if (actionMenu.style.display === 'none' || actionMenu.style.display === '') {
          actionMenu.style.display = 'block';
      } else {
          actionMenu.style.display = 'none';
      }
  });
  // menu user
  document.getElementById('user-menu-btn').addEventListener('click', function() {
    var userMenu = document.querySelector('.user-menu');
    if (userMenu.style.display === 'none' || userMenu.style.display === '') {
        userMenu.style.display = 'block';
    } else {
        userMenu.style.display = 'none';}
  });
});
//create group
function showForm(input) {
  if(input===5){
    document.getElementById('formprofileContainer').style.display = 'block';
  }
  else{
    document.getElementById('formContainer').style.display = 'block';
  }
  document.getElementById('overlay').style.display = 'block';
}

// Function to hide the form overlay
function hideForm() {
 
    document.getElementById('formprofileContainer').style.display ='none';
    document.getElementById('formContainer').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

async function endCall() {
  // Your code to end the call
  await  meeting.leaveMeeting(); 
  document.getElementById('chat-container').style.display = 'flex';
  document.getElementById('videoContainer').style.display = 'none';
}
function showmenu(input){
  if(input==1){
    document.getElementById('list-user').style.display = 'block';
    document.getElementById('list-group').style.display = 'none';
  }
 else{
  document.getElementById('list-user').style.display = 'none';
  document.getElementById('list-group').style.display = 'block';
 }
}
//group
function showchatgroup(){
  var Username =document.getElementById('target').value.trim();
  if(targetUser=='delete'){
    socket.emit('deleteMessage',{targetUser:Username,userLoggin});
  }else{
  const targetElement = document.getElementById(targetUser);
  document.getElementById('message-container').style.display = 'block';
  const currentActiveElement = document.querySelector('.active');
  //set target
  document.getElementById('target').innerHTML = `${targetUser}`;
  if (currentActiveElement) {
      currentActiveElement.classList.remove('active');
  }
  // Add 'active' class to the target element
  if (targetElement) {
      targetElement.classList.add('active');
  }
  socket.emit('getMessage', { targetUser });
  }
}