const User = require("../model/User");
const GeneralStats = require("../model/GeneralStats");
const bcrypt = require("bcrypt");

const handleNewUser = async (req, res) => {
  // i dont wanna have too many requests, maybe if i suffer some bot attacks :(
  const generalStatsExists = await GeneralStats.findOne({
    name: "GeneralStats",
  }).exec();
  if (!generalStatsExists) {
    try {
      const generalStatsResult = await GeneralStats.create({
        name: "GeneralStats",
        requestsNumber: 0,
      });
      console.log(`Succesfully created general stats : ${generalStatsResult}`);
    } catch (err) {
      console.error(err);
    }
  } else {
    if (generalStatsExists.requestsNumber >= 30) {
      res.sendStatus(406);
      return;
    }
  }
  const { user, pwd } = req.body;
  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and password are required" });

  // check for duplicate usernames in db
  const duplicate = await User.findOne({ username: user }).exec();

  if (duplicate) return res.sendStatus(409);

  try {
    //encrypt the password
    const hashedPwd = await bcrypt.hash(pwd, 10);
    //Create and store the new user
    const result = await User.create({
      username: user,
      // u schemi dodajemo role usera po defaultu
      password: hashedPwd,
    });

    console.log(result);
    generalStatsExists.requestsNumber++;
    generalStatsExists.save();
    res.status(201).json({ success: `New user ${user} created` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { handleNewUser };
