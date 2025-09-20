import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Volume tiers (en kg): 0–300, 301–500, 501–1000(1T), 1001–3000(3T), 3001–5000(5T), 5001–10000(10T), 10001–20000(20T), 20001–30000(30T)
    const tiersData = [
        { label: "≤300 kg", minKg: 0, maxKg: 300, order: 1 },
        { label: "301–500 kg", minKg: 301, maxKg: 500, order: 2 },
        { label: "501 kg–1T", minKg: 501, maxKg: 1000, order: 3 },
        { label: "1–3T", minKg: 1001, maxKg: 3000, order: 4 },
        { label: "3–5T", minKg: 3001, maxKg: 5000, order: 5 },
        { label: "5–10T", minKg: 5001, maxKg: 10000, order: 6 },
        { label: "10–20T", minKg: 10001, maxKg: 20000, order: 7 },
        { label: "20–30T", minKg: 20001, maxKg: 30000, order: 8 },
    ];

    for (const t of tiersData) {
        await prisma.volumeTier.upsert({
            where: { label: t.label },
            update: t,
            create: t
        });
    }

    const plant = await prisma.plant.upsert({
        where: { code: "PL-001" },
        update: {},
        create: { code: "PL-001", name: "Planta Lima" }
    });

    const operations = await Promise.all(
        ["Impresión", "Laminado", "Embolsado"].map((name) =>
            prisma.operation.upsert({
                where: { name },
                update: {},
                create: { name, description: `Operación de ${name.toLowerCase()}` }
            })
        )
    );

    const allTiers = await prisma.volumeTier.findMany({ orderBy: { order: 'asc' } });

    // Crea algunos costos ejemplo (puedes borrar esto si prefieres empezar en blanco)
    for (const op of operations) {
        for (const tier of allTiers) {
            await prisma.indirectCost.upsert({
                where: {
                    plantId_operationId_volumeTierId: {
                        plantId: plant.id, operationId: op.id, volumeTierId: tier.id
                    }
                },
                update: { amount: 10.00 },
                create: { plantId: plant.id, operationId: op.id, volumeTierId: tier.id, amount: 10.00, currency: "PEN" }
            });
        }
    }

    console.log("Seed listo ");
}

main().finally(() => prisma.$disconnect());
