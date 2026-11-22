
import { login, register, logout, isAuthenticated, getToken } from './auth.js';
import { api, API_URL } from './api.js';

// Redirect if not authenticated
if (!isAuthenticated() && !window.location.pathname.includes('login.html')) {
    window.location.href = '/login.html';
}

const degreeCourseMapping = {
    "UG": [
        "Bachelor of Commerce",
        "Bachelor of Business Management",
        "Bachelor of Physical Education",
        "Bachelor of Pharmacy",
        "Bachelor of Science",
        "Bachelor of Arts",
        "Bachelor of Business Administration",
        "Bachelor of Arts in Oriental Learning",
        "Diploma in Physical Education",
        "Bachelor of Computer Applications"
    ],
    "PG": [
        "Bachelor of Academic Laws and Bachelor of Laws",
        "Bachelor of Laws",
        "Bachelor of Laws (Hons)",
        "Bachelor of Technology",
        "Master of Arts in Adult Education",
        "Master of Arts in Applied Economics",
        "Master of Arts in Economics",
        "Master of Arts in English",
        "Master of Arts in Hindi",
        "Master of Arts in History",
        "Master of Arts in Political Science",
        "Master of Arts in Public Administration",
        "Master of Arts in Rural Development",
        "Master of Arts in Social Work",
        "Master of Arts in Sociology",
        "Master of Arts in Telugu",
        "Master of Business Administration",
        "Master of Business Administration (Finance)",
        "Master of Commerce",
        "Master of Commerce (Accounting and Finance)",
        "Master of Commerce (Professional)",
        "Master of Computer Applications",
        "Master of Education",
        "Master of Law",
        "Master of Library and Information Sciences",
        "Master of Pharmacy",
        "Master of Physical Education",
        "Master of Science in Mathematics",
        "Master of Science in Applied Mathematics",
        "Master of Science in Biochemistry",
        "Master of Science in Biotechnology",
        "Master of Science in Botany",
        "Master of Science in Chemistry",
        "Master of Science in Computer Science",
        "Master of Science in Electronics and Communications",
        "Master of Science in Electronics and Instrumentation",
        "Master of Science in Geography",
        "Master of Science in Geology",
        "Master of Science in Microbiology",
        "Master of Science in Physics",
        "Master of Science in Polymer Science",
        "Master of Science in Sericulture",
        "Master of Science in Statistics",
        "Master of Science in Zoology",
        "Master of Technology",
        "Post Graduate Diploma in Yoga",
        "Bachelor of Commerce",
        "Bachelor of Business Management",
        "Bachelor of Education",
        "Bachelor of Physical Education",
        "Bachelor of Pharmacy",
        "Bachelor of Science",
        "Bachelor of Arts",
        "Bachelor of Business Administration",
        "Bachelor of Arts in Oriental Learning",
        "Diploma in Physical Education",
        "Master of Science in Information Systems",
        "Master of Science in Operations Research and Statistical Quality Control",
        "Master of Science in Electronics",
        "Master of Science in Instrumentation",
        "Bachelor of Commerce and Bachelor of Laws",
        "Bachelor of Business Administration and Bachelor of Laws",
        "Bachelor of Library and Information Science",
        "Post Graduate Diploma in Computer Application",
        "Bachelor of Computer Applications",
        "Bachelor of Administration",
        "Master of Science in Physical Education",
        "Master of Science in Polymer Science and Technology",
        "Master of Science in Organic Chemistry",
        "Post Graduate Diploma in Business Administration",
        "Post Graduate Diploma in Rural Development"
    ],
    "UG Education": [
        "Bachelor of Education",
        "Bachelor of Physical Education"
    ]
};

const facultyOptions = [
    "Faculty of Education",
    "Faculty of Law",
    "Faculty of Pharmacy",
    "Faculty of Engineering",
    "Faculty of Arts",
    "Faculty of Commerce",
    "Faculty of Science",
    "Faculty of Management"
];

const updateCourseOptions = (degree, courseSelect) => {
    if (!courseSelect) return;
    courseSelect.innerHTML = '<option value="">---Select Course---</option>';
    const courses = degreeCourseMapping[degree] || [];
    courses.forEach(course => {
        const opt = document.createElement('option');
        opt.value = course;
        opt.textContent = course;
        courseSelect.appendChild(opt);
    });
};

if (window.location.pathname.includes('login.html')) {
    const loginForm = document.getElementById('loginForm');
    const msgDiv = document.getElementById('message');
    const toggleReg = document.getElementById('toggleRegister');
    let isRegisterHeader = false;

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            msgDiv.textContent = 'Loading...';
            msgDiv.className = 'mt-4 text-center text-sm text-blue-600';

            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                if (isRegisterHeader) {
                    await register(data.name || 'User', data.email, data.mobile || '0000000000', data.password);
                    msgDiv.textContent = 'Registration successful! Please login.';
                    msgDiv.className = 'mt-4 text-center text-sm text-green-600';
                    setTimeout(() => location.reload(), 1000); // Reload to reset state to login
                } else {
                    await login(data.email, data.password);
                    window.location.href = '/';
                }
            } catch (err) {
                msgDiv.textContent = err.message;
                msgDiv.className = 'mt-4 text-center text-sm text-red-600';
            }
        });
    }

    if (toggleReg) {
        toggleReg.addEventListener('click', (e) => {
            e.preventDefault();
            isRegisterHeader = !isRegisterHeader;
            const h1 = document.querySelector('h1');
            const sub = document.querySelector('p');
            const submitBtn = document.querySelector('button[type="submit"]');

            if (isRegisterHeader) {
                h1.textContent = 'Register';
                sub.textContent = 'Create a new account';
                submitBtn.textContent = 'Register';

                // Add name field
                const nameDiv = document.createElement('div');
                nameDiv.id = 'nameField';
                nameDiv.innerHTML = `<label class="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" name="name" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm">`;
                loginForm.insertBefore(nameDiv, loginForm.firstChild);

                toggleReg.textContent = 'Login';
            } else {
                h1.textContent = 'Convocation Management';
                sub.textContent = 'Login to your account';
                submitBtn.textContent = 'Sign in';
                const nameField = document.getElementById('nameField');
                if (nameField) nameField.remove();
                toggleReg.textContent = 'Register';
            }
        });
    }
}

// Sidebar Navigation
const setupNavigation = () => {
    const links = document.querySelectorAll('.nav-link');
    const views = document.querySelectorAll('.content-view');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.target;

            // Update Active Link
            links.forEach(l => {
                l.classList.remove('bg-gray-900');
                l.classList.add('hover:bg-gray-700');
            });
            link.classList.add('bg-gray-900');
            link.classList.remove('hover:bg-gray-700');

            // Show Target View
            views.forEach(view => {
                view.classList.add('hidden');
                if (view.id === `view-${target}`) {
                    view.classList.remove('hidden');
                    // Refresh stats if dashboard is shown
                    if (target === 'dashboard') {
                        loadDashboardStats();
                    }
                }
            });
        });
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
};

const loadMasterData = async () => {
    try {
        // Categories
        const categories = await api.getCategories();
        const select = document.getElementById('categorySelect');
        if (select) {
            select.innerHTML = '<option value="">Select Category</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.category_name;
                option.textContent = `${cat.category_code} (${cat.category_name})`;
                select.appendChild(option);
            });
        }

        // Degrees
        const degSelect = document.getElementById('degreeSelect');
        if (degSelect) {
            degSelect.innerHTML = '<option value="">Select Degree</option>';
            ["UG", "PG", "UG Education"].forEach(deg => {
                const opt = document.createElement('option');
                opt.value = deg;
                opt.textContent = deg;
                degSelect.appendChild(opt);
            });
        }

        // Faculties
        const facSelect = document.getElementById('facultySelect');
        if (facSelect) {
            facSelect.innerHTML = '<option value="">---Select Faculty---</option>';
            facultyOptions.forEach(fac => {
                const opt = document.createElement('option');
                opt.value = fac;
                opt.textContent = fac;
                facSelect.appendChild(opt);
            });
        }

        // Courses
        const courseSelect = document.getElementById('courseSelect');
        if (courseSelect) {
            courseSelect.innerHTML = '<option value="">---Select Course---</option>';
        }
        // Courses are now populated dynamically based on Degree selection

        // Subjects
        let subjects = await api.getSubjects();
        if (!Array.isArray(subjects) && subjects.data) {
            subjects = subjects.data;
        }

        const subjectSelect = document.getElementById('subjectSelect');
        if (subjectSelect) {
            subjectSelect.innerHTML = '<option value="">Select Subject</option>';
            if (Array.isArray(subjects)) {
                subjects.forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = sub.subject_name;
                    opt.textContent = `${sub.subject_name}`;
                    subjectSelect.appendChild(opt);
                });
            }
        }

        // Specializations
        let specializations = await api.getSpecializations();
        if (!Array.isArray(specializations) && specializations.data) {
            specializations = specializations.data;
        }

        const specializationSelect = document.getElementById('specializationSelect');
        if (specializationSelect) {
            specializationSelect.innerHTML = '<option value="">Select Specialization</option>';
            if (Array.isArray(specializations)) {
                specializations.forEach(spec => {
                    const opt = document.createElement('option');
                    opt.value = spec.specialization_name;
                    opt.textContent = `${spec.specialization_name}`;
                    specializationSelect.appendChild(opt);
                });
            }
        }

        // Mediums
        let mediums = await api.getMediums();
        if (!Array.isArray(mediums) && mediums.data) {
            mediums = mediums.data;
        }

        const mediumSelect = document.getElementById('mediumSelect');
        if (mediumSelect) {
            mediumSelect.innerHTML = '<option value="">Select Medium</option>';
            if (Array.isArray(mediums)) {
                mediums.forEach(med => {
                    const opt = document.createElement('option');
                    opt.value = med.medium_name;
                    opt.textContent = `${med.medium_name}`;
                    mediumSelect.appendChild(opt);
                });
            }
        }

        // Payment Categories
        let paymentCategories = await api.getPaymentCategories();
        if (!Array.isArray(paymentCategories) && paymentCategories.data) {
            paymentCategories = paymentCategories.data;
        }

        const paymentCategorySelect = document.getElementById('paymentCategorySelect');
        if (paymentCategorySelect) {
            paymentCategorySelect.innerHTML = '<option value="">Select Payment Category</option>';
            if (Array.isArray(paymentCategories)) {
                paymentCategories.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat.category_name;
                    opt.textContent = `${cat.category_name}`;
                    paymentCategorySelect.appendChild(opt);
                });
            }
        }

        // Payment Modes
        let paymentModes = await api.getPaymentModes();
        if (!Array.isArray(paymentModes) && paymentModes.data) {
            paymentModes = paymentModes.data;
        }

        const paymentModeSelect = document.getElementById('paymentModeSelect');
        if (paymentModeSelect) {
            paymentModeSelect.innerHTML = '<option value="">Select Mode</option>';
            if (Array.isArray(paymentModes)) {
                paymentModes.forEach(mode => {
                    const opt = document.createElement('option');
                    opt.value = mode.mode_name;
                    opt.textContent = `${mode.mode_name}`;
                    paymentModeSelect.appendChild(opt);
                });
            }
        }

        // Convocation Issued
        let convocationIssuedItems = await api.getConvocationIssued();
        if (!Array.isArray(convocationIssuedItems) && convocationIssuedItems.data) {
            convocationIssuedItems = convocationIssuedItems.data;
        }

        const convocationIssuedSelect = document.getElementById('convocationIssuedSelect');
        if (convocationIssuedSelect) {
            convocationIssuedSelect.innerHTML = '<option value="">Select Option</option>';
            if (Array.isArray(convocationIssuedItems)) {
                convocationIssuedItems.forEach(item => {
                    const opt = document.createElement('option');
                    opt.value = item.issued_name;
                    opt.textContent = `${item.issued_name}`;
                    convocationIssuedSelect.appendChild(opt);
                });
            }
        }

        // Second Language
        let secondLanguages = await api.getSecondLanguages();
        if (!Array.isArray(secondLanguages) && secondLanguages.data) secondLanguages = secondLanguages.data;
        const secondLanguageSelect = document.getElementById('secondLanguageSelect');
        if (secondLanguageSelect) {
            secondLanguageSelect.innerHTML = '<option value="">Select Language</option>';
            if (Array.isArray(secondLanguages)) {
                secondLanguages.forEach(lang => {
                    const opt = document.createElement('option');
                    opt.value = lang.language_name;
                    opt.textContent = `${lang.language_name}`;
                    secondLanguageSelect.appendChild(opt);
                });
            }
        }

        // Part II
        let partII = await api.getPartII();
        if (!Array.isArray(partII) && partII.data) partII = partII.data;
        const partIISelect = document.getElementById('partIISelect');
        if (partIISelect) {
            partIISelect.innerHTML = '<option value="">Select Option</option>';
            if (Array.isArray(partII)) {
                partII.forEach(opt => {
                    const el = document.createElement('option');
                    el.value = opt.option_name;
                    el.textContent = `${opt.option_name}`;
                    partIISelect.appendChild(el);
                });
            }
        }

        // Part III
        let partIII = await api.getPartIII();
        if (!Array.isArray(partIII) && partIII.data) partIII = partIII.data;
        const partIIISelect = document.getElementById('partIIISelect');
        if (partIIISelect) {
            partIIISelect.innerHTML = '<option value="">Select Option</option>';
            if (Array.isArray(partIII)) {
                partIII.forEach(opt => {
                    const el = document.createElement('option');
                    el.value = opt.option_name;
                    el.textContent = `${opt.option_name}`;
                    partIIISelect.appendChild(el);
                });
            }
        }

    } catch (err) {
        console.error('Failed to load master data', err);
    }
};

const convertImageToJpeg = async (file) => {
    if (!file || !(file instanceof File) || file.size === 0) return file;
    if (!file.type.startsWith('image/')) return file;
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || img.width;
                    canvas.height = img.naturalHeight || img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const baseName = file.name.replace(/\.[^/.]+$/, "");
                            const jpegFile = new File([blob], `${baseName}.jpeg`, { type: 'image/jpeg' });
                            resolve(jpegFile);
                        } else {
                            resolve(file);
                        }
                    }, 'image/jpeg', 0.85);
                } catch (canvasErr) {
                    console.error("Student photo JPEG conversion error:", canvasErr);
                    resolve(file);
                }
            };
            img.onerror = (imgErr) => {
                console.error("Student photo loading error for JPEG conversion:", imgErr);
                resolve(file);
            };
            img.src = e.target.result;
        };
        reader.onerror = (readErr) => {
            console.error("Student photo file read error:", readErr);
            resolve(file);
        };
        reader.readAsDataURL(file);
    });
};

const setupForms = () => {
    const mainForm = document.getElementById('convocationForm');

    if (mainForm) {
        mainForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!confirm('Are you sure you want to save this application?')) {
                return;
            }

            const submitBtn = mainForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            const formData = new FormData(mainForm);

            const photoInput = mainForm.querySelector('input[name="student_photo"]');
            if (photoInput && photoInput.files && photoInput.files[0]) {
                try {
                    const convertedPhoto = await convertImageToJpeg(photoInput.files[0]);
                    formData.set('student_photo', convertedPhoto, convertedPhoto.name);
                } catch (pErr) {
                    console.error("Student photo upload failed:", pErr);
                }
            }

            try {
                const response = await api.submitConvocation(formData);
                alert(response.message || 'Application data saved successfully');
                mainForm.reset();
                // Reset course select to default
                const courseSelect = mainForm.querySelector('#courseSelect');
                if (courseSelect) courseSelect.innerHTML = '<option value="">---Select Course---</option>';
            } catch (err) {
                console.error("Form submission error:", err);
                if (err.message && err.message.toLowerCase().includes('photo')) {
                    console.error("Student photo upload failed:", err);
                }
                if (err.message && err.message.toLowerCase().includes('certificate')) {
                    console.error("Certificate upload failed:", err);
                }
                alert('Submission Failed: ' + err.message);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        // Add dynamic Degree -> Course logic
        const degreeSelect = document.getElementById('degreeSelect');
        const courseSelect = document.getElementById('courseSelect');
        if (degreeSelect && courseSelect) {
            degreeSelect.addEventListener('change', (e) => {
                updateCourseOptions(e.target.value, courseSelect);
            });
        }
    }

    const formatDateForInput = (val) => {
        if (!val) return '';
        if (typeof val === 'string') {
            const trimmed = val.trim();
            if (trimmed.includes('T')) {
                return trimmed.split('T')[0];
            }
            if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                return trimmed;
            }
            const parts = trimmed.split(/[-/]/);
            if (parts.length === 3) {
                if (parts[2].length === 4) {
                    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            }
            const d = new Date(trimmed);
            if (!isNaN(d.getTime())) {
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${y}-${m}-${day}`;
            }
        } else if (val instanceof Date && !isNaN(val.getTime())) {
            const y = val.getFullYear();
            const m = String(val.getMonth() + 1).padStart(2, '0');
            const day = String(val.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }
        return '';
    };

    const searchEditBtn = document.getElementById('searchForEditBtn');
    if (searchEditBtn) {
        searchEditBtn.addEventListener('click', async () => {
            const htno = document.getElementById('editSearchHTNO').value;
            if (!htno) return alert('Enter Hall Ticket Number');

            try {
                const data = await api.getConvocation(htno);
                // Populate Edit Form
                const editContainer = document.getElementById('editFormContainer');
                editContainer.innerHTML = ''; // clear previous

                // Clone the main form to reuse layout
                const formClone = document.getElementById('convocationForm').cloneNode(true);
                formClone.id = 'editConvocationForm';
                const submitBtn = formClone.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.textContent = 'Update Application';

                const editDegreeSelect = formClone.querySelector('[name="degree"]');
                const editCourseSelect = formClone.querySelector('[name="course_group"]');

                if (editDegreeSelect && editCourseSelect) {
                    editDegreeSelect.addEventListener('change', (e) => {
                        updateCourseOptions(e.target.value, editCourseSelect);
                    });
                }

                // If degree is already set in data, populate course options immediately
                if (data.degree && editCourseSelect) {
                    updateCourseOptions(data.degree, editCourseSelect);
                }

                // Populate inputs
                Array.from(formClone.elements).forEach(el => {
                    if (!el.name) return;

                    // Handle File Inputs for Edit Mode
                    if (el.type === 'file') {
                        // Make file input optional for update
                        el.removeAttribute('required');
                        el.required = false;

                        // Remove existing preview if any
                        const existingPreview = el.parentNode.querySelector('.file-preview-container');
                        if (existingPreview) existingPreview.remove();

                        let previewHtml = '';

                        // 1. Student Photo
                        if (el.name === 'student_photo') {
                            const hasPhoto = Boolean(data.student_photo || data.has_student_photo_blob);
                            if (hasPhoto) {
                                const photoUrl = `${API_URL}/convocation/photo/${encodeURIComponent(data.hall_ticket_no)}?t=${Date.now()}`;
                                previewHtml = `
                                    <div class="mt-2 text-sm text-gray-700 bg-blue-50/60 p-3 rounded-lg border border-blue-100">
                                        <p class="mb-1.5 font-medium text-gray-800 flex items-center gap-1.5">
                                            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span> Current Uploaded Photo:
                                        </p>
                                        <div class="flex items-center gap-3">
                                            <img src="${photoUrl}" alt="Student Photo" class="h-24 w-24 object-cover rounded-md border border-gray-300 shadow-sm bg-white" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'text-gray-600 text-xs\\'>Photo: ${data.student_photo || 'Attached in Database'}</span>'">
                                            <span class="text-xs text-gray-500">Leave file input empty to keep this photo, or select a new file to change it.</span>
                                        </div>
                                    </div>
                                `;
                            }
                        }
                        // 2. Certificate
                        else if (el.name === 'dd_challan_certificate') {
                            const hasCert = Boolean(data.dd_challan_certificate || data.has_dd_challan_certificate_blob);
                            if (hasCert) {
                                const certUrl = `${API_URL}/convocation/certificate/${encodeURIComponent(data.hall_ticket_no)}?t=${Date.now()}`;
                                const certName = data.dd_challan_certificate || 'Saved Certificate';
                                previewHtml = `
                                    <div class="mt-2 text-sm text-gray-700 bg-blue-50/60 p-3 rounded-lg border border-blue-100">
                                        <p class="mb-1 font-medium text-gray-800 flex items-center gap-1.5">
                                            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span> Current Uploaded Certificate:
                                        </p>
                                        <div class="flex items-center gap-2 mt-1">
                                            <a href="${certUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-900 rounded-md text-xs font-semibold border border-blue-300 shadow-sm transition-colors">
                                                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                                View Saved Certificate (${certName})
                                            </a>
                                            <span class="text-xs text-gray-500">Leave empty to keep existing, or choose new file to replace.</span>
                                        </div>
                                    </div>
                                `;
                            }
                        }

                        if (previewHtml) {
                            const container = document.createElement('div');
                            container.className = 'file-preview-container mt-2';
                            container.innerHTML = previewHtml;
                            el.parentNode.appendChild(container);
                        }
                        return;
                    }

                    // Handle Date inputs
                    if (el.type === 'date') {
                        const formattedDate = formatDateForInput(data[el.name]);
                        el.value = formattedDate;
                        return;
                    }

                    // Handle other inputs and selects
                    if (data[el.name] !== undefined && data[el.name] !== null) {
                        el.value = data[el.name];
                        if (el.name === 'degree' && editCourseSelect) {
                            updateCourseOptions(el.value, editCourseSelect);
                        }
                    }

                    if (el.name === 'hall_ticket_no') {
                        el.setAttribute('readonly', true);
                        el.classList.add('bg-gray-200');
                    }
                });

                // Ensure course_group is selected after course options are populated
                if (data.course_group && editCourseSelect) {
                    editCourseSelect.value = data.course_group;
                }

                // Attach IFSC Code change listener for edit form
                const editIfsc = formClone.querySelector('[name="ifsc_code"]');
                const editBank = formClone.querySelector('[name="bank_name"]');
                const editBranch = formClone.querySelector('[name="branch_name"]');
                if (editIfsc && editBank && editBranch) {
                    editIfsc.addEventListener('change', (e) => {
                        const selectedIFSC = e.target.value;
                        if (selectedIFSC === 'SBIN0016825') {
                            editBank.value = 'STATE BANK OF INDIA';
                            editBranch.value = 'SKU BRANCH';
                        } else if (selectedIFSC === 'UBIN0815225') {
                            editBank.value = 'UNION BANK';
                            editBranch.value = 'SKU BRANCH';
                        } else {
                            editBank.value = '';
                            editBranch.value = '';
                        }
                    });
                }

                // Handle Update Form Submit
                formClone.addEventListener('submit', async (ev) => {
                    ev.preventDefault();
                    const updateBtn = formClone.querySelector('button[type="submit"]');
                    const origBtnText = updateBtn ? updateBtn.textContent : 'Update Application';
                    if (updateBtn) {
                        updateBtn.textContent = 'Updating...';
                        updateBtn.disabled = true;
                    }

                    const formData = new FormData(formClone);

                    const editPhotoInput = formClone.querySelector('input[name="student_photo"]');
                    if (editPhotoInput && editPhotoInput.files && editPhotoInput.files[0]) {
                        try {
                            const convertedPhoto = await convertImageToJpeg(editPhotoInput.files[0]);
                            formData.set('student_photo', convertedPhoto, convertedPhoto.name);
                        } catch (pErr) {
                            console.error("Student photo upload failed:", pErr);
                        }
                    }

                    try {
                        const res = await api.updateConvocation(htno, formData);
                        alert(res.message || 'Application Updated Successfully');
                    } catch (err) {
                        console.error("Update error:", err);
                        if (err.message && err.message.toLowerCase().includes('photo')) {
                            console.error("Student photo upload failed:", err);
                        }
                        if (err.message && err.message.toLowerCase().includes('certificate')) {
                            console.error("Certificate upload failed:", err);
                        }
                        alert('Update Failed: ' + err.message);
                    } finally {
                        if (updateBtn) {
                            updateBtn.textContent = origBtnText;
                            updateBtn.disabled = false;
                        }
                    }
                });

                editContainer.appendChild(formClone);

            } catch (err) {
                alert(err.message);
            }
        });
    }

    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            const htno = document.getElementById('downloadHTNO').value;
            if (!htno) return alert('Please enter Hall Ticket Number');

            const originalText = downloadBtn.textContent;
            downloadBtn.textContent = 'Downloading...';
            downloadBtn.disabled = true;

            try {
                await api.downloadPDF(htno);
            } catch (err) {
                alert('Download Failed: ' + err.message);
            } finally {
                downloadBtn.textContent = originalText;
                downloadBtn.disabled = false;
            }
        });
    }

    // IFSC Code Auto-fill Logic
    const ifscCodeSelect = document.getElementById('ifscCode');
    const bankNameInput = document.getElementById('bankName');
    const branchNameInput = document.getElementById('branchName');

    if (ifscCodeSelect && bankNameInput && branchNameInput) {
        ifscCodeSelect.addEventListener('change', (e) => {
            const selectedIFSC = e.target.value;

            if (selectedIFSC === 'SBIN0016825') {
                bankNameInput.value = 'STATE BANK OF INDIA';
                branchNameInput.value = 'SKU BRANCH';
            } else if (selectedIFSC === 'UBIN0815225') {
                bankNameInput.value = 'UNION BANK';
                branchNameInput.value = 'SKU BRANCH';
            } else {
                // Clear fields if no valid IFSC is selected
                bankNameInput.value = '';
                branchNameInput.value = '';
            }
        });
    }
};

// Category Management
const setupCategoryManagement = () => {
    // 1. Role Check
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const manageLink = document.getElementById('manageCategoriesLink');
    if (!manageLink) return;

    if (user.role === 'admin') {
        manageLink.classList.remove('hidden');
    } else {
        return; // Stop if not admin
    }

    // 2. Load Data Function
    const loadCategories = async () => {
        try {
            const categories = await api.getCategories();
            const tbody = document.getElementById('categoriesTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                categories.forEach(cat => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cat.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cat.category_code}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cat.category_name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button class="text-indigo-600 hover:text-indigo-900 edit-cat-btn" data-id="${cat.id}" data-code="${cat.category_code}" data-name="${cat.category_name}">Edit</button>
                            <button class="text-red-600 hover:text-red-900 ml-4 delete-cat-btn" data-id="${cat.id}">Delete</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                attachActionListeners();
            }
        } catch (err) {
            console.error(err);
            alert('Failed to load categories');
        }
    };

    const attachActionListeners = () => {
        document.querySelectorAll('.edit-cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => { // Use 'e' to avoid propagation optional
                openModal(btn.dataset.id, btn.dataset.code, btn.dataset.name);
            });
        });
        document.querySelectorAll('.delete-cat-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this category?')) {
                    try {
                        await api.deleteCategory(btn.dataset.id);
                        loadCategories();
                        loadMasterData(); // Refresh global dropdown too
                    } catch (err) {
                        alert(err.message);
                    }
                }
            });
        });
    };

    // 3. Modal Logic
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    const modalTitle = document.getElementById('modalTitle');
    const closeBtn = document.getElementById('closeModalBtn');
    const addBtn = document.getElementById('addCategoryBtn');

    if (!modal || !form) return;

    const openModal = (id = '', code = '', name = '') => {
        document.getElementById('catId').value = id;
        document.getElementById('catCode').value = code;
        document.getElementById('catName').value = name;
        modalTitle.textContent = id ? 'Edit Category' : 'Add Category';
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        form.reset();
    };

    if (addBtn) addBtn.addEventListener('click', () => openModal());
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Remove existing listeners to avoid duplicates if re-run (though this runs once usually)
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('catId').value;
        const data = {
            category_code: document.getElementById('catCode').value,
            category_name: document.getElementById('catName').value
        };

        try {
            if (id) {
                await api.updateCategory(id, data);
            } else {
                await api.addCategory(data);
            }
            closeModal();
            loadCategories();
            loadMasterData();
        } catch (err) {
            alert(err.message);
        }
    });

    // Initial Load when view is shown
    manageLink.addEventListener('click', loadCategories);
};

// Degree Management
const setupDegreeManagement = () => {
    // 1. Role Check
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const manageLink = document.getElementById('manageDegreesLink');
    if (!manageLink) return;

    if (user.role === 'admin') {
        manageLink.classList.remove('hidden');
    } else {
        return; // Stop if not admin
    }

    // 2. Load Data Function
    const loadDegrees = async () => {
        try {
            const degrees = await api.getDegrees();
            const tbody = document.getElementById('degreesTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                degrees.forEach(deg => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${deg.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${deg.degree_code}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${deg.degree_name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button class="text-indigo-600 hover:text-indigo-900 edit-deg-btn" data-id="${deg.id}" data-code="${deg.degree_code}" data-name="${deg.degree_name}">Edit</button>
                            <button class="text-red-600 hover:text-red-900 ml-4 delete-deg-btn" data-id="${deg.id}">Delete</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                attachActionListeners();
            }
        } catch (err) {
            console.error(err);
            alert('Failed to load degrees');
        }
    };

    const attachActionListeners = () => {
        document.querySelectorAll('.edit-deg-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                openModal(btn.dataset.id, btn.dataset.code, btn.dataset.name);
            });
        });
        document.querySelectorAll('.delete-deg-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this degree?')) {
                    try {
                        await api.deleteDegree(btn.dataset.id);
                        loadDegrees();
                        loadMasterData(); // Refresh global dropdown
                    } catch (err) {
                        alert(err.message);
                    }
                }
            });
        });
    };

    // 3. Modal Logic
    const modal = document.getElementById('degreeModal');
    const form = document.getElementById('degreeForm');
    const modalTitle = document.getElementById('degreeModalTitle');
    const closeBtn = document.getElementById('closeDegreeModalBtn');
    const addBtn = document.getElementById('addDegreeBtn');

    if (!modal || !form) return;

    const openModal = (id = '', code = '', name = '') => {
        document.getElementById('degId').value = id;
        document.getElementById('degCode').value = code;
        document.getElementById('degName').value = name;
        modalTitle.textContent = id ? 'Edit Degree' : 'Add Degree';
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        form.reset();
    };

    if (addBtn) addBtn.addEventListener('click', () => openModal());
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('degId').value;
        const data = {
            degree_code: document.getElementById('degCode').value,
            degree_name: document.getElementById('degName').value
        };

        try {
            if (id) {
                await api.updateDegree(id, data);
            } else {
                await api.addDegree(data);
            }
            closeModal();
            loadDegrees();
            loadMasterData();
        } catch (err) {
            alert(err.message);
        }
    });

    // Initial Load when view is shown
    manageLink.addEventListener('click', loadDegrees);
};

// Faculty Management
const setupFacultyManagement = () => {
    // 1. Role Check
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const manageLink = document.getElementById('manageFacultiesLink');
    if (!manageLink) return;

    if (user.role === 'admin') {
        manageLink.classList.remove('hidden');
    } else {
        return; // Stop if not admin
    }

    // 2. Load Data Function
    const loadFaculties = async () => {
        try {
            const faculties = await api.getFaculties();
            const tbody = document.getElementById('facultiesTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                faculties.forEach(fac => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${fac.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${fac.faculty_code}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${fac.faculty_name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button class="text-indigo-600 hover:text-indigo-900 edit-fac-btn" data-id="${fac.id}" data-code="${fac.faculty_code}" data-name="${fac.faculty_name}">Edit</button>
                            <button class="text-red-600 hover:text-red-900 ml-4 delete-fac-btn" data-id="${fac.id}">Delete</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                attachActionListeners();
            }
        } catch (err) {
            console.error(err);
            alert('Failed to load faculties');
        }
    };

    const attachActionListeners = () => {
        document.querySelectorAll('.edit-fac-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                openModal(btn.dataset.id, btn.dataset.code, btn.dataset.name);
            });
        });
        document.querySelectorAll('.delete-fac-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this faculty?')) {
                    try {
                        await api.deleteFaculty(btn.dataset.id);
                        loadFaculties();
                        loadMasterData(); // Refresh global dropdown
                    } catch (err) {
                        alert(err.message);
                    }
                }
            });
        });
    };

    // 3. Modal Logic
    const modal = document.getElementById('facultyModal');
    const form = document.getElementById('facultyForm');
    const modalTitle = document.getElementById('facultyModalTitle');
    const closeBtn = document.getElementById('closeFacultyModalBtn');
    const addBtn = document.getElementById('addFacultyBtn');

    if (!modal || !form) return;

    const openModal = (id = '', code = '', name = '') => {
        document.getElementById('facId').value = id;
        document.getElementById('facCode').value = code;
        document.getElementById('facName').value = name;
        modalTitle.textContent = id ? 'Edit Faculty' : 'Add Faculty';
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        form.reset();
    };

    if (addBtn) addBtn.addEventListener('click', () => openModal());
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('facId').value;
        const data = {
            faculty_code: document.getElementById('facCode').value,
            faculty_name: document.getElementById('facName').value
        };

        try {
            if (id) {
                await api.updateFaculty(id, data);
            } else {
                await api.addFaculty(data);
            }
            closeModal();
            loadFaculties();
            loadMasterData();
        } catch (err) {
            alert(err.message);
        }
    });

    // Initial Load when view is shown
    manageLink.addEventListener('click', loadFaculties);
};

const setupCourseManagement = () => {
    // 1. Role Check
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const manageLink = document.getElementById('manageCoursesLink');
    if (!manageLink) return;

    if (user.role === 'admin') {
        manageLink.classList.remove('hidden');
    } else {
        return; // Stop if not admin
    }

    // 2. Load Data Function
    const loadCourses = async () => {
        try {
            const courses = await api.getCourses();
            const tbody = document.getElementById('coursesTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                courses.forEach(course => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${course.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${course.course_code}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${course.course_name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button class="text-indigo-600 hover:text-indigo-900 edit-course-btn" data-id="${course.id}" data-code="${course.course_code}" data-name="${course.course_name}">Edit</button>
                            <button class="text-red-600 hover:text-red-900 ml-4 delete-course-btn" data-id="${course.id}">Delete</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                attachActionListeners();
            }
        } catch (err) {
            console.error('Error loading courses:', err);
        }
    };

    // 3. Attach Listeners (Edit/Delete)
    const attachActionListeners = () => {
        document.querySelectorAll('.edit-course-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const code = btn.getAttribute('data-code');
                const name = btn.getAttribute('data-name');
                openModal(id, code, name);
            });
        });

        document.querySelectorAll('.delete-course-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this course?')) {
                    try {
                        await api.deleteCourse(id);
                        loadCourses();
                        loadMasterData(); // Refresh dropdown
                    } catch (err) {
                        alert(err.message);
                    }
                }
            });
        });
    };

    // 4. Modal Logic
    const modal = document.getElementById('courseModal');
    const form = document.getElementById('courseForm');
    const modalTitle = document.getElementById('courseModalTitle');
    const courseIdInput = document.getElementById('courseId');
    const courseCodeInput = document.getElementById('courseCode');
    const courseNameInput = document.getElementById('courseName');

    const openModal = (id = '', code = '', name = '') => {
        courseIdInput.value = id;
        courseCodeInput.value = code;
        courseNameInput.value = name;
        modalTitle.textContent = id ? 'Edit Course' : 'Add Course';
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        form.reset();
    };

    document.getElementById('addCourseBtn').addEventListener('click', () => openModal());
    document.getElementById('closeCourseModalBtn').addEventListener('click', closeModal);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = courseIdInput.value;
        const data = {
            course_code: courseCodeInput.value,
            course_name: courseNameInput.value
        };

        try {
            if (id) {
                await api.updateCourse(id, data);
            } else {
                await api.addCourse(data);
            }
            closeModal();
            loadCourses();
            loadMasterData();
        } catch (err) {
            alert(err.message);
        }
    });

    // Initial Load when view is shown
    manageLink.addEventListener('click', loadCourses);
};

const setupSubjectManagement = () => {
    // 1. Role Check
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const manageLink = document.getElementById('manageSubjectsLink');
    if (!manageLink) return;

    if (user.role === 'admin') {
        manageLink.classList.remove('hidden');
    } else {
        return; // Stop if not admin
    }

    // 2. Load Data Function
    const loadSubjects = async () => {
        try {
            let subjects = await api.getSubjects();
            if (!Array.isArray(subjects) && subjects.data) {
                subjects = subjects.data;
            }

            const tbody = document.getElementById('subjectsTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                if (Array.isArray(subjects)) {
                    subjects.forEach(sub => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sub.id}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sub.subject_code}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sub.subject_name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button class="text-indigo-600 hover:text-indigo-900 edit-subject-btn" data-id="${sub.id}" data-code="${sub.subject_code}" data-name="${sub.subject_name}">Edit</button>
                                <button class="text-red-600 hover:text-red-900 ml-4 delete-subject-btn" data-id="${sub.id}">Delete</button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                    attachActionListeners();
                }
            }
        } catch (err) {
            console.error('Error loading subjects:', err);
        }
    };

    // 3. Attach Listeners (Edit/Delete)
    const attachActionListeners = () => {
        document.querySelectorAll('.edit-subject-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const code = btn.getAttribute('data-code');
                const name = btn.getAttribute('data-name');
                openModal(id, code, name);
            });
        });

        document.querySelectorAll('.delete-subject-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this subject?')) {
                    try {
                        await api.deleteSubject(id);
                        loadSubjects();
                        loadMasterData(); // Refresh dropdown
                    } catch (err) {
                        alert(err.message);
                    }
                }
            });
        });
    };

    // 4. Modal Logic
    const modal = document.getElementById('subjectModal');
    const form = document.getElementById('subjectForm');
    const modalTitle = document.getElementById('subjectModalTitle');
    const subjectIdInput = document.getElementById('subjectId');
    const subjectCodeInput = document.getElementById('subjectCode');
    const subjectNameInput = document.getElementById('subjectName');

    const openModal = (id = '', code = '', name = '') => {
        subjectIdInput.value = id;
        subjectCodeInput.value = code;
        subjectNameInput.value = name;
        modalTitle.textContent = id ? 'Edit Subject' : 'Add Subject';
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        form.reset();
    };

    document.getElementById('addSubjectBtn').addEventListener('click', () => openModal());
    document.getElementById('closeSubjectModalBtn').addEventListener('click', closeModal);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = subjectIdInput.value;
        const data = {
            subject_code: subjectCodeInput.value,
            subject_name: subjectNameInput.value
        };

        try {
            if (id) {
                await api.updateSubject(id, data);
            } else {
                await api.addSubject(data);
            }
            closeModal();
            loadSubjects();
            loadMasterData();
        } catch (err) {
            alert(err.message);
        }
    });

    // Initial Load when view is shown
    manageLink.addEventListener('click', loadSubjects);
};



const setupConvocationIssuedManagement = () => {
    // 1. Role Check
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const manageLink = document.getElementById('manageConvocationIssuedLink');
    if (!manageLink) return;

    if (user.role === 'admin') {
        manageLink.classList.remove('hidden');
    } else {
        return; // Stop if not admin
    }

    // 2. Load Data Function
    const loadConvocationIssuedItems = async () => {
        try {
            let items = await api.getConvocationIssued();
            if (!Array.isArray(items) && items.data) {
                items = items.data;
            }

            const tbody = document.getElementById('convocationIssuedTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                if (Array.isArray(items)) {
                    items.forEach(item => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.id}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.issued_code}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.issued_name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button class="text-indigo-600 hover:text-indigo-900 edit-convocation-issued-btn" data-id="${item.id}" data-code="${item.issued_code}" data-name="${item.issued_name}">Edit</button>
                                <button class="text-red-600 hover:text-red-900 ml-4 delete-convocation-issued-btn" data-id="${item.id}">Delete</button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                    attachActionListeners();
                }
            }
        } catch (err) {
            console.error('Error loading convocation issued items:', err);
        }
    };

    // 3. Attach Listeners (Edit/Delete)
    const attachActionListeners = () => {
        document.querySelectorAll('.edit-convocation-issued-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const code = btn.getAttribute('data-code');
                const name = btn.getAttribute('data-name');
                openModal(id, code, name);
            });
        });

        document.querySelectorAll('.delete-convocation-issued-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this item?')) {
                    try {
                        await api.deleteConvocationIssued(id);
                        loadConvocationIssuedItems();
                        loadMasterData(); // Refresh dropdown
                    } catch (err) {
                        alert(err.message);
                    }
                }
            });
        });
    };

    // 4. Modal Logic
    const modal = document.getElementById('convocationIssuedModal');
    const form = document.getElementById('convocationIssuedForm');
    const modalTitle = document.getElementById('convocationIssuedModalTitle');
    const itemIdInput = document.getElementById('convocationIssuedId');
    const itemCodeInput = document.getElementById('convocationIssuedCode');
    const itemNameInput = document.getElementById('convocationIssuedName');

    const openModal = (id = '', code = '', name = '') => {
        itemIdInput.value = id;
        itemCodeInput.value = code;
        itemNameInput.value = name;
        modalTitle.textContent = id ? 'Edit Item' : 'Add Item';
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        form.reset();
    };

    document.getElementById('addConvocationIssuedBtn').addEventListener('click', () => openModal());
    document.getElementById('closeConvocationIssuedModalBtn').addEventListener('click', closeModal);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = itemIdInput.value;
        const data = {
            issued_code: itemCodeInput.value,
            issued_name: itemNameInput.value
        };

        try {
            if (id) {
                await api.updateConvocationIssued(id, data);
            } else {
                await api.addConvocationIssued(data);
            }
            closeModal();
            loadConvocationIssuedItems();
            loadMasterData();
        } catch (err) {
            alert(err.message);
        }
    });

    // Initial Load when view is shown
    manageLink.addEventListener('click', loadConvocationIssuedItems);
};

const setupPaymentModeManagement = () => {
    // 1. Role Check
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const manageLink = document.getElementById('managePaymentModesLink');
    if (!manageLink) return;

    if (user.role === 'admin') {
        manageLink.classList.remove('hidden');
    } else {
        return; // Stop if not admin
    }

    // 2. Load Data Function
    const loadPaymentModes = async () => {
        try {
            let modes = await api.getPaymentModes();
            if (!Array.isArray(modes) && modes.data) {
                modes = modes.data;
            }

            const tbody = document.getElementById('paymentModesTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                if (Array.isArray(modes)) {
                    modes.forEach(mode => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${mode.id}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${mode.mode_code}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${mode.mode_name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button class="text-indigo-600 hover:text-indigo-900 edit-payment-mode-btn" data-id="${mode.id}" data-code="${mode.mode_code}" data-name="${mode.mode_name}">Edit</button>
                                <button class="text-red-600 hover:text-red-900 ml-4 delete-payment-mode-btn" data-id="${mode.id}">Delete</button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                    attachActionListeners();
                }
            }
        } catch (err) {
            console.error('Error loading payment modes:', err);
        }
    };

    // 3. Attach Listeners (Edit/Delete)
    const attachActionListeners = () => {
        document.querySelectorAll('.edit-payment-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const code = btn.getAttribute('data-code');
                const name = btn.getAttribute('data-name');
                openModal(id, code, name);
            });
        });

        document.querySelectorAll('.delete-payment-mode-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this payment mode?')) {
                    try {
                        await api.deletePaymentMode(id);
                        loadPaymentModes();
                        loadMasterData(); // Refresh dropdown
                    } catch (err) {
                        alert(err.message);
                    }
                }
            });
        });
    };

    // 4. Modal Logic
    const modal = document.getElementById('paymentModeModal');
    const form = document.getElementById('paymentModeForm');
    const modalTitle = document.getElementById('paymentModeModalTitle');
    const modeIdInput = document.getElementById('paymentModeId');
    const modeCodeInput = document.getElementById('paymentModeCode');
    const modeNameInput = document.getElementById('paymentModeName');

    const openModal = (id = '', code = '', name = '') => {
        modeIdInput.value = id;
        modeCodeInput.value = code;
        modeNameInput.value = name;
        modalTitle.textContent = id ? 'Edit Payment Mode' : 'Add Payment Mode';
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        form.reset();
    };

    document.getElementById('addPaymentModeBtn').addEventListener('click', () => openModal());
    document.getElementById('closePaymentModeModalBtn').addEventListener('click', closeModal);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = modeIdInput.value;
        const data = {
            mode_code: modeCodeInput.value,
            mode_name: modeNameInput.value
        };

        try {
            if (id) {
                await api.updatePaymentMode(id, data);
            } else {
                await api.addPaymentMode(data);
            }
            closeModal();
            loadPaymentModes();
            loadMasterData();
        } catch (err) {
            alert(err.message);
        }
    });

    // Initial Load when view is shown
    manageLink.addEventListener('click', loadPaymentModes);
};

const setupPaymentCategoryManagement = () => {
    // 1. Role Check
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const manageLink = document.getElementById('managePaymentCategoriesLink');
    if (!manageLink) return;

    if (user.role === 'admin') {
        manageLink.classList.remove('hidden');
    } else {
        return; // Stop if not admin
    }

    // 2. Load Data Function
    const loadPaymentCategories = async () => {
        try {
            let categories = await api.getPaymentCategories();
            if (!Array.isArray(categories) && categories.data) {
                categories = categories.data;
            }

            const tbody = document.getElementById('paymentCategoriesTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                if (Array.isArray(categories)) {
                    categories.forEach(cat => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cat.id}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cat.category_code}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${cat.category_name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button class="text-indigo-600 hover:text-indigo-900 edit-payment-category-btn" data-id="${cat.id}" data-code="${cat.category_code}" data-name="${cat.category_name}">Edit</button>
                                <button class="text-red-600 hover:text-red-900 ml-4 delete-payment-category-btn" data-id="${cat.id}">Delete</button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                    attachActionListeners();
                }
            }
        } catch (err) {
            console.error('Error loading payment categories:', err);
        }
    };

    // 3. Attach Listeners (Edit/Delete)
    const attachActionListeners = () => {
        document.querySelectorAll('.edit-payment-category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const code = btn.getAttribute('data-code');
                const name = btn.getAttribute('data-name');
                openModal(id, code, name);
            });
        });

        document.querySelectorAll('.delete-payment-category-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this payment category?')) {
                    try {
                        await api.deletePaymentCategory(id);
                        loadPaymentCategories();
                        loadMasterData(); // Refresh dropdown
                    } catch (err) {
                        alert(err.message);
                    }
                }
            });
        });
    };

    // 4. Modal Logic
    const modal = document.getElementById('paymentCategoryModal');
    const form = document.getElementById('paymentCategoryForm');
    const modalTitle = document.getElementById('paymentCategoryModalTitle');
    const catIdInput = document.getElementById('paymentCategoryId');
    const catCodeInput = document.getElementById('paymentCategoryCode');
    const catNameInput = document.getElementById('paymentCategoryName');

    const openModal = (id = '', code = '', name = '') => {
        catIdInput.value = id;
        catCodeInput.value = code;
        catNameInput.value = name;
        modalTitle.textContent = id ? 'Edit Payment Category' : 'Add Payment Category';
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        form.reset();
    };

    document.getElementById('addPaymentCategoryBtn').addEventListener('click', () => openModal());
    document.getElementById('closePaymentCategoryModalBtn').addEventListener('click', closeModal);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = catIdInput.value;
        const data = {
            category_code: catCodeInput.value,
            category_name: catNameInput.value
        };

        try {
            if (id) {
                await api.updatePaymentCategory(id, data);
            } else {
                await api.addPaymentCategory(data);
            }
            closeModal();
            loadPaymentCategories();
            loadMasterData();
        } catch (err) {
            alert(err.message);
        }
    });

    // Initial Load when view is shown
    manageLink.addEventListener('click', loadPaymentCategories);
};

const setupMediumManagement = () => {
    // 1. Role Check
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const manageLink = document.getElementById('manageMediumsLink');
    if (!manageLink) return;

    if (user.role === 'admin') {
        manageLink.classList.remove('hidden');
    } else {
        return; // Stop if not admin
    }

    // 2. Load Data Function
    const loadMediums = async () => {
        try {
            let mediums = await api.getMediums();
            if (!Array.isArray(mediums) && mediums.data) {
                mediums = mediums.data;
            }

            const tbody = document.getElementById('mediumsTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                if (Array.isArray(mediums)) {
                    mediums.forEach(med => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${med.id}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${med.medium_code}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${med.medium_name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button class="text-indigo-600 hover:text-indigo-900 edit-medium-btn" data-id="${med.id}" data-code="${med.medium_code}" data-name="${med.medium_name}">Edit</button>
                                <button class="text-red-600 hover:text-red-900 ml-4 delete-medium-btn" data-id="${med.id}">Delete</button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                    attachActionListeners();
                }
            }
        } catch (err) {
            console.error('Error loading mediums:', err);
        }
    };

    // 3. Attach Listeners (Edit/Delete)
    const attachActionListeners = () => {
        document.querySelectorAll('.edit-medium-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const code = btn.getAttribute('data-code');
                const name = btn.getAttribute('data-name');
                openModal(id, code, name);
            });
        });

        document.querySelectorAll('.delete-medium-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this medium?')) {
                    try {
                        await api.deleteMedium(id);
                        loadMediums();
                        loadMasterData(); // Refresh dropdown
                    } catch (err) {
                        alert(err.message);
                    }
                }
            });
        });
    };

    // 4. Modal Logic
    const modal = document.getElementById('mediumModal');
    const form = document.getElementById('mediumForm');
    const modalTitle = document.getElementById('mediumModalTitle');
    const medIdInput = document.getElementById('mediumId');
    const medCodeInput = document.getElementById('mediumCode');
    const medNameInput = document.getElementById('mediumName');

    const openModal = (id = '', code = '', name = '') => {
        medIdInput.value = id;
        medCodeInput.value = code;
        medNameInput.value = name;
        modalTitle.textContent = id ? 'Edit Medium' : 'Add Medium';
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        form.reset();
    };

    document.getElementById('addMediumBtn').addEventListener('click', () => openModal());
    document.getElementById('closeMediumModalBtn').addEventListener('click', closeModal);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = medIdInput.value;
        const data = {
            medium_code: medCodeInput.value,
            medium_name: medNameInput.value
        };

        try {
            if (id) {
                await api.updateMedium(id, data);
            } else {
                await api.addMedium(data);
            }
            closeModal();
            loadMediums();
            loadMasterData();
        } catch (err) {
            alert(err.message);
        }
    });

    // Initial Load when view is shown
    manageLink.addEventListener('click', loadMediums);
};

const setupSpecializationManagement = () => {
    // 1. Role Check
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const manageLink = document.getElementById('manageSpecializationsLink');
    if (!manageLink) return;

    if (user.role === 'admin') {
        manageLink.classList.remove('hidden');
    } else {
        return; // Stop if not admin
    }

    // 2. Load Data Function
    const loadSpecializations = async () => {
        try {
            let specializations = await api.getSpecializations();
            if (!Array.isArray(specializations) && specializations.data) {
                specializations = specializations.data;
            }

            const tbody = document.getElementById('specializationsTableBody');
            if (tbody) {
                tbody.innerHTML = '';
                if (Array.isArray(specializations)) {
                    specializations.forEach(spec => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${spec.id}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${spec.specialization_code}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${spec.specialization_name}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button class="text-indigo-600 hover:text-indigo-900 edit-specialization-btn" data-id="${spec.id}" data-code="${spec.specialization_code}" data-name="${spec.specialization_name}">Edit</button>
                                <button class="text-red-600 hover:text-red-900 ml-4 delete-specialization-btn" data-id="${spec.id}">Delete</button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                    attachActionListeners();
                }
            }
        } catch (err) {
            console.error('Error loading specializations:', err);
        }
    };

    // 3. Attach Listeners (Edit/Delete)
    const attachActionListeners = () => {
        document.querySelectorAll('.edit-specialization-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const code = btn.getAttribute('data-code');
                const name = btn.getAttribute('data-name');
                openModal(id, code, name);
            });
        });

        document.querySelectorAll('.delete-specialization-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this specialization?')) {
                    try {
                        await api.deleteSpecialization(id);
                        loadSpecializations();
                        loadMasterData(); // Refresh dropdown
                    } catch (err) {
                        alert(err.message);
                    }
                }
            });
        });
    };

    // 4. Modal Logic
    const modal = document.getElementById('specializationModal');
    const form = document.getElementById('specializationForm');
    const modalTitle = document.getElementById('specializationModalTitle');
    const specIdInput = document.getElementById('specializationId');
    const specCodeInput = document.getElementById('specializationCode');
    const specNameInput = document.getElementById('specializationName');

    const openModal = (id = '', code = '', name = '') => {
        specIdInput.value = id;
        specCodeInput.value = code;
        specNameInput.value = name;
        modalTitle.textContent = id ? 'Edit Specialization' : 'Add Specialization';
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        form.reset();
    };

    document.getElementById('addSpecializationBtn').addEventListener('click', () => openModal());
    document.getElementById('closeSpecializationModalBtn').addEventListener('click', closeModal);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = specIdInput.value;
        const data = {
            specialization_code: specCodeInput.value,
            specialization_name: specNameInput.value
        };

        try {
            if (id) {
                await api.updateSpecialization(id, data);
            } else {
                await api.addSpecialization(data);
            }
            closeModal();
            loadSpecializations();
            loadMasterData();
        } catch (err) {
            alert(err.message);
        }
    });

    // Initial Load when view is shown
    manageLink.addEventListener('click', loadSpecializations);
};

const setupReportGeneration = () => {
    const reportForm = document.getElementById('generateReportForm');
    const degreeSelect = document.getElementById('reportDegreeSelect');
    const facultySelect = document.getElementById('reportFacultySelect');
    const htnoInput = document.getElementById('reportHTNO');
    const generateBtn = document.getElementById('generateReportBtn');

    if (!reportForm) return;

    // Load Options
    const loadOptions = async () => {
        try {
            // Degrees
            let degrees = await api.getDegrees();
            if (!Array.isArray(degrees) && degrees.data) degrees = degrees.data;
            if (degreeSelect && Array.isArray(degrees)) {
                degreeSelect.innerHTML = '<option value="">Select Degree</option>';
                degrees.forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = d.degree_name;
                    opt.textContent = d.degree_name;
                    degreeSelect.appendChild(opt);
                });
            }

            // Faculties
            let faculties = await api.getFaculties();
            if (!Array.isArray(faculties) && faculties.data) faculties = faculties.data;
            if (facultySelect && Array.isArray(faculties)) {
                facultySelect.innerHTML = '<option value="">Select Faculty</option>';
                faculties.forEach(f => {
                    const opt = document.createElement('option');
                    opt.value = f.faculty_name;
                    opt.textContent = f.faculty_name;
                    facultySelect.appendChild(opt);
                });
            }
        } catch (e) {
            console.error('Failed to load report options', e);
        }
    };

    // Initialize
    loadOptions();

    // Validation Logic
    const validate = () => {
        const isValid = degreeSelect.value && facultySelect.value && htnoInput.value.trim();
        generateBtn.disabled = !isValid;
    };

    degreeSelect.addEventListener('change', validate);
    facultySelect.addEventListener('change', validate);
    htnoInput.addEventListener('input', validate);

    // Submission
    reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const originalText = generateBtn.textContent;
        generateBtn.textContent = 'Generating PDF...';
        generateBtn.disabled = true;

        try {
            await api.generateReport({
                degree: degreeSelect.value,
                faculty: facultySelect.value,
                hall_ticket_no: htnoInput.value.trim()
            });
        } catch (err) {
            alert(err.message);
        } finally {
            generateBtn.textContent = originalText;
            validate(); // Check validity again (should be valid but recalcs disabled state)
        }
    });
};

let dashboardCharts = {};

const loadDashboardStats = async () => {
    console.log('Fetching Enhanced Dashboard Stats...');
    try {
        const stats = await api.getDashboardStats();
        console.log('Stats received:', stats);

        // 1. Update Total Count
        const countEl = document.getElementById('totalApplicationsCount');
        if (countEl) countEl.textContent = stats.totalApplications || 0;

        // 2. Clear and Populate Tables
        const courseTable = document.getElementById('courseWiseTableBody');
        if (courseTable) {
            if (stats.courseWise && stats.courseWise.length > 0) {
                courseTable.innerHTML = stats.courseWise.map(item => `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.course_group || 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.count}</td>
                    </tr>
                `).join('');
            } else {
                courseTable.innerHTML = '<tr><td colspan="2" class="px-6 py-4 text-center text-sm text-gray-500">No data available</td></tr>';
            }
        }

        const modeDegreeTable = document.getElementById('modeDegreeTableBody');
        if (modeDegreeTable) {
            if (stats.modeDegreeWise && stats.modeDegreeWise.length > 0) {
                modeDegreeTable.innerHTML = stats.modeDegreeWise.map(item => `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.mode_of_study || 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.degree || 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.count}</td>
                    </tr>
                `).join('');
            } else {
                modeDegreeTable.innerHTML = '<tr><td colspan="3" class="px-6 py-4 text-center text-sm text-gray-500">No data available</td></tr>';
            }
        }

        // 3. Render Charts
        if (stats && typeof renderCharts === 'function') {
            renderCharts(stats);
        }

    } catch (err) {
        console.error('Failed to load enhanced dashboard stats:', err);
        const countEl = document.getElementById('totalApplicationsCount');
        if (countEl) countEl.textContent = 'Error';

        // Populate tables with error message
        const courseTable = document.getElementById('courseWiseTableBody');
        if (courseTable) courseTable.innerHTML = `<tr><td colspan="2" class="px-6 py-4 text-center text-sm text-red-500">Failed to load data: ${err.message}</td></tr>`;

        const modeDegreeTable = document.getElementById('modeDegreeTableBody');
        if (modeDegreeTable) modeDegreeTable.innerHTML = `<tr><td colspan="3" class="px-6 py-4 text-center text-sm text-red-500">Failed to load data: ${err.message}</td></tr>`;
    }
};

const renderCharts = (stats) => {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded. Skipping chart rendering.');
        return;
    }

    // Destroy previous instances if they exist
    Object.values(dashboardCharts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });

    // Mode of Study Chart (Pie)
    const modeCtx = document.getElementById('modeStudyChart');
    if (modeCtx) {
        dashboardCharts.mode = new Chart(modeCtx, {
            type: 'pie',
            data: {
                labels: stats.modeWise.map(m => m.mode_of_study || 'N/A'),
                datasets: [{
                    data: stats.modeWise.map(m => m.count),
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    // Faculty-wise Chart (Bar)
    const facultyCtx = document.getElementById('facultyWiseChart');
    if (facultyCtx) {
        dashboardCharts.faculty = new Chart(facultyCtx, {
            type: 'bar',
            data: {
                labels: stats.facultyWise.map(f => f.faculty || 'N/A'),
                datasets: [{
                    label: 'Applications',
                    data: stats.facultyWise.map(f => f.count),
                    backgroundColor: '#3B82F6'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('login.html')) {
        // Auth check is already done at top of file but we check user for display
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const nameEl = document.getElementById('userName');
            if (nameEl) nameEl.textContent = user.name;

            // Initial Data Load
            loadMasterData();

            // Setup Management Views
            setupCategoryManagement();
            setupDegreeManagement();
            setupFacultyManagement();
            setupCourseManagement();
            setupSubjectManagement();
            setupSpecializationManagement();
            setupMediumManagement();
            setupPaymentCategoryManagement();
            setupPaymentModeManagement();
            setupPaymentModeManagement();
            setupConvocationIssuedManagement();
            setupReportGeneration();
            loadDashboardStats();
        }

            // Setup Export CSV Action
            const exportCsvBtn = document.getElementById('exportCsvBtn');
            if (exportCsvBtn) {
                exportCsvBtn.addEventListener('click', async () => {
                    const originalText = exportCsvBtn.innerText;
                    exportCsvBtn.innerText = 'Exporting...';
                    try {
                        const token = localStorage.getItem('token');
                        const response = await fetch('http://localhost:5000/api/convocation/export/csv', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (!response.ok) throw new Error('Failed to export CSV');
                        
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'convocation_data_export.csv';
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                    } catch(e) {
                         alert('Error exporting CSV: ' + e.message);
                    } finally {
                         exportCsvBtn.innerText = 'Export CSV Data';
                    }
                });
            }

            setupNavigation();
        setupForms();
    }
});
