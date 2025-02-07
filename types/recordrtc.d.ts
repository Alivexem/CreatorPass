declare module 'recordrtc' {
  class RecordRTC {
    constructor(stream: MediaStream, options: {
      type: string;
      mimeType: string;
      recorderType: any;
      timeSlice?: number;
      ondataavailable?: () => void;
    });
    
    startRecording(): void;
    stopRecording(callback: () => void): void;
    getBlob(): Blob;
    getState(): { timeStamp: number };
  }

  export const StereoAudioRecorder: any;
  export default RecordRTC;
} 