import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://kb.villaarreola.com',
  trailingSlash: 'never',

  build: {
    format: 'directory'
  },

  vite: {
    plugins: [tailwindcss()]
  }
});