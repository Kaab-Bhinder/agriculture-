// Quick local test of the installed @google/generative-ai SDK from the backend
// environment. Run this from the repository root with backend/.env loaded, e.g.
// `set -a && source backend/.env && set +a && node backend/scripts/try_gemini.js`
const util = require('util');
try {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Have GEMINI_API_KEY:', !!apiKey);
  const client = new GoogleGenerativeAI(apiKey);
  (async () => {
    try {
      console.log('Client keys:', Object.keys(client));
      // Attempt to list models if available
      if (typeof client.listModels === 'function') {
        try {
          const models = await client.listModels();
          console.log('ListModels result keys:', Object.keys(models));
          console.log('First models entries:', util.inspect(models?.models?.slice(0,10), { depth: 2 }));
        } catch (e) {
          console.warn('listModels call failed:', e && e.message ? e.message : e);
        }
      } else {
        console.log('client.listModels not available; available methods:', Object.keys(client));
      }

      // Try to get a GenerativeModel object using a conservative default name
      const tryNames = [
        'models/text-bison-001',
        'text-bison-001',
        'models/chat-bison-001',
        'chat-bison-001',
        'gemini-1.5',
        'gemini-1.5-pro',
      ];
      let model = null;
      for (const name of tryNames) {
        try {
          model = client.getGenerativeModel({ model: name });
          console.log('Created model with name:', name);
          break;
        } catch (e) {
          // ignore
        }
      }
      if (!model) {
        console.error('Could not create GenerativeModel with tried names. Client keys shown above.');
        return;
      }

      console.log('Got model object, keys:', Object.keys(model));
      try {
        const result = await model.generateContent('Give a short helpful tip for smallholder farmers in Urdu and English.');
        console.log('Raw result:', util.inspect(result, { depth: 4 }));
        // Try to extract text safely with multiple fallbacks
        let text = '';
        if (result && typeof result.response?.text === 'function') {
          text = await result.response.text();
        } else if (result?.output && Array.isArray(result.output) && result.output[0]?.content) {
          // new-format: output[].content[].text
          const firstContent = result.output[0].content;
          const found = firstContent.find(c => c?.text || c?.text);
          text = found?.text || JSON.stringify(firstContent);
        } else if (result?.candidates && Array.isArray(result.candidates) && result.candidates[0]?.content) {
          text = result.candidates[0].content;
        } else if (result?.response) {
          text = String(result.response);
        } else {
          text = JSON.stringify(result);
        }
        console.log('Extracted text:', text);
      } catch (err) {
        console.error('generateContent failed:', err && err.stack ? err.stack : err);
      }
    } catch (err) {
      console.error('SDK usage failed:', err && err.stack ? err.stack : err);
    }
  })();
} catch (e) {
  console.error('Require failed:', e && e.stack ? e.stack : e);
}
