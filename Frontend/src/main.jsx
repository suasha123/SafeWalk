import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./Components/AuthContext.jsx";
import App from "./App.jsx";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./Components/theme.jsx";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import React from "react";
const notistackRef = React.createRef();
const onClickDismiss = (key) => () => {
  notistackRef.current.closeSnackbar(key);
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          ref={notistackRef}
          maxSnack={3}
          autoHideDuration={3000}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          action={(key) => (
            <IconButton onClick={onClickDismiss(key)} sx={{ color: '#fff' }}>
              <CloseIcon />
            </IconButton>
          )}
        >
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
