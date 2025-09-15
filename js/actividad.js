// script.js
class IncidentClassifier {
    constructor() {
        this.currentChannel = 'app';
        this.isProcessing = false;
        this.initializeEventListeners();
        this.updateDisplays();
    }

    initializeEventListeners() {
        // Control de hora
        const hourSlider = document.getElementById('hour');
        hourSlider.addEventListener('input', () => this.updateDisplays());

        // Control de historial
        const historySlider = document.getElementById('history');
        historySlider.addEventListener('input', () => this.updateDisplays());

        // Botones de canal
        const channelButtons = document.querySelectorAll('.channel-btn');
        channelButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.selectChannel(e.target.dataset.channel));
        });

        // Botón de clasificación
        const classifyBtn = document.getElementById('classify-btn');
        classifyBtn.addEventListener('click', () => this.classifyIncident());

        // Ejemplos rápidos
        const examples = document.querySelectorAll('.example-item');
        examples.forEach(item => {
            item.addEventListener('click', (e) => this.loadExample(e.currentTarget.dataset.example));
        });

        // Auto-clasificación al escribir
        const description = document.getElementById('description');
        description.addEventListener('input', () => {
            if (description.value.length > 3) {
                setTimeout(() => this.classifyIncident(), 500);
            }
        });
    }

    updateDisplays() {
        // Actualizar hora
        const hour = document.getElementById('hour').value;
        document.getElementById('hour-display').textContent = `${hour}:00`;

        // Actualizar historial
        const history = document.getElementById('history').value;
        document.getElementById('history-display').textContent = history;
    }

    selectChannel(channel) {
        this.currentChannel = channel;
        
        // Actualizar botones
        document.querySelectorAll('.channel-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-channel="${channel}"]`).classList.add('active');
    }

    loadExample(exampleText) {
        document.getElementById('description').value = exampleText;
        this.classifyIncident();
    }

    async classifyIncident() {
        if (this.isProcessing) return;

        const description = document.getElementById('description').value.trim();
        if (description.length < 3) {
            this.showWaitingState();
            return;
        }

        this.isProcessing = true;
        this.showProcessing();

        // Simular procesamiento de RNA
        await this.delay(1200);

        const incidentData = this.gatherIncidentData();
        const result = this.runNeuralNetwork(incidentData);
        
        this.showResult(result);
        this.isProcessing = false;
    }

    gatherIncidentData() {
        return {
            description: document.getElementById('description').value.toLowerCase(),
            location: document.getElementById('location').value,
            hour: parseInt(document.getElementById('hour').value),
            channel: this.currentChannel,
            history: parseInt(document.getElementById('history').value)
        };
    }

    runNeuralNetwork(data) {
        // Simulación del algoritmo de clasificación de RNA
        let score = 0;
        const { description, location, hour, channel, history } = data;

        // Análisis de contenido textual (simula embeddings/TF-IDF)
        const highPriorityKeywords = [
            'poste', 'cable', 'fuga', 'gas', 'accidente', 'incendio', 
            'eléctrico', 'caído', 'chispea', 'corte', 'explosión', 'fuego'
        ];
        
        const mediumPriorityKeywords = [
            'luminaria', 'semáforo', 'bache', 'rota', 'intermitente', 
            'agua', 'desagüe', 'tráfico', 'señal'
        ];
        
        const lowPriorityKeywords = [
            'limpieza', 'poda', 'grafiti', 'solicitud', 'mantenimiento',
            'basura', 'vereda', 'pintura', 'césped'
        ];

        // Ponderación por contenido (40% del score)
        const highMatches = highPriorityKeywords.filter(word => description.includes(word)).length;
        const mediumMatches = mediumPriorityKeywords.filter(word => description.includes(word)).length;
        const lowMatches = lowPriorityKeywords.filter(word => description.includes(word)).length;

        if (highMatches > 0) {
            score += 40 + (highMatches * 5);
        } else if (mediumMatches > 0) {
            score += 25 + (mediumMatches * 3);
        } else if (lowMatches > 0) {
            score += 10 + (lowMatches * 2);
        } else {
            score += 20; // Score base para descripciones sin palabras clave específicas
        }

        // Factores contextuales (30% del score)
        
        // Ubicación (las zonas centrales tienen más peso)
        if (location === 'centro') score += 12;
        else if (location === 'barrio-norte') score += 8;
        else score += 5;

        // Hora (horarios pico tienen más impacto)
        if (hour >= 7 && hour <= 9) score += 10; // Mañana
        else if (hour >= 17 && hour <= 20) score += 10; // Tarde
        else if (hour >= 6 && hour <= 22) score += 5; // Día
        else score += 2; // Noche

        // Canal (teléfono indica mayor urgencia percibida)
        if (channel === 'telefono') score += 8;
        else if (channel === 'app') score += 5;
        else score += 3; // web

        // Historial de la zona (20% del score)
        if (history > 10) score += 8;
        else if (history > 5) score += 5;
        else score += 2;

        // Factores de ruido aleatorio (simula incertidumbre del modelo)
        const noise = Math.random() * 6 - 3; // -3 a +3
        score += noise;

        // Determinar prioridad y confianza
        let priority, confidence;
        
        if (score >= 50) {
            priority = 'alta';
            confidence = Math.min(95, 65 + (score - 50) * 0.8);
        } else if (score >= 30) {
            priority = 'media';
            confidence = Math.min(85, 50 + (score - 30) * 1.2);
        } else {
            priority = 'baja';
            confidence = Math.min(80, 40 + score * 0.8);
        }

        // Redondear confianza
        confidence = Math.round(confidence);

        return { priority, confidence, score };
    }

    showWaitingState() {
        const container = document.getElementById('result-container');
        container.innerHTML = `
            <div class="waiting-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Ingresa una descripción para clasificar</p>
            </div>
        `;
    }

    showProcessing() {
        const container = document.getElementById('result-container');
        container.innerHTML = `
            <div class="processing">
                <div class="spinner"></div>
                <p style="color: #667eea; font-weight: 600;">Procesando con RNA...</p>
                <p style="color: #718096; font-size: 0.9rem;">Analizando contenido y contexto</p>
            </div>
        `;
    }

    showResult(result) {
        const { priority, confidence } = result;
        const container = document.getElementById('result-container');
        
        const priorityIcons = {
            'alta': 'fas fa-exclamation-triangle',
            'media': 'fas fa-clock',
            'baja': 'fas fa-check-circle'
        };

        container.innerHTML = `
            <div class="priority-result">
                <div class="priority-badge ${priority}">
                    <i class="${priorityIcons[priority]}"></i>
                    PRIORIDAD ${priority.toUpperCase()}
                </div>
                <div class="confidence-meter">
                    <div class="confidence-label">Confianza del modelo</div>
                    <div class="confidence-bar">
                        <div class="confidence-fill"></div>
                    </div>
                    <div class="confidence-value">${confidence}%</div>
                </div>
            </div>
        `;

        // Animar barra de confianza
        setTimeout(() => {
            const fillBar = container.querySelector('.confidence-fill');
            fillBar.style.width = `${confidence}%`;
        }, 100);

        // Efecto de aparición
        container.style.opacity = '0';
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transition = 'opacity 0.5s ease';
        }, 50);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const classifier = new IncidentClassifier();
    
    // Mensaje de bienvenida en consola
    console.log('🤖 Sistema de Clasificación de Incidentes iniciado');
    console.log('📊 RNA simulada con análisis de contenido y contexto');
});

// Funciones adicionales para debugging
window.debugClassifier = {
    testExample: (description) => {
        document.getElementById('description').value = description;
        document.querySelector('.classify-btn').click();
    },
    
    showModelInfo: () => {
        console.log('🧠 Información del Modelo:');
        console.log('- Entradas: descripción, ubicación, hora, canal, historial');
        console.log('- Salidas: 3 categorías (alta, media, baja prioridad)');
        console.log('- Algoritmo: análisis de keywords + factores contextuales');
        console.log('- Confianza: basada en certeza de clasificación');
    }
};