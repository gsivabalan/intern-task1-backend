var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: String,
  password: String,
  age: Number,      
  gender: String,   
  dob: Date,        
  mobile: String    
});

var user = mongoose.model('user', userSchema);

module.exports = user;


const connectDB = async () => {
    try {
        console.log(process.env.MONGODBCONNECTIONSTRING);
        const mongoURL = process.env.MONGODBCONNECTIONSTRING
        const connection = await mongoose.connect(mongoURL)

        console.log("connected to the MongoDB");
        return connection;
    } catch (error) {
            console.error("Error", error)
    }
}