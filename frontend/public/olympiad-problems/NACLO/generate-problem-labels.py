#!/usr/bin/env python3
"""
Generate comprehensive labels for all NACLO problems
Based on:
- Problem position (A=easy, R=hard)
- Common NACLO problem patterns
- Linguistic subdisciplines
"""

import json
import os
from pathlib import Path

# Tag pools for different difficulty levels
BEGINNER_TAGS = {
    'areas': ['morphology', 'phonology', 'syntax'],
    'types': ['pattern-recognition', 'translation'],
}

INTERMEDIATE_TAGS = {
    'areas': ['morphology', 'phonology', 'syntax', 'writing-systems', 'semantics'],
    'types': ['pattern-recognition', 'rule-formulation', 'translation', 'paradigm'],
}

ADVANCED_TAGS = {
    'areas': ['morphology', 'syntax', 'historical-linguistics', 'computational', 'comparative-linguistics'],
    'types': ['rule-formulation', 'reconstruction', 'algorithm-design', 'decipherment'],
}

# Heuristic mapping: letter -> difficulty
def get_difficulty_from_letter(letter):
    """Map problem letter to estimated difficulty (1-4)"""
    position = ord(letter) - ord('A')  # A=0, B=1, etc.

    if position < 4:  # A-D
        return 1, 'beginner'
    elif position < 8:  # E-H
        return 2, 'beginner-intermediate'
    elif position < 12:  # I-L
        return 2, 'intermediate'
    elif position < 16:  # M-P
        return 3, 'intermediate-advanced'
    else:  # Q-R+
        return 3, 'advanced'

def generate_tags(letter, year):
    """Generate appropriate tags based on problem characteristics"""
    difficulty_num, difficulty_label = get_difficulty_from_letter(letter)

    # Select tag pool based on difficulty
    if difficulty_num == 1:
        pool = BEGINNER_TAGS
    elif difficulty_num == 2:
        pool = INTERMEDIATE_TAGS
    else:
        pool = ADVANCED_TAGS

    # Distribute tags across problems
    position = ord(letter) - ord('A')

    # Linguistic area (cycle through options)
    area_idx = position % len(pool['areas'])
    area = pool['areas'][area_idx]

    # Problem type (alternate)
    type_idx = position % len(pool['types'])
    prob_type = pool['types'][type_idx]

    tags = [area, prob_type, difficulty_label.split('-')[-1]]  # Just last part of difficulty

    return tags, difficulty_num

def generate_all_problems():
    """Generate entries for all NACLO problems"""

    problems = []

    # Year to letter count mapping
    year_letters = {
        2007: 8, 2008: 12, 2009: 13, 2010: 16, 2011: 14,
        2012: 18, 2013: 18, 2014: 17, 2015: 16, 2016: 18,
        2017: 18, 2018: 18, 2019: 18, 2020: 18, 2021: 19,
        2022: 18, 2023: 17, 2025: 16
    }

    problem_count = 0

    for year, max_letters in sorted(year_letters.items()):
        for i in range(max_letters):
            letter = chr(ord('A') + i)
            problem_id = f"N{year}-{letter}"

            tags, difficulty = generate_tags(letter, year)

            problem = {
                "id": problem_id,
                "year": year,
                "number": letter,
                "title": f"Problem {letter}",  # Placeholder - should be filled from actual PDFs
                "file": f"by-year/{year}/naclo-{year}-{letter}-problem.pdf",
                "solution_file": f"by-year/{year}/naclo-{year}-{letter}-solution.pdf",
                "tags": tags,
                "estimated_difficulty": difficulty,
                "status": "auto-generated",
                "notes": "Tags auto-generated based on heuristics. Requires manual verification."
            }

            problems.append(problem)
            problem_count += 1

    return problems, problem_count

def main():
    """Generate complete NACLO problem database"""

    print("Generating NACLO problem labels...")
    print()

    problems, count = generate_all_problems()

    # Create complete database
    database = {
        "metadata": {
            "version": "1.0",
            "last_updated": "2025-11-02",
            "total_problems": count,
            "years": "2007-2025 (excluding 2024)",
            "description": "Comprehensive database of NACLO problems with linguistic tags",
            "status": "Auto-generated with heuristics - requires manual verification"
        },
        "taxonomy": {
            "linguistic_areas": [
                "phonology", "morphology", "syntax", "semantics", "pragmatics",
                "writing-systems", "historical-linguistics", "computational",
                "sociolinguistics", "comparative-linguistics"
            ],
            "problem_types": [
                "pattern-recognition", "rule-formulation", "translation",
                "reconstruction", "decipherment", "algorithm-design", "paradigm"
            ],
            "difficulty_levels": ["beginner", "intermediate", "advanced", "expert"],
            "language_families": [
                "germanic", "romance", "slavic", "indo-iranian", "celtic",
                "semitic", "bantu", "chinese", "austronesian", "turkic",
                "finno-ugric", "algonquian", "uto-aztecan", "dravidian",
                "japonic", "koreanic", "isolates", "constructed"
            ]
        },
        "problems": problems,
        "labeling_guidelines": {
            "difficulty_progression": {
                "A-D": "typically beginner (difficulty 1)",
                "E-H": "typically beginner-intermediate (difficulty 2)",
                "I-L": "typically intermediate (difficulty 2-3)",
                "M-P": "typically intermediate-advanced (difficulty 3)",
                "Q-S": "typically advanced (difficulty 3-4)"
            },
            "common_naclo_topics": {
                "morphology": "Noun classes, verb conjugation, case systems, derivation",
                "phonology": "Sound patterns, phonotactics, tone, vowel/consonant harmony",
                "syntax": "Word order, agreement, grammatical relations, constituent structure",
                "writing-systems": "Scripts, orthography, character systems, transliteration",
                "computational": "Algorithms, formal grammars, text processing, coding",
                "semantics": "Meaning relations, semantic roles, compositionality",
                "historical-linguistics": "Sound change, reconstruction, cognates, etymology"
            },
            "manual_refinement_needed": [
                "Problem titles (extract from PDFs)",
                "Specific language families (requires reading problem content)",
                "Additional specialized tags (e.g., 'multiple-languages', 'diachronic')",
                "Actual difficulty ratings (may vary from estimates)"
            ]
        },
        "statistics": {
            "by_difficulty": {
                "1_beginner": len([p for p in problems if p['estimated_difficulty'] == 1]),
                "2_intermediate": len([p for p in problems if p['estimated_difficulty'] == 2]),
                "3_advanced": len([p for p in problems if p['estimated_difficulty'] == 3]),
                "4_expert": len([p for p in problems if p['estimated_difficulty'] == 4])
            },
            "by_year": {}
        }
    }

    # Calculate year statistics
    for year in range(2007, 2026):
        if year == 2024:
            continue
        year_problems = [p for p in problems if p['year'] == year]
        if year_problems:
            database['statistics']['by_year'][str(year)] = len(year_problems)

    # Write to file
    output_file = 'naclo-problems-labeled.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(database, f, indent=2, ensure_ascii=False)

    print(f"✅ Generated {count} problem entries")
    print(f"📁 Saved to: {output_file}")
    print()
    print("Statistics:")
    print(f"  Beginner problems:     {database['statistics']['by_difficulty']['1_beginner']}")
    print(f"  Intermediate problems: {database['statistics']['by_difficulty']['2_intermediate']}")
    print(f"  Advanced problems:     {database['statistics']['by_difficulty']['3_advanced']}")
    print(f"  Expert problems:       {database['statistics']['by_difficulty']['4_expert']}")
    print()
    print("⚠️  Note: These are auto-generated labels based on heuristics.")
    print("   Manual verification and refinement recommended.")

if __name__ == '__main__':
    main()
