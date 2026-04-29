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
	static authors : string[] = [];
	static artists : string[] = [];
	//static dateAdded : string[] = [];

	static latestDate : string = "31-12-2025";

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
		let authors = new Set<string>();
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
			item.authors?.forEach((a)=>authors.add(a));
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
			//dateAdded.add(item.added);
			this.latestDate = item.added;
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
		this.authors = Array.from(authors);
		this.artists = Array.from(artists);

		this.tags.sort();
		this.ratings.sort();
		this.landmines.sort();
		this.languages.sort();
		this.recomms.sort();
		this.completion.sort();
		this.length.sort();
		this.pairings.sort();
		this.type.sort();
		this.authors.sort();
		this.artists.sort();



	}
}