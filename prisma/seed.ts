import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Tulpiaan2026!", 12);
  const users = [
    { email: "tobias@tulpiaan.nl", name: "Tobias" },
    { email: "ralf@tulpiaan.nl", name: "Ralf" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        passwordHash: hash,
        role: "ADMIN",
      },
    });
  }

  await prisma.candidate.upsert({
    where: { email: "jan.devries@example.nl" },
    update: {},
    create: {
      firstName: "Jan",
      lastName: "de Vries",
      email: "jan.devries@example.nl",
      phone: "+31 6 12345678",
      city: "Apeldoorn",
      linkedinUrl: "https://linkedin.com/in/jandevries-example",
      notes: "Voorbeeld-kandidaat voor lokale tests.",
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
