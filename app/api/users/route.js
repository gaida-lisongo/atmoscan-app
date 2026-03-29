import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User, Privilege } from "@/lib/models/User";
import Entreprise from "@/lib/models/Entreprise"; // Ensure this is imported for population
import bcrypt from "bcryptjs";

export async function GET(req) {
    await connectDB();
    try {
        const usersWithPrivileges = await User.aggregate([
            {
                $lookup: {
                    from: "privileges",
                    localField: "_id",
                    foreignField: "userId",
                    as: "privileges"
                }
            },
            {
                $unwind: {
                    path: "$privileges",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "entreprises",
                    localField: "privileges.entreprises",
                    foreignField: "_id",
                    as: "privileges.entreprises"
                }
            },
            {
                $group: {
                    _id: "$_id",
                    username: { $first: "$username" },
                    matricule: { $first: "$matricule" },
                    email: { $first: "$email" },
                    createdAt: { $first: "$createdAt" },
                    privileges: { $push: "$privileges" }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return NextResponse.json({ success: true, data: usersWithPrivileges });
    } catch (error) {
        console.error("GET Users Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(req) {
    await connectDB();
    try {
        const body = await req.json();
        const { 
            username, 
            matricule, 
            email, 
            password, 
            role, 
            entrepriseId,
            // Champs profil
            sexe,
            nationalite,
            date_naissance,
            lieu_naissance,
            adresse,
            telephone,
            photoPath,
            fonction,
            departement
        } = body;

        // 1. Create User avec tous les champs
        const userData = {
            username,
            matricule,
            email
        };
        
        // Ajouter les champs optionnels s'ils sont fournis
        if (sexe) userData.sexe = sexe;
        if (nationalite) userData.nationalite = nationalite;
        if (date_naissance) userData.date_naissance = date_naissance;
        if (lieu_naissance) userData.lieu_naissance = lieu_naissance;
        if (adresse) userData.adresse = adresse;
        if (telephone) userData.telephone = telephone;
        if (photoPath) userData.photoPath = photoPath;
        if (fonction) userData.fonction = fonction;
        if (departement) userData.departement = departement;

        const user = await User.create(userData);

        // On ne crée PAS de privilège à la création de l'utilisateur
        // Les privilèges sont gérés séparément via le modal des autorisations

        return NextResponse.json({ success: true, data: user }, { status: 201 });
    } catch (error) {
        console.error("POST User Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function PUT(req) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const body = await req.json();
        
        // Extraire tous les champs possibles
        const { 
            username, 
            matricule, 
            email, 
            password, 
            role, 
            entrepriseId,
            // Nouveaux champs pour le profil
            sexe,
            nationalite,
            date_naissance,
            lieu_naissance,
            adresse,
            telephone,
            photoPath,
            fonction,
            departement
        } = body;

        // Construire l'objet de mise à jour dynamiquement (seulement les champs fournis)
        const updateData = {};
        if (username !== undefined) updateData.username = username;
        if (matricule !== undefined) updateData.matricule = matricule;
        if (email !== undefined) updateData.email = email;
        if (sexe !== undefined) updateData.sexe = sexe;
        if (nationalite !== undefined) updateData.nationalite = nationalite;
        if (date_naissance !== undefined) updateData.date_naissance = date_naissance;
        if (lieu_naissance !== undefined) updateData.lieu_naissance = lieu_naissance;
        if (adresse !== undefined) updateData.adresse = adresse;
        if (telephone !== undefined) updateData.telephone = telephone;
        if (photoPath !== undefined) updateData.photoPath = photoPath;
        if (fonction !== undefined) updateData.fonction = fonction;
        if (departement !== undefined) updateData.departement = departement;

        // 1. Update User
        const user = await User.findByIdAndUpdate(id, updateData, { new: true });

        if (!user) {
            return NextResponse.json({ success: false, message: "Utilisateur non trouvé" }, { status: 404 });
        }

        // 2. Update Privilege (si role ou password fournis)
        let privilege = await Privilege.findOne({ userId: id });

        if (privilege) {
            if (role) privilege.designation = role;
            if (password) {
                privilege.password = await bcrypt.hash(password, 10);
            }
            
            if (entrepriseId) {
                privilege.entreprises = [entrepriseId];
            }
            
            await privilege.save();
        } else {
             if (password && role) {
                 const hashedPassword = await bcrypt.hash(password, 10);
                 await Privilege.create({
                     designation: role,
                     password: hashedPassword,
                     userId: id,
                     entreprises: entrepriseId ? [entrepriseId] : []
                 });
             }
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        console.error("PUT User Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(req) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        await User.findByIdAndDelete(id);
        await Privilege.deleteMany({ userId: id });

        return NextResponse.json({ success: true, message: "Utilisateur supprimé" });
    } catch (error) {
        console.error("DELETE User Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}