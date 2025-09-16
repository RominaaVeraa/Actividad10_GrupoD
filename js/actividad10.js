
class LogisticRegressionClassifier {
    constructor(learningRate = 0.1) {
        this.learningRate = learningRate;
        this.weights = {};
        this.bias = {}; 
        this.classes = ['Alta', 'Media', 'Baja'];
        this.featureNames = [];
        this.reset();
    }
    
    reset() {
        this.classes.forEach(cls => {
            this.weights[cls] = {};
            this.bias[cls] = Math.random() * 0.01 - 0.005; 
        });
    }
    
    
    extractFeatures(texto, canal, clima, barrio) {
        const features = {};
        
        const words = texto.toLowerCase()
            .replace(/[^\w\sáéíóúñ]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);
            
        words.forEach(word => {
            features[`word_${word}`] = (features[`word_${word}`] || 0) + 1;
        });
     
        features[`canal_${canal}`] = 1;
        features[`clima_${clima}`] = 1;
        features[`barrio_${barrio}`] = 1;
        
        features[`clima_lluvia_urgente`] = clima === 'lluvia' ? 1 : 0;
        features[`telefono_urgente`] = canal === 'telefono' ? 1 : 0;
        
        return features;
    }
    
    softmax(scores) {
        const maxScore = Math.max(...Object.values(scores));
        const expScores = {};
        let sumExp = 0;
        
        this.classes.forEach(cls => {
            expScores[cls] = Math.exp(scores[cls] - maxScore);
            sumExp += expScores[cls];
        });
        
        const probabilities = {};
        this.classes.forEach(cls => {
            probabilities[cls] = expScores[cls] / sumExp;
        });
        
        return probabilities;
    }
    
    predict(features) {
        const scores = {};
        
        this.classes.forEach(cls => {
            scores[cls] = this.bias[cls];
            
            Object.keys(features).forEach(feature => {
                if (this.weights[cls][feature]) {
                    scores[cls] += this.weights[cls][feature] * features[feature];
                }
            });
        });
        
        const probabilities = this.softmax(scores);
        let maxProb = 0;
        let prediction = this.classes[0];
        
        this.classes.forEach(cls => {
            if (probabilities[cls] > maxProb) {
                maxProb = probabilities[cls];
                prediction = cls;
            }
        });
        
        return { prediction, probabilities, maxProb };
    }
    
    trainStep(features, trueLabel) {
        Object.keys(features).forEach(feature => {
            if (!this.featureNames.includes(feature)) {
                this.featureNames.push(feature);
                this.classes.forEach(cls => {
                    this.weights[cls][feature] = Math.random() * 0.02 - 0.01;
                });
            }
        });
        
        const result = this.predict(features);
        const probabilities = result.probabilities;
        
        const loss = -Math.log(probabilities[trueLabel] + 1e-15);
        
        this.classes.forEach(cls => {
            const target = cls === trueLabel ? 1 : 0;
            const error = probabilities[cls] - target;
            
            this.bias[cls] -= this.learningRate * error;
            
            Object.keys(features).forEach(feature => {
                const gradient = error * features[feature];
                this.weights[cls][feature] -= this.learningRate * gradient;
            });
        });
        
        return {
            prediction: result.prediction,
            probabilities: probabilities,
            loss: loss,
            correct: result.prediction === trueLabel
        };
    }
}

const trainingData = [
    // ALTA PRIORIDAD
    {texto: "fuga de gas fuerte cerca de escuela", canal: "telefono", clima: "despejado", barrio: "Centro", prioridad: "Alta"},
    {texto: "cables eléctricos caídos en vereda", canal: "app", clima: "lluvia", barrio: "Norte", prioridad: "Alta"},
    {texto: "poste a punto de caer riesgo eléctrico", canal: "telefono", clima: "nublado", barrio: "Sur", prioridad: "Alta"},
    {texto: "incendio de pastizales humo intenso", canal: "web", clima: "despejado", barrio: "Este", prioridad: "Alta"},
    {texto: "choque con heridos obstrucción total", canal: "telefono", clima: "lluvia", barrio: "Centro", prioridad: "Alta"},
    {texto: "explosión pequeña olor a gas", canal: "app", clima: "despejado", barrio: "Oeste", prioridad: "Alta"},
    {texto: "árbol caído bloqueando avenida principal", canal: "telefono", clima: "lluvia", barrio: "Norte", prioridad: "Alta"},
    {texto: "corte de luz total en hospital", canal: "telefono", clima: "nublado", barrio: "Centro", prioridad: "Alta"},
    {texto: "semáforo roto causa accidentes", canal: "app", clima: "despejado", barrio: "Sur", prioridad: "Alta"},
    {texto: "inundación bloquea acceso ambulancias", canal: "telefono", clima: "lluvia", barrio: "Este", prioridad: "Alta"},
    
    // MEDIA PRIORIDAD  
    {texto: "alumbrado público apagado en varias cuadras", canal: "web", clima: "nublado", barrio: "Norte", prioridad: "Media"},
    {texto: "semáforo intermitente en cruce principal", canal: "app", clima: "despejado", barrio: "Centro", prioridad: "Media"},
    {texto: "recolección de residuos demorada", canal: "web", clima: "despejado", barrio: "Sur", prioridad: "Media"},
    {texto: "tapas de alcantarilla flojas sin caerse", canal: "app", clima: "nublado", barrio: "Este", prioridad: "Media"},
    {texto: "ruidos molestos nocturnos en la cuadra", canal: "web", clima: "despejado", barrio: "Oeste", prioridad: "Media"},
    {texto: "cartel caído obstruyendo paso peatonal", canal: "app", clima: "lluvia", barrio: "Norte", prioridad: "Media"},
    {texto: "pozo mediano dificulta el paso", canal: "web", clima: "nublado", barrio: "Centro", prioridad: "Media"},
    {texto: "basura acumulada varios días", canal: "app", clima: "despejado", barrio: "Sur", prioridad: "Media"},
    {texto: "señal de tránsito tapada por ramas", canal: "web", clima: "nublado", barrio: "Este", prioridad: "Media"},
    {texto: "cordón roto dificulta drenaje", canal: "app", clima: "lluvia", barrio: "Oeste", prioridad: "Media"},
    
    // BAJA PRIORIDAD
    {texto: "bache pequeño en calle secundaria", canal: "app", clima: "despejado", barrio: "Sur", prioridad: "Baja"},
    {texto: "pintura de senda peatonal desgastada", canal: "web", clima: "nublado", barrio: "Este", prioridad: "Baja"},
    {texto: "baldosa floja sin riesgo inmediato", canal: "app", clima: "despejado", barrio: "Oeste", prioridad: "Baja"},
    {texto: "ramas pequeñas en vereda", canal: "web", clima: "despejado", barrio: "Norte", prioridad: "Baja"},
    {texto: "farol con luz tenue funciona a veces", canal: "app", clima: "nublado", barrio: "Centro", prioridad: "Baja"},
    {texto: "señalización borrosa solicita repintado", canal: "web", clima: "despejado", barrio: "Sur", prioridad: "Baja"},
    {texto: "papelera rota requiere mantenimiento", canal: "app", clima: "nublado", barrio: "Este", prioridad: "Baja"},
    {texto: "grafiti en pared necesita limpieza", canal: "web", clima: "despejado", barrio: "Oeste", prioridad: "Baja"},
    {texto: "césped alto en plaza necesita corte", canal: "app", clima: "nublado", barrio: "Norte", prioridad: "Baja"},
    {texto: "banco de plaza con tornillo flojo", canal: "web", clima: "despejado", barrio: "Centro", prioridad: "Baja"}
];

let model = new LogisticRegressionClassifier(0.1);
let currentExampleIndex = 0;
let isTraining = false;
let totalExamples = 0;
let correctPredictions = 0;
let lossHistory = [];
let accuracyHistory = [];

const ctx = document.getElementById('learningChart').getContext('2d');
const learningChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Precisión (%)',
            data: [],
            borderColor: '#48bb78',
            backgroundColor: 'rgba(72, 187, 120, 0.1)',
            tension: 0.4,
            yAxisID: 'y'
        }, {
            label: 'Loss',
            data: [],
            borderColor: '#f56565',
            backgroundColor: 'rgba(245, 101, 101, 0.1)',
            tension: 0.4,
            yAxisID: 'y1'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Precisión (%)'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Loss'
                },
                grid: {
                    drawOnChartArea: false,
                },
            }
        },
        plugins: {
            legend: {
                position: 'top',
            }
        },
        animation: {
            duration: 300
        }
    }
});

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

async function startTraining() {
    if (isTraining) return;
    
    isTraining = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stepBtn').disabled = false;
    document.getElementById('status').className = 'status status-training';
    document.getElementById('status').textContent = 'Aprendiendo ejemplo por ejemplo...';
    document.querySelector('.metrics').classList.add('training');
    document.getElementById('currentExample').style.display = 'block';
    
    const shuffledData = shuffleArray(trainingData);
    const speed = parseInt(document.getElementById('speedSelect').value);
    
    for (let epoch = 0; epoch < 10 && isTraining; epoch++) {
        for (let i = 0; i < shuffledData.length && isTraining; i++) {
            await trainStep(shuffledData[i]);
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }
    
    if (isTraining) {
        isTraining = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('stepBtn').disabled = true;
        document.getElementById('status').className = 'status status-complete';
        document.getElementById('status').textContent = 'Entrenamiento completado';
        document.querySelector('.metrics').classList.remove('training');
        document.getElementById('currentExample').style.display = 'none';
    }
}

async function trainStep(example = null) {
    if (!example) {
        example = trainingData[Math.floor(Math.random() * trainingData.length)];
    }
    
    const features = model.extractFeatures(example.texto, example.canal, example.clima, example.barrio);
    const result = model.trainStep(features, example.prioridad);
    
    totalExamples++;
    if (result.correct) correctPredictions++;
    
    const accuracy = totalExamples > 0 ? (correctPredictions / totalExamples) * 100 : 0;
    
    document.getElementById('exampleCount').textContent = totalExamples;
    document.getElementById('correctCount').textContent = correctPredictions;
    document.getElementById('accuracy').textContent = accuracy.toFixed(1) + '%';
    document.getElementById('currentLoss').textContent = result.loss.toFixed(3);
    
    document.getElementById('exampleText').textContent = `"${example.texto}"`;
    document.getElementById('examplePred').textContent = result.prediction;
    document.getElementById('exampleTrue').textContent = example.prioridad;
    document.getElementById('exampleCorrect').textContent = result.correct ? '✅' : '❌';
    document.getElementById('exampleCorrect').style.color = result.correct ? 'green' : 'red';
    
    if (totalExamples % 5 === 0) {
        lossHistory.push(result.loss);
        accuracyHistory.push(accuracy);
        
        learningChart.data.labels.push(totalExamples);
        learningChart.data.datasets[0].data.push(accuracy);
        learningChart.data.datasets[1].data.push(result.loss);
        learningChart.update('none');
    }
    
    updateLearningLog(example, result);
    
    updateWeightsDisplay();
}

function updateLearningLog(example, result) {
    const log = document.getElementById('learningLog');
    const logItem = document.createElement('div');
    logItem.className = `log-item ${result.correct ? 'log-correct' : 'log-error'}`;
    logItem.innerHTML = `
        <strong>#${totalExamples}</strong> "${example.texto.substring(0, 40)}..." 
        → Pred: ${result.prediction} | Real: ${example.prioridad} | 
        Loss: ${result.loss.toFixed(3)} ${result.correct ? '✅' : '❌'}
    `;
    
    log.insertBefore(logItem, log.firstChild);
    
    while (log.children.length > 20) {
        log.removeChild(log.lastChild);
    }
}

function updateWeightsDisplay() {
    const weightsDiv = document.getElementById('weightsDisplay');
    let html = '';
    
    model.classes.forEach(cls => {
        html += `<div style="margin-bottom: 15px;"><strong>${cls} Priority:</strong><br>`;
        
        const sortedFeatures = Object.keys(model.weights[cls])
            .map(feature => ({
                feature,
                weight: model.weights[cls][feature]
            }))
            .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
            .slice(0, 8);
        
        sortedFeatures.forEach(({feature, weight}) => {
            const className = weight > 0 ? 'weight-positive' : 'weight-negative';
            const cleanFeature = feature.replace('word_', '').replace('canal_', '').replace('clima_', '').replace('barrio_', '');
            html += `<span class="weight-item ${className}">${cleanFeature}: ${weight.toFixed(3)}</span> `;
        });
        
        html += `<br><span style="font-size: 0.8em; color: #666;">Bias: ${model.bias[cls].toFixed(3)}</span><br></div>`;
    });
    
    weightsDiv.innerHTML = html;
}

function makePrediction() {
    if (totalExamples === 0) {
        document.getElementById('predictionResult').innerHTML = 
            '<div class="prediction-result">⚠️ Primero entrena el modelo con algunos ejemplos</div>';
        return;
    }
    
    const texto = document.getElementById('incidentText').value;
    const canal = document.getElementById('channelSelect').value;
    const clima = document.getElementById('weatherSelect').value;
    const barrio = document.getElementById('neighborhoodSelect').value;
    
    if (!texto.trim()) {
        document.getElementById('predictionResult').innerHTML = 
            '<div class="prediction-result">⚠️ Ingresa una descripción del incidente</div>';
        return;
    }
    
    const features = model.extractFeatures(texto, canal, clima, barrio);
    const result = model.predict(features);
    
    const confidence = (result.maxProb * 100).toFixed(1);
    
    let probsHtml = '';
    model.classes.forEach(cls => {
        const prob = (result.probabilities[cls] * 100).toFixed(1);
        probsHtml += `<br><strong>${cls}:</strong> ${prob}%`;
    });
    
    document.getElementById('predictionResult').innerHTML = `
        <div class="prediction-result priority-${result.prediction.toLowerCase()}">
            🎯 <strong>Clasificación:</strong> Prioridad ${result.prediction}<br>
            📊 <strong>Confianza:</strong> ${confidence}%<br>
            📋 <strong>Contexto:</strong> ${canal} | ${clima} | ${barrio}
            <div style="margin-top: 10px; font-size: 0.9em; border-top: 1px solid #ddd; padding-top: 8px;">
                <strong>Probabilidades:</strong>${probsHtml}
            </div>
        </div>
    `;
}

function resetModel() {
    isTraining = false;
    
    model.reset();
    totalExamples = 0;
    correctPredictions = 0;
    currentExampleIndex = 0;
    lossHistory = [];
    accuracyHistory = [];
    
    document.getElementById('exampleCount').textContent = '0';
    document.getElementById('correctCount').textContent = '0';
    document.getElementById('accuracy').textContent = '0%';
    document.getElementById('currentLoss').textContent = '0.000';
    document.getElementById('learningRate').textContent = '0.100';
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stepBtn').disabled = true;
    document.getElementById('status').className = 'status status-complete';
    document.getElementById('status').textContent = 'Listo para aprender';
    document.querySelector('.metrics').classList.remove('training');
    document.getElementById('currentExample').style.display = 'none';
    
    document.getElementById('weightsDisplay').innerHTML = '<p>Los pesos aparecerán durante el entrenamiento...</p>';
    document.getElementById('learningLog').innerHTML = '<p>El registro de aprendizaje aparecerá aquí...</p>';
    document.getElementById('predictionResult').innerHTML = '';
    
    learningChart.data.labels = [];
    learningChart.data.datasets[0].data = [];
    learningChart.data.datasets[1].data = [];
    learningChart.update();
}

function trainStepManual() {
    if (!isTraining) {
        const randomExample = trainingData[Math.floor(Math.random() * trainingData.length)];
        trainStep(randomExample);
    }
}

document.addEventListener('DOMContentLoaded', function() {

    document.getElementById('stepBtn').onclick = trainStepManual;
 
    document.getElementById('incidentText').addEventListener('input', function() {
        if (totalExamples > 10) { 
            makePrediction();
        }
    });
   
    ['channelSelect', 'weatherSelect', 'neighborhoodSelect'].forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            if (totalExamples > 10 && document.getElementById('incidentText').value.trim()) {
                makePrediction();
            }
        });
    });
    
    console.log('🧠 Clasificador ML con aprendizaje real cargado');
});


function fillExampleText(priority) {
    const examples = {
        'alta': [
            'fuga de gas fuerte cerca de escuela',
            'cables eléctricos caídos en vereda',
            'explosión pequeña olor a gas',
            'choque con heridos obstrucción total'
        ],
        'media': [
            'semáforo intermitente en cruce principal',
            'alumbrado público apagado en varias cuadras',
            'pozo mediano dificulta el paso'
        ],
        'baja': [
            'bache pequeño en calle secundaria',
            'pintura de senda peatonal desgastada',
            'ramas pequeñas en vereda'
        ]
    };
    
    const randomExample = examples[priority][Math.floor(Math.random() * examples[priority].length)];
    document.getElementById('incidentText').value = randomExample;
    
    if (totalExamples > 5) {
        makePrediction();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.prediction-form');
    const exampleButtons = document.createElement('div');
    exampleButtons.innerHTML = `
        <div style="margin-top: 10px; margin-bottom: 10px;">
            <small style="color: #666;">Ejemplos rápidos:</small><br>
            <button type="button" onclick="fillExampleText('alta')" style="margin: 2px; padding: 5px 10px; font-size: 12px; background: #f56565;">Alta</button>
            <button type="button" onclick="fillExampleText('media')" style="margin: 2px; padding: 5px 10px; font-size: 12px; background: #ed8936;">Media</button>
            <button type="button" onclick="fillExampleText('baja')" style="margin: 2px; padding: 5px 10px; font-size: 12px; background: #48bb78;">Baja</button>
        </div>
    `;
    form.insertBefore(exampleButtons, form.lastElementChild);
});