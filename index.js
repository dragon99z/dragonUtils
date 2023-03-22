import axios from "../axios";

register("step", main);
register("tick", warnDisplay);
register("gameUnload", disconnect);
register("gameLoad", connect);

var settings = JSON.parse(FileLib.read("dragonUtils","settings.json"));
var blow = false;
var colorCodes = new Array("§0","§1","§2","§3","§4","§5","§6","§7","§8","§9","§a","§b","§c","§d","§e","§f","§r","§k","§l","§m","§n","§o");

const display = new Display();
const BossStatus = Java.type("net.minecraft.entity.boss.BossStatus");

const baseUrl = "http://api.dragon99z.de/events";

var wants = "none";
var currentEvent = "none";

function connect(){
    let uuid  = Player.getUUID();
    let name  = Player.getName();
    axios.get(baseUrl+"?state=add&uuid="+uuid+"&name="+name+"&location=Hub&event="+currentEvent+"&wants="+wants,{headers: {
        "User-Agent": "Mozilla/5.0 (ChatTriggers)"
    }})
    ChatLib.chat("§6---§aDragonUtils§6---");
    ChatLib.chat("§aDragonUtils loaded!");
}


function disconnect(){
    let uuid  = Player.getUUID();
    if(Server.getIP() == null){
        axios.get(baseUrl+"?state=remove&uuid="+uuid,{headers: {
            "User-Agent": "Mozilla/5.0 (ChatTriggers)"
        }})
    }
}

function warnDisplay() {
    display.setRenderLoc(settings.displayLength, settings.displayHeight);
    if(settings.toggleDisplay && blow){
        display.setLine(0, "§4§l§nCATACLYSMIC");
    }else{
        display.clearLines();
    }
}


function getBossName() {  
    let bossName = "";
    bossName = BossStatus.field_82827_c;
    return bossName;// bossName
}

function removeColor(str){
    colorCodes.forEach(color => {
        if(str.includes(color)){
            str = str.replace(color,"");
        }
    });
    return str;
}


function getEvent(location){
    let event = "";
    let endstone = false;
    let eyes = 0;
    switch(location){
        case "Crimson Isle":
            let state = "";
            let names = TabList.getNames();
            for(i = 0; i<names.length; i++){
                if(names[i].includes("Volcano")){
                    state = removeColor(names[i+1]);
                }
            }
            if(state == "CATACLYSMIC"){
                event = "CATACLYSMIC";
            }else{
                event = "none";
            }
            break;
        case "Dwarven Mines","Crystal Hollows":
            if(getBossName =! null){
                if(getBossName().includes("2X POWDER")){
                    event = "2X POWDER";
                }else if(getBossName().includes("BETTER TOGETHER")){
                    event = "BETTER TOGETHER";
                }else if(getBossName().includes("GOBLIN RAID")){
                    event = "GOBLIN RAID";
                }else if(getBossName().includes("GONE WITH THE WIND")){
                    event = "GONE WITH THE WIND";
                }else if(getBossName().includes("MITHRIL GOURMAND")){
                    event = "MITHRIL GOURMAND";
                }else if(getBossName().includes("RAFFLE")){
                    event = "RAFFLE";
                }else{
                    event = "none";
                }
            }
            break;
        case "The End":
            if(getBossName() != null){
                event = removeColor(getBossName());
                eyes = 0;
            }else if(removeColor(ChatLib.getChatMessage().match("BEWARE - An Endstone Protector has risen!"))){
                event = "Endstone Protector";
                endstone = true;
            }else if(removeColor(ChatLib.getChatMessage().includes("ENDSTONE PROTECTOR DOWN!")) && endstone){
                endstone = false;
            }else if(removeColor(ChatLib.getChatMessage().includes("placed a Summoning Eye!"))){
                let eye = removeColor(ChatLib.getChatMessage()).slice(-4).slice(0,1);
                if(isNumeric(eye)){
                    eyes = parseInt(eye);
                    event = "Eyes " + eye;
                }
            }else{
                if(!endstone && eyes == 0)
                    event = "none";
            }
            break;
        default:
            event = "none";
            break;
        
    }
    return event;
}

function apiUpdate(area,event,want){
    let uuid  = Player.getUUID();
    let name  = Player.getName();
    axios.get(baseUrl+"?state=add&uuid="+uuid+"&name="+name+"&location="+area+"&event="+event+"&wants="+want,{headers: {
        "User-Agent": "Mozilla/5.0 (ChatTriggers)"
    }})
}

let stepCount=0;
function main(){
    if(settings.toggle){
        stepCount++;
        if(stepCount>=60*settings.delay){
            stepCount=0;
            let area = getArea();
            switch(area){
                case "Crimson Isle":
                    if(getEvent(area) == "CATACLYSMIC" && blow == false){
                        ChatLib.chat("§r§4!!!!!!!!"+getEvent()+"§r§4 !!!!!!!!")
                        blow = true;
                        currentEvent = "CATACLYSMIC";
                    }else if(!getEvent(area) == "CATACLYSMIC" && blow == true){
                        blow = false;
                    }
                    break;
                case "Dwarven Mines","Crystal Hollows":
                    currentEvent =  getEvent(area);
                    break;
                case "The End":
                    currentEvent = getEvent(area);
                    break;
            }
            apiUpdate(area,currentEvent,wants);
        }
    }
    
}

function getArea(){
    let names = TabList.getNames();
    let area = "";
    for(i = 0; i<names.length; i++){
        if(names[i].includes("Area:")){
            area = names[i].replace("Area: ","");
        }
    }
    return area;
}

function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str)
}

register("command", (setting,value) => {
    switch(setting){
        case "toggle":
            if(value == null){
                settings.toggle = !settings.toggle;
                FileLib.write("dragonUtils","settings.json",JSON.stringify(settings));
                ChatLib.chat("§6---§aDragonUtils§6---");
                ChatLib.chat("§2The toggle has been set to §a" + settings.toggle);
            }else{
                if(value=="true"){
                    settings.toggle = true;
                    FileLib.write("dragonUtils","settings.json",JSON.stringify(settings));
                    ChatLib.chat("§6---§aDragonUtils§6---");
                    ChatLib.chat("§2The toggle has been set to §a" + settings.toggle);
                }else if(value=="false"){
                    settings.toggle = false;
                    FileLib.write("dragonUtils","settings.json",JSON.stringify(settings));
                    ChatLib.chat("§6---§aDragonUtils§6---");
                    ChatLib.chat("§2The toggle has been set to §a" + settings.toggle);
                }else{
                    ChatLib.chat("§6---§aDragonUtils§6---");
                    ChatLib.chat("Use true or false!");
                }
            }
            break;
        case "toggleDisplay":
            if(value == null){
                settings.toggleDisplay = !settings.toggleDisplay;
                FileLib.write("dragonUtils","settings.json",JSON.stringify(settings));
                ChatLib.chat("§6---§aDragonUtils§6---");
                ChatLib.chat("§2The toggleDisplay has been set to §a" + settings.toggleDisplay);
            }else{
                if(value=="true"){
                    settings.toggleDisplay = true;
                    FileLib.write("dragonUtils","settings.json",JSON.stringify(settings));
                    ChatLib.chat("§6---§aDragonUtils§6---");
                    ChatLib.chat("§2The toggleDisplay has been set to §a" + settings.toggleDisplay);
                }else if(value=="false"){
                    settings.toggleDisplay = false;
                    FileLib.write("dragonUtils","settings.json",JSON.stringify(settings));
                    ChatLib.chat("§6---§aDragonUtils§6---");
                    ChatLib.chat("§2The toggleDisplay has been set to §a" + settings.toggleDisplay);
                }else{
                    ChatLib.chat("§6---§aDragonUtils§6---");
                    ChatLib.chat("§4Use true or false!");
                }
            }
            break;
        case "displayHeight":
                if(isNumeric(value)){
                    settings.displayHeight = parseInt(value);
                    FileLib.write("dragonUtils","settings.json",JSON.stringify(settings));
                    ChatLib.chat("§6---§aDragonUtils§6---");
                    ChatLib.chat("§2The displayHeight has been set to §a" + settings.displayHeight);
                }else{
                    ChatLib.chat("§6---§aDragonUtils§6---");
                    ChatLib.chat("§4Input a number!");
                }
            break;
        case "displayLength":
                if(isNumeric(value)){
                    settings.displayLength = parseInt(value);
                    FileLib.write("dragonUtils","settings.json",JSON.stringify(settings));
                    ChatLib.chat("§6---§aDragonUtils§6---");
                    ChatLib.chat("§2The displayLength has been set to §a" + settings.displayLength);
                }else{
                    ChatLib.chat("§6---§aDragonUtils§6---");
                    ChatLib.chat("§4Input a number!");
                }
            break;
        case "delay":
                if(isNumeric(value)){
                    let dly = parseInt(value);
                    if(dly > 0){
                        settings.delay = dly;
                        FileLib.write("dragonUtils","settings.json",JSON.stringify(settings));
                        ChatLib.chat("§6---§aDragonUtils§6---");
                        ChatLib.chat("§2The delay has been set to §a" + settings.delay);
                    }else{
                        ChatLib.chat("§6---§aDragonUtils§6---");
                        ChatLib.chat("§4Input a higher number then "+dly+"!");
                    }
                }else{
                    ChatLib.chat("§6---§aDragonUtils§6---");
                    ChatLib.chat("§4Input a number!");
                }
            break;
        case "help":
            ChatLib.chat("§6---§aDragonUtils§6---");
            ChatLib.chat("§a/dragonutils || /du §2(display this text)");
            ChatLib.chat("§a/du help §2(display this text)");
            ChatLib.chat("§a/du toggle §2(toggle the cataclysmic check)");
            ChatLib.chat("§a/du delay <number> §2(change the cataclysmic check delay in seconds)");
            ChatLib.chat("§a/du toggleDisplay §2(toggle the cataclysmic warning)");
            ChatLib.chat("§a/du displayHeight §e<§6number§e> §2(change the displayHeight of the warning)");
            ChatLib.chat("§a/du displayLength §e<§6number§e> §2(change the displayLength of the warning)");
            break
        case "wants":
                wants = value;
                ChatLib.chat("§6---§aDragonUtils§6---");
                ChatLib.chat("§aYou search for " + wants);
            break
        default:
            ChatLib.chat("§6---§aDragonUtils§6---");
            ChatLib.chat("§a/dragonutils || /du §2(display this text)");
            ChatLib.chat("§a/du help §2(display this text)");
            ChatLib.chat("§a/du toggle §2(toggle the cataclysmic check)");
            ChatLib.chat("§a/du delay <number> §2(change the cataclysmic check delay in seconds)");
            ChatLib.chat("§a/du toggleDisplay §2(toggle the cataclysmic warning)");
            ChatLib.chat("§a/du displayHeight §e<§6number§e> §2(change the displayHeight of the warning)");
            ChatLib.chat("§a/du displayLength §e<§6number§e> §2(change the displayLength of the warning)");
            break;
    }
  }).setTabCompletions("toggle","delay","help","toggleDisplay","displayHeight","displayLength","wants").setName("dragonutils").setAliases("du");