import mongoose from "mongoose";

const co2eSchema = new mongoose.Schema({
    gaz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gaz',
        required: true
    },
    facteurEmission: {
        type: Number,
        required: true
    },
    productRechauffement: {
        type: Number,
        required: true
    }
});

const Co2e = mongoose.models.Co2e || mongoose.model(
    'Co2e',
    co2eSchema
);

export default Co2e;