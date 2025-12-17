import mongoose from "mongoose";

const entrepriseSchema = new mongoose.Schema({
    designation: {
        type: String,
        require: true,
        trim: true
    },
    adresse: { type: String },
    telephone: { type: String} ,
    email:{ type: String, lowercase: true, trim: true },
    categorie: { type: String },
    description: { type: String }
}, { timestamps: true });

const Entreprise = mongoose.models.Entreprise || mongoose.model(
    'Entreprise',
    entrepriseSchema
);

export default Entreprise;