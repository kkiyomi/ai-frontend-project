export async function parseFileContent(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await file.text();
  }
  
  if (fileName.endsWith('.pdf')) {
    // In a real app, you'd use a PDF parsing library like pdf-parse
    // For now, return a mock message
    return `[PDF content parsing not implemented yet. File: ${file.name}]\n\nThis would contain the extracted text from the PDF file. You would need to integrate a PDF parsing library like pdf2pic or PDF.js to extract the actual text content.`;
  }
  
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    // In a real app, you'd use a library like mammoth.js for DOCX parsing
    return `[DOCX content parsing not implemented yet. File: ${file.name}]\n\nThis would contain the extracted text from the Word document. You would need to integrate a library like mammoth.js to parse DOCX files.`;
  }
  
  // Fallback: try to read as text
  return await file.text();
}

export function getFileIcon(fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'docx':
    case 'doc':
      return '📝';
    case 'txt':
      return '📋';
    default:
      return '📄';
  }
}