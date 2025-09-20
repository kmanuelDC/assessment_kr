export default (prisma) => ({
    Query: {
        plants: () => prisma.plant.findMany({ orderBy: { name: 'asc' } }),
        operations: (_, { activeOnly }) =>
            prisma.operation.findMany({
                where: activeOnly ? { active: true } : {},
                orderBy: { name: 'asc' }
            }),
        volumeTiers: () => prisma.volumeTier.findMany({ orderBy: { order: 'asc' } }),
        indirectCosts: (_, { plantId, operationId }) =>
            prisma.indirectCost.findMany({
                where: { plantId: +plantId, operationId: +operationId },
                include: { plant: true, operation: true, tier: true },
                orderBy: { volumeTierId: 'asc' }
            }),
        operationCostMatrix: async (_, { plantId }) => {
            const [ops, tiers, costs] = await Promise.all([
                prisma.operation.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
                prisma.volumeTier.findMany({ orderBy: { order: 'asc' } }),
                prisma.indirectCost.findMany({
                    where: { plantId: +plantId },
                    include: { tier: true },
                })
            ]);

            // indexar costos por opId + tierId
            const byKey = new Map();
            for (const c of costs) byKey.set(`${c.operationId}-${c.volumeTierId}`, c);

            return ops.map(op => ({
                operation: op,
                costs: tiers
                    .map(t => byKey.get(`${op.id}-${t.id}`))
                    .filter(Boolean) // sólo los que existen; el front mostrará vacío si falta
            }));
        },
    },

    Mutation: {
        upsertOperation: async (_, { input }) => {
            const { id, name, description, active } = input;
            if (id) {
                return prisma.operation.update({
                    where: { id: +id },
                    data: { name, description, active }
                });
            }
            return prisma.operation.create({ data: { name, description, active } });
        },

        upsertIndirectCost: async (_, { input }) => {
            const { plantId, operationId, volumeTierId, amount, currency } = input;
            return prisma.indirectCost.upsert({
                where: {
                    plantId_operationId_volumeTierId: {
                        plantId: +plantId,
                        operationId: +operationId,
                        volumeTierId: +volumeTierId
                    }
                },
                update: { amount, currency },
                create: { plantId: +plantId, operationId: +operationId, volumeTierId: +volumeTierId, amount, currency }
            });
        },

        bulkUpsertCosts: async (_, { plantId, items }) => {
            // Transacción por seguridad
            await prisma.$transaction(async (tx) => {
                for (const item of items) {
                    const { operationId, entries } = item;
                    for (const e of entries) {
                        await tx.indirectCost.upsert({
                            where: {
                                plantId_operationId_volumeTierId: {
                                    plantId: +plantId,
                                    operationId: +operationId,
                                    volumeTierId: +e.volumeTierId
                                }
                            },
                            update: { amount: e.amount, currency: e.currency ?? "PEN" },
                            create: {
                                plantId: +plantId,
                                operationId: +operationId,
                                volumeTierId: +e.volumeTierId,
                                amount: e.amount,
                                currency: e.currency ?? "PEN"
                            }
                        });
                    }
                }
            });
            return true;
        }
    }
});
