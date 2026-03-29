import mongoose from 'mongoose';

const mesureSchema = new mongoose.Schema({
    sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Source', required: true },
    entrepriseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise', required: true },
    ppm: [{ 
        // Stocke les seuils AQI pour ce gaz spécifique
        gaz: { type: mongoose.Schema.Types.ObjectId, ref: 'Gaz', required: true },     // ex: < 50 ppm
        timestamp: { type: Date, default: Date.now },
        value: { type: Number } // ex: > 100 ppm
    }],
    
}, { timestamps: true });

export default mongoose.models.Mesure || mongoose.model('Mesure', mesureSchema);