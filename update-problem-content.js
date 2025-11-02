#!/usr/bin/env node
/**
 * Update all 20 test problems to have minimal content
 * since we now have the original PDFs available
 */

const axios = require('axios');

const API_URL = 'https://lingohub-backend.vercel.app';

// Minimal content template
const getMinimalContent = (problem) => `# ${problem.title}

**Source:** ${problem.source} ${problem.year}
**Difficulty:** ${'⭐'.repeat(problem.difficulty)} (${problem.difficulty}/5)

## Problem Statement

The complete problem is available in the PDF viewer below.

---

*This is an official ${problem.source} olympiad problem. All problems are self-contained linguistic puzzles that require no prior knowledge.*`;

async function updateProblems() {
  try {
    // Get all 20 problems
    const response = await axios.get(`${API_URL}/api/problems`, {
      params: { limit: 100 }
    });

    const problems = response.data.problems;
    console.log(`📊 Found ${problems.length} problems`);

    let updated = 0;
    for (const problem of problems) {
      const minimalContent = getMinimalContent(problem);

      try {
        await axios.put(`${API_URL}/api/olympiad/update-content`, {
          number: problem.number,
          content: minimalContent
        });
        console.log(`✅ Updated ${problem.number}`);
        updated++;
      } catch (err) {
        console.log(`❌ Failed to update ${problem.number}:`, err.response?.data || err.message);
      }
    }

    console.log(`\n✅ Successfully updated ${updated}/${problems.length} problems`);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

updateProblems();
