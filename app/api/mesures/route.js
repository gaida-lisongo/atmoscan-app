import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Mesure from "@/lib/models/Mesure";
import "@/lib/models/Source";
import "@/lib/models/Entreprise";
import "@/lib/models/Gaz";

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const sourceId = searchParams.get("sourceId");
        const entrepriseId = searchParams.get("entrepriseId");

        // Recherche spécifique par ID
        if (id) {
            const mesure = await Mesure.findById(id)
                .populate('sourceId')
                .populate('entrepriseId')
                .populate('ppm.gaz');
            if (!mesure) return NextResponse.json({ success: false, message: "Mesure non trouvée" }, { status: 404 });
            return NextResponse.json({ success: true, data: mesure });
        }

        // Filtres optionnels (ex: toutes les mesures d'une entreprise ou d'une source)
        let query = {};
        if (sourceId) query.sourceId = sourceId;
        if (entrepriseId) query.entrepriseId = entrepriseId;

        const mesures = await Mesure.find(query)
            .populate('sourceId')
            .populate('entrepriseId')
            .populate('ppm.gaz')
            .sort({ createdAt: -1 }); // Les plus récentes en premier

        return NextResponse.json({ success: true, data: mesures });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        console.log("Données reçues pour création de mesure:", body);
        
        /* Format attendu du body :
           {
             "sourceId": "ID_SOURCE",
             "entrepriseId": "ID_ENTREPRISE",
             "ppm": [
                { "gaz": "ID_GAZ_1", "value": 450 },
                { "gaz": "ID_GAZ_2", "value": 12 }
             ]
           }
        */

        const ppm = body.ppm || [];
        
        if (!body.sourceId || !body.entrepriseId) {
            return NextResponse.json({ success: false, message: "sourceId et entrepriseId sont requis" }, { status: 400 });
        }

        const fixedValuesPpm = ppm.map(item => ({
            gaz: item.gaz,
            value: item.value !== undefined ? item.value /1000 : null
        }));

        body.ppm = fixedValuesPpm;      
        
        const nouvelleMesure = await Mesure.create(body);
        
        // On repopulate pour renvoyer un objet complet au client
        const populatedMesure = await Mesure.findById(nouvelleMesure._id)
            .populate('sourceId')
            .populate('ppm.gaz');

        return NextResponse.json({ success: true, data: populatedMesure }, { status: 201 });
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

        if (!id) return NextResponse.json({ success: false, message: "ID manquant" }, { status: 400 });

        const mesureUpdate = await Mesure.findByIdAndUpdate(id, body, { 
            new: true, 
            runValidators: true 
        }).populate('sourceId').populate('ppm.gaz');

        if (!mesureUpdate) return NextResponse.json({ success: false, message: "Mesure non trouvée" }, { status: 404 });
        return NextResponse.json({ success: true, data: mesureUpdate });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ success: false, message: "ID manquant" }, { status: 400 });

        const deleted = await Mesure.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ success: false, message: "Mesure non trouvée" }, { status: 404 });

        return NextResponse.json({ success: true, message: "Mesure supprimée avec succès" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
