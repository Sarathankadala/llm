// AI Legal Document Simplifier - Main Application Logic

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

// Legal jargon mapping
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

// Sample legal documents
const sampleDocuments = [
    {
        title: "Employment Non-Compete Clause",
        text: "The Employee hereby agrees that, during the term of employment and for a period of twelve (12) months following termination thereof, the Employee shall not, directly or indirectly, engage in any business activity that competes with the Employer's business within a radius of fifty (50) miles from the Employer's principal place of business. Notwithstanding the foregoing, this restriction shall not apply to passive investments wherein the Employee holds less than five percent (5%) equity interest."
    },
    {
        title: "Service Agreement Payment Terms",
        text: "The Client shall pay the Service Provider the sum of Five Thousand Dollars ($5,000.00) pursuant to the following schedule: (a) twenty-five percent (25%) upon execution of this Agreement; (b) fifty percent (50%) upon completion of Phase One deliverables; and (c) the remaining twenty-five percent (25%) within thirty (30) days of final delivery. In the event that payment is not received within fifteen (15) days of the due date, the Service Provider may, at its sole discretion, suspend all work forthwith until such payment is received."
    },
    {
        title: "Liability Limitation Clause",
        text: "In no event shall the Company be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage."
    }
];

// Event Listeners
simplifyBtn.addEventListener('click', handleSimplify);
clearBtn.addEventListener('click', handleClear);
loadSampleBtn.addEventListener('click', loadSample);

// Setup copy buttons
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        copyToClipboard(targetElement.innerText);
    });
});

// Main simplification handler
async function handleSimplify() {
    const text = legalInput.value.trim();
    
    if (!text) {
        alert('Please enter legal text to simplify.');
        return;
    }
    
    // Add loading state
    simplifyBtn.classList.add('loading');
    simplifyBtn.textContent = 'Processing...';
    
    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
        // Process the legal text
        const result = processLegalText(text);
        
        // Display results
        displayResults(result);
        
        // Show output section
        outputSection.style.display = 'block';
        
        // Scroll to output
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        alert('An error occurred while processing the text. Please try again.');
        console.error(error);
    } finally {
        // Remove loading state
        simplifyBtn.classList.remove('loading');
        simplifyBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
            Simplify Document
        `;
    }
}

// Process legal text
function processLegalText(text) {
    const original = text;
    
    // Step 1: Simplify the text
    const simplified = simplifyLegalLanguage(text);
    
    // Step 2: Extract key points
    const points = extractKeyPoints(text);
    
    // Step 3: Assess risk level
    const risk = assessRiskLevel(text);
    
    return {
        original,
        simplified,
        keyPoints: points,
        riskLevel: risk.level,
        riskReason: risk.reason
    };
}

// Simplify legal language
function simplifyLegalLanguage(text) {
    let simplified = text;
    
    // Replace legal jargon
    Object.entries(legalJargonMap).forEach(([jargon, replacement]) => {
        const regex = new RegExp('\\b' + jargon + '\\b', 'gi');
        simplified = simplified.replace(regex, replacement);
    });
    
    // Break down complex sentences
    simplified = simplified.replace(/;\s*/g, '. ');
    
    // Remove excessive legal phrasing
    simplified = simplified.replace(/\(s\)/g, '(s)');
    simplified = simplified.replace(/including but not limited to/gi, 'including');
    simplified = simplified.replace(/for the avoidance of doubt/gi, 'to be clear');
    
    // Improve readability
    simplified = cleanupText(simplified);
    
    return simplified;
}

// Extract key points from legal text
function extractKeyPoints(text) {
    const points = [];
    
    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    // Identify key obligations and rights
    sentences.forEach(sentence => {
        const lower = sentence.toLowerCase();
        
        // Detect obligations (shall, must, required to)
        if (lower.includes('shall') || lower.includes('must') || lower.includes('required to') || 
            lower.includes('agrees to') || lower.includes('obligated')) {
            points.push({
                type: 'obligation',
                text: simplifyLegalLanguage(sentence.trim())
            });
        }
        
        // Detect restrictions (shall not, may not, prohibited)
        else if (lower.includes('shall not') || lower.includes('may not') || 
                 lower.includes('prohibited') || lower.includes('restricted')) {
            points.push({
                type: 'restriction',
                text: simplifyLegalLanguage(sentence.trim())
            });
        }
        
        // Detect rights (entitled to, may, right to)
        else if (lower.includes('entitled to') || lower.includes('right to') || 
                 lower.includes('may') && !lower.includes('may not')) {
            points.push({
                type: 'right',
                text: simplifyLegalLanguage(sentence.trim())
            });
        }
        
        // Detect penalties or consequences
        else if (lower.includes('liable') || lower.includes('penalty') || 
                 lower.includes('damages') || lower.includes('indemnify')) {
            points.push({
                type: 'penalty',
                text: simplifyLegalLanguage(sentence.trim())
            });
        }
        
        // Detect timeframes
        else if (lower.match(/\d+\s*(days?|months?|years?|hours?)/)) {
            points.push({
                type: 'timeline',
                text: simplifyLegalLanguage(sentence.trim())
            });
        }
    });
    
    // If no specific points found, extract general key sentences
    if (points.length === 0) {
        sentences.slice(0, 3).forEach(sentence => {
            points.push({
                type: 'general',
                text: simplifyLegalLanguage(sentence.trim())
            });
        });
    }
    
    return points.slice(0, 5); // Limit to 5 key points
}

// Assess risk and obligation level
function assessRiskLevel(text) {
    const lower = text.toLowerCase();
    let score = 0;
    const reasons = [];
    
    // High risk indicators
    const highRiskTerms = [
        'liable', 'liability', 'indemnify', 'indemnification', 
        'damages', 'penalty', 'terminate', 'termination',
        'breach', 'default', 'forfeiture', 'waive', 'waiver'
    ];
    
    const mediumRiskTerms = [
        'shall', 'must', 'required', 'obligated', 'binding',
        'non-compete', 'confidential', 'exclusive', 'irrevocable'
    ];
    
    const lowRiskTerms = [
        'may', 'optional', 'discretionary', 'suggested'
    ];
    
    // Check for high risk terms
    highRiskTerms.forEach(term => {
        if (lower.includes(term)) {
            score += 3;
            if (!reasons.includes('financial or legal liability')) {
                reasons.push('financial or legal liability');
            }
        }
    });
    
    // Check for medium risk terms
    mediumRiskTerms.forEach(term => {
        if (lower.includes(term)) {
            score += 1;
            if (!reasons.includes('binding obligations')) {
                reasons.push('binding obligations');
            }
        }
    });
    
    // Check for monetary amounts
    if (lower.match(/\$[\d,]+|\d+\s*dollars?/)) {
        score += 2;
        if (!reasons.includes('monetary commitments')) {
            reasons.push('monetary commitments');
        }
    }
    
    // Check for time restrictions
    if (lower.match(/\d+\s*(days?|months?|years?)/)) {
        score += 1;
        if (!reasons.includes('time-bound requirements')) {
            reasons.push('time-bound requirements');
        }
    }
    
    // Check for low risk indicators
    lowRiskTerms.forEach(term => {
        if (lower.includes(term)) {
            score -= 1;
        }
    });
    
    // Determine risk level
    let level, reason;
    
    if (score >= 6) {
        level = 'High';
        reason = `This text contains significant ${reasons.join(', ')}. It imposes serious obligations or potential consequences that could have major financial or legal impact.`;
    } else if (score >= 3) {
        level = 'Medium';
        reason = `This text includes ${reasons.join(', ')}. It contains obligations or restrictions that require attention and compliance.`;
    } else {
        level = 'Low';
        if (reasons.length > 0) {
            reason = `This text has minimal ${reasons.join(', ')}. The obligations or restrictions appear to be limited in scope or severity.`;
        } else {
            reason = 'This text appears to be informational or contains minimal binding obligations. The requirements are straightforward with limited consequences.';
        }
    }
    
    return { level, reason };
}

// Display results
function displayResults(result) {
    // Original text
    originalText.textContent = result.original;
    
    // Simplified explanation
    simplifiedText.textContent = result.simplified;
    
    // Key points
    keyPoints.innerHTML = '';
    result.keyPoints.forEach(point => {
        const li = document.createElement('li');
        li.textContent = point.text;
        keyPoints.appendChild(li);
    });
    
    // Risk level
    const riskValue = riskLevel;
    riskValue.textContent = result.riskLevel;
    riskValue.className = 'risk-value ' + result.riskLevel.toLowerCase();
    
    // Risk reason
    riskReason.textContent = result.riskReason;
}

// Cleanup text
function cleanupText(text) {
    return text
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\(\s+/g, '(') // Remove space after opening parenthesis
        .replace(/\s+\)/g, ')') // Remove space before closing parenthesis
        .replace(/\s+,/g, ',') // Remove space before comma
        .replace(/\s+\./g, '.') // Remove space before period
        .trim();
}

// Handle clear
function handleClear() {
    legalInput.value = '';
    outputSection.style.display = 'none';
    legalInput.focus();
}

// Load sample document
function loadSample() {
    const sample = sampleDocuments[Math.floor(Math.random() * sampleDocuments.length)];
    legalInput.value = sample.text;
    legalInput.focus();
    
    // Auto-scroll to input
    legalInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast();
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Show toast notification
function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Initialize tooltips and accessibility
document.addEventListener('DOMContentLoaded', () => {
    // Focus on input when page loads
    legalInput.focus();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to simplify
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSimplify();
        }
        
        // Escape to clear
        if (e.key === 'Escape' && document.activeElement === legalInput) {
            handleClear();
        }
    });
});
