console.log(555555)
console.log(8888888)
const test = () => {
  console.log(111)
}

class Point {
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  toString () {
    return '(' + this.x + ', ' + this.y + ')'
  }
}

const point = new Point(5, 6)
console.log(point.toString())
