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
  AttendanceRecord,
  LeaveRequestRecord,
  FixedAssetRecord,
  ErpProjectRecord,
} from '@/types';
import {
  SEED_WAREHOUSES,
  SEED_WAREHOUSE_STOCKS,
  SEED_STOCK_MOVEMENTS,
  SEED_SUPPLIERS,
  SEED_PURCHASE_ORDERS,
  SEED_GOODS_RECEIPT_NOTES,
  SEED_SUPPLIER_BILLS,
  SEED_SALES_ORDERS,
  SEED_QUOTATIONS,
  SEED_DEPARTMENTS,
  SEED_EMPLOYEES,
  SEED_PAYROLL_RUNS,
  SEED_ATTENDANCE,
  SEED_LEAVE_REQUESTS,
  SEED_FIXED_ASSETS,
  SEED_ERP_PROJECTS,
} from '@/data/erpSeed';

const STORAGE_KEY = 'innowit_erp_v5';

export interface ErpState {
  warehouses: WarehouseRecord[];
  warehouseStocks: WarehouseStockRecord[];
  stockMovements: StockMovementRecord[];
  suppliers: SupplierRecord[];
  purchaseOrders: PurchaseOrderRecord[];
  goodsReceiptNotes: GoodsReceiptNoteRecord[];
  supplierBills: SupplierBillRecord[];
  salesOrders: SalesOrderRecord[];
  quotations: QuotationRecord[];
  departments: DepartmentRecord[];
  employees: EmployeeRecord[];
  payrollRuns: PayrollRunRecord[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequestRecord[];
  fixedAssets: FixedAssetRecord[];
  projects: ErpProjectRecord[];
}

export function loadErpState(): ErpState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed.warehouses &&
        parsed.purchaseOrders &&
        parsed.employees &&
        parsed.payrollRuns
      ) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load ERP state from localStorage:', err);
  }

  return {
    warehouses: SEED_WAREHOUSES,
    warehouseStocks: SEED_WAREHOUSE_STOCKS,
    stockMovements: SEED_STOCK_MOVEMENTS,
    suppliers: SEED_SUPPLIERS,
    purchaseOrders: SEED_PURCHASE_ORDERS,
    goodsReceiptNotes: SEED_GOODS_RECEIPT_NOTES,
    supplierBills: SEED_SUPPLIER_BILLS,
    salesOrders: SEED_SALES_ORDERS,
    quotations: SEED_QUOTATIONS,
    departments: SEED_DEPARTMENTS,
    employees: SEED_EMPLOYEES,
    payrollRuns: SEED_PAYROLL_RUNS,
    attendance: SEED_ATTENDANCE,
    leaveRequests: SEED_LEAVE_REQUESTS,
    fixedAssets: SEED_FIXED_ASSETS,
    projects: SEED_ERP_PROJECTS,
  };
}

export function saveErpState(state: ErpState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save ERP state to localStorage:', err);
  }
}
