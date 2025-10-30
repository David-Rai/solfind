import React, { useState, useEffect } from "react";
import {
  Connection,
  clusterApiUrl,
  SystemProgram,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@project-serum/anchor";
import idl from "./minimal_find_my_items.json";

const PROGRAM_ID = new PublicKey(
  "6QfyQYKAUR5rbNgJkLkV4gynvPsbFTcPdQUuZmSVAZMK"
);

const NETWORK = clusterApiUrl("devnet");

export default function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [program, setProgram] = useState(null);
  const [reportId, setReportId] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [reportPubkey, setReportPubkey] = useState("");
  const [finderPubkey, setFinderPubkey] = useState("");

  const notify = (msg) => alert(msg);

  useEffect(() => {
    const checkWallet = async () => {
      if (window.solana?.isPhantom) {
        try {
          const { publicKey } = await window.solana.connect({
            onlyIfTrusted: true,
          });
          setWalletAddress(publicKey);
          await initProgram();
        } catch (err) {
          console.warn("Wallet not connected automatically:", err);
        }
      }
    };
    checkWallet();
  }, []);

  const connectWallet = async () => {
    try {
      const resp = await window.solana.connect();
      setWalletAddress(resp.publicKey);
      await initProgram();
    } catch (err) {
      notify("❌ Wallet connection failed: " + err.message);
    }
  };

  const initProgram = async () => {
    try {
      const connection = new Connection(NETWORK, "confirmed");

      // FIX 1: Get wallet from window.solana instead of using walletAddress state
      const wallet = window.solana;
      
      const provider = new AnchorProvider(
        connection,
        wallet,
        AnchorProvider.defaultOptions()
      );

      if (!idl || !idl.types || !idl.instructions) {
        console.error("Invalid IDL file");
        notify("Invalid IDL file");
        return;
      }

      const programInstance = new Program(idl, PROGRAM_ID, provider);
      setProgram(programInstance);
      console.log("✅ Program initialized successfully:", programInstance);
    } catch (err) {
      console.error("❌ Error initializing program:", err);
      notify("Error initializing program: " + err.message);
    }
  };

  const handleCreateReport = async () => {
    if (!program || !walletAddress) return;

    try {
      const reportKeypair = Keypair.generate();

      const [escrowPDA] = await PublicKey.findProgramAddress(
        [Buffer.from("escrow"), reportKeypair.publicKey.toBuffer()],
        PROGRAM_ID
      );

      await program.methods
        .createReport(new BN(Number(rewardAmount)), reportId)
        .accounts({
          reporter: walletAddress,
          report: reportKeypair.publicKey,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([reportKeypair])
        .rpc();

      notify("✅ Report created: " + reportKeypair.publicKey.toString());
      
      // Clear form after successful creation
      setReportId("");
      setRewardAmount("");
    } catch (err) {
      console.error(err);
      notify("❌ Error creating report: " + err.message);
    }
  };

  const handleReleaseReward = async () => {
    if (!program || !walletAddress) return;

    try {
      // FIX 2: Validate public keys
      if (!reportPubkey || !finderPubkey) {
        notify("❌ Please provide both Report Pubkey and Finder Pubkey");
        return;
      }

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
      
      // Clear form after successful release
      setReportPubkey("");
      setFinderPubkey("");
    } catch (err) {
      console.error(err);
      notify("❌ Error releasing reward: " + err.message);
    }
  };

  const handleCancelReport = async () => {
    if (!program || !walletAddress) return;

    try {
      // FIX 3: Validate public key
      if (!reportPubkey) {
        notify("❌ Please provide Report Pubkey");
        return;
      }

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
      
      // Clear form after successful cancellation
      setReportPubkey("");
    } catch (err) {
      console.error(err);
      notify("❌ Error canceling report: " + err.message);
    }
  };

  const inputStyle = {
    padding: "0.5rem",
    margin: "0.3rem 0",
    width: "100%",
    borderRadius: "6px",
    border: "1px solid #ccc",
  };
  const buttonStyle = {
    padding: "0.7rem 1rem",
    margin: "0.5rem 0",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, #1a1a2e, #162447)",
        color: "#fff",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {!walletAddress ? (
        <button
          style={{ ...buttonStyle, backgroundColor: "#e94560", color: "#fff" }}
          onClick={connectWallet}
        >
          Connect Phantom Wallet
        </button>
      ) : (
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <p>
            <strong>Wallet:</strong> {walletAddress.toString()}
          </p>

          <section style={{ marginBottom: "2rem" }}>
            <h2>Create Report</h2>
            <input
              style={inputStyle}
              placeholder="Report ID"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
            />
            <input
              style={inputStyle}
              type="number"
              placeholder="Reward Amount (lamports)"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
            />
            <button
              style={{ ...buttonStyle, backgroundColor: "#0f3460", color: "#fff" }}
              onClick={handleCreateReport}
              disabled={!reportId || !rewardAmount}
            >
              Create Report
            </button>
          </section>

          <section style={{ marginBottom: "2rem" }}>
            <h2>Release Reward</h2>
            <input
              style={inputStyle}
              placeholder="Report Pubkey"
              value={reportPubkey}
              onChange={(e) => setReportPubkey(e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="Finder Pubkey"
              value={finderPubkey}
              onChange={(e) => setFinderPubkey(e.target.value)}
            />
            <button
              style={{ ...buttonStyle, backgroundColor: "#1f7a8c", color: "#fff" }}
              onClick={handleReleaseReward}
              disabled={!reportPubkey || !finderPubkey}
            >
              Release Reward
            </button>
          </section>

          <section>
            <h2>Cancel Report</h2>
            <input
              style={inputStyle}
              placeholder="Report Pubkey"
              value={reportPubkey}
              onChange={(e) => setReportPubkey(e.target.value)}
            />
            <button
              style={{ ...buttonStyle, backgroundColor: "#ff2e63", color: "#fff" }}
              onClick={handleCancelReport}
              disabled={!reportPubkey}
            >
              Cancel Report
            </button>
          </section>
        </div>
      )}
    </div>
  );
}