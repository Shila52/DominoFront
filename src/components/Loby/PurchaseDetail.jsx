import React, { useState, useEffect } from "react";
import CountdownTimer from "./CountdownTimer";
import Api from "../../Api";
import axios from "axios";

export default function Purchase_detail({ data }) {
  const IMAGEBB_KEY = "c7c15c57445f1a9d26847fe956c42268";

  const [senderAddress, setsenderAddress] = useState("");
  const [ImageFiles, setImageFiles] = useState([]);

  const [Loading, setLoading] = useState(false);
  useEffect(() => {}, []);
  const updateOrder = async () => {
    console.log("running");
    const BulkUrls = await uploadImage();
    var Body = { senderAddress: senderAddress, image: BulkUrls, id: data._id };
    console.log(Body);
    await Api.patch(`/users/payment/update`, {
      data: { senderAddress: senderAddress, image: BulkUrls, id: data._id },
      credentials: "include",
    })
      .then((res) => {
        console.log(" do next step");
      })
      .catch((err) => {
        if ((err.response.status = 422)) {
          alert(err.response.data.msg);
        }
        console.log(err);
      });
  };
  const handleFileSelect = async (e) => {
    // we set time out to user dont rapid upload image from his phone

    const selectedFile = e.target.files[0];

    if (selectedFile) {
      const fileType = selectedFile.type;

      // Check if the selected file is an image (you can define your accepted image formats here)
      if (fileType.startsWith("image/")) {
        // Handle the image file as needed, e.g., upload it to a server
        setImageFiles([...ImageFiles, selectedFile]);
      } else {
        alert("Please select a valid image file.");

        // Clear the file input field
        e.target.value = null;
      }
    }
  };
  const uploadImage = async () => {
    const ImageFilesBulk = [...ImageFiles];
    const URLStr = [];

    // Create an array of promises for image uploads
    const uploadPromises = ImageFilesBulk.map(async (img) => {
      return new Promise(async (resolve, reject) => {
        try {
          setLoading(true);
          let body = new FormData();
          body.set("key", IMAGEBB_KEY);
          body.append("image", img);

          const response = await axios({
            method: "post",
            url: "https://api.imgbb.com/1/upload",
            data: body,
          });

          const imageUrl = response.data.data.display_url;
          URLStr.push(imageUrl);
          setLoading(false);
          resolve(imageUrl);
        } catch (err) {
          console.error(err);
          setLoading(false);
          reject(err);
        }
      });
    });

    try {
      // Wait for all image uploads to complete
      await Promise.all(uploadPromises);
      return URLStr;
    } catch (error) {
      console.error("Error uploading images:", error);
      return [];
    }
  };
  const removeImage = (index) => {
    const updatedImageFiles = [...ImageFiles];
    updatedImageFiles.splice(index, 1);
    setImageFiles(updatedImageFiles);
  };
  return (
    <div className="flex-1 max-w-4xl py-4 mx-2 w-96 justify-center text-center items-center bg-white max-h-full">
      <div className="w-full flex flex-row items-center justify-center  "></div>
      <div className="mt-4 text-center flex flex-col justify-center items-center gap-2">
        <p className="text-md text-slate-900">
          bitcoin addres : jhdgcjhwgdjgjhwgjc
        </p>
        <p className="text-md text-slate-900">usdt Adrres: wsjkdhckjehkjhjec</p>

        {/* <div className="flex self-center justify-self-center ">
          {" "}
          <p className="text-xl text-slate-900">
            {data?.pricing.bitcoin.amount}{" "}
          </p>
          <p className="text-lg text-slate-900">
            {data?.pricing.bitcoin.currency}{" "}
          </p>
        </div> */}
      </div>
      <p className="text-md text-slate-900">
        {" "}
        send {data.amount_Price} $ to one of this addres on top{" "}
      </p>
      <p className="text-md text-slate-900">
        {" "}
        please fill ur address to check are u send it {data.amount_Price} $ to
        us ifu are send u will get {data.amount_Coins} to ur account if not ur
        order will be cancle{" "}
      </p>
      <input
        type="text"
        className="p-1 text-center text-lg text-white"
        placeholder="sender Adress ... "
        onInput={(event) => {
          setsenderAddress(event.target.value);
        }}
      />
      {Loading && <p>loading until uploading image ...</p>}

      {/* <div className="text-center text-lg text-slate-900">
        <CountdownTimer expireTime={Date.parse(data.expires_at)} />
      </div> */}
      <div className="flex flex-col  justify-center items-center gap-4">
        {" "}
        <input
          type="file"
          disabled={Loading}
          className="p-1 text-center text-lg bg-slate-200 my-2  disabled:bg-slate-400 self-center justify-self-center text-slate-800"
          placeholder="sender Adress ... "
          onChange={(event) => handleFileSelect(event)}
        />
        <div className="flex gap-3">
          {" "}
          {ImageFiles.map((item, i) => {
            return (
              <div className=" relative mr-2" key={i}>
                <div
                  onClick={() => {
                    removeImage(i);
                  }}
                  className="absolute transform transition-all delay-300  hover:-translate-y-1  text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    x="10px"
                    y="0px"
                    width="40"
                    height="100"
                    viewBox="20 80 100 100"
                  >
                    <path
                      fill="#f37e98"
                      d="M25,30l3.645,47.383C28.845,79.988,31.017,82,33.63,82h32.74c2.613,0,4.785-2.012,4.985-4.617L75,30"
                    ></path>
                    <path
                      fill="#f15b6c"
                      d="M65 38v35c0 1.65-1.35 3-3 3s-3-1.35-3-3V38c0-1.65 1.35-3 3-3S65 36.35 65 38zM53 38v35c0 1.65-1.35 3-3 3s-3-1.35-3-3V38c0-1.65 1.35-3 3-3S53 36.35 53 38zM41 38v35c0 1.65-1.35 3-3 3s-3-1.35-3-3V38c0-1.65 1.35-3 3-3S41 36.35 41 38zM77 24h-4l-1.835-3.058C70.442 19.737 69.14 19 67.735 19h-35.47c-1.405 0-2.707.737-3.43 1.942L27 24h-4c-1.657 0-3 1.343-3 3s1.343 3 3 3h54c1.657 0 3-1.343 3-3S78.657 24 77 24z"
                    ></path>
                    <path
                      fill="#1f212b"
                      d="M66.37 83H33.63c-3.116 0-5.744-2.434-5.982-5.54l-3.645-47.383 1.994-.154 3.645 47.384C29.801 79.378 31.553 81 33.63 81H66.37c2.077 0 3.829-1.622 3.988-3.692l3.645-47.385 1.994.154-3.645 47.384C72.113 80.566 69.485 83 66.37 83zM56 20c-.552 0-1-.447-1-1v-3c0-.552-.449-1-1-1h-8c-.551 0-1 .448-1 1v3c0 .553-.448 1-1 1s-1-.447-1-1v-3c0-1.654 1.346-3 3-3h8c1.654 0 3 1.346 3 3v3C57 19.553 56.552 20 56 20z"
                    ></path>
                    <path
                      fill="#1f212b"
                      d="M77,31H23c-2.206,0-4-1.794-4-4s1.794-4,4-4h3.434l1.543-2.572C28.875,18.931,30.518,18,32.265,18h35.471c1.747,0,3.389,0.931,4.287,2.428L73.566,23H77c2.206,0,4,1.794,4,4S79.206,31,77,31z M23,25c-1.103,0-2,0.897-2,2s0.897,2,2,2h54c1.103,0,2-0.897,2-2s-0.897-2-2-2h-4c-0.351,0-0.677-0.185-0.857-0.485l-1.835-3.058C69.769,20.559,68.783,20,67.735,20H32.265c-1.048,0-2.033,0.559-2.572,1.457l-1.835,3.058C27.677,24.815,27.351,25,27,25H23z"
                    ></path>
                    <path
                      fill="#1f212b"
                      d="M61.5 25h-36c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h36c.276 0 .5.224.5.5S61.776 25 61.5 25zM73.5 25h-5c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h5c.276 0 .5.224.5.5S73.776 25 73.5 25zM66.5 25h-2c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h2c.276 0 .5.224.5.5S66.776 25 66.5 25zM50 76c-1.654 0-3-1.346-3-3V38c0-1.654 1.346-3 3-3s3 1.346 3 3v25.5c0 .276-.224.5-.5.5S52 63.776 52 63.5V38c0-1.103-.897-2-2-2s-2 .897-2 2v35c0 1.103.897 2 2 2s2-.897 2-2v-3.5c0-.276.224-.5.5-.5s.5.224.5.5V73C53 74.654 51.654 76 50 76zM62 76c-1.654 0-3-1.346-3-3V47.5c0-.276.224-.5.5-.5s.5.224.5.5V73c0 1.103.897 2 2 2s2-.897 2-2V38c0-1.103-.897-2-2-2s-2 .897-2 2v1.5c0 .276-.224.5-.5.5S59 39.776 59 39.5V38c0-1.654 1.346-3 3-3s3 1.346 3 3v35C65 74.654 63.654 76 62 76z"
                    ></path>
                    <path
                      fill="#1f212b"
                      d="M59.5 45c-.276 0-.5-.224-.5-.5v-2c0-.276.224-.5.5-.5s.5.224.5.5v2C60 44.776 59.776 45 59.5 45zM38 76c-1.654 0-3-1.346-3-3V38c0-1.654 1.346-3 3-3s3 1.346 3 3v35C41 74.654 39.654 76 38 76zM38 36c-1.103 0-2 .897-2 2v35c0 1.103.897 2 2 2s2-.897 2-2V38C40 36.897 39.103 36 38 36z"
                    ></path>
                  </svg>
                </div>
                <img
                  src={URL.createObjectURL(item)}
                  className="w-24 shadow-sm shadow-black h-24 rounded-md"
                />
              </div>
            );
          })}
        </div>
        <button
          disabled={Loading}
          className="rounded-md text-lg p-2 disabled:bg-slate-100 bg-slate-700 text-white font-bold"
          onClick={updateOrder}
          target="_blank"
        >
          i send it
        </button>
      </div>
    </div>
  );
}

// {
//     "currency": "USDT",
//     "totalFee": "0.3",
//     "prepayId": "249435650484158464",
//     "terminalType": "WEB",
//     "expireTime": 1693992926401,
//     "qrcodeLink": "https://public.bnbstatic.com/static/payment/20230906/fe275e45-0203-446b-af40-c11db36964a4.jpg",
//     "qrContent": "https://app.binance.com/qr/dplkbc8f54357b3848538b215d82e64e348c",
//     "checkoutUrl": "https://pay.binance.com/en/checkout/13b7792887a6415393e4dd4f7cd625c5",
//     "deeplink": "bnc://app.binance.com/payment/secpay?tempToken=UxDGmDUO2TvuHdE7a3YtvkQgHXRpVHcv",
//     "universalUrl": "https://app.binance.com/payment/secpay?linkToken=13b7792887a6415393e4dd4f7cd625c5&_dp=Ym5jOi8vYXBwLmJpbmFuY2UuY29tL3BheW1lbnQvc2VjcGF5P3RlbXBUb2tlbj1VeERHbURVTzJUdnVIZEU3YTNZdHZrUWdIWFJwVkhjdg"
// }
