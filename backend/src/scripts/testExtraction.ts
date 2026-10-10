import { extractionService } from '../services/extractionService.js'

async function run() {
  const sampleText = `Apex Clinical Diagnostics
Patient: Jane Doe
Report Date: 2026-10-10

METABOLIC & BIOCHEMISTRY
Fasting Blood Glucose: 106 mg/dL  (Reference: 70 - 99 mg/dL)  High
Serum Creatinine: 0.9 mg/dL  (Reference: 0.6 - 1.1 mg/dL)  Normal
eGFR: 98 mL/min/1.73m²  (Reference: > 60 mL/min/1.73m²)  Normal
Total Cholesterol: 208 mg/dL  (Reference: < 200 mg/dL)  High
Hemoglobin: 13.5 g/dL  (Reference: 12.0 - 15.5 g/dL)  Normal
`

  const analytes = extractionService.extractLabAnalytes(sampleText)
  console.log('Extracted Analytes Count:', analytes.length)
  analytes.forEach((a) => {
    console.log(`- ${a.testName}: ${a.value} ${a.unit} [Ref: ${a.referenceRange}] -> ${a.status}`)
  })

  const date = extractionService.extractReportDate(sampleText)
  console.log('\nExtracted Date:', date)

  const summary = extractionService.generateReportSummary('sample_lab_report.pdf', date, analytes)
  console.log('\nPlain English Summary:\n', summary.plainEnglishSummary)
  console.log('\nTelugu Summary:\n', summary.teluguSummary)
  console.log('\nKey Findings:\n', summary.keyFindings)
  console.log('\nDoctor Discussion Questions:\n', summary.clinicianDiscussionQuestions)

  const emptySummary = extractionService.generateReportSummary('empty_report.pdf', date, [])
  console.log('\nEmpty Report Summary:\n', emptySummary.plainEnglishSummary)
}

run().catch(console.error)
