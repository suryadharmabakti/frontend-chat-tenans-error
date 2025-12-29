/*
  Warnings:

  - You are about to drop the column `role` on the `user_tenants` table. All the data in the column will be lost.
  - Added the required column `role_id` to the `user_tenants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."user_tenants" DROP COLUMN "role",
ADD COLUMN     "role_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."user_tenants" ADD CONSTRAINT "user_tenants_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
