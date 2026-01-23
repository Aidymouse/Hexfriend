export class Vector {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x || 0
    this.y = y || 0
  }

  negate(): this {
    this.x = -this.x
    this.y = -this.y
    return this
  }

  add(v: Vector) {
    if (v instanceof Vector) {
      this.x += v.x
      this.y += v.y
    } else {
      this.x += v
      this.y += v
    }
    return this
  }

  subtract(v: Vector | number) {
    if (v instanceof Vector) {
      this.x -= v.x
      this.y -= v.y
    } else {
      this.x -= v
      this.y -= v
    }
    return this
  }

  multiply(v: Vector | number): this {
    if (v instanceof Vector) {
      this.x *= v.x
      this.y *= v.y
    } else {
      this.x *= v
      this.y *= v
    }
    return this
  }

  divide(v: Vector | number): this {
    if (v instanceof Vector) {
      if (v.x != 0) this.x /= v.x
      if (v.y != 0) this.y /= v.y
    } else {
      if (v != 0) {
        this.x /= v
        this.y /= v
      }
    }
    return this
  }

  equals(v: Vector): boolean {
    return this.x == v.x && this.y == v.y
  }

  dot(v: Vector): number {
    return this.x * v.x + this.y * v.y
  }

  cross(v: Vector): number {
    return this.x * v.y - this.y * v.x
  }

  length(): number {
    return Math.sqrt(this.dot(this))
  }

  normalize(): this {
    return this.divide(this.length())
  }

  min(): number {
    return Math.min(this.x, this.y)
  }

  max(): number {
    return Math.max(this.x, this.y)
  }

  toAngles(): number {
    return -Math.atan2(-this.y, this.x)
  }

  angleTo(v: Vector): number {
    return Math.acos(this.dot(v) / (this.length() * v.length()))
  }

  toArray(n: number): number[] {
    return [this.x, this.y].slice(0, n || 2)
  }

  clone(): Vector {
    return new Vector(this.x, this.y)
  }

  set(x: number, y: number): this {
    this.x = x
    this.y = y
    return this
  }

  rotate(ang: number): this {
    var cos = Math.cos(ang)
    var sin = Math.sin(ang)

    let oldX = this.x
    let oldY = this.y

    this.x = oldX * cos + oldY * sin
    this.y = -oldX * sin + oldY * cos

    this.x = Math.round(1000 * this.x) / 1000
    this.y = Math.round(1000 * this.y) / 1000

    return this
  }

  static negative: (v: Vector) => Vector
  static add: (a: Vector, b: Vector | number) => Vector
  static subtract: (a: Vector, b: Vector | number) => Vector
  static multiply: (a: Vector, b: Vector | number) => Vector
  static divide: (a: Vector, b: Vector | number) => Vector
  static equals: (a: Vector, b: Vector) => boolean
  static dot: (a: Vector, b: Vector) => number
  static cross: (a: Vector, b: Vector) => number
  static normalize: (v: Vector) => Vector
}

/* STATIC METHODS */
Vector.negative = function (v) {
  return new Vector(-v.x, -v.y)
}
Vector.add = function (a, b) {
  if (b instanceof Vector) return new Vector(a.x + b.x, a.y + b.y)
  else return new Vector(a.x + b, a.y + b)
}
Vector.subtract = function (a, b) {
  if (b instanceof Vector) return new Vector(a.x - b.x, a.y - b.y)
  else return new Vector(a.x - b, a.y - b)
}
Vector.multiply = function (a, b) {
  if (b instanceof Vector) return new Vector(a.x * b.x, a.y * b.y)
  else return new Vector(a.x * b, a.y * b)
}
Vector.divide = function (a, b) {
  if (b instanceof Vector) return new Vector(a.x / b.x, a.y / b.y)
  else return new Vector(a.x / b, a.y / b)
}
Vector.equals = function (a, b) {
  return a.x == b.x && a.y == b.y
}
Vector.dot = function (a, b) {
  return a.x * b.x + a.y * b.y
}
Vector.cross = function (a, b) {
  return a.x * b.y - a.y * b.x
}

Vector.normalize = function (v) {
  return v.clone().normalize()
}

// TESTING
