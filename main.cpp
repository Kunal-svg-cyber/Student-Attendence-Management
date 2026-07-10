#include <iostream>
#include <vector>
#include <string>
#include <limits>
#include <algorithm>
#include <iomanip>
#include "AttendanceSystem.h"
#include "Search.h"
#include "MergeSort.h"

// Helper function to safely read an integer from console input
int readInteger(const std::string& prompt) {
    int value;
    while (true) {
        std::cout << prompt;
        if (std::cin >> value) {
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n'); // clear line buffer
            return value;
        }
        std::cout << "[Error] Invalid input. Please enter a valid integer.\n";
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    }
}

// Helper function to safely read a string from console input (handles single-word input)
std::string readString(const std::string& prompt) {
    std::string value;
    while (true) {
        std::cout << prompt;
        if (std::cin >> value) {
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n'); // clear line buffer
            return value;
        }
        std::cout << "[Error] Invalid input. Please enter a string.\n";
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    }
}

// Display high-level database stats for Option 7
void displayAttendanceStats(const AttendanceSystem& sys) {
    const auto& students = sys.getStudents();
    if (students.empty()) {
        std::cout << "\n[Info] No students registered in the system.\n";
        return;
    }

    double totalPct = 0;
    int eligibleCount = 0;
    int totalSt = static_cast<int>(students.size());

    for (const auto& s : students) {
        double pct = s.getAttendancePercentage();
        totalPct += pct;
        if (pct >= 75.0) {
            eligibleCount++;
        }
    }

    double averagePct = totalPct / totalSt;

    std::cout << "\n" << std::string(50, '=') << "\n";
    std::cout << "           SYSTEM ATTENDANCE STATISTICS\n";
    std::cout << std::string(50, '-') << "\n";
    std::cout << "Total Enrolled Students : " << totalSt << "\n";
    std::cout << "Average Attendance Rate : " << std::fixed << std::setprecision(2) << averagePct << "%\n";
    std::cout << "Eligible Students (>=75%): " << eligibleCount << " (" << (eligibleCount * 100.0 / totalSt) << "%)\n";
    std::cout << "Deficient Students (<75%): " << (totalSt - eligibleCount) << " (" << ((totalSt - eligibleCount) * 100.0 / totalSt) << "%)\n";
    std::cout << std::string(50, '=') << "\n\n";

    // Also display the table
    sys.displayAllStudents();
}

int main() {
    AttendanceSystem sys; // Automatically calls loadFromFile() on startup

    int choice = 0;
    do {
        std::cout << "==================================================\n";
        std::cout << "       STUDENT ATTENDANCE MANAGEMENT SYSTEM       \n";
        std::cout << "==================================================\n";
        std::cout << " 1. Add Student\n";
        std::cout << " 2. Delete Student\n";
        std::cout << " 3. Update Student\n";
        std::cout << " 4. Search Student\n";
        std::cout << " 5. Display Students\n";
        std::cout << " 6. Mark Attendance (Batch Session)\n";
        std::cout << " 7. Attendance Report & Stats\n";
        std::cout << " 8. Low Attendance List (<75%)\n";
        std::cout << " 9. Sort Students by Roll Number\n";
        std::cout << "10. Sort Students by Name\n";
        std::cout << "11. Sort Students by Attendance %\n";
        std::cout << "12. Save Data\n";
        std::cout << "13. Undo Last Attendance Action\n";
        std::cout << "14. Exit (Auto-saves)\n";
        std::cout << "--------------------------------------------------\n";
        
        choice = readInteger("Enter choice (1-14): ");

        switch (choice) {
            case 1: { // Add Student
                std::cout << "\n--- Add New Student ---\n";
                int rollNo = readInteger("Enter Roll No: ");
                std::string name = readString("Enter Name (use underscores for spaces, e.g. John_Doe): ");
                std::string dept = readString("Enter Department (e.g. CSE): ");
                int totalClasses = readInteger("Enter Total Classes Held: ");
                int attendedClasses = readInteger("Enter Classes Attended: ");

                if (rollNo <= 0 || totalClasses < 0 || attendedClasses < 0) {
                    std::cout << "[Error] Input values must be non-negative, and Roll No must be positive.\n\n";
                } else if (attendedClasses > totalClasses) {
                    std::cout << "[Error] Attended classes cannot exceed total classes.\n\n";
                } else {
                    Student newStudent(rollNo, name, dept, totalClasses, attendedClasses);
                    if (sys.addStudent(newStudent)) {
                        std::cout << "[Success] Student added successfully!\n\n";
                    }
                }
                break;
            }
            case 2: { // Delete Student
                std::cout << "\n--- Delete Student ---\n";
                int rollNo = readInteger("Enter Roll No of student to delete: ");
                if (sys.deleteStudent(rollNo)) {
                    std::cout << "[Success] Student removed successfully.\n\n";
                }
                break;
            }
            case 3: { // Update Student
                std::cout << "\n--- Update Student Details ---\n";
                int rollNo = readInteger("Enter Roll No of student to update: ");
                int index = sys.findIndexByRollNo(rollNo);
                if (index == -1) {
                    std::cout << "[Error] Student with Roll No " << rollNo << " not found.\n\n";
                } else {
                    std::string name = readString("Enter New Name (use underscores for spaces): ");
                    std::string dept = readString("Enter New Department: ");
                    int totalClasses = readInteger("Enter New Total Classes Held: ");
                    int attendedClasses = readInteger("Enter New Classes Attended: ");

                    if (totalClasses < 0 || attendedClasses < 0) {
                        std::cout << "[Error] Class counts cannot be negative.\n\n";
                    } else if (attendedClasses > totalClasses) {
                        std::cout << "[Error] Attended classes cannot exceed total classes.\n\n";
                    } else {
                        if (sys.updateStudent(rollNo, name, dept, totalClasses, attendedClasses)) {
                            std::cout << "[Success] Student details updated successfully!\n\n";
                        }
                    }
                }
                break;
            }
            case 4: { // Search Student
                std::cout << "\n--- Search Student ---\n";
                int rollNo = readInteger("Enter Roll No to search: ");
                std::cout << "Choose search algorithm:\n";
                std::cout << "  1. Linear Search (O(n) - Works on unsorted list)\n";
                std::cout << "  2. Binary Search (O(log n) - Assumes list is sorted by Roll No)\n";
                int alg = readInteger("Enter algorithm choice (1-2): ");

                int foundIndex = -1;
                const auto& list = sys.getStudents();
                
                if (alg == 1) {
                    foundIndex = Search::linearSearch(list, rollNo);
                } else if (alg == 2) {
                    // Quick validation to warn user if list is not sorted by roll no
                    bool isSorted = true;
                    for (size_t i = 1; i < list.size(); ++i) {
                        if (list[i].getRollNo() < list[i - 1].getRollNo()) {
                            isSorted = false;
                            break;
                        }
                    }
                    if (!isSorted) {
                        std::cout << "[Warning] Dataset is NOT currently sorted by Roll No. Binary search may fail.\n";
                        std::cout << "Attempting to search anyway...\n";
                    }
                    foundIndex = Search::binarySearch(list, rollNo);
                } else {
                    std::cout << "[Error] Invalid algorithm choice. Cancelling search.\n\n";
                    break;
                }

                if (foundIndex != -1) {
                    std::cout << "\n[Success] Student found at index " << foundIndex << "!\n";
                    std::cout << std::string(105, '-') << "\n";
                    std::cout << std::left << std::setw(10) << "Roll No"
                              << std::setw(20) << "Name"
                              << std::setw(15) << "Department"
                              << std::setw(15) << "Total Classes"
                              << std::setw(15) << "Attended"
                              << std::setw(15) << "Attendance %"
                              << std::setw(15) << "Eligibility" << "\n";
                    std::cout << std::string(105, '-') << "\n";
                    list[foundIndex].printReport();
                    std::cout << std::string(105, '-') << "\n\n";
                } else {
                    std::cout << "[Result] Student with Roll No " << rollNo << " not found.\n\n";
                }
                break;
            }
            case 5: { // Display Students
                std::cout << "\n--- Registered Students ---";
                sys.displayAllStudents();
                break;
            }
            case 6: { // Mark Attendance
                std::cout << "\n--- Mark Attendance Session ---\n";
                int count = readInteger("Enter number of students to mark attendance for: ");
                if (count <= 0) {
                    std::cout << "[Error] Count must be greater than zero.\n\n";
                    break;
                }
                std::vector<int> rolls;
                for (int i = 0; i < count; ++i) {
                    rolls.push_back(readInteger("Enter Roll No for student #" + std::to_string(i + 1) + ": "));
                }
                sys.markAttendanceSession(rolls);
                std::cout << "\n[Session Finished] Attendance batch processed.\n\n";
                break;
            }
            case 7: { // Attendance Report & Stats
                displayAttendanceStats(sys);
                break;
            }
            case 8: { // Low Attendance List
                sys.lowAttendanceReport();
                break;
            }
            case 9: { // Sort by Roll
                std::cout << "\n--- Sort Students by Roll Number ---\n";
                std::cout << "Choose algorithm:\n  1. Bubble Sort (O(n^2))\n  2. Merge Sort (O(n log n))\n";
                int alg = readInteger("Enter algorithm choice (1-2): ");
                
                auto& mutableList = sys.getStudentsMutable();
                if (alg == 1) {
                    Sort::bubbleSort(mutableList, SortCriteria::ROLL_NO);
                    std::cout << "[Success] Sorted using Bubble Sort.\n\n";
                } else if (alg == 2) {
                    if (!mutableList.empty()) {
                        Sort::mergeSort(mutableList, 0, static_cast<int>(mutableList.size()) - 1, SortCriteria::ROLL_NO);
                    }
                    std::cout << "[Success] Sorted using Merge Sort.\n\n";
                } else {
                    std::cout << "[Error] Invalid algorithm choice. Sorting aborted.\n\n";
                }
                break;
            }
            case 10: { // Sort by Name
                std::cout << "\n--- Sort Students by Name ---\n";
                std::cout << "Choose algorithm:\n  1. Bubble Sort (O(n^2))\n  2. Merge Sort (O(n log n))\n";
                int alg = readInteger("Enter algorithm choice (1-2): ");
                
                auto& mutableList = sys.getStudentsMutable();
                if (alg == 1) {
                    Sort::bubbleSort(mutableList, SortCriteria::NAME);
                    std::cout << "[Success] Sorted using Bubble Sort.\n\n";
                } else if (alg == 2) {
                    if (!mutableList.empty()) {
                        Sort::mergeSort(mutableList, 0, static_cast<int>(mutableList.size()) - 1, SortCriteria::NAME);
                    }
                    std::cout << "[Success] Sorted using Merge Sort.\n\n";
                } else {
                    std::cout << "[Error] Invalid algorithm choice. Sorting aborted.\n\n";
                }
                break;
            }
            case 11: { // Sort by Attendance %
                std::cout << "\n--- Sort Students by Attendance Percentage ---\n";
                std::cout << "Choose algorithm:\n  1. Bubble Sort (O(n^2))\n  2. Merge Sort (O(n log n))\n";
                int alg = readInteger("Enter algorithm choice (1-2): ");
                
                auto& mutableList = sys.getStudentsMutable();
                if (alg == 1) {
                    Sort::bubbleSort(mutableList, SortCriteria::ATTENDANCE_PCT);
                    std::cout << "[Success] Sorted using Bubble Sort.\n\n";
                } else if (alg == 2) {
                    if (!mutableList.empty()) {
                        Sort::mergeSort(mutableList, 0, static_cast<int>(mutableList.size()) - 1, SortCriteria::ATTENDANCE_PCT);
                    }
                    std::cout << "[Success] Sorted using Merge Sort.\n\n";
                } else {
                    std::cout << "[Error] Invalid algorithm choice. Sorting aborted.\n\n";
                }
                break;
            }
            case 12: { // Save Data
                sys.saveToFile();
                std::cout << "\n";
                break;
            }
            case 13: { // Undo Last Attendance
                std::cout << "\n--- Undo Last Attendance Action ---\n";
                sys.undoLastAttendance();
                std::cout << "\n";
                break;
            }
            case 14: { // Exit
                sys.saveToFile();
                std::cout << "\nExiting Student Attendance Management System. Goodbye!\n";
                break;
            }
            default:
                std::cout << "[Error] Invalid choice. Please choose between 1 and 14.\n\n";
                break;
        }
    } while (choice != 14);

    return 0;
}
