import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Privilege } from "@/models/User"; 

export async function GET(req) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        
        // Si userId est fourni, on filtre, sinon on récupère tout
        const query = userId ? { userId } : {};
        const privileges = await Privilege.find(query)
            .populate('userId', 'username matricule')
            .populate('entreprises', 'designation');
            
        return NextResponse.json({ success: true, data: privileges });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(req) {
    await connectDB();
    try {
        const body = await req.json();
        // Note: En production, pense à hasher le password ici (ex: avec bcrypt)
        const privilege = await Privilege.create(body);
        return NextResponse.json({ success: true, data: privilege }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function PUT(req) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const body = await req.json();
        
        const privilege = await Privilege.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json({ success: true, data: privilege });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}