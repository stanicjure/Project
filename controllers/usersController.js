const User = require("../model/User");

const getAllUsers = async (req, res) => {
  const users = await User.find();
  if (!users) return res.status(204).json({ message: "No users found" });
  res.json(users);
};

const addApartment = async (req, res) => {
  if (!req?.body?.username)
    return res.status(400).json({ message: "Username is required!" });
  if (!req?.body?.apartmentName)
    return res.status(400).json({ message: "Apartment name is required!" });
  //ADD IN CASE OF DUPLICATE
  const user = await User.findOne({ username: req.body.username }).exec();

  const result = user.apartments.push({
    label: req.body.apartmentName,
    reservations: [],
  });
  user.save();
  res.json(user);
};

const addReservation = async (req, res) => {
  if (!req?.body?.username)
    return res.status(400).json({ message: "Username is required!" });
  if (
    !(
      req?.body?.apartmentName &&
      req?.body?.startDate &&
      req?.body?.endDate &&
      req?.body?.price
    )
  )
    return res.status(400).json({ message: "Reservation inputs are required" });

  const user = await User.findOne({ username: req.body.username }).exec();
  const { apartmentName, startDate, endDate, price } = req.body;
  let newReservation;

  user?.apartments.forEach((ap) => {
    if (ap.label === apartmentName) {
      ap.reservations = [
        ...ap.reservations,
        { price: price, start: startDate, end: endDate },
      ];

      newReservation = {
        apartmentName: apartmentName,
        startDate: startDate,
        endDate: endDate,
        price: price,
      };
    }
  });

  user.save();
  res.json(newReservation);
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
  const user = await User.findOne({ username: req.params.id }).exec();
  if (!user) {
    return res.status(204).json({ message: `User ${req.params.id} not found` });
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
  addApartment,
  addReservation,
};
