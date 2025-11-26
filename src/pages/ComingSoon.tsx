import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction } from "lucide-react";

const ComingSoon = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const problemName = location.state?.problemName || "Este Problema";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="mb-8 inline-block"
          >
            <Construction className="w-24 h-24 text-primary" />
          </motion.div>

          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Próximamente
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            La visualización interactiva de <span className="text-primary font-semibold">{problemName}</span> está
            en desarrollo. Pronto podrás explorar este fascinante problema matemático con
            gráficos 3D, animaciones y explicaciones multinivel.
          </p>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Mientras tanto, explora los otros problemas del milenio
            </p>
            
            <Button
              size="lg"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al Inicio
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;
