import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Capteur } from "@/lib/models/Capteur";

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const entrepriseId = searchParams.get("entrepriseId");
        const type = searchParams.get("type");

        let query = {};

        if (id) {
            query._id = id;
        }
        if (entrepriseId) {
            query.entrepriseId = entrepriseId;
        }
        if (type) {
            query.type = type;
        }

        const capteurs = await Capteur.find(query).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: capteurs });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        
        // Générer UUID avec la méthode statique
        body.uuid = Capteur.generateUUID();
        
        const nouveauCapteur = await Capteur.create(body);
        return NextResponse.json({ success: true, data: nouveauCapteur }, { status: 201 });
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
        const capteurUpdate = await Capteur.findByIdAndUpdate(id, body, { 
            new: true, 
            runValidators: true 
        });
        return NextResponse.json({ success: true, data: capteurUpdate });
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

        const capteurDeleted = await Capteur.findByIdAndDelete(id);
        if (!capteurDeleted) return NextResponse.json({ success: false, message: "Capteur non trouvé" }, { status: 404 });  
        return NextResponse.json({ success: true, message: "Capteur supprimé" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}