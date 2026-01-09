// --- InitBifurcation.wgsl ---
// Sets up particles in a perfectly symmetric colliding flow.
// This state is unstable and will be used to demonstrate the "pitchfork" bifurcation.

struct Particle {
    pos: vec2<f32>,
    vel: vec2<f32>,
    C: mat2x2<f32>,
    mass: f32,
    padding: f32,
};

struct Params {
    dt: f32,
    gravity: f32,
    particle_count: u32,
    grid_res: u32,
};

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: Params;

@compute @workgroup_size(64)
fn init_bifurcation(@builtin(global_invocation_id) id: vec3<u32>) {
    let p_idx = id.x;
    if (p_idx >= params.particle_count) { return; }

    var p = particles[p_idx];
    let res = f32(params.grid_res);
    
    // Initialize in a dense block in the center
    // Assuming particle_count is roughly 50,000, we fit them in a ~223x223 grid
    // But we'll use a circular distribution for better symmetry.
    
    let i = f32(p_idx);
    let n = f32(params.particle_count);
    
    // Golden spiral distribution for perfect symmetry
    let phi = acos(1.0 - 2.0 * (i + 0.5) / n);
    let theta = 2.4 * i; // Golden angle approx
    
    let r = sqrt((i + 0.5) / n) * 0.15; // Radius 0.15 of grid
    let norm_pos = vec2<f32>(cos(theta) * r, sin(theta) * r);
    
    p.pos = (norm_pos + 0.5) * res;
    
    // Hyperbolic flow: u = -x, v = y (Colliding on X, Expanding on Y)
    // To match Hou et al.'s parity breaking, we set up a flow that is symmetric
    // across both axes.
    p.vel = vec2<f32>(-norm_pos.x * 20.0, norm_pos.y * 20.0);
    
    p.C = mat2x2<f32>(0.0, 0.0, 0.0, 0.0);
    p.mass = 1.0;
    p.padding = 0.0;
    
    particles[p_idx] = p;
}

@compute @workgroup_size(64)
fn apply_perturbation(@builtin(global_invocation_id) id: vec3<u32>, @builtin(num_workgroups) num_wgs: vec3<u32>) {
    let p_idx = id.x;
    if (p_idx >= params.particle_count) { return; }
    
    // Injected sigma value is passed via a separate uniform or the padding field for demo
    // For this prototype, we'll use a hardcoded eigenmode field:
    // The mode v_bar corresponds to a "swirl" or "asymmetric shift"
    // v_bar = (sin(pi*y), sin(pi*x)) - breaking axial symmetry.
    
    var p = particles[p_idx];
    let norm_pos = p.pos / f32(params.grid_res) - 0.5;
    
    // Perturbation mode: A rotational swirl that breaks the hyperbolic symmetry
    let v_bar = vec2<f32>(-norm_pos.y, norm_pos.x) * exp(-dot(norm_pos, norm_pos) * 10.0);
    
    // We'll modify the engine later to pass the actual sigma.
    // This shader will be called with a specific uniform bind group.
    
    // For now, this is a template.
    // p.vel += sigma * v_bar;
}
