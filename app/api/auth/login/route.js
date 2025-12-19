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

        console.log('Utilisateur trouvé:', user);

        // 2. Trouver le privilège correspondant
        const privilege = await Privilege.findOne({ 
            userId: user._id, 
            designation 
        }).populate('entreprises'); // On peuple simplement, sans filtrer les champs pour l'instant

        console.log('Privilège trouvé:', privilege);
        if (!privilege) {
            return NextResponse.json({ 
                success: false, 
                message: "Privilège non trouvé pour cet utilisateur" 
            }, { status: 401 });
        }

        // 3. Vérifier le mot de passe
        const isPasswordValid = password == privilege.password;
        console.log('Vérification du mot de passe:', isPasswordValid);
        if (!isPasswordValid) {
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
                privilegeId: privilege._id,
                designation: privilege.designation
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // 5. Préparer les données utilisateur (sans mot de passe)
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