const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection for General Users
mongoose.connect('mongodb://localhost:27017/Database', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;

db.on('error', () => console.log("Error in connecting to the database"));
db.once('open', () => console.log("Connected to the Database for general users"));

// MongoDB Connection for Death Certificate Data
const deathCertificateDB = mongoose.createConnection('mongodb://localhost:27017/death_certificateDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

deathCertificateDB.on('error', (err) => console.log("Error in connecting to the death certificate database", err));
deathCertificateDB.once('open', () => console.log("Connected to the Database for death certificates"));

// Death Certificate Schema
const deathCertificateSchema = new mongoose.Schema({
  date_of_death: Date,
  gender: String,
  deceased_name: String,
  care_of: String,
  father_husband_name: String,
  deceased_age_years: Number,
  deceased_age_months: Number,
  deceased_age_days: Number,
  deceased_age_hours: Number,
  permanent_address: {
    address_line: String,
    country: String,
    state: String,
    district: String,
    pin: String,
    mobile_no: String,
    email: String,
  },
  place_of_death: {
    place: String,
    address_line: String,
    country: String,
    state: String,
    district: String,
    pin: String,
  },
  files: {
    aadhaar_card: String,
    birth_certificate: String,
    medical_certificate: String,
  },
  informant: {
    name: String,
    sex: String,
    same_as_permanent_address: Boolean,
    relation_with_deceased: String,
    identity_proof: String,
  },
});
const DeathCertificate = deathCertificateDB.model("DeathCertificate", deathCertificateSchema);

// Database connection
const incomeCertificateDB = mongoose.createConnection('mongodb://localhost:27017/income_certificateDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

incomeCertificateDB.on('error', (err) => console.log("Error in connecting to the income certificate database", err));
incomeCertificateDB.once('open', () => console.log("Connected to the Database for income certificates"));


// Define schema for storing income certificate data
const incomeCertificateSchema = new mongoose.Schema({
  fullName: String,
  dob: Date,
  gender: String,
  relationName: String,
  maritalStatus: String,
  permanentAddress: String,
  currentAddress: String,
  occupation: String,
  annualIncome: Number,
  incomeSource: String,
  purpose: String,
  files: {
    identityProof: String,
    addressProof: String,
    incomeProof: String,
    bankStatement: String,
    employmentProof: String,
    affidavit: String,
  },
  phoneNumber: String,
  otp: String,
});

// Create a model for the schema
const IncomeCertificate = mongoose.model(
  "IncomeCertificate",
  incomeCertificateSchema
);


// MongoDB Connection for Death Certificate Data
const casteCertificateDB = mongoose.createConnection('mongodb://localhost:27017/caste-certificateDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

casteCertificateDB.on('error', (err) => console.log("Error in connecting to the caste certificate database", err));
casteCertificateDB.once('open', () => console.log("Connected to the Database for caste certificates"));



// Define schema for storing caste certificate data
const casteCertificateSchema = new mongoose.Schema({
  fullName: String,
  dob: Date,
  gender: String,
  relationName: String,
  permanentAddress: String,
  currentAddress: String,
  caste: String,
  subCaste: String,
  purpose: String,
  files: {
    identityProof: String,
    addressProof: String,
    casteProof: String,
  },
  phoneNumber: String,
  otp: String,
});

// Create a model for the schema
const CasteCertificate = mongoose.model("CasteCertificate", casteCertificateSchema);





// Routes for General Users (Home, Login, Register, Selection)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname,'views', 'home.html'));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, 'views','login.html'));
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.collection('users').findOne({ email, password }, (err, user) => {
    if (err) {
      return res.status(500).send("Internal server error");
    }
    if (!user) {
      return res.status(401).send("Invalid credentials");
    }
    res.redirect("/register");
  });
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.post("/register", (req, res) => {
  const { name, age, email, phno, gender, password } = req.body;
  const data = { name, age, email, phno, gender, password };
  db.collection('users').insertOne(data, (err) => {
    if (err) {
      return res.status(500).send("Error in registering user");
    }
    res.redirect("/select");
  });
});

app.get("/select", (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'selection.html'));
});


app.post("/submit-death-certificate", (req, res) => {
  let body = "";
  const files = {};
  req.on("data", (chunk) => { body += chunk; });
  req.on("end", () => {
    const boundary = req.headers["content-type"].split("boundary=")[1];
    const parts = body.split(`--${boundary}`).filter(part => part.trim());
    
    parts.forEach((part) => {
      const [headers, content] = part.split("\r\n\r\n");
      if (headers && content) {
        if (headers.includes("filename=")) {
          const filenameMatch = headers.match(/filename="(.+?)"/);
          const filename = filenameMatch ? filenameMatch[1] : "unknown_file";
          files[filename] = content.trim();
        } else {
          const nameMatch = headers.match(/name="(.+?)"/);
          const fieldName = nameMatch ? nameMatch[1] : null;
          if (fieldName) req.body[fieldName] = content.trim();
        }
      }
    });

    const newCertificate = new DeathCertificate({
      date_of_death: req.body.date_of_death,
      gender: req.body.gender,
      deceased_name: req.body.deceased_name,
      care_of: req.body.care_of,
      father_husband_name: req.body.father_husband_name,
      deceased_age_years: req.body.deceased_age_years,
      deceased_age_months: req.body.deceased_age_months,
      deceased_age_days: req.body.deceased_age_days,
      deceased_age_hours: req.body.deceased_age_hours,
      permanent_address: {
        address_line: req.body.address_line,
        country: req.body.country,
        state: req.body.state,
        district: req.body.district,
        pin: req.body.pin,
        mobile_no: req.body.mobile_no,
        email: req.body.email,
      },
      place_of_death: {
        place: req.body.place_of_death,
        address_line: req.body.death_address_line,
        country: req.body.death_country,
        state: req.body.death_state,
        district: req.body.death_district,
        pin: req.body.death_pin,
      },
      files: {
        aadhaar_card: files["aadhaar_card"] || req.body.aadhaar_card,
        birth_certificate: files["birth_certificate"] || req.body.birth_certificate_proof,
        medical_certificate: files["medical_certificate"] || req.body.medicalcertificate_proof,
      },
      informant: {
        name: req.body.informant_name,
        sex: req.body.informant_sex,
        same_as_permanent_address: req.body.same_as_permanent_address === "true",
        relation_with_deceased: req.body.relation_with_deceased,
        identity_proof: req.body.identity_proof,
      },
    });

    newCertificate.save()
      .then(() => res.send("Death certificate data saved successfully!"))
      .catch((err) => res.status(500).send("Error saving the death certificate data."));

  });

  req.on("error", (err) => {
    console.error("Error reading request:", err);
    res.status(500).send("Error processing the form.");
  });
});


// Routes for Death Certificate Form
app.get("/death-certificate", (req, res) => {
  res.sendFile(path.join(__dirname,'views', 'death-certificate.html'));  // Change to the appropriate form page for death certificate
});


// Handle form submission
app.post("/submit-income-certificate", (req, res) => {
  let body = "";
  const files = {};

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const boundary = req.headers["content-type"].split("boundary=")[1];
      const parts = body.split('--${boundary}').filter((part) => part.trim() && part !== "--");

      parts.forEach((part) => {
        const [headers, content] = part.split("\r\n\r\n");
        if (headers && content) {
          if (headers.includes("filename=")) {
            // Process file data
            const filenameMatch = headers.match(/filename="(.+?)"/);
            const filename = filenameMatch ? filenameMatch[1] : "unknown_file";
            files[filename] = content.trim(); // Simulating file saving
          } else {
            // Process form fields
            const nameMatch = headers.match(/name="(.+?)"/);
            const fieldName = nameMatch ? nameMatch[1] : null;
            if (fieldName) {
              req.body[fieldName] = content.trim();
            }
          }
        }
      });

      console.log("Parsed fields:", req.body);
      console.log("Parsed files:", files);

      // Create a new income certificate entry
      const newCertificate = new IncomeCertificate({
        fullName: req.body.fullName,
        dob: req.body.dob,
        gender: req.body.gender,
        relationName: req.body.relationName,
        maritalStatus: req.body.maritalStatus,
        permanentAddress: req.body.permanentAddress,
        currentAddress: req.body.currentAddress,
        occupation: req.body.occupation,
        annualIncome: req.body.annualIncome,
        incomeSource: req.body.incomeSource,
        purpose: req.body.purpose,
        files: {
          identityProof: files["identityProof"] || req.body.identityProof,
          addressProof: files["addressProof"] || req.body.addressProof,
          incomeProof: files["incomeProof"] || req.body.incomeProof,
          bankStatement: files["bankStatement"] || req.body.bankStatement,
          employmentProof: files["employmentProof"] || req.body.employmentProof,
          affidavit: files["affidavit"] || req.body.affidavit,
        },
        phoneNumber: req.body.phoneNumber,
        otp: req.body.otp,
      });

      // Save to the database
      newCertificate
        .save()
        .then(() => {
          res.send("Income certificate data saved successfully!");
        })
        .catch((err) => {
          console.error("Error saving data:", err);
          res.status(500).send("Error saving the income certificate data.");
        });
    } catch (err) {
      console.error("Error processing form submission:", err);
      res.status(400).send("Error processing the form.");
    }
  });

  req.on("error", (err) => {
    console.error("Error reading request:", err);
    res.status(500).send("Error processing the form.");
  });
});

// Route for testing the server connection
app.get("/ping", (req, res) => {
  res.set("Content-Type", "text/plain");
  res.send("Server is running successfully!");
});

// Serve the HTML form
app.get("/income-certificate", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "income-certificate.html"));
});


// Handle form submission
app.post("/submit-caste-certificate", (req, res) => {
  let body = "";
  const files = {};

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const boundary = req.headers["content-type"].split("boundary=")[1];
      const parts = body.split('--${boundary}').filter((part) => part.trim() && part !== "--");

      parts.forEach((part) => {
        const [headers, content] = part.split("\r\n\r\n");
        if (headers && content) {
          if (headers.includes("filename=")) {
            const filenameMatch = headers.match(/filename="(.+?)"/);
            const filename = filenameMatch ? filenameMatch[1] : "unknown_file";
            files[filename] = content.trim();
          } else {
            const nameMatch = headers.match(/name="(.+?)"/);
            const fieldName = nameMatch ? nameMatch[1] : null;
            if (fieldName) {
              req.body[fieldName] = content.trim();
            }
          }
        }
      });

      // Create a new caste certificate entry
      const newCertificate = new CasteCertificate({
        fullName: req.body.fullName,
        dob: req.body.dob,
        gender: req.body.gender,
        relationName: req.body.relationName,
        permanentAddress: req.body.permanentAddress,
        currentAddress: req.body.currentAddress,
        caste: req.body.caste,
        subCaste: req.body.subCaste,
        purpose: req.body.purpose,
        files: {
          identityProof: files["identityProof"] || req.body.identityProof,
          addressProof: files["addressProof"] || req.body.addressProof,
          casteProof: files["casteProof"] || req.body.casteProof,
        },
        phoneNumber: req.body.phoneNumber,
        otp: req.body.otp,
      });

      newCertificate
        .save()
        .then(() => res.send("Caste certificate data saved successfully!"))
        .catch((err) => {
          console.error("Error saving data:", err);
          res.status(500).send("Error saving the caste certificate data.");
        });
    } catch (err) {
      console.error("Error processing form submission:", err);
      res.status(400).send("Error processing the form.");
    }
  });

  req.on("error", (err) => {
    console.error("Error reading request:", err);
    res.status(500).send("Error processing the form.");
  });
});


// Serve the HTML form
app.get("/caste-certificate", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "caste-certificate.html"));
});


// Serve Static Files
app.get("/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, 'style.css'));
});

app.get("/script.js", (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
