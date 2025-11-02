#!/usr/bin/env python3
"""
Generate final problems.ts by combining:
1. Rich metadata (tags, titles, etc.) from lingohub-olympiad-problems.json
2. Solution URLs from extracted PDF files
"""

import json
from pathlib import Path

JSON_FILE = Path("/Users/skyliu/Lingohub/olympiad-problems/lingohub-olympiad-problems.json")
PROBLEMS_DIR = Path("/Users/skyliu/Lingohub/frontend/public/olympiad-problems")
OUTPUT_FILE = Path("/Users/skyliu/Lingohub/backend/src/data/problems.ts")

def check_solution_exists(problem):
    """Check if solution PDF exists for a problem"""
    source = problem['source']
    number = problem['number']

    # Extract year and problem identifier from number (e.g., LH-IOL-2003-1)
    parts = number.split('-')
    if len(parts) < 4:
        return None

    year = parts[2]
    prob_id = parts[3]

    if source == 'IOL':
        solution_file = PROBLEMS_DIR / "IOL" / "by-year" / year / f"iol-{year}-i{prob_id}-solution.pdf"
        if solution_file.exists():
            return f"/olympiad-problems/IOL/by-year/{year}/iol-{year}-i{prob_id}-solution.pdf"

    elif source == 'APLO':
        solution_file = PROBLEMS_DIR / "APLO" / f"aplo-{year}-p{prob_id}-solution.pdf"
        if solution_file.exists():
            return f"/olympiad-problems/APLO/aplo-{year}-p{prob_id}-solution.pdf"

    elif source == 'NACLO':
        solution_file = PROBLEMS_DIR / "NACLO" / "by-year" / year / f"naclo-{year}-{prob_id}-solution.pdf"
        if solution_file.exists():
            return f"/olympiad-problems/NACLO/by-year/{year}/naclo-{year}-{prob_id}-solution.pdf"

    return None

def main():
    # Load JSON with rich metadata
    with open(JSON_FILE) as f:
        data = json.load(f)

    problems = data['problems']

    # Filter out UKLO problems
    filtered_problems = [p for p in problems if p['source'] != 'UKLO']

    print(f"Total problems in JSON: {len(problems)}")
    print(f"After excluding UKLO: {len(filtered_problems)}")

    # Add solution URLs by checking actual files
    problems_with_solutions = 0
    for prob in filtered_problems:
        solution_url = check_solution_exists(prob)
        if solution_url:
            prob['solutionUrl'] = solution_url
            problems_with_solutions += 1

    print(f"Problems with solution PDFs: {problems_with_solutions}")

    # Generate TypeScript content
    ts_content = """// Auto-generated linguistics olympiad problems for seeding
// Metadata from lingohub-olympiad-problems.json
// Solution URLs from extracted PDF files
// Excludes UKLO (needs modifications)

export const problems = [
"""

    for prob in filtered_problems:
        # Escape special characters in strings
        title = prob['title'].replace("'", "\\'")
        content = prob['content'].replace("`", "\\`")
        tags = prob.get('tags', [])
        pdf_url = prob.get('pdfUrl', '')
        solution_url = prob.get('solutionUrl')

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

        ts_content += f"""
    tags: {json.dumps(tags)},
  }},
"""

    ts_content += """]
"""

    # Write output
    OUTPUT_FILE.write_text(ts_content)

    print(f"\n✅ Generated {OUTPUT_FILE}")
    print(f"   Contains {len(filtered_problems)} problems")
    print(f"   {problems_with_solutions} with solution URLs")

    # Show breakdown
    sources = {}
    for p in filtered_problems:
        sources[p['source']] = sources.get(p['source'], 0) + 1

    print("\nBreakdown:")
    for source, count in sorted(sources.items()):
        print(f"  {source}: {count} problems")

if __name__ == "__main__":
    main()
