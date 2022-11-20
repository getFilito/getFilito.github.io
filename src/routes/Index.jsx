import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { Input, Image, Button } from "@mantine/core";

import MiniSearch from "minisearch";
import axios from "axios";

import { BigNumber } from "ethers";
import { useContractInfiniteReads, paginatedIndexesConfig } from "wagmi";
import abiFilito from "./abiFilito.json";
import { useEffect, useState } from "react";

let miniSearch = new MiniSearch({
  fields: ["alt"], // fields to index for full-text search
  storeFields: ["alt", "image"], // fields to return with search results
});

export default function Index() {
  const { address, connector, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const {
    chains,
    error: errorNtw,
    isLoading: isLoadingNtw,
    pendingChainId,
    switchNetwork,
  } = useSwitchNetwork();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const filitoContractConfig = {
    address: "0x293D3f976EF14b75DC4687AF25EC1B526bF68F60",
    abi: abiFilito,
  };

  const { data, fetchNextPage } = useContractInfiniteReads({
    cacheKey: "Filito",
    ...paginatedIndexesConfig(
      (index) => {
        return [
          {
            ...filitoContractConfig,
            functionName: "getBranch",
            args: [BigNumber.from(index)],
          },
        ];
      },
      { start: 1, perPage: 10, direction: "increment" }
    ),
  });

  function getAllData(pages) {
    const URLs = [];
    pages.forEach((p) => {
      URLs.push(...p);
    });
    return Promise.all(URLs.map(fetchData));
  }

  async function fetchData(URL) {
    if (!URL) return [];
    return axios
      .get(`https://ipfs.io/ipfs/${URL}`)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        return [];
      });
  }

  useEffect(() => {
    if (!data || !data.pages) return;
    console.log(data);
    getAllData(data.pages)
      .then((response) => {
        const docs = [];
        response.forEach((r) => {
          docs.push(...r.filter((r) => !!r.alt));
        });
        miniSearch.removeAll();
        console.log("docs", docs);
        miniSearch.addAll(docs);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [data]);

  useEffect(() => {
    let results = miniSearch.search(search);
    console.log("results", search, results);
    setResults(results);
  }, [search]);

  if (isConnected) {
    return (
      <div>
        <Input
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        ></Input>
        <Button onClick={fetchNextPage}>+</Button>
        {results &&
          results.map((image, i) => {
            return (
              <Image
                key={i}
                width={200}
                height={80}
                fit="contain"
                radius="md"
                src={image.image}
              ></Image>
            );
          })}
        <div>{address}</div>
        <div>Connected to {connector?.name}</div>
        <button onClick={disconnect}>Disconnect</button>
        <>
          {chain && <div>Connected to {chain.name}</div>}

          {chains.map((x) => (
            <button
              disabled={!switchNetwork || x.id === chain?.id}
              key={x.id}
              onClick={() => switchNetwork?.(x.id)}
            >
              {x.name}
              {isLoading && pendingChainId === x.id && " (switching)"}
            </button>
          ))}

          <div>{error && error.message}</div>
        </>
      </div>
    );
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          disabled={!connector?.ready}
          key={connector?.id}
          onClick={() => connect({ connector })}
        >
          {connector?.name}
          {!connector?.ready && " (unsupported)"}
          {isLoading &&
            connector?.id === pendingConnector?.id &&
            " (connecting)"}
        </button>
      ))}

      {error && <div>{error.message}</div>}
    </div>
  );
}
