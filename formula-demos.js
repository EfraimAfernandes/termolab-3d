/* ==========================================================================
   FORMULA-DEMOS.JS - GERENCIADOR DE DEMONSTRAÇÕES DE FÓRMULAS INTERATIVAS
   ========================================================================== */

const FORMULAS_DATA = {
    0: {
        formulaHtml: '<span class="symbol-btn" data-symbol="TA">T_A</span> = <span class="symbol-btn" data-symbol="TB">T_B</span>  e  <span class="symbol-btn" data-symbol="TB">T_B</span> = <span class="symbol-btn" data-symbol="TC">T_C</span>  ⇒  <span class="symbol-btn" data-symbol="TA">T_A</span> = <span class="symbol-btn" data-symbol="TC">T_C</span>',
        title: "Transitividade Térmica",
        symbols: {
            TA: {
                name: "T_A (Temperatura do Corpo A)",
                unit: "Kelvin (K)",
                desc: "Representa o estado térmico (energia cinética média molecular) do bloco A.",
                behavior: "Ajustável pelo slider de controle de temperatura do Bloco A.",
                targetId: "slide-ta"
            },
            TB: {
                name: "T_B (Temperatura do Corpo B)",
                unit: "Kelvin (K)",
                desc: "Representa o estado térmico do bloco central B, que serve de ponte térmica.",
                behavior: "Ajustável pelo slider de controle de temperatura do Bloco B.",
                targetId: "slide-tb"
            },
            TC: {
                name: "T_C (Temperatura do Corpo C)",
                unit: "Kelvin (K)",
                desc: "Representa o estado térmico do bloco C.",
                behavior: "Ajustável pelo slider de controle de temperatura do Bloco C.",
                targetId: "slide-tc"
            }
        },
        intuition: "A Lei Zero estabelece a temperatura como uma propriedade física mensurável. Se dois sistemas independentes estão em equilíbrio com um termômetro comum, eles obrigatoriamente possuem a mesma temperatura.",
        calculationTemplate: (sim) => {
            const diffAB = Math.abs(sim.tempA - sim.tempB);
            const diffBC = Math.abs(sim.tempB - sim.tempC);
            const eqAB = diffAB < 1 ? "=" : "≠";
            const eqBC = diffBC < 1 ? "=" : "≠";
            const eqAC = Math.abs(sim.tempA - sim.tempC) < 1 ? "=" : "≠";
            return `Valores atuais:<br>
                    T_A (${Math.round(sim.tempA)} K) ${eqAB} T_B (${Math.round(sim.tempB)} K)<br>
                    T_B (${Math.round(sim.tempB)} K) ${eqBC} T_C (${Math.round(sim.tempC)} K)<br>
                    Resulta em: T_A ${eqAC} T_C`;
        }
    },
    1: {
        formulaHtml: '<span class="symbol-btn" data-symbol="dU">ΔU</span> = <span class="symbol-btn" data-symbol="Q">Q</span> - <span class="symbol-btn" data-symbol="W">W</span>',
        title: "Balanço Energético do Gás",
        symbols: {
            dU: {
                name: "ΔU (Variação da Energia Interna)",
                unit: "Joules (J)",
                desc: "Representa o ganho ou perda de energia cinética do gás. É diretamente ligada à temperatura.",
                behavior: "Sobe se o calor fornecido for maior que o trabalho realizado pelo gás.",
                targetId: "hud-l1-u"
            },
            Q: {
                name: "Q (Calor Trocado)",
                unit: "Joules (J)",
                desc: "Energia térmica que atravessa as paredes por diferença de temperatura.",
                behavior: "Positivo (+Q) ao aquecer com chamas; Negativo (-Q) ao refrigerar.",
                targetId: "slide-l1-q"
            },
            W: {
                name: "W (Trabalho Realizado pelo Gás)",
                unit: "Joules (J)",
                desc: "Energia convertida em movimento mecânico. Força exercida pelo gás multiplicada pelo deslocamento do pistão.",
                behavior: "Positivo (+W) na expansão (empurra o pistão); Negativo (-W) na compressão (trabalho feito SOBRE o gás).",
                targetId: "slide-l1-v"
            }
        },
        intuition: "A energia total é conservada. O calor inserido no cilindro deve ir para algum lugar: ou agita as esferas de gás (aumentando a temperatura e U) ou empurra o pistão fisicamente realizando trabalho mecânico.",
        calculationTemplate: (sim) => {
            const du = Math.round(sim.U - 150);
            const q = Math.round(sim.Q);
            const w = Math.round(sim.W);
            return `Valores atuais:<br>
                    ΔU (${du} J) = Q (${q} J) - W (${w} J)<br>
                    Balanço: ${q} - (${w}) = ${q - w} J ${du === q - w ? "(Conservado!)" : ""}`;
        }
    },
    2: {
        formulaHtml: '<span class="symbol-btn" data-symbol="dS">ΔS_universo</span> ≥ 0',
        title: "Princípio do Aumento de Entropia",
        symbols: {
            dS: {
                name: "ΔS (Variação de Entropia)",
                unit: "J/K (Joules por Kelvin)",
                desc: "Mede o grau de dispersão da energia ou a quantidade de microestados equivalentes de organização.",
                behavior: "Sempre aumenta (ΔS > 0) em transformações espontâneas irreversíveis (difusão, mistura). É nula (ΔS = 0) em processos ideais reversíveis.",
                targetId: "btn-toggle-barrier"
            }
        },
        intuition: "Processos espontâneos ocorrem em direção à maior probabilidade estatística. Misturar dois gases é o caminho estatisticamente natural. Desmisturar espontaneamente exigiria que todas as colisões fortuitas guiassem as esferas de volta aos seus lados, o que é estatisticamente impossível.",
        calculationTemplate: (sim) => {
            const s = sim.entropy.toFixed(2);
            return `Valores atuais:<br>
                    Entropia Atual (S): ${s} J/K<br>
                    Estado: ${sim.barrierRemoved ? "Processo irreversível de difusão ativa" : "Restrição de ordenação física ativa"}`;
        }
    },
    3: {
        formulaHtml: '<span class="symbol-btn" data-symbol="S">S</span> → <span class="symbol-btn" data-symbol="S0">S_0</span> quando <span class="symbol-btn" data-symbol="T">T</span> → <span class="symbol-btn" data-symbol="zero">0 K</span>',
        title: "Limite de Terceira Lei",
        symbols: {
            S: {
                name: "S (Entropia do Cristal)",
                unit: "J/K",
                desc: "Desordem molecular vibracional da rede sólida.",
                behavior: "Aproxima-se do valor mínimo constante à medida que o calor é removido.",
                targetId: "hud-l3-entropy"
            },
            S0: {
                name: "S_0 (Entropia Residual Mínima)",
                unit: "J/K (Tipicamente Zero)",
                desc: "Entropia de um cristal perfeito no zero absoluto, onde há apenas uma única configuração molecular possível (estado fundamental).",
                behavior: "Constante fundamental.",
                targetId: "hud-l3-state"
            },
            T: {
                name: "T (Temperatura Absoluta)",
                unit: "Kelvin (K)",
                desc: "Nível de agitação vibracional média da rede de átomos.",
                behavior: "Ajustável pelo slider de resfriamento criogênico.",
                targetId: "slide-l3-temp"
            },
            zero: {
                name: "0 K (Zero Absoluto)",
                unit: "Kelvin (-273,15 °C)",
                desc: "Estado físico limite onde a energia térmica do sistema é mínima.",
                behavior: "Inalcançável exatamente por processos finitos.",
                targetId: "btn-force-zero"
            }
        },
        intuition: "Reduzir a temperatura diminui as vibrações. Próximo do zero absoluto, a entropia residual tende a um mínimo. Contudo, cada ciclo criogênico remove calor com menor eficiência, transformando a busca pelo 0 K em uma progressão assintótica infinita.",
        calculationTemplate: (sim) => {
            return `Valores atuais:<br>
                    T = ${sim.temperature.toFixed(3)} K<br>
                    S = ${sim.entropy.toFixed(3)} J/K<br>
                    Vibração cristalina: ${(sim.temperature / 3).toFixed(1)}%`;
        }
    },
    4: {
        formulaHtml: '<span class="symbol-btn" data-symbol="H">H</span> = <span class="symbol-btn" data-symbol="U">U</span> + <span class="symbol-btn" data-symbol="P">p</span><span class="symbol-btn" data-symbol="V">V</span>',
        title: "Cálculo de Entalpia",
        symbols: {
            H: {
                name: "H (Entalpia)",
                unit: "Joules (J)",
                desc: "Energia total disponível de um sistema térmico. Engloba a energia interna somada à energia necessária para abrir espaço contra a pressão circundante.",
                behavior: "Calculada dinamicamente.",
                targetId: "hud-l4-h"
            },
            U: {
                name: "U (Energia Interna)",
                unit: "Joules (J)",
                desc: "Agitação cinética das moléculas internas do gás.",
                behavior: "Determinada pelo nível de temperatura ativa do gás.",
                targetId: "hud-l4-u"
            },
            P: {
                name: "p (Pressão do Sistema)",
                unit: "atm (atmosferas)",
                desc: "Força de colisão das partículas por unidade de área da parede do cilindro.",
                behavior: "Ajustada dinamicamente baseado no volume e processo selecionado.",
                targetId: "hud-l4-p"
            },
            V: {
                name: "V (Volume do Gás)",
                unit: "Litros (L)",
                desc: "Espaço físico ocupado pelo gás sob o pistão.",
                behavior: "Ajustado pela posição mecânica do pistão.",
                targetId: "hud-l4-v"
            }
        },
        intuition: "A entalpia é uma função de estado útil para transformações ocorrendo sob pressão constante (isobáricas). Ela quantifica não só a energia contida no sistema, mas também a energia de empuxo mecânico gasta ao empurrar o ar exterior para caber seu volume.",
        calculationTemplate: (sim) => {
            const h = Math.round(sim.enthalpy);
            const u = Math.round(sim.internalEnergy);
            const pv = Math.round(sim.pressure * sim.volume * 50);
            return `Valores atuais:<br>
                    H (${h} J) = U (${u} J) + pV (${pv} J)<br>
                    Soma: ${u} + ${pv} = ${u + pv} J ${h === u + pv ? "(Equacionado!)" : ""}`;
        }
    }
};

class FormulaDemosManager {
    constructor() {
        this.container = null;
    }

    init(containerElement) {
        this.container = containerElement;
        this.render();
    }

    render() {
        if (!this.container) return;

        const lawIndex = activeLaw;
        const data = FORMULAS_DATA[lawIndex];
        
        if (!data) {
            this.container.innerHTML = `<p class="law-definition-text">Módulo sem equações interativas disponíveis nesta versão.</p>`;
            return;
        }

        this.container.innerHTML = `
            <div class="formula-demo-card">
                <span class="card-title">${data.title}</span>
                <div class="interactive-formula-box">
                    ${data.formulaHtml}
                </div>
                <p class="text-xs text-muted text-center" style="margin-top:-6px; margin-bottom:12px;">Passe o mouse ou clique nos termos para explorar a intuição física</p>
                
                <!-- Caixa de Explicação do Símbolo Selecionado -->
                <div id="symbol-detail-box" class="card-detail hidden" style="border-color: var(--primary);">
                    <span class="card-title" id="detail-symbol-name" style="color: var(--primary);">Termo</span>
                    <p class="text-xs" style="margin-bottom:6px;"><strong>Unidade:</strong> <span id="detail-symbol-unit">J</span></p>
                    <p class="text-xs" id="detail-symbol-desc">Descrição do termo físico...</p>
                    <p class="text-xs text-muted" style="margin-top:6px; font-style:italic;" id="detail-symbol-behavior">Comportamento...</p>
                </div>

                <!-- Painel de Insight: Porquês -->
                <div class="card-detail">
                    <span class="card-title">Por que essa fórmula faz sentido?</span>
                    <p class="text-xs" style="line-height:1.4;">${data.intuition}</p>
                </div>

                <!-- Cálculo Real-Time -->
                <div class="card-detail" style="background: rgba(0,0,0,0.15);">
                    <span class="card-title">Cálculo em Tempo Real</span>
                    <code class="text-xs" id="formula-live-calc" style="font-family: var(--font-mono); color: var(--primary); display:block; line-height:1.4;">Calculando...</code>
                </div>
            </div>
        `;

        this.bindEvents(data);
        this.updateLiveCalculations();
    }

    bindEvents(data) {
        const symbolButtons = this.container.querySelectorAll(".symbol-btn");
        const detailBox = this.container.querySelector("#symbol-detail-box");
        
        const nameEl = this.container.querySelector("#detail-symbol-name");
        const unitEl = this.container.querySelector("#detail-symbol-unit");
        const descEl = this.container.querySelector("#detail-symbol-desc");
        const behavEl = this.container.querySelector("#detail-symbol-behavior");

        symbolButtons.forEach(btn => {
            const symKey = btn.getAttribute("data-symbol");
            const symData = data.symbols[symKey];

            if (!symData) return;

            // Hover: exibe sutilmente a informação rápida
            btn.addEventListener("mouseenter", () => {
                btn.style.backgroundColor = "rgba(0, 242, 254, 0.15)";
                btn.style.color = "var(--primary)";
            });

            btn.addEventListener("mouseleave", () => {
                btn.style.backgroundColor = "";
                btn.style.color = "";
            });

            // Clique: exibe detalhes completos e pisca o controle na tela
            btn.addEventListener("click", () => {
                // Preencher dados do símbolo
                nameEl.textContent = symData.name;
                unitEl.textContent = symData.unit;
                descEl.textContent = symData.desc;
                behavEl.textContent = symData.behavior;

                detailBox.classList.remove("hidden");

                // Efeito visual de destaque no elemento correspondente
                const targetElement = document.getElementById(symData.targetId);
                if (targetElement) {
                    // Adicionar classe de animação pulsante temporária
                    targetElement.classList.add("neon-highlight-flash");
                    targetElement.scrollIntoView({ behavior: "smooth", block: "center" });

                    // Remover classe de animação após 2 segundos
                    setTimeout(() => {
                        targetElement.classList.remove("neon-highlight-flash");
                    }, 2000);
                }
            });
        });
    }

    updateLiveCalculations() {
        // Guard: o container só existe após a aba de fórmulas ser aberta
        if (!this.container || !currentModule) return;
        const calcEl = this.container.querySelector("#formula-live-calc");
        if (!calcEl) return;

        const data = FORMULAS_DATA[activeLaw];
        if (data && typeof data.calculationTemplate === "function") {
            calcEl.innerHTML = data.calculationTemplate(currentModule);
        }
    }
}
