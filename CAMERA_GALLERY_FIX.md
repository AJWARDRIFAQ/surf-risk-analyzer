# Camera & Gallery Fix - Report Hazard Screen

## Problem
Users were unable to access camera and gallery to upload images/videos in the Report Hazard screen.

## Root Causes
1. **Missing Permissions Configuration** - `app.config.js` didn't have camera, gallery, and microphone permissions declared
2. **Wrong Image Picker Library** - Code was using `react-native-image-picker` instead of Expo's `expo-image-picker`
3. **No Permission Requests** - Code didn't request runtime permissions before accessing camera/gallery
4. **Incorrect API Usage** - Expo's ImagePicker has different API than react-native-image-picker

## Changes Made

### 1. Updated `app.config.js`
- Added `plugins` section with `expo-image-picker` configuration
- Added iOS `infoPlist` with camera, photo library, and microphone descriptions
- Added Android `permissions` array with required permissions:
  - `CAMERA`
  - `READ_EXTERNAL_STORAGE`
  - `WRITE_EXTERNAL_STORAGE`
  - `RECORD_AUDIO`

### 2. Updated `screens/ReportHazardScreen.js`
- Changed import from `react-native-image-picker` to `expo-image-picker`
- Implemented proper permission request handling:
  ```javascript
  // For Camera
  const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
  const { status: audioStatus } = await ImagePicker.requestMicrophonePermissionsAsync();
  
  // For Gallery
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  ```
- Updated `openCamera()` to use `ImagePicker.launchCameraAsync()`
- Updated `openGallery()` to use `ImagePicker.launchImageLibraryAsync()`
- Added proper error handling with user-friendly alerts
- Updated response handling to work with Expo's API format

### 3. Updated `package.json`
- Removed `react-native-image-picker` dependency (no longer needed)
- Kept `expo-image-picker` which was already installed

## Testing Steps

1. **Clear Cache**
   ```bash
   cd SurfApp--frontend
   npm install  # Install updated dependencies
   expo start --clear
   ```

2. **Test on Android**
   ```bash
   expo start --android
   # or for device: expo start --android --device
   ```

3. **Test on iOS**
   ```bash
   expo start --ios
   ```

4. **Verify Permissions**
   - On first camera access: Should see "Allow $(PRODUCT_NAME) to access your camera?" prompt
   - On first gallery access: Should see photo library permission prompt
   - If denied, will show user-friendly error messages

## Permission Flow

```
User taps "📷 Add Media"
   ↓
"Select Media" dialog (Camera / Gallery / Cancel)
   ↓
If Camera Selected:
   ├─ Request Camera Permission
   ├─ Request Microphone Permission
   └─ Launch Camera
   
If Gallery Selected:
   ├─ Request Media Library Permission
   └─ Launch Image/Video Library (allow multiple selection, up to 5 files)
```

## Features Restored
✅ Camera access with photo capture
✅ Camera access with video recording
✅ Gallery/Photos app integration
✅ Multiple file selection (up to 5 files)
✅ Proper permission handling
✅ User-friendly error messages
✅ Works on both Android and iOS

## Notes
- Permissions are requested at runtime (required for Android 6+)
- Users can grant/deny permissions individually
- Appropriate error messages guide users if permissions are denied
- The app now properly handles all Expo image picker features
