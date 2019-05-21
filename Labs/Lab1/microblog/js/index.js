/*jshint esversion: 6 */
(function(){
    "use strict";

    window.onload = function(){
    
        let applyElement = function(messageId){ 
            let messages = JSON.parse(localStorage.getItem('messages'));
            let elmt = document.createElement('div');
            elmt.className = "message";
            elmt.innerHTML=`
                <div class="message_user">
                    <img class="message_picture" src="media/user.png" alt="${messages.items[messageId].items.author}">
                    <div class="message_username">${messages.items[messageId].items.author}</div>
                </div>
                <div class="message_content">${messages.items[messageId].items.content}</div>
                <div class="upvote-icon icon">${messages.items[messageId].items.upvote}</div>
                <div class="downvote-icon icon">${messages.items[messageId].items.downvote}</div>
                <div class="delete-icon icon"></div>
            `;
            elmt.querySelector('.upvote-icon').addEventListener('click', function(e){
                api.upvoteMessage(messageId);
            });
            elmt.querySelector('.downvote-icon').addEventListener('click', function(e){
                api.downvoteMessage(messageId);
            });
            elmt.querySelector('.delete-icon').addEventListener('click', function(e){
                api.deleteMessage(messageId);
            });
            document.getElementById("messages").prepend(elmt);
        };

        api.onMessageUpdate(function(messages){
            document.querySelector('#messages').innerHTML = '';
            Object.keys(messages.items).forEach(function(message){
                applyElement(message);
            });
        });

        api.onVoteUpdate(function(messages){
            document.querySelector('#messages').innerHTML = '';
            Object.keys(messages.items).forEach(function(message){
                applyElement(message);
            });
        });

        document.querySelector('#create_message_form').addEventListener('submit', function(e){
            e.preventDefault();
            let username = document.getElementById("post_name").value;
            let content = document.getElementById("post_content").value;
            document.getElementById("create_message_form").reset();
            api.addMessage(username, content);
        });
    };
    
}());