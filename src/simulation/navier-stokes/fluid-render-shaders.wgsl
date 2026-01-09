// --- Screen-Space Fluid Rendering Shaders ---

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
    @location(1) particle_uv: vec2<f32>,
};

@vertex
fn vs_depth(
    @location(0) particle_pos: vec2<f32>,
    @builtin(vertex_index) vertex_idx: u32,
    @builtin(instance_index) instance_idx: u32
) -> VertexOutput {
    var out: VertexOutput;
    
    // Define quad offsets for a billboard
    let quad = array<vec2<f32>, 6>(
        vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, 1.0),
        vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0)
    );
    
    let offset = quad[vertex_idx] * 0.5; // Half size of the particle
    let world_pos = (particle_pos + offset) / 64.0; // Normalized to 0-1 (assuming 64 grid)
    let screen_pos = world_pos * 2.0 - 1.0;
    
    out.position = vec4<f32>(screen_pos, 0.0, 1.0);
    out.uv = screen_pos * 0.5 + 0.5;
    out.particle_uv = quad[vertex_idx];
    
    return out;
}

@fragment
fn fs_shade(in: VertexOutput) -> @location(0) vec4<f32> {
    // Circle mask
    let r2 = dot(in.particle_uv, in.particle_uv);
    if (r2 > 1.0) { discard; }
    
    // Simple shading based on distance from center
    let intensity = 1.0 - r2;
    return vec4<f32>(0.2, 0.5, 0.9, intensity * 0.8);
}
