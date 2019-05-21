/*jshint esversion: 6 */
(function(){

	"use strict";

	window.onload = function(){


		document.querySelector('#add_image_form').addEventListener('submit', function(e){
			e.preventDefault();
			let author = document.getElementById("image_user").value;
			let title = document.getElementById("image_title").value;
			let url = document.getElementById("image_url").value;
			document.getElementById("add_image_form").reset();
			api.addImage(title, author, url);
		});

		let applyImageElement = (function(imageId, keyList, keyIndex){
			document.querySelector('#image').innerHTML = '';
			document.querySelector('#comment_form').innerHTML ='';
			api.setCurrentImage(imageId);
			let image = api.getImage(imageId);
			let elementImg = document.createElement('div');
			elementImg.className = "image_elmt";
			elementImg.innerHTML = `
				<img class="image_url" src="${image.items.url}"/>
				<div class="image_title" id="image_title">${image.items.title}</div>
				<div class="image_author" id="image_author">${image.items.author}</div>
				<div class="delete-btn icon"></div>
				<div class="previous-btn icon"></div>
				<div class="next-btn icon"></div>
			`;
			elementImg.querySelector('.delete-btn').addEventListener('click', function(e){
				e.preventDefault();
				api.deleteImage(imageId);
				api.deleteAllComments(imageId);
				api.setCurrentImage(keyList[keyIndex-1]);
				document.querySelector('#comment_pagination').innerHTML = '';
				document.querySelector('#comment_form').innerHTML = '';
			});
			elementImg.querySelector('.previous-btn').addEventListener('click', function(e){
				e.preventDefault();
				if (keyIndex-1 != -1) {
					applyImageElement(keyList[keyIndex-1], keyList, keyIndex-1);
					applyCommentElement(keyList[keyIndex-1]);
				}
			});
			elementImg.querySelector('.next-btn').addEventListener('click', function(e){
				e.preventDefault();
				if (keyIndex+1 != keyList.length) {
					applyImageElement(keyList[keyIndex+1], keyList, keyIndex+1);
					applyCommentElement(keyList[keyIndex+1]);
				}
			});
			document.getElementById("image").prepend(elementImg);
			applyCommentFormElement(imageId);
		});

		let applyCommentFormElement = (function(imageId){
			document.querySelector('#comment_form').innerHTML = '';
			let elementCmtForm = document.createElement('form');
			elementCmtForm.className = "comment-form";
			elementCmtForm.id = "com_form";
			elementCmtForm.innerHTML = `
				<input class="form_element" id="comment_user" type="text" placeholder="Enter your name" name="author_name" required/>
				<textarea class="form_element" id="comment_content" type="text" placeholder="Enter a comment" name="content" required/></textarea>
				<button class="comment-btn" type="submit">Submit Comment</button>
			`;
			document.querySelector('#comment_form').addEventListener('submit', function(e){
				e.preventDefault();
				let author = document.getElementById("comment_user").value;
				let content = document.getElementById("comment_content").value;
				let imageId = api.getCurrentImage();
				document.getElementById("com_form").reset();
				api.addComment(imageId, author, content);
			});
			document.getElementById("comment_form").prepend(elementCmtForm);
		});

		let applyCommentElement = (function(imageId, page=0){
			document.querySelector('#comments').innerHTML = '';
			let comments = api.getComments(imageId, page).reverse();
			comments.forEach(function(comment) {
				let elementCmt = document.createElement('div');
				elementCmt.class = "comment";
				elementCmt.innerHTML = `
					<div class="comment">
						<div class="comment_date">${comment.date}</div>
						<div class="comment_user">${comment.author}</div>
						<div class="comment_content">${comment.content}</div>
						<div class="del-btn icon"></div>
					</div>
				`;
				elementCmt.querySelector('.del-btn').addEventListener('click', function(e){
					e.preventDefault();
					api.deleteComment(comment.commentId);
					applyCommentElement(imageId, page);
				});
				document.getElementById("comments").prepend(elementCmt);
			});
			if(JSON.parse(localStorage.getItem('totalPage')).pages != -1){
				document.querySelector('#comment_pagination').innerHTML = '';
				let elementCmtPg = document.createElement('div');
				elementCmtPg.className = "comment_pg";
				elementCmtPg.innerHTML = `
					<div class="left-arrow icon"></div>
					<div class="page_num">${page}</div>
					<div class="right-arrow icon"></div>
				`;
				elementCmtPg.querySelector('.left-arrow').addEventListener('click', function(e){
					e.preventDefault();
					if(page != 0){
						applyCommentElement(imageId, page-1);
					}
				});
				elementCmtPg.querySelector('.right-arrow').addEventListener('click', function(e){
					e.preventDefault();
					let max_page = JSON.parse(localStorage.getItem('totalPage')); 
					if(page < max_page.pages){
						applyCommentElement(imageId, page+1);
					}
				});
				document.getElementById("comment_pagination").prepend(elementCmtPg);
			}
		});

		api.onImageUpdate(function(images){
			document.querySelector('#image').innerHTML = '';
			let keyList = Object.keys(images.items);
			let keyIndex = keyList.length-1;
			if (keyIndex != -1){
				applyImageElement(keyList[keyIndex], keyList, keyIndex);
			}
		});

		api.onCommentUpdate(function(comments){
			document.querySelector('#comments').innerHTML ='';
			let imageId = api.getCurrentImage();
			applyCommentElement(imageId);
		});
	};	
}());