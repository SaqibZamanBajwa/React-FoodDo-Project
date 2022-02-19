const mongoose = require('mongoose');
// const DB = process.env.DATABASE;
const DB ="mongodb+srv://priyalramani786:orangecat2@cluster2.z9aqe.mongodb.net/foodDo_DB?authSource=admin&replicaSet=atlas-agjj0u-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true";
mongoose
  .connect(DB)
  .then(() => {
    console.log(`connection successful`);
  })
  .catch((err) => console.log(`not connected`));