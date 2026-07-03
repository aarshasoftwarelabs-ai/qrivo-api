const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({
    path: path.join(__dirname, "..", ".env"),
});

console.log("ENV FILE:", path.join(__dirname, "..", ".env"));
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = supabase;