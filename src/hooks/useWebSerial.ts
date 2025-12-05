import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Type definitions for Web Serial API (experimental)
interface SerialPort {
    open(options: { baudRate: number }): Promise<void>;
    close(): Promise<void>;
    readable: ReadableStream | null;
    writable: WritableStream | null;
}

interface NavigatorWithSerial extends Navigator {
    serial: {
        requestPort(options?: { filters?: any[] }): Promise<SerialPort>;
        getPorts(): Promise<SerialPort[]>;
    };
}

export interface SerialData {
    timestamp: number;
    value: string;
}

export const useWebSerial = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [port, setPort] = useState<SerialPort | null>(null);
    const [incomingData, setIncomingData] = useState<SerialData[]>([]);
    const keepReading = useRef(false);
    const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
    const writerRef = useRef<WritableStreamDefaultWriter<string> | null>(null);

    const connect = useCallback(async () => {
        try {
            const nav = navigator as unknown as NavigatorWithSerial;
            if (!nav.serial) {
                toast.error("Web Serial not supported in this browser.");
                return;
            }

            const selectedPort = await nav.serial.requestPort();
            await selectedPort.open({ baudRate: 9600 });

            setPort(selectedPort);
            setIsConnected(true);
            keepReading.current = true;
            toast.success("Device Connected");

            // Start Reading Loop
            readLoop(selectedPort);
        } catch (error) {
            console.error("Connection failed:", error);
            toast.error("Failed to connect to device.");
        }
    }, []);

    const disconnect = useCallback(async () => {
        keepReading.current = false;

        if (readerRef.current) {
            await readerRef.current.cancel();
        }

        if (writerRef.current) {
            await writerRef.current.close();
        }

        if (port) {
            await port.close();
        }

        setPort(null);
        setIsConnected(false);
        toast.info("Device Disconnected");
    }, [port]);

    const readLoop = async (currentPort: SerialPort) => {
        if (!currentPort.readable) return;

        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = currentPort.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();
        readerRef.current = reader;

        try {
            while (keepReading.current) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value) {
                    // Handle streaming text - this is a simplified line parser
                    // In production, we'd buffer incomplete lines
                    const cleanValue = value.trim();
                    if (cleanValue) {
                        setIncomingData(prev => [...prev.slice(-19), {
                            timestamp: Date.now(),
                            value: cleanValue
                        }]);
                    }
                }
            }
        } catch (error) {
            console.error("Read error:", error);
        } finally {
            reader.releaseLock();
        }
    };

    const sendData = useCallback(async (data: string) => {
        if (!port || !port.writable) return;

        const textEncoder = new TextEncoderStream();
        const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
        const writer = textEncoder.writable.getWriter();
        writerRef.current = writer;

        await writer.write(data + '\n');
        writer.releaseLock();
    }, [port]);

    return {
        connect,
        disconnect,
        isConnected,
        incomingData,
        sendData
    };
};
