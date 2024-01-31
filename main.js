const http = require('http');
const url = require('url');
const {StringDecoder} = require('string_decoder');
// const fs = require('fs');

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
            const indexToUpdate = posts.findIndex(posts => posts.id === subPath);
            if(indexToUpdate === -1){
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                res.end('No post found with the given ID')
            }
            switch(method){
                case 'GET': 
                    res.writeHead(200,{
                        'Content-Type': "applicaton/json"
                    });
                    res.end(JSON.stringify(posts[indexToUpdate]));
                break;
                case 'PUT':
                    const newPutPost = JSON.parse(result);
                    posts[indexToUpdate] = {...posts[indexToUpdate], ... newPutPost, id: posts[indexToUpdate].id};
                    res.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    res.writeHead(200, {
                        'Content-Type': 'application/json'
                    });
                    res.end(JSON.stringify(posts[indexToUpdate]));
                    break; 
                case 'PATCH':
                    const newPost = JSON.parse(result);
                    for (let key in newPost) {
                        if (key in posts[indexToUpdate]) {
                            if(key === "id"){
                                continue;
                            }
                            posts[indexToUpdate][key] = newPost[key]; 
                        } 
                        // else {
                        //     res.writeHead(404, {
                        //         'Content-Type': 'text/plain'
                        //     });
                        //     res.end(`The key "${key}" not found in the post`);
                        //     return;
                        // }
                    }
                    res.writeHead(200,{
                        'Content-Type': "applicaton/json"
                    });
                    res.end(JSON.stringify(posts[indexToUpdate]));
                    break;         
                case 'DELETE':
                    posts.splice(indexToUpdate, 1);
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