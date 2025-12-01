# 🤖 Configuración del Chatbot con IA

El chatbot está listo para usar con inteligencia artificial real. Aquí tienes las opciones para configurarlo:

## 🚀 Opción 1: Hugging Face (Recomendado - GRATIS)

Hugging Face es la opción más fácil y **completamente gratuita**. Funciona directamente desde el frontend sin necesidad de backend.

### Pasos para configurar:

1. **Crear cuenta en Hugging Face** (si no tienes una):
   - Ve a: https://huggingface.co/join
   - Crea una cuenta gratuita

2. **Obtener API Token**:
   - Ve a: https://huggingface.co/settings/tokens
   - Haz clic en "New token"
   - Dale un nombre (ej: "portfolio-chatbot")
   - Copia el token (empieza con `hf_...`)

3. **Configurar en el código**:
   - Abre `chatbot.js`
   - Busca la línea: `huggingfaceApiKey: ''`
   - Pega tu token entre las comillas: `huggingfaceApiKey: 'hf_tu_token_aqui'`

4. **¡Listo!** El chatbot ya funciona con IA real.

### Modelos disponibles:

El código intenta usar estos modelos en orden (si uno falla, prueba el siguiente):
- `microsoft/DialoGPT-large` (mejor para conversaciones)
- `facebook/blenderbot-400M-distill` (bueno para chat)
- `microsoft/DialoGPT-medium` (alternativa)
- `google/flan-t5-base` (más rápido)

Puedes cambiar el modelo predeterminado en `chatbot.js` línea 19.

---

## 🔐 Opción 2: OpenAI (Requiere Backend)

OpenAI ofrece respuestas de mayor calidad, pero **requiere crear un backend** por seguridad (no puedes poner la API key directamente en el frontend).

### Pasos:

1. **Crear backend proxy**:
   - Crea un servidor (Node.js, Python, PHP, etc.)
   - El backend debe tener tu API key de OpenAI
   - Crea un endpoint que reciba mensajes y los envíe a OpenAI

2. **Configurar en el código**:
   - En `chatbot.js`, cambia: `provider: 'openai'`
   - Configura: `openaiEndpoint: '/api/chat'` (tu URL del backend)

3. **Ejemplo de backend** (Node.js/Express):
```javascript
app.post('/api/chat', async (req, res) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: req.body.messages,
      max_tokens: 300
    })
  });
  const data = await response.json();
  res.json({ message: data.choices[0].message.content });
});
```

---

## ⚙️ Opción 3: Sin API (Modo Fallback)

Si no configuras ninguna API, el chatbot funcionará con respuestas inteligentes basadas en palabras clave. Aunque no es IA real, puede responder preguntas comunes sobre el portfolio.

---

## 📝 Notas Importantes:

- **Hugging Face**: Algunos modelos pueden tardar unos segundos en cargar la primera vez (503 error). El código maneja esto automáticamente probando modelos alternativos.
- **Rate Limits**: Hugging Face tiene límites de uso, pero son generosos para uso personal.
- **Privacidad**: Los mensajes se envían a las APIs externas. No se almacenan conversaciones.

---

## 🐛 Solución de Problemas:

**Error 503 (Modelo cargando)**:
- Normal en Hugging Face. El código intenta automáticamente otros modelos.
- Espera unos segundos y vuelve a intentar.

**Error 429 (Demasiadas peticiones)**:
- Has excedido el límite de rate. Espera unos minutos.

**No responde nada**:
- Verifica que tu API key esté correcta (si usas Hugging Face).
- Revisa la consola del navegador (F12) para ver errores.
- Asegúrate de que el archivo `chatbot.js` esté cargado correctamente.

---

## ✨ Características del Chatbot:

- ✅ Respuestas inteligentes con IA real
- ✅ Historial de conversación
- ✅ Indicador de escritura mientras procesa
- ✅ Diseño moderno integrado con el portfolio
- ✅ Fallback inteligente si la API falla
- ✅ Soporte para múltiples modelos de IA

¡Disfruta de tu chatbot con IA! 🚀

