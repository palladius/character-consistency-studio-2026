#!/usr/bin/env node
/**
 * Quick smoke test: prove image generation works with the same
 * code path as the frontend (gemini-2.5-flash + IMAGE modality).
 *
 * Usage: node scripts/test-generation.mjs
 */
import { GoogleGenAI } from '@google/genai';
import { writeFileSync } from 'fs';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Set GEMINI_API_KEY env var first');
  process.exit(1);
}

const MODEL = 'gemini-2.5-flash-image';
const PROMPT = 'A cheerful Italian man eating pizza in Rome, golden hour lighting, photorealistic';

console.log(`\n🎨 Testing image generation...`);
console.log(`   Model:  ${MODEL}`);
console.log(`   Prompt: "${PROMPT}"`);
console.log(`   Key:    ${API_KEY.substring(0, 8)}...`);
console.log('');

const ai = new GoogleGenAI({ apiKey: API_KEY });

try {
  const t0 = Date.now();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: { parts: [{ text: PROMPT }] },
    config: { responseModalities: ['image'] },
  });

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

  if (imagePart?.inlineData) {
    const bytes = Buffer.from(imagePart.inlineData.data, 'base64');
    const outPath = 'test-generation-output.png';
    writeFileSync(outPath, bytes);
    console.log(`✅ SUCCESS in ${elapsed}s!`);
    console.log(`   Output: ${outPath} (${(bytes.length / 1024).toFixed(0)} KB)`);
    console.log(`   MIME:   ${imagePart.inlineData.mimeType}`);
    if (response.usageMetadata) {
      console.log(`   Tokens: in=${response.usageMetadata.promptTokenCount} out=${response.usageMetadata.candidatesTokenCount}`);
    }
  } else {
    console.error('❌ No image in response');
    console.error('   Candidates:', JSON.stringify(response.candidates?.length));
    if (response.promptFeedback) {
      console.error('   Feedback:', JSON.stringify(response.promptFeedback));
    }
  }
} catch (err) {
  console.error(`❌ FAILED: ${err.message}`);
  if (err.message?.includes('404')) {
    console.error('   Model not found. Try a different model name.');
  }
  process.exit(1);
}
