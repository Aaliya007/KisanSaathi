const RULES = [
  {
    keywords: ['yellow leaves', 'leaf turning yellow', 'yellow'],
    diagnosis: 'Possible Nitrogen Deficiency',
    advice:
      '• Apply nitrogen-rich fertilizer\n• Check watering schedule\n• Inspect for root damage',
    confidence: 'moderate',
  },
  {
    keywords: ['brown spots', 'black spots', 'spots'],
    diagnosis: 'Possible Early Blight',
    advice:
      '• Remove infected leaves\n• Use copper fungicide\n• Improve air circulation',
    confidence: 'moderate',
  },
  {
    keywords: ['wilting', 'drooping'],
    diagnosis: 'Possible Water Stress',
    advice: '• Check soil moisture\n• Avoid overwatering\n• Improve drainage',
    confidence: 'moderate',
  },
  {
    keywords: ['white powder'],
    diagnosis: 'Possible Powdery Mildew',
    advice:
      '• Remove infected foliage\n• Improve airflow\n• Apply suitable fungicide',
    confidence: 'moderate',
  },
  {
    keywords: ['eaten leaves', 'caterpillar', 'holes'],
    diagnosis: 'Possible Pest Attack',
    advice:
      '• Inspect underside of leaves\n• Remove visible pests\n• Use neem oil or recommended pesticide',
    confidence: 'moderate',
  },
]

function matchRule(message) {
  const normalized = (message || '').toLowerCase()

  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule
    }
  }

  return null
}

export function fallbackDiagnosis({ message, imageUploaded = false }) {
  const matched = matchRule(message)

  let diagnosis
  let advice
  let confidence

  if (matched) {
    diagnosis = matched.diagnosis
    advice = matched.advice
    confidence = matched.confidence
  } else {
    diagnosis = 'General Crop Health Issue'
    advice = 'Please consult a local agricultural expert if symptoms continue.'
    confidence = 'low'
  }

  if (imageUploaded) {
    advice = `${advice}\n\nImage was considered during fallback assessment.`
  }

  return {
    status: 'complete',
    diagnosis,
    advice,
    confidence,
    source: 'Fallback AI',
  }
}
