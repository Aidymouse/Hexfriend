function rand(min: number, max: number, rand_func: Function = Math.random): number {
  min = Math.ceil(min)
  max = Math.floor(max) + 1
  return Math.floor(rand_func() * (max - min) + min) //The maximum is now inclusive and the minimum is inclusive
}

// Takes a function that generates a number 0-1 and converts it to min-max
export function get_min_max_rand_function(rand_func: Function): (min, max) => number {
  const rf = (min: number, max: number) => {
    min = Math.ceil(min)
    max = Math.floor(max) + 1
    return Math.floor(rand_func() * (max - min) + min) //The maximum is now inclusive and the minimum is inclusive
  }
  return rf
}

/* Hash Function */
export function cyrb128(str: string) {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i)
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067)
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233)
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213)
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179)
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067)
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233)
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213)
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179)
  ;((h1 ^= h2 ^ h3 ^ h4), (h2 ^= h1), (h3 ^= h1), (h4 ^= h1))
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0]
}

/* Random */
// a, b, c, d are seeds
export function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a |= 0
    b |= 0
    c |= 0
    d |= 0
    let t = (((a + b) | 0) + d) | 0
    d = (d + 1) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    c = (c + t) | 0
    return (t >>> 0) / 4294967296
  }
}

function pick_from_weighted(
  weighted_list: { item: any; weight: number }[],
  rand_function: (low_incl: number, high_incl: number) => number = rand,
) {
  let total_weight = weighted_list.reduce((total, cur_item) => (total += cur_item.weight), 0)
  let pick_value = rand_function(1, total_weight)

  let check_total = 0
  for (const obj_index in weighted_list) {
    let obj = weighted_list[obj_index]
    check_total += obj.weight
    if (pick_value <= check_total) return obj.item
  }
}

function random_choice(array: any[], rand_func: (min, max) => number) {
  return array[rand_func(0, array.length - 1)]
}

export { rand, pick_from_weighted, random_choice }
