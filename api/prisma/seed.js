require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const categories = [
    'Mode', 'Coiffure et beauté', 'Restaurants', 'Électronique', 'Électroménager',
    'Artisanat', 'Services', 'Pièces automobiles', 'Commerces de proximité',
  ];
  for (const nom of categories) {
    await prisma.categorie.upsert({ where: { nom }, update: {}, create: { nom } });
  }

  const email = process.env.ADMIN_EMAIL || 'admin@marketplace.mg';
  const motDePasse = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@12345', 10);
  await prisma.utilisateur.upsert({
    where: { email },
    update: {},
    create: {
      email, telephone: '0340000000', motDePasse,
      nom: 'Admin', prenom: 'Principal', role: 'ADMIN',
      admin: { create: {} },
    },
  });
  console.log('Catégories et compte administrateur créés.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());