import { prisma } from '../utils/prisma';

async function main() {
	console.log('Database seeder initialized. No placeholder clubs created.');
}

main()
	.catch((e) => {
		console.error('Seeding error:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
