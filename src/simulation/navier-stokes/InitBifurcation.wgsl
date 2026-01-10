// --- InitBifurcation.wgsl ---
// Sets up particles in a perfectly symmetric colliding flow.
// This state is unstable and will be used to demonstrate the "pitchfork" bifurcation.

@group(0) @binding(0) var<storage, read_write> p_pos: array<vec2<f32>>;
@group(0) @binding(1) var<storage, read_write> p_vel: array<vec2<f32>>;
@group(0) @binding(2) var<storage, read_write> p_C: array<mat2x2<f32>>;
@group(0) @binding(3) var<storage, read_write> p_mass: array<f32>;

struct Params {
    dt: f32,
    gravity: f32,
    particle_count: u32,
    grid_res: u32,
};

@group(0) @binding(4) var<uniform> params: Params;

@compute @workgroup_size(64)
fn init_bifurcation(@builtin(global_invocation_id) id: vec3<u32>) {
    let p_idx = id.x;
    if (p_idx >= params.particle_count) { return; }

    let res = f32(params.grid_res);
    let i = f32(p_idx);
    let n = f32(params.particle_count);
    
    // Golden spiral distribution for perfect symmetry
    let phi = acos(1.0 - 2.0 * (i + 0.5) / n);
    let theta = 2.4 * i; 
    
    let r = sqrt((i + 0.5) / n) * 0.15; 
    let norm_pos = vec2<f32>(cos(theta) * r, sin(theta) * r);
    
    p_pos[p_idx] = (norm_pos + 0.5) * res;
    
    // Hyperbolic flow: u = -x, v = y
    p_vel[p_idx] = vec2<f32>(-norm_pos.x * 20.0, norm_pos.y * 20.0);
    p_C[p_idx] = mat2x2<f32>(0.0, 0.0, 0.0, 0.0);
    p_mass[p_idx] = 1.0;
}

@group(0) @binding(5) var<uniform> sigma: f32;

@compute @workgroup_size(64)
fn apply_perturbation(@builtin(global_invocation_id) id: vec3<u32>) {
    let p_idx = id.x;
    if (p_idx >= params.particle_count) { return; }
    
    let pos = p_pos[p_idx];
    let norm_pos = pos / f32(params.grid_res) - 0.5;
    
    // Perturbation mode: A rotational swirl that breaks the hyperbolic symmetry
    let v_bar = vec2<f32>(-norm_pos.y, norm_pos.x) * exp(-dot(norm_pos, norm_pos) * 10.0);
    
    p_vel[p_idx] += sigma * v_bar;
}
