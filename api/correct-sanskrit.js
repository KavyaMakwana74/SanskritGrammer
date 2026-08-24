/**
 * Sanskrit Grammar Corrector API Endpoint
 * 100% Hard-Coded Linguistic Processing (No LLM)
 */

const SanskritGrammarEngine = require('../js/sanskrit-grammar-engine.js');
const SanskritTransliterate = require('../js/sanskrit-transliterate.js');

module.exports = async function handler(req, res) {
    // Handle CORS if needed
    if (res && res.setHeader) {
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );
    }

    if (req.method === 'OPTIONS') {
        if (res && res.status) res.status(200).end();
        return;
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        let sentence = body.sentence || '';

        if (!sentence) {
            if (res && res.status) {
                return res.status(400).json({ error: 'Sentence is required' });
            }
            return;
        }

        // Auto-transliterate if Roman characters are detected
        if (SanskritTransliterate.hasRoman(sentence)) {
            sentence = SanskritTransliterate.toDevanagari(sentence);
        }

        const result = SanskritGrammarEngine.analyzeAndCorrect(sentence);

        if (res && res.status) {
            return res.status(200).json({
                original: result.original,
                corrected: result.corrected,
                isCorrect: result.isCorrect,
                explanation: result.explanationSummary,
                issues: result.issues,
                tokenAnalyses: result.tokenAnalyses
            });
        }
        return result;
    } catch (err) {
        console.error('Sanskrit processing error:', err);
        if (res && res.status) {
            return res.status(500).json({
                error: 'Grammar analysis failed',
                details: err.message
            });
        }
    }
};
