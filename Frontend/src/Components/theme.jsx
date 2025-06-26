// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 15,
  },
  components: {
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: "#1e1e2f", // match your dark background
          color: "#fff",
          fontSize: "15px",
          fontFamily: "'Inter', sans-serif",
          borderRadius: "8px",
        },
      },
    },
  },
});

export default theme;
