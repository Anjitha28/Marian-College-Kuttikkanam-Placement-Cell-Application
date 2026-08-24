// teacher.js
// Handles UI logic for Marian College Teacher Portal

window.openProfile = () => {
    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.remove('hidden');
};

window.closeProfile = () => {
    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.add('hidden');
};

document.addEventListener('DOMContentLoaded', async () => {
    await db.ready;

    checkAuth(['teacher', 'teacherCoordinator', 'admin']);
    const user = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    const userRole = sessionStorage.getItem('userRole');

    if (!user || (userRole !== 'teacher' && userRole !== 'teacherCoordinator' && userRole !== 'admin')) return;

    // Header info
    const teacherNameEl = document.getElementById('teacherName');
    if (teacherNameEl) teacherNameEl.textContent = `Welcome, ${user.name || 'Faculty'}`;
    const userRoleEl = document.querySelector('.user-role');
    if (userRoleEl) userRoleEl.textContent = userRole === 'teacherCoordinator' ? 'Teacher Coordinator' : 'Faculty Member';

    // Fill Profile Modal
    const profDeptEl = document.getElementById('profDept');
    const profPhoneEl = document.getElementById('profPhone');
    const profMailEl = document.getElementById('profMail');
    const profNameEl = document.getElementById('profName');
    
    if (profDeptEl) profDeptEl.textContent = user.department || 'N/A';
    if (profPhoneEl) profPhoneEl.textContent = user.phoneNumber || 'N/A';
    if (profMailEl) profMailEl.textContent = user.mailId || 'N/A';
    if (profNameEl) profNameEl.textContent = user.name || 'N/A';

    // Tab Navigation
    const tabs = document.querySelectorAll('.sidebar-link.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab') + 'Tab';
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.classList.add('active');
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // --- Department Scoped Metrics ---
    const students = db.getStudents().filter(s => !user.department || s.department === user.department);
    const totalStudents = students.length;
    const dashStudentsEl = document.getElementById('dashTotalStudents');
    if (dashStudentsEl) dashStudentsEl.textContent = totalStudents;

    const allActivities = db.getPlacementActivities() || [];
    
    let deptActivities = 0;
    allActivities.forEach(a => {
        const target = a.target || {};
        if (target.type === 'all' || (target.type === 'dept' && target.depts && target.depts.includes(user.department))) {
            deptActivities++;
        }
    });

    const dashActivitiesEl = document.getElementById('dashTotalActivities');
    if (dashActivitiesEl) dashActivitiesEl.textContent = deptActivities;

    // Placed Students Calculation
    let placedSet = new Set();
    let inProcessSet = new Set();

    allActivities.forEach(a => {
        if (a.phases && a.phases.length > 0) {
            const finalPhase = a.phases[a.phases.length - 1];
            (finalPhase.completions || []).forEach(reg => {
                if(students.find(s => s.registerNumber === reg)) {
                    placedSet.add(reg);
                }
            });
        }
        (a.registrations || []).forEach(reg => {
            if(students.find(s => s.registerNumber === reg)) {
                if (!placedSet.has(reg) && !inProcessSet.has(reg)) {
                    inProcessSet.add(reg);
                }
            }
        });
    });

    const placedCount = placedSet.size;
    const inProcessCount = inProcessSet.size;
    const unplacedCount = Math.max(0, totalStudents - placedCount - inProcessCount);

    const dashPlacedEl = document.getElementById('dashTotalPlaced');
    if (dashPlacedEl) dashPlacedEl.textContent = placedCount;

    const placementTotalEl = document.getElementById('dashPlacementTotalText');
    if (placementTotalEl) placementTotalEl.textContent = `Total: ${totalStudents}`;

    const placementPercent = totalStudents > 0 ? Math.round((placedCount / totalStudents) * 100) : 0;
    const percentEl = document.getElementById('placementPercentText');
    if (percentEl) percentEl.textContent = `${placementPercent}%`;

    // Placement Status Donut Chart with Marian Palette
    const pCtx = document.getElementById('placementStatusChart');
    if (pCtx) {
        new Chart(pCtx, {
            type: 'doughnut',
            data: {
                labels: ['Placed Students', 'In Process', 'Unplaced'],
                datasets: [{
                    data: [placedCount, inProcessCount, unplacedCount],
                    backgroundColor: ['#A00000', '#0B1F3A', '#94A3B8'],
                    borderWidth: 4,
                    borderColor: '#FFFFFF',
                    cutout: '78%',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: true } }
            }
        });
    }

    // Drive Activity Course-wise Chart
    const dashActivitySelect = document.getElementById('dashFilterActivity');
    if(dashActivitySelect) {
        dashActivitySelect.innerHTML = '<option value="">Select Drive...</option>';
        allActivities.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.id;
            opt.textContent = a.name;
            dashActivitySelect.appendChild(opt);
        });

        if (allActivities.length > 0) {
            dashActivitySelect.value = allActivities[0].id;
        }

        dashActivitySelect.addEventListener('change', renderActivityChart);
    }

    function renderActivityChart() {
        const actId = dashActivitySelect ? dashActivitySelect.value : null;
        const ctx = document.getElementById('activityAttendanceChart');
        if (!ctx || !actId) return;

        const selectedAct = allActivities.find(a => a.id === actId);
        if (!selectedAct) return;

        const courseCounts = {};
        (selectedAct.registrations || []).forEach(reg => {
            const st = students.find(s => s.registerNumber === reg);
            if (st) {
                const c = st.course || 'General';
                courseCounts[c] = (courseCounts[c] || 0) + 1;
            }
        });

        const labels = Object.keys(courseCounts);
        const data = labels.map(c => courseCounts[c]);

        if (window.teacherActivityChartInst) window.teacherActivityChartInst.destroy();
        window.teacherActivityChartInst = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['No Data'],
                datasets: [{
                    label: 'Registered Students',
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

    // Placed Students Table
    const tableBody = document.querySelector('#dashboardPlacedTable tbody');
    if (tableBody) {
        const placedStudents = students.filter(s => placedSet.has(s.registerNumber));
        if (placedStudents.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No placed students in this department yet.</td></tr>';
        } else {
            tableBody.innerHTML = placedStudents.map(s => `
                <tr>
                    <td><strong>${s.name}</strong></td>
                    <td>${s.course || '—'}</td>
                    <td>1</td>
                    <td><span class="badge badge-success">Placed</span></td>
                </tr>
            `).join('');
        }
    }

    // Calendar
    const calContainer = document.getElementById('calendarContainer');
    if (calContainer) {
        const monthSel = document.getElementById('calMonth');
        const yearSel = document.getElementById('calYear');
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        if (monthSel) {
            monthSel.innerHTML = months.map((m, i) => `<option value="${i}" ${i === new Date().getMonth() ? 'selected' : ''}>${m}</option>`).join('');
        }
        if (yearSel) {
            const currentYear = new Date().getFullYear();
            yearSel.innerHTML = [currentYear - 1, currentYear, currentYear + 1].map(y => `<option value="${y}" ${y === currentYear ? 'selected' : ''}>${y}</option>`).join('');
        }

        function renderTeacherCalendar() {
            const currentMonth = monthSel ? parseInt(monthSel.value) : new Date().getMonth();
            const currentYear = yearSel ? parseInt(yearSel.value) : new Date().getFullYear();
            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

            let html = `
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: #E2E8F0; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
                    ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => `<div style="background: #F8FAFC; padding: 8px; text-align: center; font-weight: 700; font-size: 0.75rem; color: #0B1F3A;">${d}</div>`).join('')}
            `;

            for (let i = 0; i < firstDay; i++) {
                html += `<div style="background: #FFFFFF; min-height: 80px;"></div>`;
            }

            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const events = allActivities.filter(a => a.date === dateStr);

                html += `
                    <div style="background: #FFFFFF; min-height: 80px; padding: 6px; border: 0.5px solid #F1F5F9;">
                        <div style="font-size: 0.75rem; font-weight: 700; color: #64748B; margin-bottom: 4px;">${d}</div>
                        ${events.map(e => `
                            <div style="font-size: 10px; background: #FFF1F2; color: #A00000; padding: 2px 4px; border-radius: 4px; margin-bottom: 2px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${e.name}">
                                ${e.name}
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            html += `</div>`;
            calContainer.innerHTML = html;
        }

        if (monthSel) monthSel.addEventListener('change', renderTeacherCalendar);
        if (yearSel) yearSel.addEventListener('change', renderTeacherCalendar);
        renderTeacherCalendar();
    }
});
