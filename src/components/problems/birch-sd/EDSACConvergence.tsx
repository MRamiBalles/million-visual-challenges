import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from "recharts";
import curvesData from "@/data/curves.json";

// Define Types based on the JSON structure
interface CurveData {
    id: string;
    name: string;
    lmfdb_label: string;
    equation_latex: string;
    rank: number;
    analytic_rank: number;
    notes: string;
    convergence_data: { x: number; y: number }[];
}

export const EDSACConvergence = () => {
    // Assert type for imported JSON
    const curves = curvesData as CurveData[];
    const [selectedCurveId, setSelectedCurveId] = useState<string>(curves[0].id);

    const selectedCurve = useMemo(() => 
        curves.find(c => c.id === selectedCurveId) || curves[0], 
        [selectedCurveId, curves]
    );

    return (
        <Card className="w-full border-primary/20 bg-background/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
                <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <span>Experimento EDSAC (1960s)</span>
                        <Badge variant="outline" className="text-xs font-normal">
                            Evidencia Histórica
                        </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground max-w-lg">
                        Visualización de la convergencia del producto parcial $\prod_{p \le X} \frac{N_p}{p}$ vs $\log(X)$.
                        Esta fue la primera evidencia empírica de la conjetura.
                    </p>
                </div>
                
                <div className="min-w-[200px]">
                    <Select value={selectedCurveId} onValueChange={setSelectedCurveId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar Curva" />
                        </SelectTrigger>
                        <SelectContent>
                            {curves.map(curve => (
                                <SelectItem key={curve.id} value={curve.id}>
                                    {curve.name} (Rango {curve.rank})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={selectedCurve.convergence_data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis 
                                dataKey="x" 
                                stroke="#888" 
                                label={{ value: 'X (Primo superior)', position: 'bottom', offset: 0, fill: "#888" }} 
                            />
                            <YAxis 
                                stroke="#888" 
                                label={{ value: '∏ Np/p', angle: -90, position: 'insideLeft', fill: "#888" }} 
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: "#000", borderColor: "#333" }}
                                itemStyle={{ color: "#fff" }}
                                formatter={(value: number) => [value.toFixed(2), "Valor"]}
                                labelFormatter={(label) => `X = ${label}`}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="y" 
                                stroke="#4488ff" 
                                strokeWidth={3} 
                                dot={{ r: 4, fill: "#4488ff" }}
                                activeDot={{ r: 6 }}
                                animationDuration={1500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
                    <div>
                        <h4 className="font-semibold text-primary mb-2">Ecuación:</h4>
                        <code className="bg-black/20 px-2 py-1 rounded block w-fit mb-2 font-mono">
                            {selectedCurve.equation_latex}
                        </code>
                        <p className="text-muted-foreground">{selectedCurve.notes}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-primary mb-2">Interpretación:</h4>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            {selectedCurve.rank === 0 && (
                                <li><strong>Rango 0:</strong> El producto converge a un valor finito constante.</li>
                            )}
                            {selectedCurve.rank === 1 && (
                                <li><strong>Rango 1:</strong> El producto crece linealmente con $\log(X)$.</li>
                            )}
                            {selectedCurve.rank >= 2 && (
                                <li><strong>Rango {selectedCurve.rank}:</strong> Crecimiento polinomial de grado {selectedCurve.rank} en $\log(X)$ (ej. parabólico para rango 2).</li>
                            )}
                        </ul>
                    </div>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded text-xs text-yellow-200/80">
                   <strong>Nota Histórica:</strong> Birch y Swinnerton-Dyer notaron este comportamiento usando la computadora EDSAC en Cambridge, 
                   lo que llevó a formular que el orden de crecimiento está ligado directamente al rango algebraico.
                </div>
            </CardContent>
        </Card>
    );
};
