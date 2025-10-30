import React, { useState, useEffect } from "react";
import { Wallet, AlertCircle, CheckCircle, ExternalLink } from "lucide-react";
import {useNavigate} from 'react-router-dom'
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserDetails from "./UserDetails";
import { useWallet } from "../store/store.js";

const ConnectWallet = () => {
    const navigate = useNavigate();
  const [walletAddress, setWalletAddressLocal] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setWalletAddress } = useWallet();

  useEffect(() => {
    const checkIfWalletConnected = async () => {
      try {
        const { solana } = window;
        if (solana && solana.isPhantom) {
          const response = await solana.connect({ onlyIfTrusted: true });
          setWalletAddressLocal(response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkIfWalletConnected();
  }, [setWalletAddress]);

  const connectWallet = async () => {
    setLoading(true);
    try {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        const response = await solana.connect();
        setWalletAddress(response.publicKey.toString());
        setWalletAddressLocal(response.publicKey.toString());
        toast.success("Wallet connected successfully!");
      } else {
        toast.error("Phantom Wallet not found!");
        window.open("https://phantom.app/", "_blank");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  if (walletAddress) {
    return <UserDetails />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <ToastContainer position="top-right" theme="dark" />
      
      <div className="w-full max-w-lg">
        {/* Logo/Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-2xl shadow-blue-500/30">
            <Wallet className="text-white" size={40} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome Back
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Connect your wallet to get started
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-700/50">
          {/* Devnet Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex gap-3">
            <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-yellow-300 font-semibold mb-1">Important Notice</h3>
              <p className="text-yellow-200/80 text-sm leading-relaxed">
                Please ensure your Phantom wallet is connected to the <span className="font-bold text-yellow-100">Devnet</span> network before proceeding.
              </p>
            </div>
          </div>

          {/* Connect Button */}
          <button
            onClick={connectWallet}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-white">Connecting...</span>
              </>
            ) : (
              <>
                <Wallet size={22} className="text-white" />
                <span className="text-white">Connect Phantom Wallet</span>
              </>
            )}
          </button>

          {/* Features List */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-gray-300">
              <div className="p-1.5 bg-green-500/20 rounded-lg">
                <CheckCircle className="text-green-400" size={16} />
              </div>
              <span className="text-sm">Secure and decentralized</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="p-1.5 bg-green-500/20 rounded-lg">
                <CheckCircle className="text-green-400" size={16} />
              </div>
              <span className="text-sm">Report and find lost items</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <div className="p-1.5 bg-green-500/20 rounded-lg">
                <CheckCircle className="text-green-400" size={16} />
              </div>
              <span className="text-sm">Earn rewards for helping others</span>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-gray-500 text-sm">Don't have Phantom wallet?</p>
          <a
            href="https://phantom.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
          >
            Download Phantom Wallet
            <ExternalLink size={16} />
          </a>
          <div className="pt-2">
            <a
              href="https://docs.solana.com/clusters#devnet"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors text-xs"
            >
              Learn about Devnet
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ConnectWallet;