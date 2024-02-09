
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const {postsSchema, patchSchema,  validate } = require('./validations/validation.js');
const {getPosts, createPost, deletePost, updatePost} = require('./controllers/postControllers.js');
function errorHandler(err, req, res, next) {
  console.error("Error:", err);
  res.status(500).json({ message: "Something went wrong." });
}

  app.post('/posts', (req, res) => {
    const newPost = req.body;
    const validation = validate(newPost, postsSchema);
    if(!validation.isValid) {
      res.status(400).send(JSON.stringify({
        message: validation.error.message
      }))
      return;
    }
    createPost(newPost).then(createdPost =>{
      res.status(201).send(JSON.stringify(createdPost));
    })
    .catch(err => {
      console.error("error", err);
      res.status(500).send(JSON.stringify({
        message: "Something went wrong."
      }))
    }) 
  });
  app.get('/posts', (req, res) => {
      getPosts().then(posts => {
      res.status(200).send(JSON.stringify(posts));
    })
    .catch(err => {
      console.error("error", err);
      res.status(500).send(JSON.stringify({
        message: "Something went wrong."
      }))
    })
  })



  app.get('/posts/:id', (req, res) => {
    const id = req.params.id;
    getPosts().then(receivedPosts => {
      const postIndex = receivedPosts.findIndex((el) => el.id == id);
      if (postIndex === -1) {
        res.status(404).send(JSON.stringify({
          message: "Post not found."
        }))
      }else{
        res.status(200).send(JSON.stringify(receivedPosts[postIndex]))
      }
    })
    .catch(err => {
      console.error("error", err);
      res.status(500).send(JSON.stringify({
        message: "Something went wrong."
      }))
    }) 
  })

  app.put('/posts/:id', (req, res) => {
    const id = req.params.id;
    const updatedPost = req.body;
    const validation = validate(updatedPost, postsSchema);
    if(!validation.isValid) {
       res.status(400).send(JSON.stringify({
        message: validation.error.message
      }))
      return;
    }
    getPosts().then(receivedPosts => {
      const id = req.params.id;
      const postIndex = receivedPosts.findIndex((el) => el.id == id);
      if (postIndex === -1) {
          res.status(404).send(JSON.stringify({
          message: "Post not found."
        }))
      }else{
        updatePost(receivedPosts, postIndex, updatedPost, isPatch = "PATCH").then(post => {
          console.log("post updated", post);
          res.status(200).send(JSON.stringify(post));
        })
      }; 
    })
    .catch(err => {
      console.error("error", err);
      res.status(500).send(JSON.stringify({
        message: validation.error.message
      }))
    })
  })
  
  app.patch('/posts/:id', (req, res) => {
    const id = req.params.id;
    const updatedPost = req.body;
    const validation = validate(updatedPost, patchSchema);
    if(!validation.isValid) {
      res.status(400).send(JSON.stringify({
        message: validation.error.message
      }))
      return;
    }
    getPosts().then(receivedPosts => {
    const id = req.params.id;
      const postIndex = receivedPosts.findIndex((el) => el.id == id);
      if (postIndex === -1) {
        res.status(404).send(JSON.stringify({
          message: "Post not found."
        }))
      }else{
        updatePost(receivedPosts, postIndex, updatedPost, isPatch = "PATCH").then(post => {
          res.status(200).send(JSON.stringify(post));
        })
      }; 
    })
    .catch(err => {
      console.error("error", err);
      res.status(500).send(JSON.stringify({
        message: validation.error.message
      }))
    })
  })

  app.delete('/posts/:id', (req, res) =>{
    getPosts().then(receivedPosts => {
      const id = req.params.id;
        const postIndex = receivedPosts.findIndex((el) => el.id == id);
        if (postIndex === -1) {
          res.status(404).send(JSON.stringify({
            message: "Post not found."
          }))
        }else{
          deletePost(receivedPosts, postIndex).then(() => {
            res.status(200).send(JSON.stringify({
                message: `Post with id - ${id} successfully deleted`
            }))
          }) .catch(err => {
            console.error("error", err)
            res.status(500).send(JSON.stringify({
            message: "Something went wrong."
            }))
          })
        }
     }) 
  })
         
app.listen(PORT, () => { 
  console.log(`server is running on localhost:${PORT}`)
});