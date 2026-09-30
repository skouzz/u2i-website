import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    // SPA mode: `npm run build` outputs a fully static dist/ (with an
    // app shell at _shell.html) so the site can be hosted on static
    // hosting like OVH web hosting (Apache) without a Node server.
    tanstackStart({
      spa: {
        enabled: true,
        // Prerender every route to its own .html file (index.html,
        // about.html, contact.html, …) in addition to the SPA shell,
        // so the static build is SEO-friendly on plain file hosts.
        prerender: {
          crawlLinks: true,
        },
      },
    }),
    react(),
  ],
  resolve: { tsconfigPaths: true },
});
