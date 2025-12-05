export interface DevicePacket {
    type: 'SENSOR' | 'ERROR' | 'SYSTEM';
    payload: any;
    raw: string;
}

export class DeviceProtocol {
    static parse(line: string): DevicePacket {
        const clean = line.trim();

        // 1. Try JSON parsing first (Modern Protocol)
        try {
            if (clean.startsWith('{') && clean.endsWith('}')) {
                const data = JSON.parse(clean);
                return {
                    type: 'SENSOR',
                    payload: data,
                    raw: clean
                };
            }
        } catch (e) {
            // Not JSON, fall back to string parsing
        }

        // 2. Legacy Simple Protocol (e.g., "TEMP:24.5", "DIST:102")
        if (clean.includes(':')) {
            const [key, value] = clean.split(':');
            const numValue = parseFloat(value);
            return {
                type: 'SENSOR',
                payload: { [key.toLowerCase()]: isNaN(numValue) ? value : numValue },
                raw: clean
            };
        }

        // 3. System Messages
        if (clean.startsWith('READY') || clean.startsWith('BOOT')) {
            return {
                type: 'SYSTEM',
                payload: { status: 'boot' },
                raw: clean
            };
        }

        // 4. Default / Unknown
        return {
            type: 'ERROR',
            payload: { message: 'Unknown format' },
            raw: clean
        };
    }
}
