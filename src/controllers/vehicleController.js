const Vehicle = require("../models/Vehicle");
const buildController = require("./resourceController");

module.exports = buildController(Vehicle, ["plate", "model", "capacity", "status"], {
  searchFields: ["plate", "model"]
});
