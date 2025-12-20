import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User, Privilege } from "@/lib/models/User";
import "@/lib/models/Entreprise"; // Import nécessaire pour enregistrer le modèle Entreprise
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
    await connectDB();
    
    try {
        const { matricule, designation, password } = await req.json();

        if (!matricule || !designation || !password) {
            return NextResponse.json({ 
                success: false, 
                message: "Tous les champs sont requis" 
            }, { status: 400 });
        }

        // 1. Trouver l'utilisateur par matricule
        const user = await User.findOne({ matricule });
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "Matricule invalide" 
            }, { status: 401 });
        }

        // console.log('Utilisateur trouvé:', user);
        const privilegesData = [];

        // 2. Trouver le privilège correspondant
        const privileges = await Privilege.find({ 
            userId: user._id, 
            designation 
        }).populate('entreprises').lean(); // On peuple simplement, sans filtrer les champs pour l'instant

        if (!privileges || privileges.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: "Privilèges non trouvés pour cet utilisateur" 
            }, { status: 401 });
        }

        privileges.forEach(privilege => {
            if (password == privilege.password) {
                privilegesData.push(...privilege?.entreprises);
            };
        });

        // 3. Vérifier le mot de passe
        if (privilegesData.length === 0) {
            return NextResponse.json({ 
                success: false, 
                message: "Mot de passe incorrect" 
            }, { status: 401 });
        }

        // 4. Créer le token JWT
        const token = jwt.sign(
            { 
                userId: user._id,
                matricule: user.matricule,
                privileges: privilegesData.map(p => p._id).join(','),
                designation: privilegesData.map(p => p.designation).join(',')
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // 5. Préparer les données utilisateur (sans mot de passe)
        const userData = {
            _id: user._id,
            photoPath: user.photoPath,
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
                designation,
                entreprises: privilegesData
            }
        };

        return NextResponse.json({
            success: true,
            user: userData,
            token,
            message: "Connexion réussie"
        });

    } catch (error) {
        console.error("Erreur de connexion:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Erreur interne du serveur" 
        }, { status: 500 });
    }
}