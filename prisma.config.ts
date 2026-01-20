import { join } from "path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// This finds the EXACT folder where this script is running
const envPath = join(process.cwd(), ".env");
config({ path: envPath });
console.log("Checking for DIRECT_URL:", process.env.DIRECT_URL ? "✅ Found" : "❌ Not Found");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL,
  },
});