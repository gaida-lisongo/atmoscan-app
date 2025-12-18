import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    matricule: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    photoPath: { type: String },
    sexe: { type: String },
    nationalite: { type: String },
    date_naissance: { type: Date },
    lieu_naissance: { type: String },
    adresse: { type: String },
    telephone: { type: String },
    email: { type: String, lowercase: true, trim: true },
    fonction: { type: String },
    departement: { type: String },
}, { timestamps: true });

const privilegeSchema = new mongoose.Schema({
    designation: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    entreprises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise' }]
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model(
    'User',
    userSchema
);

const Privilege = mongoose.models.Privilege || mongoose.model(
    'Privilege',
    privilegeSchema
);

export { User, Privilege };
