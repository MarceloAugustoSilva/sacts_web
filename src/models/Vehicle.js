const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    plate: {
      type: String,
      required: [true, "Placa é obrigatória"],
      trim: true,
      uppercase: true,
      unique: true,
      minlength: [7, "Placa inválida"]
    },
    model: {
      type: String,
      required: [true, "Modelo é obrigatório"],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, "Capacidade é obrigatória"],
      min: [1, "Capacidade deve ser maior que zero"]
    },
    status: {
      type: String,
      enum: ["disponivel", "manutencao", "inativo"],
      default: "disponivel"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);
