/*jshint esversion: 6 */
let api = (function(){
    "use strict";
    
    let module = {};
    let errorListeners = [];
    
    function send(method, url, data, callback){
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        if (!data) xhr.send();
        else{
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }
    }

    /*  ******* Data types *******
        message objects must have at least the following attributes:
            - (String) messageId 
            - (String) author
            - (String) content
            - (Int) upvote
            - (Int) downvote 
    ****************************** */ 
    
    module.addMessage = function(author, content){
        send("POST", '/api/messages/', {author: author, content: content}, function(err, res){
            if (err) return notifyErrorListeners(err);
            notifyMessageListeners();
        });
    };

    module.getMessages = function(page=0){
        send("GET", "/api/messages/", null, function (err, res){
            if (err) return notifyErrorListeners(err);
        });
    };

    module.getMessage = function(messageId){
        send("GET", "/api/messages" + messageId + "/", null, function (err, res){
            if (err) return notifyErrorListeners(err);
        });
    };

    module.getMessages = function(page=0){
        send("GET", "/api/messages/?limit=5", null, function (err, res){
            if (err) return notifyErrorListeners(err);
        });
    };

    module.deleteMessage = function(messageId){
        send("DELETE", "/api/messages/" + messageId + "/", null, function(err, res){
            if (err) return notifyErrorListeners(err);
            notifyMessageListeners();
        });
    };

    let getAllMessages = function(callback){
        send("GET", "/api/messages/", null, callback);
    };
    
    module.upvoteMessage = function(messageId){
        send("PATCH", "/api/messages/" + messageId + "/", {"action": "upvote"}, function(err, res){
            if (err) return notifyErrorListeners(err);
            notifyMessageListeners();
        });
    };

    module.downvoteMessage = function(messageId){
        send("PATCH", "/api/messages/" + messageId + "/", {"action": "downvote"}, function(err, res){
            if (err) return notifyErrorListeners(err);
            notifyMessageListeners();
        });
    };

    module.vote = function(messageId, action){
        send("PATCH", "/api/messages/" + messageId + "/", action, function(err, res){
            if (err) return notifyErrorListeners(err);
        });
    };

    let messageListeners = [];
    
    function notifyMessageListeners(){
        getAllMessages(function(err, res){
            if (err) return notifyErrorListeners();
            messageListeners.forEach(function(listener){
                listener(res);
            });  
        });
    }
    
    module.onMessageUpdate = function(listener){
        messageListeners.push(listener);
        getAllMessages(function(err, res){
            if (err) return notifyErrorListeners(err);
            listener(res);
        });
    };
    
    let voteListeners = [];
    
    function notifyVoteListeners(){
        getAllMessages(function(err, res){
            if (err) return notifyErrorListeners();
            voteListeners.forEach(function(listener){
                listener(res.upvote);
                listener(res.downvote);
            });  
        });
    }
    
    module.onVoteUpdate = function(listener){
        voteListeners.push(listener);
    };

    function notifyErrorListeners(error){
        errorListeners.forEach(function(listener){
            listener(error);
        });
    }

    module.onError = function(listener){
        errorListeners.push(listener);
    };

    (function refresh(){
        setInterval(function(e){
            notifyMessageListeners();
        }, 2000);
    }());

    return module;
})();