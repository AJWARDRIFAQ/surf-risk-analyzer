// app.config.js - Dynamic Expo configuration with environment variables
export default {
  expo: {
    name: "Surf Risk Analyzer",
    slug: "surf-risk-analyzer",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0891b2"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.surfrisk.analyzer"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0891b2"
      },
      package: "com.surfrisk.analyzer",
      permissions: [
        "ACCESS_FINE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      // These can be accessed via expo-constants
      apiBaseUrl: process.env.API_BASE_URL || "http://10.91.46.168:5000/api",
      mlApiUrl: process.env.ML_API_URL || "http://10.91.46.168:5001",
      environment: process.env.NODE_ENV || "development",
      eas: {
        projectId: "your-project-id-here"
      }
    }
  }
};
