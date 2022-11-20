import React from "react";
import axios from "axios";
import { Image, Input, Box, Button, Text } from "@mantine/core";
import { useState } from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

import IPFS from "../libs/IPFS";

import abiFilito from "./abiFilito.json";

export default function Add() {
  const [url, setUrl] = useState("");
  const [images, setImages] = useState([]);

  const [cid, setCid] = useState("");

  async function send() {
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
        if (!imgs[i].alt) continue;
        result.push({ id: i + 1, alt: imgs[i].alt, image: imgs[i].src });
      }
      setImages(result);
    } catch (error) {
      console.log(error);
    }
  }

  async function upload() {
    const blob = new Blob([JSON.stringify(images)], {
      type: "application/json",
    });
    const res = await IPFS(blob);
    console.log("res", res);
    setCid(res);
    setTimeout(() => {
      if (write) write();
    }, 1000);
  }

  const filitoContractConfig = {
    address: "0x293D3f976EF14b75DC4687AF25EC1B526bF68F60",
    abi: abiFilito,
  };

  const { config } = usePrepareContractWrite({
    ...filitoContractConfig,
    functionName: "setBranch",
    args: [cid],
  });
  const { data, isLoading, isSuccess, write } = useContractWrite(config);

  return (
    <Box>
      <Text>{url}</Text>
      <Input onChange={(e) => setUrl(e.target.value)}></Input>
      <Button onClick={send}>OK</Button>
      <Button onClick={upload}>SEND</Button>
      {images &&
        images.map((image, i) => {
          return (
            <Box key={i}>
              <Image
                width={200}
                height={80}
                fit="contain"
                radius="md"
                src={image.image}
              ></Image>
              <Button
                onClick={() => {
                  setImages(images.filter((img, id) => id !== i));
                }}
              >
                x
              </Button>
            </Box>
          );
        })}
    </Box>
  );
}
