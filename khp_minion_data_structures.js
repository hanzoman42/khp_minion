function Pull_Statistics(new_time_pull = Date.now(),new_weap_n = 0,new_weap_r = 0,new_weap_enh_r = 0,new_weap_enh_sr = 0,new_eido_n = 0,new_eido_r = 0,new_eido_enh_r = 0,new_eido_enh_sr = 0,new_helix = 0,new_eseed = 0,new_item = 0) {
	this.time_pull = new_time_pull;
	this.weap_n = new_weap_n;
	this.weap_r = new_weap_r;
	this.weap_enh_r = new_weap_enh_r;
	this.weap_enh_sr = new_weap_enh_sr;
	this.eido_n = new_eido_n;
	this.eido_r = new_eido_r;
	this.eido_enh_r = new_eido_enh_r;
	this.eido_enh_sr = new_eido_enh_sr;
	this.helix = new_helix;
	this.eseed = new_eseed;
	this.item = new_item;
	this.count = function() {
		return this.weap_n + this.weap_r + this.weap_enh_r + this.weap_enh_sr + this.eido_n + this.eido_r + this.eido_enh_r + this.eido_enh_sr + this.helix + this.eseed + this.item;
	};
	this.weap_r_rate = function() {
		if (this.count() == 0) {
			return 0;
		}
		else {
			return this.weap_r / this.count();
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
		return new Date(this.time_pull).getHours();
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
		output_str += "R weapons: " + this.weap_r + " (" + (this.weap_r_rate() * 100).toFixed(2) + "%)";
		output_str += " | ";
		output_str += "Half elixir: " + this.helix + " (" + (this.helix_rate() * 100).toFixed(2) + "%)";
		output_str += " | ";
		output_str += "Seed: " + this.eseed + " (" + (this.eseed_rate() * 100).toFixed(2) + "%)";
		return output_str;
	};
	this.toJSONObj = function() {
		var pull_stats = {
			time_pull : this.time_pull,
			weap_n : this.weap_n,
			weap_r : this.weap_r,
			weap_enh_r : this.weap_enh_r,
			weap_enh_sr : this.weap_enh_sr,
			eido_n : this.eido_n,
			eido_r : this.eido_r,
			eido_enh_r : this.eido_enh_r,
			eido_enh_sr : this.eido_enh_sr,
			helix : this.helix,
			eseed : this.eseed,
			item : this.item
		}
		return pull_stats;
	}
	this.set_pull_time = function() {
		this.pull_time = Date.now();
	};
	this.reset_values = function() {
		this.time_pull = Date.now();
		this.weap_n = 0;
		this.weap_r = 0;
		this.weap_enh_r = 0;
		this.weap_enh_sr = 0;
		this.eido_n = 0;
		this.eido_r = 0;
		this.eido_enh_r = 0;
		this.eido_enh_sr = 0;
		this.helix = 0;
		this.eseed = 0;
		this.item = 0;
	}
	// for testing purposes only
	this.generate_pull = function () {
		var pull_type_array = ['weap_n','weap_r','weap_enh_r','weap_enh_sr','eido_n','eido_r','eido_enh_r','eido_enh_sr','helix','eseed','item'];
		var pull_count;
		this.reset_values();
		for (pull_count = 0; pull_count < 10; pull_count++) {
			current_pull[pull_type_array[Math.floor(Math.random() * pull_type_array.length)]] += 1;	
		}
	}
};

function Pull_Session() {
	this.time_start = Date.now();
	this.pull_stats = new Pull_Statistics();
	this.update_statistics = function(new_pull_stats) {
		this.pull_stats.time_pull = new_pull_stats.time_pull;
		this.pull_stats.weap_n += new_pull_stats.weap_n;
		this.pull_stats.weap_r += new_pull_stats.weap_r;
		this.pull_stats.weap_enh_r += new_pull_stats.weap_enh_r;
		this.pull_stats.weap_enh_sr += new_pull_stats.weap_enh_sr;
		this.pull_stats.eido_n += new_pull_stats.eido_n;
		this.pull_stats.eido_r += new_pull_stats.eido_r;
		this.pull_stats.eido_enh_r += new_pull_stats.eido_enh_r;
		this.pull_stats.eido_enh_sr += new_pull_stats.eido_enh_sr;
		this.pull_stats.helix += new_pull_stats.helix;
		this.pull_stats.eseed += new_pull_stats.eseed;
		this.pull_stats.item += new_pull_stats.item;
	};
	this.get_session_time = function() {
		return (this.pull_stats.time_pull - this.time_start)/1000;
	};
	this.set_session_start_time = function() {
		this.time_start = Date.now();
	};
	this.reset_values = function() {
		this.pull_stats.reset_values();
	};
};

function Pull_Database() {
	this.pull_stats_array = {};
	this.populate_db = function(JSON_str) {
		var import_array = JSON.parse(JSON_str);
		var key;
		for (key in import_array) {
			this.push(new Pull_Statistics(import_array[key].time_pull,import_array[key].weap_n,import_array[key].weap_r,import_array[key].weap_enh_r,import_array[key].weap_enh_sr,import_array[key].eido_n,import_array[key].eido_r,import_array[key].eido_enh_r,import_array[key].eido_enh_sr,import_array[key].helix,import_array[key].eseed,import_array[key].item));
		}
	};
	this.export_db = function() {
		var export_array = {};
		var key;
		for (key in this.pull_stats_array) {
			export_array[key] = this.pull_stats_array[key].toJSONObj();
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
			var new_time = new Date(new_pull_stats.time_pull);
			this.pull_stats_array[new_time_index].time_pull = new Date(new_time.getFullYear(),new_time.getMonth(),new_time.getDate(),new Date(new_pull_stats.time_pull).getHours(),new Date(new_pull_stats.time_pull).getMinutes(),0,0);
			this.pull_stats_array[new_time_index].weap_n = new_pull_stats.weap_n;
			this.pull_stats_array[new_time_index].weap_r = new_pull_stats.weap_r;
			this.pull_stats_array[new_time_index].weap_enh_r = new_pull_stats.weap_enh_r;
			this.pull_stats_array[new_time_index].weap_enh_sr = new_pull_stats.weap_enh_sr;
			this.pull_stats_array[new_time_index].eido_n = new_pull_stats.eido_n;
			this.pull_stats_array[new_time_index].eido_r = new_pull_stats.eido_r;
			this.pull_stats_array[new_time_index].eido_enh_r = new_pull_stats.eido_enh_r;
			this.pull_stats_array[new_time_index].eido_enh_sr = new_pull_stats.eido_enh_sr;
			this.pull_stats_array[new_time_index].helix = new_pull_stats.helix;
			this.pull_stats_array[new_time_index].eseed = new_pull_stats.eseed;
			this.pull_stats_array[new_time_index].item = new_pull_stats.item;
		}
		else {
			this.pull_stats_array[new_time_index].time_pull = new_pull_stats.time_pull;
			this.pull_stats_array[new_time_index].weap_n += new_pull_stats.weap_n;
			this.pull_stats_array[new_time_index].weap_r += new_pull_stats.weap_r;
			this.pull_stats_array[new_time_index].weap_enh_r += new_pull_stats.weap_enh_r;
			this.pull_stats_array[new_time_index].weap_enh_sr += new_pull_stats.weap_enh_sr;
			this.pull_stats_array[new_time_index].eido_n += new_pull_stats.eido_n;
			this.pull_stats_array[new_time_index].eido_r += new_pull_stats.eido_r;
			this.pull_stats_array[new_time_index].eido_enh_r += new_pull_stats.eido_enh_r;
			this.pull_stats_array[new_time_index].eido_enh_sr += new_pull_stats.eido_enh_sr;
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
};