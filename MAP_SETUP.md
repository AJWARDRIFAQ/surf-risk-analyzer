# Map Setup Guide

## Issue: Black Map Display on Android

If the map appears completely black on Android, follow these troubleshooting steps:

### For Expo/Android Emulator:

1. **Ensure Google Play Services is installed:**
   - Go to Google Play Store in your emulator
   - Search for "Google Play Services"
   - Install or update it

2. **Clear Expo cache and rebuild:**
   ```bash
   cd SurfApp--frontend
   expo start --clear
   # Then press 'a' for Android
   ```

3. **For physical Android device:**
   - Make sure the device has Google Play Services installed
   - Ensure location services are enabled
   - Try restarting the app

### For iOS Simulator:

- Maps should work out of the box with Apple Maps
- No additional configuration needed

### Alternative Solution:

If maps still don't work, you can switch to a web-based map by:

1. Installing web-based tile provider:
   ```bash
   npm install react-native-webview
   ```

2. Using Leaflet/MapLibre for a tile-based map (instructions in separate file)

## Current Configuration:

- **iOS:** Uses Apple Maps (built-in)
- **Android:** Uses Google Maps from Google Play Services
- **Fallback:** Shows "No surf spots available" message if map fails to load

## Testing the Map:

1. Start the app: `expo start --android` or `expo start --ios`
2. Navigate to the "Risk Analyzer" tab
3. You should see:
   - Map with markers for each surf spot
   - Risk score displayed on each marker
   - Map controls in top-right corner
   - Risk legend in bottom-left corner

## Debug Information:

Check the console logs for:
- `✅ Map is ready` - Map component loaded successfully
- `📍 Fitting markers for X spots` - Markers are being positioned
- `📍 Surf spots available: X` - Number of spots loaded from backend

If you see errors related to "Map provider" or "Failed to initialize", ensure:
1. Backend is running and returning surf spot data
2. Device/emulator has internet connection
3. Google Play Services is installed (Android only)
