// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { generatePermissions } from '../lib/permission/generate';

const prisma = new PrismaClient();

async function main() {
    const permissions = generatePermissions();

    console.log('✅ Permissions generated:', permissions.length);

    // Misalnya insert ke tabel permission (kalau ada), atau tampilkan
    // Kalau tidak ada tabel permissions, cukup tampilkan saja
}

main();
