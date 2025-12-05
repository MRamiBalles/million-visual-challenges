# Cortex Research Lab (Glass Box)

This directory contains the experimental research code for **Cortex-13**, the "Glass Box" AI typically used for visualizing the learning process of neural networks within Million Visual Challenges.

## Files
- `model.py`: The complete PyTorch implementation of the CortexV2 hybrid architecture (Transformer/Mamba/RWKV/MoE) with explainability hooks.

## Usage
This code is intended to be run in a Python environment (local or cloud) to generate "training traces" that can be visualized in the main web application.

```bash
# Install dependencies
pip install torch numpy matplotlib seaborn scikit-learn

# Run the protocol
python model.py
```

## Integration Plan
1.  **Offline Training**: Run `model.py` to train small models on specific curricula (e.g., modular arithmetic).
2.  **Export**: Modify the script to save `GradientCollector` and `ActivationHooks` data to JSON.
3.  **Visualization**: Load the JSON in the React app (using Three.js) to show the "Glass Brain" functioning.
