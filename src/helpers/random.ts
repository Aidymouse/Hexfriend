function rand(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max)+1;
    return Math.floor(Math.random() * (max - min) + min); //The maximum is now inclusive and the minimum is inclusive
}

function pick_from_weighted(weighted_list: {item: any, weight: number}[]) {
		let total_weight = weighted_list.reduce( (total, cur_item) => total += cur_item.weight, 0 )
		let pick_value = rand(1, total_weight)

		let check_total = 0;
		for (const obj_index in weighted_list) {
			let obj = weighted_list[obj_index];
			check_total += obj.weight
			if (pick_value <= check_total) return obj.item; 
		}
	}

function random_choice(array: any[]) {
    return array[rand(0, array.length-1)]
}

export { rand, pick_from_weighted, random_choice }