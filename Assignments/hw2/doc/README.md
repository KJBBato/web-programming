# WebGallery REST API Documentation

## Image and Comment API

### Create

- description: create a new image
- request: `POST /api/images/`
    - content-type: `image/*`
    - body: object
      - title: (string) the title of the image
      - author: (string) the authors username
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the image id
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 500
    - body: object
      - _id: (string) the image id
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl -X POST 
       -H "Content-Type: `image/*`" 
       -d '{"title":"hello world","author":"me"} 
       http://localhost:3000/api/images/'
```

- description: create a new comment to image ID
- request: `POST /api/comments/id/`
    - content-type: `application/json`
    - body: object
      - title: (string) the title of the image
      - author: (string) the authors username
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the comment id
      - imageId: (string) the image id associated with this comment
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 500
    - body: object
      - _id: (string) the comment id
      - imageId: (string) the image id associated with this comment
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl -X POST 
       -H "Content-Type: `application/json`" 
       -d '{"title":"hello world","author":"me"} 
       http://localhost:3000/api/comment/fgqlwgflbcafqwg2e6/'
```

### Read

- description: retrieve an image using ID
- request: `GET /api/images/id/`   
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the image id
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 404
    - body: ID does not exists
- response: 500
    - body: object
      - _id: (string) the image id
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl http://localhost:3000/api/images/fgqlwgflbcafqwg2e6/
``` 

- description: retrieve previous image using current image ID
- request: `GET /api/images/id/prev/`
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the image id
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 404
    - body: ID does not exists
- response: 500
    - body: object
      - _id: (string) the image id
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl http://localhost:3000/api/images/fgqlwgflbcafqwg2e6/prev/
``` 

- description: retrieve next image using current image ID
- request: `GET /api/images/id/next/`
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the image id
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 404
    - body: ID does not exists
- response: 500
    - body: object
      - _id: (string) the image id
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl http://localhost:3000/api/images/fgqlwgflbcafqwg2e6/next/
```

- description: retrieve up to 5 comments depending on page number
- request: `GET /api/comments/:id/`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - _id: (string) the comment id
      - imageId: (string) the image id associated with this comment
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 500
    - body: object
      - _id: (string) the comment id
      - imageId: (string) the image id associated with this comment
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
``` 
$ curl http://localhost:3000/api/comments/fgqlwgflbcafqwg2e6/
``` 

### Update

- None available

### Delete
  
- description: delete an image
- request: `DELETE /api/images/id/`
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the image id
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 404
    - body: Image ID does not exists
- response: 500
    - body: object
      - _id: (string) the image id
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated

``` 
$ curl -X DELETE
       http://localhost:3000/api/images/fgqlwgflbcafqwg2e6/
``` 

- description: delete a comment
- request: `DELETE /api/comments/id/`
- response: 200
    - content-type: `application/json`
    - body: object
     - _id: (string) the comment id
      - imageId: (string) the image id associated with this comment
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated
- response: 404
    - body: Comment ID does not exists
- response: 500
    - body: object
      - _id: (string) the comment id
      - imageId: (string) the image id associated with this comment
      - content: (string) the file content of the image
      - author: (string) the authors username
      - createdAt: (Date) time created
      - updatedAt: (Date) last time updated

``` 
$ curl -X DELETE
       http://localhost:3000/api/images/fgqlwgflbcafqwg2e6/
``` 