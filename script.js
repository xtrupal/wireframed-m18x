let isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints;

function showSection(sectionId) {
  document.querySelectorAll(".control-section").forEach((section) => {
    section.classList.remove("active");
  });
  document.getElementById(sectionId).classList.add("active");
  document.querySelectorAll(".tab-buttons button").forEach((button) => {
    button.classList.remove("active");
  });
  event.target.classList.add("active");
}

function resetAllControls() {
  // Reset all inputs to their default values
  document.getElementById("blackHoleSize").value = "5";
  document.getElementById("blackHoleColor").value = "#000000";
  document.getElementById("diskSize").value = "12";
  document.getElementById("diskThickness").value = "4";
  document.getElementById("diskColor").value = "#ff7700";
  document.getElementById("diskOpacity").value = "0.8";
  document.getElementById("diskRotationSpeed").value = "0.002";
  document.getElementById("glowSize").value = "12";
  document.getElementById("glowThickness").value = "6";
  document.getElementById("glowColor").value = "#ff3300";
  document.getElementById("glowOpacity").value = "0.3";
  document.getElementById("ringCount").value = "8";
  document.getElementById("ringColor").value = "#00ffff";
  document.getElementById("ringOpacity").value = "0.3";
  document.getElementById("starCount").value = "3000";
  document.getElementById("starSize").value = "0.5";
  document.getElementById("starColor").value = "#ffffff";
  document.getElementById("starOpacity").value = "0.8";

  // Trigger input events to update the visualization
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.dispatchEvent(new Event("input"));
  });
}

window.addEventListener("load", () => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.5,
    1000
  );
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  document.body.appendChild(renderer.domElement);

  // Create the black sphere (event horizon)
  let blackHoleGeometry = new THREE.SphereGeometry(5, 64, 64);
  let blackHoleMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
  });
  const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
  scene.add(blackHole);

  // Create the primary accretion disk
  let diskGeometry = new THREE.TorusGeometry(12, 4, 64, 90);
  let diskMaterial = new THREE.MeshBasicMaterial({
    color: 0xff7700,
    wireframe: true,
    transparent: true,
    opacity: 0.8,
  });
  const accretionDisk = new THREE.Mesh(diskGeometry, diskMaterial);
  accretionDisk.rotation.x = Math.PI / 2;
  scene.add(accretionDisk);

  // Create the outer glow disk
  let glowGeometry = new THREE.TorusGeometry(12, 6, 64, 100);
  let glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff3300,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  });
  const glowDisk = new THREE.Mesh(glowGeometry, glowMaterial);
  glowDisk.rotation.x = Math.PI / 2;
  scene.add(glowDisk);

  // Create gravitational lensing effect
  const lensingRings = [];
  let ringCount = 8;

  function updateLensingRings() {
    // Remove existing rings
    lensingRings.forEach((ring) => scene.remove(ring));
    lensingRings.length = 0;

    // Create new rings
    for (let i = 0; i < ringCount; i++) {
      const radius = 6 + i * 0.5;
      const geometry = new THREE.TorusGeometry(radius, 0.1, 32, 100);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3 - i * 0.03,
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      lensingRings.push(ring);
    }
  }
  updateLensingRings();

  // Add stars
  let starCount = 3000;
  let starSize = 0.5;
  let starOpacity = 0.8;
  let starColor = 0xffffff;

  function updateStars() {
    scene.remove(stars);
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 400;
      const y = (Math.random() - 0.5) * 400;
      const z = (Math.random() - 0.5) * 400;
      if (Math.sqrt(x * x + y * y + z * z) > 50) {
        starPositions.push(x, y, z);
      }
    }
    starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPositions, 3)
    );
    stars = new THREE.Points(
      starsGeometry,
      new THREE.PointsMaterial({
        color: starColor,
        size: starSize,
        transparent: true,
        opacity: starOpacity,
      })
    );
    scene.add(stars);
  }

  let stars;
  updateStars();

  // Position camera
  camera.position.z = 40;
  camera.position.y = 20;
  camera.lookAt(0, 0, 0);

  // Event Listeners for Controls
  document.getElementById("blackHoleSize").addEventListener("input", (e) => {
    const size = parseFloat(e.target.value);
    blackHoleGeometry = new THREE.SphereGeometry(size, 64, 64);
    blackHole.geometry = blackHoleGeometry;
  });

  document.getElementById("blackHoleColor").addEventListener("input", (e) => {
    blackHoleMaterial.color.setStyle(e.target.value);
  });

  document.getElementById("diskSize").addEventListener("input", (e) => {
    const size = parseFloat(e.target.value);
    diskGeometry = new THREE.TorusGeometry(
      size,
      diskGeometry.parameters.tube,
      64,
      90
    );
    accretionDisk.geometry = diskGeometry;
  });

  document.getElementById("diskThickness").addEventListener("input", (e) => {
    const thickness = parseFloat(e.target.value);
    diskGeometry = new THREE.TorusGeometry(
      diskGeometry.parameters.radius,
      thickness,
      64,
      90
    );
    accretionDisk.geometry = diskGeometry;
  });

  document.getElementById("diskColor").addEventListener("input", (e) => {
    diskMaterial.color.setStyle(e.target.value);
  });

  document.getElementById("diskOpacity").addEventListener("input", (e) => {
    diskMaterial.opacity = parseFloat(e.target.value);
  });

  let diskRotationSpeed = 0.002;
  document
    .getElementById("diskRotationSpeed")
    .addEventListener("input", (e) => {
      diskRotationSpeed = parseFloat(e.target.value);
    });

  document.getElementById("glowSize").addEventListener("input", (e) => {
    const size = parseFloat(e.target.value);
    glowGeometry = new THREE.TorusGeometry(
      size,
      glowGeometry.parameters.tube,
      64,
      100
    );
    glowDisk.geometry = glowGeometry;
  });

  document.getElementById("glowThickness").addEventListener("input", (e) => {
    const thickness = parseFloat(e.target.value);
    glowGeometry = new THREE.TorusGeometry(
      glowGeometry.parameters.radius,
      thickness,
      64,
      100
    );
    glowDisk.geometry = glowGeometry;
  });

  document.getElementById("glowColor").addEventListener("input", (e) => {
    glowMaterial.color.setStyle(e.target.value);
  });

  document.getElementById("glowOpacity").addEventListener("input", (e) => {
    glowMaterial.opacity = parseFloat(e.target.value);
  });

  document.getElementById("ringCount").addEventListener("input", (e) => {
    ringCount = parseInt(e.target.value);
    updateLensingRings();
  });

  document.getElementById("ringColor").addEventListener("input", (e) => {
    lensingRings.forEach((ring) => {
      ring.material.color.setStyle(e.target.value);
    });
  });

  document.getElementById("ringOpacity").addEventListener("input", (e) => {
    const baseOpacity = parseFloat(e.target.value);
    lensingRings.forEach((ring, i) => {
      ring.material.opacity = baseOpacity - i * 0.03;
    });
  });

  document.getElementById("starCount").addEventListener("input", (e) => {
    starCount = parseInt(e.target.value);
    updateStars();
  });

  document.getElementById("starSize").addEventListener("input", (e) => {
    starSize = parseFloat(e.target.value);
    updateStars();
  });

  document.getElementById("starColor").addEventListener("input", (e) => {
    starColor = e.target.value;
    updateStars();
  });

  document.getElementById("starOpacity").addEventListener("input", (e) => {
    starOpacity = parseFloat(e.target.value);
    updateStars();
  });

  // Mouse control variables
  let mouseDown = false;
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;

  // Add mouse event listeners
  document.addEventListener("mousedown", (e) => {
    mouseDown = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener("mouseup", () => {
    mouseDown = false;
  });

  document.addEventListener("mousemove", (e) => {
    if (mouseDown) {
      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;

      mouseX = e.clientX;
      mouseY = e.clientY;
    }
  });

  // Touch event listeners for mobile
  if (isTouchDevice) {
    let touchStartX = 0;
    let touchStartY = 0;

    document.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });

    document.addEventListener("touchmove", (e) => {
      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;

      targetRotationY += deltaX * 0.01;
      targetRotationX += deltaY * 0.01;

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });
  }

  // Add mouse wheel zoom with limits
  const minDistance = 20; // Minimum zoom distance
  const maxDistance = 100; // Maximum zoom distance

  document.addEventListener("wheel", (e) => {
    const distance = Math.sqrt(
      camera.position.x * camera.position.x +
        camera.position.y * camera.position.y +
        camera.position.z * camera.position.z
    );

    if (e.deltaY < 0 && distance < maxDistance) {
      camera.position.multiplyScalar(1.1);
    } else if (e.deltaY > 0 && distance > minDistance) {
      camera.position.multiplyScalar(0.9);
    }
  });

  // Touch pinch zoom for mobile with limits
  let initialDistance = null;

  document.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      initialDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  });

  document.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2 && initialDistance) {
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );

      const zoomFactor = initialDistance / currentDistance; // Inverted zoom factor

      const distance = Math.sqrt(
        camera.position.x * camera.position.x +
          camera.position.y * camera.position.y +
          camera.position.z * camera.position.z
      );

      if (
        distance * zoomFactor > minDistance &&
        distance * zoomFactor < maxDistance
      ) {
        camera.position.multiplyScalar(zoomFactor);
      }

      initialDistance = currentDistance; // Update the initial distance
    }
  });

  // Animation
  let time = 0;

  function animate() {
    requestAnimationFrame(animate);
    time += 0.005;

    // Rotate accretion disks
    accretionDisk.rotation.z += diskRotationSpeed;
    glowDisk.rotation.z -= diskRotationSpeed / 2;

    // Animate lensing rings
    lensingRings.forEach((ring, i) => {
      ring.rotation.z += 0.001 * (i + 1);
      ring.scale.x = 1 + Math.sin(time + i) * 0.1;
      ring.scale.y = 1 + Math.cos(time + i) * 0.1;
    });

    // Update camera position based on mouse control
    const radius = Math.sqrt(
      camera.position.x * camera.position.x +
        camera.position.y * camera.position.y +
        camera.position.z * camera.position.z
    );

    camera.position.x =
      radius * Math.sin(targetRotationY) * Math.cos(targetRotationX);
    camera.position.y = radius * Math.sin(targetRotationX);
    camera.position.z =
      radius * Math.cos(targetRotationY) * Math.cos(targetRotationX);

    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }

  // Handle window resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  animate();
});
