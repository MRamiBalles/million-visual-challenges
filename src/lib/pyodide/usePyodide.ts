import { useState, useEffect, useRef } from 'react';

declare global {
    interface Window {
        loadPyodide: (config: { indexURL: string }) => Promise<any>;
    }
}

interface PyodideConfig {
    indexURL: string;
}

export const usePyodide = () => {
    const [pyodide, setPyodide] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const pyodideRef = useRef<any>(null);

    useEffect(() => {
        const loadPyodideScript = async () => {
            if (pyodideRef.current) {
                setIsLoading(false);
                return;
            }

            try {
                // Check if script is already loaded
                if (!document.getElementById('pyodide-script')) {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';
                    script.id = 'pyodide-script';
                    script.async = true;
                    document.body.appendChild(script);

                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                    });
                } else {
                    // If script tag exists but global loadPyodide might not be ready, wait a bit
                    // simplified for now assuming it loads fast or is already there
                }

                const pyodideInstance = await window.loadPyodide({
                    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
                });

                pyodideRef.current = pyodideInstance;
                setPyodide(pyodideInstance);
                setIsLoading(false);
            } catch (err: any) {
                console.error("Failed to load Pyodide:", err);
                setError(err.message || 'Failed to load Python runtime');
                setIsLoading(false);
            }
        };

        loadPyodideScript();
    }, []);

    const runPython = async (code: string) => {
        if (!pyodideRef.current) throw new Error("Pyodide not loaded");
        try {
            // Redirect stdout
            pyodideRef.current.setStdout({ batched: (msg: string) => console.log("[Python stdout]", msg) });
            return await pyodideRef.current.runPythonAsync(code);
        } catch (err) {
            throw err;
        }
    };

    return { pyodide, isLoading, error, runPython };
};
