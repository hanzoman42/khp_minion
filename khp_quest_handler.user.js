// ==UserScript==
// @name         quest_handler
// @namespace    http://tampermonkey.net/
// @version      13.08.2018
// @description  Kamihime auto start quests
// @author       You
// @include      https://www.nutaku.net/games/kamihime-r/play/
// @include      https://cf.r.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/mypage_quest_party_guild_enh_evo_gacha_present_shop_epi_acce_detail/app.html*
// @include      https://cf.g.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/mypage_quest_party_guild_enh_evo_gacha_present_shop_epi_acce_detail/app.html*
// @include      https://cf.r.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/scenario/*
// @include      https://cf.g.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/scenario/*
// @include      https://cf.r.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/mi/app.html*
// @include      https://cf.g.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/mi/app.html*
// @include      https://cf.r.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/top/app.html*
// @include      https://cf.g.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/top/app.html*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @grant        none
// @run-at       document-end
// ==/UserScript==

/*available parameters

General:
"type": The type of the quest, this is the only parameter that's always mandatory. See quest types below for available ones.
"element": The element that you want to use for this quest. If not set, it'll either pick the recommended one or the currently active party, depending on selectRecommended.
"party": Selects a specific party for this quest ("A" to "L"). Overwrites "element".
"ap": This allows you to select which difficulty you want to pick. If there is no "ap" property, it'll automatically select the highest difficulty (quests)
        or search for all difficulties (raids). For raids, it's the ap that it would take to host it (even for joining).
"summon": First tries to find said summon. If not specified, it picks the first available helper
"summon_element": If you want to set a helper from a different element (f.e. Sleipnir while using a water team), then you need to specify which element the Eidolon is.

QUEST ONLY:
"use_he": If set to false, this quest won't be using any half elixirs.
"do_first": Check if this quest is available before you check for raids
"wait_for_ap": If set to true and the quest is available, it will ignore all quests after this.

RAID ONLY:
"raid_element": To select an element for disaster raids. See elements below for available elements. Has to be set for quests, if not set for raids, it will search for all elements.
"union_only": If a raid has this property set to true, you'll only join raids that contain at least 1 union member.
"min_bp": If a raid has this property, it will only search for it if your current BP exceed the min_bp value. If not set, it'll always join if it finds a suitable one.
"max_participants": If a raid has this property, it will ignore all raids with more than the set amount of participants.
"min_participants": If a raid has this property, it will ignore all raids with less than the set amount of participants.
"min_time": If a raid has this property, it will ignore all raids with less than set time remaining (in minutes).
"min_hp": If a raid has this property, it will ignore all raids with less than set HP remaining(percentual, f.e.: 50 for half HP).
"priority": When you want to join a raid and there are multiple equal options, this will decide the sorting method used to determine the one you join.
"hp": Joins the raid with the highest HP. This is the default.
"union": If there are raids fitting the criteria with union members, it'll join those first. If multiple union raids -> takes the highest HP one.
"time": Selects the raid that still has the most amount of time left.
"participants": Selects the raid that has the least amount of people in it.

UE Demon only:
"id": Which of the 3 open raids you want to join (1-3).
"not_last": Set to true to join one of the first 2 raids (which one gets decided by other filters).

*/

//SP QUESTS
var aq4 = {
    "type": "accessory",
    "element": "light",
    "use_he": false,
    "ap": 35
};
var dailySP = {
    "type":"daily",
    "element": "dark",
    "party": "H",
    "use_he": false,
    "ap": 50
};
var gemQuest = {
    "type": "gem",
    "use_he": true,
    "element": "dark",
    "do_first": true
};

// ADVENT EVENT QUESTS
var eventQuest = {
    "type": "event",
    "party": "A",
    "use_he": false,
    "ap": 30
};

// RAID EVENTS QUESTS
var raidEventElement = "dark";
var raidEventSummon = "Anubis";
var standardEventRaid = {
    "type": "event_raid",
    "element": raidEventElement,
    "summon": raidEventSummon,
    "use_he": false,
    "ap": 15
};
var expertEventRaid = {
    "type": "event_raid",
    "ap": 25,
    "element": raidEventElement,
    "summon": raidEventSummon,
    "use_he": false,
    "priority": "participants",
    "max_participants": 2,
    "min_time": 10,
    "min_hp": 70,
    "min_bp": 1
};
var ragnarokEventRaid = {
    "type": "event_raid",
    "ap": 35,
    "element": raidEventElement,
    "summon": raidEventSummon,
    "use_he": false,
    "priority": "participants",
    "max_participants": 4,
    "min_time": 40,
    "min_bp": 4
};

// RAID QUESTS
var fireRag = {
    "type": "disaster",
    "raid_element": "fire",
    "element": "water",   
    "min_hp": 80,
    "priority": "participants",
    "use_he": false,
    "ap": 50,
    "min_bp": 5
};
var waterRag = {
    "type": "disaster",
    "raid_element": "water",
    "element": "thunder",
    "min_hp": 80,
    "priority": "participants",
    "use_he": false,
    "ap": 50,
    "min_bp": 5
};
var windRag = {
    "type": "disaster",
    "raid_element": "wind",
    "element": "fire",
    "min_hp": 80,
    "priority": "participants",
    "use_he": false,
    "ap": 50,
    "min_bp": 5
};
var thunderRag = {
    "type": "disaster",
    "raid_element": "thunder",
    "element": "wind",
    "min_hp": 80,
    "priority": "participants",
    "use_he": false,
    "ap": 50,
    "min_bp": 5
};
var lightRag = {
    "type": "disaster",
    "raid_element": "light",
    "element": "dark",
    "min_hp": 80,
    "priority": "participants",
    "use_he": false,
    "ap": 50,
    "min_bp": 5
};
var darkRag = {
    "type": "disaster",
    "raid_element": "dark",
    "element": "light",
    "min_hp": 80,
    "priority": "participants",
    "use_he": false,
    "ap": 50,
    "min_bp": 5
};

// UNION EVENT
var ueElement = "dark";
var lilimRaid = {
    "type": "lilim",
    "use_he": false,
    "element": ueElement,
    "ap": 25,
    "min_bp": 2
};
var unionExpert = {
    "type": "ue_expert",
    "element": ueElement,
    "max_participants": 4,
    "not_last": false,
    "min_hp": 70,
    "min_bp": 1
};
var unionUltimate = {
    "type": "ue_ultimate",
    "element": ueElement,
    "max_participants": 10,
    "not_last": true,
    "min_hp": 70,
    "min_bp": 0
};

// FOR CROSSOVER EVENTS LIKE KOIHIME
var storyEvent = {
    "type": "story_event",
    "ap": 30,
    "element": "fire",
    "use_he": false
};

//Add all quests you want to check in here: storyEvent lightRag eventQuest darkRag darkRag, eventQuest,
//var questPriorityList = [gemQuest, dailyGemQuest, lightRag, darkRag, dailySP];
var questPriorityList = [gemQuest, storyEvent, lightRag, darkRag, dailySP];


//Add all raids you want to check in here (raids get checked before quests): , disasterRag, darkRag
var raidPriorityList = [darkRag, lightRag, thunderRag, fireRag, waterRag, windRag];
//var raidPriorityList = [unionUltimate];

//Your settings
var parties = {
    "fire": "A",
    "water": "B",
    "wind": "C",
    "thunder": "D",
    "dark": "F",
    "light": "E"
};

// For the other parties e.g.: "party": "G"
var keepRunning = true;         //If no more quests are available and keepRunning is set to true, the script will go through the priorityLists again after 30 seconds.
var refreshTimeout = 60;        //Seconds that it waits before starting a new cycle on keepRunning
var halfElixirLimit = 290;       //If your half elixir count reaches this limit, the script will stop using them.
var seedLimit = 300;            //If your seed count reaches this limit, the script will stop using them.
var timeoutMulti = 1;           //Multiplier for the wait time between some actions. On a slow computer, consider increasing it to 1.5 or 2 for slower, but more consistent performance.
var selectRecommended = true;   //If enabled and no element is specified for a quest, it'll pick the recommended element. Otherwise it will pick your currently active party.
var debug = false;              //For debugging. Will log the quest to the console instead of starting/joining it.
var rejoinRaid = false;         //If enabled, you'll rejoin union raids that you left, disconnected or died in.

//PriorityList for picking out supports, important to also get friends with off element Eidolons (f.e. Fafnir for water)
var summons = [
    {"element": "fire", summonPriority:[{"name": "Belial"}, {"name": "Fafnir", "min_level": 41}, {"name": "Echidna", "min_level": 41, "element": "dark"}]},
    {"element": "water", summonPriority:[{"name": "Rudra"}, {"name": "Fafnir", "min_level": 41, "element": "fire"}, {"name": "Behemoth", "min_level": 71, "element": "wind"}]},
    {"element": "wind", summonPriority:[{"name": "Hraesvelgr"}, {"name": "Sleipnir", "min_level": 56}, {"name": "Jabberwock", "min_level": 56}]},
    {"element": "thunder", summonPriority:[{"name": "Kirin"}, {"name": "Huanglong", "min_level": 56}, {"name": "Girimehkala", "min_level": 56}, {"name": "Ouroboros", "min_level": 41, "element": "dark"}]},
    {"element": "dark", summonPriority:[{"name": "Anubis"}, {"name": "Echidna", "min_level": 41}, {"name": "Ouroboros", "min_level": 41}]},
    {"element": "light", summonPriority:[{"name": "Managarmr"}, {"name": "Thunderbird", "min_level": 41, "element": "thunder"}, {"name": "Behemoth", "min_level": 71, "element": "wind"}]}
];




var questTypes = ["daily", "gem", "gem_daily", "accessory", "lilim", "disaster", "event_advent", "event_raid", "story_event"];
var elements = ["fire","water","wind","thunder","dark","light"];

//Variables used throughout the script
var info = {}, href, state, quest;

function getNextServerResetTime() {
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();

    // DST Start
    var firstOfMarch = new Date(currentYear, 2, 1);
    var daysUntilFirstSundayInMarch = (7 - firstOfMarch.getDay()) % 7;
    var secondSundayInMarch = firstOfMarch.getDate() + daysUntilFirstSundayInMarch + 7;
    var dstStartDate = new Date(currentYear, 2, secondSundayInMarch);

    // DST End
    var firstOfNovember = new Date(currentYear, 10, 1);
    var daysUntilFirstSundayInNov = (7 - firstOfNovember.getDay()) % 7;
    var firstSundayInNovember = firstOfNovember.getDate() + daysUntilFirstSundayInNov;
    var dstEndDate = new Date(currentYear, 10, firstSundayInNovember);

    if (currentDate >= dstStartDate && currentDate < dstEndDate) {
        var serverResetHour = 15;
    }
    else {
        serverResetHour = 16;
    }

    return new Date(currentDate.getFullYear(),currentDate.getMonth(),currentDate.getDate()+1,serverResetHour,0,0,0);
}

/*
Scheduler data structure
scheduler = {
    "nextServerResetTime" : date,
    "lastServerResetDate" : date,
}

Pseudocode for scheduler

if (currentTime >= nextServerResetTime) {
    scheduler.nextServerResetTime = getNextServerResetTime();
    scheduler.lastServerResetDate = new Date();
    GM_setValue("nextServerResetTime",nextServerResetTime);
}
else {
    
}
*/

//Start method, loaded whenever the script gets loaded or restarted.
function waitBeforeStart() {
    info.questPriorityList = questPriorityList.slice(); // creates a copy of the quest priority list into the info variable
    info.raidPriorityList = raidPriorityList.slice(); // creates a copy of the raid priority list into the info variable
    quest = undefined;
    // sets href variable for use by refreshPage() function
    if (location.host === "cf.r.kamihimeproject.dmmgames.com") {
        href = "https://cf.r.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/mypage_quest_party_guild_enh_evo_gacha_present_shop_epi_acce_detail/app.html"; // note: cf.r
    } 
    else {
        href = "https://cf.g.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/mypage_quest_party_guild_enh_evo_gacha_present_shop_epi_acce_detail/app.html"; // note: cf.g
    }
    if (location.pathname === "/front/cocos2d-proj/components-pc/scenario/app.html" || // skip scenario
        location.pathname === "/front/cocos2d-proj/components-pc/mi/app.html" || // skip panel
        location.pathname === "/front/cocos2d-proj/components-pc/top/app.html") { //skip start
        console.log("Skipping loading screen");
        refreshPage();
        return;
    }
    // If in results screen after a battle, get the results first.
    if (has(kh,"createInstance")) {
        if (location.hash.startsWith("#!quest/q_003_1")){
            console.log("Getting results.");
            setTimeout(refreshPage, 3000 * timeoutMulti); // calls refreshPage after 3 seconds x time multiplier
        }
        else {
            getPlayerInfo(); // gets player information
        }
    }
    else {
        setTimeout(waitBeforeStart, 1000 * timeoutMulti); // calls waitBeforeStart after 1 second x time multiplier
    }
}

//Get information about the player and the quest
function getPlayerInfo(){
    console.log("Get quest info");
    kh.createInstance("apiAQuestInfo").get().then(function(e) {
        //Necessary to get the quests state (f.e. quests in progress, unverified results, etc)
        info.questInfo = e.body;
        kh.createInstance("apiAPlayers").getMeNumeric().then(function (f) {
            //Used to get the selected party
            info.player = f.body;
            kh.createInstance("apiAPlayers").getQuestPoints().then(function (g) {
                //Information about the current AP and BP
                info.questPoints = g.body.quest_points;
                kh.createInstance("apiAParties").getDecks().then(function (h) {
                    //The parties the player has available
                    info.parties = h.body;
                    console.log(info);
                    checkQuestInfo();
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }.bind(this));
}

//Check if there are already quests or raids in progress or you have unverified results
function checkQuestInfo(){
    //Unfinished raid
    if (info.questInfo.in_progress.help_raid_ids.length > 0){
        console.log('You have an unfinished raid!');
        raidInProgress();
    }
    // Unclaimed result
    else if (info.questInfo.has_unverified) {
        console.log('You have an unverified quest or raid!');
        kh.createInstance("apiABattles").getUnverifiedList().then(function(e) {
            info.unverifiedList = e.body;
            resolveUnverified();
        }.bind(this));
    }
    //Unfinished quest
    else if (has(info,"questInfo","in_progress","own_quest")){
        info.quest = info.questInfo.in_progress.own_quest;
        console.log('You have an unfinished quest!');
        kh.createInstance("apiAQuests").getCurrentState(info.quest.a_quest_id,info.quest.type).then(function(e) {
            state = e.body;
            nextStage();
        }.bind(this));
    }
    //All good, start quest selection
    else {
        if (quest === undefined){
            checkPriorityList();
        }
        else{
            //Shouldn't ever get here anymore i think?
            console.log("Contact me if this message pops up.");
            getQuestList();
        }
    }
}

//Get Raids and Quests from their respective priority lists.
function checkPriorityList(){
    if (debug){
        console.log("PriorityLists:");
        console.log(info.questPriorityList);
        console.log(info.raidPriorityList);
    }
    //Check do_first
    for (var i=0; i<info.questPriorityList.length; i++){
        if (has(info.questPriorityList[i], "do_first") && info.questPriorityList[i].do_first){
            quest = info.questPriorityList.shift();
            getQuestList();
            return;
        }
    }
    //Check raids first
    if (info.raidPriorityList.length !== 0){
        quest = info.raidPriorityList.shift();
        getRaidList();
        return;
    }
    //No raids found, check quests
    if (info.questPriorityList.length !== 0){
        quest = info.questPriorityList.shift();
        getQuestList();
    } else {
        console.log("No more quests available!");
        if (keepRunning){
            console.log("Waiting " + refreshTimeout + " seconds");
            console.log("...");
            setTimeout(waitBeforeStart, refreshTimeout * 1000);
        }else{
            console.log("Script ends!");
            //Only exit point in the entire script
        }
    }
}

//Get all quests available for set type
function getQuestList(){
    if (has(quest, "type")){
        console.log("Prepare quest:");
        console.log(quest);
        switch(quest.type){
            case "accessory":
            case "daily":
            case "event":
                kh.createInstance("apiAQuests").getListSpecialQuest().then(function(e) {
                    prepareQuest(e.body.data.filter(function (obj) {
                        return obj.type===quest.type;
                    }));
                }.bind(this));
                break;
            case "gem":
            case "gem_daily":
                kh.createInstance("apiAQuests").getListSpecialQuest().then(function(e) {
                    var availableQuests = e.body.data.filter(function (obj) {
                        return obj.type === "guerrilla" && obj.title.includes("Gem Quest");
                    });
                    prepareQuest(availableQuests.filter(function(obj){
                        return (has(obj.limit_info, "remaining_challenge_count")?
                                quest.type === "gem_daily" : quest.type ==="gem"
                        );
                    }));
                }.bind(this));
                break;
            case "event_raid":
                //Get the event id and all available raids for it
                kh.createInstance("apiABanners").getMypageBanners().then(function(e) {
                    info.banners = e.body;
                    var raidEvent = info.banners.data.filter(function (obj) {
                        return obj.event_type === "raid_event";
                    })[0];
                    if (has(raidEvent)){
                        kh.createInstance("apiAQuests").getListEventQuest(raidEvent.event_id).then(function(e) {
                            prepareQuest(e.body.data.filter(function (obj) {
                                return obj.type === "event_raid";
                            }));
                        });
                    }
                });
                break;
            case "disaster":
                kh.createInstance("apiAQuests").getListRaid().then(function(e) {
                    if (has(quest, "raid_element")){
                        var index = elements.indexOf(quest.raid_element);
                        var disasterRaids = e.body.raid_quest_lists;
                        var selectedRaids = disasterRaids.filter(function (obj) {
                            return obj.element_type === index;
                        });
                        prepareQuest(selectedRaids[0].data);
                    }else{
                        console.log("You need to set a raid_element for disaster raids!\n" +
                            "Skipping quest.");
                        checkPriorityList();
                    }
                }.bind(this));
                break;
            case "lilim":
                kh.createInstance("apiABanners").getMypageBanners().then(function(e) {
                    info.banners = e.body;
                    var unionEvent = info.banners.data.filter(function ( obj ) {
                        return obj.event_type === "union_raid_event";
                    })[0];
                    if (has(unionEvent)){
                        kh.createInstance("apiAQuests").getListEventQuest(unionEvent.event_id).then(function(e) {
                            prepareQuest(e.body.data.filter(function (obj) {
                                return obj.type === "event_union_lilim_raid";
                            }));
                        }.bind(this));
                    } else {
                        console.log('Currently there is no union event available!');
                        checkPriorityList();
                    }
                }.bind(this));
                break;
            case "story_event":
                kh.createInstance("apiABanners").getMypageBanners().then(function(e) {
                    info.banners = e.body;
                    var storyEvent = info.banners.data.filter(function (obj) {
                        return obj.event_type === "quest_story_event";
                    })[0];
                    if (has(storyEvent)) {
                        kh.createInstance("apiAQuests").getListEventQuest(storyEvent.event_id).then(function (e) {
                            prepareQuest(e.body.data);
                        }.bind(this));
                    } else {
                        console.log('Currently there is no story event available!');
                        checkPriorityList();
                    }
                }.bind(this));
                break;
        }
    }
    else{
        console.log("Please set a quest type!");
    }
}

function prepareQuest(availableQuests) {
    //Selects the chosen quest out of the list of quests by AP and checks entry limit
    if (!selectQuest(availableQuests) || !isAvailable()){
        checkPriorityList();
        return;
    }
    //Check if you have enough AP to join
    if (info.questPoints.ap < info.quest.quest_ap)
    {
        if (!has(quest, "use_he") || quest.use_he){
            useElixir();
            return;
        }
        console.log("Not enough AP to start quest.");
        if (has(quest, "wait_for_ap") && quest.wait_for_ap){
            console.log("Quest available and wait for AP set, skip all other quests.");
            info.questPriorityList = [];
        }
        checkPriorityList();
    }else{
        startQuest();
    }
}

//Selects the quest from the pool based off AP
function selectQuest(questsAvailable){
    if (questsAvailable.length === 0){
        console.log("Currently no such quest available.");
        return false;
    }
    if (has(quest, "ap")){
        var results = questsAvailable.filter(function (obj){
            return obj.quest_ap === quest.ap;
        });
        if (results.length !== 0){
            if (results.length !== 1){
                console.log("Had multiple hits, picking first.");
            }
            info.quest = results[0];
            return true;
        }else{
            console.log("No quest costing " + quest.ap + "AP found!");
            return false;
        }
    }else{
        var highestAP = Math.max.apply(Math, questsAvailable.map(function(q) {
            return q.quest_ap;
        }));
        info.quest = questsAvailable.filter(function (obj){
            return obj.quest_ap === highestAP;
        })[0];
        return true;
    }
}

//Checks if you still have entries left to join
function isAvailable(){
    if (has(info.quest, "limit_info")){
        if ((has(info.quest.limit_info, "remaining_challenge_count") && info.quest.limit_info.remaining_challenge_count === 0) ||
            (quest.type === "accessory" && info.questInfo.accessory_quest_remaining_challenge_count === 0)){
            console.log("No entries left!");
            return false;
        }
    }
    if (has(info.quest, "required_item")){
        if (info.quest.required_item.possession_amount < info.quest.required_item.amount ){
            console.log("Not enough materials!");
            return false;
        }
    }
    return true;
}

function useElixir(){
    if (!has(info,"cure_items")){
        kh.createInstance("apiAItems").getCure(1, 10).then(function(e) {
            info.cure_items = e.body;
            useElixir();
        }.bind(this));
    } else {
        var elixir = info.cure_items.data.filter(function ( obj ) {
            return obj.name==='Half Elixir';
        })[0];
        if (has(elixir,"a_item_id") && elixir.num >= halfElixirLimit){
            kh.createInstance("apiAItems").useItem(elixir.a_item_id,1).then(function(){
                console.log('Elixir used');
                //Refresh the quest points to get the new AP count and go back to questList,
                //necessary here, since 1 HE might not have been enough to add enough AP to fulfil the requirements.
                kh.createInstance("apiAPlayers").getQuestPoints().then(function(g) {
                    info.questPoints = g.body.quest_points;
                    getQuestList();
                }.bind(this));
            }.bind(this));
        } else {
            console.log("Too many elixirs used. Can't start quest.");
            checkPriorityList();
        }
    }
}

//Selects the party and summon and starts the quest
function startQuest() {
    if (debug) {
        console.log(info.quest);
    }
    SetPartyAndSummon().then(function() {
        if (debug) {
            console.log(info.quest.a_quest_id, info.quest.type, info.party_id, info.summon_id);
        } else {
            kh.createInstance("apiAQuests").startQuest(info.quest.a_quest_id, info.quest.type, info.party_id, info.summon_id).then(function (e) {
                state = e.body;
                nextStage();
            }.bind(this));
        }
    });
}

//Sets the party and selects a summon
function SetPartyAndSummon(){
    return new Promise(function(resolve) {
        var summonElement;
        if (has(quest, "party")) {
            summonElement = elements[info.parties.decks.filter(function (d) {
                return d.party_name === "Party " + quest.party;
            })[0].job.element_type];
        } else if (has(quest, "element")){
            summonElement = quest.element;
        } else {
            //No element selected, get the recommended element out of the quest info.
            if (has(info.quest, "episodes") && has(info.quest.episodes[0], "recommended_element_type") && selectRecommended){
                summonElement = elements[info.quest.episodes[0].recommended_element_type];//
            }
            //No element selected, get the recommended element out of the raid request info.
            else if(has(info.quest, "recommended_element_type") && selectRecommended){
                summonElement = elements[info.quest.recommended_element_type];
            }
            //No element selected and selectRecommended is false, get the element of the currently selected party.
            else {
                summonElement = getPropertyByValue(parties, info.player.selected_party.party_name.slice(-1)).toString();
            }
        }

        //Set the partyId
        if (has(quest, "party")) {
            info.party_id = info.parties.decks.filter(function (d) {
                return d.party_name === "Party " + quest.party;
            })[0].a_party_id;
        } else{
            info.party_id = info.parties.decks.filter(function(d){
                return d.party_name === "Party " + getPartyLetter(summonElement);
            })[0].a_party_id;
        }




        console.log("Using " + summonElement + ".");

        var summonElementId = elements.indexOf(summonElement);
        if (summonElementId === -1){
            summonElementId = 5;
        }

        //Set the summonId
        setSummon(summonElementId).then(function(){
            resolve();
        });
    });
}

function setSummon(elementId){
    return new Promise(function(resolve) {
        //Check if quest had a summon specified
        if (has(quest, "summon")) {
            //Check if quest had a summon element specified, otherwise use the parties element
            var summonElementId = has(quest, "summon_element")
                ? elements.indexOf(quest.summon_element) !== -1
                    ? elements.indexOf(quest.summon_element) : elementId
                : elementId;
            //Get the first summon with that name
            kh.createInstance("apiASummons").getSupporters(summonElementId).then(function (e) {
                var summon = e.body.data.filter(function (obj) {
                    return obj.summon_info.name === quest.summon;
                })[0];
                if (summon !== undefined){
                    if (debug){
                        console.log(summon);
                    }
                    info.summon_id = summon.summon_info.a_summon_id;
                    resolve();
                //If none found, get the first summon of the party element
                }else{
                    if (summonElementId === elementId){
                        summon = e.body.data[0];
                        if (debug){
                            console.log(summon);
                        }
                        info.summon_id = summon.summon_info.a_summon_id;
                        resolve();
                    }else{
                        kh.createInstance("apiASummons").getSupporters(elementId).then(function (e) {
                            summon = e.body.data[0];
                            if (debug){
                                console.log(summon);
                            }
                            info.summon_id = summon.summon_info.a_summon_id;
                            resolve();
                        });
                    }

                }
            });
        //No summon specified, use summon prioritylist
        }else{
            //Load the summon priorities for selected element
            var summonPriorityList = summons.filter(function(obj) {
                return obj.element === elements[elementId];
            })[0].summonPriority;

            var summonElements = [elements[elementId]];

            //Look up all elements that you need to get the support lists for
            for (var i=0; i< summonPriorityList.length; i++){
                if (has(summonPriorityList[i], "element") && !summonElements.filter(function(obj){
                        return obj.element === summonPriorityList[i].element
                    }).length > 0){
                    summonElements.push(summonPriorityList[i].element);
                }
            }

            var promises = [];
            var summonsAvailable = [];

            //Get the summon lists for all necessary elements
            for (i=0; i<summonElements.length; i++){
                promises.push(getSummonList(summonElements[i], summonsAvailable));
            }
            //Once you got all available summons, go through the priority list and check for matches
            Promise.all(promises).then(function(){
                for (var i=0; i<summonPriorityList.length; i++){
                    var summonElement = summonPriorityList[i].element || elements[elementId];
                    var minLevel = summonPriorityList[i].min_level || 0;
                    var available = summonsAvailable.filter(function(obj){
                        return obj.element === summonElement;
                    })[0].summons;

                    var summonsFound = available.filter(function(obj){
                        return (obj.summon_info.name === summonPriorityList[i].name && obj.summon_info.level >= minLevel);
                    });

                    //Summon found
                    if (summonsFound.length !== 0){
                        if (debug){
                            console.log(summonsFound[0]);
                        }
                        info.summon_id = summonsFound[0].summon_info.a_summon_id;
                        resolve();
                        break;
                    }
                }

                //If nothing from the priority list was found, pick first of main element
                kh.createInstance("apiASummons").getSupporters(elementId).then(function (e) {
                    info.summon_id = e.body.data[0].summon_info.a_summon_id;
                    resolve();
                });
            });
        }
    });
}

//Get all available summons for one element and add them to summonsAvailable
function getSummonList(summonElement, summonsAvailable){
    return new Promise(function(resolve) {
        kh.createInstance("apiASummons").getSupporters(elements.indexOf(summonElement)).then(function (e) {
            summonsAvailable.push({"element": summonElement, "summons": e.body.data});
            resolve();
        });
    })
}

//Returns the letter of the party for said element
function getPartyLetter(element){
    switch(element){
        case "fire":
            return parties.fire;
        case "water":
            return parties.water;
        case "wind":
            return parties.wind;
        case "thunder":
            return parties.thunder;
        case "light":
            return parties.light;
        case "dark":
            return parties.dark;
        default:
            console.log("Invalid element. Set to light!");
            return parties.light;
    }
}

function resolveUnverified(){
    if (has(info,"unverifiedList","data","0")){
        var openQuest = info.unverifiedList.data[0];
        console.log('Get battle result for ' + openQuest.quest_type);
        kh.createInstance("apiABattles").getBattleResult(openQuest.a_battle_id,openQuest.quest_type).then(function(e) {
            info.battleResult = e.body;
            showBattleResult();
        }.bind(this));
    } else {
        checkPriorityList();
    }
}

//Get all raids available for set type
function getRaidList(){
    console.log("Prepare raid: ");
    console.log(quest);
    //First check if you even have more BP than you set as minimum
    if (has(quest, "min_bp") && quest.min_bp > info.questPoints.bp){
        console.log("Only " + info.questPoints.bp + " BP, while you specified min_bp of " + quest.min_bp + "!\n" +
            "Skipping raid.");
        checkPriorityList();
        return;
    }
    if (has(quest, "type")){
        switch(quest.type){
            case "disaster":
                kh.createInstance("apiAQuests").getListRaid().then(function(e) {
                    var disasterRaids = e.body.raid_quest_lists;
                    var selectedRaids = [];
                    //Filter if raid_element specified
                    if (has(quest, "raid_element")){
                        var index = elements.indexOf(quest.raid_element);
                        disasterRaids = disasterRaids.filter(function (obj) {
                            return obj.element_type === index;
                        });
                    }
                    // Select the actual raid objects from the wrapping object and add them to the array
                    disasterRaids.forEach(function (raid) {
                        raid.data.forEach(function (raidItem){
                            selectedRaids.push(raidItem);
                        });
                    });
                    prepareRaid(selectedRaids);
                }.bind(this));
                break;
            case "event_raid":
                //Get the event id and all available raids for it
                kh.createInstance("apiABanners").getMypageBanners().then(function(e) {
                    info.banners = e.body;
                    var raidEvent = info.banners.data.filter(function (obj) {
                        return obj.event_type === "raid_event";
                    })[0];
                    if (has(raidEvent)){
                        kh.createInstance("apiAQuests").getListEventQuest(raidEvent.event_id).then(function(e) {
                            prepareRaid(e.body.data.filter(function (obj) {
                                return obj.type === "event_raid";
                            }));
                        });
                    }
                });
                break;
            case "lilim":
            case "ue_ultimate":
            case "ue_expert":
                //Get the event id and all available raids for it
                kh.createInstance("apiABanners").getMypageBanners().then(function(e) {
                    info.banners = e.body;
                    var unionEvent = info.banners.data.filter(function (obj) {
                        return obj.event_type === "union_raid_event";
                    })[0];
                    if (has(unionEvent)){
                        //Lilims
                        if (quest.type === "lilim"){
                            kh.createInstance("apiAQuests").getListEventQuest(unionEvent.event_id).then(function(e) {
                                prepareRaid(e.body.data.filter(function (obj) {
                                    return obj.type === "event_union_lilim_raid";
                                }));
                            });
                            //Demons
                        }else{
                            kh.createInstance("apiABattles").getUnionRaidRequestList(unionEvent.event_id,(quest.type === "ue_ultimate" ? "Ultimate" : "Expert")).then(function(e) {
                                setTimeout(function(){
                                    selectDemon(e.body.data);
                                }, 5000);
                            });
                        }
                    } else {
                        console.log('Currently there is no union event available!');
                        checkPriorityList();
                    }
                });
                break;
        }
    }
    else{
        console.log("Please set a quest type!");
    }
}

//Filters the raids from the pool based off AP, checks requests and selects one based on the given parameters
function prepareRaid(selectedRaids){
    //No such raids found, check next priority
    if (selectedRaids.length === 0){
        console.log("Currently no such raid available!");
        checkPriorityList();
        return;
    }
    //Filter by ap if specified
    if (has(quest, "ap")){
        selectedRaids = selectedRaids.filter(function (obj){
            return obj.quest_ap === quest.ap;
        });
        if (selectedRaids.length === 0){
            console.log("No raids costing " + quest.ap + "AP to host found!");
            checkPriorityList();
            return;
        }
    }

    //Data that can be compared with the actual requests. Sadly they're only identifiable by enemy name and level currently.
    info.raidIDs = [];
    selectedRaids.forEach(function(raid){
        info.raidIDs.push({"name": raid.raid_info.enemy_name, "level": raid.raid_info.enemy_level});
    });

    //Get the actual open raids (requests)
    kh.createInstance("apiABattles").getRaidRequestList().then(function(e){
        info.requests = e.body.data;

        if (debug){
            console.log(info.raidIDs);
            console.log(info.requests);
        }

        //Select a suiting raid
        if (!findMatches()){
            return;
        }

        //Use seeds if necessary
        if (info.questPoints.bp < info.quest.battle_bp)
        {
            console.log(info.questPoints.bp + "/" + info.quest.battle_bp);
            useSeeds(info.quest.battle_bp - info.questPoints.bp);
        }else{
            joinRaid();
        }
    });
}

//Checks if any requests match with what we're looking for
function findMatches(){
    var matchingRaids = [];
    info.requests.forEach(function(request){
        for (var i =0; i<info.raidIDs.length; i++){
            if (request.enemy_name === info.raidIDs[i].name && request.enemy_level === info.raidIDs[i].level){
                matchingRaids.push(request);
                break;
            }
        }
    });

    if (has(quest, "union_only")){
        matchingRaids = matchingRaids.filter(function(request){
            return request.has_union_member;
        });
    }

    if(has(quest, "max_participants")){
        matchingRaids = matchingRaids.filter(function(raid){
            return raid.participants <= quest.max_participants;
        });
    }

    if(has(quest, "min_participants")){
        matchingRaids = matchingRaids.filter(function(raid){
            return raid.participants >= quest.min_participants;
        });
    }

    if (has(quest, "min_time")){
        matchingRaids = matchingRaids.filter(function(raid){
            var timeArray = raid.time_left.split(':');
            var minutes = ((+timeArray[0]) * 3600 + (+timeArray[1]) * 60 + (+timeArray[2])) / 60;
            return minutes >= quest.min_time;
        });
    }

    if (has(quest, "min_hp")){
        matchingRaids = matchingRaids.filter(function(raid){
            return (raid.enemy_hp / raid.enemy_max) >= (quest.min_hp / 100)
        });
    }

    if(debug){
        console.log("Matches:");
        console.log(matchingRaids);
    }

    //No requests survived the filtering, check next priority
    if (matchingRaids.length === 0){
        console.log("No matching raids of type " + quest.type + " found.");
        checkPriorityList();
        return false;
    }
    selectMatch(matchingRaids);
    return true;
}

//Sort all suitable raids by specified sorting method and select the best fitting one
function selectMatch(matchingRaids){
    if (has(quest, "priority")){
        switch(quest.priority){
            case "union":
                var raidsWithUnion = [];
                matchingRaids.forEach(function (raid) {
                    if (raid.has_union_member){
                        raidsWithUnion.push(raid);
                    }
                });
                if (raidsWithUnion.length !== 0){
                    matchingRaids = raidsWithUnion;
                }
                break;
            case "time":
                info.quest = matchingRaids.sort(function(a,b) {
                    return (a.time_left < b.time_left) ? 1 : ((b.time_left < a.time_left) ? -1 : 0);
                })[0];
                return;
            case "participants":
                info.quest = matchingRaids.sort(function(a,b) {
                    return (a.participants > b.participants) ? 1 : ((b.participants > a.participants) ? -1 : 0);
                })[0];
                return;
            case "hp":
                break;
        }
    }

    //By default sort by relative HP
    info.quest = matchingRaids.sort(function(a,b) {
        return ((a.enemy_hp / a.enemy_max) < (b.enemy_hp / b.enemy_max)) ? 1 : (((b.enemy_hp / b.enemy_max) < (a.enemy_hp / a.enemy_max)) ? -1 : 0);
    })[0];
}

function useSeeds(amount){
    if (!has(info,"cure_items")){
        kh.createInstance("apiAItems").getCure(1, 10).then(function(e) {
            info.cure_items = e.body;
            useSeeds(amount);
        }.bind(this));
    } else {
        var seed = info.cure_items.data.filter(function ( obj ) {
            return obj.name==='Energy Seed';
        })[0];
        if (has(seed,"a_item_id") && seed.num >= seedLimit){
            kh.createInstance("apiAItems").useItem(seed.a_item_id,amount).then(function(){
                console.log(amount + " seeds used!");
                //Refresh quest points and join raid right away. No need to go to quest list like with HE,
                //since the seeds will always be enough to get the required amount.
                kh.createInstance("apiAPlayers").getQuestPoints().then(function(g) {
                    info.questPoints = g.body.quest_points;
                    joinRaid();
                }.bind(this));
            }.bind(this));
        } else {
            console.log("Too many seeds used. Skipping raid.");
            checkPriorityList();
        }
    }
}

function selectDemon(raidsAvailable){
    info.quest = undefined;
    if (has(quest, "not_last") && quest.not_last){
        raidsAvailable.pop();
    }
    //If rejoin set to false, filter out any joined raids
    if (!rejoinRaid){
        raidsAvailable = raidsAvailable.filter(function(raid){
            return !raid.is_joined;
        });
    }

    //If ID is set, assign the raid right away
    if (has(quest, "id")){
        info.quest = raidsAvailable[quest.id - 1];
        //Otherwise apply filters
    } else{
        if (has(quest, "min_hp")){
            var raids = raidsAvailable.filter(function(raid){
                return (raid.enemy_hp / raid.enemy_max) >= (quest.min_hp / 100);
            });
            if (raids.length !== 0){
                raidsAvailable = raids;
            }
        }
        if (has(quest, "max_participants")){
            for (var i=0; i<raidsAvailable.length; i++){
                if (has(raidsAvailable[i], "participants") && raidsAvailable[i].participants <= quest.max_participants){
                    info.quest = raidsAvailable[i];
                    break;
                }
            }
        }
        if (has(quest, "min_participants")){
            for (i=0; i<raidsAvailable.length; i++){
                if (has(raidsAvailable[i], "participants") && raidsAvailable[i].participants >= quest.min_participants){
                    info.quest = raidsAvailable[i];
                    break;
                }
            }
        }
    }

    //If no raid passed the filter, sort by lowest participants
    if (info.quest === undefined){
        console.log("No raid passed the filters, pick the one with lowest participants");
        info.quest = raidsAvailable.sort(function(a,b) {
            return (a.participants > b.participants) ? 1 : ((b.participants > a.participants) ? -1 : 0);
        })[0];
    }

    //Use seeds if necessary
    if (info.questPoints.bp < info.quest.battle_bp)
    {
        console.log(info.questPoints.bp + "/" + info.quest.battle_bp);
        useSeeds(info.quest.battle_bp - info.questPoints.bp);
    }else{
        joinRaid();
    }
}

function joinRaid(){
    if (debug){
        console.log(info.quest);
    }
    //Set the party and summon and join the raid
    SetPartyAndSummon().then(function(){
        if (debug){
            console.log(info.quest.a_battle_id,info.summon_id,info.party_id,info.quest.quest_type);
        }else{
            kh.createInstance("apiABattles").joinBattle(info.quest.a_battle_id,info.summon_id,info.party_id,info.quest.quest_type).then(function(e) {
                state = e.body;
                raidStage();
            }.bind(this));
        }
    }.bind(this));
}

//Resolves unfinished raids.
function raidInProgress(){
    if (!rejoinRaid){
        checkPriorityList();
        return;
    }
    kh.createInstance("apiABattles").getRaidRequestList().then(function(e) {
        info.quest = e.body.data.filter(function ( obj ) {
            return obj.is_joined || obj.is_own_raid;
        })[0];
        if (info.quest !== undefined && has(info.quest,"a_battle_id")){
            raidStage();
        } else {
            //Check if it's a union raid
            checkForUnionRaid();
        }
    }.bind(this));
}

function checkForUnionRaid(){
    kh.createInstance("apiABanners").getMypageBanners().then(function(e) {
        info.banners = e.body;
        var unionEvent = info.banners.data.filter(function (obj) {
            return obj.event_type === "union_raid_event";
        })[0];
        if (has(unionEvent)){
            //Check Ultimate
            kh.createInstance("apiABattles").getUnionRaidRequestList(unionEvent.event_id, "Ultimate").then(function(e) {
                info.quest = e.body.data.filter(function(obj){
                    return obj.is_joined;
                })[0];
                if (info.quest !== undefined && has(info.quest,"a_battle_id")){
                    if (rejoinRaid){
                        raidStage();
                    }else{
                        checkPriorityList();
                    }
                }else{
                    kh.createInstance("apiABattles").getUnionRaidRequestList(unionEvent.event_id, "Expert").then(function(e) {
                        info.quest = e.body.data.filter(function(obj){
                            return obj.is_joined;
                        })[0];
                        if (info.quest !== undefined && has(info.quest,"a_battle_id")){
                            if (rejoinRaid){
                                raidStage();
                            }else{
                                checkPriorityList();
                            }
                        }else{
                            console.log("Failed to find open raid!");
                        }
                    });
                }
            });
        } else {
            console.log("Failed to find open raid! It's not a union raid!");
        }
    });
}

//Route to raid battle
function raidStage(){
    if (has(state,"cannot_progress_info")){
        console.log("Cannot join raid, error: " + state.cannot_progress_info.type);
    } else {
        kh.createInstance("router").navigate("battle", info.quest);
    }
}

//Navigates to the next stages to receive items
function nextStage(){
    if (state.next_info.next_kind == "talk" ||  state.next_info.next_kind == "harem-story") {
        kh.createInstance("apiAQuests").getNextState(state.a_quest_id,info.quest.type).then(function(e) {
            state = e.body;
            nextStage();
        }.bind(this));
    } else if (state.next_info.next_kind == "battle"){
        goToBattle();
    } else if (state.next_info.next_kind == "battle_result"){
        kh.createInstance("apiABattles").getBattleResult(state.next_info.id,info.quest.type).then(function(e) {
            info.battleResult = e.body;
            showBattleResult();
        }.bind(this));
    }
}

//Route to quest battle
function goToBattle(){
    kh.createInstance("questStateManager").restartQuest(state.a_quest_id, info.quest.type);
}

//Logs the results of the last battle and jumps to the beginning of the script
function showBattleResult(){
    for (var i=0; i<info.battleResult.items_gained.length; i++){
        console.log('Gained ' + info.battleResult.items_gained[i].amount + ' item: ' + info.battleResult.items_gained[i].name);
    }
    setTimeout(waitBeforeStart,1000*timeoutMulti);
}

//Checks if an object has a certain property. Very useful for elements that get pulled from the api.
function has(obj) {
    var prop;
    if (obj !== Object(obj)) {
        return false;
    }
    for (var i = 1; i < arguments.length; i++) {
        prop = arguments[i];
        if ((prop in obj) && obj[prop] !== null && obj[prop] !== 'undefined') {
            obj = obj[prop];
        } else {
            return false;
        }
    }
    return true;
}

//Returns an element with a certain value of an array
function getPropertyByValue(obj, value){
    return Object.keys(obj).filter(function(key) {
        return obj[key] === value
    })[0];
}

//Refresh page, only used in the start method anymore for skipping scenes.
function refreshPage(){
    location.href=href;
}

console.log("Starting autoquest...");
setTimeout(waitBeforeStart,5000*timeoutMulti);