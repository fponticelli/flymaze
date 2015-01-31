(function (console) { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var DateTools = function() { };
DateTools.__name__ = ["DateTools"];
DateTools.delta = function(d,t) {
	var t1 = d.getTime() + t;
	var d1 = new Date();
	d1.setTime(t1);
	return d1;
};
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
EReg.__name__ = ["EReg"];
EReg.prototype = {
	r: null
	,match: function(s) {
		if(this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) return this.r.m[n]; else throw "EReg::matched";
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,__class__: EReg
};
var HxOverrides = function() { };
HxOverrides.__name__ = ["HxOverrides"];
HxOverrides.dateStr = function(date) {
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var mi = date.getMinutes();
	var s = date.getSeconds();
	return date.getFullYear() + "-" + (m < 10?"0" + m:"" + m) + "-" + (d < 10?"0" + d:"" + d) + " " + (h < 10?"0" + h:"" + h) + ":" + (mi < 10?"0" + mi:"" + mi) + ":" + (s < 10?"0" + s:"" + s);
};
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
HxOverrides.remove = function(a,obj) {
	var i = HxOverrides.indexOf(a,obj,0);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Main = function() { };
Main.__name__ = ["Main"];
Main.main = function() {
	Main.mini = minicanvas_MiniCanvas.create(fly_Config.width,fly_Config.height).display("flymaze");
	Main.mini.canvas.setAttribute("tabIndex","1");
	Main.instructions();
	Main.decorateBackground();
	Main.startScreen();
	Main.wireSockets();
};
Main.sendId = function(id,name) {
	Main.socket.emit("id:confirm",{ id : id, name : name});
};
Main.changeName = function(id,name) {
	Main.socket.emit("id:change",{ id : id, name : name});
};
Main.wireSockets = function() {
	Main.socket.on("request:id",function(_) {
		Main.id = fly_util_Cookie.read("fmid");
		if(null == Main.id) {
			Main.id = thx_core_UUID.create();
			Main.$name = fly_util_Persona.create();
			fly_util_Cookie.create("fmid",Main.id,1000);
			fly_util_Cookie.create("fmname",Main.$name,1000);
		} else Main.$name = fly_util_Cookie.read("fmname");
		Main.leaderboard(Main.$name);
		Main.sendId(Main.id,Main.$name);
	});
	Main.socket.on("leaderboard:top",function(data) {
		Main.updateLeaderboard(data);
	});
};
Main.sendScore = function($final) {
	if($final == null) $final = false;
	var event;
	event = "score:" + ($final?"end":"play");
	Main.socket.emit(event,{ id : Main.id, gameid : Main.gameid, score : Main.info.score, level : Main.info.level, time : (function($this) {
		var $r;
		var _this = new Date();
		$r = HxOverrides.dateStr(_this);
		return $r;
	}(this))});
};
Main.startScreen = function() {
	Main.background();
	Main.write("FlyMaze",48,fly_Config.width / 2,fly_Config.height / 2);
	Main.write("(press bar to start)",16,fly_Config.width / 2,fly_Config.height / 4 * 3);
	thx_core_Timer.delay(function() {
		Main.mini.onKeyUp(function(e) {
			if(e.keyCode != 32) return;
			Main.info = new fly_components_GameInfo(0,0,0,0,false);
			Main.mini.offKeyUp();
			Main.playLevel(Main.info);
		});
	},250);
};
Main.playLevel = function(info) {
	info.level++;
	var config = new fly_Config(info.level);
	info.timeLeft = config.timePerLevel;
	info.toPassLevel = config.flies;
	var game = new fly_Game(Main.mini,config,info,function(nextLevel) {
		if(nextLevel) Main.intermediateScreen(info); else Main.gameOver(info);
	});
	game.start();
	if(info.level == 1) {
		Main.gameid = thx_core_UUID.create();
		Main.cancelGame = thx_core_Timer.repeat(function() {
			if(game.get_running()) Main.sendScore(false);
		},5000);
	}
};
Main.intermediateScreen = function(info) {
	Main.background();
	Main.write("Level " + info.level + " Completed!",48,fly_Config.width / 2,fly_Config.height / 2);
	Main.write("current score " + thx_format_NumberFormat.number(info.score,0),24,fly_Config.width / 2,fly_Config.height / 4 * 3);
	Main.write("(press bar to continue to the next level)",16,fly_Config.width / 2,fly_Config.height / 4 * 3.5);
	thx_core_Timer.delay(function() {
		Main.mini.onKeyUp(function(e) {
			if(e.keyCode != 32) return;
			Main.mini.offKeyUp();
			Main.playLevel(info);
		});
	},250);
};
Main.gameOver = function(info) {
	Main.background();
	Main.cancelGame();
	Main.sendScore(true);
	Main.write("Game Over!",48,fly_Config.width / 2,fly_Config.height / 2);
	Main.write("Final Score " + thx_format_NumberFormat.number(info.score,0) + (" (level " + info.level + ")"),24,fly_Config.width / 2,fly_Config.height / 4 * 3);
	Main.write("(press bar to start a new game)",16,fly_Config.width / 2,fly_Config.height / 4 * 3.5);
	thx_core_Timer.delay(function() {
		Main.mini.onKeyUp(function(e) {
			if(e.keyCode != 32) return;
			Main.mini.offKeyUp();
			var info1 = new fly_components_GameInfo(0,0,0,0,info.mute);
			Main.playLevel(info1);
		});
	},250);
};
Main.decorateBackground = function() {
	var w = 300;
	var h = 300;
	var s = 20;
	var mini = minicanvas_MiniCanvas.create(w,h).fill(-1999896321);
	var p = new fly_components_Position(0,0);
	var f = new fly_components_Flower(0);
	var el = window.document.querySelector("figure.minicanvas");
	var $double;
	Main.flowers = new fly_systems_RenderFlower(mini,400,s);
	var _g = 0;
	while(_g < 1500) {
		var i = _g++;
		$double = false;
		p.x = w * Math.random();
		p.y = h * Math.random();
		f.id++;
		Main.flowers.update(p,f);
		if(p.x < s) {
			$double = true;
			p.x += w;
		} else if(p.x > w - s) {
			$double = true;
			p.x -= w;
		}
		if(p.y < s) {
			$double = true;
			p.y += h;
		} else if(p.y > w - s) {
			$double = true;
			p.y -= h;
		}
		if($double) Main.flowers.update(p,f);
	}
	mini.fill(-52);
	el.style.backgroundImage = "url(" + mini.canvas.toDataURL("image/png") + ")";
	el.style.backgroundSize = "" + w + "px " + h + "px";
};
Main.write = function(text,size,x,y) {
	Main.mini.ctx.font = size + "px 'Montserrat', sans-serif";
	Main.mini.ctx.textBaseline = "bottom";
	Main.mini.ctx.lineWidth = 4;
	Main.mini.ctx.textAlign = "center";
	Main.mini.ctx.strokeStyle = "#FFFFFF";
	Main.mini.ctx.fillStyle = "#000000";
	Main.mini.ctx.strokeText(text,x,y);
	Main.mini.ctx.fillText(text,x,y);
};
Main.background = function() {
	Main.mini.clear();
	var p = new fly_components_Position(0,0);
	var f = new fly_components_Flower(0);
	Main.flowers.mini = Main.mini;
	var _g = 0;
	while(_g < 1500) {
		var i = _g++;
		p.x = Math.random() * fly_Config.width;
		p.y = Math.random() * fly_Config.height;
		f.id = i;
		Main.flowers.update(p,f);
	}
};
Main.instructions = function() {
	var el = window.document.querySelector("figcaption");
	var message = "<div class=\"instructions\">\n<p>Use <i class=\"fa fa-caret-square-o-left\"></i> <i class=\"fa fa-caret-square-o-right\"></i> (or A/D) to turn.</p>\n<p>Kill all the flies within 2 minutes to pass to a new level.</p>\n<p>When you eat a flower or a fly, you leave a <em>droplet</em>.<br>They explode after a few seconds and they help to clean-up the area.</p>\n<p><em>Pause</em> with spacebar or (P), Mute audio</em> with M.</p>\n<p></p>\n<p>Sounds Effect Credits go to Gabriel and Matilde Ponticelli</p>\n<p>Realized with <a href=\"http://haxe.org\">Haxe</a> and the library <a href=\"http://github.com/fponticelli/edge\">edge</a>. Source code <a href=\"https://github.com/fponticelli/flymaze\">available here</a>.</p>\n<p>Copyright © <a href=\"https://github.com/fponticelli\">Franco Ponticelli</a></p>\n</div>";
	el.innerHTML = message;
};
Main.leaderboard = function(n) {
	var el = window.document.querySelector("figcaption");
	var l;
	var _this = window.document;
	l = _this.createElement("div");
	l.className = "leaderboard";
	l.innerHTML = "\n      <div class=\"table\">\n      <table>\n        <thead>\n          <th>#</th>\n          <th>name</th>\n          <th>level</th>\n          <th>score</th>\n        </thead>\n        <tbody>\n        </tbody>\n      </table>\n      </div>\n      <div class=\"player\">\n        your alias is:<br>\n        <span class=\"name\">" + StringTools.htmlEscape(n) + "</span>\n        <br>\n        <button>change name</button>\n      </div>";
	el.appendChild(l);
	el.appendChild(window.document.createElement("BR"));
	Main.leaderboardElement = el.querySelector(".leaderboard tbody");
	Main.playerNameElement = el.querySelector(".player span.name");
	Main.playerNameButton = el.querySelector(".player button");
	Main.playerNameButton.addEventListener("click",function(_) {
		var newname = window.prompt("input your new name:");
		if(newname == null || (newname = StringTools.trim(newname)) == "") return;
		Main.playerNameElement.innerHTML = Main.$name = StringTools.htmlEscape(newname);
		fly_util_Cookie.create("fmname",Main.$name,1000);
		Main.changeName(Main.id,Main.$name);
	});
};
Main.updateLeaderboard = function(data) {
	var el = Main.leaderboardElement;
	var rows = thx_core_Arrays.mapi(data,function(o,i) {
		return "<tr class=\"" + (o.name == Main.$name?"selected":"") + "\">\n<td>" + (i + 1) + "</td>\n<td>" + StringTools.htmlEscape(o.name) + "</td>\n<td>" + thx_format_NumberFormat.number(o.level,0) + "</td>\n<td>" + thx_format_NumberFormat.number(o.score,0) + "</td></tr>";
	}).join("");
	if(Main.old == rows) return;
	el.innerHTML = Main.old = rows;
};
Math.__name__ = ["Math"];
var Reflect = function() { };
Reflect.__name__ = ["Reflect"];
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		return null;
	}
};
Reflect.setField = function(o,field,value) {
	o[field] = value;
};
Reflect.callMethod = function(o,func,args) {
	return func.apply(o,args);
};
var Std = function() { };
Std.__name__ = ["Std"];
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
Std["int"] = function(x) {
	return x | 0;
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
Std.parseFloat = function(x) {
	return parseFloat(x);
};
Std.random = function(x) {
	if(x <= 0) return 0; else return Math.floor(Math.random() * x);
};
var StringTools = function() { };
StringTools.__name__ = ["StringTools"];
StringTools.htmlEscape = function(s,quotes) {
	s = s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
	if(quotes) return s.split("\"").join("&quot;").split("'").join("&#039;"); else return s;
};
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c > 8 && c < 14 || c == 32;
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
};
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
};
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
};
StringTools.rpad = function(s,c,l) {
	if(c.length <= 0) return s;
	while(s.length < l) s = s + c;
	return s;
};
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
var Type = function() { };
Type.__name__ = ["Type"];
Type.getClass = function(o) {
	if(o == null) return null;
	return js_Boot.getClass(o);
};
Type.getClassName = function(c) {
	var a = c.__name__;
	if(a == null) return null;
	return a.join(".");
};
Type.getInstanceFields = function(c) {
	var a = [];
	for(var i in c.prototype) a.push(i);
	HxOverrides.remove(a,"__class__");
	HxOverrides.remove(a,"__properties__");
	return a;
};
var amaze_Maze = function(width,height,rgen) {
	this.width = width;
	this.height = height;
	if(null == rgen) this.rgen = new thx_math_random_PseudoRandom(); else this.rgen = rgen;
};
amaze_Maze.__name__ = ["amaze","Maze"];
amaze_Maze.prototype = {
	width: null
	,height: null
	,cells: null
	,rgen: null
	,dx: function(side) {
		switch(side) {
		case 2:
			return 1;
		case 8:
			return -1;
		case 1:
			return 0;
		case 4:
			return 0;
		}
	}
	,dy: function(side) {
		switch(side) {
		case 2:
			return 0;
		case 8:
			return 0;
		case 1:
			return -1;
		case 4:
			return 1;
		}
	}
	,opposite: function(side) {
		switch(side) {
		case 2:
			return 8;
		case 8:
			return 2;
		case 1:
			return 4;
		case 4:
			return 1;
		}
	}
	,generate: function(cx,cy) {
		var _g1 = this;
		if(cx < 0 || cx >= this.width) throw "cs " + cx + " is out of boundaries";
		if(cy < 0 || cy >= this.height) throw "cs " + cy + " is out of boundaries";
		var _g = [];
		var _g2 = 0;
		var _g11 = this.height;
		while(_g2 < _g11) {
			var y = _g2++;
			_g.push((function($this) {
				var $r;
				var _g3 = [];
				{
					var _g5 = 0;
					var _g4 = $this.width;
					while(_g5 < _g4) {
						var x = _g5++;
						_g3.push(0);
					}
				}
				$r = _g3;
				return $r;
			}(this)));
		}
		this.cells = _g;
		var carve;
		var carve1 = null;
		carve1 = function(cx1,cy1) {
			var directions = thx_math_random__$Random_Random_$Impl_$.shuffle(_g1.rgen,[1,4,2,8]);
			var _g21 = 0;
			while(_g21 < directions.length) {
				var side = directions[_g21];
				++_g21;
				var nx = cx1 + _g1.dx(side);
				var ny = cy1 + _g1.dy(side);
				if(ny >= 0 && ny < _g1.height && nx >= 0 && nx < _g1.width && _g1.cells[ny][nx] == 0) {
					_g1.cells[cy1][cx1] |= side;
					var other = _g1.opposite(side);
					_g1.cells[ny][nx] |= other;
					carve1(nx,ny);
				}
			}
		};
		carve = carve1;
		carve(cx,cy);
	}
	,__class__: amaze_Maze
};
var edge_Engine = function() {
	this.emptyArgs = [];
	this.mapInfo = new haxe_ds_ObjectMap();
	this.mapEntities = new haxe_ds_ObjectMap();
	this.listPhases = [];
};
edge_Engine.__name__ = ["edge","Engine"];
edge_Engine.hasField = function(o,field) {
	return thx_core_Arrays.contains(Type.getInstanceFields(Type.getClass(o)),field);
};
edge_Engine.prototype = {
	mapInfo: null
	,mapEntities: null
	,listPhases: null
	,add: function(entity) {
		entity.engine = this;
		this.mapEntities.set(entity,true);
		this.matchSystems(entity);
		this.matchEntities(entity);
	}
	,clear: function() {
		var $it0 = this.mapEntities.keys();
		while( $it0.hasNext() ) {
			var entity = $it0.next();
			this.remove(entity);
		}
	}
	,remove: function(entity) {
		var $it0 = this.mapInfo.keys();
		while( $it0.hasNext() ) {
			var system = $it0.next();
			var this1 = this.mapInfo.h[system.__id__].components;
			this1.remove(entity);
		}
		var $it1 = this.mapInfo.keys();
		while( $it1.hasNext() ) {
			var system1 = $it1.next();
			var this2 = this.mapInfo.h[system1.__id__].entities;
			this2.remove(entity);
		}
		this.mapEntities.remove(entity);
		entity.engine = null;
	}
	,createPhase: function() {
		var phase = new edge_Phase(this);
		this.listPhases.push(phase);
		return phase;
	}
	,phases: function() {
		return HxOverrides.iter(this.listPhases);
	}
	,addSystem: function(phase,system) {
		if(this.mapInfo.h.__keys__[system.__id__] != null) throw "System \"" + Std.string(system) + "\" already exists in Engine";
		var info = { hasComponents : null != system.componentRequirements && system.componentRequirements.length > 0, hasDelta : edge_Engine.hasField(system,"timeDelta"), hasEngine : edge_Engine.hasField(system,"engine"), hasEntity : edge_Engine.hasField(system,"entity"), hasBefore : edge_Engine.hasField(system,"before"), hasEntities : null != system.entityRequirements, update : Reflect.field(system,"update"), phase : phase, before : null, components : new haxe_ds_ObjectMap(), entities : new haxe_ds_ObjectMap()};
		if(info.hasBefore) info.before = Reflect.field(system,"before");
		this.mapInfo.set(system,info);
		if(info.hasComponents) {
			var $it0 = this.mapEntities.keys();
			while( $it0.hasNext() ) {
				var entity = $it0.next();
				this.matchSystem(entity,system);
			}
		}
		if(info.hasEntities) {
			var $it1 = this.mapEntities.keys();
			while( $it1.hasNext() ) {
				var entity1 = $it1.next();
				this.matchEntity(entity1,system);
			}
		}
	}
	,removeSystem: function(system) {
		this.mapInfo.remove(system);
	}
	,emptyArgs: null
	,updateSystem: function(system,t) {
		var info = this.mapInfo.h[system.__id__];
		if(info == null) return;
		if(info.hasEngine) system.engine = this;
		if(info.hasDelta) system.timeDelta = t;
		if(info.hasEntities) Reflect.setField(system,"entities",info.entities.iterator());
		if(info.hasComponents) {
			if(info.hasBefore) Reflect.callMethod(system,info.update,this.emptyArgs);
			var $it0 = info.components.keys();
			while( $it0.hasNext() ) {
				var entity = $it0.next();
				var components = info.components.h[entity.__id__];
				if(info.hasEntity) system.entity = entity;
				Reflect.callMethod(system,info.update,components);
			}
		} else Reflect.callMethod(system,info.update,this.emptyArgs);
	}
	,matchSystems: function(entity) {
		var $it0 = this.mapInfo.keys();
		while( $it0.hasNext() ) {
			var system = $it0.next();
			this.matchSystem(entity,system);
		}
	}
	,matchEntities: function(entity) {
		var $it0 = this.mapInfo.keys();
		while( $it0.hasNext() ) {
			var system = $it0.next();
			this.matchEntity(entity,system);
		}
	}
	,matchSystem: function(entity,system) {
		var info = this.mapInfo.h[system.__id__];
		info.components.remove(entity);
		if(info.hasComponents) {
			var components = this.matchRequirements(entity,system.componentRequirements);
			if(null != components) info.components.set(entity,components);
		}
	}
	,matchEntity: function(entity,system) {
		var info = this.mapInfo.h[system.__id__];
		if(!info.hasEntities) return;
		info.entities.remove(entity);
		var componentRequirements = system.entityRequirements.map(function(o) {
			return o.cls;
		});
		var components = this.matchRequirements(entity,componentRequirements);
		var o1;
		if(null != components) {
			o1 = { };
			var _g1 = 0;
			var _g = components.length;
			while(_g1 < _g) {
				var i = _g1++;
				o1[system.entityRequirements[i].name] = components[i];
			}
			o1.entity = entity;
			info.entities.set(entity,o1);
		}
	}
	,matchRequirements: function(entity,requirements) {
		var comps = [];
		var _g = 0;
		while(_g < requirements.length) {
			var req = requirements[_g];
			++_g;
			var $it0 = entity.map.iterator();
			while( $it0.hasNext() ) {
				var component = $it0.next();
				if(Type.getClass(component) == req) {
					comps.push(component);
					break;
				}
			}
		}
		if(comps.length == requirements.length) return comps; else return null;
	}
	,__class__: edge_Engine
};
var edge_Entity = function(components) {
	this.map = new haxe_ds_StringMap();
	if(null != components) this.addMany(components);
};
edge_Entity.__name__ = ["edge","Entity"];
edge_Entity.prototype = {
	map: null
	,engine: null
	,add: function(component) {
		this._add(component);
		if(null != this.engine) this.engine.matchSystems(this);
	}
	,addMany: function(components) {
		var _g = this;
		components.map(function(_) {
			_g._add(_);
			return;
		});
		if(null != this.engine) this.engine.matchSystems(this);
	}
	,remove: function(component) {
		this._remove(component);
		if(null != this.engine) this.engine.matchSystems(this);
	}
	,removeTypes: function(types) {
		var _g = this;
		types.map(function(_) {
			_g._removeTypeName(Type.getClassName(_));
			return;
		});
		if(null != this.engine) this.engine.matchSystems(this);
	}
	,_add: function(component) {
		var type = Type.getClassName(Type.getClass(component));
		if(this.map.exists(type)) this.remove(this.map.get(type));
		this.map.set(type,component);
	}
	,_remove: function(component) {
		var type = Type.getClassName(Type.getClass(component));
		this._removeTypeName(type);
	}
	,_removeTypeName: function(type) {
		this.map.remove(type);
	}
	,__class__: edge_Entity
};
var edge_IComponent = function() { };
edge_IComponent.__name__ = ["edge","IComponent"];
var edge_ISystem = function() { };
edge_ISystem.__name__ = ["edge","ISystem"];
edge_ISystem.prototype = {
	componentRequirements: null
	,entityRequirements: null
	,__class__: edge_ISystem
};
var edge_Phase = function(engine) {
	this.engine = engine;
	this.mapSystem = new haxe_ds_ObjectMap();
	this.mapType = new haxe_ds_StringMap();
};
edge_Phase.__name__ = ["edge","Phase"];
edge_Phase.prototype = {
	first: null
	,last: null
	,mapSystem: null
	,mapType: null
	,engine: null
	,add: function(system) {
		this.remove(system);
		var node = this.createNode(system);
		if(null == this.first) {
			this.first = node;
			this.last = node;
		} else {
			node.prev = this.last;
			this.last.next = node;
			this.last = node;
		}
	}
	,clear: function() {
		var $it0 = this.systems();
		while( $it0.hasNext() ) {
			var system = $it0.next();
			this.remove(system);
		}
	}
	,remove: function(system) {
		var node = this.mapSystem.h[system.__id__];
		var key = this.key(system);
		this.mapType.remove(key);
		if(null == node) return;
		if(null != this.engine) this.engine.removeSystem(system);
		this.mapSystem.remove(system);
		if(node == this.first && node == this.last) this.first = this.last = null; else if(node == this.first) {
			this.first = node.next;
			node.next.prev = null;
		} else if(node == this.last) {
			this.first = node.prev;
			node.prev.next = null;
		} else {
			node.prev.next = node.next;
			node.next.prev = node.prev;
		}
	}
	,systems: function() {
		return new edge_NodeSystemIterator(this.first);
	}
	,update: function(t) {
		if(null == this.engine) return;
		var $it0 = this.systems();
		while( $it0.hasNext() ) {
			var system = $it0.next();
			this.engine.updateSystem(system,t);
		}
	}
	,createNode: function(system) {
		var node = new edge_NodeSystem(system);
		this.mapSystem.set(system,node);
		var key = this.key(system);
		this.mapType.set(key,system);
		if(null != this.engine) this.engine.addSystem(this,system);
		return node;
	}
	,key: function(system) {
		return Type.getClassName(Type.getClass(system));
	}
	,__class__: edge_Phase
};
var edge_NodeSystem = function(system) {
	this.system = system;
};
edge_NodeSystem.__name__ = ["edge","NodeSystem"];
edge_NodeSystem.prototype = {
	system: null
	,next: null
	,prev: null
	,__class__: edge_NodeSystem
};
var edge_NodeSystemIterator = function(node) {
	this.node = node;
};
edge_NodeSystemIterator.__name__ = ["edge","NodeSystemIterator"];
edge_NodeSystemIterator.prototype = {
	node: null
	,hasNext: function() {
		return null != this.node;
	}
	,next: function() {
		var system = this.node.system;
		this.node = this.node.next;
		return system;
	}
	,__class__: edge_NodeSystemIterator
};
var edge_World = function(delta,schedule) {
	if(delta == null) delta = 16;
	this.engine = new edge_Engine();
	this.frame = this.engine.createPhase();
	this.physics = this.engine.createPhase();
	this.render = this.engine.createPhase();
	this.remainder = 0;
	this.running = false;
	this.delta = delta;
	if(null != schedule) this.schedule = schedule; else this.schedule = thx_core_Timer.frame;
};
edge_World.__name__ = ["edge","World"];
edge_World.prototype = {
	frame: null
	,physics: null
	,render: null
	,engine: null
	,delta: null
	,running: null
	,schedule: null
	,cancel: null
	,remainder: null
	,start: function() {
		if(this.running) return;
		this.running = true;
		this.cancel = this.schedule($bind(this,this.run));
	}
	,run: function(t) {
		this.frame.update(t);
		var dt = t + this.remainder;
		while(dt > this.delta) {
			dt -= this.delta;
			this.physics.update(this.delta);
		}
		this.remainder = dt;
		this.render.update(t);
	}
	,stop: function() {
		if(!this.running) return;
		this.running = false;
		this.cancel();
	}
	,clear: function() {
		var $it0 = this.engine.phases();
		while( $it0.hasNext() ) {
			var phase = $it0.next();
			phase.clear();
		}
		this.engine.clear();
	}
	,__class__: edge_World
};
var fly_Config = function(level) {
	if(level >= fly_Config.columns.length) this.cols = fly_Config.columns[fly_Config.columns.length - 1]; else this.cols = fly_Config.columns[level];
	this.cellSize = Math.floor(fly_Config.width / this.cols);
	this.rows = Math.floor(fly_Config.height / this.cellSize);
	this.startCol = 0;
	this.startRow = this.rows - 1;
	this.backgroundColor = 12245640;
	this.flyCircleRadius = 60;
	this.flies = 200;
	this.flowers = 1500;
	this.timePerLevel = 120;
	this.gen = new thx_math_random_PseudoRandom(level * 2);
};
fly_Config.__name__ = ["fly","Config"];
fly_Config.prototype = {
	cols: null
	,rows: null
	,startCol: null
	,startRow: null
	,flies: null
	,flowers: null
	,timePerLevel: null
	,backgroundColor: null
	,gen: null
	,cellSize: null
	,flyCircleRadius: null
	,__class__: fly_Config
};
var fly_components_Edible = function(makeJump,makeDroplet,score,countToPassLevel) {
	this.makeJump = makeJump;
	this.makeDroplet = makeDroplet;
	this.score = score;
	this.countToPassLevel = countToPassLevel;
};
fly_components_Edible.__name__ = ["fly","components","Edible"];
fly_components_Edible.__interfaces__ = [edge_IComponent];
fly_components_Edible.prototype = {
	makeJump: null
	,makeDroplet: null
	,score: null
	,countToPassLevel: null
	,__class__: fly_components_Edible
};
var fly_Game = function(mini,config,gameInfo,endLevel) {
	var _g = this;
	var p = new fly_components_Position((config.startCol + 0.5) * config.cellSize,(config.startRow + 1) * config.cellSize - 2);
	var direction = new fly_components_Direction(-Math.PI / 2);
	var velocity = new fly_components_Velocity(2.2);
	var m = new amaze_Maze(config.cols,config.rows,config.gen);
	m.generate(config.startRow,config.startCol);
	m.cells[config.startRow][config.startCol] = m.cells[config.startRow][config.startCol] | 1;
	true;
	m.cells[config.startRow - 1][config.startCol] = m.cells[config.startRow - 1][config.startCol] | 4;
	true;
	this.maze = new fly_components_Maze(m,1);
	var keyUp = function(e) {
		if(e.keyCode == 32 || e.keyCode == 80) {
			if(_g.world.running) _g.stop(); else _g.start();
		} else if(e.keyCode == 77) gameInfo.mute = !gameInfo.mute;
	};
	this.world = new edge_World();
	this.engine = this.world.engine;
	var snake = new fly_components_Snake(60,p);
	var snakeEntity = new edge_Entity([p,direction,velocity,snake,this.maze]);
	this.engine.add(snakeEntity);
	var _g1 = 0;
	var _g2 = config.flies;
	while(_g1 < _g2) {
		var i = _g1++;
		this.createFly(this.engine,config);
	}
	var _g11 = 0;
	var _g3 = config.flowers;
	while(_g11 < _g3) {
		var i1 = _g11++;
		this.createFlower(this.engine,config);
	}
	var steering = fly_Game.ONE_DEGREE * 6;
	this.world.physics.add(new fly_systems_KeyboardInput(function(e1) {
		var _g4 = 0;
		var _g12 = e1.keys;
		while(_g4 < _g12.length) {
			var key = _g12[_g4];
			++_g4;
			switch(key) {
			case 37:case 65:
				direction.angle -= steering;
				break;
			case 39:case 68:
				direction.angle += steering;
				break;
			}
		}
	}));
	this.engine.add(new edge_Entity([new fly_components_CountDown(3)]));
	this.engine.add(new edge_Entity([fly_components_Audio.start]));
	this.world.physics.add(new fly_systems_UpdateDelayedComponents());
	this.world.physics.add(new fly_systems_MazeCollision(config.cellSize));
	this.world.physics.add(new fly_systems_UpdateDroplet());
	this.world.physics.add(new fly_systems_UpdateExplosion());
	this.world.physics.add(new fly_systems_UpdateDetonation(gameInfo,10));
	this.world.physics.add(new fly_systems_UpdateFly(fly_Config.width,fly_Config.height,config.gen));
	this.world.physics.add(new fly_systems_UpdateCountDown(function() {
		_g.world.physics.add(new fly_systems_UpdateGameInfo(gameInfo,function(nextLevel) {
			window.removeEventListener("keyup",keyUp);
			_g.world.clear();
			if(nextLevel) fly_systems_PlayAudio.playSound("success"); else fly_systems_PlayAudio.playSound("gameover");
			endLevel(nextLevel);
		}));
		_g.world.physics.add(new fly_systems_UpdatePosition());
		_g.world.physics.add(new fly_systems_UpdateSnake());
		_g.world.physics.add(new fly_systems_SnakeEats(gameInfo,10));
		window.addEventListener("keyup",keyUp);
	}));
	this.world.render.add(new fly_systems_RenderBackground(mini,config.backgroundColor));
	this.world.render.add(new fly_systems_RenderDroplet(mini));
	this.world.render.add(new fly_systems_RenderMaze(mini.ctx,config.cellSize));
	this.world.render.add(new fly_systems_RenderFlower(mini,200,20));
	this.world.render.add(new fly_systems_RenderSnake(mini));
	this.world.render.add(new fly_systems_RenderFly(mini));
	this.world.render.add(new fly_systems_RenderExplosion(mini));
	this.world.render.add(new fly_systems_RenderCountDown(mini));
	this.world.render.add(new fly_systems_RenderGameInfo(gameInfo,mini));
	this.world.render.add(new fly_systems_PlayAudio(gameInfo));
	this.world.render.add(new fly_systems_BackgroundBuzz());
};
fly_Game.__name__ = ["fly","Game"];
fly_Game.prototype = {
	world: null
	,engine: null
	,maze: null
	,createFly: function(engine,config) {
		var a = config.gen["float"]() * Math.PI * 2;
		var p = new fly_components_Position(config.gen["float"]() * fly_Config.width,config.gen["float"]() * fly_Config.height);
		engine.add(new edge_Entity([p,fly_components_Fly.create(config.gen),fly_Game.edibleFly]));
	}
	,createFlower: function(engine,config) {
		var p = new fly_components_Position(fly_Config.width * config.gen["float"](),fly_Config.height * config.gen["float"]());
		engine.add(new edge_Entity([p,new fly_components_Flower(config.gen["int"]()),fly_Game.edibleFlower]));
	}
	,get_running: function() {
		return this.world.running;
	}
	,start: function() {
		this.world.start();
	}
	,stop: function() {
		this.world.stop();
	}
	,__class__: fly_Game
};
var fly_components_Audio = function(name) {
	this.name = name;
};
fly_components_Audio.__name__ = ["fly","components","Audio"];
fly_components_Audio.__interfaces__ = [edge_IComponent];
fly_components_Audio.get_explosion = function() {
	return fly_components_Audio.explosions[fly_components_Audio.explosion_id++ % fly_components_Audio.explosions.length];
};
fly_components_Audio.get_boing = function() {
	return fly_components_Audio.boings[fly_components_Audio.boing_id++ % fly_components_Audio.boings.length];
};
fly_components_Audio.prototype = {
	name: null
	,__class__: fly_components_Audio
};
var fly_components_CountDown = function(time) {
	this.time = time;
};
fly_components_CountDown.__name__ = ["fly","components","CountDown"];
fly_components_CountDown.__interfaces__ = [edge_IComponent];
fly_components_CountDown.prototype = {
	time: null
	,__class__: fly_components_CountDown
};
var fly_components_DelayedComponents = function(ticks,toAdd,toRemove) {
	this.ticks = ticks;
	if(null == toAdd) this.toAdd = []; else this.toAdd = toAdd;
	if(null == toRemove) this.toRemove = []; else this.toRemove = toRemove;
};
fly_components_DelayedComponents.__name__ = ["fly","components","DelayedComponents"];
fly_components_DelayedComponents.__interfaces__ = [edge_IComponent];
fly_components_DelayedComponents.prototype = {
	ticks: null
	,toAdd: null
	,toRemove: null
	,__class__: fly_components_DelayedComponents
};
var fly_components_Explosion = function(stage,draw) {
	this.stage = stage;
	this.draw = draw;
};
fly_components_Explosion.__name__ = ["fly","components","Explosion"];
fly_components_Explosion.__interfaces__ = [edge_IComponent];
fly_components_Explosion.create = function() {
	var offset = 20;
	var size = (fly_components_Explosion.radius + Math.ceil(offset)) * 2;
	var mini = minicanvas_MiniCanvas.create(size,size);
	var a = Math.random() * Math.PI * 2;
	mini.ctx.translate(size / 2,size / 2);
	mini.ctx.rotate(a);
	mini.dot(-offset / 2,-offset / 2,fly_components_Explosion.radius,-3394663);
	mini.dot(-offset / 4,-offset / 4,fly_components_Explosion.radius,-16777012);
	mini.ctx.globalCompositeOperation = "destination-out";
	mini.dot(0,0,fly_components_Explosion.radius,-1);
	mini.ctx.globalCompositeOperation = "source-over";
	mini.dot(offset / 4,offset / 4,fly_components_Explosion.radius,-154);
	return new fly_components_Explosion(fly_components_Explosion.maxStage,function(stage,pos,m) {
		var s;
		if(stage > fly_components_Explosion.peak) s = 1 - (stage - fly_components_Explosion.peak) / (fly_components_Explosion.maxStage - fly_components_Explosion.peak); else s = 1 - (fly_components_Explosion.peak - stage) / fly_components_Explosion.peak;
		var w = size * s;
		m.ctx.drawImage(mini.canvas,pos.x - w / 2,pos.y - w / 2,w,w);
	});
};
fly_components_Explosion.prototype = {
	stage: null
	,draw: null
	,__class__: fly_components_Explosion
};
var fly_components_Detonation = function(radius) {
	this.radius = radius;
};
fly_components_Detonation.__name__ = ["fly","components","Detonation"];
fly_components_Detonation.__interfaces__ = [edge_IComponent];
fly_components_Detonation.prototype = {
	radius: null
	,__class__: fly_components_Detonation
};
var fly_components_Direction = function(angle) {
	this.angle = angle;
};
fly_components_Direction.__name__ = ["fly","components","Direction"];
fly_components_Direction.__interfaces__ = [edge_IComponent];
fly_components_Direction.prototype = {
	angle: null
	,get_dx: function() {
		return Math.cos(this.angle);
	}
	,get_dy: function() {
		return Math.sin(this.angle);
	}
	,__class__: fly_components_Direction
};
var fly_components_Droplet = function(radius,color,life) {
	this.radius = radius;
	this.color = color;
	this.life = life;
};
fly_components_Droplet.__name__ = ["fly","components","Droplet"];
fly_components_Droplet.__interfaces__ = [edge_IComponent];
fly_components_Droplet.create = function() {
	return new fly_components_Droplet(Math.random() * 0.5 + 1.2,thx_color__$HSL_HSL_$Impl_$.toRGB(thx_color__$HSL_HSL_$Impl_$.create(20 + 30 * Math.random(),Math.random() * 0.4 + 0.6,0.3)),fly_components_Droplet.maxLife);
};
fly_components_Droplet.prototype = {
	radius: null
	,color: null
	,life: null
	,__class__: fly_components_Droplet
};
var fly_components_Flower = function(id) {
	this.id = id;
};
fly_components_Flower.__name__ = ["fly","components","Flower"];
fly_components_Flower.__interfaces__ = [edge_IComponent];
fly_components_Flower.prototype = {
	id: null
	,__class__: fly_components_Flower
};
var fly_components_Fly = function(height) {
	this.height = height;
};
fly_components_Fly.__name__ = ["fly","components","Fly"];
fly_components_Fly.__interfaces__ = [edge_IComponent];
fly_components_Fly.create = function(gen) {
	return new fly_components_Fly(gen["float"]() * 5);
};
fly_components_Fly.prototype = {
	height: null
	,__class__: fly_components_Fly
};
var fly_components_GameInfo = function(score,toPassLevel,timeLeft,level,mute) {
	this.score = score;
	this.toPassLevel = toPassLevel;
	this.timeLeft = timeLeft;
	this.level = level;
	this.mute = mute;
};
fly_components_GameInfo.__name__ = ["fly","components","GameInfo"];
fly_components_GameInfo.__interfaces__ = [edge_IComponent];
fly_components_GameInfo.prototype = {
	score: null
	,toPassLevel: null
	,timeLeft: null
	,level: null
	,mute: null
	,__class__: fly_components_GameInfo
};
var fly_components_Maze = function(maze,id) {
	this.maze = maze;
	this.id = id;
};
fly_components_Maze.__name__ = ["fly","components","Maze"];
fly_components_Maze.__interfaces__ = [edge_IComponent];
fly_components_Maze.prototype = {
	maze: null
	,id: null
	,__class__: fly_components_Maze
};
var fly_components_Position = function(x,y) {
	this.x = x;
	this.y = y;
};
fly_components_Position.__name__ = ["fly","components","Position"];
fly_components_Position.__interfaces__ = [edge_IComponent];
fly_components_Position.prototype = {
	x: null
	,y: null
	,__class__: fly_components_Position
};
var fly_components_Snake = function(length,start,trailWidth,headWidth) {
	if(headWidth == null) headWidth = 4;
	if(trailWidth == null) trailWidth = 1;
	this.pos = length - 1;
	var _g = [];
	var _g1 = 0;
	while(_g1 < length) {
		var i = _g1++;
		_g.push(new fly_components_Position(start.x,start.y));
	}
	this.trail = _g;
	this.trailWidth = trailWidth;
	this.headWidth = headWidth;
	this.colors = ["#ffffff","#dddddd","#bbbbbb","#0000ff","#000055"];
	this.jumping = [];
};
fly_components_Snake.__name__ = ["fly","components","Snake"];
fly_components_Snake.__interfaces__ = [edge_IComponent];
fly_components_Snake.prototype = {
	pos: null
	,trail: null
	,trailWidth: null
	,headWidth: null
	,colors: null
	,jumping: null
	,map: function(callback) {
		var _g1 = this.pos + 1;
		var _g = this.trail.length;
		while(_g1 < _g) {
			var i = _g1++;
			callback(this.trail[i - 1],this.trail[i]);
		}
		var _g11 = 0;
		var _g2 = this.pos;
		while(_g11 < _g2) {
			var i1 = _g11++;
			var p = i1 - 1;
			if(p < 0) p = this.trail.length - 1;
			callback(this.trail[p],this.trail[i1]);
		}
	}
	,__class__: fly_components_Snake
};
var fly_components_Velocity = function(value) {
	this.value = value;
};
fly_components_Velocity.__name__ = ["fly","components","Velocity"];
fly_components_Velocity.__interfaces__ = [edge_IComponent];
fly_components_Velocity.prototype = {
	value: null
	,__class__: fly_components_Velocity
};
var fly_systems_BackgroundBuzz = function() {
	this.entityRequirements = [{ name : "audio", cls : fly_components_Audio}];
	this.componentRequirements = [];
	this.delay = 300;
	this.counter = 0;
};
fly_systems_BackgroundBuzz.__name__ = ["fly","systems","BackgroundBuzz"];
fly_systems_BackgroundBuzz.__interfaces__ = [edge_ISystem];
fly_systems_BackgroundBuzz.prototype = {
	engine: null
	,counter: null
	,delay: null
	,entities: null
	,update: function() {
		if(this.entities.hasNext()) this.counter = 0; else {
			this.counter++;
			if(this.counter >= this.delay) {
				this.engine.add(new edge_Entity([fly_components_Audio.buzzing]));
				this.counter = 0;
			}
		}
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_BackgroundBuzz
};
var fly_systems_KeyboardInput = function(callback) {
	this.entityRequirements = null;
	this.componentRequirements = [];
	var _g = this;
	this.callback = callback;
	this.keys = thx_core__$Set_Set_$Impl_$.create([]);
	this.event = new fly_systems_KeyboardEvent(this);
	window.addEventListener("keydown",function(e) {
		thx_core__$Set_Set_$Impl_$.add(_g.keys,e.keyCode);
	});
	window.addEventListener("keyup",function(e1) {
		HxOverrides.remove(_g.keys,e1.keyCode);
	});
};
fly_systems_KeyboardInput.__name__ = ["fly","systems","KeyboardInput"];
fly_systems_KeyboardInput.__interfaces__ = [edge_ISystem];
fly_systems_KeyboardInput.prototype = {
	callback: null
	,keys: null
	,event: null
	,update: function() {
		if(this.keys.length > 0) {
			this.event.keys = thx_core__$Set_Set_$Impl_$.setToArray(this.keys);
			this.callback(this.event);
		}
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_KeyboardInput
};
var fly_systems_KeyboardEvent = function(input) {
	this.input = input;
};
fly_systems_KeyboardEvent.__name__ = ["fly","systems","KeyboardEvent"];
fly_systems_KeyboardEvent.prototype = {
	keys: null
	,input: null
	,__class__: fly_systems_KeyboardEvent
};
var fly_systems_MazeCollision = function(cellSize) {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_Position,fly_components_Direction,fly_components_Velocity,fly_components_Maze];
	this.cellSize = cellSize;
};
fly_systems_MazeCollision.__name__ = ["fly","systems","MazeCollision"];
fly_systems_MazeCollision.__interfaces__ = [edge_ISystem];
fly_systems_MazeCollision.prototype = {
	cellSize: null
	,engine: null
	,update: function(p,d,v,maze) {
		var dx = p.x + d.get_dx() * v.value;
		var dy = p.y + d.get_dy() * v.value;
		var dcol = Math.floor(dx / this.cellSize);
		var drow = Math.floor(dy / this.cellSize);
		var col = Math.floor(p.x / this.cellSize);
		var row = Math.floor(p.y / this.cellSize);
		var cells = maze.maze.cells;
		if(dcol == col && drow == row) return;
		var cell = cells[row][col];
		if(dcol == col) {
			if(drow < row && !(0 != (cell & 1)) || drow > row && !(0 != (cell & 4))) {
				d.angle = -d.angle;
				this.addSound();
			}
		} else if(drow == row) {
			if(dcol < col && !(0 != (cell & 8)) || dcol > col && !(0 != (cell & 2))) {
				d.angle = -d.angle + Math.PI;
				this.addSound();
			}
		} else if(dcol < col && drow < row) {
			if(this.pos(col * this.cellSize,row * this.cellSize,p.x,p.y,dx,dy) > 0) {
				if(!(0 != (cell & 1))) {
					if(!(0 != (cell & 8))) d.angle += Math.PI; else d.angle = -d.angle;
					this.addSound();
				} else if(null != cells[row - 1][col] && !(0 != (cells[row - 1][col] & 8))) {
					d.angle = -d.angle + Math.PI;
					this.addSound();
				}
			} else if(!(0 != (cell & 8))) {
				if(!(0 != (cell & 1))) d.angle += Math.PI; else d.angle = -d.angle + Math.PI;
				this.addSound();
			} else if(null != cells[row][col - 1] && !(0 != (cells[row][col - 1] & 1))) {
				d.angle = -d.angle;
				this.addSound();
			}
		} else if(dcol > col && drow > row) {
			if(this.pos(col * this.cellSize,row * this.cellSize,p.x,p.y,dx,dy) > 0) {
				if(!(0 != (cell & 4))) {
					if(!(0 != (cell & 2))) d.angle += Math.PI; else d.angle = -d.angle;
					this.addSound();
				} else if(null != cells[row + 1][col] && !(0 != (cells[row + 1][col] & 2))) {
					d.angle = -d.angle + Math.PI;
					this.addSound();
				}
			} else if(!(0 != (cell & 2))) {
				if(!(0 != (cell & 4))) d.angle += Math.PI; else d.angle = -d.angle + Math.PI;
				this.addSound();
			} else if(null != cells[row][col + 1] && !(0 != (cells[row][col + 1] & 4))) {
				d.angle = -d.angle;
				this.addSound();
			}
		} else if(dcol < col && drow > row) {
			if(this.pos(col * this.cellSize,row * this.cellSize,p.x,p.y,dx,dy) > 0) {
				if(!(0 != (cell & 4))) {
					if(!(0 != (cell & 8))) d.angle += Math.PI; else d.angle = -d.angle;
					this.addSound();
				} else if(null != cells[row + 1][col] && !(0 != (cells[row + 1][col] & 8))) {
					d.angle = -d.angle + Math.PI;
					this.addSound();
				}
			} else if(!(0 != (cell & 8))) {
				if(!(0 != (cell & 4))) d.angle += Math.PI; else d.angle = -d.angle + Math.PI;
				this.addSound();
			} else if(null != cells[row][col - 1] && !(0 != (cells[row][col - 1] & 4))) {
				d.angle = -d.angle;
				this.addSound();
			}
		} else if(dcol > col && drow < row) {
			if(this.pos(col * this.cellSize,row * this.cellSize,p.x,p.y,dx,dy) > 0) {
				if(!(0 != (cell & 1))) {
					if(!(0 != (cell & 2))) d.angle += Math.PI; else d.angle = -d.angle;
					this.addSound();
				} else if(null != cells[row - 1][col] && !(0 != (cells[row - 1][col] & 2))) d.angle = -d.angle + Math.PI;
			} else if(!(0 != (cell & 2))) {
				if(!(0 != (cell & 1))) d.angle += Math.PI; else d.angle = -d.angle + Math.PI;
				this.addSound();
			} else if(null != cells[row][col + 1] && !(0 != (cells[row][col + 1] & 1))) {
				d.angle = -d.angle;
				this.addSound();
			}
		}
	}
	,addSound: function() {
		this.engine.add(new edge_Entity([fly_components_Audio.get_boing()]));
	}
	,pos: function(x,y,ax,ay,bx,by) {
		if((bx - ax) * (y - ay) - (by - ay) * (x - ax) < 0) return -1; else return 1;
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_MazeCollision
};
var haxe_IMap = function() { };
haxe_IMap.__name__ = ["haxe","IMap"];
haxe_IMap.prototype = {
	remove: null
	,__class__: haxe_IMap
};
var haxe_ds_StringMap = function() {
	this.h = { };
};
haxe_ds_StringMap.__name__ = ["haxe","ds","StringMap"];
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	h: null
	,rh: null
	,set: function(key,value) {
		if(__map_reserved[key] != null) this.setReserved(key,value); else this.h[key] = value;
	}
	,get: function(key) {
		if(__map_reserved[key] != null) return this.getReserved(key);
		return this.h[key];
	}
	,exists: function(key) {
		if(__map_reserved[key] != null) return this.existsReserved(key);
		return this.h.hasOwnProperty(key);
	}
	,setReserved: function(key,value) {
		if(this.rh == null) this.rh = { };
		this.rh["$" + key] = value;
	}
	,getReserved: function(key) {
		if(this.rh == null) return null; else return this.rh["$" + key];
	}
	,existsReserved: function(key) {
		if(this.rh == null) return false;
		return this.rh.hasOwnProperty("$" + key);
	}
	,remove: function(key) {
		if(__map_reserved[key] != null) {
			key = "$" + key;
			if(this.rh == null || !this.rh.hasOwnProperty(key)) return false;
			delete(this.rh[key]);
			return true;
		} else {
			if(!this.h.hasOwnProperty(key)) return false;
			delete(this.h[key]);
			return true;
		}
	}
	,arrayKeys: function() {
		var out = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) out.push(key);
		}
		if(this.rh != null) {
			for( var key in this.rh ) {
			if(key.charCodeAt(0) == 36) out.push(key.substr(1));
			}
		}
		return out;
	}
	,iterator: function() {
		return new haxe_ds__$StringMap_StringMapIterator(this,this.arrayKeys());
	}
	,__class__: haxe_ds_StringMap
};
var js_Boot = function() { };
js_Boot.__name__ = ["js","Boot"];
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__resolveNativeClass = function(name) {
	if(typeof window != "undefined") return window[name]; else return global[name];
};
var fly_systems_PlayAudio = function(info) {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_Audio];
	this.info = info;
};
fly_systems_PlayAudio.__name__ = ["fly","systems","PlayAudio"];
fly_systems_PlayAudio.__interfaces__ = [edge_ISystem];
fly_systems_PlayAudio.loadSound = function(name,url) {
	var request = new XMLHttpRequest();
	request.open("GET",url,true);
	request.responseType = "arraybuffer";
	request.onload = function(_) {
		fly_systems_PlayAudio.context.decodeAudioData(request.response,function(buffer) {
			fly_systems_PlayAudio.sounds.set(name,buffer);
			return false;
		},function(e) {
			console.log("Error: " + Std.string(e));
			return false;
		});
	};
	request.send();
};
fly_systems_PlayAudio.playSound = function(name) {
	var source = fly_systems_PlayAudio.context.createBufferSource();
	source.buffer = fly_systems_PlayAudio.sounds.get(name);
	source.connect(fly_systems_PlayAudio.context.destination,0,0);
	source.start(0);
};
fly_systems_PlayAudio.prototype = {
	entity: null
	,engine: null
	,info: null
	,update: function(audio) {
		if(!this.info.mute) fly_systems_PlayAudio.playSound(audio.name);
		this.engine.remove(this.entity);
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_PlayAudio
};
var fly_systems_RenderBackground = function(mini,color) {
	this.entityRequirements = null;
	this.componentRequirements = [];
	this.mini = mini;
	this.color = thx_color__$RGB_RGB_$Impl_$.toCSS3(color);
};
fly_systems_RenderBackground.__name__ = ["fly","systems","RenderBackground"];
fly_systems_RenderBackground.__interfaces__ = [edge_ISystem];
fly_systems_RenderBackground.prototype = {
	mini: null
	,color: null
	,update: function() {
		this.mini.fill(thx_color__$RGBA_RGBA_$Impl_$.fromString(this.color));
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_RenderBackground
};
var fly_systems_RenderCountDown = function(mini) {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_CountDown];
	this.mini = mini;
};
fly_systems_RenderCountDown.__name__ = ["fly","systems","RenderCountDown"];
fly_systems_RenderCountDown.__interfaces__ = [edge_ISystem];
fly_systems_RenderCountDown.prototype = {
	mini: null
	,update: function(countDown) {
		this.mini.ctx.font = "160px 'Montserrat', sans-serif";
		this.mini.ctx.textAlign = "center";
		this.mini.ctx.textBaseline = "middle";
		this.mini.ctx.lineWidth = 4;
		this.mini.ctx.strokeStyle = "#FFFFFF";
		this.mini.ctx.fillStyle = "#000000";
		var t = "" + Math.ceil(countDown.time);
		this.mini.ctx.strokeText(t,fly_Config.width / 2,fly_Config.height / 2);
		this.mini.ctx.fillText(t,fly_Config.width / 2,fly_Config.height / 2);
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_RenderCountDown
};
var fly_systems_RenderDroplet = function(mini) {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_Position,fly_components_Droplet];
	this.mini = mini;
};
fly_systems_RenderDroplet.__name__ = ["fly","systems","RenderDroplet"];
fly_systems_RenderDroplet.__interfaces__ = [edge_ISystem];
fly_systems_RenderDroplet.prototype = {
	mini: null
	,update: function(position,droplet) {
		this.mini.dot(position.x + 1,position.y + 1,droplet.radius + 0.5,thx_color__$RGB_RGB_$Impl_$.toRGBA(thx_color__$RGB_RGB_$Impl_$.darker(droplet.color,0.5)));
		this.mini.dot(position.x,position.y,droplet.radius,thx_color__$RGB_RGB_$Impl_$.toRGBA(droplet.color));
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_RenderDroplet
};
var fly_systems_RenderExplosion = function(mini) {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_Position,fly_components_Explosion];
	this.mini = mini;
};
fly_systems_RenderExplosion.__name__ = ["fly","systems","RenderExplosion"];
fly_systems_RenderExplosion.__interfaces__ = [edge_ISystem];
fly_systems_RenderExplosion.prototype = {
	mini: null
	,update: function(position,explosion) {
		explosion.draw(explosion.stage,position,this.mini);
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_RenderExplosion
};
var fly_systems_RenderFlower = function(mini,cells,size) {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_Position,fly_components_Flower];
	this.mini = mini;
	this.size = size;
	this.images = [];
	var src = minicanvas_MiniCanvas.create(size,size);
	var _g = 0;
	while(_g < cells) {
		var cell = _g++;
		this.images.push(fly_systems_RenderFlower.generate(src,size));
	}
};
fly_systems_RenderFlower.__name__ = ["fly","systems","RenderFlower"];
fly_systems_RenderFlower.__interfaces__ = [edge_ISystem];
fly_systems_RenderFlower.generate = function(mini,size) {
	var ctx = mini.ctx;
	var c = size / 2;
	ctx.clearRect(0,0,size,size);
	var n = Std["int"](Math.random() * 6) + 5;
	var r1 = Math.random() * size / 4 + 1;
	var r2 = Math.min(Math.random() * c * n / 10 + r1,c);
	var rp = (r2 - r1) / 2;
	var r = rp + r1;
	var sa = Math.random() * Math.PI;
	var angle = 180 + 200 * Math.random();
	if(angle > 270) angle += 70;
	var pcolor = thx_color__$HSL_HSL_$Impl_$.create(angle,Math.random(),Math.random() * 0.3 + 0.5);
	var _g = 0;
	while(_g < n) {
		var i = _g++;
		var a = sa + Math.PI * 2 * i / n;
		mini.dot(c + Math.cos(a) * r,c + Math.sin(a) * r,rp,thx_color__$HSL_HSL_$Impl_$.toRGBA(pcolor));
	}
	pcolor = thx_color__$HSL_HSL_$Impl_$.lighter(pcolor,Math.random());
	mini.dot(c,c,r1,thx_color__$HSL_HSL_$Impl_$.toRGBA(pcolor));
	var image = new Image();
	image.width = mini.width / 2;
	image.height = mini.height / 2;
	image.src = mini.canvas.toDataURL();
	return image;
};
fly_systems_RenderFlower.prototype = {
	mini: null
	,size: null
	,images: null
	,update: function(position,f) {
		var image = this.images[f.id % this.images.length];
		this.mini.ctx.drawImage(image,position.x - this.size / 2,position.y - this.size / 2,this.size,this.size);
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_RenderFlower
};
var fly_systems_RenderFly = function(mini) {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_Position,fly_components_Fly];
	this.mini = mini;
};
fly_systems_RenderFly.__name__ = ["fly","systems","RenderFly"];
fly_systems_RenderFly.__interfaces__ = [edge_ISystem];
fly_systems_RenderFly.prototype = {
	mini: null
	,update: function(position,f) {
		var p = Math.random() * 6 - 3;
		this.mini.dot(position.x + f.height,position.y + f.height * 2,2.5,68);
		this.mini.dot(position.x - 4.5 - p / 3,position.y + p,2,-285217025);
		this.mini.dot(position.x + 4.5 + p / 3,position.y + p,2,-285217025);
		this.mini.dot(position.x,position.y,1.5,255);
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_RenderFly
};
var fly_systems_RenderGameInfo = function(gameInfo,mini) {
	this.entityRequirements = null;
	this.componentRequirements = [];
	this.mini = mini;
	this.gameInfo = gameInfo;
};
fly_systems_RenderGameInfo.__name__ = ["fly","systems","RenderGameInfo"];
fly_systems_RenderGameInfo.__interfaces__ = [edge_ISystem];
fly_systems_RenderGameInfo.prototype = {
	mini: null
	,gameInfo: null
	,update: function() {
		this.mini.ctx.font = "14px 'Montserrat', sans-serif";
		this.mini.ctx.textBaseline = "bottom";
		this.mini.ctx.textAlign = "left";
		this.mini.ctx.lineWidth = 4;
		this.mini.ctx.strokeStyle = "#FFFFFF";
		this.mini.ctx.fillStyle = "#000000";
		var messages = ["score " + thx_format_NumberFormat.number(this.gameInfo.score,0),"time " + thx_format_NumberFormat.number(this.gameInfo.timeLeft,1),"flies " + thx_format_NumberFormat.number(this.gameInfo.toPassLevel,0),"level " + thx_format_NumberFormat.number(this.gameInfo.level,0)];
		var _g1 = 0;
		var _g = messages.length;
		while(_g1 < _g) {
			var i = _g1++;
			var message = messages[i];
			this.mini.ctx.strokeText(message,10,(1 + i) * 20);
			this.mini.ctx.fillText(message,10,(1 + i) * 20);
		}
		if(this.gameInfo.mute) {
			this.mini.ctx.font = "36px 'FontAwesome'";
			var message1 = String.fromCharCode(61534);
			this.mini.ctx.strokeText(message1,fly_Config.width - 35,38);
			this.mini.ctx.fillText(message1,fly_Config.width - 35,38);
			this.mini.ctx.font = "28px 'FontAwesome'";
			var message2 = String.fromCharCode(61478);
			this.mini.ctx.strokeText(message2,fly_Config.width - 27,34);
			this.mini.ctx.fillText(message2,fly_Config.width - 27,34);
		}
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_RenderGameInfo
};
var fly_systems_RenderMaze = function(ctx,cellSize) {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_Maze];
	this.maxAngleDeviation = 2;
	this.id = -1;
	this.mini = minicanvas_MiniCanvas.create(ctx.canvas.width,ctx.canvas.height);
	this.ctx = ctx;
	this.cellSize = cellSize;
};
fly_systems_RenderMaze.__name__ = ["fly","systems","RenderMaze"];
fly_systems_RenderMaze.__interfaces__ = [edge_ISystem];
fly_systems_RenderMaze.prototype = {
	ctx: null
	,cellSize: null
	,mini: null
	,id: null
	,update: function(maze) {
		if(this.id != maze.id) {
			this.id = maze.id;
			this.render(maze);
		}
		this.ctx.drawImage(this.mini.canvas,0,0,this.mini.width,this.mini.height);
	}
	,render: function(maze) {
		var ctx = this.mini.ctx;
		var cells = maze.maze.cells;
		ctx.lineWidth = 2;
		ctx.lineCap = "round";
		var _g1 = 0;
		var _g = cells.length;
		while(_g1 < _g) {
			var i = _g1++;
			var row = cells[i];
			var _g3 = 0;
			var _g2 = row.length;
			while(_g3 < _g2) {
				var j = _g3++;
				var cell = row[j];
				this.drawCell(cell,i,j,this.cellSize,i == cells.length - 1,j == row.length - 1);
			}
		}
	}
	,createColor: function() {
		return thx_color__$HSLA_HSLA_$Impl_$.create(120 + Math.random() * 20,0.6,0.3,1);
	}
	,drawCell: function(cell,row,col,size,lastRow,lastCol) {
		var ctx = this.mini.ctx;
		if(!lastCol && !(0 != (cell & 2))) this.vinePath(0.5 + (1 + col) * size,0.5 + row * size,0.5 + (1 + col) * size,0.5 + (row + 1) * size,20,Math.random() * 2.5 + 2.5,this.createColor(),40);
		if(!lastRow && !(0 != (cell & 4))) this.vinePath(0.5 + col * size,0.5 + (1 + row) * size,0.5 + (col + 1) * size,0.5 + (1 + row) * size,20,Math.random() * 2.5 + 2.5,this.createColor(),40);
	}
	,fdist: function(x0,y0,x1,y1) {
		return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
	}
	,fangle: function(max) {
		return (Math.random() * max - max / 2) * Math.PI / 180;
	}
	,maxAngleDeviation: null
	,vinePath: function(x0,y0,x1,y1,dist,width,color,maxAngle) {
		if(width < 0.5) return;
		var ctx = this.mini.ctx;
		var d = this.fdist(x0,y0,x1,y1);
		var branches = [];
		var angle;
		ctx.beginPath();
		ctx.strokeStyle = thx_color__$HSLA_HSLA_$Impl_$.toCSS3(color);
		ctx.lineWidth = width;
		ctx.moveTo(x0,y0);
		while(d >= dist) {
			angle = Math.atan2(y1 - y0,x1 - x0);
			angle += this.fangle(maxAngle);
			d = Math.random() * dist;
			x0 += Math.cos(angle) * d;
			y0 += Math.sin(angle) * d;
			ctx.lineTo(x0,y0);
			if(Math.random() < 1) {
				angle += this.fangle(maxAngle);
				d = Math.random() * d;
				branches.push({ x0 : x0, y0 : y0, x1 : x0 + Math.cos(angle) * d, y1 : y0 + Math.sin(angle) * d, d : d, width : width * Math.random() * 0.1 + 0.9});
			}
			d = this.fdist(x0,y0,x1,y1);
		}
		ctx.lineTo(x1,y1);
		ctx.stroke();
		var _g = 0;
		while(_g < branches.length) {
			var branch = branches[_g];
			++_g;
			this.vinePath(branch.x0,branch.y0,branch.x1,branch.y1,branch.d,branch.width,thx_color__$HSLA_HSLA_$Impl_$.lighter(color,0.1),Math.min(maxAngle * this.maxAngleDeviation,90));
		}
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_RenderMaze
};
var fly_systems_RenderSnake = function(mini) {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_Position,fly_components_Snake];
	this.mini = mini;
};
fly_systems_RenderSnake.__name__ = ["fly","systems","RenderSnake"];
fly_systems_RenderSnake.__interfaces__ = [edge_ISystem];
fly_systems_RenderSnake.prototype = {
	mini: null
	,update: function(position,snake) {
		var _g = this;
		var pos = 0;
		var len = snake.trail.length;
		snake.map(function(a,b) {
			var s = thx_core_Floats.interpolate(pos / len,snake.trailWidth,snake.headWidth);
			_g.mini.ctx.lineCap = "round";
			_g.mini.line(a.x,a.y,b.x,b.y,s * _g.sizeMult(len - pos,snake.jumping),thx_color__$RGBA_RGBA_$Impl_$.fromString(snake.colors[pos % snake.colors.length]));
			pos++;
		});
		this.mini.dot(position.x,position.y,snake.headWidth * this.sizeMult(0,snake.jumping) / 1.5,thx_color__$RGBA_RGBA_$Impl_$.fromString(snake.colors[pos % snake.colors.length]));
	}
	,sizeMult: function(p,jumpings) {
		var m = 1.0;
		var _g = 0;
		while(_g < jumpings.length) {
			var j = jumpings[_g];
			++_g;
			if(j == p) m = Math.max(m,4); else if(j + 1 == p || j - 1 == p) m = Math.max(m,3.75); else if(j + 2 == p || j - 2 == p) m = Math.max(m,3.5); else if(j + 3 == p || j - 3 == p) m = Math.max(m,2.5); else if(j + 4 == p || j - 4 == p) m = Math.max(m,1.5); else if(j + 5 == p || j - 5 == p) m = Math.max(m,1.25);
		}
		return m;
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_RenderSnake
};
var fly_systems_SnakeEats = function(gameInfo,distance) {
	this.entityRequirements = [{ name : "position", cls : fly_components_Position},{ name : "edible", cls : fly_components_Edible}];
	this.componentRequirements = [fly_components_Position,fly_components_Snake];
	this.sqdistance = distance * distance;
	this.gameInfo = gameInfo;
};
fly_systems_SnakeEats.__name__ = ["fly","systems","SnakeEats"];
fly_systems_SnakeEats.__interfaces__ = [edge_ISystem];
fly_systems_SnakeEats.prototype = {
	engine: null
	,sqdistance: null
	,entities: null
	,gameInfo: null
	,update: function(position,snake) {
		var dx;
		var dy;
		var $it0 = this.entities;
		while( $it0.hasNext() ) {
			var o = $it0.next();
			dx = position.x - o.position.x;
			dy = position.y - o.position.y;
			if(dx * dx + dy * dy <= this.sqdistance) {
				this.engine.remove(o.entity);
				if(o.edible.makeJump) snake.jumping.push(0);
				if(o.edible.makeDroplet) this.engine.add(new edge_Entity([new fly_components_Position(position.x,position.y),new fly_components_DelayedComponents(50,[fly_components_Droplet.create()],[fly_components_DelayedComponents])]));
				this.engine.add(new edge_Entity([new fly_components_DelayedComponents(50,[fly_components_Audio.poop],[])]));
				this.gameInfo.score += o.edible.score;
				if(o.edible.countToPassLevel) {
					this.gameInfo.toPassLevel--;
					this.engine.add(new edge_Entity([fly_components_Audio.eatFly]));
				} else this.engine.add(new edge_Entity([fly_components_Audio.eatFlower]));
			}
		}
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_SnakeEats
};
var fly_systems_UpdateCountDown = function(callback) {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_CountDown];
	this.callback = callback;
};
fly_systems_UpdateCountDown.__name__ = ["fly","systems","UpdateCountDown"];
fly_systems_UpdateCountDown.__interfaces__ = [edge_ISystem];
fly_systems_UpdateCountDown.prototype = {
	timeDelta: null
	,entity: null
	,engine: null
	,callback: null
	,update: function(countDown) {
		countDown.time -= this.timeDelta / 1000;
		if(countDown.time > 0) return;
		this.engine.remove(this.entity);
		this.callback();
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_UpdateCountDown
};
var fly_systems_UpdateDelayedComponents = function() {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_DelayedComponents];
};
fly_systems_UpdateDelayedComponents.__name__ = ["fly","systems","UpdateDelayedComponents"];
fly_systems_UpdateDelayedComponents.__interfaces__ = [edge_ISystem];
fly_systems_UpdateDelayedComponents.prototype = {
	entity: null
	,update: function(item) {
		if(item.ticks <= 0) {
			this.entity.removeTypes(item.toRemove);
			this.entity.addMany(item.toAdd);
		} else item.ticks--;
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_UpdateDelayedComponents
};
var fly_systems_UpdateDetonation = function(gameInfo,scoreDivisor) {
	this.entityRequirements = [{ name : "position", cls : fly_components_Position},{ name : "edible", cls : fly_components_Edible}];
	this.componentRequirements = [fly_components_Detonation,fly_components_Position];
	this.gameInfo = gameInfo;
	this.scoreDivisor = scoreDivisor;
};
fly_systems_UpdateDetonation.__name__ = ["fly","systems","UpdateDetonation"];
fly_systems_UpdateDetonation.__interfaces__ = [edge_ISystem];
fly_systems_UpdateDetonation.prototype = {
	entity: null
	,engine: null
	,entities: null
	,gameInfo: null
	,scoreDivisor: null
	,update: function(detonation,position) {
		var sqdistance = detonation.radius * detonation.radius;
		var dx;
		var dy;
		var $it0 = this.entities;
		while( $it0.hasNext() ) {
			var o = $it0.next();
			dx = position.x - o.position.x;
			dy = position.y - o.position.y;
			if(dx * dx + dy * dy <= sqdistance) {
				this.engine.remove(o.entity);
				this.gameInfo.score += Math.round(o.edible.score / this.scoreDivisor);
				if(o.edible.countToPassLevel) this.gameInfo.toPassLevel--;
			}
		}
		this.entity.remove(detonation);
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_UpdateDetonation
};
var fly_systems_UpdateDroplet = function() {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_Droplet];
};
fly_systems_UpdateDroplet.__name__ = ["fly","systems","UpdateDroplet"];
fly_systems_UpdateDroplet.__interfaces__ = [edge_ISystem];
fly_systems_UpdateDroplet.prototype = {
	entity: null
	,update: function(droplet) {
		droplet.life--;
		if(droplet.life <= 0) {
			this.entity.remove(droplet);
			this.entity.add(fly_components_Explosion.create());
		}
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_UpdateDroplet
};
var fly_systems_UpdateExplosion = function() {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_Explosion];
};
fly_systems_UpdateExplosion.__name__ = ["fly","systems","UpdateExplosion"];
fly_systems_UpdateExplosion.__interfaces__ = [edge_ISystem];
fly_systems_UpdateExplosion.prototype = {
	entity: null
	,engine: null
	,update: function(explosion) {
		if(explosion.stage == fly_components_Explosion.maxStage) {
			this.entity.add(fly_components_Detonation.instance);
			this.engine.add(new edge_Entity([fly_components_Audio.get_explosion()]));
		}
		explosion.stage--;
		if(explosion.stage <= 0) this.engine.remove(this.entity);
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_UpdateExplosion
};
var fly_systems_UpdateFly = function(width,height,gen) {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_Position,fly_components_Fly];
	this.width = width;
	this.height = height;
	this.gen = gen;
};
fly_systems_UpdateFly.__name__ = ["fly","systems","UpdateFly"];
fly_systems_UpdateFly.__interfaces__ = [edge_ISystem];
fly_systems_UpdateFly.prototype = {
	width: null
	,height: null
	,gen: null
	,update: function(position,fly1) {
		position.x = Math.min(Math.max(0,position.x + 2 - this.gen["float"]() * 4),this.width);
		position.y = Math.min(Math.max(0,position.y + 2 - this.gen["float"]() * 4),this.height);
		fly1.height = Math.min(Math.max(0,fly1.height + this.gen["float"]() - 0.5),6);
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_UpdateFly
};
var fly_systems_UpdateGameInfo = function(gameInfo,endLevel) {
	this.entityRequirements = null;
	this.componentRequirements = [];
	this.gameInfo = gameInfo;
	this.endLevel = endLevel;
};
fly_systems_UpdateGameInfo.__name__ = ["fly","systems","UpdateGameInfo"];
fly_systems_UpdateGameInfo.__interfaces__ = [edge_ISystem];
fly_systems_UpdateGameInfo.prototype = {
	gameInfo: null
	,timeDelta: null
	,endLevel: null
	,update: function() {
		this.gameInfo.timeLeft -= this.timeDelta / 1000;
		if(this.gameInfo.toPassLevel <= 0) {
			this.gameInfo.score += Math.ceil(this.gameInfo.timeLeft * 10);
			this.endLevel(true);
		}
		if(this.gameInfo.timeLeft <= 0) {
			this.gameInfo.timeLeft = 0;
			this.endLevel(false);
		}
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_UpdateGameInfo
};
var fly_systems_UpdatePosition = function() {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_Position,fly_components_Direction,fly_components_Velocity];
};
fly_systems_UpdatePosition.__name__ = ["fly","systems","UpdatePosition"];
fly_systems_UpdatePosition.__interfaces__ = [edge_ISystem];
fly_systems_UpdatePosition.prototype = {
	update: function(position,direction,velocity) {
		position.x += direction.get_dx() * velocity.value;
		position.y += direction.get_dy() * velocity.value;
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_UpdatePosition
};
var fly_systems_UpdateSnake = function() {
	this.entityRequirements = null;
	this.componentRequirements = [fly_components_Position,fly_components_Snake];
};
fly_systems_UpdateSnake.__name__ = ["fly","systems","UpdateSnake"];
fly_systems_UpdateSnake.__interfaces__ = [edge_ISystem];
fly_systems_UpdateSnake.prototype = {
	update: function(position,snake) {
		var last = snake.pos + 1;
		if(last >= snake.trail.length) last = 0;
		var tx = snake.trail[last].x;
		var ty = snake.trail[last].y;
		snake.trail[snake.pos].x = position.x;
		snake.trail[snake.pos].y = position.y;
		snake.pos++;
		if(snake.pos >= snake.trail.length) snake.pos = 0;
		var i = snake.jumping.length;
		while(--i >= 0) {
			snake.jumping[i]++;
			if(snake.jumping[i] == snake.trail.length) snake.jumping.pop();
		}
	}
	,componentRequirements: null
	,entityRequirements: null
	,__class__: fly_systems_UpdateSnake
};
var fly_util_Cookie = function() { };
fly_util_Cookie.__name__ = ["fly","util","Cookie"];
fly_util_Cookie.create = function(name,value,days) {
	if(days == null) days = 0.0;
	var expires;
	if(days > 0) {
		var date = DateTools.delta(new Date(),days * 24 * 60 * 60 * 1000);
		expires = "; expires=" + date.toGMTString();
	} else expires = "";
	window.document.cookie = name + "=" + value + expires + "; path=/";
};
fly_util_Cookie.read = function(name) {
	var nameEQ = name + "=";
	var ca = window.document.cookie.split(";");
	var c;
	var _g1 = 0;
	var _g = ca.length;
	while(_g1 < _g) {
		var i = _g1++;
		c = ca[i];
		while(c.charAt(0) == " ") c = c.substring(1,c.length);
		if(c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
};
var fly_util_Persona = function() { };
fly_util_Persona.__name__ = ["fly","util","Persona"];
fly_util_Persona.create = function() {
	var n = Math.floor(Math.random() * 3);
	return ((function($this) {
		var $r;
		var _g = [];
		{
			var _g1 = 0;
			while(_g1 < n) {
				var _ = _g1++;
				_g.push(thx_core_Arrays.sampleOne(fly_util_Persona.adjectives));
			}
		}
		$r = _g;
		return $r;
	}(this))).concat([thx_core_Arrays.sampleOne(fly_util_Persona.nouns)]).join(" ");
};
var haxe_ds_ObjectMap = function() {
	this.h = { };
	this.h.__keys__ = { };
};
haxe_ds_ObjectMap.__name__ = ["haxe","ds","ObjectMap"];
haxe_ds_ObjectMap.__interfaces__ = [haxe_IMap];
haxe_ds_ObjectMap.prototype = {
	h: null
	,set: function(key,value) {
		var id = key.__id__ || (key.__id__ = ++haxe_ds_ObjectMap.count);
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
	,remove: function(key) {
		var id = key.__id__;
		if(this.h.__keys__[id] == null) return false;
		delete(this.h[id]);
		delete(this.h.__keys__[id]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h.__keys__ ) {
		if(this.h.hasOwnProperty(key)) a.push(this.h.__keys__[key]);
		}
		return HxOverrides.iter(a);
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref[i.__id__];
		}};
	}
	,__class__: haxe_ds_ObjectMap
};
var haxe_ds__$StringMap_StringMapIterator = function(map,keys) {
	this.map = map;
	this.keys = keys;
	this.index = 0;
	this.count = keys.length;
};
haxe_ds__$StringMap_StringMapIterator.__name__ = ["haxe","ds","_StringMap","StringMapIterator"];
haxe_ds__$StringMap_StringMapIterator.prototype = {
	map: null
	,keys: null
	,index: null
	,count: null
	,hasNext: function() {
		return this.index < this.count;
	}
	,next: function() {
		return this.map.get(this.keys[this.index++]);
	}
	,__class__: haxe_ds__$StringMap_StringMapIterator
};
var minicanvas_MiniCanvas = function(width,height,scaleMode) {
	this.scaleMode = scaleMode;
	this.width = width;
	this.height = height;
	this.processScale();
	this.startTime = performance.now();
	this.events = new haxe_ds_StringMap();
	this.init();
};
minicanvas_MiniCanvas.__name__ = ["minicanvas","MiniCanvas"];
minicanvas_MiniCanvas.envIsNode = function() {
	return typeof module !== 'undefined' && module.exports;
};
minicanvas_MiniCanvas.create = function(width,height,scaleMode) {
	if(minicanvas_MiniCanvas.envIsNode()) return new minicanvas_NodeCanvas(width,height,scaleMode); else return new minicanvas_BrowserCanvas(width,height,scaleMode);
};
minicanvas_MiniCanvas.prototype = {
	isNode: null
	,isBrowser: null
	,width: null
	,height: null
	,scaleMode: null
	,canvas: null
	,ctx: null
	,startTime: null
	,deltaTime: null
	,events: null
	,display: function(name) {
		this.deltaTime = performance.now() - this.startTime;
		if(!minicanvas_MiniCanvas.displayGenerationTime) console.log("generated \"" + name + "\" in " + thx_core_Floats.roundTo(this.deltaTime,2) + "ms");
		this.nativeDisplay(name);
		return this;
	}
	,clear: function() {
		this.ctx.clearRect(0,0,this.width,this.height);
		return this;
	}
	,dot: function(x,y,radius,color) {
		if(radius == null) radius = 3.0;
		this.ctx.beginPath();
		this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString((function($this) {
			var $r;
			var t;
			{
				var _0 = color;
				if(null == _0) t = null; else t = _0;
			}
			$r = t != null?t:thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(204,51,0,1)");
			return $r;
		}(this)));
		this.ctx.arc(x,y,radius,0,Math.PI * 2,true);
		this.ctx.fill();
		return this;
	}
	,fill: function(color) {
		this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(color);
		this.ctx.fillRect(0,0,this.width,this.height);
		return this;
	}
	,line: function(x0,y0,x1,y1,weight,color) {
		if(weight == null) weight = 1.0;
		this.ctx.lineWidth = weight;
		var t;
		var _0 = color;
		if(null == _0) t = null; else t = _0;
		if(t != null) this.ctx.strokeStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(t); else this.ctx.strokeStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(0,0,0,1)"));
		this.ctx.beginPath();
		this.ctx.moveTo(x0,y0);
		this.ctx.lineTo(x1,y1);
		this.ctx.stroke();
		return this;
	}
	,onKeyUp: function(callback) {
		var _g = this;
		this._keyUp = { listener : function(e) {
			_g.keyUp(e.keyCode);
		}, callback : callback};
		if(this.isBrowser) {
			if(minicanvas_BrowserCanvas.attachKeyEventsToCanvas) {
				this.canvas.setAttribute("tabIndex","1");
				this.canvas.addEventListener("keyup",this._keyUp.listener);
			} else window.addEventListener("keyup",this._keyUp.listener);
		}
		return this;
	}
	,offKeyUp: function() {
		if(this.isBrowser && null != this._keyUp) {
			if(minicanvas_BrowserCanvas.attachKeyEventsToCanvas) {
				this.canvas.removeAttribute("tabIndex");
				this.canvas.removeEventListener("keyup",this._keyUp.listener);
			} else window.removeEventListener("keyup",this._keyUp.listener);
		}
		this._keyUp = null;
		return this;
	}
	,keyUp: function(keyCode) {
		if(null != this._keyUp) this._keyUp.callback({ mini : this, keyCode : keyCode});
		return this;
	}
	,getDevicePixelRatio: function() {
		throw "abstract method getDevicePixelRatio()";
	}
	,getBackingStoreRatio: function() {
		throw "abstract method getBackingStoreRatio()";
	}
	,init: function() {
		throw "abstract method init()";
		return;
	}
	,nativeDisplay: function(name) {
		throw "abstract method nativeDisplay()";
		return;
	}
	,processScale: function() {
		var _g = this.scaleMode;
		switch(_g[1]) {
		case 1:
			var ratio = this.getDevicePixelRatio() / this.getBackingStoreRatio();
			if(ratio != 1) this.scaleMode = minicanvas_ScaleMode.Scaled(ratio); else this.scaleMode = minicanvas_ScaleMode.NoScale;
			break;
		default:
		}
	}
	,_keyUp: null
	,_keyDown: null
	,__class__: minicanvas_MiniCanvas
};
var minicanvas_ScaleMode = { __ename__ : true, __constructs__ : ["NoScale","Auto","Scaled"] };
minicanvas_ScaleMode.NoScale = ["NoScale",0];
minicanvas_ScaleMode.NoScale.__enum__ = minicanvas_ScaleMode;
minicanvas_ScaleMode.Auto = ["Auto",1];
minicanvas_ScaleMode.Auto.__enum__ = minicanvas_ScaleMode;
minicanvas_ScaleMode.Scaled = function(v) { var $x = ["Scaled",2,v]; $x.__enum__ = minicanvas_ScaleMode; return $x; };
var minicanvas_BrowserCanvas = function(width,height,scaleMode) {
	this.isNode = false;
	this.isBrowser = true;
	if(null == scaleMode) scaleMode = minicanvas_BrowserCanvas.defaultScaleMode;
	minicanvas_MiniCanvas.call(this,width,height,scaleMode);
};
minicanvas_BrowserCanvas.__name__ = ["minicanvas","BrowserCanvas"];
minicanvas_BrowserCanvas.devicePixelRatio = function() {
	return window.devicePixelRatio || 1;
};
minicanvas_BrowserCanvas.backingStoreRatio = function() {
	if(minicanvas_BrowserCanvas._backingStoreRatio == 0) {
		var canvas;
		var _this = window.document;
		canvas = _this.createElement("canvas");
		var context = canvas.getContext("2d");
		minicanvas_BrowserCanvas._backingStoreRatio = (function(c) {
        return c.webkitBackingStorePixelRatio ||
          c.mozBackingStorePixelRatio ||
          c.msBackingStorePixelRatio ||
          c.oBackingStorePixelRatio ||
          c.backingStorePixelRatio || 1;
        })(context);
	}
	return minicanvas_BrowserCanvas._backingStoreRatio;
};
minicanvas_BrowserCanvas.__super__ = minicanvas_MiniCanvas;
minicanvas_BrowserCanvas.prototype = $extend(minicanvas_MiniCanvas.prototype,{
	append: function(name) {
		var figure = window.document.createElement("figure");
		var caption = window.document.createElement("figcaption");
		figure.className = "minicanvas";
		figure.appendChild(this.canvas);
		caption.innerHTML = thx_core_Strings.humanize(name) + (minicanvas_MiniCanvas.displayGenerationTime?" <span class=\"info\">(" + thx_core_Floats.roundTo(this.deltaTime,2) + "ms)</span>":"");
		figure.appendChild(caption);
		minicanvas_BrowserCanvas.parentNode.appendChild(figure);
		if(null != this._keyUp || null != this._keyDown) this.canvas.focus();
	}
	,init: function() {
		var _this = window.document;
		this.canvas = _this.createElement("canvas");
		{
			var _g = this.scaleMode;
			switch(_g[1]) {
			case 2:
				var v = _g[2];
				this.canvas.width = Math.round(this.width * v);
				this.canvas.height = Math.round(this.height * v);
				this.canvas.style.width = "" + this.width + "px";
				this.canvas.style.height = "" + this.height + "px";
				this.ctx = this.canvas.getContext("2d");
				this.ctx.scale(v,v);
				break;
			default:
				this.canvas.width = this.width;
				this.canvas.height = this.height;
				this.ctx = this.canvas.getContext("2d");
			}
		}
	}
	,getDevicePixelRatio: function() {
		return minicanvas_BrowserCanvas.devicePixelRatio();
	}
	,getBackingStoreRatio: function() {
		return minicanvas_BrowserCanvas.backingStoreRatio();
	}
	,nativeDisplay: function(name) {
		this.append(name);
	}
	,__class__: minicanvas_BrowserCanvas
});
var minicanvas_NodeCanvas = function(width,height,scaleMode) {
	this.hasFrames = false;
	this.isNode = true;
	this.isBrowser = false;
	if(null == scaleMode) scaleMode = minicanvas_NodeCanvas.defaultScaleMode;
	minicanvas_MiniCanvas.call(this,width,height,scaleMode);
};
minicanvas_NodeCanvas.__name__ = ["minicanvas","NodeCanvas"];
minicanvas_NodeCanvas.create = function(width,height,scaleMode) {
	return new minicanvas_MiniCanvas(width,height,scaleMode);
};
minicanvas_NodeCanvas.__super__ = minicanvas_MiniCanvas;
minicanvas_NodeCanvas.prototype = $extend(minicanvas_MiniCanvas.prototype,{
	save: function(name) {
		var encoder = this.ensureEncoder();
		encoder.addFrame(this.ctx);
		encoder.save(name,function(file) {
			console.log("saved " + file);
		});
	}
	,hasFrames: null
	,init: function() {
		var Canvas = require("canvas");
		{
			var _g = this.scaleMode;
			switch(_g[1]) {
			case 2:
				var v = _g[2];
				this.canvas = new Canvas(this.width * v,this.height * v);
				this.ctx = this.canvas.getContext("2d");
				this.ctx.scale(v,v);
				break;
			default:
				this.canvas = new Canvas(this.width,this.height);
				this.ctx = this.canvas.getContext("2d");
			}
		}
	}
	,getDevicePixelRatio: function() {
		return 1.0;
	}
	,getBackingStoreRatio: function() {
		return 1.0;
	}
	,nativeDisplay: function(name) {
		this.save(name);
	}
	,encoder: null
	,ensureEncoder: function() {
		if(null != this.encoder) return this.encoder;
		if(this.hasFrames) return this.encoder = new minicanvas_node_GifEncoder(this.width,this.height); else return this.encoder = new minicanvas_node_PNGEncoder(this.canvas);
	}
	,__class__: minicanvas_NodeCanvas
});
var minicanvas_node_IEncoder = function() { };
minicanvas_node_IEncoder.__name__ = ["minicanvas","node","IEncoder"];
minicanvas_node_IEncoder.prototype = {
	addFrame: null
	,save: null
	,__class__: minicanvas_node_IEncoder
};
var minicanvas_node_GifEncoder = function(width,height) {
	this.frames = 0;
	this.encoder = (function(w, h, self) {
      var GIFEncoder = require('gifencoder'),
          encoder = new GIFEncoder(w, h);
      self.stream = encoder.createReadStream();
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(50);
      encoder.setQuality(10);
      return encoder;
    })(width,height,this);
};
minicanvas_node_GifEncoder.__name__ = ["minicanvas","node","GifEncoder"];
minicanvas_node_GifEncoder.__interfaces__ = [minicanvas_node_IEncoder];
minicanvas_node_GifEncoder.prototype = {
	encoder: null
	,stream: null
	,frames: null
	,addFrame: function(ctx) {
		this.encoder.addFrame(ctx);
		this.frames++;
	}
	,save: function(name,callback) {
		this.stream.pipe(require("fs").createWriteStream("" + minicanvas_NodeCanvas.imagePath + "/" + name + ".gif"));
		callback("" + name + ".gif (frames " + this.frames + ")");
	}
	,__class__: minicanvas_node_GifEncoder
};
var minicanvas_node_PNGEncoder = function(canvas) {
	this.canvas = canvas;
};
minicanvas_node_PNGEncoder.__name__ = ["minicanvas","node","PNGEncoder"];
minicanvas_node_PNGEncoder.__interfaces__ = [minicanvas_node_IEncoder];
minicanvas_node_PNGEncoder.prototype = {
	canvas: null
	,addFrame: function(ctx) {
	}
	,save: function(name,callback) {
		var fs = require("fs");
		var out = fs.createWriteStream("" + minicanvas_NodeCanvas.imagePath + "/" + name + ".png");
		var stream = this.canvas.pngStream();
		stream.on("data",function(chunk) {
			out.write(chunk);
		});
		stream.on("end",function(_) {
			callback("" + name + ".png");
		});
	}
	,__class__: minicanvas_node_PNGEncoder
};
var thx_color__$HSL_HSL_$Impl_$ = {};
thx_color__$HSL_HSL_$Impl_$.__name__ = ["thx","color","_HSL","HSL_Impl_"];
thx_color__$HSL_HSL_$Impl_$.create = function(hue,saturation,lightness) {
	var channels = [thx_core_Floats.wrapCircular(hue,360),saturation < 0?0:saturation > 1?1:saturation,lightness < 0?0:lightness > 1?1:lightness];
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.lighter = function(this1,t) {
	var channels = [this1[0],this1[1],thx_core_Floats.interpolate(t,this1[2],1)];
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$HSL_HSL_$Impl_$.toRGBXA(this1));
};
thx_color__$HSL_HSL_$Impl_$.toRGBX = function(this1) {
	var channels = [thx_color__$HSL_HSL_$Impl_$._c(this1[0] + 120,this1[1],this1[2]),thx_color__$HSL_HSL_$Impl_$._c(this1[0],this1[1],this1[2]),thx_color__$HSL_HSL_$Impl_$._c(this1[0] - 120,this1[1],this1[2])];
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$._c = function(d,s,l) {
	var m2;
	if(l <= 0.5) m2 = l * (1 + s); else m2 = l + s - l * s;
	var m1 = 2 * l - m2;
	d = thx_core_Floats.wrapCircular(d,360);
	if(d < 60) return m1 + (m2 - m1) * d / 60; else if(d < 180) return m2; else if(d < 240) return m1 + (m2 - m1) * (240 - d) / 60; else return m1;
};
var thx_color__$HSLA_HSLA_$Impl_$ = {};
thx_color__$HSLA_HSLA_$Impl_$.__name__ = ["thx","color","_HSLA","HSLA_Impl_"];
thx_color__$HSLA_HSLA_$Impl_$.create = function(hue,saturation,lightness,alpha) {
	var channels = [thx_core_Floats.wrapCircular(hue,360),saturation < 0?0:saturation > 1?1:saturation,lightness < 0?0:lightness > 1?1:lightness,alpha < 0?0:alpha > 1?1:alpha];
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.lighter = function(this1,t) {
	var channels = [this1[0],this1[1],thx_core_Floats.interpolate(t,this1[2],1),this1[3]];
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.toCSS3 = function(this1) {
	return thx_color__$HSLA_HSLA_$Impl_$.toString(this1);
};
thx_color__$HSLA_HSLA_$Impl_$.toString = function(this1) {
	return "hsla(" + this1[0] + "," + this1[1] * 100 + "%," + this1[2] * 100 + "%," + this1[3] + ")";
};
var thx_color__$RGB_RGB_$Impl_$ = {};
thx_color__$RGB_RGB_$Impl_$.__name__ = ["thx","color","_RGB","RGB_Impl_"];
thx_color__$RGB_RGB_$Impl_$.create = function(red,green,blue) {
	return (red & 255) << 16 | (green & 255) << 8 | blue & 255;
};
thx_color__$RGB_RGB_$Impl_$.createf = function(red,green,blue) {
	return thx_color__$RGB_RGB_$Impl_$.create(Math.round(red * 255),Math.round(green * 255),Math.round(blue * 255));
};
thx_color__$RGB_RGB_$Impl_$.fromInts = function(arr) {
	thx_core_ArrayInts.resize(arr,3);
	return thx_color__$RGB_RGB_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$RGB_RGB_$Impl_$.darker = function(this1,t) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$RGBX_RGBX_$Impl_$.darker(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1),t));
};
thx_color__$RGB_RGB_$Impl_$.withAlpha = function(this1,alpha) {
	return thx_color__$RGBA_RGBA_$Impl_$.fromInts([thx_color__$RGB_RGB_$Impl_$.get_red(this1),thx_color__$RGB_RGB_$Impl_$.get_green(this1),thx_color__$RGB_RGB_$Impl_$.get_blue(this1),alpha]);
};
thx_color__$RGB_RGB_$Impl_$.toCSS3 = function(this1) {
	return "rgb(" + thx_color__$RGB_RGB_$Impl_$.get_red(this1) + "," + thx_color__$RGB_RGB_$Impl_$.get_green(this1) + "," + thx_color__$RGB_RGB_$Impl_$.get_blue(this1) + ")";
};
thx_color__$RGB_RGB_$Impl_$.toRGBX = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.fromInts([thx_color__$RGB_RGB_$Impl_$.get_red(this1),thx_color__$RGB_RGB_$Impl_$.get_green(this1),thx_color__$RGB_RGB_$Impl_$.get_blue(this1)]);
};
thx_color__$RGB_RGB_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGB_RGB_$Impl_$.withAlpha(this1,255);
};
thx_color__$RGB_RGB_$Impl_$.get_red = function(this1) {
	return this1 >> 16 & 255;
};
thx_color__$RGB_RGB_$Impl_$.get_green = function(this1) {
	return this1 >> 8 & 255;
};
thx_color__$RGB_RGB_$Impl_$.get_blue = function(this1) {
	return this1 & 255;
};
var thx_color__$RGBA_RGBA_$Impl_$ = {};
thx_color__$RGBA_RGBA_$Impl_$.__name__ = ["thx","color","_RGBA","RGBA_Impl_"];
thx_color__$RGBA_RGBA_$Impl_$.create = function(red,green,blue,alpha) {
	return (red & 255) << 24 | (green & 255) << 16 | (blue & 255) << 8 | alpha & 255;
};
thx_color__$RGBA_RGBA_$Impl_$.fromFloats = function(arr) {
	var ints = thx_core_ArrayFloats.resize(arr,4).map(function(_) {
		return Math.round(_ * 255);
	});
	return thx_color__$RGBA_RGBA_$Impl_$.create(ints[0],ints[1],ints[2],ints[3]);
};
thx_color__$RGBA_RGBA_$Impl_$.fromInts = function(arr) {
	thx_core_ArrayInts.resize(arr,4);
	return thx_color__$RGBA_RGBA_$Impl_$.create(arr[0],arr[1],arr[2],arr[3]);
};
thx_color__$RGBA_RGBA_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseHex(color);
	if(null == info) info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "rgb":
			return thx_color__$RGB_RGB_$Impl_$.toRGBA(thx_color__$RGB_RGB_$Impl_$.fromInts(thx_color_parse_ColorParser.getInt8Channels(info.channels,3)));
		case "rgba":
			return thx_color__$RGBA_RGBA_$Impl_$.create(thx_color_parse_ColorParser.getInt8Channel(info.channels[0]),thx_color_parse_ColorParser.getInt8Channel(info.channels[1]),thx_color_parse_ColorParser.getInt8Channel(info.channels[2]),Math.round(thx_color_parse_ColorParser.getFloatChannel(info.channels[3]) * 255));
		default:
			return null;
		}
	} catch( e ) {
		return null;
	}
};
thx_color__$RGBA_RGBA_$Impl_$.toString = function(this1) {
	return "rgba(" + (this1 >> 24 & 255) + "," + (this1 >> 16 & 255) + "," + (this1 >> 8 & 255) + "," + (this1 & 255) / 255 + ")";
};
var thx_color__$RGBX_RGBX_$Impl_$ = {};
thx_color__$RGBX_RGBX_$Impl_$.__name__ = ["thx","color","_RGBX","RGBX_Impl_"];
thx_color__$RGBX_RGBX_$Impl_$.create = function(red,green,blue) {
	return [red < 0?0:red > 1?1:red,green < 0?0:green > 1?1:green,blue < 0?0:blue > 1?1:blue];
};
thx_color__$RGBX_RGBX_$Impl_$.fromInts = function(arr) {
	thx_core_ArrayInts.resize(arr,3);
	return thx_color__$RGBX_RGBX_$Impl_$.create(arr[0] / 255,arr[1] / 255,arr[2] / 255);
};
thx_color__$RGBX_RGBX_$Impl_$.darker = function(this1,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],0),thx_core_Floats.interpolate(t,this1[1],0),thx_core_Floats.interpolate(t,this1[2],0)];
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.withAlpha = function(this1,alpha) {
	var channels = this1.concat([alpha < 0?0:alpha > 1?1:alpha]);
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGB_RGB_$Impl_$.createf(this1[0],this1[1],this1[2]);
};
thx_color__$RGBX_RGBX_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.withAlpha(this1,1.0);
};
var thx_color__$RGBXA_RGBXA_$Impl_$ = {};
thx_color__$RGBXA_RGBXA_$Impl_$.__name__ = ["thx","color","_RGBXA","RGBXA_Impl_"];
thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBA_RGBA_$Impl_$.fromFloats([this1[0],this1[1],this1[2],this1[3]]);
};
var thx_color_parse_ColorParser = function() {
	this.pattern_color = new EReg("^\\s*([^(]+)\\s*\\(([^)]*)\\)\\s*$","i");
	this.pattern_channel = new EReg("^\\s*(\\d*.\\d+|\\d+)(%|deg|rad)?\\s*$","i");
};
thx_color_parse_ColorParser.__name__ = ["thx","color","parse","ColorParser"];
thx_color_parse_ColorParser.parseColor = function(s) {
	return thx_color_parse_ColorParser.parser.processColor(s);
};
thx_color_parse_ColorParser.parseHex = function(s) {
	return thx_color_parse_ColorParser.parser.processHex(s);
};
thx_color_parse_ColorParser.getInt8Channels = function(channels,length) {
	if(length != channels.length) throw "invalid number of channels, expected " + length + " but it is " + channels.length;
	return channels.map(thx_color_parse_ColorParser.getInt8Channel);
};
thx_color_parse_ColorParser.getFloatChannel = function(channel,useInt8) {
	if(useInt8 == null) useInt8 = true;
	switch(channel[1]) {
	case 5:
		var v = channel[2];
		if(v) return 1; else return 0;
		break;
	case 1:
		var v1 = channel[2];
		return v1;
	case 4:
		var v2 = channel[2];
		return v2;
	case 2:
		var v3 = channel[2];
		return v3;
	case 3:
		var v4 = channel[2];
		if(useInt8) return v4 / 255; else {
			var v5 = channel[2];
			return v5;
		}
		break;
	case 0:
		var v6 = channel[2];
		return v6 / 100;
	}
};
thx_color_parse_ColorParser.getInt8Channel = function(channel) {
	switch(channel[1]) {
	case 5:
		var v = channel[2];
		if(v) return 1; else return 0;
		break;
	case 3:
		var v1 = channel[2];
		return v1;
	case 0:
		var v2 = channel[2];
		return Math.round(255 * v2 / 100);
	default:
		throw "unable to extract a valid int8 value";
	}
};
thx_color_parse_ColorParser.prototype = {
	pattern_color: null
	,pattern_channel: null
	,processHex: function(s) {
		if(!thx_color_parse_ColorParser.isPureHex.match(s)) {
			if(HxOverrides.substr(s,0,1) == "#") {
				if(s.length == 4) s = s.charAt(1) + s.charAt(1) + s.charAt(2) + s.charAt(2) + s.charAt(3) + s.charAt(3); else if(s.length == 5) s = s.charAt(1) + s.charAt(1) + s.charAt(2) + s.charAt(2) + s.charAt(3) + s.charAt(3) + s.charAt(4) + s.charAt(4); else s = HxOverrides.substr(s,1,null);
			} else if(HxOverrides.substr(s,0,2) == "0x") s = HxOverrides.substr(s,2,null); else return null;
		}
		var channels = [];
		while(s.length > 0) {
			channels.push(thx_color_parse_ChannelInfo.CIInt8(Std.parseInt("0x" + HxOverrides.substr(s,0,2))));
			s = HxOverrides.substr(s,2,null);
		}
		if(channels.length == 4) return new thx_color_parse_ColorInfo("rgba",channels.slice(1).concat([channels[0]])); else return new thx_color_parse_ColorInfo("rgb",channels);
	}
	,processColor: function(s) {
		if(!this.pattern_color.match(s)) return null;
		var name = this.pattern_color.matched(1);
		if(null == name) return null;
		name = name.toLowerCase();
		var m2 = this.pattern_color.matched(2);
		var s_channels;
		if(null == m2) s_channels = []; else s_channels = m2.split(",");
		var channels = [];
		var channel;
		var _g = 0;
		while(_g < s_channels.length) {
			var s_channel = s_channels[_g];
			++_g;
			channel = this.processChannel(s_channel);
			if(null == channel) return null;
			channels.push(channel);
		}
		return new thx_color_parse_ColorInfo(name,channels);
	}
	,processChannel: function(s) {
		if(!this.pattern_channel.match(s)) return null;
		var value = this.pattern_channel.matched(1);
		var unit = this.pattern_channel.matched(2);
		if(unit == null) unit = "";
		try {
			switch(unit) {
			case "%":
				if(thx_core_Floats.canParse(value)) return thx_color_parse_ChannelInfo.CIPercent(thx_core_Floats.parse(value)); else return null;
				break;
			case "deg":
				if(thx_core_Floats.canParse(value)) return thx_color_parse_ChannelInfo.CIDegree(thx_core_Floats.parse(value)); else return null;
				break;
			case "DEG":
				if(thx_core_Floats.canParse(value)) return thx_color_parse_ChannelInfo.CIDegree(thx_core_Floats.parse(value)); else return null;
				break;
			case "rad":
				if(thx_core_Floats.canParse(value)) return thx_color_parse_ChannelInfo.CIDegree(thx_core_Floats.parse(value) * 180 / Math.PI); else return null;
				break;
			case "RAD":
				if(thx_core_Floats.canParse(value)) return thx_color_parse_ChannelInfo.CIDegree(thx_core_Floats.parse(value) * 180 / Math.PI); else return null;
				break;
			case "":
				if(thx_core_Ints.canParse(value)) {
					var i = thx_core_Ints.parse(value);
					if(i == 0) return thx_color_parse_ChannelInfo.CIBool(false); else if(i == 1) return thx_color_parse_ChannelInfo.CIBool(true); else if(i < 256) return thx_color_parse_ChannelInfo.CIInt8(i); else return thx_color_parse_ChannelInfo.CIInt(i);
				} else if(thx_core_Floats.canParse(value)) return thx_color_parse_ChannelInfo.CIFloat(thx_core_Floats.parse(value)); else return null;
				break;
			default:
				return null;
			}
		} catch( e ) {
			return null;
		}
	}
	,__class__: thx_color_parse_ColorParser
};
var thx_color_parse_ColorInfo = function(name,channels) {
	this.name = name;
	this.channels = channels;
};
thx_color_parse_ColorInfo.__name__ = ["thx","color","parse","ColorInfo"];
thx_color_parse_ColorInfo.prototype = {
	name: null
	,channels: null
	,__class__: thx_color_parse_ColorInfo
};
var thx_color_parse_ChannelInfo = { __ename__ : true, __constructs__ : ["CIPercent","CIFloat","CIDegree","CIInt8","CIInt","CIBool"] };
thx_color_parse_ChannelInfo.CIPercent = function(value) { var $x = ["CIPercent",0,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
thx_color_parse_ChannelInfo.CIFloat = function(value) { var $x = ["CIFloat",1,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
thx_color_parse_ChannelInfo.CIDegree = function(value) { var $x = ["CIDegree",2,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
thx_color_parse_ChannelInfo.CIInt8 = function(value) { var $x = ["CIInt8",3,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
thx_color_parse_ChannelInfo.CIInt = function(value) { var $x = ["CIInt",4,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
thx_color_parse_ChannelInfo.CIBool = function(value) { var $x = ["CIBool",5,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
var thx_core_Arrays = function() { };
thx_core_Arrays.__name__ = ["thx","core","Arrays"];
thx_core_Arrays.contains = function(array,element,eq) {
	if(null == eq) return HxOverrides.indexOf(array,element,0) >= 0; else {
		var _g1 = 0;
		var _g = array.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(eq(array[i],element)) return true;
		}
		return false;
	}
};
thx_core_Arrays.mapi = function(array,callback) {
	var r = [];
	var _g1 = 0;
	var _g = array.length;
	while(_g1 < _g) {
		var i = _g1++;
		r.push(callback(array[i],i));
	}
	return r;
};
thx_core_Arrays.sampleOne = function(array) {
	return array[Std.random(array.length)];
};
var thx_core_ArrayFloats = function() { };
thx_core_ArrayFloats.__name__ = ["thx","core","ArrayFloats"];
thx_core_ArrayFloats.resize = function(array,length,fill) {
	if(fill == null) fill = 0.0;
	while(array.length < length) array.push(fill);
	array.splice(length,array.length - length);
	return array;
};
var thx_core_ArrayInts = function() { };
thx_core_ArrayInts.__name__ = ["thx","core","ArrayInts"];
thx_core_ArrayInts.resize = function(array,length,fill) {
	if(fill == null) fill = 0;
	while(array.length < length) array.push(fill);
	array.splice(length,array.length - length);
	return array;
};
var thx_core_Floats = function() { };
thx_core_Floats.__name__ = ["thx","core","Floats"];
thx_core_Floats.canParse = function(s) {
	return thx_core_Floats.pattern_parse.match(s);
};
thx_core_Floats.interpolate = function(f,a,b) {
	return (b - a) * f + a;
};
thx_core_Floats.parse = function(s) {
	if(s.substring(0,1) == "+") s = s.substring(1);
	return parseFloat(s);
};
thx_core_Floats.roundTo = function(f,decimals) {
	var p = Math.pow(10,decimals);
	return Math.round(f * p) / p;
};
thx_core_Floats.wrapCircular = function(v,max) {
	v = v % max;
	if(v < 0) v += max;
	return v;
};
var thx_core_Functions = function() { };
thx_core_Functions.__name__ = ["thx","core","Functions"];
thx_core_Functions.noop = function() {
};
var thx_core_Ints = function() { };
thx_core_Ints.__name__ = ["thx","core","Ints"];
thx_core_Ints.canParse = function(s) {
	return thx_core_Ints.pattern_parse.match(s);
};
thx_core_Ints.parse = function(s,base) {
	var v = parseInt(s,base);
	if(isNaN(v)) return null; else return v;
};
thx_core_Ints.range = function(start,stop,step) {
	if(step == null) step = 1;
	if(null == stop) {
		stop = start;
		start = 0;
	}
	if((stop - start) / step == Infinity) throw "infinite range";
	var range = [];
	var i = -1;
	var j;
	if(step < 0) while((j = start + step * ++i) > stop) range.push(j); else while((j = start + step * ++i) < stop) range.push(j);
	return range;
};
var thx_core__$Set_Set_$Impl_$ = {};
thx_core__$Set_Set_$Impl_$.__name__ = ["thx","core","_Set","Set_Impl_"];
thx_core__$Set_Set_$Impl_$.arrayToSet = function(arr) {
	var set = [];
	var _g = 0;
	while(_g < arr.length) {
		var v = arr[_g];
		++_g;
		thx_core__$Set_Set_$Impl_$.push(set,v);
	}
	return set;
};
thx_core__$Set_Set_$Impl_$.create = function(arr) {
	if(null == arr) return []; else return thx_core__$Set_Set_$Impl_$.arrayToSet(arr);
};
thx_core__$Set_Set_$Impl_$.add = function(this1,v) {
	if(thx_core__$Set_Set_$Impl_$.exists(this1,v)) return false; else {
		this1.push(v);
		return true;
	}
};
thx_core__$Set_Set_$Impl_$.exists = function(this1,v) {
	var _g = 0;
	while(_g < this1.length) {
		var t = this1[_g];
		++_g;
		if(t == v) return true;
	}
	return false;
};
thx_core__$Set_Set_$Impl_$.push = function(this1,v) {
	thx_core__$Set_Set_$Impl_$.add(this1,v);
};
thx_core__$Set_Set_$Impl_$.setToArray = function(this1) {
	return this1.slice();
};
var thx_core_Strings = function() { };
thx_core_Strings.__name__ = ["thx","core","Strings"];
thx_core_Strings.humanize = function(s) {
	return StringTools.replace(thx_core_Strings.underscore(s),"_"," ");
};
thx_core_Strings.underscore = function(s) {
	s = new EReg("::","g").replace(s,"/");
	s = new EReg("([A-Z]+)([A-Z][a-z])","g").replace(s,"$1_$2");
	s = new EReg("([a-z\\d])([A-Z])","g").replace(s,"$1_$2");
	s = new EReg("-","g").replace(s,"_");
	return s.toLowerCase();
};
var thx_core_Timer = function() { };
thx_core_Timer.__name__ = ["thx","core","Timer"];
thx_core_Timer.repeat = function(callback,delayms) {
	return (function(f,id) {
		return function() {
			f(id);
		};
	})(thx_core_Timer.clear,setInterval(callback,delayms));
};
thx_core_Timer.delay = function(callback,delayms) {
	return (function(f,id) {
		return function() {
			f(id);
		};
	})(thx_core_Timer.clear,setTimeout(callback,delayms));
};
thx_core_Timer.frame = function(callback) {
	var cancelled = false;
	var f = thx_core_Functions.noop;
	var current = performance.now();
	var next;
	f = function() {
		if(cancelled) return;
		next = performance.now();
		callback(next - current);
		current = next;
		requestAnimationFrame(f);
	};
	requestAnimationFrame(f);
	return function() {
		cancelled = true;
	};
};
thx_core_Timer.clear = function(id) {
	clearTimeout(id);
	return;
};
var thx_core_UUID = function() { };
thx_core_UUID.__name__ = ["thx","core","UUID"];
thx_core_UUID.create = function() {
	var s = [];
	var _g = 0;
	while(_g < 8) {
		var i = _g++;
		s[i] = "" + Math.floor(Math.random() * 16);
	}
	s[8] = "-";
	var _g1 = 9;
	while(_g1 < 13) {
		var i1 = _g1++;
		s[i1] = "" + Math.floor(Math.random() * 16);
	}
	s[13] = "-";
	s[14] = "4";
	var _g2 = 15;
	while(_g2 < 18) {
		var i2 = _g2++;
		s[i2] = "" + Math.floor(Math.random() * 16);
	}
	s[18] = "-";
	s[19] = "" + (Math.floor(Math.random() * 16) & 3 | 8);
	var _g3 = 20;
	while(_g3 < 23) {
		var i3 = _g3++;
		s[i3] = "" + Math.floor(Math.random() * 16);
	}
	s[23] = "-";
	var _g4 = 24;
	while(_g4 < 36) {
		var i4 = _g4++;
		s[i4] = "" + Math.floor(Math.random() * 16);
	}
	return s.join("");
};
var thx_culture_DateFormatInfo = function(calendarWeekRuleIndex,calendarWeekRuleName,designatorAm,designatorPm,firstDayOfWeekIndex,firstDayOfWeekName,nameCalendar,nameCalendarNative,nameDays,nameDaysAbbreviated,nameDaysShortest,nameMonths,nameMonthsAbbreviated,nameMonthGenitives,nameMonthGenitivesAbbreviated,patternDateLong,patternDateShort,patternDateTimeFull,patternDateTimeSortable,patternMonthDay,patternRfc1123,patternTimeLong,patternTimeShort,patternUniversalSortable,patternYearMonth,separatorDate,separatorTime) {
	this.calendarWeekRuleIndex = calendarWeekRuleIndex;
	this.calendarWeekRuleName = calendarWeekRuleName;
	this.designatorAm = designatorAm;
	this.designatorPm = designatorPm;
	this.firstDayOfWeekIndex = firstDayOfWeekIndex;
	this.firstDayOfWeekName = firstDayOfWeekName;
	this.nameCalendar = nameCalendar;
	this.nameCalendarNative = nameCalendarNative;
	this.nameDays = nameDays;
	this.nameDaysAbbreviated = nameDaysAbbreviated;
	this.nameDaysShortest = nameDaysShortest;
	this.nameMonths = nameMonths;
	this.nameMonthsAbbreviated = nameMonthsAbbreviated;
	this.nameMonthGenitives = nameMonthGenitives;
	this.nameMonthGenitivesAbbreviated = nameMonthGenitivesAbbreviated;
	this.patternDateLong = patternDateLong;
	this.patternDateShort = patternDateShort;
	this.patternDateTimeFull = patternDateTimeFull;
	this.patternDateTimeSortable = patternDateTimeSortable;
	this.patternMonthDay = patternMonthDay;
	this.patternRfc1123 = patternRfc1123;
	this.patternTimeLong = patternTimeLong;
	this.patternTimeShort = patternTimeShort;
	this.patternUniversalSortable = patternUniversalSortable;
	this.patternYearMonth = patternYearMonth;
	this.separatorDate = separatorDate;
	this.separatorTime = separatorTime;
};
thx_culture_DateFormatInfo.__name__ = ["thx","culture","DateFormatInfo"];
thx_culture_DateFormatInfo.prototype = {
	calendarWeekRuleIndex: null
	,calendarWeekRuleName: null
	,designatorAm: null
	,designatorPm: null
	,firstDayOfWeekIndex: null
	,firstDayOfWeekName: null
	,nameCalendar: null
	,nameCalendarNative: null
	,nameDays: null
	,nameDaysAbbreviated: null
	,nameDaysShortest: null
	,nameMonths: null
	,nameMonthsAbbreviated: null
	,nameMonthGenitives: null
	,nameMonthGenitivesAbbreviated: null
	,patternDateLong: null
	,patternDateShort: null
	,patternDateTimeFull: null
	,patternDateTimeSortable: null
	,patternMonthDay: null
	,patternRfc1123: null
	,patternTimeLong: null
	,patternTimeShort: null
	,patternUniversalSortable: null
	,patternYearMonth: null
	,separatorDate: null
	,separatorTime: null
	,__class__: thx_culture_DateFormatInfo
};
var thx_culture_NumberFormatInfo = function(decimalDigitsCurrency,decimalDigitsNumber,decimalDigitsPercent,groupSizesCurrency,groupSizesNumber,groupSizesPercent,patternNegativeCurrency,patternNegativeNumber,patternNegativePercent,patternPositiveCurrency,patternPositivePercent,separatorDecimalCurrency,separatorDecimalNumber,separatorDecimalPercent,separatorGroupCurrency,separatorGroupNumber,separatorGroupPercent,signNegative,signPositive,symbolCurrency,symbolNaN,symbolNegativeInfinity,symbolPercent,symbolPermille,symbolPositiveInfinity) {
	this.decimalDigitsCurrency = decimalDigitsCurrency;
	this.decimalDigitsNumber = decimalDigitsNumber;
	this.decimalDigitsPercent = decimalDigitsPercent;
	this.groupSizesCurrency = groupSizesCurrency;
	this.groupSizesNumber = groupSizesNumber;
	this.groupSizesPercent = groupSizesPercent;
	this.patternNegativeCurrency = patternNegativeCurrency;
	this.patternNegativeNumber = patternNegativeNumber;
	this.patternNegativePercent = patternNegativePercent;
	this.patternPositiveCurrency = patternPositiveCurrency;
	this.patternPositivePercent = patternPositivePercent;
	this.separatorDecimalCurrency = separatorDecimalCurrency;
	this.separatorDecimalNumber = separatorDecimalNumber;
	this.separatorDecimalPercent = separatorDecimalPercent;
	this.separatorGroupCurrency = separatorGroupCurrency;
	this.separatorGroupNumber = separatorGroupNumber;
	this.separatorGroupPercent = separatorGroupPercent;
	this.signNegative = signNegative;
	this.signPositive = signPositive;
	this.symbolCurrency = symbolCurrency;
	this.symbolNaN = symbolNaN;
	this.symbolNegativeInfinity = symbolNegativeInfinity;
	this.symbolPercent = symbolPercent;
	this.symbolPermille = symbolPermille;
	this.symbolPositiveInfinity = symbolPositiveInfinity;
};
thx_culture_NumberFormatInfo.__name__ = ["thx","culture","NumberFormatInfo"];
thx_culture_NumberFormatInfo.prototype = {
	decimalDigitsCurrency: null
	,decimalDigitsNumber: null
	,decimalDigitsPercent: null
	,groupSizesCurrency: null
	,groupSizesNumber: null
	,groupSizesPercent: null
	,patternNegativeCurrency: null
	,patternNegativeNumber: null
	,patternNegativePercent: null
	,patternPositiveCurrency: null
	,patternPositivePercent: null
	,separatorDecimalCurrency: null
	,separatorDecimalNumber: null
	,separatorDecimalPercent: null
	,separatorGroupCurrency: null
	,separatorGroupNumber: null
	,separatorGroupPercent: null
	,signNegative: null
	,signPositive: null
	,symbolCurrency: null
	,symbolNaN: null
	,symbolNegativeInfinity: null
	,symbolPercent: null
	,symbolPermille: null
	,symbolPositiveInfinity: null
	,__class__: thx_culture_NumberFormatInfo
};
var thx_culture_Culture = function(code,dateTime,ietf,isNeutral,iso2,iso3,isRightToLeft,lcid,nameCalendar,nameEnglish,nameNative,nameRegionEnglish,nameRegionNative,number,separatorList,win3) {
	this.code = code;
	this.dateTime = dateTime;
	this.ietf = ietf;
	this.isNeutral = isNeutral;
	this.iso2 = iso2;
	this.iso3 = iso3;
	this.isRightToLeft = isRightToLeft;
	this.lcid = lcid;
	this.nameCalendar = nameCalendar;
	this.nameEnglish = nameEnglish;
	this.nameNative = nameNative;
	this.nameRegionEnglish = nameRegionEnglish;
	this.nameRegionNative = nameRegionNative;
	this.number = number;
	this.separatorList = separatorList;
	this.win3 = win3;
};
thx_culture_Culture.__name__ = ["thx","culture","Culture"];
thx_culture_Culture.prototype = {
	code: null
	,dateTime: null
	,ietf: null
	,isNeutral: null
	,iso2: null
	,iso3: null
	,isRightToLeft: null
	,lcid: null
	,nameCalendar: null
	,nameEnglish: null
	,nameNative: null
	,nameRegionEnglish: null
	,nameRegionNative: null
	,number: null
	,separatorList: null
	,win3: null
	,__class__: thx_culture_Culture
};
var thx_culture_Pattern = function() { };
thx_culture_Pattern.__name__ = ["thx","culture","Pattern"];
var thx_format_NumberFormat = function() { };
thx_format_NumberFormat.__name__ = ["thx","format","NumberFormat"];
thx_format_NumberFormat.number = function(f,precision,culture) {
	var nf = thx_format_NumberFormat.numberFormat(culture);
	if(isNaN(f)) return nf.symbolNaN;
	if(!isFinite(f)) if(f < 0) return nf.symbolNegativeInfinity; else return nf.symbolPositiveInfinity;
	var pattern;
	if(f < 0) pattern = thx_culture_Pattern.numberNegatives[nf.patternNegativeNumber]; else pattern = "n";
	var formatted = thx_format_NumberFormat.value(f,(function($this) {
		var $r;
		var t;
		{
			var _0 = precision;
			if(null == _0) t = null; else t = _0;
		}
		$r = t != null?t:nf.decimalDigitsNumber;
		return $r;
	}(this)),nf.symbolNaN,nf.symbolNegativeInfinity,nf.symbolPositiveInfinity,nf.groupSizesNumber,nf.separatorGroupNumber,nf.separatorDecimalNumber);
	return StringTools.replace(pattern,"n",formatted);
};
thx_format_NumberFormat.intPart = function(s,groupSizes,groupSeparator) {
	var buf = [];
	var pos = 0;
	var sizes = groupSizes.slice();
	var size = sizes.shift();
	var seg;
	while(s.length > 0) if(size == 0) {
		buf.unshift(s);
		s = "";
	} else if(s.length > size) {
		buf.unshift(s.substring(s.length - size));
		s = s.substring(0,s.length - size);
		if(sizes.length > 0) size = sizes.shift();
	} else {
		buf.unshift(s);
		s = "";
	}
	return buf.join(groupSeparator);
};
thx_format_NumberFormat.numberFormat = function(culture) {
	if(null != culture && null != culture.number) return culture.number; else return thx_culture_Culture.invariant.number;
};
thx_format_NumberFormat.pad = function(s,len,round) {
	var t;
	var _0 = s;
	if(null == _0) t = null; else t = _0;
	if(t != null) s = t; else s = "";
	if(len > 0 && s.length > len) {
		if(round) return s.substring(0,len - 1) + (Std.parseInt(s.substring(len - 1,len)) + (Std.parseInt(s.substring(len,len + 1)) >= 5?1:0)); else return s.substring(0,len);
	} else return StringTools.rpad(s,"0",len);
};
thx_format_NumberFormat.splitOnDecimalSeparator = function(f) {
	var p = ("" + f).split(".");
	var i = p[0];
	var d = ((function($this) {
		var $r;
		var t;
		{
			var _0 = p;
			var _1;
			if(null == _0) t = null; else if(null == (_1 = _0[1])) t = null; else t = _1;
		}
		$r = t != null?t:"";
		return $r;
	}(this))).toLowerCase();
	if(d.indexOf("e") >= 0) {
		p = d.split("e");
		d = p[0];
		var e = thx_core_Ints.parse(p[1]);
		if(e < 0) {
			d = StringTools.rpad("","0",-e - 1) + i + d;
			i = "0";
		} else {
			var s = i + d;
			d = s.substring(e + 1);
			i = thx_format_NumberFormat.pad(s,e + 1,false);
		}
	}
	if(d.length > 0) return [i,d]; else return [i];
};
thx_format_NumberFormat.value = function(f,precision,symbolNaN,symbolNegativeInfinity,symbolPositiveInfinity,groupSizes,groupSeparator,decimalSeparator) {
	f = Math.abs(f);
	var p = thx_format_NumberFormat.splitOnDecimalSeparator(f);
	if(precision <= 0 && null != p[1]) {
		if(parseFloat("0." + p[1]) >= 0.5) p[0] = p[0].substring(0,p[0].length - 1) + (Std.parseFloat(p[0].substring(p[0].length - 1)) + 1);
	}
	var buf = [];
	buf.push(thx_format_NumberFormat.intPart(p[0],groupSizes,groupSeparator));
	if(precision > 0) buf.push(thx_format_NumberFormat.pad(p[1],precision,true));
	return buf.join(decimalSeparator);
};
var thx_math_random_PseudoRandom = function(seed) {
	if(seed == null) seed = 1;
	this.seed = seed;
};
thx_math_random_PseudoRandom.__name__ = ["thx","math","random","PseudoRandom"];
thx_math_random_PseudoRandom.prototype = {
	seed: null
	,'int': function() {
		return (this.seed = this.seed * 48271.0 % 2147483647.0 | 0) & 1073741823;
	}
	,'float': function() {
		return this["int"]() / 1073741823.0;
	}
	,__class__: thx_math_random_PseudoRandom
};
var thx_math_random__$Random_Random_$Impl_$ = {};
thx_math_random__$Random_Random_$Impl_$.__name__ = ["thx","math","random","_Random","Random_Impl_"];
thx_math_random__$Random_Random_$Impl_$.lessThan = function(this1,max) {
	return Std["int"](max * this1["float"]());
};
thx_math_random__$Random_Random_$Impl_$.shuffle = function(this1,arr) {
	var t = thx_core_Ints.range(arr.length);
	var array = [];
	while(t.length > 0) {
		var pos = thx_math_random__$Random_Random_$Impl_$.lessThan(this1,t.length);
		var index = t[pos];
		t.splice(pos,1);
		array.push(arr[index]);
	}
	return array;
};
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
String.prototype.__class__ = String;
String.__name__ = ["String"];
Array.__name__ = ["Array"];
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
if(Array.prototype.map == null) Array.prototype.map = function(f) {
	var a = [];
	var _g1 = 0;
	var _g = this.length;
	while(_g1 < _g) {
		var i = _g1++;
		a[i] = f(this[i]);
	}
	return a;
};
var __map_reserved = {}
fly_systems_PlayAudio.loadSound("exp1","sound/Buff.mp3");
fly_systems_PlayAudio.loadSound("exp2","sound/Buffs.mp3");
fly_systems_PlayAudio.loadSound("exp3","sound/Burf.mp3");
fly_systems_PlayAudio.loadSound("boing1","sound/Boin.mp3");
fly_systems_PlayAudio.loadSound("boing2","sound/Boing.mp3");
fly_systems_PlayAudio.loadSound("buzz","sound/Bzzz.mp3");
fly_systems_PlayAudio.loadSound("gulp","sound/Gulp.mp3");
fly_systems_PlayAudio.loadSound("crunch","sound/Crunch.mp3");
fly_systems_PlayAudio.loadSound("poop","sound/Poop.mp3");
fly_systems_PlayAudio.loadSound("start","sound/Start.mp3");
fly_systems_PlayAudio.loadSound("success","sound/Tadada.mp3");
fly_systems_PlayAudio.loadSound("gameover","sound/Game over.mp3");

      // Production steps of ECMA-262, Edition 5, 15.4.4.21
      // Reference: http://es5.github.io/#x15.4.4.21
      if (!Array.prototype.reduce) {
        Array.prototype.reduce = function(callback /*, initialValue*/) {
          'use strict';
          if (this == null) {
            throw new TypeError('Array.prototype.reduce called on null or undefined');
          }
          if (typeof callback !== 'function') {
            throw new TypeError(callback + ' is not a function');
          }
          var t = Object(this), len = t.length >>> 0, k = 0, value;
          if (arguments.length == 2) {
            value = arguments[1];
          } else {
            while (k < len && ! k in t) {
              k++;
            }
            if (k >= len) {
              throw new TypeError('Reduce of empty array with no initial value');
            }
            value = t[k++];
          }
          for (; k < len; k++) {
            if (k in t) {
              value = callback(value, t[k], k, t);
            }
          }
          return value;
        };
      }
    ;
var scope = ("undefined" !== typeof window && window) || ("undefined" !== typeof global && global) || this;
if(!scope.setImmediate) scope.setImmediate = function(callback) {
	scope.setTimeout(callback,0);
};
var lastTime = 0;
var vendors = ["webkit","moz"];
var x = 0;
while(x < vendors.length && !scope.requestAnimationFrame) {
	scope.requestAnimationFrame = scope[vendors[x] + "RequestAnimationFrame"];
	scope.cancelAnimationFrame = scope[vendors[x] + "CancelAnimationFrame"] || scope[vendors[x] + "CancelRequestAnimationFrame"];
	x++;
}
if(!scope.requestAnimationFrame) scope.requestAnimationFrame = function(callback1) {
	var currTime = new Date().getTime();
	var timeToCall = Math.max(0,16 - (currTime - lastTime));
	var id = scope.setTimeout(function() {
		callback1(currTime + timeToCall);
	},timeToCall);
	lastTime = currTime + timeToCall;
	return id;
};
if(!scope.cancelAnimationFrame) scope.cancelAnimationFrame = function(id1) {
	scope.clearTimeout(id1);
};
if(typeof(scope.performance) == "undefined") scope.performance = { };
if(typeof(scope.performance.now) == "undefined") {
	var nowOffset = new Date().getTime();
	if(scope.performance.timing && scope.performance.timing.navigationStart) nowOffset = scope.performance.timing.navigationStart;
	var now = function() {
		return new Date() - nowOffset;
	};
	scope.performance.now = now;
}
thx_culture_Culture.cultures = new haxe_ds_StringMap();
thx_culture_Culture.list = [];
Main.socket = io.connect(window.location.origin);
fly_Config.width = 660;
fly_Config.height = 440;
fly_Config.columns = [0,6,6,9,9,9,9,12,12,12,12,12,12,15,15,15,15,15,15,15,18];
fly_Game.ONE_DEGREE = Math.PI / 180;
fly_Game.edibleFly = new fly_components_Edible(true,true,50,true);
fly_Game.edibleFlower = new fly_components_Edible(true,true,10,false);
fly_components_Audio.buzzing = new fly_components_Audio("buzz");
fly_components_Audio.eatFly = new fly_components_Audio("gulp");
fly_components_Audio.eatFlower = new fly_components_Audio("crunch");
fly_components_Audio.poop = new fly_components_Audio("poop");
fly_components_Audio.start = new fly_components_Audio("start");
fly_components_Audio.explosions = [new fly_components_Audio("exp1"),new fly_components_Audio("exp2"),new fly_components_Audio("exp3")];
fly_components_Audio.explosion_id = 0;
fly_components_Audio.boings = [new fly_components_Audio("boing1"),new fly_components_Audio("boing2")];
fly_components_Audio.boing_id = 0;
fly_components_Explosion.maxStage = 30;
fly_components_Explosion.peak = 20;
fly_components_Explosion.radius = 50;
fly_components_Detonation.instance = new fly_components_Detonation(fly_components_Explosion.radius);
fly_components_Droplet.maxLife = 300;
js_Boot.__toStr = {}.toString;
fly_systems_PlayAudio.sounds = new haxe_ds_StringMap();
fly_systems_PlayAudio.context = (function() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    return new AudioContext();
  })();
fly_util_Persona.adjectives = ["abandoned","able","absolute","adorable","adventurous","academic","acceptable","acclaimed","accomplished","accurate","aching","acidic","acrobatic","active","actual","adept","admirable","admired","adolescent","adorable","adored","advanced","afraid","affectionate","aged","aggravating","aggressive","agile","agitated","agonizing","agreeable","ajar","alarmed","alarming","alert","alienated","alive","all","altruistic","amazing","ambitious","ample","amused","amusing","anchored","ancient","angelic","angry","anguished","animated","annual","another","antique","anxious","any","apprehensive","appropriate","apt","arctic","arid","aromatic","artistic","ashamed","assured","astonishing","athletic","attached","attentive","attractive","austere","authentic","authorized","automatic","avaricious","average","aware","awesome","awful","awkward","babyish","bad","back","baggy","bare","barren","basic","beautiful","belated","beloved","beneficial","better","best","bewitched","big","big-hearted","biodegradable","bite-sized","bitter","black","black-and-white","bland","blank","blaring","bleak","blind","blissful","blond","blue","blushing","bogus","boiling","bold","bony","boring","bossy","both","bouncy","bountiful","bowed","brave","breakable","brief","bright","brilliant","brisk","broken","bronze","brown","bruised","bubbly","bulky","bumpy","buoyant","burdensome","burly","bustling","busy","buttery","buzzing","calculating","calm","candid","canine","capital","carefree","careful","careless","caring","cautious","cavernous","celebrated","charming","cheap","cheerful","cheery","chief","chilly","chubby","circular","classic","clean","clear","clear-cut","clever","close","closed","cloudy","clueless","clumsy","cluttered","coarse","cold","colorful","colorless","colossal","comfortable","common","compassionate","competent","complete","complex","complicated","composed","concerned","concrete","confused","conscious","considerate","constant","content","conventional","cooked","cool","cooperative","coordinated","corny","corrupt","costly","courageous","courteous","crafty","crazy","creamy","creative","creepy","criminal","crisp","critical","crooked","crowded","cruel","crushing","cuddly","cultivated","cultured","cumbersome","curly","curvy","cute","cylindrical","damaged","damp","dangerous","dapper","daring","darling","dark","dazzling","dead","deadly","deafening","dear","dearest","decent","decimal","decisive","deep","defenseless","defensive","defiant","deficient","definite","definitive","delayed","delectable","delicious","delightful","delirious","demanding","dense","dental","dependable","dependent","descriptive","deserted","detailed","determined","devoted","different","difficult","digital","diligent","dim","dimpled","dimwitted","direct","disastrous","discrete","disfigured","disgusting","disloyal","dismal","distant","downright","dreary","dirty","disguised","dishonest","dismal","distant","distinct","distorted","dizzy","dopey","doting","double","downright","drab","drafty","dramatic","dreary","droopy","dry","dual","dull","dutiful","each","eager","earnest","early","easy","easy-going","ecstatic","edible","educated","elaborate","elastic","elated","elderly","electric","elegant","elementary","elliptical","embarrassed","embellished","eminent","emotional","empty","enchanted","enchanting","energetic","enlightened","enormous","enraged","entire","envious","equal","equatorial","essential","esteemed","ethical","euphoric","even","evergreen","everlasting","every","evil","exalted","excellent","exemplary","exhausted","excitable","excited","exciting","exotic","expensive","experienced","expert","extraneous","extroverted","extra-large","extra-small","fabulous","failing","faint","fair","faithful","fake","false","familiar","famous","fancy","fantastic","far","faraway","far-flung","far-off","fast","fat","fatal","fatherly","favorable","favorite","fearful","fearless","feisty","feline","female","feminine","few","fickle","filthy","fine","finished","firm","first","firsthand","fitting","fixed","flaky","flamboyant","flashy","flat","flawed","flawless","flickering","flimsy","flippant","flowery","fluffy","fluid","flustered","focused","fond","foolhardy","foolish","forceful","forked","formal","forsaken","forthright","fortunate","fragrant","frail","frank","frayed","free","French","fresh","frequent","friendly","frightened","frightening","frigid","frilly","frizzy","frivolous","front","frosty","frozen","frugal","fruitful","full","fumbling","functional","funny","fussy","fuzzy","gargantuan","gaseous","general","generous","gentle","genuine","giant","giddy","gigantic","gifted","giving","glamorous","glaring","glass","gleaming","gleeful","glistening","glittering","gloomy","glorious","glossy","glum","golden","good","good-natured","gorgeous","graceful","gracious","grand","grandiose","granular","grateful","grave","gray","great","greedy","green","gregarious","grim","grimy","gripping","grizzled","gross","grotesque","grouchy","grounded","growing","growling","grown","grubby","gruesome","grumpy","guilty","gullible","gummy","hairy","half","handmade","handsome","handy","happy","happy-go-lucky","hard","hard-to-find","harmful","harmless","harmonious","harsh","hasty","hateful","haunting","healthy","heartfelt","hearty","heavenly","heavy","hefty","helpful","helpless","hidden","hideous","high","high-level","hilarious","hoarse","hollow","homely","honest","honorable","honored","hopeful","horrible","hospitable","hot","huge","humble","humiliating","humming","humongous","hungry","hurtful","husky","icky","icy","ideal","idealistic","identical","idle","idiotic","idolized","ignorant","ill","illegal","ill-fated","ill-informed","illiterate","illustrious","imaginary","imaginative","immaculate","immaterial","immediate","immense","impassioned","impeccable","impartial","imperfect","imperturbable","impish","impolite","important","impossible","impractical","impressionable","impressive","improbable","impure","inborn","incomparable","incompatible","incomplete","inconsequential","incredible","indelible","inexperienced","indolent","infamous","infantile","infatuated","inferior","infinite","informal","innocent","insecure","insidious","insignificant","insistent","instructive","insubstantial","intelligent","intent","intentional","interesting","internal","international","intrepid","ironclad","irresponsible","irritating","itchy","jaded","jagged","jam-packed","jaunty","jealous","jittery","joint","jolly","jovial","joyful","joyous","jubilant","judicious","juicy","jumbo","junior","jumpy","juvenile","kaleidoscopic","keen","key","kind","kindhearted","kindly","klutzy","knobby","knotty","knowledgeable","knowing","known","kooky","kosher","lame","lanky","large","last","lasting","late","lavish","lawful","lazy","leading","lean","leafy","left","legal","legitimate","light","lighthearted","likable","likely","limited","limp","limping","linear","lined","liquid","little","live","lively","livid","loathsome","lone","lonely","long","long-term","loose","lopsided","lost","loud","lovable","lovely","loving","low","loyal","lucky","lumbering","luminous","lumpy","lustrous","luxurious","mad","made-up","magnificent","majestic","major","male","mammoth","married","marvelous","masculine","massive","mature","meager","mealy","mean","measly","meaty","medical","mediocre","medium","meek","mellow","melodic","memorable","menacing","merry","messy","metallic","mild","milky","mindless","miniature","minor","minty","miserable","miserly","misguided","misty","mixed","modern","modest","moist","monstrous","monthly","monumental","moral","mortified","motherly","motionless","mountainous","muddy","muffled","multicolored","mundane","murky","mushy","musty","muted","mysterious","naive","narrow","nasty","natural","naughty","nautical","near","neat","necessary","needy","negative","neglected","negligible","neighboring","nervous","new","next","nice","nifty","nimble","nippy","nocturnal","noisy","nonstop","normal","notable","noted","noteworthy","novel","noxious","numb","nutritious","nutty","obedient","obese","oblong","oily","oblong","obvious","occasional","odd","oddball","offbeat","offensive","official","old","old-fashioned","only","open","optimal","optimistic","opulent","orange","orderly","organic","ornate","ornery","ordinary","original","other","our","outlying","outgoing","outlandish","outrageous","outstanding","oval","overcooked","overdue","overjoyed","overlooked","palatable","pale","paltry","parallel","parched","partial","passionate","past","pastel","peaceful","peppery","perfect","perfumed","periodic","perky","personal","pertinent","pesky","pessimistic","petty","phony","physical","piercing","pink","pitiful","plain","plaintive","plastic","playful","pleasant","pleased","pleasing","plump","plush","polished","polite","political","pointed","pointless","poised","poor","popular","portly","posh","positive","possible","potable","powerful","powerless","practical","precious","present","prestigious","pretty","precious","previous","pricey","prickly","primary","prime","pristine","private","prize","probable","productive","profitable","profuse","proper","proud","prudent","punctual","pungent","puny","pure","purple","pushy","putrid","puzzled","puzzling","quaint","qualified","quarrelsome","quarterly","queasy","querulous","questionable","quick","quick-witted","quiet","quintessential","quirky","quixotic","quizzical","radiant","ragged","rapid","rare","rash","raw","recent","reckless","rectangular","ready","real","realistic","reasonable","red","reflecting","regal","regular","reliable","relieved","remarkable","remorseful","remote","repentant","required","respectful","responsible","repulsive","revolving","rewarding","rich","rigid","right","ringed","ripe","roasted","robust","rosy","rotating","rotten","rough","round","rowdy","royal","rubbery","rundown","ruddy","rude","runny","rural","rusty","sad","safe","salty","same","sandy","sane","sarcastic","sardonic","satisfied","scaly","scarce","scared","scary","scented","scholarly","scientific","scornful","scratchy","scrawny","second","secondary","second-hand","secret","self-assured","self-reliant","selfish","sentimental","separate","serene","serious","serpentine","several","severe","shabby","shadowy","shady","shallow","shameful","shameless","sharp","shimmering","shiny","shocked","shocking","shoddy","short","short-term","showy","shrill","shy","sick","silent","silky","silly","silver","similar","simple","simplistic","sinful","single","sizzling","skeletal","skinny","sleepy","slight","slim","slimy","slippery","slow","slushy","small","smart","smoggy","smooth","smug","snappy","snarling","sneaky","sniveling","snoopy","sociable","soft","soggy","solid","somber","some","spherical","sophisticated","sore","sorrowful","soulful","soupy","sour","Spanish","sparkling","sparse","specific","spectacular","speedy","spicy","spiffy","spirited","spiteful","splendid","spotless","spotted","spry","square","squeaky","squiggly","stable","staid","stained","stale","standard","starchy","stark","starry","steep","sticky","stiff","stimulating","stingy","stormy","straight","strange","steel","strict","strident","striking","striped","strong","studious","stunning","stupendous","stupid","sturdy","stylish","subdued","submissive","substantial","subtle","suburban","sudden","sugary","sunny","super","superb","superficial","superior","supportive","sure-footed","surprised","suspicious","svelte","sweaty","sweet","sweltering","swift","sympathetic","tall","talkative","tame","tan","tangible","tart","tasty","tattered","taut","tedious","teeming","tempting","tender","tense","tepid","terrible","terrific","testy","thankful","that","these","thick","thin","third","thirsty","this","thorough","thorny","those","thoughtful","threadbare","thrifty","thunderous","tidy","tight","timely","tinted","tiny","tired","torn","total","tough","traumatic","treasured","tremendous","tragic","trained","tremendous","triangular","tricky","trifling","trim","trivial","troubled","true","trusting","trustworthy","trusty","truthful","tubby","turbulent","twin","ugly","ultimate","unacceptable","unaware","uncomfortable","uncommon","unconscious","understated","unequaled","uneven","unfinished","unfit","unfolded","unfortunate","unhappy","unhealthy","uniform","unimportant","unique","united","unkempt","unknown","unlawful","unlined","unlucky","unnatural","unpleasant","unrealistic","unripe","unruly","unselfish","unsightly","unsteady","unsung","untidy","untimely","untried","untrue","unused","unusual","unwelcome","unwieldy","unwilling","unwitting","unwritten","upbeat","upright","upset","urban","usable","used","useful","useless","utilized","utter","vacant","vague","vain","valid","valuable","vapid","variable","vast","velvety","venerated","vengeful","verifiable","vibrant","vicious","victorious","vigilant","vigorous","villainous","violet","violent","virtual","virtuous","visible","vital","vivacious","vivid","voluminous","wan","warlike","warm","warmhearted","warped","wary","wasteful","watchful","waterlogged","watery","wavy","wealthy","weak","weary","webbed","wee","weekly","weepy","weighty","weird","welcome","well-documented","well-groomed","well-informed","well-lit","well-made","well-off","well-to-do","well-worn","wet","which","whimsical","whirlwind","whispered","white","whole","whopping","wicked","wide","wide-eyed","wiggly","wild","willing","wilted","winding","windy","winged","wiry","wise","witty","wobbly","woeful","wonderful","wooden","woozy","wordy","worldly","worn","worried","worrisome","worse","worst","worthless","worthwhile","worthy","wrathful","wretched","writhing","wrong","wry","yawning","yearly","yellow","yellowish","young","youthful","yummy","zany","zealous","zesty","zigzag"];
fly_util_Persona.nouns = ["able","account","achieve","achiever","acoustics","act","action","activity","actor","addition","adjustment","advertisement","advice","aftermath","afternoon","afterthought","agreement","air","airplane","airport","alarm","amount","amusement","anger","angle","animal","answer","ant","ants","apparatus","apparel","apple","apples","appliance","approval","arch","argument","arithmetic","arm","army","art","attack","attempt","attention","attraction","aunt","authority","baby","back","badge","bag","bait","balance","ball","balloon","balls","banana","band","base","baseball","basin","basket","basketball","bat","bath","battle","bead","beam","bean","bear","bears","beast","bed","bedroom","beds","bee","beef","beetle","beggar","beginner","behavior","belief","believe","bell","bells","berry","bike","bikes","bird","birds","birth","birthday","bit","bite","blade","blood","blow","board","boat","boats","body","bomb","bone","book","books","boot","border","bottle","boundary","box","boy","boys","brain","brake","branch","brass","bread","breakfast","breath","brick","bridge","brother","brothers","brush","bubble","bucket","building","bulb","bun","burn","burst","bushes","business","butter","button","cabbage","cable","cactus","cake","cakes","calculator","calendar","camera","camp","can","cannon","canvas","cap","caption","car","card","care","carpenter","carriage","cars","cart","cast","cat","cats","cattle","cause","cave","celery","cellar","cemetery","cent","chain","chair","chairs","chalk","chance","change","channel","cheese","cherries","cherry","chess","chicken","chickens","children","chin","church","circle","clam","class","clock","clocks","cloth","cloud","clouds","clover","club","coach","coal","coast","coat","cobweb","coil","collar","color","comb","comfort","committee","company","comparison","competition","condition","connection","control","cook","copper","copy","cord","cork","corn","cough","country","cover","cow","cows","crack","cracker","crate","crayon","cream","creator","creature","credit","crib","crime","crook","crow","crowd","crown","crush","cry","cub","cup","current","curtain","curve","cushion","dad","daughter","day","death","debt","decision","deer","degree","design","desire","desk","destruction","detail","development","digestion","dime","dinner","dinosaurs","direction","dirt","discovery","discussion","disease","disgust","distance","distribution","division","dock","doctor","dog","dogs","doll","dolls","donkey","door","downtown","drain","drawer","dress","drink","driving","drop","drug","drum","duck","ducks","dust","earth","earthquake","edge","education","effect","egg","eggnog","eggs","elbow","end","engine","error","event","example","exchange","existence","expansion","experience","expert","eye","eyes","face","fact","fairies","fall","family","fan","fang","farm","farmer","father","faucet","fear","feast","feather","feeling","feet","fiction","field","fifth","fight","finger","fire","fireman","fish","flag","flame","flavor","flesh","flight","flock","floor","flower","flowers","fly","fog","fold","food","foot","force","fork","form","fowl","frame","friction","friend","friends","frog","frogs","front","fruit","fuel","furniture","galley","game","garden","gate","geese","ghost","giants","giraffe","girl","girls","glass","glove","glue","goat","gold","goldfish","good-bye","goose","government","governor","grade","grain","grandfather","grandmother","grape","grass","grip","ground","group","growth","guide","guitar","gun","hair","haircut","hall","hammer","hand","hands","harbor","harmony","hat","hate","head","health","hearing","heart","heat","help","hen","hill","history","hobbies","hole","holiday","home","honey","hook","hope","horn","horse","horses","hose","hospital","hot","hour","house","houses","humor","hydrant","icicle","idea","impulse","income","increase","industry","ink","insect","instrument","insurance","interest","invention","iron","island","jail","jam","jar","jeans","jelly","jellyfish","jewel","join","joke","journey","judge","juice","jump","kettle","key","kick","kiss","kite","kitten","kittens","kitty","knee","knife","knot","knowledge","laborer","lace","ladybug","lake","lamp","land","language","laugh","lawyer","lead","leaf","learning","leather","leg","legs","letter","letters","lettuce","level","library","lift","light","limit","line","linen","lip","liquid","list","lizards","loaf","lock","locket","look","loss","love","low","lumber","lunch","lunchroom","magic","maid","mailbox","man","manager","map","marble","mark","market","mask","mass","match","meal","measure","meat","meeting","memory","men","metal","mice","middle","milk","mind","mine","minister","mint","minute","mist","mitten","mom","money","monkey","month","moon","morning","mother","motion","mountain","mouth","move","muscle","music","name","nation","neck","need","needle","nerve","nest","net","news","night","noise","north","nose","note","notebook","number","nut eal","oatmeal","observation","ocean","offer","office","oil","operation","opinion","orange","oranges","order","organization","ornament","oven","owl","owner","page","pail","pain","paint","pan","pancake","paper","parcel","parent","park","part","partner","party","passenger","paste","patch","payment","peace","pear","pen","pencil","person","pest","pet","pets","pickle","picture","pie","pies","pig","pigs","pin","pipe","pizzas","place","plane","planes","plant","plantation","plants","plastic","plate","play","playground","pleasure","plot","plough","pocket","point","poison","police","polish","pollution","popcorn","porter","position","pot","potato","powder","power","price","print","prison","process","produce","profit","property","prose","protest","pull","pump","punishment","purpose","push  r","quartz","queen","question","quicksand","quiet","quill","quilt","quince","quiver","rabbit","rabbits","rail","railway","rain","rainstorm","rake","range","rat","rate","ray","reaction","reading","reason","receipt","recess","record","regret","relation","religion","representative","request","respect","rest","reward","rhythm","rice","riddle","rifle","ring","rings","river","road","robin","rock","rod","roll","roof","room","root","rose","route","rub","rule","run","sack","sail","salt","sand","scale","scarecrow","scarf","scene","scent","school","science","scissors","screw","sea","seashore","seat","secretary","seed","selection","self","sense","servant","shade","shake","shame","shape","sheep","sheet","shelf","ship","shirt","shock","shoe","shoes","shop","show","side","sidewalk","sign","silk","silver","sink","sister","sisters","size","skate","skin","skirt","sky","slave","sleep","sleet","slip","slope","smash","smell","smile","smoke","snail","snails","snake","snakes","sneeze","snow","soap","society","sock","soda","sofa","son","song","songs","sort","sound","soup","space","spade","spark","spiders","sponge","spoon","spot","spring","spy","square","squirrel","stage","stamp","star","start","statement","station","steam","steel","stem","step","stew","stick","sticks","stitch","stocking","stomach","stone","stop","store","story","stove","stranger","straw","stream","street","stretch","string","structure","substance","sugar","suggestion","suit","summer","sun","support","surprise","sweater","swim","swing","system","table","tail","talk","tank","taste","tax","teaching","team","teeth","temper","tendency","tent","territory","test","texture","theory","thing","things","thought","thread","thrill","throat","throne","thumb","thunder","ticket","tiger","time","tin","title","toad","toe","toes","tomatoes","tongue","tooth","toothbrush","toothpaste","top","touch","town","toy","toys","trade","trail","train","trains","tramp","transport","tray","treatment","tree","trees","trick","trip","trouble","trousers","truck","trucks","tub","turkey","turn","twig","twist","umbrella","uncle","underwear","unit","use tion","vacation","value","van","vase","vegetable","veil","vein","verse","vessel","vest","view","visitor","voice","volcano","volleyball","voyage","wall","war","wash","waste","watch","water","wave","waves","wax","way","wealth","weather","week","weight","wheel","whip","whistle","wilderness","wind","window","wine","wing","winter","wire","wish","woman","women","wood","wool","word","work","worm","wound","wren","wrench","wrist","writer","writing","yam","yard","yarn","year","yoke","zebra","zephyr","zinc","zipper","zoo"];
haxe_ds_ObjectMap.count = 0;
minicanvas_MiniCanvas.displayGenerationTime = false;
minicanvas_BrowserCanvas._backingStoreRatio = 0;
minicanvas_BrowserCanvas.attachKeyEventsToCanvas = false;
minicanvas_BrowserCanvas.defaultScaleMode = minicanvas_ScaleMode.Auto;
minicanvas_BrowserCanvas.parentNode = typeof document != 'undefined' && document.body;
minicanvas_NodeCanvas.defaultScaleMode = minicanvas_ScaleMode.NoScale;
minicanvas_NodeCanvas.imagePath = "images";
thx_color_parse_ColorParser.parser = new thx_color_parse_ColorParser();
thx_color_parse_ColorParser.isPureHex = new EReg("^([0-9a-f]{2}){3,4}$","i");
thx_core_Floats.pattern_parse = new EReg("^(\\+|-)?\\d+(\\.\\d+)?(e-?\\d+)?$","");
thx_core_Ints.pattern_parse = new EReg("^[+-]?(\\d+|0x[0-9A-F]+)$","i");
thx_culture_DateFormatInfo.invariant = new thx_culture_DateFormatInfo(0,"FirstDay","AM","PM",0,"Sunday","Gregorian",null,["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],["Su","Mo","Tu","We","Th","Fr","Sa"],["January","February","March","April","May","June","July","August","September","October","November","December",""],["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",""],["January","February","March","April","May","June","July","August","September","October","November","December",""],["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",""],"dddd, dd MMMM yyyy","MM/dd/yyyy","dddd, dd MMMM yyyy HH:mm:ss","yyyy'-'MM'-'dd'T'HH':'mm':'ss","MMMM dd","ddd, dd MMM yyyy HH':'mm':'ss 'GMT'","HH:mm:ss","HH:mm","yyyy'-'MM'-'dd HH':'mm':'ss'Z'","yyyy MMMM","/",":");
thx_culture_NumberFormatInfo.invariant = new thx_culture_NumberFormatInfo(2,2,2,[3],[3],[3],0,1,0,0,0,".",".",".",",",",",",","-","+","¤","NaN","-Infinity","%","‰","Infinity");
thx_culture_Culture.invariant = new thx_culture_Culture("",thx_culture_DateFormatInfo.invariant,"",false,"iv","IVL",false,127,"Gregorian","Invariant Language","Invariant Language","Invariant Country","Invariant Country",thx_culture_NumberFormatInfo.invariant,",","IVL");
thx_culture_Pattern.numberNegatives = ["(n)","-n","- n","n-","n -"];
Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});
