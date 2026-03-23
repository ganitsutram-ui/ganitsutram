/*
Ganitsutram | AITDL Network © 2026 | Vikram Samvat 2083
Author: Jawahar R Mallah
Website: https://www.aitdl.com
Contact: aitdlnetwork@outlook.com | jawahar.mallah@gmail.com
*/

/**
 * Vedic Mathematical Engine (Client-side)
 * Provides results and step-by-step breakdowns for common sutras.
 */

export interface SolveResult {
    result: number | string;
    steps?: string[];
    inputA?: number | string;
    inputB?: number | string;
    input?: number | string;
}

export const VedicEngine = {
    solve: (operation: string, inputA: string, inputB?: string): SolveResult => {
        const numA = parseInt(inputA);
        const numB = inputB ? parseInt(inputB) : 0;

        switch (operation) {
            case 'digital-root':
                return { result: VedicEngine.calculateDigitalRoot(numA), input: numA };
            case 'digital-root-steps':
                return VedicEngine.calculateDigitalRootSteps(numA);

            case 'squares-ending-5':
                return { result: numA * numA, input: numA };
            case 'squares-ending-5-steps':
                return VedicEngine.calculateSquare5Steps(numA);

            case 'multiply-by-11':
                return { result: numA * 11, input: numA };
            case 'multiply-by-11-steps':
                return VedicEngine.calculateMultiply11Steps(numA);

            case 'nikhilam':
                return { result: numA * numB, inputA: numA, inputB: numB };
            case 'nikhilam-steps':
                return VedicEngine.calculateNikhilamSteps(numA, numB);

            case 'urdhva':
                return { result: numA * numB, inputA: numA, inputB: numB };
            case 'urdhva-steps':
                return VedicEngine.calculateUrdhvaSteps(numA, numB);

            default:
                throw new Error(`Operation ${operation} not implemented in local engine.`);
        }
    },

    /**
     * Beejank (Digital Root)
     */
    calculateDigitalRoot: (n: number): number => {
        if (n === 0) return 0;
        return ((n - 1) % 9) + 1;
    },

    calculateDigitalRootSteps: (n: number): SolveResult => {
        const result = VedicEngine.calculateDigitalRoot(n);
        const digits = n.toString().split('').map(Number);
        const sum = digits.reduce((a, b) => a + b, 0);
        
        const steps = [
            `Digits: ${digits.join(', ')}`,
            `Sum: ${digits.join(' + ')} = ${sum}`
        ];

        if (sum > 9) {
            const sumDigits = sum.toString().split('').map(Number);
            const finalSum = sumDigits.reduce((a, b) => a + b, 0);
            steps.push(`Reduce: ${sumDigits.join(' + ')} = ${finalSum}`);
        }

        return { result, steps, input: n };
    },

    /**
     * Ekadhikena Purvena (Squares Ending in 5)
     */
    calculateSquare5Steps: (n: number): SolveResult => {
        const result = n * n;
        const prefix = Math.floor(n / 10);
        const ekadhika = prefix + 1;
        const lhs = prefix * ekadhika;
        const rhs = 25;

        return {
            result,
            steps: [
                `Prefix: ${prefix}`,
                `Ekadhika (Prefix + 1): ${ekadhika}`,
                `LHS (${prefix} × ${ekadhika}): ${lhs}`,
                `RHS (5²): ${rhs}`,
                `Combine: ${lhs} | ${rhs} = ${result}`
            ],
            input: n
        };
    },

    /**
     * Multiply by 11
     */
    calculateMultiply11Steps: (n: number): SolveResult => {
        const result = n * 11;
        const digits = n.toString().split('').map(Number);
        const steps = [`First digit: ${digits[0]}`, `Last digit: ${digits[digits.length - 1]}`];

        for (let i = 0; i < digits.length - 1; i++) {
            steps.push(`Add neighbors: ${digits[i]} + ${digits[i+1]} = ${digits[i] + digits[i+1]}`);
        }
        
        steps.push(`Combine digits with carry: ${result}`);
        
        return { result, steps, input: n };
    },

    /**
     * Nikhilam (All from 9, last from 10)
     */
    calculateNikhilamSteps: (a: number, b: number): SolveResult => {
        const result = a * b;
        const base = Math.pow(10, Math.ceil(Math.log10(Math.max(a, b))));
        const devA = a - base;
        const devB = b - base;
        
        const lhs = (a + devB);
        const rhs = devA * devB;
        
        return {
            result,
            steps: [
                `Base: ${base}`,
                `Deviations: ${devA}, ${devB}`,
                `Cross Add: ${a} + (${devB}) = ${lhs}`,
                `Multiply Devs: ${devA} × ${devB} = ${rhs}`,
                `Result: ${lhs} | ${rhs} = ${result}`
            ],
            inputA: a,
            inputB: b
        };
    },

    /**
     * Urdhva Tiryak (Vertical and Crosswise)
     */
    calculateUrdhvaSteps: (a: number, b: number): SolveResult => {
        const result = a * b;
        // Simple 2-digit implementation for now
        const a1 = Math.floor(a / 10);
        const a0 = a % 10;
        const b1 = Math.floor(b / 10);
        const b0 = b % 10;

        return {
            result,
            steps: [
                `Vertical Right: ${a0} × ${b0} = ${a0 * b0}`,
                `Cross: (${a1}×${b0}) + (${a0}×${b1}) = ${(a1*b0) + (a0*b1)}`,
                `Vertical Left: ${a1} × ${b1} = ${a1 * b1}`,
                `Apply carries to get: ${result}`
            ],
            inputA: a,
            inputB: b
        };
    }
};
