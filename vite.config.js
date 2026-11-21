import { defineConfig } from 'vite';

// Relative assets work at username.github.io/repository/ and on custom domains.
// Navigation uses URL hashes so refreshing a project needs no server-side rewrites.
export default defineConfig({ base: '/ivan-belousov/', });
