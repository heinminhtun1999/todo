import axios from "axios";
import resovle from "./resolve.js";

const getAllBoards = async () => {
    return await resovle(async () => await axios({ method: "get", url: "/api/boards" }));
};

export { getAllBoards };