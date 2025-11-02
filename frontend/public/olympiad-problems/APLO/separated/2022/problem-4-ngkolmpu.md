# APLO 2022 - Problem 4: Ngkolmpu

## Metadata

- **Problem ID**: APLO-2022-P4
- **Year**: 2022
- **Contest**: 4th Asia Pacific Linguistics Olympiad
- **Points**: 20
- **Authors**: Ji Hun Wang, Minkyu Kim

## Language Information

- **Language**: Ngkolmpu
- **Family**: Yam
- **Speakers**: ~100
- **Location**: Papua province, Indonesia

## Skill Tags

### Core Subfields
- `number-systems` (数字系统)
- `morphology` (形态学)

### Specific Topics
- `base-systems` (进制系统)
- `mixed-base` (混合进制)
- `ambiguity` (歧义)
- `numeral-formation` (数词构成)

### Language Family
- `yam` (亚姆语系)

### Difficulty
- `advanced` (高级)

### Problem-Solving Skills
- `logical-deduction` (逻辑推理)
- `mathematical-reasoning` (数学推理)
- `ambiguity-resolution` (歧义消解)
- `pattern-recognition` (模式识别)

## Problem Description

Here are some Ngkolmpu numbers:

| Value | Ngkolmpu Expression |
|-------|-------------------|
| 1 | **aempy** |
| 8 | **ynaoaempy ptae** |
| 17 | **tamp tarwmpao** |
| 21 | **ylla ntamnao** |
| 35 | **tamp ptae wramaekr** |
| 64 | **eser wramaekr ptae** |
| 167 | **tamp ntamnao ptae eser** |
| 294 | **tarwmpao ptae ptae ynaoaempy** |
| 504 | **tarwmpao ynaoaempy ptae ynaoaempy** |

### Task (a)
Two of the Ngkolmpu numbers above can each be interpreted one additional way not given.

- Which are these numbers?
- What are their alternative interpretations?

### Task (b)
Below are some arithmetic equalities expressed in Ngkolmpu. All numbers that appear in the equalities are positive integers.

**[1]** **tamp ptae wramaekr ptae tamp** − **eser ntamnao** = **(A)**

**[2]** **ylla ptae ylla** + **(B)** = **tarwmpao**

**[3]** **ntamnao ptae** × **eser wramaekr** = **ntamnao ntamnao** + **(C)**

Fill in the blanks (A–C) and write the equalities in numerals.

**Note**: **(C) < 200**

### Task (c)
Give all possible interpretations of the following number:

**tarwmpao ylla ptae**

## Notes

- Ngkolmpu belongs to the Yam family.
- It is spoken by approx. 100 people in Papua province, Indonesia.

## Linguistic Insights

This problem tests:
1. **Mixed-Base Number System**: Understanding a complex numeral system with multiple bases
2. **Structural Ambiguity**: Recognizing that some numerical expressions can be parsed in multiple ways
3. **Algebraic Reasoning**: Using arithmetic to deduce unknown number values
4. **Pattern Recognition**: Identifying how numbers are composed from smaller units

## Key Patterns to Discover

### Basic Number Words:
- **aempy** = 1
- **ynaoaempy** = 7 (from 8 = ynaoaempy ptae = 7 + something)
- **ptae** = addition marker or base unit
- **tamp** = ?
- **tarwmpao** = ?
- **ylla** = ?
- **ntamnao** = ?
- **wramaekr** = ?
- **eser** = ?

### Deducing the System:

From **8 = ynaoaempy ptae**:
- If ynaoaempy = 7, then ptae might mean "+1" or ptae is a unit that means "plus 1"
- So **ynaoaempy ptae** = 7 + 1 = 8

From **17 = tamp tarwmpao**:
- This could be multiplication, addition, or some other operation

From **21 = ylla ntamnao**:
- Similar structure to previous

From **35 = tamp ptae wramaekr**:
- **tamp ptae** something plus **wramaekr**

From **64 = eser wramaekr ptae**:
- **eser wramaekr** plus something

From **167 = tamp ntamnao ptae eser**:
- Complex combination

From **294 = tarwmpao ptae ptae ynaoaempy**:
- Multiple **ptae** markers

From **504 = tarwmpao ynaoaempy ptae ynaoaempy**:
- **tarwmpao ynaoaempy** plus **ynaoaempy**

### Hypothesis 1: ptae means "times" (multiplication)

If **ptae** = ×:
- 8 = ynaoaempy × ? = 7 × ? → doesn't work for getting 8

### Hypothesis 2: ptae is a base marker

Looking at larger numbers:
- 294 = tarwmpao ptae ptae ynaoaempy
- 504 = tarwmpao ynaoaempy ptae ynaoaempy

If **ptae** indicates place value:
- **a ptae b** could mean **a × base + b**
- **a ptae ptae b** could mean **a × base² + b** or **a × base × base + b**

Let's test with base 7:
- 8 = ynaoaempy ptae = 7 × 1 + 1? No, that's 8... wait!
  - If ynaoaempy = 1 and ptae means "times 7 plus 1", then 1×7 + 1 = 8?
  - Or: ynaoaempy is a word meaning 7, and ptae adds 1?

Actually, rethinking:
- **ynaoaempy** might be 7
- **ptae** might add 1
- So **ynaoaempy ptae** = 7 + 1 = 8

Let's try building from known values:
- 1 = aempy
- 7 = ynaoaempy (hypothesized)
- 8 = ynaoaempy ptae = 7 + 1

But this doesn't match the complexity of larger numbers.

### Alternative: Base-6, Base-7, or other mixed base

Let me try base 7:
- 17 in base 7 = 2×7 + 3 = 23₁₀ (not 17)
- 17 in base 10 = 17

Let me try base 6:
- 21 in base 6 = 2×6 + 1 = 13₁₀ (not 21)

### Pattern observation from the data:

Looking at multiples:
- 8, 17, 21, 35, 64, 167, 294, 504

Trying to find common factors:
- 8 = 2³
- 17 = prime
- 21 = 3 × 7
- 35 = 5 × 7
- 64 = 2⁶
- 167 = prime
- 294 = 2 × 3 × 7²
- 504 = 2³ × 3² × 7

Lots of 7s! This suggests base-7 or a system involving 7.

Let me try a different approach: looking at the actual words:
- **aempy** = 1
- **ynaoaempy** appears in: 8, 294, 504
- **ptae** appears in: 8, 35, 64, 167, 294, 504
- **tamp** appears in: 17, 35, 167
- **tarwmpao** appears in: 17, 294, 504
- **ylla** appears in: 21
- **ntamnao** appears in: 21, 167
- **wramaekr** appears in: 35, 64
- **eser** appears in: 64, 167

### Trying to deduce number values:

If **tamp** = 2 and **tarwmpao** = 8, then **tamp tarwmpao** might mean 2 + 8 + 7 = 17?
Or 2 × 8 + 1 = 17?

If **ylla** = 3 and **ntamnao** = 7, then **ylla ntamnao** might mean 3 × 7 = 21? YES!

If **ylla** = 3 and **ntamnao** = 7:
Then **eser wramaekr** = 64 - something
And **tamp** × something = ?

### Working hypothesis:
- **aempy** = 1
- **ylla** = 3
- **ynaoaempy** = 7
- **ntamnao** = 7 (or a multiplier that gives 7)
- **ptae** = some operation (maybe +1 or ×base+something)

Actually, I think **ptae** might mean "plus" and numbers are built additively with some multiplicative elements.

This is a complex problem requiring systematic algebraic solving. The key insight is that some expressions are ambiguous due to the structure of the language allowing multiple parsings.

## Difficulty Analysis

**Level**: Advanced

**Reasoning**:
- Complex mixed-base number system
- Requires solving system of equations
- Structural ambiguity is difficult to identify
- Need to consider multiple possible parsings
- Constraint (C) < 200 helps narrow possibilities
- Requires sophisticated mathematical reasoning
- More challenging than typical number system problems

## Related Skills (Luogu-style)

If this were on Luogu, it might be tagged with:
- 数学 (Mathematics)
- 进制系统 (Base Systems)
- 代数推理 (Algebraic Reasoning)
- 歧义分析 (Ambiguity Analysis)
- 约束满足 (Constraint Satisfaction)
- 逻辑推理 (Logical Deduction)
- 高级数论 (Advanced Number Theory)
