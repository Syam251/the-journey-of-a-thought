/**
 * THE JOURNEY OF A THOUGHT — PRODUCTION MASTER SCRIPT (REDESIGN)
 * -----------------------------------------------------------------------------
 * Cinematic Scrollytelling Documentary
 * Features:
 *  - Real Anatomical 3D Human Brain (assets/models/brain.glb) with PBR materials
 *  - Continuous 3D Camera Journey physically entering the cerebral cortex
 *  - Procedural 3D Pyramidal Neurons with soma, dendrites, axon hillocks & synapses
 *  - Action Potential signal propagation & chemical neurotransmitter vesicle release
 *  - PBR Architectural Solution transformation
 *  - NASA 3D Earth Globe with historical milestones
 *  - Parametric Infinity Loop & Sunrise Text-to-Constellation Generator
 *  - Web Audio API Procedural Synthesizer (Preserved & Synchronized)
 *  - Non-overlapping Apple-minimalist HUD & Responsive Navigation
 * -----------------------------------------------------------------------------
 */

(function () {
  'use strict';

  // ===========================================================================
  // 1. STATE & GLOBAL CONFIGURATION
  // ===========================================================================
  const STATE = {
    audioEnabled: false,
    audioInitialized: false,
    currentSectionIndex: 0,
    scrollProgress: 0,
    coherence: 0.45,
    selectedConcepts: [],
    constellationActive: false,
    isMobile: window.innerWidth < 992,
  };

  const SECTIONS = [
    { id: 'section-origin', stage: 'origin', title: 'The Invisible Beginning' },
    { id: 'section-idea', stage: 'idea', title: 'IDEA: The First Spark' },
    { id: 'section-processing', stage: 'processing', title: 'PROCESSING: Inside the Human Mind' },
    { id: 'section-clarity', stage: 'processing', title: 'The Moment of Clarity' },
    { id: 'section-solution', stage: 'solution', title: 'SOLUTION: From Thought to Reality' },
    { id: 'section-ripple', stage: 'impact', title: 'The Ripple Effect' },
    { id: 'section-loop', stage: 'impact', title: 'The Infinite Loop' },
    { id: 'section-next', stage: 'impact', title: 'The Next Thought Is Yours' },
  ];

  // ===========================================================================
  // 2. SMOOTH SCROLLING (LENIS) & GSAP SCROLLTRIGGER SETUP
  // ===========================================================================
  let lenis = null;

  function initSmoothScroll() {
    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
      });

      lenis.on('scroll', (e) => {
        ScrollTrigger.update();
        updateScrollHUD(e.progress);
      });

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      window.addEventListener('scroll', () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const progress = total > 0 ? window.scrollY / total : 0;
        updateScrollHUD(progress);
      });
    }

    // Intercept internal anchor clicks for smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            if (lenis) {
              lenis.scrollTo(targetEl, { offset: 0, duration: 1.8 });
            } else {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      });
    });
  }

  function updateScrollHUD(progress) {
    STATE.scrollProgress = progress;
    const bar = document.getElementById('progressBar');
    if (bar) {
      bar.style.width = `${Math.min(100, Math.max(0, progress * 100))}%`;
    }

    // Sequence tracker active state
    const trackerOrigin = document.getElementById('tracker-origin');
    const trackerIdea = document.getElementById('tracker-idea');
    const trackerProc = document.getElementById('tracker-processing');
    const trackerSol = document.getElementById('tracker-solution');
    const trackerImp = document.getElementById('tracker-impact');

    const pills = [trackerOrigin, trackerIdea, trackerProc, trackerSol, trackerImp];
    pills.forEach((p) => {
      if (p) p.className = 'stage-step';
    });

    if (progress < 0.15) {
      if (trackerOrigin) trackerOrigin.classList.add('active-idea');
      updateAudioSection(0);
    } else if (progress < 0.35) {
      if (trackerIdea) trackerIdea.classList.add('active-idea');
      updateAudioSection(1);
    } else if (progress < 0.65) {
      if (trackerProc) trackerProc.classList.add('active-processing');
      updateAudioSection(2);
    } else if (progress < 0.82) {
      if (trackerSol) trackerSol.classList.add('active-solution');
      updateAudioSection(4);
    } else {
      if (trackerImp) trackerImp.classList.add('active-solution');
      updateAudioSection(6);
    }
  }

  // ===========================================================================
  // 3. CINEMATIC PROCEDURAL WEB AUDIO SYNTHESIZER
  // ===========================================================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.analyser = null;
      this.activeNodes = [];
      this.currentSection = -1;
      this.isPlaying = false;
      this.dataArray = null;
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.masterGain.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      STATE.audioInitialized = true;
    }

    toggle(forceState) {
      if (!this.ctx) this.init();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const next = forceState !== undefined ? forceState : !this.isPlaying;
      this.isPlaying = next;
      STATE.audioEnabled = next;

      const btn = document.getElementById('audioToggleBtn');
      const label = document.getElementById('audioBtnLabel');

      if (this.isPlaying) {
        this.masterGain.gain.setTargetAtTime(0.28, this.ctx.currentTime, 1.2);
        if (btn) btn.classList.add('playing');
        if (label) label.textContent = 'Audio On';
        this.setSection(STATE.currentSectionIndex);
        this.startPulseLoop();
      } else {
        this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.6);
        if (btn) btn.classList.remove('playing');
        if (label) label.textContent = 'Audio Off';
      }
    }

    setSection(index) {
      if (!this.isPlaying || this.currentSection === index) return;
      this.currentSection = index;

      const now = this.ctx.currentTime;
      this.activeNodes.forEach((node) => {
        try {
          if (node.gain) {
            node.gain.setTargetAtTime(0.0001, now, 0.8);
          }
        } catch (e) {}
      });

      switch (index) {
        case 0: // Section 1: Deep sub drone (55Hz)
          this.createDrone(55, 'sine', 0.18);
          this.createDrone(110, 'triangle', 0.08);
          break;
        case 1: // Section 2: Warm ambient chord
          this.createChord([220, 261.63, 329.63, 392], 0.12);
          break;
        case 2: // Section 3: Neural processing & spatial pulses
        case 3:
          this.createDrone(146.83, 'sawtooth', 0.06, 450);
          this.createChord([146.83, 220, 293.66, 369.99], 0.1);
          break;
        case 4: // Section 5: Architectural resonance
          this.createDrone(98, 'sine', 0.15);
          this.createDrone(293.66, 'triangle', 0.07);
          break;
        case 5: // Section 6: Planetary celestial hum
          this.createDrone(65.41, 'sine', 0.18);
          this.createChord([196, 246.94, 293.66, 392], 0.1);
          break;
        case 6: // Section 7: Endless evolving progression
          this.createDrone(110, 'sine', 0.12);
          this.createDrone(164.81, 'triangle', 0.09);
          break;
        case 7: // Section 8: Emotional resolution chord (C major 9th)
          this.createChord([130.81, 196, 246.94, 329.63, 392, 587.33], 0.15);
          break;
      }
    }

    createDrone(freq, type = 'sine', vol = 0.1, filterFreq = 600) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.setTargetAtTime(vol, this.ctx.currentTime, 2.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.activeNodes.push({ osc, gain, filter });
    }

    createChord(frequencies, vol = 0.1) {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      frequencies.forEach((f) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.setTargetAtTime(vol / frequencies.length, now, 1.8);

        osc.connect(gain);
        gain.connect(filter);
        osc.start();
        this.activeNodes.push({ osc, gain });
      });

      filter.connect(this.masterGain);
    }

    triggerNeuralPulse(freq = 520) {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 0.35);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.4);
    }

    startPulseLoop() {
      if (this.pulseInterval) clearInterval(this.pulseInterval);
      this.pulseInterval = setInterval(() => {
        if (this.isPlaying && (STATE.currentSectionIndex === 1 || STATE.currentSectionIndex === 2)) {
          this.triggerNeuralPulse(400 + Math.random() * 300);
        }
      }, 3200);
    }
  }

  const soundEngine = new SoundEngine();

  function updateAudioSection(index) {
    if (STATE.currentSectionIndex !== index) {
      STATE.currentSectionIndex = index;
      soundEngine.setSection(index);
    }
  }

  // ===========================================================================
  // 4. THREE.JS 3D CONTINUOUS CAMERA JOURNEY & SCENE ENGINE
  // ===========================================================================
  class World3D {
    constructor() {
      this.container = document.getElementById('canvas-container');
      this.canvas = document.getElementById('webgl-canvas');
      this.renderer = null;
      this.scene = null;
      this.camera = null;
      this.clock = new THREE.Clock();

      // Modular 3D scene groups
      this.groupOrigin = new THREE.Group();     // Sec 1 & 2: Anatomical Brain Model
      this.groupProcessing = new THREE.Group(); // Sec 3: Procedural 3D Pyramidal Neurons
      this.groupClarity = new THREE.Group();    // Sec 4: Chaos to Order Particles
      this.groupSolution = new THREE.Group();   // Sec 5: Architectural Transformation
      this.groupRipple = new THREE.Group();     // Sec 6: Earth Globe & Global Arcs
      this.groupLoop = new THREE.Group();       // Sec 7: Infinity Lemniscate
      this.groupNext = new THREE.Group();       // Sec 8: Mountain Horizon & Constellation

      // Handles
      this.realBrain = null;
      this.brainMaterial = null;
      this.amberSpark = null;
      this.activeAxonCurve = null;
      this.actionPotentialMesh = null;
      this.synapticVesicles = [];
      this.actionPotentials = [];
      this.chaosParticles = null;
      this.archStages = [];
      this.earthGlobe = null;
      this.arcsGroup = null;
      this.infinityParticles = null;
      this.constellationParticles = null;

      // Master continuous camera flight spline
      this.cameraSpline = null;

      this.init();
    }

    init() {
      // 1. Renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.2;

      // 2. Scene & Camera
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(0x05070D, 0.028);

      this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      this.camera.position.set(0, 0, 9.5);

      // 3. Cinematic Scientific Lighting
      const ambientLight = new THREE.AmbientLight(0x0A1020, 1.6);
      this.scene.add(ambientLight);

      // Cool key rim light
      const dirLight = new THREE.DirectionalLight(0x53D8FF, 1.4);
      dirLight.position.set(12, 18, 15);
      this.scene.add(dirLight);

      // Warm amber cortical fill
      const warmLight = new THREE.DirectionalLight(0xFFB45C, 1.0);
      warmLight.position.set(-10, -8, 10);
      this.scene.add(warmLight);

      // Synaptic focus point light
      this.synapsePointLight = new THREE.PointLight(0xFFB45C, 2.0, 25);
      this.synapsePointLight.position.set(0, 0, 2);
      this.scene.add(this.synapsePointLight);

      // 4. Add Section Groups
      this.scene.add(this.groupOrigin);
      this.scene.add(this.groupProcessing);
      this.scene.add(this.groupClarity);
      this.scene.add(this.groupSolution);
      this.scene.add(this.groupRipple);
      this.scene.add(this.groupLoop);
      this.scene.add(this.groupNext);

      // 5. Build Master Continuous Camera Spline
      this.buildCameraSpline();

      // 6. Build Sub-Scenes
      this.buildRealisticBrain();
      this.buildDetailedNeuralForest();
      this.buildClarityParticles();
      this.buildArchitecturalSolution();
      this.buildEarthAndArcs();
      this.buildInfinityLoop();
      this.buildHorizonAndConstellation();

      // 7. Resize handler
      window.addEventListener('resize', () => this.onResize());

      // 8. Render Loop
      this.animate();
    }

    onResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    buildCameraSpline() {
      // 14 Control Points along the continuous documentary journey:
      // Exterior Brain -> Approach Sulcus -> Dive into Cortex -> Travel Between Neurons ->
      // Follow Axon Signal -> Synaptic Cleft -> Processing Hub -> Clarity Pullback ->
      // Architectural Solution -> Planet Earth -> Infinity Lemniscate -> Mountain Sunrise
      this.cameraSpline = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 9.5),           // 0.00: Origin (Full realistic brain ~60% viewport)
        new THREE.Vector3(0.3, 0.2, 5.5),       // 0.08: Approaching cerebral cortex
        new THREE.Vector3(0.45, 0.18, 2.2),     // 0.16: Entering lateral sulcus fold
        new THREE.Vector3(0.1, -12, 1.4),       // 0.24: Diving into cortical tissue
        new THREE.Vector3(-1.4, -28, 4.0),      // 0.32: Phase 4: Entering 3D neural environment
        new THREE.Vector3(1.2, -40, 1.5),       // 0.40: Traveling BETWEEN pyramidal neurons
        new THREE.Vector3(0.2, -52, 2.2),       // 0.48: Phase 5: Following active axon to synapse
        new THREE.Vector3(-0.6, -66, 1.8),      // 0.56: Phase 6: Denser information processing network
        new THREE.Vector3(0, -110, 16.0),       // 0.64: Sec 4: Clarity (Chaos-to-order particle pullback)
        new THREE.Vector3(0, -170, 18.0),       // 0.72: Sec 5: Architectural solution evolution
        new THREE.Vector3(0, -230, 15.0),       // 0.80: Sec 6: Realistic Earth in space
        new THREE.Vector3(0, -290, 22.0),       // 0.88: Sec 7: Infinity Lemniscate
        new THREE.Vector3(0, -348, 12.0),       // 0.96: Sec 8: Sunrise Mountain Horizon
        new THREE.Vector3(0, -348, 10.0)        // 1.00: Final Horizon
      ]);
    }

    // -------------------------------------------------------------------------
    // 1. REALISTIC ANATOMICAL BRAIN (assets/images/original-brain-img.webp)
    // -------------------------------------------------------------------------
    buildRealisticBrain() {
      const texturePath = 'assets/images/original-brain-img.webp';

      // Group container for the realistic anatomical brain
      this.realBrain = new THREE.Group();
      this.groupOrigin.add(this.realBrain);

      // Create curved anatomical 3D cortical geometry
      // Width = 6.6, Height = 4.4 matches the 1000x666 image aspect ratio (1.5:1)
      // and occupies ~58% of vertical viewport at camera z=9.5
      const width = 6.6;
      const height = 4.4;
      const segs = 64;

      // Front/Lateral Cortical Hemisphere with realistic anatomical dome curvature
      const geoFront = new THREE.PlaneGeometry(width, height, segs, segs);
      const posFront = geoFront.attributes.position;
      for (let i = 0; i < posFront.count; i++) {
        const x = posFront.getX(i);
        const y = posFront.getY(i);
        const nx = x / (width * 0.5);
        const ny = y / (height * 0.5);
        const r2 = nx * nx + ny * ny;
        // Natural cortical convexity: deepest at center, tapering smoothly to edges
        const curveZ = Math.max(0, 1.0 - r2 * 0.72) * 1.1;
        posFront.setZ(i, curveZ);
      }
      geoFront.computeVertexNormals();

      // Back/Medial Cortical Hemisphere for realistic 360-degree anatomical presence
      const geoBack = new THREE.PlaneGeometry(width, height, segs, segs);
      const posBack = geoBack.attributes.position;
      for (let i = 0; i < posBack.count; i++) {
        const x = posBack.getX(i);
        const y = posBack.getY(i);
        const nx = x / (width * 0.5);
        const ny = y / (height * 0.5);
        const r2 = nx * nx + ny * ny;
        const curveZ = -Math.max(0, 1.0 - r2 * 0.72) * 0.85;
        posBack.setZ(i, curveZ);
      }
      geoBack.computeVertexNormals();

      // Organic cortical PBR material with soft background keying
      this.brainMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.44,
        metalness: 0.04,
        clearcoat: 0.28,
        clearcoatRoughness: 0.35,
        transparent: true,
        opacity: 0.98,
        side: THREE.DoubleSide,
        depthWrite: false, // Prevents edge clipping while semi-transparent
      });

      // Shader hook to softly key out the black background with zero border artifacts
      this.brainMaterial.onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `
          #include <dithering_fragment>
          // Soft-key pure black background from original-brain-img
          float bMax = max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b));
          float edgeAlpha = smoothstep(0.03, 0.15, bMax);
          gl_FragColor.a *= edgeAlpha;
          if (gl_FragColor.a < 0.01) discard;
          `
        );
      };

      const frontMesh = new THREE.Mesh(geoFront, this.brainMaterial);
      const backMesh = new THREE.Mesh(geoBack, this.brainMaterial);
      backMesh.rotation.y = Math.PI;

      this.realBrain.add(frontMesh);
      this.realBrain.add(backMesh);

      // Load original-brain-img.webp texture with high fidelity and extract normal map
      const texLoader = new THREE.TextureLoader();
      texLoader.load(
        texturePath,
        (texture) => {
          texture.generateMipmaps = true;
          texture.minFilter = THREE.LinearMipmapLinearFilter;
          texture.magFilter = THREE.LinearFilter;
          this.brainMaterial.map = texture;
          this.brainMaterial.needsUpdate = true;

          // Attempt normal-map extraction via offscreen canvas for reactive lighting
          try {
            const img = texture.image;
            if (img && img.width > 0) {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);

              const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imgData.data;
              const w = canvas.width;
              const h = canvas.height;

              const normCanvas = document.createElement('canvas');
              normCanvas.width = w;
              normCanvas.height = h;
              const normCtx = normCanvas.getContext('2d');
              const normData = normCtx.createImageData(w, h);
              const nData = normData.data;

              const lum = new Float32Array(w * h);
              for (let i = 0, p = 0; i < data.length; i += 4, p++) {
                lum[p] = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255.0;
              }

              for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                  const idx = y * w + x;
                  const pIdx = idx * 4;
                  if (lum[idx] < 0.05) {
                    nData[pIdx] = 128;
                    nData[pIdx + 1] = 128;
                    nData[pIdx + 2] = 255;
                    nData[pIdx + 3] = 0;
                    continue;
                  }
                  const dX = (lum[idx + 1] - lum[idx - 1]) * 2.5;
                  const dY = (lum[idx + w] - lum[idx - w]) * 2.5;
                  const dZ = 0.4;
                  const len = Math.sqrt(dX * dX + dY * dY + dZ * dZ) || 1.0;
                  nData[pIdx]     = Math.round(((dX / len) * 0.5 + 0.5) * 255);
                  nData[pIdx + 1] = Math.round(((-dY / len) * 0.5 + 0.5) * 255);
                  nData[pIdx + 2] = Math.round(((dZ / len) * 0.5 + 0.5) * 255);
                  nData[pIdx + 3] = 255;
                }
              }
              normCtx.putImageData(normData, 0, 0);

              const normTex = new THREE.CanvasTexture(normCanvas);
              normTex.generateMipmaps = true;
              this.brainMaterial.normalMap = normTex;
              this.brainMaterial.normalScale = new THREE.Vector2(1.2, 1.2);
              this.brainMaterial.needsUpdate = true;
            }
          } catch (e) {
            // Normal map extraction gracefully handled if canvas is restricted
          }
        },
        undefined,
        (err) => {
          console.warn('Could not load original-brain-img texture:', err);
        }
      );

      // Seed Amber Spark glowing inside temporal/prefrontal cortex
      const sparkGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const sparkMat = new THREE.MeshBasicMaterial({ color: 0xFFB45C });
      this.amberSpark = new THREE.Mesh(sparkGeo, sparkMat);
      this.amberSpark.position.set(0.3, 0.2, 0.4);

      const sparkHaloGeo = new THREE.BufferGeometry();
      const sparkHaloCount = 100;
      const sparkHaloPos = new Float32Array(sparkHaloCount * 3);
      for (let i = 0; i < sparkHaloCount * 3; i += 3) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const r = 0.25 + Math.random() * 0.35;
        sparkHaloPos[i] = r * Math.sin(phi) * Math.cos(theta);
        sparkHaloPos[i + 1] = r * Math.sin(phi) * Math.sin(theta);
        sparkHaloPos[i + 2] = r * Math.cos(phi);
      }
      sparkHaloGeo.setAttribute('position', new THREE.BufferAttribute(sparkHaloPos, 3));
      const sparkHaloMat = new THREE.PointsMaterial({
        color: 0xFFB45C,
        size: 0.08,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      this.amberSpark.add(new THREE.Points(sparkHaloGeo, sparkHaloMat));
      this.groupOrigin.add(this.amberSpark);
    }

    // -------------------------------------------------------------------------
    // 2. DETAILED 3D MICROSCOPIC NEURAL ENVIRONMENT (Pyramidal Neurons & Synapse)
    // -------------------------------------------------------------------------
    buildDetailedNeuralForest() {
      // Offset to align with the camera spline (y from -20 down to -75)
      this.groupProcessing.position.set(0, 0, 0);

      // Neuron Material (Dark organic tissue with subtle bioluminescent receptor sheen)
      const neuronMat = new THREE.MeshStandardMaterial({
        color: 0x1E2C44,
        roughness: 0.38,
        metalness: 0.15,
      });

      const synapseMat = new THREE.MeshBasicMaterial({
        color: 0x53D8FF,
      });

      // Spawn 28 Realistic Pyramidal Neurons placed in 3D volume
      const neuronPositions = [
        // Foreground neurons (sweeping past lens with strong parallax)
        { x: -2.2, y: -26, z: 2.8, s: 1.1 },
        { x: 1.8, y: -32, z: 4.2, s: 1.3 },
        { x: -1.6, y: -38, z: 1.8, s: 0.9 },
        { x: 2.4, y: -44, z: 2.4, s: 1.2 },
        // Midground corridor neurons
        { x: 0.8, y: -24, z: -1.5, s: 0.9 },
        { x: -0.9, y: -34, z: -2.0, s: 1.0 },
        { x: 1.5, y: -48, z: 0.5, s: 1.1 },
        { x: -1.8, y: -54, z: 1.0, s: 1.0 },
        // Synaptic interaction pair (Phase 5)
        { x: -0.6, y: -50, z: 1.2, s: 1.0 }, // Presynaptic neuron
        { x: 0.7, y: -54, z: 1.8, s: 1.0 },  // Postsynaptic neuron
        // Background matrix neurons
        { x: -4.5, y: -30, z: -6.0, s: 0.8 },
        { x: 4.0, y: -36, z: -5.5, s: 0.8 },
        { x: -3.8, y: -46, z: -7.0, s: 0.7 },
        { x: 3.5, y: -56, z: -6.5, s: 0.8 },
        { x: 0.0, y: -62, z: -4.0, s: 0.9 },
      ];

      neuronPositions.forEach((np, idx) => {
        const neuronGroup = this.createDetailedNeuron(np.s, neuronMat, synapseMat);
        neuronGroup.position.set(np.x, np.y, np.z);
        neuronGroup.rotation.set(
          Math.sin(idx) * 0.4,
          Math.cos(idx) * 0.6,
          Math.sin(idx * 2) * 0.3
        );
        this.groupProcessing.add(neuronGroup);
      });

      // -----------------------------------------------------------------------
      // Active Axon Highway & Synaptic Transmission (Phase 5)
      // -----------------------------------------------------------------------
      const presynapticPt = new THREE.Vector3(-0.6, -50, 1.2);
      const synapticCleftPt = new THREE.Vector3(0.0, -52.2, 1.5);
      const postsynapticPt = new THREE.Vector3(0.7, -54, 1.8);

      this.activeAxonCurve = new THREE.CatmullRomCurve3([
        presynapticPt,
        new THREE.Vector3(-0.2, -50.8, 1.6),
        new THREE.Vector3(-0.1, -51.5, 1.4),
        synapticCleftPt,
      ]);

      const activeAxonGeo = new THREE.TubeGeometry(this.activeAxonCurve, 32, 0.05, 8, false);
      const activeAxonMat = new THREE.MeshStandardMaterial({
        color: 0x398BFF,
        roughness: 0.3,
        metalness: 0.2,
      });
      const activeAxonMesh = new THREE.Mesh(activeAxonGeo, activeAxonMat);
      this.groupProcessing.add(activeAxonMesh);

      // Traveling Action Potential Pulse (small luminous sphere)
      const apGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const apMat = new THREE.MeshBasicMaterial({ color: 0xFFB45C });
      this.actionPotentialMesh = new THREE.Mesh(apGeo, apMat);
      this.groupProcessing.add(this.actionPotentialMesh);

      // Synaptic Vesicles (Neurotransmitter packets at synaptic cleft)
      const vesicleGroup = new THREE.Group();
      vesicleGroup.position.copy(synapticCleftPt);
      for (let i = 0; i < 20; i++) {
        const vGeo = new THREE.SphereGeometry(0.035, 8, 8);
        const vMat = new THREE.MeshBasicMaterial({ color: 0x53D8FF });
        const vMesh = new THREE.Mesh(vGeo, vMat);
        vMesh.userData = {
          baseX: (Math.random() - 0.5) * 0.3,
          baseY: (Math.random() - 0.5) * 0.3,
          baseZ: (Math.random() - 0.5) * 0.3,
          speed: 1.5 + Math.random() * 2.0,
        };
        vesicleGroup.add(vMesh);
        this.synapticVesicles.push(vMesh);
      }
      this.groupProcessing.add(vesicleGroup);

      // Floating Neuropil Dust Particles (1,500 particles with volumetric depth)
      const dustGeo = new THREE.BufferGeometry();
      const dustCount = 1500;
      const dustPos = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount * 3; i += 3) {
        dustPos[i] = (Math.random() - 0.5) * 22;
        dustPos[i + 1] = -20 - Math.random() * 55; // Spread from y = -20 to -75
        dustPos[i + 2] = (Math.random() - 0.5) * 20;
      }
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
      const dustMat = new THREE.PointsMaterial({
        color: 0x53D8FF,
        size: 0.06,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      });
      this.neuropilDust = new THREE.Points(dustGeo, dustMat);
      this.groupProcessing.add(this.neuropilDust);

      // Integrate uploaded microscopy textures (nervers.webp & nerv-connections.webp) as atmospheric depth backplanes
      const texLoader = new THREE.TextureLoader();
      texLoader.load('assets/images/nerv-connections.webp', (tex) => {
        const bgPlaneGeo = new THREE.PlaneGeometry(36, 48);
        const bgPlaneMat = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0.25,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const bgPlane = new THREE.Mesh(bgPlaneGeo, bgPlaneMat);
        bgPlane.position.set(0, -48, -10);
        this.groupProcessing.add(bgPlane);
      });

      texLoader.load('assets/images/nervers.webp', (tex) => {
        const bgPlaneGeo2 = new THREE.PlaneGeometry(28, 38);
        const bgPlaneMat2 = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0.2,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const bgPlane2 = new THREE.Mesh(bgPlaneGeo2, bgPlaneMat2);
        bgPlane2.position.set(-1.5, -34, -7);
        this.groupProcessing.add(bgPlane2);
      });
    }

    createDetailedNeuron(scale = 1.0, neuronMat, synapseMat) {
      const g = new THREE.Group();

      // 1. Soma (Pyramidal Cell Body)
      const somaGeo = new THREE.DodecahedronGeometry(0.45 * scale, 1);
      const soma = new THREE.Mesh(somaGeo, neuronMat);
      g.add(soma);

      // 2. Apical Dendrite Trunk (Tapered ascending trunk)
      const apicalCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.4 * scale, 0),
        new THREE.Vector3(0.15 * scale, 1.2 * scale, 0.1 * scale),
        new THREE.Vector3(-0.1 * scale, 2.0 * scale, -0.05 * scale),
      ]);
      const apicalGeo = new THREE.TubeGeometry(apicalCurve, 16, 0.08 * scale, 6, false);
      g.add(new THREE.Mesh(apicalGeo, neuronMat));

      // 3. Apical Branches (Bifurcations)
      for (let b = 0; b < 3; b++) {
        const angle = (b / 3) * Math.PI * 2;
        const branchCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.1 * scale, 2.0 * scale, -0.05 * scale),
          new THREE.Vector3(
            Math.cos(angle) * 0.8 * scale,
            2.8 * scale,
            Math.sin(angle) * 0.8 * scale
          ),
        ]);
        const bGeo = new THREE.TubeGeometry(branchCurve, 12, 0.04 * scale, 6, false);
        g.add(new THREE.Mesh(bGeo, neuronMat));

        // Dendritic spine buttons
        const spineGeo = new THREE.SphereGeometry(0.04 * scale, 6, 6);
        const spine = new THREE.Mesh(spineGeo, synapseMat);
        spine.position.set(
          Math.cos(angle) * 0.8 * scale,
          2.8 * scale,
          Math.sin(angle) * 0.8 * scale
        );
        g.add(spine);
      }

      // 4. Basal Dendrites (Radiating downward from base)
      for (let i = 0; i < 4; i++) {
        const theta = (i / 4) * Math.PI * 2;
        const basalCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, -0.3 * scale, 0),
          new THREE.Vector3(
            Math.cos(theta) * 0.7 * scale,
            -0.8 * scale,
            Math.sin(theta) * 0.7 * scale
          ),
          new THREE.Vector3(
            Math.cos(theta) * 1.3 * scale,
            -1.2 * scale,
            Math.sin(theta) * 1.3 * scale
          ),
        ]);
        const basalGeo = new THREE.TubeGeometry(basalCurve, 12, 0.045 * scale, 6, false);
        g.add(new THREE.Mesh(basalGeo, neuronMat));
      }

      // 5. Axon Hillock & Axon Projection
      const axonCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.4 * scale, 0),
        new THREE.Vector3(0.2 * scale, -1.5 * scale, -0.3 * scale),
        new THREE.Vector3(-0.3 * scale, -3.2 * scale, 0.4 * scale),
      ]);
      const axonGeo = new THREE.TubeGeometry(axonCurve, 16, 0.035 * scale, 6, false);
      g.add(new THREE.Mesh(axonGeo, neuronMat));

      return g;
    }

    // -------------------------------------------------------------------------
    // 3. SECTION 04: THE MOMENT OF CLARITY (Chaos-to-Order Particles)
    // -------------------------------------------------------------------------
    buildClarityParticles() {
      this.groupClarity.position.set(0, -110, 0);

      const count = 3500;
      const chaos = new Float32Array(count * 3);
      const order = new Float32Array(count * 3);
      const current = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // Chaos: turbulent cloud
        chaos[i3] = (Math.random() - 0.5) * 28;
        chaos[i3 + 1] = (Math.random() - 0.5) * 24;
        chaos[i3 + 2] = (Math.random() - 0.5) * 24;

        // Order: Nested Geodesic Shells / Stellated Icosahedron
        const phi = Math.acos(1 - 2 * (i / count));
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const radius = 3.5 + (i % 3) * 1.5;

        order[i3] = radius * Math.sin(phi) * Math.cos(theta);
        order[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        order[i3 + 2] = radius * Math.cos(phi);

        current[i3] = chaos[i3] * (1 - STATE.coherence) + order[i3] * STATE.coherence;
        current[i3 + 1] = chaos[i3 + 1] * (1 - STATE.coherence) + order[i3 + 1] * STATE.coherence;
        current[i3 + 2] = chaos[i3 + 2] * (1 - STATE.coherence) + order[i3 + 2] * STATE.coherence;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(current, 3));
      geo.userData = { chaos, order, current };

      const mat = new THREE.PointsMaterial({
        color: 0x53D8FF,
        size: 0.08,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });

      this.chaosParticles = new THREE.Points(geo, mat);
      this.groupClarity.add(this.chaosParticles);

      // Ordered Core Crystal Geometry
      const crystalGeo = new THREE.IcosahedronGeometry(3.5, 1);
      const crystalMat = new THREE.MeshBasicMaterial({
        color: 0x9D6CFF,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      this.clarityCrystal = new THREE.Mesh(crystalGeo, crystalMat);
      this.groupClarity.add(this.clarityCrystal);
    }

    // -------------------------------------------------------------------------
    // 4. SECTION 05: ARCHITECTURAL SOLUTION EVOLUTION
    // -------------------------------------------------------------------------
    buildArchitecturalSolution() {
      this.groupSolution.position.set(0, -170, 0);
      this.archStages = [];
      // Primitive geometric wireframe diagram removed per user instruction.
    }

    // -------------------------------------------------------------------------
    // 5. SECTION 06: REALISTIC EARTH GLOBE & GLOBAL ARCS
    // -------------------------------------------------------------------------
    buildEarthAndArcs() {
      this.groupRipple.position.set(0, -230, 0);

      // 3D Realistic Earth Sphere
      const earthGeo = new THREE.SphereGeometry(4.5, 48, 48);
      const earthMat = new THREE.MeshStandardMaterial({
        color: 0x0E1A2F,
        roughness: 0.55,
        metalness: 0.25,
      });
      this.earthGlobe = new THREE.Mesh(earthGeo, earthMat);
      this.groupRipple.add(this.earthGlobe);

      // Atmosphere Rayleigh Glow Rim
      const atmosGeo = new THREE.SphereGeometry(4.75, 32, 32);
      const atmosMat = new THREE.MeshBasicMaterial({
        color: 0x53D8FF,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
      });
      this.groupRipple.add(new THREE.Mesh(atmosGeo, atmosMat));

      // Historical Innovation Nodes
      this.arcsGroup = new THREE.Group();
      const coords = [
        { lat: 51.7, lng: -2.4 },  // Jenner
        { lat: 49.9, lng: 8.2 },   // Gutenberg
        { lat: 40.7, lng: -74.0 }, // Photovoltaics
        { lat: 42.3, lng: -71.1 }, // Shannon
        { lat: 36.0, lng: -75.6 }, // Wright Brothers
        { lat: 52.2, lng: 0.12 },  // DNA Structure
      ];

      const radius = 4.5;
      const points3D = coords.map((c) => {
        const phi = (90 - c.lat) * (Math.PI / 180);
        const theta = (c.lng + 180) * (Math.PI / 180);
        return new THREE.Vector3(
          -radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
      });

      points3D.forEach((p) => {
        const markerGeo = new THREE.SphereGeometry(0.12, 12, 12);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0xFFB45C });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.position.copy(p);
        this.arcsGroup.add(marker);
      });

      for (let i = 0; i < points3D.length; i++) {
        const nextIdx = (i + 1) % points3D.length;
        const p1 = points3D[i];
        const p2 = points3D[nextIdx];

        const mid = p1.clone().add(p2).multiplyScalar(0.5);
        mid.normalize().multiplyScalar(radius * 1.35);

        const arcCurve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        const arcGeo = new THREE.TubeGeometry(arcCurve, 32, 0.03, 6, false);
        const arcMat = new THREE.MeshBasicMaterial({
          color: 0x53D8FF,
          transparent: true,
          opacity: 0.8,
        });
        this.arcsGroup.add(new THREE.Mesh(arcGeo, arcMat));
      }

      this.groupRipple.add(this.arcsGroup);
    }

    // -------------------------------------------------------------------------
    // 6. SECTION 07: INFINITY LEMNISCATE LOOP
    // -------------------------------------------------------------------------
    buildInfinityLoop() {
      this.groupLoop.position.set(0, -290, 0);

      const particleCount = 2400;
      const positions = new Float32Array(particleCount * 3);
      const a = 7.5;

      for (let i = 0; i < particleCount; i++) {
        const t = (i / particleCount) * Math.PI * 2;
        const denom = 1 + Math.sin(t) * Math.sin(t);
        const x = (a * Math.cos(t)) / denom;
        const y = (a * Math.sin(t) * Math.cos(t)) / denom;
        const z = Math.sin(t * 3) * 1.5;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      }

      const loopGeo = new THREE.BufferGeometry();
      loopGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      loopGeo.userData = { tOffsets: new Float32Array(particleCount) };
      for (let i = 0; i < particleCount; i++) {
        loopGeo.userData.tOffsets[i] = (i / particleCount) * Math.PI * 2;
      }

      const loopMat = new THREE.PointsMaterial({
        color: 0x9D6CFF,
        size: 0.1,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      });

      this.infinityParticles = new THREE.Points(loopGeo, loopMat);
      this.groupLoop.add(this.infinityParticles);
    }

    // -------------------------------------------------------------------------
    // 7. SECTION 08: MOUNTAIN HORIZON SUNRISE & CONSTELLATION
    // -------------------------------------------------------------------------
    buildHorizonAndConstellation() {
      this.groupNext.position.set(0, -348, 0);

      // Layered Mountain Ridges
      for (let layer = 0; layer < 3; layer++) {
        const width = 60;
        const segs = 64;
        const ridgeGeo = new THREE.PlaneGeometry(width, 14, segs, 1);
        const pos = ridgeGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const y = pos.getY(i);
          if (y > 0) {
            const freq = 0.18 + layer * 0.08;
            const h = Math.sin(x * freq) * 3.5 + Math.cos(x * freq * 1.5) * 1.8 - layer * 1.2;
            pos.setY(i, y + h);
          }
        }
        ridgeGeo.computeVertexNormals();

        const ridgeMat = new THREE.MeshBasicMaterial({
          color: layer === 0 ? 0x05070D : layer === 1 ? 0x0A1020 : 0x1A102E,
        });
        const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
        ridge.position.set(0, -6 + layer * 1.5, -5 - layer * 6);
        this.groupNext.add(ridge);
      }

      // Sunrise Atmospheric Backlight Dome
      const sunGeo = new THREE.SphereGeometry(6, 32, 16);
      const sunMat = new THREE.MeshBasicMaterial({
        color: 0xFFB45C,
        transparent: true,
        opacity: 0.45,
      });
      const sun = new THREE.Mesh(sunGeo, sunMat);
      sun.position.set(0, -1, -22);
      this.groupNext.add(sun);

      // Reappearance of the Origin Amber Spark (Full Circle)
      const finaleSparkGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const finaleSparkMat = new THREE.MeshBasicMaterial({ color: 0xFFB45C });
      this.finaleSpark = new THREE.Mesh(finaleSparkGeo, finaleSparkMat);
      this.finaleSpark.position.set(0, 1.5, 0);
      this.groupNext.add(this.finaleSpark);
    }

    // -------------------------------------------------------------------------
    // ANIMATION & RENDER LOOP
    // -------------------------------------------------------------------------
    animate() {
      requestAnimationFrame(() => this.animate());

      const delta = this.clock.getDelta();
      const time = this.clock.getElapsedTime();

      // Slow organic rotation and biological breathing of realistic brain
      if (this.realBrain) {
        this.realBrain.rotation.y += delta * 0.05;
        this.realBrain.rotation.x = Math.sin(time * 0.4) * 0.04;
        const breath = 1.0 + Math.sin(time * 0.8) * 0.015;
        this.realBrain.scale.set(breath, breath, breath);
      }

      // Amber Spark cortical glow pulsation
      if (this.amberSpark) {
        const pulse = 1.0 + Math.sin(time * 3.5) * 0.15;
        this.amberSpark.scale.set(pulse, pulse, pulse);
      }

      // Propagate Action Potential pulse along axon (Phase 5)
      if (this.actionPotentialMesh && this.activeAxonCurve) {
        const apT = (time * 0.5) % 1;
        const pt = this.activeAxonCurve.getPoint(apT);
        this.actionPotentialMesh.position.copy(pt);

        // Synaptic vesicle agitation when pulse reaches cleft
        if (apT > 0.85) {
          this.synapticVesicles.forEach((v) => {
            v.position.x = v.userData.baseX + Math.sin(time * v.userData.speed) * 0.12;
            v.position.y = v.userData.baseY + Math.cos(time * v.userData.speed) * 0.12;
            v.position.z = v.userData.baseZ + Math.sin(time * 3.0) * 0.12;
          });
        }
      }

      // Rotate Earth & Global Arcs in Section 6
      if (this.earthGlobe) {
        this.earthGlobe.rotation.y += delta * 0.08;
      }
      if (this.arcsGroup) {
        this.arcsGroup.rotation.y += delta * 0.08;
      }

      // Stream particles along the Infinity Loop in Section 7
      if (this.infinityParticles) {
        const geo = this.infinityParticles.geometry;
        const pos = geo.attributes.position.array;
        const tOffsets = geo.userData.tOffsets;
        const a = 7.5;

        for (let i = 0; i < tOffsets.length; i++) {
          tOffsets[i] = (tOffsets[i] + delta * 0.5) % (Math.PI * 2);
          const t = tOffsets[i];
          const denom = 1 + Math.sin(t) * Math.sin(t);
          pos[i * 3] = (a * Math.cos(t)) / denom;
          pos[i * 3 + 1] = (a * Math.sin(t) * Math.cos(t)) / denom;
          pos[i * 3 + 2] = Math.sin(t * 3) * 1.5;
        }
        geo.attributes.position.needsUpdate = true;
      }

      // Pulse Finale Spark in Section 8
      if (this.finaleSpark) {
        const s = 1 + Math.sin(time * 3) * 0.2;
        this.finaleSpark.scale.set(s, s, s);
      }

      // Rotate active Constellation if created
      if (this.constellationParticles) {
        this.constellationParticles.rotation.y += delta * 0.12;
      }

      this.renderer.render(this.scene, this.camera);
    }

    setCoherence(val) {
      STATE.coherence = val;
      if (!this.chaosParticles) return;
      const geo = this.chaosParticles.geometry;
      const current = geo.userData.current;
      const chaos = geo.userData.chaos;
      const order = geo.userData.order;

      for (let i = 0; i < current.length; i++) {
        current[i] = chaos[i] * (1 - val) + order[i] * val;
      }
      geo.attributes.position.needsUpdate = true;

      if (this.clarityCrystal) {
        this.clarityCrystal.material.opacity = Math.max(0.1, val * 0.6);
      }
    }

    createCustomConstellation(text) {
      if (this.constellationParticles) {
        this.groupNext.remove(this.constellationParticles);
      }

      const offCanvas = document.createElement('canvas');
      offCanvas.width = 300;
      offCanvas.height = 100;
      const ctx = offCanvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 150, 50);

      const imgData = ctx.getImageData(0, 0, 300, 100).data;
      const starCoords = [];

      for (let y = 0; y < 100; y += 3) {
        for (let x = 0; x < 300; x += 3) {
          const alpha = imgData[(y * 300 + x) * 4 + 3];
          if (alpha > 128) {
            starCoords.push({
              x: (x - 150) * 0.05,
              y: -(y - 50) * 0.05 + 6,
              z: (Math.random() - 0.5) * 1.5,
            });
          }
        }
      }

      const count = starCoords.length;
      const posArray = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        posArray[i * 3] = starCoords[i].x;
        posArray[i * 3 + 1] = starCoords[i].y;
        posArray[i * 3 + 2] = starCoords[i].z;
      }

      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const starMat = new THREE.PointsMaterial({
        color: 0xFFB45C,
        size: 0.12,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
      });

      this.constellationParticles = new THREE.Points(starGeo, starMat);
      this.groupNext.add(this.constellationParticles);
      STATE.constellationActive = true;
    }
  }

  // ===========================================================================
  // 5. GSAP SCROLLTRIGGER ORCHESTRATION ENGINE
  // ===========================================================================
  function setupScrollTimelines(world) {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Continuous Master Camera Path linked to Global Scroll
    // Smooth Catmull-Rom spline camera travel
    const dummy = { progress: 0 };
    gsap.to(dummy, {
      progress: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: 'main.journey-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        onUpdate: (self) => {
          const p = self.progress;
          if (world.cameraSpline) {
            const camPos = world.cameraSpline.getPoint(p);
            world.camera.position.copy(camPos);

            // Dynamic camera lookAt
            if (p < 0.22) {
              world.camera.lookAt(0, 0, 0); // Focus on exterior realistic brain
            } else if (p < 0.6) {
              world.camera.lookAt(camPos.x * 0.5, camPos.y - 3, camPos.z - 2); // Microscopic neural focus
            } else {
              world.camera.lookAt(0, camPos.y, 0);
            }
          }

          // Seamless brain surface entry dissolve (Phase 3)
          if (world.brainMaterial) {
            if (p < 0.16) {
              world.brainMaterial.opacity = 0.98;
              if (world.groupOrigin) world.groupOrigin.visible = true;
            } else if (p < 0.24) {
              // Smoothly fade out exterior brain as camera enters sulcus
              const alpha = Math.max(0, 1 - (p - 0.16) / 0.08);
              world.brainMaterial.opacity = alpha * 0.98;
              if (world.groupOrigin) world.groupOrigin.visible = true;
            } else {
              world.brainMaterial.opacity = 0;
              if (world.groupOrigin) world.groupOrigin.visible = false;
            }
          }
        },
      },
    });

    // -------------------------------------------------------------------------
    // SECTION 03: PINNED SCROLL WITH 7 STORYTELLING PHASES
    // -------------------------------------------------------------------------
    const phaseTitles = [
      'Phase 01: Information Enters the Network',
      'Phase 02: Synaptic Pathways Illuminate',
      'Phase 03: The Axon Corridor Traversal',
      'Phase 04: Unconscious Associative Retrieval',
      'Phase 05: Synaptic Vesicle Chemical Signalling',
      'Phase 06: Thermodynamic Entropy Reductions',
      'Phase 07: Luminous Integration Hub',
    ];

    const phaseDescriptions = [
      'Sensory stimuli trigger rapid action potentials across dendritic arborizations. Electrical depolarization courses down myelin-sheathed axons at up to 120 meters per second.',
      'Glutamate release at synaptic junctions ignites secondary messenger cascades. Multiple candidate neural assemblies compete in parallel.',
      'The camera travels deep between pyramidal neurons and branching dendrites, observing local excitatory-inhibitory circuit balance.',
      'Floating memory engrams recombine across the hippocampus and neocortex, retrieving contextual associations below conscious awareness.',
      'Action potentials reach the synaptic bouton, inducing calcium influx and exocytosis of neurotransmitter vesicles across the synaptic cleft into dendritic spines.',
      'Global metabolic free energy declines as chaotic informational noise stabilizes into an organized cognitive hypothesis.',
      'The unified representation reaches the frontoparietal Global Neuronal Workspace, igniting conscious cognitive realization.',
    ];

    ScrollTrigger.create({
      trigger: '#section-processing',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        const phaseIdx = Math.min(6, Math.floor(p * 7));

        const counterEl = document.getElementById('phaseCounter');
        const titleEl = document.getElementById('phaseTitle');
        const descEl = document.getElementById('phaseDesc');
        const pills = document.querySelectorAll('#phasePills .phase-step-pill');

        if (counterEl) counterEl.textContent = `Phase 0${phaseIdx + 1} / 07`;
        if (titleEl) titleEl.textContent = phaseTitles[phaseIdx];
        if (descEl) descEl.textContent = phaseDescriptions[phaseIdx];

        pills.forEach((pill, idx) => {
          if (idx <= phaseIdx) {
            pill.classList.add('active');
          } else {
            pill.classList.remove('active');
          }
        });
      },
    });

    // -------------------------------------------------------------------------
    // SECTION 04: CHAOS-TO-ORDER COHERENCE PROGRESSION
    // -------------------------------------------------------------------------
    ScrollTrigger.create({
      trigger: '#section-clarity',
      start: 'top 80%',
      end: 'bottom 40%',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        const slider = document.getElementById('coherenceSlider');
        const valText = document.getElementById('coherenceValue');
        const statusText = document.getElementById('coherenceStatusText');

        world.setCoherence(p);
        if (slider) slider.value = Math.round(p * 100);
        if (valText) valText.textContent = `Coherence: ${Math.round(p * 100)}%`;

        if (statusText) {
          if (p < 0.3) {
            statusText.textContent = 'High thermodynamic entropy: Scattered sensory observations without relational order.';
          } else if (p < 0.75) {
            statusText.textContent = 'Associative clustering: Emergent correlation detected between informational vectors.';
          } else {
            statusText.textContent = 'Cognitive Crystallization: Global unified insight achieved with zero ambiguity.';
          }
        }
      },
    });

    // -------------------------------------------------------------------------
    // SECTION 05: PINNED SCROLL WITH 6 ARCHITECTURAL STAGES
    // -------------------------------------------------------------------------
    ScrollTrigger.create({
      trigger: '#section-solution',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        const stageIdx = Math.min(5, Math.floor(p * 6));

        const stageItems = document.querySelectorAll('#architecturalStagesList .stage-item');
        stageItems.forEach((item, idx) => {
          if (idx === stageIdx) {
            item.classList.add('current');
          } else {
            item.classList.remove('current');
          }
        });

        // Dynamic architectural transformation on uploaded solution-real-world.webp
        const solutionBg = document.querySelector('#section-solution .section-bg-image');
        if (solutionBg) {
          const filters = [
            'contrast(1.25) brightness(0.7) hue-rotate(180deg) saturate(0.6)', // 01 Concept blueprint
            'contrast(1.3) brightness(0.8) grayscale(0.8)',                     // 02 Wireframe
            'contrast(1.2) brightness(0.85) grayscale(0.4)',                    // 03 Structural load
            'contrast(1.15) brightness(0.9) saturate(0.8)',                     // 04 Sustainable materials
            'contrast(1.1) brightness(0.95) saturate(1.0)',                     // 05 Physical realization
            'contrast(1.05) brightness(1.0) saturate(1.05)'                     // 06 Completed biophilic pavilion
          ];
          const opacities = [0.42, 0.50, 0.58, 0.68, 0.78, 0.88];
          solutionBg.style.filter = filters[stageIdx] || filters[0];
          solutionBg.style.opacity = opacities[stageIdx] || 0.55;
        }
      },
    });

    // -------------------------------------------------------------------------
    // CINEMATIC GSAP PARALLAX ON ALL UPLOADED SECTION BACKGROUND IMAGES
    // -------------------------------------------------------------------------
    document.querySelectorAll('.story-section').forEach((section) => {
      const bgImg = section.querySelector('.section-bg-image');
      if (bgImg) {
        gsap.fromTo(
          bgImg,
          { yPercent: -10, scale: 1.06 },
          {
            yPercent: 10,
            scale: 1.0,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }
    });
  }

  // ===========================================================================
  // 6. INTERACTIVE FEATURES & EXPERIMENTS
  // ===========================================================================
  function setupInteractiveFeatures(world) {
    // -------------------------------------------------------------------------
    // FEATURE A: CONNECT THE UNEXPECTED (Section 2)
    // -------------------------------------------------------------------------
    const conceptCombinations = {
      'mycelium+architecture': 'Bio-regenerative self-healing insulation & mycelium structural bricks that sequester carbon.',
      'kingfisher+train': 'Shinkansen 500-Series bullet train: Biomimetic nose eliminates sonic tunnel boom and cuts energy use 15%.',
      'cryptography+quantum': 'BB84 Protocol: Quantum Key Distribution guaranteed unbreakable by the Heisenberg Uncertainty Principle.',
      'bioluminescence+imaging': 'Green Fluorescent Protein (GFP): Nobel Prize-winning biomarker illuminating live intracellular tumor dynamics.',
    };

    const pills = document.querySelectorAll('#conceptPillsList .concept-btn');
    const resultBox = document.getElementById('connectionResult');
    const svgLine = document.getElementById('connectionLine');

    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const id = pill.getAttribute('data-id');
        if (STATE.selectedConcepts.includes(id)) {
          STATE.selectedConcepts = STATE.selectedConcepts.filter((c) => c !== id);
          pill.classList.remove('selected');
        } else {
          if (STATE.selectedConcepts.length >= 2) {
            const first = STATE.selectedConcepts.shift();
            const firstPill = document.querySelector(`.concept-btn[data-id="${first}"]`);
            if (firstPill) firstPill.classList.remove('selected');
          }
          STATE.selectedConcepts.push(id);
          pill.classList.add('selected');
        }

        evaluateConceptRecombination();
      });
    });

    function evaluateConceptRecombination() {
      if (STATE.selectedConcepts.length === 2) {
        const sortedKey = [...STATE.selectedConcepts].sort().join('+');
        const match = conceptCombinations[sortedKey];

        if (svgLine) {
          svgLine.setAttribute('stroke-dasharray', 'none');
          svgLine.setAttribute('opacity', '1');
          svgLine.setAttribute('stroke', 'var(--electric-cyan)');
        }

        if (match) {
          resultBox.innerHTML = `<strong>Synaptic Breakthrough:</strong> ${match}`;
        } else {
          resultBox.innerHTML = `<strong>Novel Cross-Pollination:</strong> Recombining these two domains triggers exploratory cognitive search, challenging orthodox domain silos.`;
        }
        soundEngine.triggerNeuralPulse(620);
      } else {
        if (svgLine) {
          svgLine.setAttribute('stroke-dasharray', '6,4');
          svgLine.setAttribute('opacity', '0.3');
          svgLine.setAttribute('stroke', 'var(--idea-amber)');
        }
        resultBox.textContent = 'Select any two concepts above to observe synaptic synthesis...';
      }
    }

    const btnShuffle = document.getElementById('btnShuffleConcepts');
    if (btnShuffle) {
      btnShuffle.addEventListener('click', () => {
        const keys = Object.keys(conceptCombinations);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const [c1, c2] = randomKey.split('+');

        pills.forEach((p) => p.classList.remove('selected'));
        STATE.selectedConcepts = [c1, c2];

        const p1 = document.querySelector(`.concept-btn[data-id="${c1}"]`);
        const p2 = document.querySelector(`.concept-btn[data-id="${c2}"]`);
        if (p1) p1.classList.add('selected');
        if (p2) p2.classList.add('selected');

        evaluateConceptRecombination();
      });
    }

    // -------------------------------------------------------------------------
    // FEATURE B: AI VS HUMAN MIND SPLIT SCREEN (Section 3)
    // -------------------------------------------------------------------------
    const tabBio = document.getElementById('tabBio');
    const tabSilicon = document.getElementById('tabSilicon');
    const colHuman = document.getElementById('colHuman');
    const colAI = document.getElementById('colAI');

    if (tabBio && tabSilicon && colHuman && colAI) {
      tabBio.addEventListener('click', () => {
        tabBio.classList.add('active');
        tabSilicon.classList.remove('active');
        colHuman.style.borderColor = 'var(--idea-amber)';
        colAI.style.borderColor = 'transparent';
      });

      tabSilicon.addEventListener('click', () => {
        tabSilicon.classList.add('active');
        tabBio.classList.remove('active');
        colAI.style.borderColor = 'var(--electric-cyan)';
        colHuman.style.borderColor = 'transparent';
      });
    }

    // -------------------------------------------------------------------------
    // FEATURE C: PATTERN RECOGNITION COHERENCE SLIDER (Section 4)
    // -------------------------------------------------------------------------
    const slider = document.getElementById('coherenceSlider');
    const valText = document.getElementById('coherenceValue');
    const statusText = document.getElementById('coherenceStatusText');

    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) / 100;
        world.setCoherence(val);
        if (valText) valText.textContent = `Coherence: ${Math.round(val * 100)}%`;

        if (statusText) {
          if (val < 0.3) {
            statusText.textContent = 'High thermodynamic entropy: Scattered sensory observations without relational order.';
          } else if (val < 0.75) {
            statusText.textContent = 'Associative clustering: Emergent correlation detected between informational vectors.';
          } else {
            statusText.textContent = 'Cognitive Crystallization: Global unified insight achieved with zero ambiguity.';
          }
        }
      });
    }

    // -------------------------------------------------------------------------
    // FEATURE C2: GLOBAL MILESTONES 3D GLOBE TARGETING (Section 6)
    // -------------------------------------------------------------------------
    const milestoneCards = document.querySelectorAll('.milestone-card');
    milestoneCards.forEach((card) => {
      card.addEventListener('click', () => {
        milestoneCards.forEach((c) => c.classList.remove('active'));
        card.classList.add('active');

        const lng = parseFloat(card.getAttribute('data-lng')) || 0;
        const targetRotY = - (lng + 90) * (Math.PI / 180);

        if (world.earthGlobe && typeof gsap !== 'undefined') {
          gsap.to(world.earthGlobe.rotation, {
            y: targetRotY,
            duration: 1.4,
            ease: 'power2.out',
          });
        }
        if (world.arcsGroup && typeof gsap !== 'undefined') {
          gsap.to(world.arcsGroup.rotation, {
            y: targetRotY,
            duration: 1.4,
            ease: 'power2.out',
          });
        }
        soundEngine.triggerNeuralPulse(740);
      });
    });

    // -------------------------------------------------------------------------
    // FEATURE D: TEXT-TO-CONSTELLATION CREATOR (Section 8)
    // -------------------------------------------------------------------------
    const constForm = document.getElementById('constellationForm');
    const ideaInput = document.getElementById('userIdeaInput');
    const feedbackMsg = document.getElementById('constellationFeedback');
    const btnRestart = document.getElementById('btnRestartJourney');

    if (constForm && ideaInput) {
      constForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = ideaInput.value.trim();
        if (text.length > 0) {
          world.createCustomConstellation(text);
          if (feedbackMsg) feedbackMsg.classList.add('show');
          soundEngine.triggerNeuralPulse(880);
        }
      });
    }

    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        if (lenis) {
          lenis.scrollTo(0, { duration: 2.2 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    // -------------------------------------------------------------------------
    // MOBILE DRAWER TOGGLE
    // -------------------------------------------------------------------------
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const siteNav = document.getElementById('siteNav');
    if (mobileBtn && siteNav) {
      mobileBtn.addEventListener('click', () => {
        const isHidden = window.getComputedStyle(siteNav).display === 'none';
        if (isHidden) {
          siteNav.style.display = 'flex';
          siteNav.style.position = 'fixed';
          siteNav.style.top = 'var(--header-height)';
          siteNav.style.right = '1.5rem';
          siteNav.style.flexDirection = 'column';
          siteNav.style.background = 'rgba(10, 16, 32, 0.96)';
          siteNav.style.border = '1px solid var(--border-subtle)';
          siteNav.style.borderRadius = '12px';
          siteNav.style.padding = '1.5rem';
          siteNav.style.backdropFilter = 'blur(20px)';
          siteNav.style.boxShadow = '0 15px 40px rgba(0,0,0,0.8)';
          siteNav.style.zIndex = '150';
        } else {
          siteNav.style.display = 'none';
        }
      });

      // Auto-close menu drawer when a navigation link is clicked
      siteNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          if (window.innerWidth < 992) {
            siteNav.style.display = 'none';
          }
        });
      });
    }
  }

  // ===========================================================================
  // 7. AUDIO CONTROLS & WELCOME MODAL
  // ===========================================================================
  function setupAudioControls() {
    const modal = document.getElementById('audioIntroModal');
    const btnEnable = document.getElementById('btnEnableAudio');
    const btnMute = document.getElementById('btnMuteAudio');
    const toggleBtn = document.getElementById('audioToggleBtn');

    if (btnEnable) {
      btnEnable.addEventListener('click', () => {
        soundEngine.toggle(true);
        if (modal) modal.classList.add('hidden');
      });
    }

    if (btnMute) {
      btnMute.addEventListener('click', () => {
        soundEngine.toggle(false);
        if (modal) modal.classList.add('hidden');
      });
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        soundEngine.toggle();
      });
    }
  }

  // ===========================================================================
  // 8. CUSTOM DESKTOP CURSOR
  // ===========================================================================
  function initCustomCursor() {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    if (!dot || !ring || window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    const clickables = document.querySelectorAll('button, a, input, .milestone-card, .spectrum-node');
    clickables.forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // ===========================================================================
  // 9. BOOTSTRAP APPLICATION
  // ===========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initCustomCursor();
    setupAudioControls();

    const world = new World3D();
    setupScrollTimelines(world);
    setupInteractiveFeatures(world);
  });
})();
