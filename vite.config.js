import { defineConfig } from 'vite';

// GitHub Pages serves the site from /typography-portfolio/, so all asset
// URLs (including the Blender GLB via import.meta.env.BASE_URL) need this base.
export default defineConfig({
  base: '/typography-portfolio/',
});
