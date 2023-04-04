import axios from "../axios";

register("step", main);
register("step", Update);
register("tick", warnDisplay);
register("gameUnload", disconnect);
register("worldLoad", connect);

var connected = false;

var settings;
var blow = false;
var colorCodes = new Array("§0","§1","§2","§3","§4","§5","§6","§7","§8","§9","§a","§b","§c","§d","§e","§f","§r","§k","§l","§m","§n","§o","§A","§B","§C","§D","§E","§F","§R","§K","§L","§M","§N","§O","&0","&1","&2","&3","&4","&5","&6","&7","&8","&9","&a","&b","&c","&d","&e","&f","&r","&k","&l","&m","&n","&o","&A","&B","&C","&D","&E","&F","&R","&K","&L","&M","&N","&O");

const display = new Display();
const BossStatus = Java.type("net.minecraft.entity.boss.BossStatus");

const baseUrl = "https://api.dragon99z.de/events";

var wants = "none";
var currentEvent = "none";

var uuid  = Player.getUUID();
var name  = Player.getName();

var api_json;

var tempX;
var tempY;

/*
function onlineCheck(name){
    let skyblock_api;
    let online = false;
    axios.get("https://skyblock-api.matdoes.dev/player/"+name,{headers: {
        "User-Agent": "Mozilla/5.0 (ChatTriggers)"
    }}).then(response => {
        skyblock_api = response.data;
        online = skyblock_api.online;
      })
      .catch(error => {
        if (error.isAxiosError) {
            print(error.code + ": " + error.response.data);
        } else {
            print(error.message);
        }
      });
    return online;
}
*/

function connect(){
    if(!connected && Server.getIP().includes("hypixel.net")){
        if(FileLib.exists("dragonUtils","settings.json")){
            settings = JSON.parse(FileLib.read("dragonUtils","settings.json"));
        }else{
            
            FileLib.write("dragonUtils","settings.json",JSON.stringify({"toggle":true,"toggleDisplay":false,"delay":5,"displayHeight":4,"displayLength":277,"share":true}))
            settings = JSON.parse(FileLib.read("dragonUtils","settings.json"));
        }

        if(settings.share){
            axios.get(baseUrl+"?state=add&uuid="+uuid+"&name="+name+"&location=Hub&event="+currentEvent+"&wants="+wants,{headers: {
                "User-Agent": "Mozilla/5.0 (ChatTriggers)"
            }}).then(response => {
                api_json = response.data;
              })
              .catch(error => {
                if (error.isAxiosError) {
                    print(error.code + ": " + error.response.data);
                } else {
                    print(error.message);
                }
              });
        }else{
            axios.get(baseUrl,{headers: {
                "User-Agent": "Mozilla/5.0 (ChatTriggers)"
            }}).then(response => {
                api_json = response.data;
              })
              .catch(error => {
                if (error.isAxiosError) {
                    print(error.code + ": " + error.response.data);
                } else {
                    print(error.message);
                }
              });
        }
        tempX = settings.displayLength;
        tempY = settings.displayHeight
        ChatLib.chat("§6---§aDragonUtils§6---");
        ChatLib.chat("§aDragonUtils loaded!");
        connected = true;
    }    
}




function disconnect(){
    if(connected){
        if(Server.getIP() == ""){
            axios.get(baseUrl+"?state=remove&uuid="+uuid,{headers: {
                "User-Agent": "Mozilla/5.0 (ChatTriggers)"
            }}).then(response => {
                print(response.data);
              })
              .catch(error => {
                if (error.isAxiosError) {
                  print(error.code + ": " + error.response.data);
                } else {
                  print(error.message);
                }
              });
            connected = false;
        }
        
    }
    
}

var draggin = false;
function drag(xDist,yDist,mouseX,mouseY,button){
    if(Client.isInChat()){
        draggin = true;
        tempX = parseInt(mouseX);
        tempY = parseInt(mouseY);
    }
}



display.setAlign("center");
display.setBackground(DisplayHandler.Background.PER_LINE);

function warnDisplay() {
    if(connected && api_json != null){
        if(!draggin){
            display.setRenderLoc(settings.displayLength, settings.displayHeight);
        }else{
            display.setRenderLoc(tempX, tempY);
            if(!Client.isInChat()){
                settings.displayLength = tempX;
                settings.displayHeight = tempY;
                FileLib.write("dragonUtils","settings.json",JSON.stringify(settings));
                draggin = false;
            }
        }

        if(settings.toggleDisplay){
            display.setLine(0,new DisplayLine("").registerDragged((xDist,yDist,mouseX,mouseY,button) =>drag(xDist,yDist,mouseX,mouseY,button)));
            display.setLine(1, "§4§lEvent: "+currentEvent+"");
            display.setLine(2, new DisplayLine("---------------").setTextColor(Renderer.DARK_GRAY));
            for(i = 0; i<api_json.Players.length;i++){
                if(api_json.Players[i].event != "none"){
                    display.setLine(i+3,"§6" + api_json.Players[i].name + "§r §a-§r §9" + api_json.Players[i].location + "§r §a-§r §c" + api_json.Players[i].event)
                }else{
                    display.setLine(i+3,"")
                }
            }
            
        }else{
            display.clearLines();
        }
    }
    
}


function getBossName() {  
    let bossName = "";
    bossName = BossStatus.field_82827_c;
    bossName = removeColor(bossName);
    return bossName;// bossName
}

function removeColor(str){
    let txt = "";
    colorCodes.forEach(color => {
        if(str.includes(color)){
            str = str.replaceAll(color,"");
        }
    });
    txt = str;
    return txt;
}

var lastChatMessage = "";

var endstone = false;
var dragon = false;
var dragonDown = false;
var eyes = 0;

register("chat",(event)=>{
    if(connected){
        lastChatMessage = ChatLib.getChatMessage(event, true);
        if(getArea() == "The End"){
            
            if(removeColor(lastChatMessage).match("BEWARE - An Endstone Protector has risen!")){
                currentEvent = "Endstone Protector";
                endstone = true;
            }else if(removeColor(lastChatMessage).includes("ENDSTONE PROTECTOR DOWN!") && endstone){
                endstone = false;
            }
    
            if(removeColor(lastChatMessage).includes("placed a Summoning Eye!")){
                let eye = removeColor(lastChatMessage).slice(-4).slice(0,1);
                if(isNumeric(eye)){
                    eyes = parseInt(eye);
                    currentEvent = "Eyes " + eyes;
                }
            }
    
            if(removeColor(lastChatMessage).includes("DRAGON DOWN!") && dragon){
                ChatLib.chat("Down");
                dragonDown = true;
                dragon = false;
            }
        }
    }
    
});

function getEvent(location){
    let event = "none";
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
        case "Dwarven Mines":
            let dName = getBossName();
            if(dName != null){
                if(dName.includes("2X POWDER") == true){
                    event = "2X POWDER";
                }else if(dName.includes("BETTER TOGETHER")){
                    event = "BETTER TOGETHER";
                }else if(dName.includes("GOBLIN RAID")){
                    event = "GOBLIN RAID";
                }else if(dName.includes("GONE WITH THE WIND")){
                    event = "GONE WITH THE WIND";
                }else if(dName.includes("MITHRIL GOURMAND")){
                    event = "MITHRIL GOURMAND";
                }else if(dName.includes("RAFFLE")){
                    event = "RAFFLE";
                }else{
                    event = "none";
                }
            }
            break;
        case "Crystal Hollows":
            let cName = getBossName();
            if(cName != null){
                if(cName.includes("2X POWDER")){
                    event = "2X POWDER";
                }else if(cName.includes("BETTER TOGETHER")){
                    event = "BETTER TOGETHER";
                }else if(cName.includes("GOBLIN RAID")){
                    event = "GOBLIN RAID";
                }else if(cName.includes("GONE WITH THE WIND")){
                    event = "GONE WITH THE WIND";
                }else if(cName.includes("MITHRIL GOURMAND")){
                    event = "MITHRIL GOURMAND";
                }else if(cName.includes("RAFFLE")){
                    event = "RAFFLE";
                }else{
                    event = "none";
                }
            }
            break;
        case "The End":
            if(!dragonDown){
                if(getBossName().includes("Dragon") && !dragon){
                    event = getBossName();
                    eyes = 0;  
                    dragon = true;
                }
            }else{
                if(!getBossName().includes("Dragon")){
                    dragonDown = false;
                }
            }

            if(eyes > 0){
                event = "Eyes " + eyes;
            }
            
            if(!endstone && (eyes == 0 && dragonDown)){
                event = "none";
            }
            break;
        default:
            event = "none";
            break;
        
    }
    return event;
}

function apiShare(area,event,want){
    let url = baseUrl+"?state=add&uuid="+uuid+"&name="+name+"&location="+area+"&event="+event+"&wants="+want;
    url = url.replaceAll(" ", "%20");
    axios.get(url,{headers: {
        "User-Agent": "Mozilla/5.0 (ChatTriggers)"
    }}).then(response => {
        api_json = response.data;
      })
      .catch(error => {
        if (error.isAxiosError) {
            print(error.code + ": " + error.response.data);
        } else {
            print(error.message);
        }
      });
}

function apiUpdate(){
    axios.get(baseUrl,{headers: {
        "User-Agent": "Mozilla/5.0 (ChatTriggers)"
    }}).then(response => {
        api_json = response.data;
      })
      .catch(error => {
        if (error.isAxiosError) {
            print(error.code + ": " + error.response.data);
        } else {
            print(error.message);
        }
      });
}

var events_array = new Array("CATACLYSMIC","2X POWDER","BETTER TOGETHER","GOBLIN RAID","GONE WITH THE WIND","MITHRIL GOURMAND","RAFFLE","Dragons","Eyes (1/8)","Protector");

let stepCount=0;
function main(){
    if(connected){
        if(settings.toggle){
            stepCount++;
        if(stepCount>=60*settings.delay){
            stepCount=0;
            let area = getArea();
            let event = getEvent(area);
            switch(area){
                case "Crimson Isle":
                    if(event == "CATACLYSMIC" && blow == false){
                        ChatLib.chat("§r§4!!!!!!!!"+event+"§r§4 !!!!!!!!")
                        blow = true;
                        currentEvent = "CATACLYSMIC";
                    }else if(!event == "CATACLYSMIC" && blow == true){
                        blow = false;
                    }
                    break;
                case "Dwarven Mines":
                    currentEvent =  event;
                    break;
                case "Crystal Hollows":
                    currentEvent =  event;
                    break
                case "The End":
                    currentEvent = event;
                    break;
                default:
                    currentEvent = "none";
                    break;
            }
            
        }
        }        
    }
    
}

let updateCount=0;
function Update(){
    if(connected){
        if(settings.toggle){
            updateCount++;
            if(updateCount>=60*5){
                updateCount=0;
                let area = getArea();
                if(settings.share){
                    apiShare(area,currentEvent,wants);
                }else{
                    apiUpdate();
                }
                
            }
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
    area = removeColor(area);
    return area;
}

function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str)
}

register("command", (...setting) => {
    if(connected){
        if(setting == null){
            ChatLib.chat("§6---§aDragonUtils§6---");
            ChatLib.chat("§a/dragonutils || /du §2(display this text)");
            ChatLib.chat("§a/du help §2(display this text)");
            ChatLib.chat("§a/du toggle §2(toggle the cataclysmic check)");
            ChatLib.chat("§a/du delay <number> §2(change the cataclysmic check delay in seconds)");
            ChatLib.chat("§a/du want <events> §2(sets the event your searching for)");
            ChatLib.chat("§a/du share §2(toggle if you want to share your events)");
            ChatLib.chat("§a/du list <event/want> §2(lists all player sharing there events or searching for one)");
            ChatLib.chat("§a/du toggleDisplay §2(toggle the cataclysmic warning)");
        }else{
            switch(setting[0]){
                case "toggle":
                    if(setting[1] == null){
                        settings.toggle = !settings.toggle;
                        FileLib.write("dragonUtils","settings.json",JSON.stringify(settings));
                        ChatLib.chat("§6---§aDragonUtils§6---");
                        ChatLib.chat("§2The toggle has been set to §a" + settings.toggle);
                    }else{
                        if(setting[1]=="true"){
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
                    if(setting[1] == null){
                        settings.toggleDisplay = !settings.toggleDisplay;
                        FileLib.write("dragonUtils","settings.json",JSON.stringify(settings));
                        ChatLib.chat("§6---§aDragonUtils§6---");
                        ChatLib.chat("§2The toggleDisplay has been set to §a" + settings.toggleDisplay);
                    }else{
                        if(setting[1]=="true"){
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
                case "delay":
                        if(isNumeric(setting[1])){
                            let dly = parseInt(setting[1]);
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
                    ChatLib.chat("§a/du want <events> §2(sets the event your searching for)");
                    ChatLib.chat("§a/du share §2(toggle if you want to share your events)");
                    ChatLib.chat("§a/du list <event/want> §2(lists all player sharing there events or searching for one)");
                    ChatLib.chat("§a/du toggleDisplay §2(toggle the cataclysmic warning)");
                    break
                case "want":
                    if(setting.length > 1){
                        wants = "";
                        for(i = 1;i< 4;i++){
                            if(setting[i] != null){
                                wants = wants +" "+setting[i];
                            }
                        }
                        if(wants.startsWith(" ")){
                            wants = wants.slice(1);
                        }
                        if(events_array.includes(wants)){
                            ChatLib.chat("§6---§aDragonUtils§6---");
                            ChatLib.chat("§aYou search for " + wants);
                        }else{
                            ChatLib.chat("§6---§aDragonUtils§6---");
                            ChatLib.chat("§4Your search has been set to " + wants);
                            ChatLib.chat("§4Please use one of these: ");
                            let wEvents = events_array.toString();
                            wEvents = wEvents.replaceAll(",",", ");
                            ChatLib.chat("§a"+wEvents);
                            wants = "none";
                        }
                        
                    }else{
                        wants = "none";
                        ChatLib.chat("§6---§aDragonUtils§6---");
                        ChatLib.chat("§aYou search for " + wants);
                    }
                    break
                case "share":
                    if(setting[1] == null){
                    settings.share = !settings.share;
                        FileLib.write("dragonUtils","settings.json",JSON.stringify(settings));
                        ChatLib.chat("§6---§aDragonUtils§6---");
                        ChatLib.chat("§2The share has been set to §a" + settings.share);
                        if(!settings.share){
                            axios.get(baseUrl+"?state=remove&uuid="+uuid,{headers: {
                                "User-Agent": "Mozilla/5.0 (ChatTriggers)"
                            }})
                        }
                    }else{
                        if(setting[1]=="true"){
                            settings.share = true;
                            FileLib.write("dragonUtils","settings.json",JSON.stringify(settings));
                            ChatLib.chat("§6---§aDragonUtils§6---");
                            ChatLib.chat("§2The share has been set to §a" + settings.share);
                        }else if(setting[1]=="false"){
                            settings.share = false;
                            FileLib.write("dragonUtils","settings.json",JSON.stringify(settings));
                            ChatLib.chat("§6---§aDragonUtils§6---");
                            ChatLib.chat("§2The toggle has been set to §a" + settings.share);
                            axios.get(baseUrl+"?state=remove&uuid="+uuid,{headers: {
                                "User-Agent": "Mozilla/5.0 (ChatTriggers)"
                            }})
                        }else{
                        ChatLib.chat("§6---§aDragonUtils§6---");
                            ChatLib.chat("Use share or false!");
                        }
                    }
                    break;
                case "list":
                    ChatLib.chat("§6---§aDragonUtils§6---");
                    switch(setting[1]){
                        case "event":
                            ChatLib.chat("§aPlayer Events: ");
                            api_json.Players.forEach(player => {
                                if(player.event != "none"){
                                    ChatLib.chat("§6" + player.name + "§r §aLocation§r§b:§r §9" + player.location + "§r §aEvent§r§b:§r §c" + player.event);
                                }
                            })
                            break;
                        case "want":
                            ChatLib.chat("§aPlayer Wants: ");
                            api_json.Players.forEach(player => {
                                if(player.wants != "none"){
                                    ChatLib.chat("§6" + player.name + "§r §aLocation§r§b:§r §9" + player.location + "§r §aWants§r§b:§r §c" + player.wants);
                                }
                            })
                            break;
                        case null:
                            ChatLib.chat("§aPlayer Events: ");
                            api_json.Players.forEach(player => {
                                if(player.event != "none"){
                                    ChatLib.chat("§6" + player.name + "§r §aLocation§r§b:§r §9" + player.location + "§r §aEvent§r§b:§r §c" + player.event);
                                }
                            })
                            break;
                        default:
                            ChatLib.chat("§aPlayer Events: ");
                            api_json.Players.forEach(player => {
                                if(player.event != "none"){
                                    ChatLib.chat("§6" + player.name + "§r §aLocation§r§b:§r §9" + player.location + "§r §aEvent§r§b:§r §c" + player.event);
                                }
                            })
                            break;
                    }
                    break;
                default:
                    ChatLib.chat("§6---§aDragonUtils§6---");
                    ChatLib.chat("§a/dragonutils || /du §2(display this text)");
                    ChatLib.chat("§a/du help §2(display this text)");
                    ChatLib.chat("§a/du toggle §2(toggle the cataclysmic check)");
                    ChatLib.chat("§a/du delay <number> §2(change the cataclysmic check delay in seconds)");
                    ChatLib.chat("§a/du want <events> §2(sets the event your searching for)");
                    ChatLib.chat("§a/du share §2(toggle if you want to share your events)");
                    ChatLib.chat("§a/du list <event/want> §2(lists all player sharing there events or searching for one)");
                    ChatLib.chat("§a/du toggleDisplay §2(toggle the cataclysmic warning)");
                    break;
            }
        }
    }
  
  }).setTabCompletions("toggle","delay","help","toggleDisplay","want","share","list").setName("dragonutils").setAliases("du");