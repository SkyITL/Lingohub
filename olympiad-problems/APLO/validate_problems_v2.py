#!/usr/bin/env python3
"""
Comprehensive validation of APLO problems from 2022-2024.
Compares separated markdown files against original PDFs.
Focuses on the actual linguistic data, not metadata.
"""

import pdfplumber
import re
import os
from pathlib import Path
import unicodedata
from difflib import SequenceMatcher

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
        self.total_examples_checked = 0

    def add_result(self, year, problem_num, status, issues, stats):
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
            "issues": issues,
            "stats": stats
        })

        self.character_checks += stats.get("characters_checked", 0)
        self.total_examples_checked += stats.get("examples_count", 0)

    def print_report(self):
        print("=" * 100)
        print("APLO PROBLEMS COMPREHENSIVE VALIDATION REPORT (2022-2024)")
        print("=" * 100)
        print()

        for result in self.results:
            year = result["year"]
            prob = result["problem"]
            status = result["status"]
            issues = result["issues"]
            stats = result["stats"]

            problem_name = PROBLEM_METADATA[year][prob]["name"]
            problem_title = PROBLEM_METADATA[year][prob]["title"]

            status_symbol = "✓" if status == "PASS" else "✗"
            print(f"{status_symbol} {year} Problem {prob} ({problem_title}): {status}")

            if stats:
                print(f"   Examples checked: {stats.get('examples_count', 0)}")
                print(f"   Special characters: {stats.get('characters_checked', 0)}")
                print(f"   Similarity score: {stats.get('similarity', 0):.1f}%")

            if issues:
                for issue in issues:
                    print(f"   ⚠ {issue}")
            print()

        print("=" * 100)
        print("SUMMARY")
        print("=" * 100)
        print(f"Total files validated: {self.total_files}")
        print(f"Passed: {self.passed_files}")
        print(f"Failed: {self.failed_files}")
        print(f"Total issues found: {self.total_issues}")
        print(f"Total examples checked: {self.total_examples_checked}")
        print(f"Total special characters validated: {self.character_checks}")
        if self.total_files > 0:
            accuracy = (self.passed_files / self.total_files) * 100
            print(f"Overall accuracy: {accuracy:.1f}%")
        print("=" * 100)

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

def extract_markdown_content(md_path):
    """Extract only the problem content from markdown (excluding metadata and analysis)."""
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the Problem Description section
    pattern = r'## Problem Description\s+(.*?)(?=##|$)'
    match = re.search(pattern, content, re.DOTALL)

    if match:
        problem_content = match.group(1).strip()
        # Also try to extract Notes section as it contains problem info
        notes_pattern = r'## Notes\s+(.*?)(?=##|$)'
        notes_match = re.search(notes_pattern, content, re.DOTALL)
        if notes_match:
            problem_content += "\n\n" + notes_match.group(1).strip()
        return problem_content
    return ""

def extract_linguistic_examples(text):
    """Extract linguistic examples from text."""
    examples = []

    # Pattern 1: word/phrase - translation (markdown format)
    pattern1 = re.findall(r'\*\*([^\*]+)\*\*\s*[-–—]\s*\*([^\*]+)\*', text)
    examples.extend(pattern1)

    # Pattern 2: word/phrase - translation (plain format)
    pattern2 = re.findall(r'([^\n]+?)\s+[-–—]\s+([^\n]+)', text)
    examples.extend(pattern2)

    # Pattern 3: numbered items
    pattern3 = re.findall(r'\d+\.\s+([^\n]+)', text)

    return examples

def get_special_characters(text):
    """Extract all special characters (IPA, diacritics, etc.)."""
    special_chars = {}

    for char in text:
        # Check for non-ASCII characters (excluding common punctuation)
        if ord(char) > 127 and char not in {' ', '\n', '\t', ''', ''', '"', '"', '—', '–', '…'}:
            # Skip Chinese characters (they're in metadata)
            if 0x4E00 <= ord(char) <= 0x9FFF:  # CJK Unified Ideographs
                continue

            char_name = unicodedata.name(char, 'UNKNOWN')
            special_chars[char] = char_name

    return special_chars

def extract_words_from_text(text):
    """Extract all words with special characters from text."""
    # Find words containing non-ASCII characters
    words = re.findall(r'\b\w*[^\x00-\x7F]+\w*\b', text)
    return set(words)

def compare_special_characters(pdf_text, md_text):
    """Compare special characters between PDF and markdown content."""
    pdf_chars = get_special_characters(pdf_text)
    md_chars = get_special_characters(md_text)

    missing = set(pdf_chars.keys()) - set(md_chars.keys())
    extra = set(md_chars.keys()) - set(pdf_chars.keys())

    issues = []

    if missing:
        for char in sorted(missing):
            char_name = pdf_chars[char]
            issues.append(f"Missing character: '{char}' (U+{ord(char):04X} {char_name})")

    if extra:
        for char in sorted(extra):
            char_name = md_chars[char]
            # Only report if it's likely an error (not in both)
            issues.append(f"Extra character: '{char}' (U+{ord(char):04X} {char_name})")

    return issues, len(pdf_chars) + len(md_chars)

def extract_data_examples(text):
    """Extract key linguistic data examples (word-translation pairs)."""
    examples = []

    # Match patterns like: word - translation or **word** - *translation*
    lines = text.split('\n')
    for line in lines:
        # Skip headers and metadata
        if line.startswith('#') or line.startswith('**Problem') or line.startswith('**Year'):
            continue

        # Look for translation pairs
        if '–' in line or '-' in line or '—' in line:
            # Clean markdown formatting
            clean_line = re.sub(r'\*\*([^\*]+)\*\*', r'\1', line)
            clean_line = re.sub(r'\*([^\*]+)\*', r'\1', clean_line)

            # Extract pair
            parts = re.split(r'\s*[–—-]\s*', clean_line)
            if len(parts) == 2:
                word = parts[0].strip()
                translation = parts[1].strip()
                if word and translation:
                    examples.append((word, translation))

    return examples

def calculate_text_similarity(text1, text2):
    """Calculate similarity between two texts."""
    return SequenceMatcher(None, text1, text2).ratio() * 100

def validate_problem(year, problem_num, report):
    """Validate a single problem file."""
    # Get paths
    pdf_path = APLO_DIR / f"aplo-{year}-prob.en.pdf"
    problem_name = PROBLEM_METADATA[year][problem_num]["name"]
    md_path = SEPARATED_DIR / str(year) / f"problem-{problem_num}-{problem_name}.md"

    issues = []
    stats = {}

    # Check if files exist
    if not pdf_path.exists():
        issues.append(f"PDF file not found: {pdf_path}")
        report.add_result(year, problem_num, "FAIL", issues, stats)
        return

    if not md_path.exists():
        issues.append(f"Markdown file not found: {md_path}")
        report.add_result(year, problem_num, "FAIL", issues, stats)
        return

    # Extract problem from PDF
    pdf_text = extract_problem_from_pdf(pdf_path, problem_num)
    if pdf_text is None:
        issues.append("Could not extract problem text from PDF")
        report.add_result(year, problem_num, "FAIL", issues, stats)
        return

    # Read markdown file
    md_content = extract_markdown_content(md_path)

    # Extract linguistic examples
    pdf_examples = extract_data_examples(pdf_text)
    md_examples = extract_data_examples(md_content)

    stats["examples_count"] = len(pdf_examples)
    stats["md_examples_count"] = len(md_examples)

    # Compare examples
    if len(pdf_examples) > 0:
        missing_examples = []
        for pdf_ex in pdf_examples:
            # Check if example exists in markdown
            found = False
            for md_ex in md_examples:
                if pdf_ex[0].lower() in md_ex[0].lower() or md_ex[0].lower() in pdf_ex[0].lower():
                    found = True
                    break
            if not found:
                missing_examples.append(f"{pdf_ex[0]} - {pdf_ex[1]}")

        if missing_examples:
            issues.append(f"Potentially missing {len(missing_examples)} examples")

    # Character validation (only on actual problem content)
    char_issues, char_count = compare_special_characters(pdf_text, md_content)
    # Only report character issues if they're significant (not just em-dash vs hyphen)
    significant_char_issues = [iss for iss in char_issues if 'EM DASH' not in iss and 'WHITE UP-POINTING TRIANGLE' not in iss]

    if significant_char_issues:
        issues.extend(significant_char_issues[:5])  # Limit to first 5

    stats["characters_checked"] = char_count

    # Calculate similarity
    # Normalize texts for comparison
    pdf_normalized = re.sub(r'\s+', ' ', pdf_text.lower())
    md_normalized = re.sub(r'\s+', ' ', md_content.lower())
    similarity = calculate_text_similarity(pdf_normalized, md_normalized)
    stats["similarity"] = similarity

    # If similarity is very low, it might indicate missing content
    if similarity < 50:
        issues.append(f"Low similarity score ({similarity:.1f}%) - content may be incomplete")

    # Determine status
    status = "PASS" if len(issues) == 0 else "FAIL"
    report.add_result(year, problem_num, status, issues, stats)

def main():
    report = ValidationReport()

    print("Starting comprehensive validation of APLO problems (2022-2024)...")
    print()

    # Validate all problems from 2022-2024
    for year in [2022, 2023, 2024]:
        for problem_num in [1, 2, 3, 4, 5]:
            validate_problem(year, problem_num, report)

    report.print_report()

if __name__ == "__main__":
    main()
