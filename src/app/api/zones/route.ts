import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const newZone = await db.zone.create({
            data: { name: body.name, projectId: body.projectId }
        });
        return NextResponse.json(newZone, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถสร้างโซนได้" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const updated = await db.zone.update({
            where: { id: body.id },
            data: { name: body.name }
        });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถแก้ไขโซนได้" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const id = new URL(req.url).searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ระบุ ID ไม่ถูกต้อง" }, { status: 400 });

        await db.zone.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถลบโซนได้ (อาจมีโฉนดผูกอยู่)" }, { status: 500 });
    }
}