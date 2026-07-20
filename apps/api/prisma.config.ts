import { defineConfig } from '@prisma/config'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://betflow:betflowpassword@localhost:5432/betflow_db?schema=public",
  },
})
