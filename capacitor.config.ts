import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ke.co.campuskey.app',
  appName: 'CampusKey',
  // webDir is required by Capacitor CLI even when using server.url
  webDir: 'out',
  // In production the app loads from your live website
  // so you don't need a static export — the WebView just navigates to the URL.
  server: {
    url: 'https://campuskey.co.ke',
    cleartext: false,
  },
  android: {
    buildOptions: {
      // Use the same JDK we located above
      keystorePath: undefined,
    },
    backgroundColor: '#1F6B4A',
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1F6B4A',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1F6B4A',
    },
  },
};

export default config;
