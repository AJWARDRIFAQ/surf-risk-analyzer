# Make Photos/Videos Required for Hazard Report

## Changes Made

### 1. Updated Validation Logic
**File:** `screens/ReportHazardScreen.js` - `handleSubmit()` function

Added validation to ensure at least one photo/video is attached:
```javascript
if (mediaFiles.length === 0) {
  Alert.alert('Error', 'Please add at least one photo or video to verify the hazard');
  return;
}
```

### 2. Updated UI Label
**File:** `screens/ReportHazardScreen.js` - Media section label

Changed from:
```
Photos/Videos (Optional)
Visual evidence helps verify the hazard
```

To:
```
Photos/Videos *
Visual evidence is required to verify the hazard
```

The asterisk (*) indicates it's a required field, matching other required fields in the form.

### 3. Added Media Counter
**File:** `screens/ReportHazardScreen.js` - Upload button text

Added a counter to show users how many files have been added:
```
📷 Add Media (1/5)
📷 Add Media (3/5)
```

This helps users understand:
- How many files they've selected
- Maximum allowed (5 files)
- Whether the requirement is met (at least 1 file)

## User Experience Flow

**Before:**
1. User fills form
2. User can submit without photos
3. Submit button is available even without media

**After:**
1. User fills form
2. User MUST add at least 1 photo/video
3. If user tries to submit without media → Error alert: "Please add at least one photo or video to verify the hazard"
4. User must add media before submission succeeds

## Visual Changes

| Before | After |
|--------|-------|
| "Photos/Videos (Optional)" | "Photos/Videos *" |
| "Visual evidence helps verify the hazard" | "Visual evidence is required to verify the hazard" |
| "📷 Add Media" | "📷 Add Media (n/5)" |

## Benefits

✅ **Ensures Quality Reports:** Photos/videos help verify hazards and increase data quality
✅ **Clear Communication:** Asterisk and updated text show this is required
✅ **Better UX:** Counter shows progress and confirms user action
✅ **Prevents Empty Reports:** No hazard reports submitted without evidence
✅ **Consistent UI:** Matches same required field indicator (*) as other fields

## Testing

1. Open the app and navigate to "Report Hazard"
2. Fill in all fields EXCEPT media
3. Try to submit → Should see error: "Please add at least one photo or video to verify the hazard"
4. Add 1-5 photos/videos
5. Counter should update showing (1/5), (2/5), etc.
6. Submit button should now work
7. Report should submit successfully
