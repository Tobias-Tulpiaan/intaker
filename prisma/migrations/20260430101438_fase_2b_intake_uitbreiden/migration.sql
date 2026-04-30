/*
  Warnings:

  - You are about to drop the column `notes` on the `Intake` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Intake" DROP COLUMN "notes",
ADD COLUMN     "afzender" TEXT NOT NULL DEFAULT 'tobias',
ADD COLUMN     "anekdote" TEXT,
ADD COLUMN     "bedrijfsTekst" TEXT,
ADD COLUMN     "bedrijfsUrl" TEXT,
ADD COLUMN     "beschikbaarheid" TEXT,
ADD COLUMN     "bonusLease" TEXT,
ADD COLUMN     "contactpersoon" TEXT,
ADD COLUMN     "eerdereErvaring" TEXT,
ADD COLUMN     "haakjes" TEXT,
ADD COLUMN     "huidigeRol" TEXT,
ADD COLUMN     "huidigeRolToelichting" TEXT,
ADD COLUMN     "huidigeWerkgever" TEXT,
ADD COLUMN     "hybride" TEXT,
ADD COLUMN     "kladblok" TEXT,
ADD COLUMN     "klantsegment" TEXT,
ADD COLUMN     "leeftijd" TEXT,
ADD COLUMN     "matchToelichting" TEXT,
ADD COLUMN     "nuance" TEXT,
ADD COLUMN     "opMaatVragen" JSONB,
ADD COLUMN     "opzegtermijn" TEXT,
ADD COLUMN     "priveSituatie" TEXT,
ADD COLUMN     "redenVervolgstap" TEXT,
ADD COLUMN     "salaris" TEXT,
ADD COLUMN     "uren" TEXT,
ADD COLUMN     "vacatureTekst" TEXT,
ADD COLUMN     "voorstelGegenereerdOp" TIMESTAMP(3),
ADD COLUMN     "voorstelStijl" TEXT,
ADD COLUMN     "voorstelTekst" TEXT,
ADD COLUMN     "werkervaringTekst" TEXT,
ADD COLUMN     "woonplaats" TEXT,
ALTER COLUMN "status" SET DEFAULT 'setup';
