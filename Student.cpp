#include "Student.h"
#include <iostream>
#include <iomanip>

// Default Constructor
// Time Complexity: O(1)
Student::Student() : rollNo(0), name(""), department(""), totalClasses(0), attendedClasses(0) {}

// Parameterized Constructor
// Time Complexity: O(1)
Student::Student(int roll, std::string n, std::string dept, int total, int attended)
    : rollNo(roll), name(n), department(dept), totalClasses(total), attendedClasses(attended) {}

// Getters (Time Complexity: O(1))
int Student::getRollNo() const { return rollNo; }
std::string Student::getName() const { return name; }
std::string Student::getDepartment() const { return department; }
int Student::getTotalClasses() const { return totalClasses; }
int Student::getAttendedClasses() const { return attendedClasses; }

// Setters (Time Complexity: O(1))
void Student::setRollNo(int roll) { rollNo = roll; }
void Student::setName(std::string n) { name = n; }
void Student::setDepartment(std::string dept) { department = dept; }
void Student::setTotalClasses(int total) { totalClasses = total; }
void Student::setAttendedClasses(int attended) { attendedClasses = attended; }

// Safely calculate attendance percentage
// Time Complexity: O(1)
double Student::getAttendancePercentage() const {
    if (totalClasses <= 0) {
        return 0.0;
    }
    return (static_cast<double>(attendedClasses) / totalClasses) * 100.0;
}

// Print formatted student report card row
// Time Complexity: O(1)
void Student::printReport() const {
    double pct = getAttendancePercentage();
    std::string status = (pct >= 75.0) ? "Eligible" : "Not Eligible";

    std::cout << std::left << std::setw(10) << rollNo
              << std::setw(20) << name
              << std::setw(15) << department
              << std::setw(15) << totalClasses
              << std::setw(15) << attendedClasses
              << std::fixed << std::setprecision(2) << std::setw(15) << pct
              << std::setw(15) << status << "\n";
}
