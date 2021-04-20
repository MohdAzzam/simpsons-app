'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({extended: true}));
// Specify a directory for static resources
app.use(express.static(__dirname+'/public'));
// define our method-override reference
app.use(methodOverride('_method'));
// Set the view engine for server-side templating
app.set('view engine', 'ejs');
// Use app cors
app.use(cors())

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

// app routes here
// -- WRITE YOUR ROUTES HERE --
app.get('/',(req,res)=>{
    let url ='https://thesimpsonsquoteapi.glitch.me/quotes?count=10'
    superagent.get(url)
    .set('User-Agent', '1.0')
    .then(result=>{
        // console.log(result.body);
        res.render('pages/index',{data:result.body});
    })
});

app.get('/favorite-quotes',(req,res)=>{
    let sql = 'select * from quotes';
    client.query(sql)
    .then(result=>{
        res.render('pages/myFav',{data:result.rows,count:result.rowCount})
    })
    .catch(err=>console.log('error in retriving data'))
})
app.post('/addToFav',(req,res)=>{
    // console.log(req.body);
    let arr=[req.body.quote,req.body.character,req.body.image,req.body.characterDirection];
    const sql = 'insert into quotes (quote,character,image,characterDirection) values($1,$2,$3,$4)';
    client.query(sql,arr)
    .then(result=>{
        res.redirect('/favorite-quotes');
    })
    .catch(errr=>console.log('Error while insert'))
})

app.get('/update/:id',(req,res)=>{
    console.log(req.params.id);
    const id =parseInt(req.params.id)
    let sql = 'select * from quotes where id=$1';
    client.query(sql,[id])
    .then(result=>{
        console.log(result.rows);
        res.render('pages/updateMyFav',{data:result.rows})
    })
    .catch(err=> console.log('errr',err))
})

app.put('/update/:id',(req,res)=>{
    let sql = 'update quotes set  quote=$1 , character=$2,characterDirection=$3 where id =$4';
    let arr=[req.body.quote,req.body.character,req.body.characterDirection,req.params.id];
    client.query(sql,arr)
    .then(result=>{
        res.redirect('/favorite-quotes')
    })
    .catch(err=>console.log('error',err))
    
})

app.delete('/delete/:id',(req,res)=>{
    let sql= 'delete from quotes where id=$1';
    client.query(sql,[req.params.id])
    .then(result=>{
        res.redirect('/favorite-quotes')
    })
    .catch(err=>console.log(err))
})


// callback functions
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --

// helper functions

function errorHandler (err, req, res, next) {
    if (res.headersSent) {
      return next(err)
    }
    res.status(500)
    res.render('error', { error: err })
  }
// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);
