import { execSync } from 'child_process';

/**
 * Check modified files in books folder and reset those with unequal line changes
 * (additions != deletions = no parity)
 */
function resetInvalidTranslatedFiles() {
  try {
    // Get diff stats for all modified files in books folder
    // Format: <additions>\t<deletions>\t<filename>
    const diffOutput = execSync('git diff --numstat books/', { encoding: 'utf-8' });
    
    if (!diffOutput.trim()) {
      console.log('No modified files in books folder');
      return;
    }

    const lines = diffOutput.trim().split('\n');
    let resetCount = 0;
    let skippedCount = 0;

    for (const line of lines) {
      const [additions, deletions, filename] = line.split('\t');
      
      if (!filename || !additions || !deletions) continue;

      const addNum = parseInt(additions, 10);
      const delNum = parseInt(deletions, 10);

      console.log(`\n${filename}:`);
      console.log(`  Additions: ${additions}, Deletions: ${deletions}`);

      // Check if parity exists (additions == deletions)
      if (addNum !== delNum) {
        console.log(`  ❌ No parity - resetting file`);
        try {
          execSync(`git checkout HEAD -- "${filename}"`, { encoding: 'utf-8' });
          resetCount++;
        } catch (error) {
          console.error(`  Failed to reset ${filename}:`, error);
        }
      } else {
        console.log(`  ✓ Parity maintained - keeping changes`);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Summary:`);
    console.log(`  Files reset: ${resetCount}`);
    console.log(`  Files kept: ${skippedCount}`);
    console.log('='.repeat(50));

  } catch (error: any) {
    if (error.status === 128 || error.message.includes('not a git repository')) {
      console.error('Error: Not a git repository');
    } else if (error.stdout && error.stdout.toString().trim() === '') {
      console.log('No modified files in books folder');
    } else {
      console.error('Error executing git command:', error.message);
    }
  }
}

// Run the function
resetInvalidTranslatedFiles();
