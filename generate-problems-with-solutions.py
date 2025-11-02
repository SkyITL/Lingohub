#!/usr/bin/env python3
"""
Generate complete problems.ts with solution URLs
Uses the extracted solution PDFs from earlier work
"""

import os
import re
from pathlib import Path

PROBLEMS_DIR = Path("/Users/skyliu/Lingohub/frontend/public/olympiad-problems")

def extract_iol_problems():
    """Extract all IOL problems with solution URLs"""
    problems = []
    iol_dir = PROBLEMS_DIR / "IOL" / "by-year"

    for year in range(2003, 2026):
        if year == 2020:  # IOL 2020 was canceled
            continue

        year_dir = iol_dir / str(year)
        if not year_dir.exists():
            continue

        for problem_num in range(1, 6):
            problem_file = year_dir / f"iol-{year}-i{problem_num}.pdf"
            if not problem_file.exists():
                continue

            # Check if solution file exists
            solution_file = year_dir / f"iol-{year}-i{problem_num}-solution.pdf"
            solution_url = None
            if solution_file.exists():
                solution_url = f"/olympiad-problems/IOL/by-year/{year}/iol-{year}-i{problem_num}-solution.pdf"

            # Difficulty based on problem number (rough estimate)
            difficulty = min(5, 1 + problem_num)  # 2-5 stars
            rating = 1000 + (difficulty * 200) + (year - 2003) * 10

            problems.append({
                'number': f'LH-IOL-{year}-{problem_num}',
                'title': f'IOL {year} Problem {problem_num}',
                'source': 'IOL',
                'year': year,
                'difficulty': difficulty,
                'rating': rating,
                'pdfUrl': f'/olympiad-problems/IOL/by-year/{year}/iol-{year}-i{problem_num}.pdf',
                'solutionUrl': solution_url,
                'content': f'See PDF for problem content.',
                'tags': ['linguistics', 'olympiad'],
            })

    return problems

def extract_aplo_problems():
    """Extract all APLO problems with solution URLs"""
    problems = []
    aplo_dir = PROBLEMS_DIR / "APLO"

    # APLO file pattern: aplo-YEAR-pNUM.pdf
    for pdf_file in sorted(aplo_dir.glob("aplo-*-p*.pdf")):
        match = re.match(r'aplo-(\d{4})-p(\d+)\.pdf', pdf_file.name)
        if not match:
            continue

        year = int(match.group(1))
        problem_num = int(match.group(2))

        # Check if solution file exists
        solution_file = aplo_dir / f"aplo-{year}-p{problem_num}-solution.pdf"
        solution_url = None
        if solution_file.exists():
            solution_url = f"/olympiad-problems/APLO/aplo-{year}-p{problem_num}-solution.pdf"

        # Difficulty estimate
        difficulty = min(5, 1 + (problem_num // 2))
        rating = 1000 + (difficulty * 200) + (year - 2008) * 10

        problems.append({
            'number': f'LH-APLO-{year}-{problem_num}',
            'title': f'APLO {year} Problem {problem_num}',
            'source': 'APLO',
            'year': year,
            'difficulty': difficulty,
            'rating': rating,
            'pdfUrl': f'/olympiad-problems/APLO/aplo-{year}-p{problem_num}.pdf',
            'solutionUrl': solution_url,
            'content': f'See PDF for problem content.',
        })

    return problems

def extract_naclo_problems():
    """Extract all NACLO problems (no solutions extracted yet)"""
    problems = []
    naclo_dir = PROBLEMS_DIR / "NACLO" / "by-year"

    if not naclo_dir.exists():
        return problems

    for year_dir in sorted(naclo_dir.iterdir()):
        if not year_dir.is_dir():
            continue

        try:
            year = int(year_dir.name)
        except ValueError:
            continue

        # NACLO file pattern: naclo-YEAR-LETTER-problem.pdf
        for pdf_file in sorted(year_dir.glob("naclo-*-problem.pdf")):
            match = re.match(r'naclo-(\d{4})-([A-Z])-problem\.pdf', pdf_file.name)
            if not match:
                continue

            letter = match.group(2)

            # Check if solution file exists
            solution_file = year_dir / f"naclo-{year}-{letter}-solution.pdf"
            solution_url = None
            if solution_file.exists():
                solution_url = f"/olympiad-problems/NACLO/by-year/{year}/naclo-{year}-{letter}-solution.pdf"

            # Difficulty based on letter (A=easier, later=harder)
            letter_pos = ord(letter) - ord('A')
            difficulty = min(5, 1 + (letter_pos // 2))
            rating = 1000 + (difficulty * 200) + (year - 2007) * 10

            problems.append({
                'number': f'LH-NACLO-{year}-{letter}',
                'title': f'NACLO {year} Problem {letter}',
                'source': 'NACLO',
                'year': year,
                'difficulty': difficulty,
                'rating': rating,
                'pdfUrl': f'/olympiad-problems/NACLO/by-year/{year}/naclo-{year}-{letter}-problem.pdf',
                'solutionUrl': solution_url,
                'content': f'See PDF for problem content.',
            })

    return problems

def generate_typescript_file(problems):
    """Generate TypeScript file with all problems"""

    ts_content = """// Auto-generated linguistics olympiad problems for seeding
// Generated with solution URLs from extracted PDFs
// Excludes UKLO (needs modifications)

export const problems = [
"""

    for prob in problems:
        # Escape strings properly
        title = prob['title'].replace("'", "\\'")
        content = prob['content'].replace("`", "\\`")
        pdf_url = prob['pdfUrl']
        solution_url = prob.get('solutionUrl')
        tags = prob.get('tags', [])

        ts_content += f"""  {{
    number: '{prob['number']}',
    title: '{title}',
    content: `{content}`,
    source: '{prob['source']}',
    year: {prob['year']},
    difficulty: {prob['difficulty']},
    rating: {prob['rating']},
    pdfUrl: '{pdf_url}',"""

        if solution_url:
            ts_content += f"""
    solutionUrl: '{solution_url}',"""

        if tags:
            ts_content += f"""
    tags: {str(tags).replace("'", '"')},"""

        ts_content += """
  },
"""

    ts_content += """]
"""

    return ts_content

def main():
    print("Extracting problem metadata with solution URLs...")

    iol_problems = extract_iol_problems()
    print(f"✓ IOL: {len(iol_problems)} problems")
    iol_with_solutions = sum(1 for p in iol_problems if p.get('solutionUrl'))
    print(f"  - {iol_with_solutions} with solutions")

    aplo_problems = extract_aplo_problems()
    print(f"✓ APLO: {len(aplo_problems)} problems")
    aplo_with_solutions = sum(1 for p in aplo_problems if p.get('solutionUrl'))
    print(f"  - {aplo_with_solutions} with solutions")

    naclo_problems = extract_naclo_problems()
    print(f"✓ NACLO: {len(naclo_problems)} problems")
    naclo_with_solutions = sum(1 for p in naclo_problems if p.get('solutionUrl'))
    print(f"  - {naclo_with_solutions} with solutions")

    all_problems = iol_problems + aplo_problems + naclo_problems
    total_with_solutions = sum(1 for p in all_problems if p.get('solutionUrl'))
    print(f"\nTotal: {len(all_problems)} problems")
    print(f"With solutions: {total_with_solutions}")

    # Generate TypeScript file
    ts_content = generate_typescript_file(all_problems)

    output_file = Path("/Users/skyliu/Lingohub/backend/src/data/problems.ts")
    output_file.write_text(ts_content)

    print(f"\n✅ Generated {output_file}")
    print(f"   Contains {len(all_problems)} problems")
    print(f"   {total_with_solutions} with solution URLs")

if __name__ == "__main__":
    main()
