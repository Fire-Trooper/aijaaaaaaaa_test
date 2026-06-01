import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const contracts = await db.contract.findMany({
            include: { customer: true, deeds: true }, // เปลี่ยนจาก deed เป็น deeds
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(contracts);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch contracts" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const id = new URL(req.url).searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        await db.contract.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}