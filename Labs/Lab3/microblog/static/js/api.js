/*jshint esversion: 6 */
var api = (function(){
    "use strict";

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
    
    var module = {};
    
    module.addMessage = function(username, content){
        send("POST", "/api/messages/", {username: username, content: content}, function(err, res){
             if (err) return notifyErrorListeners(err);
             notifyMessageListeners();
        });
    };
    
    module.deleteMessage = function(messageId){
        send("DELETE", "/api/messages/" + messageId + "/", null, function(err, res){
             if (err) return notifyErrorListeners(err);
             notifyMessageListeners();
        });
    };
    
    module.upvoteMessage = function(messageId){
        send("PATCH", "/api/messages/" + messageId + "/", {action: 'upvote'}, function(err, res){
             if (err) return notifyErrorListeners(err);
             notifyMessageListeners(res);
        });
    };
    
    module.downvoteMessage = function(messageId){
        send("PATCH", "/api/messages/" + messageId + "/", {action: 'downvote'}, function(err, res){
             if (err) return notifyErrorListeners(err);
             notifyVoteListeners(res);
        });
    };
    
    let getMessages = function(page, callback){
        send("GET", "/api/messages/?page=" + page, null, callback);
    };
    
    let getUsers = function(callback){
        send("GET", "/api/users/", null, callback);
    };
    
    let messageListeners = [];
    
    function notifyMessageListeners(){
        getMessages(0, function(err, messages){
            if (err) return notifyErrorListeners(err);
            messageListeners.forEach(function(listener){
                listener(messages);
            });
        });
    }
    
    module.onMessageUpdate = function(listener){
        messageListeners.push(listener);
        getMessages(0, function(err, messages){
            if (err) return notifyErrorListeners(err);
            listener(messages);
        });
    };  
    
    let voteListeners = [];
    
    function notifyVoteListeners(message){
        voteListeners.forEach(function(listener){
            listener(message);
        });
    }
    
    module.onVoteUpdate = function(listener){
        voteListeners.push(listener);
    };
    
    let userListeners = [];
    
    function notifyUserListeners(){
        
        userListeners.forEach(function(listener){
            listener([]);
        });
    }
    
    module.onUserUpdate = function(listener){
        userListeners.push(listener);
        getUsers(function(err, users){
            if (err) return notifyErrorListeners(err);
            listener(users);
        });
    };
    
    let errorListeners = [];
    
    function notifyErrorListeners(err){
        errorListeners.forEach(function(listener){
            listener(err);
        });
    }
    
    module.onError = function(listener){
        errorListeners.push(listener);
    };
    
    (function refresh(){
        setTimeout(function(e){
            notifyMessageListeners();
            refresh();
        }, 2000);
    }());
    
    return module;
})();