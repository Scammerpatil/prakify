import Slot from "@/models/Slot";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";

// Database Connection

const dbConfig = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    const connection = mongoose.connection;
    Slot;
    Transaction;
    connection.on("connected", () => {
      console.log("Connected to the Database");
    });
    connection.on("error", (error) => {
      console.log("Error: ", error);
    });
  } catch (error) {
    console.log("Error: ", error);
  }
};

export default dbConfig;
