import React, { useState, useEffect } from "react";
import {
  Connection,
  clusterApiUrl,
  SystemProgram,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import idl from "./minimal_find_my_items.json";

// Environment variables with fallbacks
const PROGRAM_ID = new PublicKey(
  process.env.REACT_APP_PROGRAM_ID || "6QfyQYKAUR5rbNgJkLkV4gynvPsbFTcPdQUuZmSVAZMK"
);

const NETWORK = process.env.REACT_APP_SOLANA_NETWORK === 'mainnet' 
  ? clusterApiUrl("mainnet-beta")
  : process.env.REACT_APP_RPC_URL || clusterApiUrl("devnet");

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Application Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          background: '#1a1a2e',
          color: 'white',
          minHeight: '100vh'
        }}>
          <h2>Something went wrong</h2>
          <p>Please refresh the page and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              background: '#e94560',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '1rem', textAlign: 'left' }}>
              <summary>Error Details (Development)</summary>
              <pre>{this.state.error && this.state.error.toString()}</pre>
              <pre>{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// Validation Utilities
const validatePublicKey = (key) => {
  if (!key || key.trim() === '') return false;
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
};

const validateAmount = (amount) => {
  const num = Number(amount);
  return !isNaN(num) && num > 0 && num <= 1000000000; // Max 1 SOL
};

const sanitizeReportId = (input) => {
  return input.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 50);
};

// Error Handling Utility
const handleTransactionError = (error, defaultMessage = "Transaction failed") => {
  console.error('Transaction Error:', error);
  
  const message = error.message || error.toString();
  
  if (message.includes('Insufficient funds') || message.includes('0x1')) {
    return "❌ Insufficient SOL balance for transaction";
  } else if (message.includes('Account does not exist') || message.includes('0x5')) {
    return "❌ Account not found. Please check the public key";
  } else if (message.includes('Signature verification failed') || message.includes('0x3')) {
    return "❌ Transaction signature verification failed";
  } else if (message.includes('already in use') || message.includes('0x0')) {
    return "❌ Account already exists";
  } else if (message.includes('wallet')) {
    return "❌ Wallet error. Please check your connection";
  } else {
    return `❌ ${defaultMessage}: ${message.slice(0, 100)}`;
  }
};

// Main App Component
function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [program, setProgram] = useState(null);
  const [reportId, setReportId] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [reportPubkey, setReportPubkey] = useState("");
  const [finderPubkey, setFinderPubkey] = useState("");
  const [loading, setLoading] = useState({
    createReport: false,
    releaseReward: false,
    cancelReport: false,
    connecting: false
  });
  const [walletError, setWalletError] = useState(null);

  // Enhanced notification system
  const notify = (msg, type = 'info') => {
    console.log(`Notification [${type}]:`, msg);
    alert(msg); // In production, replace with a proper toast notification system
  };

  // Check for wallet connection on component mount
  useEffect(() => {
    const checkWallet = async () => {
      if (window.solana?.isPhantom) {
        try {
          const { publicKey } = await window.solana.connect({
            onlyIfTrusted: true,
          });
          setWalletAddress(publicKey);
          setWalletError(null);
        } catch (err) {
          console.warn("Wallet not connected automatically:", err);
        }
      } else {
        setWalletError("Phantom wallet not detected. Please install Phantom wallet.");
      }
    };
    checkWallet();
  }, []);

  // Initialize program when walletAddress changes
  useEffect(() => {
    if (walletAddress) {
      initProgram();
    }
  }, [walletAddress]);

  // Handle wallet account changes
  useEffect(() => {
    if (window.solana) {
      const handleAccountChange = (publicKey) => {
        if (publicKey) {
          setWalletAddress(publicKey);
          setWalletError(null);
        } else {
          setWalletAddress(null);
          setProgram(null);
          notify("Wallet disconnected", "warning");
        }
      };

      window.solana.on('accountChanged', handleAccountChange);
      
      return () => {
        window.solana.removeListener('accountChanged', handleAccountChange);
      };
    }
  }, []);

  const connectWallet = async () => {
    setLoading(prev => ({ ...prev, connecting: true }));
    setWalletError(null);
    
    try {
      if (!window.solana) {
        throw new Error("Phantom wallet not installed");
      }
      
      const resp = await window.solana.connect();
      setWalletAddress(resp.publicKey);
      notify("Wallet connected successfully!", "success");
    } catch (err) {
      const errorMsg = handleTransactionError(err, "Wallet connection failed");
      setWalletError(errorMsg);
      notify(errorMsg, "error");
    } finally {
      setLoading(prev => ({ ...prev, connecting: false }));
    }
  };

  const disconnectWallet = async () => {
    try {
      await window.solana.disconnect();
      setWalletAddress(null);
      setProgram(null);
      notify("Wallet disconnected", "info");
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  const initProgram = async () => {
    try {
      const connection = new Connection(NETWORK, "confirmed");

      // Create proper wallet adapter
      const wallet = {
        publicKey: walletAddress,
        signTransaction: async (transaction) => {
          return await window.solana.signTransaction(transaction);
        },
        signAllTransactions: async (transactions) => {
          return await window.solana.signAllTransactions(transactions);
        },
      };

      const provider = new AnchorProvider(
        connection,
        wallet,
        { 
          ...AnchorProvider.defaultOptions(),
          commitment: 'confirmed'
        }
      );

      if (!idl || !idl.types || !idl.instructions) {
        throw new Error("Invalid IDL file configuration");
      }

      const programInstance = new Program(idl, PROGRAM_ID, provider);
      setProgram(programInstance);
      console.log("✅ Program initialized successfully");
    } catch (err) {
      console.error("❌ Error initializing program:", err);
      notify(handleTransactionError(err, "Program initialization failed"), "error");
    }
  };

  const handleCreateReport = async () => {
    if (!program || !walletAddress) return;

    // Validation
    if (!validateAmount(rewardAmount)) {
      notify("❌ Please enter a valid reward amount (0.000000001 to 1 SOL)", "error");
      return;
    }
    if (!reportId.trim()) {
      notify("❌ Please enter a report ID", "error");
      return;
    }

    setLoading(prev => ({ ...prev, createReport: true }));

    try {
      const reportKeypair = Keypair.generate();
      const sanitizedReportId = sanitizeReportId(reportId);

      const [escrowPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("escrow"), reportKeypair.publicKey.toBuffer()],
        PROGRAM_ID
      );

      const signature = await program.methods
        .createReport(new BN(Number(rewardAmount)), sanitizedReportId)
        .accounts({
          reporter: walletAddress,
          report: reportKeypair.publicKey,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([reportKeypair])
        .rpc();

      // Wait for confirmation
      const connection = program.provider.connection;
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error("Transaction confirmation failed");
      }

      notify(`✅ Report created successfully!\nReport Key: ${reportKeypair.publicKey.toString()}`, "success");
      
      // Clear form after successful creation
      setReportId("");
      setRewardAmount("");
    } catch (err) {
      const errorMsg = handleTransactionError(err, "Failed to create report");
      notify(errorMsg, "error");
    } finally {
      setLoading(prev => ({ ...prev, createReport: false }));
    }
  };

  const handleReleaseReward = async () => {
    if (!program || !walletAddress) return;

    // Validation
    if (!validatePublicKey(reportPubkey)) {
      notify("❌ Please provide a valid Report Pubkey", "error");
      return;
    }
    if (!validatePublicKey(finderPubkey)) {
      notify("❌ Please provide a valid Finder Pubkey", "error");
      return;
    }

    setLoading(prev => ({ ...prev, releaseReward: true }));

    try {
      const reportKey = new PublicKey(reportPubkey);
      const finderKey = new PublicKey(finderPubkey);

      const [escrowPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("escrow"), reportKey.toBuffer()],
        PROGRAM_ID
      );

      const signature = await program.methods
        .releaseReward(finderKey)
        .accounts({
          reporter: walletAddress,
          finder: finderKey,
          report: reportKey,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Wait for confirmation
      const connection = program.provider.connection;
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error("Transaction confirmation failed");
      }

      notify(`💰 Reward released successfully to: ${finderPubkey}`, "success");
      
      // Clear form after successful release
      setReportPubkey("");
      setFinderPubkey("");
    } catch (err) {
      const errorMsg = handleTransactionError(err, "Failed to release reward");
      notify(errorMsg, "error");
    } finally {
      setLoading(prev => ({ ...prev, releaseReward: false }));
    }
  };

  const handleCancelReport = async () => {
    if (!program || !walletAddress) return;

    // Validation
    if (!validatePublicKey(reportPubkey)) {
      notify("❌ Please provide a valid Report Pubkey", "error");
      return;
    }

    setLoading(prev => ({ ...prev, cancelReport: true }));

    try {
      const reportKey = new PublicKey(reportPubkey);

      const [escrowPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("escrow"), reportKey.toBuffer()],
        PROGRAM_ID
      );

      const signature = await program.methods
        .cancelReport()
        .accounts({
          reporter: walletAddress,
          report: reportKey,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Wait for confirmation
      const connection = program.provider.connection;
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error("Transaction confirmation failed");
      }

      notify(`🛑 Report canceled successfully: ${reportPubkey}`, "success");
      
      // Clear form after successful cancellation
      setReportPubkey("");
    } catch (err) {
      const errorMsg = handleTransactionError(err, "Failed to cancel report");
      notify(errorMsg, "error");
    } finally {
      setLoading(prev => ({ ...prev, cancelReport: false }));
    }
  };

  // Input change handlers with validation
  const handleReportIdChange = (value) => {
    setReportId(sanitizeReportId(value));
  };

  const handleRewardAmountChange = (value) => {
    const numValue = Math.max(0, Math.min(Number(value), 1000000000));
    setRewardAmount(numValue.toString());
  };

  const handleReportPubkeyChange = (value) => {
    setReportPubkey(value);
  };

  const handleFinderPubkeyChange = (value) => {
    setFinderPubkey(value);
  };

  // Styling
  const inputStyle = {
    padding: "0.75rem",
    margin: "0.5rem 0",
    width: "100%",
    borderRadius: "8px",
    border: "2px solid #374151",
    backgroundColor: "#1f2937",
    color: "white",
    fontSize: "1rem",
  };

  const buttonStyle = (disabled = false) => ({
    padding: "0.75rem 1.5rem",
    margin: "0.5rem 0",
    borderRadius: "8px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.2s ease",
    width: "100%"
  });

  const sectionStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: "1.5rem",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  };

  return (
    <ErrorBoundary>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1a1a2e 0%, #162447 50%, #0f3460 100%)",
          color: "#fff",
          padding: "1rem",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <header style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "2rem", fontWeight: "bold" }}>
              Find My Items
            </h1>
            <p style={{ margin: 0, opacity: 0.8 }}>
              Report lost items and manage rewards on Solana
            </p>
          </header>

          {!walletAddress ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              {walletError && (
                <div style={{ 
                  backgroundColor: "rgba(239, 68, 68, 0.1)", 
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#fca5a5",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "1rem"
                }}>
                  {walletError}
                </div>
              )}
              
              <button
                style={{ 
                  ...buttonStyle(false),
                  backgroundColor: "#8b5cf6",
                  color: "#fff",
                }}
                onClick={connectWallet}
                disabled={loading.connecting}
              >
                {loading.connecting ? "Connecting..." : "Connect Phantom Wallet"}
              </button>
              
              {!window.solana && (
                <div style={{ marginTop: "1rem" }}>
                  <a 
                    href="https://phantom.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: "#8b5cf6", textDecoration: "none" }}
                  >
                    Install Phantom Wallet →
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "2rem",
                padding: "1rem",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px"
              }}>
                <div>
                  <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.9rem", opacity: 0.8 }}>
                    Connected Wallet
                  </p>
                  <p style={{ margin: 0, fontFamily: "monospace", fontSize: "0.85rem" }}>
                    {walletAddress.toString().slice(0, 8)}...{walletAddress.toString().slice(-8)}
                  </p>
                </div>
                <button
                  onClick={disconnectWallet}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                    color: "#fca5a5",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem"
                  }}
                >
                  Disconnect
                </button>
              </div>

              {!program ? (
                <div style={{ textAlign: "center", padding: "2rem", opacity: 0.8 }}>
                  Initializing program...
                </div>
              ) : (
                <>
                  <section style={sectionStyle}>
                    <h2 style={{ margin: "0 0 1rem 0" }}>Create Report</h2>
                    <input
                      style={inputStyle}
                      placeholder="Report ID (max 50 chars)"
                      value={reportId}
                      onChange={(e) => handleReportIdChange(e.target.value)}
                    />
                    <input
                      style={inputStyle}
                      type="number"
                      placeholder="Reward Amount (lamports)"
                      value={rewardAmount}
                      onChange={(e) => handleRewardAmountChange(e.target.value)}
                      min="0"
                      max="1000000000"
                    />
                    <button
                      style={{
                        ...buttonStyle(!reportId || !rewardAmount || loading.createReport),
                        backgroundColor: "#0ea5e9",
                        color: "#fff",
                      }}
                      onClick={handleCreateReport}
                      disabled={!reportId || !rewardAmount || loading.createReport}
                    >
                      {loading.createReport ? "Creating..." : "Create Report"}
                    </button>
                  </section>

                  <section style={sectionStyle}>
                    <h2 style={{ margin: "0 0 1rem 0" }}>Release Reward</h2>
                    <input
                      style={{
                        ...inputStyle,
                        borderColor: validatePublicKey(reportPubkey) ? "#10b981" : "#374151"
                      }}
                      placeholder="Report Pubkey"
                      value={reportPubkey}
                      onChange={(e) => handleReportPubkeyChange(e.target.value)}
                    />
                    <input
                      style={{
                        ...inputStyle,
                        borderColor: validatePublicKey(finderPubkey) ? "#10b981" : "#374151"
                      }}
                      placeholder="Finder Pubkey"
                      value={finderPubkey}
                      onChange={(e) => handleFinderPubkeyChange(e.target.value)}
                    />
                    <button
                      style={{
                        ...buttonStyle(!validatePublicKey(reportPubkey) || !validatePublicKey(finderPubkey) || loading.releaseReward),
                        backgroundColor: "#10b981",
                        color: "#fff",
                      }}
                      onClick={handleReleaseReward}
                      disabled={!validatePublicKey(reportPubkey) || !validatePublicKey(finderPubkey) || loading.releaseReward}
                    >
                      {loading.releaseReward ? "Releasing..." : "Release Reward"}
                    </button>
                  </section>

                  <section style={sectionStyle}>
                    <h2 style={{ margin: "0 0 1rem 0" }}>Cancel Report</h2>
                    <input
                      style={{
                        ...inputStyle,
                        borderColor: validatePublicKey(reportPubkey) ? "#10b981" : "#374151"
                      }}
                      placeholder="Report Pubkey"
                      value={reportPubkey}
                      onChange={(e) => handleReportPubkeyChange(e.target.value)}
                    />
                    <button
                      style={{
                        ...buttonStyle(!validatePublicKey(reportPubkey) || loading.cancelReport),
                        backgroundColor: "#ef4444",
                        color: "#fff",
                      }}
                      onClick={handleCancelReport}
                      disabled={!validatePublicKey(reportPubkey) || loading.cancelReport}
                    >
                      {loading.cancelReport ? "Canceling..." : "Cancel Report"}
                    </button>
                  </section>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
