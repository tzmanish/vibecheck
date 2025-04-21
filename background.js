// Three.js background animation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Create grid with vibrant colors
const gridSize = 20;
const gridDivisions = 20;
const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xff00ff, 0x00ffff);
gridHelper.position.y = -10;
gridHelper.material.opacity = 0.3;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// Create particles with more complex geometry
const particleCount = 200;
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const sizes = new Float32Array(particleCount);

// Define vibrant colors
const colorPalette = [
    new THREE.Color(0xff00ff), // Magenta
    new THREE.Color(0x00ffff), // Cyan
    new THREE.Color(0xff3366), // Pink
    new THREE.Color(0xffff00), // Yellow
    new THREE.Color(0xff0000), // Red
    new THREE.Color(0x00ff00)  // Green
];

// Initialize particles
for (let i = 0; i < particleCount; i++) {
    // Random positions in a sphere
    const radius = 20 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    
    // Random colors from palette
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    
    // Random sizes
    sizes[i] = 0.1 + Math.random() * 0.3;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

// Custom shader material for particles
const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 },
        pointTexture: { value: null }
    },
    vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
            vColor = color;
            
            // Add some wave motion
            vec3 pos = position;
            pos.y += sin(time * 0.5 + position.x * 0.1) * 0.5;
            pos.x += cos(time * 0.3 + position.z * 0.1) * 0.5;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        varying vec3 vColor;
        
        void main() {
            // Create a circular particle
            float r = 0.0;
            vec2 cxy = 2.0 * gl_PointCoord - 1.0;
            r = dot(cxy, cxy);
            if (r > 1.0) {
                discard;
            }
            
            // Add glow effect
            float glow = 1.0 - r;
            glow = pow(glow, 2.0);
            
            gl_FragColor = vec4(vColor, glow);
        }
    `,
    transparent: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// Create floating game icons with vibrant colors
const iconGeometry = new THREE.PlaneGeometry(1, 1);
const iconMaterial = new THREE.MeshBasicMaterial({
    color: colorPalette[0],
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
});

const icons = [];
const iconCount = 15;

for (let i = 0; i < iconCount; i++) {
    const icon = new THREE.Mesh(iconGeometry, iconMaterial.clone());
    icon.material.color.copy(colorPalette[i % colorPalette.length]);
    icon.position.x = (Math.random() - 0.5) * 40;
    icon.position.y = (Math.random() - 0.5) * 30;
    icon.position.z = (Math.random() - 0.5) * 40;
    icon.rotation.x = Math.random() * Math.PI;
    icon.rotation.y = Math.random() * Math.PI;
    icons.push(icon);
    scene.add(icon);
}

// Add ambient light with color tint
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Mouse movement effect
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth - 0.5) * 0.5;
    mouseY = (event.clientY / window.innerHeight - 0.5) * 0.5;
});

// Animation
function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // Update particle shader time uniform
    particleMaterial.uniforms.time.value = time;
    
    // Rotate particles
    particles.rotation.x += 0.001;
    particles.rotation.y += 0.001;
    
    // More dynamic grid movement
    gridHelper.position.y = -10 + Math.sin(time * 0.5) * 1;

    // Icon animations with more dynamic color transitions
    icons.forEach((icon, index) => {
        icon.rotation.x += 0.003;
        icon.rotation.y += 0.003;
        icon.position.y += Math.sin(time * 0.5 + index) * 0.02;
        
        // Pulsing opacity
        icon.material.opacity = 0.3 + Math.sin(time * 0.5 + index) * 0.2;
    });

    // More responsive camera movement
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.1;
    camera.position.y += (mouseY * 3 - camera.position.y) * 0.1;

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate(); 