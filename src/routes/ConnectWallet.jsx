import React from "react";
import { useState, useEffect } from "react";
import { Wallet } from "lucide-react";

const ConnectWallet = () => {
  const [walletAddress, setWalletAddress] = useState(null);

  // Check if Phantom wallet is already connected
  useEffect(() => {
    const checkIfWalletConnected = async () => {
      try {
        const { solana } = window;
        if (solana && solana.isPhantom) {
          const response = await solana.connect({ onlyIfTrusted: true });
          setWalletAddress(response.publicKey.toString());
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkIfWalletConnected();
  }, []);

  // Connect Phantom Wallet
  const connectWallet = async () => {
    try {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        const response = await solana.connect();
        setWalletAddress(response.publicKey.toString());
        console.log("Connected:", response.publicKey.toString());
      } else {
        alert("Phantom Wallet not found. Please install it from https://phantom.app/");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
      {!walletAddress ? (
        <button
          onClick={connectWallet}
          className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          <Wallet size={20} /> Connect Wallet
        </button>
      ) : (
        <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg font-semibold">
          Connected: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
