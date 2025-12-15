// AI Legal Document Simplifier - Enhanced Application Logic

// DOM Elements
const legalInput = document.getElementById('legalInput');
const simplifyBtn = document.getElementById('simplifyBtn');
const clearBtn = document.getElementById('clearBtn');
const loadSampleBtn = document.getElementById('loadSampleBtn');
const outputSection = document.getElementById('outputSection');
const originalText = document.getElementById('originalText');
const simplifiedText = document.getElementById('simplifiedText');
const keyPoints = document.getElementById('keyPoints');
const riskLevel = document.getElementById('riskLevel');
const riskReason = document.getElementById('riskReason');
const riskBadge = document.getElementById('riskBadge');
const toast = document.getElementById('toast');

// New DOM Elements for PDF & AI
const pdfInput = document.getElementById('pdfInput');
const uploadZone = document.getElementById('uploadZone');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileMeta = document.getElementById('fileMeta');
const removeFileBtn = document.getElementById('removeFileBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.getElementById('closeModal');
const cancelSettings = document.getElementById('cancelSettings');
const saveSettings = document.getElementById('saveSettings');
const apiKeySection = document.getElementById('apiKeySection');
const modeIndicator = document.getElementById('modeIndicator');

// State
let currentPdfFile = null;

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// --- Event Listeners ---

// Core function
simplifyBtn.addEventListener('click', handleSimplify);
clearBtn.addEventListener('click', handleClear);
loadSampleBtn.addEventListener('click', loadSample);
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        copyToClipboard(targetElement.innerText);
    });
});

// PDF Upload Handlers
uploadZone.addEventListener('click', () => pdfInput.click());
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
});
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', handleFileDrop);
pdfInput.addEventListener('change', (e) => handleFileSelect(e.target.files[0]));
removeFileBtn.addEventListener('click', clearFile);

// Settings Handlers
settingsBtn.addEventListener('click', () => {
    loadSettingsUI();
    settingsModal.classList.add('active');
});
closeModal.addEventListener('click', () => settingsModal.classList.remove('active'));
cancelSettings.addEventListener('click', () => settingsModal.classList.remove('active'));
saveSettings.addEventListener('click', saveSettingsHandler);
document.querySelectorAll('input[name="aiProvider"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        apiKeySection.style.display = e.target.value === 'none' ? 'none' : 'block';
    });
});
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.classList.remove('active');
});


// --- PDF Processing ---

function handleFileDrop(e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
    }
}

async function handleFileSelect(file) {
    if (!file || file.type !== 'application/pdf') {
        alert('Please select a valid PDF file.');
        return;
    }

    currentPdfFile = file;
    showFileInfo(file);

    // Show loading state
    uploadZone.style.display = 'none';
    legalInput.placeholder = 'Extracting text from PDF... please wait.';
    legalInput.value = 'Extracting text...';
    simplifyBtn.disabled = true;

    try {
        const text = await extractTextFromPdf(file);
        legalInput.value = text;
        legalInput.placeholder = 'PDF text extracted. You can edit it here before simplifying.';
    } catch (error) {
        console.error('PDF Extraction Error:', error);
        alert('Failed to extract text from PDF. Please try copying the text manually.');
        legalInput.value = '';
    } finally {
        simplifyBtn.disabled = false;
    }
}

async function extractTextFromPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
    }

    return fullText.trim();
}

function showFileInfo(file) {
    fileName.textContent = file.name;
    fileMeta.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    uploadZone.style.display = 'none';
    fileInfo.style.display = 'flex';
}

function clearFile(e) {
    if (e) e.stopPropagation();
    currentPdfFile = null;
    pdfInput.value = '';
    fileInfo.style.display = 'none';
    uploadZone.style.display = 'block';
    legalInput.value = '';
    legalInput.placeholder = "Paste your legal document text here (e.g., contract clause, terms of service, policy statement)...";
}


// --- AI Settings Logic ---

function loadSettingsUI() {
    // Sync UI with current AI Service state
    if (window.aiService.loadConfig()) {
        const rb = document.querySelector(`input[name="aiProvider"][value="${window.aiService.provider}"]`);
        if (rb) rb.checked = true;
        document.getElementById('apiKeyInput').value = window.aiService.apiKey || '';
        apiKeySection.style.display = window.aiService.provider === 'none' ? 'none' : 'block';
    } else {
        document.querySelector('input[name="aiProvider"][value="none"]').checked = true;
        apiKeySection.style.display = 'none';
    }
}

function saveSettingsHandler() {
    const provider = document.querySelector('input[name="aiProvider"]:checked').value;
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    const detailed = document.getElementById('detailedAnalysis').checked;
    const definitions = document.getElementById('extractDefinitions').checked;
    const model = document.getElementById('modelSelect').value;

    if (provider !== 'none' && !apiKey) {
        alert('Please enter an API key for the selected provider.');
        return;
    }

    window.aiService.configure({
        provider,
        apiKey,
        model,
        detailedAnalysis: detailed,
        extractDefinitions: definitions
    });

    updateModeIndicator();
    settingsModal.classList.remove('active');

    // Show confirmation toast
    showToast('Settings saved successfully');
}

function updateModeIndicator() {
    const isAi = window.aiService.isEnabled();
    modeIndicator.innerHTML = isAi ?
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 16a6 6 0 1 1 6-6 6 6 0 0 1-6 6z"/><path d="M12 8v4l3 3"/></svg> AI Mode (${window.aiService.provider})` :
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4m0-4h.01"></path></svg> Basic Mode`;

    if (isAi) {
        modeIndicator.classList.add('ai-active');
    } else {
        modeIndicator.classList.remove('ai-active');
    }
}


// --- Main Processing Logic ---

async function handleSimplify() {
    const text = legalInput.value.trim();

    if (!text) {
        alert('Please enter legal text to simplify.');
        return;
    }

    // Loading state
    simplifyBtn.classList.add('loading');
    simplifyBtn.textContent = window.aiService.isEnabled() ? 'Analyzing with AI...' : 'Processing...';

    // Smooth scroll to output placeholder or keep position? 
    // Let's scroll after result.

    try {
        let result;

        if (window.aiService.isEnabled()) {
            try {
                // AI Processing
                result = await window.aiService.simplifyLegalText(text);
                // Map AI result to our display format
                displayResults({
                    original: text,
                    simplified: result.simplified,
                    keyPoints: result.keyPoints.map(p => ({ text: p })), // Basic/AI diff handling
                    riskLevel: result.riskLevel || 'Unknown',
                    riskReason: result.riskReason || 'AI assessment',
                    definitions: result.definitions
                });
            } catch (aiError) {
                console.warn('AI processing failed, falling back to basic:', aiError);
                if (confirm(`AI Error: ${aiError.message}\n\nSwitch to Basic Mode for this request?`)) {
                    // Fallback to basic
                    result = processBasicLegalText(text);
                    displayResults(result);
                } else {
                    throw aiError; // Stop
                }
            }
        } else {
            // Basic Processing
            await new Promise(resolve => setTimeout(resolve, 800)); // UX delay
            result = processBasicLegalText(text);
            displayResults(result);
        }

        outputSection.style.display = 'block';
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
        if (error.message !== 'AI service not configured') { // Handled above roughly
            alert('An error occurred: ' + error.message);
        }
    } finally {
        simplifyBtn.classList.remove('loading');
        simplifyBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
            Simplify Document
        `;
    }
}


// --- Basic Rule-Based Logic (Original) ---

const legalJargonMap = {
    'hereinafter': 'from now on',
    'herein': 'in this document',
    'hereby': 'by this',
    'hereunder': 'under this',
    'thereof': 'of it',
    'therein': 'in it',
    'thereto': 'to it',
    'whereas': 'given that',
    'aforementioned': 'mentioned earlier',
    'aforesaid': 'said before',
    'forthwith': 'immediately',
    'notwithstanding': 'despite',
    'pursuant to': 'according to',
    'in accordance with': 'following',
    'shall': 'must',
    'shall not': 'must not',
    'may': 'can',
    'heretofore': 'until now',
    'indemnify': 'protect from loss',
    'liable': 'legally responsible',
    'void': 'invalid',
    'null and void': 'completely invalid',
    'terminate': 'end',
    'termination': 'ending',
    'party of the first part': 'first party',
    'party of the second part': 'second party',
    'in lieu of': 'instead of',
    'provided that': 'if',
    'subject to': 'depending on',
    'force majeure': 'unforeseeable circumstances',
    'ab initio': 'from the beginning',
    'ad hoc': 'for this specific purpose',
    'bona fide': 'genuine',
    'de facto': 'in reality',
    'ipso facto': 'by the fact itself',
    'per se': 'by itself',
    'prima facie': 'at first glance',
    'pro rata': 'proportionally',
    'quid pro quo': 'something for something',
    'vis-à-vis': 'in relation to'
};

function processBasicLegalText(text) {
    const original = text;
    const simplified = simplifyLegalLanguage(text);
    const points = extractKeyPoints(text);
    const risk = assessRiskLevel(text);

    return {
        original,
        simplified,
        keyPoints: points,
        riskLevel: risk.level,
        riskReason: risk.reason
    };
}

function simplifyLegalLanguage(text) {
    let simplified = text;
    Object.entries(legalJargonMap).forEach(([jargon, replacement]) => {
        const regex = new RegExp('\\b' + jargon + '\\b', 'gi');
        simplified = simplified.replace(regex, replacement);
    });
    simplified = simplified.replace(/;\s*/g, '. ');
    simplified = simplified.replace(/\(s\)/g, '(s)');
    simplified = simplified.replace(/including but not limited to/gi, 'including');
    simplified = simplified.replace(/for the avoidance of doubt/gi, 'to be clear');
    return cleanupText(simplified);
}

function extractKeyPoints(text) {
    const points = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

    sentences.forEach(sentence => {
        const lower = sentence.toLowerCase();
        if (lower.includes('shall') || lower.includes('must') || lower.includes('required to') ||
            lower.includes('agrees to') || lower.includes('obligated')) {
            points.push({ type: 'obligation', text: simplifyLegalLanguage(sentence.trim()) });
        } else if (lower.includes('shall not') || lower.includes('may not') ||
            lower.includes('prohibited') || lower.includes('restricted')) {
            points.push({ type: 'restriction', text: simplifyLegalLanguage(sentence.trim()) });
        } else if (lower.includes('entitled to') || lower.includes('right to') ||
            (lower.includes('may') && !lower.includes('may not'))) {
            points.push({ type: 'right', text: simplifyLegalLanguage(sentence.trim()) });
        } else if (lower.includes('liable') || lower.includes('penalty') ||
            lower.includes('damages') || lower.includes('indemnify')) {
            points.push({ type: 'penalty', text: simplifyLegalLanguage(sentence.trim()) });
        } else if (lower.match(/\d+\s*(days?|months?|years?|hours?)/)) {
            points.push({ type: 'timeline', text: simplifyLegalLanguage(sentence.trim()) });
        }
    });

    if (points.length === 0) {
        sentences.slice(0, 3).forEach(sentence => {
            points.push({ type: 'general', text: simplifyLegalLanguage(sentence.trim()) });
        });
    }
    return points.slice(0, 5);
}

function assessRiskLevel(text) {
    const lower = text.toLowerCase();
    let score = 0;
    const reasons = [];

    const highRiskTerms = ['liable', 'liability', 'indemnify', 'indemnification', 'damages', 'penalty', 'terminate', 'termination', 'breach', 'default', 'forfeiture', 'waive', 'waiver'];
    const mediumRiskTerms = ['shall', 'must', 'required', 'obligated', 'binding', 'non-compete', 'confidential', 'exclusive', 'irrevocable'];
    const lowRiskTerms = ['may', 'optional', 'discretionary', 'suggested'];

    highRiskTerms.forEach(term => { if (lower.includes(term)) { score += 3; if (!reasons.includes('financial or legal liability')) reasons.push('financial or legal liability'); } });
    mediumRiskTerms.forEach(term => { if (lower.includes(term)) { score += 1; if (!reasons.includes('binding obligations')) reasons.push('binding obligations'); } });
    if (lower.match(/\$[\d,]+|\d+\s*dollars?/)) { score += 2; if (!reasons.includes('monetary commitments')) reasons.push('monetary commitments'); }
    if (lower.match(/\d+\s*(days?|months?|years?)/)) { score += 1; if (!reasons.includes('time-bound requirements')) reasons.push('time-bound requirements'); }
    lowRiskTerms.forEach(term => { if (lower.includes(term)) score -= 1; });

    let level, reason;
    if (score >= 6) { level = 'High'; reason = `This text contains significant ${reasons.join(', ')}. It imposes serious obligations or potential consequences that could have major financial or legal impact.`; }
    else if (score >= 3) { level = 'Medium'; reason = `This text includes ${reasons.join(', ')}. It contains obligations or restrictions that require attention and compliance.`; }
    else { level = 'Low'; if (reasons.length > 0) reason = `This text has minimal ${reasons.join(', ')}. The obligations or restrictions appear to be limited in scope or severity.`; else reason = 'This text appears to be informational or contains minimal binding obligations. The requirements are straightforward with limited consequences.'; }

    return { level, reason };
}

// --- Utils ---

function displayResults(result) {
    originalText.textContent = result.original;
    simplifiedText.textContent = result.simplified;

    keyPoints.innerHTML = '';
    result.keyPoints.forEach(point => {
        const li = document.createElement('li');
        // Handle both object (basic mode) and string (AI mode possible simple strings) cases
        li.textContent = typeof point === 'string' ? point : point.text;
        keyPoints.appendChild(li);
    });

    // Add/Update Definitions if present (New Feature!)
    if (result.definitions && result.definitions.length > 0) {
        // Maybe add a section for definitions? 
        // For now, append to Key Points or similar? 
        // Let's create a definition section dynamically if needed or just append to simplified text?
        // Let's simply append them to key points using a distinct style if possible, or just as text.
        // Actually, let's create a new card if I could modify HTML easily, but for now I'll append to simplified text wrapper or key points.
        // Let's just create a list item for each Definition.

        // Actually, let's just make sure they appear.
        const header = document.createElement('li');
        header.innerHTML = '<strong>Definitions identified:</strong>';
        header.style.marginTop = '10px';
        header.style.listStyle = 'none';
        header.style.paddingLeft = '0';
        keyPoints.appendChild(header);

        result.definitions.forEach(def => {
            const li = document.createElement('li');
            li.textContent = def;
            keyPoints.appendChild(li);
        });
    }

    const riskValue = riskLevel;
    riskValue.textContent = result.riskLevel;
    riskValue.className = 'risk-value ' + result.riskLevel.toLowerCase();
    riskReason.textContent = result.riskReason;

    // Smooth fade in
    outputSection.style.opacity = 0;
    setTimeout(() => outputSection.style.opacity = 1, 50);
}

function cleanupText(text) {
    return text.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s+,/g, ',').replace(/\s+\./g, '.').trim();
}

function handleClear() {
    legalInput.value = '';
    clearFile();
    outputSection.style.display = 'none';
    legalInput.focus();
}

function loadSample() {
    const sampleDocuments = [
        { title: "Employment Non-Compete", text: "The Employee hereby agrees that, during the term of employment and for a period of twelve (12) months following termination thereof, the Employee shall not, directly or indirectly, engage in any business activity that competes with the Employer's business within a radius of fifty (50) miles from the Employer's principal place of business. Notwithstanding the foregoing, this restriction shall not apply to passive investments wherein the Employee holds less than five percent (5%) equity interest." },
        { title: "Service Agreement Payment", text: "The Client shall pay the Service Provider the sum of Five Thousand Dollars ($5,000.00) pursuant to the following schedule: (a) twenty-five percent (25%) upon execution of this Agreement; (b) fifty percent (50%) upon completion of Phase One deliverables; and (c) the remaining twenty-five percent (25%) within thirty (30) days of final delivery. In the event that payment is not received within fifteen (15) days of the due date, the Service Provider may, at its sole discretion, suspend all work forthwith until such payment is received." },
        { title: "Liability Limitation", text: "In no event shall the Company be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage." }
    ];
    const sample = sampleDocuments[Math.floor(Math.random() * sampleDocuments.length)];
    legalInput.value = sample.text;
    legalInput.focus();
    legalInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!')).catch(err => console.error(err));
}

function showToast(message) {
    const toastSpan = toast.querySelector('span') || toast;
    if (toastSpan !== toast) toastSpan.textContent = message;
    else toast.textContent = message;

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
    legalInput.focus();

    // Check for saved API settings
    if (window.aiService.loadConfig()) {
        updateModeIndicator();
    }
});
