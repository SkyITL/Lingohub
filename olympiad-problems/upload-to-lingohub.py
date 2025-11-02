#!/usr/bin/env python3
"""
Upload Script for Olympiad Problems to LingoHub

This script reads all labeled problems from JSON files and prepares them
for upload to the LingoHub database.

Usage:
    python3 upload-to-lingohub.py --dry-run  # Preview without uploading
    python3 upload-to-lingohub.py --upload   # Actually upload to database
"""

import json
import os
import sys
from typing import List, Dict, Any
from pathlib import Path

# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def load_olympiad_labels(olympiad_dir: str, filename: str) -> Dict[str, Any]:
    """Load label file for an olympiad"""
    filepath = Path(olympiad_dir) / filename
    if not filepath.exists():
        print(f"{Colors.RED}❌ File not found: {filepath}{Colors.END}")
        return None
    
    with open(filepath, 'r') as f:
        return json.load(f)

def map_difficulty_to_stars(difficulty: int) -> int:
    """Map difficulty (1-5) to star rating (1-5)"""
    return difficulty

def map_difficulty_to_rating(difficulty: int) -> int:
    """Map difficulty to complexity rating (1000-2400)"""
    # 1 -> 1200, 2 -> 1400, 3 -> 1600, 4 -> 1800, 5 -> 2000
    return 1000 + (difficulty * 200)

def convert_iol_problem(problem: Dict[str, Any]) -> Dict[str, Any]:
    """Convert IOL problem to LingoHub format"""
    year = problem['year']
    num = problem['number']
    
    return {
        'number': f"LH-IOL-{year}-{num}",
        'title': f"IOL {year} Problem {num}: {problem.get('language', 'Unknown')}",
        'source': 'IOL',
        'year': year,
        'difficulty': map_difficulty_to_stars(problem['estimated_difficulty']),
        'rating': map_difficulty_to_rating(problem['estimated_difficulty']),
        'tags': problem['tags'],
        'content': f"See PDF: {problem['file']}",
        'solution': f"See solution file (if available)",
        'pdfUrl': f"/olympiad-problems/IOL/{problem['file']}",
        'metadata': {
            'language': problem.get('language', 'Unknown'),
            'family': problem.get('family', 'unknown'),
            'original_id': problem['id']
        }
    }

def convert_aplo_problem(problem: Dict[str, Any]) -> Dict[str, Any]:
    """Convert APLO problem to LingoHub format"""
    year = problem['year']
    num = problem['number']
    
    return {
        'number': f"LH-APLO-{year}-{num}",
        'title': f"APLO {year} Problem {num}",
        'source': 'APLO',
        'year': year,
        'difficulty': map_difficulty_to_stars(problem['estimated_difficulty']),
        'rating': map_difficulty_to_rating(problem['estimated_difficulty']),
        'tags': problem['tags'],
        'content': f"See PDF: {problem['file']}",
        'solution': f"See solution file (if available)",
        'pdfUrl': f"/olympiad-problems/APLO/{problem['file']}",
        'metadata': {
            'language': problem.get('language', 'TBD'),
            'original_id': problem['id']
        }
    }

def convert_naclo_problem(problem: Dict[str, Any]) -> Dict[str, Any]:
    """Convert NACLO problem to LingoHub format"""
    year = problem['year']
    letter = problem['number']
    
    return {
        'number': f"LH-NACLO-{year}-{letter}",
        'title': f"NACLO {year} Problem {letter}",
        'source': 'NACLO',
        'year': year,
        'difficulty': map_difficulty_to_stars(problem['estimated_difficulty']),
        'rating': map_difficulty_to_rating(problem['estimated_difficulty']),
        'tags': problem['tags'],
        'content': f"See PDF: {problem['file']}",
        'solution': f"See solution: {problem.get('solution_file', 'N/A')}",
        'pdfUrl': f"/olympiad-problems/NACLO/{problem['file']}",
        'metadata': {
            'original_id': problem['id']
        }
    }

def convert_uklo_problem(problem: Dict[str, Any]) -> Dict[str, Any]:
    """Convert UKLO problem to LingoHub format"""
    year = problem['year']
    number = problem['number'].replace('#', '').replace(' ', '-')
    
    return {
        'number': f"LH-UKLO-{year}-{number}",
        'title': f"UKLO {year} {problem['number']}: {problem.get('language', 'Unknown')}",
        'source': 'UKLO',
        'year': year,
        'difficulty': map_difficulty_to_stars(problem['estimated_difficulty']),
        'rating': map_difficulty_to_rating(problem['estimated_difficulty']),
        'tags': problem['tags'],
        'content': f"See PDF: {problem['file']}",
        'solution': f"See solution file (if available)",
        'pdfUrl': f"/olympiad-problems/UKLO/{problem['file']}",
        'metadata': {
            'language': problem.get('language', 'Unknown'),
            'area': problem.get('area', 'general'),
            'author': problem.get('author', 'Unknown'),
            'difficulty_raw': problem.get('difficulty_raw'),
            'original_id': problem['id']
        }
    }

def main():
    print(f"\n{Colors.BOLD}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}LingoHub Olympiad Problems Upload Script{Colors.END}")
    print(f"{Colors.BOLD}{'='*60}{Colors.END}\n")
    
    # Check if dry-run or upload mode
    dry_run = '--dry-run' in sys.argv or '--upload' not in sys.argv
    
    if dry_run:
        print(f"{Colors.YELLOW}🔍 Running in DRY-RUN mode (no actual upload){Colors.END}\n")
    else:
        print(f"{Colors.RED}⚠️  Running in UPLOAD mode - will upload to database!{Colors.END}\n")
    
    all_problems = []
    
    # Load IOL problems
    print(f"{Colors.BLUE}📁 Loading IOL problems...{Colors.END}")
    iol_data = load_olympiad_labels('IOL', 'iol-problems-labeled.json')
    if iol_data:
        iol_problems = [convert_iol_problem(p) for p in iol_data['problems']]
        all_problems.extend(iol_problems)
        print(f"{Colors.GREEN}   ✓ Loaded {len(iol_problems)} IOL problems{Colors.END}")
    
    # Load APLO problems
    print(f"{Colors.BLUE}📁 Loading APLO problems...{Colors.END}")
    aplo_data = load_olympiad_labels('APLO', 'aplo-problems-labeled.json')
    if aplo_data:
        aplo_problems = [convert_aplo_problem(p) for p in aplo_data['problems']]
        all_problems.extend(aplo_problems)
        print(f"{Colors.GREEN}   ✓ Loaded {len(aplo_problems)} APLO problems{Colors.END}")
    
    # Load NACLO problems
    print(f"{Colors.BLUE}📁 Loading NACLO problems...{Colors.END}")
    naclo_data = load_olympiad_labels('NACLO', 'naclo-problems-labeled.json')
    if naclo_data:
        naclo_problems = [convert_naclo_problem(p) for p in naclo_data['problems']]
        all_problems.extend(naclo_problems)
        print(f"{Colors.GREEN}   ✓ Loaded {len(naclo_problems)} NACLO problems{Colors.END}")
    
    # Load UKLO problems
    print(f"{Colors.BLUE}📁 Loading UKLO problems...{Colors.END}")
    uklo_data = load_olympiad_labels('UKLO', 'uklo-problems-labeled.json')
    if uklo_data:
        uklo_problems = [convert_uklo_problem(p) for p in uklo_data['problems']]
        all_problems.extend(uklo_problems)
        print(f"{Colors.GREEN}   ✓ Loaded {len(uklo_problems)} UKLO problems{Colors.END}")
    
    # Summary statistics
    print(f"\n{Colors.BOLD}📊 Summary:{Colors.END}")
    print(f"   Total problems: {Colors.BOLD}{len(all_problems)}{Colors.END}")
    
    # Difficulty distribution
    diff_dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for p in all_problems:
        diff_dist[p['difficulty']] += 1
    
    print(f"\n   Difficulty distribution (1-5):")
    for diff in sorted(diff_dist.keys()):
        print(f"     Level {diff}: {diff_dist[diff]} problems")
    
    # Save to output file
    output_file = 'lingohub-olympiad-problems.json'
    with open(output_file, 'w') as f:
        json.dump({
            'metadata': {
                'total_problems': len(all_problems),
                'generated_at': '2025-11-02',
                'format_version': '1.0'
            },
            'problems': all_problems
        }, f, indent=2)
    
    print(f"\n{Colors.GREEN}✅ Saved to: {output_file}{Colors.END}")
    
    if dry_run:
        print(f"\n{Colors.YELLOW}💡 To actually upload, run:{Colors.END}")
        print(f"   python3 upload-to-lingohub.py --upload")
    else:
        print(f"\n{Colors.RED}🚀 Would upload to database here...{Colors.END}")
        print(f"   (Database upload logic not yet implemented)")
    
    print(f"\n{Colors.BOLD}{'='*60}{Colors.END}\n")

if __name__ == '__main__':
    main()
