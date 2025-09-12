const fs = require('fs');
const path = require('path');

// Read the problems data
const problemsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/problems.json'), 'utf8')
);

// Template for generating problem pages
const generateProblemPage = (problem) => {
  return `import ProblemPageTemplate from "@/components/ProblemPageTemplate"

export default function Problem${problem.number.replace('-', '')}() {
  const problem = ${JSON.stringify(problem, null, 4)}

  return <ProblemPageTemplate problem={problem} />
}`;
};

// Create problem pages
problemsData.problems.forEach(problem => {
  const dirPath = path.join(__dirname, `../src/app/problems/${problem.number}`);
  const filePath = path.join(dirPath, 'page.tsx');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  // Write the page file
  fs.writeFileSync(filePath, generateProblemPage(problem));
  console.log(`✅ Generated ${problem.number}/page.tsx`);
});

console.log(`\n✨ Successfully generated ${problemsData.problems.length} problem pages!`);
console.log('\nTo update problems:');
console.log('1. Edit src/data/problems.json');
console.log('2. Run: npm run generate-problems');
console.log('3. All problem pages will be automatically updated!');