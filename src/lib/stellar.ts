import * as StellarSdk from 'stellar-sdk';
import { 
  isConnected, 
  getAddress, 
  signTransaction, 
  setAllowed,
  isAllowed
} from '@stellar/freighter-api';

// Initialize Stellar Server (Testnet by default)
export const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

export const isFreighterConnected = async () => {
  return await isConnected();
};

export const getFreighterPublicKey = async () => {
  if (!(await isAllowed())) {
    await setAllowed();
  }
  const result = await getAddress();
  if (result.error) {
    throw new Error(result.error);
  }
  return result.address;
};

export const createAccount = () => {
  const pair = StellarSdk.Keypair.random();
  return {
    publicKey: pair.publicKey(),
    secret: pair.secret(),
  };
};

export const fundAccount = async (publicKey: string) => {
  const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
  if (!response.ok) {
    throw new Error('Failed to fund account via Friendbot');
  }
  return await response.json();
};

export const getTransactionHistory = async (publicKey: string) => {
  try {
    const operations = await server.operations()
      .forAccount(publicKey)
      .limit(10)
      .order('desc')
      .call();
    
    return operations.records.map((op: any) => ({
      id: op.id,
      type: op.type,
      amount: op.amount || null,
      asset: op.asset_code || 'XLM',
      to: op.to || op.into || null,
      from: op.from || null,
      createdAt: op.created_at,
      transactionHash: op.transaction_hash,
    }));
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
};

export const getBalance = async (publicKey: string) => {
  try {
    const account = await server.loadAccount(publicKey);
    return account.balances;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return [];
  }
};

export const loadAccount = async (publicKey: string) => {
  return await server.loadAccount(publicKey);
};

export const submitMicropayment = async (secretKey: string, memo: string = "StellarMind:x402") => {
  try {
    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const sourcePublicKey = sourceKeypair.publicKey();

    const account = await server.loadAccount(sourcePublicKey);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: sourcePublicKey,
        asset: StellarSdk.Asset.native(),
        amount: "0.0001",
      }))
      .addMemo(StellarSdk.Memo.text(memo))
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);

    return await server.submitTransaction(transaction);
  } catch (error) {
    console.error('Micropayment error:', error);
    throw error;
  }
};

export const submitFreighterMicropayment = async (publicKey: string, memo: string = "StellarMind:x402") => {
  try {
    const account = await server.loadAccount(publicKey);

    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: publicKey,
        asset: StellarSdk.Asset.native(),
        amount: "0.0001",
      }))
      .addMemo(StellarSdk.Memo.text(memo))
      .setTimeout(30)
      .build();

    const xdr = transaction.toXDR();
    const result: any = await signTransaction(xdr, {
      networkPassphrase: StellarSdk.Networks.TESTNET,
    });

    const signedXdr = typeof result === 'string' ? result : result.signedTxXdr;
    const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET);
    return await server.submitTransaction(signedTransaction);
  } catch (error) {
    console.error('Freighter Micropayment error:', error);
    throw error;
  }
};

export const getTransactionUrl = (hash: string) => {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
};
