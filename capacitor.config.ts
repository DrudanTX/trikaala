import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.drudantx.trikaala',
  appName: 'Trikaala',
  server: {
    url: 'https://trikaala.vercel.app',
    cleartext: false,
  },
};

export default config;
