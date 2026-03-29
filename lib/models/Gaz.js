import mongoose from 'mongoose';

const gazSchema = new mongoose.Schema({
    designation: { type: String, required: true, trim: true },
    description: { type: String },
    categorie: { type: String }, // ex: Toxique, Inflammable, Gaz à effet de serre
    indiceReferentiel: { 
        // Stocke les seuils AQI pour ce gaz spécifique
        bon: { type: Number },     // ex: < 50 ppm
        modere: { type: Number },  // ex: 51-100 ppm
        dangereux: { type: Number } // ex: > 100 ppm
    }
}, { timestamps: true });

export default mongoose.models.Gaz || mongoose.model('Gaz', gazSchema);