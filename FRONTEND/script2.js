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
        const expectedSchemes = ['2019', '2024'];
        try {
            const res = await fetch(`${API_BASE_URL}/curriculum/schemes/`);
            const dbSchemes = await res.json();
            // Merge DB schemes with expected schemes so UI always shows all options
            // even if the DB is only partially seeded
            ktuData.schemes = [...new Set([...expectedSchemes, ...dbSchemes])].sort();
        } catch (err) {
            console.error("Failed to load schemes:", err);
            ktuData.schemes = expectedSchemes;
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
            o.animate({ left: `${e.clientX}px`, top: `${e.clientY}px` }, { duration: 100, fill: "forwards" });
        });
    },

    initSparkles() {
        const canvas = document.createElement('canvas'); canvas.id = 'sparkle-canvas';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth, height = canvas.height = window.innerHeight, sparkles = [];

        

        window.addEventListener('mousemove', (e) => { 
            let now = Date.now();
            if(!this.lastSparkleTime || now - this.lastSparkleTime > 40) { // Throttled to prevent lag
                for (let i = 0; i < 2; i++) sparkles.push(new Sparkle(e.clientX, e.clientY)); 
                this.lastSparkleTime = now;
            }
        });
        const anim = () => { ctx.clearRect(0, 0, width, height); sparkles = sparkles.filter(s => s.life > 0); sparkles.forEach(s => { s.update(); s.draw(); }); requestAnimationFrame(anim); };
        anim();
    }
};

/* --- Chatbot System --- */
const chatbot = {
    isOpen: false,
    historyKey: 'ktu_chat_history',
    
    init() {
        if (typeof marked !== 'undefined') {
            marked.setOptions({ breaks: true });
        }
        this.renderHistory();
        if (sessionStorage.getItem(this.historyKey) === null) {
            // First time tab opened -> clear backend memory to match local fresh state
            fetch(`${API_BASE_URL}/chat/clear/`, { method: 'POST' }).catch(e => console.log(e));
            // Add initial welcome greeting
            const greeting = "Hello! I am the KTU Assistant AI. How can I help you with your studies or curriculum today?";
            this.addMessageToUI('bot', greeting);
            this.saveToHistory('bot', greeting);
        }
    },
    
    toggle() {
        this.isOpen = !this.isOpen;
        const w = document.getElementById('chatbot-window');
        if (this.isOpen) {
            w.classList.remove('hidden-chatbot');
            document.getElementById('chat-input').focus();
        } else {
            w.classList.add('hidden-chatbot');
        }
    },
    
    handleEnter(e) {
        if (e.key === 'Enter') this.sendMessage();
    },
    
    async sendMessage() {
        const input = document.getElementById('chat-input');
        const msg = input.value.trim();
        if (!msg) return;
        
        input.value = '';
        this.addMessageToUI('user', msg);
        this.saveToHistory('user', msg);
        
        const loaderId = 'loader-' + Date.now();
        const loaderHtml = '<div class="typing-dots"><span></span><span></span><span></span></div>';
        this.addMessageToUI('bot', loaderHtml, loaderId);
        
        try {
            const res = await fetch(`${API_BASE_URL}/chat/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            });
            const data = await res.json();
            
            document.getElementById(loaderId).remove();
            
            if (data.response) {
                this.addMessageToUI('bot', data.response);
                this.saveToHistory('bot', data.response);
            } else {
                this.addMessageToUI('bot', 'Error: ' + (data.error || 'Server error'));
            }
        } catch (err) {
            document.getElementById(loaderId).remove();
            this.addMessageToUI('bot', 'Failed to connect to the chatbot.');
        }
    },
    
    addMessageToUI(sender, text, id = null) {
        const container = document.getElementById('chatbot-messages');
        const div = document.createElement('div');
        div.className = `chat-msg ${sender}`;
        if (id) div.id = id;
        
        if (sender === 'bot' && typeof marked !== 'undefined' && !text.includes('typing-dots')) {
            div.innerHTML = marked.parse(text);
        } else if (text.includes('typing-dots')) {
            div.innerHTML = text; // Raw HTML for loader
        } else {
            div.innerHTML = text.replace(/\n/g, '<br>');
        }
        
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },
    
    saveToHistory(sender, text) {
        let hist = JSON.parse(sessionStorage.getItem(this.historyKey) || '[]');
        hist.push({ sender, text });
        sessionStorage.setItem(this.historyKey, JSON.stringify(hist));
    },
    
    renderHistory() {
        let hist = JSON.parse(sessionStorage.getItem(this.historyKey) || '[]');
        hist.forEach(m => this.addMessageToUI(m.sender, m.text));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
    chatbot.init();

    if (typeof interact !== 'undefined') {
        interact('#chatbot-window')
            .draggable({
                allowFrom: '.chatbot-header',
                modifiers: [ interact.modifiers.restrictRect({ restriction: 'parent', endOnly: true }) ],
                listeners: {
                    move(event) {
                        var target = event.target;
                        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                        target.style.transform = `translate(${x}px, ${y}px)`;
                        target.setAttribute('data-x', x);
                        target.setAttribute('data-y', y);
                    }
                }
            });
    }
});