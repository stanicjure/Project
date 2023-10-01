const User = require("../model/User");

const getAllUsers = async (req, res) => {
  const users = await User.find();
  if (!users) return res.status(204).json({ message: "No users found" });
  res.json(users);
};

const deleteUser = async (req, res) => {
  if (!req?.body?.username)
    return res.status(400).json({ message: "User username required" });
  const user = await User.findOne({ username: req.body.username }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.body.username} not found` });
  }
  const result = await user.deleteOne({ _id: user._id });
  res.json(result);
};

const getUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID required" });
  const user = await User.findOne({ _id: req.params.id }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.params.id} not found` });
  }
  res.json(user);
};
const addRemoveAdmin = async (req, res) => {
  if (!req?.params?.username)
    return res.status(400).json({ message: "Username is required" });
  const user = await User.findOne({ username: req.body.username }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.body.username} not found` });
  }
  if (!user?.roles.includes("Admin")) {
    const result = await user.roles.push("Admin");
    res.json(result);
  } else if (user?.roles.includes("Admin")) {
    const result = await user.roles.splice(user.roles.indexOf("Admin"), 1);
    res.json(result);
  } else {
    res.sendStatus(409);
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getUser,
  addRemoveAdmin,
};
