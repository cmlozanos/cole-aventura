import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser',fullyParallel:false,workers:1,
  use:{baseURL:process.env.APP_URL || 'http://127.0.0.1:4173',headless:true},
  webServer:process.env.APP_URL ? undefined : {command:'python3 -m http.server 4173 --bind 127.0.0.1 --directory dist',port:4173,reuseExistingServer:!process.env.CI},
  projects:[{name:'chromium',use:{browserName:'chromium'}},{name:'webkit',use:{browserName:'webkit'}}]
});
