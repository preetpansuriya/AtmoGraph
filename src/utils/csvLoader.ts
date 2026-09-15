import Papa from 'papaparse'

export interface CSVRow {
  [key: string]: string | number
}

export async function loadCSVData(filePath: string): Promise<CSVRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(filePath, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors)
        }
        resolve(results.data as CSVRow[])
      },
      error: (error) => {
        reject(new Error(`Failed to load CSV: ${error.message}`))
      }
    })
  })
}

export function parseCSVContent(csvContent: string): CSVRow[] {
  const results = Papa.parse(csvContent, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  })

  if (results.errors.length > 0) {
    console.warn('CSV parsing warnings:', results.errors)
  }

  return results.data as CSVRow[]
}

export function validateCSVStructure(data: CSVRow[], requiredFields: string[]): boolean {
  if (data.length === 0) return false
  
  const firstRow = data[0]
  return requiredFields.every(field => field in firstRow)
}
