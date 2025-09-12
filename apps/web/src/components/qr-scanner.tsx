import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/md3/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faStop, faRotate } from '@fortawesome/free-solid-svg-icons';
import type { QrScannerProps, QrScanResult } from '@/types/webcrawler';
import { Loading } from '@/components/ui/loading';
import { useLingui } from '@lingui/react/macro';

export function QrScannerComponent({
    onScan,
    onError,
    className = '',
    preferredCamera = 'environment',
    scanDelay = 300
}: QrScannerProps) {
    const { t } = useLingui();
    const videoRef = useRef<HTMLVideoElement>(null);
    const qrScannerRef = useRef<QrScanner | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [cameras, setCameras] = useState<QrScanner.Camera[]>([]);
    const [currentCameraId, setCurrentCameraId] = useState<string>('');

    useEffect(() => {
        if (!videoRef.current) return;

        const initQrScanner = async () => {
            try {
                // Check for camera permission and availability
                const hasCamera = await QrScanner.hasCamera();
                if (!hasCamera) {
                    setHasPermission(false);
                    onError?.(new Error(t`No camera found on device`));
                    return;
                }

                // Create QR scanner instance
                const qrScanner = new QrScanner(
                    videoRef.current!,
                    (result: QrScanner.ScanResult) => {
                        const scanResult: QrScanResult = {
                            data: result.data,
                            cornerPoints: result.cornerPoints?.map(point => ({ x: point.x, y: point.y }))
                        };
                        onScan(scanResult);
                    },
                    {
                        highlightScanRegion: true,
                        highlightCodeOutline: true,
                        preferredCamera: preferredCamera,
                        maxScansPerSecond: Math.floor(1000 / scanDelay),
                        returnDetailedScanResult: true
                    }
                );

                qrScannerRef.current = qrScanner;

                // Get available cameras
                const availableCameras = await QrScanner.listCameras(true);
                setCameras(availableCameras);

                if (availableCameras.length > 0) {
                    const defaultCamera = availableCameras.find(camera =>
                        camera.label.toLowerCase().includes('back') ||
                        camera.label.toLowerCase().includes('rear')
                    ) || availableCameras[0];
                    setCurrentCameraId(defaultCamera.id);
                }

                setHasPermission(true);
            } catch (error) {
                console.error('Failed to initialize QR scanner:', error);
                setHasPermission(false);
                onError?.(error as Error);
            }
        };

        initQrScanner();

        return () => {
            if (qrScannerRef.current) {
                qrScannerRef.current.destroy();
                qrScannerRef.current = null;
            }
        };
    }, [onScan, onError, preferredCamera, scanDelay]);

    const startScanning = async () => {
        try {
            if (!qrScannerRef.current) return;

            await qrScannerRef.current.start();
            setIsScanning(true);
        } catch (error) {
            console.error('Failed to start scanning:', error);
            onError?.(error as Error);
        }
    };

    const stopScanning = () => {
        if (qrScannerRef.current) {
            qrScannerRef.current.stop();
            setIsScanning(false);
        }
    };

    const switchCamera = async () => {
        if (!qrScannerRef.current || cameras.length <= 1) return;

        try {
            const currentIndex = cameras.findIndex(camera => camera.id === currentCameraId);
            const nextIndex = (currentIndex + 1) % cameras.length;
            const nextCamera = cameras[nextIndex];

            await qrScannerRef.current.setCamera(nextCamera.id);
            setCurrentCameraId(nextCamera.id);
        } catch (error) {
            console.error('Failed to switch camera:', error);
            onError?.(error as Error);
        }
    };

    if (hasPermission === false) {
        return (
            <div className={`flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg ${className}`}>
                <FontAwesomeIcon icon={faCamera} className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 text-center mb-4">
                    {t`Camera access is required to scan QR codes`}
                </p>
                <Button onClick={() => window.location.reload()} variant="outlined">
                    {t`Refresh to retry`}
                </Button>
            </div>
        );
    }

    if (hasPermission === null) {
        return <Loading text={t`Initializing camera...`} className={className} />;
    }

    return (
        <div className={`relative ${className}`}>
            <video
                ref={videoRef}
                className="w-full h-auto rounded-lg"
                playsInline
                muted
            />

            <div className="flex gap-2 mt-4">
                <Button
                    onClick={isScanning ? stopScanning : startScanning}
                    variant={isScanning ? "destructive" : "default"}
                    className="flex-1"
                >
                    <FontAwesomeIcon
                        icon={isScanning ? faStop : faCamera}
                        className="w-4 h-4 mr-2"
                    />
                    {isScanning ? t`Stop Scanning` : t`Start Scanning`}
                </Button>

                {cameras.length > 1 && (
                    <Button
                        onClick={switchCamera}
                        variant="outlined"
                        disabled={!isScanning}
                    >
                        <FontAwesomeIcon icon={faRotate} className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {isScanning && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {t`Scanning for QR codes...`}
                </div>
            )}
        </div>
    );
}
