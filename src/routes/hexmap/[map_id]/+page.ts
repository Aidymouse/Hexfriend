import type { PageLoad } from './$types';

import DEFAULTSAVEDATA from '$lib/script/default_save_data';



export const load: PageLoad = ({ params }) => {
    console.log(params.map_id)

    if (params.map_id == "blank") {
        // Get map from blank save data

        return {
            loaded_save: DEFAULTSAVEDATA,
            loaded_save_id: -1
        }

    } else {
        // Get map from dexie db
    }

    return {
        loaded_save: DEFAULTSAVEDATA,
        loaded_save_id: -1
    }
}