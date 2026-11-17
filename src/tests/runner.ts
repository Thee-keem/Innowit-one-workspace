/**
 * INNOWIT ONE WORKSPACE — AUTOMATED ACCEPTANCE TEST RUNNER (CLI)
 * Executes the 5 Mandatory Acceptance Gates and reports results.
 *
 * Usage: npx tsx src/tests/runner.ts
 *
 * @license Apache-2.0
 */

import { runAllAcceptanceGates } from './acceptanceGates';

console.log('================================================================================');
console.log('  INNOWIT ONE WORKSPACE — 5 MANDATORY ACCEPTANCE GATES TEST RUNNER');
console.log('  Target: Strict Phase 8 Acceptance & Production Hardening Gates');
console.log('================================================================================\n');

const summary = runAllAcceptanceGates();

summary.gates.forEach((gate, idx) => {
  const icon = gate.passed ? '✓' : '✗';
  const statusLabel = gate.passed ? '[PASS]' : '[FAIL]';
  console.log(`${icon} ${statusLabel} ${gate.name} (${gate.durationMs}ms)`);
  console.log(`  Description: ${gate.description}`);

  gate.assertions.forEach((a) => {
    const aIcon = a.passed ? '  •' : '  ✖';
    console.log(`  ${aIcon} ${a.check}`);
    console.log(`    Result: ${a.message}`);
  });
  console.log('');
});

console.log('--------------------------------------------------------------------------------');
console.log(`Test Execution Summary:`);
console.log(`  Timestamp:          ${summary.timestamp}`);
console.log(`  Total Gates:        ${summary.totalGates} (${summary.passedGates} Passed, ${summary.failedGates} Failed)`);
console.log(`  Total Assertions:   ${summary.totalAssertions} (${summary.passedAssertions} Passed, ${summary.failedAssertions} Failed)`);
console.log(`  Total Duration:     ${summary.totalDurationMs} ms`);
console.log('--------------------------------------------------------------------------------');

if (summary.allPassed) {
  console.log('\n★ ACCEPTANCE VERIFICATION: ALL 5 MANDATORY ACCEPTANCE GATES PASSED [100%]\n');
  process.exit(0);
} else {
  console.error('\n✖ ACCEPTANCE VERIFICATION FAILED: 1 or more gates did not satisfy criteria.\n');
  process.exit(1);
}
