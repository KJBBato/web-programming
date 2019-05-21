/*jshint esversion: 6 */

(function(){

	"use strict";

	window.onload = function(){
    
        api.onError(function(err){
            let error_box = document.querySelector('#error_box');
            error_box.innerHTML = err;
            error_box.style.visibility = "visible";
        });

        api.onUserUpdate(function(username){
            document.querySelector("#signout").style.visibility = (username)? 'visible' : 'hidden';
            document.querySelector("form").style.display = (username)? 'none': 'grid';
            document.querySelector("#add_image_form").style.display = (username)? 'grid': 'none';
			document.querySelector("#galleries").style.display = (username)? 'grid': 'none';
			document.querySelector("#image-container").style.display = 'none';
			document.querySelector("#comment-container").style.display = 'none';
            if (username) {
	            api.getGalleries(function(err, galleries){
	            	document.querySelector("#galleries").innerHTML = '';
	            	galleries.forEach(function(gallery){
	            		let elmt = document.createElement('div');
	            		elmt.className = "gallery";
	            		elmt.id = gallery._id;
	            		elmt.innerHTML = `
							<div class='gallery-btn icon'></div>
							<div class='gallery_user' id='gallery_${gallery._id}'>${gallery._id}</div>
	            		`;
	            		document.getElementById('galleries').append(elmt);
	            		document.querySelector('#'+gallery._id).addEventListener('click', function(e){
	            			api.getImage(gallery._id);
	            		});
	            		document.getElementById('galleries').append(elmt);
	            	});
	            });
    	    }
        });
		
        api.onImageUpdate(function(image){
        	document.querySelector("#galleries").style.display = (image)? 'none': 'grid';
        	document.querySelector("#image-container").style.display = (image)? 'grid': 'none';
        	document.querySelector("#comment-container").style.display = (image)? 'grid': 'none';
        	if (image) {
        		document.querySelector('#image-container').innerHTML = '';
        		let elmt = document.createElement('div');
        		elmt.className = "image-display";
        		elmt.innerHTML = `
        		<div class='image'>
					<img class='image_file' src='/gallery/${image._id}/' alt='{${image.title}}'/>
					<div class='image_title' id='img'+'${image.title}'>${image.title}</div>
					<div class='image_author' id='${image.author}'>${image.author}</div>
				</div>
				<div class='img-pagination'>
					<div class='previous-btn icon' id='prev-btn'></div>
					<div class='delete-btn icon' id='delete-btn'></div>
					<div class='next-btn icon' id='next-btn'></div>
				</div>
				<div class='back-btn icon' id='back-btn'></div>
				<form class='complex_form' id='comment_form'>
					<input type="text" id="comment_author" class="form_element" placeholder="Enter Name" name="comment_author" required/>
                    <textarea rows="5" id="comment_content" class="form_element" name="comment_content" placeholder="Enter your Comment" required></textarea>
                    <button type="submit" class="btn">Post Comment</button>
				</form>
        		`;
        		document.getElementById('galleries').prepend(elmt);
        		document.querySelector('#prev-btn').addEventListener('click', function(e){
        			api.previousImage(image._id);
        		});
        		document.querySelector('#delete-btn').addEventListener('click', function(e){
        			document.querySelector("#galleries").style.display ='grid';
       			 	document.querySelector("#image-container").style.display = 'none';
       			 	document.querySelector("#comment-container").style.display = 'none';
        			api.deleteImage(image._id);
        		});
        		document.querySelector('#next-btn').addEventListener('click', function(e){
        			api.nextImage(image._id);
        		});
        		document.querySelector('#back-btn').addEventListener('click', function(e){
        			document.querySelector("#galleries").style.display ='grid';
       			 	document.querySelector("#image-container").style.display = 'none';
        		});
        		document.getElementById('comment_form').addEventListener('submit', function(e){
        			e.preventDefault();
        			let content = document.getElementById('comment_content').value;
        			document.getElementById('comment_form').reset();
        			api.addComment(image._id, content);
        		});
        		document.getElementById('image-container').prepend(elmt);
        	}
        });

        api.onCommentUpdate(function(comments){
        	if (comments.length > 0) {
        		document.querySelector('#comment-container').innerHTML = '';
        		comments.forEach(function(comment){
	        		let elmt = document.createElement('div');
	        		elmt.className = "comment";
	        		elmt.innerHTML = `
						<div class="comment_date">${comment.createdAt}</div>
						<div class="comment_author">${comment.author}</div>
						<div class="comment_content">${comment.content}</div>
						<div class="del-btn icon" id="cmt-${comment._id}"></div>
	        		`;
	        		document.getElementById('comment-container').append(elmt);
	        		document.querySelector('#cmt-'+comment._id).addEventListener('click', function(e){
	        			api.deleteComment(comment._id);
	        		});
	        		document.getElementById('comment-container').append(elmt);
        		});
        	} else {
        		document.querySelector('#comment-container').innerHTML = '';
        	}
        });

		function submit(){
            if (document.querySelector("form").checkValidity()){
                let username = document.querySelector("form [name=username]").value;
                let password =document.querySelector("form [name=password]").value;
                let action =document.querySelector("form [name=action]").value;
                api[action](username, password, function(err){
                    if (err) document.querySelector('.error_box').innerHTML = err;
                });
            }
        }

		document.querySelector('#signin').addEventListener('click', function(e){
            document.querySelector("form [name=action]").value = 'signin';
            submit();
        });

		document.querySelector('#signup').addEventListener('click', function(e){
            document.querySelector("form [name=action]").value = 'signup';
            submit();
        });

        document.querySelector('#signout').addEventListener('click', function(e){
        	api.signout();
        });

        document.querySelector('form').addEventListener('submit', function(e){
            e.preventDefault();
        });

        document.querySelector('#add_image_form').addEventListener('submit', function(e){
        	e.preventDefault();
        	let title = document.querySelector("#add_image_form [name=title]").value;
        	let file = document.querySelector("#add_image_form [name=picture]").files[0];
        	document.querySelector('#add_image_form').reset();
        	api.addImage(title, file);
        });

	};
}());
