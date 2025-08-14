// main.js

// This file handles the overall navigation flow and state management.

document.addEventListener('DOMContentLoaded', function() {
    // --- Logic for the Landing Page (index.html) ---
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            // Clear any previous state on first entry to ensure a fresh start
            localStorage.removeItem('step1Complete');
            localStorage.removeItem('step2Complete');
            localStorage.removeItem('selectedTemplateId');
            localStorage.removeItem('resumeData');
            
            window.location.href = 'steps.html';
        });
    }

    // --- Logic for the Steps Page (steps.html) ---
    if (window.location.pathname.includes('steps.html')) {
        // Select the <a> tags by their IDs to be able to set the href.
        const step1Link = document.getElementById('step1-link');
        const step2Link = document.getElementById('step2-link');
        const step3Link = document.getElementById('step3-link');

        // Select the inner <div>s for class manipulation
        const step1Card = document.querySelector('.step[data-step="1"]');
        const step2Card = document.querySelector('.step[data-step="2"]');
        const step3Card = document.querySelector('.step[data-step="3"]');

        // Check if steps are complete from localStorage
        const isStep1Complete = localStorage.getItem('step1Complete') === 'true';
        const isStep2Complete = localStorage.getItem('step2Complete') === 'true';

        // Update UI for Step 1
        if (isStep1Complete) {
            step1Card.classList.add('completed');
            const checkmark = step1Card.querySelector('.checkmark-icon');
            if (checkmark) {
                checkmark.style.display = 'block';
            }
            // LOCK STEP 1: Once completed, make the link unclickable
            step1Link.href = '#'; 
            step1Card.classList.add('disabled');
        } else {
            step1Link.href = 'template.html';
            step1Card.classList.remove('disabled');
        }
        
        // Update UI for Step 2 and make it clickable if Step 1 is done
        if (isStep1Complete) {
            step2Link.href = 'form.html';
            step2Card.classList.remove('disabled');
        } else {
            step2Link.href = '#';
            step2Card.classList.add('disabled');
        }
        
        // Check if Step 2 is complete to lock it
        if (isStep2Complete) {
            step2Card.classList.add('completed');
            const checkmark = step2Card.querySelector('.checkmark-icon');
            if (checkmark) {
                checkmark.style.display = 'block';
            }
            // LOCK STEP 2: Once completed, make the link unclickable
            step2Link.href = '#'; 
            step2Card.classList.add('disabled');
            
            // Enable Step 3 only if Step 2 is completed
            step3Link.href = 'download.html';
            step3Card.classList.remove('disabled');
        } else {
            step3Link.href = '#';
            step3Card.classList.add('disabled');
        }
    }
    
    // --- The rest of your code from before remains unchanged ---
    
    // --- Logic for the Template Selection Page (template.html) ---
    if (window.location.pathname.includes('template.html')) {
        const templateLinks = document.querySelectorAll('.template-link');
        templateLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                // Prevent the default navigation
                event.preventDefault(); 
                
                const templateId = this.getAttribute('data-template-id');
                // Store the selected template ID in localStorage
                localStorage.setItem('selectedTemplateId', templateId);
                localStorage.setItem('step1Complete', 'true');
                
                // Now, manually navigate to the steps page
                window.location.href = 'steps.html';
            });
        });
    }

    // --- Logic for the Form Page (form.html) ---
    if (window.location.pathname.includes('form.html')) {
        const form = document.getElementById('resumeForm');
        const workExperienceContainer = document.getElementById('workExperienceContainer');
        const educationContainer = document.getElementById('educationContainer');
        const linksContainer = document.getElementById('linksContainer');
        const addWorkButton = document.getElementById('addWorkExperience');
        const addEducationButton = document.getElementById('addEducation');
        const addLinkButton = document.getElementById('addLink');
        const photoUploadInput = document.getElementById('photoUpload');
        const profilePhotoPreview = document.getElementById('profilePhotoPreview');
        const successMessage = document.getElementById('successMessage');

        /**
         * Populates the form fields with data from localStorage if available.
         */
        function loadFormData() {
            const savedData = localStorage.getItem('resumeData');
            if (savedData) {
                const data = JSON.parse(savedData);

                // Populate personal information
                document.getElementById('fullName').value = data.fullName || '';
                document.getElementById('email').value = data.email || '';
                document.getElementById('phone').value = data.phone || '';
                document.getElementById('address').value = data.address || '';
                document.getElementById('summary').value = data.summary || '';
                document.getElementById('skills').value = data.skills ? data.skills.join(', ') : '';
                document.getElementById('languages').value = data.languages || '';

                // Load photo preview
                if (data.photoData) {
                    profilePhotoPreview.src = data.photoData;
                }

                // Populate dynamic sections
                // Start with a clean slate for dynamic sections to avoid duplicates
                workExperienceContainer.innerHTML = '';
                educationContainer.innerHTML = '';
                linksContainer.innerHTML = '';

                // Load work experience
                if (data.workExperience && data.workExperience.length > 0) {
                    data.workExperience.forEach(entry => createWorkExperienceEntry(entry));
                } else {
                    createWorkExperienceEntry(); // Add at least one empty entry
                }

                // Load education
                if (data.education && data.education.length > 0) {
                    data.education.forEach(entry => createEducationEntry(entry));
                } else {
                    createEducationEntry(); // Add at least one empty entry
                }
                
                // Load links
                if (data.links && data.links.length > 0) {
                    data.links.forEach(entry => createLinkEntry(entry));
                } else {
                    createLinkEntry(); // Add at least one empty entry
                }
            } else {
                // If no data exists, ensure there's at least one empty entry for each section
                createWorkExperienceEntry();
                createEducationEntry();
                createLinkEntry();
            }
        }

        /**
         * Creates a new work experience entry and appends it to the container.
         * @param {object} [data] - Optional object to pre-fill the form fields.
         */
        function createWorkExperienceEntry(data = {}) {
            const newEntry = document.createElement('div');
            newEntry.classList.add('work-experience-item', 'p-4', 'border', 'rounded-lg', 'bg-gray-50', 'flex', 'items-start', 'gap-4');
            newEntry.innerHTML = `
                <div class="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700">Job Title</label>
                        <input type="text" name="jobTitle[]" placeholder="e.g., Senior Software Engineer" value="${data.jobTitle || ''}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700">Company</label>
                        <input type="text" name="company[]" placeholder="e.g., Tech Solutions Inc." value="${data.company || ''}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" name="workStartDate[]" value="${data.startDate || ''}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" name="workEndDate[]" value="${data.endDate || ''}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div class="form-group md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700">Responsibilities</label>
                        <textarea name="responsibilities[]" rows="4" placeholder="Describe your key responsibilities and achievements." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">${data.responsibilities || ''}</textarea>
                    </div>
                </div>
                <button type="button" class="remove-button self-center text-red-500 hover:text-red-700 transition-colors" aria-label="Remove work experience">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            `;
            workExperienceContainer.appendChild(newEntry);
            updateRemoveButtons();
        }

        /**
         * Creates a new education entry and appends it to the container.
         * @param {object} [data] - Optional object to pre-fill the form fields.
         */
        function createEducationEntry(data = {}) {
            const newEntry = document.createElement('div');
            newEntry.classList.add('education-item', 'p-4', 'border', 'rounded-lg', 'bg-gray-50', 'flex', 'items-start', 'gap-4');
            newEntry.innerHTML = `
                <div class="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700">Degree</label>
                        <input type="text" name="degree[]" placeholder="e.g., Bachelor of Science in Computer Science" value="${data.degree || ''}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700">University/School</label>
                        <input type="text" name="school[]" placeholder="e.g., State University" value="${data.school || ''}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" name="eduStartDate[]" value="${data.startDate || ''}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700">End Date</label>
                        <input type="date" name="eduEndDate[]" value="${data.endDate || ''}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                </div>
                <button type="button" class="remove-button self-center text-red-500 hover:text-red-700 transition-colors" aria-label="Remove education entry">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            `;
            educationContainer.appendChild(newEntry);
            updateRemoveButtons();
        }

        /**
         * Creates a new link entry and appends it to the container.
         * @param {object} [data] - Optional object to pre-fill the form fields.
         */
        function createLinkEntry(data = {}) {
            const newEntry = document.createElement('div');
            newEntry.classList.add('link-item', 'flex', 'items-start', 'gap-4', 'p-4', 'border', 'rounded-lg', 'bg-gray-50');
            newEntry.innerHTML = `
                <div class="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700">Link Label</label>
                        <input type="text" name="linkLabel[]" placeholder="e.g., LinkedIn, GitHub" value="${data.label || ''}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700">Link URL</label>
                        <input type="url" name="linkUrl[]" placeholder="https://www.linkedin.com/in/johndoe" value="${data.url || ''}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    </div>
                </div>
                <button type="button" class="remove-button self-center text-red-500 hover:text-red-700 transition-colors" aria-label="Remove link">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            `;
            linksContainer.appendChild(newEntry);
            updateRemoveButtons();
        }

        /**
         * Adds click handlers to all remove buttons to delete their parent container.
         * Also hides the remove button if there's only one item left.
         */
        function updateRemoveButtons() {
            // Get all remove buttons and add a click listener
            document.querySelectorAll('.remove-button').forEach(button => {
                // Ensure the listener is added only once
                if (button.dataset.listenerAdded !== 'true') {
                    button.addEventListener('click', function() {
                        // Check if it's not the last item before removing
                        const parentContainerId = button.closest('.form-section').querySelector('div').id;
                        const items = document.getElementById(parentContainerId).querySelectorAll(`.${parentContainerId.replace('Container', '-item')}`);
                        if (items.length > 1) {
                            button.closest(`.${parentContainerId.replace('Container', '-item')}`).remove();
                            // Re-run this function to update visibility of remaining buttons
                            updateRemoveButtons();
                        }
                    });
                    button.dataset.listenerAdded = 'true';
                }
            });

            // Logic to hide remove button if there's only one item
            const allItemContainers = [workExperienceContainer, educationContainer, linksContainer];
            allItemContainers.forEach(container => {
                const items = container.children;
                if (items.length <= 1) {
                    if (items[0]) {
                        items[0].querySelector('.remove-button').classList.add('hidden');
                    }
                } else {
                    Array.from(items).forEach(item => {
                        item.querySelector('.remove-button').classList.remove('hidden');
                    });
                }
            });
        }


        // Add event listeners for the "Add" buttons
        if (addWorkButton) {
            addWorkButton.addEventListener('click', () => createWorkExperienceEntry());
        }

        if (addEducationButton) {
            addEducationButton.addEventListener('click', () => createEducationEntry());
        }

        if (addLinkButton) {
            addLinkButton.addEventListener('click', () => createLinkEntry());
        }
        
        // Handle photo upload preview
        if (photoUploadInput && profilePhotoPreview) {
            photoUploadInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        profilePhotoPreview.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        /**
         * Validates that mandatory fields are filled.
         * @returns {boolean} - true if the form is valid, false otherwise.
         */
        function validateForm() {
            let isValid = true;
            const requiredFields = [
                document.getElementById('fullName'),
                document.getElementById('email'),
                document.getElementById('summary'),
                document.getElementById('skills')
            ];

            // Check the required simple fields
            requiredFields.forEach(field => {
                if (field && field.value.trim() === '') {
                    field.classList.add('border-red-500'); // Highlight empty field
                    isValid = false;
                } else {
                    field.classList.remove('border-red-500');
                }
            });

            // Check the mandatory dynamic sections (Links and Education)
            // Links Section
            const linkItems = document.querySelectorAll('#linksContainer .link-item');
            if (linkItems.length > 0) {
                const firstLinkInput = linkItems[0].querySelector('input[name="linkUrl[]"]');
                if (firstLinkInput && firstLinkInput.value.trim() === '') {
                    firstLinkInput.classList.add('border-red-500');
                    isValid = false;
                } else {
                    firstLinkInput.classList.remove('border-red-500');
                }
            }

            // Education Section
            const educationItems = document.querySelectorAll('#educationContainer .education-item');
            if (educationItems.length > 0) {
                const firstDegreeInput = educationItems[0].querySelector('input[name="degree[]"]');
                const firstSchoolInput = educationItems[0].querySelector('input[name="school[]"]');
                if ((firstDegreeInput && firstDegreeInput.value.trim() === '') || (firstSchoolInput && firstSchoolInput.value.trim() === '')) {
                    if (firstDegreeInput) firstDegreeInput.classList.add('border-red-500');
                    if (firstSchoolInput) firstSchoolInput.classList.add('border-red-500');
                    isValid = false;
                } else {
                    if (firstDegreeInput) firstDegreeInput.classList.remove('border-red-500');
                    if (firstSchoolInput) firstSchoolInput.classList.remove('border-red-500');
                }
            }
            
            return isValid;
        }

        // Handle form submission
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission
            
            // Validate the form before proceeding
            if (!validateForm()) {
                alert('Please fill out all mandatory fields before continuing.');
                return;
            }
            
            const formData = new FormData(form);
            const data = {};

            // Collect personal info
            data.fullName = formData.get('fullName');
            data.email = formData.get('email');
            data.phone = formData.get('phone');
            data.address = formData.get('address');
            data.summary = formData.get('summary');
            data.skills = formData.get('skills').split(',').map(skill => skill.trim()).filter(Boolean);
            data.languages = formData.get('languages');
            
            // Handle photo data separately
            const photoFile = photoUploadInput.files[0];
            const saveAndRedirect = (resumeData) => {
                // Collect work experience
                resumeData.workExperience = [];
                const jobTitles = formData.getAll('jobTitle[]');
                const companies = formData.getAll('company[]');
                const workStartDates = formData.getAll('workStartDate[]');
                const workEndDates = formData.getAll('workEndDate[]');
                const responsibilities = formData.getAll('responsibilities[]');
                for (let i = 0; i < jobTitles.length; i++) {
                    // Only save if job title is not empty
                    if (jobTitles[i].trim() !== '') {
                        resumeData.workExperience.push({
                            jobTitle: jobTitles[i],
                            company: companies[i],
                            startDate: workStartDates[i],
                            endDate: workEndDates[i],
                            responsibilities: responsibilities[i]
                        });
                    }
                }

                // Collect education
                resumeData.education = [];
                const degrees = formData.getAll('degree[]');
                const schools = formData.getAll('school[]');
                const eduStartDates = formData.getAll('eduStartDate[]');
                const eduEndDates = formData.getAll('eduEndDate[]');
                for (let i = 0; i < degrees.length; i++) {
                    // Only save if degree is not empty
                    if (degrees[i].trim() !== '') {
                        resumeData.education.push({
                            degree: degrees[i],
                            school: schools[i],
                            startDate: eduStartDates[i],
                            endDate: eduEndDates[i]
                        });
                    }
                }
                
                // Collect links
                resumeData.links = [];
                const linkLabels = formData.getAll('linkLabel[]');
                const linkUrls = formData.getAll('linkUrl[]');
                for (let i = 0; i < linkLabels.length; i++) {
                    // Only save if link label or URL is not empty
                    if (linkLabels[i].trim() !== '' || linkUrls[i].trim() !== '') {
                        resumeData.links.push({
                            label: linkLabels[i],
                            url: linkUrls[i]
                        });
                    }
                }

                // Save the data to localStorage
                localStorage.setItem('resumeData', JSON.stringify(resumeData));
                localStorage.setItem('step2Complete', 'true');

                // Show success message and then redirect
                successMessage.classList.remove('hidden');
                successMessage.classList.add('flex');
                setTimeout(() => {
                    successMessage.classList.add('hidden');
                    successMessage.classList.remove('flex');
                    window.location.href = 'steps.html';
                }, 1500); // Wait 1.5 seconds before redirecting
            };

            if (photoFile) {
                const reader = new FileReader();
                reader.onloadend = function() {
                    data.photoData = reader.result;
                    saveAndRedirect(data);
                };
                reader.readAsDataURL(photoFile);
            } else {
                // If no photo is uploaded, just save the other data
                const existingData = JSON.parse(localStorage.getItem('resumeData'));
                data.photoData = existingData ? existingData.photoData : ''; // Preserve existing photo if no new one is uploaded
                saveAndRedirect(data);
            }
        });

        // Initialize the form on page load with existing data or a fresh entry
        loadFormData();
    }
});