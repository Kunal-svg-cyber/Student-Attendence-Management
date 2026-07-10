#ifndef FILE_MANAGER_H
#define FILE_MANAGER_H

#include <vector>
#include <string>
#include <fstream>
#include <iostream>
#include <sstream>
#include "Student.h"

namespace FileManager {
    const std::string FILENAME = "students.txt";

    // Load students from students.txt into the vector.
    // Time Complexity: O(n) where n is the number of student records in the file. We iterate once per line.
    // Space Complexity: O(n) to store the students in the vector.
    inline void loadStudents(std::vector<Student>& students) {
        students.clear();
        std::ifstream inFile(FILENAME);

        // If the file does not exist, create it
        if (!inFile) {
            std::cout << "[Info] " << FILENAME << " not found. Creating a new file..." << std::endl;
            std::ofstream outFile(FILENAME);
            if (!outFile) {
                std::cerr << "[Error] Could not create file: " << FILENAME << std::endl;
                return;
            }
            outFile << "# rollNo name department totalClasses attendedClasses\n";
            outFile.close();
            return;
        }

        std::string line;
        while (std::getline(inFile, line)) {
            // Skip comments and empty lines
            if (line.empty() || line[0] == '#') {
                continue;
            }

            std::stringstream ss(line);
            int rollNo;
            std::string name;
            std::string department;
            int totalClasses;
            int attendedClasses;

            // Read space-separated values
            if (ss >> rollNo >> name >> department >> totalClasses >> attendedClasses) {
                students.push_back(Student(rollNo, name, department, totalClasses, attendedClasses));
            }
        }
        inFile.close();
        std::cout << "[Success] Loaded " << students.size() << " students from " << FILENAME << std::endl;
    }

    // Overwrite students.txt with current vector data.
    // Time Complexity: O(n) where n is the number of students. We iterate once and write to disk.
    // Space Complexity: O(1) auxiliary space.
    inline void saveStudents(const std::vector<Student>& students) {
        std::ofstream outFile(FILENAME);
        if (!outFile) {
            std::cerr << "[Error] Could not open file for writing: " << FILENAME << std::endl;
            return;
        }

        outFile << "# rollNo name department totalClasses attendedClasses\n";
        for (const auto& student : students) {
            outFile << student.getRollNo() << " "
                    << student.getName() << " "
                    << student.getDepartment() << " "
                    << student.getTotalClasses() << " "
                    << student.getAttendedClasses() << "\n";
        }
        outFile.close();
        std::cout << "[Success] Saved " << students.size() << " students to " << FILENAME << std::endl;
    }
}

#endif // FILE_MANAGER_H
