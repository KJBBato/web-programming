/*jshint esversion: 6 */
let api = (function(){
    let module = {};
    
    /*  ******* Data types *******
        message objects must have at least the following attributes:
            - (String) messageId 
            - (String) author
            - (String) content
            - (Int) upvote
            - (Int) downvote 
    ****************************** */ 
    
    if (!localStorage.getItem('messages')){
        localStorage.setItem('messages', JSON.stringify({
            messageId: 0,
            items: {}
        }));
    }

    module.addMessage = function(author, content){
        let messages = JSON.parse(localStorage.getItem('messages'));
        let id = messages.messageId++;
        let item = {
                messageId: id,
                items: {author: author, content: content, upvote: 0, downvote: 0}
            };
        messages.items[id] = item;
        localStorage.setItem('messages', JSON.stringify(messages));
        notifyMessageListener();
    };
    
    module.deleteMessage = function(messageId){
        let messages = JSON.parse(localStorage.getItem('messages'));
        delete(messages.items[messageId]);
        localStorage.setItem('messages', JSON.stringify(messages));
        notifyMessageListener();
    };
    
    module.upvoteMessage = function(messageId){
        let messages = JSON.parse(localStorage.getItem('messages'));
        messages.items[messageId].items.upvote++;
        localStorage.setItem('messages', JSON.stringify(messages));
        notifyVoteListener();
    };
    
    module.downvoteMessage = function(messageId){
        let messages = JSON.parse(localStorage.getItem('messages'));
        messages.items[messageId].items.downvote++;
        localStorage.setItem('messages', JSON.stringify(messages));
        notifyVoteListener();
    }; 
    
    let messageListeners = [];
    let voteListeners = [];

    let getAllMessages = function(){
        let messages = JSON.parse(localStorage.getItem('messages'));
        return messages;
    };

    function notifyMessageListener(){
        messageListeners.forEach(function(listener){
            listener(getAllMessages());
        });
    }

    function notifyVoteListener(){
        voteListeners.forEach(function(listener){
            listener(getAllMessages());
        });
    }

    module.onMessageUpdate = function(listener){
        messageListeners.push(listener);
        listener(getAllMessages());
    };
    
    module.onVoteUpdate = function(listener){
        voteListeners.push(listener);
        listener(getAllMessages());
    };
    
    return module;
})();