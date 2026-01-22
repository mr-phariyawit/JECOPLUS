import { ref, onUnmounted } from 'vue';

/**
 * Camera composable for capturing photos and videos
 */
export function useCamera() {
  const videoRef = ref(null);
  const stream = ref(null);
  const isReady = ref(false);
  const error = ref(null);
  const facingMode = ref('user'); // 'user' for front, 'environment' for back

  /**
   * Start camera
   * @param {string} mode - 'user' or 'environment'
   */
  const startCamera = async (mode = 'user') => {
    try {
      error.value = null;
      facingMode.value = mode;

      // Stop existing stream if any
      if (stream.value) {
        stopCamera();
      }

      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      stream.value = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.value) {
        videoRef.value.srcObject = stream.value;
        await videoRef.value.play();
        isReady.value = true;
      }

      return true;
    } catch (err) {
      console.error('Camera error:', err);

      if (err.name === 'NotAllowedError') {
        error.value = 'กรุณาอนุญาตให้เข้าถึงกล้อง';
      } else if (err.name === 'NotFoundError') {
        error.value = 'ไม่พบกล้องบนอุปกรณ์นี้';
      } else {
        error.value = 'ไม่สามารถเปิดกล้องได้ กรุณาลองใหม่';
      }

      isReady.value = false;
      return false;
    }
  };

  /**
   * Stop camera
   */
  const stopCamera = () => {
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop());
      stream.value = null;
    }
    isReady.value = false;
  };

  /**
   * Switch between front and back camera
   */
  const switchCamera = async () => {
    const newMode = facingMode.value === 'user' ? 'environment' : 'user';
    return await startCamera(newMode);
  };

  /**
   * Capture photo
   * @returns {Promise<{blob: Blob, dataUrl: string}>}
   */
  const capturePhoto = async () => {
    if (!videoRef.value || !isReady.value) {
      throw new Error('Camera not ready');
    }

    const video = videoRef.value;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');

    // Mirror for front camera
    if (facingMode.value === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          resolve({ blob, dataUrl });
        },
        'image/jpeg',
        0.9
      );
    });
  };

  /**
   * Start recording video
   */
  let mediaRecorder = null;
  let recordedChunks = [];

  const startRecording = () => {
    if (!stream.value) {
      throw new Error('Camera not started');
    }

    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream.value, {
      mimeType: 'video/webm;codecs=vp9',
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.start();
  };

  /**
   * Stop recording and get video blob
   * @returns {Promise<Blob>}
   */
  const stopRecording = () => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorder) {
        reject(new Error('Not recording'));
        return;
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        recordedChunks = [];
        resolve(blob);
      };

      mediaRecorder.stop();
    });
  };

  // Cleanup on unmount
  onUnmounted(() => {
    stopCamera();
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  });

  return {
    videoRef,
    stream,
    isReady,
    error,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto,
    startRecording,
    stopRecording,
  };
}

export default useCamera;
