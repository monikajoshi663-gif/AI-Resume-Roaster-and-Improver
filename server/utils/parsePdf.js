// Helper to parse PDF buffers using an isolated worker thread
const { Worker } = require('worker_threads');

/**
 * Extracts text from a PDF Buffer using an isolated worker thread.
 * This avoids environment-level stream/http conflicts in Node.js.
 *
 * @param {Buffer} buffer
 * @returns {Promise<{ text: string }>}
 */
function parsePdfBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const code = `
      const { workerData, parentPort } = require('worker_threads');
      const pdfParse = require('pdf-parse');
      pdfParse(workerData)
        .then(data => parentPort.postMessage({ ok: true, text: (data && data.text) ? data.text : '' }))
        .catch(err => parentPort.postMessage({ ok: false, error: err.message }));
    `;
    const worker = new Worker(code, { eval: true, workerData: buffer });
    worker.on('message', (msg) => {
      if (msg.ok) {
        resolve({ text: msg.text });
      } else {
        reject(new Error(msg.error || 'Failed to extract text from PDF'));
      }
    });
    worker.on('error', reject);
  });
}

module.exports = { parsePdfBuffer };
