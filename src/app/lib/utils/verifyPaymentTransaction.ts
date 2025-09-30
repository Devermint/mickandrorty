import {
  Aptos,
  type EntryFunctionPayloadResponse,
  type MultisigPayloadResponse,
  type TransactionPayloadResponse,
} from "@aptos-labs/ts-sdk";

export interface VerifyPaymentArgs {
  aptos: Aptos;
  transactionHash: string;
  expectedReceiver: string;
  minAmount: bigint;
  expectedSender?: string;
  maxAgeSecs?: number;
}

export interface VerifiedPayment {
  amount: bigint;
  timestampMicros: bigint;
  version: bigint;
}

const MICROS_PER_MILLI = 1_000n;
const MICROS_PER_SECOND = 1_000_000n;

const normalizeAddress = (address: string): string => {
  const stripped = address.toLowerCase().replace(/^0x/, "");
  return `0x${stripped.padStart(64, "0")}`;
};

const isEntryFunctionPayload = (
  payload?: TransactionPayloadResponse
): payload is EntryFunctionPayloadResponse => {
  return Boolean(payload && "function" in payload && Array.isArray(payload.arguments));
};

const asEntryFunctionPayload = (
  payload?: TransactionPayloadResponse
): EntryFunctionPayloadResponse | undefined => {
  if (isEntryFunctionPayload(payload)) {
    return payload;
  }

  if (payload && "transaction_payload" in payload) {
    const nested = (payload as MultisigPayloadResponse).transaction_payload;
    if (isEntryFunctionPayload(nested)) {
      return nested;
    }
  }

  return undefined;
};

const extractReceiverFromArgs = (args: unknown[]): string | undefined => {
  const [receiver] = args;
  if (typeof receiver === "string") {
    return receiver;
  }
  return undefined;
};

const extractAmountFromArgs = (args: unknown[]): bigint | undefined => {
  const [, rawAmount] = args;
  if (typeof rawAmount === "string" || typeof rawAmount === "number" || typeof rawAmount === "bigint") {
    try {
      return BigInt(rawAmount);
    } catch {
      return undefined;
    }
  }
  return undefined;
};

export class PaymentVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentVerificationError";
  }
}

export const verifyPaymentTransaction = async ({
  aptos,
  transactionHash,
  expectedReceiver,
  minAmount,
  expectedSender,
  maxAgeSecs = 300,
}: VerifyPaymentArgs): Promise<VerifiedPayment> => {
  const transaction = await aptos.getTransactionByHash({ transactionHash });

  if (transaction.type !== "user_transaction") {
    throw new PaymentVerificationError("Transaction is not finalized or not a user transaction");
  }

  if (!transaction.success) {
    throw new PaymentVerificationError("Transaction did not succeed on-chain");
  }

  if (expectedSender) {
    const normalizedSender = normalizeAddress(transaction.sender);
    if (normalizedSender !== normalizeAddress(expectedSender)) {
      throw new PaymentVerificationError("Transaction sender does not match the connected wallet");
    }
  }

  const entryPayload = asEntryFunctionPayload(transaction.payload);
  if (!entryPayload) {
    throw new PaymentVerificationError("Unsupported transaction payload type");
  }

  const receiver = extractReceiverFromArgs(entryPayload.arguments ?? []);
  if (!receiver) {
    throw new PaymentVerificationError("Could not read receiver address from transaction");
  }

  if (normalizeAddress(receiver) !== normalizeAddress(expectedReceiver)) {
    throw new PaymentVerificationError("Transaction receiver does not match treasury account");
  }

  const amount = extractAmountFromArgs(entryPayload.arguments ?? []);
  if (amount === undefined) {
    throw new PaymentVerificationError("Could not read transfer amount from transaction");
  }

  if (amount < minAmount) {
    throw new PaymentVerificationError("Transfer amount is below the required fee");
  }

  const timestampMicros = BigInt(transaction.timestamp);
  const nowMicros = BigInt(Date.now()) * MICROS_PER_MILLI;
  const maxAgeMicros = BigInt(maxAgeSecs) * MICROS_PER_SECOND;
  if (nowMicros - timestampMicros > maxAgeMicros) {
    throw new PaymentVerificationError("Transaction is older than the allowed time window");
  }

  return {
    amount,
    timestampMicros,
    version: BigInt(transaction.version),
  };
};
