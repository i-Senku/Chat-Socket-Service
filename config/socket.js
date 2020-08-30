const server = require('./server');
const io = require('socket.io')(server);
const Message = require('../model/message');
const user = require('../model/user');


console.log('Socket sayfası aktif');

var connectedUsers = [];

io.on('connection', socket => {

    socket.on('chatID', (data) => {
        let chatID = data.id;

        socket.join(chatID);
        connectedUsers.push(chatID);

        socket.broadcast.emit('onlineUsers', {
            'users': connectedUsers
        });

        socket.on('disconnect', () => {
            //Remove ConnectedUsers
            let index = connectedUsers.indexOf(chatID);
            if (index > -1){
                connectedUsers.splice(index,1);
            }  
            // Leave From Room
            socket.leave(chatID);
            socket.broadcast.emit('onlineUsers', {
                'users': connectedUsers
            });
        })


        socket.on('send_message', message => {

            receiverChatID = message.receiverChatID
            senderChatID = message.senderChatID
            content = message.content
            isImage = message.isImage

            saveMessage(content, senderChatID, receiverChatID, true,isImage);


            socket.in(receiverChatID).emit('receive_message', {
                'content': content,
                'senderChatID': senderChatID,
                'receiverChatID': receiverChatID,
                'isImage' : isImage
            })
            saveMessage(content, receiverChatID, senderChatID, false,isImage);
        })

    });

});

function saveMessage(content, sender, receiver, isMy,isImage = false) {

    var message = new Message({
        _id: sender,
        users: [{
            _id: receiver,
            messages: {
                ismy: isMy,
                message: content,
                isImage: isImage
            },
        }
        ]
    });

    Message.findOne({_id : sender},(err,doc)=>{ 

        if(!doc){
            message.save();
        }else{
            var receiverIndex = doc.users.findIndex(element => element._id === receiver);

            if(receiverIndex !== undefined && receiverIndex != -1){
                doc.users[receiverIndex].messages.push({ismy: isMy,message: content,isImage : isImage});
                doc.save();
            }else{
                doc.users.push({_id : receiver,messages: {ismy: isMy,message: content,isImage : isImage}});
                doc.save();
            }
        }

    }).catch((err)=>{
        console.log(err.message);
    });
}