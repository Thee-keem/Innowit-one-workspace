import {
  EtimsConfigurationRecord,
  EtimsQueueItem,
  CreditNoteRecord,
  InvoiceRecord,
} from '@/types';

export const DEFAULT_ETIMS_CONFIG: EtimsConfigurationRecord = {
  id: 'etims_cfg_01',
  legalName: 'Innowit Technologies Limited',
  tradeName: 'Innowit One Solutions',
  kraPin: 'P051234567Z',
  branchCode: '00',
  vatNumber: '051234567Z',
  mode: 'OSCU',
  environment: 'SANDBOX',
  deviceSerial: 'KRAMU010049-SEC',
  clientSecretMasked: 'sec_live_9f82a17cb099234e****************',
  apiUrl: 'https://etims-sbx.kra.go.ke/etims-api/v1/taxpayer-invoices',
  isCertified: true,
  isProductionActive: false, // AIR-GAP PROTECTED!
  vatOutputAccount: '2020 - KRA VAT Output Liability (16%)',
  vatInputAccount: '2020 - KRA VAT Input Tax (16%)',
  withholdingAccount: '2030 - Withholding VAT Payable (2%)',
  lastPingLatencyMs: 28,
  lastPingStatus: 'CONNECTED',
};

export function serializeKraEtimsPayload(invoice: {
  invoiceNumber: string;
  customerPin: string;
  customerName: string;
  issueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  items?: any[];
}): string {
  const payload = {
    taxpayerInfo: {
      tin: 'P051234567Z',
      bhfId: '00',
      dvcSrlNo: 'KRAMU010049-SEC',
    },
    custInfo: {
      custTin: invoice.customerPin || 'P051112233Q',
      custNm: invoice.customerName,
      prcType: '1',
    },
    trdInvcNo: invoice.invoiceNumber,
    invcType: '1', // 1=Copy Tax Invoice
    pmtTyCd: '01', // 01=Cash/Bank
    cfrmDate: `${invoice.issueDate} 12:00:00`,
    totItemCnt: invoice.items?.length || 1,
    taxblAmtA: invoice.subtotal,
    taxAmtA: invoice.taxAmount,
    totTaxblAmt: invoice.subtotal,
    totTaxAmt: invoice.taxAmount,
    totAmt: invoice.totalAmount,
    itemList: (invoice.items || []).map((item, idx) => ({
      itemSeq: idx + 1,
      itemCd: item.productSku || item.productId || 'INNO-SKU-01',
      itemNm: item.productName || item.description || 'Enterprise Technology Item',
      pkgUnitCd: 'EA',
      qtyUnitCd: 'U',
      qty: item.quantity || 1,
      prc: item.unitPrice || item.unitPriceKes || invoice.subtotal,
      splyAmt: (item.quantity || 1) * (item.unitPrice || item.unitPriceKes || invoice.subtotal),
      taxTyCd: 'A', // 16%
      taxAmt: item.taxAmount || Math.round(((item.quantity || 1) * (item.unitPrice || item.unitPriceKes || invoice.subtotal)) * 0.16),
      totAmt: item.lineTotal || Math.round(((item.quantity || 1) * (item.unitPrice || item.unitPriceKes || invoice.subtotal)) * 1.16),
    })),
  };

  return JSON.stringify(payload, null, 2);
}

export function serializeKraResponse(invoiceNumber: string, cuNumber: string, totalAmount: number): string {
  const controlNo = `KRA2026${Date.now().toString().slice(-7)}`;
  const signature = `SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const response = {
    resultCd: '00',
    resultMsg: 'Successful transmission to KRA eTIMS Gateway (ACK Code: 00)',
    resultDt: new Date().toISOString(),
    data: {
      rcptNo: controlNo,
      intrlData: signature,
      rcptSign: signature,
      qrCdUrl: `https://itax.kra.go.ke/verify?cu=${cuNumber}&inv=${invoiceNumber}&tot=${totalAmount}&sign=${signature}`,
    },
  };

  return JSON.stringify(response, null, 2);
}

export const SEED_ETIMS_QUEUE: EtimsQueueItem[] = [
  {
    id: 'queue_01',
    invoiceId: 'inv_01',
    invoiceNumber: 'INV-2026-0189',
    customerName: 'Safaricom Enterprise PLC',
    customerPin: 'P051112233Q',
    idempotencyKey: '4a6b2c89-9e32-4d51-8f11-c91823901b01',
    mode: 'OSCU',
    environment: 'SANDBOX',
    status: 'ACCEPTED',
    totalAmountKes: 1160000,
    vatAmountKes: 160000,
    cuNumber: 'KRAMU010049281',
    kraControlNumber: 'KRA2026110800918',
    internalSignature: 'SIG-8F92AC11-99B2',
    qrPayload: 'https://itax.kra.go.ke/verify?cu=KRAMU010049281&inv=INV-2026-0189&tot=1160000',
    attemptCount: 1,
    transmissionTimestamp: '2026-11-08 14:22:19',
    payloadJson: serializeKraEtimsPayload({
      invoiceNumber: 'INV-2026-0189',
      customerPin: 'P051112233Q',
      customerName: 'Safaricom Enterprise PLC',
      issueDate: '2026-11-08',
      subtotal: 1000000,
      taxAmount: 160000,
      totalAmount: 1160000,
    }),
    responseJson: serializeKraResponse('INV-2026-0189', 'KRAMU010049281', 1160000),
  },
  {
    id: 'queue_02',
    invoiceId: 'inv_02',
    invoiceNumber: 'INV-2026-0190',
    customerName: 'Equity Bank Group Kenya',
    customerPin: 'P051998877K',
    idempotencyKey: '8d2a1b77-3e11-4f92-9a02-e81729381c02',
    mode: 'OSCU',
    environment: 'SANDBOX',
    status: 'ACCEPTED',
    totalAmountKes: 580000,
    vatAmountKes: 80000,
    cuNumber: 'KRAMU010049282',
    kraControlNumber: 'KRA2026110900142',
    internalSignature: 'SIG-2B11CD88-44A9',
    qrPayload: 'https://itax.kra.go.ke/verify?cu=KRAMU010049282&inv=INV-2026-0190&tot=580000',
    attemptCount: 1,
    transmissionTimestamp: '2026-11-09 10:15:44',
    payloadJson: serializeKraEtimsPayload({
      invoiceNumber: 'INV-2026-0190',
      customerPin: 'P051998877K',
      customerName: 'Equity Bank Group Kenya',
      issueDate: '2026-11-09',
      subtotal: 500000,
      taxAmount: 80000,
      totalAmount: 580000,
    }),
    responseJson: serializeKraResponse('INV-2026-0190', 'KRAMU010049282', 580000),
  },
  {
    id: 'queue_03',
    invoiceId: 'inv_03',
    invoiceNumber: 'INV-2026-0191',
    customerName: 'Twiga Foods Limited',
    customerPin: 'P051443322M',
    idempotencyKey: '9e11fc34-5b22-48a1-b839-d71629482d03',
    mode: 'OSCU',
    environment: 'SANDBOX',
    status: 'PENDING',
    totalAmountKes: 348000,
    vatAmountKes: 48000,
    cuNumber: 'KRAMU010049283',
    attemptCount: 0,
    payloadJson: serializeKraEtimsPayload({
      invoiceNumber: 'INV-2026-0191',
      customerPin: 'P051443322M',
      customerName: 'Twiga Foods Limited',
      issueDate: '2026-11-11',
      subtotal: 300000,
      taxAmount: 48000,
      totalAmount: 348000,
    }),
  },
  {
    id: 'queue_04',
    invoiceId: 'inv_04',
    invoiceNumber: 'INV-2026-0192',
    customerName: 'KCB Bank Group',
    customerPin: 'P051778899T',
    idempotencyKey: '1b89fa22-4c33-49d2-9c12-f61528371e04',
    mode: 'OSCU',
    environment: 'SANDBOX',
    status: 'RETRY_SCHEDULED',
    totalAmountKes: 260000,
    vatAmountKes: 35862,
    cuNumber: 'KRAMU010049284',
    attemptCount: 2,
    lastError: 'ERR-NET-TIMEOUT: KRA Gateway temporary handshake timeout on endpoint',
    nextRetryAt: '2026-11-12 14:00:00',
    payloadJson: serializeKraEtimsPayload({
      invoiceNumber: 'INV-2026-0192',
      customerPin: 'P051778899T',
      customerName: 'KCB Bank Group',
      issueDate: '2026-11-10',
      subtotal: 224138,
      taxAmount: 35862,
      totalAmount: 260000,
    }),
  },
];

export const SEED_CREDIT_NOTES: CreditNoteRecord[] = [
  {
    id: 'cn_01',
    creditNoteNumber: 'CN-2026-0008',
    originalInvoiceId: 'inv_01',
    originalInvoiceNumber: 'INV-2026-0189',
    originalKraControlNumber: 'KRA2026110800918',
    customerName: 'Safaricom Enterprise PLC',
    customerPin: 'P051112233Q',
    reasonCode: 'RETURN_GOODS',
    reasonNotes: 'Return of 1 unit defective controller kit under warranty swap',
    subtotalKes: 75000,
    taxAmountKes: 12000,
    totalAmountKes: 87000,
    status: 'ACCEPTED',
    kraControlNumber: 'KRA-CN-202611090001',
    cuNumber: 'KRAMU010049281',
    issuedAt: '2026-11-09 16:30',
    journalEntryId: 'je_cn_001',
    items: [
      {
        productId: 'prod_02',
        productSku: 'INNO-ETIMS-GATEWAY',
        productName: 'eTIMS OSCU Physical Controller / Air-Gap Appliance',
        quantity: 1,
        unitPriceKes: 75000,
        taxRate: 0.16,
        lineTotalKes: 87000,
      },
    ],
  },
];
