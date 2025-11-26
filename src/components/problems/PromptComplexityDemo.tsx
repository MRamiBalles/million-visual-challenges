import { useState } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle } from "lucide-react";

const promptSections = [
  { label: "Goal", placeholder: "What do you want to create?" },
  { label: "Style", placeholder: "Describe the visual style..." },
  { label: "Constraints", placeholder: "Any specific requirements?" },
];

export const PromptComplexityDemo = () => {
  const [prompts, setPrompts] = useState(["", "", ""]);

  const completionScore = prompts.filter(p => p.trim().length > 0).length;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {promptSections.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: prompts[index].trim().length > 0 ? [1, 1.2, 1] : 1,
                  opacity: prompts[index].trim().length > 0 ? 1 : 0.3,
                }}
              >
                {prompts[index].trim().length > 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-muted-foreground" />
                )}
              </motion.div>
              <label className="text-sm font-medium text-foreground">{section.label}</label>
            </div>
            <Textarea
              placeholder={section.placeholder}
              value={prompts[index]}
              onChange={(e) => {
                const newPrompts = [...prompts];
                newPrompts[index] = e.target.value;
                setPrompts(newPrompts);
              }}
              className="resize-none"
              rows={2}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="p-4 rounded-lg border-2"
        animate={{
          borderColor: completionScore === 3 ? "hsl(195, 100%, 50%)" : "hsl(var(--border))",
          backgroundColor: completionScore === 3 ? "hsl(195, 100%, 50%, 0.1)" : "hsl(var(--card))",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Prompt Quality</span>
          <span className="text-lg font-bold text-primary">{Math.round((completionScore / 3) * 100)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-accent"
            initial={{ width: 0 }}
            animate={{ width: `${(completionScore / 3) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>
    </div>
  );
};
