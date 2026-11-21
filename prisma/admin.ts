import 'dotenv/config';
import { getPrisma } from '../src/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';


async function main() {
  const email = z.string().trim().email().max(254).toLowerCase().parse(process.env.ADMIN_EMAIL);
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 16 || Buffer.byteLength(password) > 72) {
    throw new Error('ADMIN_PASSWORD must be at least 16 characters and at most 72 UTF-8 bytes.');
  }

  const hash = await bcrypt.hash(password, 12);
  await getPrisma().adminUser.upsert({
    where: { email },
    create: { email, password: hash, name: 'Alphalinkx Admin', role: 'ADMIN' },
    update: { password: hash },
  });
  console.log('Admin credentials configured.');
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Could not configure admin credentials.');
    process.exitCode = 1;
  })
  .finally(() => getPrisma(false)?.$disconnect());
