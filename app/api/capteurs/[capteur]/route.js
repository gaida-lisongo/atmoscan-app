import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Capteur, Notification } from "@/lib/models/Capteur";
import Mesure from "@/lib/models/Mesure";
import mongoose from "mongoose";

export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        const id = params.capteur;
        const body = await request.json();

        if (!id) return NextResponse.json({ success: false, message: "ID manquant" }, { status: 400 });
        
        const { sourceId, entrepriseId, data } = body;

        if (!sourceId || !entrepriseId || !data) {
            return NextResponse.json({ success: false, message: "Données incomplètes" }, { status: 400 });
        }

        let capteur = await Capteur.findOne({ uuid: id }).select("_id uuid designation");

        if (!capteur && mongoose.Types.ObjectId.isValid(id)) {
            capteur = await Capteur.findById(id).select("_id uuid designation");
        }

        if (!capteur) {
            return NextResponse.json({ success: false, message: "Capteur non trouvé" }, { status: 404 });
        }

        const mesuresId = [];

        // Créer une nouvelle mesure
        for (const item of data) {
            const newMesure = await Mesure.create({
                sourceId,
                entrepriseId,
                ppm: item.map(gazData => ({
                    gaz: gazData.gaz,
                    value: gazData.value,
                    timestamp: gazData.timestamp || Date.now()
                }))
            });

            if (newMesure) {
                mesuresId.push(newMesure._id);
            }
        }

        console.log("Mesures créées avec succès:", mesuresId);

        // Créer une notification liée à ce capteur
        const notification = await Notification.create({
            capteurId: capteur._id,
            message: `Nouvelles mesures enregistrées pour le capteur ${capteur.designation || capteur.uuid || id}`,
            mesures: mesuresId
        });

        console.log("Notification créée avec succès:", notification);

        return NextResponse.json({ success: true, data: { notification, mesuresId } }, { status: 201 });
        
    } catch (error) {
        console.error("Erreur lors de la création des mesures ou de la notification:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function GET(request){
    try {
        console.log("Call server From ESP32");
        return NextResponse.json({ success: true, message: "ESP32 connecté avec succès" }, { status: 200 });
    } catch (error) {
        console.error("Erreur lors de la création des mesures ou de la notification:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}