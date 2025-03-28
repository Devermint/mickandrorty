"use client";

import { useAptosWallet } from "@/app/contexts/AptosWalletContext";
import { truncateAddress } from "@aptos-labs/wallet-adapter-react";
import { AccountBalanceWalletOutlined as AccountBalanceWalletOutlinedIcon } from "@mui/icons-material";
import { Avatar, Button, Typography } from "@mui/material";
import React, { useState } from "react";
import WalletMenu from "./WalletMenu";

type WalletButtonProps = {
  handleModalOpen: () => void;
  handleNavigate?: () => void;
};

export default function WalletButton({
  handleModalOpen,
  handleNavigate,
}: WalletButtonProps): JSX.Element {
  const { isConnected, account, wallet } = useAptosWallet();

  const [popoverAnchor, setPopoverAnchor] = useState<HTMLButtonElement | null>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPopoverAnchor(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
  };

  const onConnectWalletClick = () => {
    handlePopoverClose();
    handleModalOpen();
  };
  return (
    <>
      <Button
        size="large"
        variant="contained"
        onClick={isConnected ? handleClick : onConnectWalletClick}
        className="wallet-button"
        sx={{ borderRadius: "10px" }}
      >
        {isConnected ? (
          <>
            <Avatar alt={wallet?.name} src={wallet?.icon} sx={{ width: 24, height: 24 }} />
            <Typography noWrap ml={2}>
              {truncateAddress(account?.address?.toString() || "") || "Unknown"}
            </Typography>
          </>
        ) : (
          <>
            <AccountBalanceWalletOutlinedIcon sx={{ marginRight: 1 }} />
            <Typography noWrap>Connect Wallet</Typography>
          </>
        )}
      </Button>
      <WalletMenu
        popoverAnchor={popoverAnchor}
        handlePopoverClose={handlePopoverClose}
        handleNavigate={handleNavigate}
      />
    </>
  );
}
