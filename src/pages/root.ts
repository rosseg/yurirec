import Page from "../page";

import RootHTML from "./root.html";
import "./root.scss";

import items from "../items.json";
import Template from "../util/template";
import article from "./article.html";
import Consolidator from "../consolidator";


// add my spoiler div to text if there's the ||spoiler||
function convertText(desc : string) : string{
	while (true){
		let x = desc.indexOf("||");
		if (x != -1){
			let r = desc.indexOf("||", x+2);
			let contents = desc.substring(x + 2, r);
			
			desc = desc.substring(0, x) + "<span class=\"spoiler\">"+contents+"</span>" + desc.substring(r + 2);
			break;
		}else{
			break;
		}
	}
	return desc;
}

// converts "yuri text" to "yuri-text" so that I can apply special effects- like the lesbian flag
function makeSafeForCSS(name) {
    return name.replace(/[^a-z0-9]/g, function(s) {
        var c = s.charCodeAt(0);
        if (c == 32) return '-';
        if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
        return '__' + ('000' + c.toString(16)).slice(-4);
    });
}

export default class Root extends Page{
	constructor(){
		super(RootHTML);
		// load all previous settings
		this.landmines = JSON.parse(localStorage.getItem("landmines")) ?? {};
		this.targets = JSON.parse(localStorage.getItem("recomms")) ?? {};
		this.tags = JSON.parse(localStorage.getItem("tags")) ?? {};
		this.status = JSON.parse(localStorage.getItem("status")) ?? {};
		this.length = JSON.parse(localStorage.getItem("length")) ?? {};
		this.type = JSON.parse(localStorage.getItem("type")) ?? {};
		this.pairings = JSON.parse(localStorage.getItem("pairings")) ?? {};
		this.preferredLanguage = localStorage.getItem("preferredLanguage") ?? "en";
		this.rating = localStorage.getItem("rating") ?? "uniqueness";
		let ratingDir = localStorage.getItem("ratingDir");
		// up or down
		this.ratingDir = (ratingDir == "1" || ratingDir == "-1") ? Number(ratingDir) : 1;

		this.SetElements();
		this.SetFilters();

		// how far am I adding my list
		this.Element.querySelector<HTMLDivElement>(".progress").innerText = "progress: "+items.length + " / 289";

		// mobile only
		this.OnSwipe(()=>{
			this.Element.querySelector("aside").classList.remove("show");
		}, ()=>{
			this.Element.querySelector("aside").classList.add("show");
		})
		
		let headers = Array.from(this.Element.querySelectorAll("aside h2"));
		for (let head of headers){
			let className = head.className;
			const elem = this.Element.querySelector(".list."+className);
			if (localStorage.getItem("cat"+className) == "true" || localStorage.getItem("cat"+className) == null){
				elem.classList.add("show");
			}
			head.addEventListener("click", ()=>{
				elem.classList.toggle("show");
				head.classList.toggle("show", elem.classList.contains("show"));
				localStorage.setItem("cat"+className, ""+elem.classList.contains("show"))
			});
			head.classList.toggle("show", elem.classList.contains("show"));
		}
		let close = ()=>{
			this.Element.querySelector(".qna").classList.toggle("show")
		}
		this.Element.querySelector("aside .questions").addEventListener("click",close)
		this.Element.querySelector(".qna").addEventListener("click",(ev)=>{
			if (ev.target == this.Element.querySelector(".qna")){
				close();
			}
		});
		this.Element.querySelector(".qna .close").addEventListener("click",close);
	}


	// swiping tracker
	lastA : any;
    lastB : any;
	OnSwipe(onLeft? : (()=>void) | undefined, onRight? : (()=>void) | undefined){
		let touchstartX = 0
		let touchstartY = 0;
		let range = 40;

		document.removeEventListener('touchstart', this.lastA);

		document.removeEventListener('touchend', this.lastB);
		this.lastA = (e) => {
			//e.preventDefault();
			touchstartX = e.changedTouches[0].screenX
			touchstartY = e.changedTouches[0].screenY
		};
		this.lastB  = e => {
			let touchendX = e.changedTouches[0].screenX
			let touchendY = e.changedTouches[0].screenY
			let deltaX = touchstartX - touchendX;
			let deltaY = touchstartY - touchendY
			if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) < range){
				return;
			}
			if (Math.abs(deltaX) > Math.abs(deltaY)){
				// e.preventDefault();
				if (deltaX > 0) onLeft ? onLeft() : undefined;
				if (deltaX < 0) onRight ? onRight() : undefined;
			}
		};


		document.addEventListener('touchstart', this.lastA);
		document.addEventListener('touchend', this.lastB);
	}

	// on/off/nothing
	landmines : {[key:string] : "active" | "removed"} = {};
	tags : {[key:string] : "active" | "removed"} = {};
	targets : {[key:string] : "active" | "removed"} = {};
	status : {[key:string] : "active" | "removed"} = {};
	length : {[key:string] : "active" | "removed"} = {};
	pairings : {[key:string] : "active" | "removed"} = {};
	type : {[key:string] : "active" | "removed"} = {};

	preferredLanguage : string = "en";
	rating : string = "uniqueness";
	ratingDir : number = -1;

	
	Filter(source : any[], rkey : keyof this, inclusive : boolean = false){
		if (Object.keys(this[rkey]).length > 0){
			return source.filter((a)=>{
				let list = [];
				if (Array.isArray(a[rkey])){
					list = a[rkey];
				}else if (typeof a[rkey] === "string"){
					list = [a[rkey]];
				}else if (typeof a[rkey] === "object"){
					for (let pkey in a[rkey]){
						if (a[rkey][pkey] >= 6.0){
							list.push(pkey);
						}
					}
				}
				let actives = 0;
				let includes = 0;
				for (let key in this[rkey]){
					if (this[rkey][key] == "active"){
						includes++;
					}
					if (list.includes(key) && this[rkey][key] == "removed"){
						return false;
					}else if (list.includes(key)){
						actives++;
					}
				}
				if (inclusive){
					return actives > 0 || includes == actives;
				}
				return actives == includes;
				
			});
		}
		return source;
	}

	button(text: string, classes : string[], action? : ()=>void){
		let bur = document.createElement("button");
		bur.classList.add(...classes.map((a)=>makeSafeForCSS(a)));
		bur.innerText = text;
		if (action){
			bur.addEventListener("click", action);
		}
		return bur;
	}

	SetElements(){
		const ratings = this.Element.querySelector(".list.rating");
		ratings.classList.toggle("down", this.ratingDir == 1);
		const content = this.Element.querySelector(".content");
		content.innerHTML = "";
		let cap = items.length;
		for (let i = 0; i < 32; i++){
			//items.push(items[Math.floor(Math.random()*cap)]);
		}

		//take the list of yuri
		let cloned = items.toSorted((a, b)=>{return ((b.recommendations[this.rating] ?? 1.0) - (a.recommendations[this.rating] ?? 1.0)) * this.ratingDir; });
		
		// filter out all the irrelevant tags, blocked landmines, etc. etc. etc.
		cloned = this.Filter(cloned, "landmines");
		cloned = this.Filter(cloned, "tags");
		cloned = this.Filter(cloned, "targets");
		cloned = this.Filter(cloned, "status");
		cloned = this.Filter(cloned, "length");
		cloned = this.Filter(cloned, "pairings");
		cloned = this.Filter(cloned, "type", true);
		for (let i = 0; i < cloned.length; i++){
			const item = cloned[i];

			// create an article, using article.html as the template code
			let elem = Template.Clone(article);
			elem.classList.add("medium")
			elem.querySelector("img").src = item.image;
			elem.querySelector(".desc").innerHTML = convertText(item.description);
			elem.querySelector("h2").innerText = item.names[this.preferredLanguage] ?? item.names.en;
			elem.querySelector("h2").title = item.names[this.preferredLanguage] ?? item.names.en;
			const pairings = elem.querySelector(".pairings");
			
			pairings.append(this.button(item.type, ["type", item.type]));
			pairings.append(this.button(item.status, ["status", item.status]));
			pairings.append(this.button(item.length, ["length", item.length]));
			for (let key in item.pairings){
				let button = document.createElement("button");
				button.classList.add("pairing", makeSafeForCSS(key));
				button.innerText = item.pairings[key];
				button.title = key;
				pairings.append(button);
			}
			
			let max = 0.0;
			for (let rec in item.recommendations){
				max = Math.max(item.recommendations[rec], max);
			}
			for (let key in item.recommendations){
				if (max - item.recommendations[key] < 2.5 || key == this.rating){ 
					let rating = document.createElement("div");
					if (key == this.rating){
						rating.style.fontWeight = "bold";
					}
					rating.innerText = key+": "+item.recommendations[key];
					elem.querySelector(".ratings").append(rating)
				}
			}
			elem.querySelector("p").innerHTML = convertText(item.short);
			const tags = elem.querySelector(".tags");
			for (let tag of item.tags){
				const button = document.createElement("button");
				button.innerText = "A";
				if (tag != "romance"){
					button.innerText = tag;
				}
				button.classList.add(makeSafeForCSS(tag));
				tags.append(button);
			}
			const landmines = elem.querySelector(".landmines");
			if (item.landmines){
				for (let tag of item.landmines){
					const button = document.createElement("button");
					button.innerText = tag;
					landmines.append(button);
				}
			}
			content.append(elem);
		}
	}

	// the code the side bar for tags, landmines, etc.
	AddFilter(text : string, value : "active" | "removed" | undefined, action){
		let span = document.createElement("div");
			
		let r = document.createElement("div");
		r.className = "multi-checkbox";
		if (value){
			r.classList.add(value);
		}
		span.addEventListener("click",()=>{
			if (r.classList.contains("active")){
				r.classList.remove("active");
				r.classList.add("removed");
				action(text, "removed");
			}else if (r.classList.contains("removed")){
				r.classList.remove("removed");
				action(text, "");
			}else{
				r.classList.add("active");
				action(text, "active");
			}
		})
		
		span.append(r, document.createTextNode(text));
		return span;
	}

	// apply the filters to the yuri list, and save the changes.
	UpdateFilters(){
		this.SetElements();
		localStorage.setItem("landmines", JSON.stringify(this.landmines));
		localStorage.setItem("tags", JSON.stringify(this.tags));
		localStorage.setItem("recomms", JSON.stringify(this.targets));
		localStorage.setItem("status", JSON.stringify(this.status));
		localStorage.setItem("length", JSON.stringify(this.length));
		localStorage.setItem("pairings", JSON.stringify(this.pairings));
		localStorage.setItem("type", JSON.stringify(this.type));
		localStorage.setItem("preferredLanguage", this.preferredLanguage);
		localStorage.setItem("rating", this.rating);
		localStorage.setItem("ratingDir", ""+this.ratingDir);
	}

	SetFilters(){
		{
			const landmines = this.Element.querySelector(".list.landmines");
			const ls = Array.from(Consolidator.landmines);;
			for (let i = 0; i < ls.length; i++){
				landmines.append(this.AddFilter(ls[i], this.landmines[ls[i]] ?? undefined, (r, t)=>{
					if (t == ""){
						delete this.landmines[r];
					}else{
						this.landmines[r] = t;
					}
					this.UpdateFilters();
				}))
			}
		}
		{
			const landmines = this.Element.querySelector(".list.targets");
			const ls = Array.from(Consolidator.recomms);;
			for (let i = 0; i < ls.length; i++){
				landmines.append(this.AddFilter(ls[i], this.targets[ls[i]] ?? undefined, (r, t)=>{
					if (t == ""){
						delete this.targets[r];
					}else{
						this.targets[r] = t;
					}
					this.UpdateFilters();
				}))
			}
		}
		{
			const tags = this.Element.querySelector(".list.tags");
			const ls = Array.from(Consolidator.tags);;
			for (let i = 0; i < ls.length; i++){
				tags.append(this.AddFilter(ls[i], this.tags[ls[i]] ?? undefined, (r, t)=>{
					if (t == ""){
						delete this.tags[r];
					}else{
						this.tags[r] = t;
					}
					this.UpdateFilters();
				}))
			}
		}
		{
			const tags = this.Element.querySelector(".list.pairings");
			const ls = Array.from(Consolidator.pairings);;
			for (let i = 0; i < ls.length; i++){
				tags.append(this.AddFilter(ls[i], this.pairings[ls[i]] ?? undefined, (r, t)=>{
					if (t == ""){
						delete this.pairings[r];
					}else{
						this.pairings[r] = t;
					}
					this.UpdateFilters();
				}))
			}
		}
		{
			const tags = this.Element.querySelector(".list.length");
			const ls = Array.from(Consolidator.length);;
			for (let i = 0; i < ls.length; i++){
				tags.append(this.AddFilter(ls[i], this.length[ls[i]] ?? undefined, (r, t)=>{
					if (t == ""){
						delete this.length[r];
					}else{
						this.length[r] = t;
					}
					this.UpdateFilters();
				}))
			}
		}
		{
			const tags = this.Element.querySelector(".list.type");
			const ls = Array.from(Consolidator.type);;
			for (let i = 0; i < ls.length; i++){
				tags.append(this.AddFilter(ls[i], this.type[ls[i]] ?? undefined, (r, t)=>{
					if (t == ""){
						delete this.type[r];
					}else{
						this.type[r] = t;
					}
					this.UpdateFilters();
				}))
			}
		}
		{
			const tags = this.Element.querySelector(".list.completion");
			const ls = Array.from(Consolidator.completion);;
			for (let i = 0; i < ls.length; i++){
				tags.append(this.AddFilter(ls[i], this.status[ls[i]] ?? undefined, (r, t)=>{
					if (t == ""){
						delete this.status[r];
					}else{
						this.status[r] = t;
					}
					this.UpdateFilters();
				}))
			}
		}
		{
			const tags = this.Element.querySelector(".list.language");
			const ls = Array.from(Consolidator.languages);;
			for (let i = 0; i < ls.length; i++){
				let elem = document.createElement("div");
				elem.innerText = ls[i];
				elem.classList.toggle("active", ls[i] == this.preferredLanguage);
				elem.addEventListener("click",()=>{
					this.preferredLanguage = ls[i];
					for (let x = 0; x < tags.children.length; x++){
						tags.children[x].classList.remove("active")
					}
					elem.classList.add("active");
					this.UpdateFilters();
				})
				tags.append(elem)
			}
		}
		{
			const tags = this.Element.querySelector(".list.rating");
			const ls = Array.from(Consolidator.ratings);;
			for (let i = 0; i < ls.length; i++){
				let elem = document.createElement("div");
				elem.innerText = ls[i];
				elem.classList.toggle("active", ls[i] == this.rating);
				elem.addEventListener("click",()=>{
					if (this.rating == ls[i]){
						if (this.ratingDir == -1){
							this.rating = "";
						}else{
							this.ratingDir *= -1;
						}
					}else{
						this.rating = ls[i];
						this.ratingDir = 1;
					}
					for (let x = 0; x < tags.children.length; x++){
						tags.children[x].classList.remove("active")
					}
					if (this.rating == ls[i]){
						elem.classList.add("active");
					}
					this.UpdateFilters();
				})
				tags.append(elem)
			}
		}
	}
}