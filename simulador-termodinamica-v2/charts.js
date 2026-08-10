/* ==========================================================================
   CHARTS.JS - SISTEMA DE GRÁFICOS EM HTML5 CANVAS (SEM DEPENDÊNCIAS)
   ========================================================================== */

class RealTimeChart {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn(`Canvas com ID ${canvasId} não encontrado.`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        
        // Configurações padrão
        this.title = options.title || "";
        this.xAxisLabel = options.xAxisLabel || "";
        this.yAxisLabel = options.yAxisLabel || "";
        this.minX = options.minX !== undefined ? options.minX : 0;
        this.maxX = options.maxX !== undefined ? options.maxX : 100;
        this.minY = options.minY !== undefined ? options.minY : 0;
        this.maxY = options.maxY !== undefined ? options.maxY : 100;
        this.autoScaleY = options.autoScaleY !== undefined ? options.autoScaleY : false;
        
        // Estilos
        this.gridColor = 'rgba(255, 255, 255, 0.05)';
        this.textColor = '#6b7280';
        this.axisColor = 'rgba(255, 255, 255, 0.1)';
        
        // Histórico de dados: { seriesName: [{x, y}] }
        this.data = {};
        // Configurações de cores por série: { seriesName: colorString }
        this.colors = options.colors || {
            default: '#00f2fe'
        };
        
        // Inicializar dimensões
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height || 180;
        this.draw();
    }

    // Adiciona um ponto para uma série específica
    addDataPoint(seriesName, yVal, xVal = null) {
        if (!this.data[seriesName]) {
            this.data[seriesName] = [];
        }

        // Se x não for passado, incrementamos com base no tamanho da série
        const x = xVal !== null ? xVal : this.data[seriesName].length;
        this.data[seriesName].push({ x, y: yVal });

        // Limitar histórico para evitar consumo excessivo de memória (ex: 200 pontos)
        const maxPoints = 200;
        if (this.data[seriesName].length > maxPoints) {
            this.data[seriesName].shift();
        }

        // Ajustar escalas dinâmicas
        if (xVal !== null) {
            if (xVal > this.maxX) {
                this.maxX = xVal;
                this.minX = Math.max(0, xVal - 100); // Janela deslizante de 100 s
            }
        } else {
            this.minX = Math.max(0, this.data[seriesName].length - 100);
            this.maxX = this.data[seriesName].length;
        }

        if (this.autoScaleY) {
            this.calculateScaleY();
        }

        this.draw();
    }

    calculateScaleY() {
        let max = -Infinity;
        let min = Infinity;
        let hasData = false;

        for (const series in this.data) {
            this.data[series].forEach(pt => {
                if (pt.y > max) max = pt.y;
                if (pt.y < min) min = pt.y;
                hasData = true;
            });
        }

        if (hasData) {
            const padding = (max - min) * 0.1 || 1.0;
            this.maxY = max + padding;
            this.minY = Math.max(0, min - padding);
        }
    }

    clear() {
        this.data = {};
        this.draw();
    }

    // Desenha o gráfico completo no canvas
    draw() {
        if (!this.canvas || !this.ctx) return;
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Cores baseadas no tema ativo do HTML
        const theme = document.documentElement.getAttribute("data-theme") || "dark";
        if (theme === "light") {
            this.gridColor = 'rgba(0, 0, 0, 0.04)';
            this.textColor = '#64748b';
            this.axisColor = 'rgba(0, 0, 0, 0.08)';
        } else {
            this.gridColor = 'rgba(255, 255, 255, 0.04)';
            this.textColor = '#9ca3af';
            this.axisColor = 'rgba(255, 255, 255, 0.08)';
        }

        // Margens internas do gráfico para abrigar rótulos
        const padding = { top: 25, right: 15, bottom: 30, left: 45 };
        const graphWidth = width - padding.left - padding.right;
        const graphHeight = height - padding.top - padding.bottom;

        // Limpar tela
        ctx.clearRect(0, 0, width, height);

        // Se não houver tamanho útil, aborta
        if (graphWidth <= 0 || graphHeight <= 0) return;

        // 1. Desenhar Título Sutil
        if (this.title) {
            ctx.fillStyle = this.textColor;
            ctx.font = '500 0.7rem "Outfit", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(this.title.toUpperCase(), padding.left, padding.top - 10);
        }

        // 2. Desenhar Grade e Rótulos dos Eixos
        const gridLinesY = 4;
        const gridLinesX = 5;

        ctx.strokeStyle = this.gridColor;
        ctx.lineWidth = 1;
        ctx.fillStyle = this.textColor;
        ctx.font = '400 0.65rem "Space Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        // Linhas de Grade e Rótulos Y
        for (let i = 0; i <= gridLinesY; i++) {
            const ratio = i / gridLinesY;
            const y = padding.top + graphHeight * (1 - ratio);
            const val = this.minY + (this.maxY - this.minY) * ratio;

            // Linha
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Texto Y
            ctx.fillText(val.toFixed(1), padding.left - 8, y);
        }

        // Linhas de Grade e Rótulos X
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let i = 0; i <= gridLinesX; i++) {
            const ratio = i / gridLinesX;
            const x = padding.left + graphWidth * ratio;
            const val = this.minX + (this.maxX - this.minX) * ratio;

            // Linha vertical
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, height - padding.bottom);
            ctx.stroke();

            // Texto X
            ctx.fillText(val.toFixed(0), x, height - padding.bottom + 6);
        }

        // Eixos principais L
        ctx.strokeStyle = this.axisColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Eixo Y
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        // Eixo X
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // 3. Rótulos das Unidades nos eixos
        ctx.save();
        ctx.translate(10, padding.top + graphHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = this.textColor;
        ctx.font = '500 0.65rem "Outfit", sans-serif';
        ctx.fillText(this.yAxisLabel, 0, 0);
        ctx.restore();

        ctx.textAlign = 'center';
        ctx.font = '500 0.65rem "Outfit", sans-serif';
        ctx.fillText(this.xAxisLabel, padding.left + graphWidth / 2, height - 12);

        // 4. Desenhar as Curvas de Dados
        for (const series in this.data) {
            const points = this.data[series];
            if (points.length < 2) continue;

            const color = this.colors[series] || this.colors.default || '#00f2fe';

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            
            // Efeito de brilho neon para o tema escuro
            if (theme === 'dark') {
                ctx.shadowColor = color;
                ctx.shadowBlur = 4;
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.beginPath();

            points.forEach((pt, index) => {
                // Mapear coordenadas de dados para pixels do canvas
                const ratioX = (pt.x - this.minX) / (this.maxX - this.minX || 1.0);
                const ratioY = (pt.y - this.minY) / (this.maxY - this.minY || 1.0);

                const px = padding.left + graphWidth * ratioX;
                const py = padding.top + graphHeight * (1 - ratioY);

                if (index === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            });

            ctx.stroke();
            ctx.shadowBlur = 0; // Resetar sombra
        }
    }
}

// Classe especializada para plotar Diagramas P-V e T-S estáticos/dinâmicos de processos
class CycleDiagram {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.type = options.type || "PV"; // "PV" ou "TS"
        
        this.title = options.title || "";
        this.xAxisLabel = options.xAxisLabel || "Volume (L)";
        this.yAxisLabel = options.yAxisLabel || "Pressão (atm)";
        
        // Escalas físicas fixas para ciclos
        this.minX = options.minX || 0;
        this.maxX = options.maxX || 4.0;
        this.minY = options.minY || 0;
        this.maxY = options.maxY || 4.0;
        
        // Ponto de estado atual: {x, y}
        this.currentState = null;
        // Caminho da curva de referência: [{x, y}]
        this.referenceCurve = [];

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height || 180;
        this.draw();
    }

    setReferenceCurve(points) {
        this.referenceCurve = points;
        this.draw();
    }

    setCurrentState(x, y) {
        this.currentState = { x, y };
        this.draw();
    }

    draw() {
        if (!this.canvas || !this.ctx) return;
        
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        const theme = document.documentElement.getAttribute("data-theme") || "dark";
        const gridColor = theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)';
        const textColor = theme === 'light' ? '#64748b' : '#9ca3af';
        const axisColor = theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';

        const padding = { top: 25, right: 15, bottom: 30, left: 45 };
        const graphWidth = width - padding.left - padding.right;
        const graphHeight = height - padding.top - padding.bottom;

        ctx.clearRect(0, 0, width, height);

        if (graphWidth <= 0 || graphHeight <= 0) return;

        // 1. Título
        if (this.title) {
            ctx.fillStyle = textColor;
            ctx.font = '600 0.7rem "Outfit", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(this.title.toUpperCase(), padding.left, padding.top - 10);
        }

        // 2. Desenhar eixos e grades sutilmente
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.fillStyle = textColor;
        ctx.font = '400 0.65rem "Space Mono", monospace';
        
        // Linhas horizontais
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let i = 0; i <= 3; i++) {
            const ratio = i / 3;
            const y = padding.top + graphHeight * (1 - ratio);
            const val = this.minY + (this.maxY - this.minY) * ratio;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            ctx.fillText(val.toFixed(1), padding.left - 8, y);
        }

        // Linhas verticais
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        for (let i = 0; i <= 3; i++) {
            const ratio = i / 3;
            const x = padding.left + graphWidth * ratio;
            const val = this.minX + (this.maxX - this.minX) * ratio;
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, height - padding.bottom);
            ctx.stroke();
            ctx.fillText(val.toFixed(1), x, height - padding.bottom + 6);
        }

        // Desenhar eixos L
        ctx.strokeStyle = axisColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // Rótulo de eixos
        ctx.save();
        ctx.translate(12, padding.top + graphHeight/2);
        ctx.rotate(-Math.PI/2);
        ctx.textAlign = 'center';
        ctx.fillStyle = textColor;
        ctx.font = '500 0.65rem "Outfit", sans-serif';
        ctx.fillText(this.yAxisLabel, 0, 0);
        ctx.restore();

        ctx.textAlign = 'center';
        ctx.font = '500 0.65rem "Outfit", sans-serif';
        ctx.fillText(this.xAxisLabel, padding.left + graphWidth/2, height - 12);

        // 3. Desenhar a curva de referência
        if (this.referenceCurve.length > 1) {
            ctx.strokeStyle = theme === 'light' ? '#6366f1' : '#7f00ff';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]); // Tracejado para a curva teórica completa
            ctx.beginPath();
            
            this.referenceCurve.forEach((pt, index) => {
                const rx = (pt.x - this.minX) / (this.maxX - this.minX);
                const ry = (pt.y - this.minY) / (this.maxY - this.minY);
                const px = padding.left + graphWidth * rx;
                const py = padding.top + graphHeight * (1 - ry);
                if (index === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            });
            ctx.stroke();
            ctx.setLineDash([]); // Reset
        }

        // 4. Desenhar o ponto de estado físico atual (indicador brilhante)
        if (this.currentState) {
            const rx = (this.currentState.x - this.minX) / (this.maxX - this.minX);
            const ry = (this.currentState.y - this.minY) / (this.maxY - this.minY);
            const px = padding.left + graphWidth * rx;
            const py = padding.top + graphHeight * (1 - ry);

            // Círculo de brilho externo
            ctx.fillStyle = 'rgba(0, 242, 254, 0.2)';
            ctx.beginPath();
            ctx.arc(px, py, 8, 0, Math.PI * 2);
            ctx.fill();

            // Círculo central sólido
            ctx.fillStyle = '#00f2fe';
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();

            // Rótulo do valor do ponto de estado
            ctx.fillStyle = textColor;
            ctx.font = '600 0.6rem "Space Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`(${this.currentState.x.toFixed(2)}, ${this.currentState.y.toFixed(2)})`, px + 10, py - 4);
        }
    }
}
