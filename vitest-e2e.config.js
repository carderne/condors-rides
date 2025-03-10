import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import { checkServerRunning } from "./e2e/config";

await checkServerRunning();

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    exclude: ["node_modules", "src"],
  },
});
