import axios from "axios";

const Api = axios.create({
  baseURL: "http://localhost:3000", // Replace with your API's base URL
  timeout: 10000, // Set a timeout (in milliseconds) for requests
  withCredentials: true, // Send cookies with cross-origin requests
  headers: {
    "Content-Type": "application/json", // Set the content type for requests
    // You can add any other common headers here
  },
});
export default Api;
