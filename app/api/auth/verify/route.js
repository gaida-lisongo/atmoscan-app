import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import { User, Privilege } from "@/lib/models/User";

// Force dynamic pour éviter les erreurs de prerendering
export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ 
                success: false, 
                message: "Token manquant" 
            }, { status: 401 });
        }

        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        await connectDB();

        // Récupérer l'utilisateur avec ses privilèges
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "Utilisateur non trouvé" 
            }, { status: 401 });
        }

        // Récupérer le privilège actuel
        const privilege = await Privilege.findById(decoded.privilegeId)
            .populate('entreprises', 'designation');

        if (!privilege) {
            return NextResponse.json({ 
                success: false, 
                message: "Privilège non trouvé" 
            }, { status: 401 });
        }

        // Préparer les données utilisateur
        const userData = {
            _id: user._id,
            username: user.username,
            matricule: user.matricule,
            email: user.email,
            telephone: user.telephone,
            fonction: user.fonction,
            departement: user.departement,
            sexe: user.sexe,
            nationalite: user.nationalite,
            date_naissance: user.date_naissance,
            lieu_naissance: user.lieu_naissance,
            adresse: user.adresse,
            currentPrivilege: {
                _id: privilege._id,
                designation: privilege.designation,
                entreprises: privilege.entreprises
            }
        };

        return NextResponse.json({
            success: true,
            user: userData
        });

    } catch (error) {
        console.error("Erreur de vérification:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Token invalide" 
        }, { status: 401 });
    }
}