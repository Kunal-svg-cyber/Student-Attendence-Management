#ifndef ATTENDANCE_SYSTEM_H
#define ATTENDANCE_SYSTEM_H

#include <vector>
#include <unordered_map>
#include <string>
#include <queue>
#include <stack>
#include <utility>
#include "Student.h"

class AttendanceSystem {
private:
    std::vector<Student> students;
    std::unordered_map<int, int> rollIndex; // rollNo -> index in students vector
    std::stack<std::pair<int, std::string>> undoStack; // records attendance actions for undo (rollNo, "Present"/"Absent")

    // Helper to rebuild rollIndex map after vector modifications
    void rebuildRollIndex();

public:
    AttendanceSystem();

    // Load from and save to disk wrappers
    void loadFromFile();
    void saveToFile() const;

    // Getters for student list
    const std::vector<Student>& getStudents() const;
    std::vector<Student>& getStudentsMutable();

    // Operations
    bool addStudent(const Student& s);
    bool deleteStudent(int rollNo);
    bool updateStudent(int rollNo, const std::string& newName, const std::string& newDept, int newTotal, int newAttended);
    void markAttendanceSession(const std::vector<int>& rollNumbers);
    bool undoLastAttendance();

    // Reports
    void displayAllStudents() const;
    void lowAttendanceReport() const;

    // Helper to find a student's index by roll number
    int findIndexByRollNo(int rollNo) const;
};

#endif // ATTENDANCE_SYSTEM_H
