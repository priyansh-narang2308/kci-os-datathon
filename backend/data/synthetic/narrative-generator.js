/**
 * FIR Narrative Generator
 * 
 * Generates realistic FIR narratives from templates.
 * Task 1.4 — Build FIR Narrative Generator
 */

const TEMPLATES = {
  theft: [
    "On {date}, at approximately {time}, the accused {accused_name} broke into {location} and stole {item}. The accused gained entry by {entry_method}. The total value of stolen property is estimated at ₹{value}.",
    "On the night of {date}, between {time_start} and {time_end}, an incident of theft was reported at {location}. The accused {accused_name} was observed {entry_method} and made away with {item} worth approximately ₹{value}.",
    "Complainant {victim_name} reported that on {date} at around {time}, the accused {accused_name} entered {location} through {entry_method} and decamped with {item} valued at ₹{value}."
  ],
  chain_snatching: [
    "On {date}, at approximately {time}, the accused {accused_name} snatched a gold chain from {victim_name} near {location}. The accused was riding a {vehicle_type} and fled towards {direction}. The chain weighed approximately {weight} grams.",
    "On {date}, complainant {victim_name} was walking near {location} when the accused {accused_name} on a {vehicle_type} approached from behind and snatched her gold chain. The accused fled towards {direction}.",
    "At about {time} on {date}, the accused {accused_name} riding a {vehicle_type} snatched the gold chain worn by {victim_name} near {location}. The accused escaped towards {direction}."
  ],
  burglary: [
    "On {date}, between {time_start} and {time_end}, the accused {accused_name} broke into {location} through {entry_method}. The premises were found ransacked and {item} worth ₹{value} were missing.",
    "The complainant {victim_name} discovered on {date} at {time} that {location} had been broken into. Entry was made through {entry_method}. The accused {accused_name} stole {item} valued at ₹{value}.",
    "On the night of {date}, the accused {accused_name} gained unauthorized entry into {location} via {entry_method} and removed {item} worth ₹{value}."
  ],
  robbery: [
    "On {date} at around {time}, the accused {accused_name} {robbery_method} the complainant {victim_name} near {location} and decamped with {item} worth ₹{value}.",
    "The accused {accused_name}, along with associates, confronted {victim_name} near {location} on {date} at {time} and forcibly took {item} valued at ₹{value}.",
    "On {date}, at approximately {time}, {victim_name} was robbed of {item} worth ₹{value} by the accused {accused_name} near {location}."
  ],
  cyber_fraud: [
    "On {date}, the accused {accused_name} defrauded the complainant {victim_name} of ₹{value} through a fraudulent {fraud_method}. The accused contacted the victim via {contact_method} and induced them to transfer money.",
    "The complainant {victim_name} reported that on {date}, the accused {accused_name} tricked them into sharing {fraud_detail} through {contact_method}, resulting in a loss of ₹{value}.",
    "On {date} at {time}, the accused {accused_name} cheatingly obtained ₹{value} from {victim_name} through {fraud_method} via {contact_method}."
  ],
  drug_offense: [
    "On {date}, at approximately {time}, the police intercepted the accused {accused_name} near {location} and recovered {drug_quantity} of {drug_type} from his possession.",
    "Based on credible intelligence, the accused {accused_name} was apprehended near {location} on {date} with {drug_quantity} of {drug_type}.",
    "On {date} at {time}, the accused {accused_name} was found in possession of {drug_quantity} of {drug_type} near {location}."
  ],
  assault: [
    "On {date} at approximately {time}, the accused {accused_name} assaulted the complainant {victim_name} near {location} using {weapon}, causing {injury}.",
    "The complainant {victim_name} reported that on {date}, the accused {accused_name} attacked them with {weapon} near {location} at around {time}, resulting in {injury}.",
    "On {date}, the accused {accused_name} {assault_method} the victim {victim_name} near {location} at about {time}, causing {injury}."
  ],
  cheating: [
    "On {date}, the accused {accused_name} induced the complainant {victim_name} to pay ₹{value} under false pretenses of {pretext}. The accused subsequently {disappeared_method}.",
    "The complainant {victim_name} reported that the accused {accused_name} cheated them of ₹{value} on {date} by {cheat_method}.",
    "On {date}, the accused {accused_name} defrauded {victim_name} of ₹{value} through {cheat_method}."
  ]
};

const PLACEHOLDERS = {
  time: () => `${randomInt(0, 23)}:${String(randomInt(0, 59)).padStart(2, "0")}`,
  time_start: () => `${randomInt(0, 3)}:${String(randomInt(0, 59)).padStart(2, "0")}`,
  time_end: () => `${randomInt(3, 6)}:${String(randomInt(0, 59)).padStart(2, "0")}`,
  value: () => randomInt(2000, 500000).toLocaleString("en-IN"),
  weight: () => randomInt(5, 50),
  vehicle_type: () => pick(["motorcycle", "scooter", "bike"]),
  direction: () => pick(["north", "south", "east", "west", "towards the highway"]),
  entry_method: () => pick(["breaking the rear window", "forcing the lock", "climbing over the wall", "using a duplicate key", "breaking the door latch"]),
  item: () => pick(["gold jewelry", "cash", "laptop", "mobile phones", "household electronics", "gold chain and rings", "cash and documents"]),
  robbery_method: () => pick(["brandished a knife and threatened", "pushed and robbed", "threatened with a weapon"]),
  fraud_method: () => pick(["UPI scam", "phishing call", "fake lottery message", " fraudulent investment scheme"]),
  contact_method: () => pick(["phone call", "WhatsApp message", " SMS", "fake website"]),
  fraud_detail: () => pick(["OTP and bank details", "UPI PIN", "ATM card details", "Aadhaar number"]),
  drug_type: () => pick(["ganja", "charas", "MDMA", "methamphetamine"]),
  drug_quantity: () => pick(["2 kg", "500 grams", "1 kg", "1.5 kg", "3 kg"]),
  weapon: () => pick(["a wooden stick", "a knife", "a rod", "bare hands"]),
  injury: () => pick(["minor injuries", "a fractured arm", "head injuries", "bruises and lacerations"]),
  assault_method: () => pick(["physically assaulted", "attacked with a weapon", "threatened and beaten"]),
  pretext: () => pick(["a job opportunity", "a property deal", "a business investment", "medical emergency"]),
  disappeared_method: () => pick(["absconded", "changed his phone number", "fled the area"]),
  cheat_method: () => pick(["forged documents", "false promises", "impersonation", "online fraud"]),
  victim_name: () => pick(["Lakshmi Devi", "Rajesh Kumar", "Ayesha Begum", "Suresh Babu", "Priya Sharma", "Mohammed Irfan", "Geetha", "Venkatesh"]),
  accused_name: () => pick(["Ravi Kumar", "Suresh", "Mustafa", "Anil", "Rajesh", "Darshan", "Vijay", "Imran", "Kiran", "Prakash"]),
  location: () => pick(["the main road near the bus stand", "a residential area in the city", "the market area", "near the railway station", "a quiet lane in the colony"]),
};

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillTemplate(template, fir) {
  let result = template;
  const regex = /\{(\w+)\}/g;

  result = result.replace(regex, (match, key) => {
    if (PLACEHOLDERS[key]) {
      return PLACEHOLDERS[key]();
    }
    // Fallback: use fir data
    if (key === "date") return fir.date_filed;
    if (key === "accused_name") return "the accused";
    if (key === "victim_name") return "the complainant";
    if (key === "location") return "the scene of crime";
    return `[${key}]`;
  });

  return result;
}

function generateNarrative(fir) {
  const templates = TEMPLATES[fir.crime_type] || TEMPLATES.theft;
  const template = templates[randomInt(0, templates.length - 1)];
  return fillTemplate(template, fir);
}

function enrichAllFIRs(firs) {
  return firs.map(fir => ({
    ...fir,
    narrative_text: generateNarrative(fir),
  }));
}

module.exports = { generateNarrative, enrichAllFIRs, TEMPLATES };

if (require.main === module) {
  const { generateAllFIRs } = require("./fir-generator");
  const firs = generateAllFIRs(5);
  const enriched = enrichAllFIRs(firs);
  enriched.forEach(f => {
    console.log(`\n--- ${f.fir_no} (${f.crime_type}) ---`);
    console.log(f.narrative_text);
  });
}
