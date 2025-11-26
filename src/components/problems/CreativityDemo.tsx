import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";

export const CreativityDemo = () => {
  const [humanTouch, setHumanTouch] = useState([50]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-foreground">Human Touch</h3>
          <span className="text-primary font-bold">{humanTouch[0]}%</span>
        </div>
        <Slider
          value={humanTouch}
          onValueChange={setHumanTouch}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <motion.div
          className="space-y-2"
          animate={{ opacity: 1 - humanTouch[0] / 100 }}
        >
          <p className="text-sm text-muted-foreground text-center">AI-Only</p>
          <div className="aspect-square rounded-lg bg-gradient-to-br from-muted to-secondary border-2 border-border flex items-center justify-center">
            <span className="text-6xl">🤖</span>
          </div>
        </motion.div>

        <motion.div
          className="space-y-2"
          animate={{ opacity: humanTouch[0] / 100 }}
        >
          <p className="text-sm text-muted-foreground text-center">Human-Enhanced</p>
          <div className="aspect-square rounded-lg bg-gradient-accent border-2 border-primary shadow-glow flex items-center justify-center">
            <span className="text-6xl">✨</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="p-4 rounded-lg bg-card border border-border"
        animate={{
          borderColor: `hsl(195, 100%, ${50 + humanTouch[0] / 2}%)`,
        }}
      >
        <p className="text-sm text-foreground">
          {humanTouch[0] < 30 && "Generic AI output - lacks emotional depth and cultural context."}
          {humanTouch[0] >= 30 && humanTouch[0] < 70 && "Balanced blend - AI efficiency meets human creativity."}
          {humanTouch[0] >= 70 && "Human-curated excellence - rich storytelling and emotional nuance."}
        </p>
      </motion.div>
    </div>
  );
};
