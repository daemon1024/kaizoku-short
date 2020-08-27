
const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 3000
const { Sequelize, DataTypes } = require("sequelize");
const shortid = require('shortid');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'links.sqlite'
  });
  
  app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.send('Hello World!')
})
const Links = sequelize.define("Links", {
    shorturl: {
      type: DataTypes.STRING,
      primaryKey: true,
      unique:true,
      allowNull: false,
    },
    longurl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user:{
        type:DataTypes.STRING,
        allowNull:true,
        unique:false
    }
  });
  Links.sync();

app.post("/short",async (req,res)=>{
    try{
    longurl=req.body.longurl
    user=req.body.user || "anonymous"
    const lenk=await Links.findOne(
        {
            where:{
                longurl:longurl,
                user:user
            }
        }
    )
    if(lenk===null){
        const shortlink = await Links.create({ longurl: longurl,shorturl:shortid.generate(),user:user });
        res.json(shortlink)
        
    }
    else{
        res.json(lenk)
    }
}catch(err){console.log(err)};
});
app.get("/d/:id", async (req,res)=>{
    shorted=req.params.id || "sad"
    const lenk=await Links.findOne(
        {
            where:{
                shorturl:shorted
            }
        }
    )
    if(lenk===null){
        res.status(404).send("Not found");
    }
    else{
        res.redirect(lenk.longurl);
    }
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})