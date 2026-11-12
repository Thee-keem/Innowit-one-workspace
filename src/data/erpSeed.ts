import {
  WarehouseRecord,
  WarehouseStockRecord,
  StockMovementRecord,
  SupplierRecord,
  PurchaseOrderRecord,
  GoodsReceiptNoteRecord,
  SupplierBillRecord,
  SalesOrderRecord,
  QuotationRecord,
  DepartmentRecord,
  EmployeeRecord,
  PayrollRunRecord,
  PayslipRecord,
  AttendanceRecord,
  LeaveRequestRecord,
  FixedAssetRecord,
  ErpProjectRecord,
} from '@/types';

// ============================================================================
// 1. WAREHOUSES & LOCATIONS
// ============================================================================

export const SEED_WAREHOUSES: WarehouseRecord[] = [
  {
    id: 'wh_nbo_01',
    branchId: 'branch_hq_00',
    branchName: 'HQ - Nairobi Branch (00)',
    code: 'WH-NBO-01',
    name: 'Nairobi Central Master Warehouse',
    location: 'Westlands Commercial Hub, Bay 4, Waiyaki Way, Nairobi',
    capacityUnits: 15000,
    managerName: 'Hassan Abdi',
    contactPhone: '+254 700 112 233',
    isCentral: true,
  },
  {
    id: 'wh_msa_02',
    branchId: 'branch_msa_01',
    branchName: 'Mombasa Coastal Branch (01)',
    code: 'WH-MSA-02',
    name: 'Mombasa Port Transit & Bonded Depot',
    location: 'Kilindini Port Gateway, Gate 2, Moi Avenue, Mombasa',
    capacityUnits: 8000,
    managerName: 'Omar Salim',
    contactPhone: '+254 711 334 455',
    isCentral: false,
  },
  {
    id: 'wh_ksm_03',
    branchId: 'branch_ksm_02',
    branchName: 'Kisumu Western Hub (02)',
    code: 'WH-KSM-03',
    name: 'Kisumu Western Regional Distribution Hub',
    location: 'Mega Plaza Industrial Wing, Oginga Odinga St, Kisumu',
    capacityUnits: 5000,
    managerName: 'Beatrice Atieno',
    contactPhone: '+254 722 556 677',
    isCentral: false,
  },
];

export const SEED_WAREHOUSE_STOCKS: WarehouseStockRecord[] = [
  {
    id: 'ws_01_nbo',
    productId: 'prod_01',
    warehouseId: 'wh_nbo_01',
    warehouseCode: 'WH-NBO-01',
    quantityOnHand: 999,
    quantityReserved: 15,
    binLocation: 'CLOUD-LIC-DIGITAL',
  },
  {
    id: 'ws_02_nbo',
    productId: 'prod_02',
    warehouseId: 'wh_nbo_01',
    warehouseCode: 'WH-NBO-01',
    quantityOnHand: 28,
    quantityReserved: 6,
    binLocation: 'RACK-B2-SHELF03',
  },
  {
    id: 'ws_02_msa',
    productId: 'prod_02',
    warehouseId: 'wh_msa_02',
    warehouseCode: 'WH-MSA-02',
    quantityOnHand: 14,
    quantityReserved: 2,
    binLocation: 'SEC-A1-BIN09',
  },
  {
    id: 'ws_03_nbo',
    productId: 'prod_03',
    warehouseId: 'wh_nbo_01',
    warehouseCode: 'WH-NBO-01',
    quantityOnHand: 150,
    quantityReserved: 20,
    binLocation: 'SERVICES-POOL',
  },
];

export const SEED_STOCK_MOVEMENTS: StockMovementRecord[] = [
  {
    id: 'mov_001',
    movementNumber: 'MOV-2026-0038',
    productId: 'prod_02',
    productSku: 'INNO-ETIMS-GATEWAY',
    productName: 'eTIMS OSCU Physical Controller / Air-Gap Appliance',
    warehouseId: 'wh_nbo_01',
    warehouseName: 'Nairobi Central Master Warehouse',
    movementType: 'RECEIPT',
    quantity: 35,
    unitCostKes: 48000,
    totalValueKes: 1680000,
    referenceDocument: 'GRN-2026-0028',
    reason: 'Initial Vendor Delivery from Hardware Solutions Kenya',
    performedBy: 'Hassan Abdi',
    timestamp: '2026-11-04 09:30',
  },
  {
    id: 'mov_002',
    movementNumber: 'MOV-2026-0039',
    productId: 'prod_02',
    productSku: 'INNO-ETIMS-GATEWAY',
    productName: 'eTIMS OSCU Physical Controller / Air-Gap Appliance',
    warehouseId: 'wh_nbo_01',
    warehouseName: 'Nairobi Central Master Warehouse',
    targetWarehouseId: 'wh_msa_02',
    targetWarehouseName: 'Mombasa Port Transit & Bonded Depot',
    movementType: 'TRANSFER',
    quantity: -14,
    unitCostKes: 48000,
    totalValueKes: 672000,
    referenceDocument: 'TRF-NBO-MSA-01',
    reason: 'Inter-branch stock replenishment to Mombasa Coastal Branch',
    performedBy: 'Hassan Abdi',
    timestamp: '2026-11-06 14:15',
  },
  {
    id: 'mov_003',
    movementNumber: 'MOV-2026-0040',
    productId: 'prod_02',
    productSku: 'INNO-ETIMS-GATEWAY',
    productName: 'eTIMS OSCU Physical Controller / Air-Gap Appliance',
    warehouseId: 'wh_msa_02',
    warehouseName: 'Mombasa Port Transit & Bonded Depot',
    movementType: 'RECEIPT',
    quantity: 14,
    unitCostKes: 48000,
    totalValueKes: 672000,
    referenceDocument: 'TRF-NBO-MSA-01',
    reason: 'Received stock replenishment from Nairobi Central',
    performedBy: 'Omar Salim',
    timestamp: '2026-11-07 11:20',
  },
  {
    id: 'mov_004',
    movementNumber: 'MOV-2026-0041',
    productId: 'prod_02',
    productSku: 'INNO-ETIMS-GATEWAY',
    productName: 'eTIMS OSCU Physical Controller / Air-Gap Appliance',
    warehouseId: 'wh_nbo_01',
    warehouseName: 'Nairobi Central Master Warehouse',
    movementType: 'ISSUE',
    quantity: -7,
    unitCostKes: 48000,
    totalValueKes: 336000,
    referenceDocument: 'SO-2026-0048',
    reason: 'Dispatched for Safaricom Enterprise delivery',
    performedBy: 'Hassan Abdi',
    timestamp: '2026-11-08 15:40',
  },
];

// ============================================================================
// 2. SUPPLIERS & PROCUREMENT
// ============================================================================

export const SEED_SUPPLIERS: SupplierRecord[] = [
  {
    id: 'supp_01',
    supplierCode: 'VEND-KEN-001',
    name: 'Hardware & IoT Solutions Kenya Ltd',
    kraPin: 'P051889900B',
    email: 'orders@hardwareiot.co.ke',
    phone: '+254 720 889 900',
    contactPerson: 'David Karanja',
    address: 'Enterprise Road, Industrial Area, Nairobi',
    category: 'Hardware & Devices',
    paymentTermsDays: 30,
    rating: 4.8,
    totalSpendKes: 4850000,
    status: 'ACTIVE',
  },
  {
    id: 'supp_02',
    supplierCode: 'VEND-KEN-002',
    name: 'Liquid Intelligent Technologies Kenya',
    kraPin: 'P051334455C',
    email: 'corporate.billing@liquid.tech',
    phone: '+254 703 033 000',
    contactPerson: 'Amina Noor',
    address: 'Sameer Industrial Park, Mombasa Road, Nairobi',
    category: 'Cloud Infrastructure & Telecom',
    paymentTermsDays: 45,
    rating: 4.9,
    totalSpendKes: 7200000,
    status: 'ACTIVE',
  },
  {
    id: 'supp_03',
    supplierCode: 'VEND-KEN-003',
    name: 'Silicon Savannah Systems Ltd',
    kraPin: 'P051667788D',
    email: 'sales@siliconsavannah.ke',
    phone: '+254 712 345 678',
    contactPerson: 'Dennis Mutua',
    address: 'The Promenade, General Mathenge Drive, Westlands',
    category: 'Networking & OEM Kits',
    paymentTermsDays: 15,
    rating: 4.6,
    totalSpendKes: 2400000,
    status: 'ACTIVE',
  },
];

export const SEED_PURCHASE_ORDERS: PurchaseOrderRecord[] = [
  {
    id: 'po_01',
    poNumber: 'PO-2026-0078',
    supplierId: 'supp_01',
    supplierName: 'Hardware & IoT Solutions Kenya Ltd',
    supplierPin: 'P051889900B',
    branchId: 'branch_hq_00',
    branchName: 'HQ - Nairobi Branch (00)',
    orderDate: '2026-11-01',
    expectedDeliveryDate: '2026-11-04',
    status: 'RECEIVED',
    items: [
      {
        id: 'poi_01',
        productId: 'prod_02',
        productSku: 'INNO-ETIMS-GATEWAY',
        productName: 'eTIMS OSCU Physical Controller / Air-Gap Appliance',
        quantity: 35,
        receivedQuantity: 35,
        unitCostKes: 48000,
        taxRate: 0.16,
        lineTotalKes: 1948800,
      },
    ],
    subtotalKes: 1680000,
    taxAmountKes: 268800,
    totalAmountKes: 1948800,
    approvedBy: 'Patrick Otieno (Head of Finance)',
    approvedAt: '2026-11-01 14:00',
    notes: 'Q4 fiscal gateway hardware batch for enterprise client rollout',
    createdAt: '2026-11-01',
  },
  {
    id: 'po_02',
    poNumber: 'PO-2026-0082',
    supplierId: 'supp_03',
    supplierName: 'Silicon Savannah Systems Ltd',
    supplierPin: 'P051667788D',
    branchId: 'branch_hq_00',
    branchName: 'HQ - Nairobi Branch (00)',
    orderDate: '2026-11-09',
    expectedDeliveryDate: '2026-11-18',
    status: 'APPROVED',
    items: [
      {
        id: 'poi_02',
        productId: 'prod_02',
        productSku: 'INNO-ETIMS-GATEWAY',
        productName: 'eTIMS OSCU Physical Controller / Air-Gap Appliance',
        quantity: 20,
        receivedQuantity: 0,
        unitCostKes: 48000,
        taxRate: 0.16,
        lineTotalKes: 1113600,
      },
    ],
    subtotalKes: 960000,
    taxAmountKes: 153600,
    totalAmountKes: 1113600,
    approvedBy: 'Alex Kibet (System Admin)',
    approvedAt: '2026-11-10 10:30',
    notes: 'Buffer stock for upcoming coastal expansion projects',
    createdAt: '2026-11-09',
  },
  {
    id: 'po_03',
    poNumber: 'PO-2026-0085',
    supplierId: 'supp_02',
    supplierName: 'Liquid Intelligent Technologies Kenya',
    supplierPin: 'P051334455C',
    branchId: 'branch_hq_00',
    branchName: 'HQ - Nairobi Branch (00)',
    orderDate: '2026-11-11',
    expectedDeliveryDate: '2026-11-25',
    status: 'PENDING_APPROVAL',
    items: [
      {
        id: 'poi_03',
        productId: 'prod_01',
        productSku: 'INNO-CLOUD-CORE',
        productName: 'Dedicated Cloud Infrastructure Tier 3 Hosting',
        quantity: 1,
        receivedQuantity: 0,
        unitCostKes: 650000,
        taxRate: 0.16,
        lineTotalKes: 754000,
      },
    ],
    subtotalKes: 650000,
    taxAmountKes: 104000,
    totalAmountKes: 754000,
    notes: 'Primary datacenter bandwidth and colocation renewal',
    createdAt: '2026-11-11',
  },
];

export const SEED_GOODS_RECEIPT_NOTES: GoodsReceiptNoteRecord[] = [
  {
    id: 'grn_01',
    grnNumber: 'GRN-2026-0028',
    poId: 'po_01',
    poNumber: 'PO-2026-0078',
    supplierId: 'supp_01',
    supplierName: 'Hardware & IoT Solutions Kenya Ltd',
    warehouseId: 'wh_nbo_01',
    warehouseName: 'Nairobi Central Master Warehouse',
    receivedDate: '2026-11-04',
    receivedBy: 'Hassan Abdi',
    items: [
      {
        productId: 'prod_02',
        productSku: 'INNO-ETIMS-GATEWAY',
        productName: 'eTIMS OSCU Physical Controller / Air-Gap Appliance',
        quantityReceived: 35,
        unitCostKes: 48000,
        totalCostKes: 1680000,
      },
    ],
    totalValueKes: 1948800,
    billGenerated: true,
    billId: 'bill_01',
    journalEntryId: 'je_grn_001',
    notes: 'All 35 appliances inspected, barcodes verified, firmware tested.',
  },
];

export const SEED_SUPPLIER_BILLS: SupplierBillRecord[] = [
  {
    id: 'bill_01',
    billNumber: 'BILL-2026-0018',
    supplierId: 'supp_01',
    supplierName: 'Hardware & IoT Solutions Kenya Ltd',
    supplierPin: 'P051889900B',
    grnId: 'grn_01',
    grnNumber: 'GRN-2026-0028',
    poNumber: 'PO-2026-0078',
    billDate: '2026-11-05',
    dueDate: '2026-12-05',
    amountKes: 1680000,
    taxAmountKes: 268800,
    totalAmountKes: 1948800,
    status: 'UNPAID',
    journalEntryId: 'je_bill_001',
  },
];

// ============================================================================
// 3. SALES ORDERS & COMMERCIAL FULFILLMENT
// ============================================================================

export const SEED_QUOTATIONS: QuotationRecord[] = [
  {
    id: 'qt_01',
    quotationNumber: 'QT-2026-0108',
    dealId: 'deal_01',
    customerId: 'cust_01',
    customerName: 'Safaricom Enterprise PLC',
    issueDate: '2026-11-02',
    validUntil: '2026-11-20',
    items: [
      {
        id: 'qti_01',
        productId: 'prod_01',
        productSku: 'INNO-CLOUD-CORE',
        productName: 'Innowit One Enterprise Core Subscription (Annual)',
        quantity: 2,
        unitPriceKes: 240000,
        taxRate: 0.16,
        lineTotalKes: 556800,
      },
      {
        id: 'qti_02',
        productId: 'prod_02',
        productSku: 'INNO-ETIMS-GATEWAY',
        productName: 'eTIMS OSCU Physical Controller / Air-Gap Appliance',
        quantity: 8,
        unitPriceKes: 75000,
        taxRate: 0.16,
        lineTotalKes: 696000,
      },
    ],
    totalAmountKes: 1252800,
    status: 'CONVERTED',
    convertedOrderId: 'so_01',
  },
  {
    id: 'qt_02',
    quotationNumber: 'QT-2026-0114',
    dealId: 'deal_02',
    customerId: 'cust_02',
    customerName: 'Equity Bank Group Kenya',
    issueDate: '2026-11-08',
    validUntil: '2026-11-30',
    items: [
      {
        id: 'qti_03',
        productId: 'prod_03',
        productSku: 'INNO-CONSULT-HR',
        productName: 'Senior ERP Implementation & Accounting Setup',
        quantity: 10,
        unitPriceKes: 45000,
        taxRate: 0.16,
        lineTotalKes: 522000,
      },
    ],
    totalAmountKes: 522000,
    status: 'ACCEPTED',
  },
];

export const SEED_SALES_ORDERS: SalesOrderRecord[] = [
  {
    id: 'so_01',
    orderNumber: 'SO-2026-0048',
    customerId: 'cust_01',
    customerName: 'Safaricom Enterprise PLC',
    customerPin: 'P051112233Q',
    quotationId: 'qt_01',
    quotationNumber: 'QT-2026-0108',
    orderDate: '2026-11-05',
    expectedDispatchDate: '2026-11-12',
    status: 'CONFIRMED',
    items: [
      {
        id: 'soi_01',
        productId: 'prod_01',
        productSku: 'INNO-CLOUD-CORE',
        productName: 'Innowit One Enterprise Core Subscription (Annual)',
        quantity: 2,
        unitPriceKes: 240000,
        taxRate: 0.16,
        lineTotalKes: 556800,
      },
      {
        id: 'soi_02',
        productId: 'prod_02',
        productSku: 'INNO-ETIMS-GATEWAY',
        productName: 'eTIMS OSCU Physical Controller / Air-Gap Appliance',
        quantity: 8,
        unitPriceKes: 75000,
        taxRate: 0.16,
        lineTotalKes: 696000,
      },
    ],
    totalAmountKes: 1252800,
    taxAmountKes: 172800,
    stockReserved: true,
    deliveryNoteNumber: 'DN-2026-0034',
    salesRepName: 'Kevin Mutiso',
    notes: 'Priority dispatch for Westlands Safaricom HQ data centers',
  },
  {
    id: 'so_02',
    orderNumber: 'SO-2026-0052',
    customerId: 'cust_03',
    customerName: 'Twiga Foods Limited',
    customerPin: 'P051443322M',
    orderDate: '2026-11-10',
    expectedDispatchDate: '2026-11-15',
    status: 'PROCESSING',
    items: [
      {
        id: 'soi_03',
        productId: 'prod_02',
        productSku: 'INNO-ETIMS-GATEWAY',
        productName: 'eTIMS OSCU Physical Controller / Air-Gap Appliance',
        quantity: 4,
        unitPriceKes: 75000,
        taxRate: 0.16,
        lineTotalKes: 348000,
      },
    ],
    totalAmountKes: 348000,
    taxAmountKes: 48000,
    stockReserved: true,
    salesRepName: 'David Ochieng',
    notes: 'Supply chain warehouse integration modules',
  },
];

// ============================================================================
// 4. HUMAN RESOURCES & STATUTORY KENYAN PAYROLL
// ============================================================================

export const SEED_DEPARTMENTS: DepartmentRecord[] = [
  {
    id: 'dept_exec',
    name: 'Executive & Strategic Governance',
    code: 'EXEC',
    headOfDept: 'Kimani Mwangi',
    employeeCount: 3,
    monthlyBudgetKes: 1200000,
  },
  {
    id: 'dept_fin',
    name: 'Finance & Regulatory Accounting',
    code: 'FIN',
    headOfDept: 'Patrick Otieno',
    employeeCount: 2,
    monthlyBudgetKes: 650000,
  },
  {
    id: 'dept_sales',
    name: 'Commercial & Sales Pipeline',
    code: 'SALES',
    headOfDept: 'David Ochieng',
    employeeCount: 2,
    monthlyBudgetKes: 550000,
  },
  {
    id: 'dept_ops',
    name: 'Supply Chain, Logistics & Warehousing',
    code: 'OPS',
    headOfDept: 'Hassan Abdi',
    employeeCount: 2,
    monthlyBudgetKes: 420000,
  },
  {
    id: 'dept_eng',
    name: 'Engineering & Software Architecture',
    code: 'ENG',
    headOfDept: 'Alex Kibet',
    employeeCount: 2,
    monthlyBudgetKes: 700000,
  },
  {
    id: 'dept_hr',
    name: 'Human Capital & Culture',
    code: 'HR',
    headOfDept: 'Lilian Ndinda',
    employeeCount: 1,
    monthlyBudgetKes: 250000,
  },
];

export const SEED_EMPLOYEES: EmployeeRecord[] = [
  {
    id: 'emp_01',
    employeeCode: 'EMP-001',
    userId: 'usr_super_01',
    fullName: 'Kimani Mwangi',
    email: 'admin@innowit.ke',
    phone: '+254 700 000 001',
    departmentId: 'dept_exec',
    departmentName: 'Executive & Strategic Governance',
    jobTitle: 'Managing Director & Lead Architect',
    hireDate: '2022-01-15',
    kraPin: 'A001234567X',
    nationalId: '23456789',
    nssfNumber: 'NSSF-987654',
    nhifNumber: 'NHIF-123456',
    bankName: 'NCBA Bank Kenya',
    bankAccountNumber: '1002345678',
    basicSalaryKes: 380000,
    housingAllowanceKes: 50000,
    transportAllowanceKes: 20000,
    isActive: true,
  },
  {
    id: 'emp_02',
    employeeCode: 'EMP-002',
    userId: 'usr_finance_04',
    fullName: 'Patrick Otieno',
    email: 'finance@innowit.ke',
    phone: '+254 700 000 004',
    departmentId: 'dept_fin',
    departmentName: 'Finance & Regulatory Accounting',
    jobTitle: 'Head of Finance & Treasury',
    hireDate: '2022-03-01',
    kraPin: 'A002345678Y',
    nationalId: '24567890',
    nssfNumber: 'NSSF-876543',
    nhifNumber: 'NHIF-234567',
    bankName: 'Standard Chartered Kenya',
    bankAccountNumber: '0102938475',
    basicSalaryKes: 260000,
    housingAllowanceKes: 35000,
    transportAllowanceKes: 15000,
    isActive: true,
  },
  {
    id: 'emp_03',
    employeeCode: 'EMP-003',
    userId: 'usr_accountant_05',
    fullName: 'Sarah Chebet',
    email: 'accountant@innowit.ke',
    phone: '+254 700 000 005',
    departmentId: 'dept_fin',
    departmentName: 'Finance & Regulatory Accounting',
    jobTitle: 'Senior Financial Accountant',
    hireDate: '2023-02-15',
    kraPin: 'A003456789Z',
    nationalId: '25678901',
    nssfNumber: 'NSSF-765432',
    nhifNumber: 'NHIF-345678',
    bankName: 'Equity Bank Kenya',
    bankAccountNumber: '05501928374',
    basicSalaryKes: 160000,
    housingAllowanceKes: 25000,
    transportAllowanceKes: 10000,
    isActive: true,
  },
  {
    id: 'emp_04',
    employeeCode: 'EMP-004',
    userId: 'usr_sales_mgr_06',
    fullName: 'David Ochieng',
    email: 'sales.dir@innowit.ke',
    phone: '+254 700 000 006',
    departmentId: 'dept_sales',
    departmentName: 'Commercial & Sales Pipeline',
    jobTitle: 'Commercial Sales Director',
    hireDate: '2022-06-01',
    kraPin: 'A004567890A',
    nationalId: '26789012',
    nssfNumber: 'NSSF-654321',
    nhifNumber: 'NHIF-456789',
    bankName: 'KCB Bank Kenya',
    bankAccountNumber: '1122334455',
    basicSalaryKes: 210000,
    housingAllowanceKes: 30000,
    transportAllowanceKes: 20000,
    isActive: true,
  },
  {
    id: 'emp_05',
    employeeCode: 'EMP-005',
    userId: 'usr_inv_09',
    fullName: 'Hassan Abdi',
    email: 'inventory@innowit.ke',
    phone: '+254 700 000 009',
    departmentId: 'dept_ops',
    departmentName: 'Supply Chain, Logistics & Warehousing',
    jobTitle: 'Central Warehouse & Logistics Manager',
    hireDate: '2023-01-10',
    kraPin: 'A005678901B',
    nationalId: '27890123',
    nssfNumber: 'NSSF-543210',
    nhifNumber: 'NHIF-567890',
    bankName: 'Absa Bank Kenya',
    bankAccountNumber: '0309485721',
    basicSalaryKes: 140000,
    housingAllowanceKes: 20000,
    transportAllowanceKes: 10000,
    isActive: true,
  },
  {
    id: 'emp_06',
    employeeCode: 'EMP-006',
    userId: 'usr_hr_10',
    fullName: 'Lilian Ndinda',
    email: 'hr@innowit.ke',
    phone: '+254 700 000 010',
    departmentId: 'dept_hr',
    departmentName: 'Human Capital & Culture',
    jobTitle: 'People & Culture Director',
    hireDate: '2022-09-01',
    kraPin: 'A006789012C',
    nationalId: '28901234',
    nssfNumber: 'NSSF-432109',
    nhifNumber: 'NHIF-678901',
    bankName: 'NCBA Bank Kenya',
    bankAccountNumber: '1009876543',
    basicSalaryKes: 180000,
    housingAllowanceKes: 25000,
    transportAllowanceKes: 15000,
    isActive: true,
  },
];

/**
 * Statutory Kenyan Payroll Computation according to Kenya Finance Act 2023/2024:
 * 1. Gross Salary = Basic + Allowances
 * 2. NSSF Tier I & Tier II: Standard employee contribution = KES 2,160 (max)
 * 3. Taxable Pay = Gross - NSSF
 * 4. PAYE Progressive Tax Bands (Monthly):
 *    - Up to KES 24,000 @ 10%
 *    - Next KES 8,333 (24,001 to 32,333) @ 25%
 *    - Next KES 467,667 (32,334 to 500,000) @ 30%
 *    - Next KES 300,000 (500,001 to 800,000) @ 32.5%
 *    - Above KES 800,000 @ 35%
 *    - Personal Relief = KES 2,400 per month
 *    - Net PAYE = Math.max(0, Gross Tax - Personal Relief)
 * 5. NHIF / SHIF (Social Health Insurance Fund) = 2.75% of Gross
 * 6. Affordable Housing Levy (AHL) = 1.5% of Gross
 * 7. Net Pay = Gross - (Net PAYE + NSSF + NHIF/SHIF + Housing Levy)
 */
export function calculateKenyanPayslip(
  emp: EmployeeRecord,
  payrollRunId: string
): PayslipRecord {
  const basic = emp.basicSalaryKes;
  const allowances = emp.housingAllowanceKes + emp.transportAllowanceKes;
  const gross = basic + allowances;

  // 1. NSSF: standard ceiling contribution 2,160 KES (Tier I: 420, Tier II: 1,740)
  const nssf = Math.min(2160, Math.round(gross * 0.06));

  // 2. Taxable Pay
  const taxablePay = Math.max(0, gross - nssf);

  // 3. PAYE progressive tax computation
  let grossTax = 0;
  let remaining = taxablePay;

  // Band 1: First 24,000 @ 10%
  const b1 = Math.min(remaining, 24000);
  grossTax += b1 * 0.1;
  remaining -= b1;

  // Band 2: Next 8,333 @ 25%
  if (remaining > 0) {
    const b2 = Math.min(remaining, 8333);
    grossTax += b2 * 0.25;
    remaining -= b2;
  }

  // Band 3: Next 467,667 @ 30%
  if (remaining > 0) {
    const b3 = Math.min(remaining, 467667);
    grossTax += b3 * 0.3;
    remaining -= b3;
  }

  // Band 4: Next 300,000 @ 32.5%
  if (remaining > 0) {
    const b4 = Math.min(remaining, 300000);
    grossTax += b4 * 0.325;
    remaining -= b4;
  }

  // Band 5: Above 800,000 @ 35%
  if (remaining > 0) {
    grossTax += remaining * 0.35;
  }

  const personalRelief = 2400; // Monthly personal relief
  const payeTax = Math.max(0, Math.round(grossTax - personalRelief));

  // 4. SHIF / NHIF: 2.75% of gross
  const nhif = Math.round(gross * 0.0275);

  // 5. Housing Levy: 1.5% of gross
  const housingLevy = Math.round(gross * 0.015);

  const totalDeductions = payeTax + nssf + nhif + housingLevy;
  const netPay = gross - totalDeductions;

  return {
    id: `ps_${emp.id}_${payrollRunId}`,
    payrollRunId,
    employeeId: emp.id,
    employeeCode: emp.employeeCode,
    employeeName: emp.fullName,
    departmentName: emp.departmentName,
    jobTitle: emp.jobTitle,
    kraPin: emp.kraPin,
    basicSalaryKes: basic,
    allowancesKes: allowances,
    grossSalaryKes: gross,
    payeTaxKes: payeTax,
    nssfDeductionKes: nssf,
    nhifDeductionKes: nhif,
    housingLevyKes: housingLevy,
    totalDeductionsKes: totalDeductions,
    netSalaryKes: netPay,
    paymentStatus: 'PENDING',
  };
}

export function generatePayrollRun(
  month: string,
  year: number,
  employees: EmployeeRecord[] = SEED_EMPLOYEES
): PayrollRunRecord {
  const runId = `pr_${year}_${month.toLowerCase().slice(0, 3)}`;
  const runNumber = `PAY-${year}-${month.toUpperCase().slice(0, 3)}`;
  const activeEmps = employees.filter((e) => e.isActive);

  const payslips = activeEmps.map((emp) => calculateKenyanPayslip(emp, runId));

  const totalGrossKes = payslips.reduce((s, p) => s + p.grossSalaryKes, 0);
  const totalPayeKes = payslips.reduce((s, p) => s + p.payeTaxKes, 0);
  const totalNssfKes = payslips.reduce((s, p) => s + p.nssfDeductionKes, 0);
  const totalNhifKes = payslips.reduce((s, p) => s + p.nhifDeductionKes, 0);
  const totalHousingLevyKes = payslips.reduce((s, p) => s + p.housingLevyKes, 0);
  const totalDeductionsKes = payslips.reduce((s, p) => s + p.totalDeductionsKes, 0);
  const totalNetPayKes = payslips.reduce((s, p) => s + p.netSalaryKes, 0);

  return {
    id: runId,
    runNumber,
    month,
    year,
    periodLabel: `${month} ${year}`,
    employeeCount: activeEmps.length,
    totalGrossKes,
    totalPayeKes,
    totalNssfKes,
    totalNhifKes,
    totalHousingLevyKes,
    totalDeductionsKes,
    totalNetPayKes,
    status: 'APPROVED',
    approvedBy: 'Patrick Otieno (Head of Finance)',
    approvedAt: `${year}-11-02 11:30`,
    payslips,
  };
}

export const SEED_PAYROLL_RUNS: PayrollRunRecord[] = [
  generatePayrollRun('November', 2026, SEED_EMPLOYEES),
];

export const SEED_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att_01',
    employeeId: 'emp_01',
    employeeName: 'Kimani Mwangi',
    date: '2026-11-11',
    clockInTime: '08:05',
    clockOutTime: '17:30',
    hoursWorked: 9.4,
    status: 'PRESENT',
  },
  {
    id: 'att_02',
    employeeId: 'emp_02',
    employeeName: 'Patrick Otieno',
    date: '2026-11-11',
    clockInTime: '08:22',
    clockOutTime: '17:15',
    hoursWorked: 8.9,
    status: 'PRESENT',
  },
  {
    id: 'att_03',
    employeeId: 'emp_03',
    employeeName: 'Sarah Chebet',
    date: '2026-11-11',
    clockInTime: '08:14',
    clockOutTime: '17:00',
    hoursWorked: 8.8,
    status: 'PRESENT',
  },
  {
    id: 'att_04',
    employeeId: 'emp_04',
    employeeName: 'David Ochieng',
    date: '2026-11-11',
    clockInTime: '09:05',
    clockOutTime: '18:10',
    hoursWorked: 9.1,
    status: 'LATE',
  },
  {
    id: 'att_05',
    employeeId: 'emp_05',
    employeeName: 'Hassan Abdi',
    date: '2026-11-11',
    clockInTime: '07:45',
    clockOutTime: '16:45',
    hoursWorked: 9.0,
    status: 'PRESENT',
  },
];

export const SEED_LEAVE_REQUESTS: LeaveRequestRecord[] = [
  {
    id: 'leave_01',
    employeeId: 'emp_03',
    employeeName: 'Sarah Chebet',
    leaveType: 'ANNUAL',
    startDate: '2026-12-15',
    endDate: '2026-12-24',
    daysCount: 8,
    reason: 'Year-end family leave & rest period',
    status: 'APPROVED',
    approvedBy: 'Patrick Otieno',
  },
  {
    id: 'leave_02',
    employeeId: 'emp_05',
    employeeName: 'Hassan Abdi',
    leaveType: 'SICK',
    startDate: '2026-11-14',
    endDate: '2026-11-15',
    daysCount: 2,
    reason: 'Medical checkup & outpatient clinic appointment',
    status: 'PENDING',
  },
];

// ============================================================================
// 5. FIXED ASSETS & PROJECTS
// ============================================================================

export const SEED_FIXED_ASSETS: FixedAssetRecord[] = [
  {
    id: 'ast_01',
    assetTag: 'AST-NBO-SRV-01',
    name: 'Dell PowerEdge R750 Rack Server (eTIMS Air-Gap Cluster)',
    category: 'HARDWARE',
    location: 'Nairobi HQ Datacenter Rack 2',
    custodian: 'Alex Kibet (Sysadmin)',
    purchaseDate: '2024-01-15',
    purchaseCostKes: 1850000,
    depreciationRateAnnual: 0.2, // 20% Straight Line
    accumulatedDepreciationKes: 740000,
    netBookValueKes: 1110000,
    status: 'ACTIVE',
  },
  {
    id: 'ast_02',
    assetTag: 'AST-NBO-NET-02',
    name: 'Cisco Catalyst 9300 48-Port PoE+ Core Switch',
    category: 'HARDWARE',
    location: 'Westlands Comms Room 1',
    custodian: 'Alex Kibet (Sysadmin)',
    purchaseDate: '2024-04-10',
    purchaseCostKes: 680000,
    depreciationRateAnnual: 0.2,
    accumulatedDepreciationKes: 272000,
    netBookValueKes: 408000,
    status: 'ACTIVE',
  },
  {
    id: 'ast_03',
    assetTag: 'AST-LOG-VEH-01',
    name: 'Toyota Probox 1.5L Logistics Delivery Van (KDF 289Q)',
    category: 'VEHICLE',
    location: 'Nairobi Central Master Warehouse Bay 1',
    custodian: 'Hassan Abdi (Warehouse Mgr)',
    purchaseDate: '2023-08-20',
    purchaseCostKes: 1450000,
    depreciationRateAnnual: 0.25,
    accumulatedDepreciationKes: 725000,
    netBookValueKes: 725000,
    status: 'ACTIVE',
  },
  {
    id: 'ast_04',
    assetTag: 'AST-MSA-UPS-01',
    name: 'APC Smart-UPS RT 10kVA Industrial Battery Backup',
    category: 'INFRASTRUCTURE',
    location: 'Mombasa Coastal Branch Power Hub',
    custodian: 'Omar Salim',
    purchaseDate: '2024-06-01',
    purchaseCostKes: 520000,
    depreciationRateAnnual: 0.2,
    accumulatedDepreciationKes: 104000,
    netBookValueKes: 416000,
    status: 'ACTIVE',
  },
];

export const SEED_ERP_PROJECTS: ErpProjectRecord[] = [
  {
    id: 'prj_01',
    projectCode: 'PRJ-SAF-ETIMS-01',
    name: 'Safaricom Enterprise eTIMS Air-Gap Gateway Deployment',
    customerId: 'cust_01',
    customerName: 'Safaricom Enterprise PLC',
    leadManager: 'Brian Kiprono',
    startDate: '2026-10-15',
    deadline: '2026-12-15',
    budgetKes: 4500000,
    spentKes: 2650000,
    status: 'ACTIVE',
  },
  {
    id: 'prj_02',
    projectCode: 'PRJ-EQB-ERP-02',
    name: 'Equity Bank Western Hub Branch Financial Migration',
    customerId: 'cust_02',
    customerName: 'Equity Bank Group Kenya',
    leadManager: 'Brian Kiprono',
    startDate: '2026-11-01',
    deadline: '2027-01-30',
    budgetKes: 3200000,
    spentKes: 980000,
    status: 'ACTIVE',
  },
];
