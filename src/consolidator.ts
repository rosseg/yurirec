import items from "./items.json";

//create lists of all existing tags, ratings, pairings, etc. for the main page to use
export default class Consolidator{

	static tags : Set<string> = new Set();
	static ratings : Set<string> = new Set();
	static landmines : Set<string> = new Set();
	static languages : Set<string> = new Set();
	static recomms : Set<string> = new Set();
	static completion : Set<string> = new Set();
	static length : Set<string> = new Set();
	static pairings : Set<string> = new Set();
	static type : Set<string> = new Set();

	static Initialise(){
		for (let item of items){
			item.tags.forEach((a)=>this.tags.add(a));
			item.landmines?.forEach((a)=>this.landmines.add(a));
			item.targets?.forEach((a)=>this.recomms.add(a));
			this.completion.add(item.status);
			this.length.add(item.length);
			this.type.add(item.type);
			for (let name in item.names){
				this.languages.add(name);
			}
			for (let rating in item.recommendations){
				this.ratings.add(rating);
			}
			for (let rating in item.pairings){
				this.pairings.add(rating);
			}
		}
	}
}