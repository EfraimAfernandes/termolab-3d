/* ==========================================================================
   SIMULADOR 3D DAS LEIS DA TERMODINÂMICA - SCRIPT PRINCIPAL
   ========================================================================== */

// Garantir que o script seja executado após o carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

// Estado global do aplicativo
let scene, camera, renderer, controls;
let activeLaw = 0;
let isPlaying = true;
let simSpeed = 1.0;
let time = 0;
let activeMeshGroup;
let currentModule = null;
let formulaDemosManager;

// Dados Didáticos em Português
const LAWS_DATA = {
    0: {
        badge: "Lei Zero",
        title: "Equilíbrio Térmico",
        formula: "Se T_A = T_B e T_B = T_C  ⇒  T_A = T_C",
        definition: "A Lei Zero estabelece que se dois corpos estão em equilíbrio térmico com um terceiro, eles também estão em equilíbrio térmico entre si.",
        concept: "Esta lei define o conceito de temperatura e serve como base para todos os termômetros. Quando os corpos entram em contato térmico, a energia flui do mais quente para o mais frio até que as temperaturas se igualem.",
        dailyExample: "Colocar um termômetro sob a língua: ele absorve calor do seu corpo até atingir exatamente a mesma temperatura, permitindo a medição precisa.",
        practicalApp: "Calibração de sensores industriais e termopares, além do projeto de sistemas de climatização onde múltiplos compartimentos devem manter uma temperatura homogênea.",
        formulaLabel: "Relação de Equilíbrio"
    },
    1: {
        badge: "1ª Lei",
        title: "Conservação da Energia",
        formula: "ΔU = Q - W",
        definition: "A variação da energia interna (ΔU) de um sistema é igual ao calor (Q) trocado com o meio menos o trabalho (W) realizado pelo sistema.",
        concept: "A energia não pode ser criada nem destruída, apenas transformada. Em um sistema fechado (como um pistão), o calor adicionado pode aumentar a agitação das partículas (temperatura/energia interna) ou ser convertido em movimento mecânico (trabalho).",
        dailyExample: "Uma panela de pressão: o fogo fornece calor (Q), a temperatura da água aumenta (ΔU) e o vapor sob pressão empurra a válvula para cima realizando trabalho (W).",
        practicalApp: "Motores a combustão (carros), turbinas de usinas termoelétricas e compressores de geladeira, onde calor é convertido continuamente em trabalho mecânico.",
        formulaLabel: "Equação da 1ª Lei"
    },
    2: {
        badge: "2ª Lei",
        title: "Entropia e Irreversibilidade",
        formula: "ΔS_universo ≥ 0",
        definition: "Processos naturais são irreversíveis e a entropia total do universo sempre tende a aumentar com o tempo.",
        concept: "O calor flui espontaneamente apenas do corpo quente para o frio. A entropia mede a dispersão de energia ou a desordem do sistema. Uma vez que as partículas se misturam ou se dispersam, o estado original ordenado não pode ser recuperado sem trabalho externo.",
        dailyExample: "Uma gota de tinta se espalhando na água: ela se difunde espontaneamente por todo o copo, mas nunca voltará a se concentrar em uma única gota de forma natural.",
        practicalApp: "Cálculo do rendimento máximo teórico de máquinas térmicas (Ciclo de Carnot) e projeto de sistemas de refrigeração eficientes.",
        formulaLabel: "Princípio da Entropia"
    },
    3: {
        badge: "3ª Lei",
        title: "Zero Absoluto",
        formula: "S → S_0 (mínimo) quando T → 0 K",
        definition: "A entropia de um cristal perfeito aproxima-se de um valor constante mínimo quando a temperatura absoluta tende a zero (0 Kelvin).",
        concept: "À medida que a temperatura de um sistema se aproxima do zero absoluto (-273,15 °C), o movimento térmico das partículas cessa quase por completo. É impossível alcançar exatamente 0 K através de um número finito de etapas termodinâmicas.",
        dailyExample: "Supercondutores modernos operando em temperaturas criogênicas extremas para permitir trens Maglev de levitação magnética de alta velocidade.",
        practicalApp: "Criogenia profunda, pesquisa em computação quântica (que exige chips refrigerados a milikelvins para evitar ruído térmico) e física de materiais exóticos.",
        formulaLabel: "Limite de Temperatura"
    },
    4: {
        badge: "V2 Expandida",
        title: "Conceitos & Ciclos",
        formula: "H = U + pV",
        definition: "Relações entre variáveis de estado (P, V, T, U, S, H) e variáveis de processo (Q, W) em diferentes ciclos termodinâmicos.",
        concept: "Variáveis de estado (P, V, T, U, S, H) dependem apenas da condição atual do sistema. Variáveis de processo (Q, W) descrevem fluxos e dependem do trajeto. A entalpia (H) mede a energia total absorvida ou liberada sob pressão constante.",
        dailyExample: "Aquecimento de bexiga sob o sol (isobárico), spray de aerosol fechado (isocórico), compressores de pistão (isotérmicos) e massas de ar subindo na atmosfera (adiabáticos).",
        practicalApp: "Análise térmica de turbinas, compressores de sistemas HVAC de alta eficiência, bombas de calor e a termodinâmica de sistemas biológicos e biologia celular.",
        formulaLabel: "Equação de Entalpia"
    },
    5: {
        badge: "Mitos & Conceitos",
        title: "Desmistificando a Física",
        formula: "Existem 10 mitos fundamentais analisados",
        definition: "Este carrossel interativo desmistifica as maiores confusões conceituais em física térmica, confrontando crenças comuns com a realidade física através de analogias e diagramas explicativos.",
        concept: "Navegue pelos mitos usando as setas ou os círculos de navegação abaixo para ver as analogias e ilustrações didáticas de cada erro comum.",
        dailyExample: "Mitos comuns como confundir calor e temperatura são a base de vários mal-entendidos físicos no dia a dia.",
        practicalApp: "A compreensão conceitual sólida é indispensável para engenharia térmica, termodinâmica teórica e pesquisa em física de ponta.",
        formulaLabel: "Aba Informativa"
    }
};

/* ==========================================================================
   INICIALIZAÇÃO DO APP
   ========================================================================== */
function initApp() {
    setupUI();
    initScene();
    
    // Inicializar gerenciador de fórmulas interativas
    formulaDemosManager = new FormulaDemosManager();
    
    loadLawModule(0);
    animate();
    
    // Verificar se já viu o tutorial
    const tutorialVisto = localStorage.getItem("termo3d_tutorial");
    if (!tutorialVisto) {
        document.getElementById("tutorial-modal").classList.remove("hidden");
    }
}

/* ==========================================================================
   CONFIGURAÇÃO DA SCENE THREE.JS
   ========================================================================== */
function initScene() {
    const container = document.getElementById("canvas-container");
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Criar Cena
    scene = new THREE.Scene();
    scene.background = getThemeColor("bg-viewport");

    // Câmera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 12);

    // Renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Controles de Órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Evitar ir muito abaixo do chão
    controls.minDistance = 4;
    controls.maxDistance = 25;

    // Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Adicionar um grid sutil
    const gridHelper = new THREE.GridHelper(20, 20, 0x00f2fe, 0x22304d);
    gridHelper.position.y = -3;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Grupo de meshes dinâmicas
    activeMeshGroup = new THREE.Group();
    scene.add(activeMeshGroup);

    // Resize Event
    window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
    const container = document.getElementById("canvas-container");
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Retorna cores baseadas no tema ativo
function getThemeColor(type) {
    const theme = document.documentElement.getAttribute("data-theme") || "dark";
    if (theme === "dark") {
        switch (type) {
            case "bg-viewport": return new THREE.Color(0x060913);
            case "grid-main": return 0x00f2fe;
            case "grid-sec": return 0x22304d;
            default: return 0xffffff;
        }
    } else {
        switch (type) {
            case "bg-viewport": return new THREE.Color(0xe2e8f0);
            case "grid-main": return 0x0284c7;
            case "grid-sec": return 0xcbd5e1;
            default: return 0x000000;
        }
    }
}

/* ==========================================================================
   CONFIGURAÇÃO DE INTERFACE E EVENTOS (DOM)
   ========================================================================== */
function setupUI() {
    // Menu lateral - Troca de Leis
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            navItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            const law = parseInt(item.getAttribute("data-law"));
            loadLawModule(law);
        });
    });

    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const target = btn.getAttribute("data-tab");
            
            // Ocultar todos os conteúdos de abas
            document.getElementById("tab-explanation").classList.add("hidden");
            document.getElementById("tab-applications").classList.add("hidden");
            document.getElementById("tab-formulas").classList.add("hidden");
            
            // Mostrar a aba correspondente
            const activeTabContent = document.getElementById("tab-" + target);
            if (activeTabContent) {
                activeTabContent.classList.remove("hidden");
            }
            
            // Se for a aba de fórmulas, renderizar/atualizar
            if (target === "formulas" && formulaDemosManager) {
                formulaDemosManager.init(document.getElementById("tab-formulas"));
            }
        });
    });

    // Alternador de Tema (Dark / Light)
    const themeToggle = document.getElementById("theme-toggle");
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", newTheme);
        
        // Atualizar cor de fundo da cena
        if (scene) {
            scene.background = getThemeColor("bg-viewport");
            // Atualizar cor das grades se necessário
            scene.children.forEach(child => {
                if (child instanceof THREE.GridHelper) {
                    scene.remove(child);
                }
            });
            const gridHelper = new THREE.GridHelper(20, 20, getThemeColor("grid-main"), getThemeColor("grid-sec"));
            gridHelper.position.y = -3;
            gridHelper.material.opacity = 0.25;
            gridHelper.material.transparent = true;
            scene.add(gridHelper);
        }
    });

    // Tutorial Modal
    const tutorialBtn = document.getElementById("tutorial-btn");
    const tutorialModal = document.getElementById("tutorial-modal");
    const closeModal = document.getElementById("close-modal");
    const startLabBtn = document.getElementById("start-lab-btn");

    const hideTutorial = () => {
        tutorialModal.classList.add("hidden");
        localStorage.setItem("termo3d_tutorial", "true");
    };

    tutorialBtn.addEventListener("click", () => tutorialModal.classList.remove("hidden"));
    closeModal.addEventListener("click", hideTutorial);
    startLabBtn.addEventListener("click", hideTutorial);

    // Botões globais do rodapé
    const playPauseBtn = document.getElementById("play-pause-btn");
    const playIcon = document.getElementById("play-icon");
    const pauseIcon = document.getElementById("pause-icon");
    const playText = document.getElementById("play-text");

    playPauseBtn.addEventListener("click", () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            playIcon.classList.add("hidden");
            pauseIcon.classList.remove("hidden");
            playText.textContent = "Pausar";
        } else {
            playIcon.classList.remove("hidden");
            pauseIcon.classList.add("hidden");
            playText.textContent = "Iniciar";
        }
    });

    const resetBtn = document.getElementById("reset-btn");
    resetBtn.addEventListener("click", () => {
        if (currentModule && typeof currentModule.reset === "function") {
            currentModule.reset();
        }
    });

    // Velocidade de simulação
    const speedRange = document.getElementById("sim-speed");
    const speedDisplay = document.getElementById("speed-display");
    speedRange.addEventListener("input", (e) => {
        simSpeed = parseFloat(e.target.value);
        speedDisplay.textContent = simSpeed.toFixed(1) + "x";
    });

    // Controle de Gráficos (V2)
    const toggleChartsBtn = document.getElementById("toggle-charts-btn");
    const chartsPanel = document.getElementById("charts-panel");
    if (toggleChartsBtn && chartsPanel) {
        toggleChartsBtn.addEventListener("click", () => {
            chartsPanel.classList.toggle("minimized");
            if (chartsPanel.classList.contains("minimized")) {
                toggleChartsBtn.textContent = "Maximizar";
            } else {
                toggleChartsBtn.textContent = "Minimizar";
                setTimeout(() => {
                    if (chart1) chart1.resize();
                    if (chart2) chart2.resize();
                }, 350);
            }
        });
    }
}

// Limpa todas as meshes e luzes dinâmicas criadas pelo módulo
function clearActiveMeshGroup() {
    if (!activeMeshGroup) return;
    
    while (activeMeshGroup.children.length > 0) {
        const obj = activeMeshGroup.children[0];
        
        // Desalocar geometria e materiais para evitar vazamento de memória
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => mat.dispose());
            } else {
                obj.material.dispose();
            }
        }
        activeMeshGroup.remove(obj);
    }
}

/* ==========================================================================
   GERENCIADOR DE MÓDULOS (CARREGADOR DE LEIS)
   ========================================================================== */
function loadLawModule(lawIndex) {
    activeLaw = lawIndex;
    
    // Descarregar módulo atual se existir
    if (currentModule && typeof currentModule.unload === "function") {
        currentModule.unload();
    }
    
    clearActiveMeshGroup();

    // Configurar gráficos (V2)
    if (typeof setupChartsForModule === "function") {
        setupChartsForModule(lawIndex);
    }

    // Resetar controles de câmera para focar no novo módulo
    controls.reset();
    camera.position.set(0, 4, 12);
    camera.lookAt(0, 0, 0);

    // Carregar textos didáticos
    const data = LAWS_DATA[lawIndex];
    document.getElementById("law-badge").textContent = data.badge;
    document.getElementById("law-title").textContent = data.title;
    document.getElementById("law-formula").textContent = data.formula;
    document.getElementById("law-formula-box").querySelector(".formula-label").textContent = data.formulaLabel + ":";
    document.getElementById("law-definition").textContent = data.definition;
    document.getElementById("law-explanation-text").textContent = data.concept;
    document.getElementById("law-daily-example").textContent = data.dailyExample;
    document.getElementById("law-practical-app").textContent = data.practicalApp;

    // Resetar as abas para focar em 'Explicação'
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelector("[data-tab='explanation']").classList.add("active");
    document.getElementById("tab-explanation").classList.remove("hidden");
    document.getElementById("tab-applications").classList.add("hidden");
    document.getElementById("tab-formulas").classList.add("hidden");

    // Alternar visibilidade da área 3D vs Carrossel
    const carouselContainer = document.getElementById("carousel-container");
    const canvasContainer = document.getElementById("canvas-container");
    const visualLegend = document.getElementById("visual-legend");
    
    if (lawIndex === 5) {
        if (canvasContainer) canvasContainer.classList.add("hidden");
        if (visualLegend) visualLegend.classList.add("hidden");
        if (carouselContainer) {
            carouselContainer.classList.remove("hidden");
            const carousel = new MisconceptionsCarousel();
            carousel.init(carouselContainer);
        }
    } else {
        if (canvasContainer) canvasContainer.classList.remove("hidden");
        if (visualLegend) visualLegend.classList.remove("hidden");
        if (carouselContainer) carouselContainer.classList.add("hidden");
    }

    // Limpar e inicializar HUD e Controles específicos
    const hudContainer = document.getElementById("hud-variables");
    hudContainer.innerHTML = "";
    
    const controlsContainer = document.getElementById("dynamic-controls");
    controlsContainer.innerHTML = "";

    // Instanciar o novo módulo correspondente
    switch (lawIndex) {
        case 0:
            currentModule = new Law0Module(hudContainer, controlsContainer);
            break;
        case 1:
            currentModule = new Law1Module(hudContainer, controlsContainer);
            break;
        case 2:
            currentModule = new Law2Module(hudContainer, controlsContainer);
            break;
        case 3:
            currentModule = new Law3Module(hudContainer, controlsContainer);
            break;
        case 4:
            currentModule = new Law4Module(hudContainer, controlsContainer);
            break;
        case 5:
            currentModule = new Law5Module(hudContainer, controlsContainer);
            break;
    }

    if (currentModule && typeof currentModule.init === "function") {
        currentModule.init();
    }
}

/* ==========================================================================
   LOOP DE ANIMAÇÃO PRINCIPAL
   ========================================================================== */
function animate() {
    requestAnimationFrame(animate);

    const dt = 0.016 * simSpeed;
    if (isPlaying) {
        time += dt;
        
        if (currentModule && typeof currentModule.update === "function") {
            currentModule.update(dt, time);
        }

        // Alimentar gráficos em tempo real (V2)
        if (typeof updateChartsData === "function") {
            updateChartsData(dt, time);
        }

        // Atualizar cálculos matemáticos em tempo real na aba de fórmulas
        if (formulaDemosManager && typeof formulaDemosManager.updateLiveCalculations === "function") {
            formulaDemosManager.updateLiveCalculations();
        }
    }

    controls.update();
    renderer.render(scene, camera);
}


/* ==========================================================================
   MÓDULO - MITOS & CONCEITOS (FÍSICA CONCEITUAL) (V2+)
   ========================================================================== */
class Law5Module {
    constructor(hudContainer, controlsContainer) {
        this.hud = hudContainer;
        this.ctrl = controlsContainer;
    }
    init() {
        this.hud.innerHTML = `
            <div class="hud-item" style="grid-column: span 2;">
                <span class="hud-item-label">Módulo Ativo</span>
                <span class="hud-item-value" style="color: var(--primary); font-size: 0.95rem;">Física Conceitual</span>
            </div>
        `;
        this.ctrl.innerHTML = `
            <p class="text-xs text-muted">Use as setas no carrossel central para navegar pelos mitos e analogias físicas.</p>
        `;
    }
    update(dt, time) {}
    unload() {}
    reset() {}
}

/* ==========================================================================
   MÓDULO - LEI ZERO (EQUILÍBRIO TÉRMICO)
   ========================================================================== */
class Law0Module {
    constructor(hudContainer, controlsContainer) {
        this.hud = hudContainer;
        this.ctrl = controlsContainer;
        
        // Variáveis físicas
        this.tempA = 380; // Kelvin
        this.tempB = 140;
        this.tempC = 260;
        this.contactAB = false;
        this.contactBC = false;
        
        // Elementos 3D
        this.blockA = null;
        this.blockB = null;
        this.blockC = null;
        this.barAB = null;
        this.barBC = null;
        this.particles = [];
    }

    init() {
        // Criar HUD
        this.hud.innerHTML = `
            <div class="hud-item">
                <span class="hud-item-label">Temperatura A</span>
                <span class="hud-item-value" id="hud-ta">380 K</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Temperatura B</span>
                <span class="hud-item-value" id="hud-tb">140 K</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Temperatura C</span>
                <span class="hud-item-value" id="hud-tc">260 K</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Estado</span>
                <span class="hud-item-value" id="hud-state" style="font-size:0.85rem; color: #ef4444;">Sem Contato</span>
            </div>
        `;

        // Criar Controles
        this.ctrl.innerHTML = `
            <div class="control-group">
                <div class="control-label-row">
                    <span>Temp. Bloco A <span class="tooltip-icon" title="Ajusta a temperatura inicial do Bloco A">?</span></span>
                    <span class="control-value" id="val-ta">380 K</span>
                </div>
                <input type="range" id="slide-ta" min="100" max="400" value="380">
            </div>
            <div class="control-group">
                <div class="control-label-row">
                    <span>Temp. Bloco B <span class="tooltip-icon" title="Ajusta a temperatura inicial do Bloco B">?</span></span>
                    <span class="control-value" id="val-tb">140 K</span>
                </div>
                <input type="range" id="slide-tb" min="100" max="400" value="140">
            </div>
            <div class="control-group">
                <div class="control-label-row">
                    <span>Temp. Bloco C <span class="tooltip-icon" title="Ajusta a temperatura inicial do Bloco C">?</span></span>
                    <span class="control-value" id="val-tc">260 K</span>
                </div>
                <input type="range" id="slide-tc" min="100" max="400" value="260">
            </div>
            <div class="controls-buttons">
                <button id="btn-contact-ab" class="btn btn-secondary">Unir A e B</button>
                <button id="btn-contact-bc" class="btn btn-secondary">Unir B e C</button>
            </div>
        `;

        // Ligar Eventos dos Controles
        document.getElementById("slide-ta").addEventListener("input", (e) => {
            this.tempA = parseInt(e.target.value);
            document.getElementById("val-ta").textContent = this.tempA + " K";
            document.getElementById("hud-ta").textContent = this.tempA + " K";
            this.updateBlockColors();
        });
        document.getElementById("slide-tb").addEventListener("input", (e) => {
            this.tempB = parseInt(e.target.value);
            document.getElementById("val-tb").textContent = this.tempB + " K";
            document.getElementById("hud-tb").textContent = this.tempB + " K";
            this.updateBlockColors();
        });
        document.getElementById("slide-tc").addEventListener("input", (e) => {
            this.tempC = parseInt(e.target.value);
            document.getElementById("val-tc").textContent = this.tempC + " K";
            document.getElementById("hud-tc").textContent = this.tempC + " K";
            this.updateBlockColors();
        });

        document.getElementById("btn-contact-ab").addEventListener("click", (e) => {
            this.contactAB = !this.contactAB;
            e.target.className = this.contactAB ? "btn btn-success" : "btn btn-secondary";
            e.target.textContent = this.contactAB ? "Desunir A e B" : "Unir A e B";
            this.animateBars();
        });

        document.getElementById("btn-contact-bc").addEventListener("click", (e) => {
            this.contactBC = !this.contactBC;
            e.target.className = this.contactBC ? "btn btn-success" : "btn btn-secondary";
            e.target.textContent = this.contactBC ? "Desunir B e C" : "Unir B e C";
            this.animateBars();
        });

        // Configuração na Cena 3D
        // Geometria de Bloco (Cubo com cantos levemente arredondados ou caixa padrão)
        const boxGeo = new THREE.BoxGeometry(2, 2, 2);
        
        // Criar materiais individuais
        const matA = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1 });
        const matB = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1 });
        const matC = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1 });

        this.blockA = new THREE.Mesh(boxGeo, matA);
        this.blockA.position.set(-4, -1, 0);
        this.blockA.castShadow = true;
        this.blockA.receiveShadow = true;
        activeMeshGroup.add(this.blockA);

        this.blockB = new THREE.Mesh(boxGeo, matB);
        this.blockB.position.set(0, -1, 0);
        this.blockB.castShadow = true;
        this.blockB.receiveShadow = true;
        activeMeshGroup.add(this.blockB);

        this.blockC = new THREE.Mesh(boxGeo, matC);
        this.blockC.position.set(4, -1, 0);
        this.blockC.castShadow = true;
        this.blockC.receiveShadow = true;
        activeMeshGroup.add(this.blockC);

        // Criar barras de acoplamento (inativas inicialmente)
        const barGeo = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
        const barMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.5 });
        
        this.barAB = new THREE.Mesh(barGeo, barMat);
        this.barAB.rotation.z = Math.PI / 2;
        this.barAB.position.set(-2, -1, 0);
        this.barAB.scale.y = 0.01; // Invisível / Encolhida
        activeMeshGroup.add(this.barAB);

        this.barBC = new THREE.Mesh(barGeo, barMat.clone());
        this.barBC.rotation.z = Math.PI / 2;
        this.barBC.position.set(2, -1, 0);
        this.barBC.scale.y = 0.01;
        activeMeshGroup.add(this.barBC);

        // Labels flutuantes em cima dos blocos
        this.createLabel("A", -4, 1.2, 0);
        this.createLabel("B", 0, 1.2, 0);
        this.createLabel("C", 4, 1.2, 0);

        this.updateBlockColors();
        this.createHeatParticles();
    }

    createLabel(text, x, y, z) {
        // Criar mini cilindro indicador sutil
        const coneGeo = new THREE.ConeGeometry(0.15, 0.4, 4);
        const coneMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.set(x, y - 0.2, z);
        cone.rotation.x = Math.PI;
        activeMeshGroup.add(cone);
    }

    createHeatParticles() {
        // Partículas que fluem para transferência de calor
        const particleGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const particleMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0 });
        
        // Criar pool de 30 partículas
        for (let i = 0; i < 30; i++) {
            const p = new THREE.Mesh(particleGeo, particleMat.clone());
            p.position.set(0, -999, 0); // Longe
            p.userData = { active: false, t: 0, speed: 0.5 + Math.random()*0.5, direction: 1 }; // 1 = A->B ou B->C
            activeMeshGroup.add(p);
            this.particles.push(p);
        }
    }

    animateBars() {
        // Animação sutil de escala para a conexão física das barras
        this.barAB.scale.y = this.contactAB ? 1.0 : 0.01;
        this.barBC.scale.y = this.contactBC ? 1.0 : 0.01;
        
        // Alterar materiais das barras para brilharem quando em contato
        this.barAB.material.color.setHex(this.contactAB ? 0x00f2fe : 0x555555);
        this.barBC.material.color.setHex(this.contactBC ? 0x00f2fe : 0x555555);
    }

    updateBlockColors() {
        // Mapeia temperaturas para cores (HSL)
        // 100K = Azul (240 deg), 400K = Vermelho (0 deg)
        const getTempColor = (t) => {
            const ratio = (t - 100) / 300; // 0 a 1
            const clamped = Math.max(0, Math.min(1, ratio));
            const hue = (1.0 - clamped) * 240; // 240 a 0
            
            const color = new THREE.Color();
            color.setHSL(hue / 360, 1, 0.5);
            return color;
        };

        if (this.blockA) this.blockA.material.color.copy(getTempColor(this.tempA));
        if (this.blockB) this.blockB.material.color.copy(getTempColor(this.tempB));
        if (this.blockC) this.blockC.material.color.copy(getTempColor(this.tempC));
    }

    update(dt, totalTime) {
        // Newton's Law of Cooling (Taxa de troca de calor é proporcional à diferença de temperatura)
        const coolingRate = 0.4 * dt;
        let transferAB = 0;
        let transferBC = 0;

        if (this.contactAB) {
            const diffAB = this.tempA - this.tempB;
            transferAB = diffAB * coolingRate;
            this.tempA -= transferAB;
            this.tempB += transferAB;
            
            // Emitir partículas térmicas A <-> B
            this.spawnParticle(-4, 0, diffAB);
        }
        
        if (this.contactBC) {
            const diffBC = this.tempB - this.tempC;
            transferBC = diffBC * coolingRate;
            this.tempB -= transferBC;
            this.tempC += transferBC;
            
            // Emitir partículas térmicas B <-> C
            this.spawnParticle(0, 4, diffBC);
        }

        // Atualizar textos e sliders
        if (this.contactAB || this.contactBC) {
            // Atualizar valores de temperatura na UI
            document.getElementById("hud-ta").textContent = Math.round(this.tempA) + " K";
            document.getElementById("hud-tb").textContent = Math.round(this.tempB) + " K";
            document.getElementById("hud-tc").textContent = Math.round(this.tempC) + " K";
            
            document.getElementById("slide-ta").value = Math.round(this.tempA);
            document.getElementById("slide-tb").value = Math.round(this.tempB);
            document.getElementById("slide-tc").value = Math.round(this.tempC);
            
            document.getElementById("val-ta").textContent = Math.round(this.tempA) + " K";
            document.getElementById("val-tb").textContent = Math.round(this.tempB) + " K";
            document.getElementById("val-tc").textContent = Math.round(this.tempC) + " K";

            this.updateBlockColors();

            // Atualizar status de Equilíbrio
            const diffAC = Math.abs(this.tempA - this.tempC);
            const diffAB = Math.abs(this.tempA - this.tempB);
            const diffBC = Math.abs(this.tempB - this.tempC);
            const stateText = document.getElementById("hud-state");

            if (this.contactAB && this.contactBC) {
                if (diffAC < 1.0 && diffAB < 1.0 && diffBC < 1.0) {
                    stateText.textContent = "Equilíbrio A = B = C";
                    stateText.style.color = "#10b981";
                } else {
                    stateText.textContent = "Equalizando A, B, C";
                    stateText.style.color = "#eab308";
                }
            } else if (this.contactAB) {
                if (diffAB < 1.0) {
                    stateText.textContent = "Equilíbrio A = B";
                    stateText.style.color = "#10b981";
                } else {
                    stateText.textContent = "Equalizando A e B";
                    stateText.style.color = "#eab308";
                }
            } else if (this.contactBC) {
                if (diffBC < 1.0) {
                    stateText.textContent = "Equilíbrio B = C";
                    stateText.style.color = "#10b981";
                } else {
                    stateText.textContent = "Equalizando B e C";
                    stateText.style.color = "#eab308";
                }
            }
        }

        // Mover partículas de calor
        this.particles.forEach(p => {
            if (p.userData.active) {
                p.userData.t += dt * p.userData.speed;
                
                // Interpolação linear da posição
                const startX = p.userData.startX;
                const endX = p.userData.endX;
                p.position.x = startX + (endX - startX) * p.userData.t;
                p.position.y = -1 + Math.sin(p.userData.t * Math.PI) * 0.4; // Curva suave
                p.position.z = Math.sin(p.userData.t * Math.PI * 2) * 0.2;
                
                // Fade in e fade out
                p.material.opacity = Math.sin(p.userData.t * Math.PI) * 0.8;

                if (p.userData.t >= 1.0) {
                    p.userData.active = false;
                    p.position.set(0, -999, 0);
                    p.material.opacity = 0;
                }
            }
        });
    }

    spawnParticle(startX, endX, tempDiff) {
        // Se a diferença de temperatura for muito baixa, não emite
        if (Math.abs(tempDiff) < 3) return;

        // Limita a taxa de spawn de partículas
        if (Math.random() > 0.15) return;

        const inactiveP = this.particles.find(p => !p.userData.active);
        if (inactiveP) {
            inactiveP.userData.active = true;
            inactiveP.userData.t = 0;
            
            // Definir direção com base em quem é mais quente
            if (tempDiff > 0) { // startX é mais quente
                inactiveP.userData.startX = startX;
                inactiveP.userData.endX = endX;
                inactiveP.material.color.setHex(0xff5500); // Partícula quente
            } else { // endX é mais quente
                inactiveP.userData.startX = endX;
                inactiveP.userData.endX = startX;
                inactiveP.material.color.setHex(0x00aaff); // Partícula fria
            }
        }
    }

    reset() {
        this.tempA = 380;
        this.tempB = 140;
        this.tempC = 260;
        this.contactAB = false;
        this.contactBC = false;

        document.getElementById("slide-ta").value = this.tempA;
        document.getElementById("slide-tb").value = this.tempB;
        document.getElementById("slide-tc").value = this.tempC;

        document.getElementById("val-ta").textContent = this.tempA + " K";
        document.getElementById("val-tb").textContent = this.tempB + " K";
        document.getElementById("val-tc").textContent = this.tempC + " K";

        document.getElementById("hud-ta").textContent = this.tempA + " K";
        document.getElementById("hud-tb").textContent = this.tempB + " K";
        document.getElementById("hud-tc").textContent = this.tempC + " K";

        const stateText = document.getElementById("hud-state");
        stateText.textContent = "Sem Contato";
        stateText.style.color = "#ef4444";

        const btnAB = document.getElementById("btn-contact-ab");
        btnAB.className = "btn btn-secondary";
        btnAB.textContent = "Unir A e B";

        const btnBC = document.getElementById("btn-contact-bc");
        btnBC.className = "btn btn-secondary";
        btnBC.textContent = "Unir B e C";

        this.animateBars();
        this.updateBlockColors();

        this.particles.forEach(p => {
            p.userData.active = false;
            p.position.set(0, -999, 0);
            p.material.opacity = 0;
        });
    }

    unload() {
        this.particles = [];
    }
}


/* ==========================================================================
   MÓDULO - PRIMEIRA LEI (CONSERVAÇÃO DA ENERGIA)
   ========================================================================== */
class Law1Module {
    constructor(hudContainer, controlsContainer) {
        this.hud = hudContainer;
        this.ctrl = controlsContainer;

        // Variáveis físicas
        this.Q = 0;          // Calor adicionado (Joules)
        this.W = 0;          // Trabalho realizado (Joules)
        this.U = 150;        // Energia Interna (Joules)
        this.volume = 2.0;   // Litros (1.0 a 3.0)
        this.pressure = 1.0; // atm
        
        // Elementos 3D
        this.cylinder = null;
        this.piston = null;
        this.particles = [];
        this.flames = [];
        
        // Configurações do gás
        this.numParticles = 35;
        this.containerRadius = 1.5;
        this.pistonBaseY = -1.5;
    }

    init() {
        // Criar HUD
        this.hud.innerHTML = `
            <div class="hud-item">
                <span class="hud-item-label">Energia Interna (U)</span>
                <span class="hud-item-value" id="hud-l1-u">150 J</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Calor Adicionado (Q)</span>
                <span class="hud-item-value" id="hud-l1-q" style="color: #f97316;">0 J</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Trabalho (W)</span>
                <span class="hud-item-value" id="hud-l1-w" style="color: #10b981;">0 J</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Pressão (P)</span>
                <span class="hud-item-value" id="hud-l1-p">1.0 atm</span>
            </div>
        `;

        // Criar Controles
        this.ctrl.innerHTML = `
            <div class="control-group">
                <div class="control-label-row">
                    <span>Adicionar/Remover Calor (Q) <span class="tooltip-icon" title="Adiciona calor (Q > 0) ao gás ou resfria (Q < 0)">?</span></span>
                    <span class="control-value" id="val-l1-q" style="color: #f97316;">0 J</span>
                </div>
                <input type="range" id="slide-l1-q" min="-100" max="200" value="0">
            </div>
            <div class="control-group">
                <div class="control-label-row">
                    <span>Volume do Gás (V) <span class="tooltip-icon" title="Mover o pistão altera o volume e realiza trabalho mecânico">?</span></span>
                    <span class="control-value" id="val-l1-v">2.0 L</span>
                </div>
                <input type="range" id="slide-l1-v" min="1.0" max="3.0" step="0.1" value="2.0">
            </div>
            <div class="controls-buttons">
                <button id="btn-add-q-pulse" class="btn btn-primary">Pulso de Calor (+50J)</button>
                <button id="btn-cool-pulse" class="btn btn-secondary">Resfriar (-50J)</button>
            </div>
        `;

        // Adicionar Listeners
        document.getElementById("slide-l1-q").addEventListener("input", (e) => {
            this.Q = parseInt(e.target.value);
            document.getElementById("val-l1-q").textContent = this.Q + " J";
            document.getElementById("hud-l1-q").textContent = this.Q + " J";
            this.recalculatePhysics();
        });

        document.getElementById("slide-l1-v").addEventListener("input", (e) => {
            const oldVol = this.volume;
            this.volume = parseFloat(e.target.value);
            document.getElementById("val-l1-v").textContent = this.volume.toFixed(1) + " L";
            
            // Se movermos o pistão manualmente, geramos trabalho mecânico
            // W = P * dV
            const dV = this.volume - oldVol;
            const mechanicalW = this.pressure * dV * 50; // Constante de escala didática
            this.W += mechanicalW;
            
            this.recalculatePhysics();
        });

        document.getElementById("btn-add-q-pulse").addEventListener("click", () => {
            this.Q += 50;
            if (this.Q > 200) this.Q = 200;
            document.getElementById("slide-l1-q").value = this.Q;
            document.getElementById("val-l1-q").textContent = this.Q + " J";
            document.getElementById("hud-l1-q").textContent = this.Q + " J";
            
            // Disparar efeitos visuais de fogo temporariamente
            this.triggerFlameBurst();
            this.recalculatePhysics();
        });

        document.getElementById("btn-cool-pulse").addEventListener("click", () => {
            this.Q -= 50;
            if (this.Q < -100) this.Q = -100;
            document.getElementById("slide-l1-q").value = this.Q;
            document.getElementById("val-l1-q").textContent = this.Q + " J";
            document.getElementById("hud-l1-q").textContent = this.Q + " J";
            this.recalculatePhysics();
        });

        // Montagem na cena 3D
        // 1. Cilindro transparente
        const cylinderGeo = new THREE.CylinderGeometry(this.containerRadius, this.containerRadius, 4.5, 32, 1, true);
        const cylinderMat = new THREE.MeshStandardMaterial({
            color: 0x88bbff,
            transparent: true,
            opacity: 0.15,
            roughness: 0.1,
            metalness: 0.9,
            side: THREE.DoubleSide
        });
        this.cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
        this.cylinder.position.y = 0.5;
        activeMeshGroup.add(this.cylinder);

        // Aros de metal para dar sustentação visual ao cilindro
        const ringGeo = new THREE.RingGeometry(this.containerRadius, this.containerRadius + 0.1, 32);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, side: THREE.DoubleSide, roughness: 0.2 });
        
        const ringBottom = new THREE.Mesh(ringGeo, ringMat);
        ringBottom.rotation.x = Math.PI / 2;
        ringBottom.position.y = -1.75;
        activeMeshGroup.add(ringBottom);

        const ringTop = new THREE.Mesh(ringGeo, ringMat);
        ringTop.rotation.x = Math.PI / 2;
        ringTop.position.y = 2.75;
        activeMeshGroup.add(ringTop);

        // 2. Pistão (disco metálico)
        const pistonGeo = new THREE.CylinderGeometry(this.containerRadius - 0.05, this.containerRadius - 0.05, 0.3, 32);
        const pistonMat = new THREE.MeshStandardMaterial({
            color: 0x475569,
            metalness: 0.8,
            roughness: 0.2
        });
        this.piston = new THREE.Mesh(pistonGeo, pistonMat);
        // Posição y inicial do pistão baseada no volume 2.0
        this.piston.position.y = this.getPistonYFromVolume();
        activeMeshGroup.add(this.piston);

        // Haste do pistão
        const shaftGeo = new THREE.CylinderGeometry(0.12, 0.12, 4, 16);
        const shaft = new THREE.Mesh(shaftGeo, pistonMat);
        shaft.position.y = 2; // Acima do disco
        this.piston.add(shaft); // Anexado ao pistão para mover junto

        // Base aquecedora (Fogãozinho virtual)
        const burnerGeo = new THREE.CylinderGeometry(this.containerRadius + 0.1, this.containerRadius + 0.1, 0.4, 32);
        const burnerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
        const burner = new THREE.Mesh(burnerGeo, burnerMat);
        burner.position.y = -2;
        activeMeshGroup.add(burner);

        // 3. Criar partículas de gás
        const particleGeo = new THREE.SphereGeometry(0.09, 12, 12);
        const particleMat = new THREE.MeshStandardMaterial({
            roughness: 0.1,
            metalness: 0.1
        });

        for (let i = 0; i < this.numParticles; i++) {
            const p = new THREE.Mesh(particleGeo, particleMat.clone());
            
            // Posição inicial randômica dentro do cilindro abaixo do pistão
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * (this.containerRadius - 0.2);
            const py = this.pistonBaseY + 0.2 + Math.random() * (this.piston.position.y - this.pistonBaseY - 0.5);

            p.position.set(Math.cos(angle) * r, py, Math.sin(angle) * r);
            
            // Velocidade vetorial inicial
            const speed = 2.0;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            p.userData = {
                vel: new THREE.Vector3(
                    speed * Math.sin(phi) * Math.cos(theta),
                    speed * Math.sin(phi) * Math.sin(theta),
                    speed * Math.cos(phi)
                )
            };

            activeMeshGroup.add(p);
            this.particles.push(p);
        }

        // Criar cones de chama invisíveis sob a base
        const flameGeo = new THREE.ConeGeometry(0.1, 0.4, 4);
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0 });
        for (let i = 0; i < 15; i++) {
            const f = new THREE.Mesh(flameGeo, flameMat.clone());
            // Distribuição na base do queimador
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * this.containerRadius;
            f.position.set(Math.cos(angle)*r, -1.8, Math.sin(angle)*r);
            f.userData = { life: 0, speed: 1 + Math.random()*2 };
            activeMeshGroup.add(f);
            this.flames.push(f);
        }

        this.recalculatePhysics();
    }

    getPistonYFromVolume() {
        // Mapeia volume (1.0 a 3.0) para coordenada Y do pistão (-0.5 a 2.5)
        return this.pistonBaseY + (this.volume * 1.3);
    }

    recalculatePhysics() {
        // Equação da 1ª Lei: dU = dQ - dW
        // Temperatura inicial base = 150 J (quando Q=0, W=0)
        this.U = 150 + this.Q - this.W;
        
        // Proteção contra valores de energia menores que 10 J (gás congelando)
        if (this.U < 10) this.U = 10;

        // Lei dos gases ideais: P = nRT/V. Como U é proporcional à temperatura (U ∝ T):
        // P = K * U / V
        this.pressure = (this.U * 0.013) / this.volume;

        // Atualizar textos da interface
        document.getElementById("hud-l1-u").textContent = Math.round(this.U) + " J";
        document.getElementById("hud-l1-w").textContent = Math.round(this.W) + " J";
        document.getElementById("hud-l1-p").textContent = this.pressure.toFixed(2) + " atm";
        
        // Mudar cores do HUD com base no trabalho
        const wHud = document.getElementById("hud-l1-w");
        if (this.W > 0) {
            wHud.style.color = "#10b981"; // Positivo (Gás realiza trabalho)
        } else if (this.W < 0) {
            wHud.style.color = "#ef4444"; // Negativo (Trabalho mecânico comprimindo)
        } else {
            wHud.style.color = "";
        }

        // Se o pistão não estiver sendo arrastado manualmente pelo mouse/slider,
        // ele tenta se mover espontaneamente sob a diferença de pressão!
        // (Mas no slider manual mantemos o volume imposto pelo controle)
    }

    triggerFlameBurst() {
        this.flames.forEach(f => {
            f.userData.life = 1.0; // Ativar chamas
            f.material.opacity = 0.8;
        });
    }

    update(dt, totalTime) {
        // 1. Atualizar posição física do pistão para coincidir com o volume do slider
        const targetPistonY = this.getPistonYFromVolume();
        this.piston.position.y += (targetPistonY - this.piston.position.y) * 0.2;

        // Limite superior do cilindro para partículas
        const pistonYLimit = this.piston.position.y - 0.15;

        // 2. Animar chamas com base no calor ativo (se Q > 0, queimador acende)
        this.flames.forEach(f => {
            if (this.Q > 0 || f.userData.life > 0) {
                // Se for calor contínuo por slider
                if (this.Q > 0) {
                    f.material.opacity = (this.Q / 200) * 0.7 + Math.random() * 0.3;
                    f.userData.life = 0.5;
                } else {
                    // Se for pulso decaindo
                    f.userData.life -= dt * f.userData.speed;
                    f.material.opacity = f.userData.life * 0.8;
                }

                // Subir chama e resetar no topo
                f.position.y += dt * 1.5;
                if (f.position.y > -1.6) {
                    f.position.y = -1.8;
                    // Jitter horizontal sutil
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * (this.containerRadius - 0.2);
                    f.position.x = Math.cos(angle) * r;
                    f.position.z = Math.sin(angle) * r;
                }
            } else {
                f.material.opacity = 0;
            }
        });

        // 3. Simular movimento cinético das partículas de gás
        // Velocidade base proporcional à raiz da energia interna U (como no modelo cinético real v ∝ √T)
        const speedScale = Math.sqrt(this.U) * 0.18;
        
        // Mapear cor das partículas com base na temperatura (energia interna U)
        const getGasColor = (u) => {
            const ratio = (u - 10) / 300;
            const clamped = Math.max(0, Math.min(1, ratio));
            const color = new THREE.Color();
            color.setHSL((1.0 - clamped) * 240 / 360, 1.0, 0.5); // De azul para vermelho
            return color;
        };
        
        const gasColor = getGasColor(this.U);

        this.particles.forEach(p => {
            p.material.color.copy(gasColor);
            
            // Integrar movimento
            const vel = p.userData.vel.clone().normalize().multiplyScalar(speedScale);
            p.position.addScaledVector(vel, dt);

            // Colisão com as paredes cilíndricas r = x^2 + z^2
            const r2 = p.position.x * p.position.x + p.position.z * p.position.z;
            const rMax = this.containerRadius - 0.15;
            
            if (r2 > rMax * rMax) {
                // Vetor normal apontando para o centro (no plano horizontal)
                const normal = new THREE.Vector2(p.position.x, p.position.z).normalize();
                
                // Refletir velocidade horizontal
                const dot = p.userData.vel.x * normal.x + p.userData.vel.z * normal.y;
                p.userData.vel.x = p.userData.vel.x - 2 * dot * normal.x;
                p.userData.vel.z = p.userData.vel.z - 2 * dot * normal.y;
                
                // Reposicionar na borda
                p.position.x = normal.x * rMax;
                p.position.z = normal.y * rMax;
            }

            // Colisão com o fundo do cilindro (y = -1.7)
            if (p.position.y < -1.65) {
                p.userData.vel.y = Math.abs(p.userData.vel.y);
                p.position.y = -1.65;
            }

            // Colisão com o pistão móvel (y = pistonYLimit)
            if (p.position.y > pistonYLimit) {
                p.userData.vel.y = -Math.abs(p.userData.vel.y);
                p.position.y = pistonYLimit;
                
                // Efeito didático: se o pistão estiver descendo (compressão), 
                // as partículas ganham velocidade extra (trabalho realizado SOBRE o gás).
            }
        });
    }

    reset() {
        this.Q = 0;
        this.W = 0;
        this.volume = 2.0;
        this.pressure = 1.0;

        document.getElementById("slide-l1-q").value = 0;
        document.getElementById("val-l1-q").textContent = "0 J";
        document.getElementById("hud-l1-q").textContent = "0 J";

        document.getElementById("slide-l1-v").value = 2.0;
        document.getElementById("val-l1-v").textContent = "2.0 L";

        this.recalculatePhysics();

        if (this.piston) {
            this.piston.position.y = this.getPistonYFromVolume();
        }

        // Reposicionar partículas no volume padrão
        this.particles.forEach(p => {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * (this.containerRadius - 0.2);
            const py = this.pistonBaseY + 0.2 + Math.random() * (this.piston.position.y - this.pistonBaseY - 0.5);
            p.position.set(Math.cos(angle) * r, py, Math.sin(angle) * r);
            p.userData.vel.set(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            );
        });

        this.flames.forEach(f => {
            f.userData.life = 0;
            f.material.opacity = 0;
        });
    }

    unload() {
        this.particles = [];
        this.flames = [];
    }
}


/* ==========================================================================
   MÓDULO - SEGUNDA LEI (ENTROPIA E IRREVERSIBILIDADE)
   ========================================================================== */
class Law2Module {
    constructor(hudContainer, controlsContainer) {
        this.hud = hudContainer;
        this.ctrl = controlsContainer;

        // Variáveis físicas
        this.entropy = 0.12;      // Entropia J/K
        this.organization = 100; // Grau de ordem (%)
        this.barrierRemoved = false;
        this.redCountLeft = 0;
        this.blueCountRight = 0;
        this.externalWorkDone = 0; // Trabalho gasto para separar as partículas
        
        // Elementos 3D
        this.boxOutline = null;
        this.barrier = null;
        this.particles = []; // { mesh, colorIndex: 0(red) ou 1(blue) }
        
        // Configuração da simulação
        this.numParticles = 50; // 25 vermelhas, 25 azuis
        this.boxWidth = 6.0;   // x de -3 a 3
        this.boxHeight = 3.6;  // y de -1.8 a 1.8
        this.boxDepth = 3.6;   // z de -1.8 a 1.8
    }

    init() {
        // Criar HUD
        this.hud.innerHTML = `
            <div class="hud-item">
                <span class="hud-item-label">Entropia (S)</span>
                <span class="hud-item-value" id="hud-l2-entropy" style="color: #ef4444;">0.12 J/K</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Ordem do Sistema</span>
                <span class="hud-item-value" id="hud-l2-order" style="color: #10b981;">100%</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Gás Vermelho (Esq)</span>
                <span class="hud-item-value" id="hud-l2-red">100%</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Gás Azul (Dir)</span>
                <span class="hud-item-value" id="hud-l2-blue">100%</span>
            </div>
        `;

        // Criar Controles
        this.ctrl.innerHTML = `
            <div class="control-group">
                <div class="control-label-row">
                    <span>Estado da Barreira <span class="tooltip-icon" title="Remove a divisão permitindo a difusão espontânea dos gases">?</span></span>
                    <span class="control-value" id="val-l2-barrier" style="color: #10b981;">Instalada</span>
                </div>
                <div class="controls-buttons" style="margin-top:0;">
                    <button id="btn-toggle-barrier" class="btn btn-primary" style="width:100%;">Remover Divisória</button>
                </div>
            </div>
            
            <div class="control-group">
                <div class="control-label-row">
                    <span>Processo Inverso Espontâneo <span class="tooltip-icon" title="Tenta ordenar os gases espontaneamente sem gastar energia">?</span></span>
                </div>
                <div class="controls-buttons" style="margin-top:0;">
                    <button id="btn-spontaneous-reverse" class="btn btn-danger" style="width:100%;">Tentar Reversão Natural</button>
                </div>
            </div>

            <div class="control-group">
                <div class="control-label-row">
                    <span>Intervenção Externa (Trabalho) <span class="tooltip-icon" title="Realiza trabalho externo para forçar a separação das partículas">?</span></span>
                    <span class="control-value" id="val-l2-work">0 J</span>
                </div>
                <div class="controls-buttons" style="margin-top:0;">
                    <button id="btn-external-sort" class="btn btn-success" style="width:100%;">Separação Forçada</button>
                </div>
            </div>
        `;

        // Listeners dos controles
        document.getElementById("btn-toggle-barrier").addEventListener("click", (e) => {
            this.barrierRemoved = !this.barrierRemoved;
            if (this.barrierRemoved) {
                e.target.textContent = "Recolocar Divisória";
                e.target.className = "btn btn-secondary";
                document.getElementById("val-l2-barrier").textContent = "Aberta";
                document.getElementById("val-l2-barrier").style.color = "#ef4444";
                this.barrier.position.y = 4.0; // Deslocar divisória para cima
            } else {
                e.target.textContent = "Remover Divisória";
                e.target.className = "btn btn-primary";
                document.getElementById("val-l2-barrier").textContent = "Instalada";
                document.getElementById("val-l2-barrier").style.color = "#10b981";
                this.barrier.position.y = 0; // Voltar divisória para o centro
            }
        });

        document.getElementById("btn-spontaneous-reverse").addEventListener("click", () => {
            // Mostrar modal educativo / alerta de erro
            alert("VIOLAÇÃO DA 2ª LEI DA TERMODINÂMICA:\n\nA probabilidade estatística de todas as 50 partículas separarem-se espontaneamente em seus compartimentos originais é de aproximadamente 1 em 1.125.899.900.000.000 (2^50).\n\nProcessos espontâneos de difusão são energeticamente irreversíveis. A entropia do universo não pode diminuir de forma espontânea!");
        });

        document.getElementById("btn-external-sort").addEventListener("click", () => {
            // Realizar trabalho externo para reordenar
            this.externalWorkDone += 100;
            document.getElementById("val-l2-work").textContent = this.externalWorkDone + " J";
            
            // Forçar ordenação artificial rápida
            this.particles.forEach(p => {
                if (p.colorIndex === 0) {
                    // Vermelho para a esquerda
                    p.mesh.position.x = -Math.random() * (this.boxWidth/2 - 0.2);
                    p.mesh.userData.vel.x = -Math.abs(p.mesh.userData.vel.x);
                } else {
                    // Azul para a direita
                    p.mesh.position.x = Math.random() * (this.boxWidth/2 - 0.2);
                    p.mesh.userData.vel.x = Math.abs(p.mesh.userData.vel.x);
                }
            });

            // Se a barreira estiver aberta, alertar o usuário que ela deve ser fechada para manter a ordem
            if (this.barrierRemoved) {
                // Apenas um alerta visual temporário no status
                const orderText = document.getElementById("hud-l2-order");
                orderText.textContent = "Separado temporariamente (Feche a barreira!)";
                orderText.style.color = "#eab308";
            }
        });

        // Configuração na Cena 3D
        // 1. Caixa contêiner transparente
        const boxGeo = new THREE.BoxGeometry(this.boxWidth, this.boxHeight, this.boxDepth);
        
        // Usar um material de bordas aramadas para melhor visualização tridimensional
        const edges = new THREE.EdgesGeometry(boxGeo);
        this.boxOutline = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x475569 }));
        activeMeshGroup.add(this.boxOutline);

        // Paredes translúcidas da caixa
        const boxMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const boxMesh = new THREE.Mesh(boxGeo, boxMat);
        activeMeshGroup.add(boxMesh);

        // 2. Divisória central removível
        const barrierGeo = new THREE.BoxGeometry(0.1, this.boxHeight - 0.05, this.boxDepth - 0.05);
        const barrierMat = new THREE.MeshStandardMaterial({
            color: 0x00f2fe,
            transparent: true,
            opacity: 0.5,
            metalness: 0.5,
            roughness: 0.1
        });
        this.barrier = new THREE.Mesh(barrierGeo, barrierMat);
        this.barrier.position.set(0, 0, 0);
        activeMeshGroup.add(this.barrier);

        // 3. Criar partículas de gás vermelho (quente/esquerda) e azul (frio/direita)
        const pGeo = new THREE.SphereGeometry(0.12, 12, 12);
        
        const matRed = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });
        const matBlue = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 });

        for (let i = 0; i < this.numParticles; i++) {
            const isRed = i < this.numParticles / 2;
            const p = new THREE.Mesh(pGeo, isRed ? matRed : matBlue);

            // Spawn separado pelo divisor central (x = 0)
            let px;
            if (isRed) {
                px = -Math.random() * (this.boxWidth/2 - 0.3) - 0.15; // Lado esquerdo
            } else {
                px = Math.random() * (this.boxWidth/2 - 0.3) + 0.15;  // Lado direito
            }

            const py = (Math.random() - 0.5) * (this.boxHeight - 0.3);
            const pz = (Math.random() - 0.5) * (this.boxDepth - 0.3);
            p.position.set(px, py, pz);

            // Vetor de velocidade
            const speed = 1.8;
            const theta = Math.random() * Math.PI * 2;
            p.userData = {
                vel: new THREE.Vector3(
                    speed * (isRed ? -1 : 1) * Math.abs(Math.cos(theta)),
                    speed * Math.sin(theta),
                    speed * (Math.random() - 0.5)
                )
            };

            activeMeshGroup.add(p);
            this.particles.push({
                mesh: p,
                colorIndex: isRed ? 0 : 1 // 0 = Vermelho, 1 = Azul
            });
        }
    }

    calculateEntropy() {
        // Cálculo didático de Entropia (Shannon) baseado na distribuição espacial
        // Dividimos a caixa em 2 compartimentos (Esquerdo x < 0 e Direito x >= 0)
        let redLeft = 0;
        let redRight = 0;
        let blueLeft = 0;
        let blueRight = 0;

        const totalHalf = this.numParticles / 2;

        this.particles.forEach(p => {
            const isLeft = p.mesh.position.x < 0;
            if (p.colorIndex === 0) { // Vermelho
                if (isLeft) redLeft++; else redRight++;
            } else { // Azul
                if (isLeft) blueLeft++; else blueRight++;
            }
        });

        // Frações normatizadas
        this.redCountLeft = redLeft / totalHalf;
        this.blueCountRight = blueRight / totalHalf;

        // Entropia configurada como S = -k * Σ(p * ln(p))
        // Estado perfeitamente ordenado (todos vermelhos na esquerda, azuis na direita):
        // p_red_left = 1, p_red_right = 0, p_blue_left = 0, p_blue_right = 1
        // S = 0 (ou o valor mínimo configurado didaticamente, 0.12 J/K)
        // Estado misturado (50% em cada lado): S máximo (aproximadamente 2.44 J/K)
        
        const entropyComponent = (p) => {
            if (p <= 0 || p >= 1) return 0;
            return -p * Math.log(p);
        };

        const pRedL = redLeft / this.numParticles;
        const pRedR = redRight / this.numParticles;
        const pBlueL = blueLeft / this.numParticles;
        const pBlueR = blueRight / this.numParticles;

        // Entropia da desordem espacial combinada dos dois tipos
        const calculatedS = 0.12 + (entropyComponent(pRedL) + entropyComponent(pRedR) + entropyComponent(pBlueL) + entropyComponent(pBlueR)) * 1.6;
        
        this.entropy = calculatedS;

        // Porcentagem de organização (100% no início, decai para ~0% quando perfeitamente homogêneo)
        // A desordem máxima teórica ocorre quando temos 50/50 em cada lado
        const totalMisplaced = redRight + blueLeft; // Partículas fora do seu compartimento original
        this.organization = Math.max(0, 100 - (totalMisplaced / totalHalf) * 100);

        // Atualizar HUD
        document.getElementById("hud-l2-entropy").textContent = this.entropy.toFixed(2) + " J/K";
        
        const orderText = document.getElementById("hud-l2-order");
        orderText.textContent = Math.round(this.organization) + "%";

        // Mudar cores com base na organização
        if (this.organization > 80) {
            orderText.style.color = "#10b981"; // Alta ordem
        } else if (this.organization > 40) {
            orderText.style.color = "#eab308"; // Médio
        } else {
            orderText.style.color = "#ef4444"; // Caótico
        }

        document.getElementById("hud-l2-red").textContent = Math.round(this.redCountLeft * 100) + "%";
        document.getElementById("hud-l2-blue").textContent = Math.round(this.blueCountRight * 100) + "%";
    }

    update(dt, totalTime) {
        // Limites da caixa para reflexão de partículas
        const limitX = this.boxWidth / 2 - 0.12;
        const limitY = this.boxHeight / 2 - 0.12;
        const limitZ = this.boxDepth / 2 - 0.12;

        this.particles.forEach(p => {
            const mesh = p.mesh;
            const vel = mesh.userData.vel;

            // Integrar movimento
            mesh.position.addScaledVector(vel, dt);

            // Bater nas paredes externas da caixa
            if (Math.abs(mesh.position.x) > limitX) {
                vel.x = -Math.sign(mesh.position.x) * Math.abs(vel.x);
                mesh.position.x = Math.sign(mesh.position.x) * limitX;
            }
            if (Math.abs(mesh.position.y) > limitY) {
                vel.y = -Math.sign(mesh.position.y) * Math.abs(vel.y);
                mesh.position.y = Math.sign(mesh.position.y) * limitY;
            }
            if (Math.abs(mesh.position.z) > limitZ) {
                vel.z = -Math.sign(mesh.position.z) * Math.abs(vel.z);
                mesh.position.z = Math.sign(mesh.position.z) * limitZ;
            }

            // Bater na barreira central (se instalada)
            if (!this.barrierRemoved) {
                const barrierX = 0;
                const barrierHalfWidth = 0.08;
                
                // Se a partícula estiver cruzando o centro (x = 0)
                if (Math.abs(mesh.position.x) < barrierHalfWidth) {
                    // Refletir com base no lado que ela pertence
                    if (vel.x > 0) { // Indo da esquerda para direita, bate na barreira
                        vel.x = -Math.abs(vel.x);
                        mesh.position.x = -barrierHalfWidth;
                    } else { // Indo da direita para esquerda, bate na barreira
                        vel.x = Math.abs(vel.x);
                        mesh.position.x = barrierHalfWidth;
                    }
                }
            }
        });

        // Recalcular métricas de Entropia
        this.calculateEntropy();
    }

    reset() {
        this.barrierRemoved = false;
        this.externalWorkDone = 0;
        this.entropy = 0.12;
        this.organization = 100;

        this.barrier.position.y = 0; // Fechar barreira
        
        const btnToggle = document.getElementById("btn-toggle-barrier");
        btnToggle.textContent = "Remover Divisória";
        btnToggle.className = "btn btn-primary";

        document.getElementById("val-l2-barrier").textContent = "Instalada";
        document.getElementById("val-l2-barrier").style.color = "#10b981";
        document.getElementById("val-l2-work").textContent = "0 J";

        // Separar partículas novamente
        this.particles.forEach(p => {
            const isRed = p.colorIndex === 0;
            let px;
            if (isRed) {
                px = -Math.random() * (this.boxWidth/2 - 0.3) - 0.15;
            } else {
                px = Math.random() * (this.boxWidth/2 - 0.3) + 0.15;
            }
            const py = (Math.random() - 0.5) * (this.boxHeight - 0.3);
            const pz = (Math.random() - 0.5) * (this.boxDepth - 0.3);
            p.mesh.position.set(px, py, pz);
            
            const speed = 1.8;
            const theta = Math.random() * Math.PI * 2;
            p.mesh.userData.vel.set(
                speed * (isRed ? -1 : 1) * Math.abs(Math.cos(theta)),
                speed * Math.sin(theta),
                speed * (Math.random() - 0.5)
            );
        });

        this.calculateEntropy();
    }

    unload() {
        this.particles = [];
    }
}


/* ==========================================================================
   MÓDULO - TERCEIRA LEI (ZERO ABSOLUTO)
   ========================================================================== */
class Law3Module {
    constructor(hudContainer, controlsContainer) {
        this.hud = hudContainer;
        this.ctrl = controlsContainer;

        // Variáveis físicas
        this.temperature = 300; // Kelvin (Tende a 0)
        this.entropy = 1.80;    // J/K
        this.vibration = 100;   // % de amplitude
        
        // Elementos 3D
        this.atoms = []; // Rede de átomos
        this.bonds = []; // Conexões entre átomos
        this.lightGlow = null; // Brilho de temperatura ambiente
        
        // Configurações do retículo cristalino (4 x 4 x 4 = 64 átomos)
        this.gridSize = 3; // index de 0 a 3
        this.spacing = 1.2; // Espaçamento entre os átomos
        this.originOffset = -1.8; // Centralizar o grid no centro (0,0,0)
    }

    init() {
        // Criar HUD
        this.hud.innerHTML = `
            <div class="hud-item">
                <span class="hud-item-label">Temperatura (T)</span>
                <span class="hud-item-value" id="hud-l3-temp" style="color: #3b82f6;">300.0 K</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Entropia Cristal (S)</span>
                <span class="hud-item-value" id="hud-l3-entropy">1.80 J/K</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Vibração Média</span>
                <span class="hud-item-value" id="hud-l3-vib">100%</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Estado Físico</span>
                <span class="hud-item-value" id="hud-l3-state" style="color: #eab308;">Rede Sólida</span>
            </div>
        `;

        // Criar Controles
        this.ctrl.innerHTML = `
            <div class="control-group">
                <div class="control-label-row">
                    <span>Resfriar Sistema (Kelvin) <span class="tooltip-icon" title="Reduz a energia térmica aproximando o sistema do Zero Absoluto">?</span></span>
                    <span class="control-value" id="val-l3-temp" style="color: #3b82f6;">300 K</span>
                </div>
                <input type="range" id="slide-l3-temp" min="0.001" max="300" step="1" value="300">
            </div>
            
            <div class="control-group">
                <div class="control-label-row">
                    <span>Aproximação Assintótica <span class="tooltip-icon" title="Tenta atingir exatamente 0 K através de um resfriador infinito">?</span></span>
                </div>
                <div class="controls-buttons" style="margin-top:0;">
                    <button id="btn-force-zero" class="btn btn-primary" style="width:100%;">Tentar Forçar 0 Kelvin</button>
                </div>
            </div>
        `;

        // Listeners dos controles
        const sliderTemp = document.getElementById("slide-l3-temp");
        sliderTemp.addEventListener("input", (e) => {
            this.temperature = parseFloat(e.target.value);
            this.recalculatePhysics();
        });

        document.getElementById("btn-force-zero").addEventListener("click", () => {
            // Animar o resfriador indo a zero de forma exponencial
            let targetT = this.temperature;
            const interval = setInterval(() => {
                // Diminuir assintoticamente dividindo por 2
                targetT = targetT / 2;
                
                if (targetT < 0.001) {
                    targetT = 0.001; // Limite físico imposto
                    clearInterval(interval);
                    alert("LIMITE INALCANÇÁVEL (3ª LEI):\n\nPara remover o último bit de energia térmica de um cristal, a eficiência do resfriador tende a zero.\n\nSeria necessário um tempo infinito e processos infinitos para isolar completamente a rede e atingir 0.0000... K.");
                }
                
                this.temperature = targetT;
                sliderTemp.value = targetT;
                this.recalculatePhysics();
            }, 100);
        });

        // Configuração na Cena 3D
        // Criar um retículo cristalino 3D ordenado 3x3x3
        const atomGeo = new THREE.SphereGeometry(0.18, 12, 12);
        const atomMat = new THREE.MeshStandardMaterial({
            color: 0x00f2fe,
            roughness: 0.2,
            metalness: 0.8
        });

        // Criar os átomos do cristal
        for (let x = 0; x <= this.gridSize; x++) {
            for (let y = 0; y <= this.gridSize; y++) {
                for (let z = 0; z <= this.gridSize; z++) {
                    const atom = new THREE.Mesh(atomGeo, atomMat.clone());
                    
                    const eqX = this.originOffset + x * this.spacing;
                    const eqY = -1.2 + y * this.spacing;
                    const eqZ = this.originOffset + z * this.spacing;
                    
                    atom.position.set(eqX, eqY, eqZ);
                    atom.castShadow = true;
                    
                    // Salvar posições originais de equilíbrio
                    atom.userData = {
                        eqX: eqX,
                        eqY: eqY,
                        eqZ: eqZ,
                        phaseX: Math.random() * Math.PI * 2,
                        phaseY: Math.random() * Math.PI * 2,
                        phaseZ: Math.random() * Math.PI * 2,
                        freq: 15 + Math.random() * 10
                    };
                    
                    activeMeshGroup.add(atom);
                    this.atoms.push(atom);
                }
            }
        }

        // Criar ligações químicas (linhas/cilindros ligando os átomos vizinhos)
        const bondMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.4 });
        
        // Vamos percorrer a lista de átomos e criar conexões físicas nas 3 direções para os vizinhos
        const size = this.gridSize + 1;
        const getIndex = (x, y, z) => x * size * size + y * size + z;

        for (let x = 0; x <= this.gridSize; x++) {
            for (let y = 0; y <= this.gridSize; y++) {
                for (let z = 0; z <= this.gridSize; z++) {
                    const idx = getIndex(x, y, z);
                    const currentAtom = this.atoms[idx];

                    // Conexão em X
                    if (x < this.gridSize) {
                        const neighbor = this.atoms[getIndex(x + 1, y, z)];
                        this.createBondLine(currentAtom, neighbor, bondMat);
                    }
                    // Conexão em Y
                    if (y < this.gridSize) {
                        const neighbor = this.atoms[getIndex(x, y + 1, z)];
                        this.createBondLine(currentAtom, neighbor, bondMat);
                    }
                    // Conexão em Z
                    if (z < this.gridSize) {
                        const neighbor = this.atoms[getIndex(x, y, z + 1)];
                        this.createBondLine(currentAtom, neighbor, bondMat);
                    }
                }
            }
        }

        // Adicionar uma luz sutil de brilho térmico ambiente vermelha/alaranjada no centro
        this.lightGlow = new THREE.PointLight(0xff4500, 1.5, 10);
        this.lightGlow.position.set(0, 0.6, 0);
        activeMeshGroup.add(this.lightGlow);

        this.recalculatePhysics();
    }

    createBondLine(atom1, atom2, material) {
        // Criar geometria de linha simples conectando as coordenadas
        const points = [];
        points.push(atom1.position);
        points.push(atom2.position);
        
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeo, material);
        activeMeshGroup.add(line);
        this.bonds.push({
            line: line,
            atom1: atom1,
            atom2: atom2
        });
    }

    recalculatePhysics() {
        // Entropia decai à medida que resfria. No zero absoluto de um cristal perfeito, S = 0 J/K.
        // S = K * ln(T) ou simplificado didaticamente como proporcional a T
        this.entropy = (this.temperature / 300) * 1.80;
        
        // A amplitude de vibração térmica é proporcional à temperatura (v ∝ √T)
        this.vibration = Math.min(100, Math.round((this.temperature / 300) * 100));

        // Atualizar interface
        document.getElementById("hud-l3-temp").textContent = this.temperature.toFixed(3) + " K";
        document.getElementById("val-l3-temp").textContent = Math.round(this.temperature) + " K";
        document.getElementById("hud-l3-entropy").textContent = this.entropy.toFixed(3) + " J/K";
        
        const vibText = document.getElementById("hud-l3-vib");
        vibText.textContent = this.vibration.toFixed(1) + "%";

        const stateText = document.getElementById("hud-l3-state");

        if (this.temperature < 0.05) {
            stateText.textContent = "Cristal Quase Perfeito";
            stateText.style.color = "#10b981"; // Verde
            vibText.style.color = "#10b981";
        } else if (this.temperature < 50) {
            stateText.textContent = "Movimento Congelado";
            stateText.style.color = "#3b82f6"; // Azul criogênico
            vibText.style.color = "#3b82f6";
        } else {
            stateText.textContent = "Rede Sólida Padrão";
            stateText.style.color = "#eab308"; // Amarelo
            vibText.style.color = "#eab308";
        }

        // Mudar intensidade da luz de brilho de calor interno do cristal com a temperatura
        if (this.lightGlow) {
            this.lightGlow.intensity = (this.temperature / 300) * 2.5;
            // A cor muda de vermelho/quente para azul/criogênico
            const heatColor = new THREE.Color();
            heatColor.setHSL((this.temperature / 300) * 0.1, 1, 0.5); // Muda de laranja/vermelho para frio
            this.lightGlow.color.copy(heatColor);
        }

        // Alterar cor dos átomos sutilmente para simbolizar resfriamento extremo
        const atomColor = new THREE.Color();
        const ratio = this.temperature / 300;
        // 300K = 0x00f2fe (Ciano), 0.001K = 0xe0f2fe (Azul-gelo esbranquiçado)
        atomColor.setRGB(ratio * 0.0, 0.95 + ratio * 0.05, 1.0);
        this.atoms.forEach(atom => {
            atom.material.color.copy(atomColor);
            // Átomos próximos de 0 K parecem "brilhar" de forma fria
            atom.material.emissive.copy(atomColor).multiplyScalar((1.0 - ratio) * 0.25);
        });
    }

    update(dt, totalTime) {
        // Amplitude de vibração base
        // A amplitude real diminui com a temperatura
        const maxAmplitude = 0.18; // Amplitude máxima em 300K
        const amp = (this.temperature / 300) * maxAmplitude;

        // Vibrar átomos em torno de suas posições de equilíbrio
        this.atoms.forEach(atom => {
            const u = atom.userData;
            // Usar funções trigonométricas com fases diferentes para um aspecto orgânico de agitação térmica
            const tSpeed = totalTime * u.freq;
            
            const dx = Math.sin(tSpeed + u.phaseX) * amp;
            const dy = Math.cos(tSpeed + u.phaseY) * amp;
            const dz = Math.sin(tSpeed + u.phaseZ) * amp;

            atom.position.set(u.eqX + dx, u.eqY + dy, u.eqZ + dz);
        });

        // Atualizar as posições de linhas das ligações para acompanharem a vibração dos átomos
        this.bonds.forEach(b => {
            const positions = b.line.geometry.attributes.position.array;
            
            // Atom 1
            positions[0] = b.atom1.position.x;
            positions[1] = b.atom1.position.y;
            positions[2] = b.atom1.position.z;
            
            // Atom 2
            positions[3] = b.atom2.position.x;
            positions[4] = b.atom2.position.y;
            positions[5] = b.atom2.position.z;
            
            b.line.geometry.attributes.position.needsUpdate = true;
        });
    }

    reset() {
        this.temperature = 300;
        this.entropy = 1.80;
        this.vibration = 100;

        document.getElementById("slide-l3-temp").value = 300;

        this.recalculatePhysics();

        // Centralizar átomos na posição de equilíbrio
        this.atoms.forEach(atom => {
            atom.position.set(atom.userData.eqX, atom.userData.eqY, atom.userData.eqZ);
        });

        // Resetar posições de linhas das ligações
        this.bonds.forEach(b => {
            const positions = b.line.geometry.attributes.position.array;
            positions[0] = b.atom1.userData.eqX;
            positions[1] = b.atom1.userData.eqY;
            positions[2] = b.atom1.userData.eqZ;
            positions[3] = b.atom2.userData.eqX;
            positions[4] = b.atom2.userData.eqY;
            positions[5] = b.atom2.userData.eqZ;
            b.line.geometry.attributes.position.needsUpdate = true;
        });
    }

    unload() {
        this.atoms = [];
        this.bonds = [];
        this.lightGlow = null;
    }
}

/* ==========================================================================
   MÓDULO - EXPANSÃO V2: CONCEITOS E CICLOS TERMODINÂMICOS
   ========================================================================== */
class Law4Module {
    constructor(hudContainer, controlsContainer) {
        this.hud = hudContainer;
        this.ctrl = controlsContainer;

        // Tipo de processo ativo: 0=Isotérmico, 1=Isobárico, 2=Isocórico, 3=Adiabático
        this.processType = 0;
        this.progress = 50; // 0% a 100%
        this.isReversible = true;

        // Variáveis de estado calculadas
        this.pressure = 2.0;   // P (atm)
        this.volume = 2.0;     // V (L)
        this.temperature = 300; // T (K)
        this.internalEnergy = 150; // U (J)
        this.entropy = 1.5;    // S (J/K)
        this.enthalpy = 350;   // H (J)
        this.heat = 0;         // Q (J)
        this.work = 0;         // W (J)

        // Elementos 3D do módulo
        this.cylinder = null;
        this.piston = null;
        this.particles = [];
        
        this.numParticles = 35;
        this.containerRadius = 1.5;
        this.pistonBaseY = -1.5;
    }

    init() {
        // Criar HUD
        this.hud.innerHTML = `
            <div class="hud-item">
                <span class="hud-item-label">Pressão (P)</span>
                <span class="hud-item-value" id="hud-l4-p">2.00 atm</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Volume (V)</span>
                <span class="hud-item-value" id="hud-l4-v">2.00 L</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Temperatura (T)</span>
                <span class="hud-item-value" id="hud-l4-t">300.0 K</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Energia Interna (U)</span>
                <span class="hud-item-value" id="hud-l4-u">150.0 J</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Entropia (S)</span>
                <span class="hud-item-value" id="hud-l4-s">1.50 J/K</span>
            </div>
            <div class="hud-item">
                <span class="hud-item-label">Entalpia (H)</span>
                <span class="hud-item-value" id="hud-l4-h">350.0 J</span>
            </div>
        `;

        // Criar Controles
        this.ctrl.innerHTML = `
            <div class="control-group">
                <div class="control-label-row">
                    <span>Selecionar Processo <span class="tooltip-icon" title="Escolha qual transformação termodinâmica simular">?</span></span>
                </div>
                <select id="select-l4-process" class="btn btn-secondary" style="width:100%; text-align:left; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-family: var(--font-primary);">
                    <option value="0" selected>Transformação Isotérmica (T cte)</option>
                    <option value="1">Transformação Isobárica (P cte)</option>
                    <option value="2">Transformação Isocórica (V cte)</option>
                    <option value="3">Transformação Adiabática (Q=0, S cte)</option>
                </select>
            </div>

            <div class="control-group">
                <div class="control-label-row">
                    <span>Avanço da Transformação (%) <span class="tooltip-icon" title="Controla a evolução temporal do processo termodinâmico ao longo da curva correspondente">?</span></span>
                    <span class="control-value" id="val-l4-progress">50%</span>
                </div>
                <input type="range" id="slide-l4-progress" min="0" max="100" value="50">
            </div>

            <div class="control-group">
                <div class="control-label-row">
                    <span>Tipo de Ciclo <span class="tooltip-icon" title="Compara processos ideais infinitamente lentos (reversíveis) com processos reais com fricção e dissipação de calor (irreversíveis)">?</span></span>
                    <span class="control-value" id="val-l4-reversibility">Reversível</span>
                </div>
                <div class="controls-buttons" style="margin-top:0;">
                    <button id="btn-l4-reversible" class="btn btn-success" style="width:100%;">Processo Reversível</button>
                </div>
            </div>
        `;

        // Ligar Eventos dos Controles
        document.getElementById("select-l4-process").addEventListener("change", (e) => {
            this.processType = parseInt(e.target.value);
            this.updateReferenceCurves();
            this.recalculatePhysics();
        });

        document.getElementById("slide-l4-progress").addEventListener("input", (e) => {
            this.progress = parseInt(e.target.value);
            document.getElementById("val-l4-progress").textContent = this.progress + "%";
            this.recalculatePhysics();
        });

        document.getElementById("btn-l4-reversible").addEventListener("click", (e) => {
            this.isReversible = !this.isReversible;
            e.target.className = this.isReversible ? "btn btn-success" : "btn btn-danger";
            e.target.textContent = this.isReversible ? "Processo Reversível" : "Processo Irreversível";
            document.getElementById("val-l4-reversibility").textContent = this.isReversible ? "Reversível" : "Irreversível";
            document.getElementById("val-l4-reversibility").style.color = this.isReversible ? "#10b981" : "#ef4444";
            this.updateReferenceCurves();
            this.recalculatePhysics();
        });

        // Configuração na Cena 3D: Cilindro + Pistão
        const cylinderGeo = new THREE.CylinderGeometry(this.containerRadius, this.containerRadius, 4.5, 32, 1, true);
        const cylinderMat = new THREE.MeshStandardMaterial({
            color: 0x88bbff,
            transparent: true,
            opacity: 0.15,
            roughness: 0.1,
            metalness: 0.9,
            side: THREE.DoubleSide
        });
        this.cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
        this.cylinder.position.y = 0.5;
        activeMeshGroup.add(this.cylinder);

        // Aros do cilindro
        const ringGeo = new THREE.RingGeometry(this.containerRadius, this.containerRadius + 0.1, 32);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x7f00ff, side: THREE.DoubleSide, roughness: 0.2 });
        
        const ringBottom = new THREE.Mesh(ringGeo, ringMat);
        ringBottom.rotation.x = Math.PI / 2;
        ringBottom.position.y = -1.75;
        activeMeshGroup.add(ringBottom);

        const ringTop = new THREE.Mesh(ringGeo, ringMat);
        ringTop.rotation.x = Math.PI / 2;
        ringTop.position.y = 2.75;
        activeMeshGroup.add(ringTop);

        // Pistão
        const pistonGeo = new THREE.CylinderGeometry(this.containerRadius - 0.05, this.containerRadius - 0.05, 0.3, 32);
        const pistonMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
        this.piston = new THREE.Mesh(pistonGeo, pistonMat);
        this.piston.position.y = 1.1; // Pos inicial do pistão
        activeMeshGroup.add(this.piston);

        const shaftGeo = new THREE.CylinderGeometry(0.12, 0.12, 4, 16);
        const shaft = new THREE.Mesh(shaftGeo, pistonMat);
        shaft.position.y = 2.0;
        this.piston.add(shaft);

        // Criar partículas de gás
        const particleGeo = new THREE.SphereGeometry(0.09, 12, 12);
        const particleMat = new THREE.MeshStandardMaterial({ roughness: 0.1, metalness: 0.1 });

        for (let i = 0; i < this.numParticles; i++) {
            const p = new THREE.Mesh(particleGeo, particleMat.clone());
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * (this.containerRadius - 0.2);
            const py = this.pistonBaseY + 0.2 + Math.random() * 2.0;

            p.position.set(Math.cos(angle) * r, py, Math.sin(angle) * r);
            const speed = 2.0;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            p.userData = {
                vel: new THREE.Vector3(
                    speed * Math.sin(phi) * Math.cos(theta),
                    speed * Math.sin(phi) * Math.sin(theta),
                    speed * Math.cos(phi)
                )
            };

            activeMeshGroup.add(p);
            this.particles.push(p);
        }

        // Configurar as curvas estáticas nos diagramas assim que entra
        this.updateReferenceCurves();
        this.recalculatePhysics();
    }

    updateReferenceCurves() {
        if (!chart1 || !chart2) return;

        // Gerar curvas de referência teóricas completas baseadas no processo selecionado
        const pvPoints = [];
        const tsPoints = [];

        const V_init = 2.0;
        const P_init = 2.0;
        const T_init = 300;
        const S_init = 1.5;

        if (this.processType === 0) { // Isotérmico
            // P = 4 / V
            for (let v = 0.8; v <= 3.2; v += 0.1) {
                pvPoints.push({ x: v, y: 4.0 / v });
            }
            // T = 300K, S varia
            for (let s = 0.8; s <= 2.2; s += 0.1) {
                tsPoints.push({ x: s, y: 300 });
            }
        } else if (this.processType === 1) { // Isobárico
            // P = 2 atm
            for (let v = 0.8; v <= 3.2; v += 0.1) {
                pvPoints.push({ x: v, y: 2.0 });
            }
            // T = 150 * V. S = 1.5 + 1.2 * ln(V/2)
            for (let v = 0.8; v <= 3.2; v += 0.1) {
                const temp = 150 * v;
                const s = 1.5 + 1.2 * Math.log(v / 2.0);
                tsPoints.push({ x: s, y: temp });
            }
        } else if (this.processType === 2) { // Isocórico
            // V = 2.0
            for (let p = 0.8; p <= 5.2; p += 0.2) {
                pvPoints.push({ x: 2.0, y: p });
            }
            // T = 150 * P. S = 1.5 + 0.8 * ln(T/300)
            for (let p = 0.8; p <= 5.2; p += 0.2) {
                const temp = 150 * p;
                const s = 1.5 + 0.8 * Math.log(temp / 300);
                tsPoints.push({ x: s, y: temp });
            }
        } else if (this.processType === 3) { // Adiabático
            // P = 2 * (2 / V)^1.67
            for (let v = 0.8; v <= 3.2; v += 0.1) {
                const p = 2.0 * Math.pow(2.0 / v, 1.67);
                pvPoints.push({ x: v, y: p });
            }
            // Se reversível (isentrópico): S = 1.5, T varia de ~120K a ~500K
            // Se irreversível: S aumenta durante a expansão (s = 1.5 + 0.5 * (v - 0.8))
            if (this.isReversible) {
                for (let temp = 120; temp <= 500; temp += 15) {
                    tsPoints.push({ x: 1.5, y: temp });
                }
            } else {
                for (let v = 0.8; v <= 3.2; v += 0.1) {
                    const temp = 300 * Math.pow(2.0 / v, 0.67);
                    const s = 1.5 + 0.6 * (v - 0.8);
                    tsPoints.push({ x: s, y: temp });
                }
            }
        }

        chart1.setReferenceCurve(pvPoints);
        chart2.setReferenceCurve(tsPoints);
    }

    recalculatePhysics() {
        const ratio = this.progress / 100; // 0 a 1

        // Calcular variáveis baseado no tipo de processo
        if (this.processType === 0) { // Isotérmico (T constante)
            this.volume = 1.0 + ratio * 2.0; // 1.0 a 3.0 L
            this.temperature = 300; // Constante
            this.pressure = 4.0 / this.volume; // PV = 4.0
            this.internalEnergy = 150; // U = const para ideal
            
            // Entropia ideal: S = S0 + nR * ln(V/V0)
            let sIdeal = 1.5 + 0.5 * Math.log(this.volume / 2.0);
            if (!this.isReversible) {
                sIdeal += ratio * 0.4;
            }
            this.entropy = sIdeal;

        } else if (this.processType === 1) { // Isobárico (P constante)
            this.volume = 1.0 + ratio * 2.0; // 1.0 a 3.0 L
            this.pressure = 2.0; // Constante
            this.temperature = 150 * this.volume; 
            this.internalEnergy = 75 * this.volume;
            
            let sIdeal = 1.5 + 1.2 * Math.log(this.volume / 2.0);
            if (!this.isReversible) {
                sIdeal += ratio * 0.4;
            }
            this.entropy = sIdeal;

        } else if (this.processType === 2) { // Isocórico (V constante)
            this.volume = 2.0; // Constante
            this.pressure = 1.0 + ratio * 4.0; // P varia de 1.0 a 5.0 atm
            this.temperature = 150 * this.pressure;
            this.internalEnergy = 75 * this.pressure;
            
            let sIdeal = 1.5 + 0.8 * Math.log(this.temperature / 300);
            if (!this.isReversible) {
                sIdeal += ratio * 0.3;
            }
            this.entropy = sIdeal;

        } else if (this.processType === 3) { // Adiabático (Q = 0)
            this.volume = 1.0 + ratio * 2.0; // 1.0 a 3.0 L
            
            if (this.isReversible) {
                this.entropy = 1.5;
                this.pressure = 2.0 * Math.pow(2.0 / this.volume, 1.67);
                this.temperature = 300 * Math.pow(2.0 / this.volume, 0.67);
            } else {
                this.entropy = 1.5 + 0.6 * (this.volume - 1.0);
                this.pressure = 2.0 * Math.pow(2.0 / this.volume, 1.45);
                this.temperature = 300 * Math.pow(2.0 / this.volume, 0.55);
            }
            this.internalEnergy = 150 * (this.temperature / 300);
        }

        // Entalpia: H = U + p*V. Multiplicamos pV por 50 para fins didáticos
        this.enthalpy = this.internalEnergy + (this.pressure * this.volume * 50);

        // Atualizar HUD
        document.getElementById("hud-l4-p").textContent = this.pressure.toFixed(2) + " atm";
        document.getElementById("hud-l4-v").textContent = this.volume.toFixed(2) + " L";
        document.getElementById("hud-l4-t").textContent = this.temperature.toFixed(1) + " K";
        document.getElementById("hud-l4-u").textContent = this.internalEnergy.toFixed(1) + " J";
        document.getElementById("hud-l4-s").textContent = this.entropy.toFixed(2) + " J/K";
        document.getElementById("hud-l4-h").textContent = this.enthalpy.toFixed(1) + " J";

        this.updateExplanationPanel();
    }

    updateExplanationPanel() {
        const titleText = document.getElementById("law-title");
        const formulaText = document.getElementById("law-formula");
        const definitionText = document.getElementById("law-definition");
        const explanationText = document.getElementById("law-explanation-text");
        const dailyText = document.getElementById("law-daily-example");
        const practicalText = document.getElementById("law-practical-app");

        if (this.processType === 0) {
            titleText.textContent = "Transformação Isotérmica";
            formulaText.textContent = "PV = constante  (T constante)";
            definitionText.textContent = "Uma transformação isotérmica ocorre a temperatura constante. Todo o calor adicionado é convertido integralmente em trabalho.";
            explanationText.textContent = "Como a temperatura do gás ideal depende de sua energia interna, em um processo isotérmico ΔU = 0. Portanto, pela Primeira Lei, Q = W. O gás troca calor livremente com um reservatório térmico externo para manter a sua temperatura constante durante a compressão ou expansão.";
            dailyText.textContent = "Mudança de estado da matéria (fusão/ebulição) ocorrendo localmente sob temperatura e pressão de vapor estáveis.";
            practicalText.textContent = "Projetos de compressores industriais dotados de camisas de resfriamento para manter a compressão próxima de uma isotérmica, poupando energia mecânica.";
        } else if (this.processType === 1) {
            titleText.textContent = "Transformação Isobárica";
            formulaText.textContent = "V/T = constante  (P constante)";
            definitionText.textContent = "Uma transformação isobárica ocorre sob pressão constante. O calor adicionado altera o volume e a temperatura.";
            explanationText.textContent = "O calor trocado (Q) é diretamente igual à variação da Entalpia (ΔH = Q) para processos sob pressão constante. O gás realiza trabalho (W = P·ΔV) e expande de forma proporcional ao aumento da temperatura absoluta Kelvin (Lei de Charles).";
            dailyText.textContent = "Uma bexiga de festa se expandindo quando colocada sob o calor do sol: a pressão atmosférica ao redor permanece constante, logo o volume aumenta com a temperatura.";
            practicalText.textContent = "Cilindros de motores térmicos durante as fases de combustão e exaustão, onde o pistão move-se livremente para manter a pressão interna constante.";
        } else if (this.processType === 2) {
            titleText.textContent = "Transformação Isocórica";
            formulaText.textContent = "P/T = constante  (V constante)";
            definitionText.textContent = "Uma transformação isocórica (ou isométrica) ocorre a volume constante. Não há realização de trabalho mecânico.";
            explanationText.textContent = "Como o volume não se altera, o gás não realiza trabalho (W = 0). Pela Primeira Lei, todo o calor fornecido ao sistema se transforma diretamente em variação da energia interna (ΔU = Q), aumentando rapidamente a temperatura e a pressão das colisões das partículas.";
            dailyText.textContent = "Aquecer um spray de aerossol fechado: o volume da lata é rígido e fixo (isocórico), e a pressão interna sobe com a temperatura até causar uma explosão perigosa.";
            practicalText.textContent = "Cálculo de calorímetros de volume constante (bomba calorimétrica) para medir com extrema precisão o calor gerado por reações químicas ou alimentos.";
        } else if (this.processType === 3) {
            titleText.textContent = "Transformação Adiabática";
            formulaText.textContent = "Q = 0  ⇒  ΔU = -W";
            definitionText.textContent = "Uma transformação adiabática ocorre sem qualquer troca de calor entre o sistema e o meio externo.";
            explanationText.textContent = "O sistema é termicamente isolado. Se o gás realiza trabalho expandindo (W > 0), ele consome sua própria energia interna (ΔU < 0), esfriando. Se o gás é comprimido rapidamente (W < 0), a energia interna aumenta (ΔU > 0), esquentando o gás.";
            dailyText.textContent = "A expansão de massas de ar na atmosfera: quando o ar quente sobe, ele se expande devido à menor pressão, resfriando-se adiabaticamente para formar nuvens.";
            practicalText.textContent = "O funcionamento de motores ciclo Diesel: a compressão rápida do ar na câmara é adiabática, elevando a temperatura o suficiente para inflamar o combustível sem precisar de velas de ignição.";
        }
    }

    update(dt, totalTime) {
        const targetPistonY = -1.5 + (this.volume * 1.3);
        this.piston.position.y += (targetPistonY - this.piston.position.y) * 0.2;
        const pistonYLimit = this.piston.position.y - 0.15;

        const speedScale = Math.sqrt(this.temperature) * 0.18;
        
        const getGasColor = (t) => {
            const ratio = (t - 150) / 300;
            const clamped = Math.max(0, Math.min(1, ratio));
            const color = new THREE.Color();
            color.setHSL((1.0 - clamped) * 240 / 360, 1.0, 0.5);
            return color;
        };
        
        const gasColor = getGasColor(this.temperature);

        this.particles.forEach(p => {
            p.material.color.copy(gasColor);
            
            const vel = p.userData.vel.clone().normalize().multiplyScalar(speedScale);
            p.position.addScaledVector(vel, dt);

            const r2 = p.position.x * p.position.x + p.position.z * p.position.z;
            const rMax = this.containerRadius - 0.15;
            
            if (r2 > rMax * rMax) {
                const normal = new THREE.Vector2(p.position.x, p.position.z).normalize();
                const dot = p.userData.vel.x * normal.x + p.userData.vel.z * normal.y;
                p.userData.vel.x = p.userData.vel.x - 2 * dot * normal.x;
                p.userData.vel.z = p.userData.vel.z - 2 * dot * normal.y;
                p.position.x = normal.x * rMax;
                p.position.z = normal.y * rMax;
            }

            if (p.position.y < -1.65) {
                p.userData.vel.y = Math.abs(p.userData.vel.y);
                p.position.y = -1.65;
            }

            if (p.position.y > pistonYLimit) {
                p.userData.vel.y = -Math.abs(p.userData.vel.y);
                p.position.y = pistonYLimit;
            }
        });
    }

    reset() {
        this.progress = 50;
        this.isReversible = true;
        
        document.getElementById("slide-l4-progress").value = 50;
        document.getElementById("val-l4-progress").textContent = "50%";
        
        const btnRev = document.getElementById("btn-l4-reversible");
        btnRev.className = "btn btn-success";
        btnRev.textContent = "Processo Reversível";
        
        document.getElementById("val-l4-reversibility").textContent = "Reversível";
        document.getElementById("val-l4-reversibility").style.color = "#10b981";

        this.updateReferenceCurves();
        this.recalculatePhysics();

        if (this.piston) {
            this.piston.position.y = -1.5 + (this.volume * 1.3);
        }
    }

    unload() {
        this.particles = [];
    }
}

// Declaração de variáveis globais de gráficos
let chart1 = null;
let chart2 = null;
let chartTime = 0;

function setupChartsForModule(lawIndex) {
    const chartsPanel = document.getElementById("charts-panel");
    const toggleChartsBtn = document.getElementById("toggle-charts-btn");
    
    if (!chartsPanel) return;

    if (lawIndex === 5) {
        chartsPanel.classList.add("hidden");
        return;
    }

    // Destruir canvas antigos e recriar para limpar o contexto
    const boxes = document.querySelectorAll(".chart-box");
    if (boxes.length >= 2) {
        boxes[0].innerHTML = '<canvas id="chart-1"></canvas>';
        boxes[1].innerHTML = '<canvas id="chart-2"></canvas>';
    }

    // Exibir painel de gráficos para todas as leis
    chartsPanel.classList.remove("hidden");

    if (lawIndex === 0) {
        document.getElementById("charts-panel-title").textContent = "Gráficos: Equilíbrio Térmico";
        chart1 = new RealTimeChart("chart-1", {
            title: "Temperatura de cada Bloco (K)",
            xAxisLabel: "Tempo de Contato (s)",
            yAxisLabel: "Temp. (K)",
            minY: 80,
            maxY: 420,
            colors: { A: "#ef4444", B: "#3b82f6", C: "#a855f7" }
        });
        chart2 = new RealTimeChart("chart-2", {
            title: "Gradiente Térmico Máximo (K)",
            xAxisLabel: "Tempo de Contato (s)",
            yAxisLabel: "Delta T (K)",
            autoScaleY: true,
            colors: { delta: "#eab308" }
        });
    } else if (lawIndex === 1) {
        document.getElementById("charts-panel-title").textContent = "Gráficos: 1ª Lei";
        chart1 = new CycleDiagram("chart-1", {
            title: "Diagrama P-V (Pressão vs Volume)",
            xAxisLabel: "Volume (L)",
            yAxisLabel: "Pressão (atm)",
            minX: 0.8, maxX: 3.2,
            minY: 0.0, maxY: 4.5
        });
        // Curva teórica isotérmica de referência
        const curvePoints = [];
        for (let v = 0.8; v <= 3.2; v += 0.1) {
            curvePoints.push({ x: v, y: 2.0 / v });
        }
        chart1.setReferenceCurve(curvePoints);

        chart2 = new RealTimeChart("chart-2", {
            title: "Energias do Sistema vs Tempo",
            xAxisLabel: "Tempo (s)",
            yAxisLabel: "Energia (J)",
            autoScaleY: true,
            colors: { Q: "#f97316", W: "#10b981", U: "#00f2fe" }
        });
    } else if (lawIndex === 2) {
        document.getElementById("charts-panel-title").textContent = "Gráficos: Entropia (2ª Lei)";
        chart1 = new RealTimeChart("chart-1", {
            title: "Entropia Total do Gás (S)",
            xAxisLabel: "Tempo (s)",
            yAxisLabel: "Entropia (J/K)",
            minY: 0.0,
            maxY: 3.5,
            colors: { S: "#ef4444" }
        });
        chart2 = new RealTimeChart("chart-2", {
            title: "Grau de Organização Molecular",
            xAxisLabel: "Tempo (s)",
            yAxisLabel: "Ordem (%)",
            minY: 0,
            maxY: 100,
            colors: { Ordem: "#10b981" }
        });
    } else if (lawIndex === 3) {
        document.getElementById("charts-panel-title").textContent = "Gráficos: Zero Absoluto (3ª Lei)";
        chart1 = new RealTimeChart("chart-1", {
            title: "Resfriamento Cristalino (T)",
            xAxisLabel: "Tempo (s)",
            yAxisLabel: "Temp. (K)",
            minY: 0,
            maxY: 320,
            colors: { T: "#3b82f6" }
        });
        chart2 = new RealTimeChart("chart-2", {
            title: "Entropia do Cristal Perfeito (S)",
            xAxisLabel: "Tempo (s)",
            yAxisLabel: "Entropia (J/K)",
            minY: -0.1,
            maxY: 2.0,
            colors: { S: "#00f2fe" }
        });
    } else if (lawIndex === 4) {
        document.getElementById("charts-panel-title").textContent = "Gráficos: Diagramas PV & TS";
        chart1 = new CycleDiagram("chart-1", {
            title: "Diagrama P-V do Processo",
            xAxisLabel: "Volume (L)",
            yAxisLabel: "Pressão (atm)",
            minX: 0.5, maxX: 3.5,
            minY: 0.0, maxY: 6.0
        });
        chart2 = new CycleDiagram("chart-2", {
            title: "Diagrama T-S do Processo",
            xAxisLabel: "Entropia S (J/K)",
            yAxisLabel: "Temperatura T (K)",
            minX: 0.0, maxX: 3.0,
            minY: 0, maxY: 500
        });
    }

    if (chart1 && typeof chart1.resize === "function") chart1.resize();
    if (chart2 && typeof chart2.resize === "function") chart2.resize();
}

function updateChartsData(dt, totalTime) {
    if (!currentModule || !isPlaying) return;

    chartTime += dt;

    if (activeLaw === 0) {
        if (chart1) {
            chart1.addDataPoint('A', currentModule.tempA, chartTime);
            chart1.addDataPoint('B', currentModule.tempB, chartTime);
            chart1.addDataPoint('C', currentModule.tempC, chartTime);
        }
        if (chart2) {
            const maxT = Math.max(currentModule.tempA, currentModule.tempB, currentModule.tempC);
            const minT = Math.min(currentModule.tempA, currentModule.tempB, currentModule.tempC);
            chart2.addDataPoint('delta', maxT - minT, chartTime);
        }
    } else if (activeLaw === 1) {
        if (chart1) {
            chart1.setCurrentState(currentModule.volume, currentModule.pressure);
        }
        if (chart2) {
            chart2.addDataPoint('Q', currentModule.Q, chartTime);
            chart2.addDataPoint('W', currentModule.W, chartTime);
            chart2.addDataPoint('U', currentModule.U, chartTime);
        }
    } else if (activeLaw === 2) {
        if (chart1) {
            chart1.addDataPoint('S', currentModule.entropy, chartTime);
        }
        if (chart2) {
            chart2.addDataPoint('Ordem', currentModule.organization, chartTime);
        }
    } else if (activeLaw === 3) {
        if (chart1) {
            chart1.addDataPoint('T', currentModule.temperature, chartTime);
        }
        if (chart2) {
            chart2.addDataPoint('S', currentModule.entropy, chartTime);
        }
    } else if (activeLaw === 4) {
        if (chart1) {
            chart1.setCurrentState(currentModule.volume, currentModule.pressure);
        }
        if (chart2) {
            chart2.setCurrentState(currentModule.entropy, currentModule.temperature);
        }
    }
}
