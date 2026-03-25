const API_BASE_URL = 'http://localhost:8000/api';

const pyqData = {
    schemes: ['2019', '2024'],
    departments: [
        { id: 'CS', name: 'Computer Science & Engineering' },
        { id: 'EC', name: 'Electronics & Communication' },
        { id: 'AIML', name: 'Artificial Intelligence & Machine Learning' },
        { id: 'ME', name: 'Mechanical Engineering' }
    ],
    semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8']
};

const pyq = {
    state: { scheme: '', dept: '', sem: '', sub: '' },

    init() {
        this.addCustomCursor();
        this.populateInitialDropdowns();
        this.setupEventListeners();
    },

    populateInitialDropdowns() {
        const schemeSelect = document.getElementById('scheme-select');
        const deptSelect = document.getElementById('dept-select');
        const semSelect = document.getElementById('sem-select');

        schemeSelect.innerHTML += pyqData.schemes.map(s => `<option value="${s}">${s} Scheme</option>`).join('');
        deptSelect.innerHTML += pyqData.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
        semSelect.innerHTML += pyqData.semesters.map(s => `<option value="${s}">${s}</option>`).join('');
    },

    setupEventListeners() {
        document.getElementById('scheme-select').addEventListener('change', (e) => {
            this.state.scheme = e.target.value;
            this.updateSubjects();
        });
        document.getElementById('dept-select').addEventListener('change', (e) => {
            this.state.dept = e.target.value;
            this.updateSubjects();
        });
        document.getElementById('sem-select').addEventListener('change', (e) => {
            this.state.sem = e.target.value;
            this.updateSubjects();
        });
        document.getElementById('sub-select').addEventListener('change', (e) => {
            this.state.sub = e.target.value;
        });
    },

    async updateSubjects() {
        const subSelect = document.getElementById('sub-select');
        if (!this.state.scheme || !this.state.dept || !this.state.sem) {
            subSelect.innerHTML = '<option value="">Select Subject</option>';
            return;
        }

        subSelect.innerHTML = '<option value="">Loading subjects...</option>';

        try {
            const res = await fetch(`${API_BASE_URL}/curriculum/${this.state.scheme}/${this.state.dept}/${this.state.sem}/`);
            const subjects = await res.json();

            if (subjects.error) throw new Error(subjects.error);

            subSelect.innerHTML = '<option value="">Select Subject</option>' + 
                subjects.map(sub => `<option value="${sub.name}">${sub.name}</option>`).join('');
        } catch (err) {
            console.error("Failed to load subjects:", err);
            subSelect.innerHTML = '<option value="">Failed to load subjects</option>';
        }
    },

    search() {
        const manualSearch = document.getElementById('manual-search').value.trim();
        const resultsContainer = document.getElementById('results-container');
        
        resultsContainer.innerHTML = '<div style="text-align:center; color:var(--text-secondary)">Searching for papers...</div>';

        // Simulation of search results
        setTimeout(() => {
            let results = [];
            
            // If manual search is used, show a generic result
            if (manualSearch) {
                results.push({
                    title: `${manualSearch} - Dec 2023`,
                    code: 'Sample Code',
                    url: 'assets/sample.pdf'
                });
            } else if (this.state.sub) {
                results.push({
                    title: `${this.state.sub} - Dec 2023`,
                    code: 'Sample Code',
                    url: 'assets/sample.pdf'
                }, {
                    title: `${this.state.sub} - July 2023`,
                    code: 'Sample Code',
                    url: 'assets/sample.pdf'
                });
            } else {
                resultsContainer.innerHTML = '<div style="text-align:center; color:#f87171">Please select a subject or use manual search.</div>';
                return;
            }

            if (results.length === 0) {
                resultsContainer.innerHTML = '<div style="text-align:center; color:var(--text-secondary)">No papers found.</div>';
            } else {
                resultsContainer.innerHTML = results.map(res => `
                    <div class="paper-card">
                        <div class="paper-info">
                            <h4>${res.title}</h4>
                            <p>${res.code}</p>
                        </div>
                        <a href="${res.url}" target="_blank" class="view-pdf-btn">View PDF</a>
                    </div>
                `).join('');
            }
        }, 800);
    },

    addCustomCursor() {
        const d = document.querySelector('.cursor-dot');
        const o = document.querySelector('.cursor-outline');
        if (!d || !o) return;
        window.addEventListener('mousemove', e => {
            d.style.left = `${e.clientX}px`; d.style.top = `${e.clientY}px`;
            o.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 100, fill: "forwards" });
        });
    }
};

document.addEventListener('DOMContentLoaded', () => pyq.init());
