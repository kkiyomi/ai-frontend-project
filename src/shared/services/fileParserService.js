// File parser service - moved from utils/fileParser.js
export async function parseFileContent(file) {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await file.text();
  }
  
  if (fileName.endsWith('.pdf')) {
    return `[PDF content parsing not implemented yet. File: ${file.name}]\n\nThis would contain the extracted text from the PDF file. You would need to integrate a PDF parsing library like pdf2pic or PDF.js to extract the actual text content.`;
  }
  
  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return `[DOCX content parsing not implemented yet. File: ${file.name}]\n\nThis would contain the extracted text from the Word document. You would need to integrate a library like mammoth.js to parse DOCX files.`;
  }
  
  return await file.text();
}

export function getFileIcon(fileName) {
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