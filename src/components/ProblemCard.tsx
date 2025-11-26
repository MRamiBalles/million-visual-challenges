import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ProblemCardProps {
  title: string;
  definition: string;
  insights: string[];
  demo: ReactNode;
}

export const ProblemCard = ({ title, definition, insights, demo }: ProblemCardProps) => {
  return (
    <div className="grid lg:grid-cols-2 gap-8 container mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-accent bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {definition}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground">Key Insights</h3>
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="text-primary mt-1">▸</span>
                <span className="text-foreground">{insight}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-card rounded-xl p-6 border border-border shadow-card"
      >
        {demo}
      </motion.div>
    </div>
  );
};
