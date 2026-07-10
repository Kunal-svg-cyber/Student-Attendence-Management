#ifndef SEARCH_H
#define SEARCH_H

#include <vector>
#include "Student.h"

namespace Search {

    // Linear Search: Scan each student in the list one by one.
    // Time Complexity: O(n) worst/average case, O(1) best case (if first element is target).
    // Space Complexity: O(1) auxiliary.
    inline int linearSearch(const std::vector<Student>& students, int rollNo) {
        for (size_t i = 0; i < students.size(); ++i) {
            if (students[i].getRollNo() == rollNo) {
                return static_cast<int>(i); // Found, return index
            }
        }
        return -1; // Not found
    }

    // Binary Search: Repeatedly divide the search interval in half.
    // Time Complexity: O(log n) worst/average case, O(1) best case (if mid element is target).
    // Space Complexity: O(1) auxiliary.
    //
    // WHY BINARY SEARCH REQUIRES SORTED DATA FIRST:
    // Binary search relies on the ordering property of the dataset to make decisions.
    // At each step, it compares the target roll number with the roll number of the middle student.
    // - If the middle roll number is greater than target, sorting guarantees that all roll numbers to the
    //   right of mid are also greater than target, allowing us to safely discard the right half.
    // - If the middle roll number is smaller than target, sorting guarantees that all roll numbers to the
    //   left of mid are also smaller than target, allowing us to safely discard the left half.
    // Without sorted data, no such guarantees can be made, and discarding a half would risk throwing away 
    // the target element. Thus, unsorted data requires a full scan (Linear Search, O(n)).
    inline int binarySearch(const std::vector<Student>& sortedStudents, int rollNo) {
        int low = 0;
        int high = static_cast<int>(sortedStudents.size()) - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2; // Prevents potential integer overflow
            int midRoll = sortedStudents[mid].getRollNo();

            if (midRoll == rollNo) {
                return mid; // Found, return index
            } else if (midRoll < rollNo) {
                low = mid + 1; // Discard left half
            } else {
                high = mid - 1; // Discard right half
            }
        }
        return -1; // Not found
    }
}

#endif // SEARCH_H
