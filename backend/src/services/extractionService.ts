import * as pdfParseModule from 'pdf-parse'
import { createWorker } from 'tesseract.js'


export interface ExtractedAnalyte {
  id: string
  testName: string
  value: number | string
  unit: string
  referenceRange: string
  status: 'Within Reference Range' | 'Outside Reference Range' | 'Needs Review'
  category: 'Metabolic' | 'Lipid' | 'Hematology' | 'Renal' | 'Electrolytes' | 'Endocrine' | 'General'
  interpretationNotes?: string
  teluguExplanation?: string
}

export interface ExtractedReportResult {
  fileName: string
  extractedText: string
  extractionMethod: 'PDF Text Parser' | 'OCR Image Recognition' | 'Hybrid PDF/OCR'
  reportDate: string
  analytes: ExtractedAnalyte[]
  plainEnglishSummary: string
  teluguSummary: string
  keyFindings: string[]
  clinicianDiscussionQuestions: string[]
  terminologyGlossary: { term: string; definition: string; teluguDefinition?: string }[]
  hasLabResults: boolean
}

// Known common laboratory test definitions and standard categories
interface KnownTestPattern {
  aliases: RegExp
  canonicalName: string
  category: 'Metabolic' | 'Lipid' | 'Hematology' | 'Renal' | 'Electrolytes' | 'Endocrine' | 'General'
  defaultUnit?: string
  teluguName: string
  englishTermDef: string
  teluguTermDef: string
}

const KNOWN_TESTS: KnownTestPattern[] = [
  {
    aliases: /\b(fasting\s+(?:blood\s+)?glucose|glucose[,\s]+fasting|fasting\s+blood\s+sugar|fbs|fbg)\b/i,
    canonicalName: 'Fasting Blood Glucose',
    category: 'Metabolic',
    defaultUnit: 'mg/dL',
    teluguName: 'ఉపవాస రక్త చక్కెర (Fasting Glucose)',
    englishTermDef: 'Blood glucose level measured after an overnight fasting period of 8–12 hours.',
    teluguTermDef: 'రాత్రిపూట 8-12 గంటలు ఉపవాసం ఉన్న తర్వాత రక్తంలో ఉండే గ్లూకోజ్ స్థాయి.',
  },
  {
    aliases: /\b(post\s*prandial\s+(?:blood\s+)?glucose|ppbs|ppbg|glucose[,\s]+post\s*prandial)\b/i,
    canonicalName: 'Postprandial Blood Glucose',
    category: 'Metabolic',
    defaultUnit: 'mg/dL',
    teluguName: 'భోజనం తర్వాత రక్త చక్కెర (Postprandial Glucose)',
    englishTermDef: 'Blood sugar evaluated 2 hours following a meal.',
    teluguTermDef: 'భోజనం చేసిన 2 గంటల తర్వాత శరీరంలో ఉండే రక్త చక్కెర స్థాయి.',
  },
  {
    aliases: /\b(random\s+(?:blood\s+)?glucose|rbs|blood\s+glucose|glucose)\b/i,
    canonicalName: 'Blood Glucose',
    category: 'Metabolic',
    defaultUnit: 'mg/dL',
    teluguName: 'రక్త చక్కెర (Blood Glucose)',
    englishTermDef: 'Concentration of sugar (glucose) present in the blood stream.',
    teluguTermDef: 'రక్తంలో ఉండే సాధారణ చక్కెర స్థాయి.',
  },
  {
    aliases: /\b(hemoglobin\s+a1c|glycated\s+hemoglobin|hba1c|a1c)\b/i,
    canonicalName: 'Hemoglobin A1c (HbA1c)',
    category: 'Metabolic',
    defaultUnit: '%',
    teluguName: 'హెచ్‌బిఏ1సి (HbA1c - 3 నెలల సగటు చక్కెర)',
    englishTermDef: 'Average estimated blood glucose control over the preceding 2 to 3 months.',
    teluguTermDef: 'గత 3 నెలల సగటు రక్త చక్కెర నియంత్రణను తెలిపే కొలమానం.',
  },
  {
    aliases: /\b(serum\s+creatinine|creatinine[,\s]+serum|creatinine)\b/i,
    canonicalName: 'Serum Creatinine',
    category: 'Renal',
    defaultUnit: 'mg/dL',
    teluguName: 'సీరం క్రియాటినిన్ (Serum Creatinine)',
    englishTermDef: 'Waste breakdown product of muscle metabolism filtered out by functioning kidneys.',
    teluguTermDef: 'కిడ్నీల ద్వారా రక్తం నుండి శుద్ధి చేయబడే వ్యర్థ పదార్థం; మూత్రపిండాల పనితీరును సూచిస్తుంది.',
  },
  {
    aliases: /\b(estimated\s+gfr|egfr|gfr)\b/i,
    canonicalName: 'eGFR',
    category: 'Renal',
    defaultUnit: 'mL/min/1.73m²',
    teluguName: 'కిడ్నీ ఫిల్ట్రేషన్ రేటు (eGFR)',
    englishTermDef: 'Estimated Glomerular Filtration Rate; quantitative assessment of renal filtration capacity.',
    teluguTermDef: 'మూత్రపిండాలు నిమిషానికి రక్తాన్ని ఎంత సమర్థవంతంగా శుద్ధి చేస్తున్నాయో తెలిపే సూచిక.',
  },
  {
    aliases: /\b(blood\s+urea\s+nitrogen|bun|urea)\b/i,
    canonicalName: 'Blood Urea Nitrogen (BUN)',
    category: 'Renal',
    defaultUnit: 'mg/dL',
    teluguName: 'యూరియా నత్రజని (BUN)',
    englishTermDef: 'Measure of nitrogenous waste in blood derived from dietary protein breakdown.',
    teluguTermDef: 'రక్తంలో ఉండే నత్రజని వ్యర్థాల కొలత; మూత్రపిండాలు మరియు కాలేయ ఆరోగ్యాన్ని ప్రతిబింబిస్తుంది.',
  },
  {
    aliases: /\b(total\s+cholesterol|serum\s+cholesterol|cholesterol[,\s]+total)\b/i,
    canonicalName: 'Total Cholesterol',
    category: 'Lipid',
    defaultUnit: 'mg/dL',
    teluguName: 'మొత్తం కొలెస్ట్రాల్ (Total Cholesterol)',
    englishTermDef: 'Sum of circulating blood cholesterol components (HDL, LDL, and VLDL).',
    teluguTermDef: 'రక్తంలో ఉండే మొత్తం కొలెస్ట్రాల్ పరిమాణం.',
  },
  {
    aliases: /\b(ldl\s+cholesterol|ldl[ -]c|calculated\s+ldl|ldl)\b/i,
    canonicalName: 'LDL Cholesterol',
    category: 'Lipid',
    defaultUnit: 'mg/dL',
    teluguName: 'ఎల్.డి.ఎల్ కొలెస్ట్రాల్ (చెడు కొవ్వు)',
    englishTermDef: 'Low-Density Lipoprotein; frequently termed bad cholesterol associated with vascular plaques.',
    teluguTermDef: 'రక్తనాళాలలో పేరుకుపోయే అవకాశమున్న హానికర కొవ్వు.',
  },
  {
    aliases: /\b(hdl\s+cholesterol|hdl[ -]c|hdl)\b/i,
    canonicalName: 'HDL Cholesterol',
    category: 'Lipid',
    defaultUnit: 'mg/dL',
    teluguName: 'హెచ్.డి.ఎల్ కొలెస్ట్రాల్ (మంచి కొవ్వు)',
    englishTermDef: 'High-Density Lipoprotein; protective cardioprotective lipid transporting excess cholesterol.',
    teluguTermDef: 'గుండెను రక్షించే మరియు అదనపు కొవ్వును కాలేయానికి చేర్చే మంచి కొవ్వు.',
  },
  {
    aliases: /\b(triglycerides|serum\s+triglycerides|tg)\b/i,
    canonicalName: 'Triglycerides',
    category: 'Lipid',
    defaultUnit: 'mg/dL',
    teluguName: 'ట్రైగ్లిజరైడ్స్ (Triglycerides)',
    englishTermDef: 'Primary storage form of energy derived from unused calories.',
    teluguTermDef: 'శరీరంలో ఉపయోగించని కేలరీల నుండి ఏర్పడే కొవ్వు నిల్వలు.',
  },
  {
    aliases: /\b(alanine\s+aminotransferase|alt|sgpt)\b/i,
    canonicalName: 'ALT (Alanine Aminotransferase)',
    category: 'Metabolic',
    defaultUnit: 'U/L',
    teluguName: 'ఎ.ఎల్.టి కాలేయ ఎంజైమ్ (ALT)',
    englishTermDef: 'Intracellular liver enzyme released into circulation upon hepatocellular stress.',
    teluguTermDef: 'కాలేయ కణాలలో ఉండే ఎంజైమ్; కాలేయ ఆరోగ్యాన్ని సూచిస్తుంది.',
  },
  {
    aliases: /\b(aspartate\s+aminotransferase|ast|sgot)\b/i,
    canonicalName: 'AST (Aspartate Aminotransferase)',
    category: 'Metabolic',
    defaultUnit: 'U/L',
    teluguName: 'ఎ.ఎస్.టి ఎంజైమ్ (AST)',
    englishTermDef: 'Enzyme found within liver and heart muscle tissue.',
    teluguTermDef: 'కాలేయం మరియు గుండె కణజాలంలో ఉండే కీలక ఎంజైమ్.',
  },
  {
    aliases: /\b(hemoglobin|hgb|hb)\b/i,
    canonicalName: 'Hemoglobin',
    category: 'Hematology',
    defaultUnit: 'g/dL',
    teluguName: 'హిమోగ్లోబిన్ (Hemoglobin)',
    englishTermDef: 'Iron-rich oxygen-transport protein inside red blood erythrocytes.',
    teluguTermDef: 'ఎర్ర రక్త కణాలలో ఆక్సిజన్‌ను మోసుకెళ్లే ఇనుముతో కూడిన ప్రోటీన్.',
  },
  {
    aliases: /\b(white\s+blood\s+cells?|white\s+blood\s+count|wbc|total\s+leukocyte\s+count|tlc)\b/i,
    canonicalName: 'White Blood Cell (WBC) Count',
    category: 'Hematology',
    defaultUnit: 'x10^3/uL',
    teluguName: 'తెల్ల రక్త కణాలు (WBC Count)',
    englishTermDef: 'Immunological defense cells responding to pathogens and bodily inflammation.',
    teluguTermDef: 'శరీరాన్ని అంటువ్యాధుల నుండి రక్షించే రోగనిరోధక కణాలు.',
  },
  {
    aliases: /\b(platelets?|platelet\s+count|plt)\b/i,
    canonicalName: 'Platelet Count',
    category: 'Hematology',
    defaultUnit: 'x10^3/uL',
    teluguName: 'ప్లేట్‌లెట్స్ సంఖ్య (Platelet Count)',
    englishTermDef: 'Cellular fragments that assist normal hemostatic blood clotting.',
    teluguTermDef: 'గాయాలు అయినప్పుడు రక్తం గడ్డకట్టడానికి సహాయపడే కణ భాగాలు.',
  },
  {
    aliases: /\b(thyroid\s+stimulating\s+hormone|tsh)\b/i,
    canonicalName: 'TSH (Thyroid Stimulating Hormone)',
    category: 'Endocrine',
    defaultUnit: 'uIU/mL',
    teluguName: 'థైరాయిడ్ హార్మోన్ (TSH)',
    englishTermDef: 'Pituitary messenger controlling thyroid metabolic activity.',
    teluguTermDef: 'థైరాయిడ్ గ్రంథి పనితీరును నియంత్రించే పిట్యూటరీ హార్మోన్.',
  },
  {
    aliases: /\b(potassium|serum\s+potassium|k\+)\b/i,
    canonicalName: 'Potassium',
    category: 'Electrolytes',
    defaultUnit: 'mmol/L',
    teluguName: 'పొటాషియం (Potassium)',
    englishTermDef: 'Vital intracellular cation for neural conduction and cardiac rhythm.',
    teluguTermDef: 'గుండె లయ మరియు నరాల పనితీరుకు అవసరమైన ముఖ్యమైన లవణం.',
  },
  {
    aliases: /\b(sodium|serum\s+sodium|na\+)\b/i,
    canonicalName: 'Sodium',
    category: 'Electrolytes',
    defaultUnit: 'mmol/L',
    teluguName: 'సోడియం (Sodium)',
    englishTermDef: 'Essential electrolyte regulating extracellular fluid balance and blood pressure.',
    teluguTermDef: 'శరీరంలో ద్రవాల సమతుల్యత మరియు రక్తపోటును నియంత్రించే లవణం.',
  },
  {
    aliases: /\b(serum\s+calcium|calcium|ca\+\+)\b/i,
    canonicalName: 'Calcium',
    category: 'Electrolytes',
    defaultUnit: 'mg/dL',
    teluguName: 'కాల్షియం (Calcium)',
    englishTermDef: 'Mineral necessary for skeletal strength, muscular contraction, and coagulation.',
    teluguTermDef: 'ఎముకల బలం, కండరాల కదలికలకు అవసరమైన ఖనిజ లవణం.',
  },
  {
    aliases: /\b(25-hydroxy\s+vitamin\s+d|vitamin\s+d3?|vit\s+d)\b/i,
    canonicalName: 'Vitamin D (25-OH)',
    category: 'Endocrine',
    defaultUnit: 'ng/mL',
    teluguName: 'విటమిన్ డి (Vitamin D)',
    englishTermDef: 'Hormone vital for intestinal calcium absorption and immune health.',
    teluguTermDef: 'కాల్షియం గ్రహణ మరియు రోగనిరోధక వ్యవస్థకు అవసరమైన విటమిన్.',
  },
  {
    aliases: /\b(uric\s+acid|serum\s+urate)\b/i,
    canonicalName: 'Uric Acid',
    category: 'Renal',
    defaultUnit: 'mg/dL',
    teluguName: 'యూరిక్ యాసిడ్ (Uric Acid)',
    englishTermDef: 'Byproduct of purine oxidation; monitored for gout and kidney stress.',
    teluguTermDef: 'ప్యూరిన్ జీవక్రియ ఫలితంగా ఏర్పడే ఆమ్లం; గౌట్ మరియు కిడ్నీ సమస్యలలో గమనించబడుతుంది.',
  },
]

export class ExtractionService {
  /**
   * Extracts text from an uploaded file buffer (PDF or Image)
   */
  public async extractText(
    buffer: Buffer,
    mimetype: string,
    originalName: string
  ): Promise<{ text: string; method: 'PDF Text Parser' | 'OCR Image Recognition' | 'Hybrid PDF/OCR' }> {
    const isPdf = mimetype === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf')
    const isImage = mimetype.startsWith('image/') || /\.(png|jpe?g|bmp|webp)$/i.test(originalName)

    if (isPdf) {
      try {
        let text = ''
        const PDFParseClass =
          (pdfParseModule as any).PDFParse ||
          (pdfParseModule as any).default?.PDFParse

        if (PDFParseClass) {
          const parser = new PDFParseClass({ data: buffer })
          await parser.load()
          const result = await parser.getText()
          text = (typeof result === 'string' ? result : result?.text || '').trim()
          if (typeof parser.destroy === 'function') {
            await parser.destroy()
          }
        } else if (typeof (pdfParseModule as any).default === 'function') {
          const data = await (pdfParseModule as any).default(buffer)
          text = (data.text || '').trim()
        }

        return { text, method: 'PDF Text Parser' }
      } catch (err: any) {
        console.warn(`[ExtractionService] PDF parsing failed: ${err.message}`)
        throw new Error(`Failed to parse PDF document: ${err.message}`)
      }
    }


    if (isImage) {
      try {
        const worker = await createWorker('eng')
        const ret = await worker.recognize(buffer)
        await worker.terminate()
        const text = (ret.data.text || '').trim()
        return { text, method: 'OCR Image Recognition' }
      } catch (err: any) {
        console.warn(`[ExtractionService] OCR failed: ${err.message}`)
        throw new Error(`OCR extraction failed on uploaded image: ${err.message}`)
      }
    }

    throw new Error(`Unsupported MIME type: ${mimetype}. Only PDF, PNG, and JPG files are accepted.`)
  }

  /**
   * Extracts date from report text
   */
  public extractReportDate(text: string): string {
    // Look for explicit Date labels first: "Date: 2026-10-10", "Collection Date: 15-Aug-2024", etc.
    const dateLabelRegex = /(?:collection\s*date|report\s*date|test\s*date|date\s*of\s*service|specimen\s*date|date)[:\s]+([0-9]{1,4}[-/.\s][A-Za-z0-9]{1,9}[-/.\s][0-9]{2,4})/i
    const labelMatch = text.match(dateLabelRegex)
    if (labelMatch && labelMatch[1]) {
      const parsed = this.parseDateString(labelMatch[1].trim())
      if (parsed) return parsed
    }

    // Standard ISO format: YYYY-MM-DD
    const isoMatch = text.match(/\b(20[1-3][0-9]-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01]))\b/)
    if (isoMatch) return isoMatch[1]

    // Formats like 28/09/2024 or 09/28/2024
    const slashMatch = text.match(/\b([0-3]?[0-9][-/][0-3]?[0-9][-/]20[1-3][0-9])\b/)
    if (slashMatch) {
      const parsed = this.parseDateString(slashMatch[1])
      if (parsed) return parsed
    }

    // Default to current date if not explicit
    return new Date().toISOString().split('T')[0]
  }

  private parseDateString(raw: string): string | null {
    try {
      const d = new Date(raw)
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0]
      }
    } catch {}
    return null
  }

  /**
   * Evaluates if measured value is within standard or supplied reference intervals
   */
  private evaluateRangeStatus(
    numericVal: number,
    refRangeStr: string
  ): 'Within Reference Range' | 'Outside Reference Range' {
    if (!refRangeStr || refRangeStr.trim().length === 0) {
      return 'Within Reference Range'
    }

    // Range formats: "70 - 99", "70.0 - 99.0", "70-99"
    const rangeMatch = refRangeStr.match(/([0-9]+(?:\.[0-9]+)?)\s*[-–—to]+\s*([0-9]+(?:\.[0-9]+)?)/i)
    if (rangeMatch) {
      const low = parseFloat(rangeMatch[1])
      const high = parseFloat(rangeMatch[2])
      if (!isNaN(low) && !isNaN(high)) {
        if (numericVal < low || numericVal > high) {
          return 'Outside Reference Range'
        }
        return 'Within Reference Range'
      }
    }

    // Less-than boundary: "< 200", "<= 100", "less than 200"
    const lessMatch = refRangeStr.match(/(?:<|<=|less\s+than)\s*([0-9]+(?:\.[0-9]+)?)/i)
    if (lessMatch) {
      const cutoff = parseFloat(lessMatch[1])
      if (!isNaN(cutoff)) {
        return numericVal > cutoff ? 'Outside Reference Range' : 'Within Reference Range'
      }
    }

    // Greater-than boundary: "> 60", ">= 60", "greater than 60"
    const greaterMatch = refRangeStr.match(/(?:>|>=|greater\s+than)\s*([0-9]+(?:\.[0-9]+)?)/i)
    if (greaterMatch) {
      const cutoff = parseFloat(greaterMatch[1])
      if (!isNaN(cutoff)) {
        return numericVal < cutoff ? 'Outside Reference Range' : 'Within Reference Range'
      }
    }

    return 'Within Reference Range'
  }

  /**
   * Extracts structured laboratory parameters from raw text strictly without inventing values
   */
  public extractLabAnalytes(text: string): ExtractedAnalyte[] {
    if (!text || text.trim().length === 0) {
      return []
    }

    const analytes: ExtractedAnalyte[] = []
    const lines = text.split(/\r?\n/)
    const seenTests = new Set<string>()

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.length < 3) continue

      // Check each known test pattern against this line
      for (const pattern of KNOWN_TESTS) {
        if (seenTests.has(pattern.canonicalName)) continue

        const match = line.match(pattern.aliases)
        if (!match) continue

        // Test matched! Now search for the corresponding numeric value on the same line or next line
        const lineFragment = line.slice(match.index! + match[0].length)
        const candidateText = lineFragment.length > 2 ? lineFragment : lineFragment + ' ' + (lines[i + 1] || '')

        // Look for number (e.g. 106, 0.95, 98, 13.5)
        // Avoid matching dates or reference range prefix if possible
        const valueMatch = candidateText.match(
          /[:\s=]+([0-9]+(?:\.[0-9]+)?)(?:\s*([a-zA-Z%µ/³²^0-9]+(?:\/[a-zA-Z%µ0-9]+)*))?/
        )

        if (!valueMatch) continue

        const rawNumeric = parseFloat(valueMatch[1])
        if (isNaN(rawNumeric)) continue

        // Extract unit: from match or default
        const unit = (valueMatch[2] || pattern.defaultUnit || '').trim()

        // Search for reference range on the same line/vicinity
        let referenceRange = ''
        const refMatch = (line + ' ' + (lines[i + 1] || '')).match(
          /(?:ref(?:erence)?(?:\s*range)?|interval|normal)[:\s]*([<>]=?\s*[0-9]+(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?\s*[-–—to]+\s*[0-9]+(?:\.[0-9]+)?)/i
        )
        if (refMatch && refMatch[1]) {
          referenceRange = refMatch[1].trim()
        } else {
          // Alternative: look for standalone range pattern in the line like "70 - 99" or "< 200"
          const standaloneRange = candidateText.match(
            /(?:[0-9]+(?:\.[0-9]+)?\s*[-–—]\s*[0-9]+(?:\.[0-9]+)?|<[0-9]+(?:\.[0-9]+)?|>[0-9]+(?:\.[0-9]+)?)/
          )
          if (standaloneRange && standaloneRange[0] !== valueMatch[1]) {
            referenceRange = standaloneRange[0].trim()
          }
        }

        // Check if there is an explicit flag indicator in line
        const hasHighFlag = /\b(high|elevated|h)\b/i.test(line)
        const hasLowFlag = /\b(low|decreased|l)\b/i.test(line)

        let status: 'Within Reference Range' | 'Outside Reference Range' = 'Within Reference Range'
        if (hasHighFlag || hasLowFlag) {
          status = 'Outside Reference Range'
        } else if (referenceRange) {
          status = this.evaluateRangeStatus(rawNumeric, referenceRange)
        }

        const analyteId = `ef-ext-${Date.now()}-${analytes.length + 1}`

        let interpretationNotes = `Extracted from uploaded report.`
        if (status === 'Outside Reference Range') {
          interpretationNotes = `Result is outside standard laboratory reference intervals (${referenceRange || 'Supplied limits'}). Review with your clinician.`
        } else {
          interpretationNotes = `Measured within reported reference limits.`
        }

        analytes.push({
          id: analyteId,
          testName: pattern.canonicalName,
          value: rawNumeric,
          unit,
          referenceRange,
          status,
          category: pattern.category,
          interpretationNotes,
          teluguExplanation: `${pattern.teluguName}: ${rawNumeric} ${unit} గా నమోదైంది (${status === 'Outside Reference Range' ? 'సాధారణ పరిమితి వెలుపల ఉంది' : 'సాధారణ పరిధిలోనే ఉంది'}).`,
        })

        seenTests.add(pattern.canonicalName)
        break // Avoid matching more generic tests on the same line
      }
    }


    return analytes
  }

  /**
   * Generates patient-friendly AI Health Summary grounded strictly in extracted report information
   */
  public generateReportSummary(
    fileName: string,
    reportDate: string,
    analytes: ExtractedAnalyte[]
  ): {
    plainEnglishSummary: string
    teluguSummary: string
    keyFindings: string[]
    clinicianDiscussionQuestions: string[]
    terminologyGlossary: { term: string; definition: string; teluguDefinition?: string }[]
  } {
    // Requirement 6: "If the selected report contains no laboratory results, show: 'No laboratory results could be extracted. Please upload a readable medical report.'"
    if (!analytes || analytes.length === 0) {
      return {
        plainEnglishSummary: 'No laboratory results could be extracted. Please upload a readable medical report.',
        teluguSummary: 'ఎటువంటి ప్రయోగశాల ఫలితాలు కనుగొనబడలేదు. దయచేసి చదవగలిగే వైద్య నివేదికను అప్‌లోడ్ చేయండి.',
        keyFindings: [],
        clinicianDiscussionQuestions: [
          'Would you like assistance in uploading a higher resolution or digital lab report?',
        ],
        terminologyGlossary: [],
      }
    }

    const outsideRange = analytes.filter((a) => a.status === 'Outside Reference Range')
    const withinRange = analytes.filter((a) => a.status === 'Within Reference Range')

    // Construct clear, patient-friendly English narrative
    let englishNarrative = `HealthTwin AI analyzed "${fileName}" (dated ${reportDate}). A total of ${analytes.length} laboratory test parameter${
      analytes.length > 1 ? 's were' : ' was'
    } successfully extracted from your documented report.`

    if (outsideRange.length > 0) {
      const flaggedNames = outsideRange.map((a) => `${a.testName} (${a.value} ${a.unit})`).join(', ')
      englishNarrative += ` ${outsideRange.length} parameter${
        outsideRange.length > 1 ? 's are' : ' is'
      } flagged outside standard reference limits: ${flaggedNames}.`
    } else {
      englishNarrative += ` All ${analytes.length} measured parameters are within standard reported reference ranges.`
    }

    if (withinRange.length > 0) {
      const normalNames = withinRange.slice(0, 3).map((a) => a.testName).join(', ')
      englishNarrative += ` Key parameters within normal limits include: ${normalNames}.`
    }

    englishNarrative += ' Please review these findings with your healthcare provider for clinical context.'

    // Construct simple, natural Telugu summary
    let teluguNarrative = `హెల్త్‌ట్విన్ AI ద్వారా మీ నివేదిక "${fileName}" (${reportDate}) విజయవంతంగా విశ్లేషించబడింది. మొత్తం ${analytes.length} ప్రయోగశాల పరీక్షల వివరాలు గ్రహించబడ్డాయి.`

    if (outsideRange.length > 0) {
      teluguNarrative += ` వీటిలో ${outsideRange.length} పరీక్షల విలువలు సాధారణ పరిమితి కంటే వ్యత్యాసంగా ఉన్నాయి. వీటిని మీ తదుపరి వైద్యుల సంప్రదింపులో తప్పక చర్చించండి.`
    } else {
      teluguNarrative += ` గ్రహించిన అన్ని పరీక్షల విలువలు సాధారణ పరిధిలోనే ఉన్నాయి.`
    }

    // Key findings
    const keyFindings: string[] = []
    outsideRange.forEach((a) => {
      keyFindings.push(
        `${a.testName}: ${a.value} ${a.unit} (Outside reference range: ${a.referenceRange || 'limits'})`
      )
    })
    withinRange.forEach((a) => {
      keyFindings.push(
        `${a.testName}: ${a.value} ${a.unit} (Within reference range: ${a.referenceRange || 'normal'})`
      )
    })

    // Discussion questions
    const clinicianDiscussionQuestions: string[] = []
    if (outsideRange.length > 0) {
      outsideRange.forEach((a) => {
        clinicianDiscussionQuestions.push(
          `What steps or follow-up tests are recommended for my ${a.testName} reading of ${a.value} ${a.unit}?`
        )
      })
    } else {
      clinicianDiscussionQuestions.push(
        'All tested parameters appear within range. When should my next routine preventive screen be scheduled?'
      )
    }
    clinicianDiscussionQuestions.push(
      'Are there specific lifestyle or dietary habits that would help maintain optimal levels?'
    )

    // Build glossary from known test definitions
    const terminologyGlossary: { term: string; definition: string; teluguDefinition?: string }[] = []
    analytes.forEach((a) => {
      const def = KNOWN_TESTS.find((k) => k.canonicalName === a.testName)
      if (def) {
        terminologyGlossary.push({
          term: def.canonicalName,
          definition: def.englishTermDef,
          teluguDefinition: def.teluguTermDef,
        })
      }
    })

    return {
      plainEnglishSummary: englishNarrative,
      teluguSummary: teluguNarrative,
      keyFindings,
      clinicianDiscussionQuestions,
      terminologyGlossary,
    }
  }

  /**
   * Main pipeline: Takes uploaded file buffer, runs extraction + OCR + analyte parser + summary generator
   */
  public async processUploadedReport(
    buffer: Buffer,
    mimetype: string,
    originalName: string
  ): Promise<ExtractedReportResult> {
    const { text, method } = await this.extractText(buffer, mimetype, originalName)
    const reportDate = this.extractReportDate(text)
    const analytes = this.extractLabAnalytes(text)
    const summary = this.generateReportSummary(originalName, reportDate, analytes)

    return {
      fileName: originalName,
      extractedText: text,
      extractionMethod: method,
      reportDate,
      analytes,
      plainEnglishSummary: summary.plainEnglishSummary,
      teluguSummary: summary.teluguSummary,
      keyFindings: summary.keyFindings,
      clinicianDiscussionQuestions: summary.clinicianDiscussionQuestions,
      terminologyGlossary: summary.terminologyGlossary,
      hasLabResults: analytes.length > 0,
    }
  }
}

export const extractionService = new ExtractionService()
