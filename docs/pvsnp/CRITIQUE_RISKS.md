# P ≠ NP Exploratory Theories: Critical Risks & Scientific Skepticism

> ⚠️ **ACADEMIC DISCLAIMER**: This documentation analyzes 2024-2025 preprints
> that propose novel approaches to the P vs NP problem. **The inclusion of a
> theory in this project does NOT imply acceptance by the mathematical community.**
> These are exploratory hypotheses under active peer review.

---

## 1. Tang (2025) - Homological Obstruction Hypothesis

### Claim
> "Problems in P have trivial homology (H_n(L) = 0), while SAT has non-trivial
> first homology (H_1(SAT) ≠ 0), providing a topological separation."

### Risk Assessment

| Aspect | Status | Concern |
|--------|--------|---------|
| Peer Review | ❌ Preprint | Not yet accepted to major venues |
| Lean Formalization | ⚠️ Contested | External reviewers flagged as potentially "AI-generated" |
| Reproducibility | ⚠️ Partial | Core constructions are non-constructive |

### What We Implement
- **Visualization**: Persistence barcodes comparing 2-SAT vs 3-SAT clause complexes
- **NOT Implemented**: Full Lean 4 proof (beyond basic stubs)

### Scientific Position
We present this as an **"exploration of the homological hypothesis"**, not a validated theorem.

---

## 2. Lee (2025) - Geometric Complexity Theory / Kronecker Obstruction

### Claim
> "Algebraic patterns in Kronecker coefficients collapse at the 'Five Threshold'
> (k=5), revealing GCT obstructions that prevent efficient computation."

### Risk Assessment

| Aspect | Status | Concern |
|--------|--------|---------|
| Mathematical Foundation | ✅ Solid | Based on established GCT framework (Mulmuley-Sohoni) |
| Empirical Evidence | ✅ Verified | Our engine confirms the k=5 anomaly |
| Proof Status | ⚠️ Incomplete | Obstruction ≠ Separation Proof |

### What We Implement
- **Full Implementation**: `kronecker_fault.py` validates the pattern collapse
- **Visualization**: Bar chart showing the "Muro de Cinco" (Wall of Five)

### Scientific Position
The algebraic obstruction is **mathematically rigorous**. However, documenting an
obstruction is NOT equivalent to proving P ≠ NP. It shows why certain approaches
fail, not that all approaches fail.

---

## 3. Williams/Nye (2025) - Holographic Compression / ARE

### Claim
> "Deterministic computations can be simulated in O(√T) space using Algebraic
> Replay. If P = NP, all problems should compress. Critical-phase SAT fails."

### Risk Assessment

| Aspect | Status | Concern |
|--------|--------|---------|
| Core Result | ✅ Published | Williams' simulation is a major theoretical result |
| Extension to P≠NP | ⚠️ Speculation | The "failure to compress" argument is heuristic |
| Implementation | ⚠️ Simplified | Our ARE is an approximation, not the full algorithm |

### What We Implement
- **Simulation**: `are_compressor.py` demonstrates compression differences
- **3D Visualization**: Holographic boundary vs bulk in `HolographicSimulation.tsx`

### Scientific Position
The Williams simulation is **established theory**. Our interpretation that
compression failure implies P ≠ NP is **exploratory speculation**.

---

## 4. UIRIM / UESDF Frameworks

### Claim
> "Universal frameworks that simultaneously solve multiple Millennium Problems
> using infinite idempotent manifolds."

### Risk Assessment

| Aspect | Status | Concern |
|--------|--------|---------|
| Peer Review | ❌ None | Not submitted to any academic venue |
| Specificity | ❌ Low | Claims are too broad to be testable |
| Red Flag | 🚨 HIGH | Claiming multiple Millennium solutions is a classic warning sign |

### What We Implement
- **NOTHING**: We do NOT implement UIRIM/UESDF claims
- **Isolation**: BSD-specific spectral approaches are tested independently

### Scientific Position
These frameworks are **excluded** from our verification pipeline due to
insufficient academic vetting. We do not present them as legitimate approaches.

---

## 5. Abela et al. (2025) - Epistemic Barrier / High-K Algorithms

### Claim
> "Even if P = NP, the algorithm could have such high Kolmogorov Complexity (K)
> that it is undiscoverable by humans—an epistemic, not ontological, barrier."

### Risk Assessment

| Aspect | Status | Concern |
|--------|--------|---------|
| Philosophical Validity | ✅ Sound | Recognized in complexity theory literature |
| Testability | ⚠️ Limited | Hard to distinguish epistemic from ontological |
| Implication | ⚠️ Unclear | Changes the meaning of "solving" P vs NP |

### What We Implement
- **Documentation Only**: Referenced in disclaimers
- **HERMES Fallback**: Our AI heuristics acknowledge this limitation

### Scientific Position
This is a **legitimate philosophical consideration** that affects how we interpret
any experimental results. We emphasize that our visualizations show **why
algorithms are hard to find**, not that they don't exist.

---

## 6. Subjective Complexity & Ashtavakra Observer Limits

### Claim
> "The complexity of a system is not absolute but relative to the observer's 
> computational resources and Kolmogorov complexity (Ashtavakra Complexity)."

### Risk Assessment
- **Complexity**: High (Mathematical-Philosophical)
- **Status**: Theoretical Proposal
- **Key Caveat**: An algorithm that appears chaotic to a P-time observer might be 
  fully ordered and linear-time to an observer with exponential energy resources.

### Implication for the Museum
All "obstructions" visualized (Wada boundaries, k=5 jumps, Holographic saturation) 
are **observed limits of current human-scale computation**. They represent the 
"Muro de la Intractabilidad" for our current epoch.

---

## 7. Computational Relativity (Nye/Smith 2025)

### Claim
> "Complexity classes P and NP are not absolute but depend on the observer's
> reference frame in a curved (logarithmic) spacetime."

### Risk Assessment
- **Status**: Highly Speculative (Theoretical Physics)
- **Testability**: Indirect (requires gedanken experiments)
- **Implication**: An algorithm that appears NP-hard in flat spacetime might
  be P-solvable for an observer near a gravitational horizon due to extreme
  time dilation.

### What We Implement
- **Engine**: `log_causality.py` demonstrates causal horizon violations
- **Visualization**: `CausalCone.tsx` shows information traveling "outside the light cone"

### Scientific Position
This connection between computational complexity and general relativity is
**exploratory physics**. We visualize it as a conceptual metaphor for why
algorithms "cannot go fast enough," not as proven physics.

---

## 8. TFNP & The Refuter Game (Metamathematics)

### Claim
> "Proving lower bounds (like P ≠ NP) is *computationally equivalent* to
> finding errors in exponentially long proofs (rwPHP). The barrier is mathematical
> self-reference."

### Risk Assessment
- **Status**: Established Metamathematics (Razborov, Kraj́ıček)
- **Implication**: Even if P ≠ NP is true, its proof might require computational
  resources beyond what any human or AI can achieve.

### What We Implement
- **Documentation only**: This is a "meta-barrier" explaining why progress is slow
- **Future**: "Refuter Game" visualization for rwPHP resolution

### Scientific Position
This is the **deepest barrier** in the museum. It suggests that the difficulty
of proving P ≠ NP is not a failure of human creativity but a fundamental
mathematical obstruction (similar to Gödel incompleteness).

---

## Conclusion: Our Verification Philosophy

```
┌─────────────────────────────────────────────────────────────────┐
│                    VERIFICATION HIERARCHY                       │
├─────────────────────────────────────────────────────────────────┤
│  1. ESTABLISHED: Williams ARE, GCT Framework (Mulmuley-Sohoni)  │
│  2. EXPLORATORY: Kronecker k=5, Holographic compression, SHIL   │
│  3. SPECULATIVE: Tang Homology, Log-Spacetime, Ashtavakra       │
│  4. METAMATH: TFNP, rwPHP, Epistemic Barriers                   │
│  5. EXCLUDED: UIRIM, UESDF, multi-problem "solutions"           │
└─────────────────────────────────────────────────────────────────┘
```

This project is a **verification laboratory**, not a proclamation.
We provide tools to TEST hypotheses, not to endorse them.

---

## References

1. Tang, H. (2025). "Topological Obstructions in Computational Complexity". ArXiv.
2. Lee, J. (2025). "Geometric Complexity Theory and Algebraic Thresholds". ArXiv.
3. Williams, R. & Nye, M. (2025). "Simulating Time With Square-Root Space". STOC.
4. Abela, G. et al. (2025). "Epistemic Barriers in Complexity". SIGACT.
5. Delacour, A. et al. (2025). "Lagrange Oscillatory Neural Networks". ICLR.
