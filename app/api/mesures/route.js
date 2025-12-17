import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Mesure from "@/lib/models/Mesure";

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const entrepriseId = searchParams.get("entrepriseId");
        const gazId = searchParams.get("gazId");

        let filtre = {};
        if (entrepriseId) filtre.entrepriseId = entrepriseId;
        if (gazId) filtre.gazId = gazId;

        // Récupère les 100 dernières mesures avec les infos du gaz
        const mesures = await Mesure.find(filtre)
            .populate('gazId', 'designation')
            .sort({ timestamp: -1 })
            .limit(100);

        return NextResponse.json({ success: true, data: mesures });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json(); // Attend { gazId, entrepriseId, ppm }

        const nouvelleMesure = await Mesure.create(body);
        
        return NextResponse.json({ 
            success: true, 
            message: "Mesure enregistrée", 
            data: nouvelleMesure 
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
export async function PUT(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const body = await request.json();

        if (!id) return NextResponse.json({ success: false, message: "ID de mesure manquant" }, { status: 400 });

        const mesureModifiee = await Mesure.findByIdAndUpdate(id, body, { new: true });

        if (!mesureModifiee) return NextResponse.json({ success: false, message: "Mesure non trouvée" }, { status: 404 });
        return NextResponse.json({ success: true, data: mesureModifiee });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
export async function DELETE(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        await Mesure.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: "Mesure supprimée" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}