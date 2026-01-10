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
    private pPosBuffer: GPUBuffer;
    private pVelBuffer: GPUBuffer;
    private pCBuffer: GPUBuffer;
    private pMassBuffer: GPUBuffer;
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
    private renderBindGroup: GPUBindGroup;
    private renderPipeline: GPURenderPipeline;
    private params: FluidParams;

    constructor(device: GPUDevice, params: FluidParams) {
        this.device = device;

        // 1. Create SoA Buffers
        const usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;
        this.pPosBuffer = device.createBuffer({
            size: params.particleCount * 8, // vec2<f32>
            usage: usage | GPUBufferUsage.VERTEX // Vertex for fallback if needed
        });
        this.pVelBuffer = device.createBuffer({
            size: params.particleCount * 8, // vec2<f32>
            usage: usage
        });
        this.pCBuffer = device.createBuffer({
            size: params.particleCount * 16, // mat2x2<f32>
            usage: usage
        });
        this.pMassBuffer = device.createBuffer({
            size: params.particleCount * 4, // f32
            usage: usage
        });

        // Grid node: atomic<i32> x 3 (vel_x, vel_y, mass) = 12 bytes
        const gridStride = 12;
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

        const shaderModule = device.createShaderModule({
            code: mlsMpmShaders,
        });

        const bindGroupLayout = device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX, buffer: { type: 'storage' } }, // p_pos
                { binding: 1, visibility: GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX, buffer: { type: 'storage' } }, // p_vel
                { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // p_C
                { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // p_mass
                { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // grid
                { binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }, // params
            ],
        });

        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout],
        });

        const initModule = device.createShaderModule({
            code: initBifurcationShaders,
        });

        const initBindGroupLayout = device.createBindGroupLayout({
            entries: [
                { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // p_pos
                { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // p_vel
                { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // p_C
                { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }, // p_mass
                { binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }, // params
                { binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }, // sigma (optional)
            ]
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
                layout: device.createPipelineLayout({ bindGroupLayouts: [initBindGroupLayout] }),
                compute: { module: initModule, entryPoint: 'init_bifurcation' },
            }),
            applyPerturbation: device.createComputePipeline({
                layout: device.createPipelineLayout({ bindGroupLayouts: [initBindGroupLayout] }),
                compute: { module: initModule, entryPoint: 'apply_perturbation' },
            }),
        };

        this.bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this.pPosBuffer } },
                { binding: 1, resource: { buffer: this.pVelBuffer } },
                { binding: 2, resource: { buffer: this.pCBuffer } },
                { binding: 3, resource: { buffer: this.pMassBuffer } },
                { binding: 4, resource: { buffer: this.gridBuffer } },
                { binding: 5, resource: { buffer: this.uniformBuffer } },
            ],
        });

        this.renderBindGroup = device.createBindGroup({
            layout: device.createBindGroupLayout({
                entries: [
                    { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
                    { binding: 1, visibility: GPUShaderStage.VERTEX, buffer: { type: 'read-only-storage' } },
                ]
            }),
            entries: [
                { binding: 0, resource: { buffer: this.pPosBuffer } },
                { binding: 1, resource: { buffer: this.pVelBuffer } },
            ]
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
            },
            fragment: {
                module: renderShaderModule,
                entryPoint: 'fs_shade',
                targets: [{
                    format: navigator.gpu.getPreferredCanvasFormat(),
                    blend: {
                        color: { srcFactor: 'src-alpha', dstFactor: 'one', operation: 'add' },
                        alpha: { srcFactor: 'zero', dstFactor: 'one', operation: 'add' }
                    }
                }],
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
        const posData = new Float32Array(params.particleCount * 2);
        const velData = new Float32Array(params.particleCount * 2);
        const cData = new Float32Array(params.particleCount * 4);
        const massData = new Float32Array(params.particleCount);

        for (let i = 0; i < params.particleCount; i++) {
            // Random position in the middle
            posData[i * 2 + 0] = params.gridRes * 0.4 + Math.random() * params.gridRes * 0.2;
            posData[i * 2 + 1] = params.gridRes * 0.4 + Math.random() * params.gridRes * 0.2;
            // Velocity
            velData[i * 2 + 0] = 0;
            velData[i * 2 + 1] = 0;
            // C (mat2x2)
            cData[i * 4 + 0] = 0; cData[i * 4 + 1] = 0;
            cData[i * 4 + 2] = 0; cData[i * 4 + 3] = 0;
            // Mass
            massData[i] = 1.0;
        }

        this.device.queue.writeBuffer(this.pPosBuffer, 0, posData);
        this.device.queue.writeBuffer(this.pVelBuffer, 0, velData);
        this.device.queue.writeBuffer(this.pCBuffer, 0, cData);
        this.device.queue.writeBuffer(this.pMassBuffer, 0, massData);
    }

    public step(substeps: number = 2) {
        const commandEncoder = this.device.createCommandEncoder();

        // Multi-stepping for higher fidelity
        for (let s = 0; s < substeps; s++) {
            commandEncoder.clearBuffer(this.gridBuffer);

            const pass = commandEncoder.beginComputePass();
            pass.setBindGroup(0, this.bindGroup);

            const workgroupSize = 64;
            const particleWorkgroups = Math.ceil(this.params.particleCount / workgroupSize);
            const gridWorkgroups = Math.ceil((this.params.gridRes * this.params.gridRes) / workgroupSize);

            // 1. P2G (Particle to Grid) - Deterministic Atomics
            pass.setPipeline(this.computePipeline.p2g);
            pass.dispatchWorkgroups(particleWorkgroups);

            // 2. Grid Update
            pass.setPipeline(this.computePipeline.update);
            pass.dispatchWorkgroups(gridWorkgroups);

            // 3. G2P (Grid to Particle) - BFECC Advection
            pass.setPipeline(this.computePipeline.g2p);
            pass.dispatchWorkgroups(particleWorkgroups);

            pass.end();
        }

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
        renderPass.setBindGroup(0, this.renderBindGroup);
        renderPass.draw(6, this.params.particleCount);
        renderPass.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }

    public getPosBuffer() {
        return this.pPosBuffer;
    }

    public reinitBifurcation() {
        const commandEncoder = this.device.createCommandEncoder();
        const bindGroup = this.device.createBindGroup({
            layout: this.computePipeline.initBifurcation.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.pPosBuffer } },
                { binding: 1, resource: { buffer: this.pVelBuffer } },
                { binding: 2, resource: { buffer: this.pCBuffer } },
                { binding: 3, resource: { buffer: this.pMassBuffer } },
                { binding: 4, resource: { buffer: this.uniformBuffer } },
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
        const sigmaData = new Float32Array([sigma]);
        this.device.queue.writeBuffer(this.sigmaBuffer, 0, sigmaData);

        const commandEncoder = this.device.createCommandEncoder();
        const bindGroup = this.device.createBindGroup({
            layout: this.computePipeline.applyPerturbation.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.pPosBuffer } },
                { binding: 1, resource: { buffer: this.pVelBuffer } },
                { binding: 2, resource: { buffer: this.pCBuffer } },
                { binding: 3, resource: { buffer: this.pMassBuffer } },
                { binding: 4, resource: { buffer: this.uniformBuffer } },
                { binding: 5, resource: { buffer: this.sigmaBuffer } },
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
