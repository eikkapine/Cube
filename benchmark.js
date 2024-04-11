const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Adjust camera position
camera.position.z = 300;

const group = new THREE.Group();
scene.add(group);

// Number of particles (cubes) in the scene
const particleCount = 50000;
const cubeSize = 5; // Size of each cube

for (let i = 0; i < particleCount; i++) {
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const red = Math.random();
    const green = Math.random();
    const blue = Math.random();
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(red, green, blue) });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true; // Enable shadow casting
    cube.receiveShadow = true; // Enable shadow receiving

    // Set cube positions
    const x = (Math.random() - 0.5) * 400; // Adjust the spread range
    const y = (Math.random() - 0.5) * 400;
    const z = (Math.random() - 0.5) * 400;
    cube.position.set(x, y, z);

    group.add(cube); // Add cubes to the group
}

// Add realistic lighting to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
directionalLight.castShadow = true; // Enable shadow casting for the directional light
scene.add(directionalLight);

// Add zooming controls
const zoomSpeed = 0.1;
const moveSpeed = 2;
const rotationSpeed = 0.02;

const moveState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    tiltUp: false,
    tiltDown: false,
    panLeft: false,
    panRight: false
};

window.addEventListener('wheel', (event) => {
    // Adjust camera position based on the mouse wheel delta
    camera.position.z -= event.deltaY * 0.1 * zoomSpeed;
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'w' || event.key === 'ArrowDown') moveState.forward = true;
    if (event.key === 's' || event.key === 'ArrowUp') moveState.backward = true;
    if (event.key === 'a' || event.key === 'ArrowRight') moveState.left = true;
    if (event.key === 'd' || event.key === 'ArrowLeft') moveState.right = true;
    if (event.key === 'ArrowUp') moveState.tiltUp = true;
    if (event.key === 'ArrowDown') moveState.tiltDown = true;
    if (event.key === 'ArrowLeft') moveState.panLeft = true;
    if (event.key === 'ArrowRight') moveState.panRight = true;
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'w' || event.key === 'ArrowDown') moveState.forward = false;
    if (event.key === 's' || event.key === 'ArrowUp') moveState.backward = false;
    if (event.key === 'a' || event.key === 'ArrowRight') moveState.left = false;
    if (event.key === 'd' || event.key === 'ArrowLeft') moveState.right = false;
    if (event.key === 'ArrowUp') moveState.tiltUp = false;
    if (event.key === 'ArrowDown') moveState.tiltDown = false;
    if (event.key === 'ArrowLeft') moveState.panLeft = false;
    if (event.key === 'ArrowRight') moveState.panRight = false;
});

const fpsContainer = document.createElement('div');
fpsContainer.style.position = 'absolute';
fpsContainer.style.top = '10px';
fpsContainer.style.left = '10px';
fpsContainer.style.color = 'white';
document.body.appendChild(fpsContainer);

let frameCount = 0;
let lastTime;
function updateFPS(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    const fps = Math.round(1000 / deltaTime);
    fpsContainer.textContent = `FPS: ${fps}`;
    frameCount++;
}

const animate = (currentTime) => {
    requestAnimationFrame(animate);

    updateFPS(currentTime); // Update FPS

    if (moveState.tiltUp) camera.rotation.x += rotationSpeed; // Invert tiltUp control
    if (moveState.tiltDown) camera.rotation.x -= rotationSpeed; // Invert tiltDown control
    if (moveState.panLeft) camera.rotation.y += rotationSpeed; // Invert panLeft control
    if (moveState.panRight) camera.rotation.y -= rotationSpeed; // Invert panRight control

    const moveDirection = new THREE.Vector3();
    camera.getWorldDirection(moveDirection);

    let moveFactor = moveState.forward || moveState.backward ? moveSpeed : 0;

    if (moveState.forward) {
        camera.position.add(moveDirection.clone().multiplyScalar(moveFactor)); // Forward control (not inverted)
    }
    if (moveState.backward) {
        camera.position.add(moveDirection.clone().multiplyScalar(-moveFactor)); // Backward control (inverted)
    }
    if (moveState.left) {
        const leftVector = new THREE.Vector3(-1, 0, 0); // Left control (inverted)
        leftVector.applyQuaternion(camera.quaternion);
        camera.position.add(leftVector.multiplyScalar(moveFactor));
    }
    if (moveState.right) {
        const rightVector = new THREE.Vector3(1, 0, 0); // Right control (inverted)
        rightVector.applyQuaternion(camera.quaternion);
        camera.position.add(rightVector.multiplyScalar(moveFactor));
    }

    moveFactor = moveState.scrollUp || moveState.scrollDown ? zoomSpeed : 0;

    if (moveState.scrollDown) {
        camera.position.z += moveFactor; // Scroll up (not inverted)
    }
    if (moveState.scrollUp) {
        camera.position.z -= moveFactor; // Scroll down (not inverted)
    }

    group.rotation.x += 0.005;
    group.rotation.y += 0.005;

    renderer.render(scene, camera);
};

animate();