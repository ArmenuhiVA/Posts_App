const fs = require('fs');
const { off } = require('process');
const postsFilePath = "./posts.json";  

const getPosts = () => {
    let posts = [];
    return new Promise((resolve, reject) => {
      fs.readFile(postsFilePath, (err, data) => {
        if (err) {
          console.error(err.message);
          reject(err);
        }
        posts = data.toString('utf8');
        resolve(JSON.parse(posts));
      })
    })
  }

  const getPostsByLimit = async (offset, limit, search) => {
    let fielteredPosts = [];
     function loopThrough(obj){
      for(let key in obj){
        if(typeof obj[key] === 'object'){
          loopThrough(obj[key])
        }else{
          if((key != 'age' && obj[key] != 'age') && search.test(key.toString()) || search.test(obj[key].toString())){
            fielteredPosts.push(obj);
            return 
          }
        }
      }
     }
    try {
      const posts = await getPosts();
      posts.forEach(obj => {
         loopThrough(obj)
        
      });
      console.log(fielteredPosts)
      return fielteredPosts.splice(offset, limit)
    } catch (err) {
      throw new Error(`Not able to get posts with offset ${offset} and limit ${limit}`)
    }
  }
  
  const createPost = (post) => {
    return new Promise((resolve, reject) => {
      getPosts().then(data => {
        const length = data.length;
        let id;
        if (!length) {
          id = 1;
        } else {
          id = data[length - 1].id + 1;
        }
        post.id = id;
        data.push(post)
        fs.writeFile(postsFilePath, JSON.stringify(data), (err) => {
          if (err) {
            console.error(err.message);
            reject(err);
          }
          resolve(post);
        })
      })
    })
  }
  
  const updatePost = (currentPosts, index, newData, isPatch) => {
    if (!isPatch) {
      currentPosts[index] = {...newData, id: currentPosts[index].id}
    } else {
      currentPosts[index] = {...currentPosts[index], ...newData}
    }
  
    return new Promise((resolve, reject) => {
      fs.writeFile(postsFilePath, JSON.stringify(currentPosts), (err) => {
        if (err) {
          console.error(err.message);
          reject(err);
        }
        resolve(currentPosts[index]);
      })
    })
  }
  
  const deletePost = (receivedPosts, postIndex) => {
    receivedPosts.splice(postIndex, 1)
    return new Promise((resolve, reject) => {
      fs.writeFile(postsFilePath, JSON.stringify(receivedPosts), (err) => {
        if (err) {
          console.error(err.message);
          reject(err);
        }
        resolve()
      })  
    })
  };

  module.exports = {
    getPosts,
    createPost,
    updatePost,
    deletePost,
    getPostsByLimit
  }
  
