const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
const { Sequelize, DataTypes } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const shortid = require("shortid");
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});
app.use(bodyParser.json());

const Links = sequelize.define("Links", {
  shorturl: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
  },
  longurl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  clicks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});
Links.sync();

app.post("/short", async (req, res) => {
  try {
    longurl = req.body.longurl;
    user = req.body.user || uuidv4();
    const lenk = await Links.findOne({
      where: {
        longurl: longurl,
        user: user,
      },
    });
    if (lenk === null) {
      const shortlink = await Links.create({
        longurl: longurl,
        shorturl: shortid.generate(),
        user: user,
      });
      res.json(shortlink);
    } else {
      res.json(lenk);
    }
  } catch (err) {
    console.log(err);
  }
});
app.get("/:id", async (req, res) => {
  shorted = req.params.id || "sad";
  const lenk = await Links.findOne({
    where: {
      shorturl: shorted,
    },
  });
  if (lenk === null) {
    res.status(404).send("Not found");
  } else {
    lenk.increment(["clicks"], { by: 1 });
    res.redirect(lenk.longurl);
  }
});
app.get("/stats/:id", async (req, res) => {
  shorted = req.params.id || "sad";
  const lenk = await Links.findOne({
    where: {
      shorturl: shorted,
    },
  });
  if (lenk === null) {
    res.status(404).send("Not found");
  } else {
    var finaldata = {
      shorturl: lenk.shorturl,
      longurl: lenk.longurl,
      clicks: lenk.clicks,
    };
    res.json(finaldata);
  }
});
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
