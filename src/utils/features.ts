import mongoose from "mongoose";

export const connectToDB = () => {
  mongoose
    .connect("mongodb://0.0.0.0:27017", {
      dbName: "MERN_Ecommerce",
    })
    .then((c) => console.log(`Db is conected to ${c.connection.host}`))
    .catch((e) => {
      console.log(e);
    });
};
