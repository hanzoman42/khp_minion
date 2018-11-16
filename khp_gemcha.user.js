// ==UserScript==
// @name         khp_gemcha
// @namespace    https://github.com/hanzoman42/khp_minion
// @version      2018.10.30.002
// @description  auto gemcha
// @author       You
// @updateURL    https://github.com/hanzoman42/khp_minion/khp_gemcha.user.js
// @include      https://cf.r.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/mypage_quest_party_guild_enh_evo_gacha_present_shop_epi_acce_detail/app.html*
// @include      https://cf.g.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/mypage_quest_party_guild_enh_evo_gacha_present_shop_epi_acce_detail/app.html*
// @include      https://cf.r.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/list/app.html*
// @include      https://cf.g.kamihimeproject.dmmgames.com/front/cocos2d-proj/components-pc/list/app.html*
// @include		 https://www.nutaku.net/games/kamihime-r/play/
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==


//to use script without errors deactivate auto start script, activate this script and go to weapon inventory
//look into console for progress -  F12, console

var gemcha_session = new Pull_Session;
var gemcha_db = new Pull_Database;

var msg_pkt = {
    msg_type : "",
    payload : undefined
}

var sell_R_Eidolons = false;
var sell_SR_Eidolons = false;
var sell_R_enchantment_weapons = false;

var firstBatch;

var list_enh_R_weap = ["Cherub Rapier","Cherub Knife","Cherub Spear","Cherub Axe","Cherub Baton","Cherub Hammer","Cherub Gun","Cherub Bow","Cherub Wing"];

var main_frame_width = 300;
var content_width = main_frame_width - 10;
var top_content_frame_height = 180;
var bottom_content_frame_height = 100;
var scroll_bar_width = 30;

var close_button_height = 30;

var stats_hour_container_width = content_width - scroll_bar_width - 8;
var stats_hour_label_width = 50;
var stats_hour_stat_label_width = 50;
var stats_hour_rate_value_width = 60;
var stats_hour_max_bar_width = stats_hour_container_width - stats_hour_label_width - stats_hour_stat_label_width - stats_hour_rate_value_width;

// define data structures
function Pull_Statistics(new_time_pull = Date.now(),new_weap_n = 0,new_weap_sl = 0,new_weap_enh = 0,new_eido = 0,new_helix = 0,new_eseed = 0,new_item = 0) {
	this.time_pull = new_time_pull;
	this.weap_n = new_weap_n;
	this.weap_sl = new_weap_sl;
	this.weap_enh = new_weap_enh;
    this.eido = new_eido;
    this.helix = new_helix;
    this.eseed = new_eseed;
    this.item = new_item;
    this.count = function() {
        return this.weap_n + this.weap_sl + this.weap_enh + this.eido + this.helix + this.eseed + this.item;
    };
    this.weap_sl_rate = function() {
        if (this.count() == 0) {
            return 0;
        }
        else {
            return this.weap_sl / this.count();
        }
    };
    this.helix_rate = function() {
        if (this.count() == 0) {
            return 0;
        }
        else {
            return this.helix / this.count();
        }
    };
    this.eseed_rate = function() {
        if (this.count() == 0) {
            return 0;
        }
        else {
            return this.eseed / this.count();
        }
    };
    this.get_pull_time_index = function() {
        return new Date(this.time_pull).getHours().toString().padStart(2, 0) + new Date(this.time_pull).getMinutes().toString().padStart(2, 0);
    };
    this.get_pull_hour = function() {
        return new Date(this.time_pull).getHours().toString();
    };
    this.get_pull_minute = function() {
		return new Date(this.time_pull).getMinutes();
	}
    this.get_status = function() {
        var output_str = "";
        output_str += "Pull time: " + new Date(this.time_pull).toLocaleTimeString();
        output_str += " | ";
        output_str += "Pulls: " + this.count();
        output_str += " | ";
        output_str += "R weapons: " + this.weap_sl + " (" + (this.weap_sl_rate() * 100).toFixed(2) + "%)";
        output_str += " | ";
        output_str += "Half elixir: " + this.helix + " (" + (this.helix_rate() * 100).toFixed(2) + "%)";
        output_str += " | ";
        output_str += "Seed: " + this.eseed + " (" + (this.eseed_rate() * 100).toFixed(2) + "%)";
        return output_str;
    };
    this.get_JSON_obj = function() {
        var pull_stats = {
            time_pull : this.time_pull,
            weap_n : this.weap_n,
            weap_sl : this.weap_sl,
            weap_enh : this.weap_enh,
            eido : this.eido,
            helix : this.helix,
            eseed : this.eseed,
            item : this.item
        }
        return pull_stats;
    };
    this.get_JSON_str = function() {
        return JSON.stringify(this.get_JSON_obj());
    }
    this.set_pull_time = function() {
        this.pull_time = Date.now();
    };
    this.reset_values = function() {
        this.time_pull = Date.now();
        this.weap_n = 0;
        this.weap_sl = 0;
        this.weap_enh = 0;
        this.eido = 0;
        this.helix = 0;
        this.eseed = 0;
        this.item = 0;
    }
}

function Pull_Session() {
    this.time_start = Date.now();
    this.pull_stats = new Pull_Statistics();
    this.update_statistics = function(new_pull_stats) {
        this.pull_stats.time_pull = new_pull_stats.time_pull;
        this.pull_stats.weap_n += new_pull_stats.weap_n;
        this.pull_stats.weap_sl += new_pull_stats.weap_sl;
        this.pull_stats.weap_enh += new_pull_stats.weap_enh;
        this.pull_stats.eido += new_pull_stats.eido;
        this.pull_stats.helix += new_pull_stats.helix;
        this.pull_stats.eseed += new_pull_stats.eseed;
        this.pull_stats.item += new_pull_stats.item;
    };
    this.get_session_time = function() {
        return (this.pull_stats.time_pull - this.time_start)/1000;
    };
    this.get_status = function() {
        var output_str = "";
        output_str += "Start time: " + new Date(this.time_start).toLocaleTimeString();
        output_str += " | ";
        output_str += "Run time: " + Math.floor(this.get_session_time().toFixed(0) / 60) + " mins " + (this.get_session_time().toFixed(0) - (Math.floor(this.get_session_time().toFixed(0) / 60) * 60)) + " secs ";
        output_str += " | ";
        output_str += "Pulls: " + this.pull_stats.count();
        output_str += " | ";
        output_str += "R weapons: " + this.pull_stats.weap_sl + " (" + (this.pull_stats.weap_sl_rate() * 100).toFixed(2) + "%)";
        output_str += " | ";
        output_str += "Half elixir: " + this.pull_stats.helix + " (" + (this.pull_stats.helix_rate() * 100).toFixed(2) + "%)";
        output_str += " | ";
        output_str += "Seed: " + this.pull_stats.eseed + " (" + (this.pull_stats.eseed_rate() * 100).toFixed(2) + "%)";
        return output_str;
    };
    this.set_session_start_time = function() {
        this.time_start = Date.now();
    };
    this.reset_values = function() {
        this.pull_stats.reset_values();
    };
}

function Pull_Database() {
    this.pull_stats_array = {};
    this.populate_db = function(JSON_str) {
        var import_array = JSON.parse(JSON_str);
        var key;
        for (key in import_array) {
            var new_pull_stats = new Pull_Statistics(import_array[key].time_pull,import_array[key].weap_n,import_array[key].weap_sl,import_array[key].weap_enh,import_array[key].eido,import_array[key].helix,import_array[key].eseed,import_array[key].item);
            //new_pull_stats.time_pull = import_array[key].time_pull;
            //new_pull_stats.weap_n = import_array[key].weap_n;
            //new_pull_stats.weap_sl = import_array[key].weap_sl;
            //new_pull_stats.weap_enh = import_array[key].weap_enh;
            //new_pull_stats.eido = import_array[key].eido;
            //new_pull_stats.helix = import_array[key].helix;
            //new_pull_stats.eseed = import_array[key].eseed;
            //new_pull_stats.item = import_array[key].item;
            this.push(new_pull_stats);
        }
    };
    this.export_db = function() {
        var export_array = {};
        var key;
        for (key in this.pull_stats_array) {
            export_array[key] = this.pull_stats_array[key].get_JSON_obj();
        }
        return JSON.stringify(export_array);
    };
    this.is_empty = function() {
        return (this.pull_stats_array.length == 0);
    };
    this.entry_exists = function(new_time_index) {
        return this.pull_stats_array.hasOwnProperty(new_time_index);
    };
    // function to push in new pull stats
    this.push = function(new_pull_stats) {
        var new_time_index = new_pull_stats.get_pull_time_index();
        if (!this.entry_exists(new_time_index)) {
            this.pull_stats_array[new_time_index] = new Pull_Statistics;
            this.pull_stats_array[new_time_index].time_pull = new_pull_stats.time_pull;
            this.pull_stats_array[new_time_index].weap_n = new_pull_stats.weap_n;
            this.pull_stats_array[new_time_index].weap_sl = new_pull_stats.weap_sl;
            this.pull_stats_array[new_time_index].weap_enh = new_pull_stats.weap_enh;
            this.pull_stats_array[new_time_index].eido = new_pull_stats.eido;
            this.pull_stats_array[new_time_index].helix = new_pull_stats.helix;
            this.pull_stats_array[new_time_index].eseed = new_pull_stats.eseed;
            this.pull_stats_array[new_time_index].item = new_pull_stats.item;
        }
        else {
            this.pull_stats_array[new_time_index].time_pull = new_pull_stats.time_pull;
            this.pull_stats_array[new_time_index].weap_n += new_pull_stats.weap_n;
            this.pull_stats_array[new_time_index].weap_sl += new_pull_stats.weap_sl;
            this.pull_stats_array[new_time_index].weap_enh += new_pull_stats.weap_enh;
            this.pull_stats_array[new_time_index].eido += new_pull_stats.eido;
            this.pull_stats_array[new_time_index].helix += new_pull_stats.helix;
            this.pull_stats_array[new_time_index].eseed += new_pull_stats.eseed;
            this.pull_stats_array[new_time_index].item += new_pull_stats.item;
        }
    }
    this.query_db = function() {
        var query_count_array = [];
        var query_array = [];
        for (var timeslice_ptr = 0; timeslice_ptr < 1440; timeslice_ptr++) {
            query_count_array[timeslice_ptr] = [0,0,0,0];
            query_array[timeslice_ptr] = [0,0,0];
        }
        for (var key in this.pull_stats_array) {
            var time_index = (Math.floor(key / 100)) * 60 + (key % 60);
            query_count_array[time_index][0] += this.pull_stats_array[key].weap_sl;
            query_count_array[time_index][1] += this.pull_stats_array[key].helix;
            query_count_array[time_index][2] += this.pull_stats_array[key].eseed;
            query_count_array[time_index][3] += this.pull_stats_array[key].count();
        }
        for (timeslice_ptr = 0; timeslice_ptr < 1440; timeslice_ptr++) {
            if (query_count_array[timeslice_ptr][3] == 0) {
                query_array[timeslice_ptr] = [0,0,0];
            }
            else {
                query_array[timeslice_ptr] = [query_count_array[timeslice_ptr][0]/query_count_array[timeslice_ptr][3],query_count_array[timeslice_ptr][1]/query_count_array[timeslice_ptr][3],query_count_array[timeslice_ptr][2]/query_count_array[timeslice_ptr][3]];
            }
        }
        return query_array;
    }
}

var style_string = {
    complete_str : "",
    append : function(new_style_type,new_style_value) {
        if (this.complete_str != "") { this.complete_str += " "; }
        this.complete_str += new_style_type + ":" + new_style_value + ";";
    },
    clear : function() {
        this.complete_str = "";
    }
};

var status_stats_close_button_height = 47;
var status_stats_tab_height = 47;

var stats_timeslice_container_width = content_width - scroll_bar_width - 8;
var stats_timeslice_label_width = 50;
var stats_timeslice_rate_value_width = 40;
var stats_timeslice_max_bar_width = stats_timeslice_container_width - stats_timeslice_label_width - stats_timeslice_rate_value_width;

function draw_statistics() {
    var stat_id_str = ['weap_sl','helix','eseed'];
    var stat_label_str = ['R Weap','H Elix','E Seed'];
    var stat_colors = ['SlateBlue','Crimson','YellowGreen'];

    var new_element = document.createElement("div");
    new_element.id = "status_statistics_canvas";
    style_string.clear();
    style_string.append("display","none");
    style_string.append("position","absolute");
    style_string.append("top",top_content_frame_height + 5 + "px");
    style_string.append("left","0px");
    style_string.append("right","0px");
    style_string.append("bottom",bottom_content_frame_height + "px");
    style_string.append("background-color","LightSlateGrey");
    new_element.style = style_string.complete_str;
    document.getElementById("status_frame").appendChild(new_element);

    new_element = document.createElement("div");
    new_element.id = "status_statistics_tabs_container";
    style_string.clear();
    style_string.append("position","absolute");
    style_string.append("height", status_stats_tab_height + "px");
    style_string.append("top", "0px");
    style_string.append("left","0px");
    style_string.append("right","0px");
    new_element.style = style_string.complete_str;
    document.getElementById("status_statistics_canvas").appendChild(new_element);

    for (var stat_ptr = 0; stat_ptr < 3; stat_ptr++) {
        new_element = document.createElement("button");
        new_element.id = "status_statistics_" + stat_id_str[stat_ptr] + "_button";
        style_string.clear();
        style_string.append("width","90px");
        style_string.append("position","absolute");
        style_string.append("bottom","0px");
        style_string.append("left",(stat_ptr * 90) + "px");
        style_string.append("right",((stat_ptr * 90) + 90) + "px");
        style_string.append("border-style","solid");
        style_string.append("border-color","White");
        style_string.append("border-width","3px");
        style_string.append("border-radius","9px 9px 0px 0px");
        style_string.append("color","White");
        style_string.append("font-family","Arial");
        style_string.append("font-size","10px");
        style_string.append("background-color",stat_colors[stat_ptr]);
        style_string.append("color","White");
        style_string.append("font-family","Arial");
        style_string.append("font-size","18px");
        style_string.append("padding","5px");
        new_element.style = style_string.complete_str;
        new_element.innerHTML = stat_label_str[stat_ptr];
        document.getElementById("status_statistics_tabs_container").appendChild(new_element);
    }

    document.getElementById("status_statistics_weap_sl_button").onclick = function() {
        document.getElementById("status_stats_weap_sl_timeslice_container").style.display = "block";
        document.getElementById("status_stats_helix_timeslice_container").style.display = "none";
        document.getElementById("status_stats_eseed_timeslice_container").style.display = "none";
    }

    document.getElementById("status_statistics_helix_button").onclick = function () {
        document.getElementById("status_stats_weap_sl_timeslice_container").style.display = "none";
        document.getElementById("status_stats_helix_timeslice_container").style.display = "block";
        document.getElementById("status_stats_eseed_timeslice_container").style.display = "none";
    }

    document.getElementById("status_statistics_eseed_button").onclick = function() {
        document.getElementById("status_stats_weap_sl_timeslice_container").style.display = "none";
        document.getElementById("status_stats_helix_timeslice_container").style.display = "none";
        document.getElementById("status_stats_eseed_timeslice_container").style.display = "block";
    }

    new_element = document.createElement("div");
    new_element.id = "status_statistics_content_container";
    style_string.clear();
    style_string.append("position","absolute");
    style_string.append("top", status_stats_tab_height + "px");
    style_string.append("left","0px");
    style_string.append("right","0px");
    style_string.append("bottom", status_stats_close_button_height + "px");
    style_string.append("overflow-y","auto");
    new_element.style = style_string.complete_str;
    document.getElementById("status_statistics_canvas").appendChild(new_element);

    for (stat_ptr = 0; stat_ptr < 3; stat_ptr++) {
        new_element = document.createElement("div");
        new_element.id = "status_stats_" + stat_id_str[stat_ptr] + "_timeslice_container";
        style_string.clear();
        if (stat_ptr == 0) {
            style_string.append("display","block");
        }
        else {
            style_string.append("display","none");
        }
        style_string.append("position","absolute");
        style_string.append("top","0px");
        style_string.append("left","0px");
        style_string.append("right","0px");
        style_string.append("margin","0px auto 0px auto");
        new_element.style = style_string.complete_str;
        document.getElementById("status_statistics_content_container").appendChild(new_element);
        // container for the time slice
        new_element = document.createElement("div");
        new_element.id = "status_stats_" + stat_id_str[stat_ptr] + "_timeslice_grid";
        style_string.clear();
        style_string.append("display","grid");
        style_string.append("grid-template-columns",stats_timeslice_label_width + "px " + stats_timeslice_max_bar_width + "px " + stats_timeslice_rate_value_width + "px");
        style_string.append("grid-row-gap","5px");
        style_string.append("position","absolute");
        style_string.append("top","0px");
        style_string.append("left","0px");
        style_string.append("right","0px");
        style_string.append("margin","0px auto 0px auto");
        style_string.append("padding","5px");
        style_string.append("border-radius","0px 7px 7px 7px");
        style_string.append("font-weight","bold");
        style_string.append("font-family","Arial");
        style_string.append("font-size","12px");
        style_string.append("color","Black");
        style_string.append("background-color","White");
        new_element.style = style_string.complete_str;
        document.getElementById("status_stats_" + stat_id_str[stat_ptr] + "_timeslice_container").appendChild(new_element);

        for (var timeslice_ptr = 0; timeslice_ptr < 1440; timeslice_ptr++) {
            // label for the hour
            new_element = document.createElement("div");
            new_element.id = "status_stats_" + stat_id_str[stat_ptr] + "_ts" + timeslice_ptr + "_label";
            style_string.clear();
            style_string.append("padding","2px");
            new_element.style = style_string.complete_str;
            new_element.innerHTML = Math.floor(timeslice_ptr / 60).toString().padStart(2, 0) + (timeslice_ptr % 60).toString().padStart(2,0);
            document.getElementById("status_stats_" + stat_id_str[stat_ptr] + "_timeslice_grid").appendChild(new_element);
            // stats
            new_element = document.createElement("div");
            new_element.id = "status_stats_" + stat_id_str[stat_ptr] + "_ts" + timeslice_ptr + "_bar";
            style_string.clear();
            style_string.append("justify-self","end");
            style_string.append("width","5px");
            style_string.append("border-radius","3px");
            style_string.append("line-height","20px");
            style_string.append("background-color",stat_colors[stat_ptr]);
            new_element.style = style_string.complete_str;
            document.getElementById("status_stats_" + stat_id_str[stat_ptr] + "_timeslice_grid").appendChild(new_element);
            // rate value
            new_element = document.createElement("div");
            new_element.id = "status_stats_" + stat_id_str[stat_ptr] + "_ts" + timeslice_ptr + "_value";
            style_string.clear();
            style_string.append("justify-self","center");
            style_string.append("padding","2px");
            new_element.style = style_string.complete_str;
            new_element.innerHTML = "0%";
            document.getElementById("status_stats_" + stat_id_str[stat_ptr] + "_timeslice_grid").appendChild(new_element);
        }
    }

    new_element = document.createElement("div");
    new_element.id = "status_statistics_buttons_container";
    style_string.clear();
    style_string.append("position","absolute");
    style_string.append("height", status_stats_close_button_height + "px");
    style_string.append("left","3px");
    style_string.append("right","3px");
    style_string.append("bottom", "0px");
    new_element.style = style_string.complete_str;
    document.getElementById("status_statistics_canvas").appendChild(new_element);

    new_element = document.createElement("button");
    new_element.id = "status_statistics_close_button";
    style_string.clear();
    style_string.append("width",content_width);
    style_string.append("position","absolute");
    style_string.append("bottom","0px");
    style_string.append("border-style","solid");
    style_string.append("border-color","White");
    style_string.append("border-width","3px");
    style_string.append("border-radius","7px");
    style_string.append("color","White");
    style_string.append("font-family","Arial");
    style_string.append("font-size","18px");
    style_string.append("background-color","Maroon");
    style_string.append("color","White");
    style_string.append("font-family","Arial");
    style_string.append("font-size","18px");
    style_string.append("padding","5px");
    style_string.append("margin","5px 0px 5px 0px");
    new_element.style = style_string.complete_str;
    new_element.onclick = function() {
        document.getElementById("status_statistics_canvas").style.display = "none";
    }
    new_element.innerHTML = "Close Statistics";
    document.getElementById("status_statistics_canvas").appendChild(new_element);
}

function update_statistics() {
    var query_result = gemcha_db.query_db();
    var max_rates = [0,0,0];
    var stat_id_str = ['weap_sl','helix','eseed'];
    var stat_label_str = ['R Weap','H Elix','E Seed'];

    for (var timeslice_ptr = 0; timeslice_ptr < 1440; timeslice_ptr++) {
        for (var stat_ptr = 0; stat_ptr < 3; stat_ptr++) {
            if(query_result[timeslice_ptr][stat_ptr] > max_rates[stat_ptr]) {
                max_rates[stat_ptr] = query_result[timeslice_ptr][stat_ptr];
            }
        }
    }

    for (stat_ptr = 0; stat_ptr < 3; stat_ptr++) {
        for (timeslice_ptr = 0; timeslice_ptr < 1440; timeslice_ptr++) {
        // stat bar
            var stat_bar_width;
            if (query_result[timeslice_ptr][stat_ptr] == 0) {
                document.getElementById("status_stats_" + stat_id_str[stat_ptr] + "_ts" + timeslice_ptr + "_label").style.display = "none";
                document.getElementById("status_stats_" + stat_id_str[stat_ptr] + "_ts" + timeslice_ptr + "_bar").style.width = "5px";
                document.getElementById("status_stats_" + stat_id_str[stat_ptr] + "_ts" + timeslice_ptr + "_bar").style.display = "none";
                document.getElementById("status_stats_" + stat_id_str[stat_ptr] + "_ts" + timeslice_ptr + "_value").innerHTML = "0.00%";
                document.getElementById("status_stats_" + stat_id_str[stat_ptr] + "_ts" + timeslice_ptr + "_value").style.display = "none";
            }
            else {
                document.getElementById("status_stats_" + stat_id_str[stat_ptr] + "_ts" + timeslice_ptr + "_label").style.display = "block";
                document.getElementById("status_stats_" + stat_id_str[stat_ptr] + "_ts" + timeslice_ptr + "_bar").style.width = (Math.floor(query_result[timeslice_ptr][stat_ptr] / max_rates[stat_ptr] * (stats_timeslice_max_bar_width - 10)) + 5) + "px";
                document.getElementById("status_stats_" + stat_id_str[stat_ptr] + "_ts" + timeslice_ptr + "_bar").style.display = "block";
                document.getElementById("status_stats_" + stat_id_str[stat_ptr] + "_ts" + timeslice_ptr + "_value").innerHTML = (query_result[timeslice_ptr][stat_ptr] * 100).toFixed() + "%";
                document.getElementById("status_stats_" + stat_id_str[stat_ptr] + "_ts" + timeslice_ptr + "_value").style.display = "block";
            }
        }
    }
}

function draw_gemcha_session_table() {
    var table_font_size = "12px";
    var table_padding = "0px";
    var value_bg_color = "White";
    var row_count;
    var col_count;
    var row_id_str = ["start_time","run_time","pull_count","weap_sl","helix","eseed"];
    var content_str = [["Start Time","Run Time","Pulls","R Weapons","Half Elixir","Energy Seed"],["N/A","N/A","0","0","0","0"]];
    var col_id_str = ['label','value'];
    var col_style_str = [];

    style_string.clear();
    style_string.append("padding",table_padding);
    style_string.append("font-weight","bold");
    style_string.append("text-align","left");
    col_style_str[0] = style_string.complete_str;

    style_string.clear();
    style_string.append("border-radius","5px");
    style_string.append("padding",table_padding);
    style_string.append("background-color",value_bg_color);
    style_string.append("color","CornflowerBlue");
    style_string.append("font-weight","bold");
    style_string.append("text-align","center");
    col_style_str[1] = style_string.complete_str;

    var new_element = document.createElement("div");
    new_element.id = "gemcha_session_table";
    style_string.clear();
    style_string.append("display","grid");
    style_string.append("grid-template-columns",((main_frame_width - 20) / 2) + "px " + ((main_frame_width - 20) / 2) + "px");
    style_string.append("grid-row-gap","5px");
    style_string.append("position","absolute");
    style_string.append("top","0px");
    style_string.append("left","0px");
    style_string.append("right","0px");
    style_string.append("font-weight","bold");
    style_string.append("font-family","Arial");
    style_string.append("font-size",table_font_size);
    style_string.append("color","White");
    new_element.style = style_string.complete_str;
    document.getElementById("status_top_content_container").appendChild(new_element);

    for (row_count = 0; row_count < 6; row_count++) {
        for (col_count = 0; col_count < 2; col_count++) {
            // label for the hour
            new_element = document.createElement("div");
            new_element.id = "gemcha_session_table_" + row_id_str[row_count] + "_" + col_id_str[col_count];
            new_element.style = col_style_str[col_count];
            new_element.innerHTML = content_str[col_count][row_count];
            document.getElementById("gemcha_session_table").appendChild(new_element);
        }
    }
}

function create_status_log() {
    if (window.top === window.self) {
        var gemcha_db_JSON = GM_getValue("gemcha_db");
        if (gemcha_db != undefined) {
            gemcha_db.populate_db(GM_getValue("gemcha_db"));
        }

        var new_element = document.createElement("div");
        new_element.id = "status_container"
        style_string.clear();
        style_string.append("height","100%");
        style_string.append("width",main_frame_width + "px");
        style_string.append("position","fixed");
        style_string.append("top","0px");
        style_string.append("right","0px");
        style_string.append("padding","0px");
        style_string.append("background-color","LightSlateGrey");
        new_element.style = style_string.complete_str;
        document.body.appendChild(new_element);

        new_element = document.createElement("div");
        new_element.id = "status_frame"
        style_string.clear();
        style_string.append("height","100%");
        style_string.append("position","absolute");
        style_string.append("left","5px");
        style_string.append("right","5px");
        style_string.append("padding","0px");
        style_string.append("background-color","Gray");
        new_element.style = style_string.complete_str;
        document.getElementById("status_container").appendChild(new_element);

        new_element = document.createElement("div");
        new_element.id = "status_menu_bar";
        style_string.clear();
        style_string.append("height",bottom_content_frame_height + "px");
        style_string.append("position","absolute");
        style_string.append("left","0px");
        style_string.append("right","0px");
        style_string.append("bottom","0px");
        style_string.append("padding","0px");
        style_string.append("background-color","LightSlateGrey");
        new_element.style = style_string.complete_str;
        document.getElementById("status_frame").appendChild(new_element);

        new_element = document.createElement("button");
        new_element.id = "button_statistics";
        style_string.clear();
        style_string.append("border-style","solid");
        style_string.append("border-color","White");
        style_string.append("border-width","3px");
        style_string.append("border-radius","7px");
        style_string.append("background-color","DodgerBlue");
        style_string.append("color","White");
        style_string.append("font-family","Arial");
        style_string.append("font-size","18px");
        style_string.append("padding","5px");
        style_string.append("margin","5px 0px 5px 0px");
        new_element.style = style_string.complete_str;
        new_element.onclick = function() {
            document.getElementById("status_statistics_canvas").style.display = "block";
            update_statistics();
        }
        new_element.innerHTML = "Show Statistics";
        document.getElementById("status_menu_bar").appendChild(new_element);

        new_element = document.createElement("div");
        new_element.id = "status_top_content_frame";
        style_string.clear();
        style_string.append("height",top_content_frame_height + "px");
        style_string.append("position","absolute");
        style_string.append("left","0px");
        style_string.append("right","0px");
        style_string.append("top","5px");
        style_string.append("border-radius","7px");
        style_string.append("background-color","DodgerBlue");
        style_string.append("text-align","center");
        new_element.style = style_string.complete_str;
        document.getElementById("status_frame").appendChild(new_element);

        new_element = document.createElement("div");
        new_element.id = "status_top_content_label"
        style_string.clear();
        style_string.append("left","0px");
        style_string.append("right","0px");
        style_string.append("margin","5px 0px 5px 0px");
        style_string.append("font-weight","bold");
        style_string.append("font-family","Arial");
        style_string.append("font-size","14px");
        style_string.append("color","White");
        new_element.style = style_string.complete_str;
        new_element.innerHTML = "Session Statistics";
        document.getElementById("status_top_content_frame").appendChild(new_element);

        new_element = document.createElement("div");
        new_element.id = "status_top_content_container"
        style_string.clear();
        style_string.append("position","absolute");
        style_string.append("top","30px");
        style_string.append("left","5px");
        style_string.append("right","5px");
        new_element.style = style_string.complete_str;
        document.getElementById("status_top_content_frame").appendChild(new_element);

        draw_gemcha_session_table();

        new_element = document.createElement("div");
        new_element.id = "status_log_msg_frame";
        style_string.clear();
        style_string.append("width",content_width + "px");
        style_string.append("position","absolute");
        style_string.append("top",(top_content_frame_height + 5) + "px");
        style_string.append("bottom",bottom_content_frame_height + "px");
        style_string.append("overflow-y","auto");
        new_element.style = style_string.complete_str;
        document.getElementById("status_frame").appendChild(new_element);

        draw_statistics();
        window.addEventListener("message",process_message, false);
    }
}

function log_status_msg(inner_html_content) {
    var new_element = document.createElement("p");
    style_string.clear();
    style_string.append("border-style","solid");
    style_string.append("border-color","LightSlateGrey");
    style_string.append("border-width","1px");
    style_string.append("border-radius","3px");
    style_string.append("padding","5px");
    style_string.append("margin","1px");
    style_string.append("color","Black");
    style_string.append("font-family","Arial");
    style_string.append("font-size","10px");
    style_string.append("background-color","White");
    new_element.style = style_string.complete_str;
    new_element.innerHTML = inner_html_content;
    document.getElementById("status_log_msg_frame").appendChild(new_element);
}

function update_session_status(new_session) {
    document.getElementById("gemcha_session_table_start_time_value").innerHTML = new Date(new_session.time_start).toLocaleTimeString();
    document.getElementById("gemcha_session_table_run_time_value").innerHTML = Math.floor(new_session.get_session_time().toFixed(0) / 60) + "m " + (new_session.get_session_time().toFixed(0) - (Math.floor(new_session.get_session_time().toFixed(0) / 60) * 60)) + "s";
    document.getElementById("gemcha_session_table_pull_count_value").innerHTML = new_session.pull_stats.count();
    document.getElementById("gemcha_session_table_weap_sl_value").innerHTML = new_session.pull_stats.weap_sl + " (" + (new_session.pull_stats.weap_sl_rate() * 100).toFixed(2) + "%)";
    document.getElementById("gemcha_session_table_helix_value").innerHTML = new_session.pull_stats.helix + " (" + (new_session.pull_stats.helix_rate() * 100).toFixed(2) + "%)";;
    document.getElementById("gemcha_session_table_eseed_value").innerHTML = new_session.pull_stats.eseed + " (" + (new_session.pull_stats.eseed_rate() * 100).toFixed(2) + "%)";
}

function process_message(event) {
    // process data here - note: all messages will be received - need to filter out unwanted messages
    if (has(event.data,"msg_type")) {
        var payload = event.data.payload;
        var status_str;
        //console.log(event.data.msg_type)
        switch(event.data.msg_type) {
            case "gacha_pull_result" :
                var payload_obj = JSON.parse(payload);
                //console.log("Payload: " + payload_obj);
                var new_pull_stats = new Pull_Statistics(payload_obj.time_pull,payload_obj.weap_n,payload_obj.weap_sl,payload_obj.weap_enh,payload_obj.eido,payload_obj.helix,payload_obj.eseed,payload_obj.item);
                log_status_msg(new_pull_stats.get_status());
                gemcha_db.push(new_pull_stats);
                GM_setValue("gemcha_db",gemcha_db.export_db());
                gemcha_session.update_statistics(new_pull_stats);
                update_session_status(gemcha_session);
                break;
            case "status_update" :
                log_status_msg(payload);
                break;
        }
    }
}

function send_message(msg_type,payload){
    msg_pkt.msg_type = msg_type;
    msg_pkt.payload = payload;
    window.top.postMessage(msg_pkt,"*");
}

function update_status(status_str) {
    send_message("status_update",status_str);
}

function update_gacha_result(data) {
    send_message("gacha_pull_result",data);
}

function start(){
	if (has(cc, "director", "_runningScene", "_seekWidgetByName") && has(kh, "createInstance")){
		if (location.hash.startsWith("#!gacha/ga_004")){
            firstBatch = true;
			setTimeout(getGachaInfo,1000);
		} else if (location.hash.startsWith("#!/li_007")){
			setTimeout(saleWeapons,1000);
		} else {
            update_status("Go to weapon inventory from main page to start normal gacha sequence");
        }
	} else {
		update_status("Waiting for page load");
		setTimeout(start,2000);
	}
}

function getGachaInfo(){
    kh.createInstance("apiAGacha").getCategory("normal").then(function(e) {
        var normalGachaInfo = e.body;
        drawGacha(normalGachaInfo);
    }.bind(this));
}

function process_result(event){
    var i;
    var time_delay;
    var info = event.body;
    var gemcha_pull = new Pull_Statistics;
    //console.log(info.obtained_info);
    var pull_data = event.body.obtained_info;
    gemcha_pull.set_pull_time();
    //console.log(new Date(gemcha_pull.time_pull).getMinutes());
    for (i = 0; i < pull_data.length; i++) {
        if (has(pull_data[i],"weapon_info")) {
            if (pull_data[i].weapon_info.rare == "R" && !(list_enh_R_weap.includes(pull_data[i].weapon_info.name))) {
                //good pull
                gemcha_pull.weap_sl++;
            }
            else {
                if (pull_data[i].weapon_info.rare == "N") {
                    gemcha_pull.weap_n++;
                }
                else {
                    gemcha_pull.weap_enh++;
                }
            }
        }
        else {
            if (has(pull_data[i],"summon_info")) {
                gemcha_pull.eido++;
            }
            else {
            	if (pull_data[i].item_info.name == "Half Elixir") {
            		gemcha_pull.helix++;
            	}
            	else {
            		if (pull_data[i].item_info.name == "Energy Seed") {
            			gemcha_pull.eseed++;
            		}
            		else {
            			gemcha_pull.item++;
            		}
            	}
            }
        }
    }
    firstBatch = false;
    //set time delay if pull is bad
    if ((gemcha_pull.weap_sl == 0) && !(gemcha_pull.count() == 1)) {
        time_delay = 5;
        update_status("Zero skill leveling weapons pulled. Waiting for " + time_delay + " seconds...");
    }
    else {
        time_delay = 0;
    }
    update_gacha_result(gemcha_pull.get_JSON_str());
    setTimeout(getGachaInfo,1000*time_delay);
}

function drawGacha(normalGachaInfo){
//    console.log(normalGachaInfo);
    if (normalGachaInfo.is_max_weapon_or_summon) {
        if (firstBatch) {
            update_status("Inventory is full, clear it and start script again. Stop script");
            return;
        }
        console.log("Inventory is full, go to sell");
        kh.createInstance("router").navigate("list/li_007");
        return;
    }
    if (has(normalGachaInfo,"groups",1) && normalGachaInfo.groups[1].enabled){
        if (normalGachaInfo.groups[1].gacha_count !== 10) {
            if (firstBatch) {
                update_status("Inventory is near full limit, clear it and start script again. Stop script");
                return;
            }
            update_status("Less then 10 items in gacha, go to sell");
            kh.createInstance("router").navigate("list/li_007");
            return;
        }
        kh.createInstance("apiAGacha").playGacha("normal",normalGachaInfo.groups[1].gacha_id).then(process_result.bind(this));
        return;
    } else if (has(normalGachaInfo,"groups",0) && normalGachaInfo.groups[0].enabled){
        kh.createInstance("apiAGacha").playGacha("normal",normalGachaInfo.groups[0].gacha_id).then(process_result.bind(this));
        return;
    } else {
        if (firstBatch) {
            update_status("All normal gacha attempts were used, stop script");
            return;
        } else {
            update_status("All normal gacha attempts were used, go to last sell");
            kh.createInstance("router").navigate("list/li_007");
            return;
        }
    }
}

function saleWeapons() {
     kh.createInstance("apiAWeapons").getList(0,500).then(function(e) {var list = e.body;
                                                                       var sellList = [];
                                                                       var ids = [];
                                                                       list.data.forEach(function(item){
                                                                           {if ((item.rare === "N" || (item.rare === "R" && sell_R_enchantment_weapons && item.attack === 8)) && item.bonus === 0 && !item.is_equipped && !item.is_locked) {
                                                                               ids.push(item.a_weapon_id);
                                                                               sellList.push(item);
                                                                           }}
                                                                       });
                                                                       if (ids.length ===0) {console.log("No weapons to sell, go to eidolons");
                                                                                             saleEidolons();}
                                                                       else {
                                                                           console.log(sellList);
                                                                           kh.createInstance("apiAWeapons").sell(ids).then(function(e) {saleEidolons();}.bind(this));
                                                                       }}.bind(this));
}

function saleEidolons() {
    kh.createInstance("apiASummons").getList(0,500).then(function(e) {
        var list = e.body;
        var sellList = [];
        var ids = [];
        list.data.forEach(function(item){{
            if (item.can_sell && item.bonus === 0 && (item.rare === "N" || (sell_R_Eidolons && item.rare === "R" || (sell_SR_Eidolons && item.rare === "SR")))) {
                ids.push(item.a_summon_id);
                sellList.push(item);
            }
        }});
        if (ids.length ===0) {
            console.log("No eidolons to sell, go to gacha");
            kh.createInstance("router").navigate("gacha/ga_004");}
        else {
            //console.log(sellList);
            kh.createInstance("apiASummons").sell(ids).then(function(e) {
                kh.createInstance("router").navigate("gacha/ga_004");
            }.bind(this));
        }
    }.bind(this));
}

function has(obj) {
	var prop; // variable
    var i; // variable
	try {
        if (obj !== Object(obj)) { // what does this mean? obj is not of object type
            return false; // then obj does not exist
        }
        for (i = 1; i < arguments.length; i++) { // iterate through each argument passed in
            prop = arguments[i]; // assign arguement to prop variable
            if ((prop in obj) && obj[prop] !== null && obj[prop] !== 'undefined') { // if property is in object and property in object is not null nor undefined
                obj = obj[prop]; // obj = property in object i.e. if more than one argument, it iterates into the object
            } else {
                return false;
            }
        }
        return true;
    }
    catch(err) {
        return false;
    }
}

create_status_log();
start();