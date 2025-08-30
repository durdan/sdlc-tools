#!/usr/bin/env ts-node

/**
 * Test script for the AI diagram healing feature
 * This script tests the API endpoint directly
 */

const API_URL = 'http://localhost:3000/api/heal-diagram';

const testDiagrams = [
  {
    name: "Missing Direction",
    code: `graph
A -> B
B -> C`,
    expectedFixes: ["graph TD", "graph LR"]
  },
  {
    name: "Wrong Arrow in Sequence",
    code: `sequenceDiagram
User -> Server: Request
Server -> Database: Query`,
    expectedFixes: ["->>"]
  },
  {
    name: "Unclosed Bracket",
    code: `flowchart TD
A --> B{Is it working?
B --> C[Yes]`,
    expectedFixes: ["}"]
  }
];

async function testDiagramHealing(diagram: any) {
  console.log(`\n🧪 Testing: ${diagram.name}`);
  console.log(`Original: ${diagram.code.substring(0, 50)}...`);
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        diagramCode: diagram.code,
        errorContext: `Testing diagram healing for: ${diagram.name}`
      }),
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let healedDiagram = '';
    let changes = '';

    if (!reader) {
      console.error('❌ No response body');
      return;
    }

    console.log('⏳ Processing AI healing...');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const message = JSON.parse(data);
            if (message.type === 'complete') {
              healedDiagram = message.healedDiagram;
              changes = message.changes;
            } else if (message.type === 'error') {
              console.error(`❌ Healing error: ${message.error}`);
              return;
            }
          } catch (e) {
            // Ignore parse errors for progress messages
          }
        }
      }
    }

    if (healedDiagram) {
      console.log('✅ Healing completed!');
      console.log(`Fixed diagram:\n${healedDiagram}`);
      console.log(`Changes: ${changes}`);
      
      // Check if expected fixes were applied
      const hasExpectedFixes = diagram.expectedFixes.some((fix: string) => 
        healedDiagram.includes(fix)
      );
      
      if (hasExpectedFixes) {
        console.log('✅ Expected fixes were applied');
      } else {
        console.log('⚠️  Expected fixes might not have been applied');
      }
    } else {
      console.log('❌ No healed diagram received');
    }

  } catch (error) {
    console.error(`❌ Error testing ${diagram.name}:`, error);
  }
}

async function runTests() {
  console.log('🚀 Starting AI Diagram Healing Tests');
  console.log('Make sure your Next.js server is running on http://localhost:3000');
  
  for (const diagram of testDiagrams) {
    await testDiagramHealing(diagram);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n✨ All tests completed!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

export { runTests, testDiagrams };