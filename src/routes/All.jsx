import React, { useState, useEffect } from "react";
import {
  Connection,
  clusterApiUrl,
  SystemProgram,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";

// PROGRAM_ID and NETWORK configuration
const PROGRAM_ID = new PublicKey(
  "6QfyQYKAUR5rbNgJkLkV4gynvPsbFTcPdQUuZmSVAZMK"
);

const NETWORK = clusterApiUrl("devnet");

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    this.setState({ error });
    console.error('App Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          background: '#1a1a2e',
          color: 'white',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h2 style={{ color: '#e94560', marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ marginBottom: '2rem', opacity: 0.8 }}>Please refresh the page and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#e94560',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reload Page
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              maxWidth: '500px',
              textAlign: 'left'
            }}>
              <details>
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                  Error Details (Development)
                </summary>
                <pre style={{ 
                  fontSize: '0.8rem', 
                  whiteSpace: 'pre-wrap',
                  color: '#f8f9fa'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

// Validation Utilities
const validatePublicKey = (key) => {
  if (!key || typeof key !== 'string' || key.trim() === '') return false;
  try {
    new PublicKey(key.trim());
    return true;
  } catch {
    return false;
  }
};

const validateAmount = (amount) => {
  if (!amount || amount === '') return false;
  const num = Number(amount);
  return !isNaN(num) && num > 0 && num <= 1000000000;
};

const sanitizeReportId = (input) => {
  return input.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 50);
};

// Error Handling Utility
const handleTransactionError = (error) => {
  console.error('Transaction Error:', error);
  
  const message = error.message || error.toString();
  
  if (message.includes('Insufficient funds') || message.includes('0x1')) {
    return "❌ Insufficient SOL balance for transaction";
  } else if (message.includes('Account does not exist') || message.includes('0x5')) {
    return "❌ Account not found. Please check the public key";
  } else if (message.includes('Signature verification failed')) {
    return "❌ Transaction signature verification failed";
  } else if (message.includes('already in use')) {
    return "❌ Account already exists";
  } else if (message.includes('wallet')) {
    return "❌ Wallet error. Please check your connection";
  } else if (message.includes('user rejected')) {
    return "❌ Transaction was rejected by user";
  } else if (message.includes('anchor error')) {
    // Extract Anchor error code if available
    const anchorErrorMatch = message.match(/AnchorError occurred\. Error Code: ([^\.]+)/);
    if (anchorErrorMatch) {
      return `❌ Program error: ${anchorErrorMatch[1]}`;
    }
    return `❌ Program error: ${message.slice(0, 100)}`;
  } else {
    return `❌ Transaction failed: ${message.slice(0, 100)}`;
  }
};

// Mock IDL structure - REPLACE WITH YOUR ACTUAL IDL IMPORT
const mockIdl = {
  version: "0.1.0",
  name: "minimal_find_my_items",
  instructions: [
    {
      name: "createReport",
      accounts: [
        { name: "reporter", isMut: true, isSigner: true },
        { name: "report", isMut: true, isSigner: true },
        { name: "escrow", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "rewardAmount", type: "u64" },
        { name: "reportId", type: "string" }
      ]
    },
    {
      name: "releaseReward",
      accounts: [
        { name: "reporter", isMut: true, isSigner: true },
        { name: "finder", isMut: true, isSigner: false },
        { name: "report", isMut: true, isSigner: false },
        { name: "escrow", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "finder", type: "publicKey" }
      ]
    },
    {
      name: "cancelReport",
      accounts: [
        { name: "reporter", isMut: true, isSigner: true },
        { name: "report", isMut: true, isSigner: false },
        { name: "escrow", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: []
    }
  ]
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
  const [transactionHistory, setTransactionHistory] = useState([]);

  const notify = (msg, type = 'info') => {
    console.log(`Notification [${type}]:`, msg);
    
    // Add to transaction history
    setTransactionHistory(prev => [{
      id: Date.now(),
      message: msg,
      type: type,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 9)]); // Keep last 10 transactions
    
    alert(msg);
  };

  // Check for wallet connection on component mount
  useEffect(() => {
    const checkWallet = async () => {
      if (window.solana?.isPhantom) {
        try {
          const response = await window.solana.connect({ onlyIfTrusted: true });
          if (response.publicKey) {
            setWalletAddress(response.publicKey.toString());
            setWalletError(null);
          }
        } catch (err) {
          console.log("Wallet not connected automatically:", err.message);
        }
      } else {
        setWalletError("Phantom wallet not detected");
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
          setWalletAddress(publicKey.toString());
          setWalletError(null);
        } else {
          handleDisconnect();
        }
      };

      window.solana.on('accountChanged', handleAccountChange);
      
      return () => {
        if (window.solana.removeListener) {
          window.solana.removeListener('accountChanged', handleAccountChange);
        }
      };
    }
  }, []);

  const connectWallet = async () => {
    setLoading(prev => ({ ...prev, connecting: true }));
    setWalletError(null);
    
    try {
      if (!window.solana) {
        throw new Error("Phantom wallet not installed. Please install Phantom wallet from https://phantom.app/");
      }
      
      if (!window.solana.isConnected) {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        notify("Wallet connected successfully!", "success");
      }
    } catch (err) {
      const errorMsg = err.message || "Wallet connection failed";
      setWalletError(errorMsg);
      notify(errorMsg, "error");
    } finally {
      setLoading(prev => ({ ...prev, connecting: false }));
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setProgram(null);
    setWalletError(null);
    notify("Wallet disconnected", "info");
  };

  const disconnectWallet = async () => {
    try {
      if (window.solana && window.solana.disconnect) {
        await window.solana.disconnect();
      }
      handleDisconnect();
    } catch (err) {
      console.error('Disconnect error:', err);
      handleDisconnect(); // Force disconnect anyway
    }
  };

  const initProgram = async () => {
    try {
      const connection = new Connection(NETWORK, "confirmed");

      // Create proper wallet adapter
      const wallet = {
        publicKey: new PublicKey(walletAddress),
        signTransaction: async (transaction) => {
          if (!window.solana) throw new Error("Wallet not connected");
          return await window.solana.signTransaction(transaction);
        },
        signAllTransactions: async (transactions) => {
          if (!window.solana) throw new Error("Wallet not connected");
          return await window.solana.signAllTransactions(transactions);
        },
      };

      const provider = new AnchorProvider(
        connection,
        wallet,
        { 
          commitment: 'confirmed',
          preflightCommitment: 'confirmed'
        }
      );

      // IMPORTANT: Replace mockIdl with your actual IDL import
      // import idl from "./minimal_find_my_items.json";
      const programInstance = new Program(mockIdl, PROGRAM_ID, provider);
      
      setProgram(programInstance);
      console.log("Program initialized successfully");
      
    } catch (err) {
      console.error("Error initializing program:", err);
      notify("Error initializing program: " + err.message, "error");
    }
  };

  const handleCreateReport = async () => {
    if (!program || !walletAddress) {
      notify("Please connect your wallet first", "error");
      return;
    }

    // Validation
    if (!validateAmount(rewardAmount)) {
      notify("❌ Please enter a valid reward amount (1 to 1,000,000,000 lamports)", "error");
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

      // Generate PDA for escrow account
      const [escrowPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("escrow"), reportKeypair.publicKey.toBuffer()],
        PROGRAM_ID
      );

      console.log("Creating report with:", {
        rewardAmount: new BN(Number(rewardAmount)),
        reportId: sanitizedReportId,
        reporter: new PublicKey(walletAddress),
        report: reportKeypair.publicKey,
        escrow: escrowPDA
      });

      // ACTUAL BLOCKCHAIN TRANSACTION
      const signature = await program.methods
        .createReport(new BN(Number(rewardAmount)), sanitizedReportId)
        .accounts({
          reporter: new PublicKey(walletAddress),
          report: reportKeypair.publicKey,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([reportKeypair])
        .rpc();

      // Wait for transaction confirmation
      const latestBlockhash = await program.provider.connection.getLatestBlockhash();
      await program.provider.connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      }, 'confirmed');

      notify(`✅ Report created successfully!\nTransaction: ${signature}\nReport Account: ${reportKeypair.publicKey.toString()}`, "success");
      
      // Clear form
      setReportId("");
      setRewardAmount("");
    } catch (err) {
      const errorMsg = handleTransactionError(err);
      notify(errorMsg, "error");
    } finally {
      setLoading(prev => ({ ...prev, createReport: false }));
    }
  };

  const handleReleaseReward = async () => {
    if (!program || !walletAddress) {
      notify("Please connect your wallet first", "error");
      return;
    }

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

      // Generate PDA for escrow account
      const [escrowPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("escrow"), reportKey.toBuffer()],
        PROGRAM_ID
      );

      console.log("Releasing reward with:", {
        finder: finderKey,
        reporter: new PublicKey(walletAddress),
        report: reportKey,
        escrow: escrowPDA
      });

      // ACTUAL BLOCKCHAIN TRANSACTION
      const signature = await program.methods
        .releaseReward(finderKey)
        .accounts({
          reporter: new PublicKey(walletAddress),
          finder: finderKey,
          report: reportKey,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Wait for transaction confirmation
      const latestBlockhash = await program.provider.connection.getLatestBlockhash();
      await program.provider.connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      }, 'confirmed');

      notify(`💰 Reward released successfully!\nTransaction: ${signature}\nTo: ${finderPubkey}`, "success");
      
      // Clear form
      setReportPubkey("");
      setFinderPubkey("");
    } catch (err) {
      const errorMsg = handleTransactionError(err);
      notify(errorMsg, "error");
    } finally {
      setLoading(prev => ({ ...prev, releaseReward: false }));
    }
  };

  const handleCancelReport = async () => {
    if (!program || !walletAddress) {
      notify("Please connect your wallet first", "error");
      return;
    }

    // Validation
    if (!validatePublicKey(reportPubkey)) {
      notify("❌ Please provide a valid Report Pubkey", "error");
      return;
    }

    setLoading(prev => ({ ...prev, cancelReport: true }));

    try {
      const reportKey = new PublicKey(reportPubkey);

      // Generate PDA for escrow account
      const [escrowPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("escrow"), reportKey.toBuffer()],
        PROGRAM_ID
      );

      console.log("Canceling report with:", {
        reporter: new PublicKey(walletAddress),
        report: reportKey,
        escrow: escrowPDA
      });

      // ACTUAL BLOCKCHAIN TRANSACTION
      const signature = await program.methods
        .cancelReport()
        .accounts({
          reporter: new PublicKey(walletAddress),
          report: reportKey,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Wait for transaction confirmation
      const latestBlockhash = await program.provider.connection.getLatestBlockhash();
      await program.provider.connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      }, 'confirmed');

      notify(`🛑 Report canceled successfully!\nTransaction: ${signature}\nReport: ${reportPubkey}`, "success");
      
      // Clear form
      setReportPubkey("");
    } catch (err) {
      const errorMsg = handleTransactionError(err);
      notify(errorMsg, "error");
    } finally {
      setLoading(prev => ({ ...prev, cancelReport: false }));
    }
  };

  // Input change handlers
  const handleReportIdChange = (value) => {
    setReportId(sanitizeReportId(value));
  };

  const handleRewardAmountChange = (value) => {
    if (value === '') {
      setRewardAmount('');
      return;
    }
    const numValue = Math.max(0, Math.min(Number(value), 1000000000));
    setRewardAmount(numValue.toString());
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
    fontSize: "0.95rem",
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  const buttonStyle = (disabled = false, color = "#3b82f6") => ({
    padding: "0.75rem 1.5rem",
    margin: "0.5rem 0",
    borderRadius: "8px",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
    opacity: disabled ? 0.6 : 1,
    transition: "all 0.2s ease",
    width: "100%",
    backgroundColor: color,
    color: "#ffffff",
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
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <header style={{ textAlign: "center", marginBottom: "2rem", paddingTop: "1rem" }}>
            <h1 style={{ 
              margin: "0 0 0.5rem 0", 
              fontSize: "2.25rem", 
              fontWeight: "bold",
              background: "linear-gradient(45deg, #e94560, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Find My Items
            </h1>
            <p style={{ margin: 0, opacity: 0.8, fontSize: "1.1rem" }}>
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
                  marginBottom: "1.5rem",
                  fontSize: "0.9rem"
                }}>
                  {walletError}
                </div>
              )}
              
              <button
                style={{ 
                  ...buttonStyle(loading.connecting, "#8b5cf6"),
                  fontSize: "1.1rem",
                  padding: "1rem 2rem"
                }}
                onClick={connectWallet}
                disabled={loading.connecting}
              >
                {loading.connecting ? (
                  <span>Connecting...</span>
                ) : (
                  <span>Connect Phantom Wallet</span>
                )}
              </button>
              
              {!window.solana && (
                <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(139, 92, 246, 0.1)", borderRadius: "8px" }}>
                  <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>
                    Phantom wallet not detected
                  </p>
                  <a 
                    href="https://phantom.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: "#8b5cf6", 
                      textDecoration: "none",
                      fontWeight: "600",
                      fontSize: "0.9rem"
                    }}
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
                padding: "1.25rem",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 0.25rem 0", fontSize: "0.85rem", opacity: 0.8 }}>
                    Connected Wallet
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontFamily: "'Roboto Mono', monospace", 
                    fontSize: "0.8rem",
                    wordBreak: "break-all"
                  }}>
                    {walletAddress}
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
                    fontSize: "0.8rem",
                    fontWeight: "500",
                    marginLeft: "1rem"
                  }}
                >
                  Disconnect
                </button>
              </div>

              {!program ? (
                <div style={{ 
                  ...sectionStyle, 
                  textAlign: 'center',
                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                  borderColor: "rgba(245, 158, 11, 0.3)"
                }}>
                  <p style={{ margin: 0, color: "#fbbf24" }}>
                    Initializing program...
                  </p>
                </div>
              ) : (
                <>
                  <div style={sectionStyle}>
                    <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem" }}>Create Report</h2>
                    <input
                      style={{
                        ...inputStyle,
                        borderColor: reportId ? "#10b981" : "#374151"
                      }}
                      placeholder="Report ID (max 50 alphanumeric characters)"
                      value={reportId}
                      onChange={(e) => handleReportIdChange(e.target.value)}
                    />
                    <input
                      style={{
                        ...inputStyle,
                        borderColor: validateAmount(rewardAmount) ? "#10b981" : "#374151"
                      }}
                      type="number"
                      placeholder="Reward Amount (lamports) - 1 SOL = 1,000,000,000"
                      value={rewardAmount}
                      onChange={(e) => handleRewardAmountChange(e.target.value)}
                      min="1"
                      max="1000000000"
                    />
                    <button
                      style={buttonStyle(!reportId || !validateAmount(rewardAmount) || loading.createReport, "#0ea5e9")}
                      onClick={handleCreateReport}
                      disabled={!reportId || !validateAmount(rewardAmount) || loading.createReport}
                    >
                      {loading.createReport ? "Creating Report..." : "Create Report"}
                    </button>
                  </div>

                  <div style={sectionStyle}>
                    <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem" }}>Release Reward</h2>
                    <input
                      style={{
                        ...inputStyle,
                        borderColor: validatePublicKey(reportPubkey) ? "#10b981" : "#374151"
                      }}
                      placeholder="Report Public Key"
                      value={reportPubkey}
                      onChange={(e) => setReportPubkey(e.target.value)}
                    />
                    <input
                      style={{
                        ...inputStyle,
                        borderColor: validatePublicKey(finderPubkey) ? "#10b981" : "#374151"
                      }}
                      placeholder="Finder Public Key"
                      value={finderPubkey}
                      onChange={(e) => setFinderPubkey(e.target.value)}
                    />
                    <button
                      style={buttonStyle(
                        !validatePublicKey(reportPubkey) || 
                        !validatePublicKey(finderPubkey) || 
                        loading.releaseReward, 
                        "#10b981"
                      )}
                      onClick={handleReleaseReward}
                      disabled={
                        !validatePublicKey(reportPubkey) || 
                        !validatePublicKey(finderPubkey) || 
                        loading.releaseReward
                      }
                    >
                      {loading.releaseReward ? "Releasing Reward..." : "Release Reward"}
                    </button>
                  </div>

                  <div style={sectionStyle}>
                    <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem" }}>Cancel Report</h2>
                    <input
                      style={{
                        ...inputStyle,
                        borderColor: validatePublicKey(reportPubkey) ? "#10b981" : "#374151"
                      }}
                      placeholder="Report Public Key"
                      value={reportPubkey}
                      onChange={(e) => setReportPubkey(e.target.value)}
                    />
                    <button
                      style={buttonStyle(!validatePublicKey(reportPubkey) || loading.cancelReport, "#ef4444")}
                      onClick={handleCancelReport}
                      disabled={!validatePublicKey(reportPubkey) || loading.cancelReport}
                    >
                      {loading.cancelReport ? "Canceling Report..." : "Cancel Report"}
                    </button>
                  </div>
                </>
              )}

              {transactionHistory.length > 0 && (
                <div style={sectionStyle}>
                  <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.25rem" }}>Recent Activity</h2>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {transactionHistory.map((tx) => (
                      <div 
                        key={tx.id}
                        style={{
                          padding: '0.75rem',
                          marginBottom: '0.5rem',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                          borderLeft: `4px solid ${
                            tx.type === 'success' ? '#10b981' : 
                            tx.type === 'error' ? '#ef4444' : '#3b82f6'
                          }`
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          fontSize: '0.8rem'
                        }}>
                          <span style={{ flex: 1 }}>{tx.message}</span>
                          <span style={{ 
                            opacity: 0.7, 
                            fontSize: '0.7rem',
                            marginLeft: '0.5rem',
                            whiteSpace: 'nowrap'
                          }}>
                            {tx.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
