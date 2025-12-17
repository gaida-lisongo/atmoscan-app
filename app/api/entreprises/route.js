import dbConnect from "@/lib/db";
import Entreprise from "@/lib/models/Entreprise";
import { NextResponse } from "next/server"; // Importez ceci

export async function GET(request) {
    try {
        await dbConnect();

        const entreprises = await Entreprise.find({}).lean();
        
        // Utiliser NextResponse.json() est plus simple
        return NextResponse.json({
            success: true,
            message: 'Data fetched successfully',
            data: entreprises
        }, { status: 200 });

    } catch (error) {
        console.error("Error trace", error);
        return NextResponse.json({
            success: false,
            message: 'An error occurred when trying to fetch data',
            error: error.message // Optionnel : pour aider au debug
        }, { status: 500 }); // Toujours mettre un status d'erreur (500)
    }
}