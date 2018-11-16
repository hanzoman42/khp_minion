// ==UserScript==
// @name         	khp_navi_test
// @namespace    	https://github.com/hanzoman42/khp_minion
// @version      	2018.10.30.002
// @description  	navigation test
// @author       	You
// @require			https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @updateURL    	https://github.com/hanzoman42/khp_minion/khp_navi_test.user.js
// @include      	https://cf.r.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/mypage_quest_party_guild_enh_evo_gacha_present_shop_epi_acce_detail/app.html*
// @include      	https://cf.g.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/mypage_quest_party_guild_enh_evo_gacha_present_shop_epi_acce_detail/app.html*
// @include      	https://cf.r.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/list/app.html*
// @include      	https://cf.g.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/list/app.html*
// @include		 	https://www.nutaku.net/games/kamihime-r/play/
// @run-at       	document-end
// ==/UserScript==

function app_loaded() {
    try {
        var has_prop_director = cc.hasOwnProperty('director');
        var has_prop_runningScene = cc.hasOwnProperty('_runningScene');
        var has_prop_seekWidgetByName = cc.hasOwnProperty('_seekWidgetByName');
        var has_prop_createInstance = kh.hasOwnProperty('createInstance');
        console.log("director: " + has_prop_director);
        console.log("runningScene: " + has_prop_runningScene);
        console.log("seekWidgetByName: " + has_prop_seekWidgetByName);
        console.log("createInstance: " + has_prop_createInstance);
        if (has_prop_director) {
            console.log(cc);
        }
        return(has_prop_director && has_prop_runningScene && has_prop_seekWidgetByName && has_prop_createInstance);
    }
    catch (err) {
        return false;
    }
}

function start() {
    console.log("App is loaded: " + app_loaded());
    setTimeout(start,30000);
}

start();