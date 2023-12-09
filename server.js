/***************************************************************************
* BTI325 - Assignment 06
*
米
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Maksym Volkovynskyi   Student ID: 126867225   Date: 2023/12/08
*
* Published URL: https://sleepy-purse-bat.cyclic.app/
***************************************************************************/

const legoData = require("./modules/legoSets");

const authData = require("./modules/auth-service");

const clientSessions = require("client-sessions");

const express = require("express");
const app = express();

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

app.use(
  clientSessions({
    cookieName: "session",
    secret: "top_secret",
    duration: 3 * 60 * 1000,
    activeDuration: 60 * 1000,
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

const ensureLogin = (req, res, next) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
};

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/lego/sets", (req, res) => {
  if (req.query.theme) {
    legoData
      .getSetsbyTheme(req.query.theme)
      .then((result) =>
        res.render("sets", { sets: result, theme: req.query.theme })
      )
      .catch((err) => res.status(404).render("404", { message: err }));
  } else {
    legoData
      .getAllSets()
      .then((result) => res.render("sets", { sets: result, theme: "" }));
  }
});

app.get("/lego/sets/:setNum", (req, res) => {
  legoData
    .getSetsByNum(req.params.setNum)
    .then((sets) => res.render("set", { set: sets }))
    .catch((err) => res.status(404).render("404", { message: err }));
});

app.get("/lego/addSet", ensureLogin, (req, res) => {
  legoData
    .getAllThemes()
    .then((themeData) => {
      res.render("addSet", { themes: themeData });
    })
    .catch((err) => {
      res.render("500", { message: err });
    });
});

app.post("/lego/addSet", ensureLogin, (req, res) => {
  legoData
    .addSet(req.body)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) => {
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    });
});

app.get("/lego/editSet/:num", ensureLogin, (req, res) => {
  Promise.all([legoData.getSetsByNum(req.params.num), legoData.getAllThemes()])
    .then((result) => {
      res.render("editSet", { themes: result[1], set: result[0] });
    })
    .catch((err) => {
      res.status(404).render("404", { message: err });
    });
});

app.post("/lego/editSet", ensureLogin, (req, res) => {
  legoData
    .editSet(req.body.set_num, req.body)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) =>
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      })
    );
});

app.get("/lego/deleteSet/:num", ensureLogin, (req, res) => {
  legoData
    .deleteSet(req.params.num)
    .then(() => res.redirect("/lego/sets"))
    .catch((err) =>
      res.render("500", {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      })
    );
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", (req, res) => {
  req.body.userAgent = req.get("User-Agent");
  authData
    .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect("/lego/sets");
    })
    .catch((err) => {
      res.render("login", { errorMessage: err, userName: req.body.userName });
    });
});

app.post("/register", (req, res) => {
  authData
    .registerUser(req.body)
    .then(() => {
      res.render("register", { successMessage: "User created" });
    })
    .catch((err) => {
      res.render("register", {
        errorMessage: err,
        userName: req.body.userName,
      });
    });
});

app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
})

app.get('/userHistory', ensureLogin, (req, res) =>{
  res.render('userHistory');
})

app.use((req, res, next) => {
  res.status(404).render("404", { message: "Path Not Found :c" });
});

legoData
  .initialize()
  .then(() => {
    authData.initialize().then(() => {
      app.listen(3001, () => {
        console.log("Now listening on port 3001...");
      });
    });
  })
  .catch((err) => console.log(`Unable to start the server: ${err}`));
