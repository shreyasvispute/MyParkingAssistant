const { ObjectId } = require("mongodb");
const moment = require("moment");

var xss = require("xss");

function xssCheck(str) {
  if (xss(str) == str) {
    return false;
  } else {
    return true;
  }
}

// function checkIsProperString(val, typeData) {
//   if (!val) {
//     throw `No input passed`;
//   }
//   if (typeof val !== typeData) {
//     throw `Not a string`;
//   }

//   if (val.length == 0) {
//     throw `Length of string is 0`;
//   }
//   if (val.trim().length == 0) {
//     throw `String is only spaces`;
//   }
// }

function convertObjectIdToString(obj) {
  obj._id = obj._id.toString();
  return obj;
}

function checkObjectId(id) {
  checkIsProperString(id);
  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) !== id)
      throw `Object Id not valid string: ${id}`;
  } else {
    throw `Object Id not valid: ${id}`;
  }
}

function checkIsProperString(val) {
  if (!val) {
    throw `No input passed`;
  }
  if (typeof val !== "string") {
    throw `Not a string`;
  }

  if (val.length == 0) {
    throw `Length of string is 0`;
  }
  if (val.trim().length == 0) {
    throw `String is only spaces`;
  }
}

function checkIsProperBoolean(val) {
  if (!val) {
    throw `No input passed`;
  }
  if (typeof val !== "boolean") {
    throw `Not a string`;
  }
}

function checkIsProperNumber(val) {
  if (!val) {
    throw `No input passed`;
  }
  if (typeof val !== "number") {
    throw `Not a number`;
  }
  if (typeof val < 1) {
    throw `Value cannot be less than 1`;
  }
}

function checkInputDate(startDateVal, endDateVal, flag) {
  if (!endDateVal) {
    throw `No input passed: ${endDateVal}`;
  }
  // Current date
  // Reference: https://stackoverflow.com/questions/1531093/how-do-i-get-the-current-date-in-javascript?rq=1
  // var today = new Date();
  if (flag == 1) {
    var dd = parseInt(String(startDateVal.getDate()).padStart(2, "0"));
    var mm = parseInt(String(startDateVal.getMonth() + 1).padStart(2, "0")); //January is 0!
    var yyyy = startDateVal.getFullYear();
  } else {
    // values from end date
    var startParts = startDateVal.split("-"); // split by - and reorder the dd etc
    if (
      typeof startParts[0] == "undefined" &&
      typeof startParts[1] == "undefined" &&
      typeof startParts[2] == "undefined"
    ) {
      throw `Date is undefined: ${startDateVal}`;
    } else if (
      isNaN(startParts[0]) ||
      isNaN(startParts[1]) ||
      isNaN(startParts[2])
    ) {
      throw `Not an Number: ${startDateVal}`;
    }
    var mm = parseInt(startParts[1], 10);
    var yyyy = parseInt(startParts[0], 10);
    var dd = parseInt(startParts[2], 10);
  }

  // First check for the pattern
  if (!/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(endDateVal))
    throw `Date is not in proper format: ${endDateVal}`;

  // Parse the date parts to integers
  var parts = endDateVal.split("-");

  if (
    typeof parts[0] == "undefined" &&
    typeof parts[1] == "undefined" &&
    typeof parts[2] == "undefined"
  ) {
    throw `Date is undefined: ${endDateVal}`;
  } else if (isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    throw `Not an Number: ${endDateVal}`;
  }
  var month = parseInt(parts[1], 10);
  var year = parseInt(parts[0], 10);
  var day = parseInt(parts[2], 10);

  if (year < yyyy) throw `Older year than current: ${endDateVal}`;
  else if (year == yyyy && month < mm)
    throw `Older month than current: ${endDateVal}`;
  else if (month == mm && day < dd)
    throw `Older date than current: ${endDateVal}`;

  // Check the ranges of month and year
  if (year < 1000 || year > 3000 || month == 0 || month > 12)
    throw `Invalid month or year: ${endDateVal}`;

  var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Adjust for leap years
  if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
    monthLength[1] = 29;

  // Check the range of the day
  if (!(day > 0 && day <= monthLength[month - 1])) throw `Invalid day.`;
}

function checkInputTime(startTimeVal) {
  // , endTimeVal
  // var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(
  //   startTimeVal
  // );
  var isValid = /^([0-1]?[0-9]|2[0-4])?$/.test(startTimeVal);
  if (!isValid) throw `Invalid time: ${startTimeVal}`;
  // var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(endTimeVal);
  // if (!isValid) throw `Invalid time`;

  // Pending: If its todays date then get current time and start and end time shuld be
  // more than current time

  // Pending: start time should be less than end time
}

function checkNumberPlate(val) {
  checkIsProperString(val);
  let re = /[^a-z0-9\s]/gi;
  if (re.test(val)) throw `Number plate should be alpanumeric`;
}

// function timeSlotFunc(startTime, endTime, startDate, endDate) {

//   // let numberOfDays = Math.round(
//   //   Math.abs((new Date(endDate) - new Date(startDate)) / 24)
//   // );

//   // let startDateTemp = startDate;
//   // let endDateTemp = startDate;

//   let hourDiff = parseInt(endTime) - parseInt(startTime);
//   if (hourDiff < 0 ) throw `Invalid start and end date`;    // && numberOfDays == 0
//   // else hourDiff = 24 * numberOfDays + hourDiff;

//   let timeSlots = [];
//   let tempStart = parseInt(startTime);
//   let tempEnd = tempStart + 1;
//   for (let i = 0; i < hourDiff; i++) {
//     if (tempStart == 23){
//       // Pending: change date here
//       tempEnd = 0;
//       timeSlots.push(tempStart + ":00 - " + tempEnd + ":00");
//       throw `Only same day entries allowed.`
//     }
//     timeSlots.push(tempStart + ":00 - " + tempEnd + ":00");

//     // if (tempStart.toString().startsWith("00:00") || tempStart.toString().startsWith("0:00")) {
//     //   startDateTemp.setDate(startDateTemp.getDate() + 1);
//     //   endDateTemp.setDate(endDateTemp.getDate() + 1);
//     // }
//     // if ((new Date(endDateTemp)).getTime() > (new Date(endDate)).getTime())
//     //   throw `Invalid Date and time, increment date or reduce time.`;

//     tempStart = tempEnd;
//     tempEnd = tempEnd + 1;
//   }
//   return timeSlots;
// }

function timeSlotFunc(startTime, endTime, startDate, endDate) {
  startTime = parseInt(startTime);
  endTime = parseInt(endTime);
  let numberOfDays = Math.round(
    Math.abs((new Date(endDate) - new Date(startDate)) / 86400000)
  );
  let hourDiff = endTime - startTime;
  if (hourDiff < 0 && numberOfDays == 0) throw `Invalid start and end date`;
  else hourDiff = 24 * numberOfDays + hourDiff;

  let timeSlots = [];
  let tempEndTime = startTime+1;
  for (let i = 0; i < hourDiff; i++) {
    let timeDateObj = {};
    if(startTime == 23){
      tempEndTime = 0;
    } 
    if(startTime == 0){
      startDate = moment(startDate, "YYYY-MM-DD").add(1, 'days');
      startDate = startDate.format("YYYY-MM-DD");
      // console.log(moment(startDate._d).format("YYYY-MM-DD"));
    }
    timeDateObj.time = startTime + ":00 - " + tempEndTime + ":00";
    timeDateObj.date = startDate;
    timeDateObj.startTime = startTime;
    timeDateObj.endTime = tempEndTime;
    
    timeSlots.push(timeDateObj);
    startTime = tempEndTime;
    tempEndTime += 1;
  }
  return timeSlots;
}

module.exports = {
  checkIsProperString,
  checkIsProperNumber,
  checkIsProperBoolean,
  checkInputDate,
  checkInputTime,
  checkNumberPlate,
  convertObjectIdToString,
  checkObjectId,
  timeSlotFunc,
  xssCheck,
};
