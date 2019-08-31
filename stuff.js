(function(){
  console.log("Otiosus Industries™ ");
  //
var socket = io();
//When server resets, page reloads
//socket.on('connect', ()=>console.log('Server connected'));



var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var canvas2 = document.getElementById('myCanvas2');
var context2 = canvas2.getContext('2d');
var scroll = document.getElementById('main');
var colors = document.getElementById("color");
var size = document.getElementById("size");
var msgBox = document.getElementById("messages");
var msgInp= document.getElementById("msgIn");
var userBox= document.getElementById("users");
var drawing = false;
var disconnect=false;
var msgLog=[];
var users=[];
var cookie=[];
var oldXY=[];
var userInfo={};
var current = {
    color: "#"+colors.value
};

size.addEventListener('change',sizeChange, false);
canvas2.addEventListener('mousedown', onMouseDown, false);
canvas2.addEventListener('mouseup', onMouseUp, false);
canvas2.addEventListener('mouseout', onMouseUp, false);
canvas2.addEventListener('mousemove', throttle(onMouseMove, 10), false);
canvas2.addEventListener('mousemove',mouseOver,true);



socket.on('drawing', onDrawingEvent);


function sizeChange(){
  if(size.value>100){
    size.value = 100;
  }
}

function mouseOver(e){
  socket.emit('userMouse',{user:document.cookie.split(",")[1],oldx:oldXY[0],oldy:oldXY[1]+scroll.scrollTop-25,newx:e.x,newy:e.y+scroll.scrollTop-25});
  oldXY=[e.x,e.y];
  context2.clearRect(0,0,canvas2.width,canvas2.height);
  context2.beginPath();
  context2.arc(e.x+scroll.scrollLeft,e.y+scroll.scrollTop-25,size.value/2,0,2*Math.PI);
  context.strokeStyle = "#"+colors.value;
  context2.fillStyle = "#"+colors.value;
  context2.fill();
  context2.stroke();
}

socket.on('userMouse',function(data){
  if(data.msg){
    //console.log(data);
    context2.font = "30px Comic Sans MS";
    context2.fillStyle = "Black";

    context2.fillText(data.msg, data.oldx, data.oldy);
  }else{
    context2.clearRect(0,0,canvas2.width,canvas2.height);
    context2.font = "15px Comic Sans MS";
    context2.fillStyle = "Black";

    context2.fillText(data.user, data.newx, data.newy);
  }
});

function drawLine(x0, y0, x1, y1, color, size, emit){
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = size;
  context.lineJoin = "round";
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.closePath();
  context.stroke();

  if (!emit) { return; }
  var w = canvas.width;
  var h = canvas.height;
  //console.log(w,h);
  socket.emit('drawing', {
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
    colors: color,
    sizes: size
  });
}

function onMouseDown(e){
  if(e.button!=1){
    drawing = true;
    current.x = e.clientX+scroll.scrollLeft;
    current.y = e.clientY+scroll.scrollTop-25;
  }
}

function onMouseUp(e){
  if (!drawing) { return; }
  drawing = false;
  drawLine(current.x, current.y, e.clientX+scroll.scrollLeft, e.clientY+scroll.scrollTop-25, "#"+colors.value, size.value, true);
}

function onMouseMove(e){
  if (!drawing) { return; }
  drawLine(current.x, current.y, e.clientX+scroll.scrollLeft, e.clientY+scroll.scrollTop-25, "#"+colors.value, size.value, true);
  current.x = e.clientX+scroll.scrollLeft;
  current.y = e.clientY+scroll.scrollTop-25;
}

// limit the number of events per second
function throttle(callback, delay) {
  var previousCall = new Date().getTime();
  return function() {
    var time = new Date().getTime();

    if ((time - previousCall) >= delay) {
      previousCall = time;
      callback.apply(null, arguments);
    }
  };
}

function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.colors, data.sizes);
}


function loadCanvas(data){
  var w = canvas.width;
  var h = canvas.height;
  for(var a =0;a<data.length;a++){
    drawLine(data[a].x0 * w, data[a].y0 * h, data[a].x1 * w, data[a].y1 * h, data[a].colors, data[a].sizes);
  }
}

socket.on('canvasLoad', function(data){
  loadCanvas(data);
});

//document.getElementById("body").onload=setTimeout(function(){load(0);},"1000");

socket.on('disconnect', ()=> disconnect=true);
socket.on('connect', function(){
  if(disconnect){
    console.log('re-connection');
    location.reload();
    disconnect=false;
  }

  console.log('connection');
  msgBox.scrollTop = msgBox.scrollHeight;
  if(document.cookie==''){
   //var time= new Date();
   //time.setTime(time.getTime());
   document.cookie = [socket.id,"Anonymous"];
   console.log("Welcome "+ document.cookie.split(",")[1] +" to otiosus");
   socket.emit('users',socket.id,"Anonymous",0);
  }
  else{
   console.log("Welcome back "+ document.cookie.split(',')[1]);
   socket.emit('users',document.cookie.split(",")[0],document.cookie.split(",")[1],socket.id);
  }
  userBox.innerHTML+="<br>"+document.cookie.split(",")[1];
  msgBox.scrollTop = msgBox.scrollHeight;
 });


socket.on('users',function(data){
  users=[];
  var userBox= document.getElementById("users");
  for(i in data){
    users.push(data[i][1]);
  }
  console.log(users);
  userBox.innerHTML=users.join("<br>");
  msgBox.scrollTop = msgBox.scrollHeight;
});

socket.on('userChange',function(data){
  msgBox.innerHTML = '';
  for(i in data){
    msgBox.innerHTML+= "<br><small>"+data[i].time+"</small> - "+"<i>"+data[i].user+"</i>: "+data[i].msg
  }
  msgBox.scrollTop = msgBox.scrollHeight;
});

socket.on('chat message', function(data){
  len=data.length-1;
  new Audio('mail.mp3').play();
  var msgBox= document.getElementById("messages");

  console.log(msgLog);
  msgBox.innerHTML+="<br><small>"+data[len].time+"</small> - "+"<i>"+data[len].user+"</i>: "+data[len].msg;
  msgBox.scrollTop = msgBox.scrollHeight;

  //document.getElementById("msgButt").style.display='inline';
});


document.getElementById("userButt").addEventListener("click",setName);
function setName(){
  var userBox= document.getElementById("users");
  console.log("Changing name...");
  var input= document.getElementById("name").value;
  if(input.length>25){
    input=input.slice(0,25);
    alert("Your username will be cut short\nYour input must be under 25 characters");
  }
  socket.emit('users',document.cookie.split(",")[0],input,socket.id);
  document.cookie= [document.cookie.split(",")[0],input];
  userBox.innerHTML=""
  for(var i = 0;i<users.length-1;i++){
    userBox.innerHTML+="<br>"+users[i];
  }
  userBox.innerHTML+="<br>"+input;
  //document.getElementById("userButt").style.display='none';
  return false;
}


document.getElementById("msgButt").addEventListener("click",msgSend);
function msgSend(){
  console.log(oldXY);
  var input = document.getElementById("msgIn").value;
  //socket.emit('userMouse',{msg:input.value,user:document.cookie.split(",")[1],oldx:oldXY[0],oldy:oldXY[1]});
  var wwwRegex = /(\b(www|ftp|file)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  var httpRegex = /(\b(https?:\/\/|ftp|file)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  var time = new Date().toLocaleString("en-US", {timeZone: "America/Chicago"});
  input = input = input.replace(wwwRegex,"http://$&");
  input = input.replace(httpRegex,"<a href='$&' target='_blank'>$&</a>");

  //socket.emit('chat message',"<small>"+time.slice(10)+"</small> - "+"<i>"+document.cookie.split(',')[1]+"</i>: "+input.value);
  socket.emit('chat message',[{time:time.slice(10),user:document.cookie.split(',')[1],msg:input,userID:document.cookie.split(',')[0]}]);
  console.log("Sent");
  // msgLog.push([{time:time.slice(10),user:document.cookie.split(',')[1],msg:input.value,userID:document.cookie.split(',')[0]}]);
  //msgLog.push("<small>"+time.slice(10)+"</small> - "+"<i>"+document.cookie.split(',')[1]+"</i>: "+input.value);
  //document.getElementById("msgButt").style.display='none';
  msgBox.innerHTML += "<br><small>"+time.slice(10)+"</small> - "+"<i>"+document.cookie.split(',')[1]+"</i>: "+input;
  document.getElementById("msgIn").value = "";
  return false;
}

var nameInput = document.getElementById("name");
nameInput.addEventListener("keydown", function(event) {
    if (event.keyCode === 13) {
        setName();
    }
  });

var msgInput = document.getElementById("msgIn");
msgInput.addEventListener("keydown", function(event) {
    if (event.keyCode === 13) {
        msgSend();
    }
  });

})();
