export interface MillenniumProblem {
  id: number;
  slug: string;
  title: string;
  shortTitle: string;
  field: string;
  year: number;
  status: "solved" | "unsolved";
  solver?: string;
  solverYear?: number;
  prize: string;
  clayPaper: {
    author: string;
    year: number;
    url: string;
  };
  description: {
    simple: string;
    intermediate: string;
    advanced: string;
  };
  keyReferences: {
    title: string;
    authors: string[];
    year: number;
    url: string;
    citations?: number;
  }[];
  visualizations: string[];
  applications: string[];
}

export const millenniumProblems: MillenniumProblem[] = [
  {
    id: 1,
    slug: "pvsnp",
    title: "P versus NP Problem",
    shortTitle: "P vs NP",
    field: "Ciencias de la Computación",
    year: 2000,
    status: "unsolved",
    prize: "$1,000,000",
    clayPaper: {
      author: "Stephen Cook",
      year: 2000,
      url: "https://www.claymath.org/wp-content/uploads/2022/06/pvsnp.pdf",
    },
    description: {
      simple: "Si es fácil verificar que una solución es correcta, ¿también es fácil encontrar esa solución?",
      intermediate: "¿Pueden los problemas cuyas soluciones se verifican rápidamente ser resueltos también rápidamente?",
      advanced: "¿Es toda decisión cuya respuesta puede ser verificada rápidamente por una máquina de Turing determinística también solucionable rápidamente?",
    },
    keyReferences: [
      {
        title: "The P versus NP problem",
        authors: ["Stephen Cook"],
        year: 2000,
        url: "https://www.claymath.org/wp-content/uploads/2022/06/pvsnp.pdf",
      },
      {
        title: "Computers and Intractability: A Guide to the Theory of NP-Completeness",
        authors: ["Michael Garey", "David Johnson"],
        year: 1979,
        url: "https://en.wikipedia.org/wiki/Computers_and_Intractability",
        citations: 50000,
      },
    ],
    visualizations: [
      "TSP Interactive Solver",
      "Complexity Growth Chart",
      "Turing Machine Simulator",
      "NP-Complete Problem Reductions",
    ],
    applications: [
      "Criptografía",
      "Optimización",
      "Inteligencia Artificial",
      "Diseño de Algoritmos",
    ],
  },
  {
    id: 2,
    slug: "riemann",
    title: "Riemann Hypothesis",
    shortTitle: "Hipótesis de Riemann",
    field: "Teoría de Números",
    year: 1859,
    status: "unsolved",
    prize: "$1,000,000",
    clayPaper: {
      author: "Enrico Bombieri",
      year: 2000,
      url: "https://www.claymath.org/millennium-problems/riemann-hypothesis/",
    },
    description: {
      simple: "Los números primos siguen un patrón oculto relacionado con una función matemática especial.",
      intermediate: "Todos los ceros no triviales de la función zeta de Riemann tienen parte real igual a 1/2.",
      advanced: "Todos los ceros no triviales de ζ(s) se encuentran en la línea crítica Re(s) = 1/2.",
    },
    keyReferences: [
      {
        title: "On the Number of Primes Less Than a Given Magnitude",
        authors: ["Bernhard Riemann"],
        year: 1859,
        url: "https://en.wikipedia.org/wiki/On_the_Number_of_Primes_Less_Than_a_Given_Magnitude",
        citations: 10000,
      },
      {
        title: "The Riemann Hypothesis",
        authors: ["Enrico Bombieri"],
        year: 2000,
        url: "https://www.claymath.org/millennium-problems/riemann-hypothesis/",
      },
    ],
    visualizations: [
      "Zeta Function 3D Plot",
      "Critical Line Explorer",
      "Prime Number Spiral",
      "Non-trivial Zeros Distribution",
    ],
    applications: [
      "Distribución de Primos",
      "Criptografía",
      "Física Cuántica",
      "Teoría de Números",
    ],
  },
  {
    id: 3,
    slug: "navier-stokes",
    title: "Navier-Stokes Existence and Smoothness",
    shortTitle: "Navier-Stokes",
    field: "Ecuaciones Diferenciales Parciales",
    year: 1822,
    status: "unsolved",
    prize: "$1,000,000",
    clayPaper: {
      author: "Charles L. Fefferman",
      year: 2000,
      url: "https://www.claymath.org/millennium-problems/navier-stokes-equation/",
    },
    description: {
      simple: "¿Las ecuaciones que describen el flujo de fluidos siempre tienen soluciones suaves?",
      intermediate: "¿Existen soluciones suaves y globales para las ecuaciones de Navier-Stokes en 3D?",
      advanced: "Probar o refutar la existencia de soluciones C∞ globales para las ecuaciones de Navier-Stokes incompresibles en ℝ³.",
    },
    keyReferences: [
      {
        title: "Existence and smoothness of the Navier–Stokes equation",
        authors: ["Charles L. Fefferman"],
        year: 2000,
        url: "https://www.claymath.org/millennium-problems/navier-stokes-equation/",
      },
    ],
    visualizations: [
      "Fluid Simulation 3D",
      "Turbulence Visualization",
      "Vortex Formation",
      "Velocity Field Animation",
    ],
    applications: [
      "Dinámica de Fluidos",
      "Aerodinámica",
      "Meteorología",
      "Ingeniería",
    ],
  },
  {
    id: 4,
    slug: "yang-mills",
    title: "Yang-Mills and Mass Gap",
    shortTitle: "Yang-Mills",
    field: "Física Matemática",
    year: 1954,
    status: "unsolved",
    prize: "$1,000,000",
    clayPaper: {
      author: "Arthur Jaffe, Edward Witten",
      year: 2000,
      url: "https://www.claymath.org/millennium-problems/yang-mills-and-mass-gap/",
    },
    description: {
      simple: "¿Por qué las partículas cuánticas tienen masa cuando la teoría dice que no deberían?",
      intermediate: "Probar que existe un gap de masa positivo en la teoría cuántica de Yang-Mills.",
      advanced: "Demostrar la existencia matemática rigurosa de la teoría cuántica de campos de Yang-Mills en ℝ⁴ con un mass gap Δ > 0.",
    },
    keyReferences: [
      {
        title: "Quantum Yang-Mills Theory",
        authors: ["Arthur Jaffe", "Edward Witten"],
        year: 2000,
        url: "https://www.claymath.org/millennium-problems/yang-mills-and-mass-gap/",
      },
    ],
    visualizations: [
      "Gauge Field Visualization",
      "Mass Gap Spectrum",
      "SU(N) Symmetry",
      "Quantum Field Interaction",
    ],
    applications: [
      "Física de Partículas",
      "Cromodinámica Cuántica",
      "Teoría de Campos",
      "Modelo Estándar",
    ],
  },
  {
    id: 5,
    slug: "hodge",
    title: "Hodge Conjecture",
    shortTitle: "Conjetura de Hodge",
    field: "Geometría Algebraica",
    year: 1950,
    status: "unsolved",
    prize: "$1,000,000",
    clayPaper: {
      author: "Pierre Deligne",
      year: 2000,
      url: "https://www.claymath.org/millennium-problems/hodge-conjecture/",
    },
    description: {
      simple: "¿Se pueden describir formas geométricas complejas usando ecuaciones algebraicas?",
      intermediate: "Las clases de cohomología de tipo (p,p) son combinaciones de clases de ciclos algebraicos.",
      advanced: "Para variedades algebraicas proyectivas no singulares, toda clase de Hodge es una combinación racional de clases de ciclos algebraicos.",
    },
    keyReferences: [
      {
        title: "The Hodge Conjecture",
        authors: ["Pierre Deligne"],
        year: 2000,
        url: "https://www.claymath.org/millennium-problems/hodge-conjecture/",
      },
      {
        title: "Hodge structures and the topology of algebraic varieties",
        authors: ["Claire Voisin"],
        year: 2002,
        url: "https://webusers.imj-prg.fr/~claire.voisin/Articlesweb/voisinhodge.pdf",
      },
    ],
    visualizations: [
      "Algebraic Surface 3D",
      "Cohomology Diagram",
      "Hodge Decomposition",
      "Cycle Visualization",
    ],
    applications: [
      "Geometría Algebraica",
      "Topología",
      "Teoría de Cuerdas",
      "Geometría Compleja",
    ],
  },
  {
    id: 6,
    slug: "birch-sd",
    title: "Birch and Swinnerton-Dyer Conjecture",
    shortTitle: "Birch & Swinnerton-Dyer",
    field: "Teoría de Números",
    year: 1960,
    status: "unsolved",
    prize: "$1,000,000",
    clayPaper: {
      author: "Andrew Wiles",
      year: 2000,
      url: "https://www.claymath.org/wp-content/uploads/2022/05/birchswin.pdf",
    },
    description: {
      simple: "Relaciona puntos en curvas con funciones especiales que codifican información aritmética.",
      intermediate: "El rango de una curva elíptica es igual al orden del cero de su función L en s=1.",
      advanced: "Para una curva elíptica E sobre ℚ: rank(E(ℚ)) = ord_{s=1} L(E,s).",
    },
    keyReferences: [
      {
        title: "The Birch and Swinnerton-Dyer Conjecture",
        authors: ["Andrew Wiles"],
        year: 2000,
        url: "https://www.claymath.org/wp-content/uploads/2022/05/birchswin.pdf",
      },
      {
        title: "Lectures on the BSD Conjecture",
        authors: ["Benedict Gross"],
        year: 2000,
        url: "https://people.math.harvard.edu/~gross/preprints/lectures-pcmi.pdf",
      },
    ],
    visualizations: [
      "Elliptic Curve Plotter",
      "Rational Points Finder",
      "L-function Graph",
      "Group Law Animation",
    ],
    applications: [
      "Criptografía de Curva Elíptica",
      "Teoría de Números",
      "Criptografía",
      "Seguridad Digital",
    ],
  },
  {
    id: 7,
    slug: "poincare",
    title: "Poincaré Conjecture",
    shortTitle: "Conjetura de Poincaré",
    field: "Topología",
    year: 1904,
    status: "solved",
    solver: "Grigori Perelman",
    solverYear: 2003,
    prize: "Resuelto (premio rechazado)",
    clayPaper: {
      author: "John Milnor",
      year: 2000,
      url: "https://www.claymath.org/millennium-problems/poincare-conjecture/",
    },
    description: {
      simple: "Toda forma 3D sin agujeros que se comporta como una esfera, es una esfera.",
      intermediate: "Toda 3-variedad compacta simplemente conexa es homeomorfa a la 3-esfera.",
      advanced: "Toda variedad compacta de dimensión 3 simplemente conexa es homeomorfa a S³.",
    },
    keyReferences: [
      {
        title: "The Poincaré Conjecture",
        authors: ["John Milnor"],
        year: 2000,
        url: "https://www.claymath.org/millennium-problems/poincare-conjecture/",
      },
      {
        title: "The entropy formula for the Ricci flow",
        authors: ["Grigori Perelman"],
        year: 2002,
        url: "https://arxiv.org/abs/math/0211159",
        citations: 5000,
      },
    ],
    visualizations: [
      "Ricci Flow Animation",
      "3-Manifold Explorer",
      "Topological Surgery",
      "Homotopy Visualization",
    ],
    applications: [
      "Topología",
      "Geometría Diferencial",
      "Cosmología",
      "Teoría de Cuerdas",
    ],
  },
];

export const getProblemBySlug = (slug: string): MillenniumProblem | undefined => {
  return millenniumProblems.find((problem) => problem.slug === slug);
};
