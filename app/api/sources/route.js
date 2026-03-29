import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Source from "@/lib/models/Source";

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (id) {
            // .populate('gaz') permet de récupérer les détails des gaz liés
            const source = await Source.findById(id).populate('gaz');
            if (!source) return NextResponse.json({ success: false, message: "Source non trouvée" }, { status: 404 });
            return NextResponse.json({ success: true, data: source });
        }

        const sources = await Source.find({}).populate('gaz');
        return NextResponse.json({ success: true, data: sources });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json(); // Attend { designation, categorie, gaz: [id1, id2] }
        const nouvelleSource = await Source.create(body);
        return NextResponse.json({ success: true, data: nouvelleSource }, { status: 201 });
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

        const sourceUpdate = await Source.findByIdAndUpdate(id, body, { 
            new: true, 
            runValidators: true 
        });

        if (!sourceUpdate) return NextResponse.json({ success: false, message: "Source non trouvée" }, { status: 404 });
        return NextResponse.json({ success: true, data: sourceUpdate });
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

        const sourceDeleted = await Source.findByIdAndDelete(id);
        if (!sourceDeleted) return NextResponse.json({ success: false, message: "Source non trouvée" }, { status: 404 });

        return NextResponse.json({ success: true, message: "Source supprimée" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}