function showTab(tabId) { 
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabId}-tab`).classList.add('active');
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
}


// Add calculateFinalGrades to global scope
window.calculateFinalGrades = function() {
    const year10Average = calculateYearAverage(10);
    const year11Average = calculateYearAverage(11);
    const year12Average = calculateYear12Average();
    const examGrades = calculateExamGrades();

    // Calculate and update final averages
    const secondaryAverage = calculateSecondaryEducationAverage(); // Gets value on 200-point scale
    const examAverage = examGrades.average ? examGrades.average * 10 : 0; // Convert to 200-point scale
    const examWeightInput = document.getElementById('exam-weight-input');
    const weight = examWeightInput ? parseFloat(examWeightInput.value) : 50; // Use input value or default to 50

    const finalAverage = ((100 - weight) * secondaryAverage * 0.01) + (weight * 0.01 * examAverage);

    // Update final averages display
    document.getElementById('total-average-no-exams').textContent = 
        secondaryAverage ? Math.round(secondaryAverage * 10) / 10 : '-';
    document.getElementById('total-average-with-exams').textContent = 
        finalAverage ? Math.round(finalAverage * 10) / 10 : '-';

    // Update summary table
    updateSummaryTable(year10Average, year11Average, year12Average, examGrades);
}

// Also make it available globally through window object
window.calculateFinalGrades = calculateFinalGrades;
window.calculateYear12Average = calculateYear12Average;
window.calculateExamGrades = calculateExamGrades;
window.calculateSecondaryEducationAverage = calculateSecondaryEducationAverage;
window.updateSummaryTable = updateSummaryTable;
window.getGrade = getGrade; 
window.getSubjectGrade12 = getSubjectGrade12;
window.calculateSubjectCIF = calculateSubjectCIF;
window.getDomainWeight = getDomainWeight;
window.processSubject = processSubject;
window.updateFinalGrades12 = updateFinalGrades12;
