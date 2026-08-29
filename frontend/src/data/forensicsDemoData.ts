import { RawTransactionRecord } from '../types';
import { generateSyntheticInvestigation } from '../utils/forensicsEngine';

/**
 * Anonymous synthetic sample dataset used as a dynamic baseline.
 * Generated dynamically with random anonymous accounts and varied amounts.
 */
export const rawDemoTransactions: RawTransactionRecord[] = generateSyntheticInvestigation({ complexity: 'MEDIUM' });
