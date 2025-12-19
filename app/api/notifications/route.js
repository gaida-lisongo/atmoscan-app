import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Notification } from "@/lib/models/Capteur";

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const capteurId = searchParams.get("capteurId");

        let query = {};

        if (id) {
            query._id = id;
        }
        if (capteurId) {
            query.capteurId = capteurId;
        }

        const notifications = await Notification.find(query).populate('capteurId').populate('capteurId.entrepriseId').populate('mesures').populate('mesures.sourceId').sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: notifications });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        
        const nouvelleNotification = await Notification.create(body);
        return NextResponse.json({ success: true, data: nouvelleNotification }, { status: 201 });
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
        const notificationUpdate = await Notification.findByIdAndUpdate(id, body, { 
            new: true, 
            runValidators: true 
        });
        return NextResponse.json({ success: true, data: notificationUpdate });
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

        const notificationDeleted = await Notification.findByIdAndDelete(id);
        if (!notificationDeleted) return NextResponse.json({ success: false, message: "Notification non trouvée" }, { status: 404 });  
        return NextResponse.json({ success: true, message: "Notification supprimée" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}