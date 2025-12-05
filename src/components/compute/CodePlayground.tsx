import { useState, useEffect, useRef } from 'react';
import { usePyodide } from '@/lib/pyodide/usePyodide';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Play, Terminal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CodePlaygroundProps {
    initialCode?: string;
    title?: string;
    description?: string;
}

const EXAMPLES = {
    "hello": {
        label: "Hello World",
        code: `print("Hello from the Infinite Lab!")\nprint("This is Python running in your browser.")\nimport sys\nprint(f"Python Version: {sys.version}")`
    },
    "primes": {
        label: "Prime Number Sieve",
        code: `def sieve(n):\n    primes = []\n    for i in range(2, n + 1):\n        is_prime = True\n        for j in range(2, int(i ** 0.5) + 1):\n            if i % j == 0:\n                is_prime = False\n                break\n        if is_prime:\n            primes.append(i)\n    return primes\n\nprint(f"Primes under 50: {sieve(50)}")`
    },
    "fibonacci": {
        label: "Fibonacci Sequence",
        code: `def fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        print(a, end=' ')\n        a, b = b, a + b\n    print()\n\nprint("First 10 Fibonacci numbers:")\nfib(10)`
    },
    "zeta": {
        label: "Riemann Zeta Approx",
        code: `def zeta_partial(s, n_terms=100):\n    return sum(1 / (n ** s) for n in range(1, n_terms))\n\nprint("Approximating Zeta(2)...")\napprox = zeta_partial(2, 1000)\nprint(f"Approx: {approx}")\nprint(f"Target: {3.14159**2 / 6}")`
    }
};

export const CodePlayground = ({ initialCode = EXAMPLES.hello.code, title = "Millennium Notebook", description = "Run Python code directly in your browser." }: CodePlaygroundProps) => {
    const { pyodide, isLoading, error, runPython } = usePyodide();
    const [code, setCode] = useState(initialCode);
    const [output, setOutput] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const handleRun = async () => {
        if (!pyodide) return;
        setIsRunning(true);
        setOutput([]); // Clear previous output

        try {
            // Capture stdout
            pyodide.setStdout({
                batched: (msg: string) => {
                    setOutput(prev => [...prev, msg]);
                }
            });

            const result = await pyodide.runPythonAsync(code);

            // If result is not undefined/null and not already printed via stdout
            if (result !== undefined) {
                setOutput(prev => [...prev, `[Result] ${result}`]);
            }
            toast.success("Executed successfully");
        } catch (err: any) {
            console.error(err);
            setOutput(prev => [...prev, `Error: ${err.message}`]);
            toast.error("Execution failed");
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <Card className="w-full bg-slate-950 border-slate-800 text-slate-200">
            <CardHeader className="pb-2 border-b border-slate-800">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Terminal className="w-5 h-5 text-green-400" />
                            {title}
                        </CardTitle>
                        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                            onChange={(e) => {
                                const key = e.target.value as keyof typeof EXAMPLES;
                                if (EXAMPLES[key]) setCode(EXAMPLES[key].code);
                            }}
                            defaultValue="hello"
                        >
                            {Object.entries(EXAMPLES).map(([key, ex]) => (
                                <option key={key} value={key}>{ex.label}</option>
                            ))}
                        </select>
                        <div className="h-4 w-px bg-slate-800" />
                        {isLoading ? (
                            <span className="flex items-center text-xs text-yellow-500">
                                <Loader2 className="w-3 h-3 animate-spin mr-1" /> Loading Engine...
                            </span>
                        ) : (
                            <span className="flex items-center text-xs text-green-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" /> Ready
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 grid md:grid-cols-2 h-[500px]">
                {/* Editor Area */}
                <div className="flex flex-col border-r border-slate-800 h-full">
                    <div className="bg-slate-900 p-2 text-xs text-slate-500 flex justify-between items-center">
                        <span>main.py</span>
                        <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setCode('')}>
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 bg-slate-950 text-slate-100 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-slate-700"
                        spellCheck={false}
                    />
                    <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                        <Button
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-mono"
                            onClick={handleRun}
                            disabled={isLoading || isRunning}
                        >
                            {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                            Run Code
                        </Button>
                    </div>
                </div>

                {/* Console Output */}
                <div className="flex flex-col bg-black h-full overflow-hidden">
                    <div className="bg-slate-900 p-2 text-xs text-slate-500 px-4">
                        Output Terminal
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm overflow-y-auto space-y-1">
                        {error && <div className="text-red-500">{error}</div>}
                        {output.length === 0 && !isRunning && !error && (
                            <div className="text-slate-600 italic">... Waiting for output ...</div>
                        )}
                        {output.map((line, i) => (
                            <div key={i} className="break-words whitespace-pre-wrap">
                                <span className="text-slate-500 mr-2">$</span>
                                {line}
                            </div>
                        ))}
                        {isRunning && (
                            <div className="text-green-500 animate-pulse">_</div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
