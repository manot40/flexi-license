import dayjs from 'dayjs';
import bcrypt from 'bcryptjs';
//import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const day = dayjs();
const prisma = new PrismaClient();

async function seed() {
  const username = 'superadmin';

  // cleanup the existing database
  await prisma.user.delete({ where: { username } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const user = await prisma.user
    .create({
      data: {
        username,
        role: 'ADMIN',
        password: hashedPassword,
      },
    })
    .catch(() => {});

  // const company = await prisma.company.create({
  //   data: {
  //     name: 'Acme. Inc.',
  //     contactName: 'John Doe',
  //     contactNumber: '0123456789',
  //     createdBy: user.username,
  //     updatedBy: user.username,
  //   },
  // });

  // await prisma.license.create({
  //   data: {
  //     companyId: company.id,
  //     maxUser: 69,
  //     subscriptionStart: day.toDate(),
  //     subscriptionEnd: day.add(1, 'year').toDate(),
  //     createdBy: user.username,
  //     updatedBy: user.username,
  //   },
  // });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
