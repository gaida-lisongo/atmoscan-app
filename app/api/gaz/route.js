import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Gaz from "@/lib/models/Gaz";

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (id) {
            const gaz = await Gaz.findById(id);
            if (!gaz) return NextResponse.json({ success: false, message: "Gaz non trouvé" }, { status: 404 });
            return NextResponse.json({ success: true, data: gaz });
        }
        const tousLesGaz = await Gaz.find({});
        return NextResponse.json({ success: true, data: tousLesGaz });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const nouveauGaz = await Gaz.create(body);
        return NextResponse.json({ success: true, data: nouveauGaz }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

// --- AJOUT : UPDATE GAZ ---
export async function PUT(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const body = await request.json();

        if (!id) return NextResponse.json({ success: false, message: "ID manquant" }, { status: 400 });

        const gazMisAJour = await Gaz.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        
        if (!gazMisAJour) return NextResponse.json({ success: false, message: "Gaz non trouvé" }, { status: 404 });
        return NextResponse.json({ success: true, data: gazMisAJour });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

// --- AJOUT : DELETE GAZ ---
export async function DELETE(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ success: false, message: "ID manquant" }, { status: 400 });

        const gazSupprime = await Gaz.findByIdAndDelete(id);
        if (!gazSupprime) return NextResponse.json({ success: false, message: "Gaz non trouvé" }, { status: 404 });

        return NextResponse.json({ success: true, message: "Gaz supprimé du référentiel" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}