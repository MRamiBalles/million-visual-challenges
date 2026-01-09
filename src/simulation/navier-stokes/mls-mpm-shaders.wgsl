// --- MLS-MPM Fluid Simulation Shaders ---
// Based on: "Moving Least Squares Material Point Method" (Hu et al. 2018)
// And 2025 implementation standards for WebGPU.

struct Particle {
    pos: vec2<f32>,
    vel: vec2<f32>,
    C: mat2x2<f32>,
    mass: f32,
    padding: f32,
};

struct GridNode {
    velocity: vec2<f32>,
    mass: f32,
    padding: f32,
};

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<storage, read_write> grid: array<GridNode>;

struct Params {
    dt: f32,
    gravity: f32,
    particle_count: u32,
    grid_res: u32,
};

@group(0) @binding(2) var<uniform> params: Params;

const dx: f32 = 1.0;
const inv_dx: f32 = 1.0;

// --- Helper Functions ---
fn get_grid_idx(x: u32, y: u32) -> u32 {
    return x + y * params.grid_res;
}

// 1. Particle to Grid (P2G)
@compute @workgroup_size(64)
fn p2g(@builtin(global_invocation_id) id: vec3<u32>) {
    let p_idx = id.x;
    if (p_idx >= params.particle_count) { return; }

    var p = particles[p_idx];
    let base_coord = vec2<i32>(floor(p.pos * inv_dx - 0.5));
    let fx = p.pos * inv_dx - vec2<f32>(base_coord);

    // Quadratic B-spline weights
    let w = array<vec2<f32>, 3>(
        0.5 * pow(1.5 - fx, vec2<f32>(2.0)),
        0.75 - pow(fx - 1.0, vec2<f32>(2.0)),
        0.5 * pow(fx - 0.5, vec2<f32>(2.0))
    );

    let stress = -params.dt * 4.0 * inv_dx * inv_dx * p.mass; // Simplified stress
    let affine = p.C;

    for (var i: u32 = 0; i < 3; i++) {
        for (var j: u32 = 0; j < 3; j++) {
            let offset = vec2<i32>(i32(i), i32(j));
            let weight = w[i].x * w[j].y;
            let dpos = (vec2<f32>(offset) - fx) * dx;
            let momentum = p.mass * (p.vel + affine * dpos);
            
            let g_idx = get_grid_idx(u32(base_coord.x + offset.x), u32(base_coord.y + offset.y));
            
            // Atomic add is required here in a real implementation
            // Since WGSL atomicAdd only works on i32/u32, we use a bit-cast trick for floats
            // or perform this in a way that avoids collisions (e.g. coloring or mesh-based)
            // For now, using simplified logic assuming non-collision for prototype
            grid[g_idx].mass += weight * p.mass;
            grid[g_idx].velocity += weight * momentum;
        }
    }
}

// 2. Grid Update
@compute @workgroup_size(64)
fn update_grid(@builtin(global_invocation_id) id: vec3<u32>) {
    let g_idx = id.x;
    if (g_idx >= params.grid_res * params.grid_res) { return; }

    if (grid[g_idx].mass > 0.0) {
        grid[g_idx].velocity /= grid[g_idx].mass;
        grid[g_idx].velocity.y += params.dt * params.gravity;
        
        // Boundary conditions
        let x = g_idx % params.grid_res;
        let y = g_idx / params.grid_res;
        if (x < 2 || x > params.grid_res - 3 || y < 2 || y > params.grid_res - 3) {
            grid[g_idx].velocity = vec2<f32>(0.0);
        }
    }
}

// 3. Grid to Particle (G2P)
@compute @workgroup_size(64)
fn g2p(@builtin(global_invocation_id) id: vec3<u32>) {
    let p_idx = id.x;
    if (p_idx >= params.particle_count) { return; }

    var p = particles[p_idx];
    let base_coord = vec2<i32>(floor(p.pos * inv_dx - 0.5));
    let fx = p.pos * inv_dx - vec2<f32>(base_coord);

    let w = array<vec2<f32>, 3>(
        0.5 * pow(1.5 - fx, vec2<f32>(2.0)),
        0.75 - pow(fx - 1.0, vec2<f32>(2.0)),
        0.5 * pow(fx - 0.5, vec2<f32>(2.0))
    );

    var new_vel = vec2<f32>(0.0);
    var new_C = mat2x2<f32>(vec2<f32>(0.0), vec2<f32>(0.0));

    for (var i: u32 = 0; i < 3; i++) {
        for (var j: u32 = 0; j < 3; j++) {
            let offset = vec2<i32>(i32(i), i32(j));
            let weight = w[i].x * w[j].y;
            let g_idx = get_grid_idx(u32(base_coord.x + offset.x), u32(base_coord.y + offset.y));
            let g_vel = grid[g_idx].velocity;
            
            let dpos = (vec2<f32>(offset) - fx) * dx;
            new_vel += weight * g_vel;
            new_C += 4.0 * weight * mat2x2<f32>(g_vel * dpos.x, g_vel * dpos.y) * inv_dx;
        }
    }

    p.vel = new_vel;
    p.pos += params.dt * p.vel;
    p.C = new_C;
    
    // Boundary clamping
    p.pos = clamp(p.pos, vec2<f32>(3.0), vec2<f32>(f32(params.grid_res) - 4.0));
    
    particles[p_idx] = p;
}
