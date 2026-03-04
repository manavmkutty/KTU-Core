/* Data Module: KTU Curriculum */
const ktuData = {
    schemes: [],
    departments: [
        { id: 'CS', name: 'Computer Science & Engineering' },
        { id: 'EC', name: 'Electronics & Communication' },
        { id: 'AIML', name: 'Artificial Intelligence & Machine Learning' },
        { id: 'ME', name: 'Mechanical Engineering' }
    ],
    semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'],
    grades: {
        'S': 10, 'A+': 9.0, 'A': 8.5, 'B+': 8.0,
        'B': 7.5, 'C+': 7.0, 'C': 6.5, 'D': 6.0,
        'P': 5.5, 'F': 0
    },
    curriculum: {}, // Will be populated from API
    materials: []    // Will be populated from API
};

const API_BASE_URL = 'http://localhost:8000/api'; // Django default port is 8000

const app = {
    user: {
        scheme: null,
        dept: null,
        sgpa: {}
    },
    state: { scheme: null, dept: null, semester: null, subject: null },

    async init() {
        this.addCustomCursor();
        this.initSparkles();
        this.setupNavigation();
        await this.loadInitialData();
        console.log("KTUCore initialized with Django backend.");
    },

    async loadInitialData() {
        try {
            const res = await fetch(`${API_BASE_URL}/curriculum/schemes/`);
            ktuData.schemes = await res.json();
            if (ktuData.schemes.length === 0) {
                ktuData.schemes = ['2019', '2024'];
            }
        } catch (err) {
            console.error("Failed to load schemes:", err);
            ktuData.schemes = ['2019', '2024'];
        }
        this.renderSchemeOptions();
    },

    renderSchemeOptions() {
        const container = document.getElementById('scheme-options');
        if (!container) return;
        container.innerHTML = ktuData.schemes.map(s =>
            `<button class="option-btn" onclick="app.selectScheme('${s}')">${s} Scheme</button>`
        ).join('');
    },

    /* Navigation & Routing */
    handleCardClick(feature) {
        if (feature === 'notes') {
            this.showSection('notes-section');
            this.resetNotesFlow();
        } else if (feature === 'attendance') {
            this.showSection('attendance-section');
        } else if (feature === 'sgpa' || feature === 'cgpa') {
            this.showSection('sgpa-section');
        } else {
            this.showModal('auth-modal');
        }
    },

    showSection(sectionId) {
        document.querySelectorAll('#main-content > section').forEach(el => {
            el.classList.remove('active-section');
            el.classList.add('hidden-section');
        });
        const target = document.getElementById(sectionId);
        if (target) {
            target.classList.remove('hidden-section');
            target.classList.add('active-section');
        }
    },

    goHome() { this.showSection('landing-section'); },

    goBack() {
        const notesSection = document.getElementById('notes-section');
        if (notesSection && notesSection.classList.contains('active-section')) {
            const current = document.querySelector('.flow-step.active-step');
            if (!current || current.id === 'step-scheme') {
                this.goHome();
            } else if (current.id === 'step-dept') {
                this.setFlowStep('step-scheme');
            } else if (current.id === 'step-semester') {
                this.setFlowStep('step-dept');
            } else if (current.id === 'step-subject') {
                this.setFlowStep('step-semester');
            } else if (current.id === 'step-materials') {
                this.setFlowStep('step-subject');
            }
        } else {
            this.goHome();
        }
    },

    /* --- SGPA & CGPA System --- */
    initSGPADashboard() {
        const scheme = document.getElementById('sgpa-scheme').value;
        const dept = document.getElementById('sgpa-dept').value;

        if (!scheme || !dept) {
            alert("Please select both Scheme and Department.");
            return;
        }

        this.user.scheme = scheme;
        this.user.dept = dept;
        this.user.sgpa = {};

        this.renderSemesterList();
        this.updateCGPASummary();

        document.getElementById('sgpa-setup').classList.add('hidden-step');
        document.getElementById('sgpa-dashboard').classList.remove('hidden-step');
        document.getElementById('sgpa-dashboard').classList.add('active-step');
    },

    renderSemesterList() {
        const container = document.getElementById('semester-list');
        if (!container) return;
        container.innerHTML = '';

        ktuData.semesters.forEach(sem => {
            const card = document.createElement('div');
            card.className = 'sem-card';
            card.innerHTML = `
                <div class="sem-header" onclick="app.toggleSemBody('${sem}')">
                    <h3>${sem}</h3>
                    <span id="sgpa-display-${sem}" style="color:var(--text-secondary)">Not Calculated</span>
                </div>
                <div id="sem-body-${sem}" class="sem-body hidden"></div>
            `;
            container.appendChild(card);
        });
    },

    async toggleSemBody(sem) {
        const body = document.getElementById(`sem-body-${sem}`);
        if (body.innerHTML.trim() === '') {
            await this.renderSemCalculator(sem, body);
        }
        body.classList.toggle('hidden');
    },

    async renderSemCalculator(sem, container) {
        container.innerHTML = '<div class="loader">Loading subjects...</div>';

        try {
            // Using the verified shorter path: /api/curriculum/scheme/dept/semester/
            const res = await fetch(`${API_BASE_URL}/curriculum/${this.user.scheme}/${this.user.dept}/${sem}/`);
            const subjects = await res.json();

            if (subjects.error) throw new Error(subjects.error);

            let html = `<table class="sgpa-table"><thead><tr><th>Subject</th><th>Credit</th><th>Grade</th></tr></thead><tbody>`;

            subjects.forEach((sub) => {
                html += `
                    <tr>
                        <td>${sub.name}</td>
                        <td>${sub.credit}</td>
                        <td>
                            <select class="grade-select styled-select" data-credit="${sub.credit}">
                                <option value="">Select</option>
                                ${Object.keys(ktuData.grades).map(g => `<option value="${ktuData.grades[g]}">${g}</option>`).join('')}
                            </select>
                        </td>
                    </tr>`;
            });

            html += `</tbody></table><button class="primary-btn" onclick="app.calculateSemesterSGPA('${sem}')">Calculate ${sem} SGPA</button>`;
            container.innerHTML = html;
        } catch (err) {
            container.innerHTML = `<div class="error">Failed to load subjects: ${err.message}</div>`;
        }
    },

    calculateSemesterSGPA(sem) {
        const body = document.getElementById(`sem-body-${sem}`);
        const selects = body.querySelectorAll('.grade-select');
        let totalCredit = 0, totalPoints = 0, allSelected = true;

        selects.forEach(sel => {
            if (sel.value === '') allSelected = false;
            const credit = parseFloat(sel.dataset.credit);
            const point = parseFloat(sel.value) || 0;
            totalCredit += credit;
            totalPoints += (credit * point);
        });

        if (!allSelected && !confirm("Some grades are empty. Assume F (0)?")) return;

        const sgpa = totalCredit > 0 ? (totalPoints / totalCredit) : 0;
        this.user.sgpa[sem] = { credits: totalCredit, points: totalPoints, sgpa: sgpa };

        document.getElementById(`sgpa-display-${sem}`).innerHTML = `<span style="color:var(--primary-accent); font-weight:bold">${sgpa.toFixed(2)}</span>`;
        this.updateCGPASummary();
        body.classList.add('hidden');
    },

    updateCGPASummary() {
        const container = document.getElementById('cgpa-summary-card');
        if (!container) return;

        let totalCredits = 0, totalPoints = 0;
        Object.values(this.user.sgpa).forEach(s => {
            totalCredits += s.credits;
            totalPoints += s.points;
        });

        const cgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
        container.innerHTML = `
            <h3>Cumulative Report</h3>
            <div class="summary-row">
                <div>Total Credits: ${totalCredits}</div>
                <div>CGPA: ${cgpa.toFixed(2)}</div>
                <div>Percentage: ${(cgpa * 10).toFixed(2)}%</div>
            </div>
        `;
    },

    /* --- Attendance Predictor --- */
    calculateAttendance() {
        const total = parseFloat(document.getElementById('att-total').value);
        const attended = parseFloat(document.getElementById('att-attended').value);
        const required = parseFloat(document.getElementById('att-required').value);
        const resultBox = document.getElementById('att-result');

        if (isNaN(total) || isNaN(attended) || isNaN(required) || total === 0) {
            alert("Please enter valid numbers");
            return;
        }

        const currentPct = (attended / total) * 100;
        let msg = `Current: <b>${currentPct.toFixed(2)}%</b><br>`;

        if (currentPct >= required) {
            const bunk = Math.floor((attended * 100 - required * total) / required);
            msg += `<span style="color:#4ade80">Safe! You can bunk ${bunk} classes.</span>`;
        } else {
            const needed = Math.ceil((required * total - 100 * attended) / (100 - required));
            msg += `<span style="color:#f87171">Danger! Attend ${needed} more classes.</span>`;
        }
        resultBox.innerHTML = msg;
        resultBox.classList.remove('hidden');
    },

    /* --- Notes Flow --- */
    resetNotesFlow() {
        this.state = { scheme: null, dept: null, semester: null, subject: null };
        this.setFlowStep('step-scheme');
    },

    setFlowStep(id) {
        document.querySelectorAll('.flow-step').forEach(e => {
            e.classList.add('hidden-step');
            e.classList.remove('active-step');
        });
        const target = document.getElementById(id);
        if (target) {
            target.classList.remove('hidden-step');
            target.classList.add('active-step');
        }
    },

    selectScheme(s) {
        this.state.scheme = s;
        document.getElementById('dept-options').innerHTML = ktuData.departments.map(d =>
            `<button class="option-btn" onclick="app.selectDept('${d.id}')">${d.name}</button>`
        ).join('');
        this.setFlowStep('step-dept');
    },

    selectDept(d) {
        this.state.dept = d;
        document.getElementById('semester-options').innerHTML = ktuData.semesters.map(sem =>
            `<button class="option-btn" onclick="app.selectSemester('${sem}')">${sem}</button>`
        ).join('');
        this.setFlowStep('step-semester');
    },

    async selectSemester(s) {
        this.state.semester = s;
        document.getElementById('selected-sem-display').innerText = s;

        try {
            // Using the verified shorter path: /api/curriculum/scheme/dept/semester/
            const res = await fetch(`${API_BASE_URL}/curriculum/${this.state.scheme}/${this.state.dept}/${s}/`);
            const subjects = await res.json();

            if (subjects.error) throw new Error(subjects.error);

            document.getElementById('subject-options').innerHTML = subjects.map(sub =>
                `<button class="option-btn" onclick="app.selectSubject('${sub.name}')">${sub.name}</button>`
            ).join('');
        } catch (err) {
            document.getElementById('subject-options').innerHTML = `<div class="error">Failed to load subjects: ${err.message}</div>`;
        }

        this.setFlowStep('step-subject');
    },

    async selectSubject(s) {
        this.state.subject = s;
        document.getElementById('selected-sub-display').innerText = s;

        try {
            // Using a simple query for resources
            const res = await fetch(`${API_BASE_URL}/resources/?scheme=${this.state.scheme}&dept=${this.state.dept}&semester=${this.state.semester}&subject_name=${encodeURIComponent(s)}`);
            const materials = await res.json();

            if (!Array.isArray(materials) || materials.length === 0) {
                document.getElementById('resource-list').innerHTML = '<p>No resources found for this subject.</p>';
            } else {
                document.getElementById('resource-list').innerHTML = materials.map(mat => `
                    <li class="resource-item">
                        <div class="resource-info">
                            <h4>${mat.title}</h4>
                            <small>${mat.size || 'Unknown size'}</small>
                        </div>
                        <a href="${mat.url}" target="_blank" class="download-btn">View/Download</a>
                    </li>
                `).join('');
            }
        } catch (err) {
            document.getElementById('resource-list').innerHTML = '<div class="error">Failed to load resources.</div>';
        }

        this.setFlowStep('step-materials');
    },

    /* --- UI & FX --- */
    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.dataset.target;
                if (target === 'home') this.goHome();
                else this.handleCardClick(target);
            });
        });
    },

    showModal(id) { document.getElementById(id)?.classList.remove('hidden'); },
    closeModal() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); },

    addCustomCursor() {
        const d = document.querySelector('.cursor-dot');
        const o = document.querySelector('.cursor-outline');
        if (!d || !o) return;
        window.addEventListener('mousemove', e => {
            d.style.left = `${e.clientX}px`; d.style.top = `${e.clientY}px`;
            o.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 500, fill: "forwards" });
        });
    },

    initSparkles() {
        const canvas = document.createElement('canvas'); canvas.id = 'sparkle-canvas';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth, height = canvas.height = window.innerHeight, sparkles = [];

        class Sparkle {
            constructor(x, y) {
                this.x = x; this.y = y; this.size = Math.random() * 2;
                this.speedX = Math.random() * 2 - 1; this.speedY = Math.random() * 2 - 1; this.life = 1;
            }
            update() { this.x += this.speedX; this.y += this.speedY; this.life -= 0.02; }
            draw() { ctx.globalAlpha = this.life; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
        }

        window.addEventListener('mousemove', (e) => { for (let i = 0; i < 2; i++) sparkles.push(new Sparkle(e.clientX, e.clientY)); });
        const anim = () => { ctx.clearRect(0, 0, width, height); sparkles = sparkles.filter(s => s.life > 0); sparkles.forEach(s => { s.update(); s.draw(); }); requestAnimationFrame(anim); };
        anim();
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());