import { join } from 'path'
import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

// Prisma CLI loads its env through this file. We point it at .env in the repo
// root so `prisma migrate` / `prisma db push` share the same DIRECT_URL the
// running server uses.
config({ path: join(process.cwd(), '.env') })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL,
  },
})
