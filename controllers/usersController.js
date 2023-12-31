const User = require("../model/User");
const GeneralStats = require("../model/GeneralStats");

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

  let errorFound = new Array();
  let tempArr;
  if (Array.isArray(req.body.apartmentName)) {
    tempArr = Array.from(req.body.apartmentName);
  } else {
    tempArr = new Array();
    tempArr.push(req.body.apartmentName);
  }

  user?.apartments.forEach((ap) => {
    tempArr.forEach((t) => {
      if (ap.label === req.body.apartmentName) errorFound = [...errorFound, t];
    });
  });
  if (errorFound.length === 0) {
    tempArr.forEach((ap) => {
      const result = user.apartments.push({
        label: ap,
        reservations: [],
      });
    });

    user.save();
    res.status(200).json({
      message: `Successfully added apartment ${req.body.apartmentName}`,
    });
  } else {
    res.status(409).json({ message: `Already exists: ${errorFound}` });
  }
};
const deleteApartment = async (req, res) => {
  if (!req?.body?.username)
    return res.status(400).json({ message: "Username is required!" });
  if (!req?.body?.apartmentName)
    return res.status(400).json({ message: "Apartment name is required!" });

  const user = await User.findOne({ username: req.body.username }).exec();

  const indexToRemove = user?.apartments.findIndex(
    (ap) => ap.label === req.body.apartmentName
  );
  user?.apartments.splice(indexToRemove, 1);
  user.save();
  res.status(200).json({
    message: req.body.apartmentName,
  });
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

  let guestName = "";
  let children = 0;
  let additionalInfo = "";
  let advancePay = 0;
  let payed = false;

  if (req.body.guestName) guestName = req.body.guestName;
  if (req.body.children) children = req.body.children;
  if (req.body.additionalInfo) additionalInfo = req.body.additionalInfo;
  if (req.body.advancePay) advancePay = req.body.advancePay;
  if (req.body.payed) payed = req.body.payed;

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
    if (!errorFound) {
      if (
        (compareStart >= re.start.getTime() &&
          compareStart < re.end.getTime()) ||
        (compareEnd > re.start.getTime() && compareEnd <= re.end.getTime())
      ) {
        res.status(400).json({ message: "There is an existing reservation" });
        errorFound = true;
        return;
      }
      if (
        (re.start.getTime() >= compareStart &&
          re.start.getTime() < compareEnd) ||
        (re.end.getTime() > compareStart && re.end.getTime() <= compareEnd)
      ) {
        res
          .status(400)
          .json({ message: "KURACThere is an existing reservation" });
        errorFound = true;
        return;
      }
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
            guestName: guestName,
            children: children,
            additionalInfo: additionalInfo,
            advancePay: advancePay,
            payed: payed,
          },
        ];

        //dead code
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
    res.status(201).json(newReservation);
  }
};

const mutateReservation = async (req, res) => {
  if (!req?.body?.username)
    return res.status(400).json({ message: "User username required" });
  const user = await User.findOne({ username: req.body.username }).exec();

  const {
    apartmentName,
    reservationIndex,
    guestName,
    price,
    persons,
    children,
    arrive,
    leave,
    additionalInfo,
    advancePay,
    payed,
  } = req.body;

  //Check if there is existing reservation
  let reservations;
  user?.apartments.forEach((ap) => {
    if (ap.label === apartmentName) reservations = ap.reservations;
  });

  let errorFound = false;

  const compareStart = new Date(arrive);
  const compareEnd = new Date(leave);
  compareStart.setHours(2);
  compareEnd.setHours(2);

  reservations.forEach((re) => {
    if (!errorFound && re !== reservations[reservationIndex])
      if (
        (compareStart.getTime() >= re.start.getTime() &&
          compareStart.getTime() < re.end.getTime()) ||
        (compareEnd.getTime() > re.start.getTime() &&
          compareEnd.getTime() <= re.end.getTime())
      ) {
        errorFound = true;
        return;
      }
  });

  //
  let reservationInfoBack;
  if (!errorFound) {
    // set reservation
    user.apartments.forEach((ap, index) => {
      if (ap.label === apartmentName) {
        ap.reservations[reservationIndex] = {
          guestName: guestName,
          price: price,
          persons: persons,
          children: children,
          start: arrive,
          end: leave,
          additionalInfo: additionalInfo,
          advancePay: advancePay,
          payed: payed,
        };

        reservationInfoBack = JSON.stringify({
          label: ap.label,
          index: reservationIndex,
          reservation: ap.reservations[reservationIndex],
        });
      }
    });

    user.save();
    res.status(200).json(reservationInfoBack);
  } else {
    res
      .status(400)
      .json({ message: "Reservation already exists in specified time period" });
  }
};

const deleteReservation = async (req, res) => {
  if (!req?.body?.username)
    return res.status(400).json({ message: "User username required" });
  const user = await User.findOne({ username: req.body.username }).exec();
  if (!user) {
    return res
      .status(404)
      .json({ message: `User ID ${req.body.username} not found` });
  }

  if (!req.body._id) return res.sendStatus(400);

  let reservations = new Array();
  user.apartments.forEach((ap) => {
    if (ap.label === req.body.apName)
      reservations = Array.from(ap.reservations);
  });

  const newReservations = reservations.filter(
    (r) => r._id.toString() !== req.body._id.toString()
  );

  let sendBackIndex;
  reservations.forEach((r, index) => {
    if (r._id.toString() === req.body._id.toString()) sendBackIndex = index;
  });

  user.apartments.forEach((ap) => {
    if (ap.label === req.body.apName) {
      ap.reservations = [...newReservations];
    }
  });

  user.save();
  res
    .status(200)
    .json({ index: sendBackIndex, newReservations: newReservations });
};

const deleteUser = async (req, res) => {
  if (!req?.body?.username)
    return res.status(400).json({ message: "User username required" });
  const user = await User.findOne({ username: req.body.username }).exec();
  if (!user) {
    return res
      .status(404)
      .json({ message: `User ID ${req.body.username} not found` });
  }
  const result = await user.deleteOne({ _id: user._id });
  res.json({ message: `Successfully deleted user: ${req.body.username}` });
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
  res.json({ message: `Sucessfully added ${req.body.username} as admin` });
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
  res.json({ message: `Sucessfully removed ${req.body.username} as admin` });
};

const approveUserRequest = async (req, res) => {
  console.log("Mega kurac");
  const generalStatsExists = await GeneralStats.findOne({
    name: "GeneralStats",
  }).exec();

  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID to approve is required" });

  const user = await User.findOne({ username: req.params.id }).exec();

  const requestRole = user?.roles;

  if (requestRole?.UserRequest) {
    user.roles.User = 2001;
    user.roles.UserRequest = undefined;
    user.save();

    generalStatsExists.requestsNumber--;
    generalStatsExists.save();

    return res.sendStatus(200);
  } else return res.sendStatus(404);
};

const rejectUserRequest = async (req, res) => {
  console.log("mega kurac");
  const generalStatsExists = await GeneralStats.findOne({
    name: "GeneralStats",
  }).exec();

  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID to reject is required" });

  const deletedUser = await User.deleteOne({ username: req.params.id }).exec();

  if (deletedUser) {
    generalStatsExists.requestsNumber--;
    generalStatsExists.save();

    return res.sendStatus(204);
  }
};
module.exports = {
  getAllUsers,
  deleteUser,
  getUser,
  addAdmin,
  removeAdmin,
  addApartment,
  addReservation,
  deleteApartment,
  mutateReservation,
  deleteReservation,
  approveUserRequest,
  rejectUserRequest,
};
