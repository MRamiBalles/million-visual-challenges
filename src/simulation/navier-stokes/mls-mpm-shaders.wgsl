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
    vel_x: atomic<i32>,
    vel_y: atomic<i32>,
    mass: atomic<i32>,
};

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<storage, read_write> grid: array<GridNode>;

const FIXED_POINT_SCALE: f32 = 1000000.0;

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
            let g_idx = get_grid_idx(u32(base_coord.x + offset.x), u32(base_coord.y + offset.y));
            
            // --- DETERMINISTIC P2G via FIXED-POINT ATOMICS ---
            let m_inc = i32(weight * p.mass * FIXED_POINT_SCALE);
            let v_x_inc = i32(weight * momentum.x * FIXED_POINT_SCALE);
            let v_y_inc = i32(weight * momentum.y * FIXED_POINT_SCALE);
            
            atomicAdd(&grid[g_idx].mass, m_inc);
            atomicAdd(&grid[g_idx].vel_x, v_x_inc);
            atomicAdd(&grid[g_idx].vel_y, v_y_inc);
        }
    }
}

// 2. Grid Update
@compute @workgroup_size(64)
fn update_grid(@builtin(global_invocation_id) id: vec3<u32>) {
    let g_idx = id.x;
    if (g_idx >= params.grid_res * params.grid_res) { return; }

    let m_fixed = f32(atomicLoad(&grid[g_idx].mass));
    let mass = m_fixed / FIXED_POINT_SCALE;

    if (mass > 0.0) {
        let v_x_fixed = f32(atomicLoad(&grid[g_idx].vel_x));
        let v_y_fixed = f32(atomicLoad(&grid[g_idx].vel_y));
        
        var vel = vec2<f32>(v_x_fixed, v_y_fixed) / (mass * FIXED_POINT_SCALE);
        vel.y += params.dt * params.gravity;
        
        // Boundary conditions
        let x = g_idx % params.grid_res;
        let y = g_idx / params.grid_res;
        if (x < 2 || x > params.grid_res - 3 || y < 2 || y > params.grid_res - 3) {
            vel = vec2<f32>(0.0);
        }

        // Store back as floats for G2P (Note: for G2P we can use atomicStore or 
        // a secondary float buffer to avoid fixed-point precision loss during advection)
        // For simplicity and since G2P is read-only for grid, we'll bitcast back 
        // to float the atomic storage if we want to reuse the same buffer, 
        // but WGSL doesn't allow atomicStore of bitcast floats easily.
        // Better: update_grid writes to a SECONDARY grid_vel buffer or we reuse atomic slots.
        // Actually, let's use the atomic slots as storage for the rest of the frame.
        atomicStore(&grid[g_idx].vel_x, i32(vel.x * FIXED_POINT_SCALE));
        atomicStore(&grid[g_idx].vel_y, i32(vel.y * FIXED_POINT_SCALE));
    }
}

// 3. Grid to Particle (G2P)
@compute @workgroup_size(64)
fn g2p(@builtin(global_invocation_id) id: vec3<u32>) {
// Helper to sample grid velocity (handles fixed-point scaling)
fn sample_grid_vel(pos: vec2<f32>) -> vec2<f32> {
    let base_coord = vec2<i32>(floor(pos * inv_dx - 0.5));
    let fx = pos * inv_dx - vec2<f32>(base_coord);
    let w = array<vec2<f32>, 3>(
        0.5 * pow(1.5 - fx, vec2<f32>(2.0)),
        0.75 - pow(fx - 1.0, vec2<f32>(2.0)),
        0.5 * pow(fx - 0.5, vec2<f32>(2.0))
    );
    var vel = vec2<f32>(0.0);
    for (var i: u32 = 0; i < 3; i++) {
        for (var j: u32 = 0; j < 3; j++) {
            let offset = vec2<i32>(i32(i), i32(j));
            let weight = w[i].x * w[j].y;
            let g_idx = get_grid_idx(u32(base_coord.x + offset.x), u32(base_coord.y + offset.y));
            let v_x = f32(atomicLoad(&grid[g_idx].vel_x)) / FIXED_POINT_SCALE;
            let v_y = f32(atomicLoad(&grid[g_idx].vel_y)) / FIXED_POINT_SCALE;
            vel += weight * vec2<f32>(v_x, v_y);
        }
    }
    return vel;
}

// 3. Grid to Particle (G2P) with BFECC Advection
@compute @workgroup_size(64)
fn g2p(@builtin(global_invocation_id) id: vec3<u32>) {
    let p_idx = id.x;
    if (p_idx >= params.particle_count) { return; }

    var p = particles[p_idx];
    
    // --- BFECC ADVECTION (Back and Forth Error Compensation) ---
    // 1. Forward step estimate
    let v_fwd = sample_grid_vel(p.pos);
    
    // 2. Backward step estimate
    let pos_back = p.pos - params.dt * v_fwd;
    let v_back = sample_grid_vel(pos_back);
    
    // 3. Corrected velocity (reduces dissipation/viscosity)
    let v_corr = v_fwd + 0.5 * (v_fwd - v_back);
    
    // --- AFFINE UPDATE (APIC) ---
    let base_coord = vec2<i32>(floor(p.pos * inv_dx - 0.5));
    let fx = p.pos * inv_dx - vec2<f32>(base_coord);
    let w = array<vec2<f32>, 3>(
        0.5 * pow(1.5 - fx, vec2<f32>(2.0)),
        0.75 - pow(fx - 1.0, vec2<f32>(2.0)),
        0.5 * pow(fx - 0.5, vec2<f32>(2.0))
    );

    var new_C = mat2x2<f32>(vec2<f32>(0.0), vec2<f32>(0.0));
    for (var i: u32 = 0; i < 3; i++) {
        for (var j: u32 = 0; j < 3; j++) {
            let offset = vec2<i32>(i32(i), i32(j));
            let weight = w[i].x * w[j].y;
            let g_idx = get_grid_idx(u32(base_coord.x + offset.x), u32(base_coord.y + offset.y));
            let v_x = f32(atomicLoad(&grid[g_idx].vel_x)) / FIXED_POINT_SCALE;
            let v_y = f32(atomicLoad(&grid[g_idx].vel_y)) / FIXED_POINT_SCALE;
            let g_vel = vec2<f32>(v_x, v_y);
            
            let dpos = (vec2<f32>(offset) - fx) * dx;
            new_C += 4.0 * weight * mat2x2<f32>(g_vel * dpos.x, g_vel * dpos.y) * inv_dx;
        }
    }

    p.vel = v_corr;
    p.pos += params.dt * p.vel;
    p.C = new_C;
    
    // Boundary clamping
    p.pos = clamp(p.pos, vec2<f32>(3.0), vec2<f32>(f32(params.grid_res) - 4.0));
    particles[p_idx] = p;
}
