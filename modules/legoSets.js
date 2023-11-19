require("dotenv").config();
const Sequelize = require("sequelize");

let sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");

  })
  .catch((err) => {
    console.log("Unable to connect to the database:", err);
  });

  const Theme = sequelize.define(
    "Theme",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: Sequelize.STRING,
    },
    { createdAt: false, updatedAt: false }
  );

  const Set = sequelize.define(
    "Set",
    {
      set_num: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      name: Sequelize.STRING,
      year: Sequelize.INTEGER,
      num_parts: Sequelize.INTEGER,
      theme_id: Sequelize.INTEGER,
      img_url: Sequelize.STRING,
    },
    { createdAt: false, updatedAt: false }
  );

  Set.belongsTo(Theme, { foreignKey: "theme_id" });

  module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
      sequelize
        .sync()
        .then(() => {
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  module.exports.getAllSets = () => {
    return new Promise((resolve, reject) => {
      Set.findAll({ include: [Theme] }).then((data) => {
        resolve(data);
      });
    });
  };

  module.exports.getSetsByNum = (setNum) => {
    return new Promise((resolve, reject) => {
      Set.findAll({ include: [Theme], where: { set_num: setNum } })
        .then((data) => {
          if (data.length == 0)
            reject(`No sets with number '${setNum}' found.`);
          else resolve(data[0]);
        })
        .catch((err) => reject(`No sets with number '${setNum}' found.`));
    });
  };

  module.exports.getSetsbyTheme = (theme) => {
    return new Promise((resolve, reject) => {
      Set.findAll({
        include: [Theme],
        where: {
          "$Theme.name$": {
            [Sequelize.Op.iLike]: `%${theme}%`,
          },
        },
      })
        .then((data) => {
          if (data.length == 0)
            reject(`No sets matching the theme '${theme}'.`);
          else resolve(data);
        })
        .catch((err) => {
          reject(`No sets matching the theme '${theme}'.`);
        });
      // let res = sets.filter((el) =>
      //   el.theme.toLowerCase().includes(theme.toLowerCase())
      // );
      // if (res.length != 0) resolve(res);
      // else reject(`No sets matching the theme '${theme}'.`);
    });
  };
