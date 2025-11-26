import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shuffle, Play, Pause, RotateCcw } from "lucide-react";

interface City {
  id: number;
  x: number;
  y: number;
  name: string;
}

const generateCities = (count: number): City[] => {
  const cities: City[] = [];
  const names = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga", "Murcia", "Palma"];
  
  for (let i = 0; i < count; i++) {
    cities.push({
      id: i,
      x: Math.random() * 700 + 50,
      y: Math.random() * 400 + 50,
      name: names[i] || `Ciudad ${i + 1}`,
    });
  }
  return cities;
};

const calculateDistance = (city1: City, city2: City): number => {
  const dx = city1.x - city2.x;
  const dy = city1.y - city2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const calculateTotalDistance = (cities: City[], route: number[]): number => {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += calculateDistance(cities[route[i]], cities[route[i + 1]]);
  }
  // Return to start
  total += calculateDistance(cities[route[route.length - 1]], cities[route[0]]);
  return total;
};

export const TSPVisualization = () => {
  const [cities] = useState<City[]>(() => generateCities(8));
  const [currentRoute, setCurrentRoute] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7]);
  const [bestRoute, setBestRoute] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7]);
  const [bestDistance, setBestDistance] = useState<number>(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const initial = calculateTotalDistance(cities, currentRoute);
    setBestDistance(initial);
  }, [cities]);

  const shuffleRoute = () => {
    const newRoute = [...currentRoute];
    for (let i = newRoute.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
    }
    setCurrentRoute(newRoute);
    
    const distance = calculateTotalDistance(cities, newRoute);
    if (distance < bestDistance) {
      setBestDistance(distance);
      setBestRoute(newRoute);
    }
    setAttempts((a) => a + 1);
  };

  const startOptimization = () => {
    setIsOptimizing(true);
  };

  const stopOptimization = () => {
    setIsOptimizing(false);
  };

  const reset = () => {
    const initial = [0, 1, 2, 3, 4, 5, 6, 7];
    setCurrentRoute(initial);
    setBestRoute(initial);
    setBestDistance(calculateTotalDistance(cities, initial));
    setAttempts(0);
    setIsOptimizing(false);
  };

  useEffect(() => {
    if (!isOptimizing) return;
    
    const interval = setInterval(() => {
      shuffleRoute();
    }, 100);

    return () => clearInterval(interval);
  }, [isOptimizing, currentRoute, bestDistance]);

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Distancia actual</div>
            <div className="text-2xl font-bold text-foreground">
              {calculateTotalDistance(cities, currentRoute).toFixed(0)} km
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Mejor distancia</div>
            <div className="text-2xl font-bold text-primary">
              {bestDistance.toFixed(0)} km
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Intentos</div>
            <div className="text-2xl font-bold text-accent">
              {attempts.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={shuffleRoute} disabled={isOptimizing} className="gap-2">
            <Shuffle className="w-4 h-4" />
            Probar Ruta Aleatoria
          </Button>
          
          {!isOptimizing ? (
            <Button onClick={startOptimization} variant="secondary" className="gap-2">
              <Play className="w-4 h-4" />
              Auto-optimizar
            </Button>
          ) : (
            <Button onClick={stopOptimization} variant="secondary" className="gap-2">
              <Pause className="w-4 h-4" />
              Detener
            </Button>
          )}
          
          <Button onClick={reset} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reiniciar
          </Button>
        </div>

        {/* SVG Visualization */}
        <div className="relative w-full aspect-[16/9] bg-muted/20 rounded-lg overflow-hidden border border-border">
          <svg className="w-full h-full" viewBox="0 0 800 500">
            {/* Current Route */}
            {currentRoute.map((cityIndex, i) => {
              const nextIndex = currentRoute[(i + 1) % currentRoute.length];
              const city1 = cities[cityIndex];
              const city2 = cities[nextIndex];
              
              return (
                <motion.line
                  key={`route-${i}`}
                  x1={city1.x}
                  y1={city1.y}
                  x2={city2.x}
                  y2={city2.y}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="2"
                  opacity="0.3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}

            {/* Best Route */}
            {bestRoute.map((cityIndex, i) => {
              const nextIndex = bestRoute[(i + 1) % bestRoute.length];
              const city1 = cities[cityIndex];
              const city2 = cities[nextIndex];
              
              return (
                <motion.line
                  key={`best-${i}`}
                  x1={city1.x}
                  y1={city1.y}
                  x2={city2.x}
                  y2={city2.y}
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                />
              );
            })}

            {/* Cities */}
            {cities.map((city, i) => (
              <g key={city.id}>
                <motion.circle
                  cx={city.x}
                  cy={city.y}
                  r="8"
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--background))"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                />
                <motion.text
                  x={city.x}
                  y={city.y - 15}
                  textAnchor="middle"
                  fill="hsl(var(--foreground))"
                  fontSize="12"
                  fontWeight="600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                >
                  {city.name}
                </motion.text>
              </g>
            ))}
          </svg>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Nota:</strong> Con solo 8 ciudades hay <strong>40,320</strong> rutas posibles.
            Con 20 ciudades: <strong>2.4 × 10¹⁸</strong> rutas. No existe algoritmo eficiente conocido para encontrar
            la solución óptima garantizada en tiempo polinomial.
          </p>
        </div>
      </div>
    </Card>
  );
};
