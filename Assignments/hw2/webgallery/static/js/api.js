/*jshint esversion: 6 */

var api = (function(){

    "use strict";

    var module = {};
    
    /*  ******* Data types *******
        image objects must have at least the following attributes:
            - (String) _id 
            - (String) title
            - (String) author
            - (Date) date
        comment objects must have the following attributes
            - (String) _id
            - (String) imageId
            - (String) author
            - (String) content
            - (Date) date
    ****************************** */ 
    
    if (!localStorage.getItem('current')){
        localStorage.setItem('current', JSON.stringify({ currImgId: null, currPg: 0 }));
    }

    /* Ajax */
    function sendFiles(method, url, data, callback){
        let formdata = new FormData();
        Object.keys(data).forEach(function(key){
            let value = data[key];
            formdata.append(key, value);
        });
        let xhr = new XMLHttpRequest();
        xhr.onload = function() {
            if (xhr.status !== 200) callback("[" + xhr.status + "]" + xhr.responseText, null);
            else callback(null, JSON.parse(xhr.responseText));
        };
        xhr.open(method, url, true);
        xhr.send(formdata);
    }

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

    /* Tested Modules */

    // add an image to the gallery
    module.addImage = function(title, author, file){
        sendFiles("POST", '/api/images/', {title: title, author: author, file: file}, function(err, res){
            if (err) return notifyErrorListeners(err);
            let current = JSON.parse(localStorage.getItem('current'));
            current.currImgId = res._id;
            current.currPg = 0;
            localStorage.setItem('current', JSON.stringify(current));
            notifyImageListeners();
        });  
    };
    
    // delete an image from the gallery given its imageId
    module.deleteImage = function(imageId){
        send("DELETE", '/api/images/' + imageId + '/', null, function(err, res){
            if (err) return notifyErrorListeners(err);
        });
        notifyImageListeners();
    };
    
    // add a comment to an image
    module.addComment = function(imageId, author, content){
        send("POST", '/api/comments/' + imageId + '/' , {author: author, content: content}, function(err, res){
            if (err) return notifyErrorListeners(err);
            notifyCommentListeners();
        });
    };
    
    // delete a comment to an image
    module.deleteComment = function(commentId){
        send("DELETE", '/api/comments/' + commentId + '/', null, function(err, res){
            if (err) return notifyErrorListeners(err);
            notifyCommentListeners();
        });
    };
    
    // register an image listener
    // to be notified when an image is added or deleted from the gallery
    module.onImageUpdate = function(listener){
        let current = JSON.parse(localStorage.getItem('current'));
        imageListeners.push(listener);
        if (current.currImgId) getImage(current.currImgId, function(err, img){
            if (err) return notifyErrorListeners(err);
            listener(img);
        });
    };
    
    // register an comment listener
    // to be notified when a comment is added or deleted to an image
    module.onCommentUpdate = function(listener){
        commentListeners.push(listener);
        let current = JSON.parse(localStorage.getItem('current'));
        getComments(current.currImgId,  function(err, cmt){
            if (err) return notifyErrorListeners(err);
            listener(cmt);
        });
    };

    /* Added modules */
    let getImage = function(imageId, callback){
        send("GET", "/api/images/" + imageId + "/", null, callback);
    };

    let getComments = function(imageId, callback){
        let current = JSON.parse(localStorage.getItem('current'));
        let page = current.currPg;
        send("GET", "/api/comments/" + imageId + "/" , {page: page}, callback);
    };

    module.previousImage = function(imageId){
        send("GET", "/api/images/" + imageId + "/prev/", null, function(err, res){
            if (err) return notifyErrorListeners(err);
            if (res != undefined) {
                let current = JSON.parse(localStorage.getItem('current'));
                current.currImgId = res[0]._id;
                current.currPg = 0;
                localStorage.setItem('current', JSON.stringify(current));
                notifyImageListeners();
            }
        }); 
    };

    module.nextImage = function(imageId){
        send("GET", "/api/images/" + imageId + "/next/", null, function(err, res){
            if (err) return notifyErrorListeners(err);
            let current = JSON.parse(localStorage.getItem('current'));
            current.currImgId = res[0]._id;
            current.currPg = 0;
            localStorage.setItem('current', JSON.stringify(current));
            notifyImageListeners();
        }); 
    };

    module.previousComment = function(imageId){
        let current = JSON.parse(localStorage.getItem('current'));
        current.currentPg = current.currPg - 1 < 0 ? current.currPg : current.currPg--;
        localStorage.setItem('current', JSON.stringify(current));
        notifyCommentListeners();
    };

    module.nextComment = function(imageId){
        let current = JSON.parse(localStorage.getItem('current'));
        current.currentPg = current.currPg++;
        localStorage.setItem('current', JSON.stringify(current));
        notifyCommentListeners();
    };

    /* Listeners */
    let imageListeners = [];
    let commentListeners = [];
    let errorListeners = [];

    function notifyImageListeners(){
        let current = JSON.parse(localStorage.getItem('current'));
        getImage(current.currImgId, function(err, img){
            if (err) return notifyErrorListeners(err);
            imageListeners.forEach(function(listener){
                listener(img);
            });
            notifyCommentListeners();
        });
    }

    function notifyCommentListeners(){
        let current = JSON.parse(localStorage.getItem('current'));
        getComments(current.currImgId, function(err, cmt){
            if (err) return notifyErrorListeners(err);
            commentListeners.forEach(function(listener){
                listener(cmt);
            });
        });
    }
    
    function notifyErrorListeners(err){
        errorListeners.forEach(function(listener){
            listener(err);
        });
    }

    return module;
})();