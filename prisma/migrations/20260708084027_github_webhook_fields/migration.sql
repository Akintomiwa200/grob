-- AlterTable
ALTER TABLE "Webhook" ADD COLUMN "githubHookId" TEXT DEFAULT '';
ALTER TABLE "Webhook" ADD COLUMN "githubRepo" TEXT DEFAULT '';
