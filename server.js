var mongo = require('mongodb').MongoClient;
var client = require('socket.io').listen(4000).sockets;

//Connect to mongo
mongo.connect('mongodb://localhost:27017/mongochat', function(err, db){
    if(err){
        throw err;
    }
    
    console.log('MongoDB connected...');
    
    //Connect to Socket.io
    client.on('connection', function(socket){
        let chat = db.collection('chats');
        
          //Create function to send status
        sendStatus = function(s){
            socket.emit('status', s);
        }
        
        //Get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }
            
            //Emit the messages
            socket.emit('output', res);
        
        });
        
         //Handle input events
    socket.on('input', function(data){
        let name = data.name;
        let message = data.message;
        
         //check for name and message
        if(name == '' || message == ''){
            //send error status
            sendStatus('Please enter a name or message');
        } else {
            //insert message
            chat.insert({name: name, message: message}, function(){
               client.emit('output', [data]);
                
                //send status object
                sendStatus({
                    message: 'Message sent',
                    clear: true
                });
            });
        }
    }); 
            //handle clear
    socket.on('clear', function(data){
        //remove all chat from collection
        chat.remove({}, function(){
            //Emit Cleared
            socket.emit('cleared');
        });
        
            
    });
    }); 
});