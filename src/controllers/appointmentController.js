const Appointment = require("../models/Appointment");
const buildController = require("./resourceController");

module.exports = buildController(
  Appointment,
  ["patient", "driver", "vehicle", "origin", "destination", "date", "status", "notes", "km"],
  {
    populate: "patient driver vehicle",
    sort: "date",
    searchFields: ["origin", "destination", "status"]
  }
);
