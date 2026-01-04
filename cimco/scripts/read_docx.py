import zipfile
import re
import sys
import os

def read_docx(file_path):
    try:
        with zipfile.ZipFile(file_path) as z:
            xml_content = z.read('word/document.xml').decode('utf-8')
            # Rudimentary regex XML parsing to extract text
            # Remove all tags
            text = re.sub('<[^>]+>', ' ', xml_content)
            # Clean up whitespace
            text = re.sub(r'\s+', ' ', text).strip()
            return text
    except Exception as e:
        return f"Error reading {file_path}: {e}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python read_docx.py <file>")
        sys.exit(1)
        
    for file in sys.argv[1:]:
        print(f"--- CONTENT OF {file} ---")
        print(read_docx(file))
        print("\n\n")
