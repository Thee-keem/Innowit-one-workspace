/**
 * INNOWIT ONE WORKSPACE — CLI SEED VERIFICATION & DEMO ACCOUNT PROVISIONING
 * Validates and summarizes the seeded workspace dataset and 12-role RBAC accounts.
 *
 * Usage: npm run db:seed
 *
 * @license Apache-2.0
 */

import { SEED_USERS, DEFAULT_BRANCHES } from '@/data/kernel';
import { getSeedManifest, resetWorkspaceDemoData } from '@/modules/seed/reset';
import { runAllAcceptanceGates } from '@/tests/acceptanceGates';

console.log('================================================================================');
console.log('  INNOWIT ONE WORKSPACE — DEMO DATA SEEDER & ACCOUNT PROVISIONING');
console.log('================================================================================\n');

const manifest = resetWorkspaceDemoData();

console.log(`Organization:  ${manifest.organization} (KRA PIN: ${manifest.kraPin})`);
console.log(`Timestamp:     ${manifest.timestamp}`);
console.log(`Branches:      ${DEFAULT_BRANCHES.map((b) => `${b.name} [${b.branchCode}]`).join(' | ')}\n`);

console.log('Provisioned Entity Counts:');
console.log(`  • RBAC User Accounts:       ${manifest.counts.users}`);
console.log(`  • Chart of Accounts:        ${manifest.counts.accounts}`);
console.log(`  • Posted Journal Entries:   ${manifest.counts.journalEntries}`);
console.log(`  • Sales Invoices:           ${manifest.counts.invoices}`);
console.log(`  • CRM Customers:            ${manifest.counts.customers}`);
console.log(`  • CRM Deals (6-Stage):      ${manifest.counts.deals}`);
console.log(`  • Inventory Products:       ${manifest.counts.products}`);
console.log(`  • Warehouses:               ${manifest.counts.warehouses}`);
console.log(`  • Suppliers & POs:          ${manifest.counts.suppliers} suppliers / ${manifest.counts.purchaseOrders} POs`);
console.log(`  • Employees (Payroll):      ${manifest.counts.employees}`);
console.log(`  • eTIMS Queue & CNs:        ${manifest.counts.etimsQueueItems} queued / ${manifest.counts.creditNotes} credit notes`);
console.log(`  • Collaboration Channels:   ${manifest.counts.channels}`);
console.log(`  • Automation Rules:         ${manifest.counts.automationRules}`);
console.log(`  • Audit Log Seed Rows:      ${manifest.counts.auditLogs}\n`);

console.log('12-Role Demo Accounts Provisioned:');
SEED_USERS.forEach((user, idx) => {
  console.log(
    `  ${String(idx + 1).padStart(2, '0')}. ${user.role.padEnd(20)} | ${user.email.padEnd(22)} | ${user.fullName}`
  );
});

const gates = runAllAcceptanceGates();
console.log('\nPost-Seed Integrity Check:');
console.log(`  Gates Passed: ${gates.passedGates}/${gates.totalGates} | Assertions Passed: ${gates.passedAssertions}/${gates.totalAssertions}`);

if (!gates.allPassed) {
  console.error('\n✖ Seed integrity verification failed!');
  process.exit(1);
}

console.log('\n★ Workspace seed manifest verified and ready [100%].\n');
