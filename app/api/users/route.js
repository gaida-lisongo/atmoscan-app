import { NextResponse } from "next/server";
import connectDB from "@/lib/db"; // Ajuste le chemin selon ton projet
import { User } from "@/models/User"; 

export async function GET(req) {
    await connectDB();
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(req) {
    await connectDB();
    try {
        const body = await req.json();
        const user = await User.create(body);
        return NextResponse.json({ success: true, data: user }, { status: 201 });
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
        const user = await User.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json({ success: true, data: user });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(req) {
    await connectDB();
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        await User.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: "Utilisateur supprimé" });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}