
const testCases = [
    {
        name: "UG Education 2013-2014 (New Format)",
        degree: "UG",
        faculty: "Faculty of Education",
        academic_year: "2013-2014",
        expectedFormat: "UG Education"
    },
    {
        name: "UG Education 2005-2006 (New Format)",
        degree: "UG Education",
        faculty: "Faculty of Education",
        academic_year: "2005-2006",
        expectedFormat: "UG Education"
    },
    {
        name: "UG Arts 2013-2014 (Existing Format)",
        degree: "UG",
        faculty: "Faculty of Arts",
        academic_year: "2013-2014",
        expectedFormat: "Existing UG"
    },
    {
        name: "UG Education 2016-2017 (Existing Format - Out of Range)",
        degree: "UG",
        faculty: "Faculty of Education",
        academic_year: "2016-2017",
        expectedFormat: "Existing UG"
    },
    {
        name: "PG Education 2013-2014 (PG Format)",
        degree: "PG",
        faculty: "Faculty of Education",
        academic_year: "2013-2014",
        expectedFormat: "PG"
    }
];

function checkLogic(student) {
    const degreeCodeCheck = (student.degree || '').toUpperCase();
    const yearStrCheck = student.academic_year || '';
    const yearMatchCheck = yearStrCheck.match(/(\d{4})/);
    const startYearCheck = yearMatchCheck ? parseInt(yearMatchCheck[0], 10) : 0;

    if (degreeCodeCheck === 'PG' && startYearCheck >= 2000 && startYearCheck <= 2020) {
        return "PG";
    }

    const isUGEducation = (degreeCodeCheck.includes('UG')) && (student.faculty || '').toLowerCase().includes('education');
    if (isUGEducation && startYearCheck >= 2000 && startYearCheck <= 2015) {
        return "UG Education";
    }

    return "Existing UG";
}

testCases.forEach(tc => {
    const result = checkLogic(tc);
    console.log(`Test: ${tc.name}`);
    console.log(`  Result: ${result}`);
    console.log(`  Status: ${result === tc.expectedFormat ? 'PASS' : 'FAIL'}`);
});
