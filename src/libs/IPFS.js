import axios from "axios";

export default async function IPFS(file) {
  var formData = new FormData();
  formData.append("file", file || "");
  try {
    const response = await axios.post(
      "https://api.web3.storage/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGNBYjNkQjI4ODY3MTAyMGU1NmYxNjU1MDVlQ0E0MGE4NDY2NGQwNWIiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2Njg3Nzk0MjE3MTcsIm5hbWUiOiJORlQifQ.4_2s-LFu0Qhp8DP8atx3-8I3r5CICAQ_byszxQzQ8nw`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return Promise.resolve(response.data.cid);
  } catch (error) {
    console.log(error);
  }
}
