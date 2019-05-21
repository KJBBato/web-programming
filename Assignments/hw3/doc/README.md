# WebGallery REST API Documentation

## Image and Comment API

### Create

- description: sign up to webgallery
- request: `POST /signup/`
    - content-type: `application/json`
    - body: object
      - username: (string) username
      - password: (string) password
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) username
      - hash: (string) hash generated password
      - salt: (string) salt added to password 
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 409
    - body: username already exists
- response: 500
    - body: object
      - _id: (string) username
      - hash: (string) hash generated password
      - salt: (string) salt added to password 
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl -X POST 
       -H "Content-Type: `application/json`" 
       -d '{"username":"Alice","password":"alicepassword"}
       -c cookie.txt 
       http://localhost:3000/signup/'
```

- description: sign into webgallery
- request: `POST /signin/`
    - content-type: `application/json`
    - body: object
      - username: (string) username
      - password: (string) password
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) username
      - hash: (string) hash generated password
      - salt: (string) salt added to password 
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 401
    - body: access denied
- response: 500
    - body: object
      - _id: (string) username
      - hash: (string) hash generated password
      - salt: (string) salt added to password 
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl -X POST 
       -H "Content-Type: `application/json`" 
       -d '{"username":"Alice","password":"alicepassword"} 
       -c cookie.txt
       http://localhost:3000/signin/'
```

- description: upload picture into gallery
- request: `POST /gallery/`
    - content-type: `image/*`
    - body: object
      - title: (string) title of image
      - file: (string) file contents
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) image Id
      - author: (string) author of image
      - title: (string) title of image
      - contents: (string) contents of image file
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 500
    - body: object
      - _id: (string) image Id
      - author: (string) author of image
      - title: (string) title of image
      - contents: (string) contents of image file
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl -X POST 
       -H "Content-Type: `image/*`" 
       -d '{"title":"Alice in Wonderland"} 
       -b cookie.txt
       http://localhost:3000//'
```

- description: comment on an image
- request: `POST /gallery/comment/id/`
    - content-type: `application/json`
    - body: object
      - imageId: (string) Id of image
      - content: (string) comment contents
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) comment Id
      - imageId: (string) Id of image
      - author: (string) author of comment
      - content: (string) comment contents
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 404
    - body: Image does not exist
- response: 500
    - body: object
      - _id: (string) comment Id
      - imageId: (string) Id of image
      - author: (string) author of comment
      - content: (string) comment contents
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl -X POST 
       -H "Content-Type: `image/*`" 
       -d '{"imageId": "ewgqgfiuqwbfcas", "content": "Great Picture"} 
       -b cookie.txt
       http://localhost:3000/gallery/comment/ewgqgfiuqwbfcas/'
```

### Read

- description: get all user galleries
- request: `GET /gallery/`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - _id: (string) username
      - hash: (string) hash generated password
      - salt: (string) salt added to password 
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl -b cookie.txt http://localhost:3000/gallery/
``` 

- description: get a specific image object from author 
- request: `GET /gallery/author/id/`
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) image Id
      - author: (string) author of image
      - title: (string) title of image
      - contents: (string) contents of image file
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl -b cookie.txt http://localhost:3000/gallery/author/ewgqgfiuqwbfcas/
``` 

- description: view specific image 
- request: `GET /gallery/id/`
- response: 200
    - content-type: `image/*`
    - body: object
      - _id: (string) image Id
      - author: (string) author of image
      - title: (string) title of image
      - contents: (string) contents of image file
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 404
    - body: Gallery does not exist or empty 
- response: 500
    - body: object
      - _id: (string) the image id
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl -b cookie.txt http://localhost:3000/gallery/ewgqgfiuqwbfcas/
```

- description: get previous image in an author's gallery
- request: `GET /gallery/prev/author/id/`   
- response: 200
    - content-type: `image/*`
    - body: object
      - _id: (string) image Id
      - author: (string) author of image
      - title: (string) title of image
      - contents: (string) contents of image file
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 404
    - body: ID does not exist 
- response: 500
    - body: object
      - _id: (string) image Id
      - author: (string) author of image
      - title: (string) title of image
      - contents: (string) contents of image file
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl -b cookie.txt http://localhost:3000/gallery/prev/Alice/ewgqgfiuqwbfcas/
``` 

- description: get next image in an author's gallery
- request: `GET /gallery/next/author/id/`   
- response: 200
    - content-type: `image/*`
    - body: object
      - _id: (string) image Id
      - author: (string) author of image
      - title: (string) title of image
      - contents: (string) contents of image file
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 404
    - body: ID does not exist 
- response: 500
    - body: object
      - _id: (string) image Id
      - author: (string) author of image
      - title: (string) title of image
      - contents: (string) contents of image file
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl -b cookie.txt http://localhost:3000/gallery/next/Alice/ewgqgfiuqwbfcas/
``` 

- description: get comment of an image
- request: `GET /gallery/comment/id/`   
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) comment Id
      - imageId: (string) Id of image
      - author: (string) author of comment
      - content: (string) comment contents
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 404
    - body: Comment does not exist
- response: 500
    - body: object
      - _id: (string) comment Id
      - imageId: (string) Id of image
      - author: (string) author of comment
      - content: (string) comment contents
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl -b cookie.txt http://localhost:3000/gallery/comment/ewgqgfiuqwbfcas/
``` 

### Update

- None available

### Delete

- description: delete an image from gallery
- request: `DELETE /gallery/image/id/`
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) image Id
      - author: (string) author of image
      - title: (string) title of image
      - contents: (string) contents of image file
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 404
    - body: Image Id does not exists
- response: 403
    - body: forbidden: delete image 
- response: 500
    - body: object
      - _id: (string) image Id
      - author: (string) author of image
      - title: (string) title of image
      - contents: (string) contents of image file
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl -X DELETE
       -b cookie.txt
       http://localhost:3000/gallery/image/ewgqgfiuqwbfcas/
``` 

- description: delete a comment from your own image or your own comment
- request: `DELETE /gallery/comment/id/`
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) comment Id
      - imageId: (string) Id of image
      - author: (string) author of comment
      - content: (string) comment contents
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 404
    - body: Comment Id does not exist
    - body: Image Id does not exist
- response: 403
    - body: forbidden: delete comment 
- response: 500
    - body: object
      - _id: (string) comment Id
      - imageId: (string) Id of image
      - author: (string) author of comment
      - content: (string) comment contents
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl -X DELETE
       -b cookie.txt
       http://localhost:3000/gallery/comment/ewgqgfiuqwbfcas/
``` 