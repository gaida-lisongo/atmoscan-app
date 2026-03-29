// lib/models/Source.js
import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema({
    designation: { 
        type: String, 
        required: true, 
        trim: true 
    },
    categorie: { 
        type: String, 
        enum: ['DDD', 'DEHPE'], // Vos catégories spécifiques
        required: true 
    },
    // Une source peut émettre plusieurs types de gaz
    gaz: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Gaz' 
    }]
}, { timestamps: true });

export default mongoose.models.Source || mongoose.model('Source', sourceSchema);