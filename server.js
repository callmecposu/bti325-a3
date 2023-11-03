/***************************************************************************
* BTI325 - Assignment 04
*
米
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Maksym Volkovynskyi   Student ID: 126867225   Date: 2023/11/03
*
* Published URL: https://sleepy-purse-bat.cyclic.app/
***************************************************************************/

const legoData = require("./modules/legoSets");

const express = require("express");
const app = express();

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render('home')
});

app.get("/about", (req, res) => {
  res.render('about');
});

app.get("/lego/sets", (req, res) => {
  if (req.query.theme) {
    legoData
      .getSetsbyTheme(req.query.theme)
      .then((result) => res.render('sets', {sets: result, theme: req.query.theme}))
      .catch((err) => res.status(404).render('404', {message: err}));
  } else {
    legoData.getAllSets().then((result) => res.render('sets', {sets: result, theme: ''}))
  }
});

app.get("/lego/sets/:setNum", (req, res) => {
  legoData
    .getSetsByNum(req.params.setNum)
    .then((sets) => res.render('set', {set:sets}))
    .catch((err) => res.status(404).render('404', {message: err}));
});

app.use((req, res, next) => {
  res.status(404).render('404', {message: 'Path Not Found :c'})
});

legoData.initialize().then(() => {
  app.listen(3001, () => {
    console.log("Now listening on port 3001...");
  });
});
