#ifndef STUDENT_H
#define STUDENT_H

#include <string>

class Student {
private:
    int rollNo;
    std::string name;
    std::string department;
    int totalClasses;
    int attendedClasses;

public:
    // Constructors
    Student();
    Student(int rollNo, std::string name, std::string department, int totalClasses, int attendedClasses);

    // Getters
    int getRollNo() const;
    std::string getName() const;
    std::string getDepartment() const;
    int getTotalClasses() const;
    int getAttendedClasses() const;

    // Setters
    void setRollNo(int rollNo);
    void setName(std::string name);
    void setDepartment(std::string department);
    void setTotalClasses(int totalClasses);
    void setAttendedClasses(int attendedClasses);

    // Utility Methods
    double getAttendancePercentage() const;
    void printReport() const;
};

#endif // STUDENT_H
