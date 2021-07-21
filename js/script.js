// WARNING: SPAGHETTI CODE AHEAD

const searchInput = document.querySelector('#searchInput')
const outputField = document.querySelector('.output');
const byAffixToggle = document.querySelector('#byAffix');
const byEnchToggle = document.querySelector('#byEnch');
const clearButton = document.querySelector('.clearButton');

const affixesDatabase = {};

const itemsDictionary = {
  arc_blade: "Arc Blades",
  arc_rifle: "Arc Rifles",
  arc_sword: "Arc Swords",
  assassin_power_sword: "Assassin Power Swords",
  autogun: "Autoguns",
  autopistol: "Autopistols",
  belt: "Belt Gadgets",
  belt_forcefield: "Belt Forcefields",
  belt_grenade: "Belt Grenades",
  belt_mine: "Belt Mines",
  belt_psyker: "Psychic Foci",
  belt_techadept: "Techadept Archeotech Items",
  bolt_pistol: "Bolt Pistols",
  boltgun: "Boltguns",
  carthean_sword: "Carthean Swords",
  chainsword: "Chainswords",
  death_cult_blade: "Death Cult Blades",
  eviscerator: "Eviscerators",
  exitus_rifle: "Exitus Rifles",
  eye_implant: "Eye Implants",
  force_rod: "Force Rods",
  force_rod_2: "Warp Rods",
  force_rod_3: "Telekinetic Rods",    
  force_staff: "Force Staves",
  force_staff_2: "Pyrokinetic Staves",
  force_staff_3: "Wyrdvane Staves",    
  force_sword: "Force Swords",
  force_sword_2: "Biomantic Swords",
  force_sword_3: "Aether Blades",
  grav_gun: "Grav Guns",
  grav_pistol: "Grav Pistols",
  greataxe: "Greataxes",
  greatsword: "Greatswords",
  grenade_launcher: "Grenade Launchers",
  heavy_bolter: "Heavy Bolters",
  heavy_flamer: "Heavy Flamers",
  inferno_pistol: "Inferno Pistols",
  inoculator: "Inoculators",
  lasgun: "Lasguns",
  laspistol: "Laspistols",
  longlas_rifle: "Longlas Rifles",
  main_implant: "Main Implants",
  melta_gun: "Melta Guns",
  multi_melta: "Multi Meltas",
  needler_sniper_rifle: "Needler Sniper Rifles",
  neural_implant: "Neural Implants",
  null_rod: "Null Rods",
  omnissian_axe: "Omnissian Axes",
  plasma_cannon: "Plasma Cannons",
  plasma_gun: "Plasma Guns",
  plasma_pistol: "Plasma Pistols",
  power_armor: "Power Armor",
  power_axe: "Power Axes",
  power_hammer: "Power Hammers",
  power_sword: "Power Swords",
  psyker_armor: "Psyker Armor",
  purity_seal: "Purity Seals",
  radium_carbine: "Radium Carbines",
  shotgun: "Shotguns",
  signum: "Signums",
  sniper_rifle: "Sniper Rifles",
  storm_shield: "Storm Shields",
  suppression_shield: "Suppression Shields",
  synskin_armor: "Synskin Armor",
  techadept_armour: "Techadept Armour",
  thunder_hammer: "Thunder Hammers",
  voltaic_axe: "Voltaic Axes",
};


// the whole commented thing below is just a small script I ran in console to copypast create the dictionary above and slightly modified it afterwards manually
// let itemsDictionary1 = {};
// for (affix in affixesDatabase) { 
//   for (enchant of affixesDatabase[affix].enchants) {
//     for (itemType of enchant.itemTypes) {
//       if (!itemsDictionary1[itemType]) {
//         itemsDictionary1[itemType] = `${itemType[0].toUpperCase()}${itemType.slice(1).replaceAll(/_(\w{1})/g, (match, p1) => ' ' + p1.toUpperCase())}s`;
//       }
//     }
//   }    
// }  
// console.log(itemsDictionary1);

let searchInputValue = '';
let filterByAffixOnly = true;


async function displayDataOnFirstLoad() {
  let response = await fetch('../ancientsData.txt'); // get the data, will only work in deployment, or via emulating an http server locally
  let rawText = await response.text();  

  let arrayedData = rawText.slice(rawText.indexOf('- **') - 1) // remove comments before descriptions
  .split('\n') // split the text into arrays of strings that go in sequence ['Affix: enchantment description'], ['Item types: item_types'] for each enchant
  .map((string) => {
    return string.replaceAll('\"', "") 
    .replaceAll(/-|\*{1,}|\\{1,}/g, '') // remove the markdown
    .trim() // and some leftover spaces
    .split(':'); // split the above array pairs into [['Affix'], ['enchantment description']] and [['Item types'], ['item_types']]
  });

  populateDatabase(arrayedData);
  createHtml(affixesDatabase);
  console.log(arrayedData);
  console.log(affixesDatabase);
}

function populateDatabase(arrayedData) {
  let currentEnchantNum = 1;

  for (let i = 0; i < arrayedData.length - 1; i+=2) { // iterate over every second index since it's the one that will contain the affix and desc, and access the item types manually later in the loop
    let affix = `of ${arrayedData[i][0]}`; // add 'of' since all affixes are actually suffixes

    let enchantTemplate = { // an enchant template that will later get updated and pushed into affix' enchants array
      enchantNum: currentEnchantNum,
      description: "",
      itemTypes: [],
    };

    if (!affixesDatabase[affix]) { // checks if affix is already present in database
      affixesDatabase[affix] = {enchants: []}; // create affix reference if not     
      currentEnchantNum = 1; // reset number of enchants for freshly created affixes

      enchantTemplate.enchantNum = currentEnchantNum;
      enchantTemplate.description = arrayedData[i][1].trim(); // some leftover spaces are STILL there
      enchantTemplate.itemTypes = arrayedData[i + 1][1].trim().split(', '); // split the item_types string into array of items 

      affixesDatabase[affix].enchants.push(enchantTemplate);
      currentEnchantNum++;      
    } else { // if affix is already present, just updates the template and pushes it to enchants array
      enchantTemplate.enchantNum = currentEnchantNum;
      enchantTemplate.description = arrayedData[i][1].trim();
      enchantTemplate.itemTypes = arrayedData[i + 1][1].trim().split(', ');

      affixesDatabase[affix].enchants.push(enchantTemplate);
      currentEnchantNum++;
    }
  }
}

function createHtml(dataObject) {
  let databaseKeys = Object.keys(dataObject);

  for (let i = 0; i < Object.keys(dataObject).length; i++) {
    let affixCard = document.createElement('article'); // create and populate all those DOM elements for enchantments or
    affixCard.classList.add('affix');                  // Why You Should Probably Use A Framework 101

    let affixName = document.createElement('section');
    affixName.classList.add('affixName');
    affixName.innerHTML = `<h3>${databaseKeys[i]}</h3>`;

    let enchantmentsSection = document.createElement('section');
    enchantmentsSection.classList.add('enchantments');

    affixCard.append(affixName);
    affixCard.append(enchantmentsSection);
    outputField.append(affixCard); // the result structure is <article> for the whole enchantment which contains a <section>
                                   // for the tag name and another <section> for description and item types which is created below
    for (let enchant of affixesDatabase[databaseKeys[i]].enchants) {
      let enchantmentInfo = document.createElement('article');
      enchantmentInfo.innerHTML = `<p><span class = "highlighted bold">Variant ${enchant.enchantNum}:</span> ${enchant.description}</p>`;

      let itemTypes = document.createElement('p');
      itemTypes.innerHTML = `<span class = "highlighted">Appears on:</span> ${parseItemTypes(enchant.itemTypes)}`;      
      
      enchantmentInfo.append(itemTypes);
      enchantmentsSection.append(enchantmentInfo);
    }
  }

  function parseItemTypes(itemTypesArray) {
    let result = itemTypesArray.reduce( (accumulator, item, index, array) => {
      if (index < array.length - 1) {
        return accumulator += `${itemsDictionary[item]}, `;
      } else {
        return accumulator += `${itemsDictionary[item]}`;
      }     
    }, '');
  
    return result;
  }
}

function handleSearchInputChange(event) {
  searchInputValue = event.target.value.toLowerCase();
  filterEnchantments(searchInputValue) ;  
}

function clearSearchInput() {
  searchInput.value = '';
  searchInputValue = '';
  filterEnchantments(searchInputValue);
}

function filterEnchantments(searchInput) {
  for (affix of document.querySelectorAll('.output .affix')) {
    let affixName = affix.firstChild.firstChild.innerText; // affix.firstChild.firstChild = affix <article> --> affix name <section> --> <h3> with affix name

    if (filterByAffixOnly) { // if filter by affix selected just match affix names to search input

      if ( !affixName.slice(2).toLowerCase().includes(searchInput) ) { // slice 'of ' away so it isn't matched against the search input
        affix.style.display = 'none';
      } else {
        affix.style.display = 'flex';
      }   

    } else { // if filter by enchantment -> more spaghetti code

      let matchingEnchants = affixesDatabase[affixName].enchants.filter(enchant => enchant.description.toLowerCase().includes(searchInput));      

      if (matchingEnchants.length < 1) {
        affix.style.display = 'none'; // hide all affixes without relevant enchants
      } else {      
        affix.style.display = 'flex';               

        let affixEnchantsList = affix.lastChild.children; // get all the affix enchants elements(html articles)

        for (let i = 0; i < affixEnchantsList.length; i++) {
          if ( matchingEnchants.some(enchant => i + 1 === enchant.enchantNum) ) { // display the enchant if it is among the matching ones since they follow the same order
            affixEnchantsList[i].style.display = 'block';
          } else { // do not display if it is not
            affixEnchantsList[i].style.display = 'none';
          }
        }        
      }
      // insert your praise to the Omnissiah for making the modern cogitators fast enough to handle not so optimized code effortlessly
    }
  }
}

function toggleSearchMode() {
  if (!filterByAffixOnly) { // display all enchants if switching from filter by enchants     
    for ( enchant of document.querySelectorAll('.enchantments article') ) {
      enchant.style.display = 'block';
    }
  }
  filterByAffixOnly = !filterByAffixOnly; 
  filterEnchantments(searchInputValue);    
}

document.addEventListener("DOMContentLoaded", displayDataOnFirstLoad);
byAffixToggle.addEventListener("change", toggleSearchMode);
byEnchToggle.addEventListener("change", toggleSearchMode);
searchInput.addEventListener("keyup", handleSearchInputChange);
searchInput.addEventListener("change", handleSearchInputChange);
clearButton.addEventListener("click", clearSearchInput);