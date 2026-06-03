const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Paciente é obrigatório"]
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: [true, "Motorista é obrigatório"]
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Veículo é obrigatório"]
    },
    origin: {
      type: String,
      required: [true, "Origem é obrigatória"],
      trim: true
    },
    destination: {
      type: String,
      required: [true, "Destino é obrigatório"],
      trim: true
    },
    date: {
      type: Date,
      required: [true, "Data é obrigatória"]
    },
    status: {
      type: String,
      enum: ["agendado", "em_andamento", "concluido", "cancelado"],
      default: "agendado"
    },
    notes: {
      type: String,
      trim: true,
      default: ""
    },
    // Quilometragem total da viagem, usada nos relatórios gerenciais.
    km: {
      type: Number,
      min: [0, "A quilometragem não pode ser negativa"],
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
