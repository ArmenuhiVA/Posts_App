
const express = require('express');

const {postsSchema, patchSchema,  validate } = require('../validations/validation.js');
const {getPosts, createPost, deletePost, updatePost, getPostsByLimit} = require('../controllers/postControllers.js');

const router = express.Router() 


router.post('/', validate(postsSchema), (req, res) => {
    createPost(req.body).then(createdPost =>{
      res.status(201).send(createdPost);
    }).catch(err => {
      console.error("error", err);
      res.status(500).send({
        message: "Something went wrong."
      })
    }) 
  });
  
  router.get('/', (req, res) => {
    
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    
    const search = new RegExp('\\b\\w*' + req.query.search + '\\w*\\b', 'i');
    
    const offset = (page - 1) * limit;
    
    getPostsByLimit(offset, limit, search).then(posts => {
      res.status(200).send(posts);
    }).catch(err => {
      console.error("error", err);
      res.status(500).send({
        message: "Something went wrong."
      })
    })
  })
  
  router.get('/:id', (req, res) => {
    const id = req.params.id;
    console.log(req.params)
    getPosts().then(receivedPosts => {
      const postIndex = receivedPosts.findIndex((el) => el.id == id);
      if (postIndex === -1) {
        res.status(404).send({
          message: "Post not found."
        })
      }else{
        res.status(200).send(receivedPosts[postIndex])
      }
    })
    .catch(err => {
      console.error("error", err);
      res.status(500).send({
        message: "Something went wrong."
      })
    }) 
  })
  
  router.put('/:id',  validate(postsSchema), (req, res) => {
    const id = req.params.id;
    const updatedPost = req.body;
    getPosts().then(receivedPosts => {
      const postIndex = receivedPosts.findIndex((el) => el.id == id);
      if (postIndex === -1) {
          res.status(404).send({
          message: "Post not found."
        })
      } else {
        updatePost(receivedPosts, postIndex, updatedPost, isPatch = "PATCH").then(post => {
          console.log("post updated", post);
          res.status(200).send(post);
        })
      }; 
    })
    .catch(err => {
      console.error("error", err);
      res.status(500).send({
        message: validation.error.message
      })
    })
  })
  
  router.patch('/:id', validate(patchSchema), (req, res) => {
    const id = req.params.id;
    const updatedPost = req.body;
    getPosts().then(receivedPosts => {
      const postIndex = receivedPosts.findIndex((el) => el.id == id);
      if (postIndex === -1) {
        res.status(404).send({
          message: "Post not found."
        })
      }else{
        updatePost(receivedPosts, postIndex, updatedPost, isPatch = "PATCH").then(post => {
          res.status(200).send(post);
        })
      }; 
    })
    .catch(err => {
      console.error("error", err);
      res.status(500).send({
        message: validation.error.message
      })
    })
  })
  
  router.delete('/:id', (req, res) =>{
    getPosts().then(receivedPosts => {
      const id = req.params.id;
        const postIndex = receivedPosts.findIndex((el) => el.id == id);
        if (postIndex === -1) {
          res.status(404).send({
            message: "Post not found."
          })
        }else{
          deletePost(receivedPosts, postIndex).then(() => {
            res.status(200).send({
                message: `Post with id - ${id} successfully deleted`
            })
          }) .catch(err => {
            console.error("error", err)
            res.status(500).send({
            message: "Something went wrong."
            })
          })
        }
      }) 
  })

  module.exports = router