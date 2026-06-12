import items from "./items.json";

//create lists of all existing tags, ratings, pairings, etc. for the main page to use
export default class Consolidator{

	static tags : string[] = [];
	static ratings : string[] = [];
	static landmines : string[] = [];
	static languages : string[] = [];
	static recomms : string[] = [];
	static completion : string[] = [];
	static length : string[] = [];
	static pairings : string[] = [];
	static type : string[] = [];
	static creators : string[] = [];
	static artists : string[] = [];
	//static dateAdded : string[] = [];

	static latestDateNew : string = "31-12-2025";
	static latestDateUpdated : string = "31-12-2025";

	static Initialise(){
		let tags = new Set<string>();
		let ratings = new Set<string>();
		let landmines = new Set<string>();
		let languages = new Set<string>();
		let recomms = new Set<string>();
		let completion = new Set<string>();
		let length = new Set<string>();
		let pairings = new Set<string>();
		let type = new Set<string>();
		let creators = new Set<string>();
		let artists = new Set<string>();
		//let dateAdded = new Set<string>();

		for (let item of items){
			item.tags.forEach((a)=>tags.add(a));
			item.spoilerTags?.forEach((a)=>tags.add(a));
			item.landmines?.forEach((a)=>landmines.add(a));
			item.targets?.forEach((a)=>recomms.add(a));
			completion.add(item.status);
			length.add(item.length);
			type.add(item.type);
			item.creators?.forEach((a)=>creators.add(a));
			item.artists?.forEach((a)=>artists.add(a));
			for (let name in item.names){
				languages.add(name);
			}
			for (let rating in item.recommendations){
				ratings.add(rating);
			}
			for (let rating in item.pairings){
				pairings.add(rating);
			}
			if (this.dateLateness(item.added) > this.dateLateness(this.latestDateNew)){
				this.latestDateNew = item.added;
			}
			if (item.updated && this.dateLateness(item.updated) > this.dateLateness(this.latestDateUpdated)){
				this.latestDateUpdated = item.updated;
			}
		}
		
		this.tags = Array.from(tags);
		this.ratings = Array.from(ratings);
		this.landmines = Array.from(landmines);
		this.languages = Array.from(languages);
		this.recomms = Array.from(recomms);
		this.completion = Array.from(completion);
		this.length = Array.from(length);
		this.pairings = Array.from(pairings);
		this.type = Array.from(type);
		this.creators = Array.from(creators);
		this.artists = Array.from(artists);

		this.tags.sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));
		this.ratings.sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));
		this.landmines.sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));
		this.languages.sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));
		this.recomms.sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));
		this.completion.sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));
		this.length.sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));
		this.pairings.sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));
		this.type.sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));
		this.creators.sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));
		this.artists.sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()));



	}
	//requires format dd-mm-yyyy
	static dateLateness (date: string): number{
		return Number(date.substring(6) + date.substring(3,5) + date.substring(0, 2));
	}
}