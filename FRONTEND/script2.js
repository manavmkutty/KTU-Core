/* Data Module: KTU Curriculum */
const ktuData = {
    schemes: ['2019', '2024'],
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
    curriculum: {
        '2019': {
            'CS': {
                'S1': [
                    { name: "LINEAR ALGEBRA AND CALCULUS", credit: 4 },
                    { name: "ENGINEERING PHYSICS A", credit: 4 },
                    { name: "ENGINEERING GRAPHICS", credit: 3 },
                    { name: "BASICS OF CIVIL & MECH", credit: 4 },
                    { name: "PHYSICS LAB", credit: 1 },
                    { name: "CIVIL & MECH WORKSHOP", credit: 1 }
                ],
                'S2': [{ name: "Vector Calculus", credit: 4 }, { name: "Chemistry", credit: 4 }, { name: "C Programming", credit: 3 }]
            }
        }
    },
    // Mock materials for the notes section
    materials: [
        { title: "Module 1 Handwritten Notes", size: "2.4 MB" },
        { title: "Previous Year Question Paper", size: "1.1 MB" },
        { title: "Textbook PDF (Reference)", size: "15 MB" }
    ]
};

const app = {
    user: {
        scheme: null,
        dept: null,
        sgpa: {} 
    },
    state: { scheme: null, semester: null, subject: null },

    init() {
        this.addCustomCursor();
        this.initSparkles();
        this.setupNavigation();
        console.log("KTUCore initialized.");
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

    goHome() {
        this.showSection('landing-section');
    },

    goBack() {
        const notesSection = document.getElementById('notes-section');
        if (notesSection && notesSection.classList.contains('active-section')) {
            const current = document.querySelector('.flow-step.active-step');
            if (!current || current.id === 'step-scheme') {
                this.goHome();
            } else if (current.id === 'step-semester') {
                this.setFlowStep('step-scheme');
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

    toggleSemBody(sem) {
        const body = document.getElementById(`sem-body-${sem}`);
        if (body.innerHTML.trim() === '') {
            this.renderSemCalculator(sem, body);
        }
        body.classList.toggle('hidden');
    },

    renderSemCalculator(sem, container) {
        const subjects = (ktuData.curriculum[this.user.scheme] && 
                          ktuData.curriculum[this.user.scheme][this.user.dept] && 
                          ktuData.curriculum[this.user.scheme][this.user.dept][sem]) 
                          || ktuData.curriculum['2019']['CS']['S1'];

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
        this.state = { scheme: null, semester: null, subject: null }; 
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
        document.getElementById('semester-options').innerHTML = ktuData.semesters.map(sem => 
            `<button class="option-btn" onclick="app.selectSemester('${sem}')">${sem}</button>`
        ).join('');
        this.setFlowStep('step-semester');
    },

    selectSemester(s) {
        this.state.semester = s;
        document.getElementById('selected-sem-display').innerText = s;
        const subjects = (ktuData.curriculum['2019'] && ktuData.curriculum['2019']['CS'][s]) || ktuData.curriculum['2019']['CS']['S1'];
        document.getElementById('subject-options').innerHTML = subjects.map(sub => 
            `<button class="option-btn" onclick="app.selectSubject('${sub.name}')">${sub.name}</button>`
        ).join('');
        this.setFlowStep('step-subject');
    },

    selectSubject(s) {
        this.state.subject = s;
        document.getElementById('selected-sub-display').innerText = s;
        document.getElementById('resource-list').innerHTML = ktuData.materials.map(mat => `
            <li class="resource-item">
                <div class="resource-info">
                    <h4>${s} - ${mat.title}</h4>
                    <small>${mat.size}</small>
                </div>
                <a href="#" class="download-btn">Download</a>
            </li>
        `).join('');
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
        const canvas = document.createElement('canvas');
        canvas.id = 'sparkle-canvas';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let sparkles = [];

        class Sparkle {
            constructor(x, y) {
                this.x = x; this.y = y;
                this.size = Math.random() * 2;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 2 - 1;
                this.life = 1;
            }
            update() { this.x += this.speedX; this.y += this.speedY; this.life -= 0.02; }
            draw() {
                ctx.globalAlpha = this.life;
                ctx.fillStyle = "#fff";
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            }
        }

        window.addEventListener('mousemove', (e) => {
            for (let i = 0; i < 2; i++) sparkles.push(new Sparkle(e.clientX, e.clientY));
        });

        const anim = () => {
            ctx.clearRect(0, 0, width, height);
            sparkles = sparkles.filter(s => s.life > 0);
            sparkles.forEach(s => { s.update(); s.draw(); });
            requestAnimationFrame(anim);
        };
        anim();
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());