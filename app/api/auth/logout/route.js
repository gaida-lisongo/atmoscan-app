import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Pour une déconnexion simple côté serveur, on peut juste confirmer
        // Le vrai nettoyage se fait côté client (suppression du token)
        
        return NextResponse.json({
            success: true,
            message: "Déconnexion réussie"
        });

    } catch (error) {
        console.error("Erreur de déconnexion:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Erreur lors de la déconnexion" 
        }, { status: 500 });
    }
}