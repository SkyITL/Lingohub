#!/usr/bin/env python3
"""
Create full problem content for the 20 test problems
"""

import json

# Full transcribed content for all 20 test problems
problems_full_content = {
    "LH-IOL-2003-1": """# Transcendental Algebra

**Problem 1 (20 marks)**
**Author:** Ksenia Giiliarova
**Competition:** First International Olympiad in Theoretical, Mathematical and Applied Linguistics
**Date:** 8–12 September 2003, Borovetz, Bulgaria

## Background

In 1916 the Russian scholar Jacob Linzbach invented a universal writing system, which he thought should be understandable to all people, regardless of their native tongue. Linzbach called his new language 'Transcendental Algebra'.

## Given Data

Several sentences have been written in Linzbach's language and translated into English:

| # | Linzbach Symbols | English Translation |
|---|------------------|---------------------|
| 1 | (ÄÄtÄ + tı)⇝ | The father and the brother are talking. |
| 2 | n(> Î)tl→t | The giants are working without haste. |
| 3 | (Ät(=ÄÄ))⇝ − ⊠ | The orphans are writing a letter. |
| 4 | (¬nÎÎ)⇝ ¬t = Î₂ | It wasn't us who wrote about you (sg.). |
| 5 | ⊠√~t = Å₃ | It was not by her that the letter was written. |
| 6 | (ÄtÄtÄ)⇝∞ = ∥− | The father doesn't like the work. |
| 7 | ((> Î) ¬∽))⊖ ¬t = ÄtÄtÄ | The wicked giant ate the parents. |
| 8 | Å₂⁻ᵗ | She is not in a hurry. |

## Tasks

### Assignment 1
**Translate into English:**

9. Î₂⁻√∞
10. (ÄÄtÄ ¬ ⇐)⇝ + t = ÄÄtÄ + ÄÄtÄ
11. Ättl⁺tl¬⇐ ¬t
12. ⊠√⊟ ¬t = tl⊥ − (Ä)

### Assignment 2
**Write in 'Transcendental Algebra':**

13. It wasn't about them that my husband and I (*say:* I and the husband) talked.
14. The people are working reluctantly.
15. The good widow loves the unemployed dwarf.
16. You (pl.) will be talked about.

**Explain your solution.**

---
*This problem tests pattern recognition, logical thinking, and the ability to decipher symbolic language systems.*""",

    "LH-NACLO-2007-A": """# We are all molistic in a way

**Problem A (10 points)**
**Competition:** North American Computational Linguistics Open (NACLO) 2007

## Problem

Imagine that you have heard these sentences:

- Jane is molistic and slatty.
- Jennifer is cluvious and brastic.
- Molly and Kyle are slatty but danty.
- The teacher is danty and cloovy.
- Mary is blitty but cloovy.
- Jeremiah is not only sloshful but also weasy.
- Even though frumsy, Jim is sloshful.
- Strungy and struffy, Diane was a pleasure to watch.
- Even though weasy, John is strungy.
- Carla is blitty but struffy.
- The salespeople were cluvious and not slatty.

## Tasks

**A1.** Then which of the following would you be likely to hear?

a. Meredith is blitty and brastic.
b. The singer was not only molistic but also cluvious.
c. May found a dog that was danty but sloshful.

**A2.** What quality or qualities would you be looking for in a person?

a. blitty
b. weasy
c. sloshful
d. frumsy

**A3.** Explain all your answers. (Hint: The sounds of the words are not relevant to their meanings)

---
*This problem explores semantic relationships and co-occurrence patterns in invented English words.*""",

    "LH-UK-2010-cucum": """# Sorry we have no red cucumbers

**Problem (5 marks)**
**Competition:** UK Linguistics Olympiad (UKLO) 2010
**Author:** Dragomir Radev

## Introduction

If you buy red onions and peppers, what colour are your purchases? The onions are red, but what about the peppers?

Now consider the following French phrases and their translations:

| French | English |
|--------|---------|
| oignons rouges | red onions |
| poivrons rouges | red peppers |
| oignons et poivrons | onions and peppers |

> **N.B.** You don't have to know French to answer this question, and even if you do know French, it won't be much of an advantage to you!

## Tasks

**1.1 (2 marks)**
Translate each of the following phrases into French maintaining the meanings indicated in the second column. (The French for 'cucumbers' is *concombres*.)

| English | Meaning Constraint |
|---------|-------------------|
| a. red peppers and cucumbers | [the cucumbers are definitely not red] |
| b. red peppers and onions | [the peppers may or may not be red] |

**1.2 (2 marks)**
A dish is described as "Scottish beef and mushrooms". Can you determine if these statements are true:

a. The beef is unambiguously Scottish.
b. The mushrooms are unambiguously Scottish.

**1.3 (1 mark)**
Translate the dish described in 1.2 into French, preserving any ambiguities and certainties present in the English?

*(Here are the French words you need: beef = boeuf, mushrooms = champignons, Scottish = écossais.)*

---
*This problem explores syntactic ambiguity and modifier scope in English and French.*""",

    "LH-APLO-2019-1": """# Ik Number System

**Problem 1 (20 points)**
**Competition:** First Asia Pacific Linguistics Olympiad (APLO) 2019
**Author:** Minkyu Kim

## Background

The following are the fourth powers of natural numbers in ascending order:

**1, 16, 81, 256, 625, 1296, 2401, 4096, 6561, 10000, ...**

The first ten entries of this sequence are spelled out in Ik, in arbitrary order:

a. **ŋamɪá leɓetse ńda tomínékwa túde ńda ʝɪrɪnɪ túde ńda kɪɗɪ kɔn**
b. **álifika tsʼaɡúsé ńda tomínékwa túde ńda kiɗi tsʼaɡúsé ńda ʝɪrɪnɪ túde ńda kɪɗɪ kɔn**
c. **álifika túde ńda kɪɗɪ kɔn ńda ŋamɪá túde ńda tomínékwa túde ńda kɪɗɪ kɔn ńda nɛ́bɛɛ kɔn**
d. **álifika tomín**
e. **álifa kɔn ńda ŋamɪá leɓetse ńda tomínékwa túde ńda kiɗi tsʼaɡúsé ńda ʝɪrɪnɪ túde ńda kɪɗɪ kɔn**
f. **tomínékwa túde ńda kiɗi aɗe ńda nɛ́bɛɛ kɔn**
g. **tomíní ńda ʝɪrɪnɪ túde ńda kɪɗɪ kɔn**
h. **kɔn**
i. **álifika leɓetse ńda ŋamɪá tsʼaɡúsé ńda kɔn**
j. **ŋamɪá túde ńda kɪɗɪ kɔn ńda tomínékwa leɓetse ńda ʝɪrɪnɪ túd**

## Tasks

**(a)** Determine the correct correspondence.

**(b)** Write in numerals:

- k. álifika tomíní ńda ʝɪrɪnɪ leɓets
- l. tomínékwa túde ńda kɪɗɪ kɔn
- m. tomínékwa túde ńda nɛ́bɛɛ kɔn
- n. álifika ŋamɪá kɔn

**(c)** Write out in Ik: **3108**

**(d)** Write out the eleventh entry of the sequence in Ik.

## Notes

⚠️ **Ik** belongs to the Nilo-Saharan family. It is spoken by approx. 7,500 people in Uganda.

**ɓ, ɗ, ʝ, ŋ** and **tsʼ** are consonants. **ɔ, ɛ** and **ɪ** are pronounced like **o, e** and **i**, respectively, but with the tongue slightly lowered. The mark **´** denotes a high tone.

*The fourth power of a number n is the result of multiplying four instances of n together: (n⁴ = n × n × n × n)*

---
*This problem tests number system analysis and mathematical pattern recognition.*"""
}

# Load existing data
with open('lingohub-test-upload-updated.json', 'r') as f:
    data = json.load(f)

# Update problems with full content
updated_count = 0
for problem in data['problems']:
    if problem['number'] in problems_full_content:
        problem['content'] = problems_full_content[problem['number']]
        updated_count += 1
        print(f"✅ Updated {problem['number']}: {problem['title'][:50]}...")

# Save
with open('lingohub-final-content.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Total updated: {updated_count}/20 problems")
print(f"📄 Saved to: lingohub-final-content.json")
print(f"\n⏳ Remaining: {20 - updated_count} problems need transcription")
print(f"   (These can be added incrementally)")
