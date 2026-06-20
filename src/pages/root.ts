import Page from "../page";

import RootHTML from "./root.html";
//import "./root.scss";
import "./root.scss";
import test from "../../test.txt";

import items from "../items.json";
import Template from "../util/template";
import article from "./article.html";
import header from "./header.html";
import navbar from "./navbar.html";

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
	onlyNew : boolean = false;
	onlyUpdated : boolean = false;
	hideTags : boolean = false;
	showLandmines : boolean = false;

	toggle_filters_desktop = ()=> {		
		var isClosed = document.getElementById("root")?.classList.contains('filters-closed');
		if (isClosed){
			document.getElementById("root")?.classList.remove("filters-closed");
			document.getElementById("root")?.classList.add("filters-open");
		}
		else {
			document.getElementById("root")?.classList.remove("filters-open");
			document.getElementById("root")?.classList.add("filters-closed");
		}
	};
	toggle_filters_mobile = () =>{
		document.getElementById("filters-aside")?.classList.toggle("show");
	};
	toggle_filters_init = () =>{
		if (window.innerWidth > 1000){
			document.getElementById("filters-button").onclick=  this.toggle_filters_desktop;
			document.getElementById("filters-x").onclick=this.toggle_filters_desktop;
		}
		else {
			document.getElementById("filters-button").onclick=this.toggle_filters_mobile;
			document.getElementById("filters-x").onclick= this.toggle_filters_mobile;
			document.getElementById("filters-aside")?.classList.remove("slide-in");
			document.getElementById("filters-aside")?.classList.remove("slide-out");
		}
	};
	toggle_qna = ()=>{
		var id = "qna";
		document.getElementById(id)?.classList.toggle("show");
		var navbar_z = document.getElementById('navbar').style.zIndex;
		if (navbar_z == "0") {
			document.getElementById('navbar').style.zIndex = "3";
		} else {
			document.getElementById('navbar').style.zIndex = "0";
		}
	}
	toggle_yuri_diary = ()=>{
		var id = "yuri-diary";
		document.getElementById(id)?.classList.toggle("show");
		var navbar_z = document.getElementById('navbar').style.zIndex;
		if (navbar_z == "0") {
			document.getElementById('navbar').style.zIndex = "3";
		} else {
			document.getElementById('navbar').style.zIndex = "0";
		}
	};
	toggle_devlog = ()=>{
		var id = "dev-log";
		document.getElementById(id)?.classList.toggle("show");
		var navbar_z = document.getElementById('navbar').style.zIndex;
		if (navbar_z == "0") {
			document.getElementById('navbar').style.zIndex = "3";
		} else {
			document.getElementById('navbar').style.zIndex = "0";
		}
	};
	clear_all_filters= ()=>{
		this.onlyNew = false;
		this.onlyUpdated = false;
		this.landmines = {};
		this.tags = {};
		this.targets = {};
		this.status = {};
		this.length = {};
		this.pairings = {};
		this.type  = {};
		this.SetFilters();
		this.ClearMultiCheckboxes();
		this.UpdateFilters();
	}
	articleSort = (a, b)=>
		{
			var compareResult = NaN;
			if (this.sortBy == "date added") {
				compareResult = (Consolidator.dateLateness(b.added) - Consolidator.dateLateness(a.added)) * this.sortDir;
			}
			 else if (Consolidator.pairings.includes(this.sortBy)){
				compareResult = ((b.pairings[this.sortBy] ?? 0.0) - (a.pairings[this.sortBy] ?? 0.0)) * this.sortDir;
			} else {
				compareResult = ((b.recommendations[this.sortBy] ?? 0.0) - (a.recommendations[this.sortBy] ?? 0.0)) * this.sortDir;
			}
			if (compareResult == 0){
				return a.names["en"].localeCompare(b.names["en"]);
			}
			return compareResult;
			  
		};
	constructor(){
		super(RootHTML);
		// load all previous settings
		this.onlyNew = localStorage.getItem("onlyNew") == "true" ? true : false;
		this.onlyUpdated = localStorage.getItem("onlyUpdated") == "true" ? true : false;
		this.hideTags = localStorage.getItem("hideTags") == "true" ? true : false;
		this.showLandmines = localStorage.getItem("showLandmines") == "true" ? true : false;

		this.landmines = JSON.parse(localStorage.getItem("landmines")) ?? {};
		this.targets = JSON.parse(localStorage.getItem("recomms")) ?? {};
		this.tags = JSON.parse(localStorage.getItem("tags")) ?? {};
		this.status = JSON.parse(localStorage.getItem("status")) ?? {};
		this.length = JSON.parse(localStorage.getItem("length")) ?? {};
		this.type = JSON.parse(localStorage.getItem("type")) ?? {};
		this.pairings = JSON.parse(localStorage.getItem("pairings")) ?? {};
		this.preferredLanguage_jp = localStorage.getItem("preferredLanguage_jp") ?? "en";
		this.preferredLanguage_cn = localStorage.getItem("preferredLanguage_cn") ?? "en";
		this.preferredLanguage_kr = localStorage.getItem("preferredLanguage_kr") ?? "en";
		this.sortBy = localStorage.getItem("sortBy") ?? "date added";
		let sortDir = localStorage.getItem("sortDir");
		// up or down
		this.sortDir = (sortDir == "1" || sortDir == "-1") ? Number(sortDir) : 1;

		this.SetElements();
		this.SetFilters();

		document.getElementById("clear-filters-button")?.addEventListener("click", this.clear_all_filters);

		//populate the text of extras > new
		let clonedNew = items.toSorted(this.articleSort);
		var newCount = clonedNew.filter((a)=>a.added == Consolidator.latestDateNew).length;
		var extrasNew = document.getElementById("extrasNew");
		var newText = document.createTextNode("New ("+newCount+", "+Consolidator.latestDateNew+")");
		extrasNew.appendChild(newText);
		
		//populate the text of extras > updated
		let clonedUp = items.toSorted(this.articleSort);
		var updatedCount = clonedUp.filter((a)=>a.updated == Consolidator.latestDateNew).length;
		var extrasUpdated = document.getElementById("extrasUpdated");
		var updatedText = document.createTextNode("Updated ("+updatedCount+", "+Consolidator.latestDateNew+")");
		extrasUpdated.appendChild(updatedText);		

		// mobile only
		this.OnSwipe(()=>{
			document.getElementById("filters-aside")?.classList.remove("show");
		}, ()=>{
			document.getElementById("filters-aside")?.classList.add("show");
		})

		this.InitHeaderNavbarListeners();
		window.onresize = this.toggle_filters_init;
	
		let titles = Array.from(this.Element.querySelectorAll("aside .extras-title"));
		for (let title of titles){
			let className = title.children[0].className;
			const elem = this.Element.querySelector(".list."+className);
			if (localStorage.getItem("cat"+className) == "true" || localStorage.getItem("cat"+className) == null){
				elem.classList.add("show");
			}
			title.addEventListener("click", ()=>{
				elem.classList.toggle("show");
				title.classList.toggle("show", elem.classList.contains("show"));
				localStorage.setItem("cat"+className, ""+elem.classList.contains("show"))
			});
			title.classList.toggle("show", elem.classList.contains("show"));
		}
		
		//console.log(test, test.match(new RegExp("--","g")).length);
		let lines = test.replaceAll("\r","").split("\n").map((a)=>a.trim());
		for (let line of lines){
			if (!line.startsWith("--")){
				// forgive me for the sin i have committed
				//console.log("checking line", line)
				if (items.find((a)=>{
					for (let name in a.names){
						if (a.names[name].toLowerCase() == line.toLowerCase()){
							return a;
						}
					}
				})){
					console.log("didn't add "+line);
				}				
			}
		}

		for (let item of items){
			let found = false;
			for (let lng in item.names){
				if (lines.find((a)=>a.toLowerCase().replaceAll("--","") == item.names[lng].toLowerCase() )){
					found = true;
				}
			}
			if (!found){
				console.log("missing ",item.names);
			}
		}



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

	preferredLanguage_jp : string = "en";
	preferredLanguage_cn : string = "en";
	preferredLanguage_kr : string = "en";
	sortBy : string = "uniqueness";
	sortDir : number = -1;

	
	Filter(source : any[], rkey : keyof this, inclusive : boolean = true){
		if (Object.keys(this[rkey]).length > 0){
			return source.filter((a)=>{
				let list = [];
				if (Array.isArray(a[rkey])){
					list = a[rkey];
				}else if (typeof a[rkey] === "string"){
					list = [a[rkey]];
				}else if (typeof a[rkey] === "object"){
					for (let pkey in a[rkey]){
						if (a[rkey][pkey] >= 4.0){
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

	InitHeaderNavbarListeners(){
		this.toggle_filters_init();
		
		(<HTMLButtonElement>this.Element.getElementsByClassName("qna-button")[0]).onclick = this.toggle_qna;
		(<HTMLButtonElement>this.Element.getElementsByClassName("qna-button")[1]).onclick = this.toggle_qna;
		(<HTMLDivElement>this.Element.querySelector("#qna")).onclick=(ev)=>{
			if (ev.target == this.Element.querySelector("#qna")){
				this.toggle_qna();
			}
		};
		(<HTMLButtonElement>this.Element.querySelector("#qna .close")).onclick = this.toggle_qna;

		(<HTMLButtonElement>document.getElementById("yuri-diary-button")).onclick = this.toggle_yuri_diary;
		
		(<HTMLDivElement>this.Element.querySelector("#yuri-diary")).onclick = (ev)=>{
			if (ev.target == this.Element.querySelector("#yuri-diary")){
				this.toggle_yuri_diary();
			}
		};
		(<HTMLButtonElement>this.Element.querySelector("#yuri-diary .close")).onclick = this.toggle_yuri_diary;

		(<HTMLButtonElement>document.getElementById("dev-log-button")).onclick = this.toggle_devlog;
		
		(<HTMLDivElement>this.Element.querySelector("#dev-log")).onclick = (ev)=>{
			if (ev.target == this.Element.querySelector("#dev-log")){
				this.toggle_devlog();
			}
		};
		(<HTMLButtonElement>this.Element.querySelector("#dev-log .close")).onclick = this.toggle_devlog;
	}

	SetElements(){
		const sortCriteria = this.Element.querySelector(".list.sort-by");
		sortCriteria.classList.toggle("down", this.sortDir == 1);
		const content = this.Element.querySelector(".content");
		content.innerHTML = header + navbar;
		this.InitHeaderNavbarListeners();

		//take the list of yuri
		let cloned = items.toSorted(this.articleSort);
		
		// filter out all the irrelevant tags, blocked landmines, etc. etc. etc.
		cloned = this.Filter(cloned, "landmines");
		cloned = this.Filter(cloned, "tags");
		cloned = this.Filter(cloned, "targets");
		cloned = this.Filter(cloned, "status");
		cloned = this.Filter(cloned, "length");
		cloned = this.Filter(cloned, "pairings");
		cloned = this.Filter(cloned, "type");
		if (this.onlyNew && this.onlyUpdated){
			cloned = cloned.filter((a)=>a.added == Consolidator.latestDateNew
								   || a.updated == Consolidator.latestDateNew);
		}
		else if (this.onlyNew){
			cloned = cloned.filter((a)=>a.added == Consolidator.latestDateNew);
		}
		else if (this.onlyUpdated){
			cloned = cloned.filter((a)=>a.updated == Consolidator.latestDateNew);
		}

		this.Element.querySelector<HTMLDivElement>(".selected-yuri").innerText = "# Selected Yuri: "+cloned.length+"/"+items.length;

		for (let i = 0; i < cloned.length; i++){
			const item = cloned[i];

			// create an article, using article.html as the template code
			let elem = Template.Clone(article);
			
			elem.classList.add("medium")
			elem.id = "article-"+(i+1);
			(<HTMLInputElement>elem.querySelector("#tabradio1")).name="tab radio btns-"+(i+1);
			(<HTMLInputElement>elem.querySelector("#tabradio2")).name="tab radio btns-"+(i+1);
			elem.querySelector("#tabradio1").id="tabradio1-"+(i+1);
			elem.querySelector("#tabradio2").id="tabradio2-"+(i+1);
			
			elem.querySelector("#tabcontent1").id="tabcontent1-"+(i+1);
			elem.querySelector("#tabcontent2").id="tabcontent2-"+(i+1);
			
			(<HTMLLabelElement>elem.querySelector("#label1")).htmlFor="tabradio1-"+(i+1);
			(<HTMLLabelElement>elem.querySelector("#label2")).htmlFor="tabradio2-"+(i+1);
			elem.querySelector("#label1").id="label1-"+(i+1);
			elem.querySelector("#label2").id="label2-"+(i+1);
			
			let tabContent1 = (<HTMLDivElement>elem.querySelector("#tabcontent1-"+(i+1)));
			let tabContent2 = (<HTMLDivElement>elem.querySelector("#tabcontent2-"+(i+1)));
			tabContent2.style.display="none";
			tabContent1.style.background="$tab-active-colour";
			tabContent1.style.display="flex";
			tabContent1.style.flexDirection="column";

			(<HTMLInputElement>elem.querySelector("#tabradio1-"+(i+1))).onclick = 
				function(){
					let tabContent1 = (<HTMLDivElement>elem.querySelector("#tabcontent1-"+(i+1)));
					let tabContent2 = (<HTMLDivElement>elem.querySelector("#tabcontent2-"+(i+1)));
					tabContent2.style.display="none";
					
					tabContent1.style.display="flex";
					tabContent1.style.flexDirection="column";
				};
			(<HTMLInputElement>elem.querySelector("#tabradio2-"+(i+1))).onclick = 
				function(){
					let tabContent1 = (<HTMLDivElement>elem.querySelector("#tabcontent1-"+(i+1)));
					let tabContent2 = (<HTMLDivElement>elem.querySelector("#tabcontent2-"+(i+1)));
					tabContent1.style.display="none";
					
					tabContent2.style.display="flex";

					//tabContent2.style.flexDirection = "column";
					//tabContent2.style.justifyContent = "space-between";
					tabContent2.style.flexWrap="wrap";
					
				};

			elem.classList.toggle("new", item.added == Consolidator.latestDateNew);
			elem.classList.toggle("updated", item.updated == Consolidator.latestDateNew);
	
			
			elem.querySelector("img").src = item.image;
			elem.querySelector(".desc").innerHTML = convertText(item.description);

			switch(item.type.toLowerCase()){
				case "manga":
				case "anime (jp)":
				case "light novel (jp)":
				case "visual novel (jp)":
					elem.querySelector("h2").innerText = item.names[this.preferredLanguage_jp] ?? item.names.en;
					elem.querySelector("h2").title = item.names[this.preferredLanguage_jp] ?? item.names.en;
					break;
				case "manhua":
				case "visual novel (cn)":
					elem.querySelector("h2").innerText = item.names[this.preferredLanguage_cn] ?? item.names.en;
					elem.querySelector("h2").title = item.names[this.preferredLanguage_cn] ?? item.names.en;
					break;
				case "manhwa":
					elem.querySelector("h2").innerText = item.names[this.preferredLanguage_kr] ?? item.names.en;
					elem.querySelector("h2").title = item.names[this.preferredLanguage_kr] ?? item.names.en;
					break;
				default:
					elem.querySelector("h2").innerText = item.names.en;
					elem.querySelector("h2").title = item.names.en;
					break;
			}
			
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
				
				//if (max - item.recommendations[key] < 2.5 || key == this.rating){ 
					let rating = document.createElement("div");
					if (key == this.sortBy){
						rating.style.fontWeight = "bold";
					}
					rating.innerText = key+": "+item.recommendations[key];
					elem.querySelector(".ratings").append(rating)
				//}
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
			const spoilerTags = elem.querySelector(".spoiler-tags");
			if (item.spoilerTags && item.spoilerTags.length > 0){
				const label = <HTMLLabelElement>elem.querySelector(".spoiler-label");
				label.style.display = "inline";
				for (let tag of item.spoilerTags){
					const button = document.createElement("button");
					button.classList.add("spoiler");
					button.innerText = tag;
					
					button.classList.add(makeSafeForCSS(tag));
					spoilerTags?.append(button);
				}
			}
			
			const landmines = elem.querySelector(".landmines");
			if (item.landmines){
				for (let tag of item.landmines){
					const button = document.createElement("button");
					button.classList.add("spoiler");
					button.innerText = tag;
					landmines?.append(button);
				}
			}
			const artists = <HTMLDivElement>elem.querySelector("#artists");
			if (item.artists){
				artists.style.display = "inline";
				const label = <HTMLLabelElement>elem.querySelector(".artist-label");
				label.style.display = "inline";
				for (let artist of item.artists){
					const button = document.createElement("button");
					button.innerText = artist;
					artists?.append(button);
				}
			}
			const creators = elem.querySelector("#creators");
			if (item.creators){
				for (let creator of item.creators){
					const button = document.createElement("button");
					button.innerText = creator;
					creators?.append(button);
				}
			}
			const dateAddedDiv = elem.querySelector(".date-added-div");
			const btnAdded = document.createElement("button");
			btnAdded.innerText = item.added;
			dateAddedDiv?.append(btnAdded);
			if (item.updated){
				const lastUpdatedDiv = elem.querySelector(".last-updated-div");
				const btnUpdated = document.createElement("button");
				btnUpdated.innerText = item.updated;
				lastUpdatedDiv?.append(btnUpdated);
			}
			


			const linkDiv = elem.querySelector(".info-links-div");
			if (item.infoLinkLabels && item.infoLinks){
				for (let i = 0; i < item.infoLinkLabels.length; i++){
					const button = document.createElement("button");
					button.innerText = item.infoLinkLabels[i];
					button.style.color = "blue";
					button.style.textDecoration = "underline"
					button.onclick = function (){
						window.open(item.infoLinks[i], '_blank');
						button.style.color = "purple";
					}
					linkDiv?.append(button);
				}
			}
			const notesSection = <HTMLDivElement>elem.querySelector(".notes-section");
			const notes = elem.querySelector(".notes");
			if (notes && item.notes){
				notesSection.style.display="inline";
				notes.textContent = item.notes;
				if (item.spoilerNotes){
					notes.classList.add("spoiler");
				}
			}
			

			content?.append(elem);
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
		localStorage.setItem("preferredLanguage_jp", this.preferredLanguage_jp);
		localStorage.setItem("preferredLanguage_cn", this.preferredLanguage_cn);
		localStorage.setItem("preferredLanguage_kr", this.preferredLanguage_kr);
		localStorage.setItem("sortBy", this.sortBy);
		localStorage.setItem("sortDir", ""+this.sortDir);

		localStorage.setItem("onlyNew", this.onlyNew ? "true" : "false");
		localStorage.setItem("onlyUpdated", this.onlyUpdated ? "true" : "false");
		localStorage.setItem("hideTags", this.hideTags ? "true" : "false");
		localStorage.setItem("showLandmines", this.showLandmines ? "true" : "false");

		//this.Element.classList.toggle("hideLandmines", this.hideLandmines);
		//this.Element.classList.toggle("hideTags", this.hideTags);
		this.UpdateHideTagsLandmines();
	}

	SetFilters(){
		{
			const elem = <HTMLDivElement>this.Element.querySelector(".extras .new");
			elem.querySelector(".multi-checkbox").classList.toggle("active", this.onlyNew);
			elem.onclick = ()=>{
				elem.querySelector(".multi-checkbox").classList.toggle("active");
				this.onlyNew = (elem.querySelector(".multi-checkbox").classList.contains("active"));
				this.UpdateFilters();
			};
		}
		{
			const elem = <HTMLDivElement>this.Element.querySelector(".extras .updated");
			elem.querySelector(".multi-checkbox").classList.toggle("active", this.onlyUpdated);
			elem.onclick = ()=>{
				elem.querySelector(".multi-checkbox").classList.toggle("active");
				this.onlyUpdated = (elem.querySelector(".multi-checkbox").classList.contains("active"));
				this.UpdateFilters();
			};
		}
		{
			const elem = <HTMLDivElement>this.Element.querySelector(".extras .showlandmines");
			elem?.querySelector(".multi-checkbox")?.classList.toggle("active", this.showLandmines);
			elem.onclick = ()=>{
				elem?.querySelector(".multi-checkbox")?.classList.toggle("active");
				this.showLandmines = (elem.querySelector(".multi-checkbox").classList.contains("active"));
				this.UpdateFilters();
			};
		}
		{
			const elem = <HTMLDivElement>this.Element.querySelector(".extras .hidetags");
			elem.querySelector(".multi-checkbox").classList.toggle("active", this.hideTags);
			elem.onclick = ()=>{
				elem.querySelector(".multi-checkbox").classList.toggle("active");
				this.hideTags = (elem.querySelector(".multi-checkbox").classList.contains("active"));
				this.UpdateFilters();
			};
		}

		{
			const landmines = this.Element.querySelector(".list.landmines");
			const ls = Consolidator.landmines;
			if (landmines?.children.length == 0)
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
			const targets = this.Element.querySelector(".list.targets");
			const ls = Consolidator.recomms;
			if (targets?.children.length == 0)
			for (let i = 0; i < ls.length; i++){
				targets.append(this.AddFilter(ls[i], this.targets[ls[i]] ?? undefined, (r, t)=>{
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
			const ls = Consolidator.tags;
			if (tags?.children.length == 0)
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
			const pairings = this.Element.querySelector(".list.pairings");
			const ls = Consolidator.pairings;
			if (pairings?.children.length == 0)
			for (let i = 0; i < ls.length; i++){
				pairings.append(this.AddFilter(ls[i], this.pairings[ls[i]] ?? undefined, (r, t)=>{
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
			const lengths = this.Element.querySelector(".list.length");
			const ls = Consolidator.length;
			if (lengths?.children.length == 0)
			for (let i = 0; i < ls.length; i++){
				lengths.append(this.AddFilter(ls[i], this.length[ls[i]] ?? undefined, 
					(r, t)=>{
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
			const types = this.Element.querySelector(".list.type");
			const ls = Consolidator.type;
			if (types?.children.length == 0)
			for (let i = 0; i < ls.length; i++){
				types.append(this.AddFilter(ls[i], this.type[ls[i]] ?? undefined, (r, t)=>{
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
			const statuses = this.Element.querySelector(".list.completion");
			const ls = Consolidator.completion;
			if (statuses?.children.length == 0)
			for (let i = 0; i < ls.length; i++){
				statuses.append(this.AddFilter(ls[i], this.status[ls[i]] ?? undefined, (r, t)=>{
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
			const langs = this.Element.querySelector(".list.language_jp");
			const ls = ["en", "romanized-jp", "jp"];
			if (langs?.children.length == 0)
			for (let i = 0; i < ls.length; i++){
				let elem = document.createElement("div");
				elem.innerText = ls[i];
				elem.classList.toggle("active", ls[i] == this.preferredLanguage_jp);
				if (ls[i] == this.preferredLanguage_jp) {
					elem.style.fontWeight = "bold";
				}
				elem.addEventListener("click",()=>{
					this.preferredLanguage_jp = ls[i];
					for (let x = 0; x < langs.children.length; x++){
						langs.children[x].classList.remove("active");
						(<HTMLDivElement>langs.children[x]).style.fontWeight = "normal";
						//elem.style.fontWeight = "normal";
					}
					elem.classList.add("active");
					elem.style.fontWeight = "bold";
					this.UpdateFilters();
				})
				langs.append(elem);
			}
		}
		{
			const langs = this.Element.querySelector(".list.language_cn");
			const ls = ["en", "romanized-cn", "cn"];
			if (langs?.children.length == 0)
			for (let i = 0; i < ls.length; i++){
				let elem = document.createElement("div");
				elem.innerText = ls[i];
				elem.classList.toggle("active", ls[i] == this.preferredLanguage_cn);
				if (ls[i] == this.preferredLanguage_cn) {
					elem.style.fontWeight = "bold";
				}
				elem.addEventListener("click",()=>{
					this.preferredLanguage_cn = ls[i];
					for (let x = 0; x < langs.children.length; x++){
						langs.children[x].classList.remove("active");
						(<HTMLDivElement>langs.children[x]).style.fontWeight = "normal";
					}
					elem.classList.add("active");
					elem.style.fontWeight = "bold";
					this.UpdateFilters();
				})
				langs.append(elem)
			}
		}
		{
			const langs = this.Element.querySelector(".list.language_kr");
			const ls = ["en", "romanized-kr", "kr"];
			if (langs?.children.length == 0)
			for (let i = 0; i < ls.length; i++){
				let elem = document.createElement("div");
				elem.innerText = ls[i];
				elem.classList.toggle("active", ls[i] == this.preferredLanguage_kr);
				if (ls[i] == this.preferredLanguage_kr) {
					elem.style.fontWeight = "bold";
				}
				elem.addEventListener("click",()=>{
					this.preferredLanguage_kr = ls[i];
					for (let x = 0; x < langs.children.length; x++){
						langs.children[x].classList.remove("active");
						(<HTMLDivElement>langs.children[x]).style.fontWeight = "normal";
					}
					elem.classList.add("active");
					elem.style.fontWeight = "bold";
					this.UpdateFilters();
				})
				langs.append(elem)
			}
		}
		{
			const ratings = this.Element.querySelector(".list.sort-by");
			const ls = ["date added"].concat(Consolidator.pairings).concat(Consolidator.ratings);
			if (ratings?.children.length == 0)
			for (let i = 0; i < ls.length; i++){
				let elem = document.createElement("div");
				elem.innerText = ls[i];
				elem.classList.toggle("active", ls[i] == this.sortBy);
				elem.addEventListener("click",()=>{
					if (this.sortBy == ls[i]){
						if (this.sortDir == -1){
							this.sortBy = "";
						}else{
							this.sortDir *= -1;
						}
					}else{
						this.sortBy = ls[i];
						this.sortDir = 1;
					}
					for (let x = 0; x < ratings.children.length; x++){
						ratings.children[x].classList.remove("active")
					}
					if (this.sortBy == ls[i]){
						elem.classList.add("active");
					}
					this.UpdateFilters();
				})
				ratings.append(elem)
			}
		}

		//this.Element.classList.toggle("hideLandmines", this.hideLandmines);
		//this.Element.classList.toggle("hideTags", this.hideTags)
		this.UpdateHideTagsLandmines();
		
	}

	UpdateHideTagsLandmines(){
		for (var j = 0; j < items.length; j++){
			let elem = document.getElementById("article-"+j);
			let tagBtns = elem?.querySelector(".tags")?.children;
			if (tagBtns){
				for (var i = 0; i < tagBtns.length; i++){
					if (this.hideTags && !tagBtns[i].classList.contains("spoiler"))
						tagBtns[i].classList.add("spoiler");
					else if (tagBtns[i].classList.contains("spoiler")) 
						tagBtns[i].classList.remove("spoiler");
				}
			}

			let landmineBtns = elem?.querySelector(".landmines")?.children;
			if (landmineBtns){
				for (var i = 0; i < landmineBtns.length; i++){
					if (!this.showLandmines && !landmineBtns[i].classList.contains("spoiler"))
						landmineBtns[i].classList.add("spoiler");
					else if (this.showLandmines && landmineBtns[i].classList.contains("spoiler")) 
						landmineBtns[i].classList.remove("spoiler");
				}
			}
		}
		
	}

	ClearMultiCheckboxes(){
		const filtersAside = document.getElementById("filters-aside");
		const lists = filtersAside?.getElementsByClassName("list");
		for (var i = 1; i < lists?.length; i++){
			const list = lists[i];
			const multiCheckboxes = list.getElementsByClassName("multi-checkbox");
			for (var j = 0; j < multiCheckboxes.length; j++){
				multiCheckboxes[j].classList.remove("active");
				multiCheckboxes[j].classList.remove("removed");
			}
		}
	}

	
}
