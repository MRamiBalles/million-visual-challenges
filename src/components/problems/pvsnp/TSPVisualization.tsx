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

type Algorithm = "random" | "genetic" | "annealing";

const generateCities = (count: number): City[] => {
  const cities: City[] = [];
  const names = [
    "Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", 
    "Málaga", "Murcia", "Palma", "Bilbao", "Alicante",
    "Córdoba", "Valladolid", "Vigo", "Gijón", "Hospitalet",
    "Vitoria", "Granada", "Elche", "Oviedo", "Badalona"
  ];
  
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

// Genetic Algorithm helpers
const createPopulation = (size: number, cityCount: number): number[][] => {
  const population: number[][] = [];
  for (let i = 0; i < size; i++) {
    const individual = Array.from({ length: cityCount }, (_, i) => i);
    for (let j = individual.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [individual[j], individual[k]] = [individual[k], individual[j]];
    }
    population.push(individual);
  }
  return population;
};

const crossover = (parent1: number[], parent2: number[]): number[] => {
  const start = Math.floor(Math.random() * parent1.length);
  const end = start + Math.floor(Math.random() * (parent1.length - start));
  
  const child = new Array(parent1.length).fill(-1);
  for (let i = start; i < end; i++) {
    child[i] = parent1[i];
  }
  
  let parent2Index = 0;
  for (let i = 0; i < child.length; i++) {
    if (child[i] === -1) {
      while (child.includes(parent2[parent2Index])) {
        parent2Index++;
      }
      child[i] = parent2[parent2Index];
      parent2Index++;
    }
  }
  
  return child;
};

const mutate = (route: number[], mutationRate: number): number[] => {
  const newRoute = [...route];
  if (Math.random() < mutationRate) {
    const i = Math.floor(Math.random() * newRoute.length);
    const j = Math.floor(Math.random() * newRoute.length);
    [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
  }
  return newRoute;
};

// Simulated Annealing helpers
const swap2Opt = (route: number[]): number[] => {
  const newRoute = [...route];
  const i = Math.floor(Math.random() * newRoute.length);
  const j = Math.floor(Math.random() * newRoute.length);
  if (i !== j) {
    [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
  }
  return newRoute;
};

const acceptanceProbability = (currentDistance: number, newDistance: number, temperature: number): number => {
  if (newDistance < currentDistance) return 1.0;
  return Math.exp((currentDistance - newDistance) / temperature);
};

export const TSPVisualization = () => {
  const [cityCount, setCityCount] = useState(15);
  const [cities, setCities] = useState<City[]>(() => generateCities(15));
  const [currentRoute, setCurrentRoute] = useState<number[]>(() => Array.from({ length: 15 }, (_, i) => i));
  const [bestRoute, setBestRoute] = useState<number[]>(() => Array.from({ length: 15 }, (_, i) => i));
  const [bestDistance, setBestDistance] = useState<number>(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [algorithm, setAlgorithm] = useState<Algorithm>("genetic");
  const [population, setPopulation] = useState<number[][]>([]);
  const [temperature, setTemperature] = useState(100);

  useEffect(() => {
    const initial = calculateTotalDistance(cities, currentRoute);
    setBestDistance(initial);
  }, [cities]);

  const regenerateCities = (count: number) => {
    const newCities = generateCities(count);
    const newRoute = Array.from({ length: count }, (_, i) => i);
    setCities(newCities);
    setCityCount(count);
    setCurrentRoute(newRoute);
    setBestRoute(newRoute);
    setBestDistance(calculateTotalDistance(newCities, newRoute));
    setAttempts(0);
    setIsOptimizing(false);
  };

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

  const runGeneticAlgorithm = () => {
    if (population.length === 0) {
      setPopulation(createPopulation(50, cities.length));
    }

    const newPop = [...population];
    const fitness = newPop.map(ind => 1 / calculateTotalDistance(cities, ind));
    const totalFitness = fitness.reduce((a, b) => a + b, 0);

    const nextGen: number[][] = [];
    for (let i = 0; i < newPop.length; i++) {
      let roulette = Math.random() * totalFitness;
      let parent1Index = 0;
      while (roulette > 0 && parent1Index < fitness.length) {
        roulette -= fitness[parent1Index];
        parent1Index++;
      }
      parent1Index = Math.max(0, parent1Index - 1);

      roulette = Math.random() * totalFitness;
      let parent2Index = 0;
      while (roulette > 0 && parent2Index < fitness.length) {
        roulette -= fitness[parent2Index];
        parent2Index++;
      }
      parent2Index = Math.max(0, parent2Index - 1);

      const child = crossover(newPop[parent1Index], newPop[parent2Index]);
      nextGen.push(mutate(child, 0.05));
    }

    setPopulation(nextGen);
    
    const bestInGen = nextGen.reduce((best, current) => {
      const currentDist = calculateTotalDistance(cities, current);
      const bestDist = calculateTotalDistance(cities, best);
      return currentDist < bestDist ? current : best;
    });

    const dist = calculateTotalDistance(cities, bestInGen);
    setCurrentRoute(bestInGen);
    if (dist < bestDistance) {
      setBestDistance(dist);
      setBestRoute(bestInGen);
    }
    setAttempts(a => a + 1);
  };

  const runSimulatedAnnealing = () => {
    const newRoute = swap2Opt(currentRoute);
    const currentDist = calculateTotalDistance(cities, currentRoute);
    const newDist = calculateTotalDistance(cities, newRoute);

    if (acceptanceProbability(currentDist, newDist, temperature) > Math.random()) {
      setCurrentRoute(newRoute);
      if (newDist < bestDistance) {
        setBestDistance(newDist);
        setBestRoute(newRoute);
      }
    }

    setTemperature(t => Math.max(0.01, t * 0.995));
    setAttempts(a => a + 1);
  };

  const reset = () => {
    const initial = Array.from({ length: cities.length }, (_, i) => i);
    setCurrentRoute(initial);
    setBestRoute(initial);
    setBestDistance(calculateTotalDistance(cities, initial));
    setAttempts(0);
    setIsOptimizing(false);
    setPopulation([]);
    setTemperature(100);
  };

  useEffect(() => {
    if (!isOptimizing) return;
    
    const interval = setInterval(() => {
      if (algorithm === "random") {
        shuffleRoute();
      } else if (algorithm === "genetic") {
        runGeneticAlgorithm();
      } else if (algorithm === "annealing") {
        runSimulatedAnnealing();
      }
    }, algorithm === "random" ? 100 : 50);

    return () => clearInterval(interval);
  }, [isOptimizing, currentRoute, bestDistance, algorithm, population, temperature]);

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Ciudades</div>
            <div className="text-2xl font-bold text-foreground">{cities.length}</div>
          </div>

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
            <div className="text-sm text-muted-foreground">
              {algorithm === "genetic" ? "Generaciones" : algorithm === "annealing" ? "Iteraciones" : "Intentos"}
            </div>
            <div className="text-2xl font-bold text-accent">
              {attempts.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Número de ciudades</label>
          <div className="flex gap-2">
            {[10, 15, 20].map(count => (
              <Button
                key={count}
                onClick={() => regenerateCities(count)}
                disabled={isOptimizing}
                variant={cityCount === count ? "default" : "outline"}
                size="sm"
              >
                {count}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Algoritmo de optimización</label>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setAlgorithm("random")}
              disabled={isOptimizing}
              variant={algorithm === "random" ? "default" : "outline"}
              size="sm"
            >
              🎲 Aleatorio
            </Button>
            <Button
              onClick={() => setAlgorithm("genetic")}
              disabled={isOptimizing}
              variant={algorithm === "genetic" ? "default" : "outline"}
              size="sm"
            >
              🧬 Genético
            </Button>
            <Button
              onClick={() => setAlgorithm("annealing")}
              disabled={isOptimizing}
              variant={algorithm === "annealing" ? "default" : "outline"}
              size="sm"
            >
              🔥 Recocido Simulado
            </Button>
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
              Optimizar
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

        <div className="bg-muted/30 p-4 rounded-lg space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Complejidad:</strong> Con {cities.length} ciudades hay{" "}
            <strong>{(function factorial(n: number): string {
              if (n <= 20) {
                let result = 1;
                for (let i = 2; i <= n; i++) result *= i;
                return result.toLocaleString();
              }
              const stirling = Math.pow(n / Math.E, n) * Math.sqrt(2 * Math.PI * n);
              return `≈ ${stirling.toExponential(2)}`;
            })(cities.length)}</strong> rutas posibles.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Algoritmo Genético:</strong> Evoluciona una población de soluciones usando selección, cruce y mutación.{" "}
            <strong>Recocido Simulado:</strong> Acepta soluciones peores con probabilidad decreciente para escapar óptimos locales.
          </p>
        </div>
      </div>
    </Card>
  );
};
