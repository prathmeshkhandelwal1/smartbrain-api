const express = require('express')

const app = express();

const bcrypt = require('bcrypt-nodejs');

const cors = require('cors');

const knex = require('knex')


const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'test',
      database : 'smartbrain'
    }
});

// console.log(postgres.select('*').from('users'));


app.use(cors())


app.use(express.json())



app.get('/',(req,res)=>{
    res.send(database.users)
})

app.post('/signin',(req,res)=>{
    db.select('email','hash').from('login')
    .where('email','=',req.body.email)
    .then(data=>{
        const isValid=bcrypt.compareSync(req.body.password,data[0].hash)
        if(isValid){
            return db.select('*').from('users')
            .where('email','=',req.body.email)
            .then(user=>{
                res.json(user[0])
            })
            .catch(err=>res.status(400).json("unable to get user"))
        }else{
            res.status(400).json("wrong credentials")
        }
    })
    .catch(err=>res.status(400).json("wrong credentials"))
})

app.get('/profile/:id',(req,res)=>{
    const {id} = req.params;
    db.select('*').where({
        id:id
    }).from('users')
    .then(user=>{
        if(user.length){
            res.json(user[0])
        }else{
            res.status(400).json('not found')
        }
    })
   
})

app.put('/image',(req,res)=>{
    const {id}= req.body;
    db('users').where('id','=',id)
    .increment('entries',1)
    .returning('entries')
    .then(entries=>{
        res.json(entries[0])
    })
    .catch(err=>res.status(400).json("unable to get entries"))

})

app.post('/register',(req,res)=>{
    const {name,email,password}= req.body
    const hash = bcrypt.hashSync(password);
    db.transaction(trx=>{
        trx.insert({
            hash:hash,
            email:email
        })
        .into('login')
        .returning('email')
        .then(loginEmail=>{
            return trx('users')
            .returning('*')
            .insert({
                email:loginEmail[0],
                name:name,
                joined:new Date()
            }).then(user=> {
                res.json(user[0])
            })
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    
    
   
})

app.listen(3000,()=>{
    console.log("app is running in port 3000")
});