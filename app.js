var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var myParser = require("body-parser");
var shell = require('shelljs')

var port = process.env.PORT || 1234;
var msgLog= [];
var users= [];
var coords= [];
var art= [];

app.use(express.static(__dirname));
app.get('/*', function(req, res){
  res.sendFile('index.html', { root: __dirname });
});

//This is to be used in conjuction with 'nodemon'
// app.use(myParser.urlencoded({extended : true}));
// app.post("/git", function(request, response) {
//   console.log(JSON.parse(request.body.payload).head_commit);
//   shell.exec('sudo git pull');
// });


function onConnect(socket){
  oldUser=false;

  socket.on('users', function(userID,user,tempID){
    console.log(users);
    for(var a=0;a<users.length;a++){
      if(users[a][0] == userID){
        console.log("\n\nThe user "+users[a][1]+ "changed their name to: "+user+", ID: "+userID);
        users[a][1]=user;
        var oldUser=true;
        for(i in msgLog){
          console.log(msgLog[i]);
          if(msgLog[i].userID == userID){
            msgLog[i].user = user;
          }
        }
        users[a][2]=socket.id;
      }
    }
    if(!oldUser){
      console.log("\n\nThis is a new user. Name: "+user+", ID: "+userID);
      users.push([userID,user,tempID]);
    }else{io.emit('userChange',msgLog);}
    console.log(users);
    io.emit('users',users);
  });

  socket.on('chat message', function(data){
    console.log("recieved");
    console.log(data[0].time,data[0].user,data[0].msg,data[0].userID);
    msgLog.push({time:data[0].time,user:data[0].user,msg:data[0].msg,userID:data[0].userID});
    console.log('\n\nmessage:' + data[0].msg);
    console.log(msgLog[0].time);
    socket.broadcast.emit('chat message', msgLog);
    //socket.emit('userMouse',{msg:msg});
  });

  socket.emit('canvasLoad', art);
  socket.on('drawing',function(data){
    socket.broadcast.emit('drawing',data);
    art.push(data);
  });

  socket.on('userMouse', function(data){
    if(data.msg){
      io.emit('userMouse',{msg:data.msg,user:data.user,oldx:data.oldx,oldy:data.oldy});
    }
    socket.broadcast.emit('userMouse',{user:data.user,oldx:data.oldx,oldy:data.oldy,newx:data.newx,newy:data.newy});
  });

  socket.on('disconnect', function(){
    for(var a=0;a<users.length;a++){
      if(users[a][2] == socket.id){
        console.log("disconnecting "+users[a][1]);
        users.splice(a,1);
        //users.splice(a,1);
      }
    }
    socket.broadcast.emit('users',users);
  });
}
io.on('connection',onConnect);
http.listen(port, () => console.log('listening on '+port));

/*
var tweets = setInterval(function () {
   getBieberTweet(function (tweet) {
     socket.volatile.emit('bieber tweet', tweet);
   });
 }, 100);

*/
