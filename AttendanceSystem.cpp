#include "AttendanceSystem.h"
#include "FileManager.h"
#include <iostream>
#include <iomanip>
#include <cmath>


// Constructor
AttendanceSystem::AttendanceSystem() {
    loadFromFile();
}

// Rebuild the rollIndex map mapping rollNo -> vector index.
// Time Complexity: O(n) average where n is the number of students, since we iterate over the vector
// and insert each element into the hash map in O(1) average time.
void AttendanceSystem::rebuildRollIndex() {
    rollIndex.clear();
    for (size_t i = 0; i < students.size(); ++i) {
        rollIndex[students[i].getRollNo()] = static_cast<int>(i);
    }
}

// Load students from file and build roll index map
// Time Complexity: O(n) average to read and build the map.
void AttendanceSystem::loadFromFile() {
    FileManager::loadStudents(students);
    rebuildRollIndex();
}

// Save current student data to file
// Time Complexity: O(n) to serialize all elements and write to file.
void AttendanceSystem::saveToFile() const {
    FileManager::saveStudents(students);
}

// Get const reference to students
// Time Complexity: O(1)
const std::vector<Student>& AttendanceSystem::getStudents() const {
    return students;
}

// Get mutable reference to students (useful for sorting)
// Time Complexity: O(1)
std::vector<Student>& AttendanceSystem::getStudentsMutable() {
    return students;
}

// Add a new student
// Time Complexity: 
//   - Checking duplicates: O(1) average / O(n) worst-case map lookup.
//   - Pushing to vector: O(1) amortized.
//   - Inserting into map: O(1) average / O(n) worst-case map insertion.
//   - Saving to file: O(n) file write.
//   - Total Complexity: O(n) due to saving to file. Without file I/O, it is O(1) average.
bool AttendanceSystem::addStudent(const Student& s) {
    if (rollIndex.find(s.getRollNo()) != rollIndex.end()) {
        std::cerr << "[Error] Student with Roll No " << s.getRollNo() << " already exists." << std::endl;
        return false;
    }
    students.push_back(s);
    rollIndex[s.getRollNo()] = static_cast<int>(students.size() - 1);
    saveToFile();
    return true;
}

// Delete a student by roll number
// Time Complexity:
//   - Lookup index in map: O(1) average.
//   - Erasing from vector: O(n) since elements after index must be shifted left.
//   - Rebuilding map index: O(n) average.
//   - Saving to file: O(n) file write.
//   - Total Complexity: O(n) because of shifting, rebuilding, and file writing.
bool AttendanceSystem::deleteStudent(int rollNo) {
    auto it = rollIndex.find(rollNo);
    if (it == rollIndex.end()) {
        std::cerr << "[Error] Student with Roll No " << rollNo << " not found." << std::endl;
        return false;
    }
    int index = it->second;
    students.erase(students.begin() + index);
    rebuildRollIndex();
    saveToFile();
    return true;
}

// Update student details
// Time Complexity:
//   - Lookup index in map: O(1) average.
//   - Updating attributes: O(1).
//   - Saving to file: O(n) file write.
//   - Total Complexity: O(n) because of saving to file. Without file I/O, it is O(1) average.
bool AttendanceSystem::updateStudent(int rollNo, const std::string& newName, const std::string& newDept, int newTotal, int newAttended) {
    auto it = rollIndex.find(rollNo);
    if (it == rollIndex.end()) {
        std::cerr << "[Error] Student with Roll No " << rollNo << " not found." << std::endl;
        return false;
    }
    int index = it->second;
    students[index].setName(newName);
    students[index].setDepartment(newDept);
    students[index].setTotalClasses(newTotal);
    students[index].setAttendedClasses(newAttended);
    saveToFile();
    return true;
}

// Helper: Find index of a student by Roll No
// Time Complexity: O(1) average, O(n) worst-case lookup in unordered_map.
int AttendanceSystem::findIndexByRollNo(int rollNo) const {
    auto it = rollIndex.find(rollNo);
    if (it != rollIndex.end()) {
        return it->second;
    }
    return -1;
}

// Mark attendance session for a batch of roll numbers using a queue (FIFO).
// Time Complexity: O(k + n) where k is the size of the batch, and n is the number of students.
//   We process each roll number in O(1) lookup time using the hash map, and then write to file once at the end in O(n) time.
//   Without the single-write optimization, it would be O(k * n) due to repeated disk writes.
void AttendanceSystem::markAttendanceSession(const std::vector<int>& rollNumbers) {
    std::queue<int> q;
    for (int roll : rollNumbers) {
        q.push(roll);
    }

    bool modified = false;
    while (!q.empty()) {
        int roll = q.front();
        q.pop();

        int index = findIndexByRollNo(roll);
        if (index == -1) {
            std::cout << "[Warning] Student with Roll No " << roll << " not found in system. Skipping." << std::endl;
            continue;
        }

        Student& s = students[index];
        std::cout << "\nMarking attendance for: " << s.getName() << " (Roll No: " << roll << ")" << std::endl;
        char choice;
        while (true) {
            std::cout << "Enter status (P for Present / A for Absent): ";
            std::cin >> choice;
            choice = std::tolower(choice);
            if (choice == 'p' || choice == 'a') {
                break;
            }
            std::cout << "Invalid input. Please enter 'P' or 'A'." << std::endl;
        }

        std::string status = (choice == 'p') ? "Present" : "Absent";
        int newTotal = s.getTotalClasses() + 1;
        int newAttended = s.getAttendedClasses() + (choice == 'p' ? 1 : 0);
        s.setTotalClasses(newTotal);
        s.setAttendedClasses(newAttended);
        
        // Push the action onto the undo stack
        undoStack.push({roll, status});
        modified = true;

        std::cout << "Successfully marked " << status << " for " << s.getName() << "." << std::endl;
    }

    if (modified) {
        saveToFile();
    }
}

// Undo the last marked attendance action.
// Time Complexity:
//   - Checking empty stack: O(1)
//   - Popping action: O(1)
//   - Map lookup to find index: O(1) average
//   - Mutating attendance counters: O(1)
//   - Saving file: O(n) file write.
//   - Total Complexity: O(n) due to saving to file. Without file I/O, it is O(1) average.
bool AttendanceSystem::undoLastAttendance() {
    if (undoStack.empty()) {
        std::cout << "[Info] No attendance records to undo in the current session." << std::endl;
        return false;
    }

    auto lastAction = undoStack.top();
    undoStack.pop();

    int roll = lastAction.first;
    std::string status = lastAction.second;

    int index = findIndexByRollNo(roll);
    if (index == -1) {
        std::cerr << "[Error] Could not undo: Student with Roll No " << roll << " no longer exists." << std::endl;
        return false;
    }

    Student& s = students[index];
    
    // Reverse the attendance marking action
    int currentTotal = s.getTotalClasses();
    int currentAttended = s.getAttendedClasses();

    if (currentTotal > 0) {
        s.setTotalClasses(currentTotal - 1);
    }
    if (status == "Present" && currentAttended > 0) {
        s.setAttendedClasses(currentAttended - 1);
    }

    std::cout << "[Undo Success] Reversed \"" << status << "\" mark for student " 
              << s.getName() << " (Roll No: " << roll << ")." << std::endl;

    saveToFile();
    return true;
}

// Display formatted table of all registered students
// Time Complexity: O(n) where n is the number of students. We iterate and print each student report.
// Space Complexity: O(1) auxiliary.
void AttendanceSystem::displayAllStudents() const {
    if (students.empty()) {
        std::cout << "\n[Info] No students found in the database." << std::endl;
        return;
    }

    std::cout << "\n" << std::string(105, '=') << "\n";
    std::cout << std::left << std::setw(10) << "Roll No"
              << std::setw(20) << "Name"
              << std::setw(15) << "Department"
              << std::setw(15) << "Total Classes"
              << std::setw(15) << "Attended"
              << std::setw(15) << "Attendance %"
              << std::setw(15) << "Eligibility" << "\n";
    std::cout << std::string(105, '-') << "\n";

    for (const auto& student : students) {
        student.printReport();
    }
    std::cout << std::string(105, '=') << "\n";
    std::cout << "Total Students: " << students.size() << "\n\n";
}

// Generate report of students with attendance below 75% cutoff
// Time Complexity: O(n) where n is the number of students.
// Space Complexity: O(1) auxiliary.
void AttendanceSystem::lowAttendanceReport() const {
    if (students.empty()) {
        std::cout << "\n[Info] No students found in the database." << std::endl;
        return;
    }

    bool foundAny = false;
    std::cout << "\n" << std::string(60, '=') << "\n";
    std::cout << "          LOW ATTENDANCE REPORT (< 75% Cutoff)\n";
    std::cout << std::string(60, '-') << "\n";
    std::cout << std::left << std::setw(10) << "Roll No"
              << std::setw(25) << "Name"
              << std::setw(15) << "Attendance %" 
              << std::setw(10) << "Deficit" << "\n";
    std::cout << std::string(60, '-') << "\n";

    for (const auto& student : students) {
        double pct = student.getAttendancePercentage();
        if (pct < 75.0) {
            // Calculate how many more classes they needed to attend to reach 75%
            // 0.75 * total = attended_needed
            // deficit = attended_needed - attended
            double needed = 0.75 * student.getTotalClasses();
            double deficit = needed - student.getAttendedClasses();
            int classDeficit = (deficit > 0) ? static_cast<int>(std::ceil(deficit)) : 0;

            std::cout << std::left << std::setw(10) << student.getRollNo()
                      << std::setw(25) << student.getName()
                      << std::fixed << std::setprecision(2) << std::setw(15) << pct
                      << std::setw(10) << classDeficit << "\n";
            foundAny = true;
        }
    }
    std::cout << std::string(60, '=') << "\n";

    if (!foundAny) {
        std::cout << "All students have satisfactory attendance (>= 75.00%)." << std::endl;
    }
    std::cout << std::endl;
}


