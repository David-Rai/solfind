import React, { useState } from "react";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TransferSolPhantom = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [toPubkey, setToPubkey] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState("");

  // ✅ Connect Phantom Wallet
  const connectWallet = async () => {
    try {
      const provider = window.solana;
      if (!provider) {
        toast.error("🦊 Please install Phantom Wallet first!");
        return;
      }

      const resp = await provider.connect();
      setWalletAddress(resp.publicKey.toString());
      toast.success("✅ Wallet Connected!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to connect wallet");
    }
  };

  // ✅ Transfer SOL
  const handleTransfer = async () => {
    try {
      if (!walletAddress) {
        toast.error("⚠️ Please connect your wallet first!");
        return;
      }
      if (!toPubkey || !amount) {
        toast.error("⚠️ Enter recipient and amount!");
        return;
      }

      setLoading(true);
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");

      const fromPubkey = new PublicKey(walletAddress);
      const toPublicKey = new PublicKey(toPubkey);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey: toPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      transaction.feePayer = fromPubkey;
      transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

      // 🪄 Request Phantom to sign the transaction
      const signed = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      setTxSignature(signature);
      toast.success("✅ Transfer Successful!");
    } catch (error) {
      console.error(error);
      toast.error(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-green-400">💸 Transfer SOL (Phantom + Devnet)</h1>

      {!walletAddress ? (
        <button
          onClick={connectWallet}
          className="bg-green-600 hover:bg-green-700 rounded-lg px-4 py-2 mb-4 font-semibold"
        >
          Connect Phantom Wallet
        </button>
      ) : (
        <p className="text-gray-400 mb-3 text-sm break-all">
          Connected: {walletAddress}
        </p>
      )}

      <div className="flex flex-col gap-3 w-full max-w-md">
        <input
          type="text"
          placeholder="Recipient Public Key"
          className="p-2 bg-gray-800 rounded-lg outline-none"
          value={toPubkey}
          onChange={(e) => setToPubkey(e.target.value)}
        />
        <input
          type="number"
          placeholder="Amount (SOL)"
          className="p-2 bg-gray-800 rounded-lg outline-none"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          onClick={handleTransfer}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 rounded-lg p-2 font-semibold mt-2"
        >
          {loading ? "Transferring..." : "Send SOL"}
        </button>

        {txSignature && (
          <a
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 mt-3 underline text-center"
          >
            🔗 View on Solana Explorer
          </a>
        )}
      </div>

      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default TransferSolPhantom;
