//connect to mongoDB
const mongoose = require("mongoose");
const mongoURI =
  "mongodb+srv://zhambulovat:KKmIC0ca2RxBfY7q@cluster0.kmjuemh.mongodb.net/?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
  };

connectDB();

//make Car model and get Data from html
const Car = mongoose.model("Car", {
  id: {
    type:String,
    required:true
  },
  title: String,
  price: Number,
  city: String,
  volume: Number,
  carcase: String,
  kz: String,
  mileage: String,
  driving: {
    type:Number,
    default:null
  },
});

const axios = require("axios");
const cheerio = require("cheerio");
const id = "157672808";

async function getData(id) {
  const url = `https://m.kolesa.kz/a/show/${id}`;
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const carData = {
      id: id,
      title: $(".a-header__title").text().trim().replace(/\s\s+/g, " "),
      price: parseInt($(".a-header__price")
      .text()
      .trim()
      .replace(/[^0-9.]+/g, ""))
      ,
      city: $('.a-properties__label:contains("Город")')
        .next(".a-properties__value")
        .text()
        .trim(),
      volume: parseInt($('.a-properties__label:contains("Объем двигателя, л")')
        .next(".a-properties__value")
        .text()
        .trim()
        .replace(/[^0-9.]+/g, "")),
      carcase: $('.a-properties__label:contains("Кузов")')
        .next(".a-properties__value")
        .text()
        .trim(),
      kz: $('.a-properties__label:contains("Растаможен в Казахстане")')
        .next(".a-properties__value")
        .text()
        .trim(),
      mileage: $('.a-properties__label:contains("Привод")')
        .next(".a-properties__value")
        .text()
        .trim(),
      driving: parseInt($('.a-properties__label:contains("Пробег")')
        .next(".a-properties__value")
        .text()
        .trim()
        ),
    };

    if (Number.isNaN(carData.driving)){
      carData.driving = null
    }
    
    return carData;
  } catch (error) {
    console.error("Error parsing: ", error);
    return null;
  }
}

getData(id).then((carData) => {
  if (carData) {
    console.log(carData);
    saveCarData(carData);
  } else {
    console.log("Data not found");
  }
});

//save Data
async function saveCarData(carData) {
  try {
    const car = new Car(carData);
    await car.save();
    console.log("Car data saved");
  } catch (error) {
    console.error("Error saving car data to MongoDB:", error);
  }
}

//JSON format 
async function main() {
  const carData = await getData(id);
  if (carData) {
    console.log(JSON.stringify(carData, null, 2)); //отступы
  } else {
    console.log("Data not found");
  }
}

main();
