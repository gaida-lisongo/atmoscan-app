import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        const userId = formData.get("userId");

        if (!file) {
            return NextResponse.json(
                { success: false, message: "Aucun fichier fourni" },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "ID utilisateur requis" },
                { status: 400 }
            );
        }

        // Vérifier le type de fichier
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, message: "Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WEBP." },
                { status: 400 }
            );
        }

        // Limiter la taille (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, message: "Fichier trop volumineux. Maximum 5MB." },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Générer le nom du fichier
        const timestamp = Date.now();
        const extension = file.name.split(".").pop();
        const fileName = `user_${userId}_${timestamp}.${extension}`;

        // Chemin du dossier avatar
        const avatarDir = path.join(process.cwd(), "public", "images", "avatar");
        
        // S'assurer que le dossier existe
        try {
            await mkdir(avatarDir, { recursive: true });
        } catch (e) {
            // Le dossier existe déjà
        }

        // Chemin complet du fichier
        const filePath = path.join(avatarDir, fileName);

        // Écrire le fichier
        await writeFile(filePath, buffer);

        // Mettre à jour l'utilisateur en base de données
        await connectDB();
        const photoPath = `/images/avatar/${fileName}`;
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { photoPath },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                photoPath,
                user: updatedUser
            },
            message: "Photo de profil mise à jour avec succès"
        });

    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json(
            { success: false, message: "Erreur lors de l'upload", error: error.message },
            { status: 500 }
        );
    }
}
