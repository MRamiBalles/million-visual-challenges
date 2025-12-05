export class HapticEngine {
    private static instance: HapticEngine;
    private audioCtx: AudioContext | null = null;
    private oscillator: OscillatorNode | null = null;
    private gainNode: GainNode | null = null;

    private constructor() {
        // Initialize Audio Context lazily on user interaction usually
    }

    public static getInstance(): HapticEngine {
        if (!HapticEngine.instance) {
            HapticEngine.instance = new HapticEngine();
        }
        return HapticEngine.instance;
    }

    private initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    /**
     * Triggers a tactile pulse (if supported)
     * @param duration ms
     */
    public pulse(duration: number = 20) {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }

    /**
     * Plays a haptic pattern
     * @param pattern Array of [vibrate, pause, vibrate...]
     */
    public pattern(pattern: number[]) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    /**
     * Converts a simplified "Roughness" value (0-1) into Audio/Haptic feedback.
     * 0 = Smooth (High pitch, clear sound / No vibration)
     * 1 = Rough (Low rumble, chaotic sound / Strong vibration)
     */
    public feel(roughness: number) {
        this.initAudio();

        // Haptics: Vibrate if roughness is high
        if (roughness > 0.5 && Math.random() < roughness) {
            this.pulse(10 + (roughness * 20)); // Stronger longer pulses
        }

        // Sonification
        this.playTone(roughness);
    }

    private playTone(roughness: number) {
        if (!this.audioCtx) return;

        // Stop previous
        if (this.oscillator) {
            try { this.oscillator.stop(); } catch (e) { }
        }

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        // Configuration based on Roughness
        // Rough = Sawtooth/Square (Gritty), Low Freq
        // Smooth = Sine (Pure), High Freq -> Actually for "Correctness" maybe high is better

        osc.type = roughness > 0.5 ? 'sawtooth' : 'sine';

        // Frequency mapping: 
        // Smooth (0) -> 440Hz (A4) 
        // Rough (1) -> 50Hz (Low rumble) +/- random detune for chaos
        const baseFreq = 440 - (roughness * 390);
        const detune = roughness > 0.5 ? (Math.random() * 100 - 50) : 0;

        osc.frequency.value = baseFreq + detune;

        // Volume envelope
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);

        this.oscillator = osc;
    }
}
