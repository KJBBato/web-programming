/*jshint esversion: 6 */

(function(){

	"use strict";

	window.onload = function(){

		document.querySelector('#add_image_form').addEventListener('submit', function(e){
			e.preventDefault();
			let author = document.getElementById('image_user').value;
			let title = document.getElementById('image_title').value;
			let file = document.querySelector('#add_image_form input[name="picture"]').files[0];
			document.getElementById('add_image_form').reset();
			api.addImage(title, author, file);
		});

		document.getElementById('add_image_btn').addEventListener('click', function(e){
			let btnStatus = document .getElementById('add_image_btn').innerText;
            if(btnStatus == 'Add an Image'){
                document.getElementById('add_image_btn').innerText = 'Hide';
                document.getElementById('add_image_form').style.display = 'grid';
            }
            else if(btnStatus == 'Hide'){
                document.getElementById('add_image_btn').innerText = 'Add an Image';
                document.getElementById('add_image_form').style.display = 'none';
            }
		});

		api.onImageUpdate(function(img){
			if (img) {
				applyImageElement(img);
			} else {
				document.getElementById('display_image').innerHTML = '';
			}
		});

		api.onCommentUpdate(function(comments){
			if (comments.length != 0){
				applyCommentElement(comments.reverse());
			} else {
				document.getElementById('comment_image').innerHTML = '';
			}
		});

		let applyCommentElement = (function(comments){
			let commentDoc = document.getElementById('comment_image');
			if (commentDoc) {
				let current = JSON.parse(localStorage.getItem('current'));
				document.getElementById('comment_image').innerHTML = '';
				comments.forEach(function(comment) {
					let elementCmt = document.createElement('div');
					elementCmt.class = "comment";
					elementCmt.innerHTML = `
						<div class="comment">
							<div class="comment_date">${comment.createdAt}</div>
							<div class="comment_user">${comment.author}</div>
							<div class="comment_content">${comment.content}</div>
							<div class="del-btn icon"></div>
						</div>
					`;
					elementCmt.querySelector('.del-btn').addEventListener('click', function(e){
						api.deleteComment(comment._id);
					});
					document.getElementById("comment_image").prepend(elementCmt);
				});
				let elementCmtPg = document.createElement('div');
				elementCmtPg.className = "comment_pg";
				elementCmtPg.innerHTML = `
					<div class="left-arrow icon"></div>
					<div class="page_num">${current.currPg}</div>
					<div class="right-arrow icon"></div>
				`;
				elementCmtPg.querySelector('.left-arrow').addEventListener('click', function(e){
					api.previousComment(comments[0].imageId);
				});
				elementCmtPg.querySelector('.right-arrow').addEventListener('click', function(e){
					api.nextComment(comments[0].imageId);
				});
				document.getElementById("comment_image").prepend(elementCmtPg);
			}
		});

		let applyImageElement = (function(img){
			document.getElementById('display_image').innerHTML = '';
			let elmtImg = document.createElement('div');
			elmtImg.className = 'image';
			elmtImg.id = 'image';
			elmtImg.innerHTML = `
				<div class='image_user'>
					<img class='image_file' src='/api/images/${img._id}/' alt='${img.title}'/>
					<div class='image_title' id='image_title'>${img.title}</div>
					<div class='image_author' id='image_author'>${img.author}</div>
				</div>
				<div class='pagnation_img'>
					<div class='previous-btn icon' id='prev-btn'></div>
					<div class='delete-btn icon' id='delete-btn'></div>
					<div class='next-btn icon' id='next-btn'></div>
				</div>
				<form class='comment_form' id='comment_form'>
					<input type="text" id="comment_author" class="form_element" placeholder="Enter Name" name="comment_author" required/>
                    <textarea rows="5" id="comment_content" class="form_element" name="comment_content" placeholder="Enter your Comment" required></textarea>
                    <button type="submit" class="btn">Post Comment</button>
				</form>
			`;
			elmtImg.querySelector('#prev-btn').addEventListener('click', function(e){
				api.previousImage(img._id);
			});
			elmtImg.querySelector('#delete-btn').addEventListener('click', function(e){
				api.deleteImage(img._id);
			});
			elmtImg.querySelector('#next-btn').addEventListener('click', function(e){
				api.nextImage(img._id);
			});
			elmtImg.querySelector('#comment_form').addEventListener('submit', function(e){
				e.preventDefault();
				let author = document.getElementById('comment_author').value;
				let content = document.getElementById('comment_content').value;
				document.getElementById('comment_form').reset();
				api.addComment(img._id, author, content);
			});
			document.getElementById('display_image').prepend(elmtImg);
		});
	};
}());