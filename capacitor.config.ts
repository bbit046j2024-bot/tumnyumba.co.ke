import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ke.co.campuskey.app',
  appName: 'CampusKey',
  // webDir is required by Capacitor CLI even when using server.url
  webDir: 'out',
  // In production the app loads from your live website
  // We use www.campuskey.co.ke to load directly without 308 redirects
  server: {
    url: 'https://www.campuskey.co.ke',
    errorPath: 'offline.html',
    cleartext: true,
    allowNavigation: [
      'www.campuskey.co.ke',
      'campuskey.co.ke',
      '*.campuskey.co.ke',
      'res.cloudinary.com',
      '*.cloudinary.com',
      '*.pusher.com',
      '*.google.com',
      '*.googleapis.com'
    ],
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
      launchShowDuration: 2500,
      launchAutoHide: true,        // ← this is what was missing — hides splash after duration
      backgroundColor: '#1F6B4A',
      showSpinner: false,
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
