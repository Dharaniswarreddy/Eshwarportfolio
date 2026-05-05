const loader = document.getElementById("loader");
const cursorGlow = document.getElementById("cursorGlow");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

window.addEventListener("load", () => {
    setTimeout(() => {
        if (loader) loader.classList.add("hidden");
        animateCounters();
    }, 700);
});

document.addEventListener("mousemove", (event) => {
    if (!cursorGlow) return;
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
});

if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        hamburger.setAttribute("aria-expanded", String(isOpen));
    });
}

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.delay || 0);
        setTimeout(() => {
            entry.target.classList.add("active");
            const bar = entry.target.querySelector(".skill-bar");
            if (bar) bar.style.width = `${bar.dataset.width}%`;
        }, delay);
        revealObserver.unobserve(entry.target);
    });
}, { threshold: 0.18 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

document.querySelectorAll(".skill-card, .project-card, .timeline-card, .contact-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
        if (window.matchMedia("(max-width: 720px)").matches) return;
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateX = (y - rect.height / 2) / 28;
        const rotateY = (rect.width / 2 - x) / 28;
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "";
    });
});

function animateCounters() {
    document.querySelectorAll("[data-count]").forEach((counter) => {
        const target = Number(counter.dataset.count);
        const start = performance.now();
        const duration = 1300;

        function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    });
}

document.querySelectorAll(".contact-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const button = form.querySelector(".submit-btn");
        if (!button) return;
        const previousText = button.textContent;
        button.textContent = "Message Ready";
        setTimeout(() => {
            button.textContent = previousText;
            form.reset();
        }, 1800);
    });
});

const container = document.getElementById("canvas-container");

if (container && window.THREE) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a1a, 0.001);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 54);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a1a, 1);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x182040, 0.6));

    const cyanLight = new THREE.PointLight(0x00f0ff, 2.2, 220);
    cyanLight.position.set(52, 42, 42);
    scene.add(cyanLight);

    const magentaLight = new THREE.PointLight(0xff00aa, 1.6, 190);
    magentaLight.position.set(-44, -20, 34);
    scene.add(magentaLight);

    const greenLight = new THREE.PointLight(0x00ff88, 1.1, 150);
    greenLight.position.set(0, 36, -42);
    scene.add(greenLight);

    const page = document.body.dataset.page || "home";
    const palette = {
        home: [0x00f0ff, 0xff00aa, 0x8b5cf6],
        skills: [0x00ff88, 0x00f0ff, 0x8b5cf6],
        projects: [0xff00aa, 0x00f0ff, 0x00ff88],
        education: [0x8b5cf6, 0x00f0ff, 0xff00aa],
        contact: [0x00f0ff, 0x00ff88, 0xff00aa]
    }[page];

    const particleCount = 2200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const particleGeometry = new THREE.BufferGeometry();

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 430;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 360;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 430;

        const color = new THREE.Color(palette[i % palette.length]);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
            size: 1.18,
            vertexColors: true,
            transparent: true,
            opacity: 0.58,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        })
    );
    scene.add(particles);

    const materialSet = palette.map((color) => new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.12,
        wireframe: true,
        transparent: true,
        opacity: 0.62
    }));

    const shapes = [];
    const addShape = (geometry, material, position, scale, rotationSpeed) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position[0], position[1], position[2]);
        mesh.scale.set(scale, scale, scale);
        scene.add(mesh);
        shapes.push({ mesh, rotationSpeed, baseY: position[1] });
    };

    addShape(new THREE.TorusKnotGeometry(8, 2, 110, 14), materialSet[0], [34, 14, -30], 1, [0.003, 0.004, 0.002]);
    addShape(new THREE.IcosahedronGeometry(9, 0), materialSet[1], [-34, -10, -22], 1, [0.004, 0.002, 0.004]);
    addShape(new THREE.OctahedronGeometry(7, 0), materialSet[2], [-18, 24, -46], 1, [0.002, 0.004, 0.003]);
    addShape(new THREE.TorusGeometry(22, 0.35, 10, 90), materialSet[1], [4, -22, -58], 1, [0.001, 0.001, 0.002]);

    const grid = new THREE.GridHelper(220, 44, 0x101044, 0x101044);
    grid.position.y = -52;
    scene.add(grid);

    const linePositions = [];
    for (let i = 0; i < 140; i++) {
        const x = (Math.random() - 0.5) * 220;
        const y = (Math.random() - 0.5) * 180;
        const z = (Math.random() - 0.5) * 220;
        linePositions.push(x, y, z, x + (Math.random() - 0.5) * 45, y + (Math.random() - 0.5) * 45, z + (Math.random() - 0.5) * 45);
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({
        color: palette[0],
        transparent: true,
        opacity: 0.065
    }));
    scene.add(lines);

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let scrollProgress = 0;

    document.addEventListener("mousemove", (event) => {
        targetX = (event.clientY / window.innerHeight - 0.5) * 0.5;
        targetY = (event.clientX / window.innerWidth - 0.5) * 0.5;
    });

    window.addEventListener("scroll", () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    });

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();

    function animateScene() {
        requestAnimationFrame(animateScene);
        const elapsed = clock.getElapsedTime();

        currentX += (targetX - currentX) * 0.045;
        currentY += (targetY - currentY) * 0.045;

        camera.position.x = Math.sin(currentY) * 5;
        camera.position.y = Math.sin(currentX) * 3 - scrollProgress * 11;
        camera.position.z = 54 + scrollProgress * 20;
        camera.rotation.x = currentX * 0.24;
        camera.rotation.y = currentY * 0.24;

        shapes.forEach((shape, index) => {
            shape.mesh.rotation.x += shape.rotationSpeed[0];
            shape.mesh.rotation.y += shape.rotationSpeed[1];
            shape.mesh.rotation.z += shape.rotationSpeed[2];
            shape.mesh.position.y = shape.baseY + Math.sin(elapsed * 0.7 + index) * 2.2;
        });

        particles.rotation.y += 0.00022;
        particles.rotation.x += 0.00008;
        lines.rotation.y -= 0.00026;
        grid.position.z = (elapsed * 4) % 10;

        cyanLight.position.x = Math.sin(elapsed * 0.32) * 58;
        cyanLight.position.z = Math.cos(elapsed * 0.32) * 58;
        magentaLight.position.y = Math.sin(elapsed * 0.42) * 42;

        renderer.render(scene, camera);
    }

    animateScene();
}
