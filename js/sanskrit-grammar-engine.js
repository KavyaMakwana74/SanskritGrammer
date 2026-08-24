/**
 * Sanskrit Grammar & Dictionary Engine (संस्कृत व्याकरण एवं शब्दकोश यन्त्रम्)
 * 100% Hard-Coded Linguistic Rules, Morphological Generator, Spell Corrector & Dictionary
 * Based on Paninian Grammar (अष्टाध्यायी - Vyakarana Siddhanta Kaumudi)
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.SanskritGrammarEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    // ==========================================
    // 1. PHONETIC & SCRIPT CONSTANTS
    // ==========================================
    const SWARAS = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ॠ', 'ऌ', 'ॡ', 'ए', 'ऐ', 'ओ', 'औ'];
    const SWARA_SET = new Set(SWARAS);
    const MATRAS = ['ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'ॄ', 'ॢ', 'ॣ', 'े', 'ै', 'ो', 'ौ'];
    
    // Voiced consonants (हश् प्रत्याहार)
    const HASH_CONSONANTS = new Set([
        'ग', 'घ', 'ङ', 'ज', 'झ', 'ञ', 'ड', 'ढ', 'ण', 'द', 'ध', 'न', 'ब', 'भ', 'म',
        'य', 'र', 'ल', 'व', 'ह'
    ]);

    // ==========================================
    // 2. HARD-CODED LEXICON & STEM DATABASE
    // ==========================================

    const NOUN_STEMS = {
        // अ-कारान्त पुंल्लिङ्ग (Masculine ending in -a)
        'a_masc': [
            { stem: 'राम', mean: 'Rama (an avatar / ideal king)', hindi: 'राम (मर्यादा पुरुषोत्तम)', hasR: true },
            { stem: 'बालक', mean: 'boy / child', hindi: 'बालक / लड़का', hasR: false },
            { stem: 'छात्र', mean: 'student / pupil (masc)', hindi: 'छात्र / विद्यार्थी', hasR: true },
            { stem: 'नर', mean: 'man / person', hindi: 'मनुष्य / पुरुष', hasR: true },
            { stem: 'देव', mean: 'deity / god / lord', hindi: 'भगवान / देवता', hasR: false },
            { stem: 'गज', mean: 'elephant', hindi: 'हाथी', hasR: false },
            { stem: 'अश्व', mean: 'horse', hindi: 'घोड़ा', hasR: false },
            { stem: 'विद्यालय', mean: 'school / academy', hindi: 'विद्यालय / पाठशाला', hasR: false },
            { stem: 'ग्राम', mean: 'village', hindi: 'गाँव', hasR: true },
            { stem: 'जनक', mean: 'father', hindi: 'पिता', hasR: false },
            { stem: 'पुत्र', mean: 'son', hindi: 'बेटा / पुत्र', hasR: true },
            { stem: 'शिक्षक', mean: 'teacher / instructor', hindi: 'अध्यापक / शिक्षक', hasR: true },
            { stem: 'सूर्य', mean: 'sun', hindi: 'सूर्य / सूरज', hasR: true },
            { stem: 'चन्द्र', mean: 'moon', hindi: 'चन्द्रमा / चाँद', hasR: true },
            { stem: 'वृक्ष', mean: 'tree', hindi: 'पेड़ / वृक्ष', hasR: true },
            { stem: 'वानर', mean: 'monkey', hindi: 'बंदर', hasR: true },
            { stem: 'सिंह', mean: 'lion', hindi: 'शेर / सिंह', hasR: false },
            { stem: 'व्याघ्र', mean: 'tiger', hindi: 'बाघ / व्याघ्र', hasR: true },
            { stem: 'मयूर', mean: 'peacock', hindi: 'मोर', hasR: true },
            { stem: 'ईश्वर', mean: 'God / Supreme Lord', hindi: 'ईश्वर / परमात्मा', hasR: true },
            { stem: 'कृष्ण', mean: 'Lord Krishna', hindi: 'श्रीकृष्ण', hasR: true },
            { stem: 'शिव', mean: 'Lord Shiva', hindi: 'भगवान शिव', hasR: false },
            { stem: 'गणेश', mean: 'Lord Ganesha', hindi: 'गणेश जी', hasR: false },
            { stem: 'मनुष्य', mean: 'human being', hindi: 'इंसान / मनुष्य', hasR: false },
            { stem: 'हस्त', mean: 'hand', hindi: 'हाथ', hasR: false },
            { stem: 'पाद', mean: 'foot / leg', hindi: 'पैर / चरण', hasR: false },
            { stem: 'लोक', mean: 'world / society', hindi: 'संसार / लोग', hasR: false },
            { stem: 'खग', mean: 'bird', hindi: 'पक्षी / चिड़िया', hasR: false },
            { stem: 'पण्डित', mean: 'scholar / learned person', hindi: 'विद्वान', hasR: false },
            { stem: 'सेवक', mean: 'servant / attendant', hindi: 'नौकर / सेवक', hasR: false },
            { stem: 'मित्र', mean: 'friend (masc)', hindi: 'सखा / मित्र', hasR: true },
            { stem: 'नृप', mean: 'king / sovereign', hindi: 'राजा / नृप', hasR: true },
            { stem: 'सज्जन', mean: 'virtuous / noble person', hindi: 'सज्जन / भला आदमी', hasR: false },
            { stem: 'दुर्जन', mean: 'wicked person', hindi: 'दुष्ट मनुष्य', hasR: true },
            { stem: 'चौर', mean: 'thief', hindi: 'चोर', hasR: true },
            { stem: 'पाठ', mean: 'lesson / chapter', hindi: 'सबक / पाठ', hasR: true },
            { stem: 'भक्त', mean: 'devotee / worshipper', hindi: 'भक्त', hasR: false },
            { stem: 'प्रश्न', mean: 'question / inquiry', hindi: 'सवाल / प्रश्न', hasR: true },
            { stem: 'वर', mean: 'boon / blessing', hindi: 'वरदान', hasR: true }
        ],

        // आ-कारान्त स्त्रीलिङ्ग (Feminine ending in -ā)
        'aa_fem': [
            { stem: 'लता', mean: 'creeper / vine', hindi: 'बेल / लता', hasR: false },
            { stem: 'बालिका', mean: 'girl / young female', hindi: 'लड़की / कन्या', hasR: false },
            { stem: 'छात्रा', mean: 'female student', hindi: 'छात्रा / शिष्या', hasR: true },
            { stem: 'कन्या', mean: 'girl / maiden / daughter', hindi: 'कन्या / बालिका', hasR: false },
            { stem: 'महिला', mean: 'woman / lady', hindi: 'महिला / औरत', hasR: false },
            { stem: 'सीता', mean: 'Sita (Goddess / avatar)', hindi: 'माता सीता', hasR: false },
            { stem: 'रमा', mean: 'Goddess Lakshmi / wealth', hindi: 'लक्ष्मी देवी', hasR: true },
            { stem: 'विद्या', mean: 'knowledge / learning', hindi: 'ज्ञान / विद्या', hasR: false },
            { stem: 'वाटिका', mean: 'garden / orchard', hindi: 'बगीचा / वाटिका', hasR: false },
            { stem: 'पाठशाला', mean: 'school', hindi: 'पाठशाला / विद्यालय', hasR: false },
            { stem: 'भाषा', mean: 'language / speech', hindi: 'भाषा / बोली', hasR: true },
            { stem: 'कथा', mean: 'story / narrative', hindi: 'कहानी / कथा', hasR: false },
            { stem: 'माला', mean: 'garland / necklace', hindi: 'माला / हार', hasR: false },
            { stem: 'कला', mean: 'art / skill / craft', hindi: 'कला / हुनर', hasR: false },
            { stem: 'प्रजा', mean: 'citizens / subjects / progeny', hindi: 'प्रजा / जनता', hasR: true },
            { stem: 'आशा', mean: 'hope / expectation', hindi: 'उम्मीद / आशा', hasR: false },
            { stem: 'पूजा', mean: 'worship / veneration', hindi: 'पूजा-अर्चना', hasR: true },
            { stem: 'गङ्गा', mean: 'Ganga river (holy river)', hindi: 'गंगा नदी', hasR: false },
            { stem: 'यमुना', mean: 'Yamuna river', hindi: 'यमुना नदी', hasR: false },
            { stem: 'अम्बिका', mean: 'mother / Goddess Durga', hindi: 'माता / दुर्गा', hasR: false }
        ],

        // इ-कारान्त पुंल्लिङ्ग (Masculine ending in -i)
        'i_masc': [
            { stem: 'हरि', mean: 'Lord Vishnu / Hari', hindi: 'श्रीहरि विष्णु', hasR: true },
            { stem: 'मुनि', mean: 'sage / ascetic / hermit', hindi: 'मुनि / साधक', hasR: false },
            { stem: 'कवि', mean: 'poet / author', hindi: 'कवि / रचनाकार', hasR: false },
            { stem: 'ऋषि', mean: 'seer / sage', hindi: 'ऋषि / तपस्वी', hasR: true },
            { stem: 'कपि', mean: 'monkey', hindi: 'वानर / कपि', hasR: false },
            { stem: 'रवि', mean: 'sun', hindi: 'सूर्य / रवि', hasR: true },
            { stem: 'गिरि', mean: 'mountain / hill', hindi: 'पहाड़ / पर्वत', hasR: true },
            { stem: 'अग्नि', mean: 'fire', hindi: 'आग / अग्निदेव', hasR: false },
            { stem: 'अतिथि', mean: 'guest / visitor', hindi: 'मेहमान / अतिथि', hasR: false },
            { stem: 'भूपति', mean: 'king / ruler', hindi: 'राजा / नृपति', hasR: false }
        ],

        // ई-कारान्त स्त्रीलिङ्ग (Feminine ending in -ī)
        'ee_fem': [
            { stem: 'नदी', mean: 'river / stream', hindi: 'नदी / सरिता', hasR: false },
            { stem: 'जननी', mean: 'mother', hindi: 'माता / जननी', hasR: false },
            { stem: 'देवी', mean: 'goddess / noble lady', hindi: 'देवी / भगवती', hasR: false },
            { stem: 'वाणी', mean: 'speech / voice / Saraswati', hindi: 'वाणी / सरस्वती', hasR: true },
            { stem: 'भगिनी', mean: 'sister', hindi: 'बहन / दीदी', hasR: false },
            { stem: 'नगरी', mean: 'city / town', hindi: 'शहर / नगरी', hasR: true },
            { stem: 'पत्नी', mean: 'wife / spouse', hindi: 'पत्नी / भार्या', hasR: false },
            { stem: 'दासी', mean: 'maid / female servant', hindi: 'दासी / सेविका', hasR: false },
            { stem: 'कुमारी', mean: 'young unmarried girl', hindi: 'कुमारी / कन्या', hasR: true },
            { stem: 'नारी', mean: 'woman', hindi: 'स्त्री / महिला', hasR: true },
            { stem: 'पुत्री', mean: 'daughter', hindi: 'बेटी / पुत्री', hasR: true },
            { stem: 'हिन्दी', mean: 'Hindi language', hindi: 'हिन्दी भाषा', hasR: false }
        ],

        // उ-कारान्त पुंल्लिङ्ग (Masculine ending in -u)
        'u_masc': [
            { stem: 'गुरु', mean: 'teacher / spiritual master', hindi: 'गुरु / शिक्षक', hasR: true },
            { stem: 'भानु', mean: 'sun / ray of light', hindi: 'सूर्य / किरण', hasR: false },
            { stem: 'साधु', mean: 'saint / holy man / virtuous', hindi: 'साधु / सन्यासी', hasR: false },
            { stem: 'शिशु', mean: 'infant / child / baby', hindi: 'शिशु / बच्चा', hasR: false },
            { stem: 'रिपु', mean: 'enemy / foe', hindi: 'शत्रु / दुश्मन', hasR: true },
            { stem: 'तरु', mean: 'tree', hindi: 'वृक्ष / पेड़', hasR: true },
            { stem: 'प्रभु', mean: 'lord / master / sovereign', hindi: 'भगवान / स्वामी', hasR: true },
            { stem: 'वायु', mean: 'wind / air', hindi: 'हवा / पवन', hasR: false },
            { stem: 'विष्णु', mean: 'Lord Vishnu (preserver)', hindi: 'भगवान विष्णु', hasR: true }
        ],

        // अ-कारान्त नपुंसकलिङ्ग (Neuter ending in -a)
        'a_neut': [
            { stem: 'फल', mean: 'fruit / result / reward', hindi: 'फल / परिणाम', hasR: false },
            { stem: 'पुस्तक', mean: 'book / manuscript', hindi: 'किताब / पुस्तक', hasR: false },
            { stem: 'वन', mean: 'forest / woods', hindi: 'जंगल / वन', hasR: false },
            { stem: 'जल', mean: 'water', hindi: 'पानी / जल', hasR: false },
            { stem: 'पुष्प', mean: 'flower / blossom', hindi: 'फूल / पुष्प', hasR: true },
            { stem: 'पत्र', mean: 'leaf / letter / document', hindi: 'पत्ता / चिट्ठी', hasR: true },
            { stem: 'गृह', mean: 'house / home / dwelling', hindi: 'घर / भवन', hasR: true },
            { stem: 'नगर', mean: 'city / town', hindi: 'शहर / नगर', hasR: true },
            { stem: 'मित्र', mean: 'friend (neut)', hindi: 'मित्र / दोस्त', hasR: true },
            { stem: 'भोजन', mean: 'food / meal', hindi: 'खाना / भोजन', hasR: false },
            { stem: 'वस्त्र', mean: 'cloth / garment', hindi: 'कपड़ा / वस्त्र', hasR: true },
            { stem: 'उद्यान', mean: 'garden / park', hindi: 'बगीचा / उपवन', hasR: false },
            { stem: 'कमल', mean: 'lotus flower', hindi: 'कमल का फूल', hasR: false },
            { stem: 'चित्र', mean: 'picture / painting / drawing', hindi: 'चित्र / तस्वीर', hasR: true },
            { stem: 'द्वार', mean: 'door / gateway', hindi: 'दरवाजा / द्वार', hasR: true },
            { stem: 'धन', mean: 'wealth / riches / money', hindi: 'धन / सम्पत्ति', hasR: false },
            { stem: 'ज्ञान', mean: 'knowledge / wisdom', hindi: 'ज्ञान / समझ', hasR: false },
            { stem: 'काव्य', mean: 'poetry / literature', hindi: 'काव्य / कविता', hasR: false },
            { stem: 'सुख', mean: 'happiness / joy / pleasure', hindi: 'सुख / आनंद', hasR: false },
            { stem: 'दुःख', mean: 'sorrow / grief / pain', hindi: 'दुःख / कष्ट', hasR: false },
            { stem: 'नेत्र', mean: 'eye', hindi: 'आँख / नयन', hasR: true },
            { stem: 'दुग्ध', mean: 'milk', hindi: 'दूध / क्षीर', hasR: false },
            { stem: 'काष्ठ', mean: 'wood / timber', hindi: 'लकड़ी', hasR: true },
            { stem: 'गीत', mean: 'song / hymn', hindi: 'गाना / गीत', hasR: false },
            { stem: 'उत्तर', mean: 'answer / response / north', hindi: 'उत्तर / जवाब', hasR: true },
            { stem: 'समीप', mean: 'vicinity / closeness', hindi: 'निकट / पास', hasR: false },
            { stem: 'संस्कृत', mean: 'Sanskrit language / cultured', hindi: 'संस्कृत भाषा', hasR: true }
        ],

        // ऋ-कारान्त (Kinship: मातृ, पितृ)
        'r_kinship': [
            {
                stem: 'मातृ',
                linga: 'स्त्रीलिङ्ग',
                mean: 'mother',
                hindi: 'माँ / माता',
                forms: {
                    1: ['माता', 'मातरौ', 'मातरः'],
                    2: ['मातरम्', 'मातरौ', 'मातृः'],
                    3: ['मात्रा', 'मातृभ्याम्', 'मातृभिः'],
                    4: ['मात्रे', 'मातृभ्याम्', 'मातृभ्यः'],
                    5: ['मातुः', 'मातृभ्याम्', 'मातृभ्यः'],
                    6: ['मातुः', 'मात्रोः', 'मातृणाम्'],
                    7: ['मातरि', 'मात्रोः', 'मातृषु']
                }
            },
            {
                stem: 'पितृ',
                linga: 'पुंल्लिङ्ग',
                mean: 'father',
                hindi: 'पिता / बापू',
                forms: {
                    1: ['पिता', 'पितरौ', 'पितरः'],
                    2: ['पितरम्', 'पितरौ', 'पितॄन्'],
                    3: ['पित्रा', 'पितृभ्याम्', 'पितृभिः'],
                    4: ['पित्रे', 'पितृभ्याम्', 'पितृभ्यः'],
                    5: ['पितुः', 'पितृभ्याम्', 'पितृभ्यः'],
                    6: ['पितुः', 'पित्रोः', 'पितॄणाम्'],
                    7: ['पितरि', 'पित्रोः', 'पितृषु']
                }
            }
        ]
    };

    // Pronouns
    const PRONOUNS = {
        'asmad': {
            lemma: 'अस्मद्',
            linga: 'त्रिलिङ्ग',
            purusha: 1,
            mean: 'I / We (1st Person Pronoun)',
            hindi: 'मैं / हम दोनों / हम सब',
            forms: {
                1: ['अहम्', 'आवाम्', 'वयम्'],
                2: ['माम्', 'आवाम्', 'अस्मान्'],
                3: ['मया', 'आवाभ्याम्', 'अस्माभिः'],
                4: ['मह्यम्', 'आवाभ्याम्', 'अस्मभ्यम्'],
                5: ['मत्', 'आवाभ्याम्', 'अस्मत्'],
                6: ['मम', 'आवयोः', 'अस्माकम्'],
                7: ['मयि', 'आवयोः', 'अस्मासु']
            }
        },
        'yushmad': {
            lemma: 'युष्मद्',
            linga: 'त्रिलिङ्ग',
            purusha: 2,
            mean: 'You (2nd Person Pronoun)',
            hindi: 'तुम / आप / तुम दोनों / तुम सब',
            forms: {
                1: ['त्वम्', 'युवाम्', 'यूयम्'],
                2: ['त्वाम्', 'युवाम्', 'युष्मान्'],
                3: ['त्वया', 'युवाभ्याम्', 'युष्माभिः'],
                4: ['तुभ्यम्', 'युवाभ्याम्', 'युष्मभ्यम्'],
                5: ['त्वत्', 'युवाभ्याम्', 'युष्मत्'],
                6: ['तव', 'युवयोः', 'युष्माकम्'],
                7: ['त्वयि', 'युवयोः', 'युष्मासु']
            }
        },
        'tad_masc': {
            lemma: 'तद्',
            linga: 'पुंल्लिङ्ग',
            purusha: 3,
            mean: 'He / That (masc)',
            hindi: 'वह (पुरुष) / वे दोनों / वे सब',
            forms: {
                1: ['सः', 'तौ', 'ते'],
                2: ['तम्', 'तौ', 'तान्'],
                3: ['तेन', 'ताभ्याम्', 'तैः'],
                4: ['तस्मै', 'ताभ्याम्', 'तेभ्यः'],
                5: ['तस्मात्', 'ताभ्याम्', 'तेभ्यः'],
                6: ['तस्य', 'तयोः', 'तेषाम्'],
                7: ['तस्मिन्', 'तयोः', 'तेषु']
            }
        },
        'tad_fem': {
            lemma: 'तद्',
            linga: 'स्त्रीलिङ्ग',
            purusha: 3,
            mean: 'She / That (fem)',
            hindi: 'वह (स्त्री) / वे दोनों / वे सब',
            forms: {
                1: ['सा', 'ते', 'ताः'],
                2: ['ताम्', 'ते', 'ताः'],
                3: ['तया', 'ताभ्याम्', 'ताभिः'],
                4: ['तस्यै', 'ताभ्याम्', 'ताभ्यः'],
                5: ['तस्याः', 'ताभ्याम्', 'ताभ्यः'],
                6: ['तस्याः', 'तयोः', 'तासाम्'],
                7: ['तस्याम्', 'तयोः', 'तासु']
            }
        },
        'tad_neut': {
            lemma: 'तद्',
            linga: 'नपुंसकलिङ्ग',
            purusha: 3,
            mean: 'It / That (neut)',
            hindi: 'वह (नपुंसक) / वे दोनों / वे सब',
            forms: {
                1: ['तत्', 'ते', 'तानि'],
                2: ['तत्', 'ते', 'तानि'],
                3: ['तेन', 'ताभ्याम्', 'तैः'],
                4: ['तस्मै', 'ताभ्याम्', 'तेभ्यः'],
                5: ['तस्मात्', 'ताभ्याम्', 'तेभ्यः'],
                6: ['तस्य', 'तयोः', 'तेषाम्'],
                7: ['तस्मिन्', 'तयोः', 'तेषु']
            }
        },
        'etad_masc': {
            lemma: 'एतद्',
            linga: 'पुंल्लिङ्ग',
            purusha: 3,
            mean: 'This (masc)',
            hindi: 'यह (पुरुष)',
            forms: {
                1: ['एषः', 'एतौ', 'एते'],
                2: ['एतम्', 'एतौ', 'एतान्'],
                3: ['एतेन', 'एताभ्याम्', 'एतैः'],
                4: ['एतस्मै', 'एताभ्याम्', 'एतेभ्यः'],
                5: ['एतस्मात्', 'एताभ्याम्', 'एतेभ्यः'],
                6: ['एतस्य', 'एतयोः', 'एतेषाम्'],
                7: ['एतस्मिन्', 'एतयोः', 'एतेषु']
            }
        },
        'etad_fem': {
            lemma: 'एतद्',
            linga: 'स्त्रीलिङ्ग',
            purusha: 3,
            mean: 'This (fem)',
            hindi: 'यह (स्त्री)',
            forms: {
                1: ['एषा', 'एते', 'एताः'],
                2: ['एताम्', 'एते', 'एताः'],
                3: ['एतया', 'एताभ्याम्', 'एताभिः'],
                4: ['एतस्यै', 'एताभ्याम्', 'एताभ्यः'],
                5: ['एतस्याः', 'एताभ्याम्', 'एताभ्यः'],
                6: ['एतस्याः', 'एतयोः', 'एतासाम्'],
                7: ['एतस्याम्', 'एतयोः', 'एतासु']
            }
        },
        'etad_neut': {
            lemma: 'एतद्',
            linga: 'नपुंसकलिङ्ग',
            purusha: 3,
            mean: 'This (neut)',
            hindi: 'यह (नपुंसक)',
            forms: {
                1: ['एतत्', 'एते', 'एतानि'],
                2: ['एतत्', 'एते', 'एतानि'],
                3: ['एतेन', 'एताभ्याम्', 'एतैः'],
                4: ['एतस्मै', 'एताभ्याम्', 'एतेभ्यः'],
                5: ['एतस्मात्', 'एताभ्याम्', 'एतेभ्यः'],
                6: ['एतस्य', 'एतयोः', 'एतेषाम्'],
                7: ['एतस्मिन्', 'एतयोः', 'एतेषु']
            }
        },
        'bhavat_masc': {
            lemma: 'भवत्',
            linga: 'पुंल्लिङ्ग',
            purusha: 3,
            mean: 'You (respectful / honorable, masc)',
            hindi: 'आप (आदरणीय)',
            forms: {
                1: ['भवान्', 'भवन्तौ', 'भवन्तः'],
                2: ['भवन्तम्', 'भवन्तौ', 'भवतः'],
                3: ['भवता', 'भवद्भ्याम्', 'भवद्भिः'],
                4: ['भवते', 'भवद्भ्याम्', 'भवद्भ्यः'],
                5: ['भवतः', 'भवद्भ्याम्', 'भवद्भ्यः'],
                6: ['भवतः', 'भवतोः', 'भवताम्'],
                7: ['भवति', 'भवतोः', 'भवत्सु']
            }
        },
        'bhavat_fem': {
            lemma: 'भवती',
            linga: 'स्त्रीलिङ्ग',
            purusha: 3,
            mean: 'You (respectful / honorable, fem)',
            hindi: 'आप (आदरणीया महिला)',
            forms: {
                1: ['भवती', 'भवत्यौ', 'भवत्यः'],
                2: ['भवतीम्', 'भवत्यौ', 'भवतीः'],
                3: ['भवत्या', 'भवतीभ्याम्', 'भवतीभिः'],
                4: ['भवत्यै', 'भवतीभ्याम्', 'भवतीभ्यः'],
                5: ['भवत्याः', 'भवतीभ्याम्', 'भवतीभ्यः'],
                6: ['भवत्याः', 'भवत्योः', 'भवतीनाम्'],
                7: ['भवत्याम्', 'भवत्योः', 'भवतीषु']
            }
        }
    };

    // Adjectives & Numerals
    const ADJECTIVES = [
        { stem: 'सुन्दर', femStem: 'सुन्दरी', altFem: 'सुन्दरा', mean: 'beautiful / handsome', hindi: 'सुंदर' },
        { stem: 'मधुर', femStem: 'मधुरा', mean: 'sweet / melodious', hindi: 'मीठा / मधुर' },
        { stem: 'श्रेष्ठ', femStem: 'श्रेष्ठा', mean: 'noble / best / excellent', hindi: 'श्रेष्ठ / उत्तम' },
        { stem: 'चतुर', femStem: 'चतुरा', mean: 'clever / intelligent', hindi: 'चतुर / होशियार' },
        { stem: 'कुशल', femStem: 'कुशला', mean: 'skillful / expert', hindi: 'कुशल / निपुण' },
        { stem: 'उत्तम', femStem: 'उत्तमा', mean: 'excellent / superior', hindi: 'उत्तम / बेहतरीन' },
        { stem: 'रक्त', femStem: 'रक्ता', mean: 'red colored', hindi: 'लाल' },
        { stem: 'नील', femStem: 'नीला', mean: 'blue colored', hindi: 'नीला' },
        { stem: 'श्वेत', femStem: 'श्वेता', mean: 'white colored', hindi: 'सफेद' },
        { stem: 'पीत', femStem: 'पीता', mean: 'yellow colored', hindi: 'पीला' },
        { stem: 'हरित', femStem: 'हरिता', mean: 'green colored', hindi: 'हरा' },
        { stem: 'विशाल', femStem: 'विशाला', mean: 'huge / grand / vast', hindi: 'विशाल / बड़ा' },
        { stem: 'ज्येष्ठ', femStem: 'ज्येष्ठा', mean: 'elder / eldest', hindi: 'बड़ा (ज्येष्ठ)' },
        { stem: 'कनिष्ठ', femStem: 'कनिष्ठा', mean: 'younger / youngest', hindi: 'छोटा (कनिष्ठ)' },
        { stem: 'प्रिय', femStem: 'प्रिया', mean: 'dear / beloved', hindi: 'प्यारा / प्रिय' },
        { stem: 'दीर्घ', femStem: 'दीर्घा', mean: 'long / tall', hindi: 'लंबा / दीर्घ' },
        { stem: 'लघु', femStem: 'लघ्वी', mean: 'small / light', hindi: 'छोटा / हल्का' },
        { stem: 'बुद्धिमत्', isMatup: true, mean: 'wise / intelligent', hindi: 'बुद्धिमान' },
        // Numerals
        { stem: 'एक', numVal: 1, mean: 'one (1)', hindi: 'एक', isNumeral: true },
        { stem: 'द्वि', numVal: 2, mean: 'two (2)', hindi: 'दो', isNumeral: true },
        { stem: 'त्रि', numVal: 3, mean: 'three (3)', hindi: 'तीन', isNumeral: true },
        { stem: 'चतुर्', numVal: 4, mean: 'four (4)', hindi: 'चार', isNumeral: true },
        { stem: 'पञ्च', numVal: 5, mean: 'five (5)', hindi: 'पाँच', isNumeralFixed: true }
    ];

    // Avyayas (Indeclinables)
    const AVYAYAS = {
        'सह': { rule: 'upapada_3', caseReq: 3, sūtra: 'सहयुक्तेऽप्रधाने (२.३.१९)', mean: 'with / together with', hindi: 'साथ' },
        'साकम्': { rule: 'upapada_3', caseReq: 3, sūtra: 'सहयुक्तेऽप्रधाने', mean: 'with', hindi: 'साथ' },
        'सार्धम्': { rule: 'upapada_3', caseReq: 3, sūtra: 'सहयुक्तेऽप्रधाने', mean: 'with', hindi: 'साथ' },
        'समम्': { rule: 'upapada_3', caseReq: 3, sūtra: 'सहयुक्तेऽप्रधाने', mean: 'with / equal', hindi: 'समान / साथ' },
        'अलम्': { rule: 'upapada_3_or_4', caseReq: 3, altCase: 4, sūtra: 'अलमिति निषेधार्थे', mean: 'enough / stop / competent', hindi: 'बस / पर्याप्त' },
        'नमः': { rule: 'upapada_4', caseReq: 4, sūtra: 'नमःस्वस्तिस्वाहा... (२.३.१६)', mean: 'salutations / reverence to', hindi: 'नमस्कार / प्रणाम' },
        'स्वस्ति': { rule: 'upapada_4', caseReq: 4, sūtra: 'नमःस्वस्तिस्वाहा...', mean: 'well-being / auspiciousness to', hindi: 'कल्याण हो' },
        'प्रति': { rule: 'upapada_2', caseReq: 2, sūtra: 'अभितःपरितः...प्रतियोगेऽपि', mean: 'towards / in direction of', hindi: 'की ओर' },
        'परितः': { rule: 'upapada_2', caseReq: 2, sūtra: 'अभितःपरितःसमयानिकषाहाप्रतियोगेऽपि', mean: 'all around / surrounding', hindi: 'चारों ओर' },
        'उभयतः': { rule: 'upapada_2', caseReq: 2, sūtra: 'उभयसर्वतसोः कार्या...', mean: 'on both sides of', hindi: 'दोनों ओर' },
        'सर्वतः': { rule: 'upapada_2', caseReq: 2, sūtra: 'उभयसर्वतसोः कार्या...', mean: 'on all sides of', hindi: 'सब ओर' },
        'विना': { rule: 'upapada_2_3_5', caseReq: 2, altCases: [3, 5], sūtra: 'पृथग्विनानानाभिस्तृतीयाऽन्यतरस्याम्', mean: 'without / except', hindi: 'बिना' },
        'बहिः': { rule: 'upapada_5', caseReq: 5, sūtra: 'अपादाने पञ्चमी / बहिर्योगे पञ्चमी', mean: 'outside of', hindi: 'बाहर' },
        'उपरि': { rule: 'upapada_6', caseReq: 6, sūtra: 'षष्ठ्यतसर्थप्रत्ययेन (२.३.३०)', mean: 'above / on top of', hindi: 'ऊपर' },
        'अधः': { rule: 'upapada_6', caseReq: 6, sūtra: 'षष्ठ्यतसर्थप्रत्ययेन (२.३.३०)', mean: 'below / underneath', hindi: 'नीचे' },
        'समीपम्': { rule: 'upapada_6', caseReq: 6, sūtra: 'समीपार्थे षष्ठी', mean: 'near / close to', hindi: 'समीप / पास' },
        'समीपे': { rule: 'upapada_6', caseReq: 6, sūtra: 'समीपार्थे षष्ठी', mean: 'near / close to', hindi: 'पास' },
        'समीपं': { rule: 'upapada_6', caseReq: 6, sūtra: 'समीपार्थे षष्ठी', mean: 'near / close to', hindi: 'पास' },
        'श्वः': { rule: 'temporal_future', tenseReq: 'लृट्', mean: 'tomorrow', hindi: 'कल (आने वाला)' },
        'ह्यः': { rule: 'temporal_past', tenseReq: 'लङ्', mean: 'yesterday', hindi: 'कल (बीता हुआ)' },
        'अद्य': { rule: 'temporal_present', tenseReq: 'लट्', mean: 'today', hindi: 'आज' },
        'शीघ्रम्': { mean: 'quickly / swiftly', hindi: 'जल्दी / शीघ्र' },
        'शीघ्रं': { mean: 'quickly / swiftly', hindi: 'जल्दी / शीघ्र' },
        'शनैः': { mean: 'slowly / gently', hindi: 'धीरे-धीरे' },
        'अत्र': { mean: 'here / in this place', hindi: 'यहाँ' },
        'तत्र': { mean: 'there / in that place', hindi: 'वहाँ' },
        'कुत्र': { mean: 'where? (interrogative)', hindi: 'कहाँ?' },
        'सर्वत्र': { mean: 'everywhere / omnipresent', hindi: 'सब जगह' },
        'अपि': { mean: 'also / even / too', hindi: 'भी' },
        'च': { mean: 'and', hindi: 'और' },
        'एव': { mean: 'only / indeed', hindi: 'ही' },
        'न': { mean: 'not / no', hindi: 'नहीं' },
        'यदा': { mean: 'when (relative)', hindi: 'जब' },
        'तदा': { mean: 'then (correlative)', hindi: 'तब' },
        'कदा': { mean: 'when? (question)', hindi: 'कब?' },
        'यथा': { mean: 'just as / like', hindi: 'जैसे' },
        'तथा': { mean: 'so / in that way', hindi: 'वैसे' },
        'कथम्': { mean: 'how?', hindi: 'कैसे?' },
        'किमर्थम्': { mean: 'why? / for what purpose?', hindi: 'क्यों?' },
        'यदि': { mean: 'if', hindi: 'यदि / अगर' },
        'तर्हि': { mean: 'then', hindi: 'तो' }
    };

    // Verbs (धातु / तिङन्त)
    const VERB_DHATUS = {
        'गम्': {
            dhatu: 'गम् (गच्छ्)',
            mean: 'to go',
            hindi: 'जाना',
            gana: 'भ्वादिगण (१)',
            pada: 'परस्मैपद',
            isMotion: true,
            forms: {
                'लट्': { 3: ['गच्छति', 'गच्छतः', 'गच्छन्ति'], 2: ['गच्छसि', 'गच्छथः', 'गच्छथ'], 1: ['गच्छामि', 'गच्छावः', 'गच्छामः'] },
                'लङ्': { 3: ['अगच्छत्', 'अगच्छताम्', 'अगच्छन्'], 2: ['अगच्छः', 'अगच्छतम्', 'अगच्छत'], 1: ['अगच्छम्', 'अगच्छाव', 'अगच्छाम'] },
                'लृट्': { 3: ['गमिष्यति', 'गमिष्यतः', 'गमिष्यन्ति'], 2: ['गमिष्यसि', 'गमिष्यथः', 'गमिष्यथ'], 1: ['गमिष्यामि', 'गमिष्यावः', 'गमिष्यामः'] },
                'लोट्': { 3: ['गच्छतु', 'गच्छताम्', 'गच्छन्तु'], 2: ['गच्छ', 'गच्छतम्', 'गच्छत'], 1: ['गच्छानि', 'गच्छाव', 'गच्छाम'] },
                'विधिलिङ्': { 3: ['गच्छेत्', 'गच्छेताम्', 'गच्छेयुः'], 2: ['गच्छेः', 'गच्छेतम्', 'गच्छेत'], 1: ['गच्छेयम्', 'गच्छेव', 'गच्छेम'] }
            }
        },
        'आ+गम्': {
            dhatu: 'आ+गम् (आगच्छ्)',
            mean: 'to come / arrive',
            hindi: 'आना',
            gana: 'भ्वादिगण (१)',
            pada: 'परस्मैपद',
            isMotion: true,
            forms: {
                'लट्': { 3: ['आगच्छति', 'आगच्छतः', 'आगच्छन्ति'], 2: ['आगच्छसि', 'आगच्छथः', 'आगच्छथ'], 1: ['आगच्छामि', 'आगच्छावः', 'आगच्छामः'] },
                'लङ्': { 3: ['आगच्छत्', 'आगच्छताम्', 'आगच्छन्'], 2: ['आगच्छः', 'आगच्छतम्', 'आगच्छत'], 1: ['आगच्छम्', 'आगच्छाव', 'आगच्छाम'] },
                'लृट्': { 3: ['आगमिष्यति', 'आगमिष्यतः', 'आगमिष्यन्ति'], 2: ['आगमिष्यसि', 'आगमिष्यथः', 'आगमिष्यथ'], 1: ['आगमिष्यामि', 'आगमिष्यावः', 'आगमिष्यामः'] }
            }
        },
        'पठ्': {
            dhatu: 'पठ्',
            mean: 'to read / study',
            hindi: 'पढ़ना',
            gana: 'भ्वादिगण (१)',
            pada: 'परस्मैपद',
            isTransitive: true,
            forms: {
                'लट्': { 3: ['पठति', 'पठतः', 'पठन्ति'], 2: ['पठसि', 'पठथः', 'पठथ'], 1: ['पठामि', 'पठावः', 'पठामः'] },
                'लङ्': { 3: ['अपठत्', 'अपठताम्', 'अपठन्'], 2: ['अपठः', 'अपठतम्', 'अपठत'], 1: ['अपठम्', 'अपठाव', 'अपठाम'] },
                'लृट्': { 3: ['पठिष्यति', 'पठिष्यतः', 'पठिष्यन्ति'], 2: ['पठिष्यसि', 'पठिष्यथः', 'पठिष्यथ'], 1: ['पठिष्यामि', 'पठिष्यावः', 'पठिष्यामः'] },
                'लोट्': { 3: ['पठतु', 'पठताम्', 'पठन्तु'], 2: ['पठ', 'पठतम्', 'पठत'], 1: ['पठानि', 'पठाव', 'पठाम'] },
                'विधिलिङ्': { 3: ['पठेत्', 'पठेताम्', 'पठेयुः'], 2: ['पठेः', 'पठेतम्', 'पठेत'], 1: ['पठेयम्', 'पठेव', 'पठेम'] }
            }
        },
        'लिख्': {
            dhatu: 'लिख्',
            mean: 'to write',
            hindi: 'लिखना',
            gana: 'तुदादिगण (६)',
            pada: 'परस्मैपद',
            isTransitive: true,
            forms: {
                'लट्': { 3: ['लिखति', 'लिखतः', 'लिखन्ति'], 2: ['लिखसि', 'लिखथः', 'लिखथ'], 1: ['लिखामि', 'लिखावः', 'लिखामः'] },
                'लङ्': { 3: ['अलिखत्', 'अलिखताम्', 'अलिखन्'], 2: ['अलिखः', 'अलिखतम्', 'अलिखत'], 1: ['अलिखम्', 'अलिखाव', 'अलिखाम'] },
                'लृट्': { 3: ['लेखिष्यति', 'लेखिष्यतः', 'लेखिष्यन्ति'], 2: ['लेखिष्यसि', 'लेखिष्यथः', 'लेखिष्यथ'], 1: ['लेखिष्यामि', 'लेखिष्यावः', 'लेखिष्यामः'] }
            }
        },
        'खाद्': {
            dhatu: 'खाद्',
            mean: 'to eat',
            hindi: 'खाना',
            gana: 'भ्वादिगण (१)',
            pada: 'परस्मैपद',
            isTransitive: true,
            forms: {
                'लट्': { 3: ['खादति', 'खादतः', 'खादन्ति'], 2: ['खादसि', 'खादथः', 'खादथ'], 1: ['खादामि', 'खादावः', 'खादामः'] },
                'लङ्': { 3: ['अखादत्', 'अखादताम्', 'अखादन्'], 2: ['अखादः', 'अखादतम्', 'अखादत'], 1: ['अखादम्', 'अखादाव', 'अखादाम'] },
                'लृट्': { 3: ['खादिष्यति', 'खादिष्यतः', 'खादिष्यन्ति'], 2: ['खादिष्यसि', 'खादिष्यथः', 'खादिष्यथ'], 1: ['खादिष्यामि', 'खादिष्यावः', 'खादिष्यामः'] }
            }
        },
        'पा': {
            dhatu: 'पा (पिब्)',
            mean: 'to drink',
            hindi: 'पीना',
            gana: 'भ्वादिगण (१)',
            pada: 'परस्मैपद',
            isTransitive: true,
            forms: {
                'लट्': { 3: ['पिबति', 'पिबतः', 'पिबन्ति'], 2: ['पिबसि', 'पिबथः', 'पिबथ'], 1: ['पिबामि', 'पिबावः', 'पिबामः'] },
                'लङ्': { 3: ['अपिबत्', 'अपिबताम्', 'अपिबन्'], 2: ['अपिबः', 'अपिबतम्', 'अपिबत'], 1: ['अपिबम्', 'अपिबाव', 'अपिबाम'] },
                'लृट्': { 3: ['पास्यति', 'पास्यतः', 'पास्यन्ति'], 2: ['पास्यसि', 'पास्यथः', 'पास्यथ'], 1: ['पास्यामि', 'पास्यावः', 'पास्यामः'] }
            }
        },
        'दृश्': {
            dhatu: 'दृश् (पश्य्)',
            mean: 'to see / look',
            hindi: 'देखना',
            gana: 'भ्वादिगण (१)',
            pada: 'परस्मैपद',
            isTransitive: true,
            forms: {
                'लट्': { 3: ['पश्यति', 'पश्यतः', 'पश्यन्ति'], 2: ['पश्यसि', 'पश्यथः', 'पश्यथ'], 1: ['पश्यामि', 'पश्यावः', 'पश्यामः'] },
                'लङ्': { 3: ['अपश्यत्', 'अपश्यताम्', 'अपश्यन्'], 2: ['अपश्यः', 'अपश्यतम्', 'अपश्यत'], 1: ['अपश्यम्', 'अपश्याव', 'अपश्याम'] },
                'लृट्': { 3: ['द्रक्ष्यति', 'द्रक्ष्यतः', 'द्रक्ष्यन्ति'], 2: ['द्रक्ष्यसि', 'द्रक्ष्यथः', 'द्रक्ष्यथ'], 1: ['द्रक्ष्यामि', 'द्रक्ष्यावः', 'द्रक्ष्यामः'] }
            }
        },
        'भू': {
            dhatu: 'भू (भव्)',
            mean: 'to be / become',
            hindi: 'होना',
            gana: 'भ्वादिगण (१)',
            pada: 'परस्मैपद',
            forms: {
                'लट्': { 3: ['भवति', 'भवतः', 'भवन्ति'], 2: ['भवसि', 'भवथः', 'भवथ'], 1: ['भवामि', 'भवावः', 'भवामः'] },
                'लङ्': { 3: ['अभवत्', 'अभवताम्', 'अभवन्'], 2: ['अभवः', 'अभवतम्', 'अभवत'], 1: ['अभवम्', 'अभवाव', 'अभवाम'] },
                'लृट्': { 3: ['भविष्यति', 'भविष्यतः', 'भविष्यन्ति'], 2: ['भविष्यसि', 'भविष्यथः', 'भविष्यथ'], 1: ['भविष्यामि', 'भविष्यावः', 'भविष्यामः'] }
            }
        },
        'अस्': {
            dhatu: 'अस् (अस्ति)',
            mean: 'to exist / be',
            hindi: 'है / होना (अस्तित्व)',
            gana: 'अदादिगण (२)',
            pada: 'परस्मैपद',
            isStative: true,
            forms: {
                'लट्': { 3: ['अस्ति', 'स्तः', 'सन्ति'], 2: ['असि', 'स्थः', 'स्थ'], 1: ['अस्मि', 'स्वः', 'स्मः'] },
                'लङ्': { 3: ['आसीत्', 'आस्ताम्', 'आसन्'], 2: ['आसीः', 'आस्तम्', 'आस्त'], 1: ['आसम्', 'आस्व', 'आस्म'] },
                'लृट्': { 3: ['भविष्यति', 'भविष्यतः', 'भविष्यन्ति'], 2: ['भविष्यसि', 'भविष्यथः', 'भविष्यथ'], 1: ['भविष्यामि', 'भविष्यावः', 'भविष्यामः'] }
            }
        },
        'दा': {
            dhatu: 'दा (ददाति / यच्छ्)',
            mean: 'to give / grant',
            hindi: 'देना / दान करना',
            gana: 'जुहोत्यादिगण (३)',
            pada: 'उभयपद',
            isDativeGiving: true,
            forms: {
                'लट्': { 3: ['ददाति', 'दत्तः', 'ददति'], 2: ['ददासि', 'दत्थः', 'दत्थ'], 1: ['ददामि', 'दद्वः', 'दद्मः'] },
                'लङ्': { 3: ['अददात्', 'अदत्ताम्', 'अददुः'], 2: ['अददाः', 'अदत्तम्', 'अदत्त'], 1: ['अददाम्', 'अदद्व', 'अदद्म'] },
                'लृट्': { 3: ['दास्यति', 'दास्यतः', 'दास्यन्ति'], 2: ['दास्यसि', 'दास्यथः', 'दास्यथ'], 1: ['दास्यामि', 'दास्यावः', 'दास्यामः'] }
            }
        },
        'क्रीड्': {
            dhatu: 'क्रीड्',
            mean: 'to play / sport',
            hindi: 'खेलना',
            gana: 'भ्वादिगण (१)',
            pada: 'परस्मैपद',
            forms: {
                'लट्': { 3: ['क्रीडति', 'क्रीडतः', 'क्रीडन्ति'], 2: ['क्रीडसि', 'क्रीडथः', 'क्रीडथ'], 1: ['क्रीडामि', 'क्रीडावः', 'क्रीडामः'] },
                'लङ्': { 3: ['अक्रीडत्', 'अक्रीडताम्', 'अक्रीडन्'], 2: ['अक्रीडः', 'अक्रीडतम्', 'अक्रीडत'], 1: ['अक्रीडम्', 'अक्रीडाव', 'अक्रीडाम'] }
            }
        },
        'धाव्': {
            dhatu: 'धाव्',
            mean: 'to run / race',
            hindi: 'दौड़ना',
            gana: 'भ्वादिगण (१)',
            pada: 'परस्मैपद',
            forms: {
                'लट्': { 3: ['धावति', 'धावतः', 'धावन्ति'], 2: ['धावसि', 'धावथः', 'धावथ'], 1: ['धावामि', 'धावावः', 'धावामः'] }
            }
        },
        'गै': {
            dhatu: 'गै (गायति)',
            mean: 'to sing / chant',
            hindi: 'गाना',
            gana: 'भ्वादिगण (१)',
            pada: 'परस्मैपद',
            isTransitive: true,
            forms: {
                'लट्': { 3: ['गायति', 'गायतः', 'गायन्ति'], 2: ['गायसि', 'गायथः', 'गायथ'], 1: ['गायामि', 'गायावः', 'गायामः'] },
                'लङ्': { 3: ['अगायत्', 'अगायताम्', 'अगायन्'], 2: ['अगायः', 'अगायतम्', 'अगायत'], 1: ['अगायम्', 'अगायाव', 'अगायाम'] },
                'लृट्': { 3: ['गास्यति', 'गास्यतः', 'गास्यन्ति'], 2: ['गास्यसि', 'गास्यथः', 'गास्यथ'], 1: ['गास्यामि', 'गास्यावः', 'गास्यामः'] }
            }
        },
        'निवस्': {
            dhatu: 'निवस्',
            mean: 'to dwell / reside',
            hindi: 'निवास करना / रहना',
            isStative: true,
            forms: {
                'लट्': { 3: ['निवसति', 'निवसतः', 'निवसन्ति'], 2: ['निवससि', 'निवसथः', 'निवसथ'], 1: ['निवसामि', 'निवसावः', 'निवसामः'] }
            }
        },
        'पच्': {
            dhatu: 'पच्',
            mean: 'to cook',
            hindi: 'पकाना',
            gana: 'भ्वादिगण (१)',
            pada: 'उभयपद',
            isTransitive: true,
            forms: {
                'लट्': { 3: ['पचति', 'पचतः', 'पचन्ति'], 2: ['पचसि', 'पचथः', 'पचथ'], 1: ['पचामि', 'पचावः', 'पचामः'] }
            }
        },
        'नम्': {
            dhatu: 'नम्',
            mean: 'to bow / salute',
            hindi: 'प्रणाम करना / झुकना',
            gana: 'भ्वादिगण (१)',
            pada: 'परस्मैपद',
            isSalutation: true,
            forms: {
                'लट्': { 3: ['नमति', 'नमतः', 'नमन्ति'], 2: ['नमसि', 'नमतः', 'नमथ'], 1: ['नमामि', 'नमावः', 'नमामः'] }
            }
        },
        'स्मृ': {
            dhatu: 'स्मृ (स्मरति)',
            mean: 'to remember / recollect',
            hindi: 'याद करना / स्मरण करना',
            gana: 'भ्वादिगण (१)',
            pada: 'परस्मैपद',
            isTransitive: true,
            forms: {
                'लट्': { 3: ['स्मरति', 'स्मरतः', 'स्मरन्ति'], 2: ['स्मरसि', 'स्मरथः', 'स्मरथ'], 1: ['स्मरामि', 'स्मरावः', 'स्मरामः'] }
            }
        },
        'पाठ्': {
            dhatu: 'पाठ् (पाठयति)',
            mean: 'to teach / instruct',
            hindi: 'पढ़ाना / सिखाना',
            gana: 'चुरादिगण (१०)',
            pada: 'परस्मैपद',
            isTransitive: true,
            forms: {
                'लट्': { 3: ['पाठयति', 'पाठयतः', 'पाठयन्ति'], 2: ['पाठयसि', 'पाठयथः', 'पाठयथ'], 1: ['पाठयामि', 'पाठयावः', 'पाठयामः'] }
            }
        }
    };

    // Common Spelling & Typo Patterns Map for Instant Exact Rectification
    const KNOWN_TYPOS_MAP = {
        // Verb 3.1 long 'ई' typo -> short 'इ'
        'गच्छती': 'गच्छति', 'पठती': 'पठति', 'खादती': 'खादति', 'पिबती': 'पिबति', 'लिखती': 'लिखति',
        'धावती': 'धावति', 'गायती': 'गायति', 'पश्यती': 'पश्यति', 'क्रीडती': 'क्रीडति', 'भवती': 'भवति',
        'अस्ती': 'अस्ति', 'ददाती': 'ददाति', 'स्मरती': 'स्मरति', 'पचती': 'पचति', 'निवसती': 'निवसति',
        // Missing conjuncts & combined typos
        'गछती': 'गच्छति', 'गछति': 'गच्छति', 'गछन्ति': 'गच्छन्ति', 'गछसि': 'गच्छसि', 'गछामि': 'गच्छामि', 'गछामः': 'गच्छामः',
        'पुसतकम्': 'पुस्तकम्', 'पुसतकं': 'पुस्तकं', 'पुसतक': 'पुस्तकं', 'शिस्य': 'शिष्यः', 'शिस्यः': 'शिष्यः',
        // Sibilant & Aspiration confusion
        'सिक्षक': 'शिक्षकः', 'सिक्षकः': 'शिक्षकः', 'सान्ति': 'शान्तिः', 'सान्तिः': 'शान्तिः',
        'कृश्न': 'कृष्णः', 'कृश्नः': 'कृष्णः', 'क्रिसन': 'कृष्णः', 'वृक्स': 'वृक्षः', 'वृक्सः': 'वृक्षः', 'वृक्सं': 'वृक्षं',
        'गुहम्': 'गृहम्', 'गुहं': 'गृहं', 'ग्रिहम': 'गृहम्', 'ग्रिहं': 'गृहं', 'घृहम्': 'गृहम्',
        'पलम्': 'फलम्', 'पलं': 'फलम्', 'दावति': 'धावति', 'क्रिडति': 'क्रीडति', 'क्रिडन्ति': 'क्रीडन्ति',
        // Vowel Length on Nouns
        'सिता': 'सीता', 'नदि': 'नदी', 'बालिक': 'बालिका', 'विद्य': 'विद्या',
        // Missing Halanta / Virama
        'अहम': 'अहम्', 'अगच्छत': 'अगच्छत्', 'अपठम': 'अपठम्', 'अलिखत': 'अलिखत्', 'अखादत': 'अखादत्',
        'विद्यालियम': 'विद्यालयम्', 'विद्यालियं': 'विद्यालयं', 'विद्यालयेन': 'विद्यालयेन'
    };

    // ==========================================
    // 3. MORPHOLOGICAL PARSER & PARADIGM GENERATOR
    // ==========================================

    let WORD_FORMS_MAP = null;

    function applyNatva(word, hasR) {
        if (!hasR) return word;
        return word.replace(/ेन$/, 'ेण')
                   .replace(/ानाम्$/, 'ाणाम्')
                   .replace(/ीनाम्$/, 'ीणाम्')
                   .replace(/ूनाम्$/, 'ूणाम्')
                   .replace(/िना$/, 'िणा')
                   .replace(/ुना$/, 'ुणा');
    }

    function buildWordFormsMap() {
        if (WORD_FORMS_MAP) return WORD_FORMS_MAP;
        const map = new Map();

        function addEntry(surface, meta) {
            let key = surface.trim();
            if (!key) return;
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(meta);

            if (key.endsWith('म्')) {
                let anusvaraKey = key.slice(0, -2) + 'ं';
                if (!map.has(anusvaraKey)) map.set(anusvaraKey, []);
                map.get(anusvaraKey).push({ ...meta, surfaceVariant: 'anusvara' });
            }
            if (key.endsWith('ं')) {
                let mKey = key.slice(0, -1) + 'म्';
                if (!map.has(mKey)) map.set(mKey, []);
                map.get(mKey).push({ ...meta, surfaceVariant: 'halanta_m' });
            }
        }

        // 1. Nouns
        for (let item of NOUN_STEMS['a_masc']) {
            let s = item.stem;
            let hasR = item.hasR;
            let forms = {
                1: [s + 'ः', s + 'ौ', s + 'ाः'],
                2: [s + 'म्', s + 'ौ', s + 'ान्'],
                3: [applyNatva(s + 'ेन', hasR), s + 'ाभ्याम्', s + 'ैः'],
                4: [s + 'ाय', s + 'ाभ्याम्', s + 'ेभ्यः'],
                5: [s + 'ात्', s + 'ाभ्याम्', s + 'ेभ्यः'],
                6: [s + 'स्य', s + 'योः', applyNatva(s + 'ानाम्', hasR)],
                7: [s + 'े', s + 'योः', s + 'ेषु']
            };
            for (let v = 1; v <= 7; v++) {
                for (let numIdx = 0; numIdx < 3; numIdx++) {
                    addEntry(forms[v][numIdx], {
                        type: 'subanta', category: 'नामपदम् (Noun)', stem: s, linga: 'पुंल्लिङ्ग',
                        vibhakti: v, vachana: numIdx + 1, purusha: 3, meaning: item.mean
                    });
                }
            }
        }

        for (let item of NOUN_STEMS['aa_fem']) {
            let s = item.stem;
            let base = s.slice(0, -1);
            let hasR = item.hasR;
            let forms = {
                1: [s, base + 'े', s + 'ः'],
                2: [s + 'म्', base + 'े', s + 'ः'],
                3: [base + 'या', s + 'भ्याम्', s + 'भिः'],
                4: [base + 'ायै', s + 'भ्याम्', s + 'भ्यः'],
                5: [base + 'ायाः', s + 'भ्याम्', s + 'भ्यः'],
                6: [base + 'ायाः', base + 'योः', applyNatva(s + 'नाम्', hasR)],
                7: [base + 'ायाम्', base + 'योः', s + 'सु']
            };
            for (let v = 1; v <= 7; v++) {
                for (let numIdx = 0; numIdx < 3; numIdx++) {
                    addEntry(forms[v][numIdx], {
                        type: 'subanta', category: 'नामपदम् (Noun)', stem: s, linga: 'स्त्रीलिङ्ग',
                        vibhakti: v, vachana: numIdx + 1, purusha: 3, meaning: item.mean
                    });
                }
            }
        }

        for (let item of NOUN_STEMS['i_masc']) {
            let s = item.stem;
            let base = s.slice(0, -1);
            let hasR = item.hasR;
            let forms = {
                1: [s + 'ः', base + 'ी', base + 'यः'],
                2: [s + 'म्', base + 'ी', base + 'ीन्'],
                3: [applyNatva(s + 'ना', hasR), base + 'ीभ्याम्', s + 'भिः'],
                4: [base + 'ये', base + 'ीभ्याम्', s + 'भ्यः'],
                5: [base + 'ेः', base + 'ीभ्याम्', s + 'भ्यः'],
                6: [base + 'ेः', base + '्योः', applyNatva(base + 'ीनाम्', hasR)],
                7: [base + 'ौ', base + '्योः', s + 'षु']
            };
            for (let v = 1; v <= 7; v++) {
                for (let numIdx = 0; numIdx < 3; numIdx++) {
                    addEntry(forms[v][numIdx], {
                        type: 'subanta', category: 'नामपदम् (Noun)', stem: s, linga: 'पुंल्लिङ्ग',
                        vibhakti: v, vachana: numIdx + 1, purusha: 3, meaning: item.mean
                    });
                }
            }
        }

        for (let item of NOUN_STEMS['ee_fem']) {
            let s = item.stem;
            let base = s.slice(0, -1);
            let hasR = item.hasR;
            let forms = {
                1: [s, base + '्यौ', base + '्यः'],
                2: [s + 'म्', base + '्यौ', s + 'ः'],
                3: [base + '्या', s + 'भ्याम्', s + 'भिः'],
                4: [base + '्यै', s + 'भ्याम्', s + 'भ्यः'],
                5: [base + '्याः', s + 'भ्याम्', s + 'भ्यः'],
                6: [base + '्याः', base + '्योः', applyNatva(s + 'नाम्', hasR)],
                7: [base + '्याम्', base + '्योः', s + 'षु']
            };
            for (let v = 1; v <= 7; v++) {
                for (let numIdx = 0; numIdx < 3; numIdx++) {
                    addEntry(forms[v][numIdx], {
                        type: 'subanta', category: 'नामपदम् (Noun)', stem: s, linga: 'स्त्रीलिङ्ग',
                        vibhakti: v, vachana: numIdx + 1, purusha: 3, meaning: item.mean
                    });
                }
            }
        }

        for (let item of NOUN_STEMS['u_masc']) {
            let s = item.stem;
            let base = s.slice(0, -1);
            let hasR = item.hasR;
            let forms = {
                1: [s + 'ः', base + 'ू', base + 'वः'],
                2: [s + 'म्', base + 'ू', base + 'ून्'],
                3: [applyNatva(s + 'ना', hasR), base + 'ूभ्याम्', s + 'भिः'],
                4: [base + 'वे', base + 'ूभ्याम्', s + 'भ्यः'],
                5: [base + 'ोः', base + 'ूभ्याम्', s + 'भ्यः'],
                6: [base + 'ोः', base + '्वोः', applyNatva(base + 'ूनाम्', hasR)],
                7: [base + 'ौ', base + '्वोः', s + 'षु']
            };
            for (let v = 1; v <= 7; v++) {
                for (let numIdx = 0; numIdx < 3; numIdx++) {
                    addEntry(forms[v][numIdx], {
                        type: 'subanta', category: 'नामपदम् (Noun)', stem: s, linga: 'पुंल्लिङ्ग',
                        vibhakti: v, vachana: numIdx + 1, purusha: 3, meaning: item.mean
                    });
                }
            }
        }

        for (let item of NOUN_STEMS['a_neut']) {
            let s = item.stem;
            let hasR = item.hasR;
            let forms = {
                1: [s + 'म्', s + 'े', hasR ? s + 'ाणि' : s + 'ानि'],
                2: [s + 'म्', s + 'े', hasR ? s + 'ाणि' : s + 'ानि'],
                3: [applyNatva(s + 'ेन', hasR), s + 'ाभ्याम्', s + 'ैः'],
                4: [s + 'ाय', s + 'ाभ्याम्', s + 'ेभ्यः'],
                5: [s + 'ात्', s + 'ाभ्याम्', s + 'ेभ्यः'],
                6: [s + 'स्य', s + 'योः', applyNatva(s + 'ानाम्', hasR)],
                7: [s + 'े', s + 'योः', s + 'ेषु']
            };
            for (let v = 1; v <= 7; v++) {
                for (let numIdx = 0; numIdx < 3; numIdx++) {
                    addEntry(forms[v][numIdx], {
                        type: 'subanta', category: 'नामपदम् (Noun)', stem: s, linga: 'नपुंसकलिङ्ग',
                        vibhakti: v, vachana: numIdx + 1, purusha: 3, meaning: item.mean
                    });
                }
            }
        }

        // Kinship (मातृ, पितृ)
        for (let kin of NOUN_STEMS['r_kinship']) {
            for (let [vStr, list] of Object.entries(kin.forms)) {
                let v = parseInt(vStr);
                for (let numIdx = 0; numIdx < 3; numIdx++) {
                    addEntry(list[numIdx], {
                        type: 'subanta', category: 'नामपदम् (Noun)', stem: kin.stem, linga: kin.linga,
                        vibhakti: v, vachana: numIdx + 1, purusha: 3, meaning: kin.mean
                    });
                }
            }
        }

        // 2. Pronouns
        for (let [pKey, pObj] of Object.entries(PRONOUNS)) {
            for (let [vStr, fList] of Object.entries(pObj.forms)) {
                let v = parseInt(vStr);
                for (let numIdx = 0; numIdx < 3; numIdx++) {
                    addEntry(fList[numIdx], {
                        type: 'subanta', category: 'सर्वनाम (Pronoun)', stem: pObj.lemma, linga: pObj.linga,
                        vibhakti: v, vachana: numIdx + 1, purusha: pObj.purusha, meaning: pObj.mean
                    });
                }
            }
        }

        // 3. Adjectives & Numerals
        for (let adj of ADJECTIVES) {
            let s = adj.stem;
            if (adj.isNumeral) {
                if (adj.numVal === 1) {
                    addEntry('एकः', { type: 'adjective', stem: 'एक', linga: 'पुंल्लिङ्ग', vibhakti: 1, vachana: 1 });
                    addEntry('एकम्', { type: 'adjective', stem: 'एक', linga: 'नपुंसकलिङ्ग', vibhakti: 1, vachana: 1 });
                    addEntry('एकं', { type: 'adjective', stem: 'एक', linga: 'नपुंसकलिङ्ग', vibhakti: 1, vachana: 1 });
                    addEntry('एका', { type: 'adjective', stem: 'एक', linga: 'स्त्रीलिङ्ग', vibhakti: 1, vachana: 1 });
                    addEntry('एकम्', { type: 'adjective', stem: 'एक', linga: 'नपुंसकलिङ्ग', vibhakti: 2, vachana: 1 });
                    addEntry('एकं', { type: 'adjective', stem: 'एक', linga: 'नपुंसकलिङ्ग', vibhakti: 2, vachana: 1 });
                } else if (adj.numVal === 2) {
                    addEntry('द्वौ', { type: 'adjective', stem: 'द्वि', linga: 'पुंल्लिङ्ग', vibhakti: 1, vachana: 2 });
                    addEntry('द्वे', { type: 'adjective', stem: 'द्वि', linga: 'स्त्रीलिङ्ग', vibhakti: 1, vachana: 2 });
                } else if (adj.numVal === 3) {
                    addEntry('त्रयः', { type: 'adjective', stem: 'त्रि', linga: 'पुंल्लिङ्ग', vibhakti: 1, vachana: 3 });
                    addEntry('तिस्रः', { type: 'adjective', stem: 'त्रि', linga: 'स्त्रीलिङ्ग', vibhakti: 1, vachana: 3 });
                    addEntry('त्रीणि', { type: 'adjective', stem: 'त्रि', linga: 'नपुंसकलिङ्ग', vibhakti: 1, vachana: 3 });
                } else if (adj.numVal === 4) {
                    addEntry('चत्वारः', { type: 'adjective', stem: 'चतुर्', linga: 'पुंल्लिङ्ग', vibhakti: 1, vachana: 3 });
                    addEntry('चतस्रः', { type: 'adjective', stem: 'चतुर्', linga: 'स्त्रीलिङ्ग', vibhakti: 1, vachana: 3 });
                    addEntry('चत्वारि', { type: 'adjective', stem: 'चतुर्', linga: 'नपुंसकलिङ्ग', vibhakti: 1, vachana: 3 });
                }
                continue;
            }
            if (adj.isMatup) {
                addEntry('बुद्धिमान्', { type: 'adjective', stem: 'बुद्धिमत्', linga: 'पुंल्लिङ्ग', vibhakti: 1, vachana: 1 });
                addEntry('बुद्धिमती', { type: 'adjective', stem: 'बुद्धिमत्', linga: 'स्त्रीलिङ्ग', vibhakti: 1, vachana: 1 });
                continue;
            }

            addEntry(s + 'ः', { type: 'adjective', stem: s, linga: 'पुंल्लिङ्ग', vibhakti: 1, vachana: 1 });
            addEntry(s + 'ौ', { type: 'adjective', stem: s, linga: 'पुंल्लिङ्ग', vibhakti: 1, vachana: 2 });
            addEntry(s + 'ाः', { type: 'adjective', stem: s, linga: 'पुंल्लिङ्ग', vibhakti: 1, vachana: 3 });
            addEntry(s + 'म्', { type: 'adjective', stem: s, linga: 'नपुंसकलिङ्ग', vibhakti: 1, vachana: 1 });
            addEntry(s + 'ं', { type: 'adjective', stem: s, linga: 'नपुंसकलिङ्ग', vibhakti: 1, vachana: 1 });
            addEntry(s + 'े', { type: 'adjective', stem: s, linga: 'नपुंसकलिङ्ग', vibhakti: 1, vachana: 2 });
            addEntry(s + 'ानि', { type: 'adjective', stem: s, linga: 'नपुंसकलिङ्ग', vibhakti: 1, vachana: 3 });

            let fStem = adj.femStem || (s + 'ा');
            addEntry(fStem, { type: 'adjective', stem: s, linga: 'स्त्रीलिङ्ग', vibhakti: 1, vachana: 1 });
            if (adj.altFem) {
                addEntry(adj.altFem, { type: 'adjective', stem: s, linga: 'स्त्रीलिङ्ग', vibhakti: 1, vachana: 1 });
            }
        }

        // 4. Verbs
        for (let [dKey, dObj] of Object.entries(VERB_DHATUS)) {
            for (let [lakara, pObj] of Object.entries(dObj.forms)) {
                for (let [purushaStr, numList] of Object.entries(pObj)) {
                    let p = parseInt(purushaStr);
                    for (let numIdx = 0; numIdx < 3; numIdx++) {
                        let form = numList[numIdx];
                        addEntry(form, {
                            type: 'tinganta', category: 'क्रियापदम् (Verb)', stem: dObj.dhatu, dhatu: dKey,
                            lakara: lakara, purusha: p, vachana: numIdx + 1, meaning: dObj.mean,
                            isTransitive: !!dObj.isTransitive, isDativeGiving: !!dObj.isDativeGiving,
                            isSalutation: !!dObj.isSalutation, isStative: !!dObj.isStative, isMotion: !!dObj.isMotion
                        });
                    }
                }
            }
        }

        // 5. Avyayas
        for (let [avy, aObj] of Object.entries(AVYAYAS)) {
            addEntry(avy, {
                type: 'avyaya', category: 'अव्ययम् (Indeclinable)', stem: avy, meaning: aObj.mean,
                rule: aObj.rule || null, caseReq: aObj.caseReq || null, sūtra: aObj.sūtra || null,
                tenseReq: aObj.tenseReq || null
            });
        }

        // Special Noun: पक्षिन् (पक्षी - 1.1)
        addEntry('पक्षी', { type: 'subanta', category: 'नामपदम् (Noun)', stem: 'पक्षिन्', linga: 'पुंल्लिङ्ग', vibhakti: 1, vachana: 1, purusha: 3, meaning: 'bird' });
        addEntry('पक्षिणौ', { type: 'subanta', category: 'नामपदम् (Noun)', stem: 'पक्षिन्', linga: 'पुंल्लिङ्ग', vibhakti: 1, vachana: 2, purusha: 3, meaning: 'two birds' });
        addEntry('पक्षिणः', { type: 'subanta', category: 'नामपदम् (Noun)', stem: 'पक्षिन्', linga: 'पुंल्लिङ्ग', vibhakti: 1, vachana: 3, purusha: 3, meaning: 'birds' });

        WORD_FORMS_MAP = map;
        return map;
    }

    function lookupWord(token) {
        let map = buildWordFormsMap();
        let cleaned = token.replace(/[।॥,\.!\?;:()\[\]"'`]/g, '').trim();
        if (!cleaned) return [];
        return map.get(cleaned) || [];
    }

    function findFormForStem(stem, linga, vibhakti, vachana) {
        let map = buildWordFormsMap();
        for (let [form, metas] of map.entries()) {
            for (let m of metas) {
                if (m.type === 'subanta' && m.stem === stem && m.vibhakti === vibhakti && m.vachana === vachana) {
                    if (linga === 'त्रिलिङ्ग' || m.linga === linga) {
                        return form;
                    }
                }
            }
        }
        return null;
    }

    function findAdjectiveForm(stem, targetLinga, vibhakti, vachana) {
        let map = buildWordFormsMap();
        for (let [form, metas] of map.entries()) {
            for (let m of metas) {
                if (m.type === 'adjective' && m.stem === stem && m.vibhakti === vibhakti && m.vachana === vachana) {
                    if (m.linga === targetLinga || m.linga === 'त्रिलिङ्ग') {
                        return form;
                    }
                }
            }
        }
        return null;
    }

    function getBareStemInfo(token) {
        let clean = token.replace(/[।॥,\.!\?;:()\[\]"'`]/g, '').trim();
        if (!clean) return null;

        let aMasc = NOUN_STEMS['a_masc'].find(x => x.stem === clean);
        if (aMasc) {
            return { stem: clean, linga: 'पुंल्लिङ्ग', paradigm: 'a_masc', nomSingular: clean + 'ः', meaning: aMasc.mean };
        }
        let iMasc = NOUN_STEMS['i_masc'].find(x => x.stem === clean);
        if (iMasc) {
            return { stem: clean, linga: 'पुंल्लिङ्ग', paradigm: 'i_masc', nomSingular: clean + 'ः', meaning: iMasc.mean };
        }
        let uMasc = NOUN_STEMS['u_masc'].find(x => x.stem === clean);
        if (uMasc) {
            return { stem: clean, linga: 'पुंल्लिङ्ग', paradigm: 'u_masc', nomSingular: clean + 'ः', meaning: uMasc.mean };
        }
        let aNeut = NOUN_STEMS['a_neut'].find(x => x.stem === clean);
        if (aNeut) {
            return { stem: clean, linga: 'नपुंसकलिङ्ग', paradigm: 'a_neut', nomSingular: clean + 'म्', accSingular: clean + 'म्', meaning: aNeut.mean };
        }
        return null;
    }

    // ==========================================
    // 4. SPELLING & ORTHOGRAPHIC CORRECTION
    // ==========================================

    function levenshteinDistance(s1, s2) {
        let m = s1.length, n = s2.length;
        let dp = [];
        for (let i = 0; i <= m; i++) {
            dp[i] = [i];
        }
        for (let j = 0; j <= n; j++) {
            dp[0][j] = j;
        }
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                let cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + cost
                );
            }
        }
        return dp[m][n];
    }

    /**
     * Checks if a word is misspelled and returns spelling suggestions
     */
    function findSpellingCorrection(token) {
        let clean = token.replace(/[।॥,\.!\?;:()\[\]"'`]/g, '').trim();
        if (!clean) return null;

        // 1. Direct Typo Match
        if (KNOWN_TYPOS_MAP[clean]) {
            return {
                suggested: KNOWN_TYPOS_MAP[clean],
                type: 'direct_typo',
                reason: 'वर्तनी-संशोधनम् (Exact Spelling Rectification)'
            };
        }

        // 2. Verb ending in long 'ई' typo
        if (clean.endsWith('ती')) {
            let shortForm = clean.slice(0, -1) + 'ति';
            if (lookupWord(shortForm).length > 0) {
                return {
                    suggested: shortForm,
                    type: 'verb_vowel_length',
                    reason: 'क्रियापदस्य अन्ते ह्रस्व-इकारः (ति) भवेत्, न तु दीर्घ-ईकारः (ती)।'
                };
            }
            let conjunctForm = shortForm.replace('छ', 'च्छ');
            if (lookupWord(conjunctForm).length > 0) {
                return {
                    suggested: conjunctForm,
                    type: 'verb_conjunct_typo',
                    reason: 'क्रियापदस्य शुद्धं रूपम् \'' + conjunctForm + '\' भवेत्।'
                };
            }
        }

        // 3. Feminine noun ending in short 'ि' typo (e.g. सिता -> सीता, नदि -> नदी)
        if (clean.endsWith('ि')) {
            let longForm = clean.slice(0, -1) + 'ी';
            if (lookupWord(longForm).length > 0) {
                return {
                    suggested: longForm,
                    type: 'noun_vowel_length',
                    reason: 'ई-कारान्त स्त्रीलिङ्गशब्दे अन्ते दीर्घ-ईकारः (ी) भवेत्।'
                };
            }
        }

        // 4. Missing conjuncts / sibilants / aspirates
        if (clean.includes('छ') && !clean.includes('च्छ')) {
            let cForm = clean.replace('छ', 'च्छ');
            if (lookupWord(cForm).length > 0) {
                return { suggested: cForm, type: 'conjunct_typo', reason: `'${clean}' स्थाने शुद्धं रूपम् '${cForm}' भवेत्।` };
            }
        }
        if (clean.includes('क्स')) {
            let cForm = clean.replace(/क्स/g, 'क्ष');
            if (lookupWord(cForm).length > 0) {
                return { suggested: cForm, type: 'sibilant_typo', reason: `'${clean}' स्थाने शुद्धं रूपम् '${cForm}' भवेत्।` };
            }
        }
        if (clean.includes('स')) {
            let cFormSh = clean.replace(/स/g, 'श');
            if (lookupWord(cFormSh).length > 0) {
                return { suggested: cFormSh, type: 'sibilant_typo', reason: `'${clean}' स्थाने शुद्धं रूपम् '${cFormSh}' भवेत्।` };
            }
            let cFormSh2 = clean.replace(/स/g, 'ष');
            if (lookupWord(cFormSh2).length > 0) {
                return { suggested: cFormSh2, type: 'sibilant_typo', reason: `'${clean}' स्थाने शुद्धं रूपम् '${cFormSh2}' भवेत्।` };
            }
        }

        // 5. Missing Halanta on final consonant
        if (clean.endsWith('म')) {
            let halantaForm = clean + '्';
            if (lookupWord(halantaForm).length > 0) {
                return {
                    suggested: halantaForm,
                    type: 'missing_halanta',
                    reason: 'पदान्ते मकारः हलन्तयुक्तः (म्) भवेत्।'
                };
            }
        }
        if (clean.endsWith('त')) {
            let halantaForm = clean + '्';
            if (lookupWord(halantaForm).length > 0) {
                return {
                    suggested: halantaForm,
                    type: 'missing_halanta',
                    reason: 'पदान्ते तकारः हलन्तयुक्तः (त्) भवेत्।'
                };
            }
        }

        // 6. Fuzzy Edit Distance Search in Sanskrit Lexicon
        let map = buildWordFormsMap();
        let bestCandidate = null;
        let minDistance = 999;

        for (let validWord of map.keys()) {
            if (Math.abs(validWord.length - clean.length) <= 2) {
                let dist = levenshteinDistance(clean, validWord);
                if (dist < minDistance && dist <= 2) {
                    minDistance = dist;
                    bestCandidate = validWord;
                }
            }
        }

        if (bestCandidate && minDistance <= 2) {
            return {
                suggested: bestCandidate,
                type: 'fuzzy_levenshtein',
                reason: `'${clean}' इति अशुद्ध-वर्तनी अस्ति। शुद्धं रूपम्: '${bestCandidate}'।`
            };
        }

        return null;
    }

    // ==========================================
    // 5. MULTI-STAGE GRAMMAR & SPELL RULES
    // ==========================================

    function tokenizeSanskrit(text) {
        if (!text) return [];
        text = text.replace(/([\u0900-\u097F]):/g, '$1ः');

        let rawParts = text.trim().split(/\s+/);
        let tokens = [];
        rawParts.forEach((part, idx) => {
            let clean = part.replace(/[।॥,\.!\?;:()\[\]"'`]/g, '').trim();
            tokens.push({ index: idx, raw: part, clean: clean });
        });
        return tokens;
    }

    /**
     * Master Pipeline analyzing all constraints, spellings, and grammar rules
     */
    function analyzeAndCorrect(inputSentence) {
        if (!inputSentence || !inputSentence.trim()) {
            return {
                original: '', corrected: '', isCorrect: true, issues: [], tokenAnalyses: [],
                explanationSummary: 'कृपया संस्कृत-वाक्यं प्रविशतु। (Please enter a Sanskrit sentence).'
            };
        }

        inputSentence = inputSentence.replace(/([\u0900-\u097F]):/g, '$1ः');

        let orig = inputSentence.trim();
        let tokens = tokenizeSanskrit(orig);
        buildWordFormsMap();

        let allIssues = [];
        let parsedTokens = tokens.map((t, idx) => {
            let parses = lookupWord(t.clean);
            let bareInfo = getBareStemInfo(t.clean);

            // 1. Check Spelling Typos if unrecognized
            if (parses.length === 0 && !bareInfo) {
                let spellFix = findSpellingCorrection(t.clean);
                if (spellFix && spellFix.suggested !== t.clean) {
                    allIssues.push({
                        tokenIndex: idx,
                        origToken: t.raw,
                        correctedToken: spellFix.suggested,
                        type: 'spelling_typo',
                        category: 'वर्ण-दोष (Spelling Error)',
                        severity: 'error',
                        title: 'अशुद्ध-वर्तनी (Spelling Typo)',
                        explanation: spellFix.reason
                    });
                    parses = lookupWord(spellFix.suggested);
                    t.clean = spellFix.suggested;
                }
            }

            // 2. Check if neuter noun was given erroneous masculine visarga (e.g. फलः, जलः, पुस्तकः)
            if (parses.length === 0 && t.clean.endsWith('ः')) {
                let neutStem = t.clean.slice(0, -1);
                let aNeut = NOUN_STEMS['a_neut'].find(x => x.stem === neutStem);
                if (aNeut) {
                    parses = [{
                        type: 'subanta', category: 'नामपदम् (Noun)', stem: neutStem,
                        linga: 'नपुंसकलिङ्ग', vibhakti: 1, vachana: 1, purusha: 3, meaning: aNeut.mean,
                        isErroneousVisargaOnNeuter: true
                    }];
                }
            }

            // 3. If token has no inflected parses but matches a known bare stem, flag Apada error
            if (parses.length === 0 && bareInfo) {
                if (bareInfo.linga === 'पुंल्लिङ्ग') {
                    allIssues.push({
                        tokenIndex: idx,
                        origToken: t.raw,
                        correctedToken: bareInfo.nomSingular,
                        type: 'bare_stem_missing_visarga',
                        category: 'अपद-दोष (Bare Stem / Missing Visarga)',
                        severity: 'error',
                        title: 'अपदं न प्रयुञ्जीत / प्रातिपदिकार्थे प्रथमा (२.३.४६)',
                        explanation: `संस्कृते केवलस्य प्रातिपदिकस्य (अपदस्य) प्रयोगः अशुद्धः। कर्तृपदे प्रथमा-एकवचने विसर्गयुक्तं रूपं '${bareInfo.nomSingular}' भवेत्।`
                    });
                    parses = [{
                        type: 'subanta', category: 'नामपदम् (Noun)', stem: bareInfo.stem,
                        linga: bareInfo.linga, vibhakti: 1, vachana: 1, purusha: 3, meaning: bareInfo.meaning
                    }];
                } else if (bareInfo.linga === 'नपुंसकलिङ्ग') {
                    let fix = bareInfo.accSingular.slice(0, -2) + 'ं';
                    allIssues.push({
                        tokenIndex: idx,
                        origToken: t.raw,
                        correctedToken: fix,
                        type: 'bare_stem_neuter',
                        category: 'अपद-दोष (Bare Stem)',
                        severity: 'error',
                        title: 'अपदं न प्रयुञ्जीत / कर्मणि द्वितीया',
                        explanation: `संस्कृते केवलस्य प्रातिपदिकस्य प्रयोगः अशुद्धः। द्वितीया-एकवचने '${fix}' भवेत्।`
                    });
                    parses = [{
                        type: 'subanta', category: 'नामपदम् (Noun)', stem: bareInfo.stem,
                        linga: bareInfo.linga, vibhakti: 2, vachana: 1, purusha: 3, meaning: bareInfo.meaning
                    }];
                }
            }

            return {
                ...t,
                parses: parses
            };
        });

        let n = parsedTokens.length;

        // Sentential Components
        let subjectCandidates = [];
        let verbCandidates = [];
        let temporalAvyaya = null;

        parsedTokens.forEach((pt, idx) => {
            let subParse = pt.parses.find(p => p.type === 'subanta' && p.vibhakti === 1);
            if (subParse) subjectCandidates.push({ tokenIndex: idx, parse: subParse, pt });

            let verbParse = pt.parses.find(p => p.type === 'tinganta');
            if (verbParse) verbCandidates.push({ tokenIndex: idx, parse: verbParse, pt });

            let tempParse = pt.parses.find(p => p.type === 'avyaya' && p.tenseReq);
            if (tempParse) temporalAvyaya = tempParse;
        });

        let primarySubj = subjectCandidates.length > 0 ? subjectCandidates[0] : null;
        let primaryVerb = verbCandidates.length > 0 ? verbCandidates[0] : null;

        // Numeral Adjective modifier on subject
        if (primarySubj && primarySubj.tokenIndex > 0) {
            let prevPt = parsedTokens[primarySubj.tokenIndex - 1];
            let numAdj = prevPt.parses.find(p => p.type === 'adjective' && p.stem === 'द्वि');
            if (numAdj) primarySubj.parse = { ...primarySubj.parse, vachana: 2 };
            let triAdj = prevPt.parses.find(p => p.type === 'adjective' && (p.stem === 'त्रि' || p.stem === 'चतुर्'));
            if (triAdj) primarySubj.parse = { ...primarySubj.parse, vachana: 3 };
        }

        // Rule A: Temporal Adverb Tense Concord
        if (temporalAvyaya && primaryVerb) {
            let reqTense = temporalAvyaya.tenseReq;
            let currentLakara = primaryVerb.parse.lakara;

            if (currentLakara !== reqTense) {
                let subjP = primarySubj ? (primarySubj.parse.purusha || 3) : primaryVerb.parse.purusha;
                let subjV = primarySubj ? (primarySubj.parse.vachana || 1) : primaryVerb.parse.vachana;
                let dObj = VERB_DHATUS[primaryVerb.parse.dhatu];

                let correctedVerb = null;
                if (dObj && dObj.forms && dObj.forms[reqTense] && dObj.forms[reqTense][subjP]) {
                    correctedVerb = dObj.forms[reqTense][subjP][subjV - 1];
                }

                if (correctedVerb) {
                    allIssues.push({
                        tokenIndex: primaryVerb.tokenIndex,
                        origToken: primaryVerb.pt.raw,
                        correctedToken: correctedVerb,
                        type: 'temporal_tense',
                        category: 'काल-दोष (Tense Concord)',
                        severity: 'error',
                        title: 'काल-सङ्गतिः (Tense Agreement)',
                        explanation: `'${temporalAvyaya.stem}' इत्यनेन सह ${reqTense} लकारस्य प्रयोगः भवति -> '${correctedVerb}'।`
                    });
                }
            }
        }

        // Rule B: Subject-Verb Person & Number Agreement
        if (primarySubj && primaryVerb && (!temporalAvyaya || primaryVerb.parse.lakara === temporalAvyaya.tenseReq)) {
            let subjP = primarySubj.parse.purusha || 3;
            let subjV = primarySubj.parse.vachana || 1;
            let verbP = primaryVerb.parse.purusha;
            let verbV = primaryVerb.parse.vachana;

            if (subjP !== verbP || subjV !== verbV) {
                let dObj = VERB_DHATUS[primaryVerb.parse.dhatu];
                let lakara = primaryVerb.parse.lakara || 'लट्';
                let correctedVerb = null;

                if (dObj && dObj.forms && dObj.forms[lakara] && dObj.forms[lakara][subjP]) {
                    correctedVerb = dObj.forms[lakara][subjP][subjV - 1];
                }

                if (correctedVerb) {
                    allIssues.push({
                        tokenIndex: primaryVerb.tokenIndex,
                        origToken: primaryVerb.pt.raw,
                        correctedToken: correctedVerb,
                        type: 'agreement_subject_verb',
                        category: 'कर्तृ-क्रिया अन्वय-दोष (Subject-Verb Agreement)',
                        severity: 'error',
                        title: 'कर्तरि प्रयोगे पुरुष-वचन सङ्गतिः',
                        explanation: `कर्ता '${primarySubj.pt.clean}' अनुसारं क्रिया '${correctedVerb}' भवितव्या।`
                    });
                }
            }
        }

        // Rule C: Upapada Governing Rules
        for (let i = 0; i < n; i++) {
            let pt = parsedTokens[i];
            let avyParse = pt.parses.find(p => p.type === 'avyaya' && p.rule && p.rule.startsWith('upapada'));

            if (avyParse) {
                let reqCase = avyParse.caseReq;
                let govIdx = i > 0 ? (i - 1) : (i + 1 < n ? i + 1 : -1);

                if (govIdx >= 0) {
                    let govPt = parsedTokens[govIdx];
                    let subParse = govPt.parses.find(p => p.type === 'subanta');

                    if (subParse && subParse.vibhakti !== reqCase) {
                        let corrected = findFormForStem(subParse.stem, subParse.linga, reqCase, subParse.vachana || 1);
                        if (corrected) {
                            allIssues.push({
                                tokenIndex: govIdx,
                                origToken: govPt.raw,
                                correctedToken: corrected,
                                type: 'upapada_case',
                                category: 'उपपद-विभक्ति दोष (Governing Case Error)',
                                severity: 'error',
                                title: avyParse.sūtra || 'उपपद-विभक्ति नियमः',
                                explanation: `'${pt.clean}' इति योगे ${reqCase}-विभक्तिः भवेत् -> '${corrected}'।`
                            });
                        }
                    }
                }
            }
        }

        // Rule D: Dative of Recipient with Giving / Salutations
        if (primaryVerb) {
            let isGiving = primaryVerb.parse.isDativeGiving;
            let isSalute = primaryVerb.parse.isSalutation;

            if (isGiving || isSalute) {
                for (let i = 0; i < n; i++) {
                    if (primarySubj && i === primarySubj.tokenIndex) continue;
                    if (i === primaryVerb.tokenIndex) continue;

                    let pt = parsedTokens[i];
                    let subParse = pt.parses.find(p => p.type === 'subanta');

                    if (subParse && subParse.vibhakti !== 4) {
                        let recipientStems = ['भक्त', 'छात्र', 'बालक', 'पुत्र', 'सीता', 'पुत्री', 'देव', 'गुरु'];
                        if (recipientStems.includes(subParse.stem)) {
                            let corrected = findFormForStem(subParse.stem, subParse.linga, 4, subParse.vachana || 1);
                            if (corrected) {
                                allIssues.push({
                                    tokenIndex: i,
                                    origToken: pt.raw,
                                    correctedToken: corrected,
                                    type: 'dative_recipient',
                                    category: 'सम्प्रदाने चतुर्थी (Dative Case)',
                                    severity: 'error',
                                    title: isGiving ? 'कर्मणा यमभिप्रेति स सम्प्रदानम् (२.३.१३)' : 'नमोयोगे / सम्प्रदाने चतुर्थी',
                                    explanation: `दानक्रियायाः पात्रस्य सम्प्रदानसंज्ञा भवति अतः चतुर्थी विभक्तिः स्यात् -> '${corrected}'।`
                                });
                            }
                        }
                    }
                }
            }
        }

        // Rule E: Direct Object (Karma) Case Checker
        if (primaryVerb) {
            let isTransitive = primaryVerb.parse.isTransitive;
            let isMotion = primaryVerb.parse.isMotion;
            let isStative = primaryVerb.parse.isStative;

            for (let i = 0; i < n; i++) {
                if (primarySubj && i === primarySubj.tokenIndex) continue;
                if (i === primaryVerb.tokenIndex) continue;

                let pt = parsedTokens[i];
                let subParse = pt.parses.find(p => p.type === 'subanta');

                if (subParse) {
                    if (isTransitive || isMotion) {
                        let isErroneousCase = (subParse.vibhakti === 1 && subParse.category.includes('नामपदम्')) ||
                                             (subParse.vibhakti === 6 && !parsedTokens.some(other => other.clean.includes('उत्तर') || other.clean.includes('उपरि'))) ||
                                             (subParse.vibhakti === 7 && isMotion);

                        if (isErroneousCase) {
                            let corrected = findFormForStem(subParse.stem, subParse.linga, 2, subParse.vachana || 1);
                            if (corrected) {
                                if (corrected.endsWith('म्') && i + 1 < n && !SWARA_SET.has(parsedTokens[i+1].clean[0])) {
                                    corrected = corrected.slice(0, -2) + 'ं';
                                }
                                if (corrected !== pt.clean) {
                                    allIssues.push({
                                        tokenIndex: i,
                                        origToken: pt.raw,
                                        correctedToken: corrected,
                                        type: 'karma_dvitiya',
                                        category: 'कर्मणि द्वितीया (Accusative Case)',
                                        severity: 'error',
                                        title: isMotion ? 'गत्यर्थकर्मणि द्वितीया' : 'कर्तुरीप्सिततमं कर्म (२.३.२)',
                                        explanation: `कर्मपदे द्वितीया विभक्तिः भवेत् -> '${corrected}'।`
                                    });
                                }
                            }
                        }
                    } else if (isStative) {
                        if (subParse.vibhakti === 2) {
                            let corrected = findFormForStem(subParse.stem, subParse.linga, 7, subParse.vachana || 1);
                            if (corrected) {
                                allIssues.push({
                                    tokenIndex: i,
                                    origToken: pt.raw,
                                    correctedToken: corrected,
                                    type: 'adhikarana_saptami',
                                    category: 'अधिकरणे सप्तमी (Locative Case)',
                                    severity: 'error',
                                    title: 'सप्तम्यधिकरणे च (२.३.३६)',
                                    explanation: `क्रियायाः आधारस्य अधिकरणसंज्ञा भवति अतः सप्तमी विभक्तिः स्यात् -> '${corrected}'।`
                                });
                            }
                        }
                    }
                }
            }
        }

        // Rule F: Genitive in "प्रश्नं उत्तरं ददाति"
        for (let i = 0; i < n - 1; i++) {
            if (parsedTokens[i].clean.includes('प्रश्न') && parsedTokens[i+1].clean.includes('उत्तर')) {
                allIssues.push({
                    tokenIndex: i,
                    origToken: parsedTokens[i].raw,
                    correctedToken: 'प्रश्नस्य',
                    type: 'shashthi_sambandha',
                    category: 'षष्ठी शेषे (Genitive Case)',
                    severity: 'error',
                    title: 'षष्ठी शेषे (२.३.५०)',
                    explanation: `'उत्तरम्' इत्यनेन सम्बन्धे 'प्रश्नस्य' इति षष्ठी विभक्तिः भवति।`
                });
            }
        }

        // Rule G: Adjective & Numeral Concord
        for (let i = 0; i < n; i++) {
            let pt = parsedTokens[i];
            let adjParse = pt.parses.find(p => p.type === 'adjective');

            let targetNounPt = null;
            let targetNounParse = null;

            if (adjParse) {
                if (i + 1 < n) {
                    let nextP = parsedTokens[i+1].parses.find(p => p.type === 'subanta' && p.category.includes('नामपदम्'));
                    if (nextP) { targetNounPt = parsedTokens[i+1]; targetNounParse = nextP; }
                }
                if (!targetNounPt && primarySubj) {
                    targetNounPt = primarySubj.pt;
                    targetNounParse = primarySubj.parse;
                }

                if (targetNounPt && targetNounParse) {
                    let targetLinga = targetNounParse.linga;
                    let targetNum = targetNounParse.vachana || 1;
                    let targetVibh = targetNounParse.vibhakti || 1;

                    if (adjParse.stem === 'द्वि' && targetNum !== 2) {
                        let correctedNoun = findFormForStem(targetNounParse.stem, targetLinga, targetVibh, 2);
                        if (correctedNoun) {
                            allIssues.push({
                                tokenIndex: targetNounPt.index,
                                origToken: targetNounPt.raw,
                                correctedToken: correctedNoun,
                                type: 'numeral_noun_dual',
                                category: 'द्विवचन-सङ्गतिः (Dual Concord)',
                                severity: 'error',
                                title: 'सङ्ख्या-वचन सङ्गतिः',
                                explanation: `'द्वौ/द्वे' सङ्ख्यायाः प्रयोगे नामपदं द्विवचने भवेत् -> '${correctedNoun}'।`
                            });
                        }
                    }
                    if (adjParse.stem === 'त्रि' && targetNum !== 3) {
                        let correctedNoun = findFormForStem(targetNounParse.stem, targetLinga, targetVibh, 3);
                        if (correctedNoun) {
                            allIssues.push({
                                tokenIndex: targetNounPt.index,
                                origToken: targetNounPt.raw,
                                correctedToken: correctedNoun,
                                type: 'numeral_noun_plural',
                                category: 'बहुवचन-सङ्गतिः (Plural Concord)',
                                severity: 'error',
                                title: 'सङ्ख्या-वचन सङ्गतिः',
                                explanation: `'त्रयः' सङ्ख्यायाः प्रयोगे नामपदं बहुवचने भवेत् -> '${correctedNoun}'।`
                            });
                        }
                    }

                    let isLingaMismatch = (adjParse.linga !== 'त्रिलिङ्ग' && adjParse.linga !== targetLinga);
                    let isVibhMismatch = (adjParse.vibhakti !== targetVibh);

                    if (isLingaMismatch || isVibhMismatch) {
                        let correctedAdj = findAdjectiveForm(adjParse.stem, targetLinga, targetVibh, targetNum);
                        if (correctedAdj) {
                            allIssues.push({
                                tokenIndex: i,
                                origToken: pt.raw,
                                correctedToken: correctedAdj,
                                type: 'agreement_adjective_noun',
                                category: 'विशेषण-विशेष्य सङ्गतिः (Adjective Agreement)',
                                severity: 'error',
                                title: 'विशेषण-विशेष्य भावः',
                                explanation: `विशेषणस्य लिङ्गं विशेष्यानुसारं (${targetLinga}) भवेत् -> '${correctedAdj}'।`
                            });
                        }
                    }
                }
            }

            // Predicate noun gender concord
            if (primarySubj && i !== primarySubj.tokenIndex && i !== (primaryVerb ? primaryVerb.tokenIndex : -1)) {
                let nounP = pt.parses.find(p => p.type === 'subanta' && p.vibhakti === 1 && p.category.includes('नामपदम्'));
                if (nounP && nounP.linga !== primarySubj.parse.linga && nounP.linga !== 'त्रिलिङ्ग') {
                    let correctedNoun = null;
                    if (primarySubj.parse.linga === 'स्त्रीलिङ्ग' && nounP.stem === 'बालक') correctedNoun = 'बालिका';
                    else if (primarySubj.parse.linga === 'पुंल्लिङ्ग' && nounP.stem === 'बालिका') correctedNoun = 'बालकः';

                    if (correctedNoun) {
                        allIssues.push({
                            tokenIndex: i,
                            origToken: pt.raw,
                            correctedToken: correctedNoun,
                            type: 'predicate_gender',
                            category: 'लिङ्ग-सङ्गतिः (Gender Concord)',
                            severity: 'error',
                            title: 'कर्तृ-विधेय लिङ्ग सङ्गतिः',
                            explanation: `विधेयपदस्य लिङ्गं कर्तृपदानुसारं (${primarySubj.parse.linga}) भवेत् -> '${correctedNoun}'।`
                        });
                    }
                }
            }
        }

        // Rule H: Sandhi (Anusvara & Visarga)
        for (let i = 0; i < n; i++) {
            let curr = tokens[i].clean;
            let next = (i + 1 < n) ? tokens[i + 1].clean : null;

            if (curr.endsWith('म्') && next) {
                let firstOfNext = next[0];
                if (!SWARA_SET.has(firstOfNext) && firstOfNext !== 'ऽ') {
                    let fix = curr.slice(0, -2) + 'ं';
                    allIssues.push({
                        tokenIndex: i,
                        origToken: tokens[i].raw,
                        correctedToken: fix,
                        type: 'sandhi_anusvara',
                        category: 'सन्धि-दोष (Sandhi Rule)',
                        severity: 'warning',
                        title: 'मोऽनुस्वारः (८.३.२३)',
                        explanation: `व्यञ्जनवर्णात् पूर्वं मकारस्य अनुस्वारः भवति -> '${fix}'।`
                    });
                }
            } else if (curr.endsWith('ं') && next) {
                let firstOfNext = next[0];
                if (SWARA_SET.has(firstOfNext)) {
                    let fix = curr.slice(0, -1) + 'म्';
                    allIssues.push({
                        tokenIndex: i,
                        origToken: tokens[i].raw,
                        correctedToken: fix,
                        type: 'sandhi_anusvara_svara',
                        category: 'सन्धि-दोष (Sandhi Rule)',
                        severity: 'warning',
                        title: 'स्वरसन्धिः',
                        explanation: `स्वरवर्णात् पूर्वम् अनुस्वारस्य मकारः भवति -> '${fix}'।`
                    });
                }
            }
        }

        // Reconstruction
        let correctedTokens = tokens.map(t => t.raw);
        let issueMapByToken = new Map();

        allIssues.forEach(iss => {
            if (!issueMapByToken.has(iss.tokenIndex)) issueMapByToken.set(iss.tokenIndex, []);
            issueMapByToken.get(iss.tokenIndex).push(iss);
        });

        issueMapByToken.forEach((issuesForToken, tokenIdx) => {
            let primaryFix = issuesForToken.find(iss => iss.severity === 'error') || issuesForToken[0];
            if (primaryFix && primaryFix.correctedToken) {
                let trailingPunct = tokens[tokenIdx].raw.match(/[।॥,\.!\?;:()\[\]"'`]+$/);
                let punct = trailingPunct ? trailingPunct[0] : '';
                correctedTokens[tokenIdx] = primaryFix.correctedToken + punct;
            }
        });

        let correctedSentence = correctedTokens.join(' ');
        correctedSentence = correctedSentence.replace(/ं([।॥])/g, 'म्$1');

        // Morphological Table & Explanation
        let morphologicalTable = parsedTokens.map((pt, idx) => {
            let bestParse = pt.parses[0] || null;
            let hasIssue = issueMapByToken.has(idx);
            let tokenIssues = issueMapByToken.get(idx) || [];

            return {
                word: pt.raw,
                clean: pt.clean,
                hasIssue: hasIssue,
                issues: tokenIssues,
                stem: bestParse ? (bestParse.stem || bestParse.dhatu || '-') : 'अज्ञातम्',
                category: bestParse ? bestParse.category : 'अनिश्चितम्',
                linga: bestParse ? (bestParse.linga || '-') : '-',
                vibhakti: bestParse && bestParse.vibhakti ? `${bestParse.vibhakti} (विभक्ति)` : '-',
                vachana: bestParse && bestParse.vachana ? (bestParse.vachana === 1 ? 'एकवचनम्' : bestParse.vachana === 2 ? 'द्विवचनम्' : 'बहुवचनम्') : '-',
                purusha: bestParse && bestParse.purusha ? (bestParse.purusha === 1 ? 'उत्तमपुरुषः' : bestParse.purusha === 2 ? 'मध्यमपुरुषः' : 'प्रथमपुरुषः') : '-',
                lakara: bestParse && bestParse.lakara ? bestParse.lakara : '-',
                meaning: bestParse ? (bestParse.meaning || '-') : '-'
            };
        });

        let isCorrect = allIssues.length === 0;
        let explanationLines = [];

        if (isCorrect) {
            explanationLines.push('✅ साधु! अस्मिन् वाक्ये कोऽपि व्याकरण-दोषः नास्ति।');
            explanationLines.push('(Excellent! This sentence is grammatically sound).');
        } else {
            explanationLines.push(`🔍 वाक्ये ${allIssues.length} व्याकरण-संशोधनानि प्राप्तानि (Found ${allIssues.length} issue(s)):`);
            allIssues.forEach((iss, i) => {
                explanationLines.push(`\n${i + 1}. [${iss.category}] ${iss.title}`);
                explanationLines.push(`   • दोषयुक्तं पदम्: "${iss.origToken}" ➔ शुद्धम्: "${iss.correctedToken}"`);
                explanationLines.push(`   • विवरणम्: ${iss.explanation}`);
            });
        }

        return {
            original: orig,
            corrected: correctedSentence,
            isCorrect: isCorrect,
            issues: allIssues,
            tokenAnalyses: morphologicalTable,
            explanationSummary: explanationLines.join('\n')
        };
    }

    // ==========================================
    // 6. SANSKRIT DICTIONARY & PARADIGM EXPLORER
    // ==========================================

    /**
     * Builds and returns a rich list of all dictionary entries
     */
    function getDictionaryDatabase() {
        let entries = [];

        // Nouns
        for (let [groupKey, stems] of Object.entries(NOUN_STEMS)) {
            if (groupKey === 'r_kinship') {
                for (let item of stems) {
                    entries.push({
                        title: item.stem,
                        type: 'नामपदम् (Noun)',
                        subType: 'ऋ-कारान्त ' + item.linga,
                        meaningEn: item.mean,
                        meaningHi: item.hindi || '',
                        gender: item.linga,
                        examples: item.stem === 'मातृ' ? ['माता बालकं पालयति।', 'मात्रा सह गच्छति।'] : ['पिता पुत्राय पुस्तकं ददाति।', 'पितरः गृहं गच्छन्ति।'],
                        paradigmData: item.forms
                    });
                }
                continue;
            }

            let groupLabels = {
                'a_masc': 'अ-कारान्त पुंल्लिङ्ग (Masculine)',
                'aa_fem': 'आ-कारान्त स्त्रीलिङ्ग (Feminine)',
                'i_masc': 'इ-कारान्त पुंल्लिङ्ग (Masculine)',
                'ee_fem': 'ई-कारान्त स्त्रीलिङ्ग (Feminine)',
                'u_masc': 'उ-कारान्त पुंल्लिङ्ग (Masculine)',
                'a_neut': 'अ-कारान्त नपुंसकलिङ्ग (Neuter)'
            };

            for (let item of stems) {
                let s = item.stem;
                let forms = generateNounTable(s, groupKey, item.hasR);
                entries.push({
                    title: s,
                    type: 'नामपदम् (Noun)',
                    subType: groupLabels[groupKey] || groupKey,
                    meaningEn: item.mean,
                    meaningHi: item.hindi || '',
                    gender: groupKey.includes('masc') ? 'पुंल्लिङ्ग' : (groupKey.includes('fem') ? 'स्त्रीलिङ्ग' : 'नपुंसकलिङ्ग'),
                    examples: [`${s}ः अस्ति।`, `${s}ं पश्यति।`],
                    paradigmData: forms
                });
            }
        }

        // Verbs
        for (let [dKey, dObj] of Object.entries(VERB_DHATUS)) {
            entries.push({
                title: dObj.dhatu,
                type: 'क्रियापदम् (Verb / धातु)',
                subType: `${dObj.gana || 'भ्वादिगण'} • ${dObj.pada || 'परस्मैपद'}`,
                meaningEn: dObj.mean,
                meaningHi: dObj.hindi || '',
                examples: [`सः ${dObj.forms['लट्'][3][0]}।`, `अहं ${dObj.forms['लट्'][1][0]}।`],
                isVerb: true,
                verbForms: dObj.forms
            });
        }

        // Pronouns
        for (let [pKey, pObj] of Object.entries(PRONOUNS)) {
            entries.push({
                title: pObj.lemma,
                type: 'सर्वनामपदम् (Pronoun)',
                subType: pObj.linga,
                meaningEn: pObj.mean,
                meaningHi: pObj.hindi || '',
                examples: [`${pObj.forms[1][0]} गच्छामि।`, `${pObj.forms[6][0]} पुस्तकम् अस्ति।`],
                paradigmData: pObj.forms
            });
        }

        // Adjectives
        for (let adj of ADJECTIVES) {
            entries.push({
                title: adj.stem,
                type: 'विशेषणपदम् (Adjective)',
                subType: adj.isNumeral ? 'सङ्ख्यावाचकम् (Numeral)' : 'गुणवाचकम् (Descriptive)',
                meaningEn: adj.mean,
                meaningHi: adj.hindi || '',
                examples: [`${adj.stem}ः बालकः अस्ति।`]
            });
        }

        // Avyayas
        for (let [avy, aObj] of Object.entries(AVYAYAS)) {
            entries.push({
                title: avy,
                type: 'अव्ययपदम् (Indeclinable)',
                subType: aObj.rule ? 'उपपद-सम्बन्धः' : 'क्रियाविशेषणम् / अव्ययम्',
                meaningEn: aObj.mean,
                meaningHi: aObj.hindi || '',
                sūtra: aObj.sūtra || '',
                examples: [`${avy} प्रयोगः भवति।`]
            });
        }

        return entries;
    }

    function generateNounTable(s, groupKey, hasR) {
        if (groupKey === 'a_masc') {
            return {
                1: [s + 'ः', s + 'ौ', s + 'ाः'],
                2: [s + 'म्', s + 'ौ', s + 'ान्'],
                3: [applyNatva(s + 'ेन', hasR), s + 'ाभ्याम्', s + 'ैः'],
                4: [s + 'ाय', s + 'ाभ्याम्', s + 'ेभ्यः'],
                5: [s + 'ात्', s + 'ाभ्याम्', s + 'ेभ्यः'],
                6: [s + 'स्य', s + 'योः', applyNatva(s + 'ानाम्', hasR)],
                7: [s + 'े', s + 'योः', s + 'ेषु']
            };
        }
        if (groupKey === 'aa_fem') {
            let base = s.slice(0, -1);
            return {
                1: [s, base + 'े', s + 'ः'],
                2: [s + 'म्', base + 'े', s + 'ः'],
                3: [base + 'या', s + 'भ्याम्', s + 'भिः'],
                4: [base + 'ायै', s + 'भ्याम्', s + 'भ्यः'],
                5: [base + 'ायाः', s + 'भ्याम्', s + 'भ्यः'],
                6: [base + 'ायाः', base + 'योः', applyNatva(s + 'नाम्', hasR)],
                7: [base + 'ायाम्', base + 'योः', s + 'सु']
            };
        }
        if (groupKey === 'a_neut') {
            return {
                1: [s + 'म्', s + 'े', hasR ? s + 'ाणि' : s + 'ानि'],
                2: [s + 'म्', s + 'े', hasR ? s + 'ाणि' : s + 'ानि'],
                3: [applyNatva(s + 'ेन', hasR), s + 'ाभ्याम्', s + 'ैः'],
                4: [s + 'ाय', s + 'ाभ्याम्', s + 'ेभ्यः'],
                5: [s + 'ात्', s + 'ाभ्याम्', s + 'ेभ्यः'],
                6: [s + 'स्य', s + 'योः', applyNatva(s + 'ानाम्', hasR)],
                7: [s + 'े', s + 'योः', s + 'ेषु']
            };
        }
        return {};
    }

    /**
     * Search dictionary matching query in Devanagari, English or Transliteration
     */
    function searchDictionary(query, filterType) {
        if (!query && !filterType) return getDictionaryDatabase();
        let q = (query || '').toLowerCase().trim();
        let db = getDictionaryDatabase();

        let devanagariQ = '';
        let devanagariQAlt = '';
        if (typeof SanskritTransliterate !== 'undefined' && SanskritTransliterate.hasRoman(q)) {
            devanagariQ = SanskritTransliterate.toDevanagari(q).trim();
            if (devanagariQ.endsWith('ि')) {
                devanagariQAlt = devanagariQ.slice(0, -1) + 'ी';
            } else if (devanagariQ.endsWith('ी')) {
                devanagariQAlt = devanagariQ.slice(0, -1) + 'ि';
            } else if (devanagariQ.endsWith('ु')) {
                devanagariQAlt = devanagariQ.slice(0, -1) + 'ू';
            } else if (devanagariQ.endsWith('ू')) {
                devanagariQAlt = devanagariQ.slice(0, -1) + 'ु';
            }
        }

        return db.filter(item => {
            if (filterType && filterType !== 'all') {
                if (filterType === 'noun' && !item.type.includes('नामपदम्')) return false;
                if (filterType === 'verb' && !item.type.includes('क्रियापदम्')) return false;
                if (filterType === 'pronoun' && !item.type.includes('सर्वनाम')) return false;
                if (filterType === 'adjective' && !item.type.includes('विशेषण')) return false;
                if (filterType === 'avyaya' && !item.type.includes('अव्यय')) return false;
            }

            if (!q) return true;

            let titleMatch = item.title.toLowerCase().includes(q) ||
                             (devanagariQ && item.title.includes(devanagariQ)) ||
                             (devanagariQAlt && item.title.includes(devanagariQAlt));
            let enMatch = item.meaningEn.toLowerCase().includes(q);
            let hiMatch = (item.meaningHi || '').includes(q) || (devanagariQ && (item.meaningHi || '').includes(devanagariQ));
            let subTypeMatch = (item.subType || '').toLowerCase().includes(q);

            return titleMatch || enMatch || hiMatch || subTypeMatch;
        });
    }

    return {
        analyzeAndCorrect,
        buildWordFormsMap,
        lookupWord,
        tokenizeSanskrit,
        findSpellingCorrection,
        getDictionaryDatabase,
        searchDictionary,
        NOUN_STEMS,
        PRONOUNS,
        VERB_DHATUS,
        AVYAYAS,
        ADJECTIVES,
        KNOWN_TYPOS_MAP
    };
}));
