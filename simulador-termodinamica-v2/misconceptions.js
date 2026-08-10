/* ==========================================================================
   MISCONCEPTIONS.JS - CARROSSEL INTERATIVO DE DESMISTIFICAÇÃO TERMODINÂMICA
   ========================================================================== */

const MYTHS_DATA = [
    {
        title: "Calor vs Temperatura",
        myth: "Calor e temperatura representam o mesmo conceito físico; medir a temperatura é medir a quantidade de calor de um corpo.",
        correction: "Temperatura é uma medida da energia cinética média das partículas de um sistema. Calor é energia térmica em trânsito motivada exclusivamente por uma diferença de temperaturas entre dois corpos.",
        analogy: "A temperatura é como a altura da água em uma represa (nível de potencial), enquanto o calor é a vazão de água que escoa da represa mais alta para a mais baixa.",
        svgIcon: `
            <svg viewBox="0 0 100 60" width="100%" height="80">
                <!-- Copo A Quente -->
                <rect x="15" y="15" width="20" height="30" rx="3" fill="none" stroke="#ef4444" stroke-width="2"/>
                <line x1="15" y1="25" x2="35" y2="25" stroke="#ef4444" stroke-dasharray="2 2"/>
                <text x="25" y="12" font-size="5" fill="#ef4444" text-anchor="middle" font-family="monospace">T1 = 90°C</text>
                <!-- Copo B Frio -->
                <rect x="65" y="15" width="20" height="30" rx="3" fill="none" stroke="#3b82f6" stroke-width="2"/>
                <line x1="65" y1="35" x2="85" y2="35" stroke="#3b82f6" stroke-dasharray="2 2"/>
                <text x="75" y="12" font-size="5" fill="#3b82f6" text-anchor="middle" font-family="monospace">T2 = 20°C</text>
                <!-- Seta de Calor -->
                <path d="M 38 30 L 62 30" stroke="#f97316" stroke-width="2" marker-end="url(#arrow)"/>
                <text x="50" y="25" font-size="6" fill="#f97316" text-anchor="middle" font-weight="bold">Calor (Q)</text>
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#f97316"/>
                    </marker>
                </defs>
            </svg>`
    },
    {
        title: "Energia Térmica Total",
        myth: "Um objeto a uma temperatura mais alta sempre possui mais energia térmica total do que um objeto a uma temperatura mais baixa.",
        correction: "A energia térmica total (energia interna) depende tanto da temperatura quanto da massa (quantidade de moléculas). Um corpo gigante morno pode armazenar muito mais energia interna que um minúsculo objeto incandescente.",
        analogy: "Uma xícara de café fervendo (95°C) tem temperatura maior, mas uma piscina inteira morna (25°C) contém uma quantidade incomparavelmente maior de energia térmica total devido à sua imensa massa.",
        svgIcon: `
            <svg viewBox="0 0 100 60" width="100%" height="80">
                <!-- Xícara de Café -->
                <path d="M15,25 Q15,40 25,40 Q35,40 35,25 Z" fill="none" stroke="#ef4444" stroke-width="1.5"/>
                <path d="M35,28 C39,28 39,34 35,34" fill="none" stroke="#ef4444" stroke-width="1.5"/>
                <text x="25" y="20" font-size="5" fill="#ef4444" text-anchor="middle">Xícara (90°C)</text>
                <text x="25" y="47" font-size="5" fill="#6b7280" text-anchor="middle">Alta Temp / Pouca Energia</text>
                <!-- Piscina -->
                <rect x="55" y="22" width="35" height="18" rx="2" fill="none" stroke="#3b82f6" stroke-width="1.5"/>
                <path d="M55,30 Q72.5,33 90,30" fill="none" stroke="#3b82f6" stroke-width="1"/>
                <text x="72.5" y="18" font-size="5" fill="#3b82f6" text-anchor="middle">Piscina (25°C)</text>
                <text x="72.5" y="47" font-size="5" fill="#6b7280" text-anchor="middle">Baixa Temp / Muita Energia</text>
            </svg>`
    },
    {
        title: "O que é Entropia?",
        myth: "Entropia é apenas o grau de 'bagunça' ou sujeira física de um sistema.",
        correction: "Cientificamente, a entropia mede a dispersão de energia por temperatura e a multiplicidade de microestados microscópicos correspondentes a um mesmo estado macroscópico. É uma medida de probabilidade de configurações de energia.",
        analogy: "Uma pilha de baralho ordenada tem apenas 1 configuração perfeita (Entropia mínima). Um baralho embaralhado tem $8 \times 10^{67}$ configurações possíveis visualmente desordenadas (Entropia máxima).",
        svgIcon: `
            <svg viewBox="0 0 100 60" width="100%" height="80">
                <!-- Organizado -->
                <circle cx="20" cy="22" r="1.5" fill="#00f2fe"/>
                <circle cx="25" cy="22" r="1.5" fill="#00f2fe"/>
                <circle cx="30" cy="22" r="1.5" fill="#00f2fe"/>
                <circle cx="20" cy="27" r="1.5" fill="#00f2fe"/>
                <circle cx="25" cy="27" r="1.5" fill="#00f2fe"/>
                <circle cx="30" cy="27" r="1.5" fill="#00f2fe"/>
                <text x="25" y="40" font-size="5" fill="#00f2fe" text-anchor="middle">Baixa Entropia</text>
                <text x="25" y="46" font-size="4" fill="#6b7280" text-anchor="middle">1 Microestado</text>
                <!-- Disperso -->
                <circle cx="62" cy="18" r="1.5" fill="#ef4444"/>
                <circle cx="78" cy="24" r="1.5" fill="#ef4444"/>
                <circle cx="68" cy="30" r="1.5" fill="#ef4444"/>
                <circle cx="85" cy="16" r="1.5" fill="#ef4444"/>
                <circle cx="70" cy="15" r="1.5" fill="#ef4444"/>
                <circle cx="82" cy="32" r="1.5" fill="#ef4444"/>
                <text x="73.5" y="40" font-size="5" fill="#ef4444" text-anchor="middle">Alta Entropia</text>
                <text x="73.5" y="46" font-size="4" fill="#6b7280" text-anchor="middle">Múltiplos Microestados</text>
            </svg>`
    },
    {
        title: "Ordem Local vs Segunda Lei",
        myth: "O surgimento de ordem em sistemas biológicos ou em uma geladeira viola a Segunda Lei da Termodinâmica.",
        correction: "A Segunda Lei exige que a entropia TOTAL do Universo aumente. É perfeitamente possível diminuir a entropia local (gerando ordem), desde que haja realização de trabalho que cause um aumento ainda maior na entropia dos arredores.",
        analogy: "Uma geladeira esfria os alimentos dentro dela (reduz entropia local) ao custo de gastar energia elétrica e liberar ar quente pelas grades traseiras (aumentando a entropia do cômodo).",
        svgIcon: `
            <svg viewBox="0 0 100 60" width="100%" height="80">
                <!-- Geladeira -->
                <rect x="35" y="12" width="30" height="36" rx="2" fill="none" stroke="#9ca3af" stroke-width="2"/>
                <!-- Interior Frio -->
                <rect x="38" y="15" width="24" height="30" fill="rgba(59, 130, 246, 0.1)" stroke="none"/>
                <text x="47" y="30" font-size="4" fill="#3b82f6" text-anchor="middle">Ordem (S↓)</text>
                <!-- Dissipador Quente -->
                <path d="M 68 20 Q 72 23 68 26 Q 72 29 68 32" fill="none" stroke="#ef4444" stroke-width="1"/>
                <text x="80" y="28" font-size="4" fill="#ef4444" text-anchor="middle">Calor (S↑↑)</text>
                <text x="50" y="53" font-size="5" fill="#10b981" text-anchor="middle">Variação Líquida: ΔS_total > 0</text>
            </svg>`
    },
    {
        title: "Equilíbrio vs Regime Permanente",
        myth: "Equilíbrio Térmico é a mesma coisa que um sistema operando em Regime Permanente (ou estacionário).",
        correction: "Equilíbrio térmico é um estado estático sem fluxos ou trocas líquidas de calor e com temperatura uniforme. O Regime Permanente possui fluxo de calor ativo e contínuo, mas com taxas de fluxo constantes no tempo.",
        analogy: "Uma barra com uma ponta presa no fogo e outra no gelo atinge regime estacionário (temperaturas fixas em cada ponto da barra), mas não está em equilíbrio pois o calor flui continuamente.",
        svgIcon: `
            <svg viewBox="0 0 100 60" width="100%" height="80">
                <!-- Regime Permanente -->
                <rect x="25" y="20" width="50" height="8" fill="none" stroke="#9ca3af" stroke-width="1.5"/>
                <!-- Fogo esq -->
                <circle cx="15" cy="24" r="4" fill="#ef4444"/>
                <text x="15" y="16" font-size="4" fill="#ef4444" text-anchor="middle">100°C</text>
                <!-- Gelo dir -->
                <rect x="80" y="20" width="8" height="8" fill="#3b82f6"/>
                <text x="84" y="16" font-size="4" fill="#3b82f6" text-anchor="middle">0°C</text>
                <!-- Seta de fluxo permanente -->
                <path d="M 28 24 L 72 24" stroke="#f97316" stroke-width="1.5" stroke-dasharray="3 3"/>
                <text x="50" y="35" font-size="5" fill="#f97316" text-anchor="middle">Fluxo de calor constante (Não é Equilíbrio!)</text>
            </svg>`
    },
    {
        title: "Trabalho e Calor Armazenados",
        myth: "Um gás sob pressão armazena calor e trabalho dentro dele de forma acumulada.",
        correction: "Gases armazenam apenas energia interna (U). Trabalho (W) e Calor (Q) são formas de energia de processo (energia em trânsito) e só existem durante transformações físicas.",
        analogy: "Calor e trabalho são como saques e depósitos bancários; a energia interna é o saldo em conta corrente. Você acumula saldo, mas não 'acumula depósitos'.",
        svgIcon: `
            <svg viewBox="0 0 100 60" width="100%" height="80">
                <!-- Cilindro -->
                <rect x="30" y="15" width="40" height="30" rx="3" fill="none" stroke="#9ca3af" stroke-width="2"/>
                <text x="50" y="28" font-size="6" fill="#00f2fe" text-anchor="middle" font-weight="bold">U (Armazenado)</text>
                <!-- Seta Calor -->
                <path d="M 15 20 L 27 20" stroke="#f97316" stroke-width="1.5" marker-end="url(#arrow-q)"/>
                <text x="12" y="30" font-size="5" fill="#f97316" text-anchor="middle">Q (Em trânsito)</text>
                <!-- Seta Trabalho -->
                <path d="M 50 48 L 50 38" stroke="#10b981" stroke-width="1.5" marker-end="url(#arrow-w)"/>
                <text x="50" y="54" font-size="5" fill="#10b981" text-anchor="middle">W (Em trânsito)</text>
            </svg>`
    },
    {
        title: "P, V, T não contam tudo",
        myth: "Podemos descrever perfeitamente o estado energético de qualquer sistema termodinâmico conhecendo apenas Pressão, Volume e Temperatura.",
        correction: "Variáveis mecânicas e térmicas clássicas (P, V, T) não bastam para descrever o estado de sistemas complexos (químicos ou magnéticos). É essencial integrar funções termodinâmicas como Entropia (S), Energia Interna (U) ou Entalpia (H).",
        analogy: "Conhecer a velocidade e o combustível do carro não diz quem está dirigindo ou para onde o carro está indo. Precisamos de coordenadas extras de estado.",
        svgIcon: `
            <svg viewBox="0 0 100 60" width="100%" height="80">
                <!-- Coordenadas clássicas -->
                <rect x="15" y="15" width="30" height="25" rx="3" fill="none" stroke="#9ca3af" stroke-width="1.5"/>
                <text x="30" y="24" font-size="5" fill="#9ca3af" text-anchor="middle">P, V, T</text>
                <text x="30" y="32" font-size="4" fill="#6b7280" text-anchor="middle">Mecânico / Térmico</text>
                <!-- Somados a energia de estado -->
                <text x="50" y="28" font-size="6" fill="#f3f4f6" text-anchor="middle">+</text>
                <rect x="55" y="15" width="30" height="25" rx="3" fill="none" stroke="#00f2fe" stroke-width="1.5"/>
                <text x="70" y="24" font-size="5" fill="#00f2fe" text-anchor="middle">U, S, H</text>
                <text x="70" y="32" font-size="4" fill="#6b7280" text-anchor="middle">Energético / Químico</text>
            </svg>`
    },
    {
        title: "O que ocorre a 0 Kelvin?",
        myth: "No zero absoluto (0 Kelvin), todos os átomos e partículas do universo simplesmente param de se mover de forma absoluta.",
        correction: "De acordo com a mecânica quântica, a energia cinética não pode ser exatamente zero. Existe a Energia de Ponto Zero, uma flutuação residual mínima intrínseca que impede o repouso mecânico absoluto devido ao princípio da incerteza.",
        analogy: "A 0 K, as partículas não estão mortas e estáticas; elas apenas atingem o estado fundamental de energia mais baixa fisicamente possível, oscilando de forma fria no limite quântico.",
        svgIcon: `
            <svg viewBox="0 0 100 60" width="100%" height="80">
                <!-- Jitter Frio -->
                <circle cx="30" cy="30" r="3" fill="#00f2fe"/>
                <path d="M 23 27 Q 27 25 30 27" fill="none" stroke="#3b82f6" stroke-width="1"/>
                <path d="M 30 33 Q 33 35 37 33" fill="none" stroke="#3b82f6" stroke-width="1"/>
                <text x="30" y="18" font-size="5" fill="#00f2fe" text-anchor="middle">Vibração Quântica Residual</text>
                <text x="70" y="31" font-size="5" fill="#6b7280" text-anchor="middle">E_zero > 0</text>
            </svg>`
    },
    {
        title: "Área no Gráfico P-V",
        myth: "A área sob o gráfico Pressão-Volume (P-V) é apenas um artifício geométrico decorativo sem valor real.",
        correction: "A área sob a curva em um diagrama P-V é matematicamente idêntica à integral do trabalho mecânico realizado pelo gás: $W = \\int P dV$. Ela mede exatamente a quantidade de energia útil convertida em movimento.",
        analogy: "É como calcular a distância percorrida por um carro integrando o gráfico de velocidade versus tempo. A área do desenho é a grandeza física real.",
        svgIcon: `
            <svg viewBox="0 0 100 60" width="100%" height="80">
                <!-- Eixos -->
                <line x1="20" y1="10" x2="20" y2="45" stroke="#9ca3af" stroke-width="1.5"/>
                <line x1="20" y1="45" x2="80" y2="45" stroke="#9ca3af" stroke-width="1.5"/>
                <!-- Curva -->
                <path d="M 28 15 Q 45 25 72 40" fill="none" stroke="#ef4444" stroke-width="2"/>
                <!-- Área sombreada -->
                <path d="M 28 15 Q 45 25 72 40 L 72 45 L 28 45 Z" fill="rgba(0, 242, 254, 0.15)" stroke="none"/>
                <text x="50" y="35" font-size="6" fill="#00f2fe" text-anchor="middle" font-weight="bold">Área = Trabalho (W)</text>
            </svg>`
    },
    {
        title: "Significado de Irreversível",
        myth: "Um processo termodinâmico ser irreversível significa que é impossível fazer o sistema retornar às suas condições originais.",
        correction: "Significa apenas que o sistema não retornará ao estado inicial de forma espontânea (natural). É possível reverter qualquer estado desde que realizemos trabalho externo sobre o sistema (o que causará aumento de entropia externa).",
        analogy: "Você pode derreter o gelo (derretimento espontâneo no calor) e recongelá-lo (não espontâneo), mas para fazer o congelador funcionar você teve que gastar energia elétrica externa.",
        svgIcon: `
            <svg viewBox="0 0 100 60" width="100%" height="80">
                <!-- Espontaneo -->
                <path d="M 20 20 L 40 20" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-esp)"/>
                <text x="30" y="14" font-size="4.5" fill="#ef4444" text-anchor="middle">Espontâneo (Livre)</text>
                <!-- Trabalho reverso -->
                <path d="M 40 35 L 20 35" stroke="#10b981" stroke-width="1.5" marker-dasharray="2 2" marker-end="url(#arrow-rev)"/>
                <text x="30" y="44" font-size="4.5" fill="#10b981" text-anchor="middle">Não-Espontâneo (+ Trabalho)</text>
            </svg>`
    }
];

class MisconceptionsCarousel {
    constructor() {
        this.container = null;
        this.currentIndex = 0;
    }

    init(containerElement) {
        this.container = containerElement;
        this.currentIndex = 0;
        this.render();
    }

    render() {
        if (!this.container) return;

        const data = MYTHS_DATA[this.currentIndex];

        this.container.innerHTML = `
            <div class="carousel-card-container">
                <div class="carousel-header">
                    <h3>Mitos & Contraintuições</h3>
                    <span class="slide-indicator">${this.currentIndex + 1} / ${MYTHS_DATA.length}</span>
                </div>

                <div class="carousel-main-panel glass-panel">
                    <button class="carousel-nav-btn prev-btn" id="carousel-prev" aria-label="Anterior">‹</button>
                    
                    <div class="carousel-slide-content">
                        <!-- Topo: Título e Gráfico de Suporte -->
                        <div class="slide-visual-row">
                            <div class="slide-title-area">
                                <h4>${data.title}</h4>
                            </div>
                            <div class="slide-svg-container">
                                ${data.svgIcon}
                            </div>
                        </div>

                        <!-- Meio: Comparação Lado a Lado -->
                        <div class="slide-comparison-grid">
                            <div class="comparison-card myth-card">
                                <span class="badge badge-myth">Crença Comum</span>
                                <p>${data.myth}</p>
                            </div>
                            <div class="comparison-card truth-card">
                                <span class="badge badge-truth">Física Real</span>
                                <p>${data.correction}</p>
                            </div>
                        </div>

                        <!-- Base: Analogia Intuitiva -->
                        <div class="analogy-footer-card">
                            <span class="card-title" style="color: var(--primary);">Analogia Didática</span>
                            <p>${data.analogy}</p>
                        </div>
                    </div>

                    <button class="carousel-nav-btn next-btn" id="carousel-next" aria-label="Próximo">›</button>
                </div>

                <!-- Dots de Navegação -->
                <div class="carousel-dots-row">
                    ${MYTHS_DATA.map((_, idx) => `
                        <button class="dot-btn ${idx === this.currentIndex ? 'active' : ''}" data-index="${idx}" aria-label="Ir para slide ${idx+1}"></button>
                    `).join('')}
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const prevBtn = this.container.querySelector("#carousel-prev");
        const nextBtn = this.container.querySelector("#carousel-next");
        const dotButtons = this.container.querySelectorAll(".dot-btn");

        prevBtn.addEventListener("click", () => {
            this.currentIndex = (this.currentIndex - 1 + MYTHS_DATA.length) % MYTHS_DATA.length;
            this.render();
        });

        nextBtn.addEventListener("click", () => {
            this.currentIndex = (this.currentIndex + 1) % MYTHS_DATA.length;
            this.render();
        });

        dotButtons.forEach(dot => {
            dot.addEventListener("click", (e) => {
                const idx = parseInt(e.target.getAttribute("data-index"));
                this.currentIndex = idx;
                this.render();
            });
        });

        // Suporte a swipe de toque básico
        let startX = 0;
        const mainPanel = this.container.querySelector(".carousel-main-panel");
        
        mainPanel.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        mainPanel.addEventListener("touchend", (e) => {
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            if (Math.abs(diffX) > 50) { // Sensibilidade
                if (diffX > 0) {
                    // Swipe para a esquerda -> próximo
                    this.currentIndex = (this.currentIndex + 1) % MYTHS_DATA.length;
                } else {
                    // Swipe para a direita -> anterior
                    this.currentIndex = (this.currentIndex - 1 + MYTHS_DATA.length) % MYTHS_DATA.length;
                }
                this.render();
            }
        }, { passive: true });
    }
}
