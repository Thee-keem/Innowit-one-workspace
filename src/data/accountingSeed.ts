import {
  InvoiceRecord,
  JournalEntry,
  Account,
} from '@/types';
import { DEFAULT_ACCOUNTS, DEFAULT_JOURNAL_ENTRIES } from './kernel';

export interface BankTransactionRecord {
  id: string;
  date: string;
  reference: string;
  description: string;
  amount: number; // positive = credit/deposit, negative = debit/withdrawal
  isMatched: boolean;
  matchedJournalEntryId?: string;
  source: 'STATEMENT_IMPORT' | 'MANUAL';
}

export interface SupplierBillRecord {
  id: string;
  billNumber: string;
  supplierName: string;
  supplierPin: string;
  poReference: string;
  grnReference: string;
  date: string;
  dueDate: string;
  totalAmountKes: number;
  status: 'PENDING_MATCH' | 'MATCHED' | 'PAID';
  matchedAmountKes: number;
}

export const SEED_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv_1001',
    invoiceNumber: 'INV-2026-0041',
    customerId: 'cust_equity',
    customerName: 'Equity Group Holdings',
    customerPin: 'P051987654A',
    customerAddress: 'Equity Centre, 9th Floor, Hospital Road, Upper Hill, Nairobi',
    issueDate: '2026-10-15',
    dueDate: '2026-11-15',
    paymentTermsDays: 30,
    status: 'PAID',
    items: [
      {
        id: 'item_1',
        productId: 'prod_01',
        productName: 'Innowit Core ERP Enterprise License',
        description: 'Annual corporate multi-branch platform license (50 Users)',
        quantity: 1,
        unitPrice: 3500000,
        taxRate: 0.16,
        taxClassification: 'STANDARD_16',
        taxAmount: 560000,
        lineTotal: 4060000,
      },
    ],
    subtotal: 3500000,
    taxAmount: 560000,
    totalAmount: 4060000,
    paidAmount: 4060000,
    balanceDue: 0,
    kraControlNumber: 'KRA2026101500410',
    kraQrPayload: 'https://itax.kra.go.ke/verify?cu=KRAMU010049281&receipt=KRA2026101500410',
    payments: [
      {
        id: 'pay_01',
        invoiceId: 'inv_1001',
        paymentNumber: 'RCPT-2026-0089',
        date: '2026-10-25',
        amount: 4060000,
        paymentMethod: 'BANK_TRANSFER',
        referenceCode: 'NCBA-TRF-094812',
        recordedBy: 'Sarah Chebet (Accountant)',
        notes: 'Full settlement received via Real-Time Gross Settlement (RTGS).',
      },
    ],
    createdAt: '2026-10-15',
  },
  {
    id: 'inv_1002',
    invoiceNumber: 'INV-2026-0042',
    customerId: 'cust_safaricom',
    customerName: 'Safaricom PLC',
    customerPin: 'P051123456Z',
    customerAddress: 'Waiyaki Way, Westlands, Nairobi',
    issueDate: '2026-11-01',
    dueDate: '2026-12-01',
    paymentTermsDays: 30,
    status: 'KRA_ACCEPTED',
    items: [
      {
        id: 'item_2',
        productId: 'prod_02',
        productName: 'KRA eTIMS Middleware Gateway Appliance',
        description: 'Hardware crypto accelerator with integrated REST eTIMS proxy',
        quantity: 2,
        unitPrice: 1250000,
        taxRate: 0.16,
        taxClassification: 'STANDARD_16',
        taxAmount: 400000,
        lineTotal: 2900000,
      },
    ],
    subtotal: 2500000,
    taxAmount: 400000,
    totalAmount: 2900000,
    paidAmount: 1650000,
    balanceDue: 1250000,
    kraControlNumber: 'KRA2026110100421',
    kraQrPayload: 'https://itax.kra.go.ke/verify?cu=KRAMU010049281&receipt=KRA2026110100421',
    payments: [
      {
        id: 'pay_02',
        invoiceId: 'inv_1002',
        paymentNumber: 'RCPT-2026-0094',
        date: '2026-11-05',
        amount: 1650000,
        paymentMethod: 'BANK_TRANSFER',
        referenceCode: 'STANBIC-EFT-44129',
        recordedBy: 'Patrick Otieno (Finance Manager)',
        notes: '50% project mobilization advance payment.',
      },
    ],
    createdAt: '2026-11-01',
  },
  {
    id: 'inv_1003',
    invoiceNumber: 'INV-2026-0043',
    customerId: 'cust_naivas',
    customerName: 'Naivas Supermarkets Ltd',
    customerPin: 'P051222333E',
    customerAddress: 'Gate City Complex, Mombasa Road, Industrial Area, Nairobi',
    issueDate: '2026-11-04',
    dueDate: '2026-12-04',
    paymentTermsDays: 30,
    status: 'POSTED',
    items: [
      {
        id: 'item_3',
        productId: 'prod_03',
        productName: 'Warehouse Barcode Scanner Terminals (Ruggedized)',
        description: 'Ruggedized Android handheld POS scanners for retail dispatch',
        quantity: 8,
        unitPrice: 65000,
        taxRate: 0.16,
        taxClassification: 'STANDARD_16',
        taxAmount: 83200,
        lineTotal: 603200,
      },
    ],
    subtotal: 520000,
    taxAmount: 83200,
    totalAmount: 603200,
    paidAmount: 0,
    balanceDue: 603200,
    kraControlNumber: 'KRA2026110400432',
    kraQrPayload: 'https://itax.kra.go.ke/verify?cu=KRAMU010049281&receipt=KRA2026110400432',
    payments: [],
    createdAt: '2026-11-04',
  },
  {
    id: 'inv_1004',
    invoiceNumber: 'INV-2026-0044',
    customerId: 'cust_twiga',
    customerName: 'Twiga Foods Limited',
    customerPin: 'P051456789B',
    customerAddress: 'Twiga Distribution Complex, Ruiru Tatu City',
    issueDate: '2026-10-01',
    dueDate: '2026-10-31',
    paymentTermsDays: 30,
    status: 'OVERDUE',
    items: [
      {
        id: 'item_4',
        productId: 'prod_04',
        productName: 'Cold-Chain IoT Telemetry Sensors',
        description: 'Wireless temperature and humidity monitoring nodes (10 pack)',
        quantity: 2,
        unitPrice: 180000,
        taxRate: 0.16,
        taxClassification: 'STANDARD_16',
        taxAmount: 57600,
        lineTotal: 417600,
      },
    ],
    subtotal: 360000,
    taxAmount: 57600,
    totalAmount: 417600,
    paidAmount: 0,
    balanceDue: 417600,
    kraControlNumber: 'KRA2026100100443',
    kraQrPayload: 'https://itax.kra.go.ke/verify?cu=KRAMU010049281&receipt=KRA2026100100443',
    payments: [],
    createdAt: '2026-10-01',
  },
];

export const SEED_BANK_TRANSACTIONS: BankTransactionRecord[] = [
  {
    id: 'bt_01',
    date: '2026-10-25',
    reference: 'NCBA-TRF-094812',
    description: 'RTGS DEPOSIT: EQUITY GROUP HOLDINGS / INV-2026-0041',
    amount: 4060000,
    isMatched: true,
    matchedJournalEntryId: 'je_01',
    source: 'STATEMENT_IMPORT',
  },
  {
    id: 'bt_02',
    date: '2026-11-05',
    reference: 'STANBIC-EFT-44129',
    description: 'EFT CR: SAFARICOM PLC / INV-2026-0042 PARTIAL',
    amount: 1650000,
    isMatched: true,
    matchedJournalEntryId: 'je_02',
    source: 'STATEMENT_IMPORT',
  },
  {
    id: 'bt_03',
    date: '2026-11-08',
    reference: 'CHQ-004821',
    description: 'WITHDRAWAL: NAIROBI WATER & SEWERAGE CO',
    amount: -45000,
    isMatched: false,
    source: 'STATEMENT_IMPORT',
  },
  {
    id: 'bt_04',
    date: '2026-11-10',
    reference: 'MPESA-QJ882910',
    description: 'M-PESA PAYBILL 522522 / CLIENT INVOICE DEPOSIT',
    amount: 120000,
    isMatched: false,
    source: 'STATEMENT_IMPORT',
  },
];

export const SEED_SUPPLIER_BILLS: SupplierBillRecord[] = [
  {
    id: 'bill_01',
    billNumber: 'BILL-2026-019',
    supplierName: 'Dell Technologies East Africa',
    supplierPin: 'P051999888H',
    poReference: 'PO-2026-0012',
    grnReference: 'GRN-2026-0008',
    date: '2026-10-20',
    dueDate: '2026-11-20',
    totalAmountKes: 1850000,
    status: 'MATCHED',
    matchedAmountKes: 1850000,
  },
  {
    id: 'bill_02',
    billNumber: 'BILL-2026-020',
    supplierName: 'Liquid Intelligent Technologies',
    supplierPin: 'P051777666J',
    poReference: 'PO-2026-0015',
    grnReference: 'GRN-2026-0011',
    date: '2026-11-02',
    dueDate: '2026-12-02',
    totalAmountKes: 340000,
    status: 'PENDING_MATCH',
    matchedAmountKes: 0,
  },
];
