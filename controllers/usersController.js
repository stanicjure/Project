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
const deleteApartment = async (req, res) => {
  if (!req?.body?.username)
    return res.status(400).json({ message: "Username is required!" });
};

const addReservation = async (req, res) => {
  if (!req?.body?.username)
    return res.status(400).json({ message: "Username is required!" });
  if (
    !(
      req?.body?.apartmentName &&
      req?.body?.startDate &&
      req?.body?.endDate &&
      req?.body?.price &&
      req?.body?.persons
    )
  )
    return res.status(400).json({ message: "Reservation inputs are required" });

  const user = await User.findOne({ username: req.body.username }).exec();
  const { apartmentName, startDate, endDate, persons, price } = req.body;

  if (!(Date(startDate) && Date(endDate)))
    return res
      .status(400)
      .json({ message: "Start date and End date must be type of Date" });

  if (!(Number(persons) && Number(price)))
    return res
      .status(400)
      .json({ message: "Price and persons should be a number" });

  const resetHoursStart = new Date(startDate).setHours(2);
  const resetHoursEnd = new Date(endDate).setHours(2);

  const compareStart = new Date(resetHoursStart).getTime();
  const compareEnd = new Date(resetHoursEnd).getTime();

  if (compareStart > compareEnd)
    return res
      .status(400)
      .json({ message: "Start date must be smaller than End date" });

  //Check if there is existing reservation
  let reservations;
  user?.apartments.forEach((ap) => {
    if (ap.label === apartmentName) reservations = ap.reservations;
  });

  let errorFound = false;
  reservations.forEach((re) => {
    if (!errorFound)
      if (
        (compareStart >= re.start.getTime() &&
          compareStart < re.end.getTime()) ||
        (compareEnd > re.start.getTime() && compareEnd <= re.end.getTime())
      ) {
        res.status(400).json({ message: "There is an existing reservation" });
        errorFound = true;
        return;
      }
  });

  //

  let newReservation;

  if (!errorFound)
    user?.apartments.forEach((ap) => {
      if (ap.label === apartmentName) {
        ap.reservations = [
          ...ap.reservations,
          {
            price: price,
            persons: persons,
            start: resetHoursStart,
            end: resetHoursEnd,
          },
        ];

        newReservation = {
          apartmentName: apartmentName,
          startDate: resetHoursStart,
          endDate: resetHoursEnd,
          price: price,
          persons: persons,
        };

        ap.reservations.sort((a, b) => {
          if (a.start < b.start) return -1;
          else return 1;
        });
      }
    });

  if (!errorFound) {
    user.save();
    res.json(newReservation);
  }
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
