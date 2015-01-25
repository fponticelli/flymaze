(function (console) { "use strict";
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
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
	,matchedPos: function() {
		if(this.r.m == null) throw "No string matched";
		return { pos : this.r.m.index, len : this.r.m[0].length};
	}
	,matchSub: function(s,pos,len) {
		if(len == null) len = -1;
		if(this.r.global) {
			this.r.lastIndex = pos;
			this.r.m = this.r.exec(len < 0?s:HxOverrides.substr(s,0,pos + len));
			var b = this.r.m != null;
			if(b) this.r.s = s;
			return b;
		} else {
			var b1 = this.match(len < 0?HxOverrides.substr(s,pos,null):HxOverrides.substr(s,pos,len));
			if(b1) {
				this.r.s = s;
				this.r.m.index += pos;
			}
			return b1;
		}
	}
	,split: function(s) {
		var d = "#__delim__#";
		return s.replace(this.r,d).split(d);
	}
	,replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,map: function(s,f) {
		var offset = 0;
		var buf = new StringBuf();
		do {
			if(offset >= s.length) break; else if(!this.matchSub(s,offset)) {
				buf.add(HxOverrides.substr(s,offset,null));
				break;
			}
			var p = this.matchedPos();
			buf.add(HxOverrides.substr(s,offset,p.pos - offset));
			buf.add(f(this));
			if(p.len == 0) {
				buf.add(HxOverrides.substr(s,p.pos,1));
				offset = p.pos + 1;
			} else offset = p.pos + p.len;
		} while(this.r.global);
		if(!this.r.global && offset > 0 && offset < s.length) buf.add(HxOverrides.substr(s,offset,null));
		return buf.b;
	}
	,__class__: EReg
};
var HxOverrides = function() { };
HxOverrides.__name__ = ["HxOverrides"];
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
var Lambda = function() { };
Lambda.__name__ = ["Lambda"];
Lambda.has = function(it,elt) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(x == elt) return true;
	}
	return false;
};
var Main = function() { };
Main.__name__ = ["Main"];
Main.main = function() {
	Main.mini = minicanvas_MiniCanvas.create(fly_Config.width,fly_Config.height).display("flymaze");
	Main.decorateBackground();
	Main.startScreen();
};
Main.startScreen = function() {
	Main.background();
	Main.write("FlyMaze",48,fly_Config.width / 2,fly_Config.height / 2);
	Main.write("(press bar to start)",16,fly_Config.width / 2,fly_Config.height / 4 * 3);
	thx_core_Timer.delay(function() {
		Main.mini.onKeyUp(function(e) {
			if(e.keyCode != 32) return;
			Main.mini.offKeyUp();
			var info = new fly_components_GameInfo(0,0,0,0);
			Main.playLevel(info);
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
};
Main.intermediateScreen = function(info) {
	Main.background();
	Main.write("Level " + info.level + " Complete",48,fly_Config.width / 2,fly_Config.height / 2);
	Main.write("current score " + thx_format_NumberFormat.number(info.score,0),24,fly_Config.width / 2,fly_Config.height / 4 * 3);
	Main.write("(press bar to continue)",16,fly_Config.width / 2,fly_Config.height / 4 * 3.5);
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
	Main.write("Game Over ",48,fly_Config.width / 2,fly_Config.height / 2);
	Main.write("final score " + thx_format_NumberFormat.number(info.score,0) + (" (lvl " + info.level + ")"),24,fly_Config.width / 2,fly_Config.height / 8 * 10);
	thx_core_Timer.delay(function() {
		Main.mini.onKeyUp(function(e) {
			if(e.keyCode != 32) return;
			Main.mini.offKeyUp();
			var info1 = new fly_components_GameInfo(0,0,0,0);
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
	el.style.backgroundSize = "" + w + "px " + h + "px";
	el.style.backgroundImage = "url(" + mini.canvas.toDataURL("image/png") + ")";
};
Main.write = function(text,size,x,y) {
	Main.mini.ctx.font = size + "px 'Montserrat', sans-serif";
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
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
};
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
};
Reflect.isObject = function(v) {
	if(v == null) return false;
	var t = typeof(v);
	return t == "string" || t == "object" && v.__enum__ == null || t == "function" && (v.__name__ || v.__ename__) != null;
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
var StringBuf = function() {
	this.b = "";
};
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype = {
	b: null
	,add: function(x) {
		this.b += Std.string(x);
	}
	,__class__: StringBuf
};
var StringTools = function() { };
StringTools.__name__ = ["StringTools"];
StringTools.startsWith = function(s,start) {
	return s.length >= start.length && HxOverrides.substr(s,0,start.length) == start;
};
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return slen >= elen && HxOverrides.substr(s,slen - elen,elen) == end;
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
StringTools.lpad = function(s,c,l) {
	if(c.length <= 0) return s;
	while(s.length < l) s = c + s;
	return s;
};
StringTools.rpad = function(s,c,l) {
	if(c.length <= 0) return s;
	while(s.length < l) s = s + c;
	return s;
};
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
};
StringTools.hex = function(n,digits) {
	var s = "";
	var hexChars = "0123456789ABCDEF";
	do {
		s = hexChars.charAt(n & 15) + s;
		n >>>= 4;
	} while(n > 0);
	if(digits != null) while(s.length < digits) s = "0" + s;
	return s;
};
var ValueType = { __ename__ : ["ValueType"], __constructs__ : ["TNull","TInt","TFloat","TBool","TObject","TFunction","TClass","TEnum","TUnknown"] };
ValueType.TNull = ["TNull",0];
ValueType.TNull.__enum__ = ValueType;
ValueType.TInt = ["TInt",1];
ValueType.TInt.__enum__ = ValueType;
ValueType.TFloat = ["TFloat",2];
ValueType.TFloat.__enum__ = ValueType;
ValueType.TBool = ["TBool",3];
ValueType.TBool.__enum__ = ValueType;
ValueType.TObject = ["TObject",4];
ValueType.TObject.__enum__ = ValueType;
ValueType.TFunction = ["TFunction",5];
ValueType.TFunction.__enum__ = ValueType;
ValueType.TClass = function(c) { var $x = ["TClass",6,c]; $x.__enum__ = ValueType; return $x; };
ValueType.TEnum = function(e) { var $x = ["TEnum",7,e]; $x.__enum__ = ValueType; return $x; };
ValueType.TUnknown = ["TUnknown",8];
ValueType.TUnknown.__enum__ = ValueType;
var Type = function() { };
Type.__name__ = ["Type"];
Type.getClass = function(o) {
	if(o == null) return null;
	return js_Boot.getClass(o);
};
Type.getSuperClass = function(c) {
	return c.__super__;
};
Type.getClassName = function(c) {
	var a = c.__name__;
	if(a == null) return null;
	return a.join(".");
};
Type.getEnumName = function(e) {
	var a = e.__ename__;
	return a.join(".");
};
Type.getInstanceFields = function(c) {
	var a = [];
	for(var i in c.prototype) a.push(i);
	HxOverrides.remove(a,"__class__");
	HxOverrides.remove(a,"__properties__");
	return a;
};
Type["typeof"] = function(v) {
	var _g = typeof(v);
	switch(_g) {
	case "boolean":
		return ValueType.TBool;
	case "string":
		return ValueType.TClass(String);
	case "number":
		if(Math.ceil(v) == v % 2147483648.0) return ValueType.TInt;
		return ValueType.TFloat;
	case "object":
		if(v == null) return ValueType.TNull;
		var e = v.__enum__;
		if(e != null) return ValueType.TEnum(e);
		var c = js_Boot.getClass(v);
		if(c != null) return ValueType.TClass(c);
		return ValueType.TObject;
	case "function":
		if(v.__name__ || v.__ename__) return ValueType.TObject;
		return ValueType.TFunction;
	case "undefined":
		return ValueType.TNull;
	default:
		return ValueType.TUnknown;
	}
};
var amaze__$Cell_Cell_$Impl_$ = {};
amaze__$Cell_Cell_$Impl_$.__name__ = ["amaze","_Cell","Cell_Impl_"];
amaze__$Cell_Cell_$Impl_$._new = function(value) {
	return value;
};
amaze__$Cell_Cell_$Impl_$.get_right = function(this1) {
	return 0 != (this1 & 2);
};
amaze__$Cell_Cell_$Impl_$.get_top = function(this1) {
	return 0 != (this1 & 1);
};
amaze__$Cell_Cell_$Impl_$.get_bottom = function(this1) {
	return 0 != (this1 & 4);
};
amaze__$Cell_Cell_$Impl_$.get_left = function(this1) {
	return 0 != (this1 & 8);
};
amaze__$Cell_Cell_$Impl_$.set_right = function(this1,v) {
	if(v) this1 = this1 | 2; else this1 = this1 ^ 2;
	return v;
};
amaze__$Cell_Cell_$Impl_$.set_top = function(this1,v) {
	if(v) this1 = this1 | 1; else this1 = this1 ^ 1;
	return v;
};
amaze__$Cell_Cell_$Impl_$.set_bottom = function(this1,v) {
	if(v) this1 = this1 | 4; else this1 = this1 ^ 4;
	return v;
};
amaze__$Cell_Cell_$Impl_$.set_left = function(this1,v) {
	if(v) this1 = this1 | 8; else this1 = this1 ^ 8;
	return v;
};
amaze__$Cell_Cell_$Impl_$.bitwiseOrAssign = function(this1,other) {
	return this1 |= other;
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
	,toString: function() {
		if(null == this.cells) return "Maze (not generated)"; else {
			var out = [];
			out.push("_" + thx_core_Strings.repeat("_",this.width * 2 - 1) + "_");
			var _g1 = 0;
			var _g = this.height;
			while(_g1 < _g) {
				var y = _g1++;
				var row = "|";
				var _g3 = 0;
				var _g2 = this.width;
				while(_g3 < _g2) {
					var x = _g3++;
					if((this.cells[y][x] & 4) != 0) row += " "; else row += "_";
					if((this.cells[y][x] & 2) != 0) if(((this.cells[y][x] | this.cells[y][x + 1]) & 4) != 0) row += " "; else row += "_"; else row += "|";
				}
				out.push(row);
			}
			return "\n" + out.join("\n") + "\n";
		}
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
	,entities: function() {
		return this.mapEntities.keys();
	}
	,createPhase: function() {
		var phase = new edge_Phase(this);
		this.listPhases.push(phase);
		return phase;
	}
	,phases: function() {
		return HxOverrides.iter(this.listPhases);
	}
	,systems: function() {
		return this.mapInfo.keys();
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
		if(info.hasEngine) system.engine = this;
		if(info.hasDelta) system.timeDelta = t;
		if(!info.hasComponents) Reflect.callMethod(system,info.update,this.emptyArgs); else {
			if(info.hasEntities) Reflect.setField(system,"entities",info.entities.iterator());
			if(info.hasBefore) Reflect.callMethod(system,info.update,this.emptyArgs);
			var $it0 = info.components.keys();
			while( $it0.hasNext() ) {
				var entity = $it0.next();
				var components = info.components.h[entity.__id__];
				if(info.hasEntity) system.entity = entity;
				Reflect.callMethod(system,info.update,components);
			}
		}
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
	,exists: function(component) {
		return this.existsType(Type.getClassName(Type.getClass(component)));
	}
	,existsType: function(type) {
		return this.map.exists(type);
	}
	,remove: function(component) {
		this._remove(component);
		if(null != this.engine) this.engine.matchSystems(this);
	}
	,removeMany: function(components) {
		var _g = this;
		components.map(function(_) {
			_g._remove(_);
			return;
		});
		if(null != this.engine) this.engine.matchSystems(this);
	}
	,removeType: function(type) {
		this._removeTypeName(Type.getClassName(type));
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
	,components: function() {
		return this.map.iterator();
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
	,key: function(component) {
		return Type.getClassName(Type.getClass(component));
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
	,insertBefore: function(ref,system) {
		var noderef = this.mapSystem.h[ref.__id__];
		if(null == noderef) throw "Phase.insertBefore: unable to find " + Std.string(ref) + " system";
		var node = this.createNode(system);
		if(noderef == this.first) {
			node.next = noderef;
			noderef.prev = node;
			this.first = node;
		} else {
			var prev = noderef.prev;
			prev.next = node;
			node.prev = prev;
			node.next = noderef;
			noderef.prev = node;
		}
	}
	,insertAfter: function(ref,system) {
		var noderef = this.mapSystem.h[ref.__id__];
		if(null == noderef) throw "Phase.insertAfter: unable to find " + Std.string(ref) + " system";
		var node = this.createNode(system);
		if(noderef == this.last) {
			node.prev = noderef;
			noderef.next = node;
			this.last = node;
		} else {
			var next = noderef.next;
			next.prev = node;
			node.next = next;
			node.prev = noderef;
			noderef.next = node;
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
	,removeType: function(cls) {
		var system;
		var key = Type.getClassName(cls);
		system = this.mapType.get(key);
		if(null == system) throw "type system " + Type.getClassName(cls) + " is not included in this Phase";
		this.remove(system);
		return;
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
	,pseudoRandom: null
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
	,toString: function() {
		return "Edible(makeJump=$makeJump,makeDroplet=$makeDroplet,score=$score,countToPassLevel=$countToPassLevel)";
	}
	,__class__: fly_components_Edible
};
var fly_Game = function(mini,config,gameInfo,endLevel) {
	this.running = false;
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
		}
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
	var steering = fly_Game.ONE_DEGREE * 10;
	this.world.frame.add(new fly_systems_KeyboardInput(function(e1) {
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
			default:
				console.log("key: " + key);
			}
		}
	}));
	this.world.physics.add(new fly_systems_UpdateGameInfo(gameInfo,function(nextLevel) {
		window.removeEventListener("keyup",keyUp);
		_g.world.clear();
		endLevel(nextLevel);
	}));
	this.world.physics.add(new fly_systems_UpdateDelayedComponents());
	this.world.physics.add(new fly_systems_MazeCollision(config.cellSize));
	this.world.physics.add(new fly_systems_UpdatePosition());
	this.world.physics.add(new fly_systems_UpdateFly(fly_Config.width,fly_Config.height,config.gen));
	this.world.physics.add(new fly_systems_UpdateSnake());
	this.world.physics.add(new fly_systems_SnakeEats(gameInfo,10));
	this.world.physics.add(new fly_systems_UpdateDroplet());
	this.world.physics.add(new fly_systems_UpdateExplosion());
	this.world.physics.add(new fly_systems_UpdateDetonation(gameInfo,10));
	this.world.render.add(new fly_systems_RenderBackground(mini,config.backgroundColor));
	this.world.render.add(new fly_systems_RenderDroplet(mini));
	this.world.render.add(new fly_systems_RenderMaze(mini.ctx,config.cellSize));
	this.world.render.add(new fly_systems_RenderFlower(mini,200,20));
	this.world.render.add(new fly_systems_RenderSnake(mini));
	this.world.render.add(new fly_systems_RenderFly(mini));
	this.world.render.add(new fly_systems_RenderExplosion(mini));
	this.world.render.add(new fly_systems_RenderGameInfo(gameInfo,mini));
	window.addEventListener("keyup",keyUp);
};
fly_Game.__name__ = ["fly","Game"];
fly_Game.prototype = {
	world: null
	,engine: null
	,config: null
	,maze: null
	,running: null
	,createFly: function(engine,config) {
		var a = config.gen["float"]() * Math.PI * 2;
		var p = new fly_components_Position(config.gen["float"]() * fly_Config.width,config.gen["float"]() * fly_Config.height);
		engine.add(new edge_Entity([p,fly_components_Fly.create(config.gen),fly_Game.edibleFly]));
	}
	,createFlower: function(engine,config) {
		var p = new fly_components_Position(fly_Config.width * config.gen["float"](),fly_Config.height * config.gen["float"]());
		engine.add(new edge_Entity([p,new fly_components_Flower(config.gen["int"]()),fly_Game.edibleFlower]));
	}
	,start: function() {
		this.world.start();
	}
	,stop: function() {
		this.world.stop();
	}
	,__class__: fly_Game
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
	,toString: function() {
		return "DelayedComponents(ticks=$ticks,toAdd=$toAdd,toRemove=$toRemove)";
	}
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
	,toString: function() {
		return "Explosion(stage=$stage,draw=$draw)";
	}
	,__class__: fly_components_Explosion
};
var fly_components_Detonation = function(radius) {
	this.radius = radius;
};
fly_components_Detonation.__name__ = ["fly","components","Detonation"];
fly_components_Detonation.__interfaces__ = [edge_IComponent];
fly_components_Detonation.prototype = {
	radius: null
	,toString: function() {
		return "Detonation(radius=$radius)";
	}
	,__class__: fly_components_Detonation
};
var fly_components_Direction = function(angle) {
	this.angle = angle;
};
fly_components_Direction.__name__ = ["fly","components","Direction"];
fly_components_Direction.__interfaces__ = [edge_IComponent];
fly_components_Direction.prototype = {
	angle: null
	,dx: null
	,dy: null
	,get_dx: function() {
		return Math.cos(this.angle);
	}
	,get_dy: function() {
		return Math.sin(this.angle);
	}
	,toString: function() {
		return "Direction(angle=$angle)";
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
	,toString: function() {
		return "Droplet(radius=$radius,color=$color,life=$life)";
	}
	,__class__: fly_components_Droplet
};
var fly_components_Flower = function(id) {
	this.id = id;
};
fly_components_Flower.__name__ = ["fly","components","Flower"];
fly_components_Flower.__interfaces__ = [edge_IComponent];
fly_components_Flower.prototype = {
	id: null
	,toString: function() {
		return "Flower(id=$id)";
	}
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
	,toString: function() {
		return "Fly(height=$height)";
	}
	,__class__: fly_components_Fly
};
var fly_components_GameInfo = function(score,toPassLevel,timeLeft,level) {
	this.score = score;
	this.toPassLevel = toPassLevel;
	this.timeLeft = timeLeft;
	this.level = level;
};
fly_components_GameInfo.__name__ = ["fly","components","GameInfo"];
fly_components_GameInfo.__interfaces__ = [edge_IComponent];
fly_components_GameInfo.prototype = {
	score: null
	,toPassLevel: null
	,timeLeft: null
	,level: null
	,toString: function() {
		return "GameInfo(score=$score,toPassLevel=$toPassLevel,timeLeft=$timeLeft,level=$level)";
	}
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
	,toString: function() {
		return "Maze(maze=$maze,id=$id)";
	}
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
	,toString: function() {
		return "Position(x=$x,y=$y)";
	}
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
	,toString: function() {
		return "Snake(pos=$pos,trail=$trail,trailWidth=$trailWidth,headWidth=$headWidth,colors=$colors,jumping=$jumping)";
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
	,toString: function() {
		return "Velocity(value=$value)";
	}
	,__class__: fly_components_Velocity
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
	,toString: function() {
		return "fly.systems.KeyboardInput";
	}
	,__class__: fly_systems_KeyboardInput
};
var fly_systems_KeyboardEvent = function(input) {
	this.input = input;
};
fly_systems_KeyboardEvent.__name__ = ["fly","systems","KeyboardEvent"];
fly_systems_KeyboardEvent.prototype = {
	keys: null
	,input: null
	,remove: function(code) {
		HxOverrides.remove(this.input.keys,code);
	}
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
			if(drow < row && !(0 != (cell & 1)) || drow > row && !(0 != (cell & 4))) d.angle = -d.angle;
		} else if(drow == row) {
			if(dcol < col && !(0 != (cell & 8)) || dcol > col && !(0 != (cell & 2))) d.angle = -d.angle + Math.PI;
		} else if(dcol < col && drow < row) {
			if(this.pos(col * this.cellSize,row * this.cellSize,p.x,p.y,dx,dy) > 0) {
				if(!(0 != (cell & 1))) {
					if(!(0 != (cell & 8))) d.angle += Math.PI; else d.angle = -d.angle;
				} else if(null != cells[row - 1][col] && !(0 != (cells[row - 1][col] & 8))) d.angle = -d.angle + Math.PI;
			} else if(!(0 != (cell & 8))) {
				if(!(0 != (cell & 1))) d.angle += Math.PI; else d.angle = -d.angle + Math.PI;
			} else if(null != cells[row][col - 1] && !(0 != (cells[row][col - 1] & 1))) d.angle = -d.angle;
		} else if(dcol > col && drow > row) {
			if(this.pos(col * this.cellSize,row * this.cellSize,p.x,p.y,dx,dy) > 0) {
				if(!(0 != (cell & 4))) {
					if(!(0 != (cell & 2))) d.angle += Math.PI; else d.angle = -d.angle;
				} else if(null != cells[row + 1][col] && !(0 != (cells[row + 1][col] & 2))) d.angle = -d.angle + Math.PI;
			} else if(!(0 != (cell & 2))) {
				if(!(0 != (cell & 4))) d.angle += Math.PI; else d.angle = -d.angle + Math.PI;
			} else if(null != cells[row][col + 1] && !(0 != (cells[row][col + 1] & 4))) d.angle = -d.angle;
		} else if(dcol < col && drow > row) {
			if(this.pos(col * this.cellSize,row * this.cellSize,p.x,p.y,dx,dy) > 0) {
				if(!(0 != (cell & 4))) {
					if(!(0 != (cell & 8))) d.angle += Math.PI; else d.angle = -d.angle;
				} else if(null != cells[row + 1][col] && !(0 != (cells[row + 1][col] & 8))) d.angle = -d.angle + Math.PI;
			} else if(!(0 != (cell & 8))) {
				if(!(0 != (cell & 4))) d.angle += Math.PI; else d.angle = -d.angle + Math.PI;
			} else if(null != cells[row][col - 1] && !(0 != (cells[row][col - 1] & 4))) d.angle = -d.angle;
		} else if(dcol > col && drow < row) {
			if(this.pos(col * this.cellSize,row * this.cellSize,p.x,p.y,dx,dy) > 0) {
				if(!(0 != (cell & 1))) {
					if(!(0 != (cell & 2))) d.angle += Math.PI; else d.angle = -d.angle;
				} else if(null != cells[row - 1][col] && !(0 != (cells[row - 1][col] & 2))) d.angle = -d.angle + Math.PI;
			} else if(!(0 != (cell & 2))) {
				if(!(0 != (cell & 1))) d.angle += Math.PI; else d.angle = -d.angle + Math.PI;
			} else if(null != cells[row][col + 1] && !(0 != (cells[row][col + 1] & 1))) d.angle = -d.angle;
		}
	}
	,pos: function(x,y,ax,ay,bx,by) {
		if((bx - ax) * (y - ay) - (by - ay) * (x - ax) < 0) return -1; else return 1;
	}
	,componentRequirements: null
	,entityRequirements: null
	,toString: function() {
		return "fly.systems.MazeCollision";
	}
	,__class__: fly_systems_MazeCollision
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
	,toString: function() {
		return "fly.systems.RenderBackground";
	}
	,__class__: fly_systems_RenderBackground
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
	,toString: function() {
		return "fly.systems.RenderDroplet";
	}
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
	,toString: function() {
		return "fly.systems.RenderExplosion";
	}
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
	,toString: function() {
		return "fly.systems.RenderFlower";
	}
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
	,toString: function() {
		return "fly.systems.RenderFly";
	}
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
	}
	,componentRequirements: null
	,entityRequirements: null
	,toString: function() {
		return "fly.systems.RenderGameInfo";
	}
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
	,toString: function() {
		return "fly.systems.RenderMaze";
	}
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
	,toString: function() {
		return "fly.systems.RenderSnake";
	}
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
				this.gameInfo.score += o.edible.score;
				if(o.edible.countToPassLevel) this.gameInfo.toPassLevel--;
			}
		}
	}
	,componentRequirements: null
	,entityRequirements: null
	,toString: function() {
		return "fly.systems.SnakeEats";
	}
	,__class__: fly_systems_SnakeEats
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
	,toString: function() {
		return "fly.systems.UpdateDelayedComponents";
	}
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
	,toString: function() {
		return "fly.systems.UpdateDetonation";
	}
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
	,engine: null
	,update: function(droplet) {
		droplet.life--;
		if(droplet.life <= 0) {
			this.entity.remove(droplet);
			this.entity.add(fly_components_Explosion.create());
		}
	}
	,componentRequirements: null
	,entityRequirements: null
	,toString: function() {
		return "fly.systems.UpdateDroplet";
	}
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
		if(explosion.stage == fly_components_Explosion.maxStage) this.entity.add(fly_components_Detonation.instance);
		explosion.stage--;
		if(explosion.stage <= 0) this.engine.remove(this.entity);
	}
	,componentRequirements: null
	,entityRequirements: null
	,toString: function() {
		return "fly.systems.UpdateExplosion";
	}
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
	,toString: function() {
		return "fly.systems.UpdateFly";
	}
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
	,toString: function() {
		return "fly.systems.UpdateGameInfo";
	}
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
	,toString: function() {
		return "fly.systems.UpdatePosition";
	}
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
	,toString: function() {
		return "fly.systems.UpdateSnake";
	}
	,__class__: fly_systems_UpdateSnake
};
var haxe_StackItem = { __ename__ : ["haxe","StackItem"], __constructs__ : ["CFunction","Module","FilePos","Method","LocalFunction"] };
haxe_StackItem.CFunction = ["CFunction",0];
haxe_StackItem.CFunction.__enum__ = haxe_StackItem;
haxe_StackItem.Module = function(m) { var $x = ["Module",1,m]; $x.__enum__ = haxe_StackItem; return $x; };
haxe_StackItem.FilePos = function(s,file,line) { var $x = ["FilePos",2,s,file,line]; $x.__enum__ = haxe_StackItem; return $x; };
haxe_StackItem.Method = function(classname,method) { var $x = ["Method",3,classname,method]; $x.__enum__ = haxe_StackItem; return $x; };
haxe_StackItem.LocalFunction = function(v) { var $x = ["LocalFunction",4,v]; $x.__enum__ = haxe_StackItem; return $x; };
var haxe_CallStack = function() { };
haxe_CallStack.__name__ = ["haxe","CallStack"];
haxe_CallStack.callStack = function() {
	var oldValue = Error.prepareStackTrace;
	Error.prepareStackTrace = function(error,callsites) {
		var stack = [];
		var _g = 0;
		while(_g < callsites.length) {
			var site = callsites[_g];
			++_g;
			var method = null;
			var fullName = site.getFunctionName();
			if(fullName != null) {
				var idx = fullName.lastIndexOf(".");
				if(idx >= 0) {
					var className = HxOverrides.substr(fullName,0,idx);
					var methodName = HxOverrides.substr(fullName,idx + 1,null);
					method = haxe_StackItem.Method(className,methodName);
				}
			}
			stack.push(haxe_StackItem.FilePos(method,site.getFileName(),site.getLineNumber()));
		}
		return stack;
	};
	var a = haxe_CallStack.makeStack(new Error().stack);
	a.shift();
	Error.prepareStackTrace = oldValue;
	return a;
};
haxe_CallStack.exceptionStack = function() {
	return [];
};
haxe_CallStack.toString = function(stack) {
	var b = new StringBuf();
	var _g = 0;
	while(_g < stack.length) {
		var s = stack[_g];
		++_g;
		b.b += "\nCalled from ";
		haxe_CallStack.itemToString(b,s);
	}
	return b.b;
};
haxe_CallStack.itemToString = function(b,s) {
	switch(s[1]) {
	case 0:
		b.b += "a C function";
		break;
	case 1:
		var m = s[2];
		b.b += "module ";
		if(m == null) b.b += "null"; else b.b += "" + m;
		break;
	case 2:
		var line = s[4];
		var file = s[3];
		var s1 = s[2];
		if(s1 != null) {
			haxe_CallStack.itemToString(b,s1);
			b.b += " (";
		}
		if(file == null) b.b += "null"; else b.b += "" + file;
		b.b += " line ";
		if(line == null) b.b += "null"; else b.b += "" + line;
		if(s1 != null) b.b += ")";
		break;
	case 3:
		var meth = s[3];
		var cname = s[2];
		if(cname == null) b.b += "null"; else b.b += "" + cname;
		b.b += ".";
		if(meth == null) b.b += "null"; else b.b += "" + meth;
		break;
	case 4:
		var n = s[2];
		b.b += "local function #";
		if(n == null) b.b += "null"; else b.b += "" + n;
		break;
	}
};
haxe_CallStack.makeStack = function(s) {
	if(typeof(s) == "string") {
		var stack = s.split("\n");
		var m = [];
		var _g = 0;
		while(_g < stack.length) {
			var line = stack[_g];
			++_g;
			m.push(haxe_StackItem.Module(line));
		}
		return m;
	} else return s;
};
var haxe_IMap = function() { };
haxe_IMap.__name__ = ["haxe","IMap"];
haxe_IMap.prototype = {
	remove: null
	,__class__: haxe_IMap
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
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) return true;
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	if(typeof window != "undefined") return window[name]; else return global[name];
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
	,border: function(weight,color) {
		if(weight == null) weight = 1.0;
		if(null == color) color = thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(0,0,0,1)");
		return this.rect(weight / 2,weight / 2,this.width - weight / 2,this.height - weight / 2,weight,color);
	}
	,box: function(handler) {
		var _g1 = 0;
		var _g = this.width;
		while(_g1 < _g) {
			var x = _g1++;
			var _g3 = 0;
			var _g2 = this.height;
			while(_g3 < _g2) {
				var y = _g3++;
				this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(handler(x / this.width,y / this.height));
				this.ctx.fillRect(x,y,1,1);
			}
		}
		return this;
	}
	,checkboard: function(size,light,dark) {
		if(size == null) size = 8;
		var cols = Math.ceil(this.width / size);
		var rows = Math.ceil(this.height / size);
		var slight;
		if(null == light) slight = thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(255,255,255,1)"); else slight = light;
		var sdark;
		if(null == dark) sdark = thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(204,204,204,1)"); else sdark = dark;
		var _g = 0;
		while(_g < cols) {
			var c = _g++;
			var _g1 = 0;
			while(_g1 < rows) {
				var r = _g1++;
				if(c % 2 != r % 2) this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(slight); else this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(sdark);
				this.ctx.fillRect(c * size,r * size,size,size);
			}
		}
		return this;
	}
	,circle: function(x,y,radius,weight,lineColor,fillColor) {
		if(weight == null) weight = 1.0;
		if(null != fillColor || null != lineColor) this.ctx.beginPath();
		if(null != fillColor) this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(fillColor);
		if(null != lineColor) {
			this.ctx.strokeStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(lineColor);
			this.ctx.lineWidth = weight;
		}
		this.ctx.arc(x,y,radius,0,Math.PI * 2,true);
		if(null != fillColor) this.ctx.fill();
		if(null != lineColor) this.ctx.stroke();
	}
	,clear: function() {
		this.ctx.clearRect(0,0,this.width,this.height);
		return this;
	}
	,cross: function(ox,oy,weight,color) {
		if(weight == null) weight = 1.0;
		if(null == ox) ox = this.width / 2 + 0.5;
		if(null == oy) oy = this.height / 2 + 0.5;
		this.lineHorizontal(oy,weight,color);
		this.lineVertical(ox,weight,color);
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
	,dotGrid: function(dx,dy,radius,color,ox,oy) {
		if(oy == null) oy = 0.5;
		if(ox == null) ox = 0.5;
		if(radius == null) radius = 1.0;
		if(dy == null) dy = 10.0;
		if(dx == null) dx = 10.0;
		if(dx == 0) throw "invalid argument dx, should be different from zero";
		if(dy == 0) throw "invalid argument dy, should be different from zero";
		if(null == color) color = thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(170,170,170,1)");
		var py = oy % dy;
		while(py - radius <= this.height) {
			var px = ox % dx;
			while(px - radius <= this.width) {
				this.dot(px + 0.5,py + 0.5,radius,color);
				px += dx;
			}
			py += dy;
		}
		return this;
	}
	,fill: function(color) {
		this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(color);
		this.ctx.fillRect(0,0,this.width,this.height);
		return this;
	}
	,grid: function(dx,dy,weight,color,ox,oy) {
		if(oy == null) oy = 0.5;
		if(ox == null) ox = 0.5;
		if(weight == null) weight = 1.0;
		if(dy == null) dy = 10.0;
		if(dx == null) dx = 10.0;
		this.gridHorizontal(dy,weight,color,oy);
		this.gridVertical(dx,weight,color,ox);
		return this;
	}
	,gridHorizontal: function(dy,weight,color,oy) {
		if(oy == null) oy = 0.5;
		if(weight == null) weight = 1.0;
		if(dy == null) dy = 10.0;
		if(dy == 0) throw "invalid argument dy, should be different from zero";
		if(null == color) color = thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(204,204,204,1)");
		var py = oy % dy;
		while(py - weight / 2 <= this.height) {
			this.lineHorizontal(py,weight,color);
			py += dy;
		}
		return this;
	}
	,gridVertical: function(dx,weight,color,ox) {
		if(ox == null) ox = 0.5;
		if(weight == null) weight = 1.0;
		if(dx == null) dx = 10.0;
		if(dx == 0) throw "invalid argument dx, should be different from zero";
		if(null == color) color = thx_color__$RGBA_RGBA_$Impl_$.fromString("rgba(204,204,204,1)");
		var px = ox % dx;
		while(px - weight / 2 <= this.width) {
			this.lineVertical(px,weight,color);
			px += dx;
		}
		return this;
	}
	,gradientHorizontal: function(handler) {
		var _g1 = 0;
		var _g = this.width;
		while(_g1 < _g) {
			var x = _g1++;
			this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(handler(x / this.width));
			this.ctx.fillRect(x,0,1,this.height);
		}
		return this;
	}
	,gradientVertical: function(handler) {
		var _g1 = 0;
		var _g = this.height;
		while(_g1 < _g) {
			var y = _g1++;
			this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(handler(y / this.height));
			this.ctx.fillRect(0,y,this.width,1);
		}
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
	,lineHorizontal: function(offset,weight,color) {
		if(weight == null) weight = 1.0;
		return this.line(0,offset,this.width,offset,weight,color);
	}
	,lineVertical: function(offset,weight,color) {
		if(weight == null) weight = 1.0;
		return this.line(offset,0,offset,this.height,weight,color);
	}
	,palette: function(colors,padding,margin) {
		if(margin == null) margin = 0.0;
		if(padding == null) padding = 2.0;
		var rows = colors.length;
		var h = (this.height - 2 * margin - (rows - 1) * padding) / rows;
		var py = margin;
		var _g = 0;
		while(_g < colors.length) {
			var row = colors[_g];
			++_g;
			var cols = row.length;
			var w = (this.width - 2 * margin - (cols - 1) * padding) / cols;
			var px = margin;
			var _g1 = 0;
			while(_g1 < row.length) {
				var col = row[_g1];
				++_g1;
				this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(col);
				this.ctx.fillRect(px,py,w,h);
				px += w + padding;
			}
			py += h + padding;
		}
		return this;
	}
	,rect: function(x0,y0,x1,y1,weight,lineColor,fillColor) {
		if(weight == null) weight = 1.0;
		if(null != fillColor) {
			this.ctx.fillStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(fillColor);
			this.ctx.fillRect(x0,y0,x1 - x0,y1 - y0);
		}
		if(null != lineColor) {
			this.ctx.lineWidth = weight;
			this.ctx.strokeStyle = thx_color__$RGBA_RGBA_$Impl_$.toString(lineColor);
			this.ctx.strokeRect(x0,y0,x1 - x0,y1 - y0);
		}
		return this;
	}
	,animate: function(x,y) {
		var _g = this;
		var interaction = new minicanvas_CanvasInteraction(this,(function($this) {
			var $r;
			var t;
			{
				var _0 = x;
				if(null == _0) t = null; else t = _0;
			}
			$r = t != null?t:$this.width / 2;
			return $r;
		}(this)),(function($this) {
			var $r;
			var t1;
			{
				var _01 = y;
				if(null == _01) t1 = null; else t1 = _01;
			}
			$r = t1 != null?t1:$this.height;
			return $r;
		}(this)),function(stack) {
			_g.resolveStack(stack,$bind(_g,_g.afterAnimate));
			_g.storeFrame();
		});
		this.beforeAnimate();
		return interaction;
	}
	,animateNode: function(x,y) {
		if(this.isNode) return this.animate(x,y); else return new minicanvas_Interaction(this);
	}
	,animateBrowser: function(x,y) {
		if(this.isBrowser) return this.animate(x,y); else return new minicanvas_Interaction(this);
	}
	,storeFrame: function(times) {
		if(times == null) times = 1;
		return this;
	}
	,context: function(callback) {
		callback(this.ctx,this.width,this.height);
		return this;
	}
	,'with': function(callback) {
		callback(this);
		return this;
	}
	,onClick: function(callback) {
		return this.onMouseEvent("click",null,callback);
	}
	,onKeyDown: function(callback) {
		var _g = this;
		this._keyDown = { listener : function(e) {
			_g.keyDown(e.keyCode);
		}, callback : callback};
		if(this.isBrowser) {
			if(minicanvas_BrowserCanvas.attachKeyEventsToCanvas) {
				this.canvas.setAttribute("tabIndex","1");
				this.canvas.addEventListener("keydown",this._keyDown.listener);
			} else window.addEventListener("keydown",this._keyDown.listener);
		}
		return this;
	}
	,onKeyRepeat: function(callback) {
		var _g = this;
		var threshold = 40;
		var keys = thx_core__$Set_Set_$Impl_$.create();
		this._keyRepeat = { listener : function(e) {
			var isEmpty = keys.length == 0;
			thx_core__$Set_Set_$Impl_$.add(keys,e.keyCode);
			if(!isEmpty) return;
			var cancel = thx_core_Timer.repeat(function() {
				_g.keyRepeat(thx_core__$Set_Set_$Impl_$.setToArray(keys));
			},threshold);
			var keyupListener = null;
			var keyupListener1 = function(e1) {
				HxOverrides.remove(keys,e1.keyCode);
				if(keys.length > 0) return;
				cancel();
				if(minicanvas_BrowserCanvas.attachKeyEventsToCanvas) _g.canvas.removeEventListener("keyup",keyupListener); else window.removeEventListener("keyup",keyupListener);
			};
			if(minicanvas_BrowserCanvas.attachKeyEventsToCanvas) _g.canvas.addEventListener("keyup",keyupListener1); else window.addEventListener("keyup",keyupListener1);
		}, callback : callback};
		if(this.isBrowser) {
			if(minicanvas_BrowserCanvas.attachKeyEventsToCanvas) {
				this.canvas.setAttribute("tabIndex","1");
				this.canvas.addEventListener("keydown",this._keyRepeat.listener);
			} else window.addEventListener("keydown",this._keyRepeat.listener);
		}
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
	,offKeyDown: function() {
		if(this.isBrowser && null != this._keyDown) {
			if(minicanvas_BrowserCanvas.attachKeyEventsToCanvas) {
				this.canvas.removeAttribute("tabIndex");
				this.canvas.removeEventListener("keydown",this._keyDown.listener);
			} else window.removeEventListener("keydown",this._keyDown.listener);
		}
		this._keyDown = null;
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
	,onDown: function(callback) {
		return this.onMouseEvent("mousedown",null,callback);
	}
	,onMove: function(callback) {
		return this.onMouseEvent("mousemove",null,callback);
	}
	,onTrail: function(callback) {
		var _g = this;
		var first = true;
		var x0 = 0.0;
		var y0 = 0.0;
		var x1;
		var y1;
		var listener = function(e) {
			if(first) {
				x0 = e.x;
				y0 = e.y;
				first = false;
			} else {
				x1 = e.x;
				y1 = e.y;
				callback({ mini : _g, x0 : x0, y0 : y0, x1 : x1, y1 : y1});
				x0 = x1;
				y0 = y1;
			}
		};
		return this.onMouseEvent("mousemove","trail",listener);
	}
	,onUp: function(callback) {
		return this.onMouseEvent("mouseup",null,callback);
	}
	,offClick: function() {
		return this.offMouseEvent("click");
	}
	,offDown: function() {
		return this.offMouseEvent("mousedown");
	}
	,offMove: function() {
		return this.offMouseEvent("mousemove");
	}
	,offTrail: function() {
		return this.offMouseEvent("mousemove","trail");
	}
	,offUp: function() {
		return this.offMouseEvent("mouseup");
	}
	,click: function(x,y) {
		return this.trigger("click",x,y);
	}
	,down: function(x,y) {
		return this.trigger("mousedown",x,y);
	}
	,keyDown: function(keyCode) {
		if(null != this._keyDown) this._keyDown.callback({ mini : this, keyCode : keyCode});
		return this;
	}
	,keyRepeat: function(keyCodes) {
		if(null != this._keyRepeat) this._keyRepeat.callback({ mini : this, keyCodes : keyCodes});
		return this;
	}
	,keyUp: function(keyCode) {
		if(null != this._keyUp) this._keyUp.callback({ mini : this, keyCode : keyCode});
		return this;
	}
	,move: function(x,y) {
		if(x < 0 || x > this.width || y < 0 || y > this.height) return this;
		this.trigger("mousemove",x,y);
		this.trigger("trail",x,y);
		return this;
	}
	,up: function(x,y) {
		return this.trigger("mouseup",x,y);
	}
	,onMouseEvent: function(type,name,callback) {
		var _g = this;
		if(null == name) name = type;
		this.offMouseEvent(type,name);
		var listener = function(e) {
			var rect = _g.canvas.getBoundingClientRect();
			_g.trigger(name,e.clientX - rect.left,e.clientY - rect.top);
		};
		this.events.set(name,{ callback : callback, listener : listener});
		if(this.isBrowser) this.canvas.addEventListener(type,listener,false);
		return this;
	}
	,offMouseEvent: function(type,name) {
		if(null == name) name = type;
		var item = this.events.get(name);
		if(null == item) return this;
		this.events.remove(name);
		if(this.isBrowser) this.canvas.removeEventListener(type,item.listener,false);
		return this;
	}
	,trigger: function(name,x,y) {
		var item = this.events.get(name);
		if(null == item) return this;
		item.callback({ mini : this, x : x, y : y});
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
	,_keyRepeat: null
	,beforeAnimate: function() {
	}
	,afterAnimate: function() {
	}
	,resolveStack: function(stack,done) {
		if(stack.length == 0) return done();
		(stack.shift())();
		this.storeFrame();
		this.resolveStack(stack,done);
	}
	,__class__: minicanvas_MiniCanvas
};
var minicanvas_ScaleMode = { __ename__ : ["minicanvas","ScaleMode"], __constructs__ : ["NoScale","Auto","Scaled"] };
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
	,beforeAnimate: function() {
		this.canvas.style.pointerEvents = "none";
	}
	,afterAnimate: function() {
		this.canvas.style.pointerEvents = "auto";
	}
	,resolveStack: function(stack,done) {
		if(stack.length == 0) return done();
		(stack.shift())();
		this.storeFrame();
		thx_core_Timer.delay((function(f,a1,a2) {
			return function() {
				f(a1,a2);
			};
		})($bind(this,this.resolveStack),stack,done),50);
	}
	,__class__: minicanvas_BrowserCanvas
});
var minicanvas_Interaction = function(mini) {
	this.mini = mini;
};
minicanvas_Interaction.__name__ = ["minicanvas","Interaction"];
minicanvas_Interaction.prototype = {
	mini: null
	,click: function(x,y) {
		return this;
	}
	,down: function(x,y) {
		return this;
	}
	,keyDown: function(keyCode) {
		return this;
	}
	,keyUp: function(keyCode) {
		return this;
	}
	,move: function(x,y,delta) {
		if(delta == null) delta = 9;
		return this;
	}
	,up: function(x,y) {
		return this;
	}
	,sleep: function(frames) {
		return this;
	}
	,done: function() {
		return this.mini;
	}
	,frame: function(callback) {
		callback(this.mini);
		return this;
	}
	,__class__: minicanvas_Interaction
};
var minicanvas_CanvasInteraction = function(mini,x,y,done) {
	minicanvas_Interaction.call(this,mini);
	this.x = x;
	this.y = y;
	this.stack = [];
	this._done = done;
};
minicanvas_CanvasInteraction.__name__ = ["minicanvas","CanvasInteraction"];
minicanvas_CanvasInteraction.__super__ = minicanvas_Interaction;
minicanvas_CanvasInteraction.prototype = $extend(minicanvas_Interaction.prototype,{
	x: null
	,y: null
	,stack: null
	,_done: null
	,click: function(x,y) {
		if(this.x != x || this.y != y) this.move(x,y);
		this.stack.push((function(f,x1,y1) {
			return function() {
				return f(x1,y1);
			};
		})(($_=this.mini,$bind($_,$_.click)),x,y));
		return this;
	}
	,down: function(x,y) {
		if(this.x != x || this.y != y) this.move(x,y);
		this.stack.push((function(f,x1,y1) {
			return function() {
				return f(x1,y1);
			};
		})(($_=this.mini,$bind($_,$_.down)),x,y));
		return this;
	}
	,frame: function(callback) {
		this.stack.push((function(f,a1) {
			return function() {
				f(a1);
			};
		})(callback,this.mini));
		return this;
	}
	,keyDown: function(keyCode) {
		this.stack.push((function(f,a1) {
			return function() {
				return f(a1);
			};
		})(($_=this.mini,$bind($_,$_.keyDown)),keyCode));
		return this;
	}
	,keyUp: function(keyCode) {
		this.stack.push((function(f,a1) {
			return function() {
				return f(a1);
			};
		})(($_=this.mini,$bind($_,$_.keyUp)),keyCode));
		return this;
	}
	,move: function(x,y,delta) {
		if(delta == null) delta = 9;
		var dist = Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
		var steps = Math.ceil(dist / delta);
		var dx;
		var dy;
		var step;
		var _g = 0;
		while(_g < steps) {
			var i = _g++;
			step = i / steps;
			dx = Math.round(thx_core_Floats.interpolate(step,this.x,x));
			dy = Math.round(thx_core_Floats.interpolate(step,this.y,y));
			this.stack.push((function(f,x1,y1) {
				return function() {
					return f(x1,y1);
				};
			})(($_=this.mini,$bind($_,$_.move)),dx,dy));
		}
		this.x = x;
		this.y = y;
		return this;
	}
	,up: function(x,y) {
		if(this.x != x || this.y != y) this.move(x,y);
		this.stack.push((function(f,x1,y1) {
			return function() {
				return f(x1,y1);
			};
		})(($_=this.mini,$bind($_,$_.up)),x,y));
		return this;
	}
	,sleep: function(frames) {
		var _g = 0;
		while(_g < frames) {
			var i = _g++;
			this.stack.push(function() {
			});
		}
		return this;
	}
	,done: function() {
		this._done(this.stack);
		return this.mini;
	}
	,__class__: minicanvas_CanvasInteraction
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
	,storeFrame: function(times) {
		if(times == null) times = 1;
		this.hasFrames = true;
		if(times <= 0) times = 1;
		var _g = 0;
		while(_g < times) {
			var i = _g++;
			this.ensureEncoder().addFrame(this.ctx);
		}
		return this;
	}
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
var thx_color__$CIELCh_CIELCh_$Impl_$ = {};
thx_color__$CIELCh_CIELCh_$Impl_$.__name__ = ["thx","color","_CIELCh","CIELCh_Impl_"];
thx_color__$CIELCh_CIELCh_$Impl_$.create = function(lightness,chroma,hue) {
	var channels = [lightness,chroma,thx_core_Floats.wrapCircular(hue,360)];
	return channels;
};
thx_color__$CIELCh_CIELCh_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$CIELCh_CIELCh_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$CIELCh_CIELCh_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "cielch":
			return thx_color__$CIELCh_CIELCh_$Impl_$.fromFloats(thx_color_parse_ColorParser.getFloatChannels(info.channels,3,false));
		default:
			return null;
		}
	} catch( e ) {
		return null;
	}
};
thx_color__$CIELCh_CIELCh_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$CIELCh_CIELCh_$Impl_$.analogous = function(this1,spread) {
	if(spread == null) spread = 30.0;
	var _0 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$CIELCh_CIELCh_$Impl_$.complement = function(this1) {
	return thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,180);
};
thx_color__$CIELCh_CIELCh_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolateAngle(t,this1[2],other[2],360)];
	return channels;
};
thx_color__$CIELCh_CIELCh_$Impl_$.rotate = function(this1,angle) {
	return thx_color__$CIELCh_CIELCh_$Impl_$.withHue(this1,this1[2] + angle);
};
thx_color__$CIELCh_CIELCh_$Impl_$.split = function(this1,spread) {
	if(spread == null) spread = 144.0;
	var _0 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$CIELCh_CIELCh_$Impl_$.square = function(this1) {
	return thx_color__$CIELCh_CIELCh_$Impl_$.tetrad(this1,90);
};
thx_color__$CIELCh_CIELCh_$Impl_$.tetrad = function(this1,angle) {
	var _0 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,0);
	var _1 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,angle);
	var _2 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,180);
	var _3 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,180 + angle);
	return { _0 : _0, _1 : _1, _2 : _2, _3 : _3};
};
thx_color__$CIELCh_CIELCh_$Impl_$.triad = function(this1) {
	var _0 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,-120);
	var _1 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,0);
	var _2 = thx_color__$CIELCh_CIELCh_$Impl_$.rotate(this1,120);
	return { _0 : _0, _1 : _1, _2 : _2};
};
thx_color__$CIELCh_CIELCh_$Impl_$.withLightness = function(this1,newlightness) {
	return [newlightness,this1[1],this1[2]];
};
thx_color__$CIELCh_CIELCh_$Impl_$.withChroma = function(this1,newchroma) {
	return [this1[0],newchroma,this1[2]];
};
thx_color__$CIELCh_CIELCh_$Impl_$.withHue = function(this1,newhue) {
	var channels = [this1[0],this1[1],thx_core_Floats.wrapCircular(newhue,360)];
	return channels;
};
thx_color__$CIELCh_CIELCh_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$CIELCh_CIELCh_$Impl_$.toString = function(this1) {
	return "CIELCh(" + this1[0] + "," + this1[1] + "," + this1[2] + ")";
};
thx_color__$CIELCh_CIELCh_$Impl_$.toCIELab = function(this1) {
	var hradi = this1[2] * (Math.PI / 180);
	var a = Math.cos(hradi) * this1[1];
	var b = Math.sin(hradi) * this1[1];
	return [this1[0],a,b];
};
thx_color__$CIELCh_CIELCh_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBXA(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX = function(this1) {
	return thx_color__$CIELab_CIELab_$Impl_$.toRGBX(thx_color__$CIELCh_CIELCh_$Impl_$.toCIELab(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$CIELCh_CIELCh_$Impl_$.toRGBX(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toXYZ = function(this1) {
	return thx_color__$CIELab_CIELab_$Impl_$.toXYZ(thx_color__$CIELCh_CIELCh_$Impl_$.toCIELab(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.toYxy = function(this1) {
	return thx_color__$CIELab_CIELab_$Impl_$.toYxy(thx_color__$CIELCh_CIELCh_$Impl_$.toCIELab(this1));
};
thx_color__$CIELCh_CIELCh_$Impl_$.get_lightness = function(this1) {
	return this1[0];
};
thx_color__$CIELCh_CIELCh_$Impl_$.get_chroma = function(this1) {
	return this1[1];
};
thx_color__$CIELCh_CIELCh_$Impl_$.get_hue = function(this1) {
	return this1[2];
};
var thx_color__$CIELab_CIELab_$Impl_$ = {};
thx_color__$CIELab_CIELab_$Impl_$.__name__ = ["thx","color","_CIELab","CIELab_Impl_"];
thx_color__$CIELab_CIELab_$Impl_$.create = function(l,a,b) {
	return [l,a,b];
};
thx_color__$CIELab_CIELab_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$CIELab_CIELab_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$CIELab_CIELab_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "cielab":
			return thx_color__$CIELab_CIELab_$Impl_$.fromFloats(thx_color_parse_ColorParser.getFloatChannels(info.channels,3,false));
		default:
			return null;
		}
	} catch( e ) {
		return null;
	}
};
thx_color__$CIELab_CIELab_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$CIELab_CIELab_$Impl_$.distance = function(this1,other) {
	return (this1[0] - other[0]) * (this1[0] - other[0]) + (this1[1] - other[1]) * (this1[1] - other[1]) + (this1[2] - other[2]) * (this1[2] - other[2]);
};
thx_color__$CIELab_CIELab_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2])];
	return channels;
};
thx_color__$CIELab_CIELab_$Impl_$.darker = function(this1,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],0),this1[1],this1[2]];
	return channels;
};
thx_color__$CIELab_CIELab_$Impl_$.lighter = function(this1,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],100),this1[1],this1[2]];
	return channels;
};
thx_color__$CIELab_CIELab_$Impl_$.match = function(this1,palette) {
	var it = palette;
	if(null == it) throw new thx_core_error_NullArgument("Iterable argument \"this\" cannot be null",{ fileName : "NullArgument.hx", lineNumber : 73, className : "thx.color._CIELab.CIELab_Impl_", methodName : "match"}); else if(!$iterator(it)().hasNext()) throw new thx_core_error_NullArgument("Iterable argument \"this\" cannot be empty",{ fileName : "NullArgument.hx", lineNumber : 75, className : "thx.color._CIELab.CIELab_Impl_", methodName : "match"});
	var dist = Infinity;
	var closest = null;
	var $it0 = $iterator(palette)();
	while( $it0.hasNext() ) {
		var color = $it0.next();
		var ndist = thx_color__$CIELab_CIELab_$Impl_$.distance(this1,color);
		if(ndist < dist) {
			dist = ndist;
			closest = color;
		}
	}
	return closest;
};
thx_color__$CIELab_CIELab_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$CIELab_CIELab_$Impl_$.withLightness = function(this1,lightness) {
	return [lightness,this1[1],this1[2]];
};
thx_color__$CIELab_CIELab_$Impl_$.withA = function(this1,newa) {
	return [this1[0],newa,this1[2]];
};
thx_color__$CIELab_CIELab_$Impl_$.withB = function(this1,newb) {
	return [this1[0],this1[1],newb];
};
thx_color__$CIELab_CIELab_$Impl_$.toString = function(this1) {
	return "CIELab(" + this1[0] + "," + this1[1] + "," + this1[2] + ")";
};
thx_color__$CIELab_CIELab_$Impl_$.toCIELCh = function(this1) {
	var h = thx_core_Floats.wrapCircular(Math.atan2(this1[2],this1[1]) * 180 / Math.PI,360);
	var c = Math.sqrt(this1[1] * this1[1] + this1[2] * this1[2]);
	return [this1[0],c,h];
};
thx_color__$CIELab_CIELab_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$CIELab_CIELab_$Impl_$.toRGBX(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$CIELab_CIELab_$Impl_$.toRGBX(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$CIELab_CIELab_$Impl_$.toRGBX(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$CIELab_CIELab_$Impl_$.toRGBX(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$CIELab_CIELab_$Impl_$.toRGBX(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$CIELab_CIELab_$Impl_$.toRGBX(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$CIELab_CIELab_$Impl_$.toRGBXA(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toRGBX = function(this1) {
	return thx_color__$XYZ_XYZ_$Impl_$.toRGBX(thx_color__$CIELab_CIELab_$Impl_$.toXYZ(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$CIELab_CIELab_$Impl_$.toRGBX(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.toXYZ = function(this1) {
	var y = (this1[0] + 16) / 116;
	var x = this1[1] / 500 + y;
	var z = y - this1[2] / 200;
	var p;
	p = Math.pow(y,3);
	if(p > 0.008856) y = p; else y = (y - 0.137931034482758619) / 7.787;
	p = Math.pow(x,3);
	if(p > 0.008856) x = p; else x = (x - 0.137931034482758619) / 7.787;
	p = Math.pow(z,3);
	if(p > 0.008856) z = p; else z = (z - 0.137931034482758619) / 7.787;
	return [95.047 * x,100 * y,108.883 * z];
};
thx_color__$CIELab_CIELab_$Impl_$.toYxy = function(this1) {
	return thx_color__$XYZ_XYZ_$Impl_$.toYxy(thx_color__$CIELab_CIELab_$Impl_$.toXYZ(this1));
};
thx_color__$CIELab_CIELab_$Impl_$.get_l = function(this1) {
	return this1[0];
};
thx_color__$CIELab_CIELab_$Impl_$.get_a = function(this1) {
	return this1[1];
};
thx_color__$CIELab_CIELab_$Impl_$.get_b = function(this1) {
	return this1[2];
};
var thx_color__$CMY_CMY_$Impl_$ = {};
thx_color__$CMY_CMY_$Impl_$.__name__ = ["thx","color","_CMY","CMY_Impl_"];
thx_color__$CMY_CMY_$Impl_$.create = function(cyan,magenta,yellow) {
	return [cyan < 0?0:cyan > 1?1:cyan,magenta < 0?0:magenta > 1?1:magenta,yellow < 0?0:yellow > 1?1:yellow];
};
thx_color__$CMY_CMY_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$CMY_CMY_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$CMY_CMY_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "cmy":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			return channels;
		default:
			return null;
		}
	} catch( e ) {
		return null;
	}
};
thx_color__$CMY_CMY_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$CMY_CMY_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2])];
	return channels;
};
thx_color__$CMY_CMY_$Impl_$.withCyan = function(this1,newcyan) {
	return [newcyan < 0?0:newcyan > 1?1:newcyan,this1[1],this1[2]];
};
thx_color__$CMY_CMY_$Impl_$.withMagenta = function(this1,newmagenta) {
	return [this1[0],newmagenta < 0?0:newmagenta > 1?1:newmagenta,this1[2]];
};
thx_color__$CMY_CMY_$Impl_$.withYellow = function(this1,newyellow) {
	return [this1[0],this1[1],newyellow < 0?0:newyellow > 1?1:newyellow];
};
thx_color__$CMY_CMY_$Impl_$.toString = function(this1) {
	return "cmy(" + this1[0] + "," + this1[1] + "," + this1[2] + ")";
};
thx_color__$CMY_CMY_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$CMY_CMY_$Impl_$.toCIELab = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELab(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELCh(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toCMYK = function(this1) {
	var k = Math.min(Math.min(this1[0],this1[1]),this1[2]);
	if(k == 1) return [0,0,0,1]; else return [(this1[0] - k) / (1 - k),(this1[1] - k) / (1 - k),(this1[2] - k) / (1 - k),k];
};
thx_color__$CMY_CMY_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$CMY_CMY_$Impl_$.toRGBXA(this1));
};
thx_color__$CMY_CMY_$Impl_$.toRGBX = function(this1) {
	return [1 - this1[0],1 - this1[1],1 - this1[2]];
};
thx_color__$CMY_CMY_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toXYZ = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toXYZ(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.toYxy = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toYxy(thx_color__$CMY_CMY_$Impl_$.toRGBX(this1));
};
thx_color__$CMY_CMY_$Impl_$.get_cyan = function(this1) {
	return this1[0];
};
thx_color__$CMY_CMY_$Impl_$.get_magenta = function(this1) {
	return this1[1];
};
thx_color__$CMY_CMY_$Impl_$.get_yellow = function(this1) {
	return this1[2];
};
var thx_color__$CMYK_CMYK_$Impl_$ = {};
thx_color__$CMYK_CMYK_$Impl_$.__name__ = ["thx","color","_CMYK","CMYK_Impl_"];
thx_color__$CMYK_CMYK_$Impl_$.create = function(cyan,magenta,yellow,black) {
	return [cyan < 0?0:cyan > 1?1:cyan,magenta < 0?0:magenta > 1?1:magenta,yellow < 0?0:yellow > 1?1:yellow,black < 0?0:black > 1?1:black];
};
thx_color__$CMYK_CMYK_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,4);
	return thx_color__$CMYK_CMYK_$Impl_$.create(arr[0],arr[1],arr[2],arr[3]);
};
thx_color__$CMYK_CMYK_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "cmyk":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,4);
			return channels;
		default:
			return null;
		}
	} catch( e ) {
		return null;
	}
};
thx_color__$CMYK_CMYK_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$CMYK_CMYK_$Impl_$.darker = function(this1,t) {
	var channels = [this1[0],this1[1],this1[2],thx_core_Floats.interpolate(t,this1[3],1)];
	return channels;
};
thx_color__$CMYK_CMYK_$Impl_$.lighter = function(this1,t) {
	var channels = [this1[0],this1[1],this1[2],thx_core_Floats.interpolate(t,this1[3],0)];
	return channels;
};
thx_color__$CMYK_CMYK_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2]),thx_core_Floats.interpolate(t,this1[3],other[3])];
	return channels;
};
thx_color__$CMYK_CMYK_$Impl_$.withCyan = function(this1,newcyan) {
	return [newcyan < 0?0:newcyan > 1?1:newcyan,this1[1],this1[2],this1[3]];
};
thx_color__$CMYK_CMYK_$Impl_$.withMagenta = function(this1,newmagenta) {
	return [this1[0],newmagenta < 0?0:newmagenta > 1?1:newmagenta,this1[2],this1[3]];
};
thx_color__$CMYK_CMYK_$Impl_$.withYellow = function(this1,newyellow) {
	return [this1[0],this1[1],newyellow < 0?0:newyellow > 1?1:newyellow,this1[3]];
};
thx_color__$CMYK_CMYK_$Impl_$.withBlack = function(this1,newblack) {
	return [this1[0],this1[1],this1[2],newblack < 0?0:newblack > 1?1:newblack];
};
thx_color__$CMYK_CMYK_$Impl_$.toString = function(this1) {
	return "cmyk(" + this1[0] + "," + this1[1] + "," + this1[2] + "," + this1[3] + ")";
};
thx_color__$CMYK_CMYK_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10 && Math.abs(this1[3] - other[3]) <= 10e-10;
};
thx_color__$CMYK_CMYK_$Impl_$.toCIELab = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELab(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELCh(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toCMY = function(this1) {
	return [this1[3] + (1 - this1[3]) * this1[0],this1[3] + (1 - this1[3]) * this1[1],this1[3] + (1 - this1[3]) * this1[2]];
};
thx_color__$CMYK_CMYK_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$CMYK_CMYK_$Impl_$.toRGBXA(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toRGBX = function(this1) {
	return [(1 - this1[3]) * (1 - this1[0]),(1 - this1[3]) * (1 - this1[1]),(1 - this1[3]) * (1 - this1[2])];
};
thx_color__$CMYK_CMYK_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.get_cyan = function(this1) {
	return this1[0];
};
thx_color__$CMYK_CMYK_$Impl_$.get_magenta = function(this1) {
	return this1[1];
};
thx_color__$CMYK_CMYK_$Impl_$.get_yellow = function(this1) {
	return this1[2];
};
thx_color__$CMYK_CMYK_$Impl_$.get_black = function(this1) {
	return this1[3];
};
thx_color__$CMYK_CMYK_$Impl_$.toXYZ = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toXYZ(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
thx_color__$CMYK_CMYK_$Impl_$.toYxy = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toYxy(thx_color__$CMYK_CMYK_$Impl_$.toRGBX(this1));
};
var thx_color__$Grey_Grey_$Impl_$ = {};
thx_color__$Grey_Grey_$Impl_$.__name__ = ["thx","color","_Grey","Grey_Impl_"];
thx_color__$Grey_Grey_$Impl_$.create = function(v) {
	return v < 0?0:v > 1?1:v;
};
thx_color__$Grey_Grey_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "grey":case "gray":
			var grey = thx_color_parse_ColorParser.getFloatChannels(info.channels,1)[0];
			return grey;
		default:
			return null;
		}
	} catch( e ) {
		return null;
	}
};
thx_color__$Grey_Grey_$Impl_$._new = function(grey) {
	return grey;
};
thx_color__$Grey_Grey_$Impl_$.contrast = function(this1) {
	if(this1 > 0.5) return thx_color__$Grey_Grey_$Impl_$.black; else return thx_color__$Grey_Grey_$Impl_$.white;
};
thx_color__$Grey_Grey_$Impl_$.darker = function(this1,t) {
	var grey = thx_core_Floats.interpolate(t,this1,0);
	return grey;
};
thx_color__$Grey_Grey_$Impl_$.lighter = function(this1,t) {
	var grey = thx_core_Floats.interpolate(t,this1,1);
	return grey;
};
thx_color__$Grey_Grey_$Impl_$.interpolate = function(this1,other,t) {
	var grey = thx_core_Floats.interpolate(t,this1,other);
	return grey;
};
thx_color__$Grey_Grey_$Impl_$.toString = function(this1) {
	return "grey(" + this1 * 100 + "%)";
};
thx_color__$Grey_Grey_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1 - other) <= 10e-10;
};
thx_color__$Grey_Grey_$Impl_$.get_grey = function(this1) {
	return this1;
};
thx_color__$Grey_Grey_$Impl_$.toCIELab = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELab(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELCh(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$Grey_Grey_$Impl_$.toRGBXA(this1));
};
thx_color__$Grey_Grey_$Impl_$.toRGBX = function(this1) {
	return [this1,this1,this1];
};
thx_color__$Grey_Grey_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toXYZ = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toXYZ(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
thx_color__$Grey_Grey_$Impl_$.toYxy = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toYxy(thx_color__$Grey_Grey_$Impl_$.toRGBX(this1));
};
var thx_color__$HSL_HSL_$Impl_$ = {};
thx_color__$HSL_HSL_$Impl_$.__name__ = ["thx","color","_HSL","HSL_Impl_"];
thx_color__$HSL_HSL_$Impl_$.create = function(hue,saturation,lightness) {
	var channels = [thx_core_Floats.wrapCircular(hue,360),saturation < 0?0:saturation > 1?1:saturation,lightness < 0?0:lightness > 1?1:lightness];
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$HSL_HSL_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$HSL_HSL_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "hsl":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			return channels;
		default:
			return null;
		}
	} catch( e ) {
		return null;
	}
};
thx_color__$HSL_HSL_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.analogous = function(this1,spread) {
	if(spread == null) spread = 30.0;
	var _0 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSL_HSL_$Impl_$.complement = function(this1) {
	return thx_color__$HSL_HSL_$Impl_$.rotate(this1,180);
};
thx_color__$HSL_HSL_$Impl_$.darker = function(this1,t) {
	var channels = [this1[0],this1[1],thx_core_Floats.interpolate(t,this1[2],0)];
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.lighter = function(this1,t) {
	var channels = [this1[0],this1[1],thx_core_Floats.interpolate(t,this1[2],1)];
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolateAngle(t,this1[0],other[0],360),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2])];
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.rotate = function(this1,angle) {
	return thx_color__$HSL_HSL_$Impl_$.withHue(this1,this1[0] + angle);
};
thx_color__$HSL_HSL_$Impl_$.split = function(this1,spread) {
	if(spread == null) spread = 144.0;
	var _0 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSL_HSL_$Impl_$.square = function(this1) {
	return thx_color__$HSL_HSL_$Impl_$.tetrad(this1,90);
};
thx_color__$HSL_HSL_$Impl_$.tetrad = function(this1,angle) {
	var _0 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,0);
	var _1 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,angle);
	var _2 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,180);
	var _3 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,180 + angle);
	return { _0 : _0, _1 : _1, _2 : _2, _3 : _3};
};
thx_color__$HSL_HSL_$Impl_$.triad = function(this1) {
	var _0 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,-120);
	var _1 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,0);
	var _2 = thx_color__$HSL_HSL_$Impl_$.rotate(this1,120);
	return { _0 : _0, _1 : _1, _2 : _2};
};
thx_color__$HSL_HSL_$Impl_$.withAlpha = function(this1,alpha) {
	var channels = this1.concat([alpha < 0?0:alpha > 1?1:alpha]);
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.withHue = function(this1,newhue) {
	var channels = [thx_core_Floats.wrapCircular(newhue,360),this1[1],this1[2]];
	return channels;
};
thx_color__$HSL_HSL_$Impl_$.withLightness = function(this1,newlightness) {
	return [this1[0],this1[1],newlightness < 0?0:newlightness > 1?1:newlightness];
};
thx_color__$HSL_HSL_$Impl_$.withSaturation = function(this1,newsaturation) {
	return [this1[0],newsaturation < 0?0:newsaturation > 1?1:newsaturation,this1[2]];
};
thx_color__$HSL_HSL_$Impl_$.toCSS3 = function(this1) {
	return thx_color__$HSL_HSL_$Impl_$.toString(this1);
};
thx_color__$HSL_HSL_$Impl_$.toString = function(this1) {
	return "hsl(" + this1[0] + "," + this1[1] * 100 + "%," + this1[2] * 100 + "%)";
};
thx_color__$HSL_HSL_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$HSL_HSL_$Impl_$.toCIELab = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELab(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELCh(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
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
thx_color__$HSL_HSL_$Impl_$.toHSLA = function(this1) {
	return thx_color__$HSL_HSL_$Impl_$.withAlpha(this1,1.0);
};
thx_color__$HSL_HSL_$Impl_$.toXYZ = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toXYZ(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.toYxy = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toYxy(thx_color__$HSL_HSL_$Impl_$.toRGBX(this1));
};
thx_color__$HSL_HSL_$Impl_$.get_hue = function(this1) {
	return this1[0];
};
thx_color__$HSL_HSL_$Impl_$.get_saturation = function(this1) {
	return this1[1];
};
thx_color__$HSL_HSL_$Impl_$.get_lightness = function(this1) {
	return this1[2];
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
thx_color__$HSLA_HSLA_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,4);
	return thx_color__$HSLA_HSLA_$Impl_$.create(arr[0],arr[1],arr[2],arr[3]);
};
thx_color__$HSLA_HSLA_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "hsl":
			return thx_color__$HSL_HSL_$Impl_$.toHSLA((function($this) {
				var $r;
				var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
				$r = channels;
				return $r;
			}(this)));
		case "hsla":
			var channels1 = thx_color_parse_ColorParser.getFloatChannels(info.channels,4);
			return channels1;
		default:
			return null;
		}
	} catch( e ) {
		return null;
	}
};
thx_color__$HSLA_HSLA_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.analogous = function(this1,spread) {
	if(spread == null) spread = 30.0;
	var _0 = thx_color__$HSLA_HSLA_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSLA_HSLA_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSLA_HSLA_$Impl_$.complement = function(this1) {
	return thx_color__$HSLA_HSLA_$Impl_$.rotate(this1,180);
};
thx_color__$HSLA_HSLA_$Impl_$.darker = function(this1,t) {
	var channels = [this1[0],this1[1],thx_core_Floats.interpolate(t,this1[2],0),this1[3]];
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.lighter = function(this1,t) {
	var channels = [this1[0],this1[1],thx_core_Floats.interpolate(t,this1[2],1),this1[3]];
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.transparent = function(this1,t) {
	var channels = [this1[0],this1[1],this1[2],thx_core_Floats.interpolate(t,this1[3],0)];
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.opaque = function(this1,t) {
	var channels = [this1[0],this1[1],this1[2],thx_core_Floats.interpolate(t,this1[3],1)];
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolateAngle(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2]),thx_core_Floats.interpolate(t,this1[3],other[3])];
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.rotate = function(this1,angle) {
	return thx_color__$HSLA_HSLA_$Impl_$.create(this1[0] + angle,this1[1],this1[2],this1[3]);
};
thx_color__$HSLA_HSLA_$Impl_$.split = function(this1,spread) {
	if(spread == null) spread = 150.0;
	var _0 = thx_color__$HSLA_HSLA_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSLA_HSLA_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSLA_HSLA_$Impl_$.withAlpha = function(this1,newalpha) {
	return [this1[0],this1[1],this1[2],newalpha < 0?0:newalpha > 1?1:newalpha];
};
thx_color__$HSLA_HSLA_$Impl_$.withHue = function(this1,newhue) {
	var channels = [thx_core_Floats.wrapCircular(newhue,360),this1[1],this1[2],this1[3]];
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.withLightness = function(this1,newlightness) {
	return [this1[0],this1[1],newlightness < 0?0:newlightness > 1?1:newlightness,this1[3]];
};
thx_color__$HSLA_HSLA_$Impl_$.withSaturation = function(this1,newsaturation) {
	return [this1[0],newsaturation < 0?0:newsaturation > 1?1:newsaturation,this1[2],this1[3]];
};
thx_color__$HSLA_HSLA_$Impl_$.toCSS3 = function(this1) {
	return thx_color__$HSLA_HSLA_$Impl_$.toString(this1);
};
thx_color__$HSLA_HSLA_$Impl_$.toString = function(this1) {
	return "hsla(" + this1[0] + "," + this1[1] * 100 + "%," + this1[2] * 100 + "%," + this1[3] + ")";
};
thx_color__$HSLA_HSLA_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10 && Math.abs(this1[3] - other[3]) <= 10e-10;
};
thx_color__$HSLA_HSLA_$Impl_$.toHSL = function(this1) {
	var channels = this1.slice(0,3);
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.toHSVA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toHSVA(thx_color__$HSLA_HSLA_$Impl_$.toRGBXA(this1));
};
thx_color__$HSLA_HSLA_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGB(thx_color__$HSLA_HSLA_$Impl_$.toRGBXA(this1));
};
thx_color__$HSLA_HSLA_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$HSLA_HSLA_$Impl_$.toRGBXA(this1));
};
thx_color__$HSLA_HSLA_$Impl_$.toRGBXA = function(this1) {
	var channels = [thx_color__$HSLA_HSLA_$Impl_$._c(this1[0] + 120,this1[1],this1[2]),thx_color__$HSLA_HSLA_$Impl_$._c(this1[0],this1[1],this1[2]),thx_color__$HSLA_HSLA_$Impl_$._c(this1[0] - 120,this1[1],this1[2]),this1[3]];
	return channels;
};
thx_color__$HSLA_HSLA_$Impl_$.get_hue = function(this1) {
	return this1[0];
};
thx_color__$HSLA_HSLA_$Impl_$.get_saturation = function(this1) {
	return this1[1];
};
thx_color__$HSLA_HSLA_$Impl_$.get_lightness = function(this1) {
	return this1[2];
};
thx_color__$HSLA_HSLA_$Impl_$.get_alpha = function(this1) {
	return this1[3];
};
thx_color__$HSLA_HSLA_$Impl_$._c = function(d,s,l) {
	var m2;
	if(l <= 0.5) m2 = l * (1 + s); else m2 = l + s - l * s;
	var m1 = 2 * l - m2;
	d = thx_core_Floats.wrapCircular(d,360);
	if(d < 60) return m1 + (m2 - m1) * d / 60; else if(d < 180) return m2; else if(d < 240) return m1 + (m2 - m1) * (240 - d) / 60; else return m1;
};
var thx_color__$HSV_HSV_$Impl_$ = {};
thx_color__$HSV_HSV_$Impl_$.__name__ = ["thx","color","_HSV","HSV_Impl_"];
thx_color__$HSV_HSV_$Impl_$.create = function(hue,saturation,lightness) {
	var channels = [thx_core_Floats.wrapCircular(hue,360),saturation < 0?0:saturation > 1?1:saturation,lightness < 0?0:lightness > 1?1:lightness];
	return channels;
};
thx_color__$HSV_HSV_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$HSV_HSV_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$HSV_HSV_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "hsv":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			return channels;
		default:
			return null;
		}
	} catch( e ) {
		return null;
	}
};
thx_color__$HSV_HSV_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$HSV_HSV_$Impl_$.analogous = function(this1,spread) {
	if(spread == null) spread = 30.0;
	var _0 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSV_HSV_$Impl_$.complement = function(this1) {
	return thx_color__$HSV_HSV_$Impl_$.rotate(this1,180);
};
thx_color__$HSV_HSV_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolateAngle(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2])];
	return channels;
};
thx_color__$HSV_HSV_$Impl_$.rotate = function(this1,angle) {
	return thx_color__$HSV_HSV_$Impl_$.withHue(this1,this1[0] + angle);
};
thx_color__$HSV_HSV_$Impl_$.split = function(this1,spread) {
	if(spread == null) spread = 144.0;
	var _0 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSV_HSV_$Impl_$.square = function(this1) {
	return thx_color__$HSV_HSV_$Impl_$.tetrad(this1,90);
};
thx_color__$HSV_HSV_$Impl_$.tetrad = function(this1,angle) {
	var _0 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,0);
	var _1 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,angle);
	var _2 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,180);
	var _3 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,180 + angle);
	return { _0 : _0, _1 : _1, _2 : _2, _3 : _3};
};
thx_color__$HSV_HSV_$Impl_$.triad = function(this1) {
	var _0 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,-120);
	var _1 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,0);
	var _2 = thx_color__$HSV_HSV_$Impl_$.rotate(this1,120);
	return { _0 : _0, _1 : _1, _2 : _2};
};
thx_color__$HSV_HSV_$Impl_$.withAlpha = function(this1,alpha) {
	var channels = this1.concat([alpha < 0?0:alpha > 1?1:alpha]);
	return channels;
};
thx_color__$HSV_HSV_$Impl_$.withHue = function(this1,newhue) {
	var channels = [thx_core_Floats.wrapCircular(newhue,360),this1[1],this1[2]];
	return channels;
};
thx_color__$HSV_HSV_$Impl_$.withValue = function(this1,newvalue) {
	return [this1[0],this1[1],newvalue < 0?0:newvalue > 1?1:newvalue];
};
thx_color__$HSV_HSV_$Impl_$.withSaturation = function(this1,newsaturation) {
	return [this1[0],newsaturation < 0?0:newsaturation > 1?1:newsaturation,this1[2]];
};
thx_color__$HSV_HSV_$Impl_$.toString = function(this1) {
	return "hsv(" + this1[0] + "," + this1[1] * 100 + "%," + this1[2] * 100 + "%)";
};
thx_color__$HSV_HSV_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$HSV_HSV_$Impl_$.toCIELab = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELab(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELCh(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toHSVA = function(this1) {
	return thx_color__$HSV_HSV_$Impl_$.withAlpha(this1,1.0);
};
thx_color__$HSV_HSV_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$HSV_HSV_$Impl_$.toRGBXA(this1));
};
thx_color__$HSV_HSV_$Impl_$.toRGBX = function(this1) {
	if(this1[1] == 0) return [this1[2],this1[2],this1[2]];
	var r;
	var g;
	var b;
	var i;
	var f;
	var p;
	var q;
	var t;
	var h = this1[0] / 60;
	i = Math.floor(h);
	f = h - i;
	p = this1[2] * (1 - this1[1]);
	q = this1[2] * (1 - f * this1[1]);
	t = this1[2] * (1 - (1 - f) * this1[1]);
	switch(i) {
	case 0:
		r = this1[2];
		g = t;
		b = p;
		break;
	case 1:
		r = q;
		g = this1[2];
		b = p;
		break;
	case 2:
		r = p;
		g = this1[2];
		b = t;
		break;
	case 3:
		r = p;
		g = q;
		b = this1[2];
		break;
	case 4:
		r = t;
		g = p;
		b = this1[2];
		break;
	default:
		r = this1[2];
		g = p;
		b = q;
	}
	return [r,g,b];
};
thx_color__$HSV_HSV_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toXYZ = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toXYZ(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.toYxy = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toYxy(thx_color__$HSV_HSV_$Impl_$.toRGBX(this1));
};
thx_color__$HSV_HSV_$Impl_$.get_hue = function(this1) {
	return this1[0];
};
thx_color__$HSV_HSV_$Impl_$.get_saturation = function(this1) {
	return this1[1];
};
thx_color__$HSV_HSV_$Impl_$.get_value = function(this1) {
	return this1[2];
};
var thx_color__$HSVA_HSVA_$Impl_$ = {};
thx_color__$HSVA_HSVA_$Impl_$.__name__ = ["thx","color","_HSVA","HSVA_Impl_"];
thx_color__$HSVA_HSVA_$Impl_$.create = function(hue,saturation,value,alpha) {
	var channels = [thx_core_Floats.wrapCircular(hue,360),saturation < 0?0:saturation > 1?1:saturation,value < 0?0:value > 1?1:value,alpha < 0?0:alpha > 1?1:alpha];
	return channels;
};
thx_color__$HSVA_HSVA_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,4);
	return thx_color__$HSVA_HSVA_$Impl_$.create(arr[0],arr[1],arr[2],arr[3]);
};
thx_color__$HSVA_HSVA_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "hsv":
			return thx_color__$HSV_HSV_$Impl_$.toHSVA((function($this) {
				var $r;
				var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
				$r = channels;
				return $r;
			}(this)));
		case "hsva":
			var channels1 = thx_color_parse_ColorParser.getFloatChannels(info.channels,4);
			return channels1;
		default:
			return null;
		}
	} catch( e ) {
		return null;
	}
};
thx_color__$HSVA_HSVA_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$HSVA_HSVA_$Impl_$.analogous = function(this1,spread) {
	if(spread == null) spread = 30.0;
	var _0 = thx_color__$HSVA_HSVA_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSVA_HSVA_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSVA_HSVA_$Impl_$.complement = function(this1) {
	return thx_color__$HSVA_HSVA_$Impl_$.rotate(this1,180);
};
thx_color__$HSVA_HSVA_$Impl_$.transparent = function(this1,t) {
	var channels = [this1[0],this1[1],this1[2],thx_core_Floats.interpolate(t,this1[3],0)];
	return channels;
};
thx_color__$HSVA_HSVA_$Impl_$.opaque = function(this1,t) {
	var channels = [this1[0],this1[1],this1[2],thx_core_Floats.interpolate(t,this1[3],1)];
	return channels;
};
thx_color__$HSVA_HSVA_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolateAngle(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2]),thx_core_Floats.interpolate(t,this1[3],other[3])];
	return channels;
};
thx_color__$HSVA_HSVA_$Impl_$.rotate = function(this1,angle) {
	return thx_color__$HSVA_HSVA_$Impl_$.create(this1[0] + angle,this1[1],this1[2],this1[3]);
};
thx_color__$HSVA_HSVA_$Impl_$.split = function(this1,spread) {
	if(spread == null) spread = 150.0;
	var _0 = thx_color__$HSVA_HSVA_$Impl_$.rotate(this1,-spread);
	var _1 = thx_color__$HSVA_HSVA_$Impl_$.rotate(this1,spread);
	return { _0 : _0, _1 : _1};
};
thx_color__$HSVA_HSVA_$Impl_$.withAlpha = function(this1,newalpha) {
	return [this1[0],this1[1],this1[2],newalpha < 0?0:newalpha > 1?1:newalpha];
};
thx_color__$HSVA_HSVA_$Impl_$.withHue = function(this1,newhue) {
	var channels = [thx_core_Floats.wrapCircular(newhue,360),this1[1],this1[2],this1[3]];
	return channels;
};
thx_color__$HSVA_HSVA_$Impl_$.withLightness = function(this1,newvalue) {
	return [this1[0],this1[1],newvalue < 0?0:newvalue > 1?1:newvalue,this1[3]];
};
thx_color__$HSVA_HSVA_$Impl_$.withSaturation = function(this1,newsaturation) {
	return [this1[0],newsaturation < 0?0:newsaturation > 1?1:newsaturation,this1[2],this1[3]];
};
thx_color__$HSVA_HSVA_$Impl_$.toString = function(this1) {
	return "hsva(" + this1[0] + "," + this1[1] * 100 + "%," + this1[2] * 100 + "%," + this1[3] + ")";
};
thx_color__$HSVA_HSVA_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10 && Math.abs(this1[3] - other[3]) <= 10e-10;
};
thx_color__$HSVA_HSVA_$Impl_$.toHSV = function(this1) {
	var channels = this1.slice(0,3);
	return channels;
};
thx_color__$HSVA_HSVA_$Impl_$.toHSLA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toHSLA(thx_color__$HSVA_HSVA_$Impl_$.toRGBXA(this1));
};
thx_color__$HSVA_HSVA_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGB(thx_color__$HSVA_HSVA_$Impl_$.toRGBXA(this1));
};
thx_color__$HSVA_HSVA_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$HSVA_HSVA_$Impl_$.toRGBXA(this1));
};
thx_color__$HSVA_HSVA_$Impl_$.toRGBXA = function(this1) {
	if(this1[1] == 0) return [this1[2],this1[2],this1[2],this1[3]];
	var r;
	var g;
	var b;
	var i;
	var f;
	var p;
	var q;
	var t;
	var h = this1[0] / 60;
	i = Math.floor(h);
	f = h - i;
	p = this1[2] * (1 - this1[1]);
	q = this1[2] * (1 - f * this1[1]);
	t = this1[2] * (1 - (1 - f) * this1[1]);
	switch(i) {
	case 0:
		r = this1[2];
		g = t;
		b = p;
		break;
	case 1:
		r = q;
		g = this1[2];
		b = p;
		break;
	case 2:
		r = p;
		g = this1[2];
		b = t;
		break;
	case 3:
		r = p;
		g = q;
		b = this1[2];
		break;
	case 4:
		r = t;
		g = p;
		b = this1[2];
		break;
	default:
		r = this1[2];
		g = p;
		b = q;
	}
	return [r,g,b,this1[3]];
};
thx_color__$HSVA_HSVA_$Impl_$.get_hue = function(this1) {
	return this1[0];
};
thx_color__$HSVA_HSVA_$Impl_$.get_saturation = function(this1) {
	return this1[1];
};
thx_color__$HSVA_HSVA_$Impl_$.get_value = function(this1) {
	return this1[2];
};
thx_color__$HSVA_HSVA_$Impl_$.get_alpha = function(this1) {
	return this1[3];
};
var thx_color__$RGB_RGB_$Impl_$ = {};
thx_color__$RGB_RGB_$Impl_$.__name__ = ["thx","color","_RGB","RGB_Impl_"];
thx_color__$RGB_RGB_$Impl_$.create = function(red,green,blue) {
	return (red & 255) << 16 | (green & 255) << 8 | blue & 255;
};
thx_color__$RGB_RGB_$Impl_$.createf = function(red,green,blue) {
	return thx_color__$RGB_RGB_$Impl_$.create(Math.round(red * 255),Math.round(green * 255),Math.round(blue * 255));
};
thx_color__$RGB_RGB_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseHex(color);
	if(null == info) info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "rgb":
			return thx_color__$RGB_RGB_$Impl_$.fromInts(thx_color_parse_ColorParser.getInt8Channels(info.channels,3));
		default:
			return null;
		}
	} catch( e ) {
		return null;
	}
};
thx_color__$RGB_RGB_$Impl_$.fromInts = function(arr) {
	thx_core_ArrayInts.resize(arr,3);
	return thx_color__$RGB_RGB_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$RGB_RGB_$Impl_$._new = function(rgb) {
	return rgb;
};
thx_color__$RGB_RGB_$Impl_$.darker = function(this1,t) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$RGBX_RGBX_$Impl_$.darker(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1),t));
};
thx_color__$RGB_RGB_$Impl_$.lighter = function(this1,t) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$RGBX_RGBX_$Impl_$.lighter(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1),t));
};
thx_color__$RGB_RGB_$Impl_$.interpolate = function(this1,other,t) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$RGBX_RGBX_$Impl_$.interpolate(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1),thx_color__$RGB_RGB_$Impl_$.toRGBX(other),t));
};
thx_color__$RGB_RGB_$Impl_$.withAlpha = function(this1,alpha) {
	return thx_color__$RGBA_RGBA_$Impl_$.fromInts([thx_color__$RGB_RGB_$Impl_$.get_red(this1),thx_color__$RGB_RGB_$Impl_$.get_green(this1),thx_color__$RGB_RGB_$Impl_$.get_blue(this1),alpha]);
};
thx_color__$RGB_RGB_$Impl_$.withRed = function(this1,newred) {
	return thx_color__$RGB_RGB_$Impl_$.fromInts([newred,thx_color__$RGB_RGB_$Impl_$.get_green(this1),thx_color__$RGB_RGB_$Impl_$.get_blue(this1)]);
};
thx_color__$RGB_RGB_$Impl_$.withGreen = function(this1,newgreen) {
	return thx_color__$RGB_RGB_$Impl_$.fromInts([thx_color__$RGB_RGB_$Impl_$.get_red(this1),newgreen,thx_color__$RGB_RGB_$Impl_$.get_blue(this1)]);
};
thx_color__$RGB_RGB_$Impl_$.withBlue = function(this1,newblue) {
	return thx_color__$RGB_RGB_$Impl_$.fromInts([thx_color__$RGB_RGB_$Impl_$.get_red(this1),thx_color__$RGB_RGB_$Impl_$.get_green(this1),newblue]);
};
thx_color__$RGB_RGB_$Impl_$.toCSS3 = function(this1) {
	return "rgb(" + thx_color__$RGB_RGB_$Impl_$.get_red(this1) + "," + thx_color__$RGB_RGB_$Impl_$.get_green(this1) + "," + thx_color__$RGB_RGB_$Impl_$.get_blue(this1) + ")";
};
thx_color__$RGB_RGB_$Impl_$.toString = function(this1) {
	return thx_color__$RGB_RGB_$Impl_$.toHex(this1);
};
thx_color__$RGB_RGB_$Impl_$.toHex = function(this1,prefix) {
	if(prefix == null) prefix = "#";
	return "" + prefix + StringTools.hex(thx_color__$RGB_RGB_$Impl_$.get_red(this1),2) + StringTools.hex(thx_color__$RGB_RGB_$Impl_$.get_green(this1),2) + StringTools.hex(thx_color__$RGB_RGB_$Impl_$.get_blue(this1),2);
};
thx_color__$RGB_RGB_$Impl_$.equals = function(this1,other) {
	return thx_color__$RGB_RGB_$Impl_$.get_red(this1) == thx_color__$RGB_RGB_$Impl_$.get_red(other) && thx_color__$RGB_RGB_$Impl_$.get_green(this1) == thx_color__$RGB_RGB_$Impl_$.get_green(other) && thx_color__$RGB_RGB_$Impl_$.get_blue(this1) == thx_color__$RGB_RGB_$Impl_$.get_blue(other);
};
thx_color__$RGB_RGB_$Impl_$.toCIELab = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELab(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCIELCh(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toRGBX = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.fromInts([thx_color__$RGB_RGB_$Impl_$.get_red(this1),thx_color__$RGB_RGB_$Impl_$.get_green(this1),thx_color__$RGB_RGB_$Impl_$.get_blue(this1)]);
};
thx_color__$RGB_RGB_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGB_RGB_$Impl_$.withAlpha(this1,255);
};
thx_color__$RGB_RGB_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(thx_color__$RGB_RGB_$Impl_$.toRGBA(this1));
};
thx_color__$RGB_RGB_$Impl_$.toYxy = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toYxy(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
};
thx_color__$RGB_RGB_$Impl_$.toXYZ = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toXYZ(thx_color__$RGB_RGB_$Impl_$.toRGBX(this1));
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
thx_color__$RGBA_RGBA_$Impl_$.fromInt = function(rgba) {
	return rgba;
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
thx_color__$RGBA_RGBA_$Impl_$._new = function(rgba) {
	return rgba;
};
thx_color__$RGBA_RGBA_$Impl_$.darker = function(this1,t) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$RGBXA_RGBXA_$Impl_$.darker(thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(this1),t));
};
thx_color__$RGBA_RGBA_$Impl_$.lighter = function(this1,t) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$RGBXA_RGBXA_$Impl_$.lighter(thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(this1),t));
};
thx_color__$RGBA_RGBA_$Impl_$.transparent = function(this1,t) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$RGBXA_RGBXA_$Impl_$.transparent(thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(this1),t));
};
thx_color__$RGBA_RGBA_$Impl_$.opaque = function(this1,t) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$RGBXA_RGBXA_$Impl_$.opaque(thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(this1),t));
};
thx_color__$RGBA_RGBA_$Impl_$.interpolate = function(this1,other,t) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$RGBXA_RGBXA_$Impl_$.interpolate(thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(this1),thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(other),t));
};
thx_color__$RGBA_RGBA_$Impl_$.withAlpha = function(this1,newalpha) {
	return thx_color__$RGBA_RGBA_$Impl_$.fromInts([this1 >> 24 & 255,this1 >> 16 & 255,this1 >> 8 & 255,newalpha]);
};
thx_color__$RGBA_RGBA_$Impl_$.withRed = function(this1,newred) {
	return thx_color__$RGBA_RGBA_$Impl_$.fromInts([newred,this1 >> 16 & 255,this1 >> 8 & 255]);
};
thx_color__$RGBA_RGBA_$Impl_$.withGreen = function(this1,newgreen) {
	return thx_color__$RGBA_RGBA_$Impl_$.fromInts([this1 >> 24 & 255,newgreen,this1 >> 8 & 255]);
};
thx_color__$RGBA_RGBA_$Impl_$.withBlue = function(this1,newblue) {
	return thx_color__$RGBA_RGBA_$Impl_$.fromInts([this1 >> 24 & 255,this1 >> 16 & 255,newblue]);
};
thx_color__$RGBA_RGBA_$Impl_$.toHSLA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toHSLA(thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(this1));
};
thx_color__$RGBA_RGBA_$Impl_$.toHSVA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toHSVA(thx_color__$RGBA_RGBA_$Impl_$.toRGBXA(this1));
};
thx_color__$RGBA_RGBA_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGB_RGB_$Impl_$.create(this1 >> 24 & 255,this1 >> 16 & 255,this1 >> 8 & 255);
};
thx_color__$RGBA_RGBA_$Impl_$.toRGBX = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.fromInts([this1 >> 24 & 255,this1 >> 16 & 255,this1 >> 8 & 255]);
};
thx_color__$RGBA_RGBA_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.fromInts([this1 >> 24 & 255,this1 >> 16 & 255,this1 >> 8 & 255,this1 & 255]);
};
thx_color__$RGBA_RGBA_$Impl_$.toCSS3 = function(this1) {
	return thx_color__$RGBA_RGBA_$Impl_$.toString(this1);
};
thx_color__$RGBA_RGBA_$Impl_$.toString = function(this1) {
	return "rgba(" + (this1 >> 24 & 255) + "," + (this1 >> 16 & 255) + "," + (this1 >> 8 & 255) + "," + (this1 & 255) / 255 + ")";
};
thx_color__$RGBA_RGBA_$Impl_$.toHex = function(this1,prefix) {
	if(prefix == null) prefix = "#";
	return "" + prefix + StringTools.hex(this1 & 255,2) + StringTools.hex(this1 >> 24 & 255,2) + StringTools.hex(this1 >> 16 & 255,2) + StringTools.hex(this1 >> 8 & 255,2);
};
thx_color__$RGBA_RGBA_$Impl_$.equals = function(this1,other) {
	return (this1 >> 24 & 255) == (other >> 24 & 255) && (this1 & 255) == (other & 255) && (this1 >> 16 & 255) == (other >> 16 & 255) && (this1 >> 8 & 255) == (other >> 8 & 255);
};
thx_color__$RGBA_RGBA_$Impl_$.get_alpha = function(this1) {
	return this1 & 255;
};
thx_color__$RGBA_RGBA_$Impl_$.get_red = function(this1) {
	return this1 >> 24 & 255;
};
thx_color__$RGBA_RGBA_$Impl_$.get_green = function(this1) {
	return this1 >> 16 & 255;
};
thx_color__$RGBA_RGBA_$Impl_$.get_blue = function(this1) {
	return this1 >> 8 & 255;
};
var thx_color__$RGBX_RGBX_$Impl_$ = {};
thx_color__$RGBX_RGBX_$Impl_$.__name__ = ["thx","color","_RGBX","RGBX_Impl_"];
thx_color__$RGBX_RGBX_$Impl_$.create = function(red,green,blue) {
	return [red < 0?0:red > 1?1:red,green < 0?0:green > 1?1:green,blue < 0?0:blue > 1?1:blue];
};
thx_color__$RGBX_RGBX_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$RGBX_RGBX_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$RGBX_RGBX_$Impl_$.fromInts = function(arr) {
	thx_core_ArrayInts.resize(arr,3);
	return thx_color__$RGBX_RGBX_$Impl_$.create(arr[0] / 255,arr[1] / 255,arr[2] / 255);
};
thx_color__$RGBX_RGBX_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseHex(color);
	if(null == info) info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "rgb":
			return thx_color__$RGBX_RGBX_$Impl_$.fromFloats(thx_color_parse_ColorParser.getFloatChannels(info.channels,3));
		default:
			return null;
		}
	} catch( e ) {
		return null;
	}
};
thx_color__$RGBX_RGBX_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.darker = function(this1,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],0),thx_core_Floats.interpolate(t,this1[1],0),thx_core_Floats.interpolate(t,this1[2],0)];
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.lighter = function(this1,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],1),thx_core_Floats.interpolate(t,this1[1],1),thx_core_Floats.interpolate(t,this1[2],1)];
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2])];
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.toCSS3 = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toString(this1);
};
thx_color__$RGBX_RGBX_$Impl_$.toString = function(this1) {
	return "rgb(" + this1[0] * 100 + "%," + this1[1] * 100 + "%," + this1[2] * 100 + "%)";
};
thx_color__$RGBX_RGBX_$Impl_$.toHex = function(this1,prefix) {
	if(prefix == null) prefix = "#";
	return "" + prefix + StringTools.hex(thx_color__$RGBX_RGBX_$Impl_$.get_red(this1),2) + StringTools.hex(thx_color__$RGBX_RGBX_$Impl_$.get_green(this1),2) + StringTools.hex(thx_color__$RGBX_RGBX_$Impl_$.get_blue(this1),2);
};
thx_color__$RGBX_RGBX_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$RGBX_RGBX_$Impl_$.withAlpha = function(this1,alpha) {
	var channels = this1.concat([alpha < 0?0:alpha > 1?1:alpha]);
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.withRed = function(this1,newred) {
	var channels = [newred < 0?0:newred > 1?1:newred,thx_color__$RGBX_RGBX_$Impl_$.get_green(this1),thx_color__$RGBX_RGBX_$Impl_$.get_blue(this1)];
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.withGreen = function(this1,newgreen) {
	var channels = [thx_color__$RGBX_RGBX_$Impl_$.get_red(this1),newgreen < 0?0:newgreen > 1?1:newgreen,thx_color__$RGBX_RGBX_$Impl_$.get_blue(this1)];
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.withBlue = function(this1,newblue) {
	var channels = [thx_color__$RGBX_RGBX_$Impl_$.get_red(this1),thx_color__$RGBX_RGBX_$Impl_$.get_green(this1),newblue < 0?0:newblue > 1?1:newblue];
	return channels;
};
thx_color__$RGBX_RGBX_$Impl_$.toCIELab = function(this1) {
	return thx_color__$XYZ_XYZ_$Impl_$.toCIELab(thx_color__$RGBX_RGBX_$Impl_$.toXYZ(this1));
};
thx_color__$RGBX_RGBX_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$CIELab_CIELab_$Impl_$.toCIELCh(thx_color__$RGBX_RGBX_$Impl_$.toCIELab(this1));
};
thx_color__$RGBX_RGBX_$Impl_$.toCMY = function(this1) {
	return [1 - this1[0],1 - this1[1],1 - this1[2]];
};
thx_color__$RGBX_RGBX_$Impl_$.toCMYK = function(this1) {
	var c = 0.0;
	var y = 0.0;
	var m = 0.0;
	var k;
	if(this1[0] + this1[1] + this1[2] == 0) k = 1.0; else {
		k = 1 - Math.max(Math.max(this1[0],this1[1]),this1[2]);
		c = (1 - this1[0] - k) / (1 - k);
		m = (1 - this1[1] - k) / (1 - k);
		y = (1 - this1[2] - k) / (1 - k);
	}
	return [c,m,y,k];
};
thx_color__$RGBX_RGBX_$Impl_$.toGrey = function(this1) {
	return this1[0] * .2126 + this1[1] * .7152 + this1[2] * .0722;
};
thx_color__$RGBX_RGBX_$Impl_$.toPerceivedGrey = function(this1) {
	return this1[0] * .299 + this1[1] * .587 + this1[2] * .114;
};
thx_color__$RGBX_RGBX_$Impl_$.toPerceivedAccurateGrey = function(this1) {
	var grey = Math.pow(this1[0],2) * .241 + Math.pow(this1[1],2) * .691 + Math.pow(this1[2],2) * .068;
	return grey;
};
thx_color__$RGBX_RGBX_$Impl_$.toHSL = function(this1) {
	var min = Math.min(Math.min(this1[0],this1[1]),this1[2]);
	var max = Math.max(Math.max(this1[0],this1[1]),this1[2]);
	var delta = max - min;
	var h;
	var s;
	var l = (max + min) / 2;
	if(delta == 0.0) s = h = 0.0; else {
		if(l < 0.5) s = delta / (max + min); else s = delta / (2 - max - min);
		if(this1[0] == max) h = (this1[1] - this1[2]) / delta + (this1[1] < thx_color__$RGBX_RGBX_$Impl_$.get_blue(this1)?6:0); else if(this1[1] == max) h = (this1[2] - this1[0]) / delta + 2; else h = (this1[0] - this1[1]) / delta + 4;
		h *= 60;
	}
	return [h,s,l];
};
thx_color__$RGBX_RGBX_$Impl_$.toHSV = function(this1) {
	var min = Math.min(Math.min(this1[0],this1[1]),this1[2]);
	var max = Math.max(Math.max(this1[0],this1[1]),this1[2]);
	var delta = max - min;
	var h;
	var s;
	var v = max;
	if(delta != 0) s = delta / max; else {
		s = 0;
		h = -1;
		return [h,s,v];
	}
	if(this1[0] == max) h = (this1[1] - this1[2]) / delta; else if(this1[1] == max) h = 2 + (this1[2] - this1[0]) / delta; else h = 4 + (this1[0] - this1[1]) / delta;
	h *= 60;
	if(h < 0) h += 360;
	return [h,s,v];
};
thx_color__$RGBX_RGBX_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGB_RGB_$Impl_$.createf(this1[0],this1[1],this1[2]);
};
thx_color__$RGBX_RGBX_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.withAlpha(this1,1.0);
};
thx_color__$RGBX_RGBX_$Impl_$.toXYZ = function(this1) {
	var r = this1[0];
	var g = this1[1];
	var b = this1[2];
	r = 100 * (r > 0.04045?Math.pow((r + 0.055) / 1.055,2.4):r / 12.92);
	g = 100 * (g > 0.04045?Math.pow((g + 0.055) / 1.055,2.4):g / 12.92);
	b = 100 * (b > 0.04045?Math.pow((b + 0.055) / 1.055,2.4):b / 12.92);
	return [r * 0.4124 + g * 0.3576 + b * 0.1805,r * 0.2126 + g * 0.7152 + b * 0.0722,r * 0.0193 + g * 0.1192 + b * 0.9505];
};
thx_color__$RGBX_RGBX_$Impl_$.toYxy = function(this1) {
	return thx_color__$XYZ_XYZ_$Impl_$.toYxy(thx_color__$RGBX_RGBX_$Impl_$.toXYZ(this1));
};
thx_color__$RGBX_RGBX_$Impl_$.get_red = function(this1) {
	return Math.round(this1[0] * 255);
};
thx_color__$RGBX_RGBX_$Impl_$.get_green = function(this1) {
	return Math.round(this1[1] * 255);
};
thx_color__$RGBX_RGBX_$Impl_$.get_blue = function(this1) {
	return Math.round(this1[2] * 255);
};
thx_color__$RGBX_RGBX_$Impl_$.get_redf = function(this1) {
	return this1[0];
};
thx_color__$RGBX_RGBX_$Impl_$.get_greenf = function(this1) {
	return this1[1];
};
thx_color__$RGBX_RGBX_$Impl_$.get_bluef = function(this1) {
	return this1[2];
};
var thx_color__$RGBXA_RGBXA_$Impl_$ = {};
thx_color__$RGBXA_RGBXA_$Impl_$.__name__ = ["thx","color","_RGBXA","RGBXA_Impl_"];
thx_color__$RGBXA_RGBXA_$Impl_$.create = function(red,green,blue,alpha) {
	return [red < 0?0:red > 1?1:red,green < 0?0:green > 1?1:green,blue < 0?0:blue > 1?1:blue,alpha < 0?0:alpha > 1?1:alpha];
};
thx_color__$RGBXA_RGBXA_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,4);
	return thx_color__$RGBXA_RGBXA_$Impl_$.create(arr[0],arr[1],arr[2],arr[3]);
};
thx_color__$RGBXA_RGBXA_$Impl_$.fromInts = function(arr) {
	thx_core_ArrayInts.resize(arr,4);
	return thx_color__$RGBXA_RGBXA_$Impl_$.create(arr[0] / 255,arr[1] / 255,arr[2] / 255,arr[3] / 255);
};
thx_color__$RGBXA_RGBXA_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseHex(color);
	if(null == info) info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "rgb":
			return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$RGBX_RGBX_$Impl_$.fromFloats(thx_color_parse_ColorParser.getFloatChannels(info.channels,3)));
		case "rgba":
			return thx_color__$RGBXA_RGBXA_$Impl_$.fromFloats(thx_color_parse_ColorParser.getFloatChannels(info.channels,4));
		default:
			return null;
		}
	} catch( e ) {
		return null;
	}
};
thx_color__$RGBXA_RGBXA_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.darker = function(this1,t) {
	return thx_color__$RGBX_RGBX_$Impl_$.withAlpha(thx_color__$RGBX_RGBX_$Impl_$.darker(thx_color__$RGBXA_RGBXA_$Impl_$.toRGBX(this1),t),thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1));
};
thx_color__$RGBXA_RGBXA_$Impl_$.lighter = function(this1,t) {
	return thx_color__$RGBX_RGBX_$Impl_$.withAlpha(thx_color__$RGBX_RGBX_$Impl_$.lighter(thx_color__$RGBXA_RGBXA_$Impl_$.toRGBX(this1),t),thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1));
};
thx_color__$RGBXA_RGBXA_$Impl_$.transparent = function(this1,t) {
	var channels = [this1[0],this1[1],this1[2],thx_core_Ints.interpolate(t,this1[3],0)];
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.opaque = function(this1,t) {
	var channels = [this1[0],this1[1],this1[2],thx_core_Ints.interpolate(t,this1[3],1)];
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Ints.interpolate(t,this1[0],other[0]),thx_core_Ints.interpolate(t,this1[1],other[1]),thx_core_Ints.interpolate(t,this1[2],other[2]),thx_core_Ints.interpolate(t,this1[3],other[3])];
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.withAlpha = function(this1,newalpha) {
	var channels = [thx_color__$RGBXA_RGBXA_$Impl_$.get_red(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_green(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_blue(this1),newalpha < 0?0:newalpha > 1?1:newalpha];
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.withRed = function(this1,newred) {
	var channels = [newred < 0?0:newred > 1?1:newred,thx_color__$RGBXA_RGBXA_$Impl_$.get_green(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_blue(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1)];
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.withGreen = function(this1,newgreen) {
	var channels = [thx_color__$RGBXA_RGBXA_$Impl_$.get_red(this1),newgreen < 0?0:newgreen > 1?1:newgreen,thx_color__$RGBXA_RGBXA_$Impl_$.get_blue(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1)];
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.withBlue = function(this1,newblue) {
	var channels = [thx_color__$RGBXA_RGBXA_$Impl_$.get_red(this1),thx_color__$RGBXA_RGBXA_$Impl_$.get_green(this1),newblue < 0?0:newblue > 1?1:newblue,thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1)];
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.toCSS3 = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toString(this1);
};
thx_color__$RGBXA_RGBXA_$Impl_$.toString = function(this1) {
	return "rgba(" + this1[0] * 100 + "%," + this1[1] * 100 + "%," + this1[2] * 100 + "%," + this1[3] + ")";
};
thx_color__$RGBXA_RGBXA_$Impl_$.toHex = function(this1,prefix) {
	if(prefix == null) prefix = "#";
	return "" + prefix + StringTools.hex(thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1),2) + StringTools.hex(thx_color__$RGBXA_RGBXA_$Impl_$.get_red(this1),2) + StringTools.hex(thx_color__$RGBXA_RGBXA_$Impl_$.get_green(this1),2) + StringTools.hex(thx_color__$RGBXA_RGBXA_$Impl_$.get_blue(this1),2);
};
thx_color__$RGBXA_RGBXA_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10 && Math.abs(this1[3] - other[3]) <= 10e-10;
};
thx_color__$RGBXA_RGBXA_$Impl_$.toHSLA = function(this1) {
	return thx_color__$HSL_HSL_$Impl_$.withAlpha(thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$RGBXA_RGBXA_$Impl_$.toRGBX(this1)),thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1));
};
thx_color__$RGBXA_RGBXA_$Impl_$.toHSVA = function(this1) {
	return thx_color__$HSV_HSV_$Impl_$.withAlpha(thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$RGBXA_RGBXA_$Impl_$.toRGBX(this1)),thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha(this1));
};
thx_color__$RGBXA_RGBXA_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$RGBXA_RGBXA_$Impl_$.toRGBX(this1));
};
thx_color__$RGBXA_RGBXA_$Impl_$.toRGBX = function(this1) {
	var channels = this1.slice(0,3);
	return channels;
};
thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBA_RGBA_$Impl_$.fromFloats([this1[0],this1[1],this1[2],this1[3]]);
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_red = function(this1) {
	return Math.round(this1[0] * 255);
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_green = function(this1) {
	return Math.round(this1[1] * 255);
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_blue = function(this1) {
	return Math.round(this1[2] * 255);
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_alpha = function(this1) {
	return Math.round(this1[3] * 255);
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_redf = function(this1) {
	return this1[0];
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_greenf = function(this1) {
	return this1[1];
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_bluef = function(this1) {
	return this1[2];
};
thx_color__$RGBXA_RGBXA_$Impl_$.get_alphaf = function(this1) {
	return this1[3];
};
var thx_color__$XYZ_XYZ_$Impl_$ = {};
thx_color__$XYZ_XYZ_$Impl_$.__name__ = ["thx","color","_XYZ","XYZ_Impl_"];
thx_color__$XYZ_XYZ_$Impl_$.create = function(x,y,z) {
	return [x,y,z];
};
thx_color__$XYZ_XYZ_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$XYZ_XYZ_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$XYZ_XYZ_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "ciexyz":case "xyz":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			return channels;
		default:
			return null;
		}
	} catch( e ) {
		return null;
	}
};
thx_color__$XYZ_XYZ_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$XYZ_XYZ_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2])];
	return channels;
};
thx_color__$XYZ_XYZ_$Impl_$.withX = function(this1,newx) {
	return [newx,this1[1],this1[2]];
};
thx_color__$XYZ_XYZ_$Impl_$.withY = function(this1,newy) {
	return [this1[0],newy,this1[2]];
};
thx_color__$XYZ_XYZ_$Impl_$.withZ = function(this1,newz) {
	return [this1[0],this1[1],newz];
};
thx_color__$XYZ_XYZ_$Impl_$.toString = function(this1) {
	return "XYZ(" + this1[0] + "," + this1[1] + "," + this1[2] + ")";
};
thx_color__$XYZ_XYZ_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$XYZ_XYZ_$Impl_$.toCIELab = function(this1) {
	var x = this1[0] * 0.0105211106;
	var y = this1[1] * 0.01;
	var z = this1[2] * 0.00918417016;
	var p;
	if(x > 0.008856) x = Math.pow(x,0.333333333333333315); else x = 7.787 * x + 0.137931034482758619;
	if(y > 0.008856) y = Math.pow(y,0.333333333333333315); else y = 7.787 * y + 0.137931034482758619;
	if(z > 0.008856) z = Math.pow(z,0.333333333333333315); else z = 7.787 * z + 0.137931034482758619;
	return y > 0.008856?[116 * y - 16,500 * (x - y),200 * (y - z)]:[903.3 * y,500 * (x - y),200 * (y - z)];
};
thx_color__$XYZ_XYZ_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$CIELab_CIELab_$Impl_$.toCIELCh(thx_color__$XYZ_XYZ_$Impl_$.toCIELab(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$XYZ_XYZ_$Impl_$.toRGBX(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$XYZ_XYZ_$Impl_$.toRGBX(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$XYZ_XYZ_$Impl_$.toRGBX(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$XYZ_XYZ_$Impl_$.toRGBX(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$XYZ_XYZ_$Impl_$.toRGBX(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$XYZ_XYZ_$Impl_$.toRGBX(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$XYZ_XYZ_$Impl_$.toRGBXA(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toRGBX = function(this1) {
	var x = this1[0] / 100;
	var y = this1[1] / 100;
	var z = this1[2] / 100;
	var r = x * 3.2406 + y * -1.5372 + z * -0.4986;
	var g = x * -0.9689 + y * 1.8758 + z * 0.0415;
	var b = x * 0.0557 + y * -0.204 + z * 1.0570;
	if(r > 0.0031308) r = 1.055 * Math.pow(r,0.416666666666666685) - 0.055; else r = 12.92 * r;
	if(g > 0.0031308) g = 1.055 * Math.pow(g,0.416666666666666685) - 0.055; else g = 12.92 * g;
	if(b > 0.0031308) b = 1.055 * Math.pow(b,0.416666666666666685) - 0.055; else b = 12.92 * b;
	return [r,g,b];
};
thx_color__$XYZ_XYZ_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$XYZ_XYZ_$Impl_$.toRGBX(this1));
};
thx_color__$XYZ_XYZ_$Impl_$.toYxy = function(this1) {
	var sum = this1[0] + this1[1] + this1[2];
	return [this1[1],sum == 0?1:this1[0] / sum,sum == 0?1:this1[1] / sum];
};
thx_color__$XYZ_XYZ_$Impl_$.get_x = function(this1) {
	return this1[0];
};
thx_color__$XYZ_XYZ_$Impl_$.get_y = function(this1) {
	return this1[1];
};
thx_color__$XYZ_XYZ_$Impl_$.get_z = function(this1) {
	return this1[2];
};
var thx_color__$Yxy_Yxy_$Impl_$ = {};
thx_color__$Yxy_Yxy_$Impl_$.__name__ = ["thx","color","_Yxy","Yxy_Impl_"];
thx_color__$Yxy_Yxy_$Impl_$.create = function(y1,x,y2) {
	return [y1,x,y2];
};
thx_color__$Yxy_Yxy_$Impl_$.fromFloats = function(arr) {
	thx_core_ArrayFloats.resize(arr,3);
	return thx_color__$Yxy_Yxy_$Impl_$.create(arr[0],arr[1],arr[2]);
};
thx_color__$Yxy_Yxy_$Impl_$.fromString = function(color) {
	var info = thx_color_parse_ColorParser.parseColor(color);
	if(null == info) return null;
	try {
		var _g = info.name;
		switch(_g) {
		case "yxy":
			var channels = thx_color_parse_ColorParser.getFloatChannels(info.channels,3);
			return channels;
		default:
			return null;
		}
	} catch( e ) {
		return null;
	}
};
thx_color__$Yxy_Yxy_$Impl_$._new = function(channels) {
	return channels;
};
thx_color__$Yxy_Yxy_$Impl_$.interpolate = function(this1,other,t) {
	var channels = [thx_core_Floats.interpolate(t,this1[0],other[0]),thx_core_Floats.interpolate(t,this1[1],other[1]),thx_core_Floats.interpolate(t,this1[2],other[2])];
	return channels;
};
thx_color__$Yxy_Yxy_$Impl_$.withY1 = function(this1,newy1) {
	return [newy1,this1[1],this1[2]];
};
thx_color__$Yxy_Yxy_$Impl_$.withY = function(this1,newx) {
	return [this1[0],this1[1],this1[2]];
};
thx_color__$Yxy_Yxy_$Impl_$.withZ = function(this1,newy2) {
	return [this1[0],this1[1],this1[2]];
};
thx_color__$Yxy_Yxy_$Impl_$.toString = function(this1) {
	return "Yxy(" + this1[0] + "," + this1[1] + "," + this1[2] + ")";
};
thx_color__$Yxy_Yxy_$Impl_$.equals = function(this1,other) {
	return Math.abs(this1[0] - other[0]) <= 10e-10 && Math.abs(this1[1] - other[1]) <= 10e-10 && Math.abs(this1[2] - other[2]) <= 10e-10;
};
thx_color__$Yxy_Yxy_$Impl_$.toCIELab = function(this1) {
	return thx_color__$XYZ_XYZ_$Impl_$.toCIELab(thx_color__$Yxy_Yxy_$Impl_$.toXYZ(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toCIELCh = function(this1) {
	return thx_color__$CIELab_CIELab_$Impl_$.toCIELCh(thx_color__$Yxy_Yxy_$Impl_$.toCIELab(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toCMY = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMY(thx_color__$Yxy_Yxy_$Impl_$.toRGBX(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toCMYK = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toCMYK(thx_color__$Yxy_Yxy_$Impl_$.toRGBX(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toGrey = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toGrey(thx_color__$Yxy_Yxy_$Impl_$.toRGBX(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toHSL = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSL(thx_color__$Yxy_Yxy_$Impl_$.toRGBX(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toHSV = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toHSV(thx_color__$Yxy_Yxy_$Impl_$.toRGBX(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toRGB = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGB(thx_color__$Yxy_Yxy_$Impl_$.toRGBX(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toRGBA = function(this1) {
	return thx_color__$RGBXA_RGBXA_$Impl_$.toRGBA(thx_color__$Yxy_Yxy_$Impl_$.toRGBXA(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toRGBX = function(this1) {
	return thx_color__$XYZ_XYZ_$Impl_$.toRGBX(thx_color__$Yxy_Yxy_$Impl_$.toXYZ(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toRGBXA = function(this1) {
	return thx_color__$RGBX_RGBX_$Impl_$.toRGBXA(thx_color__$Yxy_Yxy_$Impl_$.toRGBX(this1));
};
thx_color__$Yxy_Yxy_$Impl_$.toXYZ = function(this1) {
	return [this1[1] * (this1[0] / this1[2]),this1[0],(1 - this1[1] - this1[2]) * (this1[0] / this1[2])];
};
thx_color__$Yxy_Yxy_$Impl_$.get_y1 = function(this1) {
	return this1[0];
};
thx_color__$Yxy_Yxy_$Impl_$.get_x = function(this1) {
	return this1[1];
};
thx_color__$Yxy_Yxy_$Impl_$.get_y2 = function(this1) {
	return this1[2];
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
thx_color_parse_ColorParser.parseChannel = function(s) {
	return thx_color_parse_ColorParser.parser.processChannel(s);
};
thx_color_parse_ColorParser.getFloatChannels = function(channels,length,useInt8) {
	if(useInt8 == null) useInt8 = true;
	if(length != channels.length) throw "invalid number of channels, expected " + length + " but it is " + channels.length;
	return channels.map((function(f,a2) {
		return function(a1) {
			return f(a1,a2);
		};
	})(thx_color_parse_ColorParser.getFloatChannel,useInt8));
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
	,toString: function() {
		return "" + this.name + ", channels: " + Std.string(this.channels);
	}
	,__class__: thx_color_parse_ColorInfo
};
var thx_color_parse_ChannelInfo = { __ename__ : ["thx","color","parse","ChannelInfo"], __constructs__ : ["CIPercent","CIFloat","CIDegree","CIInt8","CIInt","CIBool"] };
thx_color_parse_ChannelInfo.CIPercent = function(value) { var $x = ["CIPercent",0,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
thx_color_parse_ChannelInfo.CIFloat = function(value) { var $x = ["CIFloat",1,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
thx_color_parse_ChannelInfo.CIDegree = function(value) { var $x = ["CIDegree",2,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
thx_color_parse_ChannelInfo.CIInt8 = function(value) { var $x = ["CIInt8",3,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
thx_color_parse_ChannelInfo.CIInt = function(value) { var $x = ["CIInt",4,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
thx_color_parse_ChannelInfo.CIBool = function(value) { var $x = ["CIBool",5,value]; $x.__enum__ = thx_color_parse_ChannelInfo; return $x; };
var thx_core_Arrays = function() { };
thx_core_Arrays.__name__ = ["thx","core","Arrays"];
thx_core_Arrays.after = function(array,element) {
	return array.slice(HxOverrides.indexOf(array,element,0) + 1);
};
thx_core_Arrays.all = function(arr,predicate) {
	var _g = 0;
	while(_g < arr.length) {
		var item = arr[_g];
		++_g;
		if(!predicate(item)) return false;
	}
	return true;
};
thx_core_Arrays.any = function(arr,predicate) {
	var _g = 0;
	while(_g < arr.length) {
		var item = arr[_g];
		++_g;
		if(predicate(item)) return true;
	}
	return false;
};
thx_core_Arrays.at = function(arr,indexes) {
	return indexes.map(function(i) {
		return arr[i];
	});
};
thx_core_Arrays.before = function(array,element) {
	return array.slice(0,HxOverrides.indexOf(array,element,0));
};
thx_core_Arrays.compact = function(arr) {
	return arr.filter(function(v) {
		return null != v;
	});
};
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
thx_core_Arrays.cross = function(a,b) {
	var r = [];
	var _g = 0;
	while(_g < a.length) {
		var va = a[_g];
		++_g;
		var _g1 = 0;
		while(_g1 < b.length) {
			var vb = b[_g1];
			++_g1;
			r.push([va,vb]);
		}
	}
	return r;
};
thx_core_Arrays.crossMulti = function(array) {
	var acopy = array.slice();
	var result = acopy.shift().map(function(v) {
		return [v];
	});
	while(acopy.length > 0) {
		var array1 = acopy.shift();
		var tresult = result;
		result = [];
		var _g = 0;
		while(_g < array1.length) {
			var v1 = array1[_g];
			++_g;
			var _g1 = 0;
			while(_g1 < tresult.length) {
				var ar = tresult[_g1];
				++_g1;
				var t = ar.slice();
				t.push(v1);
				result.push(t);
			}
		}
	}
	return result;
};
thx_core_Arrays.eachPair = function(array,callback) {
	var _g1 = 0;
	var _g = array.length;
	while(_g1 < _g) {
		var i = _g1++;
		var _g3 = i;
		var _g2 = array.length;
		while(_g3 < _g2) {
			var j = _g3++;
			if(!callback(array[i],array[j])) return;
		}
	}
};
thx_core_Arrays.equals = function(a,b,equality) {
	if(a == null || b == null || a.length != b.length) return false;
	if(null == equality) equality = thx_core_Functions.equality;
	var _g1 = 0;
	var _g = a.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(!equality(a[i],b[i])) return false;
	}
	return true;
};
thx_core_Arrays.extract = function(a,predicate) {
	var _g1 = 0;
	var _g = a.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(predicate(a[i])) return a.splice(i,1)[0];
	}
	return null;
};
thx_core_Arrays.find = function(array,predicate) {
	var _g = 0;
	while(_g < array.length) {
		var item = array[_g];
		++_g;
		if(predicate(item)) return item;
	}
	return null;
};
thx_core_Arrays.findLast = function(array,predicate) {
	var len = array.length;
	var j;
	var _g = 0;
	while(_g < len) {
		var i = _g++;
		j = len - i - 1;
		if(predicate(array[j])) return array[j];
	}
	return null;
};
thx_core_Arrays.first = function(array) {
	return array[0];
};
thx_core_Arrays.flatMap = function(array,callback) {
	return thx_core_Arrays.flatten(array.map(callback));
};
thx_core_Arrays.flatten = function(array) {
	return Array.prototype.concat.apply([],array);
};
thx_core_Arrays.from = function(array,element) {
	return array.slice(HxOverrides.indexOf(array,element,0));
};
thx_core_Arrays.head = function(array) {
	return array[0];
};
thx_core_Arrays.ifEmpty = function(value,alt) {
	if(null != value && 0 != value.length) return value; else return alt;
};
thx_core_Arrays.initial = function(array) {
	return array.slice(0,array.length - 1);
};
thx_core_Arrays.isEmpty = function(array) {
	return array.length == 0;
};
thx_core_Arrays.last = function(array) {
	return array[array.length - 1];
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
thx_core_Arrays.mapRight = function(array,callback) {
	var i = array.length;
	var result = [];
	while(--i >= 0) result.push(callback(array[i]));
	return result;
};
thx_core_Arrays.order = function(array,sort) {
	var n = array.slice();
	n.sort(sort);
	return n;
};
thx_core_Arrays.pull = function(array,toRemove,equality) {
	var _g = 0;
	while(_g < toRemove.length) {
		var item = toRemove[_g];
		++_g;
		thx_core_Arrays.removeAll(array,item,equality);
	}
};
thx_core_Arrays.pushIf = function(array,condition,value) {
	if(condition) array.push(value);
	return array;
};
thx_core_Arrays.reduce = function(array,callback,initial) {
	return array.reduce(callback,initial);
};
thx_core_Arrays.resize = function(array,length,fill) {
	while(array.length < length) array.push(fill);
	array.splice(length,array.length - length);
	return array;
};
thx_core_Arrays.reducei = function(array,callback,initial) {
	return array.reduce(callback,initial);
};
thx_core_Arrays.reduceRight = function(array,callback,initial) {
	var i = array.length;
	while(--i >= 0) initial = callback(initial,array[i]);
	return initial;
};
thx_core_Arrays.removeAll = function(array,element,equality) {
	if(null == equality) equality = thx_core_Functions.equality;
	var i = array.length;
	while(--i >= 0) if(equality(array[i],element)) array.splice(i,1);
};
thx_core_Arrays.rest = function(array) {
	return array.slice(1);
};
thx_core_Arrays.sample = function(array,n) {
	n = thx_core_Ints.min(n,array.length);
	var copy = array.slice();
	var result = [];
	var _g = 0;
	while(_g < n) {
		var i = _g++;
		result.push(copy.splice(Std.random(copy.length),1)[0]);
	}
	return result;
};
thx_core_Arrays.sampleOne = function(array) {
	return array[Std.random(array.length)];
};
thx_core_Arrays.shuffle = function(a) {
	var t = thx_core_Ints.range(a.length);
	var array = [];
	while(t.length > 0) {
		var pos = Std.random(t.length);
		var index = t[pos];
		t.splice(pos,1);
		array.push(a[index]);
	}
	return array;
};
thx_core_Arrays.take = function(arr,n) {
	return arr.slice(0,n);
};
thx_core_Arrays.takeLast = function(arr,n) {
	return arr.slice(arr.length - n);
};
thx_core_Arrays.rotate = function(arr) {
	var result = [];
	var _g1 = 0;
	var _g = arr[0].length;
	while(_g1 < _g) {
		var i = _g1++;
		var row = [];
		result.push(row);
		var _g3 = 0;
		var _g2 = arr.length;
		while(_g3 < _g2) {
			var j = _g3++;
			row.push(arr[j][i]);
		}
	}
	return result;
};
thx_core_Arrays.zip = function(array1,array2) {
	var length = thx_core_Ints.min(array1.length,array2.length);
	var array = [];
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		array.push({ _0 : array1[i], _1 : array2[i]});
	}
	return array;
};
thx_core_Arrays.zip3 = function(array1,array2,array3) {
	var length = thx_core_ArrayInts.min([array1.length,array2.length,array3.length]);
	var array = [];
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		array.push({ _0 : array1[i], _1 : array2[i], _2 : array3[i]});
	}
	return array;
};
thx_core_Arrays.zip4 = function(array1,array2,array3,array4) {
	var length = thx_core_ArrayInts.min([array1.length,array2.length,array3.length,array4.length]);
	var array = [];
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		array.push({ _0 : array1[i], _1 : array2[i], _2 : array3[i], _3 : array4[i]});
	}
	return array;
};
thx_core_Arrays.zip5 = function(array1,array2,array3,array4,array5) {
	var length = thx_core_ArrayInts.min([array1.length,array2.length,array3.length,array4.length,array5.length]);
	var array = [];
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		array.push({ _0 : array1[i], _1 : array2[i], _2 : array3[i], _3 : array4[i], _4 : array5[i]});
	}
	return array;
};
thx_core_Arrays.unzip = function(array) {
	var a1 = [];
	var a2 = [];
	array.map(function(t) {
		a1.push(t._0);
		a2.push(t._1);
	});
	return { _0 : a1, _1 : a2};
};
thx_core_Arrays.unzip3 = function(array) {
	var a1 = [];
	var a2 = [];
	var a3 = [];
	array.map(function(t) {
		a1.push(t._0);
		a2.push(t._1);
		a3.push(t._2);
	});
	return { _0 : a1, _1 : a2, _2 : a3};
};
thx_core_Arrays.unzip4 = function(array) {
	var a1 = [];
	var a2 = [];
	var a3 = [];
	var a4 = [];
	array.map(function(t) {
		a1.push(t._0);
		a2.push(t._1);
		a3.push(t._2);
		a4.push(t._3);
	});
	return { _0 : a1, _1 : a2, _2 : a3, _3 : a4};
};
thx_core_Arrays.unzip5 = function(array) {
	var a1 = [];
	var a2 = [];
	var a3 = [];
	var a4 = [];
	var a5 = [];
	array.map(function(t) {
		a1.push(t._0);
		a2.push(t._1);
		a3.push(t._2);
		a4.push(t._3);
		a5.push(t._4);
	});
	return { _0 : a1, _1 : a2, _2 : a3, _3 : a4, _4 : a5};
};
var thx_core_ArrayFloats = function() { };
thx_core_ArrayFloats.__name__ = ["thx","core","ArrayFloats"];
thx_core_ArrayFloats.average = function(arr) {
	return thx_core_ArrayFloats.sum(arr) / arr.length;
};
thx_core_ArrayFloats.compact = function(arr) {
	return arr.filter(function(v) {
		return null != v && isFinite(v);
	});
};
thx_core_ArrayFloats.max = function(arr) {
	if(arr.length == 0) return null; else return arr.reduce(function(max,v) {
		if(v > max) return v; else return max;
	},arr[0]);
};
thx_core_ArrayFloats.min = function(arr) {
	if(arr.length == 0) return null; else return arr.reduce(function(min,v) {
		if(v < min) return v; else return min;
	},arr[0]);
};
thx_core_ArrayFloats.resize = function(array,length,fill) {
	if(fill == null) fill = 0.0;
	while(array.length < length) array.push(fill);
	array.splice(length,array.length - length);
	return array;
};
thx_core_ArrayFloats.sum = function(arr) {
	return arr.reduce(function(tot,v) {
		return tot + v;
	},0.0);
};
var thx_core_ArrayInts = function() { };
thx_core_ArrayInts.__name__ = ["thx","core","ArrayInts"];
thx_core_ArrayInts.average = function(arr) {
	return thx_core_ArrayInts.sum(arr) / arr.length;
};
thx_core_ArrayInts.max = function(arr) {
	if(arr.length == 0) return null; else return arr.reduce(function(max,v) {
		if(v > max) return v; else return max;
	},arr[0]);
};
thx_core_ArrayInts.min = function(arr) {
	if(arr.length == 0) return null; else return arr.reduce(function(min,v) {
		if(v < min) return v; else return min;
	},arr[0]);
};
thx_core_ArrayInts.resize = function(array,length,fill) {
	if(fill == null) fill = 0;
	while(array.length < length) array.push(fill);
	array.splice(length,array.length - length);
	return array;
};
thx_core_ArrayInts.sum = function(arr) {
	return arr.reduce(function(tot,v) {
		return tot + v;
	},0);
};
var thx_core_ArrayStrings = function() { };
thx_core_ArrayStrings.__name__ = ["thx","core","ArrayStrings"];
thx_core_ArrayStrings.compact = function(arr) {
	return arr.filter(function(v) {
		return !thx_core_Strings.isEmpty(v);
	});
};
thx_core_ArrayStrings.max = function(arr) {
	if(arr.length == 0) return null; else return arr.reduce(function(max,v) {
		if(v > max) return v; else return max;
	},arr[0]);
};
thx_core_ArrayStrings.min = function(arr) {
	if(arr.length == 0) return null; else return arr.reduce(function(min,v) {
		if(v < min) return v; else return min;
	},arr[0]);
};
var thx_core_Error = function(message,stack,pos) {
	Error.call(this,message);
	this.message = message;
	if(null == stack) {
		try {
			stack = haxe_CallStack.exceptionStack();
		} catch( e ) {
			stack = [];
		}
		if(stack.length == 0) try {
			stack = haxe_CallStack.callStack();
		} catch( e1 ) {
			stack = [];
		}
	}
	this.stackItems = stack;
	this.pos = pos;
};
thx_core_Error.__name__ = ["thx","core","Error"];
thx_core_Error.fromDynamic = function(err,pos) {
	if(js_Boot.__instanceof(err,thx_core_Error)) return err;
	return new thx_core_Error("" + Std.string(err),null,pos);
};
thx_core_Error.__super__ = Error;
thx_core_Error.prototype = $extend(Error.prototype,{
	pos: null
	,stackItems: null
	,toString: function() {
		return this.message + "\nfrom: " + this.pos.className + "." + this.pos.methodName + "() at " + this.pos.lineNumber + "\n\n" + haxe_CallStack.toString(this.stackItems);
	}
	,__class__: thx_core_Error
});
var thx_core_Floats = function() { };
thx_core_Floats.__name__ = ["thx","core","Floats"];
thx_core_Floats.angleDifference = function(a,b,turn) {
	if(turn == null) turn = 360;
	var r = (b - a) % turn;
	if(r < 0) r += turn;
	if(r > turn / 2) r -= turn;
	return r;
};
thx_core_Floats.ceilTo = function(f,decimals) {
	var p = Math.pow(10,decimals);
	return Math.ceil(f * p) / p;
};
thx_core_Floats.canParse = function(s) {
	return thx_core_Floats.pattern_parse.match(s);
};
thx_core_Floats.clamp = function(v,min,max) {
	if(v < min) return min; else if(v > max) return max; else return v;
};
thx_core_Floats.clampSym = function(v,max) {
	return thx_core_Floats.clamp(v,-max,max);
};
thx_core_Floats.compare = function(a,b) {
	if(a < b) return -1; else if(b > a) return 1; else return 0;
};
thx_core_Floats.floorTo = function(f,decimals) {
	var p = Math.pow(10,decimals);
	return Math.floor(f * p) / p;
};
thx_core_Floats.interpolate = function(f,a,b) {
	return (b - a) * f + a;
};
thx_core_Floats.interpolateAngle = function(f,a,b,turn) {
	if(turn == null) turn = 360;
	return thx_core_Floats.wrapCircular(thx_core_Floats.interpolate(f,a,a + thx_core_Floats.angleDifference(a,b,turn)),turn);
};
thx_core_Floats.interpolateAngleWidest = function(f,a,b,turn) {
	if(turn == null) turn = 360;
	return thx_core_Floats.wrapCircular(thx_core_Floats.interpolateAngle(f,a,b,turn) - turn / 2,turn);
};
thx_core_Floats.interpolateAngleCW = function(f,a,b,turn) {
	if(turn == null) turn = 360;
	a = thx_core_Floats.wrapCircular(a,turn);
	b = thx_core_Floats.wrapCircular(b,turn);
	if(b < a) b += turn;
	return thx_core_Floats.wrapCircular(thx_core_Floats.interpolate(f,a,b),turn);
};
thx_core_Floats.interpolateAngleCCW = function(f,a,b,turn) {
	if(turn == null) turn = 360;
	a = thx_core_Floats.wrapCircular(a,turn);
	b = thx_core_Floats.wrapCircular(b,turn);
	if(b > a) b -= turn;
	return thx_core_Floats.wrapCircular(thx_core_Floats.interpolate(f,a,b),turn);
};
thx_core_Floats.nearEquals = function(a,b) {
	return Math.abs(a - b) <= 10e-10;
};
thx_core_Floats.nearZero = function(n) {
	return Math.abs(n) <= 10e-10;
};
thx_core_Floats.normalize = function(v) {
	if(v < 0) return 0; else if(v > 1) return 1; else return v;
};
thx_core_Floats.parse = function(s) {
	if(s.substring(0,1) == "+") s = s.substring(1);
	return parseFloat(s);
};
thx_core_Floats.root = function(base,index) {
	return Math.pow(base,1 / index);
};
thx_core_Floats.roundTo = function(f,decimals) {
	var p = Math.pow(10,decimals);
	return Math.round(f * p) / p;
};
thx_core_Floats.sign = function(value) {
	if(value < 0) return -1; else return 1;
};
thx_core_Floats.wrap = function(v,min,max) {
	var range = max - min + 1;
	if(v < min) v += range * ((min - v) / range + 1);
	return min + (v - min) % range;
};
thx_core_Floats.wrapCircular = function(v,max) {
	v = v % max;
	if(v < 0) v += max;
	return v;
};
var thx_core_Functions0 = function() { };
thx_core_Functions0.__name__ = ["thx","core","Functions0"];
thx_core_Functions0.after = function(callback,n) {
	return function() {
		if(--n == 0) callback();
	};
};
thx_core_Functions0.join = function(fa,fb) {
	return function() {
		fa();
		fb();
	};
};
thx_core_Functions0.once = function(f) {
	return function() {
		var t = f;
		f = thx_core_Functions.noop;
		t();
	};
};
thx_core_Functions0.negate = function(callback) {
	return function() {
		return !callback();
	};
};
thx_core_Functions0.times = function(n,callback) {
	return function() {
		return thx_core_Ints.range(n).map(function(_) {
			return callback();
		});
	};
};
thx_core_Functions0.timesi = function(n,callback) {
	return function() {
		return thx_core_Ints.range(n).map(function(i) {
			return callback(i);
		});
	};
};
var thx_core_Functions1 = function() { };
thx_core_Functions1.__name__ = ["thx","core","Functions1"];
thx_core_Functions1.compose = function(fa,fb) {
	return function(v) {
		return fa(fb(v));
	};
};
thx_core_Functions1.join = function(fa,fb) {
	return function(v) {
		fa(v);
		fb(v);
	};
};
thx_core_Functions1.memoize = function(callback,resolver) {
	if(null == resolver) resolver = function(v) {
		return "" + Std.string(v);
	};
	var map = new haxe_ds_StringMap();
	return function(v1) {
		var key = resolver(v1);
		if(__map_reserved[key] != null?map.existsReserved(key):map.h.hasOwnProperty(key)) return __map_reserved[key] != null?map.getReserved(key):map.h[key];
		var result = callback(v1);
		if(__map_reserved[key] != null) map.setReserved(key,result); else map.h[key] = result;
		return result;
	};
};
thx_core_Functions1.negate = function(callback) {
	return function(v) {
		return !callback(v);
	};
};
thx_core_Functions1.noop = function(_) {
};
thx_core_Functions1.times = function(n,callback) {
	return function(value) {
		return thx_core_Ints.range(n).map(function(_) {
			return callback(value);
		});
	};
};
thx_core_Functions1.timesi = function(n,callback) {
	return function(value) {
		return thx_core_Ints.range(n).map(function(i) {
			return callback(value,i);
		});
	};
};
thx_core_Functions1.swapArguments = function(callback) {
	return function(a2,a1) {
		return callback(a1,a2);
	};
};
var thx_core_Functions2 = function() { };
thx_core_Functions2.__name__ = ["thx","core","Functions2"];
thx_core_Functions2.memoize = function(callback,resolver) {
	if(null == resolver) resolver = function(v1,v2) {
		return "" + Std.string(v1) + ":" + Std.string(v2);
	};
	var map = new haxe_ds_StringMap();
	return function(v11,v21) {
		var key = resolver(v11,v21);
		if(__map_reserved[key] != null?map.existsReserved(key):map.h.hasOwnProperty(key)) return __map_reserved[key] != null?map.getReserved(key):map.h[key];
		var result = callback(v11,v21);
		if(__map_reserved[key] != null) map.setReserved(key,result); else map.h[key] = result;
		return result;
	};
};
thx_core_Functions2.negate = function(callback) {
	return function(v1,v2) {
		return !callback(v1,v2);
	};
};
var thx_core_Functions3 = function() { };
thx_core_Functions3.__name__ = ["thx","core","Functions3"];
thx_core_Functions3.memoize = function(callback,resolver) {
	if(null == resolver) resolver = function(v1,v2,v3) {
		return "" + Std.string(v1) + ":" + Std.string(v2) + ":" + Std.string(v3);
	};
	var map = new haxe_ds_StringMap();
	return function(v11,v21,v31) {
		var key = resolver(v11,v21,v31);
		if(__map_reserved[key] != null?map.existsReserved(key):map.h.hasOwnProperty(key)) return __map_reserved[key] != null?map.getReserved(key):map.h[key];
		var result = callback(v11,v21,v31);
		if(__map_reserved[key] != null) map.setReserved(key,result); else map.h[key] = result;
		return result;
	};
};
thx_core_Functions3.negate = function(callback) {
	return function(v1,v2,v3) {
		return !callback(v1,v2,v3);
	};
};
var thx_core_Functions = function() { };
thx_core_Functions.__name__ = ["thx","core","Functions"];
thx_core_Functions.constant = function(v) {
	return function() {
		return v;
	};
};
thx_core_Functions.equality = function(a,b) {
	return a == b;
};
thx_core_Functions.identity = function(value) {
	return value;
};
thx_core_Functions.noop = function() {
};
var thx_core_Ints = function() { };
thx_core_Ints.__name__ = ["thx","core","Ints"];
thx_core_Ints.abs = function(v) {
	if(v < 0) return -v; else return v;
};
thx_core_Ints.canParse = function(s) {
	return thx_core_Ints.pattern_parse.match(s);
};
thx_core_Ints.clamp = function(v,min,max) {
	if(v < min) return min; else if(v > max) return max; else return v;
};
thx_core_Ints.clampSym = function(v,max) {
	return thx_core_Ints.clamp(v,-max,max);
};
thx_core_Ints.compare = function(a,b) {
	return a - b;
};
thx_core_Ints.interpolate = function(f,a,b) {
	return Math.round(a + (b - a) * f);
};
thx_core_Ints.isEven = function(v) {
	return v % 2 == 0;
};
thx_core_Ints.isOdd = function(v) {
	return v % 2 != 0;
};
thx_core_Ints.max = function(a,b) {
	if(a > b) return a; else return b;
};
thx_core_Ints.min = function(a,b) {
	if(a < b) return a; else return b;
};
thx_core_Ints.parse = function(s,base) {
	var v = parseInt(s,base);
	if(isNaN(v)) return null; else return v;
};
thx_core_Ints.random = function(min,max) {
	if(min == null) min = 0;
	return Std.random(max + 1) + min;
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
thx_core_Ints.toString = function(value,base) {
	return value.toString(base);
};
thx_core_Ints.sign = function(value) {
	if(value < 0) return -1; else return 1;
};
thx_core_Ints.wrapCircular = function(v,max) {
	v = v % max;
	if(v < 0) v += max;
	return v;
};
var thx_core_Iterators = function() { };
thx_core_Iterators.__name__ = ["thx","core","Iterators"];
thx_core_Iterators.all = function(it,predicate) {
	while( it.hasNext() ) {
		var item = it.next();
		if(!predicate(item)) return false;
	}
	return true;
};
thx_core_Iterators.any = function(it,predicate) {
	while( it.hasNext() ) {
		var item = it.next();
		if(predicate(item)) return true;
	}
	return false;
};
thx_core_Iterators.eachPair = function(it,handler) {
	thx_core_Arrays.eachPair(thx_core_Iterators.toArray(it),handler);
};
thx_core_Iterators.filter = function(it,predicate) {
	return thx_core_Iterators.reduce(it,function(acc,item) {
		if(predicate(item)) acc.push(item);
		return acc;
	},[]);
};
thx_core_Iterators.find = function(it,f) {
	while( it.hasNext() ) {
		var item = it.next();
		if(f(item)) return item;
	}
	return null;
};
thx_core_Iterators.first = function(it) {
	if(it.hasNext()) return it.next(); else return null;
};
thx_core_Iterators.isEmpty = function(it) {
	return !it.hasNext();
};
thx_core_Iterators.isIterator = function(v) {
	var fields;
	if(Reflect.isObject(v) && null == Type.getClass(v)) fields = Reflect.fields(v); else fields = Type.getInstanceFields(Type.getClass(v));
	if(!Lambda.has(fields,"next") || !Lambda.has(fields,"hasNext")) return false;
	return Reflect.isFunction(Reflect.field(v,"next")) && Reflect.isFunction(Reflect.field(v,"hasNext"));
};
thx_core_Iterators.last = function(it) {
	var buf = null;
	while(it.hasNext()) buf = it.next();
	return buf;
};
thx_core_Iterators.map = function(it,f) {
	var acc = [];
	while( it.hasNext() ) {
		var v = it.next();
		acc.push(f(v));
	}
	return acc;
};
thx_core_Iterators.mapi = function(it,f) {
	var acc = [];
	var i = 0;
	while( it.hasNext() ) {
		var v = it.next();
		acc.push(f(v,i++));
	}
	return acc;
};
thx_core_Iterators.order = function(it,sort) {
	var n = thx_core_Iterators.toArray(it);
	n.sort(sort);
	return n;
};
thx_core_Iterators.reduce = function(it,callback,initial) {
	thx_core_Iterators.map(it,function(v) {
		initial = callback(initial,v);
	});
	return initial;
};
thx_core_Iterators.reducei = function(it,callback,initial) {
	thx_core_Iterators.mapi(it,function(v,i) {
		initial = callback(initial,v,i);
	});
	return initial;
};
thx_core_Iterators.toArray = function(it) {
	var items = [];
	while( it.hasNext() ) {
		var item = it.next();
		items.push(item);
	}
	return items;
};
var thx_core_Nil = { __ename__ : ["thx","core","Nil"], __constructs__ : ["nil"] };
thx_core_Nil.nil = ["nil",0];
thx_core_Nil.nil.__enum__ = thx_core_Nil;
var thx_core_Nulls = function() { };
thx_core_Nulls.__name__ = ["thx","core","Nulls"];
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
thx_core__$Set_Set_$Impl_$._new = function(arr) {
	return arr;
};
thx_core__$Set_Set_$Impl_$.add = function(this1,v) {
	if(thx_core__$Set_Set_$Impl_$.exists(this1,v)) return false; else {
		this1.push(v);
		return true;
	}
};
thx_core__$Set_Set_$Impl_$.copy = function(this1) {
	var arr = this1.slice();
	return arr;
};
thx_core__$Set_Set_$Impl_$.difference = function(this1,set) {
	var result = this1.slice();
	var $it0 = HxOverrides.iter(set);
	while( $it0.hasNext() ) {
		var item = $it0.next();
		HxOverrides.remove(result,item);
	}
	return result;
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
thx_core__$Set_Set_$Impl_$.get = function(this1,index) {
	return this1[index];
};
thx_core__$Set_Set_$Impl_$.intersection = function(this1,set) {
	var result = [];
	var _g = 0;
	while(_g < this1.length) {
		var item = this1[_g];
		++_g;
		if(thx_core__$Set_Set_$Impl_$.exists(set,item)) result.push(item);
	}
	return result;
};
thx_core__$Set_Set_$Impl_$.push = function(this1,v) {
	thx_core__$Set_Set_$Impl_$.add(this1,v);
};
thx_core__$Set_Set_$Impl_$.slice = function(this1,pos,end) {
	var arr = this1.slice(pos,end);
	return arr;
};
thx_core__$Set_Set_$Impl_$.splice = function(this1,pos,len) {
	var arr = this1.splice(pos,len);
	return arr;
};
thx_core__$Set_Set_$Impl_$.union = function(this1,set) {
	return thx_core__$Set_Set_$Impl_$.arrayToSet(this1.concat(thx_core__$Set_Set_$Impl_$.setToArray(set)));
};
thx_core__$Set_Set_$Impl_$.setToArray = function(this1) {
	return this1.slice();
};
thx_core__$Set_Set_$Impl_$.toString = function(this1) {
	return "{" + this1.join(", ") + "}";
};
var thx_core_Strings = function() { };
thx_core_Strings.__name__ = ["thx","core","Strings"];
thx_core_Strings.after = function(value,searchFor) {
	var pos = value.indexOf(searchFor);
	if(pos < 0) return ""; else return value.substring(pos + searchFor.length);
};
thx_core_Strings.capitalize = function(s) {
	return s.substring(0,1).toUpperCase() + s.substring(1);
};
thx_core_Strings.capitalizeWords = function(value,whiteSpaceOnly) {
	if(whiteSpaceOnly == null) whiteSpaceOnly = false;
	if(whiteSpaceOnly) return thx_core_Strings.UCWORDSWS.map(value.substring(0,1).toUpperCase() + value.substring(1),thx_core_Strings.upperMatch); else return thx_core_Strings.UCWORDS.map(value.substring(0,1).toUpperCase() + value.substring(1),thx_core_Strings.upperMatch);
};
thx_core_Strings.collapse = function(value) {
	return thx_core_Strings.WSG.replace(StringTools.trim(value)," ");
};
thx_core_Strings.compare = function(a,b) {
	if(a < b) return -1; else if(a > b) return 1; else return 0;
};
thx_core_Strings.contains = function(s,test) {
	return s.indexOf(test) >= 0;
};
thx_core_Strings.dasherize = function(s) {
	return StringTools.replace(s,"_","-");
};
thx_core_Strings.ellipsis = function(s,maxlen,symbol) {
	if(symbol == null) symbol = "...";
	if(maxlen == null) maxlen = 20;
	if(s.length > maxlen) return s.substring(0,symbol.length > maxlen - symbol.length?symbol.length:maxlen - symbol.length) + symbol; else return s;
};
thx_core_Strings.filter = function(s,predicate) {
	return s.split("").filter(predicate).join("");
};
thx_core_Strings.filterCharcode = function(s,predicate) {
	return thx_core_Strings.toCharcodeArray(s).filter(predicate).map(function(i) {
		return String.fromCharCode(i);
	}).join("");
};
thx_core_Strings.from = function(value,searchFor) {
	var pos = value.indexOf(searchFor);
	if(pos < 0) return ""; else return value.substring(pos);
};
thx_core_Strings.humanize = function(s) {
	return StringTools.replace(thx_core_Strings.underscore(s),"_"," ");
};
thx_core_Strings.isAlphaNum = function(value) {
	return thx_core_Strings.ALPHANUM.match(value);
};
thx_core_Strings.isLowerCase = function(value) {
	return value.toLowerCase() == value;
};
thx_core_Strings.isUpperCase = function(value) {
	return value.toUpperCase() == value;
};
thx_core_Strings.ifEmpty = function(value,alt) {
	if(null != value && "" != value) return value; else return alt;
};
thx_core_Strings.isDigitsOnly = function(value) {
	return thx_core_Strings.DIGITS.match(value);
};
thx_core_Strings.isEmpty = function(value) {
	return value == null || value == "";
};
thx_core_Strings.iterator = function(s) {
	var _this = s.split("");
	return HxOverrides.iter(_this);
};
thx_core_Strings.map = function(value,callback) {
	return value.split("").map(callback);
};
thx_core_Strings.remove = function(value,toremove) {
	return StringTools.replace(value,toremove,"");
};
thx_core_Strings.removeAfter = function(value,toremove) {
	if(StringTools.endsWith(value,toremove)) return value.substring(0,value.length - toremove.length); else return value;
};
thx_core_Strings.removeBefore = function(value,toremove) {
	if(StringTools.startsWith(value,toremove)) return value.substring(toremove.length); else return value;
};
thx_core_Strings.repeat = function(s,times) {
	return ((function($this) {
		var $r;
		var _g = [];
		{
			var _g1 = 0;
			while(_g1 < times) {
				var i = _g1++;
				_g.push(s);
			}
		}
		$r = _g;
		return $r;
	}(this))).join("");
};
thx_core_Strings.reverse = function(s) {
	var arr = s.split("");
	arr.reverse();
	return arr.join("");
};
thx_core_Strings.stripTags = function(s) {
	return thx_core_Strings.STRIPTAGS.replace(s,"");
};
thx_core_Strings.surround = function(s,left,right) {
	return "" + left + s + (null == right?left:right);
};
thx_core_Strings.toArray = function(s) {
	return s.split("");
};
thx_core_Strings.toCharcodeArray = function(s) {
	return thx_core_Strings.map(s,function(s1) {
		return HxOverrides.cca(s1,0);
	});
};
thx_core_Strings.toChunks = function(s,len) {
	var chunks = [];
	while(s.length > 0) {
		chunks.push(s.substring(0,len));
		s = s.substring(len);
	}
	return chunks;
};
thx_core_Strings.trimChars = function(value,charlist) {
	return thx_core_Strings.trimCharsRight(thx_core_Strings.trimCharsLeft(value,charlist),charlist);
};
thx_core_Strings.trimCharsLeft = function(value,charlist) {
	var pos = 0;
	var _g1 = 0;
	var _g = value.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(thx_core_Strings.contains(charlist,value.charAt(i))) pos++; else break;
	}
	return value.substring(pos);
};
thx_core_Strings.trimCharsRight = function(value,charlist) {
	var len = value.length;
	var pos = len;
	var i;
	var _g = 0;
	while(_g < len) {
		var j = _g++;
		i = len - j - 1;
		if(thx_core_Strings.contains(charlist,value.charAt(i))) pos = i; else break;
	}
	return value.substring(0,pos);
};
thx_core_Strings.underscore = function(s) {
	s = new EReg("::","g").replace(s,"/");
	s = new EReg("([A-Z]+)([A-Z][a-z])","g").replace(s,"$1_$2");
	s = new EReg("([a-z\\d])([A-Z])","g").replace(s,"$1_$2");
	s = new EReg("-","g").replace(s,"_");
	return s.toLowerCase();
};
thx_core_Strings.upTo = function(value,searchFor) {
	var pos = value.indexOf(searchFor);
	if(pos < 0) return value; else return value.substring(0,pos);
};
thx_core_Strings.wrapColumns = function(s,columns,indent,newline) {
	if(newline == null) newline = "\n";
	if(indent == null) indent = "";
	if(columns == null) columns = 78;
	return thx_core_Strings.SPLIT_LINES.split(s).map(function(part) {
		return thx_core_Strings.wrapLine(StringTools.trim(thx_core_Strings.WSG.replace(part," ")),columns,indent,newline);
	}).join(newline);
};
thx_core_Strings.upperMatch = function(re) {
	return re.matched(0).toUpperCase();
};
thx_core_Strings.wrapLine = function(s,columns,indent,newline) {
	var parts = [];
	var pos = 0;
	var len = s.length;
	var ilen = indent.length;
	columns -= ilen;
	while(true) {
		if(pos + columns >= len - ilen) {
			parts.push(s.substring(pos));
			break;
		}
		var i = 0;
		while(!StringTools.isSpace(s,pos + columns - i) && i < columns) i++;
		if(i == columns) {
			i = 0;
			while(!StringTools.isSpace(s,pos + columns + i) && pos + columns + i < len) i++;
			parts.push(s.substring(pos,pos + columns + i));
			pos += columns + i + 1;
		} else {
			parts.push(s.substring(pos,pos + columns - i));
			pos += columns - i + 1;
		}
	}
	return indent + parts.join(newline + indent);
};
var thx_core_Timer = function() { };
thx_core_Timer.__name__ = ["thx","core","Timer"];
thx_core_Timer.debounce = function(callback,delayms,leading) {
	if(leading == null) leading = false;
	var cancel = thx_core_Functions.noop;
	var poll = function() {
		cancel();
		cancel = thx_core_Timer.delay(callback,delayms);
	};
	return function() {
		if(leading) {
			leading = false;
			callback();
		}
		poll();
	};
};
thx_core_Timer.throttle = function(callback,delayms,leading) {
	if(leading == null) leading = false;
	var waiting = false;
	var poll = function() {
		waiting = true;
		thx_core_Timer.delay(callback,delayms);
	};
	return function() {
		if(leading) {
			leading = false;
			callback();
			return;
		}
		if(waiting) return;
		poll();
	};
};
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
thx_core_Timer.nextFrame = function(callback) {
	var id = requestAnimationFrame(callback);
	return function() {
		cancelAnimationFrame(id);
	};
};
thx_core_Timer.immediate = function(callback) {
	return (function(f,id) {
		return function() {
			f(id);
		};
	})(thx_core_Timer.clear,setImmediate(callback));
};
thx_core_Timer.clear = function(id) {
	clearTimeout(id);
	return;
};
thx_core_Timer.time = function() {
	return performance.now();
};
var thx_core__$Tuple_Tuple0_$Impl_$ = {};
thx_core__$Tuple_Tuple0_$Impl_$.__name__ = ["thx","core","_Tuple","Tuple0_Impl_"];
thx_core__$Tuple_Tuple0_$Impl_$._new = function() {
	return thx_core_Nil.nil;
};
thx_core__$Tuple_Tuple0_$Impl_$["with"] = function(this1,v) {
	return v;
};
thx_core__$Tuple_Tuple0_$Impl_$.toString = function(this1) {
	return "Tuple0()";
};
thx_core__$Tuple_Tuple0_$Impl_$.toNil = function(this1) {
	return this1;
};
thx_core__$Tuple_Tuple0_$Impl_$.nilToTuple = function(v) {
	return thx_core_Nil.nil;
};
var thx_core__$Tuple_Tuple1_$Impl_$ = {};
thx_core__$Tuple_Tuple1_$Impl_$.__name__ = ["thx","core","_Tuple","Tuple1_Impl_"];
thx_core__$Tuple_Tuple1_$Impl_$._new = function(_0) {
	return _0;
};
thx_core__$Tuple_Tuple1_$Impl_$.get__0 = function(this1) {
	return this1;
};
thx_core__$Tuple_Tuple1_$Impl_$["with"] = function(this1,v) {
	return { _0 : this1, _1 : v};
};
thx_core__$Tuple_Tuple1_$Impl_$.toString = function(this1) {
	return "Tuple1(" + Std.string(this1) + ")";
};
var thx_core__$Tuple_Tuple2_$Impl_$ = {};
thx_core__$Tuple_Tuple2_$Impl_$.__name__ = ["thx","core","_Tuple","Tuple2_Impl_"];
thx_core__$Tuple_Tuple2_$Impl_$._new = function(_0,_1) {
	return { _0 : _0, _1 : _1};
};
thx_core__$Tuple_Tuple2_$Impl_$.get_left = function(this1) {
	return this1._0;
};
thx_core__$Tuple_Tuple2_$Impl_$.get_right = function(this1) {
	return this1._1;
};
thx_core__$Tuple_Tuple2_$Impl_$.flip = function(this1) {
	return { _0 : this1._1, _1 : this1._0};
};
thx_core__$Tuple_Tuple2_$Impl_$.dropLeft = function(this1) {
	return this1._1;
};
thx_core__$Tuple_Tuple2_$Impl_$.dropRight = function(this1) {
	return this1._0;
};
thx_core__$Tuple_Tuple2_$Impl_$["with"] = function(this1,v) {
	return { _0 : this1._0, _1 : this1._1, _2 : v};
};
thx_core__$Tuple_Tuple2_$Impl_$.toString = function(this1) {
	return "Tuple2(" + Std.string(this1._0) + "," + Std.string(this1._1) + ")";
};
var thx_core__$Tuple_Tuple3_$Impl_$ = {};
thx_core__$Tuple_Tuple3_$Impl_$.__name__ = ["thx","core","_Tuple","Tuple3_Impl_"];
thx_core__$Tuple_Tuple3_$Impl_$._new = function(_0,_1,_2) {
	return { _0 : _0, _1 : _1, _2 : _2};
};
thx_core__$Tuple_Tuple3_$Impl_$.flip = function(this1) {
	return { _0 : this1._2, _1 : this1._1, _2 : this1._0};
};
thx_core__$Tuple_Tuple3_$Impl_$.dropLeft = function(this1) {
	return { _0 : this1._1, _1 : this1._2};
};
thx_core__$Tuple_Tuple3_$Impl_$.dropRight = function(this1) {
	return { _0 : this1._0, _1 : this1._1};
};
thx_core__$Tuple_Tuple3_$Impl_$["with"] = function(this1,v) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2, _3 : v};
};
thx_core__$Tuple_Tuple3_$Impl_$.toString = function(this1) {
	return "Tuple3(" + Std.string(this1._0) + "," + Std.string(this1._1) + "," + Std.string(this1._2) + ")";
};
var thx_core__$Tuple_Tuple4_$Impl_$ = {};
thx_core__$Tuple_Tuple4_$Impl_$.__name__ = ["thx","core","_Tuple","Tuple4_Impl_"];
thx_core__$Tuple_Tuple4_$Impl_$._new = function(_0,_1,_2,_3) {
	return { _0 : _0, _1 : _1, _2 : _2, _3 : _3};
};
thx_core__$Tuple_Tuple4_$Impl_$.flip = function(this1) {
	return { _0 : this1._3, _1 : this1._2, _2 : this1._1, _3 : this1._0};
};
thx_core__$Tuple_Tuple4_$Impl_$.dropLeft = function(this1) {
	return { _0 : this1._1, _1 : this1._2, _2 : this1._3};
};
thx_core__$Tuple_Tuple4_$Impl_$.dropRight = function(this1) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2};
};
thx_core__$Tuple_Tuple4_$Impl_$["with"] = function(this1,v) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2, _3 : this1._3, _4 : v};
};
thx_core__$Tuple_Tuple4_$Impl_$.toString = function(this1) {
	return "Tuple4(" + Std.string(this1._0) + "," + Std.string(this1._1) + "," + Std.string(this1._2) + "," + Std.string(this1._3) + ")";
};
var thx_core__$Tuple_Tuple5_$Impl_$ = {};
thx_core__$Tuple_Tuple5_$Impl_$.__name__ = ["thx","core","_Tuple","Tuple5_Impl_"];
thx_core__$Tuple_Tuple5_$Impl_$._new = function(_0,_1,_2,_3,_4) {
	return { _0 : _0, _1 : _1, _2 : _2, _3 : _3, _4 : _4};
};
thx_core__$Tuple_Tuple5_$Impl_$.flip = function(this1) {
	return { _0 : this1._4, _1 : this1._3, _2 : this1._2, _3 : this1._1, _4 : this1._0};
};
thx_core__$Tuple_Tuple5_$Impl_$.dropLeft = function(this1) {
	return { _0 : this1._1, _1 : this1._2, _2 : this1._3, _3 : this1._4};
};
thx_core__$Tuple_Tuple5_$Impl_$.dropRight = function(this1) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2, _3 : this1._3};
};
thx_core__$Tuple_Tuple5_$Impl_$["with"] = function(this1,v) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2, _3 : this1._3, _4 : this1._4, _5 : v};
};
thx_core__$Tuple_Tuple5_$Impl_$.toString = function(this1) {
	return "Tuple5(" + Std.string(this1._0) + "," + Std.string(this1._1) + "," + Std.string(this1._2) + "," + Std.string(this1._3) + "," + Std.string(this1._4) + ")";
};
var thx_core__$Tuple_Tuple6_$Impl_$ = {};
thx_core__$Tuple_Tuple6_$Impl_$.__name__ = ["thx","core","_Tuple","Tuple6_Impl_"];
thx_core__$Tuple_Tuple6_$Impl_$._new = function(_0,_1,_2,_3,_4,_5) {
	return { _0 : _0, _1 : _1, _2 : _2, _3 : _3, _4 : _4, _5 : _5};
};
thx_core__$Tuple_Tuple6_$Impl_$.flip = function(this1) {
	return { _0 : this1._5, _1 : this1._4, _2 : this1._3, _3 : this1._2, _4 : this1._1, _5 : this1._0};
};
thx_core__$Tuple_Tuple6_$Impl_$.dropLeft = function(this1) {
	return { _0 : this1._1, _1 : this1._2, _2 : this1._3, _3 : this1._4, _4 : this1._5};
};
thx_core__$Tuple_Tuple6_$Impl_$.dropRight = function(this1) {
	return { _0 : this1._0, _1 : this1._1, _2 : this1._2, _3 : this1._3, _4 : this1._4};
};
thx_core__$Tuple_Tuple6_$Impl_$.toString = function(this1) {
	return "Tuple6(" + Std.string(this1._0) + "," + Std.string(this1._1) + "," + Std.string(this1._2) + "," + Std.string(this1._3) + "," + Std.string(this1._4) + "," + Std.string(this1._5) + ")";
};
var thx_core_Types = function() { };
thx_core_Types.__name__ = ["thx","core","Types"];
thx_core_Types.isAnonymousObject = function(v) {
	return Reflect.isObject(v) && null == Type.getClass(v);
};
thx_core_Types.isPrimitive = function(v) {
	{
		var _g = Type["typeof"](v);
		switch(_g[1]) {
		case 1:case 2:case 3:
			return true;
		case 0:case 5:case 7:case 4:case 8:
			return false;
		case 6:
			var c = _g[2];
			return Type.getClassName(c) == "String";
		}
	}
};
thx_core_Types.hasSuperClass = function(cls,sup) {
	while(null != cls) {
		if(cls == sup) return true;
		cls = Type.getSuperClass(cls);
	}
	return false;
};
thx_core_Types.sameType = function(a,b) {
	return thx_core_Types.typeToString(Type["typeof"](a)) == thx_core_Types.typeToString(Type["typeof"](b));
};
thx_core_Types.typeInheritance = function(type) {
	switch(type[1]) {
	case 1:
		return ["Int"];
	case 2:
		return ["Float"];
	case 3:
		return ["Bool"];
	case 4:
		return ["{}"];
	case 5:
		return ["Function"];
	case 6:
		var c = type[2];
		var classes = [];
		while(null != c) {
			classes.push(c);
			c = Type.getSuperClass(c);
		}
		return classes.map(Type.getClassName);
	case 7:
		var e = type[2];
		return [Type.getEnumName(e)];
	default:
		throw "invalid type " + Std.string(type);
	}
};
thx_core_Types.typeToString = function(type) {
	switch(type[1]) {
	case 0:
		return "Null";
	case 1:
		return "Int";
	case 2:
		return "Float";
	case 3:
		return "Bool";
	case 4:
		return "{}";
	case 5:
		return "Function";
	case 6:
		var c = type[2];
		return Type.getClassName(c);
	case 7:
		var e = type[2];
		return Type.getEnumName(e);
	default:
		throw "invalid type " + Std.string(type);
	}
};
thx_core_Types.valueTypeInheritance = function(value) {
	return thx_core_Types.typeInheritance(Type["typeof"](value));
};
thx_core_Types.valueTypeToString = function(value) {
	return thx_core_Types.typeToString(Type["typeof"](value));
};
var thx_core_error_NullArgument = function(message,posInfo) {
	thx_core_Error.call(this,message,null,posInfo);
};
thx_core_error_NullArgument.__name__ = ["thx","core","error","NullArgument"];
thx_core_error_NullArgument.__super__ = thx_core_Error;
thx_core_error_NullArgument.prototype = $extend(thx_core_Error.prototype,{
	__class__: thx_core_error_NullArgument
});
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
thx_culture_DateFormatInfo.fromObject = function(o) {
	return new thx_culture_DateFormatInfo(o.calendarWeekRuleIndex,o.calendarWeekRuleName,o.designatorAm,o.designatorPm,o.firstDayOfWeekIndex,o.firstDayOfWeekName,o.nameCalendar,o.nameCalendarNative,o.nameDays,o.nameDaysAbbreviated,o.nameDaysShortest,o.nameMonths,o.nameMonthsAbbreviated,o.nameMonthGenitives,o.nameMonthGenitivesAbbreviated,o.patternDateLong,o.patternDateShort,o.patternDateTimeFull,o.patternDateTimeSortable,o.patternMonthDay,o.patternRfc1123,o.patternTimeLong,o.patternTimeShort,o.patternUniversalSortable,o.patternYearMonth,o.separatorDate,o.separatorTime);
};
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
	,toObject: function() {
		return { calendarWeekRuleIndex : this.calendarWeekRuleIndex, calendarWeekRuleName : this.calendarWeekRuleName, designatorAm : this.designatorAm, designatorPm : this.designatorPm, firstDayOfWeekIndex : this.firstDayOfWeekIndex, firstDayOfWeekName : this.firstDayOfWeekName, nameCalendar : this.nameCalendar, nameCalendarNative : this.nameCalendarNative, nameDays : this.nameDays, nameDaysAbbreviated : this.nameDaysAbbreviated, nameDaysShortest : this.nameDaysShortest, nameMonths : this.nameMonths, nameMonthsAbbreviated : this.nameMonthsAbbreviated, nameMonthGenitives : this.nameMonthGenitives, nameMonthGenitivesAbbreviated : this.nameMonthGenitivesAbbreviated, patternDateLong : this.patternDateLong, patternDateShort : this.patternDateShort, patternDateTimeFull : this.patternDateTimeFull, patternDateTimeSortable : this.patternDateTimeSortable, patternMonthDay : this.patternMonthDay, patternRfc1123 : this.patternRfc1123, patternTimeLong : this.patternTimeLong, patternTimeShort : this.patternTimeShort, patternUniversalSortable : this.patternUniversalSortable, patternYearMonth : this.patternYearMonth, separatorDate : this.separatorDate, separatorTime : this.separatorTime};
	}
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
thx_culture_NumberFormatInfo.fromObject = function(o) {
	return new thx_culture_NumberFormatInfo(o.decimalDigitsCurrency,o.decimalDigitsNumber,o.decimalDigitsPercent,o.groupSizesCurrency,o.groupSizesNumber,o.groupSizesPercent,o.patternNegativeCurrency,o.patternNegativeNumber,o.patternNegativePercent,o.patternPositiveCurrency,o.patternPositivePercent,o.separatorDecimalCurrency,o.separatorDecimalNumber,o.separatorDecimalPercent,o.separatorGroupCurrency,o.separatorGroupNumber,o.separatorGroupPercent,o.signNegative,o.signPositive,o.symbolCurrency,o.symbolNaN,o.symbolNegativeInfinity,o.symbolPercent,o.symbolPermille,o.symbolPositiveInfinity);
};
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
	,toObject: function() {
		return { decimalDigitsCurrency : this.decimalDigitsCurrency, decimalDigitsNumber : this.decimalDigitsNumber, decimalDigitsPercent : this.decimalDigitsPercent, groupSizesCurrency : this.groupSizesCurrency, groupSizesNumber : this.groupSizesNumber, groupSizesPercent : this.groupSizesPercent, patternNegativeCurrency : this.patternNegativeCurrency, patternNegativeNumber : this.patternNegativeNumber, patternNegativePercent : this.patternNegativePercent, patternPositiveCurrency : this.patternPositiveCurrency, patternPositivePercent : this.patternPositivePercent, separatorDecimalCurrency : this.separatorDecimalCurrency, separatorDecimalNumber : this.separatorDecimalNumber, separatorDecimalPercent : this.separatorDecimalPercent, separatorGroupCurrency : this.separatorGroupCurrency, separatorGroupNumber : this.separatorGroupNumber, separatorGroupPercent : this.separatorGroupPercent, signNegative : this.signNegative, signPositive : this.signPositive, symbolCurrency : this.symbolCurrency, symbolNaN : this.symbolNaN, symbolNegativeInfinity : this.symbolNegativeInfinity, symbolPercent : this.symbolPercent, symbolPermille : this.symbolPermille, symbolPositiveInfinity : this.symbolPositiveInfinity};
	}
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
thx_culture_Culture.fromObject = function(o) {
	return new thx_culture_Culture(o.code,null == o.dateTime?null:thx_culture_DateFormatInfo.fromObject(o.dateTime),o.ietf,o.isNeutral,o.iso2,o.iso3,o.isRightToLeft,o.lcid,o.nameCalendar,o.nameEnglish,o.nameNative,o.nameRegionEnglish,o.nameRegionNative,null == o.number?null:thx_culture_NumberFormatInfo.fromObject(o.number),o.separatorList,o.win3);
};
thx_culture_Culture.register = function(culture) {
	var code = "C:" + culture.code.toLowerCase();
	if(thx_culture_Culture.cultures.exists(code)) return thx_culture_Culture.cultures.get(code);
	thx_culture_Culture.list.push(culture);
	thx_culture_Culture.cultures.set(code,culture);
	var key = "I2:" + culture.iso2.toLowerCase();
	thx_culture_Culture.cultures.set(key,culture);
	var key1 = "I3:" + culture.iso3.toLowerCase();
	thx_culture_Culture.cultures.set(key1,culture);
	return culture;
};
thx_culture_Culture.getByCode = function(code) {
	var key = "C:" + code.toLowerCase();
	return thx_culture_Culture.cultures.get(key);
};
thx_culture_Culture.getByIso2 = function(iso2) {
	var key = "I2:" + iso2.toLowerCase();
	return thx_culture_Culture.cultures.get(key);
};
thx_culture_Culture.getByIso3 = function(iso3) {
	var key = "I3:" + iso3.toLowerCase();
	return thx_culture_Culture.cultures.get(key);
};
thx_culture_Culture.iterator = function() {
	return HxOverrides.iter(thx_culture_Culture.list);
};
thx_culture_Culture.getCodeKey = function(key) {
	return "C:" + key.toLowerCase();
};
thx_culture_Culture.getIso2Key = function(key) {
	return "I2:" + key.toLowerCase();
};
thx_culture_Culture.getIso3Key = function(key) {
	return "I3:" + key.toLowerCase();
};
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
	,nameDisplayEnglish: null
	,nameDisplayNative: null
	,nameEnglish: null
	,nameNative: null
	,nameRegionEnglish: null
	,nameRegionNative: null
	,number: null
	,separatorList: null
	,win3: null
	,toObject: function() {
		return { code : this.code, dateTime : null == this.dateTime?null:this.dateTime.toObject(), ietf : this.ietf, isNeutral : this.isNeutral, iso2 : this.iso2, iso3 : this.iso3, isRightToLeft : this.isRightToLeft, lcid : this.lcid, nameCalendar : this.nameCalendar, nameEnglish : this.nameEnglish, nameNative : this.nameNative, nameRegionEnglish : this.nameRegionEnglish, nameRegionNative : this.nameRegionNative, number : null == this.number?null:this.number.toObject(), separatorList : this.separatorList, win3 : this.win3};
	}
	,get_nameDisplayEnglish: function() {
		return this.nameEnglish + (null == this.nameRegionEnglish?"":" (" + this.nameRegionEnglish + ")");
	}
	,get_nameDisplayNative: function() {
		return this.nameNative + (null == this.nameRegionNative?"":" (" + this.nameRegionNative + ")");
	}
	,toString: function() {
		return this.nameEnglish + (null == this.nameRegionEnglish?"":" (" + this.nameRegionEnglish + ")");
	}
	,__class__: thx_culture_Culture
};
var thx_culture_Pattern = function() { };
thx_culture_Pattern.__name__ = ["thx","culture","Pattern"];
var thx_format_NumberFormat = function() { };
thx_format_NumberFormat.__name__ = ["thx","format","NumberFormat"];
thx_format_NumberFormat.binary = function(f,significantDigits,culture) {
	if(significantDigits == null) significantDigits = 1;
	var nf = thx_format_NumberFormat.numberFormat(culture);
	if(isNaN(f)) return nf.symbolNaN;
	if(!isFinite(f)) if(f < 0) return nf.symbolNegativeInfinity; else return nf.symbolPositiveInfinity;
	if(significantDigits == 0 && f == 0) return ""; else return StringTools.lpad(thx_format_NumberFormat.toBase(f | 0,2,culture),"0",significantDigits);
};
thx_format_NumberFormat.currency = function(f,precision,symbol,culture) {
	var nf = thx_format_NumberFormat.numberFormat(culture);
	if(isNaN(f)) return nf.symbolNaN;
	if(!isFinite(f)) if(f < 0) return nf.symbolNegativeInfinity; else return nf.symbolPositiveInfinity;
	var pattern;
	if(f < 0) pattern = thx_culture_Pattern.currencyNegatives[nf.patternNegativeCurrency]; else pattern = thx_culture_Pattern.currencyPositives[nf.patternPositiveCurrency];
	var formatted = thx_format_NumberFormat.value(f,(function($this) {
		var $r;
		var t;
		{
			var _0 = precision;
			if(null == _0) t = null; else t = _0;
		}
		$r = t != null?t:nf.decimalDigitsCurrency;
		return $r;
	}(this)),nf.symbolNaN,nf.symbolNegativeInfinity,nf.symbolPositiveInfinity,nf.groupSizesCurrency,nf.separatorGroupCurrency,nf.separatorDecimalCurrency);
	return StringTools.replace(StringTools.replace(pattern,"n",formatted),"$",(function($this) {
		var $r;
		var t1;
		{
			var _01 = symbol;
			if(null == _01) t1 = null; else t1 = _01;
		}
		$r = t1 != null?t1:nf.symbolCurrency;
		return $r;
	}(this)));
};
thx_format_NumberFormat.customFormat = function(f,pattern,culture) {
	var nf = thx_format_NumberFormat.numberFormat(culture);
	if(isNaN(f)) return nf.symbolNaN;
	if(!isFinite(f)) if(f < 0) return nf.symbolNegativeInfinity; else return nf.symbolPositiveInfinity;
	var isCurrency = thx_format_NumberFormat.hasSymbols(pattern,"$");
	var isPercent = !isCurrency && thx_format_NumberFormat.hasSymbols(pattern,"%‰");
	var groups = thx_format_NumberFormat.splitPattern(pattern,";");
	if(groups.length > 3) throw "invalid number of sections in \"" + pattern + "\"";
	if(f < 0) {
		if(null != groups[1]) return thx_format_NumberFormat.customFormatF(-f,groups[1],nf,isCurrency,isPercent); else return thx_format_NumberFormat.customFormatF(-f,"-" + groups[0],nf,isCurrency,isPercent);
	} else if(f > 0) return thx_format_NumberFormat.customFormatF(f,groups[0],nf,isCurrency,isPercent); else return thx_format_NumberFormat.customFormatF(0,(function($this) {
		var $r;
		var t;
		{
			var _0 = groups;
			var _1;
			if(null == _0) t = null; else if(null == (_1 = _0[2])) t = null; else t = _1;
		}
		$r = t != null?t:groups[0];
		return $r;
	}(this)),nf,isCurrency,isPercent);
};
thx_format_NumberFormat.decimal = function(f,significantDigits,culture) {
	if(significantDigits == null) significantDigits = 1;
	var nf = thx_format_NumberFormat.numberFormat(culture);
	if(isNaN(f)) return nf.symbolNaN;
	if(!isFinite(f)) if(f < 0) return nf.symbolNegativeInfinity; else return nf.symbolPositiveInfinity;
	var formatted = thx_format_NumberFormat.value(f,0,nf.symbolNaN,nf.symbolNegativeInfinity,nf.symbolPositiveInfinity,[0],"","");
	return (f < 0?nf.signNegative:"") + StringTools.lpad(formatted,"0",significantDigits);
};
thx_format_NumberFormat.exponential = function(f,precision,digits,symbol,culture) {
	if(symbol == null) symbol = "e";
	if(digits == null) digits = 3;
	if(precision == null) precision = 6;
	var nf = thx_format_NumberFormat.numberFormat(culture);
	if(isNaN(f)) return nf.symbolNaN;
	if(!isFinite(f)) if(f < 0) return nf.symbolNegativeInfinity; else return nf.symbolPositiveInfinity;
	var info = thx_format_NumberFormat.exponentialInfo(f);
	return thx_format_NumberFormat.number(info.f,precision,culture) + symbol + (info.e < 0?nf.signNegative:nf.signPositive) + StringTools.lpad("" + thx_core_Ints.abs(info.e),"0",digits);
};
thx_format_NumberFormat.fixed = function(f,precision,culture) {
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
	}(this)),nf.symbolNaN,nf.symbolNegativeInfinity,nf.symbolPositiveInfinity,[0],"",nf.separatorDecimalNumber);
	return StringTools.replace(pattern,"n",formatted);
};
thx_format_NumberFormat.format = function(f,pattern,culture) {
	var specifier = pattern.substring(0,1);
	var param = thx_format_NumberFormat.paramOrNull(pattern.substring(1));
	switch(specifier) {
	case "C":case "c":
		return thx_format_NumberFormat.currency(f,param,null,culture);
	case "D":case "d":
		return thx_format_NumberFormat.decimal(f,param,culture);
	case "E":
		return thx_format_NumberFormat.exponential(f,param,null,null,culture);
	case "e":
		return thx_format_NumberFormat.exponential(f,param,null,null,culture).toLowerCase();
	case "F":case "f":
		return thx_format_NumberFormat.fixed(f,param,culture);
	case "G":
		return thx_format_NumberFormat.general(f,param,culture);
	case "g":
		return thx_format_NumberFormat.general(f,param,culture).toLowerCase();
	case "N":case "n":
		return thx_format_NumberFormat.number(f,param,culture);
	case "P":case "p":
		return thx_format_NumberFormat.percent(f,param,culture);
	case "R":case "r":
		return "" + f;
	case "X":
		return thx_format_NumberFormat.hex(f,param,culture).toUpperCase();
	case "x":
		return thx_format_NumberFormat.hex(f,param,culture);
	case "%":
		return thx_format_NumberFormat.printf(f,pattern,culture);
	default:
		return thx_format_NumberFormat.customFormat(f,pattern,culture);
	}
};
thx_format_NumberFormat.general = function(f,significantDigits,culture) {
	var e = thx_format_NumberFormat.exponential(f,significantDigits,null,null,culture);
	var f1 = thx_format_NumberFormat.fixed(f,significantDigits,culture);
	if(e.length < f1.length) return e; else return f1;
};
thx_format_NumberFormat.hex = function(f,significantDigits,culture) {
	if(significantDigits == null) significantDigits = 1;
	var nf = thx_format_NumberFormat.numberFormat(culture);
	if(isNaN(f)) return nf.symbolNaN;
	if(!isFinite(f)) if(f < 0) return nf.symbolNegativeInfinity; else return nf.symbolPositiveInfinity;
	if(significantDigits == 0 && f == 0) return ""; else return StringTools.lpad(thx_format_NumberFormat.toBase(f | 0,16,culture),"0",significantDigits);
};
thx_format_NumberFormat.integer = function(f,culture) {
	var nf = thx_format_NumberFormat.numberFormat(culture);
	if(isNaN(f)) return nf.symbolNaN;
	if(!isFinite(f)) if(f < 0) return nf.symbolNegativeInfinity; else return nf.symbolPositiveInfinity;
	return thx_format_NumberFormat.number(f,0,culture);
};
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
thx_format_NumberFormat.octal = function(f,significantDigits,culture) {
	if(significantDigits == null) significantDigits = 1;
	var nf = thx_format_NumberFormat.numberFormat(culture);
	if(isNaN(f)) return nf.symbolNaN;
	if(!isFinite(f)) if(f < 0) return nf.symbolNegativeInfinity; else return nf.symbolPositiveInfinity;
	if(significantDigits == 0 && f == 0) return ""; else return StringTools.lpad(thx_format_NumberFormat.toBase(f | 0,8,culture),"0",significantDigits);
};
thx_format_NumberFormat.percent = function(f,decimals,culture) {
	var nf = thx_format_NumberFormat.numberFormat(culture);
	if(isNaN(f)) return nf.symbolNaN;
	if(!isFinite(f)) if(f < 0) return nf.symbolNegativeInfinity; else return nf.symbolPositiveInfinity;
	return thx_format_NumberFormat.unit(f * 100,(function($this) {
		var $r;
		var t;
		{
			var _0 = decimals;
			if(null == _0) t = null; else t = _0;
		}
		$r = t != null?t:nf.decimalDigitsPercent;
		return $r;
	}(this)),nf.symbolPercent,culture);
};
thx_format_NumberFormat.permille = function(f,decimals,culture) {
	var nf = thx_format_NumberFormat.numberFormat(culture);
	if(isNaN(f)) return nf.symbolNaN;
	if(!isFinite(f)) if(f < 0) return nf.symbolNegativeInfinity; else return nf.symbolPositiveInfinity;
	return thx_format_NumberFormat.unit(f * 1000,(function($this) {
		var $r;
		var t;
		{
			var _0 = decimals;
			if(null == _0) t = null; else t = _0;
		}
		$r = t != null?t:nf.decimalDigitsPercent;
		return $r;
	}(this)),nf.symbolPermille,culture);
};
thx_format_NumberFormat.printf = function(f,pattern,culture) {
	if(!StringTools.startsWith(pattern,"%")) throw "invalid printf term \"" + pattern + "\"";
	var specifier = pattern.substring(pattern.length - 1);
	var p = pattern.substring(1,pattern.length - 1).split(".");
	var precision;
	if(null == p[1] || "" == p[1]) precision = null; else precision = Std.parseInt(p[1]);
	var justifyRight = true;
	var negativeSignOnly = true;
	var emptySpaceForSign = false;
	var prefix = false;
	var padding = " ";
	var width = 0;
	var flags = p[0];
	while(flags.length > 0) {
		var _g = flags.substring(0,1);
		var d = _g;
		switch(_g) {
		case "-":
			justifyRight = false;
			break;
		case "+":
			negativeSignOnly = false;
			break;
		case " ":
			emptySpaceForSign = true;
			break;
		case "#":
			prefix = true;
			break;
		case "0":
			padding = "0";
			break;
		default:
			if(thx_core_Ints.canParse(d)) {
				width = thx_core_Ints.parse(flags);
				flags = "";
				continue;
			} else throw "invalid flags " + flags;
		}
		flags = flags.substring(1);
	}
	var decorate = function(s,f1,p1,ns,ps) {
		if(prefix) s = p1 + s;
		if(f1 < 0) s = ns + s; else if(!negativeSignOnly) s = ps + s; else if(emptySpaceForSign) s = " " + s;
		if(justifyRight) return StringTools.lpad(s,padding,width); else return StringTools.rpad(s,padding,width);
	};
	var nf = thx_format_NumberFormat.numberFormat(culture);
	switch(specifier) {
	case "b":
		return decorate(thx_core_Ints.toString(thx_core_Ints.abs(f | 0),2),1,"b","","");
	case "B":
		return decorate(thx_core_Ints.toString(thx_core_Ints.abs(f | 0),2),1,"B","","");
	case "c":
		return decorate(String.fromCharCode(thx_core_Ints.abs(f | 0)),1,"","","");
	case "d":case "i":
		return decorate(StringTools.lpad("" + Math.round(f),"0",(function($this) {
			var $r;
			var t;
			{
				var _0 = precision;
				if(null == _0) t = null; else t = _0;
			}
			$r = t != null?t:0;
			return $r;
		}(this))),f,"",nf.signNegative,nf.signPositive);
	case "e":
		return decorate(thx_format_NumberFormat.exponential(Math.abs(f),precision,0,"e",culture),f,"",nf.signNegative,nf.signPositive);
	case "E":
		return decorate(thx_format_NumberFormat.exponential(Math.abs(f),precision,0,"E",culture),f,"",nf.signNegative,nf.signPositive);
	case "f":
		return decorate(thx_format_NumberFormat.fixed(Math.abs(f),precision,culture),f,"",nf.signNegative,nf.signPositive);
	case "g":
		var e = thx_format_NumberFormat.printf(f,"e",culture);
		var f2 = thx_format_NumberFormat.printf(f,"f",culture);
		if(e.length < f2.length) return e; else return f2;
		break;
	case "G":
		var e1 = thx_format_NumberFormat.printf(f,"E",culture);
		var f3 = thx_format_NumberFormat.printf(f,"f",culture);
		if(e1.length < f3.length) return e1; else return f3;
		break;
	case "u":
		return thx_format_NumberFormat.printf(Math.abs(f),"d",culture);
	case "x":
		return decorate(thx_format_NumberFormat.hex(Math.abs(f),precision,culture),f,"0x",nf.signNegative,nf.signPositive);
	case "X":
		return decorate(thx_format_NumberFormat.hex(Math.abs(f),precision,culture),f,"0X",nf.signNegative,nf.signPositive);
	case "o":
		return decorate(thx_format_NumberFormat.octal(Math.abs(f),precision,culture),f,"0",nf.signNegative,nf.signPositive);
	case "%":
		return decorate("%",1,"","","");
	default:
		throw "invalid pattern \"" + pattern + "\"";
	}
};
thx_format_NumberFormat.toBase = function(value,base,culture) {
	var nf = thx_format_NumberFormat.numberFormat(culture);
	return StringTools.replace(value.toString(base),"-",nf.signNegative);
};
thx_format_NumberFormat.unit = function(f,decimals,unitSymbol,culture) {
	var nf = thx_format_NumberFormat.numberFormat(culture);
	if(isNaN(f)) return nf.symbolNaN;
	if(!isFinite(f)) if(f < 0) return nf.symbolNegativeInfinity; else return nf.symbolPositiveInfinity;
	var pattern;
	if(f < 0) pattern = thx_culture_Pattern.percentNegatives[nf.patternNegativePercent]; else pattern = thx_culture_Pattern.percentPositives[nf.patternPositivePercent];
	var formatted = thx_format_NumberFormat.value(f,decimals,nf.symbolNaN,nf.symbolNegativeInfinity,nf.symbolPositiveInfinity,nf.groupSizesPercent,nf.separatorGroupPercent,nf.separatorDecimalPercent);
	return StringTools.replace(StringTools.replace(pattern,"n",formatted),"%",unitSymbol);
};
thx_format_NumberFormat.countSymbols = function(pattern,symbols) {
	var i = 0;
	var quote = 0;
	var count = 0;
	while(i < pattern.length) {
		{
			var _g = pattern.substring(i,i + 1);
			var s = _g;
			switch(_g) {
			case "\\":
				i++;
				break;
			case "'":
				switch(quote) {
				case 1:
					quote = 0;
					break;
				case 0:
					quote = 1;
					break;
				default:
				}
				break;
			case "\"":
				switch(quote) {
				case 2:
					quote = 0;
					break;
				case 0:
					quote = 2;
					break;
				default:
				}
				break;
			default:
				switch(quote) {
				case 0:
					if(symbols.indexOf(s) >= 0) ++count; else {
					}
					break;
				default:
				}
			}
		}
		i++;
	}
	return count;
};
thx_format_NumberFormat.customFormatDecimalFraction = function(d,pattern,nf) {
	var buf = "";
	var i = 0;
	var quote = 0;
	var p = d.split("");
	var last = 0;
	while(i < pattern.length) {
		{
			var _g = pattern.substring(i,i + 1);
			var c = _g;
			var c1 = _g;
			switch(_g) {
			case "\\":
				i++;
				buf += pattern.substring(i,i + 1);
				break;
			case "\"":
				switch(quote) {
				case 0:
					quote = 2;
					break;
				case 2:
					quote = 0;
					break;
				case 1:
					buf += c;
					break;
				default:
					buf += c1;
				}
				break;
			case "'":
				switch(quote) {
				case 0:
					quote = 1;
					break;
				case 1:
					quote = 0;
					break;
				case 2:
					buf += c;
					break;
				default:
					buf += c1;
				}
				break;
			case "0":
				switch(quote) {
				case 1:case 2:
					buf += c;
					break;
				case 0:
					last = buf.length;
					if(p.length == 0) buf += "0"; else buf += p.shift();
					break;
				default:
					buf += c1;
				}
				break;
			case "#":
				switch(quote) {
				case 1:case 2:
					buf += c;
					break;
				case 0:
					last = buf.length;
					if(p.length == 0) buf += ""; else buf += p.shift();
					break;
				default:
					buf += c1;
				}
				break;
			case "$":
				switch(quote) {
				case 1:case 2:
					buf += c;
					break;
				case 0:
					buf += nf.symbolCurrency;
					break;
				default:
					buf += c1;
				}
				break;
			case "%":
				switch(quote) {
				case 1:case 2:
					buf += c;
					break;
				case 0:
					buf += nf.symbolPercent;
					break;
				default:
					buf += c1;
				}
				break;
			case "‰":
				switch(quote) {
				case 1:case 2:
					buf += c;
					break;
				case 0:
					buf += nf.symbolPermille;
					break;
				default:
					buf += c1;
				}
				break;
			default:
				switch(quote) {
				case 1:case 2:
					buf += c;
					break;
				default:
					buf += c1;
				}
			}
		}
		i++;
	}
	return buf;
};
thx_format_NumberFormat.customFormatF = function(f,pattern,nf,isCurrency,isPercent) {
	if(isPercent) if(thx_format_NumberFormat.hasSymbols(pattern,"‰")) f *= 1000; else f *= 100;
	var exp = thx_format_NumberFormat.splitPattern(pattern,"eE");
	if(exp.length > 1) {
		var info = thx_format_NumberFormat.exponentialInfo(f);
		var symbol = pattern.substring(exp[0].length,exp[0].length + 1);
		var forceSign = StringTools.startsWith(exp[1],"+");
		if(forceSign || StringTools.startsWith(exp[1],"-")) exp[1] = exp[1].substring(1);
		return thx_format_NumberFormat.customIntegerAndFraction(info.f,exp[0],nf,isCurrency,isPercent) + symbol + (info.e < 0?nf.signNegative:forceSign?nf.signPositive:"") + thx_format_NumberFormat.customFormatInteger("" + Math.abs(info.e),exp[1],nf,isCurrency,isPercent);
		return thx_format_NumberFormat.customIntegerAndFraction(f,exp[0],nf,isCurrency,isPercent) + symbol + thx_format_NumberFormat.customFormatInteger("" + f,exp[1],nf,isCurrency,isPercent);
	} else return thx_format_NumberFormat.customIntegerAndFraction(f,pattern,nf,isCurrency,isPercent);
};
thx_format_NumberFormat.customFormatInteger = function(v,pattern,nf,isCurrency,isPercent) {
	var buf = [];
	var i = 0;
	var quote = 0;
	var p = v.split("");
	var lbuf = "";
	var first = true;
	var useGroups = false;
	var zeroes = 0;
	while(i < pattern.length) {
		{
			var _g = pattern.substring(i,i + 1);
			var c = _g;
			var c1 = _g;
			switch(_g) {
			case "\\":
				i++;
				buf.push(thx_format__$NumberFormat_CustomFormat.Literal(pattern.substring(i,i + 1)));
				break;
			case "\"":
				switch(quote) {
				case 0:
					quote = 2;
					break;
				case 2:
					quote = 0;
					buf.push(thx_format__$NumberFormat_CustomFormat.Literal(lbuf));
					lbuf = "";
					break;
				case 1:
					lbuf += c;
					break;
				default:
					buf.push(thx_format__$NumberFormat_CustomFormat.Literal(c1));
				}
				break;
			case "'":
				switch(quote) {
				case 0:
					quote = 1;
					break;
				case 1:
					quote = 0;
					buf.push(thx_format__$NumberFormat_CustomFormat.Literal(lbuf));
					lbuf = "";
					break;
				case 2:
					lbuf += c;
					break;
				default:
					buf.push(thx_format__$NumberFormat_CustomFormat.Literal(c1));
				}
				break;
			case ",":
				switch(quote) {
				case 1:case 2:
					lbuf += c;
					break;
				case 0:
					useGroups = true;
					break;
				default:
					buf.push(thx_format__$NumberFormat_CustomFormat.Literal(c1));
				}
				break;
			case "0":
				switch(quote) {
				case 1:case 2:
					lbuf += c;
					break;
				case 0:
					buf.push(thx_format__$NumberFormat_CustomFormat.Zero(first));
					first = false;
					zeroes++;
					break;
				default:
					buf.push(thx_format__$NumberFormat_CustomFormat.Literal(c1));
				}
				break;
			case "#":
				switch(quote) {
				case 1:case 2:
					lbuf += c;
					break;
				case 0:
					buf.push(thx_format__$NumberFormat_CustomFormat.Hash(first));
					first = false;
					break;
				default:
					buf.push(thx_format__$NumberFormat_CustomFormat.Literal(c1));
				}
				break;
			case "$":
				switch(quote) {
				case 1:case 2:
					lbuf += c;
					break;
				case 0:
					buf.push(thx_format__$NumberFormat_CustomFormat.Literal(nf.symbolCurrency));
					break;
				default:
					buf.push(thx_format__$NumberFormat_CustomFormat.Literal(c1));
				}
				break;
			case "%":
				switch(quote) {
				case 1:case 2:
					lbuf += c;
					break;
				case 0:
					buf.push(thx_format__$NumberFormat_CustomFormat.Literal(nf.symbolPercent));
					break;
				default:
					buf.push(thx_format__$NumberFormat_CustomFormat.Literal(c1));
				}
				break;
			case "‰":
				switch(quote) {
				case 1:case 2:
					lbuf += c;
					break;
				case 0:
					buf.push(thx_format__$NumberFormat_CustomFormat.Literal(nf.symbolPermille));
					break;
				default:
					buf.push(thx_format__$NumberFormat_CustomFormat.Literal(c1));
				}
				break;
			default:
				switch(quote) {
				case 1:case 2:
					lbuf += c;
					break;
				default:
					buf.push(thx_format__$NumberFormat_CustomFormat.Literal(c1));
				}
			}
		}
		i++;
	}
	if(lbuf.length > 0) buf.push(thx_format__$NumberFormat_CustomFormat.Literal(lbuf));
	var _g1 = p.length;
	while(_g1 < zeroes) {
		var i1 = _g1++;
		p.unshift("0");
	}
	if(useGroups) {
		i = p.length - 1;
		var groups;
		if(isCurrency) groups = nf.groupSizesCurrency.slice(); else if(isPercent) groups = nf.groupSizesPercent.slice(); else groups = nf.groupSizesNumber.slice();
		var group = groups.shift();
		var pos = 0;
		while(i >= 0) {
			if(group == 0) break;
			if(pos == group) {
				p[i] = p[i] + (isCurrency?nf.separatorGroupCurrency:isPercent?nf.separatorGroupPercent:nf.separatorGroupNumber);
				pos = 0;
				if(groups.length > 0) group = groups.shift();
			} else {
				pos++;
				i--;
			}
		}
	}
	buf.reverse();
	var r = buf.map(function(_) {
		switch(_[1]) {
		case 0:
			var s = _[2];
			return s;
		case 1:
			var first1 = _[2];
			if(p.length == 0) return ""; else if(first1) return p.join(""); else return p.pop();
			break;
		case 2:
			var first2 = _[2];
			if(first2) return p.join(""); else return p.pop();
			break;
		}
	});
	r.reverse();
	return r.join("");
};
thx_format_NumberFormat.customIntegerAndFraction = function(f,pattern,nf,isCurrency,isPercent) {
	var p = thx_format_NumberFormat.splitPattern(pattern,".");
	var power = p[0].length - (p[0] = thx_core_Strings.trimCharsRight(p[0],",")).length;
	f /= Math.pow(1000,power);
	if(p.length == 1) return thx_format_NumberFormat.customFormatInteger("" + Math.round(f),p[0],nf,isCurrency,isPercent); else {
		f = thx_core_Floats.roundTo(f,thx_format_NumberFormat.countSymbols(p[1],"#0"));
		var np = thx_format_NumberFormat.splitOnDecimalSeparator(f);
		return thx_format_NumberFormat.customFormatInteger(np[0],p[0],nf,isCurrency,isPercent) + (isCurrency?nf.separatorDecimalCurrency:isPercent?nf.separatorDecimalPercent:nf.separatorDecimalNumber) + thx_format_NumberFormat.customFormatDecimalFraction((function($this) {
			var $r;
			var t;
			{
				var _0 = np;
				var _1;
				if(null == _0) t = null; else if(null == (_1 = _0[1])) t = null; else t = _1;
			}
			$r = t != null?t:"0";
			return $r;
		}(this)),p[1],nf);
	}
};
thx_format_NumberFormat.exponentialInfo = function(f) {
	var s = ("" + Math.abs(f)).toLowerCase();
	var pose = s.indexOf("e");
	var p;
	var e;
	if(pose > 0) {
		p = s.substring(0,pose).split(".");
		e = thx_core_Ints.parse(s.substring(pose + 1));
	} else {
		p = s.split(".").concat([""]);
		e = 0;
		if(p[0].length > 1) {
			e = p[0].length - 1;
			p[1] = p[0].substring(1) + p[1];
			p[0] = p[0].substring(0,1);
		} else if(p[0] == "0") {
			e = -(1 + p[1].length - thx_core_Strings.trimCharsLeft(p[1],"0").length);
			p[1] = p[1].substring(-e - 1);
			p[0] = p[1].substring(0,1);
			p[1] = p[1].substring(1);
		}
	}
	return { e : e, f : (f < 0?-1:1) * Std.parseFloat(p.slice(0,2).join("."))};
};
thx_format_NumberFormat.hasSymbols = function(pattern,symbols) {
	var i = 0;
	var quote = 0;
	while(i < pattern.length) {
		{
			var _g = pattern.substring(i,i + 1);
			var s = _g;
			switch(_g) {
			case "\\":
				i++;
				break;
			case "'":
				switch(quote) {
				case 1:
					quote = 0;
					break;
				case 0:
					quote = 1;
					break;
				default:
				}
				break;
			case "\"":
				switch(quote) {
				case 2:
					quote = 0;
					break;
				case 0:
					quote = 2;
					break;
				default:
				}
				break;
			default:
				switch(quote) {
				case 0:
					if(symbols.indexOf(s) >= 0) return true; else {
					}
					break;
				default:
				}
			}
		}
		i++;
	}
	return false;
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
thx_format_NumberFormat.paramOrNull = function(param) {
	if(param.length == 0) return null; else return Std.parseInt(param);
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
thx_format_NumberFormat.splitPattern = function(pattern,separator) {
	var pos = [];
	var i = 0;
	var quote = 0;
	while(i < pattern.length) {
		{
			var _g = pattern.substring(i,i + 1);
			var s = _g;
			switch(_g) {
			case "\\":
				i++;
				break;
			case "'":
				switch(quote) {
				case 1:
					quote = 0;
					break;
				case 0:
					quote = 1;
					break;
				default:
				}
				break;
			case "\"":
				switch(quote) {
				case 2:
					quote = 0;
					break;
				case 0:
					quote = 2;
					break;
				default:
				}
				break;
			default:
				switch(quote) {
				case 0:
					if(separator.indexOf(s) >= 0) pos.push(i); else {
					}
					break;
				default:
				}
			}
		}
		i++;
	}
	var buf = [];
	var prev = 0;
	var _g1 = 0;
	while(_g1 < pos.length) {
		var p = pos[_g1];
		++_g1;
		buf.push(pattern.substring(prev,p));
		prev = p + 1;
	}
	buf.push(pattern.substring(prev));
	return buf;
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
var thx_format__$NumberFormat_CustomFormat = { __ename__ : ["thx","format","_NumberFormat","CustomFormat"], __constructs__ : ["Literal","Hash","Zero"] };
thx_format__$NumberFormat_CustomFormat.Literal = function(s) { var $x = ["Literal",0,s]; $x.__enum__ = thx_format__$NumberFormat_CustomFormat; return $x; };
thx_format__$NumberFormat_CustomFormat.Hash = function(first) { var $x = ["Hash",1,first]; $x.__enum__ = thx_format__$NumberFormat_CustomFormat; return $x; };
thx_format__$NumberFormat_CustomFormat.Zero = function(first) { var $x = ["Zero",2,first]; $x.__enum__ = thx_format__$NumberFormat_CustomFormat; return $x; };
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
thx_math_random__$Random_Random_$Impl_$.between = function(this1,min,max) {
	return Math.floor(this1["float"]() * (1 + max - min)) + min;
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
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
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
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
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
if(Array.prototype.filter == null) Array.prototype.filter = function(f1) {
	var a1 = [];
	var _g11 = 0;
	var _g2 = this.length;
	while(_g11 < _g2) {
		var i1 = _g11++;
		var e = this[i1];
		if(f1(e)) a1.push(e);
	}
	return a1;
};
var __map_reserved = {}

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
fly_Config.width = 660;
fly_Config.height = 440;
fly_Config.columns = [0,3,6,6,9,9,9,9,12,12,12,12,12,12,15,15,15,15,15,15,15,18];
fly_Game.ONE_DEGREE = Math.PI / 180;
fly_Game.edibleFly = new fly_components_Edible(true,true,50,true);
fly_Game.edibleFlower = new fly_components_Edible(true,true,10,false);
fly_components_Explosion.maxStage = 30;
fly_components_Explosion.peak = 20;
fly_components_Explosion.radius = 50;
fly_components_Detonation.instance = new fly_components_Detonation(fly_components_Explosion.radius);
fly_components_Droplet.maxLife = 300;
fly_systems_MazeCollision.E = 0.00001;
haxe_ds_ObjectMap.count = 0;
js_Boot.__toStr = {}.toString;
minicanvas_MiniCanvas.displayGenerationTime = false;
minicanvas_BrowserCanvas._backingStoreRatio = 0;
minicanvas_BrowserCanvas.attachKeyEventsToCanvas = false;
minicanvas_BrowserCanvas.defaultScaleMode = minicanvas_ScaleMode.Auto;
minicanvas_BrowserCanvas.parentNode = typeof document != 'undefined' && document.body;
minicanvas_NodeCanvas.defaultScaleMode = minicanvas_ScaleMode.NoScale;
minicanvas_NodeCanvas.imagePath = "images";
thx_color__$Grey_Grey_$Impl_$.black = 0;
thx_color__$Grey_Grey_$Impl_$.white = 1;
thx_color_parse_ColorParser.parser = new thx_color_parse_ColorParser();
thx_color_parse_ColorParser.isPureHex = new EReg("^([0-9a-f]{2}){3,4}$","i");
thx_core_Floats.TOLERANCE = 10e-5;
thx_core_Floats.EPSILON = 10e-10;
thx_core_Floats.pattern_parse = new EReg("^(\\+|-)?\\d+(\\.\\d+)?(e-?\\d+)?$","");
thx_core_Ints.pattern_parse = new EReg("^[+-]?(\\d+|0x[0-9A-F]+)$","i");
thx_core_Ints.BASE = "0123456789abcdefghijklmnopqrstuvwxyz";
thx_core_Strings.UCWORDS = new EReg("[^a-zA-Z]([a-z])","g");
thx_core_Strings.UCWORDSWS = new EReg("\\s[a-z]","g");
thx_core_Strings.ALPHANUM = new EReg("^[a-z0-9]+$","i");
thx_core_Strings.DIGITS = new EReg("^[0-9]+$","");
thx_core_Strings.STRIPTAGS = new EReg("</?[a-z]+[^>]*?/?>","gi");
thx_core_Strings.WSG = new EReg("\\s+","g");
thx_core_Strings.SPLIT_LINES = new EReg("\r\n|\n\r|\n|\r","g");
thx_core_Timer.FRAME_RATE = Math.round(16.6666666666666679);
thx_culture_DateFormatInfo.invariant = new thx_culture_DateFormatInfo(0,"FirstDay","AM","PM",0,"Sunday","Gregorian",null,["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],["Su","Mo","Tu","We","Th","Fr","Sa"],["January","February","March","April","May","June","July","August","September","October","November","December",""],["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",""],["January","February","March","April","May","June","July","August","September","October","November","December",""],["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",""],"dddd, dd MMMM yyyy","MM/dd/yyyy","dddd, dd MMMM yyyy HH:mm:ss","yyyy'-'MM'-'dd'T'HH':'mm':'ss","MMMM dd","ddd, dd MMM yyyy HH':'mm':'ss 'GMT'","HH:mm:ss","HH:mm","yyyy'-'MM'-'dd HH':'mm':'ss'Z'","yyyy MMMM","/",":");
thx_culture_NumberFormatInfo.invariant = new thx_culture_NumberFormatInfo(2,2,2,[3],[3],[3],0,1,0,0,0,".",".",".",",",",",",","-","+","¤","NaN","-Infinity","%","‰","Infinity");
thx_culture_Culture.invariant = new thx_culture_Culture("",thx_culture_DateFormatInfo.invariant,"",false,"iv","IVL",false,127,"Gregorian","Invariant Language","Invariant Language","Invariant Country","Invariant Country",thx_culture_NumberFormatInfo.invariant,",","IVL");
thx_culture_Pattern.currencyNegatives = ["($n)","-$n","$-n","$n-","(n$)","-n$","n-$","n$-","-n $","-$ n","n $-","$ n-","$ -n","n- $","($ n)","(n $)"];
thx_culture_Pattern.currencyPositives = ["$n","n$","$ n","n $"];
thx_culture_Pattern.numberNegatives = ["(n)","-n","- n","n-","n -"];
thx_culture_Pattern.percentNegatives = ["-n %","-n%","-%n","%-n","%n-","n-%","n%-","-%n","n %-","% n-","% -n","n- %"];
thx_culture_Pattern.percentPositives = ["n %","n%","%n","% n"];
thx_format_NumberFormat.BASE = "0123456789abcdefghijklmnopqrstuvwxyz";
Main.main();
})(typeof console != "undefined" ? console : {log:function(){}});
