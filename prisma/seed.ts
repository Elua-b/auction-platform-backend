import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const categories = [
        'Watches & Accessories',
        'Jewelry',
        'Art & Collectibles',
        'Electronics',
        'Fashion & Clothing',
        'Books & Media',
        'Sports & Recreation',
        'Home & Garden',
        'Antiques',
        'Other',
    ];

    console.log('Seeding categories...');

    for (const name of categories) {
        const category = await prisma.category.upsert({
            where: { name },
            update: {},
            create: {
                name,
                description: `All things ${name}`,
            },
        });
        console.log(`Verified category: ${category.name}`);
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
