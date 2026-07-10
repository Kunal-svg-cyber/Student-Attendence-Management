// Student Data Store Module (localStorage persistence + O(1) hash indexing)
const StudentStore = (() => {
    const STORAGE_KEY = 'attendance_system_students';
    let studentsCache = [];
    let rollIndex = {}; // rollNo (int) -> index in studentsCache array

    // Rebuild the index map mapping rollNo -> index in studentsCache.
    // Time Complexity: O(n) where n is the number of student records.
    function rebuildRollIndex() {
        rollIndex = {};
        studentsCache.forEach((student, idx) => {
            rollIndex[student.rollNo] = idx;
        });
    }

    // Load students from localStorage
    // Time Complexity: O(n) where n is the length of stored JSON.
    function loadStudents() {
        try {
            const rawData = localStorage.getItem(STORAGE_KEY);
            return rawData ? JSON.parse(rawData) : [];
        } catch (e) {
            console.error("Error loading students from localStorage:", e);
            return [];
        }
    }

    // Save students to localStorage
    // Time Complexity: O(n) serialization time.
    function saveStudents() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(studentsCache));
        } catch (e) {
            console.error("Error saving students to localStorage:", e);
        }
    }

    // Initialize cache and index immediately on script evaluation
    studentsCache = loadStudents();
    if (studentsCache.length === 0) {
        // Pre-populate with random/mock student details as requested
        studentsCache = [
            { rollNo: 101, name: "Alice Smith", department: "CSE", totalClasses: 40, attendedClasses: 35 },
            { rollNo: 102, name: "Bob Jones", department: "ECE", totalClasses: 45, attendedClasses: 30 },
            { rollNo: 103, name: "Charlie Brown", department: "ME", totalClasses: 30, attendedClasses: 29 },
            { rollNo: 104, name: "Diana Prince", department: "CSE", totalClasses: 50, attendedClasses: 32 },
            { rollNo: 105, name: "Ethan Hunt", department: "IT", totalClasses: 35, attendedClasses: 28 }
        ];
        saveStudents();
    }
    rebuildRollIndex();

    return {
        // Retrieve all student records (Time Complexity: O(1) to return reference, O(n) to return copy)
        getAll: () => {
            return studentsCache; // Return reference directly to allow in-place sorting
        },

        // Get a student record by Roll No in O(1) time
        getByRollNo: (rollNo) => {
            const idx = rollIndex[parseInt(rollNo, 10)];
            return idx !== undefined ? studentsCache[idx] : null;
        },

        // Get student index in O(1) time
        getIndexByRollNo: (rollNo) => {
            const idx = rollIndex[parseInt(rollNo, 10)];
            return idx !== undefined ? idx : -1;
        },

        // Add a new student record
        // Time Complexity: O(1) average without I/O. O(n) with serialization.
        addStudent: (student) => {
            const rollNo = parseInt(student.rollNo, 10);
            if (isNaN(rollNo)) {
                throw new Error("Invalid Roll Number");
            }
            if (rollIndex[rollNo] !== undefined) {
                throw new Error(`Student with Roll No ${rollNo} already exists.`);
            }

            const newStudent = {
                rollNo: rollNo,
                name: student.name.trim(),
                department: student.department.trim(),
                totalClasses: parseInt(student.totalClasses, 10) || 0,
                attendedClasses: parseInt(student.attendedClasses, 10) || 0
            };

            studentsCache.push(newStudent);
            rollIndex[rollNo] = studentsCache.length - 1;
            saveStudents();
            return newStudent;
        },

        // Delete student by Roll No
        // Time Complexity: O(n) due to array shifting (splice) + map rebuild + serialization.
        deleteStudent: (rollNo) => {
            const targetRoll = parseInt(rollNo, 10);
            const idx = rollIndex[targetRoll];
            if (idx === undefined) {
                return false;
            }

            studentsCache.splice(idx, 1);
            rebuildRollIndex();
            saveStudents();
            return true;
        },

        // Update student details
        // Time Complexity: O(1) lookup. O(n) file serialization.
        updateStudent: (rollNo, data) => {
            const targetRoll = parseInt(rollNo, 10);
            const idx = rollIndex[targetRoll];
            if (idx === undefined) {
                return false;
            }

            studentsCache[idx] = {
                ...studentsCache[idx],
                name: data.name ? data.name.trim() : studentsCache[idx].name,
                department: data.department ? data.department.trim() : studentsCache[idx].department,
                totalClasses: data.totalClasses !== undefined ? parseInt(data.totalClasses, 10) : studentsCache[idx].totalClasses,
                attendedClasses: data.attendedClasses !== undefined ? parseInt(data.attendedClasses, 10) : studentsCache[idx].attendedClasses
            };

            saveStudents();
            return true;
        },

        // Rebuild index after sorting or mutation shifts
        rebuildIndex: () => {
            rebuildRollIndex();
        }
    };
})();

// Single-Page Application (SPA) Routing & Scaffold Initialization
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    updateDashboardStats();
});

// Navigation / Section Toggle Routing
function initNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');

    // Section Meta Data for Page Header updates
    const sectionMeta = {
        'dashboard': {
            title: 'Dashboard',
            subtitle: 'Welcome to the Attendance Management System dashboard'
        },
        'add-student': {
            title: 'Add / Edit Student',
            subtitle: 'Register a new student record into local memory store'
        },
        'search': {
            title: 'Search Database',
            subtitle: 'Locate student records and benchmark search algorithms'
        },
        'attendance': {
            title: 'Mark Attendance',
            subtitle: 'Batch process roll numbers using queue serialization with undo history'
        },
        'sorting': {
            title: 'Sorting Algorithms',
            subtitle: 'Sort student records using Bubble Sort or Merge Sort with complexity visualization'
        },
        'reports': {
            title: 'Reports & Charts',
            subtitle: 'View class metrics, deficiency lists, and charts'
        },
        'about': {
            title: 'About & DSA Info',
            subtitle: 'Detailed documentation of C++ Engine and Web Portal mapping for evaluators'
        }
    };

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionName = item.getAttribute('data-section');
            const targetSection = document.getElementById(`sec-${sectionName}`);

            if (!targetSection) {
                console.error(`Target section 'sec-${sectionName}' not found.`);
                return;
            }

            // Remove active classes
            menuItems.forEach(btn => btn.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));

            // Add active classes to current item and section
            item.classList.add('active');
            targetSection.classList.add('active');

            // Dynamic header details animation / update
            if (sectionMeta[sectionName]) {
                pageTitle.textContent = sectionMeta[sectionName].title;
                pageSubtitle.textContent = sectionMeta[sectionName].subtitle;
            }

            if (sectionName === 'sorting') {
                renderVisualizerArray();
            }

            if (sectionName === 'reports') {
                updateReportsStats();
                renderReportsTable();
                renderAttendanceChart();
            }

            console.log(`Navigated to section: ${sectionName}`);
        });
    });
}

// Update high-level dashboard summaries from StudentStore
function updateDashboardStats() {
    const students = StudentStore.getAll();
    const totalCount = students.length;
    let avgAttendance = 0.0;
    let lowAttendanceCount = 0;

    if (totalCount > 0) {
        let totalPct = 0;
        students.forEach(s => {
            const pct = s.totalClasses > 0 ? (s.attendedClasses / s.totalClasses) * 100 : 0;
            totalPct += pct;
            if (pct < 75.0) {
                lowAttendanceCount++;
            }
        });
        avgAttendance = totalPct / totalCount;
    }

    document.getElementById('dash-stat-total').textContent = totalCount;
    document.getElementById('dash-stat-avg').textContent = `${avgAttendance.toFixed(1)}%`;
    document.getElementById('dash-stat-low').textContent = lowAttendanceCount;
}

// Global active edit session state
let editStudentRoll = null;

// Render the Directory list table in Add Student Section
function renderDirectory() {
    const tbody = document.getElementById('directory-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const students = StudentStore.getAll();

    if (students.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted); font-style: italic; padding: 2rem;">
                    No students registered in the database.
                </td>
            </tr>
        `;
        return;
    }

    students.forEach(student => {
        const pct = student.totalClasses > 0 ? (student.attendedClasses / student.totalClasses) * 100 : 0;
        const statusClass = pct >= 75.0 ? 'badge-success' : 'badge-danger';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${student.rollNo}</strong></td>
            <td>${student.name}</td>
            <td><span style="background-color: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.8rem;">${student.department}</span></td>
            <td>${student.totalClasses}</td>
            <td>${student.attendedClasses}</td>
            <td><span class="badge ${statusClass}">${pct.toFixed(1)}%</span></td>
            <td class="text-right">
                <div class="btn-action-group">
                    <button class="btn-action btn-edit" title="Edit Student" data-roll="${student.rollNo}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button class="btn-action btn-delete" title="Delete Student" data-roll="${student.rollNo}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                </div>
            </td>
        `;

        // Wire Event listeners to Action Buttons
        tr.querySelector('.btn-edit').addEventListener('click', () => {
            enableEditMode(student.rollNo);
        });

        tr.querySelector('.btn-delete').addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete student: ${student.name} (Roll: ${student.rollNo})?`)) {
                StudentStore.deleteStudent(student.rollNo);
                renderDirectory();
                updateDashboardStats();
                if (editStudentRoll === student.rollNo) {
                    cancelEditMode();
                }
            }
        });

        tbody.appendChild(tr);
    });
}

// Initialize Student Form Actions
function initStudentForm() {
    const form = document.getElementById('form-student');
    const cancelBtn = document.getElementById('btn-cancel-edit');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const rollInput = document.getElementById('student-roll');
        const nameInput = document.getElementById('student-name');
        const deptInput = document.getElementById('student-dept');
        const totalInput = document.getElementById('student-total');
        const attendedInput = document.getElementById('student-attended');

        const errorBanner = document.getElementById('form-error-banner');
        const successBanner = document.getElementById('form-success-banner');

        errorBanner.style.display = 'none';
        successBanner.style.display = 'none';

        const rollVal = parseInt(rollInput.value, 10);
        const nameVal = nameInput.value.trim();
        const deptVal = deptInput.value.trim();
        const totalVal = parseInt(totalInput.value, 10);
        const attendedVal = parseInt(attendedInput.value, 10);

        // Validation constraints
        if (isNaN(rollVal) || rollVal <= 0) {
            showFormAlert(errorBanner, "Roll number must be a positive integer.");
            return;
        }

        if (!nameVal || !deptVal) {
            showFormAlert(errorBanner, "All fields are required. Spaces only are not allowed.");
            return;
        }

        if (isNaN(totalVal) || totalVal < 0 || isNaN(attendedVal) || attendedVal < 0) {
            showFormAlert(errorBanner, "Class held and attended counts must be non-negative integers.");
            return;
        }

        if (attendedVal > totalVal) {
            showFormAlert(errorBanner, "Attended lectures cannot exceed total classes conducted.");
            return;
        }

        try {
            if (editStudentRoll !== null) {
                // Update mode
                StudentStore.updateStudent(editStudentRoll, {
                    name: nameVal,
                    department: deptVal,
                    totalClasses: totalVal,
                    attendedClasses: attendedVal
                });
                showFormAlert(successBanner, "Student details updated successfully!");
                cancelEditMode();
            } else {
                // Add Mode: check duplicates first
                if (StudentStore.getByRollNo(rollVal) !== null) {
                    showFormAlert(errorBanner, `Duplicate Roll: A student with roll #${rollVal} already exists.`);
                    return;
                }

                StudentStore.addStudent({
                    rollNo: rollVal,
                    name: nameVal,
                    department: deptVal,
                    totalClasses: totalVal,
                    attendedClasses: attendedVal
                });
                showFormAlert(successBanner, "Student registered successfully!");
                form.reset();
            }

            renderDirectory();
            updateDashboardStats();

        } catch (error) {
            showFormAlert(errorBanner, error.message);
        }
    });

    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEditMode);
    }
}

// Put Form into Edit Mode
function enableEditMode(rollNo) {
    const student = StudentStore.getByRollNo(rollNo);
    if (!student) return;

    editStudentRoll = rollNo;

    const rollInput = document.getElementById('student-roll');
    rollInput.value = student.rollNo;
    rollInput.disabled = true; // Roll number key cannot be changed during edits

    document.getElementById('student-name').value = student.name;
    document.getElementById('student-dept').value = student.department;
    document.getElementById('student-total').value = student.totalClasses;
    document.getElementById('student-attended').value = student.attendedClasses;

    document.getElementById('form-title').textContent = "Modify Student Details";
    document.getElementById('form-desc').textContent = `Editing student card with Roll No #${student.rollNo}`;
    document.getElementById('btn-submit-student').textContent = "Save Changes";
    document.getElementById('btn-cancel-edit').style.display = 'inline-flex';

    document.querySelector('.card-form').scrollIntoView({ behavior: 'smooth' });
}

// Exit Edit Mode and clear form
function cancelEditMode() {
    editStudentRoll = null;
    const form = document.getElementById('form-student');
    if (form) form.reset();

    const rollInput = document.getElementById('student-roll');
    if (rollInput) rollInput.disabled = false;

    document.getElementById('form-title').textContent = "Register New Student";
    document.getElementById('form-desc').textContent = "Insert details to register a student record into local memory store.";
    document.getElementById('btn-submit-student').textContent = "Add Student";
    document.getElementById('btn-cancel-edit').style.display = 'none';
}

// Display timed banners
function showFormAlert(element, message) {
    element.textContent = message;
    element.style.display = 'block';
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => {
        element.style.display = 'none';
    }, 4000);
}

// Linear Search Implementation (O(N) sequential search)
// Time Complexity: O(n) average/worst case.
// Space Complexity: O(1) auxiliary space.
function linearSearch(students, rollNo) {
    let comparisons = 0;
    for (let i = 0; i < students.length; ++i) {
        comparisons++;
        if (students[i].rollNo === rollNo) {
            return { index: i, comparisons };
        }
    }
    return { index: -1, comparisons };
}

// Binary Search Implementation (O(log N) divide-and-conquer search)
// Time Complexity: O(log n) worst/average case. Assumes sorted dataset.
// Space Complexity: O(1) auxiliary space.
function binarySearch(students, rollNo) {
    let comparisons = 0;
    let low = 0;
    let high = students.length - 1;

    while (low <= high) {
        comparisons++;
        let mid = Math.floor(low + (high - low) / 2);
        let midRoll = students[mid].rollNo;

        if (midRoll === rollNo) {
            return { index: mid, comparisons };
        } else if (midRoll < rollNo) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return { index: -1, comparisons };
}

// Initialize Search Configuration handlers
function initSearchForm() {
    const form = document.getElementById('form-search');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const rollInput = document.getElementById('search-roll-input');
        const rollVal = parseInt(rollInput.value, 10);
        const method = document.querySelector('input[name="search-method"]:checked').value;
        const resultsArea = document.getElementById('search-results-area');

        if (isNaN(rollVal) || rollVal <= 0) {
            resultsArea.innerHTML = `
                <div class="error-banner">Please enter a valid positive roll number to search.</div>
            `;
            return;
        }

        const students = StudentStore.getAll();
        if (students.length === 0) {
            resultsArea.innerHTML = `
                <div class="error-banner">No student records are currently available in the database.</div>
            `;
            return;
        }

        let warningHtml = '';
        let isSorted = true;
        // Verify sorted property
        for (let i = 1; i < students.length; ++i) {
            if (students[i].rollNo < students[i - 1].rollNo) {
                isSorted = false;
                break;
            }
        }

        if (method === 'binary' && !isSorted) {
            // Sort database dynamically using native Array.prototype.sort (Timsort/Merge Sort derivative)
            students.sort((a, b) => a.rollNo - b.rollNo);
            StudentStore.rebuildIndex();
            renderDirectory(); // refresh directory tables to show sorted order
            warningHtml = `
                <div class="search-warning-banner">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <span><strong>Pre-sort Triggered:</strong> Database unsorted. Sorted Roll No ascending before running Binary Search.</span>
                </div>
            `;
        }

        let result;
        if (method === 'linear') {
            result = linearSearch(students, rollVal);
        } else {
            result = binarySearch(students, rollVal);
        }

        renderSearchResults(result, rollVal, method, warningHtml);
    });
}

// Render search details and comparison statistics
function renderSearchResults(result, rollNo, method, warningHtml) {
    const resultsArea = document.getElementById('search-results-area');
    if (!resultsArea) return;

    if (result.index === -1) {
        resultsArea.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                ${warningHtml}
                <div class="error-banner">
                    Student with Roll No #${rollNo} was not found in the database.
                </div>
                <div class="benchmark-board">
                    <div class="benchmark-card metric-highlight">
                        <span class="bench-title">Comparisons Made</span>
                        <span class="bench-value">${result.comparisons}</span>
                        <span class="bench-desc">Attempts to locate Roll No #${rollNo}</span>
                    </div>
                    <div class="benchmark-card">
                        <span class="bench-title">Complexity Class</span>
                        <span class="bench-value">${method === 'linear' ? 'O(N)' : 'O(log N)'}</span>
                        <span class="bench-desc">${method === 'linear' ? 'Full sequential scanning required' : 'Split-half lookup efficiency'}</span>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    const students = StudentStore.getAll();
    const student = students[result.index];
    const pct = student.totalClasses > 0 ? (student.attendedClasses / student.totalClasses) * 100 : 0;
    const statusClass = pct >= 75.0 ? 'badge-success' : 'badge-danger';
    const statusText = pct >= 75.0 ? 'Eligible' : 'Not Eligible';

    resultsArea.innerHTML = `
        <div class="search-result-card">
            ${warningHtml}
            
            <div class="result-main-info">
                <div class="result-meta-name">
                    <h4>${student.name}</h4>
                    <span>Dept: ${student.department} &bull; Roll: #${student.rollNo}</span>
                </div>
                <div class="result-pct-badge">
                    <span class="result-pct-value">${pct.toFixed(1)}%</span>
                    <div style="margin-top: 0.25rem;"><span class="badge ${statusClass}">${statusText}</span></div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div style="background-color: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 10px; padding: 1rem; text-align: center;">
                    <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight:600; display:block; margin-bottom:0.25rem;">Lectures Attended</span>
                    <strong style="font-size: 1.25rem; color: white;">${student.attendedClasses} / ${student.totalClasses}</strong>
                </div>
                <div style="background-color: rgba(255,255,255,0.01); border: 1px solid var(--border-color); border-radius: 10px; padding: 1rem; text-align: center;">
                    <span style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight:600; display:block; margin-bottom:0.25rem;">Vector Position</span>
                    <strong style="font-size: 1.25rem; color: white;">Index ${result.index}</strong>
                </div>
            </div>

            <div class="benchmark-board">
                <div class="benchmark-card metric-highlight">
                    <span class="bench-title">Comparisons Made</span>
                    <span class="bench-value">${result.comparisons}</span>
                    <span class="bench-desc">Checks to find student roll #${student.rollNo}</span>
                </div>
                <div class="benchmark-card">
                    <span class="bench-title">Algorithmic Complexity</span>
                    <span class="bench-value">${method === 'linear' ? 'O(N)' : 'O(log N)'}</span>
                    <span class="bench-desc">${method === 'linear' ? 'Worse scalability' : 'Vastly superior scalability'}</span>
                </div>
            </div>
        </div>
    `;
}

// Get current sorting speed delay (ms)
function getAnimationSpeed() {
    const slider = document.getElementById('sort-speed-range');
    return slider ? parseInt(slider.value, 10) : 400;
}

// Get the criteria value for comparing
function getSortValue(student, criteria) {
    if (criteria === 'rollNo') {
        return student.rollNo;
    } else if (criteria === 'name') {
        return student.name.toLowerCase();
    } else { // attendancePct
        return student.totalClasses > 0 ? (student.attendedClasses / student.totalClasses) * 100 : 0;
    }
}

// Compare two values based on criteria (returns true if val1 > val2 - for ascending)
function compareValues(val1, val2) {
    return val1 > val2;
}

// Render the visualizer state
function renderVisualizerArray(activeIndices = {}) {
    const container = document.getElementById('visualizer-array-wrapper');
    if (!container) return;

    container.innerHTML = '';
    const students = StudentStore.getAll();
    const criteria = document.getElementById('sort-criteria-select').value;

    if (students.length === 0) {
        container.innerHTML = `
            <div class="scaffold-placeholder">
                Register students first to visualize sorting algorithms.
            </div>
        `;
        return;
    }

    // Determine max values to scale bars
    let maxVal = 1;
    if (criteria === 'rollNo') {
        maxVal = Math.max(...students.map(s => s.rollNo), 1);
    } else if (criteria === 'name') {
        maxVal = 26; // Letter map scale A-Z
    } else {
        maxVal = 100; // Percentage scale
    }

    students.forEach((student, idx) => {
        let displayVal = '';
        let barPct = 0;
        
        const criteriaVal = getSortValue(student, criteria);
        if (criteria === 'rollNo') {
            displayVal = `#${student.rollNo}`;
            barPct = (student.rollNo / maxVal) * 100;
        } else if (criteria === 'name') {
            displayVal = student.name;
            const code = student.name.toUpperCase().charCodeAt(0) - 65;
            barPct = Math.max(((code >= 0 && code < 26 ? code : 13) / 25) * 100, 10);
        } else {
            displayVal = `${criteriaVal.toFixed(1)}%`;
            barPct = criteriaVal;
        }

        const activeClass = activeIndices[idx] || '';

        const card = document.createElement('div');
        card.className = `visualizer-element-card ${activeClass}`;
        card.innerHTML = `
            <span class="element-index">Index ${idx}</span>
            <div class="element-meta">
                <strong>${student.name}</strong>
                <span>Roll: #${student.rollNo} &bull; Dept: ${student.department}</span>
            </div>
            <div class="element-bar-container">
                <div class="element-bar" style="width: ${barPct}%;"></div>
            </div>
            <span class="element-value">${displayVal}</span>
        `;
        container.appendChild(card);
    });
}

// Disable/enable controls during sorting
function toggleVisualizerControls(disabled) {
    const buttons = document.querySelectorAll('.btn-sort-trigger');
    const select = document.getElementById('sort-criteria-select');
    const slider = document.getElementById('sort-speed-range');
    const menuButtons = document.querySelectorAll('.menu-item');

    buttons.forEach(btn => btn.disabled = disabled);
    if (select) select.disabled = disabled;
    if (slider) slider.disabled = disabled;
    menuButtons.forEach(btn => {
        if (disabled) btn.style.pointerEvents = 'none';
        else btn.style.pointerEvents = 'auto';
    });
}

// Bubble Sort Visualizer
async function bubbleSortVisual(criteria) {
    const students = StudentStore.getAll();
    const n = students.length;
    const delayVal = () => new Promise(res => setTimeout(res, getAnimationSpeed()));

    const statusBoard = document.getElementById('visualizer-status-board');
    const statusText = document.getElementById('sort-status-text');
    const stepInfo = document.getElementById('sort-step-info');

    statusBoard.style.display = 'block';
    statusText.textContent = "Running Bubble Sort (O(N²))";
    toggleVisualizerControls(true);

    let swaps = 0;
    let comparisons = 0;

    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        stepInfo.innerHTML = `<strong>Pass ${i + 1}:</strong> Scanning index 0 to ${n - i - 2}.`;
        
        for (let j = 0; j < n - i - 1; j++) {
            comparisons++;
            renderVisualizerArray({ [j]: 'comparing', [j + 1]: 'comparing' });
            stepInfo.innerHTML = `Comparing: Index ${j} and Index ${j + 1}.<br>Comparisons: ${comparisons} &bull; Swaps: ${swaps}`;
            await delayVal();

            const val1 = getSortValue(students[j], criteria);
            const val2 = getSortValue(students[j + 1], criteria);

            if (compareValues(val1, val2)) {
                swaps++;
                swapped = true;
                renderVisualizerArray({ [j]: 'swapping', [j + 1]: 'swapping' });
                stepInfo.innerHTML = `Swap triggered: Index ${j} and Index ${j + 1}.<br>Comparisons: ${comparisons} &bull; Swaps: ${swaps}`;
                await delayVal();

                // Swap in memory reference
                const temp = students[j];
                students[j] = students[j + 1];
                students[j + 1] = temp;

                renderVisualizerArray({ [j]: 'swapping', [j + 1]: 'swapping' });
                await delayVal();
            }
        }
        
        if (!swapped) {
            stepInfo.innerHTML = `Early sorting optimization: No elements swapped in Pass ${i+1}. Database is sorted!`;
            break;
        }
    }

    statusText.textContent = "Sorted Successfully!";
    stepInfo.innerHTML = `<strong>Completed:</strong> Bubble Sort completed.<br>Total Comparisons: ${comparisons} &bull; Total Swaps: ${swaps}`;
    
    // Save state, rebuild indexing maps, update UI tables
    StudentStore.rebuildIndex();
    renderDirectory();
    updateDashboardStats();

    // Highlighting
    const allSorted = {};
    for (let i = 0; i < n; i++) allSorted[i] = 'sorted-highlight';
    renderVisualizerArray(allSorted);

    await new Promise(res => setTimeout(res, 1500));
    renderVisualizerArray();
    toggleVisualizerControls(false);
}

// Recursive Merge Sort Visualizer
async function mergeSortVisual(students, left, right, criteria, stats) {
    if (left >= right) return;
    
    const mid = Math.floor(left + (right - left) / 2);
    
    await mergeSortVisual(students, left, mid, criteria, stats);
    await mergeSortVisual(students, mid + 1, right, criteria, stats);
    await mergeVisual(students, left, mid, right, criteria, stats);
}

// Merge Combine Step Animator
async function mergeVisual(students, left, mid, right, criteria, stats) {
    const delayVal = () => new Promise(res => setTimeout(res, getAnimationSpeed()));
    const stepInfo = document.getElementById('sort-step-info');

    let n1 = mid - left + 1;
    let n2 = right - mid;

    let L = [];
    let R = [];

    for (let i = 0; i < n1; i++) L.push(students[left + i]);
    for (let j = 0; j < n2; j++) R.push(students[mid + 1 + j]);

    let i = 0, j = 0, k = left;

    while (i < n1 && j < n2) {
        stats.comparisons++;
        renderVisualizerArray({ [left + i]: 'comparing', [mid + 1 + j]: 'comparing' });
        stepInfo.innerHTML = `Merging subarrays [${left}..${mid}] and [${mid+1}..${right}].<br>Comparing: Index ${left+i} and Index ${mid+1+j}.<br>Comparisons: ${stats.comparisons}`;
        await delayVal();

        const val1 = getSortValue(L[i], criteria);
        const val2 = getSortValue(R[j], criteria);

        // Standard comparison check for sorting stability
        if (val1 <= val2) {
            students[k] = L[i];
            i++;
        } else {
            students[k] = R[j];
            j++;
        }

        renderVisualizerArray({ [k]: 'swapping' });
        await delayVal();
        k++;
    }

    while (i < n1) {
        students[k] = L[i];
        renderVisualizerArray({ [k]: 'swapping' });
        await delayVal();
        i++;
        k++;
    }

    while (j < n2) {
        students[k] = R[j];
        renderVisualizerArray({ [k]: 'swapping' });
        await delayVal();
        j++;
        k++;
    }
}

// Merge Sort Trigger
async function triggerMergeSort(criteria) {
    const students = StudentStore.getAll();
    const n = students.length;
    
    const statusBoard = document.getElementById('visualizer-status-board');
    const statusText = document.getElementById('sort-status-text');
    const stepInfo = document.getElementById('sort-step-info');

    statusBoard.style.display = 'block';
    statusText.textContent = "Running Merge Sort (O(N log N))";
    toggleVisualizerControls(true);

    const stats = { comparisons: 0 };
    
    stepInfo.innerHTML = `Dividing array recursively and merging...`;
    await mergeSortVisual(students, 0, n - 1, criteria, stats);

    statusText.textContent = "Sorted Successfully!";
    stepInfo.innerHTML = `<strong>Completed:</strong> Merge Sort completed.<br>Total Comparisons: ${stats.comparisons}`;
    
    // Save state, rebuild indexing maps, update UI tables
    StudentStore.rebuildIndex();
    renderDirectory();
    updateDashboardStats();

    // Highlighting
    const allSorted = {};
    for (let i = 0; i < n; i++) allSorted[i] = 'sorted-highlight';
    renderVisualizerArray(allSorted);

    await new Promise(res => setTimeout(res, 1500));
    renderVisualizerArray();
    toggleVisualizerControls(false);
}

// Initialize Sorting Visualizer Configuration Bindings
function initSortingSection() {
    const speedSlider = document.getElementById('sort-speed-range');
    const speedLabel = document.getElementById('speed-label');
    const bubbleBtn = document.getElementById('btn-trigger-bubble');
    const mergeBtn = document.getElementById('btn-trigger-merge');
    const select = document.getElementById('sort-criteria-select');

    if (speedSlider) {
        speedSlider.addEventListener('input', () => {
            speedLabel.textContent = `${speedSlider.value}ms delay`;
        });
    }

    if (bubbleBtn) {
        bubbleBtn.addEventListener('click', () => {
            const criteria = select.value;
            bubbleSortVisual(criteria);
        });
    }

    if (mergeBtn) {
        mergeBtn.addEventListener('click', () => {
            const criteria = select.value;
            triggerMergeSort(criteria);
        });
    }

    if (select) {
        select.addEventListener('change', () => {
            renderVisualizerArray();
        });
    }
}

// Attendance Queue & Stack (Undo) State management
let attendanceQueue = [];
let attendanceTotalItems = 0;
let attendanceStack = []; // stores { rollNo, name, status }

// Initialize Attendance Session handlers
function initAttendanceSection() {
    const initForm = document.getElementById('form-attendance-init');
    const rollsInput = document.getElementById('attendance-rolls-input');
    const undoBtn = document.getElementById('btn-undo-attendance');

    if (initForm) {
        initForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const rawInput = rollsInput.value;
            // Parse comma-separated or space-separated tokens
            const rolls = rawInput
                .split(/[\s,]+/)
                .map(r => parseInt(r.trim(), 10))
                .filter(r => !isNaN(r) && r > 0);

            if (rolls.length === 0) {
                alert("Please enter at least one valid positive Roll Number.");
                return;
            }

            // Filter rolls to ensure they exist in our database
            const validRolls = rolls.filter(roll => StudentStore.getByRollNo(roll) !== null);

            if (validRolls.length === 0) {
                alert("None of the entered Roll Numbers correspond to registered students.");
                return;
            }

            if (validRolls.length < rolls.length) {
                alert(`Loaded ${validRolls.length} of ${rolls.length} entered roll numbers. (Unregistered students skipped).`);
            }

            // Initialize FIFO queue
            attendanceQueue = validRolls;
            attendanceTotalItems = validRolls.length;
            attendanceStack = []; // reset stack for new session

            document.getElementById('queue-preview-box').style.display = 'block';
            renderQueuePreview();
            showNextMarkingCard();
            renderUndoStackList();
            
            rollsInput.value = ''; // Clear input area
        });
    }

    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            undoLastMarking();
        });
    }
}

// Render FIFO preview pills
function renderQueuePreview() {
    const previewContainer = document.getElementById('queue-preview-pills');
    if (!previewContainer) return;

    previewContainer.innerHTML = '';
    attendanceQueue.forEach((roll, idx) => {
        const student = StudentStore.getByRollNo(roll);
        const nameShort = student ? student.name.split(' ')[0] : 'Student';
        const isCurrent = idx === 0;

        const pill = document.createElement('div');
        pill.className = `queue-pill ${isCurrent ? 'current' : ''}`;
        pill.innerHTML = `
            <span>#${roll}</span>
            <small style="opacity: 0.8; font-weight: 500;">(${nameShort})</small>
        `;
        previewContainer.appendChild(pill);
    });
}

// Render dynamic current card or empty state
function showNextMarkingCard() {
    const markingArea = document.getElementById('attendance-marking-area');
    if (!markingArea) return;

    if (attendanceQueue.length === 0) {
        markingArea.innerHTML = `
            <div class="empty-attendance-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: var(--text-muted); text-align: center; animation: fadeIn 0.3s ease;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <strong>Marking Session Completed</strong>
                <p style="font-size: 0.85rem; max-width: 320px;">All queue roll numbers have been processed. Dashboard and reports are synchronized.</p>
            </div>
        `;
        document.getElementById('queue-preview-box').style.display = 'none';
        return;
    }

    const currentRoll = attendanceQueue[0];
    const student = StudentStore.getByRollNo(currentRoll);
    if (!student) {
        // Safe check: student was deleted during session
        attendanceQueue.shift();
        showNextMarkingCard();
        return;
    }

    const progressPct = ((attendanceTotalItems - attendanceQueue.length) / attendanceTotalItems) * 100;

    markingArea.innerHTML = `
        <div class="active-marking-card">
            <span style="font-size: 0.8rem; background-color: var(--border-color); padding: 0.25rem 0.6rem; border-radius: 20px; font-weight: 600; color: var(--text-muted);">
                Up Next (${attendanceQueue.length} remaining)
            </span>
            
            <div class="active-student-profile">
                <h4>${student.name}</h4>
                <span>Roll: #${student.rollNo} &bull; Dept: ${student.department}</span>
            </div>

            <div class="marking-actions">
                <button id="btn-mark-absent" class="btn btn-absent">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Absent (A)
                </button>
                <button id="btn-mark-present" class="btn btn-present">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Present (P)
                </button>
            </div>

            <div style="width: 100%;">
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.35rem;">
                    <span>Session Progress</span>
                    <span>${Math.round(progressPct)}%</span>
                </div>
                <div class="queue-progress-bar">
                    <div class="queue-progress-fill" style="width: ${progressPct}%;"></div>
                </div>
            </div>
        </div>
    `;

    // Bind mark actions
    document.getElementById('btn-mark-present').addEventListener('click', () => {
        executeMarking(currentRoll, 'Present');
    });

    document.getElementById('btn-mark-absent').addEventListener('click', () => {
        executeMarking(currentRoll, 'Absent');
    });
}

// Process single roll marking
function executeMarking(rollNo, status) {
    const student = StudentStore.getByRollNo(rollNo);
    if (!student) return;

    // Mutate state in StudentStore
    const newTotal = student.totalClasses + 1;
    const newAttended = student.attendedClasses + (status === 'Present' ? 1 : 0);

    StudentStore.updateStudent(rollNo, {
        totalClasses: newTotal,
        attendedClasses: newAttended
    });

    // Record action onto stack
    attendanceStack.push({
        rollNo: rollNo,
        name: student.name,
        status: status
    });

    // Dequeue (FIFO)
    attendanceQueue.shift();

    // Re-render components
    renderQueuePreview();
    showNextMarkingCard();
    renderUndoStackList();
    
    // Sync other directories
    renderDirectory();
    updateDashboardStats();
}

// Revert last marked action (Stack LIFO)
function undoLastMarking() {
    if (attendanceStack.length === 0) return;

    // Pop off stack (LIFO)
    const lastAction = attendanceStack.pop();
    const student = StudentStore.getByRollNo(lastAction.rollNo);

    if (student) {
        const currentTotal = student.totalClasses;
        const currentAttended = student.attendedClasses;

        // Revert counters (safely boundaries)
        const undoneTotal = currentTotal > 0 ? currentTotal - 1 : 0;
        const undoneAttended = (lastAction.status === 'Present' && currentAttended > 0) ? currentAttended - 1 : currentAttended;

        StudentStore.updateStudent(lastAction.rollNo, {
            totalClasses: undoneTotal,
            attendedClasses: undoneAttended
        });
    }

    // Prepend reverted roll back to front of FIFO queue
    attendanceQueue.unshift(lastAction.rollNo);

    // Sync elements
    renderQueuePreview();
    showNextMarkingCard();
    renderUndoStackList();
    
    // Sync other tabs
    renderDirectory();
    updateDashboardStats();
}

// Render LIFO log entries
function renderUndoStackList() {
    const container = document.getElementById('undo-stack-preview');
    const undoBtn = document.getElementById('btn-undo-attendance');
    if (!container || !undoBtn) return;

    if (attendanceStack.length === 0) {
        container.innerHTML = `
            <div class="empty-stack-state" style="text-align: center; color: var(--text-muted); font-size: 0.85rem; font-style: italic; padding: 2rem 0;">
                Stack is empty. No marks to undo.
            </div>
        `;
        undoBtn.disabled = true;
        return;
    }

    undoBtn.disabled = false;
    container.innerHTML = '';
    
    // Render stack from top to bottom (latest first)
    for (let idx = attendanceStack.length - 1; idx >= 0; idx--) {
        const item = attendanceStack[idx];
        const log = document.createElement('div');
        log.className = `stack-item ${item.status === 'Present' ? 'item-present' : 'item-absent'}`;
        log.innerHTML = `
            <div class="item-meta">
                <strong>#${item.rollNo}</strong> - ${item.name}
            </div>
            <div class="item-action">${item.status}</div>
        `;
        container.appendChild(log);
    }
}

// Reports Tab & Chart.js instances
let activeReportsTab = 'all'; // 'all' or 'deficient'
let attendanceChartInstance = null;

// Initialize Reports Tab listeners
function initReportsSection() {
    const tabAll = document.getElementById('btn-tab-all-records');
    const tabDeficient = document.getElementById('btn-tab-deficient-records');

    if (tabAll && tabDeficient) {
        tabAll.addEventListener('click', () => {
            tabAll.classList.add('active');
            tabDeficient.classList.remove('active');
            activeReportsTab = 'all';
            renderReportsTable();
        });

        tabDeficient.addEventListener('click', () => {
            tabDeficient.classList.add('active');
            tabAll.classList.remove('active');
            activeReportsTab = 'deficient';
            renderReportsTable();
        });
    }
}

// Update stats cards in Reports tab (mirrors dashboard stats)
function updateReportsStats() {
    const students = StudentStore.getAll();
    const totalCount = students.length;
    let avgAttendance = 0.0;
    let lowAttendanceCount = 0;

    if (totalCount > 0) {
        let totalPct = 0;
        students.forEach(s => {
            const pct = s.totalClasses > 0 ? (s.attendedClasses / s.totalClasses) * 100 : 0;
            totalPct += pct;
            if (pct < 75.0) {
                lowAttendanceCount++;
            }
        });
        avgAttendance = totalPct / totalCount;
    }

    document.getElementById('rep-stat-total').textContent = totalCount;
    document.getElementById('rep-stat-avg').textContent = `${avgAttendance.toFixed(1)}%`;
    document.getElementById('rep-stat-low').textContent = lowAttendanceCount;
}

// Render dynamic tables based on tab filters (All vs Deficient)
function renderReportsTable() {
    const headerRow = document.getElementById('table-reports-header');
    const tbody = document.getElementById('reports-tbody');

    if (!headerRow || !tbody) return;

    tbody.innerHTML = '';
    const students = StudentStore.getAll();

    if (students.length === 0) {
        headerRow.innerHTML = '<th>Records</th>';
        tbody.innerHTML = `
            <tr>
                <td style="text-align: center; color: var(--text-muted); font-style: italic; padding: 2rem;">
                    No student records registered in the system.
                </td>
            </tr>
        `;
        return;
    }

    if (activeReportsTab === 'all') {
        // Headers for All Students
        headerRow.innerHTML = `
            <th>Roll No</th>
            <th>Name</th>
            <th>Dept</th>
            <th>Total Classes</th>
            <th>Attended</th>
            <th>% Rate</th>
            <th>Eligibility</th>
        `;

        students.forEach(s => {
            const pct = s.totalClasses > 0 ? (s.attendedClasses / s.totalClasses) * 100 : 0;
            const isDeficient = pct < 75.0;
            
            const tr = document.createElement('tr');
            if (isDeficient) tr.className = 'row-low-attendance';

            tr.innerHTML = `
                <td><strong>#${s.rollNo}</strong></td>
                <td>${s.name}</td>
                <td><span style="background-color: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.8rem;">${s.department}</span></td>
                <td>${s.totalClasses}</td>
                <td>${s.attendedClasses}</td>
                <td><span class="badge ${isDeficient ? 'badge-danger' : 'badge-success'}">${pct.toFixed(1)}%</span></td>
                <td><span style="font-weight: 600; color: ${isDeficient ? 'var(--color-danger)' : 'var(--color-success)'};">${isDeficient ? 'Not Eligible' : 'Eligible'}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        // Headers for Low Attendance Deficit View
        headerRow.innerHTML = `
            <th>Roll No</th>
            <th>Name</th>
            <th>Dept</th>
            <th>Attendance %</th>
            <th>Class Deficit</th>
        `;

        let count = 0;
        students.forEach(s => {
            const pct = s.totalClasses > 0 ? (s.attendedClasses / s.totalClasses) * 100 : 0;
            if (pct < 75.0) {
                count++;
                // Deficit calculation: Math.ceil(0.75 * total - attended)
                const needed = 0.75 * s.totalClasses;
                const deficit = needed - s.attendedClasses;
                const classDeficit = deficit > 0 ? Math.ceil(deficit) : 0;

                const tr = document.createElement('tr');
                tr.className = 'row-low-attendance';
                tr.innerHTML = `
                    <td><strong>#${s.rollNo}</strong></td>
                    <td>${s.name}</td>
                    <td><span style="background-color: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.8rem;">${s.department}</span></td>
                    <td><span class="badge badge-danger">${pct.toFixed(1)}%</span></td>
                    <td><strong style="color: var(--color-danger);">${classDeficit} class${classDeficit > 1 ? 'es' : ''}</strong></td>
                `;
                tbody.appendChild(tr);
            }
        });

        if (count === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--color-success); font-weight: 600; padding: 2rem;">
                        No deficient students. All students satisfy the 75% cutoff threshold!
                    </td>
                </tr>
            `;
        }
    }
}

// Render Chart.js Analytics Bar Chart
function renderAttendanceChart() {
    const ctx = document.getElementById('attendance-bar-chart');
    if (!ctx) return;

    if (attendanceChartInstance) {
        attendanceChartInstance.destroy();
    }

    const students = StudentStore.getAll();
    if (students.length === 0) {
        ctx.style.display = 'none';
        return;
    }
    ctx.style.display = 'block';

    const labels = students.map(s => s.name);
    const data = students.map(s => s.totalClasses > 0 ? parseFloat(((s.attendedClasses / s.totalClasses) * 100).toFixed(1)) : 0);

    // Dynamic coloring based on 75% boundary
    const backgroundColors = data.map(pct => pct < 75.0 ? 'rgba(244, 63, 94, 0.5)' : 'rgba(139, 92, 246, 0.5)');
    const borderColors = data.map(pct => pct < 75.0 ? 'rgba(244, 63, 94, 1)' : 'rgba(139, 92, 246, 1)');

    attendanceChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Attendance Rate (%)',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1.5,
                    borderRadius: 6,
                    barPercentage: 0.6
                },
                {
                    label: '75% Target Threshold',
                    data: Array(students.length).fill(75),
                    type: 'line',
                    borderColor: 'rgba(251, 191, 36, 0.85)', // warning amber
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(255,255,255,0.04)'
                    },
                    ticks: {
                        color: '#9ca3af',
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#9ca3af',
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 10
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#f3f4f6',
                        font: {
                            family: 'Plus Jakarta Sans',
                            weight: '600',
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

// Entry Point Init
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    updateDashboardStats();
    initStudentForm();
    renderDirectory();
    initSearchForm();
    initSortingSection();
    initAttendanceSection();
    initReportsSection();
});
