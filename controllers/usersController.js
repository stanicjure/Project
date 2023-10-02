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
const addAdmin = async (req, res) => {
  if (!req?.body?.username)
    return res.status(400).json({ message: "Username is required" });
  const user = await User.findOne({ username: req.body.username }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.body.username} not found` });
  }
  if (!user.roles?.Admin) {
    user.roles.Admin = 5050;
  }
  const result = await user.save();
  res.json(result);
};
const removeAdmin = async (req, res) => {
  if (!req?.body?.username)
    return res.status(400).json({ message: "Username is required" });
  const user = await User.findOne({ username: req.body.username }).exec();
  if (!user) {
    return res
      .status(204)
      .json({ message: `User ID ${req.body.username} not found` });
  }
  if (user.roles?.Admin) {
    user.roles.Admin = undefined;
  }
  const result = await user.save();
  res.json(result);
};

module.exports = {
  getAllUsers,
  deleteUser,
  getUser,
  addAdmin,
  removeAdmin,
};
