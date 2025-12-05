"""
Cortex-13: Enhanced Research Protocol & Glass Box Components.
Integrated into Million Visual Challenges as the core "Explainable AI" prototype.

This module defines the CortexV2 architecture, a hybrid model designed for
transparency and visualization ("The Glass Box").

Usage:
    python scripts/cortex_research/model.py
    (Requires torch, numpy, matplotlib, seaborn)
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import math
import random
import time
import warnings
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from dataclasses import dataclass, field
from typing import Optional, Tuple, List, Dict, Any, Union
from contextlib import nullcontext
from sklearn.decomposition import PCA

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

# --- Configuration ---
@dataclass
class CortexConfig:
    """Configuration for Cortex-13 Model and Training Protocol."""
    # Architecture
    vocab_size: int = 256  # Byte-level
    d_model: int = 256
    n_layers: int = 6
    n_heads: int = 4
    block_size: int = 64
    dropout: float = 0.1
    
    # Training
    batch_size: int = 32
    grad_accum: int = 4
    learning_rate: float = 3e-4
    min_lr: float = 3e-5
    weight_decay: float = 0.01
    grad_clip: float = 1.0
    
    # Steps
    qualifier_steps: int = 100
    final_steps: int = 500
    champion_steps: int = 2000
    warmup_steps: int = 20
    
    # Optimizations
    use_rope: bool = True
    use_gqa: bool = True
    tie_weights: bool = True
    label_smoothing: float = 0.1
    
    # Generation
    temperature: float = 0.8
    top_k: int = 40
    top_p: float = 0.9
    
    # System
    device: str = 'cuda' if torch.cuda.is_available() else 'cpu'
    
    def __post_init__(self):
        # Validation
        assert self.d_model % self.n_heads == 0, "d_model must be divisible by n_heads"
        assert self.vocab_size > 0, "vocab_size must be positive"

# --- Explainability Tools (Glass Box) ---
class GradientCollector:
    """Collects gradient statistics during training for analysis."""
    def __init__(self):
        self.grad_norms: Dict[str, List[float]] = {}
        self.step_grads: Dict[str, np.ndarray] = {} # Snapshot of last step
        
    def hook(self, name: str):
        def _hook(grad):
            norm = grad.norm().item()
            if name not in self.grad_norms:
                self.grad_norms[name] = []
            self.grad_norms[name].append(norm)
            # Store histogram data occasionally or last step
            self.step_grads[name] = grad.detach().cpu().numpy()
            return grad
        return _hook

class ActivationHooks:
    """Manages forward hooks to capture activations and attention maps."""
    def __init__(self):
        self.activations: Dict[str, torch.Tensor] = {}
        self.attention_maps: Dict[str, torch.Tensor] = {}
        self.handles: List[Any] = []

    def register(self, model: nn.Module):
        # Clear old handles
        self.remove()
        
        # Register new hooks
        for name, module in model.named_modules():
            if isinstance(module, (TransformerBlock, MambaBlock, RWKVBlock, MoEBlock)):
                self.handles.append(module.register_forward_hook(self._get_act_hook(name)))
            if isinstance(module, GQA):
                self.handles.append(module.register_forward_hook(self._get_attn_hook(name)))

    def _get_act_hook(self, name: str):
        def hook(model, input, output):
            self.activations[name] = output.detach().cpu()
        return hook

    def _get_attn_hook(self, name: str):
        def hook(model, input, output):
            # GQA returns output, but we want internal attention weights.
            # We need to modify GQA to expose weights or hook into a submodule.
            # For now, we'll assume GQA stores 'last_attn_weights' if configured.
            if hasattr(model, 'last_attn_weights') and model.last_attn_weights is not None:
                self.attention_maps[name] = model.last_attn_weights.detach().cpu()
        return hook

    def remove(self):
        for h in self.handles:
            h.remove()
        self.handles = []
        self.activations = {}
        self.attention_maps = {}

# --- Components ---
class RMSNorm(nn.Module):
    """Root Mean Square Normalization."""
    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x * torch.rsqrt(x.pow(2).mean(-1, keepdim=True) + self.eps) * self.weight

class RoPE(nn.Module):
    """Rotary Position Embeddings."""
    def __init__(self, dim: int, max_len: int = 1024):
        super().__init__()
        inv_freq = 1.0 / (10000 ** (torch.arange(0, dim, 2).float() / dim))
        self.register_buffer('inv_freq', inv_freq)
        self.cached_cos = None
        self.cached_sin = None

    def forward(self, q: torch.Tensor, k: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        seq_len = q.shape[2]
        if self.cached_cos is None or self.cached_cos.shape[2] < seq_len:
            t = torch.arange(seq_len, device=q.device).float()
            freqs = torch.outer(t, self.inv_freq)
            self.cached_cos = freqs.cos()[None, None, :, :]
            self.cached_sin = freqs.sin()[None, None, :, :]
            
        cos = self.cached_cos[:, :, :seq_len, :]
        sin = self.cached_sin[:, :, :seq_len, :]

        def apply_rotary(x):
            x1, x2 = x.chunk(2, -1)
            return torch.cat([x1 * cos - x2 * sin, x2 * cos + x1 * sin], -1)

        return apply_rotary(q), apply_rotary(k)

class SwiGLU(nn.Module):
    """SwiGLU Activation Function."""
    def __init__(self, dim: int, hidden_dim: int):
        super().__init__()
        self.w1 = nn.Linear(dim, hidden_dim, bias=False)
        self.w2 = nn.Linear(dim, hidden_dim, bias=False)
        self.w3 = nn.Linear(hidden_dim, dim, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.w3(F.silu(self.w1(x)) * self.w2(x))

class GQA(nn.Module):
    """Grouped Query Attention with optional attention map storage."""
    def __init__(self, d_model: int, n_heads: int, use_rope: bool = True):
        super().__init__()
        self.n_heads = n_heads
        self.n_kv = n_heads // 2
        self.head_dim = d_model // n_heads
        
        self.q = nn.Linear(d_model, d_model, bias=False)
        self.k = nn.Linear(d_model, self.head_dim * self.n_kv, bias=False)
        self.v = nn.Linear(d_model, self.head_dim * self.n_kv, bias=False)
        self.proj = nn.Linear(d_model, d_model, bias=False)
        
        self.rope = RoPE(self.head_dim) if use_rope else None
        self.last_attn_weights: Optional[torch.Tensor] = None

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        B, T, C = x.shape
        q = self.q(x).view(B, T, self.n_heads, self.head_dim).transpose(1, 2)
        k = self.k(x).view(B, T, self.n_kv, self.head_dim).transpose(1, 2)
        v = self.v(x).view(B, T, self.n_kv, self.head_dim).transpose(1, 2)

        if self.rope:
            q, k = self.rope(q, k)

        # Repeat KV for GQA
        k = k.repeat_interleave(self.n_heads // self.n_kv, dim=1)
        v = v.repeat_interleave(self.n_heads // self.n_kv, dim=1)

        # Attention
        att = (q @ k.transpose(-2, -1)) / math.sqrt(self.head_dim)
        att = att.masked_fill(torch.triu(torch.ones_like(att), 1).bool(), float('-inf'))
        att_weights = F.softmax(att, dim=-1)
        
        # Store for explainability
        if not self.training:
            self.last_attn_weights = att_weights

        out = att_weights @ v
        return self.proj(out.transpose(1, 2).contiguous().view(B, T, C))

# --- Blocks ---
class TransformerBlock(nn.Module):
    def __init__(self, cfg: CortexConfig):
        super().__init__()
        self.ln1 = RMSNorm(cfg.d_model)
        self.ln2 = RMSNorm(cfg.d_model)
        self.attn = GQA(cfg.d_model, cfg.n_heads, cfg.use_rope)
        self.ffn = SwiGLU(cfg.d_model, 4 * cfg.d_model)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = x + self.attn(self.ln1(x))
        x = x + self.ffn(self.ln2(x))
        return x

class MambaBlock(nn.Module):
    def __init__(self, cfg: CortexConfig):
        super().__init__()
        d = cfg.d_model
        self.norm = RMSNorm(d)
        self.in_proj = nn.Linear(d, d * 2, bias=False)
        self.conv = nn.Conv1d(d, d, 3, padding=1, groups=d)
        self.out_proj = nn.Linear(d, d, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        res = x
        x = self.norm(x)
        x_val, gate = self.in_proj(x).chunk(2, -1)
        x_val = F.silu(self.conv(x_val.transpose(1, 2)).transpose(1, 2))
        return res + self.out_proj(x_val * torch.sigmoid(gate))

class RWKVBlock(nn.Module):
    def __init__(self, cfg: CortexConfig):
        super().__init__()
        d = cfg.d_model
        self.norm = RMSNorm(d)
        self.k = nn.Linear(d, d, bias=False)
        self.v = nn.Linear(d, d, bias=False)
        self.r = nn.Linear(d, d, bias=False)
        self.o = nn.Linear(d, d, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        res = x
        x = self.norm(x)
        return res + self.o(torch.sigmoid(self.r(x)) * (self.k(x) * self.v(x)))

class MoEBlock(nn.Module):
    def __init__(self, cfg: CortexConfig, n_experts: int = 4):
        super().__init__()
        self.norm = RMSNorm(cfg.d_model)
        self.experts = nn.ModuleList([SwiGLU(cfg.d_model, 4 * cfg.d_model) for _ in range(n_experts)])
        self.gate = nn.Linear(cfg.d_model, n_experts, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        res = x
        x = self.norm(x)
        w = F.softmax(self.gate(x), -1)
        # Weighted sum of experts (simplified MoE)
        out = sum(w[:, :, i:i+1] * e(x) for i, e in enumerate(self.experts))
        return res + out

# --- Model ---
class CortexV2(nn.Module):
    """Cortex Organism V2 - Unified Architecture."""
    def __init__(self, cfg: CortexConfig, arch_type: str = 'H'):
        super().__init__()
        self.cfg = cfg
        self.arch_type = arch_type
        self.tok_emb = nn.Embedding(cfg.vocab_size, cfg.d_model)
        
        if not cfg.use_rope:
            self.pos_emb = nn.Parameter(torch.zeros(1, cfg.block_size, cfg.d_model))

        self.layers = nn.ModuleList()
        for i in range(cfg.n_layers):
            if arch_type == 'T':
                self.layers.append(TransformerBlock(cfg))
            elif arch_type == 'M':
                self.layers.append(MambaBlock(cfg))
            elif arch_type == 'R':
                self.layers.append(RWKVBlock(cfg))
            elif arch_type == 'E':
                self.layers.append(MoEBlock(cfg))
            else: # Hybrid
                self.layers.append(MambaBlock(cfg) if i % 2 == 0 else TransformerBlock(cfg))

        self.ln_f = RMSNorm(cfg.d_model)
        self.head = nn.Linear(cfg.d_model, cfg.vocab_size, bias=False)

        if cfg.tie_weights:
            self.head.weight = self.tok_emb.weight

        self.apply(self._init_weights)

    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)

    def forward(self, idx: torch.Tensor, targets: Optional[torch.Tensor] = None) -> Tuple[torch.Tensor, Optional[torch.Tensor]]:
        B, T = idx.shape
        x = self.tok_emb(idx)

        if not self.cfg.use_rope and hasattr(self, 'pos_emb'):
            x = x + self.pos_emb[:, :T, :]

        for layer in self.layers:
            x = layer(x)

        x = self.ln_f(x)
        logits = self.head(x)

        loss = None
        if targets is not None:
            loss = F.cross_entropy(
                logits.view(-1, self.cfg.vocab_size),
                targets.view(-1),
                label_smoothing=self.cfg.label_smoothing
            )

        return logits, loss

    def count_params(self) -> int:
        return sum(p.numel() for p in self.parameters() if p.requires_grad)

# --- Training Utils ---
class CosineWarmupScheduler:
    def __init__(self, optimizer, warmup_steps, total_steps, min_lr):
        self.opt = optimizer
        self.warmup = warmup_steps
        self.total = total_steps
        self.min_lr = min_lr
        self.base_lr = optimizer.param_groups[0]['lr']
        self.step_count = 0

    def step(self):
        self.step_count += 1
        if self.step_count < self.warmup:
            lr = self.base_lr * self.step_count / self.warmup
        else:
            t = (self.step_count - self.warmup) / (self.total - self.warmup)
            t = max(0, min(1, t))
            lr = self.min_lr + (self.base_lr - self.min_lr) * 0.5 * (1 + math.cos(math.pi * t))

        for pg in self.opt.param_groups:
            pg['lr'] = lr
        return lr

def get_batch(data: torch.Tensor, cfg: CortexConfig) -> Tuple[torch.Tensor, torch.Tensor]:
    if len(data) <= cfg.block_size:
        raise ValueError(f"Data length {len(data)} is too small for block_size {cfg.block_size}")
        
    ix = torch.randint(len(data) - cfg.block_size, (cfg.batch_size,))
    x = torch.stack([data[i:i+cfg.block_size] for i in ix]).to(cfg.device)
    y = torch.stack([data[i+1:i+cfg.block_size+1] for i in ix]).to(cfg.device)
    return x, y

def train_model(model: CortexV2, cfg: CortexConfig, data_train: torch.Tensor, steps: int, verbose: bool = True) -> Tuple[List[float], List[float]]:
    model.train()
    optimizer = torch.optim.AdamW(model.parameters(), lr=cfg.learning_rate, weight_decay=cfg.weight_decay)
    scheduler = CosineWarmupScheduler(optimizer, cfg.warmup_steps, steps, cfg.min_lr)
    scaler = torch.cuda.amp.GradScaler() if cfg.device == 'cuda' else None
    
    # Explainability: Gradient Collector
    grad_collector = GradientCollector()
    for n, p in model.named_parameters():
        if p.requires_grad:
            p.register_hook(grad_collector.hook(n))

    losses, lrs = [], []
    
    try:
        for step in range(steps):
            total_loss = 0
            for _ in range(cfg.grad_accum):
                x, y = get_batch(data_train, cfg)
                
                with torch.cuda.amp.autocast() if scaler else nullcontext():
                    _, loss = model(x, y)
                    loss = loss / cfg.grad_accum
                
                if scaler:
                    scaler.scale(loss).backward()
                else:
                    loss.backward()
                
                total_loss += loss.item()

            if scaler:
                scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), cfg.grad_clip)
            
            if scaler:
                scaler.step(optimizer)
                scaler.update()
            else:
                optimizer.step()
                
            optimizer.zero_grad()
            lr = scheduler.step()
            
            losses.append(total_loss)
            lrs.append(lr)
            
            if verbose and (step + 1) % 50 == 0:
                print(f"Step {step+1}/{steps} | Loss: {total_loss:.4f} | LR: {lr:.6f}")
                
    except RuntimeError as e:
        if "out of memory" in str(e):
            print("ERROR: GPU Out of Memory. Try reducing batch_size or block_size.")
            if torch.cuda.is_available(): torch.cuda.empty_cache()
        raise e

    return losses, lrs

@torch.no_grad()
def generate(model: CortexV2, prompt: str, cfg: CortexConfig, max_len: int = 50) -> str:
    model.eval()
    idx = torch.tensor([[ord(c) for c in prompt]], dtype=torch.long).to(cfg.device)
    
    for _ in range(max_len):
        logits, _ = model(idx[:, -cfg.block_size:])
        logits = logits[:, -1, :] / cfg.temperature
        
        if cfg.top_k > 0:
            v, _ = torch.topk(logits, min(cfg.top_k, logits.size(-1)))
            logits[logits < v[:, [-1]]] = -float('Inf')
            
        probs = F.softmax(logits, dim=-1)
        idx_next = torch.multinomial(probs, num_samples=1)
        idx = torch.cat([idx, idx_next], dim=1)
        
    return "".join([chr(max(32, min(126, i))) for i in idx[0].tolist()])

# --- Visualization Utils ---
def plot_training_stats(losses: List[float], lrs: List[float]):
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))
    
    # Smoothed Loss
    window = 20
    if len(losses) > window:
        smoothed = np.convolve(losses, np.ones(window)/window, mode='valid')
        axes[0].plot(losses, alpha=0.3, label='Raw')
        axes[0].plot(smoothed, label=f'Smoothed (MA-{window})', color='red')
    else:
        axes[0].plot(losses)
    axes[0].set_title("Training Loss")
    axes[0].legend()
    
    axes[1].plot(lrs)
    axes[1].set_title("Learning Rate Schedule")
    plt.tight_layout()
    plt.show()

def plot_embeddings_pca(model: CortexV2):
    emb = model.tok_emb.weight.detach().cpu().numpy()
    pca = PCA(n_components=2)
    emb_2d = pca.fit_transform(emb)
    
    plt.figure(figsize=(10, 8))
    plt.scatter(emb_2d[:, 0], emb_2d[:, 1], alpha=0.6, s=50, c=np.arange(len(emb)), cmap='viridis')
    
    # Annotate common chars
    chars_to_annotate = ['a', 'e', 'i', 'o', 'u', '0', '1', '9', '+', '=', '?', '!', ' ']
    for c in chars_to_annotate:
        idx = ord(c)
        if idx < len(emb):
            plt.annotate(c, (emb_2d[idx, 0], emb_2d[idx, 1]), fontsize=14, weight='bold', 
                         bbox=dict(facecolor='white', alpha=0.7, edgecolor='none'))
    
    plt.title("Embedding Space (PCA) - Glass Box Analysis")
    plt.colorbar(label='Token ID')
    plt.grid(True, alpha=0.3)
    plt.show()

# --- Main Execution ---
if __name__ == "__main__":
    print("🔬 Cortex-13: Enhanced Research Protocol Initialized")
    
    # 1. Setup
    cfg = CortexConfig(
        n_layers=4, 
        d_model=128, 
        n_heads=4, 
        qualifier_steps=50, # Short run for demo
        device='cuda' if torch.cuda.is_available() else 'cpu'
    )
    print(f"🚀 Device: {cfg.device.upper()}")
    
    # 2. Data (Dummy for standalone execution)
    print("📚 Generating synthetic data...")
    dummy_data = torch.randint(0, 256, (10000,), dtype=torch.long)
    
    # 3. Model
    model = CortexV2(cfg, arch_type='H').to(cfg.device)
    print(f"🧠 Model Initialized: {model.count_params()/1e6:.2f}M params")
    
    # 4. Training with Explainability
    print("🏋️ Starting Training...")
    losses, lrs = train_model(model, cfg, dummy_data, cfg.qualifier_steps)
    
    # 5. Visualization
    print("📊 Generating Visualizations...")
    # NOTE: Matplotlib plots might not show in headless environments.
    # In production, save these components as images or JSON data.
    # plot_training_stats(losses, lrs)
    # plot_embeddings_pca(model)
    
    # 6. Generation Probe
    print("🗣️ Generation Test:")
    prompt = "Hello Cortex"
    output = generate(model, prompt, cfg)
    print(f"   Input: '{prompt}'")
    print(f"   Output: '{output}'")
    
    print("\n✅ Protocol Complete. Ready for advanced experiments.")
