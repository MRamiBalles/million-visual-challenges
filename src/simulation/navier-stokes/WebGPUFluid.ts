import mlsMpmShaders from './mls-mpm-shaders.wgsl?raw';
import fluidRenderShaders from './fluid-render-shaders.wgsl?raw';
import initBifurcationShaders from './InitBifurcation.wgsl?raw';

export interface FluidParams {
    dt: number;
    gravity: number;
    particleCount: number;
    gridRes: number;
}

export class WebGPUFluid {
    private device: GPUDevice;
    private particleBuffer: GPUBuffer;
    private gridBuffer: GPUBuffer;
    private uniformBuffer: GPUBuffer;
    private sigmaBuffer: GPUBuffer;
    private computePipeline: {
        p2g: GPUComputePipeline;
        update: GPUComputePipeline;
        g2p: GPUComputePipeline;
        initBifurcation: GPUComputePipeline;
        applyPerturbation: GPUComputePipeline;
    };
    private bindGroup: GPUBindGroup;
    private renderPipeline: GPURenderPipeline;
    private params: FluidParams;

    constructor(device: GPUDevice, params: FluidParams) {
        this.device = device;

        // 1. Create Buffers
        const particleSize = 8 * 4; // pos (vec2), vel (vec2), C (mat2x2), mass (f32), pad (f32)
        // Correction: mat2x2 in WGSL is 2 * vec2. So 2 * 8 = 16 bytes.
        // Total: pos(8) + vel(8) + C(16) + mass(4) + pad(4) = 40 bytes.
        const particleStride = 40;
        this.particleBuffer = device.createBuffer({
            size: params.particleCount * particleStride,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX,
        });

        // Grid node: velocity (vec2), mass (f32), pad (f32) = 16 bytes
        const gridStride = 16;
        this.gridBuffer = device.createBuffer({
            size: params.gridRes * params.gridRes * gridStride,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        this.uniformBuffer = device.createBuffer({
            size: 16, // dt, gravity, particle_count, grid_res
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.sigmaBuffer = device.createBuffer({
            size: 4, // sigma (f32)
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        // 2. Load Shaders & Pipelines
        const shaderModule = device.createShaderModule({
            code: mlsMpmShaders,
        });

        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
                { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
                { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
            ],
        });

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
        });

        const initModule = device.createShaderModule({
            code: initBifurcationShaders,
        });

        this.computePipeline = {
            p2g: device.createComputePipeline({
                layout: pipelineLayout,
                compute: { module: shaderModule, entryPoint: 'p2g' },
            }),
            update: device.createComputePipeline({
                layout: pipelineLayout,
                compute: { module: shaderModule, entryPoint: 'update_grid' },
            }),
            g2p: device.createComputePipeline({
                layout: pipelineLayout,
                compute: { module: shaderModule, entryPoint: 'g2p' },
            }),
            initBifurcation: device.createComputePipeline({
                layout: device.createPipelineLayout({
                    bindGroupLayouts: [device.createBindGroupLayout({
                        entries: [
                            { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
                            { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
                        ]
                    })]
                }),
                compute: { module: initModule, entryPoint: 'init_bifurcation' },
            }),
            applyPerturbation: device.createComputePipeline({
                layout: device.createPipelineLayout({
                    bindGroupLayouts: [device.createBindGroupLayout({
                        entries: [
                            { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
                            { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
                            { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
                        ]
                    })]
                }),
                compute: { module: initModule, entryPoint: 'apply_perturbation' },
            }),
        };

        this.bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.particleBuffer } },
                { binding: 1, resource: { buffer: this.gridBuffer } },
                { binding: 2, resource: { buffer: this.uniformBuffer } },
            ],
        });

        this.params = params;

        // 3. Render Pipeline Setup
        const renderShaderModule = device.createShaderModule({
            code: fluidRenderShaders,
        });

        this.renderPipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: renderShaderModule,
                entryPoint: 'vs_depth',
                buffers: [
                    {
                        arrayStride: 40, // particleStride
                        stepMode: 'instance',
                        attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x2' }],
                    },
                ],
            },
            fragment: {
                module: renderShaderModule,
                entryPoint: 'fs_shade',
                targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }],
            },
            primitive: { topology: 'triangle-list' },
        });

        this.updateUniforms(params);
        this.initParticles(params);
    }

    private updateUniforms(params: FluidParams) {
        const data = new ArrayBuffer(16);
        const view = new DataView(data);
        view.setFloat32(0, params.dt, true);
        view.setFloat32(4, params.gravity, true);
        view.setUint32(8, params.particleCount, true);
        view.setUint32(12, params.gridRes, true);
        this.device.queue.writeBuffer(this.uniformBuffer, 0, data);
    }

    private initParticles(params: FluidParams) {
        const particleStride = 40;
        const data = new Float32Array((params.particleCount * particleStride) / 4);
        for (let i = 0; i < params.particleCount; i++) {
            const offset = i * (particleStride / 4);
            // Random position in the middle
            data[offset + 0] = params.gridRes * 0.4 + Math.random() * params.gridRes * 0.2;
            data[offset + 1] = params.gridRes * 0.4 + Math.random() * params.gridRes * 0.2;
            // Velocity
            data[offset + 2] = 0;
            data[offset + 3] = 0;
            // C (mat2x2)
            data[offset + 4] = 0; data[offset + 5] = 0;
            data[offset + 6] = 0; data[offset + 7] = 0;
            // Mass
            data[offset + 8] = 1.0;
        }
        this.device.queue.writeBuffer(this.particleBuffer, 0, data);
    }

    public step() {
        const commandEncoder = this.device.createCommandEncoder();
        commandEncoder.clearBuffer(this.gridBuffer);

        const pass = commandEncoder.beginComputePass();
        pass.setBindGroup(0, this.bindGroup);

        const workgroupSize = 64;
        const particleWorkgroups = Math.ceil(this.params.particleCount / workgroupSize);
        const gridWorkgroups = Math.ceil((this.params.gridRes * this.params.gridRes) / workgroupSize);

        pass.setPipeline(this.computePipeline.p2g);
        pass.dispatchWorkgroups(particleWorkgroups);

        pass.setPipeline(this.computePipeline.update);
        pass.dispatchWorkgroups(gridWorkgroups);

        pass.setPipeline(this.computePipeline.g2p);
        pass.dispatchWorkgroups(particleWorkgroups);

        pass.end();
        this.device.queue.submit([commandEncoder.finish()]);
    }

    public render(context: GPUCanvasContext) {
        const commandEncoder = this.device.createCommandEncoder();
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: context.getCurrentTexture().createView(),
                clearValue: { r: 0, g: 0.05, b: 0.1, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
        });

        renderPass.setPipeline(this.renderPipeline);
        renderPass.setVertexBuffer(0, this.particleBuffer);
        renderPass.draw(6, this.params.particleCount); // Draw 6 vertices (billboard) per particle
        renderPass.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }

    public getParticleBuffer() {
        return this.particleBuffer;
    }

    public reinitBifurcation() {
        const commandEncoder = this.device.createCommandEncoder();
        const bindGroup = this.device.createBindGroup({
            layout: this.computePipeline.initBifurcation.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.particleBuffer } },
                { binding: 1, resource: { buffer: this.uniformBuffer } },
            ],
        });

        const pass = commandEncoder.beginComputePass();
        pass.setBindGroup(0, bindGroup);
        pass.setPipeline(this.computePipeline.initBifurcation);
        pass.dispatchWorkgroups(Math.ceil(this.params.particleCount / 64));
        pass.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }

    public injectPerturbation(sigma: number) {
        // Write sigma to buffer
        const sigmaData = new Float32Array([sigma]);
        this.device.queue.writeBuffer(this.sigmaBuffer, 0, sigmaData);

        const commandEncoder = this.device.createCommandEncoder();
        const bindGroup = this.device.createBindGroup({
            layout: this.computePipeline.applyPerturbation.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.particleBuffer } },
                { binding: 1, resource: { buffer: this.uniformBuffer } },
                { binding: 2, resource: { buffer: this.sigmaBuffer } },
            ],
        });

        const pass = commandEncoder.beginComputePass();
        pass.setBindGroup(0, bindGroup);
        pass.setPipeline(this.computePipeline.applyPerturbation);
        pass.dispatchWorkgroups(Math.ceil(this.params.particleCount / 64));
        pass.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }
}
