const Driver = require("../models/Driver");
const buildController = require("./resourceController");

module.exports = buildController(Driver, ["name", "cnh", "phone", "status"], {
  searchFields: ["name", "cnh", "phone"]
});
