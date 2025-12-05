import { CareerGraph } from "@/components/visualizations/CareerGraph";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Careers = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
                <div className="flex items-center mb-6">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
                        Future Pathways
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Connect the abstract mathematics of the Millennium Problems to real-world impact and high-value careers.
                        Click on nodes to explore.
                    </p>
                </div>

                <div className="flex-1 min-h-[600px] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-blue-900/20">
                    <CareerGraph />
                </div>
            </div>
        </div>
    );
};

export default Careers;
