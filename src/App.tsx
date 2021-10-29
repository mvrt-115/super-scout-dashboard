import React, { FC } from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import Navbar from "./components/Navbar";
import Routes from "./components/Routes";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import "./App.css";

const theme = extendTheme({
  fonts: { heading: "Roboto", body: "Roboto" },
  colors: {
    purp: {
      50: "#9969ac",
      100: "#88509e",
      200: "#773791",
      300: "#661e83",
      400: "#550575",
      500: "#4d0569",
      600: "#44045e",
      700: "#3b0452",
      800: "#330346",
    },
    lav: {
      50: "#e9d0f4",
      100: "#e5c8f2",
      200: "#e1c0f0",
      300: "#deb8ee",
      400: "#dab0ec",
      500: "#c49ed4",
      600: "#ae8dbd",
      700: "#997ba5",
      800: "#836a8e",
    },
    gold: {
      50: "#ffdc70",
      100: "#ffd658",
      200: "#ffd040",
      300: "#ffca28",
      400: "#ffc410",
      500: "#e6b00e",
      600: "#cc9d0d",
      700: "#b3890b",
      800: "#99760a",
    },
  },
});

const App: FC = () => {
  return (
    <div className="App">
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <Navbar />
          <div style={{ marginTop: "3vh" }}>
            <Switch>
              <Routes />
            </Switch>
          </div>
        </BrowserRouter>
      </ChakraProvider>
    </div>
  );
};

export default App;
