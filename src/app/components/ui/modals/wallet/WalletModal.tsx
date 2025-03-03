"use client";

import {
  AboutAptosConnect,
  AptosPrivacyPolicy,
  WalletSortingOptions,
  groupAndSortWallets,
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import {
  Box,
  Button,
  Collapse,
  Dialog,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { grey } from "@/app/components/aptosColorPalette";
// reported bug with loading mui icons with esm, therefore need to import like this https://github.com/mui/material-ui/issues/35233
import {
  ArrowForward,
  Close as CloseIcon,
  ExpandMore,
  LanOutlined as LanOutlinedIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { WalletConnectorProps } from "@/app/components/hooks/WalletConnector";
import renderEducationScreen from "./RenderEducationScreen";
import WalletRow from "./WalletRow";
import AptosConnectWalletRow from "./AptosConnectWalletRow";

interface WalletsModalProps
  extends Pick<WalletConnectorProps, "networkSupport" | "modalMaxWidth">,
    WalletSortingOptions {
  handleClose: () => void;
  modalOpen: boolean;
}

export default function WalletsModal({
  handleClose,
  modalOpen,
  networkSupport,
  modalMaxWidth,
  ...walletSortingOptions
}: WalletsModalProps): JSX.Element {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const { wallets = [] } = useWallet();

  const { aptosConnectWallets, availableWallets, installableWallets } = groupAndSortWallets(
    wallets,
    walletSortingOptions
  );

  const hasAptosConnectWallets = !!aptosConnectWallets.length;

  return (
    <Dialog
      open={modalOpen}
      onClose={handleClose}
      aria-label="wallet selector modal"
      sx={{ borderRadius: `${theme.shape.borderRadius}px` }}
      maxWidth={modalMaxWidth ?? "xs"}
      fullWidth
    >
      <Stack
        sx={{
          top: "50%",
          left: "50%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          gap: 2,
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 12,
            top: 12,
            color: grey[450],
          }}
        >
          <CloseIcon />
        </IconButton>
        <AboutAptosConnect renderEducationScreen={renderEducationScreen}>
          <Typography
            align="center"
            variant="h5"
            component="h2"
            pt={2}
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {hasAptosConnectWallets ? (
              <>
                <span>Log in or sign up</span>
                <span>with Social + Aptos Connect</span>
              </>
            ) : (
              "Connect Wallet"
            )}
          </Typography>
          {networkSupport && (
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LanOutlinedIcon
                sx={{
                  fontSize: "0.9rem",
                  color: grey[400],
                }}
              />
              <Typography
                sx={{
                  display: "inline-flex",
                  fontSize: "0.9rem",
                  color: grey[400],
                }}
                align="center"
              >
                {networkSupport} only
              </Typography>
            </Box>
          )}
          {hasAptosConnectWallets && (
            <Stack gap={1}>
              {aptosConnectWallets.map((wallet) => (
                <AptosConnectWalletRow key={wallet.name} wallet={wallet} onConnect={handleClose} />
              ))}
              <Typography
                component="p"
                fontSize="14px"
                sx={{
                  display: "flex",
                  gap: 0.5,
                  justifyContent: "center",
                  alignItems: "center",
                  color: grey[400],
                }}
              >
                Learn more about{" "}
                <Box
                  component={AboutAptosConnect.Trigger}
                  sx={{
                    background: "none",
                    border: "none",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    cursor: "pointer",
                    display: "flex",
                    gap: 0.5,
                    px: 0,
                    py: 1.5,
                    alignItems: "center",
                    color: theme.palette.text.primary,
                    appearance: "none",
                  }}
                >
                  Aptos Connect <ArrowForward sx={{ height: 16, width: 16 }} />
                </Box>
              </Typography>

              <Stack component={AptosPrivacyPolicy} alignItems="center" py={0.5}>
                <Typography component="p" fontSize="12px" lineHeight="20px">
                  <AptosPrivacyPolicy.Disclaimer />{" "}
                  <Box
                    component={AptosPrivacyPolicy.Link}
                    sx={{
                      color: grey[400],
                      textDecoration: "underline",
                      textUnderlineOffset: "4px",
                    }}
                  />
                  <span>.</span>
                </Typography>
                <Box
                  component={AptosPrivacyPolicy.PoweredBy}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    fontSize: "12px",
                    lineHeight: "20px",
                    color: grey[400],
                  }}
                />
              </Stack>
              <Divider sx={{ color: grey[400], pt: 2 }}>Or</Divider>
            </Stack>
          )}
          <Stack sx={{ gap: 1 }}>
            {availableWallets.map((wallet) => (
              <WalletRow key={wallet.name} wallet={wallet} onConnect={handleClose} />
            ))}
            {!!installableWallets.length && (
              <>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setExpanded((prev) => !prev)}
                  endIcon={<ExpandMore sx={{ height: "20px", width: "20px" }} />}
                >
                  More Wallets
                </Button>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                  <Stack sx={{ gap: 1 }}>
                    {availableWallets.map((wallet) => (
                      <WalletRow key={wallet.name} wallet={wallet} onConnect={handleClose} />
                    ))}
                  </Stack>
                </Collapse>
              </>
            )}
          </Stack>
        </AboutAptosConnect>
      </Stack>
    </Dialog>
  );
}
