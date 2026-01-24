import  DBNAME  from "../constants.js";

import mongoose  from "mongoose";

 const dbConfig=async () => {
 try {
     const connectionInstance = await  mongoose.connect(`${process.env.MONGODB_URL}/${DBNAME}`);
  console.log(`\n MongoDB connection !! DB Host :${
    connectionInstance.connection.host }`);
 } catch (error) {
   console.error("Error in DB Connection :",error);
    process.exit(1);
 }
  
}
export default dbConfig;