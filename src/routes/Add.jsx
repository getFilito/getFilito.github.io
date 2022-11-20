import React from "react";
import axios from "axios";
import {
  Image,
  Input,
  Box,
  Button,
  Text,
  SimpleGrid,
  HoverCard,
  Center,
  Loader,
} from "@mantine/core";
import { useState } from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { IconForms } from "@tabler/icons";
import { Link } from "react-router-dom";

import IPFS from "../libs/IPFS";

import abiFilito from "./abiFilito.json";

export default function Add() {
  const [url, setUrl] = useState("https://www.euronews.com/");
  const [images, setImages] = useState([]);

  const [cid, setCid] = useState("");

  const [loading, setLoading] = useState(false);

  async function index() {
    setLoading(true);
    try {
      const data = await axios.get(
        `https://api.novapost.online/get.php?url=${url}`
      );
      const el = document.createElement("html");
      el.innerHTML = data.data;
      const imgs = el.getElementsByTagName("img");
      if (!imgs) return;
      const result = [];
      for (let i = 0; i < imgs.length; i++) {
        if (imgs[i].src.indexOf("data:") + 1) continue;
        if (!imgs[i].alt || (!imgs[i].src && !imgs[i].dataset.src)) continue;
        result.push({ id: i + 1, alt: imgs[i].alt, image: imgs[i].src });
      }
      setImages(result);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function send() {
    setLoading(true);
    const blob = new Blob([JSON.stringify(images)], {
      type: "application/json",
    });
    const res = await IPFS(blob);
    setCid(res);
    setTimeout(() => {
      if (write) write();
      setLoading(false);
    }, 1000);
  }

  const filitoContractConfig = {
    address: "0x66C5a0007b690855488c2Db94569F49B715c12CD",
    abi: abiFilito,
  };

  const { config } = usePrepareContractWrite({
    ...filitoContractConfig,
    functionName: "setBranch",
    args: [cid],
  });
  const { write } = useContractWrite(config);

  return (
    <Box>
      <Center m={30}>
        <Link to={`/`} style={{ textDecoration: "none" }}>
          <Text
            variant="gradient"
            gradient={{ from: "indigo", to: "green", deg: 45 }}
            sx={{ fontFamily: "Sono, sans-serif" }}
            ta="center"
            fz="xl"
            fw={700}
            style={{ margin: "0 10px 0 0", padding: 0, fontSize: "30px" }}
          >
            Filito
          </Text>
        </Link>
        <Input
          onChange={(e) => setUrl(e.target.value)}
          icon={<IconForms />}
          placeholder="URL for Index"
          rightSection={loading && <Loader size="sm" />}
          size="xl"
          style={{ width: "50%" }}
        ></Input>
        <Button
          onClick={index}
          ml={5}
          size="xl"
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          INDEX
        </Button>
        <Button
          disabled={!images || !images.length}
          onClick={send}
          ml={5}
          size="xl"
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
        >
          SEND
        </Button>
      </Center>
      <SimpleGrid cols={4}>
        {images &&
          images.map((image, i) => {
            return (
              <div
                key={i}
                style={{ width: 240, marginLeft: "auto", marginRight: "auto" }}
                onClick={() => {
                  setImages(images.filter((img, id) => id !== i));
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
    </Box>
  );
}
