const Patient = require("../models/Patient");
const buildController = require("./resourceController");

module.exports = buildController(Patient, ["name", "sus", "phone", "city", "status"], {
  searchFields: ["name", "sus", "phone", "city"]
});
