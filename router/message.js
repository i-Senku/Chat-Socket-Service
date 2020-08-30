const router = require('express').Router();
const Message = require('../model/message');

router.post('/fetchmessage',async (req,res)=>{
    let senderID = req.body.sender;
    let receiverID = req.body.receiver;

    
    Message.find({_id : senderID},{
        users: {
          $elemMatch: {_id : receiverID}
        }
      }).then((document)=>{
          if(document.length > 0){
              if(document[0].users.length > 0){
                  var messages = document[0].users[0].messages;
                  res.send(messages.slice(Math.max(messages.length - 15, 0)));
              }else{
                  res.send([]);
              }
          }else{
            res.send([]);
          }

      }).catch((err)=>{
          console.log(err);
      })

      

});

module.exports = router;