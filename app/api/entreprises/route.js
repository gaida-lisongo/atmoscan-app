import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Entreprise from "@/lib/models/Entreprise";

// --- GET : Fetch All ou Fetch by ID via Query String ---
export async function GET(request) {
    try {
        await dbConnect();
        
        // Extraction de l'ID depuis l'URL (ex: ?id=...)
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (id) {
            const entreprise = await Entreprise.findById(id).lean();
            if (!entreprise) {
                return NextResponse.json({ success: false, message: "Entreprise non trouvée" }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: entreprise }, { status: 200 });
        }

        const entreprises = await Entreprise.find({}).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, count: entreprises.length, data: entreprises }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// --- POST : Créer une nouvelle entreprise ---
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        const nouvelleEntreprise = await Entreprise.create(body);
        
        return NextResponse.json({ 
            success: true, 
            message: "Entreprise créée avec succès", 
            data: nouvelleEntreprise 
        }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

// --- PUT : Mettre à jour (nécessite un ID en query string) ---
export async function PUT(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const body = await request.json();

        if (!id) {
            return NextResponse.json({ success: false, message: "ID manquant dans la requête" }, { status: 400 });
        }

        const entrepriseUpdate = await Entreprise.findByIdAndUpdate(id, body, {
            new: true, // Retourne l'objet modifié
            runValidators: true // Force la validation du schéma
        });

        if (!entrepriseUpdate) {
            return NextResponse.json({ success: false, message: "Entreprise non trouvée" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: entrepriseUpdate }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

// --- DELETE : Supprimer (nécessite un ID en query string) ---
export async function DELETE(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ success: false, message: "ID manquant" }, { status: 400 });
        }

        const deletedEntreprise = await Entreprise.findByIdAndDelete(id);

        if (!deletedEntreprise) {
            return NextResponse.json({ success: false, message: "Entreprise non trouvée" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Entreprise supprimée" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}