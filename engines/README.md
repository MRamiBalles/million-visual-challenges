# P vs NP: Living Museum - Python Engines

This directory contains the computational engines that power the visualizations
in the Million Visual Challenges platform.

## Structure

```
engines/
├── physics/          # Chaotic dynamics and LagONN
│   └── lagonn_sim.py
├── algebra/          # Kronecker coefficients and GCT obstructions
│   └── kronecker_fault.py
├── holography/       # Williams ARE compression simulation
│   └── are_compressor.py
├── topology/         # Tang homology (Phase 2)
│   └── homology_engine.py
└── geometry/         # Smith Log-Spacetime (Phase 2)
    └── smith_metric.py
```

## Requirements

```bash
pip install numpy scipy sympy matplotlib
```

## Usage

Each engine exports JSON data to `src/data/` for frontend consumption.

```bash
python engines/physics/lagonn_sim.py
python engines/algebra/kronecker_fault.py
```

## Scientific Disclaimer

> ⚠️ These engines implement **exploratory hypotheses** from 2024-2025 preprints.
> The inclusion of a theory does NOT imply acceptance by the mathematical community.
> See `docs/pvsnp/CRITIQUE_RISKS.md` for detailed skepticism notes.
