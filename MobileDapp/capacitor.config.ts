import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'angular-app',
  webDir: 'dist/angular-app',
  bundledWebRuntime: false,
  server: {
    'cleartext': true
  }
};

export default config;
