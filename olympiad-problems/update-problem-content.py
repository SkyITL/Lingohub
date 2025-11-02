#!/usr/bin/env python3
"""
Update olympiad problems with proper content descriptions and PDF URLs
"""

import json

# Load the test upload file
with open('lingohub-test-upload.json', 'r') as f:
    data = json.load(f)

# Update each problem with a better description
for problem in data['problems']:
    number = problem['number']
    source = problem['source']

    # Create a better content description that tells users to view the PDF
    # but also provides context about what the problem is about
    if source == 'IOL':
        if '2003-1' in number:
            problem['content'] = """# Problem Overview

This problem explores **Transcendental Algebra**, a universal writing system invented by Russian scholar Jacob Linzbach in 1916. The system uses symbols to represent concepts that can be understood by speakers of any language.

## What You'll Do

- Analyze sentences written in Linzbach's symbolic system
- Identify patterns in how concepts are represented
- Translate between English and Transcendental Algebra
- Explain the underlying logic of the system

**📄 View the complete problem in PDF format below**

---
*This is a classic problem testing pattern recognition and logical thinking skills.*"""
        else:
            problem['content'] = f"""# {problem['title']}

This is an official problem from the **International Linguistics Olympiad (IOL) {problem['year']}**.

## About This Problem

Difficulty: {"⭐" * problem['difficulty']} ({problem['difficulty']}/5)

This problem tests your skills in linguistic analysis and pattern recognition.

**📄 Please download or view the PDF below for the complete problem statement.**

---
*IOL problems are known for their clever puzzles involving unfamiliar languages and writing systems.*"""

    elif source == 'NACLO':
        problem['content'] = f"""# {problem['title']}

This is an official problem from the **North American Computational Linguistics Open (NACLO) {problem['year']}**.

## About This Problem

Difficulty: {"⭐" * problem['difficulty']} ({problem['difficulty']}/5)

NACLO problems combine linguistics with logic puzzles and computational thinking.

**📄 Please download or view the PDF below for the complete problem statement and solution.**

---
*NACLO is designed to introduce students to computational linguistics through engaging puzzles.*"""

    elif source == 'APLO':
        problem['content'] = f"""# {problem['title']}

This is an official problem from the **Asia-Pacific Linguistics Olympiad (APLO) {problem['year']}**.

## About This Problem

Difficulty: {"⭐" * problem['difficulty']} ({problem['difficulty']}/5)

APLO problems focus on languages from the Asia-Pacific region and test analytical skills.

**📄 Please download or view the PDF below for the complete problem statement.**

---
*APLO showcases the linguistic diversity of the Asia-Pacific region.*"""

    elif source == 'UKLO':
        problem['content'] = f"""# {problem['title']}

This is an official problem from the **UK Linguistics Olympiad (UKLO) {problem['year']}**.

## About This Problem

Difficulty: {"⭐" * problem['difficulty']} ({problem['difficulty']}/5)

UKLO problems are designed to be accessible while still challenging students' linguistic reasoning.

**📄 Please download or view the PDF below for the complete problem statement.**

---
*UKLO problems range from beginner-friendly to advanced linguistic puzzles.*"""

    # Fix PDF URL to be absolute path for frontend
    if problem.get('pdfUrl'):
        # Remove leading slash if present, we'll add it in frontend
        pdf_path = problem['pdfUrl'].lstrip('/')
        problem['pdfUrl'] = pdf_path

# Save updated file
with open('lingohub-test-upload-updated.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"✅ Updated {len(data['problems'])} problems")
print("📄 Saved to: lingohub-test-upload-updated.json")
