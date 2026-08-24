// admin.js
// Handles UI logic for Marian College Kuttikkanam Admin & Coordinator Portals

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Synchronous early UI routing
    try {
        handleRouting(true); 
    } catch(e) {
        console.warn("Early UI routing failed:", e);
    }

    // 2. Wait for Supabase / Local storage DB ready
    await db.ready;

    // Clear search inputs to prevent browser autofill issues
    const stSearch = document.getElementById('searchStudent');
    const tcSearch = document.getElementById('searchTeacher');
    if (stSearch) stSearch.value = '';
    if (tcSearch) tcSearch.value = '';

    const userRole = sessionStorage.getItem('userRole') || 'admin';
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');

    // Password reset checks for coordinators
    const isTeacherCoord = userRole === 'teacherCoordinator';
    const isStudentCoord = userRole === 'studentCoordinator';
    if ((isTeacherCoord || isStudentCoord) && (currentUser.forcePasswordReset || currentUser.password === 'password')) {
        const modal = document.getElementById('resetPassModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('saveNewPassBtn').onclick = async () => {
                const newPass = document.getElementById('newPass').value;
                const confirmPass = document.getElementById('confirmPass').value;
                if (newPass.length < 6) {
                    alert('Password must be at least 6 characters long.');
                    return;
                }
                if (newPass !== confirmPass) {
                    alert('Passwords do not match.');
                    return;
                }
                const roleType = isTeacherCoord ? 'teacher' : 'student';
                const idVal = isTeacherCoord ? currentUser.phoneNumber : currentUser.registerNumber;
                const result = await db.changePassword(roleType, idVal, newPass);
                if (result.success) {
                    alert('Password updated successfully! Please login again.');
                    logout();
                } else {
                    alert(result.message || 'Error updating password.');
                }
            };
        }
    }

    // Modal transition helpers
    window.openModal = function(modal) {
        if (!modal) return;
        modal.classList.remove('hidden');
    };

    window.closeModal = function(modal) {
        if (!modal) return;
        modal.classList.add('hidden');
    };

    // Header info & Role branding
    const sidebarBrand = document.querySelector('.sidebar-brand');
    const userNameEl = document.querySelector('.user-name');
    const userRoleEl = document.querySelector('.user-role');
    const userAvatarEl = document.querySelector('.user-avatar');

    if (userRole === 'studentCoordinator') {
        if (sidebarBrand) {
            sidebarBrand.textContent = 'Coordinator Portal';
            sidebarBrand.href = 'coordinator.html';
        }
        if (userNameEl) userNameEl.textContent = `Welcome, ${currentUser.name || 'Coordinator'}`;
        if (userRoleEl) userRoleEl.textContent = 'Student Coordinator';
        if (userAvatarEl) userAvatarEl.textContent = (currentUser.name || 'C')[0];

        const userMgmtLink = document.querySelector('[data-tab="userManagement"]');
        if (userMgmtLink && userMgmtLink.parentElement) {
            userMgmtLink.parentElement.style.display = 'none';
        }

        const addPlcBtn = document.getElementById('toggleAddPlacementBtn');
        if (addPlcBtn) addPlcBtn.style.display = 'none';
        const addPhaseBtn = document.getElementById('addPhaseBtn');
        if (addPhaseBtn) addPhaseBtn.style.display = 'none';

        document.querySelectorAll('.admin-only-field').forEach(el => el.style.setProperty('display', 'none', 'important'));
    } else if (userRole === 'teacherCoordinator') {
        if (sidebarBrand) {
            sidebarBrand.textContent = 'Teacher Coordinator';
            sidebarBrand.href = 'admin.html';
        }
        if (userNameEl) userNameEl.textContent = `Welcome, ${currentUser.name || 'Coordinator'}`;
        if (userRoleEl) userRoleEl.textContent = 'Teacher Coordinator';
        if (userAvatarEl) userAvatarEl.textContent = (currentUser.name || 'T')[0];

        const teacherTabBtn = document.querySelector('[data-subtab="teachersSubTab"]');
        if (teacherTabBtn) teacherTabBtn.style.display = 'none';
        const addTeacherBtn = document.getElementById('toggleAddTeacherBtn');
        if (addTeacherBtn) addTeacherBtn.style.display = 'none';

        document.querySelectorAll('.admin-only-field').forEach(el => el.style.setProperty('display', 'none', 'important'));
    } else {
        if (sidebarBrand) {
            sidebarBrand.textContent = 'Admin Portal';
            sidebarBrand.href = 'admin.html';
        }
        if (userNameEl) userNameEl.textContent = 'Welcome, Admin';
        if (userRoleEl) userRoleEl.textContent = 'Administrator';
        if (userAvatarEl) userAvatarEl.textContent = 'A';
    }

    // --- UI Navigation ---
    const tabs = document.querySelectorAll('.tab');
    
    function activateTab(tabId, uiOnly = false) {
        const tab = document.querySelector(`.tab[data-tab="${tabId}"]`);
        const tabContent = document.getElementById(`${tabId}Tab`);
        
        if (!tab || !tabContent) return;

        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        tabContent.classList.add('active');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const breadcrumb = document.querySelector('.breadcrumb');
        const pageTitle = document.querySelector('.page-title');
        
        if (breadcrumb && pageTitle) {
            const tabName = tab.textContent.trim();
            breadcrumb.textContent = `Portal / ${tabName}`;
            pageTitle.textContent = tabName;
        }

        if (uiOnly) return;

        try {
            if(tabId === 'dashboard') {
                renderDashboard();
            }
            if(tabId === 'userManagement') {
                renderStudents();
                renderTeachers();
            }
            if(tabId === 'calendar') {
                initCalendarSelectors();
                renderCalendar();
            }
            if(tabId === 'placement') {
                renderPlacementActivities();
            }
            if(tabId === 'classView') {
                renderClassView();
            }
        } catch (e) {
            console.warn(`Error rendering tab ${tabId}:`, e);
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = tab.dataset.tab;
        });
    });

    window.addEventListener('hashchange', () => handleRouting(false));

    function handleRouting(uiOnly = false) {
        const hash = window.location.hash.substring(1) || 'dashboard';
        const parts = hash.split('/');
        const mainTabId = parts[0] || 'dashboard';
        
        activateTab(mainTabId, uiOnly);

        if (mainTabId === 'placement') {
            if (parts[1] === 'manage' && parts[2]) {
                const subTab = parts[3] || 'funnel';
                openManagePlacementView(parts[2], subTab, false, uiOnly);
            } else {
                if (typeof closeManagePlacementView === 'function' && !uiOnly) {
                    closeManagePlacementView(false);
                }
            }
        }
    }

    // Sub-Tabs
    const subTabs = document.querySelectorAll('.sub-tab');
    const subTabContents = document.querySelectorAll('.sub-tab-content');
    
    subTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.subtab;
            const tabContent = document.getElementById(tabId);
            if (!tabContent) return;

            subTabs.forEach(t => t.classList.remove('active'));
            subTabContents.forEach(c => {
                c.classList.remove('active');
                c.classList.add('hidden');
            });
            
            tab.classList.add('active');
            tabContent.classList.add('active');
            tabContent.classList.remove('hidden');
        });
    });

    // Calendar Selectors
    function initCalendarSelectors() {
        const monthSel = document.getElementById('calMonth');
        const yearSel = document.getElementById('calYear');
        if(!monthSel || !yearSel) return;
        if(!monthSel.innerHTML) {
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            monthSel.innerHTML = months.map((m, i) => `<option value="${i}" ${i === new Date().getMonth() ? 'selected' : ''}>${m}</option>`).join('');
            
            const currentYear = new Date().getFullYear();
            for(let y = currentYear - 2; y <= currentYear + 5; y++) {
                yearSel.innerHTML += `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`;
            }
            
            monthSel.addEventListener('change', renderCalendar);
            yearSel.addEventListener('change', renderCalendar);
        }
    }

    // =========================================================================
    // --- 1. STUDENTS MANAGEMENT ---
    // =========================================================================
    let editingRegNo = null;
    const toggleAddStudentBtn = document.getElementById('toggleAddStudentBtn');
    const cancelAddStudentBtn = document.getElementById('cancelAddStudentBtn');
    const closeStudentModalBtn = document.getElementById('closeStudentModalBtn');
    const studentModal = document.getElementById('studentModal');
    const addStudentForm = document.getElementById('addStudentForm');
    const adminAlert = document.getElementById('adminAlert');
    const studentModalTitle = document.getElementById('studentModalTitle');
    const saveStudentBtn = document.getElementById('saveStudentBtn');

    if (toggleAddStudentBtn) {
        toggleAddStudentBtn.addEventListener('click', () => {
            editingRegNo = null;
            if (addStudentForm) addStudentForm.reset();
            if (studentModalTitle) studentModalTitle.textContent = 'Add New Student';
            if (saveStudentBtn) saveStudentBtn.textContent = 'Save Student Profile';
            openModal(studentModal);
        });
    }

    if (cancelAddStudentBtn) {
        cancelAddStudentBtn.addEventListener('click', () => {
            closeModal(studentModal);
            if (addStudentForm) addStudentForm.reset();
        });
    }

    if (closeStudentModalBtn) {
        closeStudentModalBtn.addEventListener('click', () => {
            closeModal(studentModal);
            if (addStudentForm) addStudentForm.reset();
        });
    }

    if (addStudentForm) {
        addStudentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;
            
            try {
                if (!Permissions.can(userRole, 'edit_people')) {
                    alert("Permission denied.");
                    return;
                }

                const student = {
                    name: document.getElementById('sName').value.trim(),
                    registerNumber: document.getElementById('sRegNo').value.trim(),
                    phoneNumber: document.getElementById('sPhone').value.trim(),
                    mailId: document.getElementById('sMail').value.trim(),
                    course: document.getElementById('sCourse').value.trim(),
                    department: document.getElementById('sDept').value.trim(),
                    class: document.getElementById('sClass') ? document.getElementById('sClass').value.trim() : '',
                    admissionYear: document.getElementById('sAdmnYear') ? document.getElementById('sAdmnYear').value.trim() : '',
                    gender: document.getElementById('sGender').value,
                    password: (document.getElementById('sPass').value || 'password').trim(),
                    isCoordinator: document.getElementById('sIsCoordinator') ? document.getElementById('sIsCoordinator').checked : false
                };

                if (editingRegNo) {
                    let students = db.getStudents();
                    const index = students.findIndex(s => s.registerNumber === editingRegNo);
                    if (index !== -1) {
                        const originalStudent = students[index];
                        if (!Permissions.can(userRole, 'manage_users')) {
                            student.isCoordinator = originalStudent.isCoordinator;
                        }
                        students[index] = { ...originalStudent, ...student };
                        const result = await db.saveStudents(students);
                        if (result.success) {
                            showAdminAlert('Student updated successfully', 'success');
                            addStudentForm.reset();
                            closeModal(studentModal);
                            renderStudents();
                        } else {
                            showAdminAlert(result.message || 'Error updating student', 'danger');
                        }
                    }
                    editingRegNo = null;
                } else {
                    const result = await db.addStudent(student);
                    showAdminAlert(result.message, result.success ? 'success' : 'danger');
                    if (result.success) {
                        addStudentForm.reset();
                        closeModal(studentModal);
                        renderStudents();
                    }
                }
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }

    window.deleteStudent = async (regNo) => {
        if (!Permissions.can(userRole, 'edit_people')) return;
        if (confirm("Are you sure you want to delete this student profile?")) {
            const result = await db.deleteStudent(regNo);
            if (result.success) {
                renderStudents();
            }
        }
    };

    window.editStudent = (regNo) => {
        const student = db.getStudents().find(s => s.registerNumber === regNo);
        if (!student) return;
        editingRegNo = regNo;
        document.getElementById('sName').value = student.name;
        document.getElementById('sRegNo').value = student.registerNumber;
        document.getElementById('sPhone').value = student.phoneNumber;
        document.getElementById('sMail').value = student.mailId;
        document.getElementById('sCourse').value = student.course;
        document.getElementById('sDept').value = student.department;
        if (document.getElementById('sClass')) document.getElementById('sClass').value = student.class || '';
        if (document.getElementById('sAdmnYear')) document.getElementById('sAdmnYear').value = student.admissionYear || '';
        document.getElementById('sGender').value = student.gender || 'Male';
        if (document.getElementById('sIsCoordinator')) document.getElementById('sIsCoordinator').checked = (student.isCoordinator === true || student.isCoordinator === 'true');
        
        if (studentModalTitle) studentModalTitle.textContent = 'Edit Student Profile';
        if (saveStudentBtn) saveStudentBtn.textContent = 'Update Student';
        openModal(studentModal);
    };

    function renderStudents() {
        const students = db.getStudents();
        const tbody = document.querySelector('#studentsTable tbody');
        if (!tbody) return;
        
        populateFilters(students);

        const filterCourse = document.getElementById('filterCourse').value;
        const filterDept = document.getElementById('filterDept').value;
        const filterAdmnYearEl = document.getElementById('filterAdmnYear');
        const filterAdmnYear = filterAdmnYearEl ? filterAdmnYearEl.value : '';

        let filtered = students;
        if (filterCourse) filtered = filtered.filter(s => s.course === filterCourse);
        if (filterDept) filtered = filtered.filter(s => s.department === filterDept);
        if (filterAdmnYear) filtered = filtered.filter(s => s.admissionYear === filterAdmnYear);

        const searchQuery = (document.getElementById('searchStudent').value || '').toLowerCase();
        if (searchQuery) {
            filtered = filtered.filter(s => 
                (s.name || '').toLowerCase().includes(searchQuery) || 
                (s.registerNumber || '').toLowerCase().includes(searchQuery)
            );
        }

        tbody.innerHTML = '';
        
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10">
                <div class="empty-state">
                    <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/></svg>
                    <h5>No Student Records Found</h5>
                    <p style="margin:0;">No records matched your search filter criteria.</p>
                </div>
            </td></tr>`;
            return;
        }
        
        filtered.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 700; color: #0B1F3A;">${s.registerNumber}</td>
                <td><strong>${s.name}</strong> ${s.isCoordinator === true || s.isCoordinator === 'true' ? '<span class="coord-badge">Coord</span>' : ''}</td>
                <td>${s.phoneNumber}</td>
                <td>${s.mailId}</td>
                <td>${s.course}</td>
                <td>${s.department}</td>
                <td>${s.class || '—'}</td>
                <td>${s.admissionYear || '—'}</td>
                <td>${s.gender || '—'}</td>
                <td>
                    <div class="d-flex gap-1">
                        <button class="btn btn-secondary btn-sm" onclick="editStudent('${s.registerNumber}')" title="Edit">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteStudent('${s.registerNumber}')" title="Delete">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function populateFilters(students) {
        const courseSel = document.getElementById('filterCourse');
        const deptSel = document.getElementById('filterDept');
        const yearSel = document.getElementById('filterAdmnYear');
        
        if (courseSel && courseSel.options.length <= 1) {
            const courses = [...new Set(students.map(s => s.course).filter(Boolean))].sort();
            courses.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c;
                opt.textContent = c;
                courseSel.appendChild(opt);
            });
            courseSel.addEventListener('change', renderStudents);
        }

        if (deptSel && deptSel.options.length <= 1) {
            const depts = [...new Set(students.map(s => s.department).filter(Boolean))].sort();
            depts.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d;
                deptSel.appendChild(opt);
            });
            deptSel.addEventListener('change', renderStudents);
        }

        if (yearSel && yearSel.options.length <= 1) {
            const years = [...new Set(students.map(s => s.admissionYear).filter(Boolean))].sort();
            years.forEach(y => {
                const opt = document.createElement('option');
                opt.value = y;
                opt.textContent = y;
                yearSel.appendChild(opt);
            });
            yearSel.addEventListener('change', renderStudents);
        }

        const searchInput = document.getElementById('searchStudent');
        if (searchInput && !searchInput.dataset.bound) {
            searchInput.dataset.bound = 'true';
            searchInput.addEventListener('input', renderStudents);
        }
    }

    // Bulk Upload Excel
    const bulkUploadInput = document.getElementById('bulkUploadInput');
    if (bulkUploadInput) {
        bulkUploadInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = async (evt) => {
                try {
                    const data = new Uint8Array(evt.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const json = XLSX.utils.sheet_to_json(sheet);

                    if (json.length === 0) {
                        alert("The uploaded sheet is empty.");
                        return;
                    }

                    const studentsToUpload = json.map(r => ({
                        name: String(r['Name'] || r['Student Name'] || r['FULL NAME'] || '').trim(),
                        registerNumber: String(r['Register Number'] || r['Reg No'] || r['REGISTER NUMBER'] || '').trim(),
                        phoneNumber: String(r['Phone'] || r['Phone Number'] || r['PHONE NUMBER'] || '').trim(),
                        mailId: String(r['Email'] || r['Email Address'] || r['EMAIL'] || '').trim(),
                        course: String(r['Course'] || r['COURSE'] || '').trim(),
                        department: String(r['Department'] || r['DEPARTMENT'] || '').trim(),
                        class: String(r['Class'] || r['CLASS'] || '').trim(),
                        admissionYear: String(r['Admission Year'] || r['Year'] || '').trim(),
                        gender: String(r['Gender'] || r['GENDER'] || 'Male').trim(),
                        password: 'password'
                    })).filter(s => s.registerNumber && s.name);

                    if (studentsToUpload.length === 0) {
                        alert("No valid student rows found. Required columns: Name, Register Number, Phone, Email, Course, Department.");
                        return;
                    }

                    let existing = db.getStudents();
                    let addedCount = 0;
                    studentsToUpload.forEach(s => {
                        const idx = existing.findIndex(ex => ex.registerNumber === s.registerNumber);
                        if (idx !== -1) {
                            existing[idx] = { ...existing[idx], ...s };
                        } else {
                            existing.push(s);
                            addedCount++;
                        }
                    });

                    await db.saveStudents(existing);
                    alert(`Successfully imported ${studentsToUpload.length} students (${addedCount} new).`);
                    renderStudents();
                } catch (err) {
                    console.error("Bulk upload error:", err);
                    alert("Error parsing file. Ensure it is a valid .xlsx or .csv format.");
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    function showAdminAlert(msg, type) {
        if (!adminAlert) return;
        adminAlert.textContent = msg;
        adminAlert.className = `alert alert-${type} mb-3`;
        adminAlert.classList.remove('hidden');
        setTimeout(() => adminAlert.classList.add('hidden'), 4000);
    }

    // =========================================================================
    // --- 2. FACULTY / TEACHER MANAGEMENT ---
    // =========================================================================
    let editingTeacherPhone = null;
    const toggleAddTeacherBtn = document.getElementById('toggleAddTeacherBtn');
    const cancelAddTeacherBtn = document.getElementById('cancelAddTeacherBtn');
    const closeTeacherModalBtn = document.getElementById('closeTeacherModalBtn');
    const teacherModal = document.getElementById('teacherModal');
    const addTeacherForm = document.getElementById('addTeacherForm');
    const teacherAlert = document.getElementById('teacherAlert');
    const teacherModalTitle = document.getElementById('teacherModalTitle');
    const saveTeacherBtn = document.getElementById('saveTeacherBtn');

    if (toggleAddTeacherBtn) {
        toggleAddTeacherBtn.addEventListener('click', () => {
            editingTeacherPhone = null;
            if (addTeacherForm) addTeacherForm.reset();
            if (teacherModalTitle) teacherModalTitle.textContent = 'Add Faculty Member';
            if (saveTeacherBtn) saveTeacherBtn.textContent = 'Save Faculty Profile';
            openModal(teacherModal);
        });
    }

    if (cancelAddTeacherBtn) cancelAddTeacherBtn.addEventListener('click', () => closeModal(teacherModal));
    if (closeTeacherModalBtn) closeTeacherModalBtn.addEventListener('click', () => closeModal(teacherModal));

    if (addTeacherForm) {
        addTeacherForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const teacher = {
                name: document.getElementById('tName').value.trim(),
                phoneNumber: document.getElementById('tPhone').value.trim(),
                mailId: document.getElementById('tMail').value.trim(),
                department: document.getElementById('tDept').value.trim(),
                password: (document.getElementById('tPass').value || 'password').trim(),
                isCoordinator: document.getElementById('tIsCoordinator') ? document.getElementById('tIsCoordinator').checked : false
            };

            let result;
            if (editingTeacherPhone) {
                let teachers = db.getTeachers();
                const idx = teachers.findIndex(t => t.phoneNumber === editingTeacherPhone);
                if (idx !== -1) {
                    teachers[idx] = { ...teachers[idx], ...teacher };
                    result = await db.saveTeachers(teachers);
                }
                editingTeacherPhone = null;
            } else {
                result = await db.addTeacher(teacher);
            }

            if (result && result.success) {
                closeModal(teacherModal);
                renderTeachers();
            } else {
                alert((result && result.message) || 'Error saving teacher profile.');
            }
        });
    }

    function renderTeachers() {
        const teachers = db.getTeachers();
        const tbody = document.querySelector('#teachersTable tbody');
        if (!tbody) return;

        const searchQuery = (document.getElementById('searchTeacher').value || '').toLowerCase();
        let filtered = teachers;
        if (searchQuery) {
            filtered = filtered.filter(t => 
                (t.name || '').toLowerCase().includes(searchQuery) ||
                (t.phoneNumber || '').toLowerCase().includes(searchQuery) ||
                (t.department || '').toLowerCase().includes(searchQuery)
            );
        }

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No faculty members found.</td></tr>';
            return;
        }

        filtered.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${t.name}</strong></td>
                <td>${t.phoneNumber}</td>
                <td>${t.mailId}</td>
                <td>${t.department}</td>
                <td><span class="badge ${t.isCoordinator ? 'badge-danger' : 'badge-info'}">${t.isCoordinator ? 'Teacher Coordinator' : 'Faculty'}</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editTeacher('${t.phoneNumber}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTeacher('${t.phoneNumber}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.editTeacher = (phone) => {
        const t = db.getTeachers().find(x => x.phoneNumber === phone);
        if (!t) return;
        editingTeacherPhone = phone;
        document.getElementById('tName').value = t.name;
        document.getElementById('tPhone').value = t.phoneNumber;
        document.getElementById('tMail').value = t.mailId;
        document.getElementById('tDept').value = t.department;
        if (document.getElementById('tIsCoordinator')) document.getElementById('tIsCoordinator').checked = !!t.isCoordinator;
        if (teacherModalTitle) teacherModalTitle.textContent = 'Edit Faculty Member';
        if (saveTeacherBtn) saveTeacherBtn.textContent = 'Update Faculty';
        openModal(teacherModal);
    };

    window.deleteTeacher = async (phone) => {
        if (confirm("Are you sure you want to delete this faculty member?")) {
            const res = await db.deleteTeacher(phone);
            if (res.success) renderTeachers();
        }
    };

    const teacherSearchInput = document.getElementById('searchTeacher');
    if (teacherSearchInput) teacherSearchInput.addEventListener('input', renderTeachers);

    // =========================================================================
    // --- 3. PLACEMENT ACTIVITIES ---
    // =========================================================================
    const placementModal = document.getElementById('placementModal');
    const toggleAddPlacementBtn = document.getElementById('toggleAddPlacementBtn');
    const cancelAddPlacementBtn = document.getElementById('cancelAddPlacementBtn');
    const closePlacementModalBtn = document.getElementById('closePlacementModalBtn');
    const addPlacementForm = document.getElementById('addPlacementForm');
    const placementAlert = document.getElementById('placementAlert');

    if (toggleAddPlacementBtn) {
        toggleAddPlacementBtn.addEventListener('click', () => {
            if (addPlacementForm) addPlacementForm.reset();
            populatePlacementAudienceLists();
            openModal(placementModal);
        });
    }

    if (cancelAddPlacementBtn) cancelAddPlacementBtn.addEventListener('click', () => closeModal(placementModal));
    if (closePlacementModalBtn) closePlacementModalBtn.addEventListener('click', () => closeModal(placementModal));

    function populatePlacementAudienceLists() {
        const students = db.getStudents();
        const courses = [...new Set(students.map(s => s.course).filter(Boolean))].sort();
        const depts = [...new Set(students.map(s => s.department).filter(Boolean))].sort();

        const cList = document.getElementById('pCourseList');
        if (cList) {
            cList.innerHTML = courses.map(c => `<label class="d-flex align-items-center gap-2 mb-1" style="font-size: 13px;"><input type="checkbox" name="pTargetCourses" value="${c}"> ${c}</label>`).join('');
        }

        const dList = document.getElementById('pDeptList');
        if (dList) {
            dList.innerHTML = depts.map(d => `<label class="d-flex align-items-center gap-2 mb-1" style="font-size: 13px;"><input type="checkbox" name="pTargetDepts" value="${d}"> ${d}</label>`).join('');
        }

        const sList = document.getElementById('pStudentList');
        if (sList) {
            sList.innerHTML = students.map(s => `<label class="d-flex align-items-center gap-2 mb-1" style="font-size: 12px;"><input type="checkbox" name="pTargetStudents" value="${s.registerNumber}"> ${s.name} (${s.registerNumber})</label>`).join('');
        }
    }

    // Radio toggles for Audience
    document.querySelectorAll('input[name="pTargetType"]').forEach(r => {
        r.addEventListener('change', (e) => {
            const v = e.target.value;
            const cSec = document.getElementById('pCourseListSection');
            const dSec = document.getElementById('pDeptListSection');
            const sSec = document.getElementById('pStudentListSection');
            if (cSec) cSec.classList.toggle('hidden', v !== 'course');
            if (dSec) dSec.classList.toggle('hidden', v !== 'dept');
            if (sSec) sSec.classList.toggle('hidden', v !== 'student');
        });
    });

    if (addPlacementForm) {
        addPlacementForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const targetType = document.querySelector('input[name="pTargetType"]:checked').value;
            const selectedCourses = Array.from(document.querySelectorAll('input[name="pTargetCourses"]:checked')).map(cb => cb.value);
            const selectedDepts = Array.from(document.querySelectorAll('input[name="pTargetDepts"]:checked')).map(cb => cb.value);
            const selectedStudents = Array.from(document.querySelectorAll('input[name="pTargetStudents"]:checked')).map(cb => cb.value);

            const activity = {
                name: document.getElementById('pName').value.trim(),
                venue: document.getElementById('pVenue') ? document.getElementById('pVenue').value.trim() : 'Campus',
                date: document.getElementById('pDate').value,
                description: document.getElementById('pDesc').innerHTML.trim(),
                target: {
                    type: targetType,
                    courses: targetType === 'course' ? selectedCourses : [],
                    depts: targetType === 'dept' ? selectedDepts : [],
                    students: targetType === 'student' ? selectedStudents : []
                },
                phases: [
                    { id: 'p1', name: 'Initial Registration', description: 'Application received and verified', completions: [] }
                ]
            };

            const result = await db.addPlacementActivity(activity);
            if (result.success) {
                closeModal(placementModal);
                addPlacementForm.reset();
                renderPlacementActivities();
            } else {
                alert(result.message || 'Error creating placement drive.');
            }
        });
    }

    function renderPlacementActivities() {
        const activities = db.getPlacementActivities() || [];
        const tbody = document.querySelector('#placementTable tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (activities.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No placement drives found.</td></tr>';
            return;
        }

        activities.forEach(a => {
            const tr = document.createElement('tr');
            const targetDesc = a.target ? (a.target.type === 'all' ? 'All Students' : a.target.type.toUpperCase()) : 'All';
            tr.innerHTML = `
                <td><strong>${a.name}</strong></td>
                <td>${a.venue || 'Campus'}</td>
                <td>${a.date || 'TBD'}</td>
                <td><span class="badge badge-info">${targetDesc}</span></td>
                <td><span class="badge badge-success">${(a.registrations || []).length} Candidates</span></td>
                <td><span class="badge badge-warning">${(a.phases || []).length} Rounds</span></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="openManagePlacementView('${a.id}')">Manage Rounds</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePlacementActivity('${a.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.deletePlacementActivity = async (id) => {
        if (confirm("Are you sure you want to delete this placement drive?")) {
            const res = await db.deletePlacementActivity(id);
            if (res.success) renderPlacementActivities();
        }
    };

    // Sub-view: Manage Placement Drive
    window.openManagePlacementView = function(id, subTab = 'funnel') {
        const activities = db.getPlacementActivities() || [];
        const act = activities.find(a => a.id === id);
        if (!act) return;

        document.getElementById('placementListView').classList.add('hidden');
        document.getElementById('placementManageView').classList.remove('hidden');
        document.getElementById('manageActivityTitle').textContent = `Manage: ${act.name}`;

        // Subtabs
        const mTabs = document.querySelectorAll('.m-sub-tab');
        const mPages = document.querySelectorAll('.manage-sub-page');
        mTabs.forEach(t => {
            t.classList.toggle('active', t.dataset.tab === subTab);
        });
        mPages.forEach(p => {
            p.classList.toggle('hidden', p.id !== `${subTab}Tab`);
        });

        mTabs.forEach(t => {
            t.onclick = () => {
                mTabs.forEach(x => x.classList.remove('active'));
                mPages.forEach(x => x.classList.add('hidden'));
                t.classList.add('active');
                document.getElementById(`${t.dataset.tab}Tab`).classList.remove('hidden');
            };
        });

        // Funnel Overview
        const funnelArea = document.getElementById('funnelOverviewArea');
        if (funnelArea) {
            const phases = act.phases || [];
            let fhtml = `
                <div class="dash-grid-3 mb-4">
                    <div class="stat-card accent-red">
                        <div class="stat-info">
                            <span class="stat-title">Registered Candidates</span>
                            <span class="stat-value">${(act.registrations || []).length}</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-info">
                            <span class="stat-title">Selection Rounds</span>
                            <span class="stat-value">${phases.length}</span>
                        </div>
                    </div>
                </div>
                <h4 style="color: #0B1F3A; margin-bottom: 1rem;">Candidate Funnel Progression</h4>
                <div class="d-flex flex-column gap-2">
            `;

            phases.forEach((p, idx) => {
                const count = (p.completions || []).length;
                fhtml += `
                    <div class="p-3 rounded" style="background: #FFFFFF; border: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #0B1F3A;">Round ${idx + 1}: ${p.name}</strong>
                            <div style="font-size: 0.8rem; color: #64748B;">${p.description || ''}</div>
                        </div>
                        <span class="badge badge-success" style="font-size: 0.85rem;">${count} Cleared</span>
                    </div>
                `;
            });
            fhtml += '</div>';
            funnelArea.innerHTML = fhtml;
        }

        // Phases List
        const phasesArea = document.getElementById('phasesListArea');
        if (phasesArea) {
            const phases = act.phases || [];
            phasesArea.innerHTML = phases.map((p, idx) => `
                <div class="p-3 rounded mb-2" style="background: #FFFFFF; border: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>Round ${idx + 1}: ${p.name}</strong>
                        <div style="font-size: 0.8rem; color: #64748B;">${p.description || 'No description'}</div>
                    </div>
                    <span class="badge badge-info">${(p.completions || []).length} Completed</span>
                </div>
            `).join('') || '<p class="text-muted">No rounds configured yet.</p>';
        }

        // Candidate List Table
        const mTableBody = document.querySelector('#manageStudentsTable tbody');
        if (mTableBody) {
            const students = db.getStudents();
            const regStudents = students.filter(s => (act.registrations || []).includes(s.registerNumber));
            mTableBody.innerHTML = regStudents.map(s => `
                <tr>
                    <td><strong>${s.registerNumber}</strong></td>
                    <td>${s.name}</td>
                    <td>${s.course}</td>
                    <td><span class="badge badge-info">Active</span></td>
                    <td><span class="badge badge-success">Registered</span></td>
                </tr>
            `).join('') || '<tr><td colspan="5" class="text-center text-muted">No candidates registered for this drive yet.</td></tr>';
        }
    };

    window.closeManagePlacementView = function() {
        document.getElementById('placementManageView').classList.add('hidden');
        document.getElementById('placementListView').classList.remove('hidden');
    };

    // =========================================================================
    // --- 4. CLASSES VIEW ---
    // =========================================================================
    function renderClassView() {
        const students = db.getStudents();
        const classContainer = document.getElementById('classCards');
        if (!classContainer) return;

        const classMap = {};
        students.forEach(s => {
            const cName = s.class || s.course || 'Unassigned';
            if (!classMap[cName]) classMap[cName] = [];
            classMap[cName].push(s);
        });

        classContainer.innerHTML = Object.keys(classMap).sort().map(cName => `
            <div class="glass-card" style="border-top: 4px solid var(--secondary-color);">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4 style="margin: 0; color: #0B1F3A;">${cName}</h4>
                    <span class="badge badge-info">${classMap[cName].length} Students</span>
                </div>
                <p class="text-muted mb-3" style="font-size: 0.8rem;">Academic Class Group</p>
                <button class="btn btn-outline btn-sm w-100" onclick="viewClassStudents('${cName}')">View Student List</button>
            </div>
        `).join('') || '<p class="text-muted">No classes available.</p>';
    }

    window.viewClassStudents = function(className) {
        const students = db.getStudents().filter(s => (s.class || s.course) === className);
        const modal = document.getElementById('classModal');
        const modalBody = document.getElementById('classModalBody');
        const modalTitle = document.getElementById('classModalTitle');
        if (!modal || !modalBody) return;

        modalTitle.textContent = `Class: ${className} (${students.length} Students)`;
        modalBody.innerHTML = `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Reg No</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => `
                            <tr>
                                <td><strong>${s.registerNumber}</strong></td>
                                <td>${s.name}</td>
                                <td>${s.mailId}</td>
                                <td>${s.phoneNumber}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        openModal(modal);
    };

    // =========================================================================
    // --- 5. PROGRAM CALENDAR ---
    // =========================================================================
    function renderCalendar() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;

        const activities = db.getPlacementActivities() || [];
        const monthSel = document.getElementById('calMonth');
        const yearSel = document.getElementById('calYear');
        
        const currentMonth = monthSel && monthSel.value ? parseInt(monthSel.value) : new Date().getMonth();
        const currentYear = yearSel && yearSel.value ? parseInt(yearSel.value) : new Date().getFullYear();

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        let html = `
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: #E2E8F0; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
                ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div style="background: #F8FAFC; padding: 10px; text-align: center; font-weight: 700; font-size: 0.75rem; color: #0B1F3A;">${d}</div>`).join('')}
        `;

        for (let i = 0; i < firstDay; i++) {
            html += `<div style="background: #FFFFFF; min-height: 90px;"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = activities.filter(a => a.date === dateStr);

            html += `
                <div style="background: #FFFFFF; min-height: 90px; padding: 8px; border: 0.5px solid #F1F5F9; cursor: pointer; transition: background 0.15s;" onclick="viewDateEvents('${dateStr}')" onmouseover="this.style.background='#F8FAFC'" onmouseout="this.style.background='#FFFFFF'">
                    <div style="font-size: 0.75rem; font-weight: 700; color: #64748B; margin-bottom: 6px;">${day}</div>
                    <div class="d-flex flex-column gap-1">
                        ${dayEvents.map(e => `
                            <div style="font-size: 10px; background: #FFF1F2; color: #A00000; padding: 2px 4px; border-radius: 4px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${e.name}">
                                ${e.name}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    window.viewDateEvents = function(dateStr) {
        const header = document.getElementById('calSelectedDateHeader');
        const list = document.getElementById('calSelectedEventsList');
        if (!header || !list) return;

        const dateObj = new Date(dateStr);
        header.textContent = `Drives on ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

        const activities = db.getPlacementActivities() || [];
        const events = activities.filter(a => a.date === dateStr);

        if (events.length === 0) {
            list.innerHTML = `<p class="text-muted" style="font-size: 0.85rem;">No placement drives scheduled on this date.</p>`;
        } else {
            list.innerHTML = events.map(e => `
                <div class="p-3 rounded" style="background: #FFFFFF; border-left: 4px solid var(--primary-color); border: 1px solid #E2E8F0; box-shadow: var(--shadow-sm);">
                    <h5 style="margin: 0 0 0.25rem 0; color: #0B1F3A; font-weight: 700;">${e.name}</h5>
                    <div style="font-size: 0.8rem; color: #64748B;">Role/Venue: <strong>${e.venue || 'Campus Recruitment'}</strong></div>
                </div>
            `).join('');
        }
    };

    // =========================================================================
    // --- 6. DASHBOARD CHARTS & ANALYTICS ---
    // =========================================================================
    function renderDashboard() {
        const students = db.getStudents();
        const activities = db.getPlacementActivities() || [];

        const totalStudents = students.length;
        const totalActivities = activities.length;

        // Unique partner companies derived from drives
        const uniqueCompanies = new Set(activities.map(a => (a.name || '').split(' ')[0]).filter(Boolean)).size;

        // Placed candidates
        let placedSet = new Set();
        let inProcessSet = new Set();

        activities.forEach(a => {
            if (a.phases && a.phases.length > 0) {
                const finalPhase = a.phases[a.phases.length - 1];
                (finalPhase.completions || []).forEach(reg => placedSet.add(reg));
            }
            (a.registrations || []).forEach(reg => {
                if (!placedSet.has(reg)) inProcessSet.add(reg);
            });
        });

        const placedCount = placedSet.size;
        const inProcessCount = inProcessSet.size;
        const unplacedCount = Math.max(0, totalStudents - placedCount - inProcessCount);

        // Update Stat Cards
        const totalStudentsEl = document.getElementById('dashTotalStudents');
        if (totalStudentsEl) totalStudentsEl.textContent = totalStudents;

        const totalCompaniesEl = document.getElementById('dashTotalCompanies');
        if (totalCompaniesEl) totalCompaniesEl.textContent = uniqueCompanies || totalActivities;

        const totalActivitiesEl = document.getElementById('dashTotalActivities');
        if (totalActivitiesEl) totalActivitiesEl.textContent = totalActivities;

        const totalPlacedEl = document.getElementById('dashTotalPlaced');
        if (totalPlacedEl) totalPlacedEl.textContent = placedCount;

        const placementTotalEl = document.getElementById('dashPlacementTotalText');
        if (placementTotalEl) placementTotalEl.textContent = `Total: ${totalStudents}`;

        const placementPercent = totalStudents > 0 ? Math.round((placedCount / totalStudents) * 100) : 0;
        const percentEl = document.getElementById('placementPercentText');
        if (percentEl) percentEl.textContent = `${placementPercent}%`;

        // Placement Status Donut Chart with Marian Palette
        const pCtx = document.getElementById('placementStatusChart');
        if (pCtx) {
            if (window.placementChartInst) window.placementChartInst.destroy();
            window.placementChartInst = new Chart(pCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Placed Students', 'In Process', 'Unplaced'],
                    datasets: [{
                        data: [placedCount, inProcessCount, unplacedCount],
                        backgroundColor: ['#A00000', '#0B1F3A', '#94A3B8'],
                        borderWidth: 5,
                        borderColor: '#FFFFFF',
                        cutout: '78%',
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true }
                    }
                }
            });
        }

        // Activity Attendance Chart
        const dashActivitySelect = document.getElementById('dashFilterActivity');
        if (dashActivitySelect) {
            dashActivitySelect.innerHTML = '<option value="">Select Drive...</option>';
            activities.forEach(a => {
                const opt = document.createElement('option');
                opt.value = a.id;
                opt.textContent = a.name;
                dashActivitySelect.appendChild(opt);
            });

            if (activities.length > 0) {
                dashActivitySelect.value = activities[0].id;
            }

            dashActivitySelect.addEventListener('change', renderActivityChart);
        }

        function renderActivityChart() {
            const actId = dashActivitySelect ? dashActivitySelect.value : null;
            const ctx = document.getElementById('activityAttendanceChart');
            if (!ctx || !actId) return;

            const selectedAct = activities.find(a => a.id === actId);
            if (!selectedAct) return;

            const courseCounts = {};
            (selectedAct.registrations || []).forEach(reg => {
                const student = students.find(s => s.registerNumber === reg);
                const course = student && student.course ? student.course : 'General';
                courseCounts[course] = (courseCounts[course] || 0) + 1;
            });

            const labels = Object.keys(courseCounts);
            const data = labels.map(c => courseCounts[c]);

            if (window.adminActivityChartInst) window.adminActivityChartInst.destroy();
            window.adminActivityChartInst = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels.length ? labels : ['No Registrations'],
                    datasets: [{
                        label: 'Candidates Registered',
                        data: data.length ? data : [0],
                        backgroundColor: '#0B1F3A',
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        renderActivityChart();

        // Placed Students Overview Table
        const tableBody = document.querySelector('#dashboardPlacedTable tbody');
        if (tableBody) {
            const placedList = students.filter(s => placedSet.has(s.registerNumber));
            if (placedList.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No students placed yet.</td></tr>';
            } else {
                tableBody.innerHTML = placedList.map(s => `
                    <tr>
                        <td><strong>${s.name}</strong></td>
                        <td>${s.registerNumber}</td>
                        <td>${s.course}</td>
                        <td>Campus Recruitment</td>
                        <td><span class="badge badge-success">Placed</span></td>
                    </tr>
                `).join('');
            }
        }
    }

    try {
        handleRouting(false);
    } catch (err) {
        console.error("Routing error:", err);
    }
});
