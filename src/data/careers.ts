export interface CareerNode {
    id: string;
    label: string;
    salary: string;
    description: string;
    type: 'problem' | 'career';
    connections: string[]; // IDs of connected nodes
}

export const careerConstellationData: CareerNode[] = [
    // --- Problems (Stars) ---
    { id: 'pvsnp', label: 'P vs NP', type: 'problem', salary: '$∞', description: 'The fundamental question of efficiency.', connections: [] },
    { id: 'navier', label: 'Navier-Stokes', type: 'problem', salary: '$1M (Prize)', description: 'Fluid dynamics and turbulence.', connections: [] },
    { id: 'riemann', label: 'Riemann Hypothesis', type: 'problem', salary: '$1M (Prize)', description: 'Prime numbers and cryptography.', connections: [] },
    { id: 'hodge', label: 'Hodge Conjecture', type: 'problem', salary: '$1M (Prize)', description: 'Algebraic geometry and topology.', connections: [] },
    { id: 'yangmills', label: 'Yang-Mills', type: 'problem', salary: '$1M (Prize)', description: 'Particle physics and quantum fields.', connections: [] },
    { id: 'poincare', label: 'Poincaré', type: 'problem', salary: 'Solved!', description: 'Topology of 3D spheres.', connections: [] },

    // --- P vs NP Cluster ---
    { id: 'cryptographer', label: 'Cryptographer', type: 'career', salary: '$120k - $250k', description: 'Design secure systems resistant to quantum attacks.', connections: ['pvsnp', 'riemann'] },
    { id: 'logistics', label: 'Logistics Architect', type: 'career', salary: '$140k - $300k', description: 'Optimize global supply chains (TSP solvers).', connections: ['pvsnp'] },
    { id: 'bioinformatics', label: 'Bioinformatics AI', type: 'career', salary: '$95k - $180k', description: 'Protein folding prediction (NP-Hard).', connections: ['pvsnp'] },
    { id: 'chip_design', label: 'VLSI Chip Designer', type: 'career', salary: '$110k - $200k', description: 'Optimizing transistor layout (SAT problems).', connections: ['pvsnp'] },
    { id: 'blockchain', label: 'Blockchain Protocol Eng', type: 'career', salary: '$150k - $400k', description: 'Consensus algorithms and zero-knowledge proofs.', connections: ['pvsnp'] },

    // --- Navier-Stokes Cluster ---
    { id: 'aerodynamics', label: 'F1 Aerodynamics Leads', type: 'career', salary: '$150k - $400k', description: 'Design faster cars by mastering air flow.', connections: ['navier'] },
    { id: 'vfx', label: 'VFX Physics Artist', type: 'career', salary: '$80k - $150k', description: 'Simulate realistic water, fire, and explosions.', connections: ['navier'] },
    { id: 'climate', label: 'Climate Modeler', type: 'career', salary: '$90k - $160k', description: 'Predict future weather patterns.', connections: ['navier'] },
    { id: 'pipeline', label: 'Pipeline Engineer', type: 'career', salary: '$100k - $180k', description: 'Oil & Gas flow optimization.', connections: ['navier'] },
    { id: 'medical_flow', label: 'Hemodynamics Researcher', type: 'career', salary: '$90k - $140k', description: 'Simulating blood flow for artificial hearts.', connections: ['navier'] },

    // --- Riemann Cluster ---
    { id: 'quant', label: 'HFT Quant Trader', type: 'career', salary: '$200k - $800k+', description: 'Algorithmic trading using number theory.', connections: ['riemann'] },
    { id: 'security_research', label: 'NSA Mathematician', type: 'career', salary: '$100k - $160k', description: 'National security encryption analysis.', connections: ['riemann'] },
    { id: 'stat_phys', label: 'Statistical Physicist', type: 'career', salary: '$80k - $150k', description: 'Random matrix theory applications.', connections: ['riemann'] },

    // --- Hodge & Poincare Cluster (Geometry/Topology) ---
    { id: 'robotics', label: 'SLAM Robotics Eng', type: 'career', salary: '$130k - $210k', description: '3D mapping and navigation.', connections: ['hodge', 'poincare'] },
    { id: 'game_engine', label: 'Game Engine Dev', type: 'career', salary: '$100k - $190k', description: '3D rendering pipelines and collision.', connections: ['hodge'] },
    { id: 'data_top', label: 'Topological Data Analyst', type: 'career', salary: '$110k - $170k', description: 'Finding shape in high-dimensional data.', connections: ['poincare', 'hodge'] },
    { id: 'string_theory', label: 'String Theorist', type: 'career', salary: '$70k - $120k', description: 'Modeling dimensions of the universe.', connections: ['yangmills', 'hodge'] },

    // --- Yang-Mills Cluster ---
    { id: 'quantum_compute', label: 'Quantum Hardware Eng', type: 'career', salary: '$140k - $250k', description: 'Control systems for qubits.', connections: ['yangmills', 'pvsnp'] },
    { id: 'materials', label: 'Computational Materials', type: 'career', salary: '$100k - $160k', description: 'Simulating new battery materials.', connections: ['yangmills'] },
];
