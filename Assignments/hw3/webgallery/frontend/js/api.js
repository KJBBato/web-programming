/*jshint esversion: 6 */

let api = (function(){
    let module = {};
    
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
        localStorage.setItem('current', JSON.stringify({ currentUser: null, currImgId: undefined }));
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
        let xhr = new XMLHttpRequest();
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

    module.signup = function(username, password){
        send("POST", "/signup/", {username, password}, function(err, res){
             if (err) return notifyErrorListeners(err);
             notifyUserListeners(getUsername());
        });
    };
    
    module.signin = function(username, password){
        send("POST", "/signin/", {username, password}, function(err, res){
             if (err) return notifyErrorListeners(err);
             notifyUserListeners(getUsername());
        });
    };
    
    module.signout = function(){
        send("POST", "/signout/", null, function(err, res){
            if (err) return notifyErrorListeners(err);
            let curr = JSON.parse(localStorage.getItem('current'));
            curr.currImgId = null;
            currentUser = null;
            localStorage.setItem('current', JSON.stringify(curr));
            notifyUserListeners();
        });
    };
    
    // add an image to the gallery
    module.addImage = function(title, file){
        sendFiles("POST", "/gallery/", {title: title, file: file}, function(err, res){
            if (err) return notifyErrorListeners(err);
            let curr = JSON.parse(localStorage.getItem('current'));
            curr.currentUser = res.author;
            curr.currImgId = res._id;
            localStorage.setItem('current', JSON.stringify(curr));
            notifyImageListeners();
        });
    };

    // delete an image from the gallery given its imageId
    module.deleteImage = function(imageId){
        send("DELETE", "/gallery/image/" + imageId + "/", null, function(err, res){
            if (err) return notifyErrorListeners(err);
        });
    };
    
    // add a comment to an image
    module.addComment = function(imageId, content){
        send("POST", "/gallery/comment/" + imageId + "/", {content: content}, function(err, res){
            if (err) return notifyErrorListeners(err);
            notifyCommentListeners();
        });
    };
    
    // delete a comment to an image
    module.deleteComment = function(commentId){
        send("DELETE", "/gallery/comment/" + commentId + "/", null, function(err, res){
            if (err) return notifyErrorListeners(err);
            notifyCommentListeners();
        });
    };

    module.getGalleries = function(callback){
        send("GET", "/gallery/", null, callback);
    };

    module.currentImg = function(callback){
        let curr = JSON.parse(localStorage.getItem('current'));
        send("GET", "/gallery/" + curr.currentUser + "/" , {id: curr.currentImg}, callback);
    };

    module.getImage = function(username){
        let curr = JSON.parse(localStorage.getItem('current'));
        curr.currentUser = username;
        localStorage.setItem('current', JSON.stringify(curr));
        getAuthorImg(curr.currentUser, function(err, res){
            if (err) return notifyErrorListeners(err);
            if (res.length > 0) {
                curr.currImgId = res[0]._id;
            } else {
                curr.currImgId = undefined;
            }
            localStorage.setItem('current', JSON.stringify(curr));
            notifyImageListeners();
            notifyCommentListeners();
        });
    };

    module.previousImage = function(imageId){
        let curr = JSON.parse(localStorage.getItem('current'));
        send("GET", "/gallery/prev/" + curr.currentUser + "/" + imageId + "/" , null, function(err, res){
            if (err) return notifyErrorListeners(err);
            if (res.length > 0) {
                curr.currImgId = res[0]._id;
            }
            localStorage.setItem('current', JSON.stringify(curr));
            notifyImageListeners();
            notifyCommentListeners();
        }); 
    };

    module.nextImage = function(imageId){
        let curr = JSON.parse(localStorage.getItem('current'));
        send("GET", "/gallery/next/" + curr.currentUser + "/" + imageId + "/" , null, function(err, res){
            if (err) return notifyErrorListeners(err);
            if (res.length > 0) {
                curr.currImgId = res[0]._id;
            }
            localStorage.setItem('current', JSON.stringify(curr));
            notifyImageListeners();
            notifyCommentListeners();
        }); 
    };
    
    let getAnImage = function(username, imgId=undefined){
        if (username) {
                send("GET", "/gallery/" + username + "/",  {id: imgId}, function(err, res){
                if (err) return notifyErrorListeners(err);
                let curr = JSON.parse(localStorage.getItem('current'));
                curr.currImgId = res._id;
                localStorage.setItem('current', JSON.stringify(curr));
            });
        }
    };

    let getImageId = function(imageId, callback){
        send("GET", "/gallery/" + imageId + "/", null, callback);
    };

    let getAuthorImg = function(author, callback){
        send("GET", "/gallery/author/" + author + "/" , null, callback);
    };

    let getComments = function(imageId, callback){
        send("GET", "/gallery/comment/" + imageId + "/", null, callback);
    };

    let getUsername = function(){
        return document.cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    };

    let errorListeners = [];
    let userListeners = [];
    let imageListeners = [];
    let commentListeners = [];
    
    function notifyErrorListeners(err){
        errorListeners.forEach(function(listener){
            listener(err);
        });
    }

    function notifyUserListeners(username){
        userListeners.forEach(function(listener){
            listener(username);
        });
    }

    function notifyImageListeners(){
        let curr = JSON.parse(localStorage.getItem('current')); 
        getImageId(curr.currImgId, function(err, img){
            if (err) return notifyErrorListeners(err);
            imageListeners.forEach(function(listener){
                listener(img);
            });
        }); 
    }

    function notifyCommentListeners(){
        let curr = JSON.parse(localStorage.getItem('current'));
        getComments(curr.currImgId, function(err, cmts){
            if (err) return notifyErrorListeners(err);
            commentListeners.forEach(function(listener){
                listener(cmts);
            });
        });
    }

    module.onError = function(listener){
        errorListeners.push(listener);
    };

    module.onUserUpdate = function(listener){
        userListeners.push(listener);
        listener(getUsername());
    };

    module.onImageUpdate = function(listener){
        let curr = JSON.parse(localStorage.getItem('current'));
        imageListeners.push(listener);
        if (curr.currImgId) getImageId(curr.currImgId, function(err, img){
            if (err) return notifyErrorListeners(err);
            listener(img);
        });
    };

    module.onCommentUpdate = function(listener){
        let curr = JSON.parse(localStorage.getItem('current'));
        commentListeners.push(listener);
        if (curr.currImgId) getComments(curr.currImgId, function(err, cmts){
            if (err) return notifyErrorListeners(err);
            listener(cmts);
        });
    };

    return module;
})();