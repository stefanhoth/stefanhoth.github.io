import { getViteConfig } from "astro/config";

// getViteConfig wires up Astro's Vite plugins so tests can import and
// render .astro components (see tests/unit/tocSidebar.test.js).
export default getViteConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.js", "tests/dom/**/*.test.js"],
  },
});
