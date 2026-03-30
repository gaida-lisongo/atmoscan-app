import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Co2e from '@/lib/models/co2e';

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const co2e = await Co2e.findById(id).populate('gaz', 'designation categorie');
            if (!co2e) {
                return NextResponse.json(
                    { success: false, message: 'Coefficient CO2e non trouvé' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ success: true, data: co2e });
        }

        const items = await Co2e.find({}).populate('gaz', 'designation categorie');
        return NextResponse.json({ success: true, data: items });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const created = await Co2e.create(body);
        const populated = await Co2e.findById(created._id).populate('gaz', 'designation categorie');
        return NextResponse.json({ success: true, data: populated }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function PUT(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const body = await request.json();

        if (!id) {
            return NextResponse.json({ success: false, message: 'ID manquant' }, { status: 400 });
        }

        const updated = await Co2e.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true
        }).populate('gaz', 'designation categorie');

        if (!updated) {
            return NextResponse.json(
                { success: false, message: 'Coefficient CO2e non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: 'ID manquant' }, { status: 400 });
        }

        const deleted = await Co2e.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json(
                { success: false, message: 'Coefficient CO2e non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: 'Coefficient CO2e supprimé' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
