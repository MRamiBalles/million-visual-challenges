import { motion } from "framer-motion";
import { Circle, Palette, FileText, Package, Scale, Rocket } from "lucide-react";

interface ProblemNavProps {
  activeSection: number;
  onSectionChange: (index: number) => void;
}

const problems = [
  { icon: Circle, label: "Consistency", color: "hsl(195, 100%, 50%)" },
  { icon: Palette, label: "Creativity", color: "hsl(280, 100%, 70%)" },
  { icon: FileText, label: "Prompt Complexity", color: "hsl(30, 100%, 60%)" },
  { icon: Package, label: "Brand Dilution", color: "hsl(340, 100%, 65%)" },
  { icon: Scale, label: "Bias", color: "hsl(120, 60%, 50%)" },
  { icon: Rocket, label: "Scalability", color: "hsl(260, 100%, 65%)" },
];

export const ProblemNav = ({ activeSection, onSectionChange }: ProblemNavProps) => {
  return (
    <nav className="sticky top-0 z-50 bg-gradient-header border-b border-border backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4 overflow-x-auto">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            const isActive = activeSection === index;
            
            return (
              <motion.button
                key={index}
                onClick={() => onSectionChange(index)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all relative group min-w-fit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: isActive ? `${problem.color}20` : 'transparent',
                }}
              >
                <motion.div
                  animate={{
                    rotate: isActive ? 360 : 0,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon 
                    className="w-5 h-5" 
                    style={{ color: problem.color }}
                  />
                </motion.div>
                
                <motion.span
                  className="text-sm font-medium text-foreground whitespace-nowrap"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ 
                    opacity: isActive ? 1 : 0,
                    width: isActive ? 'auto' : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {problem.label}
                </motion.span>

                <motion.div
                  className="absolute inset-0 rounded-lg border-2"
                  style={{ borderColor: problem.color }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
