// Cross origin resource sharing
const whiteList = require("./whiteList");
const corsOptions = {
  origin: (origin, callback) => {
    // if the domain is in the whiteList
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
