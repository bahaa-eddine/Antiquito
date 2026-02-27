import { useRef, useState } from 'react';
import { CameraView } from 'expo-camera';

type FlashMode = 'off' | 'on' | 'auto';
type CameraFacing = 'front' | 'back';

export interface CameraControls {
  cameraRef: React.RefObject<CameraView>;
  facing: CameraFacing;
  flash: FlashMode;
  isTaking: boolean;
  toggleFacing: () => void;
  toggleFlash: () => void;
  takePicture: () => Promise<string | null>;
}

export function useCamera(): CameraControls {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraFacing>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [isTaking, setIsTaking] = useState(false);

  const toggleFacing = () =>
    setFacing((current) => (current === 'back' ? 'front' : 'back'));

  const toggleFlash = () =>
    setFlash((current) => (current === 'off' ? 'on' : 'off'));

  const takePicture = async (): Promise<string | null> => {
    if (!cameraRef.current || isTaking) return null;

    setIsTaking(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });
      return photo?.uri ?? null;
    } catch {
      return null;
    } finally {
      setIsTaking(false);
    }
  };

  return { cameraRef, facing, flash, isTaking, toggleFacing, toggleFlash, takePicture };
}
