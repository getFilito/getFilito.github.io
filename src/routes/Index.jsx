import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useNetwork, useSwitchNetwork } from "wagmi";
import {
  Input,
  Image,
  Button,
  SimpleGrid,
  HoverCard,
  Box,
  Center,
  Text,
  Tooltip,
} from "@mantine/core";

import { Link } from "react-router-dom";

import MiniSearch from "minisearch";
import axios from "axios";

import { BigNumber } from "ethers";
import { useContractInfiniteReads, paginatedIndexesConfig } from "wagmi";
import abiFilito from "./abiFilito.json";
import { useEffect, useState } from "react";
import { IconPhotoSearch, IconReload, IconPhotoPlus } from "@tabler/icons";

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
  const [images, setImages] = useState([]);

  const filitoContractConfig = {
    address: "0x4e20A7f3fA05A131287874DEf855d949Ed609F5D",
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
    let images = miniSearch.search(search);
    console.log("images", search, images);
    setImages(images);
  }, [search]);

  if (isConnected && !chain?.unsupported) {
    return (
      <Box>
        <Box m={60}>
          <Box m={40}>
            <Text
              variant="gradient"
              gradient={{ from: "indigo", to: "green", deg: 45 }}
              sx={{ fontFamily: "Sono, sans-serif" }}
              ta="center"
              fz="xl"
              fw={700}
              style={{ margin: 0, padding: 0, fontSize: "100px" }}
            >
              Filito
            </Text>
          </Box>
          <Center>
            <Input
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              icon={<IconPhotoSearch />}
              placeholder="Search"
              size="xl"
              style={{ width: "50%" }}
            ></Input>
            <Button
              onClick={fetchNextPage}
              ml={5}
              size="xl"
              variant="gradient"
              gradient={{ from: "indigo", to: "cyan" }}
            >
              <IconReload />
            </Button>
          </Center>
        </Box>

        {images && images.length ? (
          <SimpleGrid cols={4}>
            {images.map((image, i) => {
              return (
                <div
                  key={i}
                  style={{
                    width: 240,
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  <HoverCard width={240} shadow="md">
                    <HoverCard.Target>
                      <Image radius="md" src={image.image} alt={image.alt} />
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                      <Text size="sm">{image.alt}</Text>
                    </HoverCard.Dropdown>
                  </HoverCard>
                </div>
              );
            })}
          </SimpleGrid>
        ) : (
          <Box m={40}>
            <Center>
              <Tooltip label="Add to Index">
                <Link to={`/add`}>
                  <Button
                    onClick={fetchNextPage}
                    ml={5}
                    size="xl"
                    variant="light"
                  >
                    <IconPhotoPlus />
                  </Button>
                </Link>
              </Tooltip>
            </Center>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Box m={60}>
        <Box m={40}>
          <Text
            variant="gradient"
            gradient={{ from: "indigo", to: "green", deg: 45 }}
            sx={{ fontFamily: "Sono, sans-serif" }}
            ta="center"
            fz="xl"
            fw={700}
            style={{ margin: 0, padding: 0, fontSize: "100px" }}
          >
            Filito
          </Text>
        </Box>
      </Box>

      {!isConnected && (
        <Center style={{ width: "100%", margin: "10px auto" }}>
          {connectors.map((connector) => (
            <Button
              disabled={!connector?.ready}
              key={connector?.id}
              onClick={() => connect({ connector })}
              size="xl"
              variant="light"
            >
              {connector?.name}
              {!connector?.ready && " (unsupported)"}
              {isLoading &&
                connector?.id === pendingConnector?.id &&
                " (connecting)"}
            </Button>
          ))}

          <Box>{error && <div>{error.message}</div>}</Box>
        </Center>
      )}

      <Center style={{ width: "100%", margin: "10px auto" }}>
        {chains.map((x) => (
          <Button
            disabled={!switchNetwork || x.id === chain?.id}
            key={x.id}
            onClick={() => switchNetwork?.(x.id)}
            size="xl"
            variant="light"
          >
            {x.name}
            {isLoadingNtw && pendingChainId === x.id && " (switching)"}
          </Button>
        ))}

        <Box>{errorNtw && errorNtw.message}</Box>
      </Center>
    </Box>
  );
}
