let boundaries = []
let consumables = []
const map = [
    [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
    [' ','+',' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','*',' ',' ',' ',' '],
    [' ',' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
    [' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','=',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','*',' '],
    [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ','-','.',' ',' ',' ','.','-',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ','.',' ',' ',' ',' ',' ','.',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' ',' ','#',' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','+',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' ',' ','#',' ','#',' ',' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ','.',' ',' ',' ',' ',' ','.',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ','-','.',' ',' ',' ','.','-',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
    [' ','*',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ','=',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',' '],
    [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',' ',' '],
    [' ',' ',' ',' ','*',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','#',' ','+',' '],
    [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ']
]

class Boundary {
    static spacingX = 40
    static spacingY = 40
    constructor({position, width, height, modifier}){
        this.position = position
        this.width = width
        this.height = height
        this.modifier = modifier
        this.centerX
        this.centerY
    }
    rotateBoundary() {
        this.centerX = this.position.x + this.width / 2
        this.centerY = this.position.y + this.height / 2
    }
}
class Consumable {
    constructor({position, radius, color}){
        this.position = position
        this.radius = radius
        this.color = color
    }
}

map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            case '-':
                boundaries.push(
                    new Boundary({
                        position: {
                            x:Boundary.spacingX * j,
                            y:Boundary.spacingY * i
                        },
                        width: 40,
                        height: 40,
                        modifier: 1
                    })
                )
                break
            case '#':
                boundaries.push(
                    new Boundary({
                        position: {
                            x:Boundary.spacingX * j + 10,
                            y:Boundary.spacingY * i + 10
                        },
                        width: 20,
                        height: 20,
                        modifier: 45
                    })
                )
                break
            case '.':
                consumables.push(
                    new Consumable({
                        position: {
                            x:Boundary.spacingX * j + 20,
                            y:Boundary.spacingY * i + 20
                        },
                        radius: 8,
                        color: 'green'  
                    })
                )
                break
            case '+':
                consumables.push(
                    new Consumable({
                        position: {
                            x:Boundary.spacingX * j + 20,
                            y:Boundary.spacingY * i + 20
                        },
                        radius: 8,
                        color: 'blue'  
                    })
                )
                break
            case '=':
                boundaries.push(
                    new Boundary({
                        position: {
                             x:Boundary.spacingX * j,
                             y:Boundary.spacingY * i
                        },
                        width: 40,
                        height: 40,
                        modifier: 45
                    })
                )
                break
            case '*':
                boundaries.push(
                    new Boundary({
                        position: {
                            x:Boundary.spacingX * j + 10,
                            y:Boundary.spacingY * i + 10
                        },
                        width: 20,
                        height: 20,
                        modifier: 1
                    })
                )
                break
        }
    })
})

module.exports = { Boundary, Consumable, boundaries, consumables }