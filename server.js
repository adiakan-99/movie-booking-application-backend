const Express = require("express")
const CORS = require("cors")
const Bcrypt = require("bcrypt")
const Razorpay = require("razorpay")

const app = Express()

app.use(Express.json())
app.use(CORS())


const Mongoose = require("mongoose")

Mongoose.connect("mongodb+srv://adityaakanfade:jjHKPtR12qk9JU5H@cluster0.itjfpg5.mongodb.net/moviesdatabase?retryWrites=true&w=majority&appName=Cluster0")

const MovieSchema = new Mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },
    movie_name: {
        type: String,
        required: true
    },
    image_url: {
        type: String,
        required: true
    },
    trailer: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    censor: {
        type: String,
        required: true
    },
    director: {
        type: String,
        required: true
    },
    cast: {
        type: Array,
        required: true
    }
})

const MovieModel = Mongoose.model("moviescollections", MovieSchema)

app.post("/insert/movie", async (req, res) => {
    try {
        const movieData = req.body

        const NewMovie = new MovieModel(movieData)

        NewMovie.save()

        res.json({ "message": "Data inserted succesfully!" })
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ "message": "An error occured during insertion!" })
    }
})

app.get("/fetch/all/movies", async (req, res) => {
    const readMovieData = await MovieModel.find()

    res.json(readMovieData)
})

const UserSchema = new Mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

const UserModel = Mongoose.model("userscollections", UserSchema)

app.post("/signup", async (req, res) => {
    const signupDetails = req.body

    if (signupDetails.myPassword !== signupDetails.myConfirmPassowrd) {
        return res.json({ "message": "Passowords Don't Match!" })
    }

    try {
        const hashedPassword = await Bcrypt.hash(signupDetails.myPassword, 15)

        const UserData = new UserModel({
            username: signupDetails.myUsername,
            email: signupDetails.myEmail,
            password: hashedPassword
        })

        await UserData.save()

        return res.json({ "message": "Sign Up Succesfull!" })
    }
    catch (error) {
        if (error.code == 11000) {
            if (error.keyPattern.username) {
                return res.json({ "message": "Entered username already exists!" })
            } else if (error.keyPattern.email) {
                return res.json({ "message": "Entered email already exists!" })
            }
        }

        return res.status(500).json({ "message": "An error occurred during sign up!" })
    }
})

app.post("/signin", async (req, res) => {
    const signinDetails = req.body

    const UserData = await UserModel.findOne({ email: signinDetails.myEmail })

    try {
        if (UserData) {
            const enteredPassword = signinDetails.myPassword

            if (Bcrypt.compare(enteredPassword, UserData.password)) {
                return res.json({ "message": "Sign In succesfull!", "username": UserData.username })
            } else {
                return res.json({ "message": "Invalid Password!" })
            }
        } else {
            return res.json({ "message": "Invalid Email!" })
        }
    } catch {
        return res.status(500).json({ "message": "An error occured during signup" })
    }
})

const TheatreSchema = new Mongoose.Schema({
    theatreName: {
        type: String,
        required: true
    },
    showTimes: {
        type: Array,
        required: true
    }
})

const LocationSchema = new Mongoose.Schema({
    location: {
        type: String,
        required: true,
        unique: true
    },
    theatres: [TheatreSchema]
})

const LocationModel = Mongoose.model("locationsandtheatres", LocationSchema)

app.post("/insert/location", (req, res) => {
    const data = req.body

    const LocationData = new LocationModel(data)

    LocationData.save()

    res.json({ "message": "Data saved!" })
})

app.get("/fetch/locationandtheatre", async (req, res) => {
    const LocationData = await LocationModel.find()

    res.json(LocationData)
})

const TheatreSeatingSchema = new Mongoose.Schema({
    theatreName: {
        type: String,
        required: true
    },
    rowCount: {
        type: Number,
        required: true
    },
    columnCount: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
})

const TheatreSeatingModel = Mongoose.model("theatreseatingcollections", TheatreSeatingSchema)

app.post("/insert/theatreseating", (req, res) => {
    try {
        const data = req.body

        const TheatreSeatingData = new TheatreSeatingModel(data)

        TheatreSeatingData.save()

        res.json({ "message": "Data succesfully inserted!" })
    }
    catch (error) {
        res.status(500).json({ "message": "An error occured while inserting data!" })
    }
})

app.get("/get/theatreseating/:theatrename", async (req, res) => {
    try {
        const receivedTheatreName = req.params.theatrename

        const theatreDetails = await TheatreSeatingModel.findOne({ theatreName: receivedTheatreName })

        res.json({ "theatreDetails": theatreDetails })
    }
    catch (error) {
        res.status(500).json({ "message": "Unable to get theatre details!" })
    }
})

const razorpayDetails = new Razorpay({
    key_id: "rzp_test_tQU9lVNtUvQtjs",
    key_secret: "yPGvTGqcznK4jZHROKqMcx1O"
})

app.post("/create/order", (req, res) => {
    const enteredAmount = req.body.amount

    const options = {
        amount: enteredAmount * 100,
        currency: "INR"
    }

    razorpayDetails.orders.create(options, (error, orderInfo) => {
        if (!error) {
            res.json({ output: orderInfo })
        } else {
            console.log(error)
        }
    })
})

const UserBookingSchema = new Mongoose.Schema({
    movie: {
        type: String,
        required: true
    },
    censor: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    theatreName: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    seats: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    orderID: {
        type: String,
        required: true
    },
    paymentID: {
        type: String,
        required: true
    },
    user: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "userscollections"
    }
})

const UserBookingHistoryModel = new Mongoose.model("userbookinghistories", UserBookingSchema)

app.post("/insert/booking", async (req, res) => {
    try {
        const paymentDetails = req.body;

        const userData = await UserModel.findOne({ username: paymentDetails.username })

        const booking = new UserBookingHistoryModel({
            movie: paymentDetails.movie,
            censor: paymentDetails.censor,
            location: paymentDetails.location,
            theatreName: paymentDetails.theatre,
            date: paymentDetails.date,
            time: paymentDetails.time,
            seats: paymentDetails.seats,
            amount: (paymentDetails.amount / 100),
            orderID: paymentDetails.order_id,
            paymentID: paymentDetails.payment_id,
            user: userData._id
        })

        booking.save()

        res.json({ "message": "Booking succesful!" })
    }
    catch (error) {
        res.json({ "message": "Booking unsuccesfull!" })
    }
})

app.get("/get/booking/:username", async (req, res) => {
    try {
        const username = req.params.username

        const userDetails = await UserModel.findOne({ username: username })

        const bookingHistory = await UserBookingHistoryModel.find({ user: userDetails._id })

        res.json({ bookingHistoryData: bookingHistory })
    }
    catch {
        res.json({"message": "Cannot find Booking History!"})
    }
})

app.delete("/booking/delete/:orderID", async (req, res) => {
    try {
        const orderID = req.params.orderID

        const deleteResult = await UserBookingHistoryModel.deleteOne({ orderID: orderID })

        if (deleteResult.deletedCount > 0) {
            res.json({ "message": "Order deleted succesfully!" })
        } else {
            res.json({ "message": "Order not found!" })
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ "message": "An error occured during deletion!" })
    }
})

app.listen(9000, () => console.log("Server is running on port 9000!"))