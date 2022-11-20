import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

import Index from "./routes/Index";
import Add from "./routes/Add";
import ErrorPage from "./routes/ErrorPage";

const router = createHashRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <ErrorPage />,
  },
  {
    path: "add",
    element: <Add />,
    errorElement: <ErrorPage />,
  },
]);

const filcoinChain = {
  id: 31_415,
  name: "Filecoin — Wallaby testnet",
  network: "filcoin",
  nativeCurrency: {
    decimals: 18,
    name: "Filcoin",
    symbol: "tFIL",
  },
  rpcUrls: {
    default: "https://wallaby.node.glif.io/rpc/v0",
  },
  blockExplorers: {
    default: { name: "Glif", url: "https://explorer.glif.io/wallaby" },
  },
  multicall: {
    address: "0xDd41D0EB54645930585b0dce4bE649eA49562Dc4",
    blockCreated: 6926,
  },
  testnet: true,
};

const { provider, chains } = configureChains(
  [filcoinChain],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id !== filcoinChain.id) return null;
        return { http: chain.rpcUrls.default };
      },
    }),
  ]
);

const client = createClient({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  provider,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <MantineProvider
    withGlobalStyles
    withNormalizeCSS
    theme={{
      colorScheme: "dark",
    }}
  >
    <WagmiConfig client={client}>
      <RouterProvider router={router} />
    </WagmiConfig>
  </MantineProvider>
);
