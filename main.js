const http = require('http');
const url = require('url');
const {StringDecoder} = require('string_decoder');

const posts = [];
let currentId = 1;

const server = http.createServer((req, res)=> {
    const parsedURL = url.parse(req.url, true);
    const path = parsedURL.pathname;
    const trimPath = path.replace(/^\/+|\/+$/g, '');
    console.log("trimpath: ", trimPath);

    let subPath = trimPath.split('/')[1] || null;
    console.log("subPath : ", subPath);

    if(subPath){
        subPath = parseInt(subPath) || "invalid";
    }

    const method = req.method.toUpperCase();
    let result = '';

    let decoder = new StringDecoder("utf-8");

    req.on('data', (data)=>{
        result += decoder.write(data);
    });

    req.on('end', () => {
        result += decoder.end();
        if (trimPath === 'posts' && !subPath){
            switch (method) {
                case 'POST':
                    const newPost = JSON.parse(result);
                    newPost.id = currentId++;
                    posts.push(newPost);
                    res.writeHead(201, {
                    'Content-Type': "applicaton/json"
                    })
                    res.end(JSON.stringify(newPost));
                    break;
                case 'GET': 
                    res.writeHead(200,{
                    'Content-Type': "applicaton/json"
                    })
                    res.end(JSON.stringify(posts));
            }
        }else if(trimPath === 'posts/' + subPath){
            let matchingPosts = [];
            switch(method){
                case 'GET': 
                
                let post = posts.find(post => post.id === subPath);

                if(post){
                    res.writeHead(200,{
                        'Content-Type': "applicaton/json"
                    });
                    res.end(JSON.stringify(post));
                }else {
                    res.writeHead(404, {
                        'Content-Type': 'text/plain'
                    });
                    res.end('No posts found for the given ID');
                }
                break;
                case 'PUT':
                    const newPost = JSON.parse(result);
                    let postFound = false;
                    const indexToUpdate = posts.findIndex(posts => posts.id === subPath);
                    if(indexToUpdate === -1){
                        res.writeHead(404, {
                            'Content-Type': 'text/plain'
                        });
                        res.end('No post found with the given ID');
                        break;
                    }
                    for (let key in newPost) {
                        if (key in posts[indexToUpdate]) {
                            posts[indexToUpdate][key] = newPost[key];
                        } else {
                            res.writeHead(404, {
                                'Content-Type': 'text/plain'
                            });
                            res.end('No matching key found in the post');
                            return;
                        }
                    }
                    res.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    res.end(JSON.stringify(posts[indexToUpdate]));
                    break;         
                case 'DELETE':
                    const indexToDelete = posts.findIndex(post => post.id === subPath );
                    if(indexToDelete === -1){
                        res.writeHead(404, {
                            'Content-Type': 'text/plain'
                        });
                        res.end('No post found with the given ID');
                        break;
                    }else{
                        posts.splice(indexToDelete, 1);
                    }
                    res.writeHead(200,{
                        'Content-Type': "applicaton/json"
                    });
                    res.end(JSON.stringify(posts));  
                    break;                   
            }
        }else{
            res.writeHead(404);
            res.end('Not Found');
        }
    })
});
server.listen(80, () => {
    console.log('server is running on localhost:80')
})