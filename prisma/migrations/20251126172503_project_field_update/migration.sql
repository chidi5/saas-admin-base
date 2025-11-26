-- DropForeignKey
ALTER TABLE "project" DROP CONSTRAINT "project_organizationId_fkey";

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
