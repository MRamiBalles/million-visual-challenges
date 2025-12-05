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

    // --- Careers (Planets) ---
    // P vs NP Connected
    { id: 'cryptographer', label: 'Cryptographer', type: 'career', salary: '$120k - $250k', description: 'Design secure systems resistant to quantum attacks.', connections: ['pvsnp', 'riemann'] },
    { id: 'logistics', label: 'Logistics AI Architect', type: 'career', salary: '$140k - $300k', description: 'Optimize global supply chains and routing (TSP solvers).', connections: ['pvsnp'] },
    { id: 'bioinformatics', label: 'Bioinformatics Scientist', type: 'career', salary: '$95k - $180k', description: 'Protein folding prediction (NP-Hard).', connections: ['pvsnp'] },

    // Navier-Stokes Connected
    { id: 'aerodynamics', label: 'F1 Aerodynamics Engineer', type: 'career', salary: '$100k - $400k', description: 'Design faster cars by mastering air flow.', connections: ['navier'] },
    { id: 'vfx', label: 'VFX Physics Sim Artist', type: 'career', salary: '$80k - $150k', description: 'Simulate realistic water, fire, and explosions for movies.', connections: ['navier'] },
    { id: 'climate', label: 'Climate Modeler', type: 'career', salary: '$90k - $160k', description: 'Predict future weather patterns using fluid equations.', connections: ['navier'] },

    // Riemann Connected
    { id: 'quant', label: 'Quant Trader', type: 'career', salary: '$200k - $800k+', description: 'Algorithmic trading using high-level number theory models.', connections: ['riemann'] },
    { id: 'security', label: 'Cybersecurity Researcher', type: 'career', salary: '$100k - $220k', description: 'Break and build encryption protocols.', connections: ['riemann', 'pvsnp'] },

    // Hodge Connected
    { id: 'robotics', label: 'Robotics Perception Eng', type: 'career', salary: '$130k - $210k', description: ' geometric mapping of 3D spaces.', connections: ['hodge'] },
];
