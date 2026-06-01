import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const projects = await db.project.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                bank: true,
                zones: { include: { deeds: { include: { zones: true } } } }
            }
        });
        return NextResponse.json(projects);
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลโครงการได้" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const newProject = await db.project.create({
            data: {
                name: body.name,
                utilityYear: body.utilityYear,
                bankId: body.bankId,
                entityType: body.entityType,
                transferDate: body.transferDate ? new Date(body.transferDate) : null // เพิ่มวันโอน
            }
        });
        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถสร้างโครงการได้" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const updated = await db.project.update({
            where: { id: body.id },
            data: {
                name: body.name,
                utilityYear: body.utilityYear,
                bankId: body.bankId,
                entityType: body.entityType,
                transferDate: body.transferDate ? new Date(body.transferDate) : null // เพิ่มวันโอน
            }
        });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถแก้ไขข้อมูลได้" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const id = new URL(req.url).searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ระบุ ID ไม่ถูกต้อง" }, { status: 400 });

        await db.project.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถลบได้ (อาจมีข้อมูลผูกอยู่)" }, { status: 500 });
    }
}