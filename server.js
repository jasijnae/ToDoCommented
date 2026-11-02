const express = require('express') //making it possible to use express in this file
const app = express()//setting a constant and assigning it to the instance of express
const MongoClient = require('mongodb').MongoClient//makes it possinle to use methods, needed for MongoClient to talk to MongoDB
const PORT = 2121 // the location where the server will be listening
require('dotenv').config() //allows us to look at the variables inside of the .env file


let db, // declaring this gloabally so we can use it in multiple places, but it's not defined
    dbConnectionStr = process.env.DB_STRING, //declarining the varianle and adssigning it to or DB connection string
    dbName = 'todo'//declaring a variable to set the name of the DB to be accessed/used
    /*MongoDB heirarchy DB-->collections-->documents */

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })//creating the connection to MDB and passing in the mongo string (passinf the connection string, then passing a property) 
    .then(client => {//mongoclient.connect is establishing a promise, waiting to see if the connection is successful consoleloging the DB if it is-->oassing client if it is
        console.log(`Connected to ${dbName} Database`)//lon to the console a template literal "cnnected to todo DB"
        db = client.db(dbName)//assigning the value to DB that contains a DB client factory
    })//closing the .then
    
//Node middleware -->to help facilitate our communcation channels to our requests so we know how to expect things to be rendered
app.set('view engine', 'ejs')//setting ejs as the defaul render method
app.use(express.static('public'))//we have public folder and we need to tell the code where to look, so it sets the location of static assets
app.use(express.urlencoded({ extended: true }))//Tells express to decode and encode URLs where the header matches the content. Supports arrays and objects
app.use(express.json())//it parses JSON incoming requests, and replaces body parser

//get is the read request, it's the root updated on page load/refresh
app.get('/',async (request, response)=>{//the req and res paramaters
    const todoItems = await db.collection('todos').find().toArray()//sets the variable that awaits finding all items from the todo DB collection, and puts them into an array
    //created a variable that contains all the items
    //then created a variable that counts all the false(uncompleted) items
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})//sets the variable that awaits the count of uncompleted items to later display it in js
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    //rendering index.ejs
    //passing the DB items through to the count remaining inside of an obj
    //items and todoItems value pair
    
    /*the classic promise style to write this does the same action as the await
    db.collection('todos').find().toArray()
    .then(data => {
        db.collection('todos').countDocuments({completed: false})
        .then(itemsLeft => {
             response.render('index.ejs', { items: data, left: itemsLeft })
        })
    })
    .catch(error => console.error(error))*/
})

app.post('/addTodo', (request, response) => {//triggers the post method when the add route is passed in
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
        //look in the todos DB
        // inserts a property of thing and a completed
        // the value for thing is from the ejs todoItem form assigned to the value inputed in the input text box
        //completed is a new task, new todos are not completed by default, they are not set to true until clicked
    .then(result => {//if insert is successful, do..
        console.log('Todo Added')//console log todo added
        response.redirect('/')//refresh the page away from the todo route, when a form is used to pass an action resend the page back to the root page
    })//closing .then
    .catch(error => console.error(error))//catching any errors
})//post ended

app.put('/markComplete', (request, response) => {//triggers the put(update) method when the markcomplete route is passed in
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        //look in the todos DB
        //.itemFromJS is from the main js file that does a fetch to pass in the innertext of the span in the list
        // looks int the DB for one item matchin the name of the item passed in from the main.js file that was clicked on
        //use the collection/object ID not the property name
            $set: {
            completed: true //set the completed status to true
          }
    },{
        sort: {_id: -1},//moves item to the bottom of the list
        upsert: false// prevents insertion if the item does not already exist
    })//closing .then
    .then(result => {//starts a .then if update was successful
        console.log('Marked Complete')//console log 'Marked Complete
        response.json('Marked Complete')//send 'Marked Complete to main.js data variable so it can be consoled log--> sending the response back to the sender.
    })//closing .then
    .catch(error => console.error(error))//catching any errors

})//ending the put

app.put('/markUnComplete', (request, response) => {//triggers the put(update) method when the unmarkcomplete route is passed in
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        //look in the todos DB
        //.itemFromJS is from the main js file that does a fetch to pass in the innertext of the span in the list
        // looks int the DB for one item matchin the name of the item passed in from the main.js file that was clicked on
        $set: {
            completed: false//set the completed status to false
          }
    },{
        sort: {_id: -1},//moves item to the bottom of the list
        upsert: false// prevents insertion if the item does not already exist
    })
    .then(result => {//starts a .then if update was successful
        console.log('Marked Complete')//console log 'Marked Complete
        response.json('Marked Complete')//send 'Marked Complete to main.js data variable so it can be consoled log--> sending the response back to the sender.
    })//closing .then
    .catch(error => console.error(error))//catching any errors

})//ending the put

app.delete('/deleteItem', (request, response) => {//starting a delete method when delete is passed
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
        //look in the todos DB
        //.itemFromJS is from the main js file that does a fetch to pass in the innertext of the span in the list
        // looks int the DB for one item matchin the name of the item passed in from the main.js file that was clicked on
    .then(result => {//starts if the delete was successful
        console.log('Todo Deleted')//console log todo deleted
        response.json('Todo Deleted')//sends request back to the sender
    })//closing .then
    .catch(error => console.error(error))//catching any errors

})//closes delete

app.listen(process.env.PORT || PORT, ()=>{//it specificies which port we'll be listening on if it is .env file or the port we set
    console.log(`Server running on port ${PORT}`)//console log Server running on port 2121
})//ending the delete