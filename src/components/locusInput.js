import { template, ELEMENT_IDS } from './locusInput.template.js';

// Regular expressions for parsing genomic loci
const LOCUS_PATTERNS = {
    // Matches "chr5" or "5"
    CHROMOSOME_ONLY: /^(?:chr)?(\d{1,2}|[XY])$/i,
    
    // Matches "chr12:50,464,921-53,983,987" or "12:50,464,921-53,983,987"
    REGION: /^(?:chr)?(\d{1,2}|[XY]):([0-9,]+)-([0-9,]+)$/i
};

class LocusInput {
    constructor(container, genomicRuler) {
        this.container = container;
        this.genomicRuler = genomicRuler;
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = template;

        this.input = this.container.querySelector(`#${ELEMENT_IDS.INPUT}`);
        this.goButton = this.container.querySelector(`#${ELEMENT_IDS.GO_BUTTON}`);
        this.errorDiv = this.container.querySelector(`#${ELEMENT_IDS.ERROR}`);
    }

    setupEventListeners() {
        const handleLocusUpdate = () => {
            const value = this.input.value.trim();
            this.processLocusInput(value);
        };

        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleLocusUpdate();
            }
        });

        this.goButton.addEventListener('click', handleLocusUpdate);
    }

    handleLocusChange({ chr, startBP, endBP }) {
        // If only chromosome is provided, show entire chromosome
        if (!startBP || !endBP) {
            const chrLength = getChromosomeLength(chr);
            this.genomicRuler.setGenomicLocus(chr, 0, chrLength);
        } else {
            this.genomicRuler.setGenomicLocus(chr, startBP, endBP);
        }
    }

    processLocusInput(value) {
        // Reset error state
        this.input.classList.remove('is-invalid');
        this.errorDiv.style.display = 'none';

        if (!value) {
            this.showError('Please enter a genomic locus');
            return;
        }

        // Try chromosome-only pattern first
        let match = value.match(LOCUS_PATTERNS.CHROMOSOME_ONLY);
        if (match) {
            const chr = this.formatChromosome(match[1]);
            this.handleLocusChange({ chr });
            return;
        }

        // Try region pattern
        match = value.match(LOCUS_PATTERNS.REGION);
        if (match) {
            const chr = this.formatChromosome(match[1]);
            const startBP = this.parsePosition(match[2]);
            const endBP = this.parsePosition(match[3]);

            if (startBP === null || endBP === null) {
                this.showError('Invalid base pair position format');
                return;
            }

            if (startBP >= endBP) {
                this.showError('Start position must be less than end position');
                return;
            }

            this.handleLocusChange({ chr, startBP, endBP });
            return;
        }

        this.showError('Invalid locus format');
    }

    formatChromosome(chr) {
        return `chr${chr.toUpperCase()}`;
    }

    parsePosition(pos) {
        try {
            // Remove commas and convert to number
            return parseInt(pos.replace(/,/g, ''), 10);
        } catch {
            return null;
        }
    }

    showError(message) {
        this.input.classList.add('is-invalid');
        this.errorDiv.textContent = message;
        this.errorDiv.style.display = 'block';
    }

    // Method to update the input value programmatically
    setValue(locus) {
        this.input.value = locus;
    }
}

export default LocusInput;
