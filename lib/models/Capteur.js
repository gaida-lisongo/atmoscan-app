import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const capteurSchema = new mongoose.Schema({
    designation: {
        type: String,
        required: true,
        trim: true
    },
    uuid: {
        type: String,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    entrepriseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise', required: true },
}, { timestamps: true });

// Static method to generate UUID
capteurSchema.statics.generateUUID = function() {
    return uuidv4();
};

const notificationSchema = new mongoose.Schema({
    capteurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Capteur', required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    mesures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mesure' }]
}, { timestamps: true });

const Capteur = mongoose.models.Capteur || mongoose.model('Capteur', capteurSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

export { Capteur, Notification };