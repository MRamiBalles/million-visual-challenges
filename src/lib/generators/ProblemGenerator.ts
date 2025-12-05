/**
 * Simple Seeded RNG
 */
class Random {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    /**
     * Mulberry32 algorithm
     */
    next(): number {
        let t = this.seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    range(min: number, max: number): number {
        return min + this.next() * (max - min);
    }
}

interface Point {
    x: number;
    y: number;
}

export class ProblemGenerator {
    private rng: Random;

    constructor(seedStr: string) {
        // Simple hash of string to number
        let h = 0x811c9dc5;
        for (let i = 0; i < seedStr.length; i++) {
            h ^= seedStr.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        this.rng = new Random(h);
    }

    generateTSP(count: number, width: number, height: number): Point[] {
        const points: Point[] = [];
        const padding = 50;
        for (let i = 0; i < count; i++) {
            points.push({
                x: this.rng.range(padding, width - padding),
                y: this.rng.range(padding, height - padding)
            });
        }
        return points;
    }

    // Future: generateSAT, generateZetaZeros...
}
