#ifndef MERGE_SORT_H
#define MERGE_SORT_H

#include <vector>
#include <string>
#include <algorithm>
#include "Student.h"

// Enum to support multiple sorting criteria
enum class SortCriteria {
    ROLL_NO,
    NAME,
    ATTENDANCE_PCT
};

namespace Sort {

    // Helper: Compare two students based on the specified criteria
    inline bool compareStudents(const Student& a, const Student& b, SortCriteria criteria) {
        if (criteria == SortCriteria::ROLL_NO) {
            return a.getRollNo() < b.getRollNo();
        } else if (criteria == SortCriteria::NAME) {
            return a.getName() < b.getName();
        } else { // SortCriteria::ATTENDANCE_PCT
            return a.getAttendancePercentage() < b.getAttendancePercentage();
        }
    }

    // Bubble Sort: Iteratively compares adjacent students and swaps them if they are in the wrong order.
    // Time Complexity: O(n^2) worst/average case, O(n) best case (if already sorted).
    // Space Complexity: O(1) auxiliary (In-place sort).
    inline void bubbleSort(std::vector<Student>& students, SortCriteria criteria) {
        int n = static_cast<int>(students.size());
        for (int i = 0; i < n - 1; ++i) {
            bool swapped = false;
            for (int j = 0; j < n - i - 1; ++j) {
                // If students[j+1] is smaller than students[j], swap them
                if (compareStudents(students[j + 1], students[j], criteria)) {
                    std::swap(students[j], students[j + 1]);
                    swapped = true;
                }
            }
            // Optimization: If no two elements were swapped by inner loop, then list is sorted.
            if (!swapped) {
                break;
            }
        }
    }

    // Helper: Merges two sorted subarrays of students: students[left..mid] and students[mid+1..right].
    // Time Complexity: O(n) where n is the number of elements being merged.
    // Space Complexity: O(n) auxiliary.
    inline void merge(std::vector<Student>& students, int left, int mid, int right, SortCriteria criteria) {
        int n1 = mid - left + 1;
        int n2 = right - left - n1 + 1; // equivalent to right - mid

        // Create temporary vectors to hold the halves
        std::vector<Student> L(n1);
        std::vector<Student> R(n2);

        // Copy data to temporary vectors L[] and R[]
        for (int i = 0; i < n1; ++i) {
            L[i] = students[left + i];
        }
        for (int j = 0; j < n2; ++j) {
            R[j] = students[mid + 1 + j];
        }

        // Merge the temporary vectors back into students[left..right]
        int i = 0; // Initial index of first subarray (L)
        int j = 0; // Initial index of second subarray (R)
        int k = left; // Initial index of merged subarray

        while (i < n1 && j < n2) {
            // compare L[i] and R[j]; standard comparison to keep stable sort
            if (compareStudents(L[i], R[j], criteria) || 
                (!compareStudents(R[j], L[i], criteria) && L[i].getRollNo() <= R[j].getRollNo())) {
                students[k] = L[i];
                i++;
            } else {
                students[k] = R[j];
                j++;
            }
            k++;
        }

        // Copy any remaining elements of L[]
        while (i < n1) {
            students[k] = L[i];
            i++;
            k++;
        }

        // Copy any remaining elements of R[]
        while (j < n2) {
            students[k] = R[j];
            j++;
            k++;
        }
    }

    // Merge Sort: A recursive divide-and-conquer algorithm.
    // Time Complexity: O(n log n) in all cases (worst, average, best).
    // Space Complexity: O(n) auxiliary (due to temporary sub-vectors in merge step).
    //
    // EXPLANATION OF RECURSION IN MERGE SORT:
    // Merge Sort divides the problem into subproblems, solves them recursively, and combines the results.
    //
    // 1. DIVIDE STEP: Find the midpoint index 'mid = left + (right - left) / 2' to split the array 
    //    into two halves: [left...mid] and [mid+1...right].
    //
    // 2. CONQUER STEP (Recursive Calls): 
    //    - Recursively sort the left half: mergeSort(students, left, mid, criteria)
    //    - Recursively sort the right half: mergeSort(students, mid + 1, right, criteria)
    //    The base case for this recursion is when 'left >= right' (i.e. subarray has size 0 or 1, 
    //    which is already sorted).
    //
    // 3. COMBINE STEP (Merge): 
    //    - Call merge(students, left, mid, right, criteria) to take the two sorted halves and 
    //      combine them back into a single sorted range.
    inline void mergeSort(std::vector<Student>& students, int left, int right, SortCriteria criteria) {
        // Base case: If subarray has 1 or 0 elements, it is already sorted.
        if (left >= right) {
            return;
        }

        // 1. DIVIDE
        int mid = left + (right - left) / 2;

        // 2. CONQUER (Recursive division of left and right halves)
        mergeSort(students, left, mid, criteria);
        mergeSort(students, mid + 1, right, criteria);

        // 3. COMBINE (Merge the sorted halves back together)
        merge(students, left, mid, right, criteria);
    }
}

#endif // MERGE_SORT_H
