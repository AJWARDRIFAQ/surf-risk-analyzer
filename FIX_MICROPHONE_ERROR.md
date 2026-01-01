# Fix: ImagePicker Microphone Permission Error

## Error
```
ERROR  Camera error: [TypeError: ImagePicker.requestMicrophonePermissionsAsync is not a function (it is undefined)]
```

## Root Cause
The `expo-image-picker` module does **not** have a `requestMicrophonePermissionsAsync()` function. This method doesn't exist in the expo-image-picker API.

## Solution
Removed the microphone permission request since:
1. The native camera app handles its own audio permissions
2. When users open the device camera, they can choose to record video with or without audio
3. The device OS manages microphone permissions for video recording within the camera app
4. Explicit microphone permission is not required at the app level for basic camera access

## Changes Made

### 1. `screens/ReportHazardScreen.js`
**Removed:**
```javascript
// Request microphone permission for video
const { status: audioStatus } = await ImagePicker.requestMicrophonePermissionsAsync();
if (audioStatus !== 'granted') {
  Alert.alert('Permission Denied', 'Microphone permission is required for video recording');
  return;
}
```

**Kept:**
```javascript
// Request camera permission only
const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
if (cameraStatus !== 'granted') {
  Alert.alert('Permission Denied', 'Camera permission is required to take photos');
  return;
}
```

### 2. `app.config.js`
**Removed from plugins:**
```javascript
microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone.",
```

**Removed from iOS infoPlist:**
```javascript
NSMicrophoneUsageDescription: "This app needs microphone access for video recording"
```

**Removed from Android permissions:**
```javascript
"RECORD_AUDIO"
```

## What Still Works
✅ Camera access for taking photos
✅ Camera access for recording videos (with audio if user permits on device)
✅ Gallery/Photo library access
✅ Multiple file selection
✅ Proper permission prompts for camera and photo library

## Testing

Run the app with the fix:
```bash
cd SurfApp--frontend
expo start --clear
# Press 'a' for Android or 'i' for iOS
```

**Test Camera:**
1. Tap "📷 Add Media"
2. Select "Camera"
3. Allow camera permission when prompted
4. Take a photo or video
5. Photo/video should be added to the media list

**Test Gallery:**
1. Tap "📷 Add Media"
2. Select "Gallery"
3. Allow photo library permission when prompted
4. Select photos/videos (up to 5)
5. Media should be added to the list

Both should now work without the microphone error!
