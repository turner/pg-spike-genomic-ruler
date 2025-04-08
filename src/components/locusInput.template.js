// Element IDs as constants to prevent typos and enable reuse
export const ELEMENT_IDS = {
    INPUT: 'locus-input',
    GO_BUTTON: 'locus-go-button',
    ERROR: 'locus-error'
};

export const template = `
    <div class="input-group mb-3">
        <input type="text" 
               class="form-control" 
               id="${ELEMENT_IDS.INPUT}"
               placeholder="Enter locus (e.g., chr5 or chr12:50,464,921-53,983,987)"
               aria-label="Genomic locus">
        <button class="btn btn-outline-secondary" 
                type="button" 
                id="${ELEMENT_IDS.GO_BUTTON}">Go</button>
    </div>
    <div class="invalid-feedback" id="${ELEMENT_IDS.ERROR}"></div>
`; 