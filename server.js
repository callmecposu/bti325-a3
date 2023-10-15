/***************************************************************************
* BTI325 - Assignment 03
*
米
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Maksym Volkovynskyi   Student ID: 126867225   Date: 2023/10/15
***************************************************************************/

// cyclic link: https://sleepy-purse-bat.cyclic.app/

const legoData = require("./modules/legoSets");

const path = require("path");

const express = require("express");
const app = express();

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/lego/sets", (req, res) => {
  if (req.query.theme) {
    legoData
      .getSetsbyTheme(req.query.theme)
      .then((result) => res.json(result))
      .catch((err) => res.status(404).send(err));
  } else {
    legoData.getAllSets().then((result) => res.json(result));
  }
});

app.get("/lego/sets/:setNum", (req, res) => {
  legoData
    .getSetsByNum(req.params.setNum)
    .then((sets) => res.json(sets))
    .catch((err) => res.status(404).send(err));
});

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, '/views/404.html'))
})

legoData.initialize().then(() => {
  app.listen(3001, () => {
    console.log("Now listening on port 3001...");
  });
});
