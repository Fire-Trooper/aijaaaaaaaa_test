import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const zoneId = searchParams.get("zoneId");

    try {
        const plots = await db.plot.findMany({
            where: {
                ...(projectId ? { projectId } : {}),
                ...(zoneId ? { zoneId } : {})
            },
            include: { project: true, zone: true },
            orderBy: [{ zoneId: 'asc' }, { plotName: 'asc' }] // เรียงตามโซนและชื่อแปลง
        });
        return NextResponse.json(plots);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch plots" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { plots, projectId, zoneId } = await req.json();

        const createdPlots = await db.$transaction(
            plots.map((p: any) => db.plot.create({
                data: {
                    plotName: p.plotName,
                    areaSqWa: parseFloat(p.areaSqWa.toString().replace(/,/g, '')),
                    projectId: projectId,
                    zoneId: zoneId || null, // บันทึกโซนลงไปด้วย
                    status: "ว่าง"
                }
            }))
        );

        return NextResponse.json({ success: true, count: createdPlots.length }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}