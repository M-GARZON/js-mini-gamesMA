const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotContainer = document.getElementById('chatbotContainer');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');
const chatbotMessages = document.getElementById('chatbotMessages');

const AI_CONFIG = {
    provider: 'huggingface',
    openaiEndpoint: '/api/chat',
    huggingfaceApiKey: '',
    huggingfaceModel: 'microsoft/DialoGPT-large'
};

let conversationHistory = [
    {
        role: 'system',
        content: 'Eres un asistente virtual amigable del portfolio de Miguel Ángel Garzón, un desarrollador Full-stack. Responde de manera profesional, amigable y útil sobre cualquier tema, pero especialmente sobre desarrollo web, programación, y la información del portfolio de Miguel Ángel.'
    }
];

chatbotToggle.addEventListener('click', () => {
    chatbotContainer.classList.toggle('active');
    if (chatbotContainer.classList.contains('active')) {
        chatbotInput.focus();
    }
});

chatbotClose.addEventListener('click', () => {
    chatbotContainer.classList.remove('active');
});

async function sendMessage() {
    const message = chatbotInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    chatbotInput.value = '';
    chatbotSend.disabled = true;

    conversationHistory.push({
        role: 'user',
        content: message
    });

    const typingIndicator = addTypingIndicator();

    try {
        const response = await getAIResponse(message);

        removeTypingIndicator(typingIndicator);
        addMessage(response, 'bot');

        conversationHistory.push({
            role: 'assistant',
            content: response
        });
    } catch (error) {
        removeTypingIndicator(typingIndicator);
        addMessage('Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo.', 'bot');
        console.error('Error:', error);
    } finally {
        chatbotSend.disabled = false;
    }
}

chatbotSend.addEventListener('click', sendMessage);
chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !chatbotSend.disabled) {
        sendMessage();
    }
});

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const p = document.createElement('p');
    p.innerHTML = text.replace(/\n/g, '<br>');

    contentDiv.appendChild(p);
    messageDiv.appendChild(contentDiv);
    chatbotMessages.appendChild(messageDiv);

    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function addTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message typing-indicator';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const p = document.createElement('p');
    p.innerHTML = '...';
    p.style.fontSize = '1.5rem';
    p.style.letterSpacing = '0.3rem';

    contentDiv.appendChild(p);
    messageDiv.appendChild(contentDiv);
    chatbotMessages.appendChild(messageDiv);

    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    return messageDiv;
}

function removeTypingIndicator(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.remove();
    }
}

async function getAIResponse(message) {
    if (AI_CONFIG.provider === 'openai') {
        return await getOpenAIResponse(message);
    } else if (AI_CONFIG.provider === 'huggingface') {
        return await getHuggingFaceResponse(message);
    } else {
        return getFallbackResponse(message);
    }
}

async function getOpenAIResponse(message) {
    try {
        const response = await fetch(AI_CONFIG.openaiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: conversationHistory,
                max_tokens: 300,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }

        const data = await response.json();
        return data.message || data.response || 'Lo siento, no pude procesar tu mensaje.';
    } catch (error) {
        console.error('Error con OpenAI:', error);
        return await getHuggingFaceResponse(message).catch(() => getFallbackResponse(message));
    }
}

async function getHuggingFaceResponse(message) {
    const models = [
        AI_CONFIG.huggingfaceModel,
        'facebook/blenderbot-400M-distill',
        'microsoft/DialoGPT-medium',
        'google/flan-t5-base'
    ];

    for (const model of models) {
        try {
            const apiUrl = `https://api-inference.huggingface.co/models/${model}`;

            const headers = {
                'Content-Type': 'application/json',
            };

            if (AI_CONFIG.huggingfaceApiKey) {
                headers['Authorization'] = `Bearer ${AI_CONFIG.huggingfaceApiKey}`;
            }

            const contextPrompt = `Eres un asistente virtual del portfolio de Miguel Ángel Garzón, desarrollador Full-stack. 
Información sobre Miguel Ángel:
- Tecnologías: HTML5, CSS3, JavaScript/TypeScript, Vue.js, React, PHP, Laravel, Java, Kotlin, MySQL, PostgreSQL
- Proyectos: Juegos en JavaScript (Arkanoid, Buscaminas, Mastermind)
- Experiencia: Técnico Informático en Remihogar, Desarrollador Web en Emexs
- Educación: CFGM Sistemas Microinformáticos y Redes, CFGS Desarrollo de Aplicaciones Web

Pregunta del usuario: ${message}
Respuesta:`;

            let requestBody;

            if (model.includes('DialoGPT')) {
                requestBody = {
                    inputs: {
                        past_user_inputs: conversationHistory.filter(m => m.role === 'user').slice(-3).map(m => m.content),
                        generated_responses: conversationHistory.filter(m => m.role === 'assistant').slice(-3).map(m => m.content),
                        text: message
                    }
                };
            } else if (model.includes('blenderbot')) {
                requestBody = {
                    inputs: {
                        past_user_inputs: conversationHistory.filter(m => m.role === 'user').slice(-3).map(m => m.content),
                        generated_responses: conversationHistory.filter(m => m.role === 'assistant').slice(-3).map(m => m.content),
                        text: message
                    }
                };
            } else {
                requestBody = {
                    inputs: contextPrompt
                };
            }

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            if (response.status === 503) {
                console.log(`Modelo ${model} está cargando, probando siguiente...`);
                continue;
            }

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            let aiResponse = '';

            if (data.generated_text) {
                aiResponse = data.generated_text;
            } else if (Array.isArray(data) && data[0]) {
                if (data[0].generated_text) {
                    aiResponse = data[0].generated_text;
                } else if (data[0].summary_text) {
                    aiResponse = data[0].summary_text;
                }
            } else if (typeof data === 'string') {
                aiResponse = data;
            }

            if (aiResponse && aiResponse.trim()) {
                aiResponse = aiResponse.trim();
                if (aiResponse.includes('Respuesta:')) {
                    aiResponse = aiResponse.split('Respuesta:')[1].trim();
                }
                return aiResponse || getFallbackResponse(message);
            }

        } catch (error) {
            console.log(`Error con modelo ${model}:`, error.message);
            continue;
        }
    }

    return getFallbackResponse(message);
}

function getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.match(/hola|hi|hey|buenos días|buenas tardes|buenas noches|saludos/)) {
        return '¡Hola! 👋 Soy tu asistente de IA. Puedo ayudarte con cualquier pregunta sobre desarrollo web, programación, o sobre Miguel Ángel y su portfolio. ¿En qué puedo ayudarte?';
    }

    if (lowerMessage.match(/quién es|who is|sobre miguel|miguel ángel|presentación|presentacion/)) {
        return 'Miguel Ángel Garzón es un desarrollador Full-stack apasionado por crear experiencias digitales innovadoras. Tiene formación en Desarrollo de Aplicaciones Web y experiencia profesional en desarrollo frontend y backend. Está comprometido con el aprendizaje constante y la mejora continua.';
    }

    if (lowerMessage.match(/habilidades|skills|tecnologías|tecnologias|qué sabe|qué tecnologías|stack|stack tecnológico/)) {
        return 'Miguel Ángel domina un stack completo:\n\nFrontend: HTML5, CSS3, JavaScript/TypeScript, Vue.js, React\nBackend: PHP, Laravel, Java, Kotlin\nBases de datos: MySQL, PostgreSQL\nHerramientas: GitHub, Git\n\nTambién tiene habilidades blandas como trabajo en equipo, adaptabilidad, comunicación efectiva, proactividad y organización.';
    }

    if (lowerMessage.match(/proyectos|projects|trabajos|portfolio|qué ha hecho|desarrollos/)) {
        return 'Miguel Ángel ha desarrollado varios proyectos interesantes:\n\n🎮 Juegos en JavaScript: Arkanoid, Buscaminas, Mastermind (desarrollados con JavaScript puro)\n✨ Efectos visuales: Sistemas de partículas interactivos y animaciones avanzadas\n\nPuedes verlos y probarlos en la sección de proyectos del portfolio.';
    }

    if (lowerMessage.match(/experiencia|experience|trabajo|empresa|dónde ha trabajado|donde ha trabajado|historial laboral/)) {
        return 'Miguel Ángel tiene experiencia profesional en:\n\n💼 Remihogar (2022-2023)\n   Técnico Informático\n   - Mantenimiento de sistemas informáticos\n   - Soporte técnico\n   - Gestión de infraestructura tecnológica\n\n💼 Emexs (2024-2025)\n   Desarrollador Web\n   - Desarrollo de aplicaciones web\n   - Programación frontend y backend\n   - Gestión de bases de datos\n   - Marketing digital y SEO';
    }

    if (lowerMessage.match(/educación|education|estudios|formación|formacion|títulos|titulos|grados|certificaciones/)) {
        return 'Miguel Ángel tiene la siguiente formación:\n\n🎓 CFGM Sistemas Microinformáticos y Redes (2021-2023)\n   Formación en instalación, configuración y mantenimiento de sistemas microinformáticos y redes.\n\n🎓 CFGS Desarrollo de Aplicaciones Web (2023-2025)\n   Formación en desarrollo de aplicaciones web, programación, bases de datos y tecnologías frontend y backend.';
    }

    if (lowerMessage.match(/contacto|contact|email|teléfono|telefono|correo|mail|linkedin|github|cómo contactar|como contactar/)) {
        return 'Puedes contactar con Miguel Ángel a través de:\n\n📧 Email: mgarzonhuerta@gmail.com\n📱 Teléfono: 689 293 625\n💼 LinkedIn: Disponible en la sección de contacto del portfolio\n🐙 GitHub: Disponible en la sección de contacto';
    }

    if (lowerMessage.match(/javascript|js|typescript|ts/)) {
        return 'Miguel Ángel trabaja con JavaScript y TypeScript para desarrollo frontend. Ha creado varios juegos usando JavaScript puro (Arkanoid, Buscaminas, Mastermind) y usa estos lenguajes junto con frameworks como Vue.js y React.';
    }

    if (lowerMessage.match(/vue|vue\.js/)) {
        return 'Vue.js es uno de los frameworks frontend que Miguel Ángel domina. Lo usa para crear interfaces de usuario reactivas y componentes reutilizables en aplicaciones web modernas.';
    }

    if (lowerMessage.match(/react/)) {
        return 'React es otro framework frontend en el stack de Miguel Ángel. Lo utiliza para construir interfaces de usuario interactivas y aplicaciones de una sola página (SPA).';
    }

    if (lowerMessage.match(/laravel|php/)) {
        return 'Miguel Ángel trabaja con PHP y Laravel para desarrollo backend. Laravel es un framework PHP que facilita el desarrollo de aplicaciones web robustas con características como autenticación, bases de datos y APIs REST.';
    }

    if (lowerMessage.match(/java|kotlin/)) {
        return 'Miguel Ángel tiene experiencia en Java y Kotlin para desarrollo de aplicaciones. Estos lenguajes le permiten trabajar en diferentes plataformas y crear aplicaciones escalables.';
    }

    if (lowerMessage.match(/adiós|adios|bye|hasta luego|gracias|thank you|thanks|nos vemos/)) {
        return '¡De nada! 😊 Ha sido un placer ayudarte. Si tienes más preguntas sobre Miguel Ángel, sus proyectos o desarrollo web en general, no dudes en escribirme. ¡Que tengas un excelente día!';
    }

    if (lowerMessage.match(/desarrollo web|web development|programación|programacion|cómo aprender|como aprender|qué estudiar|que estudiar/)) {
        return 'El desarrollo web es un campo apasionante. Basándome en la experiencia de Miguel Ángel, te recomendaría empezar con HTML, CSS y JavaScript, luego aprender frameworks como Vue.js o React, y finalmente backend con PHP/Laravel o Node.js. La práctica constante y proyectos reales son clave para aprender.';
    }

    return `Entiendo que preguntas sobre "${message}". Estoy aquí para ayudarte con información sobre Miguel Ángel, desarrollo web, programación, o cualquier otra consulta. ¿Podrías ser más específico? Por ejemplo, puedo ayudarte con:\n\n- Información sobre Miguel Ángel y su experiencia\n- Tecnologías y habilidades\n- Proyectos desarrollados\n- Cómo contactarle\n- Preguntas sobre desarrollo web en general`;
}

window.addEventListener('load', () => {
    
});
