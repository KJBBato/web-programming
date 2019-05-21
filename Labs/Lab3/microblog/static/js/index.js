/*jshint esversion: 6 */
(function(){
    "use strict";
    
    api.onError(function(err){
        console.error("[error]", err);
    });
    
    api.onError(function(err){
        var error_box = document.querySelector('#error_box');
        error_box.innerHTML = err;
        error_box.style.visibility = "visible";
    });
    
    api.onUserUpdate(function(usernames){
        document.querySelector("#post_username").innerHTML = "";
        if (usernames.length === 0) document.querySelector("#welcome_message").classList.remove('hidden');
        else {
            document.querySelector("#create_message_form").classList.remove('hidden');
            usernames.forEach(function(username){
                var elmt = document.createElement('option');
                elmt.value = username.username;
                elmt.innerHTML= username.username;
                document.querySelector("#post_username").prepend(elmt);
            });
        }
    });
    
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
                    <img class="message_picture" src="/api/users/${message.username}/profile/picture/" alt="${message.username}">
                    <div class="message_username">${message.username}</div>
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
            var username = document.querySelector("#post_username").value;
            var content = document.querySelector("#post_content").value;
            document.getElementById("create_message_form").reset();
            console.log(username, content);
            api.addMessage(username, content);
        });    
    });
}());

