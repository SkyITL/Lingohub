# APLO 2023 - Problem 3: Kobon

## Metadata

- **Problem ID**: APLO-2023-P3
- **Year**: 2023
- **Contest**: 5th Asia Pacific Linguistics Olympiad
- **Points**: 20
- **Authors**: Vlad A. Neacșu, Michał Boroń

## Language Information

- **Language**: Kobon
- **Family**: Trans-New Guinea → Madang
- **Speakers**: ~10,000
- **Location**: Papua New Guinea

## Skill Tags

### Core Subfields
- `number-systems` (数字系统)
- `morphology` (形态学)

### Specific Topics
- `body-part-counting` (身体部位计数)
- `base-systems` (进制系统)
- `mixed-base` (混合进制)
- `numeral-formation` (数词构成)

### Language Family
- `trans-new-guinea` (跨新几内亚语系)

### Difficulty
- `intermediate-advanced` (中高级)

### Problem-Solving Skills
- `pattern-recognition` (模式识别)
- `logical-deduction` (逻辑推理)
- `mathematical-reasoning` (数学推理)
- `ambiguity-resolution` (歧义消解)

## Problem Description

Here are some numerals in Kobon and their values. Some of the numbers can be expressed in Kobon in two different ways, only one of which is given:

| Number | Kobon Expression |
|--------|-----------------|
| 1 | **wañɨg nɨbö** |
| 4 | **yɨgwo mɨlö** |
| 7 | **mudun** |
| 11 | **agɨp** |
| 17 | **mudun böŋ daŋ** |
| 18 | **kagoł böŋ daŋ** |
| 21 | **yɨgwo aŋ nɨbö böŋ daŋ** |
| 22 | **ñɨnjuöl ado gɨ da yɨgwo** |
| 25 | **ñɨnjuöl ado gɨ da mamɨd** |
| 46 | **ñɨnjuöl mɨhöp ado gɨ da kagoł** |
| 60 | **ñɨnjuöl mɨhöp ado gɨ da yɨgwo mɨlö böŋ daŋ** |

### Task (a)
Write the following equality in digits:

**yɨgwo × ñɨnjuöl ado gɨ da kagoł böŋ daŋ = ñɨnjuöl mɨhau nɨgaŋ ado gɨ da raleb böŋ daŋ**

### Task (b)
Write in Kobon in all possible ways: **8**, **19**, **23**, **53**, **61**, **66**

## Notes

- Kobon belongs to the Madang branch of the Trans-New Guinea family.
- It is spoken by approx. 10,000 people in Papua New Guinea.

## Linguistic Insights

This problem tests:
1. **Body-Part Counting System**: Understanding how body parts are used as the basis for counting
2. **Mixed-Base System**: Recognizing the combination of different numerical bases
3. **Alternative Expressions**: Some numbers can be expressed in multiple equivalent ways
4. **Morphological Composition**: Understanding how complex numerals are built from components

## Key Patterns to Discover

### Basic Numbers (Body Parts):
The Kobon counting system is based on body parts, progressing through different parts of the body:

- **1**: wañɨg nɨbö (possibly "one finger/hand small")
- **4**: yɨgwo mɨlö (possibly "hand/fingers complete")
- **7**: mudun (possibly at elbow or wrist)
- **11**: agɨp (possibly at shoulder or other body part)

### Larger Number Formation:
- **ñɨnjuöl**: A base unit (appears to be a person/cycle = 22)
- **ado gɨ da**: Connective phrase meaning "and" or "plus"
- **böŋ daŋ**: Appears in numbers like 17, 18, 21, indicating a specific counting position

### Patterns:
- **17** = mudun böŋ daŋ = 7 + (something involving 10)
- **18** = kagoł böŋ daŋ = 8 + (something involving 10)
- **21** = yɨgwo aŋ nɨbö böŋ daŋ = 4 + 1 + (something involving 10) = possibly 10 + 10 + 1

### Base System Analysis:
From **22** = ñɨnjuöl ado gɨ da yɨgwo:
- ñɨnjuöl = 22 - 4 = 18? Or ñɨnjuöl represents one complete cycle?
- Looking at **25** = ñɨnjuöl ado gɨ da mamɨd
  - If ñɨnjuöl = 22, then mamɨd = 3? But we don't have 3 in the data...
  - Alternative: mamɨd could be related to a body part count

- **46** = ñɨnjuöl mɨhöp ado gɨ da kagoł
  - mɨhöp appears to be a multiplier (2×22 = 44, plus kagoł)

- **60** = ñɨnjuöl mɨhöp ado gɨ da yɨgwo mɨlö böŋ daŋ
  - If this is 2×22 + (4 + something) = 44 + 16? That gives 60, so böŋ daŋ might mean "plus 10"

### Likely Structure:
The system appears to use:
- **Base 22** (one complete body count cycle = ñɨnjuöl)
- **Multiples of 22**: mɨhöp (2×), mɨhau (3×?), nɨgaŋ (positions?)
- **Smaller additions**: Using body part terms for 1-21
- **böŋ daŋ**: Likely means "plus 10" or indicates the second decade

### Alternative Expressions:
Some numbers can be expressed:
1. Using direct body part terms
2. Using base-22 arithmetic
3. Using different decade markers

## Difficulty Analysis

**Level**: Intermediate-Advanced

**Reasoning**:
- Complex mixed-base system (body parts + base 22)
- Multiple alternative ways to express some numbers
- Requires algebraic reasoning to solve for unknown values
- Need to identify both the counting cycle and the body part progression
- Cultural knowledge about body-part counting systems helps
- More complex than simple base-10 or base-20 systems

## Related Skills (Luogu-style)

If this were on Luogu, it might be tagged with:
- 数学 (Mathematics)
- 进制转换 (Base Conversion)
- 混合进制 (Mixed Base Systems)
- 身体部位计数 (Body-Part Counting)
- 代数推理 (Algebraic Reasoning)
- 一词多义 (Multiple Expressions)
- 文化数学 (Cultural Mathematics)
