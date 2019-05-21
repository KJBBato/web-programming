/*jshint esversion: 6 */
let api = (function(){
    let module = {};
    
    /*  ******* Data types *******
        image objects must have at least the following attributes:
            - (String) imageId 
            - (String) title
            - (String) author
            - (String) url
            - (Date) date
        comment objects must have the following attributes
            - (String) commentId
            - (String) imageId
            - (String) author
            - (String) content
            - (Date) date
    ****************************** */ 
    
    if(!localStorage.getItem('images')){
        localStorage.setItem('images', JSON.stringify({ imageId: 0, items: {}}));
        localStorage.setItem('comments', JSON.stringify({ commentId: 0, items: {}}));
        localStorage.setItem('current', JSON.stringify({current: 0}));
        localStorage.setItem('totalPage', JSON.stringify({pages: 0}));
    }

    // add an image to the gallery
    module.addImage = function(title, author, url){
        let images = JSON.parse(localStorage.getItem('images'));
        let id = images.imageId++;
        let date = new Date();
        let item = {
                imageId: id,
                items: {author: author, title: title, url: url, date: date}
        };
        images.items[id] = item;
        localStorage.setItem('images', JSON.stringify(images));
        notifyImageListener();
        notifyCommentListener();
    };
    
    // delete an image from the gallery given its imageId
    module.deleteImage = function(imageId){
        let images = JSON.parse(localStorage.getItem('images'));
        delete(images.items[imageId]);
        localStorage.setItem('images', JSON.stringify(images));
        notifyImageListener();
        notifyCommentListener();
    };
    
    // get an image from the gallery given its imageId
    module.getImage = function(imageId){
        let images = JSON.parse(localStorage.getItem('images'));
        return images.items[imageId];
    };
    
    // add a comment to an image
    module.addComment = function(imageId, author, content){
        let comments = JSON.parse(localStorage.getItem('comments'));
        let id = comments.commentId++;
        let date = new Date();
        let item = {
                commentId: id,
                items: {imageId: imageId, author: author, content: content, date: date, commentId: id}
        };
        comments.items[id] = item;
        localStorage.setItem('comments', JSON.stringify(comments));
        notifyCommentListener();
    };
    
    // delete a comment to an image
    module.deleteComment = function(commentId){
        let comments = JSON.parse(localStorage.getItem('comments'));
        delete(comments.items[commentId]);
        localStorage.setItem('comments', JSON.stringify(comments));
        notifyCommentListener();
    };
    
    // return a set of 10 comments using pagination
    // page=0 returns the 10 latest messages
    // page=1 the 10 following ones and so on
    module.getComments = function(imageId, page=0){
        let comments = JSON.parse(localStorage.getItem('comments'));
        let itemKeys = Object.keys(comments.items);
        let imgComment = [];
        itemKeys.forEach(function(key){
            if (comments.items[key].items.imageId == imageId){
                imgComment.push(comments.items[key].items);
            }
        });
        let total = Math.ceil(imgComment.length/10)-1;
        let pg = JSON.parse(localStorage.getItem('totalPage'));
        pg.pages = total;
        localStorage.setItem('totalPage', JSON.stringify(pg));
        let res = imgComment.reverse();
        let i = page * 10;
        return res.slice(i, i + 10);
    };

    module.deleteAllComments = function(imageId){
        let comments = JSON.parse(localStorage.getItem('comments'));
        let itemKeys = Object.keys(comments.items);
        let imgComment = [];
        itemKeys.forEach(function(key){
            if (comments.items[key].items.imageId == imageId){
                delete(comments.items[key]);
            }
        });
        localStorage.setItem('comments', JSON.stringify(comments));
        notifyCommentListener();
    };
    
    let imageListeners = [];
    let commentListeners = [];

    let getAllImages = function(){
        let images = JSON.parse(localStorage.getItem('images'));
        return images;
    };

    let getAllComments = function(){
        let comments = JSON.parse(localStorage.getItem('comments'));
        return comments;
    };

    function notifyImageListener(){
        imageListeners.forEach(function(listener){
            listener(getAllImages());
        });
    }

    function notifyCommentListener(){
        commentListeners.forEach(function(listener){
            listener(getAllComments());
        });
    }

    // register an image listener
    // to be notified when an image is added or deleted from the gallery
    module.onImageUpdate = function(listener){
        imageListeners.push(listener);
        listener(getAllImages());
    };
    
    // register an comment listener
    // to be notified when a comment is added or deleted to an image
    module.onCommentUpdate = function(listener){
        commentListeners.push(listener);
        listener(getAllComments());
    };

    module.setCurrentImage = function(imageId){
        let curr = JSON.parse(localStorage.getItem('current'));
        curr.current = imageId;
        localStorage.setItem('current', JSON.stringify(curr));
    };

    module.getCurrentImage = function(){
        let curr = JSON.parse(localStorage.getItem('current'));
        return curr.current;
    };

    return module;
})();