/*jshint esversion: 6 */
(function(){
    "use strict";
    
    api.onVoteUpdate(function(message){
        document.querySelector('#msg' + message._id + ' .upvote-icon').innerHTML = message.upvote;
        document.querySelector('#msg' + message._id + ' .downvote-icon').innerHTML = message.downvote;
    });
    
    api.onMessageUpdate(function(messages){
        document.querySelector('#messages').innerHTML = '';
        messages.forEach(function(message){
            var elmt = document.createElement('div');
            elmt.className = "message";
            elmt.id = "msg" + message._id;
            elmt.innerHTML=`
                <div class="message_user">
                    <img class="message_picture" src="media/user.png" alt="${message.author}">
                    <div class="message_username">${message.author}</div>
                </div>
                <div class="message_content">${message.content}</div>
                <div class="upvote-icon icon">${message.upvote}</div>
                <div class="downvote-icon icon">${message.downvote}</div>
                <div class="delete-icon icon"></div>
            `;
            elmt.querySelector(".delete-icon").addEventListener('click', function(){
                api.deleteMessage(message._id);
            });
            elmt.querySelector(".upvote-icon").addEventListener('click', function(){
                api.upvoteMessage(message._id);
            });
            elmt.querySelector(".downvote-icon").addEventListener('click', function(){
                api.downvoteMessage(message._id);
            });
            document.querySelector("#messages").prepend(elmt);
        });
    });
    
    window.addEventListener('load', function(){
        document.querySelector('#create_message_form').addEventListener('submit', function(e){        
            e.preventDefault();
            var author = document.getElementById("post_name").value;
            var content = document.getElementById("post_content").value;
            document.getElementById("create_message_form").reset();
            api.addMessage(author, content);
        });    
    });
    
}());


