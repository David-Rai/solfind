import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import supabase from "../supabase/supabase";

const SOLANA_NETWORK = "https://api.devnet.solana.com";
const CLUSTER = "devnet";


const TransferSolPhantom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [walletAddress, setWalletAddress] = useState(null);
  const [toPubkey, setToPubkey] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [txSignature, setTxSignature] = useState("");
  const [reportId, setReportId] = useState(null);

  useEffect(() => {
    const state = location?.state;
    if (state?.report?.reward) {
      setAmount(state.report.reward.toString());
    }
    if (state?.submit?.pubkey) {
      setToPubkey(state.submit.pubkey);
    }
    if (state?.report?.id) {
      setReportId(state.report.id);
    }
  }, [location]);

  const getPhantomProvider = () => {
    if ("solana" in window) {
      const provider = window.solana;
      if (provider.isPhantom) return provider;
    }
    return null;
  };

  const connectWallet = async () => {
    try {
      const provider = getPhantomProvider();
      
      if (!provider) {
        toast.error("🦊 Phantom Wallet not found. Please install it first!");
        window.open("https://phantom.app/", "_blank");
        return;
      }

      const response = await provider.connect();
      setWalletAddress(response.publicKey.toString());
      toast.success("✅ Wallet connected successfully!");
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("❌ Failed to connect wallet");
    }
  };

  const disconnectWallet = async () => {
    try {
      const provider = getPhantomProvider();
      if (provider) {
        await provider.disconnect();
        setWalletAddress(null);
        setTxSignature("");
        toast.info("👋 Wallet disconnected");
      }
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  const isValidPublicKey = (key) => {
    try {
      new PublicKey(key);
      return true;
    } catch {
      return false;
    }
  };

  const deleteReport = async () => {
    if (!reportId) return;
    
    try {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", reportId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const handleTransfer = async () => {
    if (!walletAddress) {
      toast.error("⚠️ Please connect your wallet first!");
      return;
    }

    if (!toPubkey.trim() || !amount) {
      toast.error("⚠️ Please enter recipient address and amount!");
      return;
    }

    if (!isValidPublicKey(toPubkey)) {
      toast.error("❌ Invalid recipient public key!");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("❌ Please enter a valid amount!");
      return;
    }

    setLoading(true);
    setTxSignature("");

    try {
      const connection = new Connection(SOLANA_NETWORK, "confirmed");
      const fromPubkey = new PublicKey(walletAddress);
      const toPublicKey = new PublicKey(toPubkey);

      const balance = await connection.getBalance(fromPubkey);
      const requiredLamports = amountNum * LAMPORTS_PER_SOL;
      
      if (balance < requiredLamports) {
        toast.error("❌ Insufficient balance!");
        return;
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey: toPublicKey,
          lamports: requiredLamports,
        })
      );

      transaction.feePayer = fromPubkey;
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");
      transaction.recentBlockhash = blockhash;

      const provider = getPhantomProvider();
      const signedTransaction = await provider.signTransaction(transaction);
      
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
          maxRetries: 3
        }
      );

      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, "confirmed");

      setTxSignature(signature);
      toast.success("✅ Transfer completed successfully!");
      
      await deleteReport();
      
      setTimeout(() => {
        navigate("/explore");
      }, 2000);
      
    } catch (error) {
      console.error("Transfer error:", error);
      
      if (error.message.includes("User rejected")) {
        toast.error("❌ Transaction rejected by user");
      } else if (error.message.includes("insufficient")) {
        toast.error("❌ Insufficient funds for transaction");
      } else if (error.message.includes("already been processed")) {
        toast.error("❌ Transaction already processed");
      } else {
        toast.error(`❌ Transfer failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          💸 Transfer SOL
        </h1>

        <div className="mb-6">
          {!walletAddress ? (
            <button
              onClick={connectWallet}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg px-4 py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-green-500/50"
            >
              Connect Phantom Wallet
            </button>
          ) : (
            <div className="space-y-2">
              <div className="bg-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
                <p className="text-sm font-mono break-all text-green-400">
                  {walletAddress}
                </p>
              </div>
              <button
                onClick={disconnectWallet}
                className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              placeholder="Enter Solana public key"
              className="w-full p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all text-white placeholder-gray-500"
              value={toPubkey}
              onChange={(e) => setToPubkey(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount (SOL)
            </label>
            <input
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full p-3 bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all text-white placeholder-gray-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            onClick={handleTransfer}
            disabled={loading || !walletAddress}
            className={`w-full rounded-lg p-3 font-semibold transition-all duration-200 shadow-lg ${
              loading || !walletAddress
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-green-500/50"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              "Send SOL"
            )}
          </button>
        </div>

        {txSignature && (
          <div className="mt-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400 mb-2 font-medium">
              ✅ Transaction Successful!
            </p>
            <a
              href={`https://explorer.solana.com/tx/${txSignature}?cluster=${CLUSTER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm underline break-all transition-colors"
            >
              🔗 View on Solana Explorer
            </a>
          </div>
        )}
      </div>

      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default TransferSolPhantom;