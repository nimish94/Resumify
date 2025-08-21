    // js/assistant-logic.js
    //AIzaSyA4U2hrdXMIBaATzcnD_9R_2ijDI2ADK7E
    // js/assistant-logic.js
// js/assistant-logic.js

document.addEventListener('DOMContentLoaded', function() {
    // This ensures the following code only runs on the form.html page
    if (window.location.pathname.includes('form.html')) {

        // 1. Select all necessary elements from the HTML
        const form = document.getElementById('resumeForm');
        const assistantSidebar = document.getElementById('resumeAssistant');
        const jobDescriptionInput = document.getElementById('jobDescription');
        
        // ATS Score elements
        const atsScoreDisplay = document.getElementById('atsScore');
        const atsScoreBar = document.getElementById('atsScoreBar');
        const atsChecklist = document.getElementById('atsChecklist');

        // Skills elements
        const skillList = document.getElementById('skillList');
        const copySkillsBtn = document.getElementById('copySkillsBtn');
        const copyConfirmation = document.getElementById('copyConfirmation');

        // Career Path Visualizer elements
        const visualizeBtn = document.getElementById('visualizePathBtn');
        const modal = document.getElementById('careerModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const chartContainer = document.getElementById('careerChartContainer');
        
        // Writing Suggestions element
        const suggestionsBox = document.getElementById('writingSuggestions');

        let extractedKeywords = [];

        // --- FEATURE 1: AI KEYWORD EXTRACTION ---
        async function extractKeywords(text) {
            const apiKey = 'AIzaSyA4U2hrdXMIBaATzcnD_9R_2ijDI2ADK7E'; // ⚠️ PASTE YOUR API KEY HERE
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
            const prompt = `You are an expert technical recruiter. Analyze the following job description. Extract the top 10 most important technical skills, programming languages, and soft skills. Return the result ONLY as a valid JavaScript array of strings, like ["Java", "React", "Problem Solving"]. Do not include markdown or any other explanatory text. Job Description: ${text}`;

            try {
                const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
                if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
                const data = await response.json();
                const aiResponseText = data.candidates[0].content.parts[0].text;
                const cleanedText = aiResponseText.replace(/```javascript|```/g, '').trim();
                try { return JSON.parse(cleanedText); } catch (e) { return cleanedText.replace(/[\[\]"]/g, '').split(',').map(k => k.trim()).filter(Boolean); }
            } catch (error) {
                console.error("Failed to fetch from AI:", error);
                skillList.innerHTML = `<p class="text-red-500">Error: Could not get skills from AI.</p>`;
                return [];
            }
        }
        
        function populateSkillsList() {
            if (extractedKeywords.length > 0) {
                skillList.innerHTML = '';
                extractedKeywords.forEach(skill => { skillList.innerHTML += `<p class="text-gray-800">${skill}</p>`; });
                copySkillsBtn.style.display = 'block';
            } else {
                skillList.innerHTML = `<p class="text-gray-500">Paste a job description to see skills.</p>`;
                copySkillsBtn.style.display = 'none';
            }
        }

        // --- FEATURE 2: LIVE ATS SCORE ---
        function calculateAtsScore() {
            let score = 0;
            let checklistHTML = '';
            
            const name = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            if (name && email && email.includes('@')) { score += 20; checklistHTML += `<p class="text-green-600">✅ Contact Info</p>`; } else { checklistHTML += `<p class="text-red-500">❌ Contact Info</p>`; }

            const summary = document.getElementById('summary').value;
            if (summary.trim().length > 50) { score += 20; checklistHTML += `<p class="text-green-600">✅ Professional Summary</p>`; } else { checklistHTML += `<p class="text-red-500">❌ Professional Summary</p>`; }

            const skills = document.getElementById('skills').value;
            if (skills.trim().length > 10) { score += 20; checklistHTML += `<p class="text-green-600">✅ Skills Section</p>`; } else { checklistHTML += `<p class="text-red-500">❌ Skills Section</p>`; }
            
            const jobTitle = document.querySelector('input[name="jobTitle[]"]').value;
            if (jobTitle.trim() !== '') { score += 20; checklistHTML += `<p class="text-green-600">✅ Work Experience</p>`; } else { checklistHTML += `<p class="text-red-500">❌ Work Experience</p>`; }
            
            if (extractedKeywords.length > 0) {
                const resumeText = (summary + ' ' + skills + ' ' + Array.from(document.querySelectorAll('textarea[name="responsibilities[]"]')).map(el => el.value).join(' ')).toLowerCase();
                const matchedKeywords = extractedKeywords.filter(k => resumeText.includes(k.toLowerCase())).length;
                const matchPercentage = matchedKeywords / extractedKeywords.length;
                score += Math.round(matchPercentage * 20);
                checklistHTML += `<p class="text-green-600">✅ Keyword Match (${matchedKeywords}/${extractedKeywords.length})</p>`;
            } else { checklistHTML += `<p class="text-gray-500">⚪ Keyword Match (No job desc.)</p>`; }

            atsScoreDisplay.innerText = `${score}/100`;
            atsScoreBar.style.width = `${score}%`;
            atsChecklist.innerHTML = checklistHTML;
        }

        // --- FEATURE 3: AI-POWERED CAREER PATH VISUALIZER ---
        async function generateCareerPathWithAI(jobTitle) {
            const apiKey = 'AIzaSyA4U2hrdXMIBaATzcnD_9R_2ijDI2ADK7E'; // ⚠️ PASTE YOUR API KEY HERE
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
            const prompt = `You are an expert career coach. A user has entered their job title: "${jobTitle}". 1. First, determine if this is a real, valid job title. 2. If it is a valid job title, create a potential career path for them. Return the path ONLY as Mermaid.js graph TD syntax, like "graph TD; A[Junior Developer] --> B[Senior Developer];". 3. If "${jobTitle}" does not seem like a real or valid job title, return the single phrase: "INVALID_ROLE". Do not include any other text, explanations, or markdown formatting.`;
            try {
                const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
                if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
                const data = await response.json();
                return data.candidates[0].content.parts[0].text.trim();
            } catch (error) { console.error("Failed to fetch from AI for career path:", error); return 'API_ERROR'; }
        }

        // --- FEATURE 4: BULLET POINT "WEAKNESS" IDENTIFIER ---
        const weakVerbs = ['responsible for', 'worked on', 'was part of', 'helped with', 'assisted with'];
        const strongVerbSuggestions = {
            'responsible for': 'Try a stronger verb like: **Managed, Led, Owned, Orchestrated**',
            'worked on': 'Try a more specific verb like: **Engineered, Developed, Designed, Created, Implemented**',
            'was part of': 'Try a more active phrase like: **Collaborated on, Contributed to, Co-developed**',
            'helped with': 'Try a more impactful verb like: **Supported, Facilitated, Accelerated, Coordinated**',
            'assisted with': 'Try a more direct verb like: **Aided, Supported, Facilitated, Contributed to**'
        };

        function analyzeWriting() {
            if (!suggestionsBox) return;
            const experienceTextareas = document.querySelectorAll('textarea[name="responsibilities[]"]');
            let suggestions = new Set();
            experienceTextareas.forEach(textarea => {
                const text = textarea.value.toLowerCase();
                for (const weakVerb of weakVerbs) {
                    if (text.includes(weakVerb)) { suggestions.add(strongVerbSuggestions[weakVerb]); }
                }
            });
            if (suggestions.size > 0) { suggestionsBox.innerHTML = Array.from(suggestions).map(s => `<p class="mb-1">${s}</p>`).join(''); } else { suggestionsBox.innerHTML = `<p class="text-green-600">✅ Your writing looks strong!</p>`; }
        }

        // --- EVENT LISTENERS ---

        if (jobDescriptionInput) {
            jobDescriptionInput.addEventListener('input', async () => {
                const text = jobDescriptionInput.value;
                if (text.trim().length > 50) {
                    assistantSidebar.style.display = 'block';
                    skillList.innerHTML = `<p class="text-gray-500">🧠 Analyzing job description...</p>`;
                    extractedKeywords = await extractKeywords(text);
                    populateSkillsList();
                    calculateAtsScore();
                } else { assistantSidebar.style.display = 'none'; extractedKeywords = []; }
            });
        }
        
        if (copySkillsBtn) {
            copySkillsBtn.addEventListener('click', () => {
                const skillsText = extractedKeywords.join(', ');
                navigator.clipboard.writeText(skillsText).then(() => {
                    copyConfirmation.style.display = 'block';
                    setTimeout(() => { copyConfirmation.style.display = 'none'; }, 2000);
                });
            });
        }

        if (visualizeBtn) {
            visualizeBtn.addEventListener('click', async () => {
                const currentJob = document.querySelector('input[name="jobTitle[]"]').value;
                if (!currentJob.trim()) { alert("Please enter a job title first."); return; }
                chartContainer.innerHTML = `<p>🧠 Generating career path with AI...</p>`;
                modal.style.display = 'flex';
                const mermaidSyntax = await generateCareerPathWithAI(currentJob);
                if (mermaidSyntax === 'INVALID_ROLE') { chartContainer.innerHTML = `<p class="text-red-500">"${currentJob}" does not seem to be a valid role. Please choose a real career path.</p>`; } else if (mermaidSyntax === 'API_ERROR') { chartContainer.innerHTML = `<p class="text-red-500">Sorry, there was an error connecting to the AI.</p>`; } else {
                    chartContainer.innerHTML = `<div class="mermaid">${mermaidSyntax}</div>`;
                    mermaid.initialize({ startOnLoad: false });
                    mermaid.run({ querySelector: '.mermaid' });
                }
            });
        }

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; });
        }
        
        // Combined listener for real-time updates
        if (form) {
            form.addEventListener('input', () => {
                calculateAtsScore();
                analyzeWriting();
            });
        }
        
        // Initial calls when the page loads
        calculateAtsScore();
        analyzeWriting();
    }
});
// --- FEATURE 5: AI-POWERED SUMMARY GENERATOR ---

// --- FEATURE 5: AI-POWERED SUMMARY GENERATOR ---

// Make sure these two lines are here to select the elements
const generateSummaryBtn = document.getElementById('generateSummaryBtn');
const summaryTextarea = document.getElementById('summary');

/**
 * Uses AI to generate a professional summary based on user's skills and experience.
 */
async function generateSummaryWithAI(skills, jobTitles) {
    const apiKey = 'AIzaSyA4U2hrdXMIBaATzcnD_9R_2ijDI2ADK7E'; // ⚠️ Make sure your API key is here
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    // This is the new, more sophisticated prompt for a human-like tone
    const prompt = `You are a professional resume writer helping a client. Your task is to write a professional summary for their resume based on the information they provided.

    **Instructions for the tone and style:**
    - Write in the first person (e.g., "I am a...", "My passion is...").
    - Adopt a confident, professional, and natural tone. Avoid overly robotic language or excessive jargon.
    - Weave their skills and experience into a short, compelling story about who they are professionally. Focus on what drives them and what they have accomplished.

    **Client's Information:**
    - Key Skills: "${skills}"
    - Past Job Titles: "${jobTitles.join(', ')}"

    **Your Task:**
    Based on the instructions and the client's information, write a compelling, 2-3 sentence professional summary. Return ONLY the paragraph of text.`;

    try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        console.error("Failed to generate summary:", error);
        return "Sorry, there was an error generating the summary. Please try again.";
    }
}

// Add the event listener for the new button
if (generateSummaryBtn) {
    generateSummaryBtn.addEventListener('click', async () => {
        // 1. Gather the necessary data from the form
        const skills = document.getElementById('skills').value;
        const jobTitles = Array.from(document.querySelectorAll('input[name="jobTitle[]"]')).map(input => input.value).filter(Boolean);

        if (!skills || jobTitles.length === 0) {
            alert("Please fill out your Skills and at least one Work Experience entry first.");
            return;
        }

        // 2. Show a loading message and call the AI
        summaryTextarea.value = "🧠 Generating a professional summary with AI...";
        const aiSummary = await generateSummaryWithAI(skills, jobTitles);

        // 3. Display the result
        summaryTextarea.value = aiSummary;
    });
}