import React, { useState, useEffect } from "react";
import { Connection, PublicKey, clusterApiUrl, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program, web3 } from "@project-serum/anchor";
import rawIdl from "./minimal_find_my_items.json";

const PROGRAM_ID = new PublicKey("6QfyQYKAUR5rbNgJkLkV4gynvPsbFTcPdQUuZmSVAZMK");
const NETWORK = clusterApiUrl("devnet");

// Ensure proper IDL parsing
const idl = rawIdl.default ? rawIdl.default : rawIdl;

export default function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [program, setProgram] = useState(null);

  const [reportId, setReportId] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [reportPubkey, setReportPubkey] = useState("");
  const [finderPubkey, setFinderPubkey] = useState("");

  // Notification helper
  const notify = (msg) => alert(msg);

  // Initialize wallet & program
  useEffect(() => {
    if (window.solana && window.solana.isPhantom) {
      window.solana.connect({ onlyIfTrusted: true }).then(({ publicKey }) => {
        setWalletAddress(publicKey);
        initProgram();
      });
    }
  }, []);

  const connectWallet = async () => {
    try {
      const resp = await window.solana.connect();
      setWalletAddress(resp.publicKey);
      initProgram();
    } catch (err) {
      notify("❌ Wallet connection failed: " + err.message);
    }
  };

  const initProgram = () => {
      const connection = new Connection(NETWORK, "confirmed");
      const provider = new AnchorProvider(connection, window.solana, {
        preflightCommitment: "processed",
      });

      const programInstance = new Program(idl, PROGRAM_ID, provider);
      setProgram(programInstance);
  };

  // Create report
  const handleCreateReport = async () => {
    if (!program || !walletAddress) return;

    try {
      const reportKeypair = web3.Keypair.generate();

      // Derive escrow PDA
      const [escrowPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("escrow"), reportKeypair.publicKey.toBuffer()],
        PROGRAM_ID
      );

      await program.methods
        .createReport(new web3.BN(Number(rewardAmount)), reportId)
        .accounts({
          reporter: walletAddress,
          report: reportKeypair.publicKey,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([reportKeypair])
        .rpc();

      notify("✅ Report created: " + reportKeypair.publicKey.toString());
    } catch (err) {
      notify("❌ Error creating report: " + err.message);
    }
  };

  // Release reward
  const handleReleaseReward = async () => {
    if (!program || !walletAddress) return;

    try {
      const reportKey = new PublicKey(reportPubkey);
      const finderKey = new PublicKey(finderPubkey);

      const [escrowPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("escrow"), reportKey.toBuffer()],
        PROGRAM_ID
      );

      await program.methods
        .releaseReward(finderKey)
        .accounts({
          reporter: walletAddress,
          finder: finderKey,
          report: reportKey,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      notify("💰 Reward released to: " + finderPubkey);
    } catch (err) {
      notify("❌ Error releasing reward: " + err.message);
    }
  };

  // Cancel report
  const handleCancelReport = async () => {
    if (!program || !walletAddress) return;

    try {
      const reportKey = new PublicKey(reportPubkey);

      const [escrowPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("escrow"), reportKey.toBuffer()],
        PROGRAM_ID
      );

      await program.methods
        .cancelReport()
        .accounts({
          reporter: walletAddress,
          report: reportKey,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      notify("🛑 Report canceled: " + reportPubkey);
    } catch (err) {
      notify("❌ Error canceling report: " + err.message);
    }
  };

  // Styles
  const inputStyle = { padding: "0.5rem", margin: "0.3rem 0", width: "100%", borderRadius: "6px", border: "1px solid #ccc" };
  const buttonStyle = { padding: "0.7rem 1rem", margin: "0.5rem 0", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to right, #1a1a2e, #162447)", color: "#fff", padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      {!walletAddress ? (
        <button style={{ ...buttonStyle, backgroundColor: "#e94560", color: "#fff" }} onClick={connectWallet}>
          Connect Phantom Wallet
        </button>
      ) : (
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <p><strong>Wallet:</strong> {walletAddress.toString()}</p>

          <section style={{ marginBottom: "2rem" }}>
            <h2>Create Report</h2>
            <input style={inputStyle} placeholder="Report ID" value={reportId} onChange={(e) => setReportId(e.target.value)} />
            <input style={inputStyle} type="number" placeholder="Reward Amount (lamports)" value={rewardAmount} onChange={(e) => setRewardAmount(e.target.value)} />
            <button style={{ ...buttonStyle, backgroundColor: "#0f3460", color: "#fff" }} onClick={handleCreateReport}>Create Report</button>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2>Release Reward</h2>
            <input style={inputStyle} placeholder="Report Pubkey" value={reportPubkey} onChange={(e) => setReportPubkey(e.target.value)} />
            <input style={inputStyle} placeholder="Finder Pubkey" value={finderPubkey} onChange={(e) => setFinderPubkey(e.target.value)} />
            <button style={{ ...buttonStyle, backgroundColor: "#1f7a8c", color: "#fff" }} onClick={handleReleaseReward}>Release Reward</button>
          </section>

          <section>
            <h2>Cancel Report</h2>
            <input style={inputStyle} placeholder="Report Pubkey" value={reportPubkey} onChange={(e) => setReportPubkey(e.target.value)} />
            <button style={{ ...buttonStyle, backgroundColor: "#ff2e63", color: "#fff" }} onClick={handleCancelReport}>Cancel Report</button>
          </section>
        </div>
      )}
    </div>
  );
}
