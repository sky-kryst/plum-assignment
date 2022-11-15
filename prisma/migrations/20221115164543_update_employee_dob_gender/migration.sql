/*
  Warnings:

  - The values [MALE,FEMALE,OTHER] on the enum `EEmployeeGender` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `dob` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EEmployeeGender_new" AS ENUM ('Male', 'Female', 'Other');
ALTER TABLE "Employee" ALTER COLUMN "gender" TYPE "EEmployeeGender_new" USING ("gender"::text::"EEmployeeGender_new");
ALTER TYPE "EEmployeeGender" RENAME TO "EEmployeeGender_old";
ALTER TYPE "EEmployeeGender_new" RENAME TO "EEmployeeGender";
DROP TYPE "EEmployeeGender_old";
COMMIT;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "dob" DATE NOT NULL;
