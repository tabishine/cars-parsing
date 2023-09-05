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

//get Data
// const Car = require("./models");
const Car = mongoose.model("Car", {
  id: String,
  title: String,
  price: String,
  city: String,
  volume: String,
  carcase: String,
  kz: String,
  mileage: String,
  driving: String,
});

const axios = require("axios");
const cheerio = require("cheerio");
const id = "158280541";

async function getData(id) {
  const url = `https://m.kolesa.kz/a/show/${id}`;
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const carData = {
      id: id,
      title: $(".a-header__title").text().trim().replace(/\s\s+/g, " "),
      price: $(".a-header__price").text().trim().replace(/[^0-9.]+/g, ""),
      city: $('.a-properties__label:contains("Город")')
        .next(".a-properties__value")
        .text()
        .trim(),
      volume: $('.a-properties__label:contains("Объем двигателя, л")')
        .next(".a-properties__value")
        .text()
        .trim()
        .replace(/[^0-9.]+/g, "")
        ,
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
      driving: $('.a-properties__label:contains("Пробег")')
        .next(".a-properties__value")
        .text()
        .trim()
        .replace(/[^0-9.]+/g, ""),
    };
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
    // const processedPrice = carData.price.replace(/[^0-9.]+/g, " ");
    // carData.price = processedPrice;
    const car = new Car(carData);
    await car.save();
    console.log("Car data saved");
  } catch (error) {
    console.error("Error saving car data to MongoDB:", error);
  }
}
