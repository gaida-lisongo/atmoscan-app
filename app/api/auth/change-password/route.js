import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Privilege } from "@/lib/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
    await connectDB();
    
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

        const { currentPassword, newPassword } = await req.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ 
                success: false, 
                message: "Mot de passe actuel et nouveau requis" 
            }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ 
                success: false, 
                message: "Le nouveau mot de passe doit contenir au moins 6 caractères" 
            }, { status: 400 });
        }

        // Récupérer le privilège actuel
        const privilege = await Privilege.findById(decoded.privilegeId);
        if (!privilege) {
            return NextResponse.json({ 
                success: false, 
                message: "Privilège non trouvé" 
            }, { status: 404 });
        }

        // Vérifier le mot de passe actuel
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, privilege.password);
        if (!isCurrentPasswordValid) {
            return NextResponse.json({ 
                success: false, 
                message: "Mot de passe actuel incorrect" 
            }, { status: 401 });
        }

        // Hasher le nouveau mot de passe
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Mettre à jour le mot de passe
        await Privilege.findByIdAndUpdate(decoded.privilegeId, {
            password: hashedNewPassword
        });

        return NextResponse.json({
            success: true,
            message: "Mot de passe modifié avec succès"
        });

    } catch (error) {
        console.error("Erreur de modification du mot de passe:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Erreur interne du serveur" 
        }, { status: 500 });
    }
}