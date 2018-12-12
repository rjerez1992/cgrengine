var bgmList = {};
var sfxList = {};

//Load the sounds
sounds.load([
  "resources/sounds/Field3.ogg",
  "resources/sounds/1_spell.wav"

]);



function setupSounds() {
  console.log("sounds loaded");

  //Create the sounds
  bgmList["field3"] = sounds["resources/sounds/Field3.ogg"];  
    

  bgmList["field3"].loop = true;
  bgmList["field3"].volume = 0.5;

  sfxList["1"] = sounds["resources/sounds/1_spell.wav"];
  sfxList["1"].loop = false;
  sfxList["1"].volume = 1;



}

sounds.whenLoaded = setupSounds;
