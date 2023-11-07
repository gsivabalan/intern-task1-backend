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


