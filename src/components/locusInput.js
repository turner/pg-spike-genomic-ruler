// Regular expressions for parsing genomic loci
const LOCUS_PATTERNS = {
    // Matches "chr5" or "5"
    CHROMOSOME_ONLY: /^(?:chr)?(\d{1,2}|[XY])$/i,
    
    // Matches "chr12:50,464,921-53,983,987" or "12:50,464,921-53,983,987"
    REGION: /^(?:chr)?(\d{1,2}|[XY]):([0-9,]+)-([0-9,]+)$/i
};

class LocusInput {
    constructor(container, onLocusChange) {
        this.container = container;
        this.onLocusChange = onLocusChange;
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="input-group mb-3">
                <input type="text" 
                       class="form-control" 
                       id="locus-input"
                       placeholder="Enter locus (e.g., chr5 or chr12:50,464,921-53,983,987)"
                       aria-label="Genomic locus">
                <button class="btn btn-outline-secondary" 
                        type="button" 
                        id="locus-go-button">Go</button>
            </div>
            <div class="invalid-feedback" id="locus-error"></div>
        `;

        this.input = this.container.querySelector('#locus-input');
        this.goButton = this.container.querySelector('#locus-go-button');
        this.errorDiv = this.container.querySelector('#locus-error');
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
            this.onLocusChange({ chr });
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

            this.onLocusChange({ chr, startBP, endBP });
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
