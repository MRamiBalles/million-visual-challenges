import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const palettes = [
  { name: "Default", colors: ["#3b82f6", "#8b5cf6", "#ec4899"] },
  { name: "Ocean", colors: ["#06b6d4", "#0891b2", "#164e63"] },
  { name: "Sunset", colors: ["#f97316", "#ea580c", "#dc2626"] },
  { name: "Forest", colors: ["#10b981", "#059669", "#047857"] },
];

export const ConsistencyDemo = () => {
  const [selectedPalette, setSelectedPalette] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">Select Reference Palette</h3>
        <div className="flex gap-3">
          {palettes.map((palette, index) => (
            <Button
              key={index}
              variant={selectedPalette === index ? "default" : "secondary"}
              onClick={() => setSelectedPalette(index)}
              className="flex-1"
            >
              {palette.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 16 }).map((_, index) => (
          <motion.div
            key={index}
            className="aspect-square rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${palettes[selectedPalette].colors[0]}, ${palettes[selectedPalette].colors[1]}, ${palettes[selectedPalette].colors[2]})`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          />
        ))}
      </div>
    </div>
  );
};
