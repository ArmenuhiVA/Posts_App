const postsSchema = {
    author: {
        type: "object",
        properties: {
            firstName: {
                type: "string",
                maxLength: 15,
                required: true
            },
            lastName: {
                type: "string",
                maxLength: 15,
                required: true
            },
            age: {
                type: "number",
                min: 18,
                max: 100,
                required: false
            }
        },
        required: true 
    },
    title : {
        type: "string",
        maxLength: 40,
        minLength: 5,
        required: true
    },
    subtitle: {
        type: "string",
        maxLength: 50,
        minLength: 5,
        required: false
    },
};

const patchSchema = {
    author: {
        type: "object",
        properties: {
            firstName: {
                type: "string",
                maxLength: 15,
                required: true
            },
            lastName: {
                type: "string",
                maxLength: 15,
                required: true
            },
            age: {
                type: "number",
                min: 18,
                max: 100,
                required: true
            }
        },
        required: false 
    },
    title : {
        type: "string",
        maxLength: 40,
        minLength: 5,
        required: false
    },
    subtitle: {
        type: "string",
        maxLength: 50,
        minLength: 5,
        required: false
    },
};

const validate =(obj, schema) => {
    let message = '';
    let isValid = true;
    if(typeof obj !== "object" || obj.length !== undefined){
        message += "The type of request body is not valid";
        isValid =  false;
        return {
            isValid,
            error: new Error("The type of request body is not valid")
        }
    }
    const objKeys = Object.keys(obj);
    const props = Object.keys(schema);

    if(!objKeys.length){
        return{
            isValid: false,
            error: new Error("Object is empty")
        }
    }
    objKeys.forEach((key) => {
        if(props.indexOf(key) === -1){
            isValid = false;
            message += `There can't be ${key} property in the object`
        }
    })

    if(!isValid) {
        return {
            isValid,
            error: new Error(message)
        }
    }


    props.forEach(prop => {
            if(!obj.hasOwnProperty(prop) && !schema[prop].required){
               return;
            }else
            if(!obj.hasOwnProperty(prop) && schema[prop].required){
                isValid = false;
                message += `Your object doesn't have '${prop}' propery and this is required`;
            }else 
            if(typeof obj[prop] !== schema[prop].type){
                isValid = false;
                message += `The "${obj[prop]}" type is not ${schema[prop].type} `;
            }else
           if(typeof obj[prop] === "string"){
                 if(obj[prop].length > schema[prop].maxLength || obj[prop].length < schema[prop].minLength){
                    isValid = false;
                    if(obj[prop].length > schema[prop].maxLength){
                        message += `The ${obj[prop]} length is very long, the required max length is ${schema[prop].maxLength} character`;
                    }else if(obj[prop].length < schema[prop].minLength){
                        message += `The ${obj[prop]} length is very short, the required min length is ${schema[prop].minLength} character`;
                    }
                 }
           }else
           if(typeof obj[prop] === "number"){
                if(obj[prop] > schema[prop].max || obj[prop] < schema[prop].min){
                    isValid = false;
                }
                if(obj[prop] > schema[prop].max ){
                    message += `You are very old`;
                }else if(obj[prop] < schema[prop].min){
                    message += `You are very young`;               
                }
           }else if(typeof obj[prop] === "object"){
               const nestedValidation = validate(obj[prop], schema[prop].properties);
               if(!nestedValidation.isValid){
                isValid = false;
                message += `${prop} ${nestedValidation.error.message}`
               }
           }
    })
  return {
    isValid,
    error: message ? new Error(message) : null
  }  
}
// .catch(err) {
//     err.message
// }
// let post = {
//     author: {
//         firstName: "Jhone",
//         lastName: "Smith",
//         age: 50
//     },
//     title: "title",
//     subtitle: "subtitle"
// };
// console.log(validate(post, postsSchema));


module.exports = {
    postsSchema,
    patchSchema,
    validate
}