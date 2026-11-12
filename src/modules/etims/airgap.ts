/**
 * INNOWIT ONE WORKSPACE — KENYA eTIMS AIR-GAP SECURITY GUARD
 * Strict isolation between Sandbox Test Mode and Live Production KRA Endpoints.
 *
 * @license Apache-2.0
 */

import { UserRole } from '@/types';
import { logAuditEntry } from '@/modules/audit/store';

export interface AirGapSecurityStatus {
  isAirGapped: boolean;
  environment: 'SANDBOX' | 'PRODUCTION';
  productionTrafficAllowed: boolean;
  superAdminCertified: boolean;
  lastCertifiedAt?: string;
  certifiedBy?: string;
  activeEndpointUrl: string;
}

export const KRA_ENDPOINTS = {
  SANDBOX: 'https://etims-sbx.kra.go.ke/etims-api/v1/taxpayer-invoices',
  PRODUCTION: 'https://etims.kra.go.ke/etims-api/v1/taxpayer-invoices',
};

const AIRGAP_STORAGE_KEY = 'innowit_etims_airgap_v1';

export function loadAirGapStatus(): AirGapSecurityStatus {
  try {
    const raw = localStorage.getItem(AIRGAP_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load air-gap security state:', err);
  }

  // Default: Strict Air-Gap Active (Sandbox Mode)
  return {
    isAirGapped: true,
    environment: 'SANDBOX',
    productionTrafficAllowed: false,
    superAdminCertified: false,
    activeEndpointUrl: KRA_ENDPOINTS.SANDBOX,
  };
}

export function saveAirGapStatus(status: AirGapSecurityStatus): void {
  try {
    localStorage.setItem(AIRGAP_STORAGE_KEY, JSON.stringify(status));
  } catch (err) {
    console.error('Failed to save air-gap status:', err);
  }
}

/**
 * Validates whether an outbound transmission is permitted.
 * If in Sandbox, any production URL attempt is strictly BLOCKED.
 */
export function validateOutboundTransmission(
  targetUrl: string,
  isSandbox: boolean
): { allowed: boolean; reason: string; endpoint: string } {
  // Rule 1: In Sandbox, live production endpoint is completely forbidden
  if (isSandbox) {
    if (targetUrl === KRA_ENDPOINTS.PRODUCTION) {
      return {
        allowed: false,
        reason: 'AIR-GAP SECURITY VIOLATION: Outbound calls to Live KRA Production endpoints are strictly prohibited while running in Sandbox mode.',
        endpoint: KRA_ENDPOINTS.SANDBOX,
      };
    }
    return {
      allowed: true,
      reason: 'Sandbox transmission permitted to KRA Test OSCU sandbox mock.',
      endpoint: KRA_ENDPOINTS.SANDBOX,
    };
  }

  // Rule 2: If in Production, ensure explicit airgap status is certified
  const airgap = loadAirGapStatus();
  if (!airgap.superAdminCertified || !airgap.productionTrafficAllowed) {
    return {
      allowed: false,
      reason: 'PRODUCTION LOCK ENGAGED: Production transmission blocked. Requires explicit dual-step Super Admin authorization and digital certification.',
      endpoint: KRA_ENDPOINTS.SANDBOX,
    };
  }

  return {
    allowed: true,
    reason: 'Production authorization certified. Outbound transmission permitted to KRA Live OSCU/VSCU.',
    endpoint: KRA_ENDPOINTS.PRODUCTION,
  };
}

/**
 * Super Admin Dual-Step Production Activation Gate
 */
export function activateProductionAirGap(params: {
  userId: string;
  userFullName: string;
  userRole: UserRole;
  confirmationPhrase: string;
  taxpayerPin: string;
}): { success: boolean; message: string; status: AirGapSecurityStatus } {
  // Step 1: Role Verification (Strict Super Admin Only)
  if (params.userRole !== 'SUPER_ADMIN') {
    return {
      success: false,
      message: 'Unauthorized: Only SUPER_ADMIN (Managing Director / CEO) can authorize Live Production eTIMS activation.',
      status: loadAirGapStatus(),
    };
  }

  // Step 2: Explicit Confirmation Phrase Verification
  const expectedPhrase = `ACTIVATE-LIVE-KRA-${params.taxpayerPin}`;
  if (params.confirmationPhrase !== expectedPhrase) {
    return {
      success: false,
      message: `Invalid confirmation phrase. Expected exact phrase: "${expectedPhrase}"`,
      status: loadAirGapStatus(),
    };
  }

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const updatedStatus: AirGapSecurityStatus = {
    isAirGapped: false,
    environment: 'PRODUCTION',
    productionTrafficAllowed: true,
    superAdminCertified: true,
    lastCertifiedAt: timestamp,
    certifiedBy: `${params.userFullName} (${params.userRole})`,
    activeEndpointUrl: KRA_ENDPOINTS.PRODUCTION,
  };

  saveAirGapStatus(updatedStatus);

  logAuditEntry({
    userId: params.userId,
    userFullName: params.userFullName,
    userRole: params.userRole,
    action: 'APPROVE',
    entityType: 'EtimsConfiguration',
    entityId: 'etims_prod_activation',
    entityName: 'Live eTIMS Production Air-Gap Certification',
    changes: {
      action: 'PRODUCTION_ACTIVATED',
      certifiedBy: params.userFullName,
      timestamp,
      confirmationPhrase: params.confirmationPhrase,
    },
  });

  return {
    success: true,
    message: 'Live Production eTIMS activation certified. Invoices will now receive legal KRA fiscal signatures.',
    status: updatedStatus,
  };
}

/**
 * Restores Sandbox Air-Gap Lock
 */
export function lockSandboxAirGap(params: {
  userId: string;
  userFullName: string;
  userRole: UserRole;
}): AirGapSecurityStatus {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const updatedStatus: AirGapSecurityStatus = {
    isAirGapped: true,
    environment: 'SANDBOX',
    productionTrafficAllowed: false,
    superAdminCertified: false,
    lastCertifiedAt: timestamp,
    certifiedBy: `${params.userFullName} (${params.userRole})`,
    activeEndpointUrl: KRA_ENDPOINTS.SANDBOX,
  };

  saveAirGapStatus(updatedStatus);

  logAuditEntry({
    userId: params.userId,
    userFullName: params.userFullName,
    userRole: params.userRole,
    action: 'UPDATE',
    entityType: 'EtimsConfiguration',
    entityId: 'etims_sandbox_lock',
    entityName: 'Sandbox Air-Gap Lock Restored',
    changes: {
      action: 'SANDBOX_LOCKED',
      timestamp,
    },
  });

  return updatedStatus;
}
