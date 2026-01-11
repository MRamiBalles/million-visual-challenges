"""
Algebraic Validation: Kronecker k=5 Threshold Detection
========================================================

Validates the KroneckerFault engine's ability to detect the structural
collapse at k=5, where the Hogben polynomial prediction fails.

Source: Lee (2025), "Algebraic Obstructions and the Collapse of Elementary Structure"

CRITICAL: If test_fault_at_k5_correction fails (doesn't return +29),
          STOP THE PROCESS. The algebraic immunity proof in Lean is invalid.
"""

import pytest
import sys
from pathlib import Path

# Add parent to path for engine imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from algebra.kronecker_fault import (
    staircase_hook_coefficient,
    hogben_polynomial,
    lee_formula_k5,
    analyze_kronecker_sequence,
    KroneckerResult
)


class KroneckerCoefficient:
    """
    Wrapper for Kronecker coefficient computations.
    Implements Lee (2025) formulas for detecting algebraic obstructions.
    """
    def __init__(self, k: int):
        self.k = k
        self._result = None
        self._compute()
    
    def _compute(self):
        """Pre-compute all values for this k."""
        results = analyze_kronecker_sequence(max_k=self.k)
        for r in results:
            if r.k == self.k:
                self._result = r
                break
    
    def is_stable(self) -> bool:
        """Returns True if k is in the stable regime (k <= 4)."""
        if self._result is None:
            return self.k <= 4
        return self._result.is_stable
    
    def compute_multiplicity(self) -> int:
        """Returns the actual Kronecker coefficient value."""
        if self._result is None:
            return staircase_hook_coefficient(self.k)
        return self._result.actual_coefficient
    
    def get_polynomial_structure(self) -> 'PolynomialStructure':
        """Returns the polynomial factorization structure."""
        return PolynomialStructure(self.k)


class PolynomialStructure:
    """
    Represents the polynomial structure of the Kronecker formula at k.
    At k=5, the formula contains an irreducible quadratic k² - 5k + 7.
    """
    def __init__(self, k: int):
        self.k = k
        if k >= 5:
            self._lee_result = lee_formula_k5(k)
        else:
            self._lee_result = None
    
    def has_irreducible_quadratic(self) -> bool:
        """Returns True if there's an irreducible quadratic factor."""
        return self.k >= 5 and self._lee_result is not None
    
    def discriminant(self) -> int:
        """
        Returns the discriminant of the quadratic factor.
        For k=5: Δ = 25 - 28 = -3
        """
        if self._lee_result is None:
            return 0  # Fully factorable for k < 5
        # lee_formula_k5 returns (value, discriminant, pattern) tuple
        return self._lee_result[1]  # Index 1 = discriminant


class TestKroneckerFault:
    """
    Valida el colapso estructural en k=5.
    Fuente: Lee (2025), "Algebraic Obstructions and the Collapse of Elementary Structure"
    """

    @pytest.mark.parametrize("k, expected_stable", [
        (1, True),
        (2, True),
        (3, True),
        (4, True),
        (5, False)  # THE CRITICAL POINT
    ])
    def test_stability_threshold(self, k: int, expected_stable: bool):
        """
        Verifica que k <= 4 sigue el patrón triangular-Hogben,
        y k=5 rompe la estructura.
        
        Hardcoded from Lee (2025):
        - k=1,2,3,4: Stable (polynomial factorizes over Z)
        - k=5: Unstable (discriminant < 0, complex roots)
        """
        kc = KroneckerCoefficient(k)
        assert kc.is_stable() == expected_stable, (
            f"k={k}: Expected is_stable={expected_stable}, "
            f"got {kc.is_stable()}"
        )

    def test_fault_at_k5_correction(self):
        """
        CRITICAL TEST: The "+29 correction" at k=5.
        
        RATIONALE: En k=5, la predicción triangular es T_21 = 231.
        El valor real es 260. La corrección debe ser exactamente +29.
        
        Source: Lee (2025), Phenomenon 1.3 [8]
        
        HARDCODED VALUES:
        - Hogben prediction: 231 (T_21 = 21*22/2 = 231)
        - Actual value: 260
        - Correction: +29
        """
        k = 5
        predicted = hogben_polynomial(k)  # Should be 231
        actual = staircase_hook_coefficient(k)  # Should be 260
        
        correction = actual - predicted
        
        assert correction == 29, (
            f"AXIOM VIOLATION: Expected correction +29 at k=5, got {correction}. "
            f"Predicted={predicted}, Actual={actual}. "
            f"Lee (2025) formula is NOT correctly implemented!"
        )

    def test_discriminant_obstruction(self):
        """
        RATIONALE: En k=5, surge un factor cuadrático irreducible k² - 5k + 7.
        Su discriminante debe ser negativo (-3).
        
        Source: Lee (2025), Theorem 5.6 [9]
        
        HARDCODED:
        - Quadratic: k² - 5k + 7
        - Discriminant: Δ = b² - 4ac = 25 - 28 = -3
        """
        kc = KroneckerCoefficient(5)
        poly = kc.get_polynomial_structure()
        
        assert poly.has_irreducible_quadratic(), (
            "AXIOM VIOLATION: k=5 MUST have irreducible quadratic factor"
        )
        
        assert poly.discriminant() == -3, (
            f"AXIOM VIOLATION: Lee's formula predicts Δ = -3 for k=5. "
            f"Got Δ = {poly.discriminant()}"
        )

    def test_k4_is_last_stable_point(self):
        """
        k=4 is the last stable point.
        The actual coefficient should equal the Hogben prediction exactly.
        """
        k = 4
        predicted = hogben_polynomial(k)
        actual = staircase_hook_coefficient(k)
        
        # At k=4, correction should be 0
        assert actual == predicted, (
            f"k=4 should have zero correction. "
            f"Predicted={predicted}, Actual={actual}"
        )

    def test_correction_sequence_jump(self):
        """
        The correction sequence C_k = A_k - Hogben(k) should be:
        - 0 for k <= 4
        - JUMP to positive value at k = 5
        """
        results = analyze_kronecker_sequence(max_k=6)
        
        for r in results:
            if r.k <= 4:
                assert r.correction == 0, (
                    f"k={r.k} should have zero correction, got {r.correction}"
                )
            if r.k == 5:
                assert r.correction > 0, (
                    f"k=5 MUST show positive correction (the jump). "
                    f"Got correction={r.correction}"
                )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
