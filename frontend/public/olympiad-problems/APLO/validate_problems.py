#!/usr/bin/env python3
"""
Comprehensive validation of APLO problems from 2022-2024.
Compares separated markdown files against original PDFs.
"""

import pdfplumber
import re
import os
from pathlib import Path
from collections import defaultdict
import unicodedata

# Base directories
APLO_DIR = Path("/Users/skyliu/Lingohub/olympiad-problems/APLO")
SEPARATED_DIR = APLO_DIR / "separated"

# Problem metadata for 2022-2024
PROBLEM_METADATA = {
    2022: {
        1: {"name": "panara", "title": "Panará"},
        2: {"name": "wayuu", "title": "Wayuu"},
        3: {"name": "jarawara", "title": "Jarawara"},
        4: {"name": "ngkolmpu", "title": "Ngkolmpu"},
        5: {"name": "miskito", "title": "Miskito"},
    },
    2023: {
        1: {"name": "yimas", "title": "Yimas"},
        2: {"name": "ktunaxa", "title": "Ktunaxa"},
        3: {"name": "kobon", "title": "Kobon"},
        4: {"name": "inanwatan", "title": "Inanwatan"},
        5: {"name": "kombai", "title": "Kombai"},
    },
    2024: {
        1: {"name": "tutuba", "title": "Tutuba"},
        2: {"name": "wemba-wemba", "title": "Wemba Wemba"},
        3: {"name": "bambara", "title": "Bambara"},
        4: {"name": "mairasi", "title": "Mairasi"},
        5: {"name": "chungli-ao", "title": "Chungli Ao"},
    }
}

class ValidationReport:
    def __init__(self):
        self.results = []
        self.total_files = 0
        self.passed_files = 0
        self.failed_files = 0
        self.total_issues = 0
        self.character_checks = 0

    def add_result(self, year, problem_num, status, issues):
        self.total_files += 1
        if status == "PASS":
            self.passed_files += 1
        else:
            self.failed_files += 1
            self.total_issues += len(issues)

        self.results.append({
            "year": year,
            "problem": problem_num,
            "status": status,
            "issues": issues
        })

    def print_report(self):
        print("=" * 80)
        print("APLO PROBLEMS VALIDATION REPORT (2022-2024)")
        print("=" * 80)
        print()

        for result in self.results:
            year = result["year"]
            prob = result["problem"]
            status = result["status"]
            issues = result["issues"]

            problem_name = PROBLEM_METADATA[year][prob]["name"]
            problem_title = PROBLEM_METADATA[year][prob]["title"]

            status_symbol = "✓" if status == "PASS" else "✗"
            print(f"{status_symbol} {year} Problem {prob} ({problem_title}): {status}")

            if issues:
                for issue in issues:
                    print(f"  - {issue}")
            print()

        print("=" * 80)
        print("SUMMARY")
        print("=" * 80)
        print(f"Total files validated: {self.total_files}")
        print(f"Passed: {self.passed_files}")
        print(f"Failed: {self.failed_files}")
        print(f"Total issues found: {self.total_issues}")
        print(f"Character checks performed: {self.character_checks}")
        if self.total_files > 0:
            accuracy = (self.passed_files / self.total_files) * 100
            print(f"Overall accuracy: {accuracy:.1f}%")
        print("=" * 80)

def extract_problem_from_pdf(pdf_path, problem_num):
    """Extract a specific problem's text from PDF."""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            full_text = ""
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"

            # Find the problem using regex
            pattern = rf'Problem\s+{problem_num}\s+\(.*?\)\.(.*?)(?=Problem\s+\d+\s+\(|$)'
            match = re.search(pattern, full_text, re.DOTALL)

            if match:
                return match.group(1).strip()
            else:
                # Fallback: try simpler pattern
                pattern2 = rf'Problem\s+{problem_num}\s+(.*?)(?=Problem\s+\d+|$)'
                match2 = re.search(pattern2, full_text, re.DOTALL)
                if match2:
                    return match2.group(1).strip()
                return None
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {e}")
        return None

def normalize_whitespace(text):
    """Normalize whitespace for comparison."""
    # Replace multiple spaces/tabs with single space
    text = re.sub(r'[ \t]+', ' ', text)
    # Replace multiple newlines with single newline
    text = re.sub(r'\n\s*\n', '\n', text)
    return text.strip()

def extract_linguistic_examples(text):
    """Extract linguistic examples (words/phrases with translations)."""
    examples = []

    # Common patterns for linguistic data
    # Pattern 1: word - translation
    pattern1 = re.findall(r'([^\n]+?)\s+[–-]\s+([^\n]+)', text)
    examples.extend(pattern1)

    # Pattern 2: numbered examples
    pattern2 = re.findall(r'\d+\.\s+([^\n]+)', text)

    return examples

def get_special_characters(text):
    """Extract all special characters (IPA, diacritics, etc.)."""
    special_chars = set()

    for char in text:
        # Check for non-ASCII characters
        if ord(char) > 127:
            special_chars.add(char)
        # Check for combining diacritics
        if unicodedata.category(char).startswith('M'):
            special_chars.add(char)

    return sorted(special_chars)

def compare_character_sets(pdf_text, md_text):
    """Compare special characters between PDF and markdown."""
    pdf_chars = set(get_special_characters(pdf_text))
    md_chars = set(get_special_characters(md_text))

    missing = pdf_chars - md_chars
    extra = md_chars - pdf_chars

    issues = []

    if missing:
        for char in sorted(missing):
            char_name = unicodedata.name(char, 'UNKNOWN')
            issues.append(f"Missing character: '{char}' (U+{ord(char):04X} {char_name})")

    if extra:
        for char in sorted(extra):
            char_name = unicodedata.name(char, 'UNKNOWN')
            issues.append(f"Extra character: '{char}' (U+{ord(char):04X} {char_name})")

    return issues, len(pdf_chars) + len(md_chars)

def validate_problem(year, problem_num, report):
    """Validate a single problem file."""
    # Get paths
    pdf_path = APLO_DIR / f"aplo-{year}-prob.en.pdf"
    problem_name = PROBLEM_METADATA[year][problem_num]["name"]
    md_path = SEPARATED_DIR / str(year) / f"problem-{problem_num}-{problem_name}.md"

    issues = []

    # Check if files exist
    if not pdf_path.exists():
        issues.append(f"PDF file not found: {pdf_path}")
        report.add_result(year, problem_num, "FAIL", issues)
        return

    if not md_path.exists():
        issues.append(f"Markdown file not found: {md_path}")
        report.add_result(year, problem_num, "FAIL", issues)
        return

    # Extract problem from PDF
    pdf_text = extract_problem_from_pdf(pdf_path, problem_num)
    if pdf_text is None:
        issues.append("Could not extract problem text from PDF")
        report.add_result(year, problem_num, "FAIL", issues)
        return

    # Read markdown file
    with open(md_path, 'r', encoding='utf-8') as f:
        md_text = f.read()

    # Character validation
    char_issues, char_count = compare_character_sets(pdf_text, md_text)
    issues.extend(char_issues)
    report.character_checks += char_count

    # Check for common transcription errors in IPA
    ipa_patterns = [
        (r'ã', 'tilde a'),
        (r'ā', 'macron a'),
        (r'á', 'acute a'),
        (r'à', 'grave a'),
        (r'ə', 'schwa'),
        (r'ɨ', 'barred i'),
        (r'ɪ', 'small capital i'),
        (r'ʊ', 'upsilon'),
        (r'ŋ', 'eng'),
        (r'ʔ', 'glottal stop'),
        (r'ː', 'length mark'),
        (r'ˈ', 'primary stress'),
        (r'ˌ', 'secondary stress'),
    ]

    # Check length comparison
    pdf_lines = [line.strip() for line in pdf_text.split('\n') if line.strip()]
    md_lines = [line.strip() for line in md_text.split('\n') if line.strip()]

    if abs(len(pdf_lines) - len(md_lines)) > 5:
        issues.append(f"Line count mismatch: PDF has {len(pdf_lines)} lines, MD has {len(md_lines)} lines")

    # Determine status
    status = "PASS" if len(issues) == 0 else "FAIL"
    report.add_result(year, problem_num, status, issues)

def main():
    report = ValidationReport()

    # Validate all problems from 2022-2024
    for year in [2022, 2023, 2024]:
        for problem_num in [1, 2, 3, 4, 5]:
            validate_problem(year, problem_num, report)

    report.print_report()

if __name__ == "__main__":
    main()
