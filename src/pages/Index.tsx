import { useState } from "react";
import { motion } from "framer-motion";
import { ProblemNav } from "@/components/ProblemNav";
import { ProblemCard } from "@/components/ProblemCard";
import { ConsistencyDemo } from "@/components/problems/ConsistencyDemo";
import { CreativityDemo } from "@/components/problems/CreativityDemo";
import { PromptComplexityDemo } from "@/components/problems/PromptComplexityDemo";
import { BrandDilutionDemo } from "@/components/problems/BrandDilutionDemo";
import { BiasDemo } from "@/components/problems/BiasDemo";
import { ScalabilityDemo } from "@/components/problems/ScalabilityDemo";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const problems = [
  {
    title: "Maintaining Visual Consistency",
    definition: "AI models produce divergent styles across generations, breaking brand identity.",
    insights: [
      "Use reference images + style-tokens to anchor visual output",
      "Post-process with style-transfer pipelines for unified aesthetics",
      "Implement feedback loops to refine consistency over iterations",
    ],
    demo: <ConsistencyDemo />,
  },
  {
    title: "Lack of Genuine Creativity & Human Touch",
    definition: "AI outputs can feel generic, lacking emotional nuance and cultural depth.",
    insights: [
      "Blend AI suggestions with human-curated edits for authenticity",
      "Use creativity-boost prompts that inject cultural context",
      "Maintain human oversight for final creative decisions",
    ],
    demo: <CreativityDemo />,
  },
  {
    title: "Complexity & Ambiguity of Prompt Engineering",
    definition: "Vague or overly complex prompts lead to irrelevant or unpredictable outputs.",
    insights: [
      "Adopt a Prompt-Template hierarchy: Goal → Style → Constraints",
      "Validate prompts with a preview sandbox before full generation",
      "Document successful prompt patterns for team consistency",
    ],
    demo: <PromptComplexityDemo />,
  },
  {
    title: "Generic Output & Brand Dilution",
    definition: "Without strict guidelines, AI produces bland designs that erode brand voice.",
    insights: [
      "Encode brand assets (color palette, typography) as style-guides",
      "Use brand-lock tokens to enforce visual constraints",
      "Regularly audit outputs for brand alignment",
    ],
    demo: <BrandDilutionDemo />,
  },
  {
    title: "Ethical Biases & Flawed Data",
    definition: "Training data biases can surface as stereotypical or inappropriate visuals.",
    insights: [
      "Pre-filter datasets for representation and diversity",
      "Apply bias-mitigation layers in generation pipeline",
      "Provide safety-check scores for content review",
    ],
    demo: <BiasDemo />,
  },
  {
    title: "Challenges in Scaling & Adaptability",
    definition: "Large-scale generation strains model memory, context-window, and regional compliance.",
    insights: [
      "Chunk prompts and reuse memory-tokens for efficiency",
      "Deploy region-specific style presets for localization",
      "Monitor resource usage and optimize batch processing",
    ],
    demo: <ScalabilityDemo />,
  },
];

const citations = [
  { name: "AISTudios", url: "https://www.aistudios.com" },
  { name: "Venngage", url: "https://venngage.com" },
  { name: "Unite.ai", url: "https://unite.ai" },
  { name: "SurgeGrowth", url: "https://surgegrowth.ai" },
  { name: "GodofPrompt.ai", url: "https://godofprompt.ai" },
  { name: "Lovable.dev", url: "https://lovable.dev" },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-header border-b border-border py-12"
      >
        <div className="container mx-auto px-6 text-center">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-accent bg-clip-text text-transparent"
          >
            The Six Problems of the Million
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Exploring the canonical challenges that arise when scaling AI-generated visual content to a million outputs
          </motion.p>
        </div>
      </motion.header>

      <ProblemNav activeSection={activeSection} onSectionChange={setActiveSection} />

      <main>
        <ProblemCard {...problems[activeSection]} />
      </main>

      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-gradient-header border-t border-border py-12"
      >
        <div className="container mx-auto px-6">
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-semibold text-foreground">Sources & References</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {citations.map((citation, index) => (
                <motion.a
                  key={index}
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-card rounded-lg border border-border hover:border-primary transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-sm text-foreground">{citation.name}</span>
                </motion.a>
              ))}
            </div>
            <Button size="lg" className="shadow-glow">
              <Download className="w-5 h-5 mr-2" />
              Download Prompt Guide
            </Button>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
