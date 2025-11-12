import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

/**
 * HazardUploader Component
 * Handles media upload for hazard reports with preview and validation
 */
const HazardUploader = ({ onMediaChange, maxFiles = 5, existingMedia = [] }) => {
  const [mediaFiles, setMediaFiles] = useState(existingMedia);
  const [uploading, setUploading] = useState(false);

  /**
   * Show picker options (Camera or Gallery)
   */
  const showMediaPicker = () => {
    Alert.alert(
      'Add Media',
      'Choose how to add photos or videos',
      [
        {
          text: 'Take Photo',
          onPress: () => openCamera('photo'),
        },
        {
          text: 'Record Video',
          onPress: () => openCamera('video'),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Open camera to take photo or video
   */
  const openCamera = (mediaType) => {
    const options = {
      mediaType: mediaType === 'video' ? 'video' : 'photo',
      quality: 0.8,
      videoQuality: 'high',
      durationLimit: 30, // 30 seconds max for videos
      saveToPhotos: true,
    };

    launchCamera(options, handleMediaResponse);
  };

  /**
   * Open gallery to select photos or videos
   */
  const openGallery = () => {
    const options = {
      mediaType: 'mixed',
      quality: 0.8,
      selectionLimit: maxFiles - mediaFiles.length,
      videoQuality: 'high',
    };

    launchImageLibrary(options, handleMediaResponse);
  };

  /**
   * Handle media picker response
   */
  const handleMediaResponse = (response) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage || 'Failed to select media');
      return;
    }

    if (response.assets) {
      const newMedia = response.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type,
        fileName: asset.fileName || `media_${Date.now()}.jpg`,
        fileSize: asset.fileSize,
        width: asset.width,
        height: asset.height,
        duration: asset.duration, // for videos
      }));

      // Validate file sizes
      const oversizedFiles = newMedia.filter((file) => file.fileSize > 50 * 1024 * 1024); // 50MB
      if (oversizedFiles.length > 0) {
        Alert.alert(
          'File Too Large',
          'Some files exceed 50MB limit and will not be added.'
        );
        return;
      }

      const updatedMedia = [...mediaFiles, ...newMedia].slice(0, maxFiles);
      setMediaFiles(updatedMedia);

      // Notify parent component
      if (onMediaChange) {
        onMediaChange(updatedMedia);
      }
    }
  };

  /**
   * Remove media file
   */
  const removeMedia = (index) => {
    Alert.alert(
      'Remove Media',
      'Are you sure you want to remove this file?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedMedia = mediaFiles.filter((_, i) => i !== index);
            setMediaFiles(updatedMedia);

            // Notify parent component
            if (onMediaChange) {
              onMediaChange(updatedMedia);
            }
          },
        },
      ]
    );
  };

  /**
   * Get media type icon
   */
  const getMediaIcon = (type) => {
    if (type?.includes('video')) return '🎥';
    if (type?.includes('image')) return '📷';
    return '📁';
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  /**
   * Format video duration
   */
  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Photos & Videos</Text>
        <Text style={styles.subtitle}>
          {mediaFiles.length}/{maxFiles} files
        </Text>
      </View>

      {/* Upload Button */}
      <TouchableOpacity
        style={[
          styles.uploadButton,
          mediaFiles.length >= maxFiles && styles.uploadButtonDisabled,
        ]}
        onPress={showMediaPicker}
        disabled={mediaFiles.length >= maxFiles}
        activeOpacity={0.7}
      >
        <Text style={styles.uploadButtonIcon}>
          {mediaFiles.length >= maxFiles ? '✓' : '📷'}
        </Text>
        <Text style={styles.uploadButtonText}>
          {mediaFiles.length >= maxFiles
            ? 'Maximum files reached'
            : 'Add Photos or Videos'}
        </Text>
        <Text style={styles.uploadButtonHint}>
          {mediaFiles.length >= maxFiles
            ? ''
            : 'Tap to capture or select from gallery'}
        </Text>
      </TouchableOpacity>

      {/* Media Preview */}
      {mediaFiles.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.mediaScroll}
          contentContainerStyle={styles.mediaScrollContent}
        >
          {mediaFiles.map((media, index) => (
            <View key={index} style={styles.mediaItem}>
              {/* Media Preview */}
              <View style={styles.mediaPreview}>
                <Image source={{ uri: media.uri }} style={styles.mediaImage} />

                {/* Video Indicator */}
                {media.type?.includes('video') && (
                  <View style={styles.videoOverlay}>
                    <Text style={styles.videoIcon}>▶️</Text>
                    {media.duration && (
                      <Text style={styles.videoDuration}>
                        {formatDuration(media.duration)}
                      </Text>
                    )}
                  </View>
                )}

                {/* Remove Button */}
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeMedia(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              {/* Media Info */}
              <View style={styles.mediaInfo}>
                <Text style={styles.mediaType}>
                  {getMediaIcon(media.type)}{' '}
                  {media.type?.includes('video') ? 'Video' : 'Photo'}
                </Text>
                <Text style={styles.mediaSize}>
                  {formatFileSize(media.fileSize)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Upload Progress */}
      {uploading && (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="small" color="#0891b2" />
          <Text style={styles.uploadingText}>Processing media...</Text>
        </View>
      )}

      {/* Guidelines */}
      <View style={styles.guidelines}>
        <Text style={styles.guidelinesTitle}>📋 Guidelines</Text>
        <Text style={styles.guidelineText}>• Max file size: 50MB per file</Text>
        <Text style={styles.guidelineText}>• Max video length: 30 seconds</Text>
        <Text style={styles.guidelineText}>
          • Supported formats: JPG, PNG, MP4, MOV
        </Text>
        <Text style={styles.guidelineText}>
          • Clear, well-lit photos help verify hazards
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  subtitle: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: '#e0f2fe',
    borderWidth: 2,
    borderColor: '#0891b2',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  uploadButtonIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0891b2',
    marginBottom: 4,
  },
  uploadButtonHint: {
    fontSize: 12,
    color: '#6b7280',
  },
  mediaScroll: {
    marginBottom: 16,
  },
  mediaScrollContent: {
    paddingRight: 16,
  },
  mediaItem: {
    marginRight: 12,
    width: 120,
  },
  mediaPreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    fontSize: 32,
  },
  videoDuration: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  mediaInfo: {
    marginTop: 8,
    alignItems: 'center',
  },
  mediaType: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 2,
  },
  mediaSize: {
    fontSize: 11,
    color: '#9ca3af',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#0891b2',
    fontWeight: '500',
  },
  guidelines: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  guidelinesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 12,
    color: '#92400e',
    marginBottom: 4,
    lineHeight: 18,
  },
});

export default HazardUploader;