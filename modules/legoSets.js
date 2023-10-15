const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

module.exports.initialize = () => {
  return new Promise((resolve, reject) => {
    setData.forEach((set) => {
      set.theme = themeData.find((el) => el.id == set.theme_id).name;
      sets.push(set);
    });
    resolve();
  });
};

module.exports.getAllSets = () => {
  return new Promise((resolve, reject) => {
    resolve(sets);
  });
};

module.exports.getSetsByNum = (setNum) => {
  return new Promise((resolve, reject) => {
    let res = sets.find((el) => el.set_num == setNum);
    if (res === undefined) reject(`No sets with number '${setNum}' found.`);
    else resolve(res);
  });
};

module.exports.getSetsbyTheme = (theme) => {
  return new Promise((resolve, reject) => {
    let res = sets.filter((el) =>
      el.theme.toLowerCase().includes(theme.toLowerCase())
    );
    if (res.length != 0) resolve(res);
    else reject(`No sets matching the theme '${theme}'.`);
  });
};

