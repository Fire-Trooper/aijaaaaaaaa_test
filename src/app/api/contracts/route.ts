import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateWordContract } from "@/lib/documentMaker";
import { generatePdfReceipt } from "@/lib/pdfMaker";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";
import { bahttext } from "bahttext";

dayjs.extend(buddhistEra);
dayjs.locale("th");

const parseNum = (val: any) => Number(String(val).replace(/,/g, "")) || 0;
const formatMoneyWithBaht = (amount: number) => {
    const numStr = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${numStr} บาท (${bahttext(amount)})`;
};
const formatIdCard = (val: string) => {
    if (!val) return ""; const v = val.replace(/\D/g, '').slice(0, 13);
    if (v.length === 13) return `${v.slice(0, 1)}-${v.slice(1, 5)}-${v.slice(5, 10)}-${v.slice(10, 12)}-${v.slice(12)}`;
    return val;
};

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const dataStr = formData.get("data") as string;
        const body = JSON.parse(dataStr);

        console.log("Received contract data:", body);

        let customerId = body.customerId;

        const project = await db.project.findUnique({ where: { id: body.projectId }, include: { bank: true } });
        let customerData;
        // 🔥 ดึงข้อมูลลูกค้ามาเก็บไว้ตัวแปรให้ครบ ไม่ว่าจะเป็นใหม่หรือเก่า
        if (body.isNewCustomer || !customerId) {
            customerData = await db.customer.create({
                data: {
                    isCorporate: body.entityType === "CORPORATE", fullName: body.fullName, idCard: body.idCard,
                    birthDate: body.birthDate ? new Date(body.birthDate) : null, // ใช้วันเกิด
                    phone: body.phone, secondaryPhone: body.secondaryPhone,
                    addressNumber: body.addressNumber, moo: body.moo, subDistrict: body.subDistrictCust, district: body.districtCust, province: body.provinceCust,
                }
            });
            customerId = customerData.id;
        } else {
            customerData = await db.customer.findUnique({ where: { id: customerId } });
        }


        // ดึงโฉนดทั้งหมดที่เลือกมาเพื่อเอาเลขไปโชว์ในสัญญา
        const selectedDeeds = await db.deed.findMany({ where: { id: { in: body.deedIds } } });
        const allDeedNumbers = selectedDeeds.map(d => d.deedNumber).join(", ");
        const primaryDeed = selectedDeeds[0];

        // คำนวณอายุจากวันเกิด
        const age = customerData?.birthDate ? dayjs().diff(dayjs(customerData.birthDate), 'year') : "-";
        const phoneFull = [customerData?.phone, customerData?.secondaryPhone].filter(Boolean).join(", ");

        const transfers = body.transfers || [];
        const transferCreates = [];

        for (let i = 0; i < transfers.length; i++) {
            const file = formData.get(`slip_${i}`) as File | null;
            let slipUrl = null;
            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const uploadDir = path.join(process.cwd(), "public/documents/slips");
                if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
                const fileName = `Slip_${Date.now()}_${i}.png`;
                await writeFile(path.join(uploadDir, fileName), buffer);
                slipUrl = `/documents/slips/${fileName}`;
            }
            transferCreates.push({ bankId: transfers[i].bankId, amount: parseNum(transfers[i].amount), slipUrl: slipUrl });
        }

        const contract = await db.contract.create({
            data: {
                contractDate: new Date(body.contractDate), contractType: body.contractType, entityType: body.entityType,
                customerId: customerId,
                deeds: { connect: body.deedIds.map((id: string) => ({ id })) }, // ลิงก์หลายโฉนด
                areaRai: parseNum(body.areaRai), areaNgan: parseNum(body.areaNgan), areaWa: parseNum(body.areaWa),
                totalPrice: parseNum(body.totalPrice), deposit: parseNum(body.deposit), remainingPrice: parseNum(body.remainingPrice),
                installmentsCount: body.contractType === 'INSTALLMENT' ? parseInt(body.installmentsCount) : null,
                installmentAmount: body.contractType === 'INSTALLMENT' ? parseNum(body.installmentAmount) : null,
                installmentStartDate: body.installmentStartDate ? new Date(body.installmentStartDate) : null,
                installmentPayDay: body.installmentPayDay,
                contractEndDate: body.contractEndDate ? new Date(body.contractEndDate) : null,
                contractEndYear: body.contractEndDate ? dayjs(body.contractEndDate).format('BBBB') : null,
                cashReceive: parseNum(body.cashReceive),
                transferReceive: transferCreates.reduce((sum, t) => sum + t.amount, 0),
                paymentTransfers: { create: transferCreates }
            }
        });

        const templateTypeStr = `CONTRACT_${body.contractType}_${body.entityType}`;
        const wordTemplate = await db.template.findFirst({ where: { type: templateTypeStr } });
        const pdfTemplate = await db.template.findFirst({ where: { type: "RECEIPT_FORM" } });

        let contractFilePath = ""; let receiptFilePath = "";
        const contractDateObj = dayjs(body.contractDate);


        // =========================================================
        // ส่วนที่ 1: Logic เตรียมข้อมูลและสร้าง Word
        // =========================================================

        if (wordTemplate) {
            const wordData = {
                date_contract: dayjs(body.contractDate).format('วันที่ D เดือน MMMM พ.ศ.BBBB'),
                name_surname: customerData?.fullName || "",
                th_no: customerData?.idCard || "",
                age: age.toString(),
                house_no: customerData?.addressNumber || "-",
                moo: customerData?.moo || "-",
                tumbon: customerData?.subDistrict || "",
                aumphoe: customerData?.district || "",
                province: customerData?.province || "",
                phone_no: phoneFull,

                deed_no: allDeedNumbers,
                land_no: primaryDeed?.landNumber || "", utm_no: primaryDeed?.utmNo || "", survey_no: primaryDeed?.surveyPage || "",
                tumbon_deed: primaryDeed?.subDistrict || "", amphor_deed: primaryDeed?.district || "", province_deed: primaryDeed?.province || "",

                deed_amout: `${body.areaRai || 0} ไร่ ${body.areaNgan || 0} งาน ${body.areaWa || 0} ตารางวา`, // แก้เป็นจำนวนพื้นที่

                total_price: formatMoneyWithBaht(parseNum(body.totalPrice)),
                earnest_money: formatMoneyWithBaht(parseNum(body.deposit)),
                overdue_money: formatMoneyWithBaht(parseNum(body.remainingPrice)),

                exp_date: body.contractEndDate ? dayjs(body.contractEndDate).format('วันที่ D เดือน MMMM พ.ศ.BBBB') : "",
                year_exp: body.contractEndDate ? dayjs(body.contractEndDate).format('BBBB') : "",

                utilitie_year: project?.utilityYear || "", mont_amount: body.installmentsCount || "",
                per_month: body.installmentAmount ? formatMoneyWithBaht(parseNum(body.installmentAmount)) : "",
                date_start_earn: body.installmentStartDate ? dayjs(body.installmentStartDate).format('วันที่ D เดือน MMMM พ.ศ.BBBB') : "",
                every_Date: body.installmentPayDay || "", month_exp: body.installmentsCount || "",
            };

            const safeName = `${project?.name}_แปลง ${body.plotName}`.replace(/[\/\\?%*:|"<>]/g, '_');



            // 🔴 LOG: ตรวจสอบข้อมูลก่อนส่งเข้า Word
            console.log("\n\n====== 📝 DATA TO WORD ======");
            console.log(JSON.stringify(wordData, null, 2));
            console.log("--- ประเภทข้อมูล (Types) ---");
            Object.entries(wordData).forEach(([key, value]) => {
                console.log(`${key}: ${typeof value} (ค่า: ${value})`);
            });
            console.log("===============================\n");

            const fileName = `สัญญา ${dayjs(body.contractDate).format('YYYY-MM-DD')}_${safeName}.docx`;
            contractFilePath = await generateWordContract(wordTemplate.filePath, wordData, fileName);
        }

        if (pdfTemplate) {
            // ดึง BankName ของบัญชีแรกมาโชว์ (ถ้าโอนเข้าหลายบัญชี ใช้คำว่า หลายบัญชี)
            let bankNameShow = project?.bank?.bankName || "";
            if (transferCreates.length > 1) bankNameShow = "โอนเข้าหลายบัญชี";
            else if (transferCreates.length === 1) {
                const tBank = await db.bank.findUnique({ where: { id: transferCreates[0].bankId } });
                bankNameShow = tBank?.bankName || bankNameShow;
            }

            const pdfData = {
                customerName: customerData?.fullName || "",
                customerAddress: `บ้านเลขที่ ${customerData?.addressNumber || '-'} ม.${customerData?.moo || '-'} ต.${customerData?.subDistrict} อ.${customerData?.district} จ.${customerData?.province}`,
                customerThaiNo: formatIdCard(customerData?.idCard || ""),
                receiptDate: dayjs(body.contractDate).format('DD/MM/BBBB'), // เปลี่ยน Format วันที่
                itemName: `โครงการ${project?.name || ''}\nแปลง ${body.plotName} : ${body.areaRai || 0} ไร่ ${body.areaNgan || 0} งาน ${body.areaWa || 0} ตร.ว.\nราคาที่ดิน = ${parseNum(body.totalPrice).toLocaleString()} บาท\nมัดจำ = ${parseNum(body.deposit).toLocaleString()} บาท`,
                amount: parseNum(body.deposit).toLocaleString('en-US', { minimumFractionDigits: 2 }),
                bahtText: bahttext(parseNum(body.deposit)),
                cashReceive: parseNum(body.cashReceive),
                transferReceive: transferCreates.reduce((sum, t) => sum + t.amount, 0), bankName: bankNameShow,
                note: `ลูกค้ามียอดค้างชำระ: ${parseNum(body.remainingPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })} บาท`,
            };

            // 🔴 LOG: ตรวจสอบข้อมูลก่อนส่งเข้า PDF
            console.log("\n\n====== 📄 DATA TO PDF ======");
            console.log(JSON.stringify(pdfData, null, 2));
            console.log("--- ประเภทข้อมูล (Types) ---");
            Object.entries(pdfData).forEach(([key, value]) => {
                console.log(`${key}: ${typeof value} (ค่า: ${value})`);
            });
            console.log("==============================\n");

            const safeName = `${project?.name}_แปลง ${body.plotName}`.replace(/[\/\\?%*:|"<>]/g, '_');
            const fileName = `rec ${dayjs(body.contractDate).format('YYYY-MM-DD')}_${safeName}.pdf`;
            receiptFilePath = await generatePdfReceipt(pdfTemplate.filePath, pdfData, fileName);
        }

        await db.contract.update({ where: { id: contract.id }, data: { contractFilePath, receiptFilePath } });
        // อัปเดตสถานะ Plot เป็น "ทำสัญญา"
        await db.plot.updateMany({
            where: { id: { in: body.plotIds } },
            data: { status: "ทำสัญญา" }
        });
        return NextResponse.json({ success: true, contractId: contract.id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการบันทึกสัญญา" }, { status: 500 });
    }
}