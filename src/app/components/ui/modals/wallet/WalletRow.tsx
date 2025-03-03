"use client";

import { AdapterWallet, WalletItem, isInstallRequired } from "@aptos-labs/wallet-adapter-react";
import { Box, Button, ListItem, ListItemText, useTheme } from "@mui/material";
import { grey } from "@/app/components/aptosColorPalette";
// reported bug with loading mui icons with esm, therefore need to import like this https://github.com/mui/material-ui/issues/35233

interface WalletRowProps {
  wallet: AdapterWallet;
  onConnect?: () => void;
}

function WalletRow({ wallet, onConnect }: WalletRowProps) {
  const theme = useTheme();
  return (
    <WalletItem wallet={wallet} onConnect={onConnect} asChild>
      <ListItem disablePadding>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            px: 2,
            py: 1.5,
            gap: 2,
            border: "solid 1px",
            borderColor: theme.palette.mode === "dark" ? grey[700] : grey[200],
            borderRadius: `${theme.shape.borderRadius}px`,
          }}
        >
          <Box component={WalletItem.Icon} sx={{ width: 32, height: 32 }} />
          <ListItemText primary={wallet.name} primaryTypographyProps={{ fontSize: "1.125rem" }} />
          {isInstallRequired(wallet) ? (
            <WalletItem.InstallLink asChild>
              <Button LinkComponent={"a"} size="small" className="wallet-connect-install">
                Install
              </Button>
            </WalletItem.InstallLink>
          ) : (
            <WalletItem.ConnectButton asChild>
              <Button variant="contained" size="small" className="wallet-connect-button">
                Connect
              </Button>
            </WalletItem.ConnectButton>
          )}
        </Box>
      </ListItem>
    </WalletItem>
  );
}

export default WalletRow;
