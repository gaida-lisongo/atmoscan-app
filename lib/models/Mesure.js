import mongoose from 'mongoose';

const mesureSchema = new mongoose.Schema({
    gazId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gaz', required: true },
    entrepriseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entreprise', required: true },
    ppm: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Mesure || mongoose.model('Mesure', mesureSchema);