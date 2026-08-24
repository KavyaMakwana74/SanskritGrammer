/**
 * Sanskrit Transliteration & Phonetic Typing Engine
 * 100% Deterministic Rule-Based Converter
 * Supports:
 *  1. Natural English / Hinglish Sanskrit Phonetic Typing (e.g. gachhami -> गच्छामि, balakah -> बालकः, ramoh -> रामो / रामः)
 *  2. Standard IAST, Harvard-Kyoto, and ITRANS schemes -> Devanagari
 *  3. Visarga and Halanta auto-detection for Sanskrit sentence construction
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SanskritTransliterate = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    // Fast-path lookup for natural phonetic English typing of Sanskrit vocabulary
    const DIRECT_PHONETIC_LEXICON = {
        // Nouns & Stems
        'ram': 'राम', 'rama': 'राम', 'ramah': 'रामः', 'ramoh': 'रामः', 'ramo': 'रामो',
        'ramam': 'रामम्', 'ramena': 'रामेण', 'ramaya': 'रामाय', 'ramat': 'रामात्', 'ramasya': 'रामस्य', 'rame': 'रामे',
        'balak': 'बालक', 'balaka': 'बालक', 'balakah': 'बालकः', 'balakoh': 'बालकः', 'balakau': 'बालकौ', 'balakaah': 'बालकाः',
        'balakam': 'बालकम्', 'balakena': 'बालकेन', 'balakaya': 'बालकाय', 'balakat': 'बालकात्', 'balakasya': 'बालकस्य', 'balake': 'बालके',
        'chatr': 'छात्र', 'chatra': 'छात्र', 'chatrah': 'छात्रः', 'chatraah': 'छात्राः', 'chatram': 'छात्रम्', 'chatraya': 'छात्राय',
        'vidyalay': 'विद्यालय', 'vidyalaya': 'विद्यालय', 'vidyalayam': 'विद्यालयम्', 'vidyalaye': 'विद्यालये',
        'pustak': 'पुस्तक', 'pustaka': 'पुस्तक', 'pustakam': 'पुस्तकम्', 'pustakani': 'पुस्तकानि',
        'van': 'वन', 'vana': 'वन', 'vanam': 'वनम्', 'vane': 'वने',
        'phal': 'फल', 'phala': 'फल', 'phalam': 'फलम्', 'phalani': 'फलानि',
        'jal': 'जल', 'jala': 'जल', 'jalam': 'जलम्', 'jale': 'जले',
        'nagar': 'नगर', 'nagara': 'नगर', 'nagaram': 'नगरम्', 'nagare': 'नगरं',
        'grih': 'गृह', 'griha': 'गृह', 'griham': 'गृहम्', 'grihe': 'गृहे',
        'vriksh': 'वृक्ष', 'vriksha': 'वृक्ष', 'vrikshah': 'वृक्षः', 'vriksham': 'वृक्षम्', 'vrikshe': 'वृक्षे', 'vrikshasya': 'वृक्षस्य',
        'krishn': 'कृष्ण', 'krishna': 'कृष्ण', 'krishnah': 'कृष्णः', 'krishnam': 'कृष्णम्', 'krishnena': 'कृष्णेन',
        'singh': 'सिंह', 'singha': 'सिंह', 'singhah': 'सिंहः', 'singham': 'सिंहम्', 'singhe': 'सिंहे',
        'dev': 'देव', 'deva': 'देव', 'devah': 'देवः', 'devam': 'देवम्', 'devaya': 'देवाय',
        'bhakt': 'भक्त', 'bhakta': 'भक्त', 'bhaktah': 'भक्तः', 'bhaktam': 'भक्तम्', 'bhaktaya': 'भक्ताय',
        'sundar': 'सुन्दर', 'sundara': 'सुन्दर', 'sundarah': 'सुन्दरः', 'sundari': 'सुन्दरी', 'sundaram': 'सुन्दरम्',
        'buddhiman': 'बुद्धिमान्', 'buddhimati': 'बुद्धिमती',
        
        // Pronouns
        'aham': 'अहम्', 'aavam': 'आवाम्', 'vayam': 'वयम्',
        'tvam': 'त्वम्', 'yuvaam': 'युवाम्', 'yuyam': 'यूयम्',
        'sah': 'सः', 'tau': 'तौ', 'te': 'ते', 'tam': 'तम्', 'tasya': 'तस्य',
        'saa': 'सा', 'sa': 'सा', 'taam': 'ताम्', 'tasyaah': 'तस्याः',
        'tat': 'तत्', 'taani': 'तानि',
        'bhavan': 'भवान्', 'bhavantau': 'भवन्तौ', 'bhavantah': 'भवन्तः', 'bhavati': 'भवती',
        'etad': 'एतत्', 'etat': 'एतत्', 'eshah': 'एषः', 'esha': 'एषा',
        
        // Feminine Nouns
        'sita': 'सीता', 'gita': 'गीता', 'lata': 'लता', 'kanya': 'कन्या', 'mahila': 'महिला', 'nadi': 'नदी', 'janani': 'जननी', 'putri': 'पुत्री',
        'mata': 'माता', 'mataram': 'मातरम्', 'matra': 'मात्रा',
        'pita': 'पिता', 'pitaram': 'पितरम्', 'pitra': 'पित्रा', 'pitre': 'पित्रे',
        
        // U & I Stems
        'guru': 'गुरु', 'guruh': 'गुरुः', 'gurum': 'गुरुम्', 'gurave': 'गुरवे', 'guroh': 'गुरोः',
        'muni': 'मुनि', 'munih': 'मुनिः', 'munim': 'मुनिम्', 'munaye': 'मुनये', 'muneh': 'मुनेः',
        'hari': 'हरि', 'harih': 'हरिः', 'harim': 'हरिम्', 'haraye': 'हरये', 'hareh': 'हरेः',
        
        // Avyayas (Indeclinables)
        'shvah': 'श्वः', 'shva': 'श्वः', 'hyah': 'ह्यः', 'hya': 'ह्यः', 'adya': 'अद्य',
        'api': 'अपि', 'cha': 'च', 'ch': 'च', 'eva': 'एव', 'na': 'न',
        'saha': 'सह', 'sah': 'सः', 'vina': 'विना', 'namah': 'नमः',
        'upari': 'उपरि', 'adhah': 'अधः', 'samipam': 'समीपम्', 'bahih': 'बहिः',
        'shighram': 'शीघ्रम्', 'shanaih': 'शनैः', 'atra': 'अत्र', 'tatra': 'तत्र', 'kutra': 'कुत्र',
        
        // Verbs: Gam (to go)
        'gachhati': 'गच्छति', 'gacchati': 'गच्छति', 'gachhatah': 'गच्छतः', 'gachhanti': 'गच्छन्ति',
        'gachhasi': 'गच्छसि', 'gacchasi': 'गच्छसि', 'gachhathah': 'गच्छथः', 'gachhatha': 'गच्छथ',
        'gachhami': 'गच्छामि', 'gacchami': 'गच्छामि', 'gachhavah': 'गच्छावः', 'gachhamah': 'गच्छामः',
        'agachhat': 'अगच्छत्', 'agachhan': 'अगच्छन्', 'agachham': 'अगच्छम्',
        'gamishyati': 'गमिष्यति', 'gamishyanti': 'गमिष्यन्ति', 'gamishyami': 'गमिष्यामि', 'gamishyamah': 'गमिष्यामः',
        
        // Verbs: Path (to read)
        'pathati': 'पठति', 'pathatah': 'पठतः', 'pathanti': 'पठन्ति',
        'pathasi': 'पठसि', 'pathathah': 'पठथः', 'pathatha': 'पठथ',
        'pathami': 'पठामि', 'pathavah': 'पठावः', 'pathamah': 'पठामः',
        'apathat': 'अपठत्', 'apathan': 'अपठन्', 'apatham': 'अपठम्',
        'pathishyati': 'पठिष्यति', 'pathishyanti': 'पठिष्यन्ति', 'pathishyami': 'पठिष्यामि', 'pathishyamah': 'पठिष्यामः',
        'pathayati': 'पाठयति', 'pathayanti': 'पाठयन्ति',
        
        // Verbs: Other common roots
        'likhati': 'लिखति', 'likhasi': 'लिखसि', 'likhami': 'लिखामि',
        'khadati': 'खादति', 'khadasi': 'खादसि', 'khadami': 'खादामि',
        'pibati': 'पिबति', 'pibasi': 'पिबसि', 'pibami': 'पिबामि',
        'pashyati': 'पश्यति', 'pashyasi': 'पश्यसि', 'pashyami': 'पश्यामि',
        'kridati': 'क्रीडति', 'kridatah': 'क्रीडतः', 'kridanti': 'क्रीडन्ति', 'kridami': 'क्रीडामि',
        'dhavati': 'धावति', 'dhavanti': 'धावन्ति',
        'gayati': 'गायति', 'gayanti': 'गायन्ति', 'gayami': 'गायामि',
        'dadati': 'ददाति', 'dadasi': 'ददासि', 'dadami': 'ददामि',
        'namati': 'नमति', 'namanti': 'नमन्ति', 'namami': 'नमामि',
        'asti': 'अस्ति', 'stah': 'स्तः', 'santi': 'सन्ति', 'asi': 'असि', 'stha': 'स्थ', 'asmi': 'अस्मि', 'smah': 'स्मः',
        'aasiit': 'आसीत्', 'aasan': 'आसन्',
        'bhavati': 'भवति', 'bhavanti': 'भवन्ति', 'bhavasi': 'भवसि', 'bhavami': 'भवामि',
        'nivasati': 'निवसति', 'nivasanti': 'निवसन्ति',
        'pachati': 'पचति', 'pachanti': 'पचन्ति',
        'smarati': 'स्मरति', 'smaranti': 'स्मरन्ति'
    };

    const VOWELS_TABLE = {
        'aa': 'आ', 'a': 'अ', 'A': 'आ', 'ā': 'आ',
        'ee': 'ई', 'ii': 'ई', 'i': 'इ', 'I': 'ई', 'ī': 'ई',
        'oo': 'ऊ', 'uu': 'ऊ', 'u': 'उ', 'U': 'ऊ', 'ū': 'ऊ',
        'ri': 'ऋ', 'ru': 'ऋ', 'R': 'ऋ', 'RR': 'ॠ', 'r̥': 'ऋ', 'r̥̄': 'ॠ',
        'e': 'ए', 'ai': 'ऐ', 'E': 'ऐ',
        'o': 'ओ', 'au': 'औ', 'ou': 'औ', 'O': 'औ'
    };

    const MATRAS_TABLE = {
        'aa': 'ा', 'a': '', 'A': 'ा', 'ā': 'ा',
        'ee': 'ी', 'ii': 'ी', 'i': 'ि', 'I': 'ी', 'ī': 'ी',
        'oo': 'ू', 'uu': 'ू', 'u': 'ु', 'U': 'ू', 'ū': 'ू',
        'ri': 'ृ', 'ru': 'ृ', 'R': 'ृ', 'RR': 'ॄ', 'r̥': 'ृ', 'r̥̄': 'ॄ',
        'e': 'े',
        'ai': 'ै', 'E': 'ै',
        'o': 'ो',
        'au': 'ौ', 'ou': 'ौ', 'O': 'ौ',
        'M': 'ं', 'H': 'ः', '.m': 'ं', '.h': 'ः'
    };

    const CONSONANTS_TABLE = {
        // Multi-char Conjuncts & Aspirates
        'cch': 'च्छ', 'chh': 'छ', 'ch': 'च', 'c': 'च',
        'kh': 'ख', 'gh': 'घ', 'ng': 'ङ',
        'jh': 'झ', 'ny': 'ञ',
        'Th': 'ठ', 'Dh': 'ढ', 'ṭh': 'ठ', 'ḍh': 'ढ',
        'th': 'थ', 'dh': 'ध',
        'ph': 'फ', 'bh': 'भ', 'f': 'फ',
        'shh': 'ष', 'Sh': 'ष', 'sh': 'श',
        'ksh': 'क्ष', 'kSh': 'क्ष', 'x': 'क्ष',
        'gy': 'ज्ञ', 'jny': 'ज्ञ', 'dny': 'ज्ञ',
        'tr': 'त्र', 'shr': 'श्र',
        // Single Consonants
        'k': 'क', 'g': 'ग', 'j': 'ज',
        'T': 'ट', 'D': 'ड', 'N': 'ण', 'ṭ': 'ट', 'ḍ': 'ड', 'ṇ': 'ण',
        't': 'त', 'd': 'द', 'n': 'न',
        'p': 'प', 'b': 'ब', 'm': 'म',
        'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'w': 'व',
        'S': 'ष', 'ṣ': 'ष', 'z': 'श', 'ś': 'श', 's': 'स',
        'h': 'ह', 'q': 'ळ'
    };

    const CONSONANT_KEYS = Object.keys(CONSONANTS_TABLE).sort((a, b) => b.length - a.length);
    const VOWEL_KEYS = Object.keys(VOWELS_TABLE).sort((a, b) => b.length - a.length);
    const MATRA_KEYS = Object.keys(MATRAS_TABLE).sort((a, b) => b.length - a.length);

    /**
     * Converts a single Romanized word/syllable into Devanagari
     */
    function transliterateWord(rawWord) {
        if (!rawWord) return '';
        if (/^[\u0900-\u097F]+$/.test(rawWord)) return rawWord;

        let lower = rawWord.toLowerCase();

        // 1. Direct Fast-Path Match from Rich Sanskrit Lexicon
        if (DIRECT_PHONETIC_LEXICON[lower]) {
            return DIRECT_PHONETIC_LEXICON[lower];
        }

        // 2. Word-Ending Phonetic Adjustments
        // e.g. "balakah" -> "balaka" + visarga
        let hasVisarga = false;
        if (/ah$/i.test(rawWord)) {
            hasVisarga = true;
            rawWord = rawWord.replace(/ah$/i, 'a');
        } else if (/oh$/i.test(rawWord)) {
            // ramoh -> ramah -> रामः
            hasVisarga = true;
            rawWord = rawWord.replace(/oh$/i, 'a');
        }

        let word = rawWord;
        let i = 0;
        let n = word.length;
        let out = '';

        while (i < n) {
            let ch = word[i];

            // Punctuation / non-alphabetic
            if (!/[a-zA-Z]/.test(ch)) {
                if (ch === ':') out += 'ः';
                else if (ch === '.') out += '।';
                else out += ch;
                i++;
                continue;
            }

            // Check Consonants
            let matchedConsonant = null;
            for (let cKey of CONSONANT_KEYS) {
                if (word.startsWith(cKey, i)) {
                    matchedConsonant = cKey;
                    break;
                }
            }

            if (matchedConsonant) {
                let devConsonant = CONSONANTS_TABLE[matchedConsonant];
                i += matchedConsonant.length;

                // Check trailing vowel / matra
                let matchedMatra = null;
                for (let mKey of MATRA_KEYS) {
                    if (word.startsWith(mKey, i)) {
                        matchedMatra = mKey;
                        break;
                    }
                }

                if (matchedMatra) {
                    let devMatra = MATRAS_TABLE[matchedMatra];
                    out += devConsonant + devMatra;
                    i += matchedMatra.length;
                } else {
                    out += devConsonant + '्';
                }
                continue;
            }

            // Check Independent Vowels
            let matchedVowel = null;
            for (let vKey of VOWEL_KEYS) {
                if (word.startsWith(vKey, i)) {
                    matchedVowel = vKey;
                    break;
                }
            }

            if (matchedVowel) {
                out += VOWELS_TABLE[matchedVowel];
                i += matchedVowel.length;
                continue;
            }

            out += ch;
            i++;
        }

        out = out.replace(/्([ािीुूृॄेैोौंः])/g, '$1');
        if (hasVisarga) {
            out += 'ः';
        }

        return out;
    }

    /**
     * Translates Romanized English Sanskrit (e.g. "gachhami", "balakah", "ramoh", "aham pustakam pathami") into Devanagari
     */
    function toDevanagari(text) {
        if (!text) return '';

        // Normalize ASCII colon after Devanagari characters to Devanagari Visarga (ः)
        text = text.replace(/([\u0900-\u097F]):/g, '$1ः');

        // Segment text preserving whitespace and punctuation
        let parts = text.split(/(\s+|[।॥,\.!\?;:()\[\]"'`\n]+)/);
        let result = parts.map(part => {
            if (/^\s+$/.test(part) || /^[।॥,\.!\?;:()\[\]"'`\n]+$/.test(part)) {
                if (part === '.') return '।';
                if (part === '..') return '॥';
                return part;
            }
            if (/[\u0900-\u097F]/.test(part) && !/[a-zA-Z]/.test(part)) {
                return part;
            }
            return transliterateWord(part);
        }).join('');

        return result;
    }

    /**
     * Check if text has Roman characters
     */
    function hasRoman(text) {
        return /[a-zA-Z]/.test(text);
    }

    return {
        toDevanagari,
        transliterateWord,
        hasRoman,
        DIRECT_PHONETIC_LEXICON
    };
}));
